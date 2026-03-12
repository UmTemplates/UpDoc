import { U as Y } from "./page-picker-modal.token-B0CgP9f1.js";
import { e as H } from "./workflow.service-DwTP3LNQ.js";
import "./up-doc-pdf-thumbnail.element-N7K7a6d1.js";
import { css as C, property as J, state as l, customElement as T, html as r, nothing as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as Q } from "@umbraco-cms/backoffice/lit-element";
import { UMB_MODAL_MANAGER_CONTEXT as U, UmbModalBaseElement as V } from "@umbraco-cms/backoffice/modal";
import { UMB_MEDIA_PICKER_MODAL as Z } from "@umbraco-cms/backoffice/media";
import { UMB_AUTH_CONTEXT as M } from "@umbraco-cms/backoffice/auth";
import { UmbTextStyles as j } from "@umbraco-cms/backoffice/style";
import { generateAlias as ee } from "@umbraco-cms/backoffice/utils";
var te = Object.defineProperty, ae = Object.getOwnPropertyDescriptor, E = (e) => {
  throw TypeError(e);
}, _ = (e, t, a, s) => {
  for (var n = s > 1 ? void 0 : s ? ae(t, a) : t, h = e.length - 1, d; h >= 0; h--)
    (d = e[h]) && (n = (s ? d(t, a, n) : d(n)) || n);
  return s && n && te(t, a, n), n;
}, ie = (e, t, a) => t.has(e) || E("Cannot " + a), ne = (e, t, a) => t.has(e) ? E("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), b = (e, t, a) => (ie(e, t, "access private method"), a), p, v, S, D;
let m = class extends Q {
  constructor() {
    super(...arguments), ne(this, p), this.label = "", this._mediaKey = null, this._mediaName = "", this._token = "";
  }
  async connectedCallback() {
    super.connectedCallback();
    const e = await this.getContext(M);
    this._token = await e.getLatestToken();
  }
  render() {
    return this._mediaKey ? r`
			<uui-card-media name=${this._mediaName || "PDF"}>
				<up-doc-pdf-thumbnail
					mediaKey=${this._mediaKey}
					page="1"
					width="300"
					token=${this._token}>
				</up-doc-pdf-thumbnail>
				<uui-action-bar slot="actions">
					<uui-button
						label="Remove"
						look="secondary"
						compact
						@click=${b(this, p, D)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
					<uui-button
						label="Change"
						look="secondary"
						compact
						@click=${b(this, p, v)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</uui-card-media>
		` : r`
				<uui-button
					id="btn-add"
					look="placeholder"
					@click=${b(this, p, v)}
					label="Choose">
					<uui-icon name="icon-add"></uui-icon>
					Choose
				</uui-button>
			`;
  }
};
p = /* @__PURE__ */ new WeakSet();
v = async function() {
  const a = await (await this.getContext(U)).open(this, Z, {
    data: {
      multiple: !1
    }
  }).onSubmit().catch(() => null);
  if (!a?.selection?.length) return;
  const s = a.selection[0];
  s && (this._mediaKey = s, this._mediaName = await b(this, p, S).call(this, s), this.dispatchEvent(
    new CustomEvent("change", {
      detail: { mediaKey: s },
      bubbles: !0,
      composed: !0
    })
  ));
};
S = async function(e) {
  try {
    const t = await fetch(
      `/umbraco/management/api/v1/media/item?id=${e}`,
      { headers: { Authorization: `Bearer ${this._token}` } }
    );
    return t.ok ? (await t.json())?.[0]?.name ?? "PDF" : "PDF";
  } catch {
    return "PDF";
  }
};
D = function() {
  this._mediaKey = null, this._mediaName = "", this.dispatchEvent(
    new CustomEvent("change", {
      detail: { mediaKey: null },
      bubbles: !0,
      composed: !0
    })
  );
};
m.styles = [
  C`
			:host {
				display: block;
			}

			#btn-add {
				text-align: center;
				width: 200px;
				height: 200px;
			}

			uui-icon {
				display: block;
				margin: 0 auto;
			}

			uui-card-media {
				width: 200px;
			}
		`
];
_([
  J({ type: String })
], m.prototype, "label", 2);
_([
  l()
], m.prototype, "_mediaKey", 2);
_([
  l()
], m.prototype, "_mediaName", 2);
_([
  l()
], m.prototype, "_token", 2);
m = _([
  T("up-doc-pdf-picker")
], m);
var se = Object.defineProperty, oe = Object.getOwnPropertyDescriptor, N = (e) => {
  throw TypeError(e);
}, c = (e, t, a, s) => {
  for (var n = s > 1 ? void 0 : s ? oe(t, a) : t, h = e.length - 1, d; h >= 0; h--)
    (d = e[h]) && (n = (s ? d(t, a, n) : d(n)) || n);
  return s && n && se(t, a, n), n;
}, P = (e, t, a) => t.has(e) || N("Cannot " + a), w = (e, t, a) => (P(e, t, "read from private field"), a ? a.call(e) : t.get(e)), $ = (e, t, a) => t.has(e) ? N("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), ue = (e, t, a, s) => (P(e, t, "write to private field"), t.set(e, a), a), o = (e, t, a) => (P(e, t, "access private method"), a), g, i, z, A, O, y, L, x, k, W, q, K, B, R, F, I, G, X;
const le = [
  { value: "pdf", name: "PDF Document" },
  { value: "markdown", name: "Markdown" },
  { value: "web", name: "Web Page" },
  { value: "doc", name: "Word Document" }
], re = {
  pdf: "PDF",
  markdown: "Markdown",
  web: "Web Page",
  doc: "Word Document"
};
let u = class extends V {
  constructor() {
    super(...arguments), $(this, i), this._activeTab = "source", this._name = "", this._alias = "", this._aliasLocked = !0, $(this, g, !1), this._sourceType = "", this._selectedMediaUnique = null, this._sourceUrl = "", this._extracting = !1, this._totalPages = 0, this._elementCount = 0, this._fileName = "", this._selectedPages = null;
  }
  render() {
    return r`
			<umb-body-layout headline="Create Workflow">
				${o(this, i, K).call(this)}

				<div class="tab-content">
					${o(this, i, X).call(this)}
				</div>

				<uui-button
					slot="actions"
					id="close"
					label=${this.localize.term("general_close")}
					@click="${o(this, i, q)}"></uui-button>
				<uui-button
					slot="actions"
					id="save"
					look="primary"
					color="positive"
					label=${this.localize.term("general_create")}
					?disabled=${!w(this, i, k)}
					@click="${o(this, i, W)}"></uui-button>
			</umb-body-layout>
		`;
  }
};
g = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
z = function(e) {
  const a = e.target.value;
  if (a !== this._sourceType && (this._selectedMediaUnique = null, this._sourceUrl = ""), this._sourceType = a, !w(this, g) && this.data?.blueprintName && this._sourceType) {
    const s = re[this._sourceType] ?? this._sourceType;
    this._name = `${this.data.blueprintName} - ${s}`, this._alias = ee(this._name);
  }
  this.requestUpdate();
};
A = async function(e) {
  const t = e.detail;
  if (this._selectedMediaUnique = t?.mediaKey ?? null, this._totalPages = 0, this._elementCount = 0, this._fileName = "", this._selectedPages = null, this._selectedMediaUnique) {
    this._extracting = !0;
    try {
      const s = await (await this.getContext(M)).getLatestToken(), n = await H(this._selectedMediaUnique, s);
      n && (this._totalPages = n.source.totalPages, this._elementCount = n.elements.length, this._fileName = n.source.fileName);
    } catch {
    } finally {
      this._extracting = !1;
    }
  }
};
O = async function() {
  if (!this._selectedMediaUnique || this._totalPages === 0) return;
  const a = await (await this.getContext(U)).open(this, Y, {
    data: {
      mediaKey: this._selectedMediaUnique,
      totalPages: this._totalPages,
      selectedPages: this._selectedPages
    }
  }).onSubmit().catch(() => null);
  a !== null && (this._selectedPages = a.selectedPages);
};
y = async function(e) {
  const a = e.target.selection;
  this._selectedMediaUnique = a.length > 0 ? a[0] : null;
};
L = function(e) {
  const t = e.target;
  this._name = t.value, this._alias = t.alias, this._aliasLocked = t.autoGenerateAlias ?? !1, this._name.trim().length > 0 && ue(this, g, !0);
};
x = function(e) {
  this._activeTab = e;
};
k = function() {
  return this._name.trim().length > 0 && this._alias.trim().length > 0 && this._sourceType.length > 0;
};
W = function() {
  w(this, i, k) && (this.value = {
    name: this._name.trim(),
    alias: this._alias.trim(),
    sourceType: this._sourceType,
    mediaUnique: this._selectedMediaUnique,
    sourceUrl: this._sourceUrl || null,
    documentTypeAlias: this.data.documentTypeAlias,
    blueprintId: this.data.blueprintUnique,
    blueprintName: this.data.blueprintName,
    selectedPages: this._selectedPages
  }, this._submitModal());
};
q = function() {
  this._rejectModal();
};
K = function() {
  return r`
			<uui-tab-group slot="navigation">
				<uui-tab
					label="Source"
					?active=${this._activeTab === "source"}
					orientation="horizontal"
					@click=${() => o(this, i, x).call(this, "source")}>
					<uui-icon slot="icon" name="icon-page-add"></uui-icon>
					Source
				</uui-tab>
				<uui-tab
					label="Destination"
					?active=${this._activeTab === "destination"}
					orientation="horizontal"
					@click=${() => o(this, i, x).call(this, "destination")}>
					<uui-icon slot="icon" name="icon-document"></uui-icon>
					Destination
				</uui-tab>
			</uui-tab-group>
		`;
};
B = function() {
  return this._fileName ? r`
			<div class="extraction-stats">
				<span class="extraction-filename">${this._fileName}</span>
				<div class="extraction-meta">
					<span><uui-icon name="icon-thumbnails-small"></uui-icon> ${this._totalPages} pages</span>
					<span><uui-icon name="icon-list"></uui-icon> ${this._elementCount} elements</span>
				</div>
			</div>
		` : f;
};
R = function() {
  switch (this._sourceType) {
    case "pdf":
      return r`
					<uui-box headline="Sample Document">
						<up-doc-pdf-picker @change=${o(this, i, A)}></up-doc-pdf-picker>
						${this._extracting ? r`<uui-loader-bar></uui-loader-bar>` : f}
						${o(this, i, B).call(this)}
					</uui-box>
				`;
    case "markdown":
      return r`
					<uui-box headline="Sample File">
						<umb-input-media max="1" @change=${o(this, i, y)}></umb-input-media>
					</uui-box>
				`;
    case "web":
      return r`
					<uui-box headline="Sample URL">
						<uui-input
							label="URL"
							placeholder="https://example.com/page"
							.value=${this._sourceUrl}
							@input=${(e) => this._sourceUrl = e.target.value}>
						</uui-input>
					</uui-box>
				`;
    case "doc":
      return r`
					<uui-box headline="Sample Document">
						<umb-input-media max="1" @change=${o(this, i, y)}></umb-input-media>
					</uui-box>
				`;
    default:
      return f;
  }
};
F = function() {
  if (this._totalPages === 0) return f;
  const e = this._selectedPages ? `${this._selectedPages.length} of ${this._totalPages} pages` : `All ${this._totalPages} pages`;
  return r`
			<uui-box headline="Pages">
				<span class="page-selection-label">${e}</span>
				<uui-button
					look="outline"
					label="Choose Pages"
					@click=${o(this, i, O)}
					class="full-width-button">
					<uui-icon name="icon-thumbnails-small"></uui-icon>
					Choose Pages
				</uui-button>
			</uui-box>
		`;
};
I = function() {
  return r`
			<uui-box headline="Workflow Name">
				<umb-input-with-alias
					label="Workflow name"
					.value=${this._name}
					.alias=${this._alias}
					?auto-generate-alias=${this._aliasLocked}
					@change=${o(this, i, L)}>
				</umb-input-with-alias>
			</uui-box>

			<uui-box headline="Format">
				<uui-select
					label="Select source format"
					.options=${[
    { name: "Choose a format...", value: "", selected: this._sourceType === "" },
    ...le.map((e) => ({
      ...e,
      selected: this._sourceType === e.value
    }))
  ]}
					@change=${o(this, i, z)}>
				</uui-select>
			</uui-box>

			${o(this, i, R).call(this)}
			${o(this, i, F).call(this)}
		`;
};
G = function() {
  return r`
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
X = function() {
  switch (this._activeTab) {
    case "source":
      return o(this, i, I).call(this);
    case "destination":
      return o(this, i, G).call(this);
  }
};
u.styles = [
  j,
  C`
			.destination-value {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			uui-input,
			umb-input-with-alias {
				width: 100%;
			}

			uui-select {
				width: 100%;
			}

			uui-box {
				margin-bottom: var(--uui-size-space-4);
			}

			.tab-content {
				display: flex;
				flex-direction: column;
			}

			.extraction-stats {
				margin-top: var(--uui-size-space-3);
				padding: var(--uui-size-space-3);
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface-alt);
			}

			.extraction-filename {
				display: block;
				font-weight: 600;
				font-size: var(--uui-type-small-size);
				margin-bottom: var(--uui-size-space-2);
				word-break: break-all;
			}

			.extraction-meta {
				display: flex;
				gap: var(--uui-size-space-4);
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}

			.extraction-meta span {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-1);
			}

			.page-selection-label {
				display: block;
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				margin-bottom: var(--uui-size-space-3);
			}

			.full-width-button {
				width: 100%;
			}

		`
];
c([
  l()
], u.prototype, "_activeTab", 2);
c([
  l()
], u.prototype, "_name", 2);
c([
  l()
], u.prototype, "_alias", 2);
c([
  l()
], u.prototype, "_aliasLocked", 2);
c([
  l()
], u.prototype, "_sourceType", 2);
c([
  l()
], u.prototype, "_selectedMediaUnique", 2);
c([
  l()
], u.prototype, "_sourceUrl", 2);
c([
  l()
], u.prototype, "_extracting", 2);
c([
  l()
], u.prototype, "_totalPages", 2);
c([
  l()
], u.prototype, "_elementCount", 2);
c([
  l()
], u.prototype, "_fileName", 2);
c([
  l()
], u.prototype, "_selectedPages", 2);
u = c([
  T("create-workflow-sidebar")
], u);
const ye = u;
export {
  u as CreateWorkflowSidebarElement,
  ye as default
};
//# sourceMappingURL=create-workflow-sidebar.element-DqSqLwB_.js.map
