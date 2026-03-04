import { UMB_BLUEPRINT_PICKER_MODAL } from './blueprint-picker-modal.token.js';
import { UMB_UP_DOC_MODAL } from './up-doc-modal.token.js';
import type { DocumentTypeOption } from './blueprint-picker-modal.token.js';
import type { DocumentTypeConfig, MappingDestination } from './workflow.types.js';
import { fetchActiveWorkflows } from './workflow.service.js';
import { markdownToHtml, buildRteValue, stripMarkdown } from './transforms.js';
import { css, customElement, html, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/document';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
import { umbOpenModal } from '@umbraco-cms/backoffice/modal';
import { UmbDocumentTypeStructureRepository } from '@umbraco-cms/backoffice/document-type';
import { UmbDocumentBlueprintItemRepository } from '@umbraco-cms/backoffice/document-blueprint';
import type { UmbEntityUnique } from '@umbraco-cms/backoffice/entity';

@customElement('up-doc-collection-action')
export class UpDocCollectionActionElement extends UmbLitElement {
	#documentTypeStructureRepository = new UmbDocumentTypeStructureRepository(this);
	#blueprintItemRepository = new UmbDocumentBlueprintItemRepository(this);

	@state()
	private _documentUnique?: UmbEntityUnique;

	@state()
	private _documentTypeUnique?: string;

	@state()
	private _hasWorkflows = false;

	constructor() {
		super();

		this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
			this.observe(workspaceContext?.unique, (unique) => {
				this._documentUnique = unique;
				this.#checkWorkflows();
			});
			this.observe(workspaceContext?.contentTypeUnique, (documentTypeUnique) => {
				this._documentTypeUnique = documentTypeUnique;
				this.#checkWorkflows();
			});
		});
	}

	async #checkWorkflows() {
		if (!this._documentTypeUnique) return;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();
			const activeWorkflows = await fetchActiveWorkflows(token);
			const activeBlueprintIds = new Set(activeWorkflows.blueprintIds);

			// Check if any allowed child types have blueprints with workflows
			const { data } = await this.#documentTypeStructureRepository.requestAllowedChildrenOf(
				this._documentTypeUnique,
				this._documentUnique || null,
			);

			if (!data?.items?.length) return;

			for (const docType of data.items) {
				const { data: blueprints } = await this.#blueprintItemRepository.requestItemsByDocumentType(docType.unique);
				if (blueprints?.some((bp) => activeBlueprintIds.has(bp.unique))) {
					this._hasWorkflows = true;
					return;
				}
			}
		} catch {
			// Silently fail — button stays hidden
		}
	}

	async #onClick() {
		if (!this._documentTypeUnique) return;

		const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
		const authContext = await this.getContext(UMB_AUTH_CONTEXT);
		const token = await authContext.getLatestToken();
		const parentUnique = this._documentUnique ?? null;

		try {
			// Discover allowed child types with workflow blueprints
			const activeWorkflows = await fetchActiveWorkflows(token);
			const activeBlueprintIds = new Set(activeWorkflows.blueprintIds);

			const { data: allowedTypes } = await this.#documentTypeStructureRepository.requestAllowedChildrenOf(
				this._documentTypeUnique,
				parentUnique,
			);

			if (!allowedTypes?.items?.length) {
				notificationContext.peek('danger', {
					data: { message: 'No document types are allowed as children of this page.' },
				});
				return;
			}

			const documentTypeOptions: DocumentTypeOption[] = [];

			for (const docType of allowedTypes.items) {
				const { data: blueprints } = await this.#blueprintItemRepository.requestItemsByDocumentType(docType.unique);
				if (blueprints?.length) {
					const workflowBlueprints = blueprints.filter((bp) => activeBlueprintIds.has(bp.unique));
					if (workflowBlueprints.length) {
						documentTypeOptions.push({
							documentTypeUnique: docType.unique,
							documentTypeName: docType.name,
							documentTypeIcon: (docType as { icon?: string }).icon ?? null,
							blueprints: workflowBlueprints.map((bp) => ({
								blueprintUnique: bp.unique,
								blueprintName: bp.name,
							})),
						});
					}
				}
			}

			if (!documentTypeOptions.length) {
				notificationContext.peek('warning', {
					data: { message: 'No workflows are configured for the document types allowed here.' },
				});
				return;
			}

			// Open blueprint picker
			let blueprintSelection;
			try {
				blueprintSelection = await umbOpenModal(this, UMB_BLUEPRINT_PICKER_MODAL, {
					data: { documentTypes: documentTypeOptions },
				});
			} catch {
				return;
			}

			const { blueprintUnique, documentTypeUnique } = blueprintSelection;
			const selectedDocType = documentTypeOptions.find((dt) => dt.documentTypeUnique === documentTypeUnique);
			const selectedBlueprint = selectedDocType?.blueprints.find((bp) => bp.blueprintUnique === blueprintUnique);

			// Open source sidebar modal
			let modalValue;
			try {
				modalValue = await umbOpenModal(this, UMB_UP_DOC_MODAL, {
					data: {
						unique: parentUnique,
						blueprintName: selectedBlueprint?.blueprintName ?? '',
						blueprintId: blueprintUnique,
					},
				});
			} catch {
				return;
			}

			const { name, mediaUnique, sourceUrl, sectionLookup, stableKeyLookup, config } = modalValue;

			// Web source uses URL (no media), others need media key
			if (!name || !config) return;
			if (!mediaUnique && !sourceUrl) return;

			// Scaffold from blueprint
			const scaffoldResponse = await fetch(
				`/umbraco/management/api/v1/document-blueprint/${blueprintUnique}/scaffold`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!scaffoldResponse.ok) {
				const error = await scaffoldResponse.json();
				notificationContext.peek('danger', {
					data: { message: `Failed to scaffold from blueprint: ${error.title || 'Unknown error'}` },
				});
				return;
			}

			const scaffold = await scaffoldResponse.json();

			// Apply property mappings
			const values: Array<{ alias: string; value: unknown }> = scaffold.values
				? JSON.parse(JSON.stringify(scaffold.values))
				: [];

			// Track which fields have been written by our mappings.
			// First write replaces the blueprint default; subsequent writes concatenate.
			const mappedFields = new Set<string>();

			for (const mapping of config.map.mappings) {
				if (mapping.enabled === false) continue;
				let sectionValue = sectionLookup[mapping.source];

				// StableKey fallback: if section ID changed but stableKey matches, resolve via new ID
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
					this.#applyDestinationMapping(values, dest, sectionValue, config, mappedFields);
				}
			}

			// Convert richText fields: markdown → HTML → RTE value object.
			// Done as a post-mapping pass so concatenation happens on raw strings first.
			this.#convertRichTextFields(values, config, mappedFields);

			// Create the document
			const createRequest = {
				parent: parentUnique ? { id: parentUnique } : null,
				documentType: { id: documentTypeUnique },
				template: scaffold.template ? { id: scaffold.template.id } : null,
				values,
				variants: [{ name, culture: null, segment: null }],
			};

			const createResponse = await fetch('/umbraco/management/api/v1/document', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(createRequest),
			});

			if (!createResponse.ok) {
				const error = await createResponse.json();
				notificationContext.peek('danger', {
					data: { message: `Failed to create document: ${error.title || error.detail || 'Unknown error'}` },
				});
				return;
			}

			const locationHeader = createResponse.headers.get('Location');
			const newDocumentId = locationHeader?.split('/').pop();

			// Save to persist
			if (newDocumentId) {
				const getResponse = await fetch(`/umbraco/management/api/v1/document/${newDocumentId}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				});

				if (getResponse.ok) {
					const documentData = await getResponse.json();
					await fetch(`/umbraco/management/api/v1/document/${newDocumentId}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
						body: JSON.stringify(documentData),
					});
				}
			}

			notificationContext.peek('positive', {
				data: { message: `Document "${name}" created successfully!` },
			});

			if (newDocumentId) {
				const newPath = `/umbraco/section/content/workspace/document/edit/${newDocumentId}`;
				setTimeout(() => {
					window.location.href = newPath;
				}, 150);
			}
		} catch (error) {
			console.error('Error creating document:', error);
			notificationContext.peek('danger', {
				data: { message: 'An unexpected error occurred while creating the document.' },
			});
		}
	}

	#applyDestinationMapping(
		values: Array<{ alias: string; value: unknown }>,
		dest: MappingDestination,
		sectionValue: string,
		config: DocumentTypeConfig,
		mappedFields: Set<string>,
	) {
		const transformedValue = sectionValue;

		// Block property — use contentTypeKey directly if available (resilient to stale blockKeys)
		if (dest.contentTypeKey) {
			for (const container of [...(config.destination.blockGrids ?? []), ...(config.destination.blockLists ?? [])]) {
				this.#applyBlockValueByContentType(values, container.alias, dest.contentTypeKey, dest.target, transformedValue, mappedFields);
			}
			return;
		}

		// Fallback: blockKey lookup in destination.json (for mappings without contentTypeKey)
		if (dest.blockKey) {
			for (const container of [...(config.destination.blockGrids ?? []), ...(config.destination.blockLists ?? [])]) {
				const block = container.blocks.find((b) => b.key === dest.blockKey);
				if (block) {
					const contentTypeKey = block.contentTypeKey;
					if (contentTypeKey) {
						this.#applyBlockValueByContentType(values, container.alias, contentTypeKey, dest.target, transformedValue, mappedFields);
					} else if (block.identifyBy) {
						this.#applyBlockGridValue(values, container.alias, block.identifyBy, dest.target, transformedValue, mappedFields);
					}
					return;
				}
			}
			console.log(`Block ${dest.blockKey} not found in destination config`);
			return;
		}

		// Parse the target path
		const pathParts = dest.target.split('.');

		if (pathParts.length === 1) {
			// Simple field mapping: "pageTitle"
			const alias = pathParts[0];
			const existing = values.find((v) => v.alias === alias);

			if (existing) {
				if (mappedFields.has(alias)) {
					// Already written by a previous mapping — concatenate
					const currentValue = typeof existing.value === 'string' ? existing.value : '';
					existing.value = `${currentValue} ${transformedValue}`;
				} else {
					// First write — replace the blueprint default
					existing.value = transformedValue;
				}
			} else {
				values.push({ alias, value: transformedValue });
			}
			mappedFields.add(alias);
		} else if (pathParts.length === 3) {
			// Legacy dot-path: "contentGrid.itineraryBlock.richTextContent"
			const [gridKey, blockKey, propertyKey] = pathParts;
			const allContainers = [...(config.destination.blockGrids ?? []), ...(config.destination.blockLists ?? [])];
			const blockGrid = allContainers.find((g) => g.key === gridKey);
			const block = blockGrid?.blocks.find((b) => b.key === blockKey);

			if (!blockGrid || !block) return;

			const gridAlias = blockGrid.alias;
			const targetProperty = block.properties?.find((p) => p.key === propertyKey)?.alias ?? propertyKey;
			const blockSearch = block.identifyBy;

			if (!blockSearch) return;

			this.#applyBlockGridValue(values, gridAlias, blockSearch, targetProperty, transformedValue, mappedFields);
		}
	}

	#applyBlockGridValue(
		values: Array<{ alias: string; value: unknown }>,
		gridAlias: string,
		blockSearch: { property: string; value: string },
		targetProperty: string,
		value: string,
		mappedFields: Set<string>,
	) {
		const contentGridValue = values.find((v) => v.alias === gridAlias);
		if (!contentGridValue || !contentGridValue.value) return;

		try {
			const wasString = typeof contentGridValue.value === 'string';
			const contentGrid = wasString
				? JSON.parse(contentGridValue.value as string)
				: contentGridValue.value;

			const contentData = contentGrid.contentData as Array<{
				contentTypeKey: string;
				key: string;
				values: Array<{ alias: string; value: unknown }>;
			}>;

			if (!contentData) return;

			for (const block of contentData) {
				const searchValue = block.values?.find((v) => v.alias === blockSearch.property);
				if (
					searchValue &&
					typeof searchValue.value === 'string' &&
					searchValue.value.toLowerCase().includes(blockSearch.value.toLowerCase())
				) {
					const targetValue = block.values?.find((v) => v.alias === targetProperty);
					if (targetValue) {
						// Use compound key for block property tracking
						const fieldKey = `${block.key}:${targetProperty}`;

						if (mappedFields.has(fieldKey)) {
							// Already written — concatenate with newline
							const currentValue = typeof targetValue.value === 'string' ? targetValue.value : '';
							targetValue.value = `${currentValue}\n${value}`;
						} else {
							// First write — replace the blueprint default
							targetValue.value = value;
						}
						mappedFields.add(fieldKey);
					}
					break;
				}
			}

			contentGridValue.value = wasString ? JSON.stringify(contentGrid) : contentGrid;
		} catch (error) {
			console.error(`Failed to apply block mapping to ${gridAlias}:`, error);
		}
	}

	/**
	 * Applies a value to a block property by matching the block's contentTypeKey in contentData.
	 * Umbraco regenerates block instance keys when creating documents from blueprints,
	 * so we match by element type GUID (contentTypeKey) which is stable across all documents.
	 */
	#applyBlockValueByContentType(
		values: Array<{ alias: string; value: unknown }>,
		containerAlias: string,
		contentTypeKey: string,
		targetProperty: string,
		value: string,
		mappedFields: Set<string>,
	) {
		const containerValue = values.find((v) => v.alias === containerAlias);
		if (!containerValue || !containerValue.value) return;

		try {
			const wasString = typeof containerValue.value === 'string';
			const containerData = wasString
				? JSON.parse(containerValue.value as string)
				: containerValue.value;

			const contentData = containerData.contentData as Array<{
				contentTypeKey: string;
				key: string;
				values: Array<{ alias: string; value: unknown }>;
			}>;

			if (!contentData) return;

			const block = contentData.find((b) => b.contentTypeKey === contentTypeKey);
			if (!block) return;

			const targetValue = block.values?.find((v) => v.alias === targetProperty);
			if (targetValue) {
				const fieldKey = `${block.key}:${targetProperty}`;

				if (mappedFields.has(fieldKey)) {
					const currentValue = typeof targetValue.value === 'string' ? targetValue.value : '';
					targetValue.value = `${currentValue}\n${value}`;
				} else {
					targetValue.value = value;
				}
				mappedFields.add(fieldKey);
			}

			containerValue.value = wasString ? JSON.stringify(containerData) : containerData;
		} catch (error) {
			console.error(`Failed to apply block mapping by content type to ${containerAlias}:`, error);
		}
	}

	/**
	 * Post-mapping pass: strips markdown from plain text fields and converts richText fields
	 * from markdown to HTML + RTE value object.
	 * Uses destination.json field types to auto-detect which fields need conversion.
	 * Only converts fields that were written by our mappings (tracked by mappedFields).
	 */
	#convertRichTextFields(
		values: Array<{ alias: string; value: unknown }>,
		config: DocumentTypeConfig,
		mappedFields: Set<string>,
	) {
		// Strip markdown from plain text fields (text, textArea)
		for (const field of config.destination.fields) {
			if ((field.type === 'text' || field.type === 'textArea') && mappedFields.has(field.alias)) {
				const val = values.find((v) => v.alias === field.alias);
				if (val && typeof val.value === 'string') {
					val.value = stripMarkdown(val.value);
				}
			}
		}

		// Convert top-level richText fields
		for (const field of config.destination.fields) {
			if (field.type === 'richText' && mappedFields.has(field.alias)) {
				const val = values.find((v) => v.alias === field.alias);
				if (val && typeof val.value === 'string') {
					val.value = buildRteValue(markdownToHtml(val.value));
				}
			}
		}

		// Convert block container (grid + list) richText properties
		const allContainers = [...(config.destination.blockGrids ?? []), ...(config.destination.blockLists ?? [])];
		for (const container of allContainers) {
			const containerVal = values.find((v) => v.alias === container.alias);
			if (!containerVal?.value) continue;

			const wasString = typeof containerVal.value === 'string';
			const containerData = wasString ? JSON.parse(containerVal.value as string) : containerVal.value;
			const contentData = containerData.contentData as Array<{
				contentTypeKey: string;
				key: string;
				values: Array<{ alias: string; value: unknown }>;
			}> | undefined;
			if (!contentData) continue;

			for (const block of contentData) {
				for (const destBlock of container.blocks) {
					// Match by contentTypeKey (element type GUID) — stable across all documents.
					// identifyBy text search is unreliable here because mapped values may have
					// already overwritten the blueprint defaults during the apply pass.
					const matched = destBlock.contentTypeKey
						? block.contentTypeKey === destBlock.contentTypeKey
						: block.key === destBlock.key;

					if (matched) {
						for (const prop of destBlock.properties ?? []) {
							const fieldKey = `${block.key}:${prop.alias}`;
							if ((prop.type === 'text' || prop.type === 'textArea') && mappedFields.has(fieldKey)) {
								const blockVal = block.values?.find((v) => v.alias === prop.alias);
								if (blockVal && typeof blockVal.value === 'string') {
									blockVal.value = stripMarkdown(blockVal.value);
								}
							}
							if (prop.type === 'richText' && mappedFields.has(fieldKey)) {
								const blockVal = block.values?.find((v) => v.alias === prop.alias);
								if (blockVal && typeof blockVal.value === 'string') {
									blockVal.value = buildRteValue(markdownToHtml(blockVal.value as string));
								}
							}
						}
						break;
					}
				}
			}

			containerVal.value = wasString ? JSON.stringify(containerData) : containerData;
		}
	}

	override render() {
		if (!this._hasWorkflows) return html``;

		return html`
			<uui-button
				color="default"
				look="outline"
				label="Create from Source"
				@click=${this.#onClick}>
				Create from Source
			</uui-button>
		`;
	}

	static override styles = [
		css`
			:host {
				display: contents;
			}
		`,
	];
}

export default UpDocCollectionActionElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-collection-action': UpDocCollectionActionElement;
	}
}
