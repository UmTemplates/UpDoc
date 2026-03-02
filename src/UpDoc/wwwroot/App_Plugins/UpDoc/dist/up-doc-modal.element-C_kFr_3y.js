import { a as N } from "./workflow.types-sXs8a86t.js";
import { a as ot, t as D } from "./workflow.service-BQrmRF66.js";
import { r as at, g as nt, a as rt, b as st } from "./destination-utils-DUfOJy5W.js";
import { s as L } from "./transforms-BkZeboOX.js";
import { html as u, css as ct, state as b, customElement as ut, nothing as A } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as lt } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as dt } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
var pt = Object.defineProperty, ht = Object.getOwnPropertyDescriptor, q = (t) => {
  throw TypeError(t);
}, p = (t, i, e, r) => {
  for (var s = r > 1 ? void 0 : r ? ht(i, e) : i, l = t.length - 1, n; l >= 0; l--)
    (n = t[l]) && (s = (r ? n(i, e, s) : n(s)) || s);
  return r && s && pt(i, e, s), s;
}, bt = (t, i, e) => i.has(t) || q("Cannot " + e), ft = (t, i, e) => i.has(t) ? q("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, e), a = (t, i, e) => (bt(t, i, "access private method"), e), o, I, P, z, F, E, M, O, K, W, j, B, R, G, T, k, w, Y, H, X, S, J, Q, V, Z, tt, et;
const mt = {
  pdf: "PDF Document",
  markdown: "Markdown",
  web: "Web Page",
  doc: "Word Document"
};
let d = class extends dt {
  constructor() {
    super(...arguments), ft(this, o), this._activeTab = "source", this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, this._config = null, this._isExtracting = !1, this._extractionError = null, this._contentActiveTab = "", this._availableSourceTypes = [], this._loadingSourceTypes = !0;
  }
  firstUpdated() {
    this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, this._config = null, this._contentActiveTab = "", a(this, o, I).call(this);
  }
  render() {
    const t = a(this, o, tt).call(this);
    return u`
			<umb-body-layout headline="Create from Source">
				${a(this, o, Y).call(this)}

				<div class="tab-content">
					${a(this, o, et).call(this)}
				</div>

				<uui-button
					slot="actions"
					id="close"
					label=${this.localize.term("general_close")}
					@click="${a(this, o, K)}"></uui-button>
				<uui-button
					slot="actions"
					id="save"
					look="primary"
					color="positive"
					label=${this.localize.term("general_create")}
					?disabled=${!t}
					@click="${a(this, o, O)}"></uui-button>
			</umb-body-layout>
		`;
  }
};
o = /* @__PURE__ */ new WeakSet();
I = async function() {
  this._loadingSourceTypes = !0;
  try {
    const t = this.data?.blueprintId;
    if (!t) return;
    const e = await (await this.getContext(U)).getLatestToken(), r = await ot(t, e);
    r && (this._config = r, r.sources && (this._availableSourceTypes = Object.keys(r.sources), this._availableSourceTypes.length === 1 && (this._sourceType = this._availableSourceTypes[0])));
  } catch (t) {
    console.error("Failed to load available source types:", t);
  } finally {
    this._loadingSourceTypes = !1;
  }
};
P = function(t) {
  const e = t.target.value;
  e !== this._sourceType && (this._selectedMediaUnique = null, this._sourceUrl = "", this._sectionLookup = {}, this._extractionError = null, this._contentActiveTab = ""), this._sourceType = e;
};
z = async function(t) {
  const e = t.target.selection;
  this._selectedMediaUnique = e.length > 0 ? e[0] : null, this._selectedMediaUnique ? await a(this, o, F).call(this, this._selectedMediaUnique) : (this._sectionLookup = {}, this._documentName = "", this._extractionError = null);
};
F = async function(t) {
  this._isExtracting = !0, this._extractionError = null;
  try {
    const e = await (await this.getContext(U)).getLatestToken();
    if (!this._config?.folderPath) {
      this._extractionError = "No workflow configured for this blueprint";
      return;
    }
    const r = this._config.folderPath.replace(/\\/g, "/").split("/").pop() ?? "";
    if (!r) {
      this._extractionError = "Could not determine workflow name";
      return;
    }
    const s = await D(r, t, e), l = N(s);
    if (!l.length) {
      this._extractionError = "Failed to extract content from source";
      return;
    }
    const n = {};
    for (const c of l)
      c.included && (c.heading && (n[`${c.id}.heading`] = c.pattern === "role" ? c.content : c.heading, n[`${c.id}.title`] = c.pattern === "role" ? c.content : c.heading), n[`${c.id}.content`] = c.content, c.description && (n[`${c.id}.description`] = c.description), c.summary && (n[`${c.id}.summary`] = c.summary));
    this._sectionLookup = n, !this._documentName && this._config && a(this, o, M).call(this, n);
  } catch (i) {
    this._extractionError = "Failed to connect to extraction service", console.error("Extraction error:", i);
  } finally {
    this._isExtracting = !1;
  }
};
E = async function() {
  if (this._sourceUrl) {
    this._isExtracting = !0, this._extractionError = null;
    try {
      const i = await (await this.getContext(U)).getLatestToken();
      if (!this._config?.folderPath) {
        this._extractionError = "No workflow configured for this blueprint";
        return;
      }
      const e = this._config.folderPath.replace(/\\/g, "/").split("/").pop() ?? "";
      if (!e) {
        this._extractionError = "Could not determine workflow name";
        return;
      }
      const r = await D(e, "", i, this._sourceUrl), s = N(r);
      if (!s.length) {
        this._extractionError = "Failed to extract content from web page";
        return;
      }
      const l = {};
      for (const n of s)
        n.included && (n.heading && (l[`${n.id}.heading`] = n.pattern === "role" ? n.content : n.heading, l[`${n.id}.title`] = n.pattern === "role" ? n.content : n.heading), l[`${n.id}.content`] = n.content, n.description && (l[`${n.id}.description`] = n.description), n.summary && (l[`${n.id}.summary`] = n.summary));
      this._sectionLookup = l, !this._documentName && this._config && a(this, o, M).call(this, l);
    } catch (t) {
      this._extractionError = "Failed to extract from web page", console.error("Web extraction error:", t);
    } finally {
      this._isExtracting = !1;
    }
  }
};
M = function(t) {
  if (this._config?.map?.mappings?.length) {
    let i = null;
    for (const e of this._config.map.mappings) {
      if (e.enabled === !1) continue;
      const r = e.destinations.find((s) => !s.blockKey);
      if (r) {
        i = r.target;
        break;
      }
    }
    if (i) {
      const e = [];
      for (const r of this._config.map.mappings) {
        if (r.enabled === !1) continue;
        r.destinations.some(
          (l) => l.target === i && !l.blockKey
        ) && t[r.source] && e.push(t[r.source]);
      }
      if (e.length > 0) {
        this._documentName = L(e.join(" "));
        return;
      }
    }
  }
  for (const [i, e] of Object.entries(t))
    if (i.endsWith(".heading") && e) {
      this._documentName = L(e);
      return;
    }
};
O = function() {
  this.value = {
    name: this._documentName,
    sourceType: this._sourceType,
    mediaUnique: this._selectedMediaUnique,
    sourceUrl: this._sourceUrl || null,
    sectionLookup: this._sectionLookup,
    config: this._config
  }, this._submitModal();
};
K = function() {
  this._rejectModal();
};
W = function() {
  switch (this._sourceType) {
    case "pdf":
      return a(this, o, j).call(this);
    case "markdown":
      return a(this, o, B).call(this);
    case "web":
      return a(this, o, R).call(this);
    case "doc":
      return a(this, o, G).call(this);
    default:
      return A;
  }
};
j = function() {
  return u`
			<umb-property-layout label="PDF File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${a(this, o, z)}>
					</umb-input-media>
					${a(this, o, w).call(this)}
				</div>
			</umb-property-layout>
		`;
};
B = function() {
  return u`
			<umb-property-layout label="Markdown File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${a(this, o, z)}>
					</umb-input-media>
					${a(this, o, w).call(this)}
				</div>
			</umb-property-layout>
		`;
};
R = function() {
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
    t.key === "Enter" && this._sourceUrl && a(this, o, E).call(this);
  }}>
						</uui-input>
						<uui-button
							look="primary"
							label="Extract"
							?disabled=${!this._sourceUrl || this._isExtracting}
							@click=${() => a(this, o, E).call(this)}>
							Extract
						</uui-button>
					</div>
					${a(this, o, w).call(this)}
				</div>
			</umb-property-layout>
		`;
};
G = function() {
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
k = function(t) {
  t === "content" && !a(this, o, T).call(this) || (this._activeTab = t);
};
w = function() {
  return this._isExtracting ? u`<div class="extraction-status extracting">
				<uui-loader-bar></uui-loader-bar>
				<span>Extracting content from source...</span>
			</div>` : this._extractionError ? u`<div class="extraction-status error">
				<uui-icon name="icon-alert"></uui-icon>
				<span>${this._extractionError}</span>
			</div>` : Object.values(this._sectionLookup).some((i) => i.length > 0) ? u`<div class="extraction-status success">
				<uui-icon name="icon-check"></uui-icon>
				<span>Content extracted successfully</span>
			</div>` : A;
};
Y = function() {
  const t = a(this, o, T).call(this);
  return u`
			<uui-tab-group slot="navigation">
				<uui-tab
					label="Source"
					?active=${this._activeTab === "source"}
					orientation="horizontal"
					@click=${() => a(this, o, k).call(this, "source")}>
					<uui-icon slot="icon" name="icon-page-add"></uui-icon>
					Source
				</uui-tab>
				<uui-tab
					label="Content"
					?active=${this._activeTab === "content"}
					orientation="horizontal"
					?disabled=${!t}
					@click=${() => a(this, o, k).call(this, "content")}>
					<uui-icon slot="icon" name="icon-edit"></uui-icon>
					Content
				</uui-tab>
				<uui-tab
					label="Destination"
					?active=${this._activeTab === "destination"}
					orientation="horizontal"
					@click=${() => a(this, o, k).call(this, "destination")}>
					<uui-icon slot="icon" name="icon-document"></uui-icon>
					Destination
				</uui-tab>
			</uui-tab-group>
		`;
};
H = function() {
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
      name: mt[t] || t,
      value: t,
      selected: this._sourceType === t
    }))
  ]}
										@change=${a(this, o, P)}>
									</uui-select>
								</div>
							</umb-property-layout>

							${a(this, o, W).call(this)}
						`}
			</uui-box>
		`;
};
X = function() {
  if (!this._config?.map?.mappings?.length || !this._config?.destination) return [];
  const t = this._config.destination, i = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map();
  for (const h of this._config.map.mappings) {
    if (h.enabled === !1) continue;
    const _ = this._sectionLookup[h.source];
    if (_)
      for (const f of h.destinations) {
        const m = f.blockKey ? `${f.blockKey}:${f.target}` : f.target, g = i.get(m) ?? [];
        g.push(_), i.set(m, g), e.has(m) || e.set(m, { alias: f.target, blockKey: f.blockKey });
      }
  }
  const r = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const [h, _] of i.entries()) {
    const f = e.get(h), m = f?.alias ?? h, g = f?.blockKey, $ = at(
      { target: m, blockKey: g },
      t
    ) ?? "other";
    r.has($) || r.set($, []);
    let C = m;
    if (g)
      for (const y of nt(t)) {
        const x = y.blocks.find((v) => v.key === g);
        if (x) {
          const v = x.properties?.find((it) => it.alias === m);
          v && (C = v.label || v.alias);
          break;
        }
      }
    else {
      const y = t.fields.find((x) => x.alias === m);
      y && (C = y.label);
    }
    r.get($).push({
      label: C,
      value: _.join(" "),
      blockLabel: g ? rt(g, t) ?? void 0 : void 0
    });
  }
  const l = st(t), n = [];
  for (const h of l) {
    const _ = r.get(h.id);
    _?.length && (s.set(h.id, h.label), n.push({ tabId: h.id, tabLabel: h.label, items: _ }));
  }
  const c = r.get("other");
  return c?.length && n.push({ tabId: "other", tabLabel: "Other", items: c }), n;
};
S = function(t, i) {
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
							@click=${() => a(this, o, Z).call(this, t, i)}>
							<uui-icon name="icon-documents"></uui-icon>
						</uui-button>
					</uui-action-bar>
					<div class="section-card-content">${i}</div>
				</div>
			</div>
		`;
};
J = function(t) {
  if (t.tabId === "page-content") {
    const i = /* @__PURE__ */ new Map();
    for (const e of t.items) {
      const r = e.blockLabel ?? "Other", s = i.get(r) ?? [];
      s.push(e), i.set(r, s);
    }
    return u`
				${Array.from(i.entries()).map(([e, r]) => u`
					<div class="block-group-header">
						<umb-icon name="icon-box"></umb-icon>
						<span>${e}</span>
					</div>
					${r.map((s) => a(this, o, S).call(this, s.label, s.value))}
				`)}
			`;
  }
  return u`
			${t.items.map((i) => a(this, o, S).call(this, i.label, i.value))}
		`;
};
Q = function() {
  const t = a(this, o, X).call(this);
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
			${a(this, o, J).call(this, i)}
		`;
};
V = function() {
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
Z = async function(t, i) {
  try {
    await navigator.clipboard.writeText(i), console.log("Copied to clipboard:", t);
  } catch (e) {
    console.error("Failed to copy:", e);
  }
};
tt = function() {
  if (!this._documentName || this._isExtracting) return !1;
  switch (this._sourceType) {
    case "pdf":
    case "markdown":
      return !!this._selectedMediaUnique;
    case "web":
      return a(this, o, T).call(this);
    case "doc":
      return !1;
    default:
      return !1;
  }
};
et = function() {
  switch (this._activeTab) {
    case "source":
      return a(this, o, H).call(this);
    case "content":
      return a(this, o, Q).call(this);
    case "destination":
      return a(this, o, V).call(this);
  }
};
d.styles = [
  lt,
  ct`
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
p([
  b()
], d.prototype, "_activeTab", 2);
p([
  b()
], d.prototype, "_documentName", 2);
p([
  b()
], d.prototype, "_sourceType", 2);
p([
  b()
], d.prototype, "_sourceUrl", 2);
p([
  b()
], d.prototype, "_selectedMediaUnique", 2);
p([
  b()
], d.prototype, "_sectionLookup", 2);
p([
  b()
], d.prototype, "_config", 2);
p([
  b()
], d.prototype, "_isExtracting", 2);
p([
  b()
], d.prototype, "_extractionError", 2);
p([
  b()
], d.prototype, "_contentActiveTab", 2);
p([
  b()
], d.prototype, "_availableSourceTypes", 2);
p([
  b()
], d.prototype, "_loadingSourceTypes", 2);
d = p([
  ut("up-doc-modal")
], d);
const $t = d;
export {
  d as UpDocModalElement,
  $t as default
};
//# sourceMappingURL=up-doc-modal.element-C_kFr_3y.js.map
