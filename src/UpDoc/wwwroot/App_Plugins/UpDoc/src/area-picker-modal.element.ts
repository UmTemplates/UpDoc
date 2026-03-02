import type { AreaPickerModalData, AreaPickerModalValue } from './area-picker-modal.token.js';
import type { ContainerTreeNode, ContainerOverride } from './workflow.types.js';
import { normalizeToKebabCase } from './transforms.js';
import { html, css, nothing, state, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

/** Flattened container for display in the UI. */
interface FlatContainer {
	path: string;
	cssSelector: string;
	elementCount: number;
	area: string;
	depth: number;
}

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
	@state() private _flatContainers: FlatContainer[] = [];
	@state() private _collapsedGroups = new Set<string>();

	override connectedCallback() {
		super.connectedCallback();
		this._excluded = new Set(this.data?.excludedAreas ?? []);
		this._overrides = [...(this.data?.containerOverrides ?? [])];
		this._flatContainers = this.#flattenContainers(this.data?.containers ?? null);
	}

	// =========================================================================
	// Data helpers
	// =========================================================================

	/** Flatten container tree, keeping only nodes with a class or id (not bare divs/spans). */
	#flattenContainers(nodes: ContainerTreeNode[] | null | undefined): FlatContainer[] {
		if (!nodes) return [];
		const result: FlatContainer[] = [];
		const walk = (node: ContainerTreeNode) => {
			if (node.className || node.id) {
				result.push({
					path: node.path,
					cssSelector: node.cssSelector,
					elementCount: node.elementCount,
					area: node.area || 'Unknown',
					depth: node.depth,
				});
			}
			if (node.children) {
				for (const child of node.children) {
					walk(child);
				}
			}
		};
		for (const node of nodes) {
			walk(node);
		}
		return result;
	}

	/** Get the effective area for a container, considering promoteToArea overrides. */
	#getEffectiveArea(container: FlatContainer): string {
		for (const override of this._overrides) {
			if (override.action === 'promoteToArea' && container.path.startsWith(override.containerPath)) {
				return override.label || container.area;
			}
		}
		return container.area;
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
					const matchingContainer = this._flatContainers.find(
						(c) => c.path === override.containerPath
					);
					areas.push({
						name: override.label,
						elementCount: matchingContainer?.elementCount ?? 0,
						color: '#FFCC80',
						isPromoted: true,
					});
				}
			}
		}

		return areas;
	}

	/** Group containers by their effective area, maintaining area order. */
	get #containersByArea(): Array<{ areaName: string; color: string; containers: FlatContainer[] }> {
		const effectiveAreas = this.#effectiveAreas;
		const groups = new Map<string, FlatContainer[]>();

		for (const container of this._flatContainers) {
			const area = this.#getEffectiveArea(container);
			if (!groups.has(area)) {
				groups.set(area, []);
			}
			groups.get(area)!.push(container);
		}

		// Return in area order, then any remaining groups
		const result: Array<{ areaName: string; color: string; containers: FlatContainer[] }> = [];
		const seen = new Set<string>();

		for (const area of effectiveAreas) {
			if (groups.has(area.name)) {
				result.push({
					areaName: area.name,
					color: area.color,
					containers: groups.get(area.name)!,
				});
				seen.add(area.name);
			}
		}

		// Any groups not in the area list (shouldn't happen, but safety)
		for (const [areaName, containers] of groups) {
			if (!seen.has(areaName)) {
				result.push({ areaName, color: '#999999', containers });
			}
		}

		return result;
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

	#toggleGroup(areaName: string) {
		const next = new Set(this._collapsedGroups);
		if (next.has(areaName)) {
			next.delete(areaName);
		} else {
			next.add(areaName);
		}
		this._collapsedGroups = next;
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
		const hasContainers = this._flatContainers.length > 0;

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

	/** Two-pane layout: containers on left, areas on right. */
	#renderTwoPaneLayout() {
		return html`
			<div class="editor-layout">
				${this.#renderContainerPanel()}
				${this.#renderAreaPanel()}
			</div>
		`;
	}

	// =========================================================================
	// Left panel: Containers grouped by area
	// =========================================================================

	#renderContainerPanel() {
		const groups = this.#containersByArea;
		const selectedCount = this._selectedContainers.size;
		const hasSelectedWithOverride = [...this._selectedContainers].some((p) => this.#getOverride(p));

		return html`
			<div class="container-panel">
				<p class="description">
					Promote containers to independent areas, or mark them as section boundaries.
				</p>

				<div class="container-groups">
					${groups.map((group) => this.#renderContainerGroup(group))}
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

	#renderContainerGroup(group: { areaName: string; color: string; containers: FlatContainer[] }) {
		const collapsed = this._collapsedGroups.has(group.areaName);
		const overrideCount = group.containers.filter((c) => this.#getOverride(c.path)).length;

		return html`
			<div class="container-group">
				<div class="group-header" @click=${() => this.#toggleGroup(group.areaName)}>
					<uui-icon name=${collapsed ? 'icon-navigation-right' : 'icon-navigation-down'}></uui-icon>
					<span class="area-color" style="background: ${group.color};"></span>
					<span class="group-name">${group.areaName}</span>
					<span class="group-meta">
						${group.containers.length} container${group.containers.length !== 1 ? 's' : ''}
						${overrideCount > 0 ? html`<span class="override-count">${overrideCount} override${overrideCount !== 1 ? 's' : ''}</span>` : nothing}
					</span>
				</div>

				${!collapsed ? html`
					<div class="group-containers">
						${group.containers.map((c) => this.#renderContainerRow(c))}
					</div>
				` : nothing}
			</div>
		`;
	}

	#renderContainerRow(c: FlatContainer) {
		const override = this.#getOverride(c.path);
		const selected = this._selectedContainers.has(c.path);

		return html`
			<div
				class="container-row ${selected ? 'selected' : ''} ${override ? 'has-override' : ''}"
				@click=${() => this.#toggleContainer(c.path)}>
				<uui-checkbox
					label="${c.cssSelector}"
					?checked=${selected}
					@change=${(e: Event) => { e.stopPropagation(); this.#toggleContainer(c.path); }}>
				</uui-checkbox>
				<div class="container-info">
					<span class="container-selector">${c.cssSelector}</span>
					<span class="container-meta">
						${c.elementCount} element${c.elementCount !== 1 ? 's' : ''}
					</span>
				</div>
				${override ? html`
					<div class="override-badge">
						${override.action === 'promoteToArea' ? html`
							<uui-tag color="warning" look="primary" compact>
								Area
							</uui-tag>
							<input
								class="label-input"
								type="text"
								.value=${override.label || ''}
								placeholder="Label..."
								@click=${(e: Event) => e.stopPropagation()}
								@input=${(e: Event) => {
									const input = e.target as HTMLInputElement;
									this.#updateLabel(c.path, input.value);
								}} />
						` : html`
							<uui-tag color="positive" look="primary" compact>Section</uui-tag>
						`}
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

			/* Left panel: Containers */
			.container-panel {
				flex: 1;
				display: flex;
				flex-direction: column;
				min-width: 0;
				overflow-y: auto;
				padding: var(--uui-size-space-4);
			}

			.container-groups {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-2);
			}

			.container-group {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				overflow: hidden;
			}

			.group-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				cursor: pointer;
				user-select: none;
			}

			.group-header:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.group-header uui-icon {
				font-size: 10px;
				flex-shrink: 0;
			}

			.group-name {
				font-weight: 600;
				flex: 1;
			}

			.group-meta {
				color: var(--uui-color-text-alt);
				font-size: var(--uui-type-small-size);
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			.override-count {
				color: var(--uui-color-warning-emphasis);
				font-weight: 500;
			}

			.group-containers {
				display: flex;
				flex-direction: column;
			}

			/* Container rows */
			.container-row {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				padding-left: var(--uui-size-space-6);
				border-top: 1px solid var(--uui-color-border);
				cursor: pointer;
				transition: background-color 120ms;
			}

			.container-row:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.container-row.selected {
				background: var(--uui-color-selected);
			}

			.container-row.has-override {
				border-left: 3px solid var(--uui-color-warning);
			}

			.container-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 2px;
				min-width: 0;
			}

			.container-selector {
				font-weight: 500;
				font-size: var(--uui-type-small-size);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.container-meta {
				color: var(--uui-color-text-alt);
				font-size: 11px;
			}

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
