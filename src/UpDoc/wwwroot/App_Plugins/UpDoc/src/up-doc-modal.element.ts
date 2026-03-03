import type { UmbUpDocModalData, UmbUpDocModalValue, SourceType } from './up-doc-modal.token.js';
import { allTransformSections, type DocumentTypeConfig } from './workflow.types.js';
import { fetchConfig, fetchWorkflowByAlias, transformAdhoc } from './workflow.service.js';
import { getDestinationTabs, resolveDestinationTab, resolveBlockLabel, getAllBlockContainers } from './destination-utils.js';
import { stripMarkdown } from './transforms.js';
import { html, customElement, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import type { UUIInputEvent } from '@umbraco-cms/backoffice/external/uui';
import type { UmbInputMediaElement } from '@umbraco-cms/backoffice/media';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';

// Human-readable labels for source type keys
const SOURCE_TYPE_LABELS: Record<string, string> = {
	pdf: 'PDF Document',
	markdown: 'Markdown',
	web: 'Web Page',
	doc: 'Word Document',
};

type TabType = 'source' | 'content' | 'destination';

@customElement('up-doc-modal')
export class UpDocModalElement extends UmbModalBaseElement<
	UmbUpDocModalData,
	UmbUpDocModalValue
> {
	@state()
	private _activeTab: TabType = 'source';

	@state()
	private _documentName = '';

	@state()
	private _sourceType: SourceType | '' = '';

	@state()
	private _sourceUrl = '';

	@state()
	private _selectedMediaUnique: string | null = null;

	@state()
	private _sectionLookup: Record<string, string> = {};

	@state()
	private _config: DocumentTypeConfig | null = null;

	/** Per-workflow config for the selected source type (has the correct map.json). */
	@state()
	private _workflowConfig: DocumentTypeConfig | null = null;

	@state()
	private _isExtracting = false;

	@state()
	private _extractionError: string | null = null;

	@state()
	private _contentActiveTab = '';

	@state()
	private _availableSourceTypes: string[] = [];

	@state()
	private _loadingSourceTypes = true;

	override firstUpdated() {
		this._documentName = '';
		this._sourceType = '';
		this._sourceUrl = '';
		this._selectedMediaUnique = null;
		this._sectionLookup = {};
		this._config = null;
		this._workflowConfig = null;
		this._contentActiveTab = '';
		this.#loadAvailableSourceTypes();
	}

	async #loadAvailableSourceTypes() {
		this._loadingSourceTypes = true;
		try {
			const blueprintId = this.data?.blueprintId;
			if (!blueprintId) return;

			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();
			const config = await fetchConfig(blueprintId, token);

			if (config) {
				this._config = config;

				if (config.sources) {
					this._availableSourceTypes = Object.keys(config.sources);

					// Auto-select if only one source type is available
					if (this._availableSourceTypes.length === 1) {
						this._sourceType = this._availableSourceTypes[0] as SourceType;
					}
				}
			}
		} catch (err) {
			console.error('Failed to load available source types:', err);
		} finally {
			this._loadingSourceTypes = false;
		}
	}

	#handleSourceTypeChange(e: Event) {
		const target = e.target as Element & { value: string };
		const newSourceType = target.value as SourceType | '';

		if (newSourceType !== this._sourceType) {
			this._selectedMediaUnique = null;
			this._sourceUrl = '';
			this._sectionLookup = {};
			this._extractionError = null;
			this._contentActiveTab = '';
		}

		this._sourceType = newSourceType;
	}

	async #handleMediaChange(e: CustomEvent) {
		const target = e.target as UmbInputMediaElement;
		const selection = target.selection;
		this._selectedMediaUnique = selection.length > 0 ? selection[0] : null;

		if (this._selectedMediaUnique) {
			await this.#extractFromSource(this._selectedMediaUnique);
		} else {
			this._sectionLookup = {};
			this._documentName = '';
			this._extractionError = null;
		}
	}

	/**
	 * Resolves the workflow alias for the currently selected source type.
	 * Each source type may belong to a different workflow folder.
	 */
	#resolveWorkflowAlias(): string | null {
		if (!this._config) return null;

		// Prefer per-source-type workflowAlias (supports multiple workflows per blueprint)
		if (this._sourceType && this._config.sources?.[this._sourceType]?.workflowAlias) {
			return this._config.sources[this._sourceType].workflowAlias!;
		}

		// Fallback to deriving from folderPath (single-workflow case)
		if (this._config.folderPath) {
			return this._config.folderPath.replace(/\\/g, '/').split('/').pop() ?? null;
		}

		return null;
	}

	async #extractFromSource(mediaUnique: string) {
		this._isExtracting = true;
		this._extractionError = null;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();

			const workflowAlias = this.#resolveWorkflowAlias();
			if (!workflowAlias) {
				this._extractionError = 'No workflow configured for this blueprint';
				return;
			}

			// Fetch per-workflow config (has the correct map.json for this source type)
			const wfConfig = await fetchWorkflowByAlias(workflowAlias, token);
			if (wfConfig) this._workflowConfig = wfConfig;

			// Run area-aware transform — produces section IDs matching map.json
			const transformResult = await transformAdhoc(workflowAlias, mediaUnique, token);

			const allSections = allTransformSections(transformResult);
			if (!allSections.length) {
				this._extractionError = 'Failed to extract content from source';
				return;
			}

			// Build section ID → text lookup (e.g., "features.heading", "features.content")
			const sectionLookup: Record<string, string> = {};
			for (const section of allSections) {
				if (!section.included) continue;
				if (section.heading) {
					// For role sections, heading is just a label (e.g., "Tour Title"), not document text.
					// Map .heading to the content so existing mappings resolve to actual text.
					sectionLookup[`${section.id}.heading`] =
						section.pattern === 'role' ? section.content : section.heading;
					// .title is the new canonical key for heading text (backward compat: .heading still works)
					sectionLookup[`${section.id}.title`] =
						section.pattern === 'role' ? section.content : section.heading;
				}
				sectionLookup[`${section.id}.content`] = section.content;
				// Add description and summary parts if present
				if (section.description) {
					sectionLookup[`${section.id}.description`] = section.description;
				}
				if (section.summary) {
					sectionLookup[`${section.id}.summary`] = section.summary;
				}
			}
			this._sectionLookup = sectionLookup;

			// Pre-fill document name from mapped title sections
			if (!this._documentName && (this._workflowConfig || this._config)) {
				this.#prefillDocumentName(sectionLookup);
			}
		} catch (error) {
			this._extractionError = 'Failed to connect to extraction service';
			console.error('Extraction error:', error);
		} finally {
			this._isExtracting = false;
		}
	}

	async #extractFromUrl() {
		if (!this._sourceUrl) return;

		this._isExtracting = true;
		this._extractionError = null;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();

			const workflowAlias = this.#resolveWorkflowAlias();
			if (!workflowAlias) {
				this._extractionError = 'No workflow configured for this blueprint';
				return;
			}

			// Fetch per-workflow config (has the correct map.json for this source type)
			const wfConfig = await fetchWorkflowByAlias(workflowAlias, token);
			if (wfConfig) this._workflowConfig = wfConfig;

			// Run transform with URL — no media key needed
			const transformResult = await transformAdhoc(workflowAlias, '', token, this._sourceUrl);

			const allSections = allTransformSections(transformResult);
			if (!allSections.length) {
				this._extractionError = 'Failed to extract content from web page';
				return;
			}

			// Build section ID → text lookup (same as media extraction)
			const sectionLookup: Record<string, string> = {};
			for (const section of allSections) {
				if (!section.included) continue;
				if (section.heading) {
					sectionLookup[`${section.id}.heading`] =
						section.pattern === 'role' ? section.content : section.heading;
					sectionLookup[`${section.id}.title`] =
						section.pattern === 'role' ? section.content : section.heading;
				}
				sectionLookup[`${section.id}.content`] = section.content;
				if (section.description) {
					sectionLookup[`${section.id}.description`] = section.description;
				}
				if (section.summary) {
					sectionLookup[`${section.id}.summary`] = section.summary;
				}
			}
			this._sectionLookup = sectionLookup;

			// Pre-fill document name from mapped title sections
			if (!this._documentName && (this._workflowConfig || this._config)) {
				this.#prefillDocumentName(sectionLookup);
			}
		} catch (error) {
			this._extractionError = 'Failed to extract from web page';
			console.error('Web extraction error:', error);
		} finally {
			this._isExtracting = false;
		}
	}

	/**
	 * Pre-fills the document name by finding elements mapped to a top-level field
	 * (no blockKey — i.e., a document property like pageTitle, not a block property).
	 * Concatenates multiple elements with a space (e.g., title split across two lines).
	 * Falls back to the first section heading if mapping-based resolution fails
	 * (e.g., section IDs differ across source documents).
	 */
	#prefillDocumentName(elementLookup: Record<string, string>) {
		// Use per-workflow config (correct map for this source type), fall back to merged
		const effectiveConfig = this._workflowConfig ?? this._config;

		// Try mapping-based name resolution first
		if (effectiveConfig?.map?.mappings?.length) {
			// Find the mapping that targets pageTitle (preferred for node name).
			// TODO: Allow workflow authors to configure which field maps to node name
			// via a nodeNameField property in destination.json or workflow.json.
			let titleTarget: string | null = null;
			for (const mapping of effectiveConfig.map.mappings) {
				if (mapping.enabled === false) continue;
				const pageTitleDest = mapping.destinations.find(
					(d) => !d.blockKey && d.target === 'pageTitle',
				);
				if (pageTitleDest) {
					titleTarget = pageTitleDest.target;
					break;
				}
			}

			// Fallback: first mapping with any top-level destination
			if (!titleTarget) {
				for (const mapping of effectiveConfig.map.mappings) {
					if (mapping.enabled === false) continue;
					const topLevelDest = mapping.destinations.find((d) => !d.blockKey);
					if (topLevelDest) {
						titleTarget = topLevelDest.target;
						break;
					}
				}
			}

			if (titleTarget) {
				// Collect text from all elements mapped to this top-level target
				const parts: string[] = [];
				for (const mapping of effectiveConfig.map.mappings) {
					if (mapping.enabled === false) continue;
					const mapsToTarget = mapping.destinations.some(
						(d) => d.target === titleTarget && !d.blockKey,
					);
					if (mapsToTarget && elementLookup[mapping.source]) {
						parts.push(elementLookup[mapping.source]);
					}
				}

				if (parts.length > 0) {
					this._documentName = stripMarkdown(parts.join(' '));
					return;
				}
			}
		}

		// Fallback: use the first .heading value from the section lookup
		for (const [key, value] of Object.entries(elementLookup)) {
			if (key.endsWith('.heading') && value) {
				this._documentName = stripMarkdown(value);
				return;
			}
		}
	}

	#handleSave() {
		// Use per-workflow config (correct map.json for this source type),
		// falling back to the merged config for single-workflow blueprints.
		const effectiveConfig = this._workflowConfig ?? this._config;

		this.value = {
			name: this._documentName,
			sourceType: this._sourceType as SourceType,
			mediaUnique: this._selectedMediaUnique,
			sourceUrl: this._sourceUrl || null,
			sectionLookup: this._sectionLookup,
			config: effectiveConfig,
		};
		this._submitModal();
	}

	#handleClose() {
		this._rejectModal();
	}

	#renderSourceUI() {
		switch (this._sourceType) {
			case 'pdf':
				return this.#renderPdfSource();
			case 'markdown':
				return this.#renderMarkdownSource();
			case 'web':
				return this.#renderWebSource();
			case 'doc':
				return this.#renderDocSource();
			default:
				return nothing;
		}
	}

	#renderPdfSource() {
		return html`
			<umb-property-layout label="PDF File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${this.#handleMediaChange}>
					</umb-input-media>
					${this.#renderExtractionStatus()}
				</div>
			</umb-property-layout>
		`;
	}

	#renderMarkdownSource() {
		return html`
			<umb-property-layout label="Markdown File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${this.#handleMediaChange}>
					</umb-input-media>
					${this.#renderExtractionStatus()}
				</div>
			</umb-property-layout>
		`;
	}

	#renderWebSource() {
		return html`
			<umb-property-layout label="Web Page URL" orientation="vertical">
				<div slot="editor">
					<div style="display: flex; gap: 8px; align-items: center;">
						<uui-input
							label="URL"
							placeholder="https://example.com/page"
							style="flex: 1;"
							.value=${this._sourceUrl}
							@input=${(e: UUIInputEvent) => (this._sourceUrl = e.target.value as string)}
							@keydown=${(e: KeyboardEvent) => {
								if (e.key === 'Enter' && this._sourceUrl) this.#extractFromUrl();
							}}>
						</uui-input>
						<uui-button
							look="primary"
							label="Extract"
							?disabled=${!this._sourceUrl || this._isExtracting}
							@click=${() => this.#extractFromUrl()}>
							Extract
						</uui-button>
					</div>
					${this.#renderExtractionStatus()}
				</div>
			</umb-property-layout>
		`;
	}

	#renderDocSource() {
		return html`
			<umb-property-layout label="Word Document" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						@change=${(e: CustomEvent) => {
							const target = e.target as UmbInputMediaElement;
							const selection = target.selection;
							this._selectedMediaUnique = selection.length > 0 ? selection[0] : null;
						}}>
					</umb-input-media>
					<div class="source-coming-soon">
						<uui-icon name="icon-info"></uui-icon>
						<span>Word document extraction is not yet available.</span>
					</div>
				</div>
			</umb-property-layout>
		`;
	}

	#hasExtractedContent(): boolean {
		return Object.keys(this._sectionLookup).length > 0;
	}

	#handleTabClick(tab: TabType) {
		if (tab === 'content' && !this.#hasExtractedContent()) {
			return; // Don't switch to content tab if no content
		}
		this._activeTab = tab;
	}

	#renderExtractionStatus() {
		if (this._isExtracting) {
			return html`<div class="extraction-status extracting">
				<uui-loader-bar></uui-loader-bar>
				<span>Extracting content from source...</span>
			</div>`;
		}

		if (this._extractionError) {
			return html`<div class="extraction-status error">
				<uui-icon name="icon-alert"></uui-icon>
				<span>${this._extractionError}</span>
			</div>`;
		}

		const hasContent = Object.values(this._sectionLookup).some((v) => v.length > 0);
		if (hasContent) {
			return html`<div class="extraction-status success">
				<uui-icon name="icon-check"></uui-icon>
				<span>Content extracted successfully</span>
			</div>`;
		}

		return nothing;
	}

	#renderTabs() {
		const hasContent = this.#hasExtractedContent();
		return html`
			<uui-tab-group slot="navigation">
				<uui-tab
					label="Source"
					?active=${this._activeTab === 'source'}
					orientation="horizontal"
					@click=${() => this.#handleTabClick('source')}>
					<uui-icon slot="icon" name="icon-page-add"></uui-icon>
					Source
				</uui-tab>
				<uui-tab
					label="Content"
					?active=${this._activeTab === 'content'}
					orientation="horizontal"
					?disabled=${!hasContent}
					@click=${() => this.#handleTabClick('content')}>
					<uui-icon slot="icon" name="icon-edit"></uui-icon>
					Content
				</uui-tab>
				<uui-tab
					label="Destination"
					?active=${this._activeTab === 'destination'}
					orientation="horizontal"
					@click=${() => this.#handleTabClick('destination')}>
					<uui-icon slot="icon" name="icon-document"></uui-icon>
					Destination
				</uui-tab>
			</uui-tab-group>
		`;
	}

	#renderSourceTab() {
		return html`
			<uui-box headline="Document Name">
				<p>Enter a document name or let it be populated from the source. You can edit this later.</p>
				<uui-input
					id="name"
					label="name"
					placeholder="Enter document name"
					.value=${this._documentName}
					@input=${(e: UUIInputEvent) => (this._documentName = e.target.value as string)}>
				</uui-input>
			</uui-box>

			<uui-box headline="Source">
				${this._loadingSourceTypes
					? html`<uui-loader-bar></uui-loader-bar>`
					: this._availableSourceTypes.length === 0
						? html`<p style="color: var(--uui-color-danger);">No source types configured for this workflow.</p>`
						: html`
							<umb-property-layout label="Source Type" orientation="vertical">
								<div slot="editor">
									<uui-select
										label="Select source type"
										.options=${[
											...(this._availableSourceTypes.length > 1
												? [{ name: 'Choose a source...', value: '', selected: this._sourceType === '' }]
												: []),
											...this._availableSourceTypes.map((st) => ({
												name: SOURCE_TYPE_LABELS[st] || st,
												value: st,
												selected: this._sourceType === st,
											})),
										]}
										@change=${this.#handleSourceTypeChange}>
									</uui-select>
								</div>
							</umb-property-layout>

							${this.#renderSourceUI()}
						`}
			</uui-box>
		`;
	}

	/**
	 * Builds a grouped preview of mapped values, organised by destination tab.
	 * Groups by compound key (blockKey:alias) so block properties with the same
	 * alias across different blocks are kept separate, then classifies each
	 * into its destination tab using the destination.json structure.
	 */
	#buildGroupedPreview(): Array<{
		tabId: string;
		tabLabel: string;
		items: Array<{ label: string; value: string; blockLabel?: string }>;
	}> {
		// Use per-workflow config (correct map for this source type), fall back to merged
		const effectiveConfig = this._workflowConfig ?? this._config;

		if (!effectiveConfig?.map?.mappings?.length || !effectiveConfig?.destination) return [];

		const destination = effectiveConfig.destination;

		// Step 1: Build compound key → values + metadata (same as old #buildMappedPreview)
		const preview = new Map<string, string[]>();
		const keyMeta = new Map<string, { alias: string; blockKey?: string }>();

		for (const mapping of effectiveConfig.map.mappings) {
			if (mapping.enabled === false) continue;
			const text = this._sectionLookup[mapping.source];
			if (!text) continue;
			for (const dest of mapping.destinations) {
				const compoundKey = dest.blockKey ? `${dest.blockKey}:${dest.target}` : dest.target;
				const existing = preview.get(compoundKey) ?? [];
				existing.push(text);
				preview.set(compoundKey, existing);
				if (!keyMeta.has(compoundKey)) {
					keyMeta.set(compoundKey, { alias: dest.target, blockKey: dest.blockKey });
				}
			}
		}

		// Step 2: Classify each item into a destination tab
		const tabItems = new Map<string, Array<{ label: string; value: string; blockLabel?: string }>>();
		const tabLabels = new Map<string, string>();

		for (const [compoundKey, parts] of preview.entries()) {
			const meta = keyMeta.get(compoundKey);
			const alias = meta?.alias ?? compoundKey;
			const blockKey = meta?.blockKey;

			const tabId = resolveDestinationTab(
				{ target: alias, blockKey },
				destination,
			) ?? 'other';

			if (!tabItems.has(tabId)) {
				tabItems.set(tabId, []);
			}

			// Resolve the field-level label (without block prefix for block properties)
			let fieldLabel = alias;
			if (blockKey) {
				for (const container of getAllBlockContainers(destination)) {
					const block = container.blocks.find((b) => b.key === blockKey);
					if (block) {
						const prop = block.properties?.find((p) => p.alias === alias);
						if (prop) fieldLabel = prop.label || prop.alias;
						break;
					}
				}
			} else {
				const field = destination.fields.find((f) => f.alias === alias);
				if (field) fieldLabel = field.label;
			}

			tabItems.get(tabId)!.push({
				label: fieldLabel,
				value: parts.join(' '),
				blockLabel: blockKey ? (resolveBlockLabel(blockKey, destination) ?? undefined) : undefined,
			});
		}

		// Step 3: Order tabs according to destination structure, only include tabs with items
		const allTabs = getDestinationTabs(destination);
		const result: Array<{
			tabId: string;
			tabLabel: string;
			items: Array<{ label: string; value: string; blockLabel?: string }>;
		}> = [];

		for (const tab of allTabs) {
			const items = tabItems.get(tab.id);
			if (items?.length) {
				tabLabels.set(tab.id, tab.label);
				result.push({ tabId: tab.id, tabLabel: tab.label, items });
			}
		}

		// Add orphaned items if any
		const orphanedItems = tabItems.get('other');
		if (orphanedItems?.length) {
			result.push({ tabId: 'other', tabLabel: 'Other', items: orphanedItems });
		}

		return result;
	}

	#renderSectionCard(label: string, value: string) {
		return html`
			<div class="section-card">
				<div class="section-card-header">
					<span class="section-card-label">${label}</span>
				</div>
				<div class="section-card-body">
					<uui-action-bar class="section-card-actions">
						<uui-button
							compact
							title="Copy"
							label="Copy ${label}"
							@click=${() => this.#copySection(label, value)}>
							<uui-icon name="icon-documents"></uui-icon>
						</uui-button>
					</uui-action-bar>
					<div class="section-card-content">${value}</div>
				</div>
			</div>
		`;
	}

	#renderContentGroupItems(group: { tabId: string; items: Array<{ label: string; value: string; blockLabel?: string }> }) {
		if (group.tabId === 'page-content') {
			// Sub-group by block label
			const blockGroups = new Map<string, Array<{ label: string; value: string }>>();
			for (const item of group.items) {
				const key = item.blockLabel ?? 'Other';
				const arr = blockGroups.get(key) ?? [];
				arr.push(item);
				blockGroups.set(key, arr);
			}

			return html`
				${Array.from(blockGroups.entries()).map(([blockLabel, items]) => html`
					<div class="block-group-header">
						<umb-icon name="icon-box"></umb-icon>
						<span>${blockLabel}</span>
					</div>
					${items.map((item) => this.#renderSectionCard(item.label, item.value))}
				`)}
			`;
		}

		return html`
			${group.items.map((item) => this.#renderSectionCard(item.label, item.value))}
		`;
	}

	#renderContentTab() {
		const grouped = this.#buildGroupedPreview();

		if (grouped.length === 0) {
			return html`
				<div class="content-editor">
					<p class="content-editor-intro">No mapped content to preview. Create mappings in the workflow editor first.</p>
				</div>
			`;
		}

		// Auto-select first tab if none active or current tab no longer exists
		if (!this._contentActiveTab || !grouped.find((g) => g.tabId === this._contentActiveTab)) {
			this._contentActiveTab = grouped[0].tabId;
		}

		const activeGroup = grouped.find((g) => g.tabId === this._contentActiveTab) ?? grouped[0];

		return html`
			<uui-tab-group class="content-inner-tabs">
				${grouped.map((group) => html`
					<uui-tab
						label=${group.tabLabel}
						?active=${this._contentActiveTab === group.tabId}
						@click=${() => { this._contentActiveTab = group.tabId; }}>
						${group.tabLabel}
					</uui-tab>
				`)}
			</uui-tab-group>
			${this.#renderContentGroupItems(activeGroup)}
		`;
	}

	#renderDestinationTab() {
		return html`
			<uui-box headline="Document Type">
				<div class="destination-value">
					<umb-icon name="icon-document-dashed-line"></umb-icon>
					<span>${this.data?.documentTypeName}</span>
				</div>
			</uui-box>

			<uui-box headline="Blueprint">
				<div class="destination-value">
					<umb-icon name="icon-blueprint"></umb-icon>
					<span>${this.data?.blueprintName}</span>
				</div>
			</uui-box>
		`;
	}

	async #copySection(key: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			// TODO: Show toast notification "Copied to clipboard"
			console.log('Copied to clipboard:', key);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	#getCanCreate(): boolean {
		if (!this._documentName || this._isExtracting) return false;

		switch (this._sourceType) {
			case 'pdf':
			case 'markdown':
				return !!this._selectedMediaUnique;
			case 'web':
				return this.#hasExtractedContent();
			case 'doc':
				return false;
			default:
				return false;
		}
	}

	#renderTabContent() {
		switch (this._activeTab) {
			case 'source':
				return this.#renderSourceTab();
			case 'content':
				return this.#renderContentTab();
			case 'destination':
				return this.#renderDestinationTab();
		}
	}

	override render() {
		const canCreate = this.#getCanCreate();

		return html`
			<umb-body-layout headline="Create from Source">
				${this.#renderTabs()}

				<div class="tab-content">
					${this.#renderTabContent()}
				</div>

				<uui-button
					slot="actions"
					id="close"
					label=${this.localize.term('general_close')}
					@click="${this.#handleClose}"></uui-button>
				<uui-button
					slot="actions"
					id="save"
					look="primary"
					color="positive"
					label=${this.localize.term('general_create')}
					?disabled=${!canCreate}
					@click="${this.#handleSave}"></uui-button>
			</umb-body-layout>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			/* Navigation tabs */
			uui-tab[disabled] {
				opacity: 0.5;
				cursor: not-allowed;
			}

			/* Tab content */
			.tab-content {
				display: flex;
				flex-direction: column;
			}

			/* Content editor tab */
			.content-editor {
				display: flex;
				flex-direction: column;
			}

			.content-editor uui-box {
				margin-bottom: var(--uui-size-space-4);
			}

			.content-editor-intro {
				margin: 0 0 var(--uui-size-space-4) 0;
				color: var(--uui-color-text-alt);
				font-size: var(--uui-type-small-size);
			}

			.section-card {
				position: relative;
				background: var(--uui-color-surface);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin-bottom: var(--uui-size-space-4);
			}

			.section-card-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border-bottom: 1px solid var(--uui-color-border);
				background: var(--uui-color-surface-alt);
			}

			.section-card-label {
				font-weight: 600;
			}

			.section-card-body {
				position: relative;
			}

			.section-card-actions {
				position: absolute;
				top: var(--uui-size-space-2);
				right: var(--uui-size-space-2);
				opacity: 0;
				transition: opacity 120ms ease;
			}

			.section-card:hover .section-card-actions {
				opacity: 1;
			}

			.section-card-content {
				padding: var(--uui-size-space-4);
				white-space: pre-wrap;
				font-size: var(--uui-type-small-size);
				max-height: 300px;
				overflow-y: auto;
			}

			/* Content tab inner tabs — bleed edge-to-edge past outer body layout padding */
			.content-inner-tabs {
				margin: calc(var(--uui-size-layout-1) * -1);
				margin-bottom: var(--uui-size-space-4);
				background: var(--uui-color-surface);
				--uui-tab-background: var(--uui-color-surface);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.block-group-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius) var(--uui-border-radius) 0 0;
				font-weight: 600;
				font-size: var(--uui-type-small-size);
				margin-top: var(--uui-size-space-4);
			}

			.block-group-header:first-child {
				margin-top: 0;
			}

			.block-group-header + .section-card {
				border-top: none;
				border-radius: 0 0 var(--uui-border-radius) var(--uui-border-radius);
			}

			.block-group-header + .section-card .section-card-header {
				border-radius: 0;
			}

			/* Destination tab */
			.destination-value {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			uui-input {
				width: 100%;
			}

			uui-box {
				margin-bottom: var(--uui-size-space-4);
			}

			p {
				margin-bottom: var(--uui-size-space-4);
			}

			.extraction-status {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				margin-top: var(--uui-size-space-3);
				padding: var(--uui-size-space-2);
				border-radius: var(--uui-border-radius);
				font-size: var(--uui-type-small-size);
			}

			.extraction-status.extracting {
				background-color: var(--uui-color-surface-alt);
			}

			.extraction-status.error {
				background-color: var(--uui-color-danger-emphasis);
				color: var(--uui-color-danger-contrast);
			}

			.extraction-status.success {
				background-color: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
			}

			uui-select {
				width: 100%;
			}

			.source-coming-soon {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				margin-top: var(--uui-size-space-3);
				padding: var(--uui-size-space-2);
				border-radius: var(--uui-border-radius);
				font-size: var(--uui-type-small-size);
				background-color: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
			}
		`,
	];
}

export default UpDocModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-modal': UpDocModalElement;
	}
}
