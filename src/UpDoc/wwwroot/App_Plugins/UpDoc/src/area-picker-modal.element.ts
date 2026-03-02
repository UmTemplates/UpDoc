import type { AreaPickerModalData, AreaPickerModalValue } from './area-picker-modal.token.js';
import { normalizeToKebabCase } from './transforms.js';
import { html, css, state, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

@customElement('up-doc-area-picker-modal')
export class UpDocAreaPickerModalElement extends UmbModalBaseElement<
	AreaPickerModalData,
	AreaPickerModalValue
> {
	@state() private _excluded = new Set<string>();

	override connectedCallback() {
		super.connectedCallback();
		this._excluded = new Set(this.data?.excludedAreas ?? []);
	}

	#toggle(kebabName: string) {
		const next = new Set(this._excluded);
		if (next.has(kebabName)) {
			next.delete(kebabName);
		} else {
			next.add(kebabName);
		}
		this._excluded = next;
	}

	#onSubmit() {
		this.value = { excludedAreas: [...this._excluded] };
		this.modalContext?.submit();
	}

	#onClose() {
		this.modalContext?.reject();
	}

	override render() {
		const areas = this.data?.areas ?? [];
		const includedCount = areas.filter((a) => !this._excluded.has(normalizeToKebabCase(a.name))).length;

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
									@click=${() => this.#toggle(kebab)}>
									<span class="area-color" style="background: ${area.color};"></span>
									<uui-checkbox
										label="${area.name}"
										?checked=${included}
										@change=${(e: Event) => { e.stopPropagation(); this.#toggle(kebab); }}>
									</uui-checkbox>
									<span class="area-name">${area.name}</span>
									<span class="area-count">${area.elementCount} element${area.elementCount !== 1 ? 's' : ''}</span>
								</div>
							`;
						})}
					</div>
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${this.#onClose}></uui-button>
					<uui-button label="Save" look="primary" color="positive" @click=${this.#onSubmit}></uui-button>
				</div>
			</umb-body-layout>
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
		`,
	];
}

export default UpDocAreaPickerModalElement;
