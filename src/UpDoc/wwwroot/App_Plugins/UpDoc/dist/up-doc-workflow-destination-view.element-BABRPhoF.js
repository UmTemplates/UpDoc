import { b as at, d as S, r as nt } from "./workflow.service-DwTP3LNQ.js";
import { c as st, d as rt, g as C, t as P } from "./destination-utils-DQDyJQ_T.js";
import { html as l, nothing as d, css as lt, state as v, customElement as ct } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ut } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as pt } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as _ } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as dt } from "@umbraco-cms/backoffice/workspace";
import { umbOpenModal as q } from "@umbraco-cms/backoffice/modal";
import { U as N } from "./blueprint-picker-modal.token-mXZoRNwG.js";
var ht = Object.defineProperty, ft = Object.getOwnPropertyDescriptor, O = (t) => {
  throw TypeError(t);
}, g = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? ft(e, i) : e, r = t.length - 1, c; r >= 0; r--)
    (c = t[r]) && (s = (n ? c(e, i, s) : c(s)) || s);
  return n && s && ht(e, i, s), s;
}, z = (t, e, i) => e.has(t) || O("Cannot " + i), h = (t, e, i) => (z(t, e, "read from private field"), i ? i.call(t) : e.get(t)), $ = (t, e, i) => e.has(t) ? O("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), R = (t, e, i, n) => (z(t, e, "write to private field"), e.set(t, i), i), a = (t, e, i) => (z(t, e, "access private method"), i), u, y, o, x, B, E, I, T, M, w, U, A, D, W, L, F, G, H, j, V, X, K, J, Q, Y, Z, tt, et, it;
let f = class extends ut {
  constructor() {
    super(...arguments), $(this, o), this._config = null, this._loading = !0, this._error = null, this._activeTab = "", this._collapsedBlocks = /* @__PURE__ */ new Set(), this._collapsePopoverOpen = !1, this._blueprintMissing = !1, $(this, u, null), $(this, y, null);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(dt, (t) => {
      t && (R(this, y, t), t.setRefreshHandler(() => a(this, o, x).call(this, h(this, u))), this.observe(t.unique, (e) => {
        e && (R(this, u, decodeURIComponent(e)), a(this, o, x).call(this, h(this, u)));
      }));
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), h(this, y)?.setRefreshHandler(null);
  }
  render() {
    if (this._loading)
      return l`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
    if (this._error)
      return l`<p style="color: var(--uui-color-danger);">${this._error}</p>`;
    const t = a(this, o, M).call(this);
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
				${a(this, o, tt).call(this)}
				${a(this, o, et).call(this)}
				<uui-box class="page-box">
					${a(this, o, it).call(this)}
				</uui-box>
			</umb-body-layout>
		`;
  }
};
u = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
x = async function(t) {
  this._loading = !0, this._error = null, this._blueprintMissing = !1;
  try {
    const i = await (await this.getContext(_)).getLatestToken();
    if (this._config = await at(t, i), !this._config) {
      this._error = `Workflow "${t}" not found`;
      return;
    }
    const n = this._config.destination;
    if (n.blueprintId) {
      const r = await fetch(
        `/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(n.documentTypeAlias)}/blueprints`,
        { headers: { Authorization: `Bearer ${i}` } }
      );
      if (r.ok) {
        const c = await r.json();
        this._blueprintMissing = !c.some((p) => p.id === n.blueprintId);
      }
    }
    const s = a(this, o, M).call(this);
    s.length > 0 && (this._activeTab = s[0].id);
  } catch (e) {
    this._error = e instanceof Error ? e.message : "Failed to load workflow", console.error("Failed to load workflow config:", e);
  } finally {
    this._loading = !1;
  }
};
B = async function(t) {
  const e = await fetch("/umbraco/management/api/v1/updoc/document-types", {
    headers: { Authorization: `Bearer ${t}` }
  });
  if (!e.ok) return { options: [], aliasMap: /* @__PURE__ */ new Map() };
  const i = await e.json(), n = [], s = /* @__PURE__ */ new Map();
  for (const r of i) {
    s.set(r.id, r.alias);
    const c = await fetch(
      `/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(r.alias)}/blueprints`,
      { headers: { Authorization: `Bearer ${t}` } }
    );
    if (!c.ok) continue;
    const p = await c.json();
    p.length > 0 && n.push({
      documentTypeUnique: r.id,
      documentTypeName: r.name,
      documentTypeIcon: r.icon ?? null,
      blueprints: p.map((m) => ({
        blueprintUnique: m.id,
        blueprintName: m.name
      }))
    });
  }
  return { options: n, aliasMap: s };
};
E = async function() {
  if (!h(this, u)) return;
  const e = await (await this.getContext(_)).getLatestToken(), { options: i, aliasMap: n } = await a(this, o, B).call(this, e);
  if (!i.length) return;
  let s;
  try {
    s = await q(this, N, {
      data: { documentTypes: i }
    });
  } catch {
    return;
  }
  const { blueprintUnique: r, documentTypeUnique: c } = s, p = i.find((b) => b.documentTypeUnique === c), m = p?.blueprints.find((b) => b.blueprintUnique === r), k = n.get(c) ?? "";
  await S(
    h(this, u),
    k,
    p?.documentTypeName ?? null,
    r,
    m?.blueprintName ?? null,
    e
  ) && await a(this, o, x).call(this, h(this, u));
};
I = async function() {
  if (!h(this, u) || !this._config) return;
  const e = await (await this.getContext(_)).getLatestToken(), i = this._config.destination, n = i.documentTypeAlias, { options: s, aliasMap: r } = await a(this, o, B).call(this, e), c = [...r.entries()].find(([, b]) => b === n)?.[0], p = s.find((b) => b.documentTypeUnique === c);
  if (!p) return;
  let m;
  try {
    m = await q(this, N, {
      data: {
        documentTypes: [p],
        preSelectedDocTypeUnique: p.documentTypeUnique
      }
    });
  } catch {
    return;
  }
  const k = p.blueprints.find(
    (b) => b.blueprintUnique === m.blueprintUnique
  );
  await S(
    h(this, u),
    n,
    i.documentTypeName ?? null,
    m.blueprintUnique,
    k?.blueprintName ?? null,
    e
  ) && await a(this, o, x).call(this, h(this, u));
};
T = async function() {
  if (!h(this, u)) return;
  const e = await (await this.getContext(_)).getLatestToken();
  await nt(h(this, u), e) && await a(this, o, x).call(this, h(this, u));
};
M = function() {
  return this._config ? st(this._config.destination) : [];
};
w = function(t, e) {
  if (!this._config?.map?.mappings) return [];
  const i = [];
  for (const n of this._config.map.mappings)
    if (n.enabled !== !1)
      for (const s of n.destinations)
        s.target === t && (e ? s.blockKey === e : !s.blockKey) && i.push({ source: n.source, mapping: n });
  return i;
};
U = function(t) {
  const e = t.split("."), i = e[0], n = e[1], s = i.replace(/-/g, " ").replace(/\b\w/g, (r) => r.toUpperCase());
  if (n && n !== "content") {
    const r = n.replace(/\b\w/g, (c) => c.toUpperCase());
    return `${s} (${r})`;
  }
  return s;
};
A = function(t, e) {
  const i = a(this, o, w).call(this, t, e);
  return i.length === 0 ? d : i.map(
    ({ source: n }) => l`
				<uui-tag color="positive" look="primary" class="mapped-tag" title="${n}">
					${a(this, o, U).call(this, n)}
					<button class="unmap-x" title="Remove mapping" @click=${(s) => {
      s.stopPropagation();
    }}>&times;</button>
				</uui-tag>
			`
  );
};
D = function(t, e) {
  return a(this, o, w).call(this, t, e).length > 0;
};
W = function(t) {
  if (!t.properties?.length) return d;
  const e = [];
  for (const i of t.properties) {
    const n = a(this, o, w).call(this, i.alias, t.key);
    for (const { source: s } of n)
      e.push(l`
					<uui-tag color="positive" look="primary" class="mapped-tag" title="${s}">
						${a(this, o, U).call(this, s)}
						<button class="unmap-x" title="Remove mapping" @click=${(r) => {
        r.stopPropagation();
      }}>&times;</button>
					</uui-tag>
				`);
  }
  return e.length > 0 ? e : d;
};
L = function(t) {
  const e = new Set(this._collapsedBlocks);
  e.has(t) ? e.delete(t) : e.add(t), this._collapsedBlocks = e;
};
F = function(t) {
  return this._collapsedBlocks.has(t);
};
G = function() {
  if (!this._config) return;
  const t = /* @__PURE__ */ new Set();
  for (const e of C(this._config.destination))
    if (P(e.tab ?? "Page Content") === this._activeTab)
      for (const i of e.blocks)
        t.add(i.key);
  this._collapsedBlocks = t;
};
H = function() {
  this._collapsedBlocks = /* @__PURE__ */ new Set();
};
j = function(t) {
  this._collapsePopoverOpen = t.newState === "open";
};
V = function() {
  return this._config ? C(this._config.destination).some(
    (t) => P(t.tab ?? "Page Content") === this._activeTab
  ) : !1;
};
X = function(t) {
  const e = a(this, o, D).call(this, t.alias);
  return l`
			<div class="part-box ${e ? "" : "unmapped"}">
				<div class="part-box-row">
					<div class="part-box-info">
						<div class="part-box-field-name">${t.label}</div>
						<div class="part-box-field-meta">
							<span class="field-alias">${t.alias}</span>
							<span class="field-type-badge">${t.type}</span>
							${t.mandatory ? l`<uui-tag look="primary" color="danger" class="required-badge">Required</uui-tag>` : d}
						</div>
					</div>
					<div class="part-box-actions">
						${a(this, o, A).call(this, t.alias)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
};
K = function(t) {
  const i = (this._config?.destination.blockGrids ?? []).some((n) => n.key === t.key) ? "icon-grid" : "icon-thumbnail-list";
  return l`
			<div class="section-box container-box">
				<div class="section-box-header container-header">
					<uui-icon name="${i}" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
				</div>
				<div class="section-box-content">
					${t.blocks.map((n) => a(this, o, J).call(this, n))}
				</div>
			</div>
		`;
};
J = function(t) {
  const e = a(this, o, F).call(this, t.key);
  return l`
			<div class="section-box">
				<div class="section-box-header" @click=${() => a(this, o, L).call(this, t.key)}>
					<uui-icon class="collapse-chevron" name="${e ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon name="icon-box" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
					${t.identifyBy && !t.identifyBy.value.startsWith("[") ? l`<span class="block-identify">identified by: "${t.identifyBy.value}"</span>` : d}
					<span class="header-spacer"></span>
					${e ? a(this, o, W).call(this, t) : d}
				</div>
				${!e && t.properties?.length ? l`
						<div class="section-box-content">
							${t.properties.map((i) => a(this, o, Q).call(this, i, t.key))}
						</div>
					` : d}
			</div>
		`;
};
Q = function(t, e) {
  const i = a(this, o, D).call(this, t.alias, e);
  return l`
			<div class="part-box ${i ? "" : "unmapped"}">
				<div class="part-box-row">
					<span class="part-box-label">${t.label || t.alias}</span>
					<div class="part-box-info">
						<div class="part-box-field-meta">
							<span class="field-alias">${t.alias}</span>
							<span class="field-type-badge">${t.type}</span>
							${t.acceptsFormats?.length ? l`<span class="accepts-formats">${t.acceptsFormats.join(", ")}</span>` : d}
						</div>
					</div>
					<div class="part-box-actions">
						${a(this, o, A).call(this, t.alias, e)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
};
Y = function() {
  return this._config ? this._config.destination.fields.length : 0;
};
Z = function() {
  return this._config ? C(this._config.destination).reduce((t, e) => t + e.blocks.length, 0) : 0;
};
tt = function() {
  if (!this._config) return d;
  const t = this._config.destination;
  return l`
			<div class="info-boxes">
				<uui-box headline="Document Type" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-document-dashed-line" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${t.documentTypeName ?? t.documentTypeAlias}">${t.documentTypeName ?? t.documentTypeAlias}</span>
						<span class="box-sub">${t.documentTypeAlias}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Change" @click=${a(this, o, E)}>
								<uui-icon name="icon-document-dashed-line"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blueprint" class="info-box-item ${this._blueprintMissing ? "blueprint-missing" : ""}">
					<div class="box-content">
						<uui-icon name="icon-blueprint" class="box-icon ${this._blueprintMissing ? "box-icon-warning" : ""}"></uui-icon>
						<span class="box-stat box-filename ${this._blueprintMissing ? "box-filename-warning" : ""}" title="${t.blueprintName ?? "—"}">${t.blueprintName ?? "—"}</span>
						${this._blueprintMissing ? l`<uui-tag color="warning" look="primary">Not found</uui-tag>` : d}
						<div class="box-buttons">
							<uui-button look="primary" color="${this._blueprintMissing ? "warning" : "default"}" label="Change" @click=${a(this, o, I)}>
								<uui-icon name="icon-blueprint"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Fields" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-layers" class="box-icon"></uui-icon>
						<span class="box-stat">${a(this, o, Y).call(this)}</span>
						<span class="box-sub">mappable</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" @click=${a(this, o, T)}>
								<uui-icon name="icon-layers"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blocks" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-box" class="box-icon"></uui-icon>
						<span class="box-stat">${a(this, o, Z).call(this)}</span>
						<span class="box-sub">in blueprint</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" @click=${a(this, o, T)}>
								<uui-icon name="icon-box"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
};
et = function() {
  return a(this, o, V).call(this) ? l`
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
					@toggle=${a(this, o, j)}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => a(this, o, H).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="Collapse All"
							@click=${() => a(this, o, G).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-right"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		` : d;
};
it = function() {
  if (!this._config) return d;
  const t = rt(this._config.destination, this._activeTab);
  return t.length ? l`
			${t.map(({ group: e, fields: i, containers: n }) => {
    const s = l`
					${i.map((r) => a(this, o, X).call(this, r))}
					${n.map((r) => a(this, o, K).call(this, r))}
				`;
    return e ? l`
					<div class="group-panel">
						<div class="group-panel-header">${e}</div>
						<div class="group-panel-content">${s}</div>
					</div>
				` : s;
  })}
		` : l`<p class="empty-message">Nothing in this tab.</p>`;
};
f.styles = [
  pt,
  lt`
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

			/* Group panel within a tab — mirrors how the backoffice boxes a group,
			   so the workflow's destination reads like the document it creates. */
			.group-panel {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface);
				margin-bottom: var(--uui-size-space-4);
			}

			.group-panel:last-child {
				margin-bottom: 0;
			}

			.group-panel-header {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border-bottom: 1px solid var(--uui-color-border);
				font-size: var(--uui-type-default-size);
				font-weight: 700;
				color: var(--uui-color-text);
			}

			.group-panel-content {
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

			/* Missing blueprint warning */
			.blueprint-missing {
				border-color: var(--uui-color-warning);
			}

			.box-icon-warning {
				color: var(--uui-color-warning);
			}

			.box-filename-warning {
				color: var(--uui-color-warning);
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
g([
  v()
], f.prototype, "_blueprintMissing", 2);
f = g([
  ct("up-doc-workflow-destination-view")
], f);
const $t = f;
export {
  f as UpDocWorkflowDestinationViewElement,
  $t as default
};
//# sourceMappingURL=up-doc-workflow-destination-view.element-BABRPhoF.js.map
