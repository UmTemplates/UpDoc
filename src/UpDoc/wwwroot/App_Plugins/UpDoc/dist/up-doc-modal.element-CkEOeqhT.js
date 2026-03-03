import { a as N } from "./workflow.types-CVkhzFGj.js";
import { a as rt, b as q, t as I } from "./workflow.service-DcrxYgqr.js";
import { r as st, g as ct, a as ut, b as lt } from "./destination-utils-DUfOJy5W.js";
import { s as D } from "./transforms-BkZeboOX.js";
import { html as u, css as dt, state as f, customElement as pt, nothing as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as ht } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as ft } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as z } from "@umbraco-cms/backoffice/auth";
var bt = Object.defineProperty, mt = Object.getOwnPropertyDescriptor, F = (t) => {
  throw TypeError(t);
}, h = (t, i, e, a) => {
  for (var r = a > 1 ? void 0 : a ? mt(i, e) : i, p = t.length - 1, l; p >= 0; p--)
    (l = t[p]) && (r = (a ? l(i, e, r) : l(r)) || r);
  return a && r && bt(i, e, r), r;
}, gt = (t, i, e) => i.has(t) || F("Cannot " + e), _t = (t, i, e) => i.has(t) ? F("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, e), n = (t, i, e) => (gt(t, i, "access private method"), e), o, O, W, M, L, K, S, A, j, B, R, G, Y, H, X, T, w, $, J, Q, V, U, Z, tt, et, it, ot, at;
const vt = {
  pdf: "PDF Document",
  markdown: "Markdown",
  web: "Web Page",
  doc: "Word Document"
};
let d = class extends ft {
  constructor() {
    super(...arguments), _t(this, o), this._activeTab = "source", this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, this._config = null, this._workflowConfig = null, this._isExtracting = !1, this._extractionError = null, this._contentActiveTab = "", this._availableSourceTypes = [], this._loadingSourceTypes = !0;
  }
  firstUpdated() {
    this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, this._config = null, this._workflowConfig = null, this._contentActiveTab = "", n(this, o, O).call(this);
  }
  render() {
    const t = n(this, o, ot).call(this);
    return u`
			<umb-body-layout headline="Create from Source">
				${n(this, o, J).call(this)}

				<div class="tab-content">
					${n(this, o, at).call(this)}
				</div>

				<uui-button
					slot="actions"
					id="close"
					label=${this.localize.term("general_close")}
					@click="${n(this, o, B)}"></uui-button>
				<uui-button
					slot="actions"
					id="save"
					look="primary"
					color="positive"
					label=${this.localize.term("general_create")}
					?disabled=${!t}
					@click="${n(this, o, j)}"></uui-button>
			</umb-body-layout>
		`;
  }
};
o = /* @__PURE__ */ new WeakSet();
O = async function() {
  this._loadingSourceTypes = !0;
  try {
    const t = this.data?.blueprintId;
    if (!t) return;
    const e = await (await this.getContext(z)).getLatestToken(), a = await rt(t, e);
    a && (this._config = a, a.sources && (this._availableSourceTypes = Object.keys(a.sources), this._availableSourceTypes.length === 1 && (this._sourceType = this._availableSourceTypes[0])));
  } catch (t) {
    console.error("Failed to load available source types:", t);
  } finally {
    this._loadingSourceTypes = !1;
  }
};
W = function(t) {
  const e = t.target.value;
  e !== this._sourceType && (this._selectedMediaUnique = null, this._sourceUrl = "", this._sectionLookup = {}, this._extractionError = null, this._contentActiveTab = ""), this._sourceType = e;
};
M = async function(t) {
  const e = t.target.selection;
  this._selectedMediaUnique = e.length > 0 ? e[0] : null, this._selectedMediaUnique ? await n(this, o, K).call(this, this._selectedMediaUnique) : (this._sectionLookup = {}, this._documentName = "", this._extractionError = null);
};
L = function() {
  return this._config ? this._sourceType && this._config.sources?.[this._sourceType]?.workflowAlias ? this._config.sources[this._sourceType].workflowAlias : this._config.folderPath ? this._config.folderPath.replace(/\\/g, "/").split("/").pop() ?? null : null : null;
};
K = async function(t) {
  this._isExtracting = !0, this._extractionError = null;
  try {
    const e = await (await this.getContext(z)).getLatestToken(), a = n(this, o, L).call(this);
    if (!a) {
      this._extractionError = "No workflow configured for this blueprint";
      return;
    }
    const r = await q(a, e);
    r && (this._workflowConfig = r);
    const p = await I(a, t, e), l = N(p);
    if (!l.length) {
      this._extractionError = "Failed to extract content from source";
      return;
    }
    const s = {};
    for (const c of l)
      c.included && (c.heading && (s[`${c.id}.heading`] = c.pattern === "role" ? c.content : c.heading, s[`${c.id}.title`] = c.pattern === "role" ? c.content : c.heading), s[`${c.id}.content`] = c.content, c.description && (s[`${c.id}.description`] = c.description), c.summary && (s[`${c.id}.summary`] = c.summary));
    this._sectionLookup = s, !this._documentName && (this._workflowConfig || this._config) && n(this, o, A).call(this, s);
  } catch (i) {
    this._extractionError = "Failed to connect to extraction service", console.error("Extraction error:", i);
  } finally {
    this._isExtracting = !1;
  }
};
S = async function() {
  if (this._sourceUrl) {
    this._isExtracting = !0, this._extractionError = null;
    try {
      const i = await (await this.getContext(z)).getLatestToken(), e = n(this, o, L).call(this);
      if (!e) {
        this._extractionError = "No workflow configured for this blueprint";
        return;
      }
      const a = await q(e, i);
      a && (this._workflowConfig = a);
      const r = await I(e, "", i, this._sourceUrl), p = N(r);
      if (!p.length) {
        this._extractionError = "Failed to extract content from web page";
        return;
      }
      const l = {};
      for (const s of p)
        s.included && (s.heading && (l[`${s.id}.heading`] = s.pattern === "role" ? s.content : s.heading, l[`${s.id}.title`] = s.pattern === "role" ? s.content : s.heading), l[`${s.id}.content`] = s.content, s.description && (l[`${s.id}.description`] = s.description), s.summary && (l[`${s.id}.summary`] = s.summary));
      this._sectionLookup = l, !this._documentName && (this._workflowConfig || this._config) && n(this, o, A).call(this, l);
    } catch (t) {
      this._extractionError = "Failed to extract from web page", console.error("Web extraction error:", t);
    } finally {
      this._isExtracting = !1;
    }
  }
};
A = function(t) {
  const i = this._workflowConfig ?? this._config;
  if (i?.map?.mappings?.length) {
    let e = null;
    for (const a of i.map.mappings) {
      if (a.enabled === !1) continue;
      const r = a.destinations.find(
        (p) => !p.blockKey && p.target === "pageTitle"
      );
      if (r) {
        e = r.target;
        break;
      }
    }
    if (!e)
      for (const a of i.map.mappings) {
        if (a.enabled === !1) continue;
        const r = a.destinations.find((p) => !p.blockKey);
        if (r) {
          e = r.target;
          break;
        }
      }
    if (e) {
      const a = [];
      for (const r of i.map.mappings) {
        if (r.enabled === !1) continue;
        r.destinations.some(
          (l) => l.target === e && !l.blockKey
        ) && t[r.source] && a.push(t[r.source]);
      }
      if (a.length > 0) {
        this._documentName = D(a.join(" "));
        return;
      }
    }
  }
  for (const [e, a] of Object.entries(t))
    if (e.endsWith(".heading") && a) {
      this._documentName = D(a);
      return;
    }
};
j = function() {
  const t = this._workflowConfig ?? this._config;
  this.value = {
    name: this._documentName,
    sourceType: this._sourceType,
    mediaUnique: this._selectedMediaUnique,
    sourceUrl: this._sourceUrl || null,
    sectionLookup: this._sectionLookup,
    config: t
  }, this._submitModal();
};
B = function() {
  this._rejectModal();
};
R = function() {
  switch (this._sourceType) {
    case "pdf":
      return n(this, o, G).call(this);
    case "markdown":
      return n(this, o, Y).call(this);
    case "web":
      return n(this, o, H).call(this);
    case "doc":
      return n(this, o, X).call(this);
    default:
      return P;
  }
};
G = function() {
  return u`
			<umb-property-layout label="PDF File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${n(this, o, M)}>
					</umb-input-media>
					${n(this, o, $).call(this)}
				</div>
			</umb-property-layout>
		`;
};
Y = function() {
  return u`
			<umb-property-layout label="Markdown File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${n(this, o, M)}>
					</umb-input-media>
					${n(this, o, $).call(this)}
				</div>
			</umb-property-layout>
		`;
};
H = function() {
  return u`
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
    t.key === "Enter" && this._sourceUrl && n(this, o, S).call(this);
  }}>
						</uui-input>
						<uui-button
							look="primary"
							label="Extract"
							?disabled=${!this._sourceUrl || this._isExtracting}
							@click=${() => n(this, o, S).call(this)}>
							Extract
						</uui-button>
					</div>
					${n(this, o, $).call(this)}
				</div>
			</umb-property-layout>
		`;
};
X = function() {
  return u`
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
T = function() {
  return Object.keys(this._sectionLookup).length > 0;
};
w = function(t) {
  t === "content" && !n(this, o, T).call(this) || (this._activeTab = t);
};
$ = function() {
  return this._isExtracting ? u`<div class="extraction-status extracting">
				<uui-loader-bar></uui-loader-bar>
				<span>Extracting content from source...</span>
			</div>` : this._extractionError ? u`<div class="extraction-status error">
				<uui-icon name="icon-alert"></uui-icon>
				<span>${this._extractionError}</span>
			</div>` : Object.values(this._sectionLookup).some((i) => i.length > 0) ? u`<div class="extraction-status success">
				<uui-icon name="icon-check"></uui-icon>
				<span>Content extracted successfully</span>
			</div>` : P;
};
J = function() {
  const t = n(this, o, T).call(this);
  return u`
			<uui-tab-group slot="navigation">
				<uui-tab
					label="Source"
					?active=${this._activeTab === "source"}
					orientation="horizontal"
					@click=${() => n(this, o, w).call(this, "source")}>
					<uui-icon slot="icon" name="icon-page-add"></uui-icon>
					Source
				</uui-tab>
				<uui-tab
					label="Content"
					?active=${this._activeTab === "content"}
					orientation="horizontal"
					?disabled=${!t}
					@click=${() => n(this, o, w).call(this, "content")}>
					<uui-icon slot="icon" name="icon-edit"></uui-icon>
					Content
				</uui-tab>
				<uui-tab
					label="Destination"
					?active=${this._activeTab === "destination"}
					orientation="horizontal"
					@click=${() => n(this, o, w).call(this, "destination")}>
					<uui-icon slot="icon" name="icon-document"></uui-icon>
					Destination
				</uui-tab>
			</uui-tab-group>
		`;
};
Q = function() {
  return u`
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
				${this._loadingSourceTypes ? u`<uui-loader-bar></uui-loader-bar>` : this._availableSourceTypes.length === 0 ? u`<p style="color: var(--uui-color-danger);">No source types configured for this workflow.</p>` : u`
							<umb-property-layout label="Source Type" orientation="vertical">
								<div slot="editor">
									<uui-select
										label="Select source type"
										.options=${[
    ...this._availableSourceTypes.length > 1 ? [{ name: "Choose a source...", value: "", selected: this._sourceType === "" }] : [],
    ...this._availableSourceTypes.map((t) => ({
      name: vt[t] || t,
      value: t,
      selected: this._sourceType === t
    }))
  ]}
										@change=${n(this, o, W)}>
									</uui-select>
								</div>
							</umb-property-layout>

							${n(this, o, R).call(this)}
						`}
			</uui-box>
		`;
};
V = function() {
  const t = this._workflowConfig ?? this._config;
  if (!t?.map?.mappings?.length || !t?.destination) return [];
  const i = t.destination, e = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  for (const b of t.map.mappings) {
    if (b.enabled === !1) continue;
    const v = this._sectionLookup[b.source];
    if (v)
      for (const m of b.destinations) {
        const g = m.blockKey ? `${m.blockKey}:${m.target}` : m.target, _ = e.get(g) ?? [];
        _.push(v), e.set(g, _), a.has(g) || a.set(g, { alias: m.target, blockKey: m.blockKey });
      }
  }
  const r = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map();
  for (const [b, v] of e.entries()) {
    const m = a.get(b), g = m?.alias ?? b, _ = m?.blockKey, C = st(
      { target: g, blockKey: _ },
      i
    ) ?? "other";
    r.has(C) || r.set(C, []);
    let E = g;
    if (_)
      for (const x of ct(i)) {
        const k = x.blocks.find((y) => y.key === _);
        if (k) {
          const y = k.properties?.find((nt) => nt.alias === g);
          y && (E = y.label || y.alias);
          break;
        }
      }
    else {
      const x = i.fields.find((k) => k.alias === g);
      x && (E = x.label);
    }
    r.get(C).push({
      label: E,
      value: v.join(" "),
      blockLabel: _ ? ut(_, i) ?? void 0 : void 0
    });
  }
  const l = lt(i), s = [];
  for (const b of l) {
    const v = r.get(b.id);
    v?.length && (p.set(b.id, b.label), s.push({ tabId: b.id, tabLabel: b.label, items: v }));
  }
  const c = r.get("other");
  return c?.length && s.push({ tabId: "other", tabLabel: "Other", items: c }), s;
};
U = function(t, i) {
  return u`
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
							@click=${() => n(this, o, it).call(this, t, i)}>
							<uui-icon name="icon-documents"></uui-icon>
						</uui-button>
					</uui-action-bar>
					<div class="section-card-content">${i}</div>
				</div>
			</div>
		`;
};
Z = function(t) {
  if (t.tabId === "page-content") {
    const i = /* @__PURE__ */ new Map();
    for (const e of t.items) {
      const a = e.blockLabel ?? "Other", r = i.get(a) ?? [];
      r.push(e), i.set(a, r);
    }
    return u`
				${Array.from(i.entries()).map(([e, a]) => u`
					<div class="block-group-header">
						<umb-icon name="icon-box"></umb-icon>
						<span>${e}</span>
					</div>
					${a.map((r) => n(this, o, U).call(this, r.label, r.value))}
				`)}
			`;
  }
  return u`
			${t.items.map((i) => n(this, o, U).call(this, i.label, i.value))}
		`;
};
tt = function() {
  const t = n(this, o, V).call(this);
  if (t.length === 0)
    return u`
				<div class="content-editor">
					<p class="content-editor-intro">No mapped content to preview. Create mappings in the workflow editor first.</p>
				</div>
			`;
  (!this._contentActiveTab || !t.find((e) => e.tabId === this._contentActiveTab)) && (this._contentActiveTab = t[0].tabId);
  const i = t.find((e) => e.tabId === this._contentActiveTab) ?? t[0];
  return u`
			<uui-tab-group class="content-inner-tabs">
				${t.map((e) => u`
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
			${n(this, o, Z).call(this, i)}
		`;
};
et = function() {
  return u`
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
it = async function(t, i) {
  try {
    await navigator.clipboard.writeText(i), console.log("Copied to clipboard:", t);
  } catch (e) {
    console.error("Failed to copy:", e);
  }
};
ot = function() {
  if (!this._documentName || this._isExtracting) return !1;
  switch (this._sourceType) {
    case "pdf":
    case "markdown":
      return !!this._selectedMediaUnique;
    case "web":
      return n(this, o, T).call(this);
    case "doc":
      return !1;
    default:
      return !1;
  }
};
at = function() {
  switch (this._activeTab) {
    case "source":
      return n(this, o, Q).call(this);
    case "content":
      return n(this, o, tt).call(this);
    case "destination":
      return n(this, o, et).call(this);
  }
};
d.styles = [
  ht,
  dt`
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
h([
  f()
], d.prototype, "_activeTab", 2);
h([
  f()
], d.prototype, "_documentName", 2);
h([
  f()
], d.prototype, "_sourceType", 2);
h([
  f()
], d.prototype, "_sourceUrl", 2);
h([
  f()
], d.prototype, "_selectedMediaUnique", 2);
h([
  f()
], d.prototype, "_sectionLookup", 2);
h([
  f()
], d.prototype, "_config", 2);
h([
  f()
], d.prototype, "_workflowConfig", 2);
h([
  f()
], d.prototype, "_isExtracting", 2);
h([
  f()
], d.prototype, "_extractionError", 2);
h([
  f()
], d.prototype, "_contentActiveTab", 2);
h([
  f()
], d.prototype, "_availableSourceTypes", 2);
h([
  f()
], d.prototype, "_loadingSourceTypes", 2);
d = h([
  pt("up-doc-modal")
], d);
const St = d;
export {
  d as UpDocModalElement,
  St as default
};
//# sourceMappingURL=up-doc-modal.element-CkEOeqhT.js.map
