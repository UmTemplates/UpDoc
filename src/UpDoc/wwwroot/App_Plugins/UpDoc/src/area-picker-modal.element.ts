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

@customElement('up-doc-area-picker-modal')
export class UpDocAreaPickerModalElement extends UmbModalBaseElement<
	AreaPickerModalData,
	AreaPickerModalValue
> {
	@state() private _excluded = new Set<string>();
	@state() private _overrides: ContainerOverride[] = [];
	@state() private _selectedContainers = new Set<string>();
	@state() private _flatContainers: FlatContainer[] = [];

	override connectedCallback() {
		super.connectedCallback();
		this._excluded = new Set(this.data?.excludedAreas ?? []);
		this._overrides = [...(this.data?.containerOverrides ?? [])];
		this._flatContainers = this.#flattenContainers(this.data?.containers ?? null);
	}

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

	override render() {
		const areas = this.data?.areas ?? [];
		const includedCount = areas.filter((a) => !this._excluded.has(normalizeToKebabCase(a.name))).length;
		const hasContainers = this._flatContainers.length > 0;

		return html`
			<umb-body-layout headline="Choose Areas">
				<div id="main">
					<p class="description">
						Select which areas to include in the extraction output.
						Excluded areas will not appear in the Transformed view or be available for mapping.
					</p>
					<p class="summary">${includedCount} of ${areas.length} areas included</p>

					<div class="area-list">
						${areas.map((area) => {
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
								</div>
							`;
						})}
					</div>

					${hasContainers ? this.#renderContainerOverrides() : nothing}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${this.#onClose}></uui-button>
					<uui-button label="Save" look="primary" color="positive" @click=${this.#onSubmit}></uui-button>
				</div>
			</umb-body-layout>
		`;
	}

	#renderContainerOverrides() {
		const selectedCount = this._selectedContainers.size;
		const hasSelectedWithOverride = [...this._selectedContainers].some((p) => this.#getOverride(p));

		return html`
			<hr class="section-divider" />
			<h4 class="section-heading">Container Overrides</h4>
			<p class="description">
				Promote containers to independent areas, or mark them as section boundaries within their parent area.
			</p>

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

			<div class="container-list">
				${this._flatContainers.map((c) => {
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
									· in: ${c.area}
								</span>
							</div>
							${override ? html`
								<div class="override-badge">
									${override.action === 'promoteToArea' ? html`
										<uui-tag color="warning" look="primary" compact>
											Area${override.label ? `: ${override.label}` : ''}
										</uui-tag>
										${override.action === 'promoteToArea' ? html`
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
										` : nothing}
									` : html`
										<uui-tag color="positive" look="primary" compact>Section</uui-tag>
									`}
								</div>
							` : nothing}
						</div>
					`;
				})}
			</div>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			#main {
				padding: var(--uui-size-layout-1);
			}

			.description {
				color: var(--uui-color-text-alt);
				margin: 0 0 var(--uui-size-space-3) 0;
			}

			.summary {
				font-weight: 600;
				margin: 0 0 var(--uui-size-space-5) 0;
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

			/* Container overrides section */
			.section-divider {
				border: none;
				border-top: 1px solid var(--uui-color-border);
				margin: var(--uui-size-space-6) 0;
			}

			.section-heading {
				margin: 0 0 var(--uui-size-space-2) 0;
				font-size: var(--uui-type-default-size);
				font-weight: 600;
			}

			.action-bar {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				margin: var(--uui-size-space-4) 0;
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-radius: var(--uui-border-radius);
			}

			.selected-count {
				font-weight: 500;
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				margin-right: auto;
			}

			.container-list {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-1);
			}

			.container-row {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				cursor: pointer;
				transition: background-color 120ms;
			}

			.container-row:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.container-row.selected {
				background: var(--uui-color-selected);
				border-color: var(--uui-color-selected-emphasis);
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
		`,
	];
}

export default UpDocAreaPickerModalElement;
