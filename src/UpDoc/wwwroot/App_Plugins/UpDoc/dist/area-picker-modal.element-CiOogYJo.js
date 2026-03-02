import { n as g } from "./transforms-BkZeboOX.js";
import { nothing as d, html as c, css as S, state as h, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as A } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as O } from "@umbraco-cms/backoffice/style";
var E = Object.defineProperty, T = Object.getOwnPropertyDescriptor, x = (t) => {
  throw TypeError(t);
}, p = (t, e, a, i) => {
  for (var r = i > 1 ? void 0 : i ? T(e, a) : e, n = t.length - 1, u; n >= 0; n--)
    (u = t[n]) && (r = (i ? u(e, a, r) : u(r)) || r);
  return i && r && E(e, a, r), r;
}, M = (t, e, a) => e.has(t) || x("Cannot " + a), U = (t, e, a) => e.has(t) ? x("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), s = (t, e, a) => (M(t, e, "access private method"), a), o, _, v, f, m, b, w, C, k, $, y, z;
let l = class extends A {
  constructor() {
    super(...arguments), U(this, o), this._excluded = /* @__PURE__ */ new Set(), this._overrides = [], this._selectedContainers = /* @__PURE__ */ new Set(), this._flatContainers = [];
  }
  connectedCallback() {
    super.connectedCallback(), this._excluded = new Set(this.data?.excludedAreas ?? []), this._overrides = [...this.data?.containerOverrides ?? []], this._flatContainers = s(this, o, _).call(this, this.data?.containers ?? null);
  }
  render() {
    const t = this.data?.areas ?? [], e = t.filter((i) => !this._excluded.has(g(i.name))).length, a = this._flatContainers.length > 0;
    return c`
			<umb-body-layout headline="Choose Areas">
				<div id="main">
					<p class="description">
						Select which areas to include in the extraction output.
						Excluded areas will not appear in the Transformed view or be available for mapping.
					</p>
					<p class="summary">${e} of ${t.length} areas included</p>

					<div class="area-list">
						${t.map((i) => {
      const r = g(i.name), n = !this._excluded.has(r);
      return c`
								<div
									class="area-row ${n ? "" : "excluded"}"
									@click=${() => s(this, o, v).call(this, r)}>
									<span class="area-color" style="background: ${i.color};"></span>
									<uui-checkbox
										label="${i.name}"
										?checked=${n}
										@change=${(u) => {
        u.stopPropagation(), s(this, o, v).call(this, r);
      }}>
									</uui-checkbox>
									<span class="area-name">${i.name}</span>
									<span class="area-count">${i.elementCount} element${i.elementCount !== 1 ? "s" : ""}</span>
								</div>
							`;
    })}
					</div>

					${a ? s(this, o, z).call(this) : d}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${s(this, o, y)}></uui-button>
					<uui-button label="Save" look="primary" color="positive" @click=${s(this, o, $)}></uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
o = /* @__PURE__ */ new WeakSet();
_ = function(t) {
  if (!t) return [];
  const e = [], a = (i) => {
    if ((i.className || i.id) && e.push({
      path: i.path,
      cssSelector: i.cssSelector,
      elementCount: i.elementCount,
      area: i.area || "Unknown",
      depth: i.depth
    }), i.children)
      for (const r of i.children)
        a(r);
  };
  for (const i of t)
    a(i);
  return e;
};
v = function(t) {
  const e = new Set(this._excluded);
  e.has(t) ? e.delete(t) : e.add(t), this._excluded = e;
};
f = function(t) {
  const e = new Set(this._selectedContainers);
  e.has(t) ? e.delete(t) : e.add(t), this._selectedContainers = e;
};
m = function(t) {
  return this._overrides.find((e) => e.containerPath === t);
};
b = function(t) {
  const e = [...this._overrides];
  for (const a of this._selectedContainers) {
    const i = e.findIndex((n) => n.containerPath === a), r = { containerPath: a, action: t };
    t === "promoteToArea" && (r.label = s(this, o, C).call(this, a)), i >= 0 ? e[i] = r : e.push(r);
  }
  this._overrides = e, this._selectedContainers = /* @__PURE__ */ new Set();
};
w = function() {
  const t = this._overrides.filter((e) => !this._selectedContainers.has(e.containerPath));
  this._overrides = t, this._selectedContainers = /* @__PURE__ */ new Set();
};
C = function(t) {
  const e = t.split("/").pop() || t, a = e.match(/[.#](.+)/);
  return (a ? a[1] : e).replace(/[-_]/g, " ").replace(/\b\w/g, (r) => r.toUpperCase());
};
k = function(t, e) {
  const a = this._overrides.map(
    (i) => i.containerPath === t ? { ...i, label: e } : i
  );
  this._overrides = a;
};
$ = function() {
  this.value = {
    excludedAreas: [...this._excluded],
    containerOverrides: this._overrides.length > 0 ? this._overrides : void 0
  }, this.modalContext?.submit();
};
y = function() {
  this.modalContext?.reject();
};
z = function() {
  const t = this._selectedContainers.size, e = [...this._selectedContainers].some((a) => s(this, o, m).call(this, a));
  return c`
			<hr class="section-divider" />
			<h4 class="section-heading">Container Overrides</h4>
			<p class="description">
				Promote containers to independent areas, or mark them as section boundaries within their parent area.
			</p>

			${t > 0 ? c`
				<div class="action-bar">
					<span class="selected-count">${t} selected</span>
					<uui-button-group>
						<uui-button
							label="Promote to Area"
							look="primary"
							compact
							@click=${() => s(this, o, b).call(this, "promoteToArea")}>
							Promote to Area
						</uui-button>
						<uui-button
							label="Make Section"
							look="secondary"
							compact
							@click=${() => s(this, o, b).call(this, "makeSection")}>
							Make Section
						</uui-button>
						${e ? c`
							<uui-button
								label="Remove Override"
								look="default"
								color="danger"
								compact
								@click=${s(this, o, w)}>
								Remove
							</uui-button>
						` : d}
					</uui-button-group>
				</div>
			` : d}

			<div class="container-list">
				${this._flatContainers.map((a) => {
    const i = s(this, o, m).call(this, a.path), r = this._selectedContainers.has(a.path);
    return c`
						<div
							class="container-row ${r ? "selected" : ""} ${i ? "has-override" : ""}"
							@click=${() => s(this, o, f).call(this, a.path)}>
							<uui-checkbox
								label="${a.cssSelector}"
								?checked=${r}
								@change=${(n) => {
      n.stopPropagation(), s(this, o, f).call(this, a.path);
    }}>
							</uui-checkbox>
							<div class="container-info">
								<span class="container-selector">${a.cssSelector}</span>
								<span class="container-meta">
									${a.elementCount} element${a.elementCount !== 1 ? "s" : ""}
									· in: ${a.area}
								</span>
							</div>
							${i ? c`
								<div class="override-badge">
									${i.action === "promoteToArea" ? c`
										<uui-tag color="warning" look="primary" compact>
											Area${i.label ? `: ${i.label}` : ""}
										</uui-tag>
										${i.action === "promoteToArea" ? c`
											<input
												class="label-input"
												type="text"
												.value=${i.label || ""}
												placeholder="Label..."
												@click=${(n) => n.stopPropagation()}
												@input=${(n) => {
      const u = n.target;
      s(this, o, k).call(this, a.path, u.value);
    }} />
										` : d}
									` : c`
										<uui-tag color="positive" look="primary" compact>Section</uui-tag>
									`}
								</div>
							` : d}
						</div>
					`;
  })}
			</div>
		`;
};
l.styles = [
  O,
  S`
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
		`
];
p([
  h()
], l.prototype, "_excluded", 2);
p([
  h()
], l.prototype, "_overrides", 2);
p([
  h()
], l.prototype, "_selectedContainers", 2);
p([
  h()
], l.prototype, "_flatContainers", 2);
l = p([
  P("up-doc-area-picker-modal")
], l);
const j = l;
export {
  l as UpDocAreaPickerModalElement,
  j as default
};
//# sourceMappingURL=area-picker-modal.element-CiOogYJo.js.map
