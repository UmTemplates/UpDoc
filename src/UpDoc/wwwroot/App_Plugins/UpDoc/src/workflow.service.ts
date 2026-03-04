import type { DocumentTypeConfig, ExtractSectionsResponse, MapConfig, RichExtractionResult, SectionRuleSet, AreaRules, TransformResult, AreaDetectionResult, AreaTemplate, InferSectionPatternResponse, ContainerOverride } from './workflow.types.js';

const configCache = new Map<string, DocumentTypeConfig>();

export interface ActiveWorkflows {
	documentTypeAliases: string[];
	blueprintIds: string[];
}

let activeWorkflowsCache: ActiveWorkflows | null = null;
let activeWorkflowsPromise: Promise<ActiveWorkflows> | null = null;

/**
 * Fetches the list of document type aliases and blueprint IDs
 * that have complete workflows configured. Cached globally.
 */
export async function fetchActiveWorkflows(token: string): Promise<ActiveWorkflows> {
	if (activeWorkflowsCache) return activeWorkflowsCache;

	if (!activeWorkflowsPromise) {
		activeWorkflowsPromise = (async () => {
			try {
				const response = await fetch('/umbraco/management/api/v1/updoc/workflows/active', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					activeWorkflowsCache = await response.json();
				} else {
					activeWorkflowsCache = { documentTypeAliases: [], blueprintIds: [] };
				}
			} catch {
				activeWorkflowsCache = { documentTypeAliases: [], blueprintIds: [] };
			}
			activeWorkflowsPromise = null;
			return activeWorkflowsCache!;
		})();
	}

	return activeWorkflowsPromise;
}

/**
 * Fetches the document type config for a given blueprint ID.
 * The config contains source.json, destination.json, and map.json data.
 */
export async function fetchConfig(blueprintId: string, token: string): Promise<DocumentTypeConfig | null> {
	const cached = configCache.get(blueprintId);
	if (cached) return cached;

	const response = await fetch(
		`/umbraco/management/api/v1/updoc/config/${blueprintId}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		console.warn(`No config found for blueprint ${blueprintId}`);
		return null;
	}

	const config: DocumentTypeConfig = await response.json();
	configCache.set(blueprintId, config);
	return config;
}

/**
 * Extracts sections from a source document using the config for the given blueprint.
 * Returns extracted sections and the full config for property mapping.
 */
export async function extractSections(
	mediaKey: string,
	blueprintId: string,
	token: string,
	sourceType: string = 'pdf'
): Promise<ExtractSectionsResponse | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/extract-sections?mediaKey=${mediaKey}&blueprintId=${blueprintId}&sourceType=${sourceType}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Extract sections failed:', error);
		return null;
	}

	// API returns { sections, config } - pass through directly
	return response.json();
}

/**
 * Fetches the full config for a workflow by its alias.
 * Returns source, destination, and map configs.
 */
export async function fetchWorkflowByAlias(alias: string, token: string): Promise<DocumentTypeConfig | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(alias)}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		console.warn(`No workflow found with alias "${alias}"`);
		return null;
	}

	return response.json();
}

/**
 * Changes the document type and blueprint for a workflow.
 * Updates workflow.json, regenerates destination.json, and reconciles map.json blockKeys.
 */
export async function changeWorkflowDestination(
	workflowAlias: string,
	documentTypeAlias: string,
	documentTypeName: string | null,
	blueprintId: string,
	blueprintName: string | null,
	token: string,
): Promise<import('./workflow.types.js').DestinationConfig | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/destination`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				documentTypeAlias,
				documentTypeName,
				blueprintId,
				blueprintName,
			}),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Change destination failed:', error);
		return null;
	}

	clearConfigCache();
	const result = await response.json();
	return result.destination;
}

/**
 * Fetches the sample extraction for a workflow, if it exists.
 */
export async function fetchSampleExtraction(
	workflowAlias: string,
	token: string
): Promise<RichExtractionResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/sample-extraction`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Triggers a sample extraction for a workflow from a media item or URL.
 * The extraction is saved to sample-extraction.json in the workflow folder.
 */
export async function triggerSampleExtraction(
	workflowAlias: string,
	mediaKey: string,
	token: string,
	url?: string
): Promise<RichExtractionResult | null> {
	const body: Record<string, unknown> = {};
	if (mediaKey) body.mediaKey = mediaKey;
	if (url) body.url = url;

	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/sample-extraction`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Sample extraction failed:', error);
		return null;
	}

	return response.json();
}

/**
 * Runs a standalone rich extraction from a media item (PDF) without saving to a workflow.
 * Used for validation/preview before the workflow folder exists.
 */
export async function extractRich(
	mediaKey: string,
	token: string
): Promise<RichExtractionResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/extract-rich?mediaKey=${mediaKey}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Fetches the area detection result for a workflow, if it exists.
 */
export async function fetchAreaDetection(
	workflowAlias: string,
	token: string
): Promise<AreaDetectionResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/area-detection`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Triggers area detection for a workflow from a media item (PDF).
 * The result is saved to area-detection.json in the workflow folder.
 */
export async function triggerAreaDetection(
	workflowAlias: string,
	mediaKey: string,
	token: string
): Promise<AreaDetectionResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/area-detection`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ mediaKey }),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Area detection failed:', error);
		return null;
	}

	return response.json();
}

/**
 * Fetches the transform result for a workflow, if it exists.
 */
export async function fetchTransformResult(
	workflowAlias: string,
	token: string
): Promise<TransformResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/transform`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Triggers area detection + transform for a workflow from a media item (PDF).
 * The result is saved to transform.json (and area-detection.json) in the workflow folder.
 */
export async function triggerTransform(
	workflowAlias: string,
	mediaKey: string,
	token: string
): Promise<TransformResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/transform`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ mediaKey }),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Transform failed:', error);
		return null;
	}

	return response.json();
}

/**
 * Re-runs transform from saved area detection + source config (no re-extraction).
 * Used after saving area rules for web/markdown sources that lack a mediaKey.
 */
export async function retransform(
	workflowAlias: string,
	token: string
): Promise<TransformResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/retransform`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Retransform failed:', error);
		return null;
	}

	return response.json();
}

/**
 * Runs area detection + transform on a media item or URL without saving to disk.
 * Returns a TransformResult with include/exclude state from the stored transform.
 */
export async function transformAdhoc(
	workflowAlias: string,
	mediaKey: string,
	token: string,
	url?: string
): Promise<TransformResult | null> {
	const body: Record<string, unknown> = {};
	if (mediaKey) body.mediaKey = mediaKey;
	if (url) body.url = url;

	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/transform-adhoc`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(body),
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Updates the include/exclude state for a single section in transform.json.
 */
export async function updateSectionInclusion(
	workflowAlias: string,
	sectionId: string,
	included: boolean,
	token: string
): Promise<TransformResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/transform/sections/${encodeURIComponent(sectionId)}/included`,
		{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ included }),
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Saves sort order for areas within a page (areaName=null) or sections within an area.
 * Returns the updated TransformResult on success.
 */
export async function saveSortOrder(
	workflowAlias: string,
	page: number,
	areaName: string | null,
	sortedIds: string[],
	token: string
): Promise<TransformResult | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/transform/sort-order`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ page, areaName, sortedIds }),
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Saves the map config for a workflow.
 */
export async function saveMapConfig(
	workflowAlias: string,
	config: MapConfig,
	token: string
): Promise<MapConfig | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/map`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(config),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Save map config failed:', error);
		return null;
	}

	clearConfigCache();
	return response.json();
}

/**
 * Saves page selection for a workflow. Pass null or empty array for "all pages".
 */
export async function savePageSelection(
	workflowAlias: string,
	pages: number[] | null,
	token: string
): Promise<boolean> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/pages`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ pages }),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Save page selection failed:', error);
		return false;
	}

	clearConfigCache();
	return true;
}

/**
 * Saves excluded areas for a workflow. Pass null or empty array to include all areas.
 * Returns the updated excluded areas list on success.
 */
export async function saveExcludedAreas(
	workflowAlias: string,
	excludedAreas: string[] | null,
	token: string
): Promise<string[] | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/excluded-areas`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ excludedAreas }),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Save excluded areas failed:', error);
		return null;
	}

	clearConfigCache();
	const result = await response.json();
	return result.excludedAreas ?? [];
}

/**
 * Saves container overrides for a workflow. Pass null or empty array to clear all overrides.
 * Returns the updated container overrides list on success.
 */
export async function saveContainerOverrides(
	workflowAlias: string,
	overrides: ContainerOverride[] | null,
	token: string
): Promise<ContainerOverride[] | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/container-overrides`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ overrides: overrides ?? [] }),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Save container overrides failed:', error);
		return null;
	}

	clearConfigCache();
	const result = await response.json();
	return result.containerOverrides ?? [];
}

/**
 * Fetches the source config for a workflow.
 */
export async function fetchSourceConfig(
	workflowAlias: string,
	token: string
): Promise<import('./workflow.types.js').SourceConfig | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/source`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Fetches the area template for a workflow, if it exists.
 */
export async function fetchAreaTemplate(
	workflowAlias: string,
	token: string
): Promise<AreaTemplate | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/area-template`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) return null;
	return response.json();
}

/**
 * Saves an area template for a workflow.
 */
export async function saveAreaTemplate(
	workflowAlias: string,
	template: AreaTemplate,
	token: string
): Promise<AreaTemplate | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/area-template`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(template),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Save area template failed:', error);
		return null;
	}

	return response.json();
}

/**
 * Fetches the PDF file bytes for a workflow's source document.
 * Returns a Blob that can be used with PDF.js.
 */
export async function fetchPdfBlob(
	workflowAlias: string,
	token: string
): Promise<Blob | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/pdf`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) return null;
	return response.blob();
}

/**
 * Saves section rules for a workflow. Patches source.json's sectionRules key.
 */
export async function saveSectionRules(
	workflowAlias: string,
	sectionRules: Record<string, SectionRuleSet>,
	token: string
): Promise<Record<string, SectionRuleSet> | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/section-rules`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(sectionRules),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Save section rules failed:', error);
		return null;
	}

	clearConfigCache();
	return response.json();
}

/**
 * Saves area rules for a workflow. Patches source.json's areaRules key.
 */
export async function saveAreaRules(
	workflowAlias: string,
	areaRules: Record<string, AreaRules>,
	token: string
): Promise<Record<string, AreaRules> | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/area-rules`,
		{
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(areaRules),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Save area rules failed:', error);
		return null;
	}

	clearConfigCache();
	return response.json();
}

/**
 * Infers a section pattern from a clicked element.
 * The backend examines the element's metadata and finds minimum distinguishing conditions.
 */
export async function inferSectionPattern(
	workflowAlias: string,
	areaIndex: number,
	elementId: string,
	token: string
): Promise<InferSectionPatternResponse | null> {
	const response = await fetch(
		`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflowAlias)}/infer-section-pattern`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ areaIndex, elementId }),
		}
	);

	if (!response.ok) {
		const error = await response.json();
		console.error('Infer section pattern failed:', error);
		return null;
	}

	return response.json();
}

export function clearConfigCache(): void {
	configCache.clear();
	activeWorkflowsCache = null;
	activeWorkflowsPromise = null;
}
