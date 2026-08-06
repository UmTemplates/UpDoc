import { html as p, css as O, state as w, customElement as B } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as M } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as R } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as b } from "@umbraco-cms/backoffice/auth";
import { UmbModalToken as P, umbOpenModal as v, UMB_MODAL_MANAGER_CONTEXT as I, UMB_CONFIRM_MODAL as z } from "@umbraco-cms/backoffice/modal";
import { U as L } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { z as U, m as F, l as q, A as j } from "./workflow.service-Coqu6zLj.js";
const V = new P(
  "UpDoc.CreateWorkflowSidebar",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
var G = Object.defineProperty, J = Object.getOwnPropertyDescriptor, E = (e) => {
  throw TypeError(e);
}, m = (e, t, o, s) => {
  for (var i = s > 1 ? void 0 : s ? J(t, o) : t, c = e.length - 1, d; c >= 0; c--)
    (d = e[c]) && (i = (s ? d(t, o, i) : d(i)) || i);
  return s && i && G(t, o, i), i;
}, K = (e, t, o) => t.has(e) || E("Cannot " + o), X = (e, t, o) => t.has(e) ? E("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), n = (e, t, o) => (K(e, t, "access private method"), o), r, h, y, x, $, A, D, N;
let u = class extends M {
  constructor() {
    super(...arguments), X(this, r), this._workflows = [], this._loading = !0, this._error = null;
  }
  async connectedCallback() {
    super.connectedCallback(), await n(this, r, h).call(this);
  }
  render() {
    return this._loading ? p`<uui-loader-bar></uui-loader-bar>` : this._error ? p`
				<uui-box>
					<p style="color: var(--uui-color-danger);">Error: ${this._error}</p>
					<uui-button look="secondary" @click=${() => n(this, r, h).call(this)}>Retry</uui-button>
				</uui-box>
			` : this._workflows.length === 0 ? n(this, r, D).call(this) : n(this, r, N).call(this);
  }
};
r = /* @__PURE__ */ new WeakSet();
h = async function() {
  this._loading = !0, this._error = null;
  try {
    const t = await (await this.getContext(b)).getLatestToken(), o = await fetch("/umbraco/management/api/v1/updoc/workflows", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      }
    });
    if (!o.ok)
      throw new Error(`Failed to load workflows: ${o.statusText}`);
    this._workflows = await o.json();
  } catch (e) {
    this._error = e instanceof Error ? e.message : "Unknown error", console.error("Failed to load workflows:", e);
  } finally {
    this._loading = !1;
  }
};
y = async function() {
  try {
    const t = await (await this.getContext(b)).getLatestToken(), o = await fetch("/umbraco/management/api/v1/updoc/document-types", {
      headers: { Authorization: `Bearer ${t}` }
    });
    if (!o.ok)
      throw new Error("Failed to load document types");
    const s = await o.json(), i = [];
    for (const l of s) {
      const _ = await fetch(
        `/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(l.alias)}/blueprints`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      if (!_.ok) continue;
      const T = await _.json();
      T.length > 0 && i.push({
        documentTypeUnique: l.id,
        documentTypeName: l.name,
        documentTypeIcon: l.icon ?? null,
        blueprints: T.map((C) => ({
          blueprintUnique: C.id,
          blueprintName: C.name
        }))
      });
    }
    if (!i.length) {
      this._error = "No document types with blueprints found. Create a Document Blueprint first.";
      return;
    }
    let c;
    try {
      c = await v(this, L, {
        data: { documentTypes: i }
      });
    } catch {
      return;
    }
    const { blueprintUnique: d, documentTypeUnique: f } = c, k = i.find((l) => l.documentTypeUnique === f), S = k?.blueprints.find((l) => l.blueprintUnique === d), W = s.find((l) => l.id === f);
    let a;
    try {
      a = await v(this, V, {
        data: {
          documentTypeUnique: f,
          documentTypeName: k?.documentTypeName ?? "",
          documentTypeAlias: W?.alias ?? "",
          blueprintUnique: d,
          blueprintName: S?.blueprintName ?? ""
        }
      });
    } catch {
      return;
    }
    const g = await fetch("/umbraco/management/api/v1/updoc/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      },
      body: JSON.stringify({
        name: a.name,
        alias: a.alias,
        documentTypeAlias: a.documentTypeAlias,
        sourceType: a.sourceType,
        blueprintId: a.blueprintId,
        blueprintName: a.blueprintName
      })
    });
    if (!g.ok)
      throw new Error(await U(g, "Failed to create workflow"));
    if (a.selectedPages && a.selectedPages.length > 0 && await fetch(
      `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(a.alias)}/pages`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({ pages: a.selectedPages })
      }
    ), a.mediaUnique || a.sourceUrl)
      try {
        await F(
          a.alias,
          a.mediaUnique ?? "",
          t,
          a.sourceUrl ?? void 0
        ), a.mediaUnique && await q(
          a.alias,
          a.mediaUnique,
          t
        );
      } catch (l) {
        console.warn("Sample extraction during workflow creation failed:", l);
      }
    await n(this, r, h).call(this);
  } catch (e) {
    e instanceof Error && (this._error = e.message, console.error("Failed to create workflow:", e));
  }
};
x = function(e) {
  const t = encodeURIComponent(e.alias);
  window.history.pushState({}, "", `section/settings/workspace/updoc-workflow/edit/${t}`), window.dispatchEvent(new PopStateEvent("popstate"));
};
$ = async function(e) {
  const t = await this.getContext(I);
  try {
    await t.open(this, z, {
      data: {
        headline: `Delete "${e.name}"?`,
        content: p`<p>This will permanently delete the workflow folder and all its configuration files (destination, map, and source configs).</p>
						<p>This action cannot be undone.</p>`,
        confirmLabel: "Delete",
        color: "danger"
      }
    }).onSubmit();
  } catch {
    return;
  }
  try {
    const s = await (await this.getContext(b)).getLatestToken(), i = await fetch(`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(e.alias)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${s}`
      }
    });
    if (!i.ok)
      throw new Error(await U(i, "Failed to delete workflow"));
    j(), await n(this, r, h).call(this);
  } catch (o) {
    this._error = o instanceof Error ? o.message : "Unknown error", console.error("Failed to delete workflow:", o);
  }
};
A = function(e) {
  if (!e.length) return "—";
  const t = { pdf: "PDF", markdown: "Markdown", web: "Web", doc: "Word" };
  return e.map((o) => t[o] ?? o).join(", ");
};
D = function() {
  return p`
			<uui-box headline="No workflows configured">
				<p>
					Workflows define how content is extracted from external sources (PDFs, web pages, documents)
					and mapped to Umbraco document properties.
				</p>
				<p>
					Create a workflow to enable the <strong>"Create from Source"</strong> action
					for a document type.
				</p>
				<uui-button
					look="primary"
					color="positive"
					label="Create Workflow"
					@click=${n(this, r, y)}></uui-button>
			</uui-box>
		`;
};
N = function() {
  return p`
			<div class="header">
				<uui-button
					look="primary"
					color="positive"
					label="Create Workflow"
					@click=${n(this, r, y)}></uui-button>
			</div>
			<uui-box>
				<uui-table>
					<uui-table-head>
						<uui-table-head-cell>Workflow</uui-table-head-cell>
						<uui-table-head-cell>Alias</uui-table-head-cell>
						<uui-table-head-cell>Document Type</uui-table-head-cell>
						<uui-table-head-cell>Blueprint</uui-table-head-cell>
						<uui-table-head-cell>Source</uui-table-head-cell>
						<uui-table-head-cell>Mappings</uui-table-head-cell>
						<uui-table-head-cell>Status</uui-table-head-cell>
						<uui-table-head-cell style="width: 1px;"></uui-table-head-cell>
					</uui-table-head>
					${this._workflows.map(
    (e) => p`
							<uui-table-row class="clickable-row" @click=${() => n(this, r, x).call(this, e)}>
								<uui-table-cell>${e.name}</uui-table-cell>
								<uui-table-cell class="alias-cell">${e.alias}</uui-table-cell>
								<uui-table-cell>${e.documentTypeName ?? e.documentTypeAlias}</uui-table-cell>
								<uui-table-cell>${e.blueprintName ?? e.blueprintId ?? "—"}</uui-table-cell>
								<uui-table-cell>${n(this, r, A).call(this, e.sourceTypes)}</uui-table-cell>
								<uui-table-cell>${e.mappingCount}</uui-table-cell>
								<uui-table-cell>
									<uui-tag
										look=${e.isComplete ? "primary" : "secondary"}
										color=${e.isComplete ? "positive" : "warning"}>
										${e.isComplete ? "Ready" : "Incomplete"}
									</uui-tag>
								</uui-table-cell>
								<uui-table-cell>
									<uui-button
										look="default"
										color="danger"
										label="Delete"
										compact
										@click=${(t) => {
      t.stopPropagation(), n(this, r, $).call(this, e);
    }}>
										<uui-icon name="icon-trash"></uui-icon>
									</uui-button>
								</uui-table-cell>
							</uui-table-row>
						`
  )}
				</uui-table>
			</uui-box>
		`;
};
u.styles = [
  R,
  O`
			:host {
				display: block;
				padding: var(--uui-size-layout-1);
			}

			.header {
				display: flex;
				justify-content: flex-end;
				margin-bottom: var(--uui-size-space-4);
			}

			.clickable-row {
				cursor: pointer;
			}

			.clickable-row:hover {
				background: var(--uui-color-surface-alt);
			}

			.alias-cell {
				font-family: monospace;
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}
		`
];
m([
  w()
], u.prototype, "_workflows", 2);
m([
  w()
], u.prototype, "_loading", 2);
m([
  w()
], u.prototype, "_error", 2);
u = m([
  B("up-doc-workflows-view")
], u);
const ae = u;
export {
  u as UpDocWorkflowsViewElement,
  ae as default
};
//# sourceMappingURL=up-doc-workflows-view.element-BqOIYH9U.js.map
