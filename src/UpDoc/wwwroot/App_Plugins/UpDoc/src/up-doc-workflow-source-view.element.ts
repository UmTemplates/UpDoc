import type { RichExtractionResult, DocumentTypeConfig, MappingDestination, AreaDetectionResult, DetectedArea, DetectedSection, AreaElement, TransformResult, TransformedSection, SourceConfig, AreaTemplate, AreaRules, InferSectionPatternResponse, MapConfig, SectionMapping } from './workflow.types.js';
import { allTransformSections } from './workflow.types.js';
import { fetchSampleExtraction, triggerSampleExtraction, fetchWorkflowByAlias, fetchAreaDetection, triggerTransform, fetchTransformResult, updateSectionInclusion, savePageSelection, saveExcludedAreas, saveContainerOverrides, fetchSourceConfig, fetchAreaTemplate, saveAreaTemplate, saveAreaRules, inferSectionPattern, saveMapConfig } from './workflow.service.js';
import { normalizeToKebabCase, markdownToHtml } from './transforms.js';
import { getAllBlockContainers } from './destination-utils.js';
import { UMB_AREA_EDITOR_MODAL } from './pdf-area-editor-modal.token.js';
import { UMB_AREA_PICKER_MODAL } from './area-picker-modal.token.js';
import { UMB_PAGE_PICKER_MODAL } from './page-picker-modal.token.js';
import { UMB_SECTION_RULES_EDITOR_MODAL } from './section-rules-editor-modal.token.js';
import { html, css, state, nothing, unsafeHTML } from '@umbraco-cms/backoffice/external/lit';
import { customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import { UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { UMB_MEDIA_PICKER_MODAL } from '@umbraco-cms/backoffice/media';
import { UMB_DESTINATION_PICKER_MODAL } from './destination-picker-modal.token.js';

@customElement('up-doc-workflow-source-view')
export class UpDocWorkflowSourceViewElement extends UmbLitElement {
	@state() private _extraction: RichExtractionResult | null = null;
	@state() private _areaDetection: AreaDetectionResult | null = null;
	@state() private _config: DocumentTypeConfig | null = null;
	@state() private _workflowAlias: string | null = null;
	@state() private _loading = true;
	@state() private _extracting = false;
	@state() private _error: string | null = null;
	@state() private _successMessage: string | null = null;
	@state() private _collapsed = new Set<string>();
	@state() private _transformResult: TransformResult | null = null;
	@state() private _viewMode: 'elements' | 'transformed' = 'elements';
	@state() private _sourceConfig: SourceConfig | null = null;
	@state() private _pageMode: 'all' | 'custom' = 'all';
	@state() private _pageInputValue = '';
	@state() private _collapsePopoverOpen = false;
	@state() private _excludedAreas = new Set<string>();
	@state() private _areaTemplate: AreaTemplate | null = null;
	@state() private _sectionPickerOpen = false;
	/** Area index currently in teach mode (null = not teaching). */
	@state() private _teachingAreaIndex: number | null = null;
	/** Inference result from clicking an element in teach mode. */
	@state() private _inferenceResult: InferSectionPatternResponse | null = null;
	/** Whether an inference API call is in progress. */
	@state() private _inferring = false;
	@state() private _sampleUrl = '';
	#token = '';
	#orphanedKeys = new Set<string>();

	/** Get the source type for this workflow (pdf, markdown, web, etc.) */
	get #sourceType(): string {
		return this._sourceConfig?.sourceTypes?.[0] ?? 'pdf';
	}

	override connectedCallback() {
		super.connectedCallback();
		this.consumeContext(UMB_WORKSPACE_CONTEXT, (context) => {
			if (!context) return;
			// Register refresh handler so the workspace Refresh button triggers re-extraction
			(context as any).setRefreshHandler(() => this.#onReExtract());
			this.observe((context as any).unique, (unique: string | null) => {
				if (unique) {
					this._workflowAlias = decodeURIComponent(unique);
					this.#loadData();
				}
			});
		});
	}

	async #loadData() {
		if (!this._workflowAlias) return;

		this._loading = true;
		this._error = null;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			this.#token = await authContext.getLatestToken();

			// Always load source config first to determine source type
			const [extraction, config, sourceConfig] = await Promise.all([
				fetchSampleExtraction(this._workflowAlias, this.#token),
				fetchWorkflowByAlias(this._workflowAlias, this.#token),
				fetchSourceConfig(this._workflowAlias, this.#token),
			]);
			this._extraction = extraction;
			this._config = config;
			this._sourceConfig = sourceConfig;
			// Initialize excluded areas from source config
			this._excludedAreas = new Set(sourceConfig?.excludedAreas ?? []);
			// Build set of orphaned destinations from validation warnings
			this.#orphanedKeys = new Set<string>();
			for (const w of config?.validationWarnings ?? []) {
				const m = w.match(/blockKey '([^']+)' for target '([^']+)'/);
				if (m) this.#orphanedKeys.add(`${m[1]}:${m[2]}`);
			}

			const isPdf = (sourceConfig?.sourceTypes?.[0] ?? 'pdf') === 'pdf';
			const isWeb = (sourceConfig?.sourceTypes?.[0]) === 'web';

			if (isPdf) {
				// PDF-specific: load area detection, transform, area template
				const [areaDetection, transformResult, areaTemplate] = await Promise.all([
					fetchAreaDetection(this._workflowAlias, this.#token),
					fetchTransformResult(this._workflowAlias, this.#token),
					fetchAreaTemplate(this._workflowAlias, this.#token),
				]);
				this._areaDetection = areaDetection;
				this._transformResult = transformResult;
				this._areaTemplate = areaTemplate;

				// Always re-trigger transform on load to ensure fresh data
				const mediaKey = extraction?.source.mediaKey;
				if (mediaKey && areaDetection) {
					const freshTransform = await triggerTransform(this._workflowAlias, mediaKey, this.#token);
					if (freshTransform) {
						this._transformResult = freshTransform;
					}
				}

				// Initialize page selection state from source config
				if (sourceConfig?.pages && Array.isArray(sourceConfig.pages) && sourceConfig.pages.length > 0) {
					this._pageMode = 'custom';
					this._pageInputValue = this.#pagesToRangeString(sourceConfig.pages);
				} else {
					this._pageMode = 'all';
					this._pageInputValue = '';
				}
			} else if (isWeb) {
				// Web: load area detection (auto-generated from extraction) + transform
				const [areaDetection, transformResult] = await Promise.all([
					fetchAreaDetection(this._workflowAlias, this.#token),
					fetchTransformResult(this._workflowAlias, this.#token),
				]);
				this._areaDetection = areaDetection;
				this._transformResult = transformResult;
			} else {
				// Markdown: load area detection + transform (both auto-generated from extraction)
				const [areaDetection, transformResult] = await Promise.all([
					fetchAreaDetection(this._workflowAlias, this.#token),
					fetchTransformResult(this._workflowAlias, this.#token),
				]);
				this._areaDetection = areaDetection;
				this._transformResult = transformResult;
			}
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to load data';
			console.error('Failed to load source data:', err);
		} finally {
			this._loading = false;
		}
	}

	/** Convert "1-3, 5, 7-9" → [1, 2, 3, 5, 7, 8, 9] */
	#parsePageRange(input: string): number[] {
		const pages = new Set<number>();
		for (const part of input.split(',')) {
			const trimmed = part.trim();
			if (!trimmed) continue;
			const rangeParts = trimmed.split('-').map((s) => parseInt(s.trim(), 10));
			if (rangeParts.length === 1 && !isNaN(rangeParts[0])) {
				pages.add(rangeParts[0]);
			} else if (rangeParts.length === 2 && !isNaN(rangeParts[0]) && !isNaN(rangeParts[1])) {
				for (let i = rangeParts[0]; i <= rangeParts[1]; i++) {
					pages.add(i);
				}
			}
		}
		return [...pages].sort((a, b) => a - b);
	}

	/** Convert [1, 2, 3, 5, 7, 8, 9] → "1-3, 5, 7-9" */
	#pagesToRangeString(pages: number[]): string {
		if (!pages.length) return '';
		const sorted = [...pages].sort((a, b) => a - b);
		const ranges: string[] = [];
		let start = sorted[0];
		let end = sorted[0];
		for (let i = 1; i < sorted.length; i++) {
			if (sorted[i] === end + 1) {
				end = sorted[i];
			} else {
				ranges.push(start === end ? `${start}` : `${start}-${end}`);
				start = sorted[i];
				end = sorted[i];
			}
		}
		ranges.push(start === end ? `${start}` : `${start}-${end}`);
		return ranges.join(', ');
	}

	/** Get the currently selected page numbers, or null for "all". */
	#getSelectedPages(): number[] | null {
		if (this._pageMode === 'all') return null;
		const pages = this.#parsePageRange(this._pageInputValue);
		return pages.length > 0 ? pages : null;
	}

	/** Check whether a specific page number is included in the current selection. */
	#isPageIncluded(pageNum: number): boolean {
		if (this._pageMode === 'all') return true;
		const pages = this.#parsePageRange(this._pageInputValue);
		return pages.length === 0 || pages.includes(pageNum);
	}



	async #savePageSelection() {
		if (!this._workflowAlias) return;
		const pages = this.#getSelectedPages();
		await savePageSelection(this._workflowAlias, pages, this.#token);
	}

	/** Get all collapse keys for a given level. */
	#getKeysForLevel(level: 'pages' | 'areas' | 'sections'): string[] {
		if (!this._areaDetection) return [];
		const keys: string[] = [];
		for (const page of this._areaDetection.pages) {
			const pageNum = page.page;
			if (level === 'pages') {
				keys.push(`page-${pageNum}`);
			}
			if (level === 'areas') {
				page.areas.forEach((_z, aIdx) => keys.push(`area-p${pageNum}-a${aIdx}`));
			}
			if (level === 'sections') {
				// Raw section keys
				page.areas.forEach((_z, aIdx) => {
					_z.sections.forEach((_s, sIdx) => keys.push(`p${pageNum}-a${aIdx}-s${sIdx}`));
				});
				// Composed section keys (from transform rules)
				page.areas.forEach((area) => {
					const composed = this.#getTransformSectionsForArea(area, pageNum);
					composed.forEach((s) => keys.push(`composed-${s.id}`));
				});
			}
		}
		return keys;
	}

	/** Check if all items at a level are currently collapsed. */
	#isLevelCollapsed(level: 'pages' | 'areas' | 'sections'): boolean {
		const keys = this.#getKeysForLevel(level);
		return keys.length > 0 && keys.every((k) => this._collapsed.has(k));
	}

	/** Toggle all items at a given level. */
	#toggleLevel(level: 'pages' | 'areas' | 'sections') {
		const keys = this.#getKeysForLevel(level);
		const allCollapsed = this.#isLevelCollapsed(level);
		const next = new Set(this._collapsed);
		for (const key of keys) {
			if (allCollapsed) {
				next.delete(key);
			} else {
				next.add(key);
			}
		}
		this._collapsed = next;
	}

	/** Expand everything. */
	#expandAll() {
		this._collapsed = new Set<string>();
	}

	#onCollapsePopoverToggle(event: ToggleEvent) {
		this._collapsePopoverOpen = event.newState === 'open';
	}

	/** Shared collapse/expand button with popover for all source types. */
	#renderCollapseRow() {
		if (!this._areaDetection || this._viewMode !== 'elements') return nothing;
		return html`
			<div class="collapse-row">
				<uui-button
					look="outline"
					compact
					label="Collapse"
					popovertarget="collapse-level-popover">
					Collapse
					<uui-symbol-expand .open=${this._collapsePopoverOpen}></uui-symbol-expand>
				</uui-button>
				<uui-popover-container
					id="collapse-level-popover"
					placement="bottom-start"
					@toggle=${this.#onCollapsePopoverToggle}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => this.#expandAll()}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="${this.#isLevelCollapsed('areas') ? 'Expand' : 'Collapse'} Areas"
							@click=${() => this.#toggleLevel('areas')}>
							<uui-icon slot="icon" name="icon-grid"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="${this.#isLevelCollapsed('sections') ? 'Expand' : 'Collapse'} Sections"
							@click=${() => this.#toggleLevel('sections')}>
							<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		`;
	}

	async #onPickMedia() {
		if (!this._workflowAlias) return;

		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		const modal = modalManager.open(this, UMB_MEDIA_PICKER_MODAL, {
			data: {
				multiple: false,
			},
		});

		const result = await modal.onSubmit().catch(() => null);
		if (!result?.selection?.length) return;

		const mediaKey = result.selection[0];
		if (!mediaKey) return;

		await this.#runExtraction(mediaKey);
	}

	/** Opens the area editor modal to define/edit extraction areas. */
	async #onEditAreas() {
		if (!this._workflowAlias) return;

		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		const modal = modalManager.open(this, UMB_AREA_EDITOR_MODAL, {
			data: {
				workflowAlias: this._workflowAlias,
				existingTemplate: this._areaTemplate,
				selectedPages: this._sourceConfig?.pages && Array.isArray(this._sourceConfig.pages)
					? this._sourceConfig.pages
					: null,
			},
		});

		try {
			const result = await modal.onSubmit();
			if (result?.template) {
				// Save the area template
				const saved = await saveAreaTemplate(this._workflowAlias, result.template, this.#token);
				if (saved) {
					this._areaTemplate = saved;
					// Re-extract with the new area template applied
					await this.#onReExtract();
				}
			}
		} catch {
			// Modal was cancelled — do nothing
		}
	}

	/** Opens the area picker modal for web/markdown sources to include/exclude areas. */
	async #onOpenAreaPicker() {
		if (!this._workflowAlias || !this._areaDetection) return;

		// Build area list from detection result
		const areas = this._areaDetection.pages.flatMap((page) =>
			page.areas.map((area) => ({
				name: area.name || 'Unnamed',
				elementCount: area.totalElements,
				color: area.color,
			}))
		);

		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		const modal = modalManager.open(this, UMB_AREA_PICKER_MODAL, {
			data: {
				areas,
				excludedAreas: [...this._excludedAreas],
				containers: this._extraction?.containers ?? null,
				containerOverrides: this._sourceConfig?.containerOverrides ?? [],
			},
		});

		try {
			const result = await modal.onSubmit();
			if (result) {
				// Save container overrides first (regenerates area-detection + transform)
				const overridesChanged = JSON.stringify(result.containerOverrides ?? [])
					!== JSON.stringify(this._sourceConfig?.containerOverrides ?? []);
				if (overridesChanged) {
					const savedOverrides = await saveContainerOverrides(
						this._workflowAlias, result.containerOverrides ?? [], this.#token
					);
					if (savedOverrides != null && this._sourceConfig) {
						this._sourceConfig = { ...this._sourceConfig, containerOverrides: savedOverrides };
					}
					// Re-fetch area detection and transform (regenerated server-side)
					const [areaDetection, transform] = await Promise.all([
						fetchAreaDetection(this._workflowAlias, this.#token),
						fetchTransformResult(this._workflowAlias, this.#token),
					]);
					if (areaDetection) this._areaDetection = areaDetection;
					if (transform) this._transformResult = transform;
				}

				// Save excluded areas (regenerates transform only)
				const excludedChanged = JSON.stringify([...result.excludedAreas].sort())
					!== JSON.stringify([...this._excludedAreas].sort());
				if (excludedChanged) {
					this._excludedAreas = new Set(result.excludedAreas);
					const saved = await saveExcludedAreas(this._workflowAlias, result.excludedAreas, this.#token);
					if (saved != null && this._sourceConfig) {
						this._sourceConfig = { ...this._sourceConfig, excludedAreas: saved };
					}
					const transform = await fetchTransformResult(this._workflowAlias, this.#token);
					if (transform) {
						this._transformResult = transform;
					}
				}
			}
		} catch {
			// Modal was cancelled
		}
	}

	/** Builds a list of areas for the rules editor dropdown. */
	#getAreasForRulesEditor(): Array<{ areaKey: string; areaName: string; elements: AreaElement[]; hasRules: boolean }> {
		if (!this._areaDetection) return [];

		const result: Array<{ areaKey: string; areaName: string; elements: AreaElement[]; hasRules: boolean }> = [];
		const seenKeys = new Set<string>();

		for (const page of this._areaDetection.pages) {
			for (const area of page.areas) {
				const areaName = area.name || `Area`;
				const areaKey = normalizeToKebabCase(areaName);
				if (seenKeys.has(areaKey)) continue; // Deduplicate (same area on multiple pages)
				seenKeys.add(areaKey);

				const elements = this.#getAreaElements(area);
				const ar = this._sourceConfig?.areaRules?.[areaKey];
				const hasRules = !!ar && ((ar.groups?.length ?? 0) > 0 || (ar.rules?.length ?? 0) > 0);
				result.push({ areaKey, areaName, elements, hasRules });
			}
		}
		return result;
	}

	#onSectionPickerToggle(event: ToggleEvent) {
		this._sectionPickerOpen = event.newState === 'open';
	}

	/** Saves area rules for a specific area key and re-triggers transform. */
	async #saveAreaRulesForKey(areaKey: string, rules: AreaRules) {
		if (!this._workflowAlias) return;

		const allRules: Record<string, AreaRules> = {
			...(this._sourceConfig?.areaRules ?? {}),
		};

		const hasAnyRules = rules.groups.length > 0 || rules.rules.length > 0;
		if (hasAnyRules) {
			allRules[areaKey] = rules;
		} else {
			delete allRules[areaKey];
		}

		const saved = await saveAreaRules(this._workflowAlias, allRules, this.#token);
		if (saved && this._sourceConfig) {
			this._sourceConfig = { ...this._sourceConfig, areaRules: saved };
		}

		// Re-trigger transform so the Extracted view reflects composed sections
		const mediaKey = this._extraction?.source.mediaKey;
		if (mediaKey) {
			const updatedTransform = await triggerTransform(this._workflowAlias, mediaKey, this.#token);
			if (updatedTransform) {
				this._transformResult = updatedTransform;
			}
		}
	}

	/** Opens the rules editor modal for a specific area. */
	async #onEditAreaRules(areaKey: string, areaName: string, elements: AreaElement[], sectionCount?: number) {
		if (!this._workflowAlias) return;

		const existingRules = this._sourceConfig?.areaRules?.[areaKey] ?? null;

		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		const modal = modalManager.open(this, UMB_SECTION_RULES_EDITOR_MODAL, {
			data: {
				workflowAlias: this._workflowAlias,
				sectionId: areaKey,
				sectionHeading: areaName,
				elements,
				existingRules,
				sectionCount,
				sourceType: this.#sourceType,
				onSave: async (rules: AreaRules) => {
					await this.#saveAreaRulesForKey(areaKey, rules);
				},
			},
		});

		try {
			const result = await modal.onSubmit();
			if (result?.rules) {
				await this.#saveAreaRulesForKey(areaKey, result.rules);
			}
		} catch {
			// Modal cancelled
		}
	}

	/** Opens the page picker modal with PDF thumbnails. */
	async #onOpenPagePicker() {
		const mediaKey = this._extraction?.source.mediaKey;
		if (!mediaKey) return;

		const totalPages = this._areaDetection?.totalPages ?? this._extraction?.source.totalPages ?? 0;
		if (totalPages === 0) return;

		const selectedPages = this.#getSelectedPages();

		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		const modal = modalManager.open(this, UMB_PAGE_PICKER_MODAL, {
			data: { mediaKey, totalPages, selectedPages },
		});

		const result = await modal.onSubmit().catch(() => null);
		if (result === null) return; // cancelled

		// Update local state from the modal result
		if (result.selectedPages === null) {
			this._pageMode = 'all';
			this._pageInputValue = '';
		} else {
			this._pageMode = 'custom';
			this._pageInputValue = this.#pagesToRangeString(result.selectedPages);
		}
		await this.#savePageSelection();
	}

	/** Re-extract using the previously stored source (media key for PDF, URL for web). */
	async #onReExtract() {
		// Web sources use URL, not media key
		if (this.#sourceType === 'web') {
			const url = this._extraction?.source.fileName;
			if (url) {
				return this.#runUrlExtraction(url);
			}
			return; // No URL to re-extract from
		}

		const mediaKey = this._extraction?.source.mediaKey;
		if (!mediaKey) {
			// No prior extraction — fall back to media picker
			return this.#onPickMedia();
		}
		await this.#runExtraction(mediaKey);
	}

	async #runExtraction(mediaKey: string) {
		if (!this._workflowAlias) return;

		this._extracting = true;
		this._error = null;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();

			const isPdf = this.#sourceType === 'pdf';

			if (isPdf) {
				// PDF: trigger sample extraction and transform (which includes area detection) in parallel
				const [extraction, transformResult] = await Promise.all([
					triggerSampleExtraction(this._workflowAlias, mediaKey, token),
					triggerTransform(this._workflowAlias, mediaKey, token),
				]);

				if (extraction) {
					this._extraction = extraction;
				}
				if (transformResult) {
					this._transformResult = transformResult;
					// Transform endpoint also saved area detection — fetch it
					const areaDetection = await fetchAreaDetection(this._workflowAlias, token);
					this._areaDetection = areaDetection;
					const d = transformResult.diagnostics;
					const rolePart = d.roleSections > 0 ? `, ${d.roleSections} role` : '';
					this._successMessage = `Content extracted — ${d.totalSections} sections (${d.bulletListSections} bullet, ${d.paragraphSections} paragraph, ${d.subHeadedSections} sub-headed${rolePart})`;
					setTimeout(() => { this._successMessage = null; }, 5000);
				} else if (extraction) {
					this._successMessage = `Content extracted — ${extraction.elements.length} elements (transform unavailable)`;
					setTimeout(() => { this._successMessage = null; }, 5000);
				} else {
					this._error = 'Extraction failed. Check that the selected media item is a PDF.';
				}
			} else {
				// Non-PDF (markdown, web, etc.): trigger sample extraction, then fetch auto-generated transform
				const extraction = await triggerSampleExtraction(this._workflowAlias, mediaKey, token);

				if (extraction) {
					this._extraction = extraction;
					// Backend auto-generated transform.json — fetch it
					const transformResult = await fetchTransformResult(this._workflowAlias!, token);
					this._transformResult = transformResult;
					this._successMessage = `Content extracted — ${extraction.elements.length} elements`;
					setTimeout(() => { this._successMessage = null; }, 5000);
				} else {
					this._error = `Extraction failed. Check that the selected media item is a valid ${this.#sourceType} file.`;
				}
			}
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Extraction failed';
			console.error('Extraction failed:', err);
		} finally {
			this._extracting = false;
		}
	}

	#isCollapsed(key: string): boolean {
		return this._collapsed.has(key);
	}

	#toggleCollapse(key: string) {
		const next = new Set(this._collapsed);
		if (next.has(key)) {
			next.delete(key);
		} else {
			next.add(key);
		}
		this._collapsed = next;
	}

	#isSectionIncluded(sectionId: string): boolean {
		if (!this._transformResult) return true;
		const section = allTransformSections(this._transformResult).find((s) => s.id === sectionId);
		return section?.included ?? true;
	}

	async #onToggleInclusion(sectionId: string, included: boolean) {
		if (!this._workflowAlias) return;
		const result = await updateSectionInclusion(this._workflowAlias, sectionId, included, this.#token);
		if (result) {
			this._transformResult = result;
		}
	}

	#getMappedTargets(elementId: string): MappingDestination[] {
		if (!this._config?.map?.mappings) return [];
		const targets: MappingDestination[] = [];
		for (const mapping of this._config.map.mappings) {
			if (mapping.source === elementId && mapping.enabled) {
				for (const dest of mapping.destinations) {
					targets.push(dest);
				}
			}
		}
		return targets;
	}

	#resolveTargetLabel(dest: MappingDestination): string {
		if (!this._config?.destination) return dest.target;

		if (dest.blockKey) {
			for (const container of getAllBlockContainers(this._config.destination)) {
				const block = container.blocks.find((b) => b.key === dest.blockKey);
				if (block) {
					const prop = block.properties?.find((p) => p.alias === dest.target);
					return `${block.label} > ${prop?.label || dest.target}`;
				}
			}
		}

		const field = this._config.destination.fields.find((f) => f.alias === dest.target);
		if (field) return field.label;

		for (const container of getAllBlockContainers(this._config.destination)) {
			for (const block of container.blocks) {
				const prop = block.properties?.find((p) => p.alias === dest.target);
				if (prop) return `${block.label} > ${prop.label || prop.alias}`;
			}
		}

		return dest.target;
	}

	// --- Teach-by-example helpers ---

	/** Compute a flat global area index from page number and local area index. */
	#getGlobalAreaIndex(pageNum: number, localAreaIndex: number): number {
		if (!this._areaDetection) return localAreaIndex;
		let globalIdx = 0;
		for (const page of this._areaDetection.pages) {
			if (page.page === pageNum) return globalIdx + localAreaIndex;
			globalIdx += page.areas.length;
		}
		return globalIdx + localAreaIndex;
	}

	/** Get all elements from an area, flattened from sections. */
	#getAreaElements(area: DetectedArea): AreaElement[] {
		const elements: AreaElement[] = [];
		for (const section of area.sections) {
			if (section.heading) elements.push(section.heading);
			elements.push(...section.children);
		}
		return elements;
	}

	/** Enter teach mode for a specific area. */
	#onDefineStructure(globalAreaIdx: number, areaKey: string) {
		this._teachingAreaIndex = globalAreaIdx;
		this._inferenceResult = null;
		this._inferring = false;
		// Ensure the area is expanded
		if (this._collapsed.has(areaKey)) {
			const next = new Set(this._collapsed);
			next.delete(areaKey);
			this._collapsed = next;
		}
	}

	/** User clicked an element in teach mode. Call the inference API. */
	async #onTeachElementClick(elementId: string) {
		if (this._teachingAreaIndex === null || !this._workflowAlias || this._inferring) return;

		this._inferring = true;
		this._inferenceResult = null;

		try {
			const result = await inferSectionPattern(
				this._workflowAlias,
				this._teachingAreaIndex,
				elementId,
				this.#token,
			);
			this._inferenceResult = result;
		} catch (err) {
			console.error('Inference failed:', err);
			this._error = 'Failed to infer section pattern';
		} finally {
			this._inferring = false;
		}
	}

	/** Confirm the inferred pattern — save to area template and re-extract. */
	async #onConfirmPattern() {
		if (this._teachingAreaIndex === null || !this._inferenceResult || !this._workflowAlias || !this._areaTemplate) return;

		const idx = this._teachingAreaIndex;
		if (idx < 0 || idx >= this._areaTemplate.areas.length) return;

		// Update the area template with the new section pattern
		const updatedAreas = [...this._areaTemplate.areas];
		updatedAreas[idx] = { ...updatedAreas[idx], sectionPattern: this._inferenceResult.pattern };
		const updatedTemplate: AreaTemplate = { ...this._areaTemplate, areas: updatedAreas };

		const saved = await saveAreaTemplate(this._workflowAlias, updatedTemplate, this.#token);
		if (saved) {
			this._areaTemplate = saved;
			// Exit teach mode
			this._teachingAreaIndex = null;
			this._inferenceResult = null;
			// Re-extract with the updated area template
			await this.#onReExtract();
		}
	}

	/** Save empty conditions (no section headings) for the current teach area. */
	async #onNoSections() {
		if (this._teachingAreaIndex === null || !this._workflowAlias || !this._areaTemplate) return;

		const idx = this._teachingAreaIndex;
		if (idx < 0 || idx >= this._areaTemplate.areas.length) return;

		// Save empty conditions = one flat section
		const updatedAreas = [...this._areaTemplate.areas];
		updatedAreas[idx] = { ...updatedAreas[idx], sectionPattern: { conditions: [] } };
		const updatedTemplate: AreaTemplate = { ...this._areaTemplate, areas: updatedAreas };

		const saved = await saveAreaTemplate(this._workflowAlias, updatedTemplate, this.#token);
		if (saved) {
			this._areaTemplate = saved;
			this._teachingAreaIndex = null;
			this._inferenceResult = null;
			await this.#onReExtract();
		}
	}

	/** Cancel teach mode without saving. */
	#onCancelTeach() {
		this._teachingAreaIndex = null;
		this._inferenceResult = null;
		this._inferring = false;
	}

	// --- Composed section helpers (Phase 1b) ---

	/** Check if an area has rules defined in source config. */
	#getAreaRulesKey(area: DetectedArea): string {
		return normalizeToKebabCase(area.name || '');
	}

	#hasAreaRules(area: DetectedArea): boolean {
		const key = this.#getAreaRulesKey(area);
		const areaRules = this._sourceConfig?.areaRules?.[key];
		if (!areaRules) return false;
		return (areaRules.groups?.length ?? 0) > 0 || (areaRules.rules?.length ?? 0) > 0;
	}

	/** Get transform sections that belong to a specific area (matched by color + page). */
	#getTransformSectionsForArea(area: DetectedArea, pageNum: number): TransformedSection[] {
		if (!this._transformResult) return [];
		// Find matching area in the hierarchical tree
		const matchingArea = this._transformResult.areas.find(
			(a) => a.color === area.color && a.page === pageNum,
		);
		if (!matchingArea) return [];
		// Return all sections (grouped + ungrouped) from this area
		const sections: TransformedSection[] = [];
		for (const group of matchingArea.groups) {
			sections.push(...group.sections);
		}
		sections.push(...matchingArea.sections);
		return sections;
	}

	async #onMapSection(section: TransformedSection, partSuffix: string = 'content') {
		if (!this._workflowAlias || !this._config?.destination) return;

		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		const modal = modalManager.open(this, UMB_DESTINATION_PICKER_MODAL, {
			data: {
				destination: this._config.destination,
				existingMappings: this._config.map?.mappings ?? [],
			},
		});

		let result;
		try {
			result = await modal.onSubmit();
		} catch {
			return; // cancelled
		}

		if (!result?.selectedTargets?.length) return;

		const sourceKey = `${section.id}.${partSuffix}`;
		const existingMappings = this._config.map?.mappings ?? [];

		const newMapping: SectionMapping = {
			source: sourceKey,
			destinations: result.selectedTargets.map((t) => ({ target: t.target, blockKey: t.blockKey, contentTypeKey: t.contentTypeKey })),
			enabled: true,
		};

		const existingIndex = existingMappings.findIndex((m) => m.source === sourceKey);
		const updatedMappings = existingIndex >= 0
			? existingMappings.map((m, i) => i === existingIndex ? newMapping : m)
			: [...existingMappings, newMapping];

		const updatedMap: MapConfig = {
			...(this._config.map ?? { version: '1.0', mappings: [] }),
			mappings: updatedMappings,
		};

		const saved = await saveMapConfig(this._workflowAlias, updatedMap, this.#token);
		if (saved) {
			this._config = { ...this._config, map: saved };
		}
	}

	/** Remove a specific mapping destination from a source key. */
	async #onUnmap(sourceKey: string, dest: MappingDestination) {
		if (!this._workflowAlias || !this._config?.map) return;

		const existingMappings = this._config.map.mappings;
		const mappingIndex = existingMappings.findIndex((m) => m.source === sourceKey);
		if (mappingIndex < 0) return;

		const mapping = existingMappings[mappingIndex];
		const remainingDests = mapping.destinations.filter(
			(d) => !(d.target === dest.target && d.blockKey === dest.blockKey),
		);

		let updatedMappings: SectionMapping[];
		if (remainingDests.length === 0) {
			// No destinations left — remove the entire mapping
			updatedMappings = existingMappings.filter((_, i) => i !== mappingIndex);
		} else {
			updatedMappings = existingMappings.map((m, i) =>
				i === mappingIndex ? { ...m, destinations: remainingDests } : m,
			);
		}

		const updatedMap: MapConfig = { ...this._config.map, mappings: updatedMappings };
		const saved = await saveMapConfig(this._workflowAlias, updatedMap, this.#token);
		if (saved) {
			this._config = { ...this._config, map: saved };
		}
	}

	#renderComposedSectionRow(section: TransformedSection) {
		// Check all possible source key suffixes for mapping status
		const suffixes = ['content', 'heading', 'title', 'description', 'summary'];
		const hasMappings = suffixes.some((s) => this.#getMappedTargets(`${section.id}.${s}`).length > 0);

		const collapseKey = `composed-${section.id}`;
		const isCollapsed = this.#isCollapsed(collapseKey);
		const sectionLabel = section.groupName ?? section.ruleName ?? (section.areaName ? `${section.areaName} - Section` : 'Section');

		const isGrouped = !!section.groupName;

		return html`
			<div class="section-box">
				<div class="section-box-header" @click=${() => this.#toggleCollapse(collapseKey)}>
					<uui-icon class="collapse-chevron" name="${isCollapsed ? 'icon-navigation-right' : 'icon-navigation-down'}"></uui-icon>
					<uui-icon class="level-icon" name="icon-thumbnail-list"></uui-icon>
					<span class="section-box-label">${sectionLabel}</span>
					<span class="header-spacer"></span>
					${hasMappings && isCollapsed
						? suffixes.map((s) => this.#renderPartBadges(`${section.id}.${s}`))
						: nothing}
				</div>
				${!isCollapsed ? html`
					<div class="section-box-content">
						${isGrouped ? html`
							${section.heading ? html`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Title</span>
										<div class="part-box-content">${unsafeHTML(markdownToHtml(section.heading))}</div>
										<div class="part-box-actions">
											${this.#renderPartBadges(`${section.id}.title`)}
											${this.#renderPartBadges(`${section.id}.heading`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(e: Event) => { e.stopPropagation(); this.#onMapSection(section, 'title'); }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : nothing}
							${section.content ? html`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Content</span>
										<div class="part-box-content">${unsafeHTML(markdownToHtml(section.content))}</div>
										<div class="part-box-actions">
											${this.#renderPartBadges(`${section.id}.content`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(e: Event) => { e.stopPropagation(); this.#onMapSection(section, 'content'); }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : nothing}
							${section.description ? html`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Description</span>
										<div class="part-box-content">${unsafeHTML(markdownToHtml(section.description))}</div>
										<div class="part-box-actions">
											${this.#renderPartBadges(`${section.id}.description`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(e: Event) => { e.stopPropagation(); this.#onMapSection(section, 'description'); }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : nothing}
							${section.summary ? html`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Summary</span>
										<div class="part-box-content">${unsafeHTML(markdownToHtml(section.summary))}</div>
										<div class="part-box-actions">
											${this.#renderPartBadges(`${section.id}.summary`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(e: Event) => { e.stopPropagation(); this.#onMapSection(section, 'summary'); }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : nothing}
						` : html`
							${section.content ? html`
								<div class="part-box-row">
									<div class="part-box-content">${unsafeHTML(markdownToHtml(section.content))}</div>
									<div class="part-box-actions">
										${suffixes.map((s) => this.#renderPartBadges(`${section.id}.${s}`))}
										<uui-button class="md-map-btn" look="outline" compact label="Map"
											@click=${(e: Event) => { e.stopPropagation(); this.#onMapSection(section, 'content'); }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
									</div>
								</div>
							` : nothing}
						`}
					</div>
				` : nothing}
			</div>
		`;
	}

	// --- Area-based rendering ---

	#classifyText(text: string): 'list' | 'paragraph' {
		const trimmed = text.trimStart();
		if (/^[•\-\*▪▸▶►●○◦‣⁃]/.test(trimmed)) return 'list';
		if (/^\d+[\.\)]\s/.test(trimmed)) return 'list';
		return 'paragraph';
	}

	#renderAreaElement(element: AreaElement, role?: 'heading') {
		const textType = role === 'heading' ? 'heading' : this.#classifyText(element.text);
		const badgeLabel = textType === 'heading' ? 'Heading' : textType === 'list' ? 'List Item' : 'Paragraph';
		// For web sources: show htmlTag instead of fontName, and add container badge
		const tagLabel = element.htmlTag || element.fontName;
		const containerLabel = element.htmlContainerPath
			? element.htmlContainerPath.split('/').pop() ?? ''
			: '';
		return html`
			<div class="element-item">
				<div class="element-content">
					<div class="element-text">${element.text}</div>
					<div class="element-meta">
						<span class="meta-badge text-type ${textType}">${badgeLabel}</span>
						<span class="meta-badge font-size">${element.fontSize}pt</span>
						<span class="meta-badge font-name">${tagLabel}</span>
						<span class="meta-badge color" style="border-left: 3px solid ${element.color};">${element.color}</span>
						${containerLabel ? html`<span class="meta-badge container-path" title="${element.htmlContainerPath ?? ''}">${containerLabel}</span>` : nothing}
						${element.text === element.text.toUpperCase() && element.text !== element.text.toLowerCase() ? html`<span class="meta-badge text-case">UPPERCASE</span>` : nothing}
					</div>
				</div>
			</div>
		`;
	}

	#renderSection(section: DetectedSection, sectionKey: string, pageNum: number, areaIndex: number) {
		const isCollapsed = this.#isCollapsed(sectionKey);

		// Compute the section ID matching transform.json
		const sectionId = section.heading
			? normalizeToKebabCase(section.heading.text)
			: `preamble-p${pageNum}-a${areaIndex}`;
		const isIncluded = this.#isSectionIncluded(sectionId);

		if (!section.heading) {
			// No-heading section — render with toggle
			return html`
				<div class="area-section ${!isIncluded ? 'excluded' : ''}">
					<div class="section-heading preamble" @click=${() => this.#toggleCollapse(sectionKey)}>
						<uui-icon class="collapse-chevron" name="${isCollapsed ? 'icon-navigation-right' : 'icon-navigation-down'}"></uui-icon>
						<span class="heading-text preamble-label">Content</span>
						<span class="group-count">${section.children.length} element${section.children.length !== 1 ? 's' : ''}</span>
						<uui-toggle
							label="${isIncluded ? 'Included' : 'Excluded'}"
							?checked=${isIncluded}
							@click=${(e: Event) => e.stopPropagation()}
							@change=${(e: Event) => this.#onToggleInclusion(sectionId, (e.target as any).checked)}>
						</uui-toggle>
					</div>
					${isIncluded && !isCollapsed ? html`
						${section.children.map((el) => this.#renderAreaElement(el))}
					` : nothing}
				</div>
			`;
		}

		const heading = section.heading;
		const elementCount = section.children.length;
		const hasChildren = elementCount > 0;

		return html`
			<div class="area-section ${!isIncluded ? 'excluded' : ''}">
				<div class="section-heading" @click=${hasChildren ? () => this.#toggleCollapse(sectionKey) : nothing}>
					${hasChildren
						? html`<uui-icon class="collapse-chevron" name="${isCollapsed ? 'icon-navigation-right' : 'icon-navigation-down'}"></uui-icon>`
						: html`<uui-icon class="collapse-chevron placeholder"></uui-icon>`}
					<uui-icon class="level-icon" name="icon-thumbnail-list"></uui-icon>
					<span class="heading-text" title="${heading.text}">${heading.text}</span>
					${hasChildren ? html`<span class="group-count">${elementCount} element${elementCount !== 1 ? 's' : ''}</span>` : nothing}
					<uui-toggle
						label="${isIncluded ? 'Included' : 'Excluded'}"
						?checked=${isIncluded}
						@click=${(e: Event) => e.stopPropagation()}
						@change=${(e: Event) => this.#onToggleInclusion(sectionId, (e.target as any).checked)}>
					</uui-toggle>
				</div>
				${hasChildren && !isCollapsed && isIncluded ? html`
					<div class="section-children">
						${section.children.map((el) => this.#renderAreaElement(el))}
					</div>
				` : nothing}
			</div>
		`;
	}

	#renderTeachElement(element: AreaElement) {
		const isClicked = this._inferenceResult?.clickedElementId === element.id;
		const isMatching = this._inferenceResult?.matchingElementIds?.includes(element.id) ?? false;
		const textType = this.#classifyText(element.text);
		const badgeLabel = textType === 'list' ? 'List Item' : 'Paragraph';
		const tagLabel = element.htmlTag || element.fontName;
		const containerLabel = element.htmlContainerPath
			? element.htmlContainerPath.split('/').pop() ?? ''
			: '';
		return html`
			<div class="element-item teach-element ${isClicked ? 'teach-clicked' : ''} ${isMatching ? 'teach-matched' : ''}"
				@click=${() => this.#onTeachElementClick(element.id)}>
				<div class="element-content">
					<div class="element-text">${element.text}</div>
					<div class="element-meta">
						<span class="meta-badge text-type ${textType}">${badgeLabel}</span>
						<span class="meta-badge font-size">${element.fontSize}pt</span>
						<span class="meta-badge font-name">${tagLabel}</span>
						<span class="meta-badge color" style="border-left: 3px solid ${element.color};">${element.color}</span>
						${containerLabel ? html`<span class="meta-badge container-path" title="${element.htmlContainerPath ?? ''}">${containerLabel}</span>` : nothing}
						${element.text === element.text.toUpperCase() && element.text !== element.text.toLowerCase() ? html`<span class="meta-badge text-case">UPPERCASE</span>` : nothing}
					</div>
				</div>
			</div>
		`;
	}

	#renderTeachToolbar() {
		if (this._inferenceResult) {
			const matchCount = this._inferenceResult.matchingElementIds.length;
			const conditionSummary = this._inferenceResult.pattern.conditions
				.map((c) => `${c.type}: ${c.value}`)
				.join(', ');
			return html`
				<div class="teach-confirmation">
					<div class="teach-confirmation-info">
						<uui-icon name="icon-check" style="color: var(--uui-color-positive);"></uui-icon>
						<span>Found <strong>${matchCount}</strong> matching element${matchCount !== 1 ? 's' : ''}</span>
						<span class="teach-condition-summary">${conditionSummary}</span>
					</div>
					<div class="teach-confirmation-actions">
						<uui-button look="primary" color="default" label="Confirm" @click=${() => this.#onConfirmPattern()}>
							<uui-icon name="icon-check"></uui-icon> Confirm
						</uui-button>
						<uui-button look="secondary" label="Cancel" @click=${() => this.#onCancelTeach()}>Cancel</uui-button>
					</div>
				</div>
			`;
		}

		return html`
			<div class="teach-toolbar">
				<span class="teach-instruction">
					${this._inferring
						? html`<uui-loader-bar></uui-loader-bar> Analysing...`
						: html`Click a section heading, or <strong>No Sections</strong> if this area has no repeating structure`}
				</span>
				<div class="teach-toolbar-actions">
					<uui-button look="secondary" compact label="No Sections" @click=${() => this.#onNoSections()}
						title="This area has no repeating section structure">
						No Sections
					</uui-button>
					<uui-button look="default" compact label="Cancel" @click=${() => this.#onCancelTeach()}>Cancel</uui-button>
				</div>
			</div>
		`;
	}

	#renderArea(area: DetectedArea, pageNum: number, areaIndex: number) {
		const areaKey = `area-p${pageNum}-a${areaIndex}`;
		const globalIdx = this.#getGlobalAreaIndex(pageNum, areaIndex);
		const isTeaching = this._teachingAreaIndex === globalIdx;
		const isCollapsed = isTeaching ? false : this.#isCollapsed(areaKey);
		const rulesAreaKey = this.#getAreaRulesKey(area);

		// Check if area has rules defined (from section rules editor)
		const hasRules = this.#hasAreaRules(area);

		// When rules exist and transform is available, use composed sections from transform
		const composedSections = hasRules && this._transformResult
			? this.#getTransformSectionsForArea(area, pageNum)
			: [];
		const useComposed = hasRules && composedSections.length > 0;

		const sectionCount = useComposed ? composedSections.length : area.sections.length;

		// Check if area has a configured section pattern
		const hasPattern = area.sectionPattern != null;
		const patternLabel = hasPattern
			? (area.sectionPattern!.conditions.length > 0 ? 'Configured' : 'Flat')
			: null;

		const areaRulesObj = this._sourceConfig?.areaRules?.[rulesAreaKey];
		const ruleCount = (areaRulesObj?.rules?.length ?? 0) + (areaRulesObj?.groups?.reduce((sum, g) => sum + g.rules.length, 0) ?? 0);

		return html`
			<div class="detected-area ${isTeaching ? 'area-teaching' : ''}" style="border-left-color: ${area.color};">
				<div class="area-header" @click=${() => !isTeaching && this.#toggleCollapse(areaKey)}>
					<uui-icon class="collapse-chevron" name="${isCollapsed ? 'icon-navigation-right' : 'icon-navigation-down'}"></uui-icon>
					<uui-icon class="level-icon" name="icon-grid"></uui-icon>
					<span class="area-name">${area.name || `${areaIndex + 1}`}</span>
					${hasRules ? html`<span class="meta-badge rules-info">${ruleCount} rule${ruleCount !== 1 ? 's' : ''}</span>` : nothing}
					${!hasRules && patternLabel ? html`<span class="meta-badge structure-badge">${patternLabel}</span>` : nothing}
					<span class="header-spacer"></span>
					${!isTeaching ? html`
						<uui-button
							look="primary"
							color="default"
							label="Sections"
							@click=${(e: Event) => { e.stopPropagation(); this.#onEditAreaRules(rulesAreaKey, area.name || '', this.#getAreaElements(area), sectionCount); }}
							?disabled=${this._teachingAreaIndex !== null}>
							<uui-icon name="icon-thumbnail-list"></uui-icon>
							Sections
							<uui-badge color="danger" look="primary">${sectionCount}</uui-badge>
						</uui-button>
					` : nothing}
				</div>
				${!isCollapsed ? html`
					${isTeaching ? html`
						${this.#renderTeachToolbar()}
						<div class="teach-elements">
							${this.#getAreaElements(area).map((el) => this.#renderTeachElement(el))}
						</div>
					` : useComposed ? html`
						<div class="composed-sections">
							${composedSections.map((section) => this.#renderComposedSectionRow(section))}
						</div>
					` : html`
						${area.sections.map((section, sIdx) =>
							this.#renderSection(section, `p${pageNum}-a${areaIndex}-s${sIdx}`, pageNum, areaIndex)
						)}
					`}
				` : nothing}
			</div>
		`;
	}

	#renderAreaPage(pageNum: number, areas: DetectedArea[]) {
		// Filter out excluded areas — exclusion is managed via the area picker modal
		const includedAreas = areas.filter((area) => {
			const rulesKey = this.#getAreaRulesKey(area);
			return !this._excludedAreas.has(rulesKey);
		});
		if (includedAreas.length === 0) return nothing;

		const pageKey = `page-${pageNum}`;
		const isCollapsed = this.#isCollapsed(pageKey);
		const areaCount = includedAreas.length;
		const sectionCount = includedAreas.reduce((sum, a) => sum + a.sections.length, 0);
		const isIncluded = this.#isPageIncluded(pageNum);
		return html`
			<uui-box class="page-box ${!isIncluded ? 'page-excluded' : ''}">
				<div slot="header" class="tree-header" @click=${() => this.#toggleCollapse(pageKey)}>
					<uui-icon class="collapse-chevron" name="${isCollapsed ? 'icon-navigation-right' : 'icon-navigation-down'}"></uui-icon>
					<uui-icon class="level-icon" name="icon-document"></uui-icon>
					<strong class="page-title">Page ${pageNum}</strong>
				</div>
				<div slot="header-actions" class="page-header-actions">
					<span class="group-count">${sectionCount} section${sectionCount !== 1 ? 's' : ''}, ${areaCount} area${areaCount !== 1 ? 's' : ''}</span>
				</div>
				${!isCollapsed ? html`
					${includedAreas.map((area, idx) => this.#renderArea(area, pageNum, idx))}
				` : nothing}
			</uui-box>
		`;
	}

	#renderAreaDetection() {
		if (!this._areaDetection) return nothing;

		return html`
			${this._areaDetection.pages.map((page) =>
				this.#renderAreaPage(page.page, page.areas)
			)}
		`;
	}

	#computeSectionCount(): number {
		if (!this._areaDetection) return 0;
		return this._areaDetection.pages.reduce((sum, page) =>
			sum + page.areas
				.filter((area) => !this._excludedAreas.has(this.#getAreaRulesKey(area)))
				.reduce((aSum, area) => aSum + area.sections.length, 0), 0);
	}


	#renderExtractionHeader() {
		return html`
			<div slot="header" class="source-header">
				<uui-tab-group dropdown-content-direction="vertical">
					<uui-tab label="Extracted" ?active=${this._viewMode === 'elements'} @click=${() => { this._viewMode = 'elements'; }}>Extracted</uui-tab>
					<uui-tab label="Transformed" ?active=${this._viewMode === 'transformed'} @click=${() => { this._viewMode = 'transformed'; }} ?disabled=${!this._transformResult}>Transformed</uui-tab>
				</uui-tab-group>
			</div>
		`;
	}

	#renderInfoBoxes() {
		const hasAreas = this._areaDetection !== null;
		const hasExtraction = this._extraction !== null;

		if (!hasAreas && !hasExtraction) return nothing;

		const totalPages = this._areaDetection?.totalPages ?? (hasExtraction ? this._extraction!.source.totalPages : 0);
		const savedPages = this._sourceConfig?.pages;
		const hasSavedPageSelection = Array.isArray(savedPages) && savedPages.length > 0;
		const selectedCount = hasSavedPageSelection ? savedPages.length : totalPages;
		const pagesLabel = hasSavedPageSelection && totalPages > 0
			? `${selectedCount} of ${totalPages}`
			: `${totalPages}`;
		const areas = hasAreas
			? this._areaDetection!.pages.reduce((sum, page) =>
				sum + page.areas.filter((a) => !this._excludedAreas.has(this.#getAreaRulesKey(a))).length, 0)
			: 0;
		const sections = hasAreas ? this.#computeSectionCount() : 0;
		const fileName = hasExtraction ? this._extraction!.source.fileName : '';
		const extractedDate = hasExtraction
			? new Date(this._extraction!.source.extractedDate).toLocaleString()
			: '';

		return html`
			<div class="info-boxes">
				<uui-box class="info-box-item">
					<div slot="headline" class="box-headline-row">
						<span>Source</span>
						<span class="box-headline-meta">${extractedDate}</span>
					</div>
					<div class="box-content">
						<uui-icon name="icon-page-add" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${fileName}">${fileName}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Source" @click=${this.#onPickMedia} ?disabled=${this._extracting}>
								<uui-icon name="icon-page-add"></uui-icon>
								Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Pages" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-document" class="box-icon"></uui-icon>
						<span class="box-stat">${pagesLabel}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Pages" @click=${this.#onOpenPagePicker}>
								<uui-icon name="icon-document"></uui-icon>
								Pages
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${this._areaTemplate ? this._areaTemplate.areas.length : areas}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Areas" @click=${this.#onEditAreas}>
								<uui-icon name="icon-grid"></uui-icon>
								Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${sections}</span>
						${this._transformResult && this._areaDetection ? html`
							<div class="box-buttons">
								<uui-button
									look="primary"
									color="default"
									label="Sections"
									popovertarget="section-picker-popover">
									<uui-icon name="icon-thumbnail-list"></uui-icon>
									Sections
									<uui-symbol-expand .open=${this._sectionPickerOpen}></uui-symbol-expand>
								</uui-button>
								<uui-popover-container
									id="section-picker-popover"
									placement="bottom-end"
									@toggle=${this.#onSectionPickerToggle}>
									<umb-popover-layout>
										<div class="popover-heading">Areas</div>
										${this.#getAreasForRulesEditor().map((a) => html`
											<uui-menu-item
												label="${a.areaName}"
												@click=${() => this.#onEditAreaRules(a.areaKey, a.areaName, a.elements)}>
												<uui-icon slot="icon" name="${a.hasRules ? 'icon-check' : 'icon-thumbnail-list'}"></uui-icon>
												<span slot="badge" class="section-picker-meta">${a.elements.length} el</span>
											</uui-menu-item>
										`)}
									</umb-popover-layout>
								</uui-popover-container>
							</div>
						` : nothing}
					</div>
				</uui-box>
			</div>

			${hasAreas ? html`
				<div class="collapse-row">
					<uui-button
						look="outline"
						compact
						label="Collapse"
						popovertarget="collapse-level-popover">
						Collapse
						<uui-symbol-expand .open=${this._collapsePopoverOpen}></uui-symbol-expand>
					</uui-button>
					<uui-popover-container
						id="collapse-level-popover"
						placement="bottom-start"
						@toggle=${this.#onCollapsePopoverToggle}>
						<umb-popover-layout>
							<uui-menu-item
								label="Expand All"
								@click=${() => this.#expandAll()}>
								<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${this.#isLevelCollapsed('pages') ? 'Expand' : 'Collapse'} Pages"
								@click=${() => this.#toggleLevel('pages')}>
								<uui-icon slot="icon" name="icon-document"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${this.#isLevelCollapsed('areas') ? 'Expand' : 'Collapse'} Areas"
								@click=${() => this.#toggleLevel('areas')}>
								<uui-icon slot="icon" name="icon-grid"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${this.#isLevelCollapsed('sections') ? 'Expand' : 'Collapse'} Sections"
								@click=${() => this.#toggleLevel('sections')}>
								<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
							</uui-menu-item>
						</umb-popover-layout>
					</uui-popover-container>
				</div>
			` : nothing}
		`;
	}

	#renderExtractionContent() {
		const hasAreas = this._areaDetection !== null;
		return this._viewMode === 'elements'
			? (hasAreas ? this.#renderAreaDetection() : nothing)
			: this.#renderTransformed();
	}

	/** Build concatenated markdown for all included sections.
	 *  Non-role sections include their heading as an h2 (actual content headings from the PDF).
	 *  Role sections (pattern="role") skip the heading (it's a structural rule label). */
	#buildFullMarkdown(): string {
		if (!this._transformResult) return '';

		const includedSections = allTransformSections(this._transformResult).filter((s) => s.included);
		const parts: string[] = [];

		for (const section of includedSections) {
			// Include heading for non-role sections — these are real content headings from the PDF
			if (section.heading && section.pattern !== 'role') {
				parts.push(`## ${section.heading}`);
				parts.push('');
			}
			if (section.content) {
				parts.push(section.content);
			}
			if (section.description) {
				parts.push(section.description);
			}
			if (section.summary) {
				parts.push(section.summary);
			}
			// Blank line between sections
			if (parts.length > 0) parts.push('');
		}

		return parts.join('\n');
	}

	#renderTransformed() {
		if (!this._transformResult) {
			return html`
				<div class="empty-state">
					<uui-icon name="icon-lab" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
					<h3>No transform result</h3>
					<p>Save to extract content and generate the transformed view.</p>
				</div>
			`;
		}

		const fullMarkdown = this.#buildFullMarkdown();
		if (!fullMarkdown.trim()) {
			return html`
				<div class="empty-state">
					<uui-icon name="icon-lab" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
					<h3>No content</h3>
					<p>All sections are excluded. Include at least one section to see the preview.</p>
				</div>
			`;
		}

		const renderedHtml = markdownToHtml(fullMarkdown);
		return html`
			<div class="transformed-preview">
				<div class="md-section-content">${unsafeHTML(renderedHtml)}</div>
			</div>
		`;
	}

	/** Render mapping badges for a given source key, with an "x" to unmap. */
	#renderPartBadges(sourceKey: string) {
		const targets = this.#getMappedTargets(sourceKey);
		if (targets.length === 0) return nothing;
		return targets.map((dest) => {
			const orphaned = dest.blockKey && this.#orphanedKeys.has(`${dest.blockKey}:${dest.target}`);
			const color = orphaned ? 'warning' : 'positive';
			return html`<uui-tag color="${color}" look="primary" class="mapped-tag" title="${this.#resolveTargetLabel(dest)}">
				${this.#resolveTargetLabel(dest)}
				<button class="unmap-x" title="Remove mapping" @click=${(e: Event) => { e.stopPropagation(); this.#onUnmap(sourceKey, dest); }}>&times;</button>
			</uui-tag>`;
		});
	}

	/** Info boxes for markdown sources — Source, Areas, Sections. */
	#renderNonPdfInfoBoxes() {
		if (!this._extraction) return nothing;

		const fileName = this._extraction.source.fileName ?? '';
		const extractedDate = new Date(this._extraction.source.extractedDate).toLocaleString();
		const hasAreas = this._areaDetection !== null;
		const areaCount = hasAreas
			? this._areaDetection!.pages.reduce((sum, page) =>
				sum + page.areas.filter((a) => !this._excludedAreas.has(this.#getAreaRulesKey(a))).length, 0)
			: 0;
		const sectionCount = hasAreas ? this.#computeSectionCount() : 0;

		return html`
			<div class="info-boxes">
				<uui-box class="info-box-item">
					<div slot="headline" class="box-headline-row">
						<span>Source</span>
						<span class="box-headline-meta">${extractedDate}</span>
					</div>
					<div class="box-content">
						<uui-icon name="icon-document" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${fileName}">${fileName}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Source"
								@click=${this.#onPickMedia} ?disabled=${this._extracting}>
								<uui-icon name="icon-document"></uui-icon> Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${areaCount}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Areas" disabled>
								<uui-icon name="icon-grid"></uui-icon> Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${sectionCount}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Sections" disabled>
								<uui-icon name="icon-thumbnail-list"></uui-icon> Sections
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
	}

	/** Routes between Extracted and Transformed views for non-PDF sources (markdown). */
	#renderNonPdfContent() {
		if (this._viewMode === 'transformed') {
			return this.#renderTransformed();
		}
		// Extracted tab: use area hierarchy if available, otherwise flat list
		if (this._areaDetection) {
			return this.#renderAreaDetection();
		}
		return this.#renderSimpleElements();
	}

	/** Info boxes for web sources — Source, Areas, Sections (3 functional boxes). */
	#renderWebInfoBoxes() {
		if (!this._extraction) return nothing;

		const url = this._extraction.source.fileName ?? '';
		const extractedDate = new Date(this._extraction.source.extractedDate).toLocaleString();
		const hasAreas = this._areaDetection !== null;
		const areaCount = hasAreas
			? this._areaDetection!.pages.reduce((sum, page) =>
				sum + page.areas.filter((a) => !this._excludedAreas.has(this.#getAreaRulesKey(a))).length, 0)
			: 0;
		const sectionCount = hasAreas ? this.#computeSectionCount() : 0;

		return html`
			<div class="info-boxes">
				<uui-box class="info-box-item">
					<div slot="headline" class="box-headline-row">
						<span>Source</span>
						<span class="box-headline-meta">${extractedDate}</span>
					</div>
					<div class="box-content">
						<uui-icon name="icon-globe" class="box-icon"></uui-icon>
						<uui-input
							label="URL"
							placeholder="https://example.com/page"
							class="box-url-input"
							.value=${this._sampleUrl || url}
							@input=${(e: Event) => { this._sampleUrl = (e.target as HTMLInputElement).value; }}
							@keydown=${(e: KeyboardEvent) => {
								if (e.key === 'Enter' && this._sampleUrl) this.#runUrlExtraction(this._sampleUrl);
							}}>
						</uui-input>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Source"
								@click=${() => this.#runUrlExtraction(this._sampleUrl || url)}
								?disabled=${this._extracting}>
								<uui-icon name="icon-globe"></uui-icon> Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${areaCount}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Areas" @click=${this.#onOpenAreaPicker}>
								<uui-icon name="icon-grid"></uui-icon> Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${sectionCount}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Sections" disabled>
								<uui-icon name="icon-thumbnail-list"></uui-icon> Sections
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
	}

	/** Routes between Extracted (area hierarchy) and Transformed views for web sources. */
	#renderWebContent() {
		if (this._viewMode === 'transformed') {
			return this.#renderTransformed();
		}
		// Extracted tab: use area hierarchy if available, otherwise flat list
		if (this._areaDetection) {
			return this.#renderAreaDetection();
		}
		return this.#renderSimpleElements();
	}

	/** Simple header for non-PDF sources — just shows file name and a change button. */
	#renderSimpleHeader() {
		if (this.#sourceType === 'web') {
			return this.#renderWebHeader();
		}
		const fileName = this._extraction?.source?.fileName ?? 'Unknown file';
		return html`
			<div class="simple-header">
				<div class="simple-header-info">
					<uui-icon name="icon-document"></uui-icon>
					<strong>${fileName}</strong>
					<span style="color: var(--uui-color-text-alt);">${this._extraction?.elements?.length ?? 0} elements</span>
				</div>
				<uui-button look="secondary" label="Source" @click=${this.#onPickMedia} ?disabled=${this._extracting} compact>
					${this._extracting ? html`<uui-loader-bar></uui-loader-bar>` : 'Source'}
				</uui-button>
			</div>
		`;
	}

	#renderWebHeader() {
		const url = this._extraction?.source?.fileName ?? '';
		return html`
			<div class="simple-header">
				<div class="simple-header-info">
					<uui-icon name="icon-globe"></uui-icon>
					<strong>${url}</strong>
					<span style="color: var(--uui-color-text-alt);">${this._extraction?.elements?.length ?? 0} elements</span>
				</div>
				<uui-button look="secondary" label="Source" @click=${() => this.#runUrlExtraction(url)} ?disabled=${this._extracting} compact>
					${this._extracting ? html`<uui-loader-bar></uui-loader-bar>` : 'Source'}
				</uui-button>
			</div>
		`;
	}

	/** Simple element list for non-PDF sources — headings rendered larger, body as paragraphs. */
	#renderSimpleElements() {
		if (!this._extraction?.elements?.length) {
			return html`<p style="padding: var(--uui-size-layout-1); color: var(--uui-color-text-alt);">No elements extracted.</p>`;
		}

		return html`
			<div class="simple-elements">
				${this._extraction.elements.map((el) => {
					const isHeading = el.metadata?.fontName?.startsWith('heading-')
						|| /^h[1-6]$/.test(el.metadata?.htmlTag ?? '');
					const headingLevel = isHeading
						? (el.metadata?.fontName?.startsWith('heading-')
							? parseInt(el.metadata.fontName.replace('heading-', ''), 10)
							: parseInt((el.metadata?.htmlTag ?? 'h6').substring(1), 10))
						: 0;
					return html`
						<div class="simple-element ${isHeading ? 'simple-element-heading' : ''}">
							<div class="simple-element-text" style="${isHeading ? `font-size: ${24 - (headingLevel - 1) * 2}px; font-weight: bold;` : ''}">
								${el.text}
							</div>
							<div class="simple-element-actions">
								${this.#renderPartBadges(el.id)}
							</div>
						</div>
					`;
				})}
			</div>
		`;
	}

	#renderEmpty() {
		if (this.#sourceType === 'web') {
			return this.#renderWebEmpty();
		}

		const isPdf = this.#sourceType === 'pdf';
		const label = 'Source...';
		const description = isPdf
			? 'Choose a PDF from the media library to extract text elements with their metadata.'
			: `Choose a ${this.#sourceType} file from the media library to extract content.`;

		return html`
			<div class="empty-state">
				<uui-icon name="icon-document" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
				<h3>No sample extraction</h3>
				<p>${description}</p>
				<uui-button look="primary" label="${label}" @click=${this.#onPickMedia} ?disabled=${this._extracting}>
					${this._extracting ? html`<uui-loader-bar></uui-loader-bar>` : label}
				</uui-button>
			</div>
		`;
	}

	#renderWebEmpty() {
		return html`
			<div class="empty-state">
				<uui-icon name="icon-globe" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
				<h3>No sample extraction</h3>
				<p>Enter a web page URL to extract content.</p>
				<div style="display: flex; gap: 8px; align-items: center; width: 100%; max-width: 500px;">
					<uui-input
						label="URL"
						placeholder="https://example.com/page"
						style="flex: 1;"
						.value=${this._sampleUrl}
						@input=${(e: Event) => { this._sampleUrl = (e.target as HTMLInputElement).value; }}
						@keydown=${(e: KeyboardEvent) => {
							if (e.key === 'Enter' && this._sampleUrl) this.#runUrlExtraction(this._sampleUrl);
						}}>
					</uui-input>
					<uui-button
						look="primary"
						label="Extract"
						?disabled=${!this._sampleUrl || this._extracting}
						@click=${() => this.#runUrlExtraction(this._sampleUrl)}>
						${this._extracting ? html`<uui-loader-bar></uui-loader-bar>` : 'Extract'}
					</uui-button>
				</div>
			</div>
		`;
	}

	async #runUrlExtraction(url: string) {
		if (!this._workflowAlias || !url) return;

		this._extracting = true;
		this._error = null;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();

			const extraction = await triggerSampleExtraction(this._workflowAlias, '', token, url);

			if (extraction) {
				this._extraction = extraction;
				// Backend auto-generated area-detection.json and transform.json — fetch both
				const [areaDetection, transformResult] = await Promise.all([
					fetchAreaDetection(this._workflowAlias!, token),
					fetchTransformResult(this._workflowAlias!, token),
				]);
				this._areaDetection = areaDetection;
				this._transformResult = transformResult;

				const areaCount = areaDetection?.diagnostics?.areasDetected ?? 0;
				this._successMessage = `Content extracted — ${extraction.elements.length} elements in ${areaCount} areas`;
				setTimeout(() => { this._successMessage = null; }, 5000);
			} else {
				this._error = 'Extraction failed. Check that the URL is accessible.';
			}
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to extract from URL';
			console.error('URL extraction failed:', err);
		} finally {
			this._extracting = false;
		}
	}

	override render() {
		if (this._loading) {
			return html`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
		}

		if (this._error) {
			return html`
				<umb-body-layout header-fit-height>
					<p style="color: var(--uui-color-danger); padding: var(--uui-size-layout-1);">${this._error}</p>
				</umb-body-layout>`;
		}

		const isPdf = this.#sourceType === 'pdf';
		const isWeb = this.#sourceType === 'web';
		const isMarkdown = this.#sourceType === 'markdown';
		const hasContent = this._areaDetection !== null || this._extraction !== null;

		if (isMarkdown) {
			return html`
				<umb-body-layout header-fit-height>
					${hasContent ? this.#renderExtractionHeader() : nothing}
					${hasContent && this._viewMode === 'elements' ? this.#renderNonPdfInfoBoxes() : nothing}
					${this.#renderCollapseRow()}
					${this._successMessage ? html`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : nothing}
					${hasContent ? this.#renderNonPdfContent() : this.#renderEmpty()}
				</umb-body-layout>
			`;
		}

		if (isWeb) {
			return html`
				<umb-body-layout header-fit-height>
					${hasContent ? this.#renderExtractionHeader() : nothing}
					${hasContent && this._viewMode === 'elements' ? this.#renderWebInfoBoxes() : nothing}
					${this.#renderCollapseRow()}
					${this._successMessage ? html`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : nothing}
					${hasContent ? this.#renderWebContent() : this.#renderEmpty()}
				</umb-body-layout>
			`;
		}

		// PDF: full area detection with page selection, area templates, etc.
		return html`
			<umb-body-layout header-fit-height>
				${hasContent ? this.#renderExtractionHeader() : nothing}
				${hasContent && this._viewMode === 'elements' ? this.#renderInfoBoxes() : nothing}
				${this._successMessage ? html`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : nothing}
				${hasContent ? this.#renderExtractionContent() : this.#renderEmpty()}
			</umb-body-layout>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
				height: 100%;
				overflow-x: hidden;
				--uui-tab-background: var(--uui-color-surface);
			}

			.loading {
				padding: var(--uui-size-layout-1);
			}

			.success-banner {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-2);
				border-radius: var(--uui-border-radius);
				background-color: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
				font-size: var(--uui-type-small-size);
			}

			/* Empty state */
			.empty-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: var(--uui-size-layout-2);
				gap: var(--uui-size-space-3);
				text-align: center;
				min-height: 300px;
			}

			.empty-state h3 {
				margin: 0;
				color: var(--uui-color-text);
			}

			.empty-state p {
				margin: 0;
				color: var(--uui-color-text-alt);
			}

			/* Simple view (non-PDF) */
			.simple-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: var(--uui-size-space-4) var(--uui-size-layout-1);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.simple-header-info {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			.simple-elements {
				padding: var(--uui-size-layout-1);
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-2);
			}

			.simple-element {
				display: flex;
				align-items: flex-start;
				justify-content: space-between;
				gap: var(--uui-size-space-4);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface);
			}

			.simple-element-heading {
				background: var(--uui-color-surface-alt);
			}

			.simple-element-text {
				flex: 1;
				white-space: pre-wrap;
				word-break: break-word;
				max-width: 75ch;
			}

			.simple-element-actions {
				display: flex;
				flex-wrap: wrap;
				gap: var(--uui-size-space-1);
				flex-shrink: 0;
			}

			/* Header: tabs only */
			.source-header {
				display: flex;
				align-items: center;
				width: 100%;
			}

			.source-header uui-tab-group {
				flex: 1;
			}

			/* Info boxes row (uSync-inspired) */
			.info-boxes {
				display: flex;
				gap: var(--uui-size-space-4);
				flex-wrap: wrap;
				padding: var(--uui-size-space-4);
			}

			.info-box-item {
				flex: 1;
			}

			.box-content {
				display: flex;
				flex-direction: column;
				align-items: center;
				text-align: center;
				gap: var(--uui-size-space-2);
				min-height: 180px;
			}

			.box-buttons {
				margin-top: auto;
				padding-top: var(--uui-size-space-2);
			}

			.box-icon {
				font-size: 48px;
				color: var(--uui-color-text-alt);
				margin-top: var(--uui-size-space-3);
			}

			.box-headline-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
			}

			.box-headline-meta {
				font-size: var(--uui-type-small-size);
				font-weight: 400;
				color: var(--uui-color-text-alt);
			}

			.box-filename {
				font-weight: 600;
				font-size: var(--uui-type-default-size) !important;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 100%;
			}

			.box-url-input {
				width: 100%;
				flex: 1;
				display: flex;
				align-items: center;
				font-weight: 600;
				font-size: var(--uui-type-default-size);
				text-align: center;
				--uui-input-border-color: transparent;
				--uui-input-border-color-hover: var(--uui-color-border-emphasis);
				--uui-input-border-color-focus: var(--uui-color-focus);
			}

			.box-buttons {
				display: flex;
				gap: var(--uui-size-space-2);
				margin-top: auto;
				padding-top: var(--uui-size-space-2);
			}

			.box-stat {
				font-size: var(--uui-type-h4-size);
				font-weight: 700;
				color: var(--uui-color-text);
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
			}


			/* Collapse row below boxes */
			.collapse-row {
				display: flex;
				justify-content: flex-end;
				padding: 0 var(--uui-size-space-4) var(--uui-size-space-2);
			}

			/* Page box include toggle */
			.page-header-actions {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			.page-box.page-excluded {
				opacity: 0.4;
			}

			.header-spacer {
				flex: 1;
			}

			/* Page groups */
			.page-box {
				margin: var(--uui-size-space-4);
			}

			/* Tree-style header for page boxes */
			.tree-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				cursor: pointer;
			}

			.tree-header:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.page-title {
				font-size: var(--uui-type-default-size);
			}

			/* Consistent collapse chevron across all levels */
			.collapse-chevron {
				color: var(--uui-color-text-alt);
				flex-shrink: 0;
				font-size: 12px;
			}

			.level-icon {
				color: var(--uui-color-text-alt);
				flex-shrink: 0;
				font-size: 12px;
			}

			/* Detected areas (Level 2) */
			.detected-area {
				border-left: 4px solid var(--uui-color-border);
				margin: var(--uui-size-space-4) 0;
				margin-left: var(--uui-size-space-3);
			}

			.area-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-2) var(--uui-size-space-3);
				cursor: pointer;
			}

			.area-header:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.area-header:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.area-color-swatch {
				display: inline-block;
				width: 12px;
				height: 12px;
				border-radius: 2px;
				border: 1px solid var(--uui-color-border);
			}

			.area-name {
				font-weight: 600;
				color: var(--uui-color-text);
			}

			/* Sections within detected areas (Level 3) */
			.area-section {
				margin-left: var(--uui-size-space-3);
			}

			.area-section + .area-section {
				border-top: 1px solid var(--uui-color-border);
			}

			.section-heading {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				cursor: pointer;
				overflow: hidden;
			}

			.section-heading:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.section-heading:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.heading-text {
				font-weight: 600;
				flex: 1;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.collapse-chevron.placeholder {
				opacity: 0;
				pointer-events: none;
			}

			.group-count {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				white-space: nowrap;
			}

			.section-children {
				padding-left: var(--uui-size-space-5);
				border-left: 2px solid var(--uui-color-border);
				margin-left: var(--uui-size-space-4);
			}

			/* Excluded sections */
			.area-section.excluded {
				opacity: 0.4;
			}

			.preamble-label {
				color: var(--uui-color-text-alt);
				font-style: italic;
			}

			/* Element items */
			.element-item {
				display: flex;
				align-items: flex-start;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.element-item:last-child {
				border-bottom: none;
			}

			.element-content {
				flex: 1;
				min-width: 0;
			}

			.element-text {
				font-size: var(--uui-type-default-size);
				margin-bottom: var(--uui-size-space-2);
				overflow-wrap: break-word;
			}

			.element-meta {
				display: flex;
				flex-wrap: wrap;
				gap: var(--uui-size-space-2);
			}

			.meta-badge {
				font-size: 11px;
				font-family: monospace;
				padding: 1px 6px;
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
			}

			.meta-badge.text-type {
				font-weight: 500;
				text-transform: uppercase;
				font-size: 10px;
				letter-spacing: 0.5px;
			}

			.meta-badge.text-type.heading {
				color: var(--uui-color-current);
			}

			.meta-badge.text-type.list {
				color: var(--uui-color-positive);
			}

			.meta-badge.font-size {
				font-weight: 600;
				color: var(--uui-color-text);
			}

			.meta-badge.container-path {
				color: var(--uui-color-interactive);
				font-style: italic;
				max-width: 200px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				cursor: help;
			}

			.meta-badge.text-case {
				font-weight: 500;
				text-transform: uppercase;
				font-size: 10px;
				letter-spacing: 0.5px;
				color: var(--uui-color-text-alt);
			}

			.mapped-tag {
				font-size: 12px;
			}

			.unmap-x {
				all: unset;
				cursor: pointer;
				font-size: 14px;
				line-height: 1;
				padding: 0 2px;
				margin-left: 4px;
				opacity: 0.7;
				font-weight: 700;
			}

			.unmap-x:hover {
				opacity: 1;
			}

			.diagnostics {
				display: flex;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				justify-content: flex-end;
			}

			/* Transformed sections */
			.transformed-section {
				margin: var(--uui-size-space-4);
			}

			.transformed-section.section-mapped {
				border-left: 3px solid var(--uui-color-positive);
			}

			.section-mapping-actions {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-2) var(--uui-size-space-4);
				border-top: 1px solid var(--uui-color-border);
			}

			.mapping-label {
				font-size: var(--uui-type-small-size);
				font-weight: 600;
				color: var(--uui-color-text-alt);
			}

			.transformed-header-badges {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
			}

			.pattern-badge {
				font-size: 11px;
				padding: 1px 8px;
				border-radius: 10px;
				font-weight: 500;
			}

			.pattern-badge.bulletList {
				background: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
			}

			.pattern-badge.paragraph {
				background: var(--uui-color-warning-emphasis);
				color: var(--uui-color-warning-contrast);
			}

			.pattern-badge.subHeaded {
				background: var(--uui-color-default-emphasis);
				color: var(--uui-color-default-contrast);
			}

			.pattern-badge.preamble {
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
				border: 1px solid var(--uui-color-border);
			}

			.pattern-badge.role {
				background: var(--uui-color-current-emphasis);
				color: var(--uui-color-current-contrast);
			}

			.transformed-content {
				padding: var(--uui-size-space-4);
				font-size: var(--uui-type-small-size);
				line-height: 1.6;
			}

			.transformed-content ul,
			.transformed-content ol {
				padding-left: var(--uui-size-space-5);
				margin: var(--uui-size-space-2) 0;
			}

			.transformed-content p {
				margin: var(--uui-size-space-2) 0;
			}

			.transformed-content h2 {
				font-size: var(--uui-type-default-size);
				margin: var(--uui-size-space-3) 0 var(--uui-size-space-2);
			}

			/* Popover heading bar */
			.popover-heading {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				font-size: var(--uui-type-small-size);
				font-weight: 700;
				color: var(--uui-color-text-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			/* Section picker popover */
			.section-picker-meta {
				font-size: 11px;
				font-family: monospace;
				color: var(--uui-color-text-alt);
			}

			/* Structure badge on area header */
			.structure-badge {
				background: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
				font-weight: 500;
			}

			/* Rules info text on area header */
			.rules-info {
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
				font-weight: 400;
			}

			/* Section boxes — bordered containers for each section */
			.composed-sections {
				margin-left: var(--uui-size-space-3);
			}

			.section-box {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin: var(--uui-size-space-3) 0;
			}

			.section-box:first-child {
				margin-top: 0;
			}

			.section-box-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				cursor: pointer;
			}

			.section-box-header:hover {
				background: var(--uui-color-surface-emphasis);
				border-radius: var(--uui-border-radius);
			}

			.section-box-header:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.section-box-label {
				font-weight: 600;
				color: var(--uui-color-text);
				flex-shrink: 0;
			}

			.section-box-content {
				padding: 0 var(--uui-size-space-4) var(--uui-size-space-4);
			}

			/* Part boxes — nested bordered containers for grouped parts */
			.part-box {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin-bottom: var(--uui-size-space-3);
			}

			.part-box:last-child {
				margin-bottom: 0;
			}

			/* Part row — flex layout for label + content + actions */
			.part-box-row {
				display: flex;
				align-items: flex-start;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
			}

			.part-box-label {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				min-width: 80px;
				flex-shrink: 0;
				padding-top: 2px;
			}

			.part-box-content {
				flex: 1;
				font-size: var(--uui-type-default-size);
				color: var(--uui-color-text);
				min-width: 0;
			}

			/* Headings inside part content render as plain bold text */
			.part-box-content h1,
			.part-box-content h2,
			.part-box-content h3,
			.part-box-content h4,
			.part-box-content h5,
			.part-box-content h6 {
				font-size: inherit;
				font-weight: 600;
				margin: 0.75em 0 0.25em;
				line-height: 1.4;
			}

			.part-box-content h1:first-child,
			.part-box-content h2:first-child,
			.part-box-content h3:first-child,
			.part-box-content h4:first-child,
			.part-box-content h5:first-child,
			.part-box-content h6:first-child {
				margin-top: 0;
			}

			.part-box-actions {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				flex-shrink: 0;
				padding-top: 2px;
			}

			.composed-unmapped {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				font-style: italic;
				white-space: nowrap;
			}

			/* Teach-by-example mode */
			.area-teaching {
				border-left-width: 4px;
				border-left-style: solid;
				box-shadow: 0 0 0 1px var(--uui-color-focus);
				border-radius: var(--uui-border-radius);
			}

			.teach-toolbar {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.teach-instruction {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
			}

			.teach-toolbar-actions {
				display: flex;
				gap: var(--uui-size-space-2);
			}

			.teach-confirmation {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.teach-confirmation-info {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				font-size: var(--uui-type-small-size);
			}

			.teach-condition-summary {
				font-family: monospace;
				font-size: 11px;
				opacity: 0.8;
			}

			.teach-confirmation-actions {
				display: flex;
				gap: var(--uui-size-space-2);
			}

			.teach-elements {
				padding-left: var(--uui-size-space-3);
			}

			.teach-element {
				cursor: pointer;
				transition: background-color 0.15s;
			}

			.teach-element:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.teach-element.teach-clicked {
				background: color-mix(in srgb, var(--uui-color-focus) 15%, transparent);
				border-left: 3px solid var(--uui-color-focus);
			}

			.teach-element.teach-matched {
				background: color-mix(in srgb, var(--uui-color-positive) 10%, transparent);
				border-left: 3px solid var(--uui-color-positive);
			}

			.teach-element.teach-clicked.teach-matched {
				background: color-mix(in srgb, var(--uui-color-focus) 15%, transparent);
				border-left: 3px solid var(--uui-color-focus);
			}

			/* Transformed tab — read-only markdown preview */
			.transformed-preview {
				padding: var(--uui-size-space-5);
				max-width: 75ch;
			}

			/* Map button — hidden by default, shown on box hover */
			.md-map-btn {
				opacity: 0;
				transition: opacity 0.15s;
			}

			.part-box:hover .md-map-btn,
			.part-box-row:hover .md-map-btn {
				opacity: 1;
			}

			.md-section-content {
				line-height: 1.75;
				color: var(--uui-color-text);
				font-size: 15px;
			}

			/* Headings */
			.md-section-content h1 {
				font-size: 2em;
				font-weight: 700;
				margin: 0.67em 0 0.4em;
				line-height: 1.25;
				color: var(--uui-color-text);
			}

			.md-section-content h2 {
				font-size: 1.5em;
				font-weight: 600;
				margin: 1em 0 0.4em;
				padding-bottom: 0.3em;
				border-bottom: 1px solid var(--uui-color-border);
				line-height: 1.3;
				color: var(--uui-color-text);
			}

			.md-section-content h3 {
				font-size: 1.25em;
				font-weight: 600;
				margin: 0.8em 0 0.3em;
				line-height: 1.35;
				color: var(--uui-color-text);
			}

			.md-section-content h4 {
				font-size: 1.1em;
				font-weight: 600;
				margin: 0.6em 0 0.25em;
				color: var(--uui-color-text);
			}

			.md-section-content h5,
			.md-section-content h6 {
				font-size: 1em;
				font-weight: 600;
				margin: 0.5em 0 0.2em;
				color: var(--uui-color-text-alt);
			}

			/* Paragraphs */
			.md-section-content p {
				margin: 0.5em 0;
			}

			/* Lists */
			.md-section-content ul,
			.md-section-content ol {
				padding-left: 1.75em;
				margin: 0.5em 0;
			}

			.md-section-content li {
				margin: 0.2em 0;
			}

			.md-section-content ul li::marker {
				color: var(--uui-color-text-alt);
			}

			/* Blockquotes */
			.md-section-content blockquote {
				margin: 0.5em 0;
				padding: 0.25em 1em;
				border-left: 3px solid var(--uui-color-current);
				color: var(--uui-color-text-alt);
				background: color-mix(in srgb, var(--uui-color-current) 5%, transparent);
				border-radius: 0 var(--uui-border-radius) var(--uui-border-radius) 0;
			}

			.md-section-content blockquote p {
				margin: 0.25em 0;
			}

			/* Inline styles */
			.md-section-content strong {
				font-weight: 700;
				color: var(--uui-color-text);
			}

			.md-section-content em {
				font-style: italic;
			}

			.md-section-content code {
				font-family: monospace;
				font-size: 0.9em;
				padding: 0.1em 0.35em;
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-danger);
			}

			.md-section-content mark {
				background: color-mix(in srgb, var(--uui-color-warning) 30%, transparent);
				padding: 0.1em 0.2em;
				border-radius: 2px;
			}


		`,
	];
}

export default UpDocWorkflowSourceViewElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-workflow-source-view': UpDocWorkflowSourceViewElement;
	}
}
