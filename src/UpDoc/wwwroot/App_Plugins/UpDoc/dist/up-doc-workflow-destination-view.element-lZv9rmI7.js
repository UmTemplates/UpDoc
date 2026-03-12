import { b as ot, d as D, r as nt } from "./workflow.service-DwTP3LNQ.js";
import { b as at, g as x } from "./destination-utils-DUfOJy5W.js";
import { html as l, nothing as c, css as st, state as v, customElement as rt } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as lt } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as ct } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as y } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as ut } from "@umbraco-cms/backoffice/workspace";
import { umbOpenModal as P } from "@umbraco-cms/backoffice/modal";
import { U as S } from "./blueprint-picker-modal.token-mXZoRNwG.js";
var pt = Object.defineProperty, dt = Object.getOwnPropertyDescriptor, N = (t) => {
  throw TypeError(t);
}, m = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? dt(e, i) : e, r = t.length - 1, u; r >= 0; r--)
    (u = t[r]) && (s = (n ? u(e, i, s) : u(s)) || s);
  return n && s && pt(e, i, s), s;
}, T = (t, e, i) => e.has(t) || N("Cannot " + i), h = (t, e, i) => (T(t, e, "read from private field"), e.get(t)), A = (t, e, i) => e.has(t) ? N("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), ft = (t, e, i, n) => (T(t, e, "write to private field"), e.set(t, i), i), a = (t, e, i) => (T(t, e, "access private method"), i), p, o, _, C, R, q, $, z, w, B, M, U, L, O, E, F, I, W, G, j, H, V, X, K, J, Q, Y, Z, tt, et;
let f = class extends lt {
  constructor() {
    super(...arguments), A(this, o), this._config = null, this._loading = !0, this._error = null, this._activeTab = "", this._collapsedBlocks = /* @__PURE__ */ new Set(), this._collapsePopoverOpen = !1, this._blueprintMissing = !1, A(this, p, null);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(ut, (t) => {
      t && this.observe(t.unique, (e) => {
        e && (ft(this, p, decodeURIComponent(e)), a(this, o, _).call(this, h(this, p)));
      });
    });
  }
  render() {
    if (this._loading)
      return l`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
    if (this._error)
      return l`<p style="color: var(--uui-color-danger);">${this._error}</p>`;
    const t = a(this, o, z).call(this);
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
				${a(this, o, Z).call(this)}
				${a(this, o, tt).call(this)}
				<uui-box class="page-box">
					${a(this, o, et).call(this)}
				</uui-box>
			</umb-body-layout>
		`;
  }
};
p = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
_ = async function(t) {
  this._loading = !0, this._error = null, this._blueprintMissing = !1;
  try {
    const i = await (await this.getContext(y)).getLatestToken();
    if (this._config = await ot(t, i), !this._config) {
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
        const u = await r.json();
        this._blueprintMissing = !u.some((d) => d.id === n.blueprintId);
      }
    }
    const s = a(this, o, z).call(this);
    s.length > 0 && (this._activeTab = s[0].id);
  } catch (e) {
    this._error = e instanceof Error ? e.message : "Failed to load workflow", console.error("Failed to load workflow config:", e);
  } finally {
    this._loading = !1;
  }
};
C = async function(t) {
  const e = await fetch("/umbraco/management/api/v1/updoc/document-types", {
    headers: { Authorization: `Bearer ${t}` }
  });
  if (!e.ok) return { options: [], aliasMap: /* @__PURE__ */ new Map() };
  const i = await e.json(), n = [], s = /* @__PURE__ */ new Map();
  for (const r of i) {
    s.set(r.id, r.alias);
    const u = await fetch(
      `/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(r.alias)}/blueprints`,
      { headers: { Authorization: `Bearer ${t}` } }
    );
    if (!u.ok) continue;
    const d = await u.json();
    d.length > 0 && n.push({
      documentTypeUnique: r.id,
      documentTypeName: r.name,
      documentTypeIcon: r.icon ?? null,
      blueprints: d.map((g) => ({
        blueprintUnique: g.id,
        blueprintName: g.name
      }))
    });
  }
  return { options: n, aliasMap: s };
};
R = async function() {
  if (!h(this, p)) return;
  const e = await (await this.getContext(y)).getLatestToken(), { options: i, aliasMap: n } = await a(this, o, C).call(this, e);
  if (!i.length) return;
  let s;
  try {
    s = await P(this, S, {
      data: { documentTypes: i }
    });
  } catch {
    return;
  }
  const { blueprintUnique: r, documentTypeUnique: u } = s, d = i.find((b) => b.documentTypeUnique === u), g = d?.blueprints.find((b) => b.blueprintUnique === r), k = n.get(u) ?? "";
  await D(
    h(this, p),
    k,
    d?.documentTypeName ?? null,
    r,
    g?.blueprintName ?? null,
    e
  ) && await a(this, o, _).call(this, h(this, p));
};
q = async function() {
  if (!h(this, p) || !this._config) return;
  const e = await (await this.getContext(y)).getLatestToken(), i = this._config.destination, n = i.documentTypeAlias, { options: s, aliasMap: r } = await a(this, o, C).call(this, e), u = [...r.entries()].find(([, b]) => b === n)?.[0], d = s.find((b) => b.documentTypeUnique === u);
  if (!d) return;
  let g;
  try {
    g = await P(this, S, {
      data: {
        documentTypes: [d],
        preSelectedDocTypeUnique: d.documentTypeUnique
      }
    });
  } catch {
    return;
  }
  const k = d.blueprints.find(
    (b) => b.blueprintUnique === g.blueprintUnique
  );
  await D(
    h(this, p),
    n,
    i.documentTypeName ?? null,
    g.blueprintUnique,
    k?.blueprintName ?? null,
    e
  ) && await a(this, o, _).call(this, h(this, p));
};
$ = async function() {
  if (!h(this, p)) return;
  const e = await (await this.getContext(y)).getLatestToken();
  await nt(h(this, p), e) && await a(this, o, _).call(this, h(this, p));
};
z = function() {
  return this._config ? at(this._config.destination) : [];
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
B = function(t) {
  const e = t.split("."), i = e[0], n = e[1], s = i.replace(/-/g, " ").replace(/\b\w/g, (r) => r.toUpperCase());
  if (n && n !== "content") {
    const r = n.replace(/\b\w/g, (u) => u.toUpperCase());
    return `${s} (${r})`;
  }
  return s;
};
M = function(t, e) {
  const i = a(this, o, w).call(this, t, e);
  return i.length === 0 ? c : i.map(
    ({ source: n }) => l`
				<uui-tag color="positive" look="primary" class="mapped-tag" title="${n}">
					${a(this, o, B).call(this, n)}
					<button class="unmap-x" title="Remove mapping" @click=${(s) => {
      s.stopPropagation();
    }}>&times;</button>
				</uui-tag>
			`
  );
};
U = function(t, e) {
  return a(this, o, w).call(this, t, e).length > 0;
};
L = function(t) {
  if (!t.properties?.length) return c;
  const e = [];
  for (const i of t.properties) {
    const n = a(this, o, w).call(this, i.alias, t.key);
    for (const { source: s } of n)
      e.push(l`
					<uui-tag color="positive" look="primary" class="mapped-tag" title="${s}">
						${a(this, o, B).call(this, s)}
						<button class="unmap-x" title="Remove mapping" @click=${(r) => {
        r.stopPropagation();
      }}>&times;</button>
					</uui-tag>
				`);
  }
  return e.length > 0 ? e : c;
};
O = function(t) {
  const e = new Set(this._collapsedBlocks);
  e.has(t) ? e.delete(t) : e.add(t), this._collapsedBlocks = e;
};
E = function(t) {
  return this._collapsedBlocks.has(t);
};
F = function() {
  if (!this._config) return;
  const t = /* @__PURE__ */ new Set();
  for (const e of x(this._config.destination))
    if ((e.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab)
      for (const n of e.blocks)
        t.add(n.key);
  this._collapsedBlocks = t;
};
I = function() {
  this._collapsedBlocks = /* @__PURE__ */ new Set();
};
W = function(t) {
  this._collapsePopoverOpen = t.newState === "open";
};
G = function() {
  return this._config ? x(this._config.destination).some((t) => (t.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab) : !1;
};
j = function(t) {
  if (!this._config) return c;
  const e = this._config.destination.fields.filter((i) => i.tab === t);
  return e.length === 0 ? l`<p class="empty-message">No fields in this tab.</p>` : l`
			${e.map((i) => a(this, o, H).call(this, i))}
		`;
};
H = function(t) {
  const e = a(this, o, U).call(this, t.alias);
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
						${a(this, o, M).call(this, t.alias)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
};
V = function(t) {
  if (!this._config) return c;
  const e = x(this._config.destination).filter((i) => (i.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === t);
  return e.length ? l`
			${e.map((i) => a(this, o, X).call(this, i))}
		` : l`<p class="empty-message">No blocks configured.</p>`;
};
X = function(t) {
  const i = (this._config?.destination.blockGrids ?? []).some((n) => n.key === t.key) ? "icon-grid" : "icon-thumbnail-list";
  return l`
			<div class="section-box container-box">
				<div class="section-box-header container-header">
					<uui-icon name="${i}" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
				</div>
				<div class="section-box-content">
					${t.blocks.map((n) => a(this, o, K).call(this, n))}
				</div>
			</div>
		`;
};
K = function(t) {
  const e = a(this, o, E).call(this, t.key);
  return l`
			<div class="section-box">
				<div class="section-box-header" @click=${() => a(this, o, O).call(this, t.key)}>
					<uui-icon class="collapse-chevron" name="${e ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon name="icon-box" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
					${t.identifyBy && !t.identifyBy.value.startsWith("[") ? l`<span class="block-identify">identified by: "${t.identifyBy.value}"</span>` : c}
					<span class="header-spacer"></span>
					${e ? a(this, o, L).call(this, t) : c}
				</div>
				${!e && t.properties?.length ? l`
						<div class="section-box-content">
							${t.properties.map((i) => a(this, o, J).call(this, i, t.key))}
						</div>
					` : c}
			</div>
		`;
};
J = function(t, e) {
  const i = a(this, o, U).call(this, t.alias, e);
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
						${a(this, o, M).call(this, t.alias, e)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
};
Q = function() {
  return this._config ? this._config.destination.fields.length : 0;
};
Y = function() {
  return this._config ? x(this._config.destination).reduce((t, e) => t + e.blocks.length, 0) : 0;
};
Z = function() {
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
							<uui-button look="primary" color="default" label="Change" @click=${a(this, o, R)}>
								<uui-icon name="icon-document-dashed-line"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blueprint" class="info-box-item ${this._blueprintMissing ? "blueprint-missing" : ""}">
					<div class="box-content">
						<uui-icon name="icon-blueprint" class="box-icon ${this._blueprintMissing ? "box-icon-warning" : ""}"></uui-icon>
						<span class="box-stat box-filename ${this._blueprintMissing ? "box-filename-warning" : ""}" title="${t.blueprintName ?? "—"}">${t.blueprintName ?? "—"}</span>
						${this._blueprintMissing ? l`<uui-tag color="warning" look="primary">Not found</uui-tag>` : c}
						<div class="box-buttons">
							<uui-button look="primary" color="${this._blueprintMissing ? "warning" : "default"}" label="Change" @click=${a(this, o, q)}>
								<uui-icon name="icon-blueprint"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Fields" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-layers" class="box-icon"></uui-icon>
						<span class="box-stat">${a(this, o, Q).call(this)}</span>
						<span class="box-sub">text-mappable</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" @click=${a(this, o, $)}>
								<uui-icon name="icon-layers"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blocks" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-box" class="box-icon"></uui-icon>
						<span class="box-stat">${a(this, o, Y).call(this)}</span>
						<span class="box-sub">in blueprint</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" @click=${a(this, o, $)}>
								<uui-icon name="icon-box"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
};
tt = function() {
  return a(this, o, G).call(this) ? l`
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
					@toggle=${a(this, o, W)}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => a(this, o, I).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="Collapse All"
							@click=${() => a(this, o, F).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-right"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		` : c;
};
et = function() {
  if (!this._config) return c;
  const t = this._config.destination.fields.find(
    (i) => i.tab && i.tab.toLowerCase().replace(/\s+/g, "-") === this._activeTab
  )?.tab, e = x(this._config.destination).some((i) => (i.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab);
  return l`
			${t ? a(this, o, j).call(this, t) : c}
			${e ? a(this, o, V).call(this, this._activeTab) : c}
		`;
};
f.styles = [
  ct,
  st`
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
m([
  v()
], f.prototype, "_config", 2);
m([
  v()
], f.prototype, "_loading", 2);
m([
  v()
], f.prototype, "_error", 2);
m([
  v()
], f.prototype, "_activeTab", 2);
m([
  v()
], f.prototype, "_collapsedBlocks", 2);
m([
  v()
], f.prototype, "_collapsePopoverOpen", 2);
m([
  v()
], f.prototype, "_blueprintMissing", 2);
f = m([
  rt("up-doc-workflow-destination-view")
], f);
const kt = f;
export {
  f as UpDocWorkflowDestinationViewElement,
  kt as default
};
//# sourceMappingURL=up-doc-workflow-destination-view.element-lZv9rmI7.js.map
