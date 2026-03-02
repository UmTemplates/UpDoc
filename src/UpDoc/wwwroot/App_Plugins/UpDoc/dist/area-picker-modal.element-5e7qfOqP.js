import { n as d } from "./transforms-BkZeboOX.js";
import { html as p, css as f, state as b, customElement as _ } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as g } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as y } from "@umbraco-cms/backoffice/style";
var w = Object.defineProperty, k = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, m = (e, a, t, o) => {
  for (var r = o > 1 ? void 0 : o ? k(a, t) : a, i = e.length - 1, c; i >= 0; i--)
    (c = e[i]) && (r = (o ? c(a, t, r) : c(r)) || r);
  return o && r && w(a, t, r), r;
}, C = (e, a, t) => a.has(e) || h("Cannot " + t), $ = (e, a, t) => a.has(e) ? h("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, t), l = (e, a, t) => (C(e, a, "access private method"), t), s, u, v, x;
let n = class extends g {
  constructor() {
    super(...arguments), $(this, s), this._excluded = /* @__PURE__ */ new Set();
  }
  connectedCallback() {
    super.connectedCallback(), this._excluded = new Set(this.data?.excludedAreas ?? []);
  }
  render() {
    const e = this.data?.areas ?? [], a = e.filter((t) => !this._excluded.has(d(t.name))).length;
    return p`
			<umb-body-layout headline="Choose Areas">
				<div id="main">
					<p class="description">
						Select which areas to include in the extraction output.
						Excluded areas will not appear in the Transformed view or be available for mapping.
					</p>
					<p class="summary">${a} of ${e.length} areas included</p>

					<div class="area-list">
						${e.map((t) => {
      const o = d(t.name), r = !this._excluded.has(o);
      return p`
								<div
									class="area-row ${r ? "" : "excluded"}"
									@click=${() => l(this, s, u).call(this, o)}>
									<span class="area-color" style="background: ${t.color};"></span>
									<uui-checkbox
										label="${t.name}"
										?checked=${r}
										@change=${(i) => {
        i.stopPropagation(), l(this, s, u).call(this, o);
      }}>
									</uui-checkbox>
									<span class="area-name">${t.name}</span>
									<span class="area-count">${t.elementCount} element${t.elementCount !== 1 ? "s" : ""}</span>
								</div>
							`;
    })}
					</div>
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${l(this, s, x)}></uui-button>
					<uui-button label="Save" look="primary" color="positive" @click=${l(this, s, v)}></uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
s = /* @__PURE__ */ new WeakSet();
u = function(e) {
  const a = new Set(this._excluded);
  a.has(e) ? a.delete(e) : a.add(e), this._excluded = a;
};
v = function() {
  this.value = { excludedAreas: [...this._excluded] }, this.modalContext?.submit();
};
x = function() {
  this.modalContext?.reject();
};
n.styles = [
  y,
  f`
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
		`
];
m([
  b()
], n.prototype, "_excluded", 2);
n = m([
  _("up-doc-area-picker-modal")
], n);
const A = n;
export {
  n as UpDocAreaPickerModalElement,
  A as default
};
//# sourceMappingURL=area-picker-modal.element-5e7qfOqP.js.map
