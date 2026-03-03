import { b as P } from "./workflow.service-DXCyU5bG.js";
import { g as v } from "./destination-utils-DUfOJy5W.js";
import { html as t, nothing as r, css as S, state as d, customElement as F } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as W } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as B } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
var U = Object.defineProperty, N = Object.getOwnPropertyDescriptor, h = (e) => {
  throw TypeError(e);
}, u = (e, a, i, s) => {
  for (var n = s > 1 ? void 0 : s ? N(a, i) : a, p = e.length - 1, f; p >= 0; p--)
    (f = e[p]) && (n = (s ? f(a, i, n) : f(n)) || n);
  return s && n && U(a, i, n), n;
}, M = (e, a, i) => a.has(e) || h("Cannot " + i), O = (e, a, i) => a.has(e) ? h("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, i), l = (e, a, i) => (M(e, a, "access private method"), i), o, y, g, m, b, _, z, k, $, x, w, T, D, C, A;
let c = class extends B {
  constructor() {
    super(...arguments), O(this, o), this._config = null, this._loading = !0, this._error = null, this._activeTab = "destination", this._activeDestinationTab = "page-properties";
  }
  async firstUpdated() {
    await l(this, o, y).call(this);
  }
  // =========================================================================
  // Main render
  // =========================================================================
  render() {
    if (this._loading)
      return t`
				<umb-body-layout headline=${this.data?.workflowAlias ?? "Workflow"}>
					<div class="loading"><uui-loader-bar></uui-loader-bar></div>
				</umb-body-layout>
			`;
    if (this._error)
      return t`
				<umb-body-layout headline=${this.data?.workflowAlias ?? "Workflow"}>
					<p style="color: var(--uui-color-danger);">${this._error}</p>
					<div slot="actions">
						<uui-button label="Close" @click=${l(this, o, b)}></uui-button>
					</div>
				</umb-body-layout>
			`;
    const e = l(this, o, g).call(this);
    return t`
			<umb-body-layout headline=${this.data?.workflowAlias ?? "Workflow"}>
				<uui-tab-group slot="navigation">
					${e.map(
      (a) => t`
							<uui-tab
								label=${a.label}
								?active=${this._activeTab === a.id}
								@click=${() => {
        this._activeTab = a.id;
      }}>
								<uui-icon slot="icon" name=${a.icon}></uui-icon>
								${a.label}
							</uui-tab>
						`
    )}
				</uui-tab-group>

				<div class="tab-content">
					${l(this, o, D).call(this)}
				</div>

				<uui-button
					slot="actions"
					label="Close"
					@click=${l(this, o, b)}></uui-button>
			</umb-body-layout>
		`;
  }
};
o = /* @__PURE__ */ new WeakSet();
y = async function() {
  this._loading = !0, this._error = null;
  try {
    const e = this.data?.workflowAlias;
    if (!e) {
      this._error = "No workflow name provided";
      return;
    }
    const i = await (await this.getContext(E)).getLatestToken();
    if (this._config = await P(e, i), !this._config) {
      this._error = `Workflow "${e}" not found`;
      return;
    }
    const s = l(this, o, g).call(this);
    s.length > 0 && (this._activeTab = s[0].id);
    const n = l(this, o, m).call(this);
    n.length > 0 && (this._activeDestinationTab = n[0].id);
  } catch (e) {
    this._error = e instanceof Error ? e.message : "Failed to load workflow", console.error("Failed to load workflow config:", e);
  } finally {
    this._loading = !1;
  }
};
g = function() {
  if (!this._config) return [];
  const e = [
    { id: "destination", label: "Destination", icon: "icon-blueprint" }
  ];
  for (const a of Object.keys(this._config.sources))
    e.push({
      id: `source-${a}`,
      label: a.charAt(0).toUpperCase() + a.slice(1),
      icon: a === "pdf" ? "icon-document" : a === "markdown" ? "icon-code" : "icon-globe"
    });
  return e;
};
m = function() {
  if (!this._config) return [];
  const e = [], a = new Set(this._config.destination.fields.map((i) => i.tab).filter(Boolean));
  for (const i of a)
    e.push({
      id: i.toLowerCase().replace(/\s+/g, "-"),
      label: i
    });
  for (const i of v(this._config.destination)) {
    const s = i.tab ?? "Page Content";
    a.has(s) || (a.add(s), e.push({
      id: s.toLowerCase().replace(/\s+/g, "-"),
      label: s
    }));
  }
  return e;
};
b = function() {
  this._rejectModal();
};
_ = function(e) {
  if (!this._config) return r;
  const a = this._config.destination.fields.filter((i) => i.tab === e);
  return a.length === 0 ? t`<p class="empty-message">No fields in this tab.</p>` : t`
			<div class="field-list">
				${a.map((i) => l(this, o, z).call(this, i))}
			</div>
		`;
};
z = function(e) {
  return t`
			<div class="field-item">
				<div class="field-header">
					<span class="field-label">${e.label}</span>
					<span class="field-type">${e.type}</span>
					${e.mandatory ? t`<uui-tag look="primary" color="danger" class="field-badge">Required</uui-tag>` : r}
				</div>
				<div class="field-meta">
					<span class="field-alias">${e.alias}</span>
					${e.description ? t`<span class="field-description">${e.description}</span>` : r}
				</div>
			</div>
		`;
};
k = function(e) {
  if (!this._config) return r;
  const a = v(this._config.destination).filter((i) => (i.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === e);
  return a.length ? t`
			${a.map((i) => l(this, o, $).call(this, i))}
		` : t`<p class="empty-message">No blocks configured.</p>`;
};
$ = function(e) {
  return t`
			<div class="block-grid">
				<div class="block-grid-header">
					<span class="block-grid-label">${e.label}</span>
					<span class="field-alias">${e.alias}</span>
				</div>
				${e.description ? t`<p class="block-grid-description">${e.description}</p>` : r}
				<div class="block-list">
					${e.blocks.map(
    (a) => t`
							<div class="block-item">
								<div class="block-header">
									<umb-icon name="icon-box"></umb-icon>
									<span class="block-label">${a.label}</span>
									${a.identifyBy ? t`<span class="block-identify">identified by: "${a.identifyBy.value}"</span>` : r}
								</div>
								${a.properties?.length ? t`
										<div class="block-properties">
											${a.properties.map(
      (i) => t`
													<div class="block-property">
														<span class="block-property-label">${i.label || i.alias}</span>
														<span class="field-type">${i.type}</span>
														${i.acceptsFormats?.length ? t`<span class="accepts-formats">${i.acceptsFormats.join(", ")}</span>` : r}
													</div>
												`
    )}
										</div>
									` : r}
							</div>
						`
  )}
				</div>
			</div>
		`;
};
x = function(e) {
  return e.sections.length ? t`
			${e.globals?.columnDetection ? t`
					<div class="source-globals">
						<span class="globals-label">Column Detection:</span>
						<span>${e.globals.columnDetection.enabled ? "Enabled" : "Disabled"}
							${e.globals.columnDetection.enabled ? `(threshold: ${(e.globals.columnDetection.thresholdPercent * 100).toFixed(0)}%)` : ""}</span>
					</div>
				` : r}
			<div class="section-list">
				${e.sections.map((a) => l(this, o, w).call(this, a))}
			</div>
		` : t`<p class="empty-message">No extraction sections configured.</p>`;
};
w = function(e) {
  return t`
			<div class="section-item">
				<div class="section-header">
					<span class="section-label">${e.label}</span>
					<span class="section-strategy">${e.strategy}</span>
					${e.required ? t`<uui-tag look="primary" color="danger" class="field-badge">Required</uui-tag>` : r}
				</div>
				<div class="section-meta">
					<span class="field-alias">${e.key}</span>
					<span class="section-output">${e.outputFormat}</span>
					${e.pages ? t`<span class="section-pages">pages: ${Array.isArray(e.pages) ? e.pages.join(", ") : e.pages}</span>` : r}
				</div>
				${e.description ? t`<p class="section-description">${e.description}</p>` : r}
				${e.strategyParams ? l(this, o, T).call(this, e.strategy, e.strategyParams) : r}
			</div>
		`;
};
T = function(e, a) {
  const i = Object.entries(a).filter(([, s]) => s != null);
  return i.length === 0 ? r : t`
			<div class="strategy-params">
				${i.map(
    ([s, n]) => t`
						<span class="param">
							<span class="param-key">${s}:</span>
							<span class="param-value">${Array.isArray(n) ? n.join(", ") : String(n)}</span>
						</span>
					`
  )}
			</div>
		`;
};
D = function() {
  if (!this._config) return r;
  if (this._activeTab === "destination")
    return l(this, o, C).call(this);
  if (this._activeTab.startsWith("source-")) {
    const e = this._activeTab.replace("source-", ""), a = this._config.sources[e];
    if (a)
      return l(this, o, x).call(this, a);
  }
  return t`<p class="empty-message">Select a tab to view its contents.</p>`;
};
C = function() {
  const e = l(this, o, m).call(this);
  return t`
			<div class="inner-tab-group">
				${e.map(
    (a) => t`
						<button
							class="inner-tab ${this._activeDestinationTab === a.id ? "active" : ""}"
							@click=${() => {
      this._activeDestinationTab = a.id;
    }}>
							${a.label}
						</button>
					`
  )}
			</div>
			<div class="inner-tab-content">
				${l(this, o, A).call(this)}
			</div>
		`;
};
A = function() {
  if (!this._config) return r;
  const e = this._config.destination.fields.find(
    (i) => i.tab && i.tab.toLowerCase().replace(/\s+/g, "-") === this._activeDestinationTab
  )?.tab, a = v(this._config.destination).some((i) => (i.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeDestinationTab);
  return t`
			${e ? l(this, o, _).call(this, e) : r}
			${a ? l(this, o, k).call(this, this._activeDestinationTab) : r}
		`;
};
c.styles = [
  W,
  S`
			/* Tab content area */
			.tab-content {
				padding: var(--uui-size-space-1) 0;
			}

			/* Inner destination tabs (content-area style) */
			.inner-tab-group {
				display: flex;
				gap: 0;
				border-bottom: 1px solid var(--uui-color-border);
				margin-bottom: var(--uui-size-space-4);
			}

			.inner-tab {
				all: unset;
				padding: var(--uui-size-space-3) var(--uui-size-space-5);
				cursor: pointer;
				font-size: var(--uui-type-default-size);
				color: var(--uui-color-text-alt);
				border-bottom: 2px solid transparent;
				transition: color 120ms, border-color 120ms;
			}

			.inner-tab:hover {
				color: var(--uui-color-text);
			}

			.inner-tab.active {
				color: var(--uui-color-text);
				border-bottom-color: var(--uui-color-current);
				font-weight: 600;
			}

			.inner-tab-content {
				min-height: 100px;
			}

			.loading {
				padding: var(--uui-size-layout-1);
			}

			.empty-message {
				color: var(--uui-color-text-alt);
				font-style: italic;
			}

			/* Field list (Page Properties) */
			.field-list {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-1);
			}

			.field-item {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.field-item:last-child {
				border-bottom: none;
			}

			.field-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			.field-label {
				font-weight: 600;
			}

			.field-type {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface-alt);
				padding: 2px 8px;
				border-radius: var(--uui-border-radius);
			}

			.field-badge {
				font-size: 11px;
			}

			.field-meta {
				display: flex;
				gap: var(--uui-size-space-3);
				margin-top: var(--uui-size-space-1);
			}

			.field-alias {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				font-family: monospace;
			}

			.field-description {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}

			/* Block grid (Page Content) */
			.block-grid {
				margin-bottom: var(--uui-size-space-5);
			}

			.block-grid-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.block-grid-label {
				font-weight: 600;
			}

			.block-grid-description {
				padding: var(--uui-size-space-2) var(--uui-size-space-4);
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				margin: 0;
			}

			.block-list {
				display: flex;
				flex-direction: column;
			}

			.block-item {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				padding-left: var(--uui-size-space-6);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.block-item:last-child {
				border-bottom: none;
			}

			.block-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
			}

			.block-label {
				font-weight: 600;
			}

			.block-identify {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				font-style: italic;
			}

			.block-properties {
				margin-top: var(--uui-size-space-2);
				padding-left: var(--uui-size-space-5);
			}

			.block-property {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-1) 0;
			}

			.block-property-label {
				font-size: var(--uui-type-small-size);
			}

			.accepts-formats {
				font-size: 11px;
				color: var(--uui-color-text-alt);
			}

			/* Source sections */
			.source-globals {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
				font-size: var(--uui-type-small-size);
				display: flex;
				gap: var(--uui-size-space-2);
			}

			.globals-label {
				font-weight: 600;
			}

			.section-list {
				display: flex;
				flex-direction: column;
			}

			.section-item {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.section-item:last-child {
				border-bottom: none;
			}

			.section-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			.section-label {
				font-weight: 600;
			}

			.section-strategy {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface-alt);
				padding: 2px 8px;
				border-radius: var(--uui-border-radius);
			}

			.section-meta {
				display: flex;
				gap: var(--uui-size-space-3);
				margin-top: var(--uui-size-space-1);
			}

			.section-output {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}

			.section-pages {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}

			.section-description {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				margin: var(--uui-size-space-1) 0 0 0;
			}

			.strategy-params {
				display: flex;
				flex-wrap: wrap;
				gap: var(--uui-size-space-2);
				margin-top: var(--uui-size-space-2);
				padding: var(--uui-size-space-2);
				background: var(--uui-color-surface-alt);
				border-radius: var(--uui-border-radius);
				font-size: 12px;
				font-family: monospace;
			}

			.param {
				display: inline-flex;
				gap: 4px;
			}

			.param-key {
				color: var(--uui-color-text-alt);
			}

			.param-value {
				color: var(--uui-color-text);
				word-break: break-all;
			}
		`
];
u([
  d()
], c.prototype, "_config", 2);
u([
  d()
], c.prototype, "_loading", 2);
u([
  d()
], c.prototype, "_error", 2);
u([
  d()
], c.prototype, "_activeTab", 2);
u([
  d()
], c.prototype, "_activeDestinationTab", 2);
c = u([
  F("up-doc-workflow-detail-modal")
], c);
const I = c;
export {
  c as UpDocWorkflowDetailModalElement,
  I as default
};
//# sourceMappingURL=up-doc-workflow-detail-modal.element-D1-nVeSQ.js.map
