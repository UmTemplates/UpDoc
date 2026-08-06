import { a as P } from "./workflow.types-QrurYwv2.js";
import { a as dt, b as W, t as F } from "./workflow.service-Coqu6zLj.js";
import { r as pt, g as ht, a as ft, b as bt, c as mt, s as gt } from "./destination-utils-BFSWOBvb.js";
import { s as I } from "./transforms-qqnY8EQ-.js";
import { b as vt } from "./create-from-source-Lr3UzQBc.js";
import { html as d, css as _t, state as m, customElement as yt, nothing as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as kt } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as wt } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as M } from "@umbraco-cms/backoffice/auth";
var xt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, G = (t) => {
  throw TypeError(t);
}, f = (t, i, e, n) => {
  for (var s = n > 1 ? void 0 : n ? Tt(i, e) : i, u = t.length - 1, c; u >= 0; u--)
    (c = t[u]) && (s = (n ? c(i, e, s) : c(s)) || s);
  return n && s && xt(i, e, s), s;
}, A = (t, i, e) => i.has(t) || G("Cannot " + e), U = (t, i, e) => (A(t, i, "read from private field"), e ? e.call(t) : i.get(t)), q = (t, i, e) => i.has(t) ? G("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, e), B = (t, i, e, n) => (A(t, i, "write to private field"), i.set(t, e), e), a = (t, i, e) => (A(t, i, "access private method"), e), y, o, j, R, N, D, Y, L, K, H, X, J, Q, V, Z, tt, C, T, S, et, it, ot, $, at, nt, rt, st, ct, ut;
const $t = {
  pdf: "PDF Document",
  markdown: "Markdown",
  web: "Web Page",
  doc: "Word Document"
};
let p = class extends wt {
  constructor() {
    super(...arguments), q(this, o), this._activeTab = "source", this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, q(this, y, {}), this._config = null, this._workflowConfig = null, this._isExtracting = !1, this._extractionError = null, this._contentActiveTab = "", this._availableSourceTypes = [], this._loadingSourceTypes = !0;
  }
  firstUpdated() {
    this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, this._config = null, this._workflowConfig = null, this._contentActiveTab = "", a(this, o, j).call(this);
  }
  render() {
    const t = a(this, o, ct).call(this);
    return d`
			<umb-body-layout headline="Create from Source">
				${a(this, o, et).call(this)}

				<div class="tab-content">
					${a(this, o, ut).call(this)}
				</div>

				<uui-button
					slot="actions"
					id="close"
					label=${this.localize.term("general_close")}
					@click="${a(this, o, X)}"></uui-button>
				<uui-button
					slot="actions"
					id="save"
					look="primary"
					color="positive"
					label=${this.localize.term("general_create")}
					?disabled=${!t}
					@click="${a(this, o, H)}"></uui-button>
			</umb-body-layout>
		`;
  }
};
y = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
j = async function() {
  this._loadingSourceTypes = !0;
  try {
    const t = this.data?.blueprintId;
    if (!t) return;
    const e = await (await this.getContext(M)).getLatestToken(), n = await dt(t, e);
    n && (this._config = n, n.sources && (this._availableSourceTypes = Object.keys(n.sources), this._availableSourceTypes.length === 1 && (this._sourceType = this._availableSourceTypes[0])));
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
N = async function(t) {
  const e = t.target.selection;
  this._selectedMediaUnique = e.length > 0 ? e[0] : null, this._selectedMediaUnique ? await a(this, o, Y).call(this, this._selectedMediaUnique) : (this._sectionLookup = {}, this._documentName = "", this._extractionError = null);
};
D = function() {
  return this._config ? this._sourceType && this._config.sources?.[this._sourceType]?.workflowAlias ? this._config.sources[this._sourceType].workflowAlias : this._config.folderPath ? this._config.folderPath.replace(/\\/g, "/").split("/").pop() ?? null : null : null;
};
Y = async function(t) {
  this._isExtracting = !0, this._extractionError = null;
  try {
    const e = await (await this.getContext(M)).getLatestToken(), n = a(this, o, D).call(this);
    if (!n) {
      this._extractionError = "No workflow configured for this blueprint";
      return;
    }
    const s = await W(n, e);
    s && (this._workflowConfig = s);
    const u = await F(n, t, e), c = P(u);
    if (!c.length) {
      this._extractionError = "Failed to extract content from source";
      return;
    }
    const { sectionLookup: l, stableKeyLookup: r } = vt(c);
    this._sectionLookup = l, B(this, y, r), !this._documentName && (this._workflowConfig || this._config) && a(this, o, K).call(this, l);
  } catch (i) {
    this._extractionError = "Failed to connect to extraction service", console.error("Extraction error:", i);
  } finally {
    this._isExtracting = !1;
  }
};
L = async function() {
  if (this._sourceUrl) {
    this._isExtracting = !0, this._extractionError = null;
    try {
      const i = await (await this.getContext(M)).getLatestToken(), e = a(this, o, D).call(this);
      if (!e) {
        this._extractionError = "No workflow configured for this blueprint";
        return;
      }
      const n = await W(e, i);
      n && (this._workflowConfig = n);
      const s = await F(e, "", i, this._sourceUrl), u = P(s);
      if (!u.length) {
        this._extractionError = "Failed to extract content from web page";
        return;
      }
      const c = {}, l = {};
      for (const r of u)
        r.included && (r.heading && (c[`${r.id}.heading`] = r.pattern === "role" ? r.content : r.heading, c[`${r.id}.title`] = r.pattern === "role" ? r.content : r.heading), c[`${r.id}.content`] = r.content, r.description && (c[`${r.id}.description`] = r.description), r.summary && (c[`${r.id}.summary`] = r.summary), r.stableKey && (l[r.stableKey] = r.id));
      this._sectionLookup = c, B(this, y, l), !this._documentName && (this._workflowConfig || this._config) && a(this, o, K).call(this, c);
    } catch (t) {
      this._extractionError = "Failed to extract from web page", console.error("Web extraction error:", t);
    } finally {
      this._isExtracting = !1;
    }
  }
};
K = function(t) {
  const i = this._workflowConfig ?? this._config;
  if (i?.map?.mappings?.length) {
    let e = null;
    for (const n of i.map.mappings) {
      if (n.enabled === !1) continue;
      const s = n.destinations.find(
        (u) => !u.blockKey && u.target === "pageTitle"
      );
      if (s) {
        e = s.target;
        break;
      }
    }
    if (!e)
      for (const n of i.map.mappings) {
        if (n.enabled === !1) continue;
        const s = n.destinations.find((u) => !u.blockKey);
        if (s) {
          e = s.target;
          break;
        }
      }
    if (e) {
      const n = [];
      for (const s of i.map.mappings) {
        if (s.enabled === !1) continue;
        s.destinations.some(
          (c) => c.target === e && !c.blockKey
        ) && t[s.source] && n.push(t[s.source]);
      }
      if (n.length > 0) {
        this._documentName = I(n.join(" "));
        return;
      }
    }
  }
  for (const [e, n] of Object.entries(t))
    if (e.endsWith(".heading") && n) {
      this._documentName = I(n);
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
      return a(this, o, Q).call(this);
    case "markdown":
      return a(this, o, V).call(this);
    case "web":
      return a(this, o, Z).call(this);
    case "doc":
      return a(this, o, tt).call(this);
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
						@change=${a(this, o, N)}>
					</umb-input-media>
					${a(this, o, S).call(this)}
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
						@change=${a(this, o, N)}>
					</umb-input-media>
					${a(this, o, S).call(this)}
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
    t.key === "Enter" && this._sourceUrl && a(this, o, L).call(this);
  }}>
						</uui-input>
						<uui-button
							look="primary"
							label="Extract"
							?disabled=${!this._sourceUrl || this._isExtracting}
							@click=${() => a(this, o, L).call(this)}>
							Extract
						</uui-button>
					</div>
					${a(this, o, S).call(this)}
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
  t === "content" && !a(this, o, C).call(this) || (this._activeTab = t);
};
S = function() {
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
  const t = a(this, o, C).call(this);
  return d`
			<uui-tab-group slot="navigation">
				<uui-tab
					label="Source"
					?active=${this._activeTab === "source"}
					orientation="horizontal"
					@click=${() => a(this, o, T).call(this, "source")}>
					<uui-icon slot="icon" name="icon-page-add"></uui-icon>
					Source
				</uui-tab>
				<uui-tab
					label="Content"
					?active=${this._activeTab === "content"}
					orientation="horizontal"
					?disabled=${!t}
					@click=${() => a(this, o, T).call(this, "content")}>
					<uui-icon slot="icon" name="icon-edit"></uui-icon>
					Content
				</uui-tab>
				<uui-tab
					label="Destination"
					?active=${this._activeTab === "destination"}
					orientation="horizontal"
					@click=${() => a(this, o, T).call(this, "destination")}>
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
      name: $t[t] || t,
      value: t,
      selected: this._sourceType === t
    }))
  ]}
										@change=${a(this, o, R)}>
									</uui-select>
								</div>
							</umb-property-layout>

							${a(this, o, J).call(this)}
						`}
			</uui-box>
		`;
};
ot = function() {
  const t = this._workflowConfig ?? this._config;
  if (!t?.map?.mappings?.length || !t?.destination) return [];
  const i = t.destination, e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  for (const h of t.map.mappings) {
    if (h.enabled === !1) continue;
    let v = this._sectionLookup[h.source];
    if (!v && h.sourceKey && U(this, y)) {
      const g = U(this, y)[h.sourceKey];
      if (g) {
        const b = h.source.split(".").pop();
        b && (v = this._sectionLookup[`${g}.${b}`]);
      }
    }
    if (v)
      for (const g of h.destinations) {
        const b = g.blockKey ? `${g.blockKey}:${g.target}` : g.target, _ = e.get(b) ?? [];
        _.push(v), e.set(b, _), n.has(b) || n.set(b, { alias: g.target, blockKey: g.blockKey });
      }
  }
  const s = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
  for (const [h, v] of e.entries()) {
    const g = n.get(h), b = g?.alias ?? h, _ = g?.blockKey, z = pt(
      { target: b, blockKey: _ },
      i
    ) ?? "other";
    s.has(z) || s.set(z, []);
    let E = b;
    if (_)
      for (const w of ht(i)) {
        const x = w.blocks.find((k) => k.key === _);
        if (x) {
          const k = x.properties?.find((lt) => lt.alias === b);
          k && (E = k.label || k.alias);
          break;
        }
      }
    else {
      const w = i.fields.find((x) => x.alias === b);
      w && (E = w.label);
    }
    s.get(z).push({
      label: E,
      value: v.join(" "),
      blockLabel: _ ? bt(_, i) ?? void 0 : void 0,
      group: ft({ target: b, blockKey: _ }, i) ?? void 0
    });
  }
  const c = mt(i), l = [];
  for (const h of c) {
    const v = s.get(h.id);
    v?.length && (u.set(h.id, h.label), l.push({ tabId: h.id, tabLabel: h.label, items: v }));
  }
  const r = s.get("other");
  return r?.length && l.push({ tabId: "other", tabLabel: "Other", items: r }), l;
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
							@click=${() => a(this, o, st).call(this, t, i)}>
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
    const u = /* @__PURE__ */ new Map();
    for (const c of t.items) {
      const l = c.blockLabel ?? "Other", r = u.get(l) ?? [];
      r.push(c), u.set(l, r);
    }
    return d`
				${Array.from(u.entries()).map(([c, l]) => d`
					<div class="block-group-header">
						<umb-icon name="icon-box"></umb-icon>
						<span>${c}</span>
					</div>
					${l.map((r) => a(this, o, $).call(this, r.label, r.value))}
				`)}
			`;
  }
  const i = /* @__PURE__ */ new Map();
  for (const u of t.items) {
    const c = u.group ?? null, l = i.get(c) ?? [];
    l.push(u), i.set(c, l);
  }
  const e = (this._workflowConfig ?? this._config)?.destination, s = (e ? gt(Array.from(i.keys()), e, t.tabId) : Array.from(i.keys())).map((u) => [u, i.get(u)]);
  return d`
			${s.map(
    ([u, c]) => u ? d`
						<div class="group-panel">
							<div class="group-panel-header">${u}</div>
							<div class="group-panel-content">
								${c.map((l) => a(this, o, $).call(this, l.label, l.value))}
							</div>
						</div>
					` : c.map((l) => a(this, o, $).call(this, l.label, l.value))
  )}
		`;
};
nt = function() {
  const t = a(this, o, ot).call(this);
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
			${a(this, o, at).call(this, i)}
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
      return a(this, o, C).call(this);
    case "doc":
      return !1;
    default:
      return !1;
  }
};
ut = function() {
  switch (this._activeTab) {
    case "source":
      return a(this, o, it).call(this);
    case "content":
      return a(this, o, nt).call(this);
    case "destination":
      return a(this, o, rt).call(this);
  }
};
p.styles = [
  kt,
  _t`
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
  yt("up-doc-modal")
], p);
const Dt = p;
export {
  p as UpDocModalElement,
  Dt as default
};
//# sourceMappingURL=up-doc-modal.element-b2qKo6ua.js.map
