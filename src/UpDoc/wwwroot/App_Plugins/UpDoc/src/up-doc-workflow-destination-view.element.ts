import type { DocumentTypeConfig, DestinationField, DestinationBlock, DestinationBlockGrid, BlockProperty, SectionMapping } from './workflow.types.js';
import { fetchWorkflowByAlias, changeWorkflowDestination } from './workflow.service.js';
import { getDestinationTabs, getAllBlockContainers } from './destination-utils.js';
import { html, customElement, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import { umbOpenModal } from '@umbraco-cms/backoffice/modal';
import { UMB_BLUEPRINT_PICKER_MODAL } from './blueprint-picker-modal.token.js';
import type { DocumentTypeOption } from './blueprint-picker-modal.token.js';

@customElement('up-doc-workflow-destination-view')
export class UpDocWorkflowDestinationViewElement extends UmbLitElement {
	@state() private _config: DocumentTypeConfig | null = null;
	@state() private _loading = true;
	@state() private _error: string | null = null;
	@state() private _activeTab = '';
	@state() private _collapsedBlocks = new Set<string>();
	@state() private _collapsePopoverOpen = false;
	@state() private _blueprintMissing = false;
	#workflowAlias: string | null = null;

	override connectedCallback() {
		super.connectedCallback();
		this.consumeContext(UMB_WORKSPACE_CONTEXT, (context) => {
			if (!context) return;
			this.observe((context as any).unique, (unique: string | null) => {
				if (unique) {
					this.#workflowAlias = decodeURIComponent(unique);
					this.#loadConfig(this.#workflowAlias);
				}
			});
		});
	}

	async #loadConfig(workflowAlias: string) {
		this._loading = true;
		this._error = null;
		this._blueprintMissing = false;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();
			this._config = await fetchWorkflowByAlias(workflowAlias, token);

			if (!this._config) {
				this._error = `Workflow "${workflowAlias}" not found`;
				return;
			}

			// Validate blueprint still exists
			const dest = this._config.destination;
			if (dest.blueprintId) {
				const bpResponse = await fetch(
					`/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(dest.documentTypeAlias)}/blueprints`,
					{ headers: { Authorization: `Bearer ${token}` } },
				);
				if (bpResponse.ok) {
					const blueprints: Array<{ id: string; name: string }> = await bpResponse.json();
					this._blueprintMissing = !blueprints.some((bp) => bp.id === dest.blueprintId);
				}
			}

			const tabs = this.#getTabs();
			if (tabs.length > 0) {
				this._activeTab = tabs[0].id;
			}
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to load workflow';
			console.error('Failed to load workflow config:', err);
		} finally {
			this._loading = false;
		}
	}

	// =========================================================================
	// Change Document Type / Blueprint
	// =========================================================================

	async #fetchDocumentTypeOptions(token: string): Promise<{
		options: DocumentTypeOption[];
		aliasMap: Map<string, string>;
	}> {
		const docTypesResponse = await fetch('/umbraco/management/api/v1/updoc/document-types', {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!docTypesResponse.ok) return { options: [], aliasMap: new Map() };

		const docTypes: Array<{ alias: string; name: string; icon: string; id: string }> =
			await docTypesResponse.json();

		const options: DocumentTypeOption[] = [];
		const aliasMap = new Map<string, string>();

		for (const dt of docTypes) {
			aliasMap.set(dt.id, dt.alias);

			const bpResponse = await fetch(
				`/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(dt.alias)}/blueprints`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			if (!bpResponse.ok) continue;

			const blueprints: Array<{ id: string; name: string }> = await bpResponse.json();
			if (blueprints.length > 0) {
				options.push({
					documentTypeUnique: dt.id,
					documentTypeName: dt.name,
					documentTypeIcon: dt.icon ?? null,
					blueprints: blueprints.map((bp) => ({
						blueprintUnique: bp.id,
						blueprintName: bp.name,
					})),
				});
			}
		}

		return { options, aliasMap };
	}

	async #handleChangeDocumentType() {
		if (!this.#workflowAlias) return;

		const authContext = await this.getContext(UMB_AUTH_CONTEXT);
		const token = await authContext.getLatestToken();

		const { options, aliasMap } = await this.#fetchDocumentTypeOptions(token);
		if (!options.length) return;

		let selection;
		try {
			selection = await umbOpenModal(this, UMB_BLUEPRINT_PICKER_MODAL, {
				data: { documentTypes: options },
			});
		} catch {
			return; // Cancelled
		}

		const { blueprintUnique, documentTypeUnique } = selection;
		const selectedDocType = options.find((dt) => dt.documentTypeUnique === documentTypeUnique);
		const selectedBlueprint = selectedDocType?.blueprints.find((bp) => bp.blueprintUnique === blueprintUnique);
		const docTypeAlias = aliasMap.get(documentTypeUnique) ?? '';

		const result = await changeWorkflowDestination(
			this.#workflowAlias,
			docTypeAlias,
			selectedDocType?.documentTypeName ?? null,
			blueprintUnique,
			selectedBlueprint?.blueprintName ?? null,
			token,
		);

		if (result) {
			await this.#loadConfig(this.#workflowAlias);
		}
	}

	async #handleChangeBlueprint() {
		if (!this.#workflowAlias || !this._config) return;

		const authContext = await this.getContext(UMB_AUTH_CONTEXT);
		const token = await authContext.getLatestToken();

		const dest = this._config.destination;
		const currentDocTypeAlias = dest.documentTypeAlias;

		// Fetch doc types to find the current one (need its GUID for preSelectedDocTypeUnique)
		const { options, aliasMap } = await this.#fetchDocumentTypeOptions(token);
		// Find by alias (aliasMap is GUID → alias, so reverse-lookup)
		const currentDocTypeUnique = [...aliasMap.entries()].find(([, alias]) => alias === currentDocTypeAlias)?.[0];
		const currentDocType = options.find((dt) => dt.documentTypeUnique === currentDocTypeUnique);

		if (!currentDocType) return;

		let selection;
		try {
			selection = await umbOpenModal(this, UMB_BLUEPRINT_PICKER_MODAL, {
				data: {
					documentTypes: [currentDocType],
					preSelectedDocTypeUnique: currentDocType.documentTypeUnique,
				},
			});
		} catch {
			return; // Cancelled
		}

		const selectedBlueprint = currentDocType.blueprints.find(
			(bp) => bp.blueprintUnique === selection.blueprintUnique,
		);

		const result = await changeWorkflowDestination(
			this.#workflowAlias,
			currentDocTypeAlias,
			dest.documentTypeName ?? null,
			selection.blueprintUnique,
			selectedBlueprint?.blueprintName ?? null,
			token,
		);

		if (result) {
			await this.#loadConfig(this.#workflowAlias);
		}
	}

	// =========================================================================
	// Tabs
	// =========================================================================

	#getTabs() {
		if (!this._config) return [];
		return getDestinationTabs(this._config.destination);
	}

	// =========================================================================
	// Mapping badge helpers (reverse-lookup: destination → source)
	// =========================================================================

	/**
	 * Find all source mappings that target a specific destination field/property.
	 * Returns array of { source, mapping } for badge rendering.
	 */
	#getSourcesForTarget(targetAlias: string, blockKey?: string): Array<{ source: string; mapping: SectionMapping }> {
		if (!this._config?.map?.mappings) return [];

		const results: Array<{ source: string; mapping: SectionMapping }> = [];
		for (const mapping of this._config.map.mappings) {
			if (mapping.enabled === false) continue;
			for (const dest of mapping.destinations) {
				if (dest.target === targetAlias && (blockKey ? dest.blockKey === blockKey : !dest.blockKey)) {
					results.push({ source: mapping.source, mapping });
				}
			}
		}
		return results;
	}

	/**
	 * Convert a source ID like "tour-title.content" to a human-readable label "Tour Title".
	 * Strips the .content/.title/.heading/.description/.summary suffix, then title-cases.
	 */
	#formatSourceLabel(sourceId: string): string {
		// Strip the part suffix
		const parts = sourceId.split('.');
		const sectionId = parts[0];
		const partName = parts[1];

		// Convert kebab-case to Title Case
		const label = sectionId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

		// If there's a meaningful part name that isn't just "content", append it
		if (partName && partName !== 'content') {
			const partLabel = partName.replace(/\b\w/g, (c) => c.toUpperCase());
			return `${label} (${partLabel})`;
		}

		return label;
	}

	#renderMappingBadges(targetAlias: string, blockKey?: string) {
		const sources = this.#getSourcesForTarget(targetAlias, blockKey);
		if (sources.length === 0) return nothing;

		return sources.map(
			({ source }) => html`
				<uui-tag color="positive" look="primary" class="mapped-tag" title="${source}">
					${this.#formatSourceLabel(source)}
					<button class="unmap-x" title="Remove mapping" @click=${(e: Event) => { e.stopPropagation(); }}>&times;</button>
				</uui-tag>
			`,
		);
	}

	#hasAnyMapping(targetAlias: string, blockKey?: string): boolean {
		return this.#getSourcesForTarget(targetAlias, blockKey).length > 0;
	}

	/**
	 * Collect all mapping badges for all properties of a block (for collapsed header display).
	 */
	#renderBlockHeaderBadges(block: DestinationBlock) {
		if (!block.properties?.length) return nothing;
		const badges: ReturnType<typeof html>[] = [];
		for (const prop of block.properties) {
			const sources = this.#getSourcesForTarget(prop.alias, block.key);
			for (const { source } of sources) {
				badges.push(html`
					<uui-tag color="positive" look="primary" class="mapped-tag" title="${source}">
						${this.#formatSourceLabel(source)}
						<button class="unmap-x" title="Remove mapping" @click=${(e: Event) => { e.stopPropagation(); }}>&times;</button>
					</uui-tag>
				`);
			}
		}
		return badges.length > 0 ? badges : nothing;
	}

	// =========================================================================
	// Collapse
	// =========================================================================

	#toggleBlockCollapse(blockKey: string) {
		const updated = new Set(this._collapsedBlocks);
		if (updated.has(blockKey)) {
			updated.delete(blockKey);
		} else {
			updated.add(blockKey);
		}
		this._collapsedBlocks = updated;
	}

	#isBlockCollapsed(blockKey: string): boolean {
		return this._collapsedBlocks.has(blockKey);
	}

	#collapseAllBlocks() {
		if (!this._config) return;
		const allKeys = new Set<string>();
		for (const container of getAllBlockContainers(this._config.destination)) {
			const cTab = container.tab ?? 'Page Content';
			if (cTab.toLowerCase().replace(/\s+/g, '-') === this._activeTab) {
				for (const block of container.blocks) {
					allKeys.add(block.key);
				}
			}
		}
		this._collapsedBlocks = allKeys;
	}

	#expandAllBlocks() {
		this._collapsedBlocks = new Set<string>();
	}

	#onCollapsePopoverToggle(event: ToggleEvent) {
		this._collapsePopoverOpen = event.newState === 'open';
	}

	#activeTabHasBlocks(): boolean {
		if (!this._config) return false;
		return getAllBlockContainers(this._config.destination).some((c) => {
			const cTab = c.tab ?? 'Page Content';
			return cTab.toLowerCase().replace(/\s+/g, '-') === this._activeTab;
		});
	}

	// =========================================================================
	// Field rendering (part-box pattern)
	// =========================================================================

	#renderFieldsForTab(tabName: string) {
		if (!this._config) return nothing;

		const fields = this._config.destination.fields.filter((f) => f.tab === tabName);
		if (fields.length === 0) return html`<p class="empty-message">No fields in this tab.</p>`;

		return html`
			${fields.map((field) => this.#renderField(field))}
		`;
	}

	#renderField(field: DestinationField) {
		const isMapped = this.#hasAnyMapping(field.alias);

		return html`
			<div class="part-box ${isMapped ? '' : 'unmapped'}">
				<div class="part-box-row">
					<div class="part-box-info">
						<div class="part-box-field-name">${field.label}</div>
						<div class="part-box-field-meta">
							<span class="field-alias">${field.alias}</span>
							<span class="field-type-badge">${field.type}</span>
							${field.mandatory ? html`<uui-tag look="primary" color="danger" class="required-badge">Required</uui-tag>` : nothing}
						</div>
					</div>
					<div class="part-box-actions">
						${this.#renderMappingBadges(field.alias)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
	}

	// =========================================================================
	// Block rendering (section-box + part-box pattern)
	// =========================================================================

	#renderBlockContainersForTab(tabId: string) {
		if (!this._config) return nothing;

		const containers = getAllBlockContainers(this._config.destination).filter((c) => {
			const cTab = c.tab ?? 'Page Content';
			return cTab.toLowerCase().replace(/\s+/g, '-') === tabId;
		});

		if (!containers.length) {
			return html`<p class="empty-message">No blocks configured.</p>`;
		}

		return html`
			${containers.map((container) => this.#renderBlockContainer(container))}
		`;
	}

	#renderBlockContainer(container: DestinationBlockGrid) {
		const isGrid = (this._config?.destination.blockGrids ?? []).some((g) => g.key === container.key);
		const icon = isGrid ? 'icon-grid' : 'icon-thumbnail-list';

		return html`
			<div class="section-box container-box">
				<div class="section-box-header container-header">
					<uui-icon name="${icon}" class="level-icon"></uui-icon>
					<span class="section-box-label">${container.label}</span>
				</div>
				<div class="section-box-content">
					${container.blocks.map((block) => this.#renderBlock(block))}
				</div>
			</div>
		`;
	}

	#renderBlock(block: DestinationBlock) {
		const isCollapsed = this.#isBlockCollapsed(block.key);

		return html`
			<div class="section-box">
				<div class="section-box-header" @click=${() => this.#toggleBlockCollapse(block.key)}>
					<uui-icon class="collapse-chevron" name="${isCollapsed ? 'icon-navigation-right' : 'icon-navigation-down'}"></uui-icon>
					<uui-icon name="icon-box" class="level-icon"></uui-icon>
					<span class="section-box-label">${block.label}</span>
					${block.identifyBy
						? html`<span class="block-identify">identified by: "${block.identifyBy.value}"</span>`
						: nothing}
					<span class="header-spacer"></span>
					${isCollapsed ? this.#renderBlockHeaderBadges(block) : nothing}
				</div>
				${!isCollapsed && block.properties?.length
					? html`
						<div class="section-box-content">
							${block.properties.map((prop) => this.#renderBlockProperty(prop, block.key))}
						</div>
					`
					: nothing}
			</div>
		`;
	}

	#renderBlockProperty(prop: BlockProperty, blockKey: string) {
		const isMapped = this.#hasAnyMapping(prop.alias, blockKey);

		return html`
			<div class="part-box ${isMapped ? '' : 'unmapped'}">
				<div class="part-box-row">
					<span class="part-box-label">${prop.label || prop.alias}</span>
					<div class="part-box-info">
						<div class="part-box-field-meta">
							<span class="field-alias">${prop.alias}</span>
							<span class="field-type-badge">${prop.type}</span>
							${prop.acceptsFormats?.length
								? html`<span class="accepts-formats">${prop.acceptsFormats.join(', ')}</span>`
								: nothing}
						</div>
					</div>
					<div class="part-box-actions">
						${this.#renderMappingBadges(prop.alias, blockKey)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
	}

	// =========================================================================
	// Info Boxes
	// =========================================================================

	#getFieldsCount(): number {
		if (!this._config) return 0;
		return this._config.destination.fields.length;
	}

	#getBlocksCount(): number {
		if (!this._config) return 0;
		return getAllBlockContainers(this._config.destination)
			.reduce((sum, container) => sum + container.blocks.length, 0);
	}

	#renderInfoBoxes() {
		if (!this._config) return nothing;
		const dest = this._config.destination;

		return html`
			<div class="info-boxes">
				<uui-box headline="Document Type" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-document-dashed-line" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${dest.documentTypeName ?? dest.documentTypeAlias}">${dest.documentTypeName ?? dest.documentTypeAlias}</span>
						<span class="box-sub">${dest.documentTypeAlias}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Change" @click=${this.#handleChangeDocumentType}>
								<uui-icon name="icon-document-dashed-line"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blueprint" class="info-box-item ${this._blueprintMissing ? 'blueprint-missing' : ''}">
					<div class="box-content">
						<uui-icon name="icon-blueprint" class="box-icon ${this._blueprintMissing ? 'box-icon-warning' : ''}"></uui-icon>
						<span class="box-stat box-filename ${this._blueprintMissing ? 'box-filename-warning' : ''}" title="${dest.blueprintName ?? '—'}">${dest.blueprintName ?? '—'}</span>
						${this._blueprintMissing
							? html`<uui-tag color="warning" look="primary">Not found</uui-tag>`
							: nothing}
						<div class="box-buttons">
							<uui-button look="primary" color="${this._blueprintMissing ? 'warning' : 'default'}" label="Change" @click=${this.#handleChangeBlueprint}>
								<uui-icon name="icon-blueprint"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Fields" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-layers" class="box-icon"></uui-icon>
						<span class="box-stat">${this.#getFieldsCount()}</span>
						<span class="box-sub">text-mappable</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" disabled title="Coming soon">
								<uui-icon name="icon-layers"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blocks" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-box" class="box-icon"></uui-icon>
						<span class="box-stat">${this.#getBlocksCount()}</span>
						<span class="box-sub">in blueprint</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" disabled title="Coming soon">
								<uui-icon name="icon-box"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
	}

	// =========================================================================
	// Tab content + collapse row
	// =========================================================================

	#renderCollapseRow() {
		if (!this.#activeTabHasBlocks()) return nothing;
		return html`
			<div class="collapse-row">
				<uui-button
					look="outline"
					compact
					label="Collapse"
					popovertarget="dest-collapse-popover">
					Collapse
					<uui-symbol-expand .open=${this._collapsePopoverOpen}></uui-symbol-expand>
				</uui-button>
				<uui-popover-container
					id="dest-collapse-popover"
					placement="bottom-start"
					@toggle=${this.#onCollapsePopoverToggle}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => this.#expandAllBlocks()}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="Collapse All"
							@click=${() => this.#collapseAllBlocks()}>
							<uui-icon slot="icon" name="icon-navigation-right"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		`;
	}

	#renderTabContent() {
		if (!this._config) return nothing;

		const tabName = this._config.destination.fields.find(
			(f) => f.tab && f.tab.toLowerCase().replace(/\s+/g, '-') === this._activeTab
		)?.tab;

		const hasContainers = getAllBlockContainers(this._config.destination).some((c) => {
			const cTab = c.tab ?? 'Page Content';
			return cTab.toLowerCase().replace(/\s+/g, '-') === this._activeTab;
		});

		return html`
			${tabName ? this.#renderFieldsForTab(tabName) : nothing}
			${hasContainers ? this.#renderBlockContainersForTab(this._activeTab) : nothing}
		`;
	}

	override render() {
		if (this._loading) {
			return html`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
		}

		if (this._error) {
			return html`<p style="color: var(--uui-color-danger);">${this._error}</p>`;
		}

		const tabs = this.#getTabs();

		return html`
			<umb-body-layout header-fit-height>
				<uui-tab-group slot="header" dropdown-content-direction="vertical">
					${tabs.map(
						(tab) => html`
							<uui-tab
								label=${tab.label}
								?active=${this._activeTab === tab.id}
								@click=${() => { this._activeTab = tab.id; }}>
								${tab.label}
							</uui-tab>
						`
					)}
				</uui-tab-group>
				${this.#renderInfoBoxes()}
				${this.#renderCollapseRow()}
				<uui-box class="page-box">
					${this.#renderTabContent()}
				</uui-box>
			</umb-body-layout>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
				height: 100%;
				--uui-tab-background: var(--uui-color-surface);
			}

			.loading {
				padding: var(--uui-size-layout-1);
			}

			.empty-message {
				color: var(--uui-color-text-alt);
				font-style: italic;
				padding: var(--uui-size-space-4);
			}

			/* Page box (matching Source tab) */
			.page-box {
				margin: var(--uui-size-space-4);
			}

			/* Collapse row */
			.collapse-row {
				display: flex;
				justify-content: flex-end;
				padding: var(--uui-size-space-2) var(--uui-size-space-4);
			}

			/* Section box (collapsible block group — matches Source tab) */
			.section-box {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin: var(--uui-size-space-3) 0;
			}

			.section-box:first-child {
				margin-top: 0;
			}

			/* Outermost container box (Block Grid / Block List wrapper) */
			.container-header {
				cursor: default;
				border-bottom: 1px solid var(--uui-color-border);
			}

			.container-header:hover {
				background: transparent;
			}

			.container-box > .section-box-content > .section-box:first-child {
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

			.collapse-chevron {
				font-size: 12px;
				color: var(--uui-color-text-alt);
			}

			.level-icon {
				font-size: 14px;
				color: var(--uui-color-text-alt);
			}

			.section-box-label {
				font-weight: 600;
				color: var(--uui-color-text);
				flex-shrink: 0;
			}

			.header-spacer {
				flex: 1;
			}

			.section-box-content {
				padding: 0 var(--uui-size-space-4) var(--uui-size-space-4);
			}

			/* Part box (individual field/property row — matches Source tab) */
			.part-box {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin-bottom: var(--uui-size-space-3);
			}

			.part-box:last-child {
				margin-bottom: 0;
			}

			.part-box.unmapped {
				border-style: dashed;
			}

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

			.part-box-info {
				flex: 1;
				min-width: 0;
			}

			.part-box-field-name {
				font-size: var(--uui-type-default-size);
				font-weight: 600;
				color: var(--uui-color-text);
			}

			.part-box-field-meta {
				display: flex;
				gap: var(--uui-size-space-2);
				align-items: center;
				margin-top: 3px;
			}

			.field-alias {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				font-family: monospace;
			}

			.field-type-badge {
				font-size: 11px;
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface-alt);
				padding: 1px 6px;
				border-radius: var(--uui-border-radius);
			}

			.required-badge {
				font-size: 11px;
			}

			.part-box-actions {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				flex-shrink: 0;
				padding-top: 2px;
			}

			.block-identify {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				font-style: italic;
			}

			.accepts-formats {
				font-size: 11px;
				color: var(--uui-color-text-alt);
			}

			/* Mapping badges (matches Source tab) */
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

			/* Map button — visible on hover (matches Source tab) */
			.md-map-btn {
				opacity: 0;
				transition: opacity 0.15s;
			}

			.part-box:hover .md-map-btn {
				opacity: 1;
			}

			/* Info boxes row (matching Source tab pattern) */
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
				display: flex;
				gap: var(--uui-size-space-2);
				margin-top: auto;
				padding-top: var(--uui-size-space-2);
			}

			.box-icon {
				font-size: 48px;
				color: var(--uui-color-text-alt);
				margin-top: var(--uui-size-space-3);
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

			.box-filename {
				font-weight: 600;
				font-size: var(--uui-type-default-size) !important;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 100%;
			}

			.box-sub {
				font-size: 11px;
				color: var(--uui-color-text-alt);
			}

			/* Missing blueprint warning */
			.blueprint-missing {
				border-color: var(--uui-color-warning);
			}

			.box-icon-warning {
				color: var(--uui-color-warning);
			}

			.box-filename-warning {
				color: var(--uui-color-warning);
			}
		`,
	];
}

export default UpDocWorkflowDestinationViewElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-workflow-destination-view': UpDocWorkflowDestinationViewElement;
	}
}
