import { b as nt, d as R, r as st } from "./workflow.service-DwTP3LNQ.js";
import { b as rt, g as _ } from "./destination-utils-DUfOJy5W.js";
import { html as l, nothing as c, css as lt, state as v, customElement as ct } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ut } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as pt } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as w } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as dt } from "@umbraco-cms/backoffice/workspace";
import { umbOpenModal as S } from "@umbraco-cms/backoffice/modal";
import { U as N } from "./blueprint-picker-modal.token-mXZoRNwG.js";
var ht = Object.defineProperty, ft = Object.getOwnPropertyDescriptor, q = (t) => {
  throw TypeError(t);
}, g = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? ft(e, i) : e, r = t.length - 1, u; r >= 0; r--)
    (u = t[r]) && (s = (n ? u(e, i, s) : u(s)) || s);
  return n && s && ht(e, i, s), s;
}, z = (t, e, i) => e.has(t) || q("Cannot " + i), h = (t, e, i) => (z(t, e, "read from private field"), i ? i.call(t) : e.get(t)), T = (t, e, i) => e.has(t) ? q("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), P = (t, e, i, n) => (z(t, e, "write to private field"), e.set(t, i), i), a = (t, e, i) => (z(t, e, "access private method"), i), p, y, o, x, B, L, O, C, M, k, U, A, D, E, W, F, I, G, H, j, V, X, K, J, Q, Y, Z, tt, et, it, ot;
let f = class extends ut {
  constructor() {
    super(...arguments), T(this, o), this._config = null, this._loading = !0, this._error = null, this._activeTab = "", this._collapsedBlocks = /* @__PURE__ */ new Set(), this._collapsePopoverOpen = !1, this._blueprintMissing = !1, T(this, p, null), T(this, y, null);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(dt, (t) => {
      t && (P(this, y, t), t.setRefreshHandler(() => a(this, o, x).call(this, h(this, p))), this.observe(t.unique, (e) => {
        e && (P(this, p, decodeURIComponent(e)), a(this, o, x).call(this, h(this, p)));
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
				${a(this, o, et).call(this)}
				${a(this, o, it).call(this)}
				<uui-box class="page-box">
					${a(this, o, ot).call(this)}
				</uui-box>
			</umb-body-layout>
		`;
  }
};
p = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
x = async function(t) {
  this._loading = !0, this._error = null, this._blueprintMissing = !1;
  try {
    const i = await (await this.getContext(w)).getLatestToken();
    if (this._config = await nt(t, i), !this._config) {
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
      blueprints: d.map((m) => ({
        blueprintUnique: m.id,
        blueprintName: m.name
      }))
    });
  }
  return { options: n, aliasMap: s };
};
L = async function() {
  if (!h(this, p)) return;
  const e = await (await this.getContext(w)).getLatestToken(), { options: i, aliasMap: n } = await a(this, o, B).call(this, e);
  if (!i.length) return;
  let s;
  try {
    s = await S(this, N, {
      data: { documentTypes: i }
    });
  } catch {
    return;
  }
  const { blueprintUnique: r, documentTypeUnique: u } = s, d = i.find((b) => b.documentTypeUnique === u), m = d?.blueprints.find((b) => b.blueprintUnique === r), $ = n.get(u) ?? "";
  await R(
    h(this, p),
    $,
    d?.documentTypeName ?? null,
    r,
    m?.blueprintName ?? null,
    e
  ) && await a(this, o, x).call(this, h(this, p));
};
O = async function() {
  if (!h(this, p) || !this._config) return;
  const e = await (await this.getContext(w)).getLatestToken(), i = this._config.destination, n = i.documentTypeAlias, { options: s, aliasMap: r } = await a(this, o, B).call(this, e), u = [...r.entries()].find(([, b]) => b === n)?.[0], d = s.find((b) => b.documentTypeUnique === u);
  if (!d) return;
  let m;
  try {
    m = await S(this, N, {
      data: {
        documentTypes: [d],
        preSelectedDocTypeUnique: d.documentTypeUnique
      }
    });
  } catch {
    return;
  }
  const $ = d.blueprints.find(
    (b) => b.blueprintUnique === m.blueprintUnique
  );
  await R(
    h(this, p),
    n,
    i.documentTypeName ?? null,
    m.blueprintUnique,
    $?.blueprintName ?? null,
    e
  ) && await a(this, o, x).call(this, h(this, p));
};
C = async function() {
  if (!h(this, p)) return;
  const e = await (await this.getContext(w)).getLatestToken();
  await st(h(this, p), e) && await a(this, o, x).call(this, h(this, p));
};
M = function() {
  return this._config ? rt(this._config.destination) : [];
};
k = function(t, e) {
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
    const r = n.replace(/\b\w/g, (u) => u.toUpperCase());
    return `${s} (${r})`;
  }
  return s;
};
A = function(t, e) {
  const i = a(this, o, k).call(this, t, e);
  return i.length === 0 ? c : i.map(
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
  return a(this, o, k).call(this, t, e).length > 0;
};
E = function(t) {
  if (!t.properties?.length) return c;
  const e = [];
  for (const i of t.properties) {
    const n = a(this, o, k).call(this, i.alias, t.key);
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
  return e.length > 0 ? e : c;
};
W = function(t) {
  const e = new Set(this._collapsedBlocks);
  e.has(t) ? e.delete(t) : e.add(t), this._collapsedBlocks = e;
};
F = function(t) {
  return this._collapsedBlocks.has(t);
};
I = function() {
  if (!this._config) return;
  const t = /* @__PURE__ */ new Set();
  for (const e of _(this._config.destination))
    if ((e.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab)
      for (const n of e.blocks)
        t.add(n.key);
  this._collapsedBlocks = t;
};
G = function() {
  this._collapsedBlocks = /* @__PURE__ */ new Set();
};
H = function(t) {
  this._collapsePopoverOpen = t.newState === "open";
};
j = function() {
  return this._config ? _(this._config.destination).some((t) => (t.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab) : !1;
};
V = function(t) {
  if (!this._config) return c;
  const e = this._config.destination.fields.filter((i) => i.tab === t);
  return e.length === 0 ? l`<p class="empty-message">No fields in this tab.</p>` : l`
			${e.map((i) => a(this, o, X).call(this, i))}
		`;
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
							${t.mandatory ? l`<uui-tag look="primary" color="danger" class="required-badge">Required</uui-tag>` : c}
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
  if (!this._config) return c;
  const e = _(this._config.destination).filter((i) => (i.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === t);
  return e.length ? l`
			${e.map((i) => a(this, o, J).call(this, i))}
		` : l`<p class="empty-message">No blocks configured.</p>`;
};
J = function(t) {
  const i = (this._config?.destination.blockGrids ?? []).some((n) => n.key === t.key) ? "icon-grid" : "icon-thumbnail-list";
  return l`
			<div class="section-box container-box">
				<div class="section-box-header container-header">
					<uui-icon name="${i}" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
				</div>
				<div class="section-box-content">
					${t.blocks.map((n) => a(this, o, Q).call(this, n))}
				</div>
			</div>
		`;
};
Q = function(t) {
  const e = a(this, o, F).call(this, t.key);
  return l`
			<div class="section-box">
				<div class="section-box-header" @click=${() => a(this, o, W).call(this, t.key)}>
					<uui-icon class="collapse-chevron" name="${e ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon name="icon-box" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
					${t.identifyBy && !t.identifyBy.value.startsWith("[") ? l`<span class="block-identify">identified by: "${t.identifyBy.value}"</span>` : c}
					<span class="header-spacer"></span>
					${e ? a(this, o, E).call(this, t) : c}
				</div>
				${!e && t.properties?.length ? l`
						<div class="section-box-content">
							${t.properties.map((i) => a(this, o, Y).call(this, i, t.key))}
						</div>
					` : c}
			</div>
		`;
};
Y = function(t, e) {
  const i = a(this, o, D).call(this, t.alias, e);
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
						${a(this, o, A).call(this, t.alias, e)}
						<uui-button class="md-map-btn" look="outline" compact label="Map"><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
					</div>
				</div>
			</div>
		`;
};
Z = function() {
  return this._config ? this._config.destination.fields.length : 0;
};
tt = function() {
  return this._config ? _(this._config.destination).reduce((t, e) => t + e.blocks.length, 0) : 0;
};
et = function() {
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
							<uui-button look="primary" color="default" label="Change" @click=${a(this, o, L)}>
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
							<uui-button look="primary" color="${this._blueprintMissing ? "warning" : "default"}" label="Change" @click=${a(this, o, O)}>
								<uui-icon name="icon-blueprint"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Fields" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-layers" class="box-icon"></uui-icon>
						<span class="box-stat">${a(this, o, Z).call(this)}</span>
						<span class="box-sub">text-mappable</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" @click=${a(this, o, C)}>
								<uui-icon name="icon-layers"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blocks" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-box" class="box-icon"></uui-icon>
						<span class="box-stat">${a(this, o, tt).call(this)}</span>
						<span class="box-sub">in blueprint</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" @click=${a(this, o, C)}>
								<uui-icon name="icon-box"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
};
it = function() {
  return a(this, o, j).call(this) ? l`
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
					@toggle=${a(this, o, H)}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => a(this, o, G).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="Collapse All"
							@click=${() => a(this, o, I).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-right"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		` : c;
};
ot = function() {
  if (!this._config) return c;
  const t = this._config.destination.fields.find(
    (i) => i.tab && i.tab.toLowerCase().replace(/\s+/g, "-") === this._activeTab
  )?.tab, e = _(this._config.destination).some((i) => (i.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab);
  return l`
			${t ? a(this, o, V).call(this, t) : c}
			${e ? a(this, o, K).call(this, this._activeTab) : c}
		`;
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
//# sourceMappingURL=up-doc-workflow-destination-view.element-CRg3LFei.js.map
