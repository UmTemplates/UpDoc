import { U as A } from "./up-doc-modal.token-DHoS03yR.js";
import { U as L } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { f as G } from "./workflow.service-DXCyU5bG.js";
import { s as K, b as O, m as q } from "./transforms-BkZeboOX.js";
import { UmbEntityActionBase as J } from "@umbraco-cms/backoffice/entity-action";
import { umbOpenModal as x } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as _ } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UmbDocumentTypeStructureRepository as M } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as j } from "@umbraco-cms/backoffice/document-blueprint";
import { UmbDocumentItemRepository as P } from "@umbraco-cms/backoffice/document";
class ie extends J {
  #n = new M(this);
  #o = new j(this);
  #a = new P(this);
  constructor(l, i) {
    super(l, i);
  }
  async execute() {
    const l = await this.getContext(_), i = this.args.unique ?? null;
    try {
      let f = null;
      if (i) {
        const { data: n } = await this.#a.requestItems([i]);
        n?.length && (f = n[0].documentType.unique);
      }
      const r = (await this.#n.requestAllowedChildrenOf(
        f,
        i
      )).data;
      if (!r?.items?.length) {
        l.peek("danger", {
          data: { message: "No document types are allowed as children of this page." }
        });
        return;
      }
      const t = await (await this.getContext(E)).getLatestToken(), e = await G(t), c = new Set(e.blueprintIds), a = [];
      for (const n of r.items) {
        const { data: b } = await this.#o.requestItemsByDocumentType(n.unique);
        if (b?.length) {
          const h = b.filter((v) => c.has(v.unique));
          h.length && a.push({
            documentTypeUnique: n.unique,
            documentTypeName: n.name,
            documentTypeIcon: n.icon ?? null,
            blueprints: h.map((v) => ({
              blueprintUnique: v.unique,
              blueprintName: v.name
            }))
          });
        }
      }
      if (!a.length) {
        l.peek("warning", {
          data: { message: "No workflows are configured for the document types allowed here." }
        });
        return;
      }
      let p;
      try {
        p = await x(this, L, {
          data: { documentTypes: a }
        });
      } catch {
        return;
      }
      const { blueprintUnique: u, documentTypeUnique: s } = p, m = a.find((n) => n.documentTypeUnique === s), y = m?.blueprints.find((n) => n.blueprintUnique === u);
      let k;
      try {
        k = await x(this, A, {
          data: {
            unique: i,
            documentTypeName: m?.documentTypeName ?? "",
            blueprintName: y?.blueprintName ?? "",
            blueprintId: u
          }
        });
      } catch {
        return;
      }
      const { name: g, mediaUnique: I, sourceUrl: V, sectionLookup: N, stableKeyLookup: C, config: T } = k;
      if (!g || !T || !I && !V)
        return;
      const U = await fetch(
        `/umbraco/management/api/v1/document-blueprint/${u}/scaffold`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        }
      );
      if (!U.ok) {
        const n = await U.json();
        console.error("Scaffold failed:", n), l.peek("danger", {
          data: { message: `Failed to scaffold from blueprint: ${n.title || "Unknown error"}` }
        });
        return;
      }
      const $ = await U.json(), D = $.values ? JSON.parse(JSON.stringify($.values)) : [], S = /* @__PURE__ */ new Set();
      for (const n of T.map.mappings) {
        if (n.enabled === !1) continue;
        let b = N[n.source];
        if (!b && n.sourceKey && C) {
          const h = C[n.sourceKey];
          if (h) {
            const v = n.source.split(".").pop();
            v && (b = N[`${h}.${v}`]);
          }
        }
        if (b)
          for (const h of n.destinations)
            this.#i(D, h, b, T, S);
      }
      this.#s(D, T, S);
      const R = {
        parent: i ? { id: i } : null,
        documentType: { id: s },
        template: $.template ? { id: $.template.id } : null,
        values: D,
        variants: [
          {
            name: g,
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
        body: JSON.stringify(R)
      });
      if (!B.ok) {
        const n = await B.json();
        console.error("Document creation failed:", n), l.peek("danger", {
          data: { message: `Failed to create document: ${n.title || n.detail || "Unknown error"}` }
        });
        return;
      }
      const w = B.headers.get("Location")?.split("/").pop();
      if (w) {
        const n = await fetch(`/umbraco/management/api/v1/document/${w}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        });
        if (n.ok) {
          const b = await n.json(), h = await fetch(`/umbraco/management/api/v1/document/${w}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`
            },
            body: JSON.stringify(b)
          });
          h.ok || console.warn("Document save failed, but document was created:", await h.text());
        } else
          console.warn("Could not fetch document for save:", await n.text());
      }
      if (l.peek("positive", {
        data: { message: `Document "${g}" created successfully!` }
      }), w) {
        const n = `/umbraco/section/content/workspace/document/edit/${w}`;
        setTimeout(() => {
          window.location.href = n;
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
  #i(l, i, f, d, r) {
    const o = f;
    if (i.contentTypeKey) {
      for (const e of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []])
        this.#t(l, e.alias, i.contentTypeKey, i.target, o, r);
      return;
    }
    if (i.blockKey) {
      for (const e of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []]) {
        const c = e.blocks.find((a) => a.key === i.blockKey);
        if (c) {
          const a = c.contentTypeKey;
          a ? this.#t(l, e.alias, a, i.target, o, r) : c.identifyBy && this.#e(l, e.alias, c.identifyBy, i.target, o, r);
          return;
        }
      }
      console.log(`Block ${i.blockKey} not found in destination config`);
      return;
    }
    const t = i.target.split(".");
    if (t.length === 1) {
      const e = t[0], c = l.find((a) => a.alias === e);
      if (c)
        if (r.has(e)) {
          const a = typeof c.value == "string" ? c.value : "";
          c.value = `${a} ${o}`;
        } else
          c.value = o;
      else
        l.push({ alias: e, value: o });
      r.add(e);
    } else if (t.length === 3) {
      const [e, c, a] = t, u = [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []].find((g) => g.key === e), s = u?.blocks.find((g) => g.key === c);
      if (!u || !s) return;
      const m = u.alias, y = s.properties?.find((g) => g.key === a)?.alias ?? a, k = s.identifyBy;
      if (!k) return;
      this.#e(l, m, k, y, o, r);
    }
  }
  /**
   * Applies a value to a property within a block grid.
   * Finds the block by searching for a property value match.
   * mappedFields tracks writes — first replaces blueprint default, subsequent concatenate.
   */
  #e(l, i, f, d, r, o) {
    const t = l.find((e) => e.alias === i);
    if (!(!t || !t.value))
      try {
        const e = typeof t.value == "string", c = e ? JSON.parse(t.value) : t.value, a = c.contentData;
        if (!a) return;
        for (const p of a) {
          const u = p.values?.find((s) => s.alias === f.property);
          if (u && typeof u.value == "string" && u.value.toLowerCase().includes(f.value.toLowerCase())) {
            const s = p.values?.find((m) => m.alias === d);
            if (s) {
              const m = `${p.key}:${d}`;
              if (o.has(m)) {
                const y = typeof s.value == "string" ? s.value : "";
                s.value = `${y}
${r}`;
              } else
                s.value = r;
              o.add(m);
            }
            break;
          }
        }
        t.value = e ? JSON.stringify(c) : c;
      } catch (e) {
        console.error(`Failed to apply block mapping to ${i}:`, e);
      }
  }
  /**
   * Applies a value to a block property by matching the block's contentTypeKey in contentData.
   * Umbraco regenerates block instance keys when creating documents from blueprints,
   * so we match by element type GUID (contentTypeKey) which is stable across all documents.
   */
  #t(l, i, f, d, r, o) {
    const t = l.find((e) => e.alias === i);
    if (!(!t || !t.value))
      try {
        const e = typeof t.value == "string", c = e ? JSON.parse(t.value) : t.value, a = c.contentData;
        if (!a) return;
        const p = a.find((s) => s.contentTypeKey === f);
        if (!p) return;
        const u = p.values?.find((s) => s.alias === d);
        if (u) {
          const s = `${p.key}:${d}`;
          if (o.has(s)) {
            const m = typeof u.value == "string" ? u.value : "";
            u.value = `${m}
${r}`;
          } else
            u.value = r;
          o.add(s);
        }
        t.value = e ? JSON.stringify(c) : c;
      } catch (e) {
        console.error(`Failed to apply block mapping by content type to ${i}:`, e);
      }
  }
  /**
   * Post-mapping pass: strips markdown from plain text fields and converts richText fields
   * from markdown to HTML + RTE value object.
   * Uses destination.json field types to auto-detect which fields need conversion.
   * Only converts fields that were written by our mappings (tracked by mappedFields).
   */
  #s(l, i, f) {
    for (const r of i.destination.fields)
      if ((r.type === "text" || r.type === "textArea") && f.has(r.alias)) {
        const o = l.find((t) => t.alias === r.alias);
        o && typeof o.value == "string" && (o.value = K(o.value));
      }
    for (const r of i.destination.fields)
      if (r.type === "richText" && f.has(r.alias)) {
        const o = l.find((t) => t.alias === r.alias);
        o && typeof o.value == "string" && (o.value = O(q(o.value)));
      }
    const d = [...i.destination.blockGrids ?? [], ...i.destination.blockLists ?? []];
    for (const r of d) {
      const o = l.find((a) => a.alias === r.alias);
      if (!o?.value) continue;
      const t = typeof o.value == "string", e = t ? JSON.parse(o.value) : o.value, c = e.contentData;
      if (c) {
        for (const a of c)
          for (const p of r.blocks)
            if (p.contentTypeKey ? a.contentTypeKey === p.contentTypeKey : a.key === p.key) {
              for (const s of p.properties ?? []) {
                const m = `${a.key}:${s.alias}`;
                if ((s.type === "text" || s.type === "textArea") && f.has(m)) {
                  const y = a.values?.find((k) => k.alias === s.alias);
                  y && typeof y.value == "string" && (y.value = K(y.value));
                }
                if (s.type === "richText" && f.has(m)) {
                  const y = a.values?.find((k) => k.alias === s.alias);
                  y && typeof y.value == "string" && (y.value = O(q(y.value)));
                }
              }
              break;
            }
        o.value = t ? JSON.stringify(e) : e;
      }
    }
  }
}
export {
  ie as UpDocEntityAction,
  ie as default
};
//# sourceMappingURL=up-doc-action-s4t10GJ5.js.map
