import { b as V, g as j, u as F } from "./workflow.service-DRM8gMCY.js";
import { b as I, r as X, a as H, g as D } from "./destination-utils-DUfOJy5W.js";
import { html as n, nothing as w, css as q, state as M, customElement as J } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as Q } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as Y } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as Z } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as tt } from "@umbraco-cms/backoffice/workspace";
var et = Object.defineProperty, at = Object.getOwnPropertyDescriptor, E = (t) => {
  throw TypeError(t);
}, $ = (t, e, a, i) => {
  for (var o = i > 1 ? void 0 : i ? at(e, a) : e, _ = t.length - 1, g; _ >= 0; _--)
    (g = t[_]) && (o = (i ? g(e, a, o) : g(o)) || o);
  return i && o && et(e, a, o), o;
}, K = (t, e, a) => e.has(t) || E("Cannot " + a), r = (t, e, a) => (K(t, e, "read from private field"), a ? a.call(t) : e.get(t)), v = (t, e, a) => e.has(t) ? E("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), z = (t, e, a, i) => (K(t, e, "write to private field"), e.set(t, a), a), l = (t, e, a) => (K(t, e, "access private method"), a), x, k, h, m, s, T, W, L, O, U, A, B, P, G, N;
let p = class extends Q {
  constructor() {
    super(...arguments), v(this, s), this._config = null, this._extraction = null, this._loading = !0, this._error = null, v(this, x, /* @__PURE__ */ new Set()), v(this, k, /* @__PURE__ */ new Set()), v(this, h, ""), v(this, m, "");
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(tt, (t) => {
      t && this.observe(t.unique, (e) => {
        e && (z(this, h, decodeURIComponent(e)), l(this, s, T).call(this));
      });
    });
  }
  render() {
    return this._loading ? n`<div class="loading"><uui-loader-bar></uui-loader-bar></div>` : this._error ? n`<p style="color: var(--uui-color-danger);">${this._error}</p>` : n`
			<umb-body-layout header-fit-height>
				<uui-box>
					${l(this, s, N).call(this)}
				</uui-box>
			</umb-body-layout>
		`;
  }
};
x = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
T = async function() {
  this._loading = !0, this._error = null;
  try {
    const t = await this.getContext(Z);
    if (z(this, m, await t.getLatestToken()), this._config = await V(r(this, h), r(this, m)), !this._config) {
      this._error = `Workflow "${r(this, h)}" not found`;
      return;
    }
    z(this, x, /* @__PURE__ */ new Set()), z(this, k, /* @__PURE__ */ new Set());
    for (const e of this._config.validationWarnings ?? []) {
      const a = e.match(/blockKey '([^']+)' for target '([^']+)'/);
      a && r(this, x).add(`${a[1]}:${a[2]}`);
      const i = e.match(/source '([^']+)' not found in transform\.json/);
      i && r(this, k).add(i[1]);
    }
    this._extraction = await j(r(this, h), r(this, m));
  } catch (t) {
    this._error = t instanceof Error ? t.message : "Failed to load workflow", console.error("Failed to load workflow config:", t);
  } finally {
    this._loading = !1;
  }
};
W = function(t) {
  if (!this._config) return t.target;
  if (t.blockKey)
    for (const e of D(this._config.destination)) {
      const a = e.blocks.find((i) => i.key === t.blockKey);
      if (a) {
        const i = a.properties?.find((o) => o.alias === t.target);
        return `${a.label} > ${i?.label || t.target}`;
      }
    }
  for (const e of this._config.destination.fields)
    if (e.alias === t.target) return e.label;
  for (const e of D(this._config.destination))
    for (const a of e.blocks)
      for (const i of a.properties ?? [])
        if (i.alias === t.target)
          return `${a.label} > ${i.label || i.alias}`;
  return t.target;
};
L = function(t) {
  if (!this._extraction) return t;
  const e = this._extraction.elements.find((i) => i.id === t);
  return e ? e.text.length > 60 ? e.text.substring(0, 60) + "..." : e.text : t;
};
O = async function(t) {
  if (!this._config) return;
  const e = {
    ...this._config.map,
    mappings: this._config.map.mappings.filter((i, o) => o !== t)
  };
  await F(r(this, h), e, r(this, m)) && (this._config = { ...this._config, map: e });
};
U = function() {
  return n`
			<div class="empty-state">
				<uui-icon name="icon-nodes" class="empty-icon"></uui-icon>
				<p class="empty-title">No mappings yet</p>
				<p class="empty-message">Use the Source tab to map extracted content to destination fields.</p>
			</div>
		`;
};
A = function(t) {
  const e = t.destinations.some(
    (i) => i.blockKey && r(this, x).has(`${i.blockKey}:${i.target}`)
  ), a = r(this, k).has(t.source);
  return { dest: e, source: a };
};
B = function(t, e) {
  const a = l(this, s, A).call(this, t);
  return n`
			<uui-table-row>
				<uui-table-cell class="source-cell">
					<span class="source-id">${t.source}</span>
					<span class="source-text">${l(this, s, L).call(this, t.source)}</span>
				</uui-table-cell>
				<uui-table-cell class="arrow-cell">
					<uui-icon name="icon-arrow-right"></uui-icon>
				</uui-table-cell>
				<uui-table-cell class="destination-cell">
					${t.destinations.map(
    (i) => n`
							<span class="destination-target">${l(this, s, W).call(this, i)}</span>
							${i.transforms?.length ? n`<span class="transform-badge">${i.transforms.map((o) => o.type).join(", ")}</span>` : w}
						`
  )}
				</uui-table-cell>
				<uui-table-cell class="actions-cell">
					${a.source ? n`<uui-tag color="warning" class="orphaned-badge">Orphaned Source</uui-tag>` : w}
					${a.dest ? n`<uui-tag color="warning" class="orphaned-badge">Orphaned</uui-tag>` : w}
					${t.enabled ? w : n`<uui-tag look="secondary" class="disabled-badge">Disabled</uui-tag>`}
					<uui-button
						compact
						look="outline"
						color="danger"
						label="Delete"
						@click=${() => l(this, s, O).call(this, e)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-table-cell>
			</uui-table-row>
		`;
};
P = function() {
  if (!this._config?.destination) return [];
  const t = this._config.destination, e = I(t), a = /* @__PURE__ */ new Map();
  for (let c = 0; c < this._config.map.mappings.length; c++) {
    const d = this._config.map.mappings[c], y = d.destinations[0];
    if (!y) continue;
    const u = X(y, t) ?? "unmapped", b = e.find((R) => R.id === u)?.label ?? "Unmapped", f = y.blockKey, S = f ? H(f, t) : void 0, C = f ? `${u}:${f}` : u;
    a.has(C) || a.set(C, {
      tabId: u,
      tabLabel: b,
      blockKey: f ?? void 0,
      blockLabel: S ?? void 0,
      mappings: []
    }), a.get(C).mappings.push({ mapping: d, index: c });
  }
  const i = [], o = /* @__PURE__ */ new Map();
  let _ = 0;
  for (const c of D(t))
    for (const d of c.blocks)
      o.set(d.key, _++);
  for (const c of e) {
    const d = a.get(c.id);
    d && i.push(d);
    const y = Array.from(a.entries()).filter(([u, b]) => b.tabId === c.id && b.blockKey).sort(([, u], [, b]) => {
      const f = o.get(u.blockKey) ?? 999, S = o.get(b.blockKey) ?? 999;
      return f - S;
    }).map(([, u]) => u);
    i.push(...y);
  }
  const g = a.get("unmapped");
  return g && i.push(g), i;
};
G = function(t) {
  const e = t.blockLabel ? `${t.tabLabel} — ${t.blockLabel}` : t.tabLabel;
  return n`
			<div class="mapping-group">
				<div class="mapping-group-header">
					<span class="mapping-group-label">${e}</span>
					<span class="mapping-group-count">${t.mappings.length}</span>
				</div>
				<uui-table>
					<uui-table-head>
						<uui-table-head-cell>Source</uui-table-head-cell>
						<uui-table-head-cell style="width: 40px;"></uui-table-head-cell>
						<uui-table-head-cell>Destination</uui-table-head-cell>
						<uui-table-head-cell style="width: 100px;"></uui-table-head-cell>
					</uui-table-head>
					${t.mappings.map(
    ({ mapping: a, index: i }) => l(this, s, B).call(this, a, i)
  )}
				</uui-table>
			</div>
		`;
};
N = function() {
  if (!this._config) return w;
  const t = this._config.map.mappings;
  if (t.length === 0) return l(this, s, U).call(this);
  const e = l(this, s, P).call(this);
  return n`
			<div class="mappings-header">
				<span class="mapping-count">${t.length} mapping${t.length !== 1 ? "s" : ""}</span>
			</div>
			${e.map((a) => l(this, s, G).call(this, a))}
		`;
};
p.styles = [
  Y,
  q`
			:host {
				display: block;
				height: 100%;
			}

			.loading {
				padding: var(--uui-size-layout-1);
			}

			.empty-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: var(--uui-size-layout-3) var(--uui-size-layout-1);
				color: var(--uui-color-text-alt);
			}

			.empty-icon {
				font-size: 3rem;
				margin-bottom: var(--uui-size-space-4);
				opacity: 0.4;
			}

			.empty-title {
				font-size: var(--uui-type-h5-size);
				font-weight: 600;
				margin: 0 0 var(--uui-size-space-2);
			}

			.empty-message {
				margin: 0;
				font-style: italic;
			}

			.mappings-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: var(--uui-size-space-4);
			}

			.mapping-count {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}

			.mapping-group {
				margin-bottom: var(--uui-size-space-5);
			}

			.mapping-group:last-child {
				margin-bottom: 0;
			}

			.mapping-group-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.mapping-group-label {
				font-weight: 600;
			}

			.mapping-group-count {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface);
				padding: 1px 8px;
				border-radius: var(--uui-border-radius);
				border: 1px solid var(--uui-color-border);
			}

			.source-cell {
				display: flex;
				flex-direction: column;
				gap: 2px;
			}

			.source-id {
				font-size: 11px;
				font-family: monospace;
				color: var(--uui-color-text-alt);
			}

			.source-text {
				font-size: var(--uui-type-small-size);
			}

			.arrow-cell {
				text-align: center;
				color: var(--uui-color-text-alt);
			}

			.destination-cell {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.destination-target {
				font-weight: 600;
			}

			.transform-badge {
				font-size: 11px;
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface-alt);
				padding: 2px 8px;
				border-radius: var(--uui-border-radius);
				width: fit-content;
			}

			.disabled-badge,
			.orphaned-badge {
				font-size: 11px;
			}

			.actions-cell {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				justify-content: flex-end;
			}
		`
];
$([
  M()
], p.prototype, "_config", 2);
$([
  M()
], p.prototype, "_extraction", 2);
$([
  M()
], p.prototype, "_loading", 2);
$([
  M()
], p.prototype, "_error", 2);
p = $([
  J("up-doc-workflow-map-view")
], p);
const ut = p;
export {
  p as UpDocWorkflowMapViewElement,
  ut as default
};
//# sourceMappingURL=up-doc-workflow-map-view.element-DnGKVYnb.js.map
