import { a as P } from "./workflow.types-QrurYwv2.js";
import { a as dt, b as W, t as F } from "./workflow.service-rwnAqyw6.js";
import { r as pt, g as ht, a as ft, b as bt, c as mt, s as gt } from "./destination-utils-BFSWOBvb.js";
import { s as I } from "./transforms-qqnY8EQ-.js";
import { html as p, css as vt, state as m, customElement as _t, nothing as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as yt } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as kt } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as L } from "@umbraco-cms/backoffice/auth";
var wt = Object.defineProperty, xt = Object.getOwnPropertyDescriptor, G = (t) => {
  throw TypeError(t);
}, f = (t, i, e, r) => {
  for (var c = r > 1 ? void 0 : r ? xt(i, e) : i, l = t.length - 1, u; l >= 0; l--)
    (u = t[l]) && (c = (r ? u(i, e, c) : u(c)) || c);
  return r && c && wt(i, e, c), c;
}, A = (t, i, e) => i.has(t) || G("Cannot " + e), U = (t, i, e) => (A(t, i, "read from private field"), e ? e.call(t) : i.get(t)), q = (t, i, e) => i.has(t) ? G("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(t) : i.set(t, e), B = (t, i, e, r) => (A(t, i, "write to private field"), i.set(t, e), e), a = (t, i, e) => (A(t, i, "access private method"), e), y, o, j, R, N, D, Y, M, K, H, X, J, Q, V, Z, tt, C, T, z, et, it, ot, $, at, nt, rt, st, ct, ut;
const Tt = {
  pdf: "PDF Document",
  markdown: "Markdown",
  web: "Web Page",
  doc: "Word Document"
};
let h = class extends kt {
  constructor() {
    super(...arguments), q(this, o), this._activeTab = "source", this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, q(this, y, {}), this._config = null, this._workflowConfig = null, this._isExtracting = !1, this._extractionError = null, this._contentActiveTab = "", this._availableSourceTypes = [], this._loadingSourceTypes = !0;
  }
  firstUpdated() {
    this._documentName = "", this._sourceType = "", this._sourceUrl = "", this._selectedMediaUnique = null, this._sectionLookup = {}, this._config = null, this._workflowConfig = null, this._contentActiveTab = "", a(this, o, j).call(this);
  }
  render() {
    const t = a(this, o, ct).call(this);
    return p`
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
    const e = await (await this.getContext(L)).getLatestToken(), r = await dt(t, e);
    r && (this._config = r, r.sources && (this._availableSourceTypes = Object.keys(r.sources), this._availableSourceTypes.length === 1 && (this._sourceType = this._availableSourceTypes[0])));
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
    const e = await (await this.getContext(L)).getLatestToken(), r = a(this, o, D).call(this);
    if (!r) {
      this._extractionError = "No workflow configured for this blueprint";
      return;
    }
    const c = await W(r, e);
    c && (this._workflowConfig = c);
    const l = await F(r, t, e), u = P(l);
    if (!u.length) {
      this._extractionError = "Failed to extract content from source";
      return;
    }
    const d = {}, s = {};
    for (const n of u)
      n.included && (n.heading && (d[`${n.id}.heading`] = n.pattern === "role" ? n.content : n.heading, d[`${n.id}.title`] = n.pattern === "role" ? n.content : n.heading), d[`${n.id}.content`] = n.content, n.description && (d[`${n.id}.description`] = n.description), n.summary && (d[`${n.id}.summary`] = n.summary), n.stableKey && (s[n.stableKey] = n.id));
    this._sectionLookup = d, B(this, y, s), !this._documentName && (this._workflowConfig || this._config) && a(this, o, K).call(this, d);
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
      const i = await (await this.getContext(L)).getLatestToken(), e = a(this, o, D).call(this);
      if (!e) {
        this._extractionError = "No workflow configured for this blueprint";
        return;
      }
      const r = await W(e, i);
      r && (this._workflowConfig = r);
      const c = await F(e, "", i, this._sourceUrl), l = P(c);
      if (!l.length) {
        this._extractionError = "Failed to extract content from web page";
        return;
      }
      const u = {}, d = {};
      for (const s of l)
        s.included && (s.heading && (u[`${s.id}.heading`] = s.pattern === "role" ? s.content : s.heading, u[`${s.id}.title`] = s.pattern === "role" ? s.content : s.heading), u[`${s.id}.content`] = s.content, s.description && (u[`${s.id}.description`] = s.description), s.summary && (u[`${s.id}.summary`] = s.summary), s.stableKey && (d[s.stableKey] = s.id));
      this._sectionLookup = u, B(this, y, d), !this._documentName && (this._workflowConfig || this._config) && a(this, o, K).call(this, u);
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
    for (const r of i.map.mappings) {
      if (r.enabled === !1) continue;
      const c = r.destinations.find(
        (l) => !l.blockKey && l.target === "pageTitle"
      );
      if (c) {
        e = c.target;
        break;
      }
    }
    if (!e)
      for (const r of i.map.mappings) {
        if (r.enabled === !1) continue;
        const c = r.destinations.find((l) => !l.blockKey);
        if (c) {
          e = c.target;
          break;
        }
      }
    if (e) {
      const r = [];
      for (const c of i.map.mappings) {
        if (c.enabled === !1) continue;
        c.destinations.some(
          (u) => u.target === e && !u.blockKey
        ) && t[c.source] && r.push(t[c.source]);
      }
      if (r.length > 0) {
        this._documentName = I(r.join(" "));
        return;
      }
    }
  }
  for (const [e, r] of Object.entries(t))
    if (e.endsWith(".heading") && r) {
      this._documentName = I(r);
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
  return p`
			<umb-property-layout label="PDF File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${a(this, o, N)}>
					</umb-input-media>
					${a(this, o, z).call(this)}
				</div>
			</umb-property-layout>
		`;
};
V = function() {
  return p`
			<umb-property-layout label="Markdown File" orientation="vertical">
				<div slot="editor">
					<umb-input-media
						max="1"
						.selection=${this._selectedMediaUnique ? [this._selectedMediaUnique] : []}
						@change=${a(this, o, N)}>
					</umb-input-media>
					${a(this, o, z).call(this)}
				</div>
			</umb-property-layout>
		`;
};
Z = function() {
  return p`
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
    t.key === "Enter" && this._sourceUrl && a(this, o, M).call(this);
  }}>
						</uui-input>
						<uui-button
							look="primary"
							label="Extract"
							?disabled=${!this._sourceUrl || this._isExtracting}
							@click=${() => a(this, o, M).call(this)}>
							Extract
						</uui-button>
					</div>
					${a(this, o, z).call(this)}
				</div>
			</umb-property-layout>
		`;
};
tt = function() {
  return p`
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
z = function() {
  return this._isExtracting ? p`<div class="extraction-status extracting">
				<uui-loader-bar></uui-loader-bar>
				<span>Extracting content from source...</span>
			</div>` : this._extractionError ? p`<div class="extraction-status error">
				<uui-icon name="icon-alert"></uui-icon>
				<span>${this._extractionError}</span>
			</div>` : Object.values(this._sectionLookup).some((i) => i.length > 0) ? p`<div class="extraction-status success">
				<uui-icon name="icon-check"></uui-icon>
				<span>Content extracted successfully</span>
			</div>` : O;
};
et = function() {
  const t = a(this, o, C).call(this);
  return p`
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
  return p`
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
				${this._loadingSourceTypes ? p`<uui-loader-bar></uui-loader-bar>` : this._availableSourceTypes.length === 0 ? p`<p style="color: var(--uui-color-danger);">No source types configured for this workflow.</p>` : p`
							<umb-property-layout label="Source Type" orientation="vertical">
								<div slot="editor">
									<uui-select
										label="Select source type"
										.options=${[
    ...this._availableSourceTypes.length > 1 ? [{ name: "Choose a source...", value: "", selected: this._sourceType === "" }] : [],
    ...this._availableSourceTypes.map((t) => ({
      name: Tt[t] || t,
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
  const i = t.destination, e = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const n of t.map.mappings) {
    if (n.enabled === !1) continue;
    let v = this._sectionLookup[n.source];
    if (!v && n.sourceKey && U(this, y)) {
      const g = U(this, y)[n.sourceKey];
      if (g) {
        const b = n.source.split(".").pop();
        b && (v = this._sectionLookup[`${g}.${b}`]);
      }
    }
    if (v)
      for (const g of n.destinations) {
        const b = g.blockKey ? `${g.blockKey}:${g.target}` : g.target, _ = e.get(b) ?? [];
        _.push(v), e.set(b, _), r.has(b) || r.set(b, { alias: g.target, blockKey: g.blockKey });
      }
  }
  const c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  for (const [n, v] of e.entries()) {
    const g = r.get(n), b = g?.alias ?? n, _ = g?.blockKey, S = pt(
      { target: b, blockKey: _ },
      i
    ) ?? "other";
    c.has(S) || c.set(S, []);
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
    c.get(S).push({
      label: E,
      value: v.join(" "),
      blockLabel: _ ? bt(_, i) ?? void 0 : void 0,
      group: ft({ target: b, blockKey: _ }, i) ?? void 0
    });
  }
  const u = mt(i), d = [];
  for (const n of u) {
    const v = c.get(n.id);
    v?.length && (l.set(n.id, n.label), d.push({ tabId: n.id, tabLabel: n.label, items: v }));
  }
  const s = c.get("other");
  return s?.length && d.push({ tabId: "other", tabLabel: "Other", items: s }), d;
};
$ = function(t, i) {
  return p`
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
    const l = /* @__PURE__ */ new Map();
    for (const u of t.items) {
      const d = u.blockLabel ?? "Other", s = l.get(d) ?? [];
      s.push(u), l.set(d, s);
    }
    return p`
				${Array.from(l.entries()).map(([u, d]) => p`
					<div class="block-group-header">
						<umb-icon name="icon-box"></umb-icon>
						<span>${u}</span>
					</div>
					${d.map((s) => a(this, o, $).call(this, s.label, s.value))}
				`)}
			`;
  }
  const i = /* @__PURE__ */ new Map();
  for (const l of t.items) {
    const u = l.group ?? null, d = i.get(u) ?? [];
    d.push(l), i.set(u, d);
  }
  const e = (this._workflowConfig ?? this._config)?.destination, c = (e ? gt(Array.from(i.keys()), e, t.tabId) : Array.from(i.keys())).map((l) => [l, i.get(l)]);
  return p`
			${c.map(
    ([l, u]) => l ? p`
						<div class="group-panel">
							<div class="group-panel-header">${l}</div>
							<div class="group-panel-content">
								${u.map((d) => a(this, o, $).call(this, d.label, d.value))}
							</div>
						</div>
					` : u.map((d) => a(this, o, $).call(this, d.label, d.value))
  )}
		`;
};
nt = function() {
  const t = a(this, o, ot).call(this);
  if (t.length === 0)
    return p`
				<div class="content-editor">
					<p class="content-editor-intro">No mapped content to preview. Create mappings in the workflow editor first.</p>
				</div>
			`;
  (!this._contentActiveTab || !t.find((e) => e.tabId === this._contentActiveTab)) && (this._contentActiveTab = t[0].tabId);
  const i = t.find((e) => e.tabId === this._contentActiveTab) ?? t[0];
  return p`
			<uui-tab-group class="content-inner-tabs">
				${t.map((e) => p`
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
  return p`
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
h.styles = [
  yt,
  vt`
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
], h.prototype, "_activeTab", 2);
f([
  m()
], h.prototype, "_documentName", 2);
f([
  m()
], h.prototype, "_sourceType", 2);
f([
  m()
], h.prototype, "_sourceUrl", 2);
f([
  m()
], h.prototype, "_selectedMediaUnique", 2);
f([
  m()
], h.prototype, "_sectionLookup", 2);
f([
  m()
], h.prototype, "_config", 2);
f([
  m()
], h.prototype, "_workflowConfig", 2);
f([
  m()
], h.prototype, "_isExtracting", 2);
f([
  m()
], h.prototype, "_extractionError", 2);
f([
  m()
], h.prototype, "_contentActiveTab", 2);
f([
  m()
], h.prototype, "_availableSourceTypes", 2);
f([
  m()
], h.prototype, "_loadingSourceTypes", 2);
h = f([
  _t("up-doc-modal")
], h);
const At = h;
export {
  h as UpDocModalElement,
  At as default
};
//# sourceMappingURL=up-doc-modal.element-D3X7qNkR.js.map
