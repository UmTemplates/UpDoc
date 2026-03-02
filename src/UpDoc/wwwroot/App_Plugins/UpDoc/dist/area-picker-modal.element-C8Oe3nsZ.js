import { n as _ } from "./transforms-BkZeboOX.js";
import { html as n, nothing as u, css as W, state as p, customElement as F } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as N } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as B } from "@umbraco-cms/backoffice/style";
var I = Object.defineProperty, K = Object.getOwnPropertyDescriptor, y = (e) => {
  throw TypeError(e);
}, d = (e, t, a, i) => {
  for (var o = i > 1 ? void 0 : i ? K(t, a) : t, l = e.length - 1, m; l >= 0; l--)
    (m = e[l]) && (o = (i ? m(t, a, o) : m(o)) || o);
  return i && o && I(t, a, o), o;
}, C = (e, t, a) => t.has(e) || y("Cannot " + a), h = (e, t, a) => (C(e, t, "read from private field"), a ? a.call(e) : t.get(e)), q = (e, t, a) => t.has(e) ? y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), s = (e, t, a) => (C(e, t, "access private method"), a), r, $, k, f, z, g, b, A, v, x, S, P, O, T, E, G, M, U, D, L, R, w;
let c = class extends N {
  constructor() {
    super(...arguments), q(this, r), this._excluded = /* @__PURE__ */ new Set(), this._overrides = [], this._selectedContainers = /* @__PURE__ */ new Set(), this._flatContainers = [], this._collapsedGroups = /* @__PURE__ */ new Set();
  }
  connectedCallback() {
    super.connectedCallback(), this._excluded = new Set(this.data?.excludedAreas ?? []), this._overrides = [...this.data?.containerOverrides ?? []], this._flatContainers = s(this, r, $).call(this, this.data?.containers ?? null);
  }
  // =========================================================================
  // Render
  // =========================================================================
  render() {
    const e = this._flatContainers.length > 0;
    return n`
			<umb-body-layout headline="Define Areas">
				${e ? s(this, r, M).call(this) : s(this, r, G).call(this)}

				<div slot="actions">
					<uui-button label="Close" @click=${s(this, r, E)}></uui-button>
					<uui-button label="Save" look="primary" color="positive" @click=${s(this, r, T)}></uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
r = /* @__PURE__ */ new WeakSet();
$ = function(e) {
  if (!e) return [];
  const t = [], a = (i) => {
    if ((i.className || i.id) && t.push({
      path: i.path,
      cssSelector: i.cssSelector,
      elementCount: i.elementCount,
      area: i.area || "Unknown",
      depth: i.depth
    }), i.children)
      for (const o of i.children)
        a(o);
  };
  for (const i of e)
    a(i);
  return t;
};
k = function(e) {
  for (const t of this._overrides)
    if (t.action === "promoteToArea" && e.path.startsWith(t.containerPath))
      return t.label || e.area;
  return e.area;
};
f = function() {
  const t = (this.data?.areas ?? []).map((a) => ({
    name: a.name,
    elementCount: a.elementCount,
    color: a.color,
    isPromoted: !1
  }));
  for (const a of this._overrides)
    if (a.action === "promoteToArea" && a.label && !t.some((i) => i.name === a.label)) {
      const i = this._flatContainers.find(
        (o) => o.path === a.containerPath
      );
      t.push({
        name: a.label,
        elementCount: i?.elementCount ?? 0,
        color: "#FFCC80",
        isPromoted: !0
      });
    }
  return t;
};
z = function() {
  const e = h(this, r, f), t = /* @__PURE__ */ new Map();
  for (const o of this._flatContainers) {
    const l = s(this, r, k).call(this, o);
    t.has(l) || t.set(l, []), t.get(l).push(o);
  }
  const a = [], i = /* @__PURE__ */ new Set();
  for (const o of e)
    t.has(o.name) && (a.push({
      areaName: o.name,
      color: o.color,
      containers: t.get(o.name)
    }), i.add(o.name));
  for (const [o, l] of t)
    i.has(o) || a.push({ areaName: o, color: "#999999", containers: l });
  return a;
};
g = function(e) {
  const t = new Set(this._excluded);
  t.has(e) ? t.delete(e) : t.add(e), this._excluded = t;
};
b = function(e) {
  const t = new Set(this._selectedContainers);
  t.has(e) ? t.delete(e) : t.add(e), this._selectedContainers = t;
};
A = function(e) {
  const t = new Set(this._collapsedGroups);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsedGroups = t;
};
v = function(e) {
  return this._overrides.find((t) => t.containerPath === e);
};
x = function(e) {
  const t = [...this._overrides];
  for (const a of this._selectedContainers) {
    const i = t.findIndex((l) => l.containerPath === a), o = { containerPath: a, action: e };
    e === "promoteToArea" && (o.label = s(this, r, P).call(this, a)), i >= 0 ? t[i] = o : t.push(o);
  }
  this._overrides = t, this._selectedContainers = /* @__PURE__ */ new Set();
};
S = function() {
  const e = this._overrides.filter((t) => !this._selectedContainers.has(t.containerPath));
  this._overrides = e, this._selectedContainers = /* @__PURE__ */ new Set();
};
P = function(e) {
  const t = e.split("/").pop() || e, a = t.match(/[.#](.+)/);
  return (a ? a[1] : t).replace(/[-_]/g, " ").replace(/\b\w/g, (o) => o.toUpperCase());
};
O = function(e, t) {
  const a = this._overrides.map(
    (i) => i.containerPath === e ? { ...i, label: t } : i
  );
  this._overrides = a;
};
T = function() {
  this.value = {
    excludedAreas: [...this._excluded],
    containerOverrides: this._overrides.length > 0 ? this._overrides : void 0
  }, this.modalContext?.submit();
};
E = function() {
  this.modalContext?.reject();
};
G = function() {
  const e = h(this, r, f), t = e.filter((a) => !this._excluded.has(_(a.name))).length;
  return n`
			<div id="main">
				<p class="description">
					Select which areas to include in the extraction output.
					Excluded areas will not appear in the Transformed view or be available for mapping.
				</p>
				<p class="summary">${t} of ${e.length} areas included</p>

				<div class="area-list">
					${e.map((a) => s(this, r, w).call(this, a))}
				</div>
			</div>
		`;
};
M = function() {
  return n`
			<div class="editor-layout">
				${s(this, r, U).call(this)}
				${s(this, r, R).call(this)}
			</div>
		`;
};
U = function() {
  const e = h(this, r, z), t = this._selectedContainers.size, a = [...this._selectedContainers].some((i) => s(this, r, v).call(this, i));
  return n`
			<div class="container-panel">
				<p class="description">
					Promote containers to independent areas, or mark them as section boundaries.
				</p>

				<div class="container-groups">
					${e.map((i) => s(this, r, D).call(this, i))}
				</div>

				${t > 0 ? n`
					<div class="action-bar">
						<span class="selected-count">${t} selected</span>
						<uui-button-group>
							<uui-button
								label="Promote to Area"
								look="primary"
								compact
								@click=${() => s(this, r, x).call(this, "promoteToArea")}>
								Promote to Area
							</uui-button>
							<uui-button
								label="Make Section"
								look="secondary"
								compact
								@click=${() => s(this, r, x).call(this, "makeSection")}>
								Make Section
							</uui-button>
							${a ? n`
								<uui-button
									label="Remove Override"
									look="default"
									color="danger"
									compact
									@click=${s(this, r, S)}>
									Remove
								</uui-button>
							` : u}
						</uui-button-group>
					</div>
				` : u}
			</div>
		`;
};
D = function(e) {
  const t = this._collapsedGroups.has(e.areaName), a = e.containers.filter((i) => s(this, r, v).call(this, i.path)).length;
  return n`
			<div class="container-group">
				<div class="group-header" @click=${() => s(this, r, A).call(this, e.areaName)}>
					<uui-icon name=${t ? "icon-navigation-right" : "icon-navigation-down"}></uui-icon>
					<span class="area-color" style="background: ${e.color};"></span>
					<span class="group-name">${e.areaName}</span>
					<span class="group-meta">
						${e.containers.length} container${e.containers.length !== 1 ? "s" : ""}
						${a > 0 ? n`<span class="override-count">${a} override${a !== 1 ? "s" : ""}</span>` : u}
					</span>
				</div>

				${t ? u : n`
					<div class="group-containers">
						${e.containers.map((i) => s(this, r, L).call(this, i))}
					</div>
				`}
			</div>
		`;
};
L = function(e) {
  const t = s(this, r, v).call(this, e.path), a = this._selectedContainers.has(e.path);
  return n`
			<div
				class="container-row ${a ? "selected" : ""} ${t ? "has-override" : ""}"
				@click=${() => s(this, r, b).call(this, e.path)}>
				<uui-checkbox
					label="${e.cssSelector}"
					?checked=${a}
					@change=${(i) => {
    i.stopPropagation(), s(this, r, b).call(this, e.path);
  }}>
				</uui-checkbox>
				<div class="container-info">
					<span class="container-selector">${e.cssSelector}</span>
					<span class="container-meta">
						${e.elementCount} element${e.elementCount !== 1 ? "s" : ""}
					</span>
				</div>
				${t ? n`
					<div class="override-badge">
						${t.action === "promoteToArea" ? n`
							<uui-tag color="warning" look="primary" compact>
								Area
							</uui-tag>
							<input
								class="label-input"
								type="text"
								.value=${t.label || ""}
								placeholder="Label..."
								@click=${(i) => i.stopPropagation()}
								@input=${(i) => {
    const o = i.target;
    s(this, r, O).call(this, e.path, o.value);
  }} />
						` : n`
							<uui-tag color="positive" look="primary" compact>Section</uui-tag>
						`}
					</div>
				` : u}
			</div>
		`;
};
R = function() {
  const e = h(this, r, f), t = e.filter((a) => !this._excluded.has(_(a.name))).length;
  return n`
			<div class="area-panel">
				<uui-box headline="Areas">
					<div class="area-list">
						${e.map((a) => s(this, r, w).call(this, a))}
					</div>
					<p class="area-summary">${t} of ${e.length} areas included</p>
				</uui-box>
			</div>
		`;
};
w = function(e) {
  const t = _(e.name), a = !this._excluded.has(t);
  return n`
			<div
				class="area-row ${a ? "" : "excluded"}"
				@click=${() => s(this, r, g).call(this, t)}>
				<span class="area-color" style="background: ${e.color};"></span>
				<uui-checkbox
					label="${e.name}"
					?checked=${a}
					@change=${(i) => {
    i.stopPropagation(), s(this, r, g).call(this, t);
  }}>
				</uui-checkbox>
				<span class="area-name">${e.name}</span>
				<span class="area-count">${e.elementCount} element${e.elementCount !== 1 ? "s" : ""}</span>
				${e.isPromoted ? n`<uui-tag color="warning" look="primary" compact>New</uui-tag>` : u}
			</div>
		`;
};
c.styles = [
  B,
  W`
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
		`
];
d([
  p()
], c.prototype, "_excluded", 2);
d([
  p()
], c.prototype, "_overrides", 2);
d([
  p()
], c.prototype, "_selectedContainers", 2);
d([
  p()
], c.prototype, "_flatContainers", 2);
d([
  p()
], c.prototype, "_collapsedGroups", 2);
c = d([
  F("up-doc-area-picker-modal")
], c);
const X = c;
export {
  c as UpDocAreaPickerModalElement,
  X as default
};
//# sourceMappingURL=area-picker-modal.element-C8Oe3nsZ.js.map
