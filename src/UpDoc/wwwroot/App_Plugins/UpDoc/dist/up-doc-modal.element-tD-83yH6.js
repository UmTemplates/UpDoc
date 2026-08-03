import { a as P } from "./workflow.types-CVkhzFGj.js";
import { a as dt, b as W, t as F } from "./workflow.service-DwTP3LNQ.js";
import { r as pt, g as ht, a as ft, b as bt, c as mt } from "./destination-utils-DQDyJQ_T.js";
import { s as I } from "./transforms-qqnY8EQ-.js";
import { html as d, css as gt, state as m, customElement as vt, nothing as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as _t } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as yt } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as L } from "@umbraco-cms/backoffice/auth";
var kt = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, G = (t) => {
  throw TypeError(t);
}, f = (t, i, e, o) => {
  for (var a = o > 1 ? void 0 : o ? xt(i, e) : i, c = t.length - 1, l; c >= 0; c--)
    (l = t[c]) && (a = (o ? l(i, e, a) : l(a)) || a);
  return o && a && kt(i, e, a), a;
}, A = (t, i, e) => i.has(t) || G("Cannot " + e), U = (t, i, e) => (A(t, i, "read from private field"), e ? e.call(t) : i.get(t)), q = (t, i, e) => i.has(t) ? G("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, e), B = (t, i, e, o) => (A(t, i, "write to private field"), i.set(t, e), e), r = (t, i, e) => (A(t, i, "access private method"), e), y, n, j, R, D, K, Y, M, N, H, X, J, Q, V, Z, tt, C, T, z, et, it, ot, $, at, nt, rt, st, ct, ut;
const wt = {
  pdf: "PDF Document",
  markdown: "Markdown",
  web: "Web Page",
  doc: "Word Document"
};
let p = class extends yt {
  constructor() {
    super(...arguments), q(this, n), this._activeTab = "source", this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, q(this, y, {}), this._config = null, this._workflowConfig = null, this._isExtracting = !1, this._extractionError = null, this._contentActiveTab = "", this._availableSourceTypes = [], this._loadingSourceTypes = !0;
  }
  firstUpdated() {
    this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, this._config = null, this._workflowConfig = null, this._contentActiveTab = "", r(this, n, j).call(this);
  }
  render() {
    const t = r(this, n, ct).call(this);
    return d`
			<umb-body-layout headline="Create from Source">
				${r(this, n, et).call(this)}

				<div class="tab-content">
					${r(this, n, ut).call(this)}
				</div>

				<uui-button
					slot="actions"
					id="close"
					label=${this.localize.term("general_close")}
					@click="${r(this, n, X)}"></uui-button>
				<uui-button
					slot="actions"
					id="save"
					look="primary"
					color="positive"
					label=${this.localize.term("general_create")}
					?disabled=${!t}
					@click="${r(this, n, H)}"></uui-button>
			</umb-body-layout>
		`;
  }
};
y = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
j = async function() {
  this._loadingSourceTypes = !0;
  try {
    const t = this.data?.blueprintId;
    if (!t) return;
    const e = await (await this.getContext(L)).getLatestToken(), o = await dt(t, e);
    o && (this._config = o, o.sources && (this._availableSourceTypes = Object.keys(o.sources), this._availableSourceTypes.length === 1 && (this._sourceType = this._availableSourceTypes[0])));
  } catch (t) {
    console.error("Failed to load available source types:", t);
  } finally {
    this._loadingSourceTypes = !1;
  }
};
R = function(t) {
  const e = t.target.value;
  e !== this._sourceType && (this._selectedMediaUnique = null, this._sourceUrl = "", this._sectionLookup = {}, this._extractionError = null, this._contentActiveTab = ""), this._sourceType = e;
};
D = async function(t) {
  const e = t.target.selection;
  this._selectedMediaUnique = e.length > 0 ? e[0] : null, this._selectedMediaUnique ? await r(this, n, Y).call(this, this._selectedMediaUnique) : (this._sectionLookup = {}, this._documentName = "", this._extractionError = null);
};
K = function() {
  return this._config ? this._sourceType && this._config.sources?.[this._sourceType]?.workflowAlias ? this._config.sources[this._sourceType].workflowAlias : this._config.folderPath ? this._config.folderPath.replace(/\\/g, "/").split("/").pop() ?? null : null : null;
};
Y = async function(t) {
  this._isExtracting = !0, this._extractionError = null;
  try {
    const e = await (await this.getContext(L)).getLatestToken(), o = r(this, n, K).call(this);
    if (!o) {
      this._extractionError = "No workflow configured for this blueprint";
      return;
    }
    const a = await W(o, e);
    a && (this._workflowConfig = a);
    const c = await F(o, t, e), l = P(c);
    if (!l.length) {
      this._extractionError = "Failed to extract content from source";
      return;
    }
    const h = {}, u = {};
    for (const s of l)
      s.included && (s.heading && (h[`${s.id}.heading`] = s.pattern === "role" ? s.content : s.heading, h[`${s.id}.title`] = s.pattern === "role" ? s.content : s.heading), h[`${s.id}.content`] = s.content, s.description && (h[`${s.id}.description`] = s.description), s.summary && (h[`${s.id}.summary`] = s.summary), s.stableKey && (u[s.stableKey] = s.id));
    this._sectionLookup = h, B(this, y, u), !this._documentName && (this._workflowConfig || this._config) && r(this, n, N).call(this, h);
  } catch (i) {
    this._extractionError = "Failed to connect to extraction service", console.error("Extraction error:", i);
  } finally {
    this._isExtracting = !1;
  }
};
M = async function() {
  if (this._sourceUrl) {
    this._isExtracting = !0, this._extractionError = null;
    try {
      const i = await (await this.getContext(L)).getLatestToken(), e = r(this, n, K).call(this);
      if (!e) {
        this._extractionError = "No workflow configured for this blueprint";
        return;
      }
      const o = await W(e, i);
      o && (this._workflowConfig = o);
      const a = await F(e, "", i, this._sourceUrl), c = P(a);
      if (!c.length) {
        this._extractionError = "Failed to extract content from web page";
        return;
      }
      const l = {}, h = {};
      for (const u of c)
        u.included && (u.heading && (l[`${u.id}.heading`] = u.pattern === "role" ? u.content : u.heading, l[`${u.id}.title`] = u.pattern === "role" ? u.content : u.heading), l[`${u.id}.content`] = u.content, u.description && (l[`${u.id}.description`] = u.description), u.summary && (l[`${u.id}.summary`] = u.summary), u.stableKey && (h[u.stableKey] = u.id));
      this._sectionLookup = l, B(this, y, h), !this._documentName && (this._workflowConfig || this._config) && r(this, n, N).call(this, l);
    } catch (t) {
      this._extractionError = "Failed to extract from web page", console.error("Web extraction error:", t);
    } finally {
      this._isExtracting = !1;
    }
  }
};
N = function(t) {
  const i = this._workflowConfig ?? this._config;
  if (i?.map?.mappings?.length) {
    let e = null;
    for (const o of i.map.mappings) {
      if (o.enabled === !1) continue;
      const a = o.destinations.find(
        (c) => !c.blockKey && c.target === "pageTitle"
      );
      if (a) {
        e = a.target;
        break;
      }
    }
    if (!e)
      for (const o of i.map.mappings) {
        if (o.enabled === !1) continue;
        const a = o.destinations.find((c) => !c.blockKey);
        if (a) {
          e = a.target;
          break;
        }
      }
    if (e) {
      const o = [];
      for (const a of i.map.mappings) {
        if (a.enabled === !1) continue;
        a.destinations.some(
          (l) => l.target === e && !l.blockKey
        ) && t[a.source] && o.push(t[a.source]);
      }
      if (o.length > 0) {
        this._documentName = I(o.join(" "));
        return;
      }
    }
  }
  for (const [e, o] of Object.entries(t))
    if (e.endsWith(".heading") && o) {
      this._documentName = I(o);
      return;
    }
};
H = function() {
  const t = this._workflowConfig ?? this._config;
  this.value = {
    name: this._documentName,
    sourceType: this._sourceType,
    mediaUnique: this._selectedMediaUnique,
    sourceUrl: this._sourceUrl || null,
    sectionLookup: this._sectionLookup,
    stableKeyLookup: U(this, y),
    config: t
  }, this._submitModal();
};
X = function() {
  this._rejectModal();
};
J = function() {
  switch (this._sourceType) {
    case "pdf":
      return r(this, n, Q).call(this);
    case "markdown":
      return r(this, n, V).call(this);
    case "web":
      return r(this, n, Z).call(this);
    case "doc":
      return r(this, n, tt).call(this);
    default:
      return O;
  }
};
Q = function() {
  return d`
			<umb-property-layout label="PDF File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${r(this, n, D)}>
					</umb-input-media>
					${r(this, n, z).call(this)}
				</div>
			</umb-property-layout>
		`;
};
V = function() {
  return d`
			<umb-property-layout label="Markdown File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${r(this, n, D)}>
					</umb-input-media>
					${r(this, n, z).call(this)}
				</div>
			</umb-property-layout>
		`;
};
Z = function() {
  return d`
			<umb-property-layout label="Web Page URL" orientation="vertical">
				<div slot="editor">
					<div style="display: flex; gap: 8px; align-items: center;">
						<uui-input
							label="URL"
							placeholder="https://example.com/page"
							style="flex: 1;"
							.value=${this._sourceUrl}
							@input=${(t) => this._sourceUrl = t.target.value}
							@keydown=${(t) => {
    t.key === "Enter" && this._sourceUrl && r(this, n, M).call(this);
  }}>
						</uui-input>
						<uui-button
							look="primary"
							label="Extract"
							?disabled=${!this._sourceUrl || this._isExtracting}
							@click=${() => r(this, n, M).call(this)}>
							Extract
						</uui-button>
					</div>
					${r(this, n, z).call(this)}
				</div>
			</umb-property-layout>
		`;
};
tt = function() {
  return d`
			<umb-property-layout label="Word Document" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						@change=${(t) => {
    const e = t.target.selection;
    this._selectedMediaUnique = e.length > 0 ? e[0] : null;
  }}>
					</umb-input-media>
					<div class="source-coming-soon">
						<uui-icon name="icon-info"></uui-icon>
						<span>Word document extraction is not yet available.</span>
					</div>
				</div>
			</umb-property-layout>
		`;
};
C = function() {
  return Object.keys(this._sectionLookup).length > 0;
};
T = function(t) {
  t === "content" && !r(this, n, C).call(this) || (this._activeTab = t);
};
z = function() {
  return this._isExtracting ? d`<div class="extraction-status extracting">
				<uui-loader-bar></uui-loader-bar>
				<span>Extracting content from source...</span>
			</div>` : this._extractionError ? d`<div class="extraction-status error">
				<uui-icon name="icon-alert"></uui-icon>
				<span>${this._extractionError}</span>
			</div>` : Object.values(this._sectionLookup).some((i) => i.length > 0) ? d`<div class="extraction-status success">
				<uui-icon name="icon-check"></uui-icon>
				<span>Content extracted successfully</span>
			</div>` : O;
};
et = function() {
  const t = r(this, n, C).call(this);
  return d`
			<uui-tab-group slot="navigation">
				<uui-tab
					label="Source"
					?active=${this._activeTab === "source"}
					orientation="horizontal"
					@click=${() => r(this, n, T).call(this, "source")}>
					<uui-icon slot="icon" name="icon-page-add"></uui-icon>
					Source
				</uui-tab>
				<uui-tab
					label="Content"
					?active=${this._activeTab === "content"}
					orientation="horizontal"
					?disabled=${!t}
					@click=${() => r(this, n, T).call(this, "content")}>
					<uui-icon slot="icon" name="icon-edit"></uui-icon>
					Content
				</uui-tab>
				<uui-tab
					label="Destination"
					?active=${this._activeTab === "destination"}
					orientation="horizontal"
					@click=${() => r(this, n, T).call(this, "destination")}>
					<uui-icon slot="icon" name="icon-document"></uui-icon>
					Destination
				</uui-tab>
			</uui-tab-group>
		`;
};
it = function() {
  return d`
			<uui-box headline="Document Name">
				<p>Enter a document name or let it be populated from the source. You can edit this later.</p>
				<uui-input
					id="name"
					label="name"
					placeholder="Enter document name"
					.value=${this._documentName}
					@input=${(t) => this._documentName = t.target.value}>
				</uui-input>
			</uui-box>

			<uui-box headline="Source">
				${this._loadingSourceTypes ? d`<uui-loader-bar></uui-loader-bar>` : this._availableSourceTypes.length === 0 ? d`<p style="color: var(--uui-color-danger);">No source types configured for this workflow.</p>` : d`
							<umb-property-layout label="Source Type" orientation="vertical">
								<div slot="editor">
									<uui-select
										label="Select source type"
										.options=${[
    ...this._availableSourceTypes.length > 1 ? [{ name: "Choose a source...", value: "", selected: this._sourceType === "" }] : [],
    ...this._availableSourceTypes.map((t) => ({
      name: wt[t] || t,
      value: t,
      selected: this._sourceType === t
    }))
  ]}
										@change=${r(this, n, R)}>
									</uui-select>
								</div>
							</umb-property-layout>

							${r(this, n, J).call(this)}
						`}
			</uui-box>
		`;
};
ot = function() {
  const t = this._workflowConfig ?? this._config;
  if (!t?.map?.mappings?.length || !t?.destination) return [];
  const i = t.destination, e = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const s of t.map.mappings) {
    if (s.enabled === !1) continue;
    let v = this._sectionLookup[s.source];
    if (!v && s.sourceKey && U(this, y)) {
      const g = U(this, y)[s.sourceKey];
      if (g) {
        const b = s.source.split(".").pop();
        b && (v = this._sectionLookup[`${g}.${b}`]);
      }
    }
    if (v)
      for (const g of s.destinations) {
        const b = g.blockKey ? `${g.blockKey}:${g.target}` : g.target, _ = e.get(b) ?? [];
        _.push(v), e.set(b, _), o.has(b) || o.set(b, { alias: g.target, blockKey: g.blockKey });
      }
  }
  const a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
  for (const [s, v] of e.entries()) {
    const g = o.get(s), b = g?.alias ?? s, _ = g?.blockKey, S = pt(
      { target: b, blockKey: _ },
      i
    ) ?? "other";
    a.has(S) || a.set(S, []);
    let E = b;
    if (_)
      for (const x of ht(i)) {
        const w = x.blocks.find((k) => k.key === _);
        if (w) {
          const k = w.properties?.find((lt) => lt.alias === b);
          k && (E = k.label || k.alias);
          break;
        }
      }
    else {
      const x = i.fields.find((w) => w.alias === b);
      x && (E = x.label);
    }
    a.get(S).push({
      label: E,
      value: v.join(" "),
      blockLabel: _ ? bt(_, i) ?? void 0 : void 0,
      group: ft({ target: b, blockKey: _ }, i) ?? void 0
    });
  }
  const l = mt(i), h = [];
  for (const s of l) {
    const v = a.get(s.id);
    v?.length && (c.set(s.id, s.label), h.push({ tabId: s.id, tabLabel: s.label, items: v }));
  }
  const u = a.get("other");
  return u?.length && h.push({ tabId: "other", tabLabel: "Other", items: u }), h;
};
$ = function(t, i) {
  return d`
			<div class="section-card">
				<div class="section-card-header">
					<span class="section-card-label">${t}</span>
				</div>
				<div class="section-card-body">
					<uui-action-bar class="section-card-actions">
						<uui-button
							compact
							title="Copy"
							label="Copy ${t}"
							@click=${() => r(this, n, st).call(this, t, i)}>
							<uui-icon name="icon-documents"></uui-icon>
						</uui-button>
					</uui-action-bar>
					<div class="section-card-content">${i}</div>
				</div>
			</div>
		`;
};
at = function(t) {
  if (t.tabId === "page-content") {
    const o = /* @__PURE__ */ new Map();
    for (const a of t.items) {
      const c = a.blockLabel ?? "Other", l = o.get(c) ?? [];
      l.push(a), o.set(c, l);
    }
    return d`
				${Array.from(o.entries()).map(([a, c]) => d`
					<div class="block-group-header">
						<umb-icon name="icon-box"></umb-icon>
						<span>${a}</span>
					</div>
					${c.map((l) => r(this, n, $).call(this, l.label, l.value))}
				`)}
			`;
  }
  const i = /* @__PURE__ */ new Map();
  for (const o of t.items) {
    const a = o.group ?? null, c = i.get(a) ?? [];
    c.push(o), i.set(a, c);
  }
  const e = Array.from(i.entries()).sort(
    ([o], [a]) => o === null ? -1 : a === null ? 1 : 0
  );
  return d`
			${e.map(
    ([o, a]) => o ? d`
						<div class="group-panel">
							<div class="group-panel-header">${o}</div>
							<div class="group-panel-content">
								${a.map((c) => r(this, n, $).call(this, c.label, c.value))}
							</div>
						</div>
					` : a.map((c) => r(this, n, $).call(this, c.label, c.value))
  )}
		`;
};
nt = function() {
  const t = r(this, n, ot).call(this);
  if (t.length === 0)
    return d`
				<div class="content-editor">
					<p class="content-editor-intro">No mapped content to preview. Create mappings in the workflow editor first.</p>
				</div>
			`;
  (!this._contentActiveTab || !t.find((e) => e.tabId === this._contentActiveTab)) && (this._contentActiveTab = t[0].tabId);
  const i = t.find((e) => e.tabId === this._contentActiveTab) ?? t[0];
  return d`
			<uui-tab-group class="content-inner-tabs">
				${t.map((e) => d`
					<uui-tab
						label=${e.tabLabel}
						?active=${this._contentActiveTab === e.tabId}
						@click=${() => {
    this._contentActiveTab = e.tabId;
  }}>
						${e.tabLabel}
					</uui-tab>
				`)}
			</uui-tab-group>
			${r(this, n, at).call(this, i)}
		`;
};
rt = function() {
  return d`
			<uui-box headline="Document Type">
				<div class="destination-value">
					<umb-icon name="icon-document-dashed-line"></umb-icon>
					<span>${this.data?.documentTypeName}</span>
				</div>
			</uui-box>

			<uui-box headline="Blueprint">
				<div class="destination-value">
					<umb-icon name="icon-blueprint"></umb-icon>
					<span>${this.data?.blueprintName}</span>
				</div>
			</uui-box>
		`;
};
st = async function(t, i) {
  try {
    await navigator.clipboard.writeText(i), console.log("Copied to clipboard:", t);
  } catch (e) {
    console.error("Failed to copy:", e);
  }
};
ct = function() {
  if (!this._documentName || this._isExtracting) return !1;
  switch (this._sourceType) {
    case "pdf":
    case "markdown":
      return !!this._selectedMediaUnique;
    case "web":
      return r(this, n, C).call(this);
    case "doc":
      return !1;
    default:
      return !1;
  }
};
ut = function() {
  switch (this._activeTab) {
    case "source":
      return r(this, n, it).call(this);
    case "content":
      return r(this, n, nt).call(this);
    case "destination":
      return r(this, n, rt).call(this);
  }
};
p.styles = [
  _t,
  gt`
			/* Navigation tabs */
			uui-tab[disabled] {
				opacity: 0.5;
				cursor: not-allowed;
			}

			/* Tab content */
			.tab-content {
				display: flex;
				flex-direction: column;
			}

			/* Content editor tab */
			.content-editor {
				display: flex;
				flex-direction: column;
			}

			.content-editor uui-box {
				margin-bottom: var(--uui-size-space-4);
			}

			.content-editor-intro {
				margin: 0 0 var(--uui-size-space-4) 0;
				color: var(--uui-color-text-alt);
				font-size: var(--uui-type-small-size);
			}

			.section-card {
				position: relative;
				background: var(--uui-color-surface);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin-bottom: var(--uui-size-space-4);
			}

			.section-card-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border-bottom: 1px solid var(--uui-color-border);
				background: var(--uui-color-surface-alt);
			}

			.section-card-label {
				font-weight: 600;
			}

			.section-card-body {
				position: relative;
			}

			.section-card-actions {
				position: absolute;
				top: var(--uui-size-space-2);
				right: var(--uui-size-space-2);
				opacity: 0;
				transition: opacity 120ms ease;
			}

			.section-card:hover .section-card-actions {
				opacity: 1;
			}

			.section-card-content {
				padding: var(--uui-size-space-4);
				white-space: pre-wrap;
				font-size: var(--uui-type-small-size);
				max-height: 300px;
				overflow-y: auto;
			}

			/* Content tab inner tabs — bleed edge-to-edge past outer body layout padding */
			.content-inner-tabs {
				margin: calc(var(--uui-size-layout-1) * -1);
				margin-bottom: var(--uui-size-space-4);
				background: var(--uui-color-surface);
				--uui-tab-background: var(--uui-color-surface);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.block-group-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius) var(--uui-border-radius) 0 0;
				font-weight: 600;
				font-size: var(--uui-type-small-size);
				margin-top: var(--uui-size-space-4);
			}

			.block-group-header:first-child {
				margin-top: 0;
			}

			.block-group-header + .section-card {
				border-top: none;
				border-radius: 0 0 var(--uui-border-radius) var(--uui-border-radius);
			}

			.block-group-header + .section-card .section-card-header {
				border-radius: 0;
			}

			/* Group panel — mirrors how the backoffice boxes a group within a tab,
			   so the preview reads like the document it will create. */
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
				font-weight: 700;
				font-size: var(--uui-type-default-size);
				color: var(--uui-color-text);
			}

			.group-panel-content {
				padding: var(--uui-size-space-4);
			}

			/* Destination tab */
			.destination-value {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			uui-input {
				width: 100%;
			}

			uui-box {
				margin-bottom: var(--uui-size-space-4);
			}

			p {
				margin-bottom: var(--uui-size-space-4);
			}

			.extraction-status {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				margin-top: var(--uui-size-space-3);
				padding: var(--uui-size-space-2);
				border-radius: var(--uui-border-radius);
				font-size: var(--uui-type-small-size);
			}

			.extraction-status.extracting {
				background-color: var(--uui-color-surface-alt);
			}

			.extraction-status.error {
				background-color: var(--uui-color-danger-emphasis);
				color: var(--uui-color-danger-contrast);
			}

			.extraction-status.success {
				background-color: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
			}

			uui-select {
				width: 100%;
			}

			.source-coming-soon {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				margin-top: var(--uui-size-space-3);
				padding: var(--uui-size-space-2);
				border-radius: var(--uui-border-radius);
				font-size: var(--uui-type-small-size);
				background-color: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
			}
		`
];
f([
  m()
], p.prototype, "_activeTab", 2);
f([
  m()
], p.prototype, "_documentName", 2);
f([
  m()
], p.prototype, "_sourceType", 2);
f([
  m()
], p.prototype, "_sourceUrl", 2);
f([
  m()
], p.prototype, "_selectedMediaUnique", 2);
f([
  m()
], p.prototype, "_sectionLookup", 2);
f([
  m()
], p.prototype, "_config", 2);
f([
  m()
], p.prototype, "_workflowConfig", 2);
f([
  m()
], p.prototype, "_isExtracting", 2);
f([
  m()
], p.prototype, "_extractionError", 2);
f([
  m()
], p.prototype, "_contentActiveTab", 2);
f([
  m()
], p.prototype, "_availableSourceTypes", 2);
f([
  m()
], p.prototype, "_loadingSourceTypes", 2);
p = f([
  vt("up-doc-modal")
], p);
const Lt = p;
export {
  p as UpDocModalElement,
  Lt as default
};
//# sourceMappingURL=up-doc-modal.element-tD-83yH6.js.map
