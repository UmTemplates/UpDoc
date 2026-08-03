import { I } from "./workflow.types-QrurYwv2.js";
import { b as ut, d as L, r as pt, s as dt } from "./workflow.service-rwnAqyw6.js";
import { c as ht, d as ft, g as M, t as q } from "./destination-utils-BFSWOBvb.js";
import { html as l, nothing as h, css as bt, state as x, customElement as gt } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as mt } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as vt } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as w } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as xt } from "@umbraco-cms/backoffice/workspace";
import { umbOpenModal as F, UMB_MODAL_MANAGER_CONTEXT as _t, UMB_CONFIRM_MODAL as yt } from "@umbraco-cms/backoffice/modal";
import { U as W } from "./blueprint-picker-modal.token-mXZoRNwG.js";
var wt = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, G = (t) => {
  throw TypeError(t);
}, m = (t, i, e, n) => {
  for (var s = n > 1 ? void 0 : n ? kt(i, e) : i, r = t.length - 1, c; r >= 0; r--)
    (c = t[r]) && (s = (n ? c(i, e, s) : c(s)) || s);
  return n && s && wt(i, e, s), s;
}, B = (t, i, e) => i.has(t) || G("Cannot " + e), d = (t, i, e) => (B(t, i, "read from private field"), e ? e.call(t) : i.get(t)), T = (t, i, e) => i.has(t) ? G("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, e), E = (t, i, e, n) => (B(t, i, "write to private field"), i.set(t, e), e), a = (t, i, e) => (B(t, i, "access private method"), e), u, k, o, _, U, H, j, V, $, z, A, C, R, D, S, X, K, J, Q, Y, Z, tt, O, it, et, ot, at, nt, st, rt, lt, ct;
let g = class extends mt {
  constructor() {
    super(...arguments), T(this, o), this._config = null, this._loading = !0, this._error = null, this._activeTab = "", this._collapsedBlocks = /* @__PURE__ */ new Set(), this._collapsePopoverOpen = !1, this._blueprintMissing = !1, T(this, u, null), T(this, k, null);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(xt, (t) => {
      t && (E(this, k, t), t.setRefreshHandler(() => a(this, o, _).call(this, d(this, u))), this.observe(t.unique, (i) => {
        i && (E(this, u, decodeURIComponent(i)), a(this, o, _).call(this, d(this, u)));
      }));
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), d(this, k)?.setRefreshHandler(null);
  }
  render() {
    if (this._loading)
      return l`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
    if (this._error)
      return l`<p style="color: var(--uui-color-danger);">${this._error}</p>`;
    const t = a(this, o, A).call(this);
    return l`
			<umb-body-layout header-fit-height>
				<uui-tab-group slot="header" dropdown-content-direction="vertical">
					${t.map(
      (i) => l`
							<uui-tab
								label=${i.label}
								?active=${this._activeTab === i.id}
								@click=${() => {
        this._activeTab = i.id;
      }}>
								${i.label}
							</uui-tab>
						`
    )}
				</uui-tab-group>
				${a(this, o, rt).call(this)}
				${a(this, o, lt).call(this)}
				<uui-box class="page-box">
					${a(this, o, ct).call(this)}
				</uui-box>
			</umb-body-layout>
		`;
  }
};
u = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
_ = async function(t) {
  this._loading = !0, this._error = null, this._blueprintMissing = !1;
  try {
    const e = await (await this.getContext(w)).getLatestToken();
    if (this._config = await ut(t, e), !this._config) {
      this._error = `Workflow "${t}" not found`;
      return;
    }
    const n = this._config.destination;
    if (n.blueprintId) {
      const r = await fetch(
        `/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(n.documentTypeAlias)}/blueprints`,
        { headers: { Authorization: `Bearer ${e}` } }
      );
      if (r.ok) {
        const c = await r.json();
        this._blueprintMissing = !c.some((p) => p.id === n.blueprintId);
      }
    }
    const s = a(this, o, A).call(this);
    s.length > 0 && (this._activeTab = s[0].id);
  } catch (i) {
    this._error = i instanceof Error ? i.message : "Failed to load workflow", console.error("Failed to load workflow config:", i);
  } finally {
    this._loading = !1;
  }
};
U = async function(t) {
  const i = await fetch("/umbraco/management/api/v1/updoc/document-types", {
    headers: { Authorization: `Bearer ${t}` }
  });
  if (!i.ok) return { options: [], aliasMap: /* @__PURE__ */ new Map() };
  const e = await i.json(), n = [], s = /* @__PURE__ */ new Map();
  for (const r of e) {
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
      blueprints: p.map((f) => ({
        blueprintUnique: f.id,
        blueprintName: f.name
      }))
    });
  }
  return { options: n, aliasMap: s };
};
H = async function() {
  if (!d(this, u)) return;
  const i = await (await this.getContext(w)).getLatestToken(), { options: e, aliasMap: n } = await a(this, o, U).call(this, i);
  if (!e.length) return;
  let s;
  try {
    s = await F(this, W, {
      data: { documentTypes: e }
    });
  } catch {
    return;
  }
  const { blueprintUnique: r, documentTypeUnique: c } = s, p = e.find((b) => b.documentTypeUnique === c), f = p?.blueprints.find((b) => b.blueprintUnique === r), y = n.get(c) ?? "";
  await L(
    d(this, u),
    y,
    p?.documentTypeName ?? null,
    r,
    f?.blueprintName ?? null,
    i
  ) && await a(this, o, _).call(this, d(this, u));
};
j = async function() {
  if (!d(this, u) || !this._config) return;
  const i = await (await this.getContext(w)).getLatestToken(), e = this._config.destination, n = e.documentTypeAlias, { options: s, aliasMap: r } = await a(this, o, U).call(this, i), c = [...r.entries()].find(([, b]) => b === n)?.[0], p = s.find((b) => b.documentTypeUnique === c);
  if (!p) return;
  let f;
  try {
    f = await F(this, W, {
      data: {
        documentTypes: [p],
        preSelectedDocTypeUnique: p.documentTypeUnique
      }
    });
  } catch {
    return;
  }
  const y = p.blueprints.find(
    (b) => b.blueprintUnique === f.blueprintUnique
  );
  await L(
    d(this, u),
    n,
    e.documentTypeName ?? null,
    f.blueprintUnique,
    y?.blueprintName ?? null,
    i
  ) && await a(this, o, _).call(this, d(this, u));
};
V = async function(t, i) {
  if (!d(this, u) || !this._config) return;
  const e = a(this, o, $).call(this), n = await this.getContext(_t);
  try {
    await n.open(this, yt, {
      data: {
        headline: `Map to ${t.label}?`,
        content: l`<p>
						The ${e} used for each import will be written to
						<strong>${t.label}</strong>.
					</p>`,
        confirmLabel: "Map",
        color: "positive"
      }
    }).onSubmit();
  } catch {
    return;
  }
  const s = I, r = this._config.map?.mappings ?? [], c = r.find((v) => v.source === s), p = [
    ...(c?.destinations ?? []).filter(
      (v) => !(v.target === t.alias && v.blockKey === i)
    ),
    { target: t.alias, blockKey: i }
  ], f = { source: s, destinations: p, enabled: !0 }, y = c ? r.map((v) => v.source === s ? f : v) : [...r, f], b = await (await this.getContext(w)).getLatestToken(), N = await dt(
    d(this, u),
    { ...this._config.map ?? { version: "1.0", mappings: [] }, mappings: y },
    b
  );
  N && (this._config = { ...this._config, map: N });
};
$ = function() {
  const t = Object.keys(this._config?.sources ?? {});
  return t.length === 1 && t[0] === "web" ? "source URL" : "source file";
};
z = async function() {
  if (!d(this, u)) return;
  const i = await (await this.getContext(w)).getLatestToken();
  await pt(d(this, u), i) && await a(this, o, _).call(this, d(this, u));
};
A = function() {
  return this._config ? ht(this._config.destination) : [];
};
C = function(t, i) {
  if (!this._config?.map?.mappings) return [];
  const e = [];
  for (const n of this._config.map.mappings)
    if (n.enabled !== !1)
      for (const s of n.destinations)
        s.target === t && (i ? s.blockKey === i : !s.blockKey) && e.push({ source: n.source, mapping: n });
  return e;
};
R = function(t) {
  if (t === I)
    return a(this, o, $).call(this).replace(/\b\w/, (r) => r.toUpperCase());
  const i = t.split("."), e = i[0], n = i[1], s = e.replace(/-/g, " ").replace(/\b\w/g, (r) => r.toUpperCase());
  if (n && n !== "content") {
    const r = n.replace(/\b\w/g, (c) => c.toUpperCase());
    return `${s} (${r})`;
  }
  return s;
};
D = function(t, i) {
  const e = a(this, o, C).call(this, t, i);
  return e.length === 0 ? h : e.map(
    ({ source: n }) => l`
				<uui-tag color="positive" look="primary" class="mapped-tag" title="${n}">
					${a(this, o, R).call(this, n)}
					<button class="unmap-x" title="Remove mapping" @click=${(s) => {
      s.stopPropagation();
    }}>&times;</button>
				</uui-tag>
			`
  );
};
S = function(t, i) {
  return a(this, o, C).call(this, t, i).length > 0;
};
X = function(t) {
  if (!t.properties?.length) return h;
  const i = [];
  for (const e of t.properties) {
    const n = a(this, o, C).call(this, e.alias, t.key);
    for (const { source: s } of n)
      i.push(l`
					<uui-tag color="positive" look="primary" class="mapped-tag" title="${s}">
						${a(this, o, R).call(this, s)}
						<button class="unmap-x" title="Remove mapping" @click=${(r) => {
        r.stopPropagation();
      }}>&times;</button>
					</uui-tag>
				`);
  }
  return i.length > 0 ? i : h;
};
K = function(t) {
  const i = new Set(this._collapsedBlocks);
  i.has(t) ? i.delete(t) : i.add(t), this._collapsedBlocks = i;
};
J = function(t) {
  return this._collapsedBlocks.has(t);
};
Q = function() {
  if (!this._config) return;
  const t = /* @__PURE__ */ new Set();
  for (const i of M(this._config.destination))
    if (q(i.tab ?? "Page Content") === this._activeTab)
      for (const e of i.blocks)
        t.add(e.key);
  this._collapsedBlocks = t;
};
Y = function() {
  this._collapsedBlocks = /* @__PURE__ */ new Set();
};
Z = function(t) {
  this._collapsePopoverOpen = t.newState === "open";
};
tt = function() {
  return this._config ? M(this._config.destination).some(
    (t) => q(t.tab ?? "Page Content") === this._activeTab
  ) : !1;
};
O = function(t, i) {
  return t.fillableBy?.includes("importFact") ?? !1 ? l`
			<uui-button
				class="md-map-btn"
				look="outline"
				compact
				label="Map"
				title="Map the ${a(this, o, $).call(this)} to this field"
				@click=${() => a(this, o, V).call(this, t, i)}>
				<uui-icon name="icon-nodes"></uui-icon> Map
			</uui-button>
		` : l`
				<uui-button
					class="md-map-btn"
					look="outline"
					compact
					disabled
					label="Map"
					title="Map this field from the Source tab">
					<uui-icon name="icon-nodes"></uui-icon> Map
				</uui-button>
			`;
};
it = function(t) {
  const i = a(this, o, S).call(this, t.alias);
  return l`
			<div class="part-box ${i ? "" : "unmapped"}">
				<div class="part-box-row">
					<div class="part-box-info">
						<div class="part-box-field-name">${t.label}</div>
						<div class="part-box-field-meta">
							<span class="field-alias">${t.alias}</span>
							<span class="field-type-badge">${t.type}</span>
							${t.mandatory ? l`<uui-tag look="primary" color="danger" class="required-badge">Required</uui-tag>` : h}
						</div>
					</div>
					<div class="part-box-actions">
						${a(this, o, D).call(this, t.alias)}
						${a(this, o, O).call(this, t)}
					</div>
				</div>
			</div>
		`;
};
et = function(t) {
  const e = (this._config?.destination.blockGrids ?? []).some((n) => n.key === t.key) ? "icon-grid" : "icon-thumbnail-list";
  return l`
			<div class="section-box container-box">
				<div class="section-box-header container-header">
					<uui-icon name="${e}" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
				</div>
				<div class="section-box-content">
					${t.blocks.map((n) => a(this, o, ot).call(this, n))}
				</div>
			</div>
		`;
};
ot = function(t) {
  const i = a(this, o, J).call(this, t.key);
  return l`
			<div class="section-box">
				<div class="section-box-header" @click=${() => a(this, o, K).call(this, t.key)}>
					<uui-icon class="collapse-chevron" name="${i ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon name="icon-box" class="level-icon"></uui-icon>
					<span class="section-box-label">${t.label}</span>
					${t.identifyBy && !t.identifyBy.value.startsWith("[") ? l`<span class="block-identify">identified by: "${t.identifyBy.value}"</span>` : h}
					<span class="header-spacer"></span>
					${i ? a(this, o, X).call(this, t) : h}
				</div>
				${!i && t.properties?.length ? l`
						<div class="section-box-content">
							${t.properties.map((e) => a(this, o, at).call(this, e, t.key))}
						</div>
					` : h}
			</div>
		`;
};
at = function(t, i) {
  const e = a(this, o, S).call(this, t.alias, i);
  return l`
			<div class="part-box ${e ? "" : "unmapped"}">
				<div class="part-box-row">
					<span class="part-box-label">${t.label || t.alias}</span>
					<div class="part-box-info">
						<div class="part-box-field-meta">
							<span class="field-alias">${t.alias}</span>
							<span class="field-type-badge">${t.type}</span>
							${t.acceptsFormats?.length ? l`<span class="accepts-formats">${t.acceptsFormats.join(", ")}</span>` : h}
						</div>
					</div>
					<div class="part-box-actions">
						${a(this, o, D).call(this, t.alias, i)}
						${a(this, o, O).call(this, t, i)}
					</div>
				</div>
			</div>
		`;
};
nt = function() {
  return this._config ? this._config.destination.fields.length : 0;
};
st = function() {
  return this._config ? M(this._config.destination).reduce((t, i) => t + i.blocks.length, 0) : 0;
};
rt = function() {
  if (!this._config) return h;
  const t = this._config.destination;
  return l`
			<div class="info-boxes">
				<uui-box headline="Document Type" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-document-dashed-line" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${t.documentTypeName ?? t.documentTypeAlias}">${t.documentTypeName ?? t.documentTypeAlias}</span>
						<span class="box-sub">${t.documentTypeAlias}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Change" @click=${a(this, o, H)}>
								<uui-icon name="icon-document-dashed-line"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blueprint" class="info-box-item ${this._blueprintMissing ? "blueprint-missing" : ""}">
					<div class="box-content">
						<uui-icon name="icon-blueprint" class="box-icon ${this._blueprintMissing ? "box-icon-warning" : ""}"></uui-icon>
						<span class="box-stat box-filename ${this._blueprintMissing ? "box-filename-warning" : ""}" title="${t.blueprintName ?? "—"}">${t.blueprintName ?? "—"}</span>
						${this._blueprintMissing ? l`<uui-tag color="warning" look="primary">Not found</uui-tag>` : h}
						<div class="box-buttons">
							<uui-button look="primary" color="${this._blueprintMissing ? "warning" : "default"}" label="Change" @click=${a(this, o, j)}>
								<uui-icon name="icon-blueprint"></uui-icon> Change
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Fields" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-layers" class="box-icon"></uui-icon>
						<span class="box-stat">${a(this, o, nt).call(this)}</span>
						<span class="box-sub">mappable</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" @click=${a(this, o, z)}>
								<uui-icon name="icon-layers"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Blocks" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-box" class="box-icon"></uui-icon>
						<span class="box-stat">${a(this, o, st).call(this)}</span>
						<span class="box-sub">in blueprint</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Regenerate" @click=${a(this, o, z)}>
								<uui-icon name="icon-box"></uui-icon> Regenerate
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
};
lt = function() {
  return a(this, o, tt).call(this) ? l`
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
					@toggle=${a(this, o, Z)}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => a(this, o, Y).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="Collapse All"
							@click=${() => a(this, o, Q).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-right"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		` : h;
};
ct = function() {
  if (!this._config) return h;
  const t = ft(this._config.destination, this._activeTab);
  return t.length ? l`
			${t.map(({ group: i, fields: e, containers: n }) => {
    const s = l`
					${e.map((r) => a(this, o, it).call(this, r))}
					${n.map((r) => a(this, o, et).call(this, r))}
				`;
    return i ? l`
					<div class="group-panel">
						<div class="group-panel-header">${i}</div>
						<div class="group-panel-content">${s}</div>
					</div>
				` : s;
  })}
		` : l`<p class="empty-message">Nothing in this tab.</p>`;
};
g.styles = [
  vt,
  bt`
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
m([
  x()
], g.prototype, "_config", 2);
m([
  x()
], g.prototype, "_loading", 2);
m([
  x()
], g.prototype, "_error", 2);
m([
  x()
], g.prototype, "_activeTab", 2);
m([
  x()
], g.prototype, "_collapsedBlocks", 2);
m([
  x()
], g.prototype, "_collapsePopoverOpen", 2);
m([
  x()
], g.prototype, "_blueprintMissing", 2);
g = m([
  gt("up-doc-workflow-destination-view")
], g);
const St = g;
export {
  g as UpDocWorkflowDestinationViewElement,
  St as default
};
//# sourceMappingURL=up-doc-workflow-destination-view.element-CBgv6QuZ.js.map
