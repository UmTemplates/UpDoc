import type { AreaPickerModalData, AreaPickerModalValue } from './area-picker-modal.token.js';
import type { ContainerTreeNode, ContainerOverride } from './workflow.types.js';
import { normalizeToKebabCase } from './transforms.js';
import { html, css, nothing, state, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

/** Semantic HTML5 landmark tags that get a yellow highlight for orientation. */
const LANDMARK_TAGS = new Set(['main', 'nav', 'aside', 'header', 'footer', 'section', 'article']);

/** An area entry for the right panel (original or promoted). */
interface EffectiveArea {
	name: string;
	elementCount: number;
	color: string;
	isPromoted: boolean;
}

@customElement('up-doc-area-picker-modal')
export class UpDocAreaPickerModalElement extends UmbModalBaseElement<
	AreaPickerModalData,
	AreaPickerModalValue
> {
	@state() private _excluded = new Set<string>();
	@state() private _overrides: ContainerOverride[] = [];
	@state() private _selectedContainers = new Set<string>();
	@state() private _collapsedNodes = new Set<string>();
	@state() private _showAllContainers = false;

	override connectedCallback() {
		super.connectedCallback();
		this._excluded = new Set(this.data?.excludedAreas ?? []);
		this._overrides = [...(this.data?.containerOverrides ?? [])];
	}

	// =========================================================================
	// Data helpers
	// =========================================================================

	/** Check whether a node passes the current filter (named containers only, or all). */
	#passesFilter(node: ContainerTreeNode): boolean {
		if (this._showAllContainers) return true;
		return !!(node.className || node.id);
	}

	/** Check whether a node or any descendant passes the filter (so we don't hide branches with named children). */
	#hasVisibleDescendant(node: ContainerTreeNode): boolean {
		if (this.#passesFilter(node)) return true;
		for (const child of node.children ?? []) {
			if (this.#hasVisibleDescendant(child)) return true;
		}
		return false;
	}

	/** Get the filtered container tree roots. */
	get #containers(): ContainerTreeNode[] {
		return this.data?.containers ?? [];
	}

	/** Build the effective area list: original areas + any newly promoted areas. */
	get #effectiveAreas(): EffectiveArea[] {
		const baseAreas = this.data?.areas ?? [];
		const areas: EffectiveArea[] = baseAreas.map((a) => ({
			name: a.name,
			elementCount: a.elementCount,
			color: a.color,
			isPromoted: false,
		}));

		// Add promoted areas not already in the base list
		for (const override of this._overrides) {
			if (override.action === 'promoteToArea' && override.label) {
				if (!areas.some((a) => a.name === override.label)) {
					const node = this.#findNodeByPath(this.#containers, override.containerPath);
					areas.push({
						name: override.label,
						elementCount: node?.elementCount ?? 0,
						color: '#FFCC80',
						isPromoted: true,
					});
				}
			}
		}

		return areas;
	}

	/** Find a node in the tree by its path. */
	#findNodeByPath(nodes: ContainerTreeNode[], path: string): ContainerTreeNode | null {
		for (const node of nodes) {
			if (node.path === path) return node;
			if (node.children) {
				const found = this.#findNodeByPath(node.children, path);
				if (found) return found;
			}
		}
		return null;
	}

	// =========================================================================
	// Event handlers
	// =========================================================================

	#toggleArea(kebabName: string) {
		const next = new Set(this._excluded);
		if (next.has(kebabName)) {
			next.delete(kebabName);
		} else {
			next.add(kebabName);
		}
		this._excluded = next;
	}

	#toggleContainer(path: string) {
		const next = new Set(this._selectedContainers);
		if (next.has(path)) {
			next.delete(path);
		} else {
			next.add(path);
		}
		this._selectedContainers = next;
	}

	#toggleNode(path: string) {
		const next = new Set(this._collapsedNodes);
		if (next.has(path)) {
			next.delete(path);
		} else {
			next.add(path);
		}
		this._collapsedNodes = next;
	}

	#getOverride(path: string): ContainerOverride | undefined {
		return this._overrides.find((o) => o.containerPath === path);
	}

	#applyAction(action: 'promoteToArea' | 'makeSection') {
		const next = [...this._overrides];
		for (const path of this._selectedContainers) {
			const existing = next.findIndex((o) => o.containerPath === path);
			const override: ContainerOverride = { containerPath: path, action };
			if (action === 'promoteToArea') {
				override.label = this.#deriveLabel(path);
			}
			if (existing >= 0) {
				next[existing] = override;
			} else {
				next.push(override);
			}
		}
		this._overrides = next;
		this._selectedContainers = new Set();
	}

	#removeOverrides() {
		const next = this._overrides.filter((o) => !this._selectedContainers.has(o.containerPath));
		this._overrides = next;
		this._selectedContainers = new Set();
	}

	#deriveLabel(containerPath: string): string {
		const lastSegment = containerPath.split('/').pop() || containerPath;
		// Extract class or id: "div.country-banner" → "country-banner", "div#tab1" → "tab1"
		const match = lastSegment.match(/[.#](.+)/);
		const raw = match ? match[1] : lastSegment;
		// Convert kebab-case to Title Case
		return raw.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	#updateLabel(path: string, label: string) {
		const next = this._overrides.map((o) =>
			o.containerPath === path ? { ...o, label } : o
		);
		this._overrides = next;
	}

	#onSubmit() {
		this.value = {
			excludedAreas: [...this._excluded],
			containerOverrides: this._overrides.length > 0 ? this._overrides : undefined,
		};
		this.modalContext?.submit();
	}

	#onClose() {
		this.modalContext?.reject();
	}

	// =========================================================================
	// Render
	// =========================================================================

	override render() {
		const hasContainers = (this.data?.containers?.length ?? 0) > 0;

		return html`
			<umb-body-layout headline="Define Areas">
				${hasContainers ? this.#renderTwoPaneLayout() : this.#renderAreaOnlyLayout()}

				<div slot="actions">
					<uui-button label="Close" @click=${this.#onClose}></uui-button>
					<uui-button label="Save" look="primary" color="positive" @click=${this.#onSubmit}></uui-button>
				</div>
			</umb-body-layout>
		`;
	}

	/** Fallback for non-web sources: just show the area list (no container panel). */
	#renderAreaOnlyLayout() {
		const areas = this.#effectiveAreas;
		const includedCount = areas.filter((a) => !this._excluded.has(normalizeToKebabCase(a.name))).length;

		return html`
			<div id="main">
				<p class="description">
					Select which areas to include in the extraction output.
					Excluded areas will not appear in the Transformed view or be available for mapping.
				</p>
				<p class="summary">${includedCount} of ${areas.length} areas included</p>

				<div class="area-list">
					${areas.map((area) => this.#renderAreaRow(area))}
				</div>
			</div>
		`;
	}

	/** Two-pane layout: tree on left, areas on right. */
	#renderTwoPaneLayout() {
		return html`
			<div class="editor-layout">
				${this.#renderTreePanel()}
				${this.#renderAreaPanel()}
			</div>
		`;
	}

	// =========================================================================
	// Left panel: DOM tree
	// =========================================================================

	#renderTreePanel() {
		const selectedCount = this._selectedContainers.size;
		const hasSelectedWithOverride = [...this._selectedContainers].some((p) => this.#getOverride(p));

		return html`
			<div class="tree-panel">
				<div class="tree-toolbar">
					<p class="description">
						Select containers to promote to areas or mark as section boundaries.
					</p>
					<label class="filter-toggle">
						<uui-toggle
							label="Named containers only"
							?checked=${!this._showAllContainers}
							@change=${(e: Event) => {
								this._showAllContainers = !(e.target as any).checked;
							}}>
						</uui-toggle>
						Named containers only
					</label>
				</div>

				<div class="tree-container">
					${this.#containers.map((node) => this.#renderTreeNode(node))}
				</div>

				${selectedCount > 0 ? html`
					<div class="action-bar">
						<span class="selected-count">${selectedCount} selected</span>
						<uui-button-group>
							<uui-button
								label="Promote to Area"
								look="primary"
								compact
								@click=${() => this.#applyAction('promoteToArea')}>
								Promote to Area
							</uui-button>
							<uui-button
								label="Make Section"
								look="secondary"
								compact
								@click=${() => this.#applyAction('makeSection')}>
								Make Section
							</uui-button>
							${hasSelectedWithOverride ? html`
								<uui-button
									label="Remove Override"
									look="default"
									color="danger"
									compact
									@click=${this.#removeOverrides}>
									Remove
								</uui-button>
							` : nothing}
						</uui-button-group>
					</div>
				` : nothing}
			</div>
		`;
	}

	#renderTreeNode(node: ContainerTreeNode): unknown {
		// Skip nodes that don't pass the filter and have no visible descendants
		if (!this.#hasVisibleDescendant(node)) return nothing;

		const visibleChildren = (node.children ?? []).filter((c) => this.#hasVisibleDescendant(c));
		const hasChildren = visibleChildren.length > 0;
		const isCollapsed = this._collapsedNodes.has(node.path);
		const isSelected = this._selectedContainers.has(node.path);
		const override = this.#getOverride(node.path);
		const isLandmark = LANDMARK_TAGS.has(node.tag);
		const passesFilter = this.#passesFilter(node);
		const indent = node.depth - 1; // depth 1 = root level, no indent

		return html`
			<div class="tree-node" style="--node-indent: ${indent}">
				<div
					class="tree-node-row ${isSelected ? 'selected' : ''} ${override ? 'has-override' : ''} ${isLandmark ? 'landmark' : ''} ${!passesFilter ? 'unnamed' : ''}"
					@click=${(e: Event) => {
						// Only select if clicking the row itself, not the chevron
						if (!(e.target as HTMLElement).closest('.tree-chevron')) {
							this.#toggleContainer(node.path);
						}
					}}>
					<div class="tree-chevron" @click=${() => hasChildren && this.#toggleNode(node.path)}>
						${hasChildren
							? html`<uui-icon name="${isCollapsed ? 'icon-navigation-right' : 'icon-navigation-down'}"></uui-icon>`
							: html`<span class="tree-chevron-spacer"></span>`}
					</div>
					<span class="tree-node-selector">${node.cssSelector}</span>
					<span class="tree-node-meta">${node.elementCount} el</span>
					${override ? html`
						<div class="override-badge">
							${override.action === 'promoteToArea' ? html`
								<uui-tag color="warning" look="primary" compact>Area</uui-tag>
								<input
									class="label-input"
									type="text"
									.value=${override.label || ''}
									placeholder="Label..."
									@click=${(e: Event) => e.stopPropagation()}
									@input=${(e: Event) => {
										const input = e.target as HTMLInputElement;
										this.#updateLabel(node.path, input.value);
									}} />
							` : html`
								<uui-tag color="positive" look="primary" compact>Section</uui-tag>
							`}
						</div>
					` : nothing}
				</div>
				${hasChildren && !isCollapsed ? html`
					<div class="tree-node-children">
						${visibleChildren.map((child) => this.#renderTreeNode(child))}
					</div>
				` : nothing}
			</div>
		`;
	}

	// =========================================================================
	// Right panel: Area list with include/exclude
	// =========================================================================

	#renderAreaPanel() {
		const areas = this.#effectiveAreas;
		const includedCount = areas.filter((a) => !this._excluded.has(normalizeToKebabCase(a.name))).length;

		return html`
			<div class="area-panel">
				<uui-box headline="Areas">
					<div class="area-list">
						${areas.map((area) => this.#renderAreaRow(area))}
					</div>
					<p class="area-summary">${includedCount} of ${areas.length} areas included</p>
				</uui-box>
			</div>
		`;
	}

	#renderAreaRow(area: EffectiveArea) {
		const kebab = normalizeToKebabCase(area.name);
		const included = !this._excluded.has(kebab);

		return html`
			<div
				class="area-row ${included ? '' : 'excluded'}"
				@click=${() => this.#toggleArea(kebab)}>
				<span class="area-color" style="background: ${area.color};"></span>
				<uui-checkbox
					label="${area.name}"
					?checked=${included}
					@change=${(e: Event) => { e.stopPropagation(); this.#toggleArea(kebab); }}>
				</uui-checkbox>
				<span class="area-name">${area.name}</span>
				<span class="area-count">${area.elementCount} element${area.elementCount !== 1 ? 's' : ''}</span>
				${area.isPromoted ? html`<uui-tag color="warning" look="primary" compact>New</uui-tag>` : nothing}
			</div>
		`;
	}

	// =========================================================================
	// Styles
	// =========================================================================

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
				height: 100%;
			}

			/* Fallback single-pane layout */
			#main {
				padding: var(--uui-size-layout-1);
			}

			/* Two-pane layout */
			.editor-layout {
				display: flex;
				gap: var(--uui-size-space-4);
				height: 100%;
				min-height: 0;
			}

			/* Left panel: Tree */
			.tree-panel {
				flex: 1;
				display: flex;
				flex-direction: column;
				min-width: 0;
				overflow-y: auto;
				padding: var(--uui-size-space-4);
			}

			.tree-toolbar {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-2);
				margin-bottom: var(--uui-size-space-4);
			}

			.filter-toggle {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				cursor: pointer;
				user-select: none;
			}

			.tree-container {
				flex: 1;
				overflow-y: auto;
			}

			/* Tree node rows */
			.tree-node-row {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: 4px 8px;
				padding-left: calc(var(--node-indent, 0) * 20px + 8px);
				cursor: pointer;
				user-select: none;
				border-radius: var(--uui-border-radius);
				transition: background-color 80ms;
			}

			.tree-node-row:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.tree-node-row.selected {
				background: var(--uui-color-selected);
			}

			.tree-node-row.has-override {
				border-left: 3px solid var(--uui-color-warning);
			}

			.tree-node-row.landmark {
				background: rgba(255, 235, 59, 0.12);
			}

			.tree-node-row.landmark:hover {
				background: rgba(255, 235, 59, 0.22);
			}

			.tree-node-row.landmark.selected {
				background: var(--uui-color-selected);
			}

			.tree-node-row.unnamed {
				opacity: 0.5;
			}

			/* Chevron */
			.tree-chevron {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 16px;
				height: 16px;
				flex-shrink: 0;
				cursor: pointer;
			}

			.tree-chevron uui-icon {
				font-size: 10px;
			}

			.tree-chevron-spacer {
				display: block;
				width: 16px;
			}

			/* Node content */
			.tree-node-selector {
				font-size: var(--uui-type-small-size);
				font-weight: 500;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				flex: 1;
				min-width: 0;
			}

			.tree-node-meta {
				color: var(--uui-color-text-alt);
				font-size: 11px;
				flex-shrink: 0;
				white-space: nowrap;
			}

			/* Override badges (shared with old layout) */
			.override-badge {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				flex-shrink: 0;
			}

			.label-input {
				width: 100px;
				padding: 2px 6px;
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				font-size: 11px;
				font-family: inherit;
				background: var(--uui-color-surface);
				color: var(--uui-color-text);
			}

			.label-input:focus {
				outline: none;
				border-color: var(--uui-color-focus);
			}

			/* Sticky action bar */
			.action-bar {
				position: sticky;
				bottom: 0;
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface);
				border-top: 1px solid var(--uui-color-border);
				margin-top: var(--uui-size-space-4);
			}

			.selected-count {
				font-weight: 500;
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				margin-right: auto;
			}

			/* Right panel: Areas */
			.area-panel {
				width: 300px;
				flex-shrink: 0;
				overflow-y: auto;
				padding: var(--uui-size-space-4);
				padding-left: 0;
			}

			.area-list {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-1);
			}

			.area-row {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				cursor: pointer;
				transition: background-color 120ms;
			}

			.area-row:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.area-row.excluded {
				opacity: 0.5;
			}

			.area-color {
				width: 12px;
				height: 12px;
				border-radius: 50%;
				flex-shrink: 0;
			}

			uui-checkbox {
				pointer-events: none;
			}

			.area-name {
				flex: 1;
				font-weight: 500;
			}

			.area-count {
				color: var(--uui-color-text-alt);
				font-size: var(--uui-type-small-size);
			}

			.area-summary {
				font-weight: 600;
				text-align: center;
				margin: var(--uui-size-space-4) 0 0 0;
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}

			.description {
				color: var(--uui-color-text-alt);
				margin: 0 0 var(--uui-size-space-3) 0;
			}

			.summary {
				font-weight: 600;
				margin: 0 0 var(--uui-size-space-5) 0;
			}
		`,
	];
}

export default UpDocAreaPickerModalElement;
