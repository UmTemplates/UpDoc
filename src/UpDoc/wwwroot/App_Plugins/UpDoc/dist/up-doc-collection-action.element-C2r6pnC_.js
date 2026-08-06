import { U as $ } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { U as K } from "./up-doc-modal.token-DHoS03yR.js";
import { f as B } from "./workflow.service-Coqu6zLj.js";
import { c as X } from "./create-from-source-Lr3UzQBc.js";
import { html as N, css as G, state as C, customElement as H } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as V } from "@umbraco-cms/backoffice/lit-element";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as z } from "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as W } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as J } from "@umbraco-cms/backoffice/notification";
import { umbOpenModal as A } from "@umbraco-cms/backoffice/modal";
import { UmbDocumentTypeStructureRepository as Q } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as Y } from "@umbraco-cms/backoffice/document-blueprint";
var Z = Object.defineProperty, j = Object.getOwnPropertyDescriptor, x = (e) => {
  throw TypeError(e);
}, f = (e, t, o, r) => {
  for (var n = r > 1 ? void 0 : r ? j(t, o) : t, a = e.length - 1, s; a >= 0; a--)
    (s = e[a]) && (n = (r ? s(t, o, n) : s(n)) || n);
  return r && n && Z(t, o, n), n;
}, M = (e, t, o) => t.has(e) || x("Cannot " + o), d = (e, t, o) => (M(e, t, "read from private field"), o ? o.call(e) : t.get(e)), T = (e, t, o) => t.has(e) ? x("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), U = (e, t, o) => (M(e, t, "access private method"), o), h, w, p, q, S;
let c = class extends V {
  constructor() {
    super(), T(this, p), T(this, h, new Q(this)), T(this, w, new Y(this)), this._hasWorkflows = !1, this.consumeContext(z, (e) => {
      this.observe(e?.unique, (t) => {
        this._documentUnique = t, U(this, p, q).call(this);
      }), this.observe(e?.contentTypeUnique, (t) => {
        this._documentTypeUnique = t, U(this, p, q).call(this);
      });
    });
  }
  render() {
    return this._hasWorkflows ? N`
			<uui-button
				color="default"
				look="outline"
				label="Create from Source"
				@click=${U(this, p, S)}>
				Create from Source
			</uui-button>
		` : N``;
  }
};
h = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakSet();
q = async function() {
  if (this._documentTypeUnique)
    try {
      const t = await (await this.getContext(W)).getLatestToken(), o = await B(t), r = new Set(o.blueprintIds), { data: n } = await d(this, h).requestAllowedChildrenOf(
        this._documentTypeUnique,
        this._documentUnique || null
      );
      if (!n?.items?.length) return;
      for (const a of n.items) {
        const { data: s } = await d(this, w).requestItemsByDocumentType(a.unique);
        if (s?.some((u) => r.has(u.unique))) {
          this._hasWorkflows = !0;
          return;
        }
      }
    } catch {
    }
};
S = async function() {
  if (!this._documentTypeUnique) return;
  const e = await this.getContext(J), o = await (await this.getContext(W)).getLatestToken(), r = this._documentUnique ?? null;
  try {
    const n = await B(o), a = new Set(n.blueprintIds), { data: s } = await d(this, h).requestAllowedChildrenOf(
      this._documentTypeUnique,
      r
    );
    if (!s?.items?.length) {
      e.peek("danger", {
        data: { message: "No document types are allowed as children of this page." }
      });
      return;
    }
    const u = [];
    for (const i of s.items) {
      const { data: D } = await d(this, w).requestItemsByDocumentType(i.unique);
      if (D?.length) {
        const E = D.filter((m) => a.has(m.unique));
        E.length && u.push({
          documentTypeUnique: i.unique,
          documentTypeName: i.name,
          documentTypeIcon: i.icon ?? null,
          blueprints: E.map((m) => ({
            blueprintUnique: m.unique,
            blueprintName: m.name
          }))
        });
      }
    }
    if (!u.length) {
      e.peek("warning", {
        data: { message: "No workflows are configured for the document types allowed here." }
      });
      return;
    }
    let g;
    try {
      g = await A(this, $, {
        data: { documentTypes: u }
      });
    } catch {
      return;
    }
    const { blueprintUnique: _, documentTypeUnique: k } = g, v = u.find((i) => i.documentTypeUnique === k), P = v?.blueprints.find((i) => i.blueprintUnique === _);
    let b;
    try {
      b = await A(this, K, {
        data: {
          unique: r,
          documentTypeName: v?.documentTypeName ?? "",
          blueprintName: P?.blueprintName ?? "",
          blueprintId: _
        }
      });
    } catch {
      return;
    }
    const { name: y, mediaUnique: O, sourceUrl: L, sectionLookup: R, stableKeyLookup: F, config: I } = b;
    if (!y || !I || !O && !L) return;
    const l = await X({
      parentUnique: r,
      documentTypeUnique: k,
      blueprintUnique: _,
      name: y,
      mediaUnique: O,
      sectionLookup: R,
      stableKeyLookup: F,
      config: I,
      fetchFn: window.fetch.bind(window),
      token: o
    });
    if (!l.ok) {
      const i = l.stage === "scaffold" ? "Failed to scaffold from blueprint" : "Failed to create document";
      e.peek("danger", {
        data: { message: `${i}: ${l.message}` }
      });
      return;
    }
    if (e.peek("positive", {
      data: { message: `Document "${y}" created successfully!` }
    }), l.documentId) {
      const i = `/umbraco/section/content/workspace/document/edit/${l.documentId}`;
      setTimeout(() => {
        window.location.href = i;
      }, 150);
    }
  } catch (n) {
    console.error("Error creating document:", n), e.peek("danger", {
      data: { message: "An unexpected error occurred while creating the document." }
    });
  }
};
c.styles = [
  G`
			:host {
				display: contents;
			}
		`
];
f([
  C()
], c.prototype, "_documentUnique", 2);
f([
  C()
], c.prototype, "_documentTypeUnique", 2);
f([
  C()
], c.prototype, "_hasWorkflows", 2);
c = f([
  H("up-doc-collection-action")
], c);
const me = c;
export {
  c as UpDocCollectionActionElement,
  me as default
};
//# sourceMappingURL=up-doc-collection-action.element-C2r6pnC_.js.map
