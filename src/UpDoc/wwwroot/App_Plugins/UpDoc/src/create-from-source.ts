/**
 * Creating a document from an extracted source.
 *
 * This is the part of "Create from Source" that has nothing to do with the
 * browser: given an extraction and a workflow config, scaffold from the
 * blueprint, apply the mappings, create the document and save it.
 *
 * It lived twice — in `up-doc-action.ts` (the "..." menu) and
 * `up-doc-collection-action.element.ts` (the button on Child items) — which is
 * how the two drifted. See UpDoc #41.
 *
 * Nothing here touches `window`, `document`, Umbraco contexts or repositories.
 * `fetch` and the auth token are passed in, so this runs equally in the
 * backoffice and in Node — which is what lets UpDoc's MCP server create
 * documents without driving a browser.
 *
 * The UI stays with each caller: discovering allowed child types, opening the
 * pickers, notifications, navigating to the new document. Only the work is
 * shared.
 */

import type { DocumentTypeConfig, MappingDestination, TransformedSection } from './workflow.types.js';
import { IMPORT_FACT_SOURCE_FILE } from './workflow.types.js';
import { applyImportFactMedia } from './import-facts.js';
import {
	markdownToHtml,
	buildRteValue,
	stripMarkdown,
	coerceToInteger,
	coerceToDateOnly,
	buildDateValue,
} from './transforms.js';

/** A document property value as the Management API represents it. */
export interface PropertyValue {
	alias: string;
	value: unknown;
}

/** A block inside a block grid or block list, as stored in `contentData`. */
interface BlockContentData {
	contentTypeKey: string;
	key: string;
	values: PropertyValue[];
}

export interface CreateFromSourceRequest {
	/** Parent document to create under. Null creates at root. */
	parentUnique: string | null;
	documentTypeUnique: string;
	blueprintUnique: string;
	/** Document name. Callers should pass an explicit one rather than relying on a default. */
	name: string;
	/** Media key of the source file, when there is one. Web sources have none. */
	mediaUnique?: string | null;
	/** Extracted content keyed by `sectionId.part`, e.g. `features.content`. */
	sectionLookup: Record<string, string>;
	/** stableKey → current section id, used when section ids shift between extractions. */
	stableKeyLookup?: Record<string, string>;
	config: DocumentTypeConfig;
	/** Injected so this runs outside a browser. Pass `window.fetch` in the backoffice. */
	fetchFn: typeof fetch;
	token: string;
}

export type CreateFromSourceResult =
	| { ok: true; documentId: string | undefined }
	| { ok: false; stage: 'scaffold' | 'create'; message: string };

/** The two lookups a mapping run needs, built from a transform result. */
export interface SectionLookups {
	/** `sectionId.part` → text, e.g. `features.content`. */
	sectionLookup: Record<string, string>;
	/** stableKey → section id, for resolving mappings when section ids shift. */
	stableKeyLookup: Record<string, string>;
}

/**
 * Turns transform sections into the lookups `map.json` addresses.
 *
 * Excluded sections are skipped, so anything the workflow author turned off in
 * the Transformed view stays out of the created document.
 */
export function buildSectionLookups(sections: TransformedSection[]): SectionLookups {
	const sectionLookup: Record<string, string> = {};
	const stableKeyLookup: Record<string, string> = {};

	for (const section of sections) {
		if (!section.included) continue;

		if (section.heading) {
			// On a role section the heading is a label ("Tour Title"), not document
			// text, so both keys resolve to the content instead.
			const headingText = section.pattern === 'role' ? section.content : section.heading;
			// `.title` is the canonical key; `.heading` stays for existing maps.
			sectionLookup[`${section.id}.heading`] = headingText;
			sectionLookup[`${section.id}.title`] = headingText;
		}

		sectionLookup[`${section.id}.content`] = section.content;

		if (section.description) {
			sectionLookup[`${section.id}.description`] = section.description;
		}
		if (section.summary) {
			sectionLookup[`${section.id}.summary`] = section.summary;
		}

		if (section.stableKey) {
			stableKeyLookup[section.stableKey] = section.id;
		}
	}

	return { sectionLookup, stableKeyLookup };
}

/**
 * Scaffolds from a blueprint, applies the workflow's mappings and creates the
 * document.
 *
 * The document is created as a **draft**. Publishing is the caller's decision.
 */
export async function createDocumentFromSource(
	request: CreateFromSourceRequest,
): Promise<CreateFromSourceResult> {
	const {
		parentUnique,
		documentTypeUnique,
		blueprintUnique,
		name,
		mediaUnique,
		sectionLookup,
		stableKeyLookup,
		config,
		fetchFn,
		token,
	} = request;

	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`,
	};

	// Scaffold from the selected blueprint.
	const scaffoldResponse = await fetchFn(
		`/umbraco/management/api/v1/document-blueprint/${blueprintUnique}/scaffold`,
		{ method: 'GET', headers },
	);

	if (!scaffoldResponse.ok) {
		return { ok: false, stage: 'scaffold', message: await readError(scaffoldResponse) };
	}

	const scaffold = await scaffoldResponse.json();

	// Deep clone so the scaffold response is never mutated.
	const values: PropertyValue[] = scaffold.values
		? JSON.parse(JSON.stringify(scaffold.values))
		: [];

	applyMappings(values, { sectionLookup, stableKeyLookup, config, mediaUnique });

	const createRequest = {
		parent: parentUnique ? { id: parentUnique } : null,
		documentType: { id: documentTypeUnique },
		template: scaffold.template ? { id: scaffold.template.id } : null,
		values,
		variants: [{ name, culture: null, segment: null }],
	};

	const createResponse = await fetchFn('/umbraco/management/api/v1/document', {
		method: 'POST',
		headers,
		body: JSON.stringify(createRequest),
	});

	if (!createResponse.ok) {
		return { ok: false, stage: 'create', message: await readError(createResponse) };
	}

	const documentId = createResponse.headers.get('Location')?.split('/').pop();

	// Read back and save. The create call persists the values, but a subsequent
	// save is what triggers Umbraco's cache refresh, so the new document appears
	// correctly without a manual reload. A failure here leaves a created document,
	// so it is reported rather than thrown.
	if (documentId) {
		const getResponse = await fetchFn(`/umbraco/management/api/v1/document/${documentId}`, {
			method: 'GET',
			headers,
		});

		if (getResponse.ok) {
			const documentData = await getResponse.json();
			const saveResponse = await fetchFn(`/umbraco/management/api/v1/document/${documentId}`, {
				method: 'PUT',
				headers,
				body: JSON.stringify(documentData),
			});

			if (!saveResponse.ok) {
				console.warn('UpDoc: document created, but the follow-up save failed:', await saveResponse.text());
			}
		} else {
			console.warn('UpDoc: document created, but could not be read back for saving:', await getResponse.text());
		}
	}

	return { ok: true, documentId };
}

/**
 * Applies every enabled mapping to the scaffolded values, then runs the
 * post-mapping type conversions.
 *
 * Exported separately so a preview can show what would be written without
 * creating anything.
 */
export function applyMappings(
	values: PropertyValue[],
	options: {
		sectionLookup: Record<string, string>;
		stableKeyLookup?: Record<string, string>;
		config: DocumentTypeConfig;
		mediaUnique?: string | null;
	},
): void {
	const { sectionLookup, stableKeyLookup, config, mediaUnique } = options;

	// Tracks which fields this run has written. The first write replaces the
	// blueprint's default; later writes concatenate, which is how a title split
	// across two source elements ends up in one field.
	const mappedFields = new Set<string>();

	for (const mapping of config.map.mappings) {
		if (mapping.enabled === false) continue;

		// Import facts describe the import itself rather than anything extracted
		// from it, so they resolve from the request, not sectionLookup.
		if (mapping.source === IMPORT_FACT_SOURCE_FILE) {
			if (!mediaUnique) continue;
			for (const dest of mapping.destinations) {
				applyImportFactMedia(values, dest, mediaUnique);
			}
			continue;
		}

		let sectionValue = sectionLookup[mapping.source];

		// StableKey fallback: if the section id changed but the stableKey still
		// matches, resolve through the new id.
		if (!sectionValue && mapping.sourceKey && stableKeyLookup) {
			const newSectionId = stableKeyLookup[mapping.sourceKey];
			if (newSectionId) {
				const partSuffix = mapping.source.split('.').pop();
				if (partSuffix) {
					sectionValue = sectionLookup[`${newSectionId}.${partSuffix}`];
				}
			}
		}

		if (!sectionValue) continue;

		for (const dest of mapping.destinations) {
			applyDestinationMapping(values, dest, sectionValue, config, mappedFields);
		}
	}

	// Type conversion runs last so concatenation happens on raw strings first.
	convertFieldTypes(values, config, mappedFields);
}

/**
 * Applies a single destination mapping. Handles simple fields, blocks matched by
 * contentTypeKey, and the legacy three-part dot path.
 */
function applyDestinationMapping(
	values: PropertyValue[],
	dest: MappingDestination,
	sectionValue: string,
	config: DocumentTypeConfig,
	mappedFields: Set<string>,
): void {
	const transformedValue = sectionValue;

	// Block property — contentTypeKey is preferred, being stable across documents.
	if (dest.contentTypeKey) {
		for (const container of allContainers(config)) {
			applyBlockValueByContentType(
				values,
				container.alias,
				dest.contentTypeKey,
				dest.target,
				transformedValue,
				mappedFields,
			);
		}
		return;
	}

	// Fallback for mappings written before contentTypeKey was recorded.
	if (dest.blockKey) {
		for (const container of allContainers(config)) {
			const block = container.blocks.find((b) => b.key === dest.blockKey);
			if (block) {
				if (block.contentTypeKey) {
					applyBlockValueByContentType(
						values,
						container.alias,
						block.contentTypeKey,
						dest.target,
						transformedValue,
						mappedFields,
					);
				} else if (block.identifyBy) {
					applyBlockGridValue(
						values,
						container.alias,
						block.identifyBy,
						dest.target,
						transformedValue,
						mappedFields,
					);
				}
				return;
			}
		}
		console.log(`Block ${dest.blockKey} not found in destination config`);
		return;
	}

	const pathParts = dest.target.split('.');

	if (pathParts.length === 1) {
		// Simple field, e.g. "pageTitle".
		const alias = pathParts[0];
		const existing = values.find((v) => v.alias === alias);

		if (existing) {
			if (mappedFields.has(alias)) {
				const currentValue = typeof existing.value === 'string' ? existing.value : '';
				existing.value = `${currentValue} ${transformedValue}`;
			} else {
				existing.value = transformedValue;
			}
		} else {
			values.push({ alias, value: transformedValue });
		}
		mappedFields.add(alias);
	} else if (pathParts.length === 3) {
		// Legacy dot path, e.g. "contentGrid.itineraryBlock.richTextContent".
		const [gridKey, blockKey, propertyKey] = pathParts;

		const blockGrid = allContainers(config).find((g) => g.key === gridKey);
		const block = blockGrid?.blocks.find((b) => b.key === blockKey);

		if (!blockGrid || !block) return;

		const targetProperty = block.properties?.find((p) => p.key === propertyKey)?.alias ?? propertyKey;
		if (!block.identifyBy) return;

		applyBlockGridValue(
			values,
			blockGrid.alias,
			block.identifyBy,
			targetProperty,
			transformedValue,
			mappedFields,
		);
	}
}

/**
 * Applies a value to a block property, finding the block by a text match on one
 * of its properties. Used only where no contentTypeKey is recorded.
 */
function applyBlockGridValue(
	values: PropertyValue[],
	gridAlias: string,
	blockSearch: { property: string; value: string },
	targetProperty: string,
	value: string,
	mappedFields: Set<string>,
): void {
	const contentGridValue = values.find((v) => v.alias === gridAlias);
	if (!contentGridValue || !contentGridValue.value) return;

	try {
		const wasString = typeof contentGridValue.value === 'string';
		const contentGrid = wasString
			? JSON.parse(contentGridValue.value as string)
			: contentGridValue.value;

		const contentData = contentGrid.contentData as BlockContentData[] | undefined;
		if (!contentData) return;

		for (const block of contentData) {
			const searchValue = block.values?.find((v) => v.alias === blockSearch.property);

			if (
				searchValue &&
				typeof searchValue.value === 'string' &&
				searchValue.value.toLowerCase().includes(blockSearch.value.toLowerCase())
			) {
				writeBlockProperty(block, targetProperty, value, mappedFields);
				break;
			}
		}

		contentGridValue.value = wasString ? JSON.stringify(contentGrid) : contentGrid;
	} catch (error) {
		console.error(`Failed to apply block mapping to ${gridAlias}:`, error);
	}
}

/**
 * Applies a value to a block property, matching the block by its contentTypeKey
 * (element type GUID). Umbraco regenerates block instance keys when creating from
 * a blueprint, so the element type is the only stable identifier.
 */
function applyBlockValueByContentType(
	values: PropertyValue[],
	containerAlias: string,
	contentTypeKey: string,
	targetProperty: string,
	value: string,
	mappedFields: Set<string>,
): void {
	const containerValue = values.find((v) => v.alias === containerAlias);
	if (!containerValue || !containerValue.value) return;

	try {
		const wasString = typeof containerValue.value === 'string';
		const containerData = wasString
			? JSON.parse(containerValue.value as string)
			: containerValue.value;

		const contentData = containerData.contentData as BlockContentData[] | undefined;
		if (!contentData) return;

		const block = contentData.find((b) => b.contentTypeKey === contentTypeKey);
		if (!block) return;

		writeBlockProperty(block, targetProperty, value, mappedFields);

		containerValue.value = wasString ? JSON.stringify(containerData) : containerData;
	} catch (error) {
		console.error(`Failed to apply block mapping by content type to ${containerAlias}:`, error);
	}
}

/**
 * Writes one property on one block, concatenating if this run has written it
 * before.
 *
 * If the property is absent it is created rather than dropped. Absent is not the
 * same as empty here: a property only appears in `contentData` once a value has
 * been saved against it, so two blocks that look identical in the backoffice can
 * differ in the underlying JSON depending on the blueprint's editing history.
 */
function writeBlockProperty(
	block: BlockContentData,
	targetProperty: string,
	value: string,
	mappedFields: Set<string>,
): void {
	const fieldKey = `${block.key}:${targetProperty}`;
	const targetValue = block.values?.find((v) => v.alias === targetProperty);

	if (targetValue) {
		if (mappedFields.has(fieldKey)) {
			const currentValue = typeof targetValue.value === 'string' ? targetValue.value : '';
			targetValue.value = `${currentValue}\n${value}`;
		} else {
			targetValue.value = value;
		}
	} else {
		block.values = block.values ?? [];
		block.values.push({ alias: targetProperty, value });
	}

	mappedFields.add(fieldKey);
}

/**
 * Post-mapping pass. Converts each written value to the shape its property editor
 * expects, using the field types recorded in destination.json.
 *
 * Only fields this run wrote are touched, so blueprint defaults are left alone.
 */
function convertFieldTypes(
	values: PropertyValue[],
	config: DocumentTypeConfig,
	mappedFields: Set<string>,
): void {
	for (const field of config.destination.fields) {
		if (!mappedFields.has(field.alias)) continue;

		if (field.type === 'text' || field.type === 'textArea') {
			const val = values.find((v) => v.alias === field.alias);
			if (val && typeof val.value === 'string') {
				val.value = stripMarkdown(val.value);
			}
			continue;
		}

		// Number: "£1,199" → 1199. On failure the value is dropped entirely so the
		// property keeps its scaffold default, rather than sending a non-numeric
		// string the API would reject.
		if (field.type === 'number') {
			const idx = values.findIndex((v) => v.alias === field.alias);
			if (idx !== -1 && typeof values[idx].value === 'string') {
				const coerced = coerceToInteger(values[idx].value as string);
				if (coerced === null) {
					console.warn(
						`UpDoc: could not coerce "${values[idx].value}" to an integer for field "${field.alias}" — leaving property unset.`,
					);
					values.splice(idx, 1);
				} else {
					values[idx].value = coerced;
				}
			}
			continue;
		}

		// Date: "26th September 2027" → { date: "2027-09-26", timeZone: null }.
		// Not a bare ISO string — DateTimePropertyEditorBase declares ValueType = Json,
		// so a plain string is deserialised as JSON and rejected. Unparseable or
		// ambiguous input drops the value rather than storing a wrong date.
		if (field.type === 'date') {
			const idx = values.findIndex((v) => v.alias === field.alias);
			if (idx !== -1 && typeof values[idx].value === 'string') {
				const iso = coerceToDateOnly(values[idx].value as string);
				if (iso === null) {
					console.warn(
						`UpDoc: could not coerce "${values[idx].value}" to a date for field "${field.alias}" — leaving property unset.`,
					);
					values.splice(idx, 1);
				} else {
					values[idx].value = buildDateValue(iso);
				}
			}
			continue;
		}

		if (field.type === 'richText') {
			const val = values.find((v) => v.alias === field.alias);
			if (val && typeof val.value === 'string') {
				val.value = buildRteValue(markdownToHtml(val.value));
			}
		}
	}

	// The same conversions, for properties inside blocks.
	for (const container of allContainers(config)) {
		const containerVal = values.find((v) => v.alias === container.alias);
		if (!containerVal?.value) continue;

		const wasString = typeof containerVal.value === 'string';
		const containerData = wasString
			? JSON.parse(containerVal.value as string)
			: containerVal.value;
		const contentData = containerData.contentData as BlockContentData[] | undefined;
		if (!contentData) continue;

		for (const block of contentData) {
			for (const destBlock of container.blocks) {
				// Match on contentTypeKey. An identifyBy text search is unreliable here
				// because the apply pass may already have overwritten the blueprint
				// default that the search looks for.
				const matched = destBlock.contentTypeKey
					? block.contentTypeKey === destBlock.contentTypeKey
					: block.key === destBlock.key;

				if (!matched) continue;

				for (const prop of destBlock.properties ?? []) {
					const fieldKey = `${block.key}:${prop.alias}`;
					if (!mappedFields.has(fieldKey)) continue;

					const blockVal = block.values?.find((v) => v.alias === prop.alias);
					if (!blockVal || typeof blockVal.value !== 'string') continue;

					if (prop.type === 'text' || prop.type === 'textArea') {
						blockVal.value = stripMarkdown(blockVal.value);
					} else if (prop.type === 'richText') {
						blockVal.value = buildRteValue(markdownToHtml(blockVal.value));
					}
				}
				break;
			}
		}

		containerVal.value = wasString ? JSON.stringify(containerData) : containerData;
	}
}

/** Block grids and block lists together — mappings treat them the same way. */
function allContainers(config: DocumentTypeConfig) {
	return [...(config.destination.blockGrids ?? []), ...(config.destination.blockLists ?? [])];
}

/** Pulls a readable message out of a failed Management API response. */
async function readError(response: Response): Promise<string> {
	try {
		const problem = await response.json();
		return problem?.title || problem?.detail || `${response.status} ${response.statusText}`;
	} catch {
		return `${response.status} ${response.statusText}`;
	}
}
