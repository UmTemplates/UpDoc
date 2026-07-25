import { U as A } from "./up-doc-modal.token-DHoS03yR.js";
import { U as L } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { f as G } from "./workflow.service-DwTP3LNQ.js";
import { s as O, c as J, a as _, b as E, d as S, m as I } from "./transforms-qqnY8EQ-.js";
import { UmbEntityActionBase as M } from "@umbraco-cms/backoffice/entity-action";
import { umbOpenModal as K } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as j } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT as P } from "@umbraco-cms/backoffice/auth";
import { UmbDocumentTypeStructureRepository as z } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as H } from "@umbraco-cms/backoffice/document-blueprint";
import { UmbDocumentItemRepository as W } from "@umbraco-cms/backoffice/document";
class ce extends M {
  #n = new z(this);
  #o = new H(this);
  #a = new W(this);
  constructor(o, i) {
    super(o, i);
  }
  async execute() {
    const o = await this.getContext(j), i = this.args.unique ?? null;
    try {
      let u = null;
      if (i) {
        const { data: s } = await this.#a.requestItems([i]);
        s?.length && (u = s[0].documentType.unique);
      }
      const n = (await this.#n.requestAllowedChildrenOf(
        u,
        i
      )).data;
      if (!n?.items?.length) {
        o.peek("danger", {
          data: { message: "No document types are allowed as children of this page." }
        });
        return;
      }
      const t = await (await this.getContext(P)).getLatestToken(), a = await G(t), l = new Set(a.blueprintIds), r = [];
      for (const s of n.items) {
        const { data: b } = await this.#o.requestItemsByDocumentType(s.unique);
        if (b?.length) {
          const h = b.filter((w) => l.has(w.unique));
          h.length && r.push({
            documentTypeUnique: s.unique,
            documentTypeName: s.name,
            documentTypeIcon: s.icon ?? null,
            blueprints: h.map((w) => ({
              blueprintUnique: w.unique,
              blueprintName: w.name
            }))
          });
        }
      }
      if (!r.length) {
        o.peek("warning", {
          data: { message: "No workflows are configured for the document types allowed here." }
        });
        return;
      }
      let p;
      try {
        p = await K(this, L, {
          data: { documentTypes: r }
        });
      } catch {
        return;
      }
      const { blueprintUnique: f, documentTypeUnique: c } = p, m = r.find((s) => s.documentTypeUnique === c), y = m?.blueprints.find((s) => s.blueprintUnique === f);
      let g;
      try {
        g = await K(this, A, {
          data: {
            unique: i,
            documentTypeName: m?.documentTypeName ?? "",
            blueprintName: y?.blueprintName ?? "",
            blueprintId: f
          }
        });
      } catch {
        return;
      }
      const { name: k, mediaUnique: q, sourceUrl: V, sectionLookup: B, stableKeyLookup: N, config: T } = g;
      if (!k || !T || !q && !V)
        return;
      const U = await fetch(
        `/umbraco/management/api/v1/document-blueprint/${f}/scaffold`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        }
      );
      if (!U.ok) {
        const s = await U.json();
        console.error("Scaffold failed:", s), o.peek("danger", {
          data: { message: `Failed to scaffold from blueprint: ${s.title || "Unknown error"}` }
        });
        return;
      }
      const $ = await U.json(), D = $.values ? JSON.parse(JSON.stringify($.values)) : [], C = /* @__PURE__ */ new Set();
      for (const s of T.map.mappings) {
        if (s.enabled === !1) continue;
        let b = B[s.source];
        if (!b && s.sourceKey && N) {
          const h = N[s.sourceKey];
          if (h) {
            const w = s.source.split(".").pop();
            w && (b = B[`${h}.${w}`]);
          }
        }
        if (b)
          for (const h of s.destinations)
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
      }, x = await fetch("/umbraco/management/api/v1/document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify(R)
      });
      if (!x.ok) {
        const s = await x.json();
        console.error("Document creation failed:", s), o.peek("danger", {
          data: { message: `Failed to create document: ${s.title || s.detail || "Unknown error"}` }
        });
        return;
      }
      const v = x.headers.get("Location")?.split("/").pop();
      if (v) {
        const s = await fetch(`/umbraco/management/api/v1/document/${v}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        });
        if (s.ok) {
          const b = await s.json(), h = await fetch(`/umbraco/management/api/v1/document/${v}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`
            },
            body: JSON.stringify(b)
          });
          h.ok || console.warn("Document save failed, but document was created:", await h.text());
        } else
          console.warn("Could not fetch document for save:", await s.text());
      }
      if (o.peek("positive", {
        data: { message: `Document "${k}" created successfully!` }
      }), v) {
        const s = `/umbraco/section/content/workspace/document/edit/${v}`;
        setTimeout(() => {
          window.location.href = s;
        }, 150);
      }
    } catch (u) {
      console.error("Error creating document:", u), o.peek("danger", {
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
  #i(o, i, u, d, n) {
    const e = u;
    if (i.contentTypeKey) {
      for (const a of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []])
        this.#t(o, a.alias, i.contentTypeKey, i.target, e, n);
      return;
    }
    if (i.blockKey) {
      for (const a of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []]) {
        const l = a.blocks.find((r) => r.key === i.blockKey);
        if (l) {
          const r = l.contentTypeKey;
          r ? this.#t(o, a.alias, r, i.target, e, n) : l.identifyBy && this.#e(o, a.alias, l.identifyBy, i.target, e, n);
          return;
        }
      }
      console.log(`Block ${i.blockKey} not found in destination config`);
      return;
    }
    const t = i.target.split(".");
    if (t.length === 1) {
      const a = t[0], l = o.find((r) => r.alias === a);
      if (l)
        if (n.has(a)) {
          const r = typeof l.value == "string" ? l.value : "";
          l.value = `${r} ${e}`;
        } else
          l.value = e;
      else
        o.push({ alias: a, value: e });
      n.add(a);
    } else if (t.length === 3) {
      const [a, l, r] = t, f = [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []].find((k) => k.key === a), c = f?.blocks.find((k) => k.key === l);
      if (!f || !c) return;
      const m = f.alias, y = c.properties?.find((k) => k.key === r)?.alias ?? r, g = c.identifyBy;
      if (!g) return;
      this.#e(o, m, g, y, e, n);
    }
  }
  /**
   * Applies a value to a property within a block grid.
   * Finds the block by searching for a property value match.
   * mappedFields tracks writes — first replaces blueprint default, subsequent concatenate.
   */
  #e(o, i, u, d, n, e) {
    const t = o.find((a) => a.alias === i);
    if (!(!t || !t.value))
      try {
        const a = typeof t.value == "string", l = a ? JSON.parse(t.value) : t.value, r = l.contentData;
        if (!r) return;
        for (const p of r) {
          const f = p.values?.find((c) => c.alias === u.property);
          if (f && typeof f.value == "string" && f.value.toLowerCase().includes(u.value.toLowerCase())) {
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
        t.value = a ? JSON.stringify(l) : l;
      } catch (a) {
        console.error(`Failed to apply block mapping to ${i}:`, a);
      }
  }
  /**
   * Applies a value to a block property by matching the block's contentTypeKey in contentData.
   * Umbraco regenerates block instance keys when creating documents from blueprints,
   * so we match by element type GUID (contentTypeKey) which is stable across all documents.
   */
  #t(o, i, u, d, n, e) {
    const t = o.find((a) => a.alias === i);
    if (!(!t || !t.value))
      try {
        const a = typeof t.value == "string", l = a ? JSON.parse(t.value) : t.value, r = l.contentData;
        if (!r) return;
        const p = r.find((c) => c.contentTypeKey === u);
        if (!p) return;
        const f = p.values?.find((c) => c.alias === d);
        if (f) {
          const c = `${p.key}:${d}`;
          if (e.has(c)) {
            const m = typeof f.value == "string" ? f.value : "";
            f.value = `${m}
${n}`;
          } else
            f.value = n;
          e.add(c);
        }
        t.value = a ? JSON.stringify(l) : l;
      } catch (a) {
        console.error(`Failed to apply block mapping by content type to ${i}:`, a);
      }
  }
  /**
   * Post-mapping pass: strips markdown from plain text fields and converts richText fields
   * from markdown to HTML + RTE value object.
   * Uses destination.json field types to auto-detect which fields need conversion.
   * Only converts fields that were written by our mappings (tracked by mappedFields).
   */
  #s(o, i, u) {
    for (const n of i.destination.fields)
      if ((n.type === "text" || n.type === "textArea") && u.has(n.alias)) {
        const e = o.find((t) => t.alias === n.alias);
        e && typeof e.value == "string" && (e.value = O(e.value));
      }
    for (const n of i.destination.fields)
      if (n.type === "number" && u.has(n.alias)) {
        const e = o.findIndex((t) => t.alias === n.alias);
        if (e !== -1 && typeof o[e].value == "string") {
          const t = J(o[e].value);
          t === null ? (console.warn(`UpDoc: could not coerce "${o[e].value}" to an integer for field "${n.alias}" — leaving property unset.`), o.splice(e, 1)) : o[e].value = t;
        }
      }
    for (const n of i.destination.fields)
      if (n.type === "date" && u.has(n.alias)) {
        const e = o.findIndex((t) => t.alias === n.alias);
        if (e !== -1 && typeof o[e].value == "string") {
          const t = _(o[e].value);
          t === null ? (console.warn(`UpDoc: could not coerce "${o[e].value}" to a date for field "${n.alias}" — leaving property unset.`), o.splice(e, 1)) : o[e].value = E(t);
        }
      }
    for (const n of i.destination.fields)
      if (n.type === "richText" && u.has(n.alias)) {
        const e = o.find((t) => t.alias === n.alias);
        e && typeof e.value == "string" && (e.value = S(I(e.value)));
      }
    const d = [...i.destination.blockGrids ?? [], ...i.destination.blockLists ?? []];
    for (const n of d) {
      const e = o.find((r) => r.alias === n.alias);
      if (!e?.value) continue;
      const t = typeof e.value == "string", a = t ? JSON.parse(e.value) : e.value, l = a.contentData;
      if (l) {
        for (const r of l)
          for (const p of n.blocks)
            if (p.contentTypeKey ? r.contentTypeKey === p.contentTypeKey : r.key === p.key) {
              for (const c of p.properties ?? []) {
                const m = `${r.key}:${c.alias}`;
                if ((c.type === "text" || c.type === "textArea") && u.has(m)) {
                  const y = r.values?.find((g) => g.alias === c.alias);
                  y && typeof y.value == "string" && (y.value = O(y.value));
                }
                if (c.type === "richText" && u.has(m)) {
                  const y = r.values?.find((g) => g.alias === c.alias);
                  y && typeof y.value == "string" && (y.value = S(I(y.value)));
                }
              }
              break;
            }
        e.value = t ? JSON.stringify(a) : a;
      }
    }
  }
}
export {
  ce as UpDocEntityAction,
  ce as default
};
//# sourceMappingURL=up-doc-action-CiTLxquc.js.map
