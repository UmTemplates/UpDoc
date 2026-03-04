import { html as p, css as W, state as b, customElement as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as B } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as M } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as y } from "@umbraco-cms/backoffice/auth";
import { UmbModalToken as R, umbOpenModal as v, UMB_MODAL_MANAGER_CONTEXT as P, UMB_CONFIRM_MODAL as I } from "@umbraco-cms/backoffice/modal";
import { U as L } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { m as z, l as F, y as j } from "./workflow.service-DRM8gMCY.js";
const q = new R(
  "UpDoc.CreateWorkflowSidebar",
  {
    modal: {
      type: "sidebar",
      size: "small"
    }
  }
);
var V = Object.defineProperty, G = Object.getOwnPropertyDescriptor, U = (e) => {
  throw TypeError(e);
}, m = (e, t, o, s) => {
  for (var r = s > 1 ? void 0 : s ? G(t, o) : t, u = e.length - 1, d; u >= 0; u--)
    (d = e[u]) && (r = (s ? d(t, o, r) : d(r)) || r);
  return s && r && V(t, o, r), r;
}, J = (e, t, o) => t.has(e) || U("Cannot " + o), K = (e, t, o) => t.has(e) ? U("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), l = (e, t, o) => (J(e, t, "access private method"), o), n, h, k, E, x, $, A, D;
let c = class extends B {
  constructor() {
    super(...arguments), K(this, n), this._workflows = [], this._loading = !0, this._error = null;
  }
  async connectedCallback() {
    super.connectedCallback(), await l(this, n, h).call(this);
  }
  render() {
    return this._loading ? p`<uui-loader-bar></uui-loader-bar>` : this._error ? p`
				<uui-box>
					<p style="color: var(--uui-color-danger);">Error: ${this._error}</p>
					<uui-button look="secondary" @click=${() => l(this, n, h).call(this)}>Retry</uui-button>
				</uui-box>
			` : this._workflows.length === 0 ? l(this, n, A).call(this) : l(this, n, D).call(this);
  }
};
n = /* @__PURE__ */ new WeakSet();
h = async function() {
  this._loading = !0, this._error = null;
  try {
    const t = await (await this.getContext(y)).getLatestToken(), o = await fetch("/umbraco/management/api/v1/updoc/workflows", {
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
k = async function() {
  try {
    const t = await (await this.getContext(y)).getLatestToken(), o = await fetch("/umbraco/management/api/v1/updoc/document-types", {
      headers: { Authorization: `Bearer ${t}` }
    });
    if (!o.ok)
      throw new Error("Failed to load document types");
    const s = await o.json(), r = [];
    for (const i of s) {
      const _ = await fetch(
        `/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(i.alias)}/blueprints`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      if (!_.ok) continue;
      const T = await _.json();
      T.length > 0 && r.push({
        documentTypeUnique: i.id,
        documentTypeName: i.name,
        documentTypeIcon: i.icon ?? null,
        blueprints: T.map((C) => ({
          blueprintUnique: C.id,
          blueprintName: C.name
        }))
      });
    }
    if (!r.length) {
      this._error = "No document types with blueprints found. Create a Document Blueprint first.";
      return;
    }
    let u;
    try {
      u = await v(this, L, {
        data: { documentTypes: r }
      });
    } catch {
      return;
    }
    const { blueprintUnique: d, documentTypeUnique: f } = u, g = r.find((i) => i.documentTypeUnique === f), N = g?.blueprints.find((i) => i.blueprintUnique === d), S = s.find((i) => i.id === f);
    let a;
    try {
      a = await v(this, q, {
        data: {
          documentTypeUnique: f,
          documentTypeName: g?.documentTypeName ?? "",
          documentTypeAlias: S?.alias ?? "",
          blueprintUnique: d,
          blueprintName: N?.blueprintName ?? ""
        }
      });
    } catch {
      return;
    }
    const w = await fetch("/umbraco/management/api/v1/updoc/workflows", {
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
    if (!w.ok) {
      const i = await w.json();
      throw new Error(i.error || `Failed to create workflow: ${w.statusText}`);
    }
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
        await z(
          a.alias,
          a.mediaUnique ?? "",
          t,
          a.sourceUrl ?? void 0
        ), a.mediaUnique && await F(
          a.alias,
          a.mediaUnique,
          t
        );
      } catch (i) {
        console.warn("Sample extraction during workflow creation failed:", i);
      }
    await l(this, n, h).call(this);
  } catch (e) {
    e instanceof Error && (this._error = e.message, console.error("Failed to create workflow:", e));
  }
};
E = function(e) {
  const t = encodeURIComponent(e.alias);
  window.history.pushState({}, "", `section/settings/workspace/updoc-workflow/edit/${t}`), window.dispatchEvent(new PopStateEvent("popstate"));
};
x = async function(e) {
  const t = await this.getContext(P);
  try {
    await t.open(this, I, {
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
    const s = await (await this.getContext(y)).getLatestToken(), r = await fetch(`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(e.alias)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${s}`
      }
    });
    if (!r.ok) {
      const u = await r.json();
      throw new Error(u.error || `Failed to delete workflow: ${r.statusText}`);
    }
    j(), await l(this, n, h).call(this);
  } catch (o) {
    this._error = o instanceof Error ? o.message : "Unknown error", console.error("Failed to delete workflow:", o);
  }
};
$ = function(e) {
  if (!e.length) return "—";
  const t = { pdf: "PDF", markdown: "Markdown", web: "Web", doc: "Word" };
  return e.map((o) => t[o] ?? o).join(", ");
};
A = function() {
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
					@click=${l(this, n, k)}></uui-button>
			</uui-box>
		`;
};
D = function() {
  return p`
			<div class="header">
				<uui-button
					look="primary"
					color="positive"
					label="Create Workflow"
					@click=${l(this, n, k)}></uui-button>
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
							<uui-table-row class="clickable-row" @click=${() => l(this, n, E).call(this, e)}>
								<uui-table-cell>${e.name}</uui-table-cell>
								<uui-table-cell class="alias-cell">${e.alias}</uui-table-cell>
								<uui-table-cell>${e.documentTypeName ?? e.documentTypeAlias}</uui-table-cell>
								<uui-table-cell>${e.blueprintName ?? e.blueprintId ?? "—"}</uui-table-cell>
								<uui-table-cell>${l(this, n, $).call(this, e.sourceTypes)}</uui-table-cell>
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
      t.stopPropagation(), l(this, n, x).call(this, e);
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
c.styles = [
  M,
  W`
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
  b()
], c.prototype, "_workflows", 2);
m([
  b()
], c.prototype, "_loading", 2);
m([
  b()
], c.prototype, "_error", 2);
c = m([
  O("up-doc-workflows-view")
], c);
const oe = c;
export {
  c as UpDocWorkflowsViewElement,
  oe as default
};
//# sourceMappingURL=up-doc-workflows-view.element-DulJ3lSI.js.map
