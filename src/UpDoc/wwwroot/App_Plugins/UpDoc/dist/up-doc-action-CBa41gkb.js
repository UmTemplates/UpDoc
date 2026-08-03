import { U as A } from "./up-doc-modal.token-DHoS03yR.js";
import { U as L } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { f as G } from "./workflow.service-rwnAqyw6.js";
import { s as O, c as J, a as _, b as E, d as S, m as I } from "./transforms-qqnY8EQ-.js";
import { UmbEntityActionBase as M } from "@umbraco-cms/backoffice/entity-action";
import { umbOpenModal as K } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as j } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT as z } from "@umbraco-cms/backoffice/auth";
import { UmbDocumentTypeStructureRepository as H } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as P } from "@umbraco-cms/backoffice/document-blueprint";
import { UmbDocumentItemRepository as W } from "@umbraco-cms/backoffice/document";
class ce extends M {
  #n = new H(this);
  #o = new P(this);
  #a = new W(this);
  constructor(o, i) {
    super(o, i);
  }
  async execute() {
    const o = await this.getContext(j), i = this.args.unique ?? null;
    try {
      let p = null;
      if (i) {
        const { data: s } = await this.#a.requestItems([i]);
        s?.length && (p = s[0].documentType.unique);
      }
      const n = (await this.#n.requestAllowedChildrenOf(
        p,
        i
      )).data;
      if (!n?.items?.length) {
        o.peek("danger", {
          data: { message: "No document types are allowed as children of this page." }
        });
        return;
      }
      const t = await (await this.getContext(z)).getLatestToken(), a = await G(t), c = new Set(a.blueprintIds), r = [];
      for (const s of n.items) {
        const { data: b } = await this.#o.requestItemsByDocumentType(s.unique);
        if (b?.length) {
          const h = b.filter((v) => c.has(v.unique));
          h.length && r.push({
            documentTypeUnique: s.unique,
            documentTypeName: s.name,
            documentTypeIcon: s.icon ?? null,
            blueprints: h.map((v) => ({
              blueprintUnique: v.unique,
              blueprintName: v.name
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
      let u;
      try {
        u = await K(this, L, {
          data: { documentTypes: r }
        });
      } catch {
        return;
      }
      const { blueprintUnique: m, documentTypeUnique: l } = u, f = r.find((s) => s.documentTypeUnique === l), y = f?.blueprints.find((s) => s.blueprintUnique === m);
      let k;
      try {
        k = await K(this, A, {
          data: {
            unique: i,
            documentTypeName: f?.documentTypeName ?? "",
            blueprintName: y?.blueprintName ?? "",
            blueprintId: m
          }
        });
      } catch {
        return;
      }
      const { name: g, mediaUnique: q, sourceUrl: V, sectionLookup: B, stableKeyLookup: N, config: T } = k;
      if (!g || !T || !q && !V)
        return;
      const U = await fetch(
        `/umbraco/management/api/v1/document-blueprint/${m}/scaffold`,
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
            const v = s.source.split(".").pop();
            v && (b = B[`${h}.${v}`]);
          }
        }
        if (b)
          for (const h of s.destinations)
            this.#i(D, h, b, T, C);
      }
      this.#s(D, T, C);
      const R = {
        parent: i ? { id: i } : null,
        documentType: { id: l },
        template: $.template ? { id: $.template.id } : null,
        values: D,
        variants: [
          {
            name: g,
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
      const w = x.headers.get("Location")?.split("/").pop();
      if (w) {
        const s = await fetch(`/umbraco/management/api/v1/document/${w}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        });
        if (s.ok) {
          const b = await s.json(), h = await fetch(`/umbraco/management/api/v1/document/${w}`, {
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
        data: { message: `Document "${g}" created successfully!` }
      }), w) {
        const s = `/umbraco/section/content/workspace/document/edit/${w}`;
        setTimeout(() => {
          window.location.href = s;
        }, 150);
      }
    } catch (p) {
      console.error("Error creating document:", p), o.peek("danger", {
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
  #i(o, i, p, d, n) {
    const e = p;
    if (i.contentTypeKey) {
      for (const a of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []])
        this.#t(o, a.alias, i.contentTypeKey, i.target, e, n);
      return;
    }
    if (i.blockKey) {
      for (const a of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []]) {
        const c = a.blocks.find((r) => r.key === i.blockKey);
        if (c) {
          const r = c.contentTypeKey;
          r ? this.#t(o, a.alias, r, i.target, e, n) : c.identifyBy && this.#e(o, a.alias, c.identifyBy, i.target, e, n);
          return;
        }
      }
      console.log(`Block ${i.blockKey} not found in destination config`);
      return;
    }
    const t = i.target.split(".");
    if (t.length === 1) {
      const a = t[0], c = o.find((r) => r.alias === a);
      if (c)
        if (n.has(a)) {
          const r = typeof c.value == "string" ? c.value : "";
          c.value = `${r} ${e}`;
        } else
          c.value = e;
      else
        o.push({ alias: a, value: e });
      n.add(a);
    } else if (t.length === 3) {
      const [a, c, r] = t, m = [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []].find((g) => g.key === a), l = m?.blocks.find((g) => g.key === c);
      if (!m || !l) return;
      const f = m.alias, y = l.properties?.find((g) => g.key === r)?.alias ?? r, k = l.identifyBy;
      if (!k) return;
      this.#e(o, f, k, y, e, n);
    }
  }
  /**
   * Applies a value to a property within a block grid.
   * Finds the block by searching for a property value match.
   * mappedFields tracks writes — first replaces blueprint default, subsequent concatenate.
   */
  #e(o, i, p, d, n, e) {
    const t = o.find((a) => a.alias === i);
    if (!(!t || !t.value))
      try {
        const a = typeof t.value == "string", c = a ? JSON.parse(t.value) : t.value, r = c.contentData;
        if (!r) return;
        for (const u of r) {
          const m = u.values?.find((l) => l.alias === p.property);
          if (m && typeof m.value == "string" && m.value.toLowerCase().includes(p.value.toLowerCase())) {
            const l = `${u.key}:${d}`, f = u.values?.find((y) => y.alias === d);
            if (f)
              if (e.has(l)) {
                const y = typeof f.value == "string" ? f.value : "";
                f.value = `${y}
${n}`;
              } else
                f.value = n;
            else
              u.values = u.values ?? [], u.values.push({ alias: d, value: n });
            e.add(l);
            break;
          }
        }
        t.value = a ? JSON.stringify(c) : c;
      } catch (a) {
        console.error(`Failed to apply block mapping to ${i}:`, a);
      }
  }
  /**
   * Applies a value to a block property by matching the block's contentTypeKey in contentData.
   * Umbraco regenerates block instance keys when creating documents from blueprints,
   * so we match by element type GUID (contentTypeKey) which is stable across all documents.
   */
  #t(o, i, p, d, n, e) {
    const t = o.find((a) => a.alias === i);
    if (!(!t || !t.value))
      try {
        const a = typeof t.value == "string", c = a ? JSON.parse(t.value) : t.value, r = c.contentData;
        if (!r) return;
        const u = r.find((f) => f.contentTypeKey === p);
        if (!u) return;
        const m = `${u.key}:${d}`, l = u.values?.find((f) => f.alias === d);
        if (l)
          if (e.has(m)) {
            const f = typeof l.value == "string" ? l.value : "";
            l.value = `${f}
${n}`;
          } else
            l.value = n;
        else
          u.values = u.values ?? [], u.values.push({ alias: d, value: n });
        e.add(m), t.value = a ? JSON.stringify(c) : c;
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
  #s(o, i, p) {
    for (const n of i.destination.fields)
      if ((n.type === "text" || n.type === "textArea") && p.has(n.alias)) {
        const e = o.find((t) => t.alias === n.alias);
        e && typeof e.value == "string" && (e.value = O(e.value));
      }
    for (const n of i.destination.fields)
      if (n.type === "number" && p.has(n.alias)) {
        const e = o.findIndex((t) => t.alias === n.alias);
        if (e !== -1 && typeof o[e].value == "string") {
          const t = J(o[e].value);
          t === null ? (console.warn(`UpDoc: could not coerce "${o[e].value}" to an integer for field "${n.alias}" — leaving property unset.`), o.splice(e, 1)) : o[e].value = t;
        }
      }
    for (const n of i.destination.fields)
      if (n.type === "date" && p.has(n.alias)) {
        const e = o.findIndex((t) => t.alias === n.alias);
        if (e !== -1 && typeof o[e].value == "string") {
          const t = _(o[e].value);
          t === null ? (console.warn(`UpDoc: could not coerce "${o[e].value}" to a date for field "${n.alias}" — leaving property unset.`), o.splice(e, 1)) : o[e].value = E(t);
        }
      }
    for (const n of i.destination.fields)
      if (n.type === "richText" && p.has(n.alias)) {
        const e = o.find((t) => t.alias === n.alias);
        e && typeof e.value == "string" && (e.value = S(I(e.value)));
      }
    const d = [...i.destination.blockGrids ?? [], ...i.destination.blockLists ?? []];
    for (const n of d) {
      const e = o.find((r) => r.alias === n.alias);
      if (!e?.value) continue;
      const t = typeof e.value == "string", a = t ? JSON.parse(e.value) : e.value, c = a.contentData;
      if (c) {
        for (const r of c)
          for (const u of n.blocks)
            if (u.contentTypeKey ? r.contentTypeKey === u.contentTypeKey : r.key === u.key) {
              for (const l of u.properties ?? []) {
                const f = `${r.key}:${l.alias}`;
                if ((l.type === "text" || l.type === "textArea") && p.has(f)) {
                  const y = r.values?.find((k) => k.alias === l.alias);
                  y && typeof y.value == "string" && (y.value = O(y.value));
                }
                if (l.type === "richText" && p.has(f)) {
                  const y = r.values?.find((k) => k.alias === l.alias);
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
//# sourceMappingURL=up-doc-action-CBa41gkb.js.map
