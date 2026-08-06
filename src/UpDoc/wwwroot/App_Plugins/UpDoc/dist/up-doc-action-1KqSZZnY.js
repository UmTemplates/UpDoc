import { U as D, c as B } from "./create-from-source-IxHUduRB.js";
import { U as C } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { f as x } from "./workflow.service-Coqu6zLj.js";
import { UmbEntityActionBase as O } from "@umbraco-cms/backoffice/entity-action";
import { umbOpenModal as g } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as _ } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT as A } from "@umbraco-cms/backoffice/auth";
import { UmbDocumentTypeStructureRepository as R } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as E } from "@umbraco-cms/backoffice/document-blueprint";
import { UmbDocumentItemRepository as M } from "@umbraco-cms/backoffice/document";
class G extends O {
  #e = new R(this);
  #t = new E(this);
  #o = new M(this);
  constructor(t, o) {
    super(t, o);
  }
  async execute() {
    const t = await this.getContext(_), o = this.args.unique ?? null;
    try {
      let r = null;
      if (o) {
        const { data: e } = await this.#o.requestItems([o]);
        e?.length && (r = e[0].documentType.unique);
      }
      const c = (await this.#e.requestAllowedChildrenOf(
        r,
        o
      )).data;
      if (!c?.items?.length) {
        t.peek("danger", {
          data: { message: "No document types are allowed as children of this page." }
        });
        return;
      }
      const m = await (await this.getContext(A)).getLatestToken(), U = await x(m), b = new Set(U.blueprintIds), i = [];
      for (const e of c.items) {
        const { data: y } = await this.#t.requestItemsByDocumentType(e.unique);
        if (y?.length) {
          const T = y.filter((a) => b.has(a.unique));
          T.length && i.push({
            documentTypeUnique: e.unique,
            documentTypeName: e.name,
            documentTypeIcon: e.icon ?? null,
            blueprints: T.map((a) => ({
              blueprintUnique: a.unique,
              blueprintName: a.name
            }))
          });
        }
      }
      if (!i.length) {
        t.peek("warning", {
          data: { message: "No workflows are configured for the document types allowed here." }
        });
        return;
      }
      let p;
      try {
        p = await g(this, C, {
          data: { documentTypes: i }
        });
      } catch {
        return;
      }
      const { blueprintUnique: s, documentTypeUnique: l } = p, d = i.find((e) => e.documentTypeUnique === l), q = d?.blueprints.find((e) => e.blueprintUnique === s);
      let f;
      try {
        f = await g(this, D, {
          data: {
            unique: o,
            documentTypeName: d?.documentTypeName ?? "",
            blueprintName: q?.blueprintName ?? "",
            blueprintId: s
          }
        });
      } catch {
        return;
      }
      const { name: u, mediaUnique: h, sourceUrl: I, sectionLookup: k, stableKeyLookup: N, config: w } = f;
      if (!u || !w || !h && !I)
        return;
      const n = await B({
        parentUnique: o,
        documentTypeUnique: l,
        blueprintUnique: s,
        name: u,
        mediaUnique: h,
        sectionLookup: k,
        stableKeyLookup: N,
        config: w,
        fetchFn: window.fetch.bind(window),
        token: m
      });
      if (!n.ok) {
        const e = n.stage === "scaffold" ? "Failed to scaffold from blueprint" : "Failed to create document";
        console.error(`${e}:`, n.message), t.peek("danger", {
          data: { message: `${e}: ${n.message}` }
        });
        return;
      }
      if (t.peek("positive", {
        data: { message: `Document "${u}" created successfully!` }
      }), n.documentId) {
        const e = `/umbraco/section/content/workspace/document/edit/${n.documentId}`;
        setTimeout(() => {
          window.location.href = e;
        }, 150);
      }
    } catch (r) {
      console.error("Error creating document:", r), t.peek("danger", {
        data: { message: "An unexpected error occurred while creating the document." }
      });
    }
  }
}
export {
  G as UpDocEntityAction,
  G as default
};
//# sourceMappingURL=up-doc-action-1KqSZZnY.js.map
