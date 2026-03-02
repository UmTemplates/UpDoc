import { b as it, d as P } from "./workflow.service-Cpncb616.js";
import { b as ot, g as x } from "./destination-utils-DUfOJy5W.js";
import { html as l, nothing as c, css as at, state as v, customElement as nt } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as st } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as rt } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as k } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as lt } from "@umbraco-cms/backoffice/workspace";
import { umbOpenModal as S } from "@umbraco-cms/backoffice/modal";
import { U as A } from "./blueprint-picker-modal.token-mXZoRNwG.js";
var ct = Object.defineProperty, ut = Object.getOwnPropertyDescriptor, D = (t) => {
  throw TypeError(t);
}, g = (t, e, i, o) => {
  for (var s = o > 1 ? void 0 : o ? ut(e, i) : e, r = t.length - 1, u; r >= 0; r--)
    (u = t[r]) && (s = (o ? u(e, i, s) : u(s)) || s);
  return o && s && ct(e, i, s), s;
}, T = (t, e, i) => e.has(t) || D("Cannot " + i), m = (t, e, i) => (T(t, e, "read from private field"), e.get(t)), M = (t, e, i) => e.has(t) ? D("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), pt = (t, e, i, o) => (T(t, e, "write to private field"), e.set(t, i), i), n = (t, e, i) => (T(t, e, "access private method"), i), d, a, y, $, N, q, C, _, z, B, U, O, R, E, L, F, W, I, G, j, H, V, X, K, J, Q, Y, Z, tt;
let f = class extends st {
  constructor() {
    super(...arguments), M(this, a), this._config = null, this._loading = !0, this._error = null, this._activeTab = "", this._collapsedBlocks = /* @__PURE__ */ new Set(), this._collapsePopoverOpen = !1, M(this, d, null);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(lt, (t) => {
      t && this.observe(t.unique, (e) => {
        e && (pt(this, d, decodeURIComponent(e)), n(this, a, y).call(this, m(this, d)));
      });
    });
  }
  render() {
    if (this._loading)
      return l`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
    if (this._error)
      return l`<p style="color: var(--uui-color-danger);">${this._error}</p>`;
    const t = n(this, a, C).call(this);
    return l`
			<umb-body-layout header-fit-height>
				<uui-tab-group slot="header" dropdown-content-direction="vertical">
					${t.map(
      (e) => l`
							<uui-tab
								label=${e.label}
								?active=${this._activeTab === e.id}
								@click=${() => {
        this._activeTab = e.id;
      }}>
								${e.label}
							</uui-tab>
						`
    )}
				</uui-tab-group>
				${n(this, a, Y).call(this)}
				${n(this, a, Z).call(this)}
				<uui-box class="page-box">
					${n(this, a, tt).call(this)}
				</uui-box>
			</umb-body-layout>
		`;
  }
};
d = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
y = async function(t) {
  this._loading = !0, this._error = null;
  try {
    const i = await (await this.getContext(k)).getLatestToken();
    if (this._config = await it(t, i), !this._config) {
      this._error = `Workflow "${t}" not found`;
      return;
    }
    const o = n(this, a, C).call(this);
    o.length > 0 && (this._activeTab = o[0].id);
  } catch (e) {
    this._error = e instanceof Error ? e.message : "Failed to load workflow", console.error("Failed to load workflow config:", e);
  } finally {
    this._loading = !1;
  }
};
$ = async function(t) {
  const e = await fetch("/umbraco/management/api/v1/updoc/document-types", {
    headers: { Authorization: `Bearer ${t}` }
  });
  if (!e.ok) return { options: [], aliasMap: /* @__PURE__ */ new Map() };
  const i = await e.json(), o = [], s = /* @__PURE__ */ new Map();
  for (const r of i) {
    s.set(r.id, r.alias);
    const u = await fetch(
      `/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(r.alias)}/blueprints`,
      { headers: { Authorization: `Bearer ${t}` } }
    );
    if (!u.ok) continue;
    const p = await u.json();
    p.length > 0 && o.push({
      documentTypeUnique: r.id,
      documentTypeName: r.name,
      documentTypeIcon: r.icon ?? null,
      blueprints: p.map((h) => ({
        blueprintUnique: h.id,
        blueprintName: h.name
      }))
    });
  }
  return { options: o, aliasMap: s };
};
N = async function() {
  if (!m(this, d)) return;
  const e = await (await this.getContext(k)).getLatestToken(), { options: i, aliasMap: o } = await n(this, a, $).call(this, e);
  if (!i.length) return;
  let s;
  try {
    s = await S(this, A, {
      data: { documentTypes: i }
    });
  } catch {
    return;
  }
  const { blueprintUnique: r, documentTypeUnique: u } = s, p = i.find((b) => b.documentTypeUnique === u), h = p?.blueprints.find((b) => b.blueprintUnique === r), w = o.get(u) ?? "";
  await P(
    m(this, d),
    w,
    p?.documentTypeName ?? null,
    r,
    h?.blueprintName ?? null,
    e
  ) && await n(this, a, y).call(this, m(this, d));
};
q = async function() {
  if (!m(this, d) || !this._config) return;
  const e = await (await this.getContext(k)).getLatestToken(), i = this._config.destination, o = i.documentTypeAlias, { options: s, aliasMap: r } = await n(this, a, $).call(this, e), u = [...r.entries()].find(([, b]) => b === o)?.[0], p = s.find((b) => b.documentTypeUnique === u);
  if (!p) return;
  let h;
  try {
    h = await S(this, A, {
      data: {
        documentTypes: [p],
        preSelectedDocTypeUnique: p.documentTypeUnique
      }
    });
  } catch {
    return;
  }
  const w = p.blueprints.find(
    (b) => b.blueprintUnique === h.blueprintUnique
  );
  await P(
    m(this, d),
    o,
    i.documentTypeName ?? null,
    h.blueprintUnique,
    w?.blueprintName ?? null,
    e
  ) && await n(this, a, y).call(this, m(this, d));
};
C = function() {
  return this._config ? ot(this._config.destination) : [];
};
_ = function(t, e) {
  if (!this._config?.map?.mappings) return [];
  const i = [];
  for (const o of this._config.map.mappings)
    if (o.enabled !== !1)
      for (const s of o.destinations)
        s.target === t && (e ? s.blockKey === e : !s.blockKey) && i.push({ source: o.source, mapping: o });
  return i;
};
z = function(t) {
  const e = t.split("."), i = e[0], o = e[1], s = i.replace(/-/g, " ").replace(/\b\w/g, (r) => r.toUpperCase());
  if (o && o !== "content") {
    const r = o.replace(/\b\w/g, (u) => u.toUpperCase());
    return `${s} (${r})`;
  }
  return s;
};
B = function(t, e) {
  const i = n(this, a, _).call(this, t, e);
  return i.length === 0 ? c : i.map(
    ({ source: o }) => l`
				<uui-tag color="positive" look="primary" class="mapped-tag" title="${o}">
					${n(this, a, z).call(this, o)}
					<button class="unmap-x" title="Remove mapping" @click=${(s) => {
      s.stopPropagation();
    }}>&times;</button>
				</uui-tag>
			`
  );
};
U = function(t, e) {
  return n(this, a, _).call(this, t, e).length > 0;
};
O = function(t) {
  if (!t.properties?.length) return c;
  const e = [];
  for (const i of t.properties) {
    const o = n(this, a, _).call(this, i.alias, t.key);
    for (const { source: s } of o)
      e.push(l`
					<uui-tag color="positive" look="primary" class="mapped-tag" title="${s}">
						${n(this, a, z).call(this, s)}
						<button class="unmap-x" title="Remove mapping" @click=${(r) => {
        r.stopPropagation();
      }}>&times;</button>
					</uui-tag>
				`);
  }
  return e.length > 0 ? e : c;
};
R = function(t) {
  const e = new Set(this._collapsedBlocks);
  e.has(t) ? e.delete(t) : e.add(t), this._collapsedBlocks = e;
};
E = function(t) {
  return this._collapsedBlocks.has(t);
};
L = function() {
  if (!this._config) return;
  const t = /* @__PURE__ */ new Set();
  for (const e of x(this._config.destination))
    if ((e.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab)
      for (const o of e.blocks)
        t.add(o.key);
  this._collapsedBlocks = t;
};
F = function() {
  this._collapsedBlocks = /* @__PURE__ */ new Set();
};
W = function(t) {
  this._collapsePopoverOpen = t.newState === "open";
};
I = function() {
  return this._config ? x(this._config.destination).some((t) => (t.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab) : !1;
};
G = function(t) {
  if (!this._config) return c;
  const e = this._config.destination.fields.filter((i) => i.tab === t);
  return e.length === 0 ? l`<p class="empty-message">No fields in this tab.</p>` : l`
			${e.map((i) => n(this, a, j).call(this, i))}
		`;
};
j = function(t) {
  const e = n(this, a, U).call(this, t.alias);
  return l`
			<div class="part-box ${e ? "" : "unmapped"}">
				<div class="part-box-row">
					<div class="part-box-info">
						<div class="part-box-field-name">${t.label}</div>
						<div class="part-box-field-meta">
							<span class="field-alias">${t.alias}</span>
							<span class="field-type-badge">${t.type}</span>
							${t.mandatory ? l`<uui-tag look="primary" color="danger" class="required-badge">Required</uui-tag>` : c}
						</div>
					</div>
					<div class="part-box-actions">
						${n(this, a, B).call(this, t.alias)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
};
H = function(t) {
  if (!this._config) return c;
  const e = x(this._config.destination).filter((i) => (i.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === t);
  return e.length ? l`
			${e.map((i) => n(this, a, V).call(this, i))}
		` : l`<p class="empty-message">No blocks configured.</p>`;
};
V = function(t) {
  const i = (this._config?.destination.blockGrids ?? []).some((o) => o.key === t.key) ? "icon-grid" : "icon-thumbnail-list";
  return l`
			<div class="section-box container-box">
				<div class="section-box-header container-header">
					<uui-icon name="${i}" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
				</div>
				<div class="section-box-content">
					${t.blocks.map((o) => n(this, a, X).call(this, o))}
				</div>
			</div>
		`;
};
X = function(t) {
  const e = n(this, a, E).call(this, t.key);
  return l`
			<div class="section-box">
				<div class="section-box-header" @click=${() => n(this, a, R).call(this, t.key)}>
					<uui-icon class="collapse-chevron" name="${e ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon name="icon-box" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
					${t.identifyBy ? l`<span class="block-identify">identified by: "${t.identifyBy.value}"</span>` : c}
					<span class="header-spacer"></span>
					${e ? n(this, a, O).call(this, t) : c}
				</div>
				${!e && t.properties?.length ? l`
						<div class="section-box-content">
							${t.properties.map((i) => n(this, a, K).call(this, i, t.key))}
						</div>
					` : c}
			</div>
		`;
};
K = function(t, e) {
  const i = n(this, a, U).call(this, t.alias, e);
  return l`
			<div class="part-box ${i ? "" : "unmapped"}">
				<div class="part-box-row">
					<span class="part-box-label">${t.label || t.alias}</span>
					<div class="part-box-info">
						<div class="part-box-field-meta">
							<span class="field-alias">${t.alias}</span>
							<span class="field-type-badge">${t.type}</span>
							${t.acceptsFormats?.length ? l`<span class="accepts-formats">${t.acceptsFormats.join(", ")}</span>` : c}
						</div>
					</div>
					<div class="part-box-actions">
						${n(this, a, B).call(this, t.alias, e)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
};
J = function() {
  return this._config ? this._config.destination.fields.length : 0;
};
Q = function() {
  return this._config ? x(this._config.destination).reduce((t, e) => t + e.blocks.length, 0) : 0;
};
Y = function() {
  if (!this._config) return c;
  const t = this._config.destination;
  return l`
			<div class="info-boxes">
				<uui-box headline="Document Type" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-document-dashed-line" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${t.documentTypeName ?? t.documentTypeAlias}">${t.documentTypeName ?? t.documentTypeAlias}</span>
						<span class="box-sub">${t.documentTypeAlias}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Change" @click=${n(this, a, N)}>
								<uui-icon name="icon-document-dashed-line"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blueprint" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-blueprint" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${t.blueprintName ?? "—"}">${t.blueprintName ?? "—"}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Change" @click=${n(this, a, q)}>
								<uui-icon name="icon-blueprint"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Fields" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-layers" class="box-icon"></uui-icon>
						<span class="box-stat">${n(this, a, J).call(this)}</span>
						<span class="box-sub">text-mappable</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" disabled title="Coming soon">
								<uui-icon name="icon-layers"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blocks" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-box" class="box-icon"></uui-icon>
						<span class="box-stat">${n(this, a, Q).call(this)}</span>
						<span class="box-sub">in blueprint</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" disabled title="Coming soon">
								<uui-icon name="icon-box"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
};
Z = function() {
  return n(this, a, I).call(this) ? l`
			<div class="collapse-row">
				<uui-button
					look="outline"
					compact
					label="Collapse"
					popovertarget="dest-collapse-popover">
					Collapse
					<uui-symbol-expand .open=${this._collapsePopoverOpen}></uui-symbol-expand>
				</uui-button>
				<uui-popover-container
					id="dest-collapse-popover"
					placement="bottom-start"
					@toggle=${n(this, a, W)}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => n(this, a, F).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="Collapse All"
							@click=${() => n(this, a, L).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-right"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		` : c;
};
tt = function() {
  if (!this._config) return c;
  const t = this._config.destination.fields.find(
    (i) => i.tab && i.tab.toLowerCase().replace(/\s+/g, "-") === this._activeTab
  )?.tab, e = x(this._config.destination).some((i) => (i.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab);
  return l`
			${t ? n(this, a, G).call(this, t) : c}
			${e ? n(this, a, H).call(this, this._activeTab) : c}
		`;
};
f.styles = [
  rt,
  at`
			:host {
				display: block;
				height: 100%;
				--uui-tab-background: var(--uui-color-surface);
			}

			.loading {
				padding: var(--uui-size-layout-1);
			}

			.empty-message {
				color: var(--uui-color-text-alt);
				font-style: italic;
				padding: var(--uui-size-space-4);
			}

			/* Page box (matching Source tab) */
			.page-box {
				margin: var(--uui-size-space-4);
			}

			/* Collapse row */
			.collapse-row {
				display: flex;
				justify-content: flex-end;
				padding: var(--uui-size-space-2) var(--uui-size-space-4);
			}

			/* Section box (collapsible block group — matches Source tab) */
			.section-box {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin: var(--uui-size-space-3) 0;
			}

			.section-box:first-child {
				margin-top: 0;
			}

			/* Outermost container box (Block Grid / Block List wrapper) */
			.container-header {
				cursor: default;
				border-bottom: 1px solid var(--uui-color-border);
			}

			.container-header:hover {
				background: transparent;
			}

			.container-box > .section-box-content > .section-box:first-child {
				margin-top: 0;
			}

			.section-box-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				cursor: pointer;
			}

			.section-box-header:hover {
				background: var(--uui-color-surface-emphasis);
				border-radius: var(--uui-border-radius);
			}

			.section-box-header:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.collapse-chevron {
				font-size: 12px;
				color: var(--uui-color-text-alt);
			}

			.level-icon {
				font-size: 14px;
				color: var(--uui-color-text-alt);
			}

			.section-box-label {
				font-weight: 600;
				color: var(--uui-color-text);
				flex-shrink: 0;
			}

			.header-spacer {
				flex: 1;
			}

			.section-box-content {
				padding: 0 var(--uui-size-space-4) var(--uui-size-space-4);
			}

			/* Part box (individual field/property row — matches Source tab) */
			.part-box {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin-bottom: var(--uui-size-space-3);
			}

			.part-box:last-child {
				margin-bottom: 0;
			}

			.part-box.unmapped {
				border-style: dashed;
			}

			.part-box-row {
				display: flex;
				align-items: flex-start;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
			}

			.part-box-label {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				min-width: 80px;
				flex-shrink: 0;
				padding-top: 2px;
			}

			.part-box-info {
				flex: 1;
				min-width: 0;
			}

			.part-box-field-name {
				font-size: var(--uui-type-default-size);
				font-weight: 600;
				color: var(--uui-color-text);
			}

			.part-box-field-meta {
				display: flex;
				gap: var(--uui-size-space-2);
				align-items: center;
				margin-top: 3px;
			}

			.field-alias {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				font-family: monospace;
			}

			.field-type-badge {
				font-size: 11px;
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface-alt);
				padding: 1px 6px;
				border-radius: var(--uui-border-radius);
			}

			.required-badge {
				font-size: 11px;
			}

			.part-box-actions {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				flex-shrink: 0;
				padding-top: 2px;
			}

			.block-identify {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				font-style: italic;
			}

			.accepts-formats {
				font-size: 11px;
				color: var(--uui-color-text-alt);
			}

			/* Mapping badges (matches Source tab) */
			.mapped-tag {
				font-size: 12px;
			}

			.unmap-x {
				all: unset;
				cursor: pointer;
				font-size: 14px;
				line-height: 1;
				padding: 0 2px;
				margin-left: 4px;
				opacity: 0.7;
				font-weight: 700;
			}

			.unmap-x:hover {
				opacity: 1;
			}

			/* Map button — visible on hover (matches Source tab) */
			.md-map-btn {
				opacity: 0;
				transition: opacity 0.15s;
			}

			.part-box:hover .md-map-btn {
				opacity: 1;
			}

			/* Info boxes row (matching Source tab pattern) */
			.info-boxes {
				display: flex;
				gap: var(--uui-size-space-4);
				flex-wrap: wrap;
				padding: var(--uui-size-space-4);
			}

			.info-box-item {
				flex: 1;
			}

			.box-content {
				display: flex;
				flex-direction: column;
				align-items: center;
				text-align: center;
				gap: var(--uui-size-space-2);
				min-height: 180px;
			}

			.box-buttons {
				display: flex;
				gap: var(--uui-size-space-2);
				margin-top: auto;
				padding-top: var(--uui-size-space-2);
			}

			.box-icon {
				font-size: 48px;
				color: var(--uui-color-text-alt);
				margin-top: var(--uui-size-space-3);
			}

			.box-stat {
				font-size: var(--uui-type-h4-size);
				font-weight: 700;
				color: var(--uui-color-text);
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.box-filename {
				font-weight: 600;
				font-size: var(--uui-type-default-size) !important;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 100%;
			}

			.box-sub {
				font-size: 11px;
				color: var(--uui-color-text-alt);
			}
		`
];
g([
  v()
], f.prototype, "_config", 2);
g([
  v()
], f.prototype, "_loading", 2);
g([
  v()
], f.prototype, "_error", 2);
g([
  v()
], f.prototype, "_activeTab", 2);
g([
  v()
], f.prototype, "_collapsedBlocks", 2);
g([
  v()
], f.prototype, "_collapsePopoverOpen", 2);
f = g([
  nt("up-doc-workflow-destination-view")
], f);
const _t = f;
export {
  f as UpDocWorkflowDestinationViewElement,
  _t as default
};
//# sourceMappingURL=up-doc-workflow-destination-view.element-IC0Np1aF.js.map
