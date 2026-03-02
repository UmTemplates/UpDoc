import { UmbConditionBase as p } from "@umbraco-cms/backoffice/extension-registry";
import { UMB_AUTH_CONTEXT as l } from "@umbraco-cms/backoffice/auth";
import { UMB_ENTITY_CONTEXT as c } from "@umbraco-cms/backoffice/entity";
import { UmbDocumentTypeStructureRepository as h } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as f } from "@umbraco-cms/backoffice/document-blueprint";
import { UmbDocumentItemRepository as d } from "@umbraco-cms/backoffice/document";
import { f as y } from "./workflow.service-Cpncb616.js";
class D extends p {
  #i = new h(this);
  #o = new f(this);
  #r = new d(this);
  #t = null;
  #e = void 0;
  // undefined = not yet received
  constructor(o, e) {
    super(o, e), this.consumeContext(l, (t) => {
      this.#t = t, this.#s();
    }), this.consumeContext(c, (t) => {
      t && this.observe(t.unique, (s) => {
        this.#e = s ?? null, this.#s();
      });
    });
  }
  #s() {
    this.#t && this.#e !== void 0 && this.#n(this.#t, this.#e);
  }
  async #n(o, e) {
    try {
      const t = await o.getLatestToken(), s = await y(t);
      if (!s.blueprintIds.length) {
        this.permitted = !1;
        return;
      }
      const u = new Set(s.blueprintIds);
      let r = null;
      if (e) {
        const { data: i } = await this.#r.requestItems([e]);
        i?.length && (r = i[0].documentType.unique);
      }
      const n = (await this.#i.requestAllowedChildrenOf(
        r,
        e
      )).data;
      if (!n?.items?.length) {
        this.permitted = !1;
        return;
      }
      for (const i of n.items) {
        const { data: m } = await this.#o.requestItemsByDocumentType(i.unique);
        if (m?.some((a) => u.has(a.unique))) {
          this.permitted = !0;
          return;
        }
      }
      this.permitted = !1;
    } catch {
      this.permitted = !1;
    }
  }
}
export {
  D as UpDocHasWorkflowsCondition,
  D as default
};
//# sourceMappingURL=up-doc-has-workflows.condition-CzdYyly1.js.map
