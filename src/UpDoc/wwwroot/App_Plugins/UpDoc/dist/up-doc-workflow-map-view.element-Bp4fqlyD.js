import { b as R, g as V, u as F } from "./workflow.service-DXCyU5bG.js";
import { b as I, r as X, a as j, g as C } from "./destination-utils-DUfOJy5W.js";
import { html as s, nothing as w, css as H, state as $, customElement as q } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as J } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as Q } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as Y } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as Z } from "@umbraco-cms/backoffice/workspace";
var tt = Object.defineProperty, et = Object.getOwnPropertyDescriptor, E = (t) => {
  throw TypeError(t);
}, x = (t, e, i, a) => {
  for (var o = a > 1 ? void 0 : a ? et(e, i) : e, _ = t.length - 1, h; _ >= 0; _--)
    (h = t[_]) && (o = (a ? h(e, i, o) : h(o)) || o);
  return a && o && tt(e, i, o), o;
}, K = (t, e, i) => e.has(t) || E("Cannot " + i), u = (t, e, i) => (K(t, e, "read from private field"), i ? i.call(t) : e.get(t)), k = (t, e, i) => e.has(t) ? E("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), D = (t, e, i, a) => (K(t, e, "write to private field"), e.set(t, i), i), r = (t, e, i) => (K(t, e, "access private method"), i), v, g, m, n, T, S, W, L, U, O, A, B, P, G;
let p = class extends J {
  constructor() {
    super(...arguments), k(this, n), this._config = null, this._extraction = null, this._loading = !0, this._error = null, k(this, v, /* @__PURE__ */ new Set()), k(this, g, ""), k(this, m, "");
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(Z, (t) => {
      t && this.observe(t.unique, (e) => {
        e && (D(this, g, decodeURIComponent(e)), r(this, n, T).call(this));
      });
    });
  }
  render() {
    return this._loading ? s`<div class="loading"><uui-loader-bar></uui-loader-bar></div>` : this._error ? s`<p style="color: var(--uui-color-danger);">${this._error}</p>` : s`
			<umb-body-layout header-fit-height>
				<uui-box>
					${r(this, n, G).call(this)}
				</uui-box>
			</umb-body-layout>
		`;
  }
};
v = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
T = async function() {
  this._loading = !0, this._error = null;
  try {
    const t = await this.getContext(Y);
    if (D(this, m, await t.getLatestToken()), this._config = await R(u(this, g), u(this, m)), !this._config) {
      this._error = `Workflow "${u(this, g)}" not found`;
      return;
    }
    D(this, v, /* @__PURE__ */ new Set());
    for (const e of this._config.validationWarnings ?? []) {
      const i = e.match(/blockKey '([^']+)' for target '([^']+)'/);
      i && u(this, v).add(`${i[1]}:${i[2]}`);
    }
    this._extraction = await V(u(this, g), u(this, m));
  } catch (t) {
    this._error = t instanceof Error ? t.message : "Failed to load workflow", console.error("Failed to load workflow config:", t);
  } finally {
    this._loading = !1;
  }
};
S = function(t) {
  if (!this._config) return t.target;
  if (t.blockKey)
    for (const e of C(this._config.destination)) {
      const i = e.blocks.find((a) => a.key === t.blockKey);
      if (i) {
        const a = i.properties?.find((o) => o.alias === t.target);
        return `${i.label} > ${a?.label || t.target}`;
      }
    }
  for (const e of this._config.destination.fields)
    if (e.alias === t.target) return e.label;
  for (const e of C(this._config.destination))
    for (const i of e.blocks)
      for (const a of i.properties ?? [])
        if (a.alias === t.target)
          return `${i.label} > ${a.label || a.alias}`;
  return t.target;
};
W = function(t) {
  if (!this._extraction) return t;
  const e = this._extraction.elements.find((a) => a.id === t);
  return e ? e.text.length > 60 ? e.text.substring(0, 60) + "..." : e.text : t;
};
L = async function(t) {
  if (!this._config) return;
  const e = {
    ...this._config.map,
    mappings: this._config.map.mappings.filter((a, o) => o !== t)
  };
  await F(u(this, g), e, u(this, m)) && (this._config = { ...this._config, map: e });
};
U = function() {
  return s`
			<div class="empty-state">
				<uui-icon name="icon-nodes" class="empty-icon"></uui-icon>
				<p class="empty-title">No mappings yet</p>
				<p class="empty-message">Use the Source tab to map extracted content to destination fields.</p>
			</div>
		`;
};
O = function(t) {
  return t.destinations.some(
    (e) => e.blockKey && u(this, v).has(`${e.blockKey}:${e.target}`)
  );
};
A = function(t, e) {
  const i = r(this, n, O).call(this, t);
  return s`
			<uui-table-row>
				<uui-table-cell class="source-cell">
					<span class="source-id">${t.source}</span>
					<span class="source-text">${r(this, n, W).call(this, t.source)}</span>
				</uui-table-cell>
				<uui-table-cell class="arrow-cell">
					<uui-icon name="icon-arrow-right"></uui-icon>
				</uui-table-cell>
				<uui-table-cell class="destination-cell">
					${t.destinations.map(
    (a) => s`
							<span class="destination-target">${r(this, n, S).call(this, a)}</span>
							${a.transforms?.length ? s`<span class="transform-badge">${a.transforms.map((o) => o.type).join(", ")}</span>` : w}
						`
  )}
				</uui-table-cell>
				<uui-table-cell class="actions-cell">
					${i ? s`<uui-tag color="warning" class="orphaned-badge">Orphaned</uui-tag>` : w}
					${t.enabled ? w : s`<uui-tag look="secondary" class="disabled-badge">Disabled</uui-tag>`}
					<uui-button
						compact
						look="outline"
						color="danger"
						label="Delete"
						@click=${() => r(this, n, L).call(this, e)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-table-cell>
			</uui-table-row>
		`;
};
B = function() {
  if (!this._config?.destination) return [];
  const t = this._config.destination, e = I(t), i = /* @__PURE__ */ new Map();
  for (let l = 0; l < this._config.map.mappings.length; l++) {
    const f = this._config.map.mappings[l], y = f.destinations[0];
    if (!y) continue;
    const c = X(y, t) ?? "unmapped", b = e.find((N) => N.id === c)?.label ?? "Unmapped", d = y.blockKey, z = d ? j(d, t) : void 0, M = d ? `${c}:${d}` : c;
    i.has(M) || i.set(M, {
      tabId: c,
      tabLabel: b,
      blockKey: d ?? void 0,
      blockLabel: z ?? void 0,
      mappings: []
    }), i.get(M).mappings.push({ mapping: f, index: l });
  }
  const a = [], o = /* @__PURE__ */ new Map();
  let _ = 0;
  for (const l of C(t))
    for (const f of l.blocks)
      o.set(f.key, _++);
  for (const l of e) {
    const f = i.get(l.id);
    f && a.push(f);
    const y = Array.from(i.entries()).filter(([c, b]) => b.tabId === l.id && b.blockKey).sort(([, c], [, b]) => {
      const d = o.get(c.blockKey) ?? 999, z = o.get(b.blockKey) ?? 999;
      return d - z;
    }).map(([, c]) => c);
    a.push(...y);
  }
  const h = i.get("unmapped");
  return h && a.push(h), a;
};
P = function(t) {
  const e = t.blockLabel ? `${t.tabLabel} — ${t.blockLabel}` : t.tabLabel;
  return s`
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
    ({ mapping: i, index: a }) => r(this, n, A).call(this, i, a)
  )}
				</uui-table>
			</div>
		`;
};
G = function() {
  if (!this._config) return w;
  const t = this._config.map.mappings;
  if (t.length === 0) return r(this, n, U).call(this);
  const e = r(this, n, B).call(this);
  return s`
			<div class="mappings-header">
				<span class="mapping-count">${t.length} mapping${t.length !== 1 ? "s" : ""}</span>
			</div>
			${e.map((i) => r(this, n, P).call(this, i))}
		`;
};
p.styles = [
  Q,
  H`
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
x([
  $()
], p.prototype, "_config", 2);
x([
  $()
], p.prototype, "_extraction", 2);
x([
  $()
], p.prototype, "_loading", 2);
x([
  $()
], p.prototype, "_error", 2);
p = x([
  q("up-doc-workflow-map-view")
], p);
const ct = p;
export {
  p as UpDocWorkflowMapViewElement,
  ct as default
};
//# sourceMappingURL=up-doc-workflow-map-view.element-Bp4fqlyD.js.map
