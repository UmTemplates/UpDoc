import { U as A } from "./up-doc-modal.token-DHoS03yR.js";
import { U as L } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { f as G } from "./workflow.service-DwTP3LNQ.js";
import { s as S, c as J, b as K, m as O } from "./transforms-DNUIGMem.js";
import { UmbEntityActionBase as _ } from "@umbraco-cms/backoffice/entity-action";
import { umbOpenModal as q } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as E } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT as M } from "@umbraco-cms/backoffice/auth";
import { UmbDocumentTypeStructureRepository as j } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as P } from "@umbraco-cms/backoffice/document-blueprint";
import { UmbDocumentItemRepository as z } from "@umbraco-cms/backoffice/document";
class se extends _ {
  #n = new j(this);
  #o = new P(this);
  #a = new z(this);
  constructor(r, i) {
    super(r, i);
  }
  async execute() {
    const r = await this.getContext(E), i = this.args.unique ?? null;
    try {
      let f = null;
      if (i) {
        const { data: a } = await this.#a.requestItems([i]);
        a?.length && (f = a[0].documentType.unique);
      }
      const n = (await this.#n.requestAllowedChildrenOf(
        f,
        i
      )).data;
      if (!n?.items?.length) {
        r.peek("danger", {
          data: { message: "No document types are allowed as children of this page." }
        });
        return;
      }
      const t = await (await this.getContext(M)).getLatestToken(), o = await G(t), l = new Set(o.blueprintIds), s = [];
      for (const a of n.items) {
        const { data: b } = await this.#o.requestItemsByDocumentType(a.unique);
        if (b?.length) {
          const h = b.filter((v) => l.has(v.unique));
          h.length && s.push({
            documentTypeUnique: a.unique,
            documentTypeName: a.name,
            documentTypeIcon: a.icon ?? null,
            blueprints: h.map((v) => ({
              blueprintUnique: v.unique,
              blueprintName: v.name
            }))
          });
        }
      }
      if (!s.length) {
        r.peek("warning", {
          data: { message: "No workflows are configured for the document types allowed here." }
        });
        return;
      }
      let p;
      try {
        p = await q(this, L, {
          data: { documentTypes: s }
        });
      } catch {
        return;
      }
      const { blueprintUnique: u, documentTypeUnique: c } = p, m = s.find((a) => a.documentTypeUnique === c), y = m?.blueprints.find((a) => a.blueprintUnique === u);
      let g;
      try {
        g = await q(this, A, {
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
      const { name: k, mediaUnique: I, sourceUrl: V, sectionLookup: N, stableKeyLookup: x, config: T } = g;
      if (!k || !T || !I && !V)
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
        const a = await U.json();
        console.error("Scaffold failed:", a), r.peek("danger", {
          data: { message: `Failed to scaffold from blueprint: ${a.title || "Unknown error"}` }
        });
        return;
      }
      const $ = await U.json(), D = $.values ? JSON.parse(JSON.stringify($.values)) : [], C = /* @__PURE__ */ new Set();
      for (const a of T.map.mappings) {
        if (a.enabled === !1) continue;
        let b = N[a.source];
        if (!b && a.sourceKey && x) {
          const h = x[a.sourceKey];
          if (h) {
            const v = a.source.split(".").pop();
            v && (b = N[`${h}.${v}`]);
          }
        }
        if (b)
          for (const h of a.destinations)
            this.#i(D, h, b, T, C);
      }
      this.#s(D, T, C);
      const R = {
        parent: i ? { id: i } : null,
        documentType: { id: c },
        template: $.template ? { id: $.template.id } : null,
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
        body: JSON.stringify(R)
      });
      if (!B.ok) {
        const a = await B.json();
        console.error("Document creation failed:", a), r.peek("danger", {
          data: { message: `Failed to create document: ${a.title || a.detail || "Unknown error"}` }
        });
        return;
      }
      const w = B.headers.get("Location")?.split("/").pop();
      if (w) {
        const a = await fetch(`/umbraco/management/api/v1/document/${w}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        });
        if (a.ok) {
          const b = await a.json(), h = await fetch(`/umbraco/management/api/v1/document/${w}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`
            },
            body: JSON.stringify(b)
          });
          h.ok || console.warn("Document save failed, but document was created:", await h.text());
        } else
          console.warn("Could not fetch document for save:", await a.text());
      }
      if (r.peek("positive", {
        data: { message: `Document "${k}" created successfully!` }
      }), w) {
        const a = `/umbraco/section/content/workspace/document/edit/${w}`;
        setTimeout(() => {
          window.location.href = a;
        }, 150);
      }
    } catch (f) {
      console.error("Error creating document:", f), r.peek("danger", {
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
  #i(r, i, f, d, n) {
    const e = f;
    if (i.contentTypeKey) {
      for (const o of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []])
        this.#t(r, o.alias, i.contentTypeKey, i.target, e, n);
      return;
    }
    if (i.blockKey) {
      for (const o of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []]) {
        const l = o.blocks.find((s) => s.key === i.blockKey);
        if (l) {
          const s = l.contentTypeKey;
          s ? this.#t(r, o.alias, s, i.target, e, n) : l.identifyBy && this.#e(r, o.alias, l.identifyBy, i.target, e, n);
          return;
        }
      }
      console.log(`Block ${i.blockKey} not found in destination config`);
      return;
    }
    const t = i.target.split(".");
    if (t.length === 1) {
      const o = t[0], l = r.find((s) => s.alias === o);
      if (l)
        if (n.has(o)) {
          const s = typeof l.value == "string" ? l.value : "";
          l.value = `${s} ${e}`;
        } else
          l.value = e;
      else
        r.push({ alias: o, value: e });
      n.add(o);
    } else if (t.length === 3) {
      const [o, l, s] = t, u = [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []].find((k) => k.key === o), c = u?.blocks.find((k) => k.key === l);
      if (!u || !c) return;
      const m = u.alias, y = c.properties?.find((k) => k.key === s)?.alias ?? s, g = c.identifyBy;
      if (!g) return;
      this.#e(r, m, g, y, e, n);
    }
  }
  /**
   * Applies a value to a property within a block grid.
   * Finds the block by searching for a property value match.
   * mappedFields tracks writes — first replaces blueprint default, subsequent concatenate.
   */
  #e(r, i, f, d, n, e) {
    const t = r.find((o) => o.alias === i);
    if (!(!t || !t.value))
      try {
        const o = typeof t.value == "string", l = o ? JSON.parse(t.value) : t.value, s = l.contentData;
        if (!s) return;
        for (const p of s) {
          const u = p.values?.find((c) => c.alias === f.property);
          if (u && typeof u.value == "string" && u.value.toLowerCase().includes(f.value.toLowerCase())) {
            const c = p.values?.find((m) => m.alias === d);
            if (c) {
              const m = `${p.key}:${d}`;
              if (e.has(m)) {
                const y = typeof c.value == "string" ? c.value : "";
                c.value = `${y}
${n}`;
              } else
                c.value = n;
              e.add(m);
            }
            break;
          }
        }
        t.value = o ? JSON.stringify(l) : l;
      } catch (o) {
        console.error(`Failed to apply block mapping to ${i}:`, o);
      }
  }
  /**
   * Applies a value to a block property by matching the block's contentTypeKey in contentData.
   * Umbraco regenerates block instance keys when creating documents from blueprints,
   * so we match by element type GUID (contentTypeKey) which is stable across all documents.
   */
  #t(r, i, f, d, n, e) {
    const t = r.find((o) => o.alias === i);
    if (!(!t || !t.value))
      try {
        const o = typeof t.value == "string", l = o ? JSON.parse(t.value) : t.value, s = l.contentData;
        if (!s) return;
        const p = s.find((c) => c.contentTypeKey === f);
        if (!p) return;
        const u = p.values?.find((c) => c.alias === d);
        if (u) {
          const c = `${p.key}:${d}`;
          if (e.has(c)) {
            const m = typeof u.value == "string" ? u.value : "";
            u.value = `${m}
${n}`;
          } else
            u.value = n;
          e.add(c);
        }
        t.value = o ? JSON.stringify(l) : l;
      } catch (o) {
        console.error(`Failed to apply block mapping by content type to ${i}:`, o);
      }
  }
  /**
   * Post-mapping pass: strips markdown from plain text fields and converts richText fields
   * from markdown to HTML + RTE value object.
   * Uses destination.json field types to auto-detect which fields need conversion.
   * Only converts fields that were written by our mappings (tracked by mappedFields).
   */
  #s(r, i, f) {
    for (const n of i.destination.fields)
      if ((n.type === "text" || n.type === "textArea") && f.has(n.alias)) {
        const e = r.find((t) => t.alias === n.alias);
        e && typeof e.value == "string" && (e.value = S(e.value));
      }
    for (const n of i.destination.fields)
      if (n.type === "number" && f.has(n.alias)) {
        const e = r.findIndex((t) => t.alias === n.alias);
        if (e !== -1 && typeof r[e].value == "string") {
          const t = J(r[e].value);
          t === null ? (console.warn(`UpDoc: could not coerce "${r[e].value}" to an integer for field "${n.alias}" — leaving property unset.`), r.splice(e, 1)) : r[e].value = t;
        }
      }
    for (const n of i.destination.fields)
      if (n.type === "richText" && f.has(n.alias)) {
        const e = r.find((t) => t.alias === n.alias);
        e && typeof e.value == "string" && (e.value = K(O(e.value)));
      }
    const d = [...i.destination.blockGrids ?? [], ...i.destination.blockLists ?? []];
    for (const n of d) {
      const e = r.find((s) => s.alias === n.alias);
      if (!e?.value) continue;
      const t = typeof e.value == "string", o = t ? JSON.parse(e.value) : e.value, l = o.contentData;
      if (l) {
        for (const s of l)
          for (const p of n.blocks)
            if (p.contentTypeKey ? s.contentTypeKey === p.contentTypeKey : s.key === p.key) {
              for (const c of p.properties ?? []) {
                const m = `${s.key}:${c.alias}`;
                if ((c.type === "text" || c.type === "textArea") && f.has(m)) {
                  const y = s.values?.find((g) => g.alias === c.alias);
                  y && typeof y.value == "string" && (y.value = S(y.value));
                }
                if (c.type === "richText" && f.has(m)) {
                  const y = s.values?.find((g) => g.alias === c.alias);
                  y && typeof y.value == "string" && (y.value = K(O(y.value)));
                }
              }
              break;
            }
        e.value = t ? JSON.stringify(o) : o;
      }
    }
  }
}
export {
  se as UpDocEntityAction,
  se as default
};
//# sourceMappingURL=up-doc-action-Brk9-Z3B.js.map
