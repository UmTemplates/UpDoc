import { n as w } from "./transforms-C32fF-cq.js";
import { html as s, nothing as d, css as K, state as v, customElement as I } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as V } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as j } from "@umbraco-cms/backoffice/style";
var q = Object.defineProperty, H = Object.getOwnPropertyDescriptor, A = (e) => {
  throw TypeError(e);
}, h = (e, t, i, o) => {
  for (var n = o > 1 ? void 0 : o ? H(t, i) : t, l = e.length - 1, p; l >= 0; l--)
    (p = e[l]) && (n = (o ? p(t, i, n) : p(n)) || n);
  return o && n && q(t, i, n), n;
}, S = (e, t, i) => t.has(e) || A("Cannot " + i), m = (e, t, i) => (S(e, t, "read from private field"), i ? i.call(e) : t.get(e)), J = (e, t, i) => t.has(e) ? A("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (S(e, t, "access private method"), i), a, y, f, k, $, g, b, P, T, C, x, N, O, D, E, L, M, U, F, _, R, z;
const Q = /* @__PURE__ */ new Set(["main", "nav", "aside", "header", "footer", "section", "article"]);
let u = class extends V {
  constructor() {
    super(...arguments), J(this, a), this._excluded = /* @__PURE__ */ new Set(), this._overrides = [], this._selectedContainers = /* @__PURE__ */ new Set(), this._collapsedNodes = /* @__PURE__ */ new Set(), this._showAllContainers = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._excluded = new Set(this.data?.excludedAreas ?? []), this._overrides = [...this.data?.containerOverrides ?? []];
  }
  // =========================================================================
  // Render
  // =========================================================================
  render() {
    const e = (this.data?.containers?.length ?? 0) > 0;
    return s`
			<umb-body-layout headline="Define Areas">
				${e ? r(this, a, U).call(this) : r(this, a, M).call(this)}

				<div slot="actions">
					<uui-button label="Close" @click=${r(this, a, L)}></uui-button>
					<uui-button label="Save" look="primary" color="positive" @click=${r(this, a, E)}></uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
a = /* @__PURE__ */ new WeakSet();
y = function(e) {
  return this._showAllContainers ? !0 : !!(e.className || e.id);
};
f = function(e) {
  if (r(this, a, y).call(this, e)) return !0;
  for (const t of e.children ?? [])
    if (r(this, a, f).call(this, t)) return !0;
  return !1;
};
k = function() {
  return this.data?.containers ?? [];
};
$ = function() {
  const t = (this.data?.areas ?? []).map((i) => ({
    name: i.name,
    elementCount: i.elementCount,
    color: i.color,
    isPromoted: !1
  }));
  for (const i of this._overrides)
    if (i.action === "promoteToArea" && i.label && !t.some((o) => o.name === i.label)) {
      const o = r(this, a, g).call(this, m(this, a, k), i.containerPath);
      t.push({
        name: i.label,
        elementCount: o?.elementCount ?? 0,
        color: "#FFCC80",
        isPromoted: !0
      });
    }
  return t;
};
g = function(e, t) {
  for (const i of e) {
    if (i.path === t) return i;
    if (i.children) {
      const o = r(this, a, g).call(this, i.children, t);
      if (o) return o;
    }
  }
  return null;
};
b = function(e) {
  const t = new Set(this._excluded);
  t.has(e) ? t.delete(e) : t.add(e), this._excluded = t;
};
P = function(e) {
  const t = new Set(this._selectedContainers);
  t.has(e) ? t.delete(e) : t.add(e), this._selectedContainers = t;
};
T = function(e) {
  const t = new Set(this._collapsedNodes);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsedNodes = t;
};
C = function(e) {
  return this._overrides.find((t) => t.containerPath === e);
};
x = function(e) {
  const t = [...this._overrides];
  for (const i of this._selectedContainers) {
    const o = t.findIndex((l) => l.containerPath === i), n = { containerPath: i, action: e };
    e === "promoteToArea" && (n.label = r(this, a, O).call(this, i)), o >= 0 ? t[o] = n : t.push(n);
  }
  this._overrides = t, this._selectedContainers = /* @__PURE__ */ new Set();
};
N = function() {
  const e = this._overrides.filter((t) => !this._selectedContainers.has(t.containerPath));
  this._overrides = e, this._selectedContainers = /* @__PURE__ */ new Set();
};
O = function(e) {
  const t = e.split("/").pop() || e, i = t.match(/[.#](.+)/);
  return (i ? i[1] : t).replace(/[-_]/g, " ").replace(/\b\w/g, (n) => n.toUpperCase());
};
D = function(e, t) {
  const i = this._overrides.map(
    (o) => o.containerPath === e ? { ...o, label: t } : o
  );
  this._overrides = i;
};
E = function() {
  this.value = {
    excludedAreas: [...this._excluded],
    containerOverrides: this._overrides.length > 0 ? this._overrides : void 0
  }, this.modalContext?.submit();
};
L = function() {
  this.modalContext?.reject();
};
M = function() {
  const e = m(this, a, $), t = e.filter((i) => !this._excluded.has(w(i.name))).length;
  return s`
			<div id="main">
				<p class="description">
					Select which areas to include in the extraction output.
					Excluded areas will not appear in the Transformed view or be available for mapping.
				</p>
				<p class="summary">${t} of ${e.length} areas included</p>

				<div class="area-list">
					${e.map((i) => r(this, a, z).call(this, i))}
				</div>
			</div>
		`;
};
U = function() {
  return s`
			<div class="editor-layout">
				${r(this, a, F).call(this)}
				${r(this, a, R).call(this)}
			</div>
		`;
};
F = function() {
  const e = this._selectedContainers.size, t = [...this._selectedContainers].some((i) => r(this, a, C).call(this, i));
  return s`
			<div class="tree-panel">
				<div class="tree-toolbar">
					<p class="description">
						Select containers to promote to areas or mark as section boundaries.
					</p>
					<label class="filter-toggle">
						<uui-toggle
							label="Named containers only"
							?checked=${!this._showAllContainers}
							@change=${(i) => {
    this._showAllContainers = !i.target.checked;
  }}>
						</uui-toggle>
						Named containers only
					</label>
				</div>

				<div class="tree-container">
					${m(this, a, k).map((i) => r(this, a, _).call(this, i))}
				</div>

				${e > 0 ? s`
					<div class="action-bar">
						<span class="selected-count">${e} selected</span>
						<uui-button-group>
							<uui-button
								label="Promote to Area"
								look="primary"
								compact
								@click=${() => r(this, a, x).call(this, "promoteToArea")}>
								Promote to Area
							</uui-button>
							<uui-button
								label="Make Section"
								look="secondary"
								compact
								@click=${() => r(this, a, x).call(this, "makeSection")}>
								Make Section
							</uui-button>
							${t ? s`
								<uui-button
									label="Remove Override"
									look="default"
									color="danger"
									compact
									@click=${r(this, a, N)}>
									Remove
								</uui-button>
							` : d}
						</uui-button-group>
					</div>
				` : d}
			</div>
		`;
};
_ = function(e) {
  if (!r(this, a, f).call(this, e)) return d;
  const t = (e.children ?? []).filter((c) => r(this, a, f).call(this, c)), i = t.length > 0, o = this._collapsedNodes.has(e.path), n = this._selectedContainers.has(e.path), l = r(this, a, C).call(this, e.path), p = Q.has(e.tag), W = r(this, a, y).call(this, e), B = e.depth - 1;
  return s`
			<div class="tree-node" style="--node-indent: ${B}">
				<div
					class="tree-node-row ${n ? "selected" : ""} ${l ? "has-override" : ""} ${p ? "landmark" : ""} ${W ? "" : "unnamed"}"
					@click=${(c) => {
    c.target.closest(".tree-chevron") || r(this, a, P).call(this, e.path);
  }}>
					<div class="tree-chevron" @click=${() => i && r(this, a, T).call(this, e.path)}>
						${i ? s`<uui-icon name="${o ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>` : s`<span class="tree-chevron-spacer"></span>`}
					</div>
					<span class="tree-node-selector">${e.cssSelector}</span>
					<span class="tree-node-meta">${e.elementCount} el</span>
					${l ? s`
						<div class="override-badge">
							${l.action === "promoteToArea" ? s`
								<uui-tag color="warning" look="primary" compact>Area</uui-tag>
								<input
									class="label-input"
									type="text"
									.value=${l.label || ""}
									placeholder="Label..."
									@click=${(c) => c.stopPropagation()}
									@input=${(c) => {
    const G = c.target;
    r(this, a, D).call(this, e.path, G.value);
  }} />
							` : s`
								<uui-tag color="positive" look="primary" compact>Section</uui-tag>
							`}
						</div>
					` : d}
				</div>
				${i && !o ? s`
					<div class="tree-node-children">
						${t.map((c) => r(this, a, _).call(this, c))}
					</div>
				` : d}
			</div>
		`;
};
R = function() {
  const e = m(this, a, $), t = e.filter((i) => !this._excluded.has(w(i.name))).length;
  return s`
			<div class="area-panel">
				<uui-box headline="Areas">
					<div class="area-list">
						${e.map((i) => r(this, a, z).call(this, i))}
					</div>
					<p class="area-summary">${t} of ${e.length} areas included</p>
				</uui-box>
			</div>
		`;
};
z = function(e) {
  const t = w(e.name), i = !this._excluded.has(t);
  return s`
			<div
				class="area-row ${i ? "" : "excluded"}"
				@click=${() => r(this, a, b).call(this, t)}>
				<span class="area-color" style="background: ${e.color};"></span>
				<uui-checkbox
					label="${e.name}"
					?checked=${i}
					@change=${(o) => {
    o.stopPropagation(), r(this, a, b).call(this, t);
  }}>
				</uui-checkbox>
				<span class="area-name">${e.name}</span>
				<span class="area-count">${e.elementCount} element${e.elementCount !== 1 ? "s" : ""}</span>
				${e.isPromoted ? s`<uui-tag color="warning" look="primary" compact>New</uui-tag>` : d}
			</div>
		`;
};
u.styles = [
  j,
  K`
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
		`
];
h([
  v()
], u.prototype, "_excluded", 2);
h([
  v()
], u.prototype, "_overrides", 2);
h([
  v()
], u.prototype, "_selectedContainers", 2);
h([
  v()
], u.prototype, "_collapsedNodes", 2);
h([
  v()
], u.prototype, "_showAllContainers", 2);
u = h([
  I("up-doc-area-picker-modal")
], u);
const te = u;
export {
  u as UpDocAreaPickerModalElement,
  te as default
};
//# sourceMappingURL=area-picker-modal.element-DNJLjS38.js.map
