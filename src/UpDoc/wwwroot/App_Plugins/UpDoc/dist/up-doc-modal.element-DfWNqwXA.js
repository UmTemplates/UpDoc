import { a as P } from "./workflow.types-CVkhzFGj.js";
import { a as dt, b as W, t as F } from "./workflow.service-DRM8gMCY.js";
import { r as pt, g as ht, a as ft, b as bt } from "./destination-utils-DUfOJy5W.js";
import { s as I } from "./transforms-BkZeboOX.js";
import { html as u, css as mt, state as b, customElement as gt, nothing as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as _t } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as vt } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as M } from "@umbraco-cms/backoffice/auth";
var yt = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, B = (t) => {
  throw TypeError(t);
}, f = (t, i, e, a) => {
  for (var r = a > 1 ? void 0 : a ? kt(i, e) : i, p = t.length - 1, l; p >= 0; p--)
    (l = t[p]) && (r = (a ? l(i, e, r) : l(r)) || r);
  return a && r && yt(i, e, r), r;
}, A = (t, i, e) => i.has(t) || B("Cannot " + e), U = (t, i, e) => (A(t, i, "read from private field"), e ? e.call(t) : i.get(t)), q = (t, i, e) => i.has(t) ? B("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, e), j = (t, i, e, a) => (A(t, i, "write to private field"), i.set(t, e), e), n = (t, i, e) => (A(t, i, "access private method"), e), y, o, G, R, D, N, Y, z, K, H, X, J, Q, V, Z, tt, $, T, C, et, it, ot, L, at, nt, st, rt, ct, ut;
const xt = {
  pdf: "PDF Document",
  markdown: "Markdown",
  web: "Web Page",
  doc: "Word Document"
};
let d = class extends vt {
  constructor() {
    super(...arguments), q(this, o), this._activeTab = "source", this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, q(this, y, {}), this._config = null, this._workflowConfig = null, this._isExtracting = !1, this._extractionError = null, this._contentActiveTab = "", this._availableSourceTypes = [], this._loadingSourceTypes = !0;
  }
  firstUpdated() {
    this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, this._config = null, this._workflowConfig = null, this._contentActiveTab = "", n(this, o, G).call(this);
  }
  render() {
    const t = n(this, o, ct).call(this);
    return u`
			<umb-body-layout headline="Create from Source">
				${n(this, o, et).call(this)}

				<div class="tab-content">
					${n(this, o, ut).call(this)}
				</div>

				<uui-button
					slot="actions"
					id="close"
					label=${this.localize.term("general_close")}
					@click="${n(this, o, X)}"></uui-button>
				<uui-button
					slot="actions"
					id="save"
					look="primary"
					color="positive"
					label=${this.localize.term("general_create")}
					?disabled=${!t}
					@click="${n(this, o, H)}"></uui-button>
			</umb-body-layout>
		`;
  }
};
y = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
G = async function() {
  this._loadingSourceTypes = !0;
  try {
    const t = this.data?.blueprintId;
    if (!t) return;
    const e = await (await this.getContext(M)).getLatestToken(), a = await dt(t, e);
    a && (this._config = a, a.sources && (this._availableSourceTypes = Object.keys(a.sources), this._availableSourceTypes.length === 1 && (this._sourceType = this._availableSourceTypes[0])));
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
  this._selectedMediaUnique = e.length > 0 ? e[0] : null, this._selectedMediaUnique ? await n(this, o, Y).call(this, this._selectedMediaUnique) : (this._sectionLookup = {}, this._documentName = "", this._extractionError = null);
};
N = function() {
  return this._config ? this._sourceType && this._config.sources?.[this._sourceType]?.workflowAlias ? this._config.sources[this._sourceType].workflowAlias : this._config.folderPath ? this._config.folderPath.replace(/\\/g, "/").split("/").pop() ?? null : null : null;
};
Y = async function(t) {
  this._isExtracting = !0, this._extractionError = null;
  try {
    const e = await (await this.getContext(M)).getLatestToken(), a = n(this, o, N).call(this);
    if (!a) {
      this._extractionError = "No workflow configured for this blueprint";
      return;
    }
    const r = await W(a, e);
    r && (this._workflowConfig = r);
    const p = await F(a, t, e), l = P(p);
    if (!l.length) {
      this._extractionError = "Failed to extract content from source";
      return;
    }
    const h = {}, c = {};
    for (const s of l)
      s.included && (s.heading && (h[`${s.id}.heading`] = s.pattern === "role" ? s.content : s.heading, h[`${s.id}.title`] = s.pattern === "role" ? s.content : s.heading), h[`${s.id}.content`] = s.content, s.description && (h[`${s.id}.description`] = s.description), s.summary && (h[`${s.id}.summary`] = s.summary), s.stableKey && (c[s.stableKey] = s.id));
    this._sectionLookup = h, j(this, y, c), !this._documentName && (this._workflowConfig || this._config) && n(this, o, K).call(this, h);
  } catch (i) {
    this._extractionError = "Failed to connect to extraction service", console.error("Extraction error:", i);
  } finally {
    this._isExtracting = !1;
  }
};
z = async function() {
  if (this._sourceUrl) {
    this._isExtracting = !0, this._extractionError = null;
    try {
      const i = await (await this.getContext(M)).getLatestToken(), e = n(this, o, N).call(this);
      if (!e) {
        this._extractionError = "No workflow configured for this blueprint";
        return;
      }
      const a = await W(e, i);
      a && (this._workflowConfig = a);
      const r = await F(e, "", i, this._sourceUrl), p = P(r);
      if (!p.length) {
        this._extractionError = "Failed to extract content from web page";
        return;
      }
      const l = {}, h = {};
      for (const c of p)
        c.included && (c.heading && (l[`${c.id}.heading`] = c.pattern === "role" ? c.content : c.heading, l[`${c.id}.title`] = c.pattern === "role" ? c.content : c.heading), l[`${c.id}.content`] = c.content, c.description && (l[`${c.id}.description`] = c.description), c.summary && (l[`${c.id}.summary`] = c.summary), c.stableKey && (h[c.stableKey] = c.id));
      this._sectionLookup = l, j(this, y, h), !this._documentName && (this._workflowConfig || this._config) && n(this, o, K).call(this, l);
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
        this._documentName = I(a.join(" "));
        return;
      }
    }
  }
  for (const [e, a] of Object.entries(t))
    if (e.endsWith(".heading") && a) {
      this._documentName = I(a);
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
      return n(this, o, Q).call(this);
    case "markdown":
      return n(this, o, V).call(this);
    case "web":
      return n(this, o, Z).call(this);
    case "doc":
      return n(this, o, tt).call(this);
    default:
      return O;
  }
};
Q = function() {
  return u`
			<umb-property-layout label="PDF File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${n(this, o, D)}>
					</umb-input-media>
					${n(this, o, C).call(this)}
				</div>
			</umb-property-layout>
		`;
};
V = function() {
  return u`
			<umb-property-layout label="Markdown File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${n(this, o, D)}>
					</umb-input-media>
					${n(this, o, C).call(this)}
				</div>
			</umb-property-layout>
		`;
};
Z = function() {
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
    t.key === "Enter" && this._sourceUrl && n(this, o, z).call(this);
  }}>
						</uui-input>
						<uui-button
							look="primary"
							label="Extract"
							?disabled=${!this._sourceUrl || this._isExtracting}
							@click=${() => n(this, o, z).call(this)}>
							Extract
						</uui-button>
					</div>
					${n(this, o, C).call(this)}
				</div>
			</umb-property-layout>
		`;
};
tt = function() {
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
$ = function() {
  return Object.keys(this._sectionLookup).length > 0;
};
T = function(t) {
  t === "content" && !n(this, o, $).call(this) || (this._activeTab = t);
};
C = function() {
  return this._isExtracting ? u`<div class="extraction-status extracting">
				<uui-loader-bar></uui-loader-bar>
				<span>Extracting content from source...</span>
			</div>` : this._extractionError ? u`<div class="extraction-status error">
				<uui-icon name="icon-alert"></uui-icon>
				<span>${this._extractionError}</span>
			</div>` : Object.values(this._sectionLookup).some((i) => i.length > 0) ? u`<div class="extraction-status success">
				<uui-icon name="icon-check"></uui-icon>
				<span>Content extracted successfully</span>
			</div>` : O;
};
et = function() {
  const t = n(this, o, $).call(this);
  return u`
			<uui-tab-group slot="navigation">
				<uui-tab
					label="Source"
					?active=${this._activeTab === "source"}
					orientation="horizontal"
					@click=${() => n(this, o, T).call(this, "source")}>
					<uui-icon slot="icon" name="icon-page-add"></uui-icon>
					Source
				</uui-tab>
				<uui-tab
					label="Content"
					?active=${this._activeTab === "content"}
					orientation="horizontal"
					?disabled=${!t}
					@click=${() => n(this, o, T).call(this, "content")}>
					<uui-icon slot="icon" name="icon-edit"></uui-icon>
					Content
				</uui-tab>
				<uui-tab
					label="Destination"
					?active=${this._activeTab === "destination"}
					orientation="horizontal"
					@click=${() => n(this, o, T).call(this, "destination")}>
					<uui-icon slot="icon" name="icon-document"></uui-icon>
					Destination
				</uui-tab>
			</uui-tab-group>
		`;
};
it = function() {
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
      name: xt[t] || t,
      value: t,
      selected: this._sourceType === t
    }))
  ]}
										@change=${n(this, o, R)}>
									</uui-select>
								</div>
							</umb-property-layout>

							${n(this, o, J).call(this)}
						`}
			</uui-box>
		`;
};
ot = function() {
  const t = this._workflowConfig ?? this._config;
  if (!t?.map?.mappings?.length || !t?.destination) return [];
  const i = t.destination, e = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  for (const s of t.map.mappings) {
    if (s.enabled === !1) continue;
    let _ = this._sectionLookup[s.source];
    if (!_ && s.sourceKey && U(this, y)) {
      const m = U(this, y)[s.sourceKey];
      if (m) {
        const g = s.source.split(".").pop();
        g && (_ = this._sectionLookup[`${m}.${g}`]);
      }
    }
    if (_)
      for (const m of s.destinations) {
        const g = m.blockKey ? `${m.blockKey}:${m.target}` : m.target, v = e.get(g) ?? [];
        v.push(_), e.set(g, v), a.has(g) || a.set(g, { alias: m.target, blockKey: m.blockKey });
      }
  }
  const r = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map();
  for (const [s, _] of e.entries()) {
    const m = a.get(s), g = m?.alias ?? s, v = m?.blockKey, S = pt(
      { target: g, blockKey: v },
      i
    ) ?? "other";
    r.has(S) || r.set(S, []);
    let E = g;
    if (v)
      for (const x of ht(i)) {
        const w = x.blocks.find((k) => k.key === v);
        if (w) {
          const k = w.properties?.find((lt) => lt.alias === g);
          k && (E = k.label || k.alias);
          break;
        }
      }
    else {
      const x = i.fields.find((w) => w.alias === g);
      x && (E = x.label);
    }
    r.get(S).push({
      label: E,
      value: _.join(" "),
      blockLabel: v ? ft(v, i) ?? void 0 : void 0
    });
  }
  const l = bt(i), h = [];
  for (const s of l) {
    const _ = r.get(s.id);
    _?.length && (p.set(s.id, s.label), h.push({ tabId: s.id, tabLabel: s.label, items: _ }));
  }
  const c = r.get("other");
  return c?.length && h.push({ tabId: "other", tabLabel: "Other", items: c }), h;
};
L = function(t, i) {
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
							@click=${() => n(this, o, rt).call(this, t, i)}>
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
					${a.map((r) => n(this, o, L).call(this, r.label, r.value))}
				`)}
			`;
  }
  return u`
			${t.items.map((i) => n(this, o, L).call(this, i.label, i.value))}
		`;
};
nt = function() {
  const t = n(this, o, ot).call(this);
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
			${n(this, o, at).call(this, i)}
		`;
};
st = function() {
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
rt = async function(t, i) {
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
      return n(this, o, $).call(this);
    case "doc":
      return !1;
    default:
      return !1;
  }
};
ut = function() {
  switch (this._activeTab) {
    case "source":
      return n(this, o, it).call(this);
    case "content":
      return n(this, o, nt).call(this);
    case "destination":
      return n(this, o, st).call(this);
  }
};
d.styles = [
  _t,
  mt`
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
f([
  b()
], d.prototype, "_activeTab", 2);
f([
  b()
], d.prototype, "_documentName", 2);
f([
  b()
], d.prototype, "_sourceType", 2);
f([
  b()
], d.prototype, "_sourceUrl", 2);
f([
  b()
], d.prototype, "_selectedMediaUnique", 2);
f([
  b()
], d.prototype, "_sectionLookup", 2);
f([
  b()
], d.prototype, "_config", 2);
f([
  b()
], d.prototype, "_workflowConfig", 2);
f([
  b()
], d.prototype, "_isExtracting", 2);
f([
  b()
], d.prototype, "_extractionError", 2);
f([
  b()
], d.prototype, "_contentActiveTab", 2);
f([
  b()
], d.prototype, "_availableSourceTypes", 2);
f([
  b()
], d.prototype, "_loadingSourceTypes", 2);
d = f([
  gt("up-doc-modal")
], d);
const Lt = d;
export {
  d as UpDocModalElement,
  Lt as default
};
//# sourceMappingURL=up-doc-modal.element-DfWNqwXA.js.map
