import { U as R } from "./up-doc-modal.token-DHoS03yR.js";
import { U as A } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { f as L } from "./workflow.service-DcrxYgqr.js";
import { s as C, b as O, m as q } from "./transforms-BkZeboOX.js";
import { UmbEntityActionBase as G } from "@umbraco-cms/backoffice/entity-action";
import { umbOpenModal as S } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as J } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT as _ } from "@umbraco-cms/backoffice/auth";
import { UmbDocumentTypeStructureRepository as E } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as M } from "@umbraco-cms/backoffice/document-blueprint";
import { UmbDocumentItemRepository as j } from "@umbraco-cms/backoffice/document";
class ae extends G {
  #n = new E(this);
  #o = new M(this);
  #a = new j(this);
  constructor(l, a) {
    super(l, a);
  }
  async execute() {
    const l = await this.getContext(J), a = this.args.unique ?? null;
    try {
      let f = null;
      if (a) {
        const { data: s } = await this.#a.requestItems([a]);
        s?.length && (f = s[0].documentType.unique);
      }
      const r = (await this.#n.requestAllowedChildrenOf(
        f,
        a
      )).data;
      if (!r?.items?.length) {
        l.peek("danger", {
          data: { message: "No document types are allowed as children of this page." }
        });
        return;
      }
      const t = await (await this.getContext(_)).getLatestToken(), e = await L(t), c = new Set(e.blueprintIds), o = [];
      for (const s of r.items) {
        const { data: g } = await this.#o.requestItemsByDocumentType(s.unique);
        if (g?.length) {
          const b = g.filter((U) => c.has(U.unique));
          b.length && o.push({
            documentTypeUnique: s.unique,
            documentTypeName: s.name,
            documentTypeIcon: s.icon ?? null,
            blueprints: b.map((U) => ({
              blueprintUnique: U.unique,
              blueprintName: U.name
            }))
          });
        }
      }
      if (!o.length) {
        l.peek("warning", {
          data: { message: "No workflows are configured for the document types allowed here." }
        });
        return;
      }
      let p;
      try {
        p = await S(this, A, {
          data: { documentTypes: o }
        });
      } catch {
        return;
      }
      const { blueprintUnique: u, documentTypeUnique: i } = p, m = o.find((s) => s.documentTypeUnique === i), y = m?.blueprints.find((s) => s.blueprintUnique === u);
      let h;
      try {
        h = await S(this, R, {
          data: {
            unique: a,
            documentTypeName: m?.documentTypeName ?? "",
            blueprintName: y?.blueprintName ?? "",
            blueprintId: u
          }
        });
      } catch {
        return;
      }
      const { name: k, mediaUnique: x, sourceUrl: K, sectionLookup: I, config: w } = h;
      if (!k || !w || !x && !K)
        return;
      const $ = await fetch(
        `/umbraco/management/api/v1/document-blueprint/${u}/scaffold`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        }
      );
      if (!$.ok) {
        const s = await $.json();
        console.error("Scaffold failed:", s), l.peek("danger", {
          data: { message: `Failed to scaffold from blueprint: ${s.title || "Unknown error"}` }
        });
        return;
      }
      const T = await $.json(), D = T.values ? JSON.parse(JSON.stringify(T.values)) : [], N = /* @__PURE__ */ new Set();
      for (const s of w.map.mappings) {
        if (s.enabled === !1) continue;
        const g = I[s.source];
        if (g)
          for (const b of s.destinations)
            this.#i(D, b, g, w, N);
      }
      this.#s(D, w, N);
      const V = {
        parent: a ? { id: a } : null,
        documentType: { id: i },
        template: T.template ? { id: T.template.id } : null,
        values: D,
        variants: [
          {
            name: k,
            culture: null,
            segment: null
          }
        ]
      }, B = await fetch("/umbraco/management/api/v1/document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify(V)
      });
      if (!B.ok) {
        const s = await B.json();
        console.error("Document creation failed:", s), l.peek("danger", {
          data: { message: `Failed to create document: ${s.title || s.detail || "Unknown error"}` }
        });
        return;
      }
      const v = B.headers.get("Location")?.split("/").pop();
      if (v) {
        const s = await fetch(`/umbraco/management/api/v1/document/${v}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        });
        if (s.ok) {
          const g = await s.json(), b = await fetch(`/umbraco/management/api/v1/document/${v}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`
            },
            body: JSON.stringify(g)
          });
          b.ok || console.warn("Document save failed, but document was created:", await b.text());
        } else
          console.warn("Could not fetch document for save:", await s.text());
      }
      if (l.peek("positive", {
        data: { message: `Document "${k}" created successfully!` }
      }), v) {
        const s = `/umbraco/section/content/workspace/document/edit/${v}`;
        setTimeout(() => {
          window.location.href = s;
        }, 150);
      }
    } catch (f) {
      console.error("Error creating document:", f), l.peek("danger", {
        data: { message: "An unexpected error occurred while creating the document." }
      });
    }
  }
  /**
   * Applies a single destination mapping from the config.
   * Handles both simple field mappings and block grid mappings.
   * mappedFields tracks which fields have been written by our mappings —
   * first write replaces the blueprint default, subsequent writes concatenate.
   */
  #i(l, a, f, d, r) {
    const n = f;
    if (a.contentTypeKey) {
      for (const e of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []])
        this.#t(l, e.alias, a.contentTypeKey, a.target, n, r);
      return;
    }
    if (a.blockKey) {
      for (const e of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []]) {
        const c = e.blocks.find((o) => o.key === a.blockKey);
        if (c) {
          const o = c.contentTypeKey;
          o ? this.#t(l, e.alias, o, a.target, n, r) : c.identifyBy && this.#e(l, e.alias, c.identifyBy, a.target, n, r);
          return;
        }
      }
      console.log(`Block ${a.blockKey} not found in destination config`);
      return;
    }
    const t = a.target.split(".");
    if (t.length === 1) {
      const e = t[0], c = l.find((o) => o.alias === e);
      if (c)
        if (r.has(e)) {
          const o = typeof c.value == "string" ? c.value : "";
          c.value = `${o} ${n}`;
        } else
          c.value = n;
      else
        l.push({ alias: e, value: n });
      r.add(e);
    } else if (t.length === 3) {
      const [e, c, o] = t, u = [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []].find((k) => k.key === e), i = u?.blocks.find((k) => k.key === c);
      if (!u || !i) return;
      const m = u.alias, y = i.properties?.find((k) => k.key === o)?.alias ?? o, h = i.identifyBy;
      if (!h) return;
      this.#e(l, m, h, y, n, r);
    }
  }
  /**
   * Applies a value to a property within a block grid.
   * Finds the block by searching for a property value match.
   * mappedFields tracks writes — first replaces blueprint default, subsequent concatenate.
   */
  #e(l, a, f, d, r, n) {
    const t = l.find((e) => e.alias === a);
    if (!(!t || !t.value))
      try {
        const e = typeof t.value == "string", c = e ? JSON.parse(t.value) : t.value, o = c.contentData;
        if (!o) return;
        for (const p of o) {
          const u = p.values?.find((i) => i.alias === f.property);
          if (u && typeof u.value == "string" && u.value.toLowerCase().includes(f.value.toLowerCase())) {
            const i = p.values?.find((m) => m.alias === d);
            if (i) {
              const m = `${p.key}:${d}`;
              if (n.has(m)) {
                const y = typeof i.value == "string" ? i.value : "";
                i.value = `${y}
${r}`;
              } else
                i.value = r;
              n.add(m);
            }
            break;
          }
        }
        t.value = e ? JSON.stringify(c) : c;
      } catch (e) {
        console.error(`Failed to apply block mapping to ${a}:`, e);
      }
  }
  /**
   * Applies a value to a block property by matching the block's contentTypeKey in contentData.
   * Umbraco regenerates block instance keys when creating documents from blueprints,
   * so we match by element type GUID (contentTypeKey) which is stable across all documents.
   */
  #t(l, a, f, d, r, n) {
    const t = l.find((e) => e.alias === a);
    if (!(!t || !t.value))
      try {
        const e = typeof t.value == "string", c = e ? JSON.parse(t.value) : t.value, o = c.contentData;
        if (!o) return;
        const p = o.find((i) => i.contentTypeKey === f);
        if (!p) return;
        const u = p.values?.find((i) => i.alias === d);
        if (u) {
          const i = `${p.key}:${d}`;
          if (n.has(i)) {
            const m = typeof u.value == "string" ? u.value : "";
            u.value = `${m}
${r}`;
          } else
            u.value = r;
          n.add(i);
        }
        t.value = e ? JSON.stringify(c) : c;
      } catch (e) {
        console.error(`Failed to apply block mapping by content type to ${a}:`, e);
      }
  }
  /**
   * Post-mapping pass: strips markdown from plain text fields and converts richText fields
   * from markdown to HTML + RTE value object.
   * Uses destination.json field types to auto-detect which fields need conversion.
   * Only converts fields that were written by our mappings (tracked by mappedFields).
   */
  #s(l, a, f) {
    for (const r of a.destination.fields)
      if ((r.type === "text" || r.type === "textArea") && f.has(r.alias)) {
        const n = l.find((t) => t.alias === r.alias);
        n && typeof n.value == "string" && (n.value = C(n.value));
      }
    for (const r of a.destination.fields)
      if (r.type === "richText" && f.has(r.alias)) {
        const n = l.find((t) => t.alias === r.alias);
        n && typeof n.value == "string" && (n.value = O(q(n.value)));
      }
    const d = [...a.destination.blockGrids ?? [], ...a.destination.blockLists ?? []];
    for (const r of d) {
      const n = l.find((o) => o.alias === r.alias);
      if (!n?.value) continue;
      const t = typeof n.value == "string", e = t ? JSON.parse(n.value) : n.value, c = e.contentData;
      if (c) {
        for (const o of c)
          for (const p of r.blocks)
            if (p.contentTypeKey ? o.contentTypeKey === p.contentTypeKey : o.key === p.key) {
              for (const i of p.properties ?? []) {
                const m = `${o.key}:${i.alias}`;
                if ((i.type === "text" || i.type === "textArea") && f.has(m)) {
                  const y = o.values?.find((h) => h.alias === i.alias);
                  y && typeof y.value == "string" && (y.value = C(y.value));
                }
                if (i.type === "richText" && f.has(m)) {
                  const y = o.values?.find((h) => h.alias === i.alias);
                  y && typeof y.value == "string" && (y.value = O(q(y.value)));
                }
              }
              break;
            }
        n.value = t ? JSON.stringify(e) : e;
      }
    }
  }
}
export {
  ae as UpDocEntityAction,
  ae as default
};
//# sourceMappingURL=up-doc-action-B9aESrVg.js.map
