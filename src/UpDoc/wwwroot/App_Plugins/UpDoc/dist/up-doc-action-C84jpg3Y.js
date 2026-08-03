import { U as A, a as L } from "./import-facts-DXyB0qw7.js";
import { U as _ } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { I as E } from "./workflow.types-QrurYwv2.js";
import { f as M } from "./workflow.service-rwnAqyw6.js";
import { s as N, c as G, a as J, b as j, d as S, m as K } from "./transforms-qqnY8EQ-.js";
import { UmbEntityActionBase as P } from "@umbraco-cms/backoffice/entity-action";
import { umbOpenModal as q } from "@umbraco-cms/backoffice/modal";
import { UMB_NOTIFICATION_CONTEXT as z } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT as H } from "@umbraco-cms/backoffice/auth";
import { UmbDocumentTypeStructureRepository as W } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as X } from "@umbraco-cms/backoffice/document-blueprint";
import { UmbDocumentItemRepository as Q } from "@umbraco-cms/backoffice/document";
class fe extends P {
  #n = new W(this);
  #o = new X(this);
  #a = new Q(this);
  constructor(o, s) {
    super(o, s);
  }
  async execute() {
    const o = await this.getContext(z), s = this.args.unique ?? null;
    try {
      let p = null;
      if (s) {
        const { data: a } = await this.#a.requestItems([s]);
        a?.length && (p = a[0].documentType.unique);
      }
      const n = (await this.#n.requestAllowedChildrenOf(
        p,
        s
      )).data;
      if (!n?.items?.length) {
        o.peek("danger", {
          data: { message: "No document types are allowed as children of this page." }
        });
        return;
      }
      const t = await (await this.getContext(H)).getLatestToken(), i = await M(t), c = new Set(i.blueprintIds), r = [];
      for (const a of n.items) {
        const { data: b } = await this.#o.requestItemsByDocumentType(a.unique);
        if (b?.length) {
          const h = b.filter((v) => c.has(v.unique));
          h.length && r.push({
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
      if (!r.length) {
        o.peek("warning", {
          data: { message: "No workflows are configured for the document types allowed here." }
        });
        return;
      }
      let u;
      try {
        u = await q(this, _, {
          data: { documentTypes: r }
        });
      } catch {
        return;
      }
      const { blueprintUnique: m, documentTypeUnique: l } = u, f = r.find((a) => a.documentTypeUnique === l), y = f?.blueprints.find((a) => a.blueprintUnique === m);
      let k;
      try {
        k = await q(this, A, {
          data: {
            unique: s,
            documentTypeName: f?.documentTypeName ?? "",
            blueprintName: y?.blueprintName ?? "",
            blueprintId: m
          }
        });
      } catch {
        return;
      }
      const { name: g, mediaUnique: D, sourceUrl: V, sectionLookup: C, stableKeyLookup: O, config: T } = k;
      if (!g || !T || !D && !V)
        return;
      const I = await fetch(
        `/umbraco/management/api/v1/document-blueprint/${m}/scaffold`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`
          }
        }
      );
      if (!I.ok) {
        const a = await I.json();
        console.error("Scaffold failed:", a), o.peek("danger", {
          data: { message: `Failed to scaffold from blueprint: ${a.title || "Unknown error"}` }
        });
        return;
      }
      const $ = await I.json(), U = $.values ? JSON.parse(JSON.stringify($.values)) : [], B = /* @__PURE__ */ new Set();
      for (const a of T.map.mappings) {
        if (a.enabled === !1) continue;
        if (a.source === E) {
          if (!D) continue;
          for (const h of a.destinations)
            L(U, h, D);
          continue;
        }
        let b = C[a.source];
        if (!b && a.sourceKey && O) {
          const h = O[a.sourceKey];
          if (h) {
            const v = a.source.split(".").pop();
            v && (b = C[`${h}.${v}`]);
          }
        }
        if (b)
          for (const h of a.destinations)
            this.#i(U, h, b, T, B);
      }
      this.#s(U, T, B);
      const R = {
        parent: s ? { id: s } : null,
        documentType: { id: l },
        template: $.template ? { id: $.template.id } : null,
        values: U,
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
        const a = await x.json();
        console.error("Document creation failed:", a), o.peek("danger", {
          data: { message: `Failed to create document: ${a.title || a.detail || "Unknown error"}` }
        });
        return;
      }
      const w = x.headers.get("Location")?.split("/").pop();
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
      if (o.peek("positive", {
        data: { message: `Document "${g}" created successfully!` }
      }), w) {
        const a = `/umbraco/section/content/workspace/document/edit/${w}`;
        setTimeout(() => {
          window.location.href = a;
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
  #i(o, s, p, d, n) {
    const e = p;
    if (s.contentTypeKey) {
      for (const i of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []])
        this.#t(o, i.alias, s.contentTypeKey, s.target, e, n);
      return;
    }
    if (s.blockKey) {
      for (const i of [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []]) {
        const c = i.blocks.find((r) => r.key === s.blockKey);
        if (c) {
          const r = c.contentTypeKey;
          r ? this.#t(o, i.alias, r, s.target, e, n) : c.identifyBy && this.#e(o, i.alias, c.identifyBy, s.target, e, n);
          return;
        }
      }
      console.log(`Block ${s.blockKey} not found in destination config`);
      return;
    }
    const t = s.target.split(".");
    if (t.length === 1) {
      const i = t[0], c = o.find((r) => r.alias === i);
      if (c)
        if (n.has(i)) {
          const r = typeof c.value == "string" ? c.value : "";
          c.value = `${r} ${e}`;
        } else
          c.value = e;
      else
        o.push({ alias: i, value: e });
      n.add(i);
    } else if (t.length === 3) {
      const [i, c, r] = t, m = [...d.destination.blockGrids ?? [], ...d.destination.blockLists ?? []].find((g) => g.key === i), l = m?.blocks.find((g) => g.key === c);
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
  #e(o, s, p, d, n, e) {
    const t = o.find((i) => i.alias === s);
    if (!(!t || !t.value))
      try {
        const i = typeof t.value == "string", c = i ? JSON.parse(t.value) : t.value, r = c.contentData;
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
        t.value = i ? JSON.stringify(c) : c;
      } catch (i) {
        console.error(`Failed to apply block mapping to ${s}:`, i);
      }
  }
  /**
   * Applies a value to a block property by matching the block's contentTypeKey in contentData.
   * Umbraco regenerates block instance keys when creating documents from blueprints,
   * so we match by element type GUID (contentTypeKey) which is stable across all documents.
   */
  #t(o, s, p, d, n, e) {
    const t = o.find((i) => i.alias === s);
    if (!(!t || !t.value))
      try {
        const i = typeof t.value == "string", c = i ? JSON.parse(t.value) : t.value, r = c.contentData;
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
        e.add(m), t.value = i ? JSON.stringify(c) : c;
      } catch (i) {
        console.error(`Failed to apply block mapping by content type to ${s}:`, i);
      }
  }
  /**
   * Post-mapping pass: strips markdown from plain text fields and converts richText fields
   * from markdown to HTML + RTE value object.
   * Uses destination.json field types to auto-detect which fields need conversion.
   * Only converts fields that were written by our mappings (tracked by mappedFields).
   */
  #s(o, s, p) {
    for (const n of s.destination.fields)
      if ((n.type === "text" || n.type === "textArea") && p.has(n.alias)) {
        const e = o.find((t) => t.alias === n.alias);
        e && typeof e.value == "string" && (e.value = N(e.value));
      }
    for (const n of s.destination.fields)
      if (n.type === "number" && p.has(n.alias)) {
        const e = o.findIndex((t) => t.alias === n.alias);
        if (e !== -1 && typeof o[e].value == "string") {
          const t = G(o[e].value);
          t === null ? (console.warn(`UpDoc: could not coerce "${o[e].value}" to an integer for field "${n.alias}" — leaving property unset.`), o.splice(e, 1)) : o[e].value = t;
        }
      }
    for (const n of s.destination.fields)
      if (n.type === "date" && p.has(n.alias)) {
        const e = o.findIndex((t) => t.alias === n.alias);
        if (e !== -1 && typeof o[e].value == "string") {
          const t = J(o[e].value);
          t === null ? (console.warn(`UpDoc: could not coerce "${o[e].value}" to a date for field "${n.alias}" — leaving property unset.`), o.splice(e, 1)) : o[e].value = j(t);
        }
      }
    for (const n of s.destination.fields)
      if (n.type === "richText" && p.has(n.alias)) {
        const e = o.find((t) => t.alias === n.alias);
        e && typeof e.value == "string" && (e.value = S(K(e.value)));
      }
    const d = [...s.destination.blockGrids ?? [], ...s.destination.blockLists ?? []];
    for (const n of d) {
      const e = o.find((r) => r.alias === n.alias);
      if (!e?.value) continue;
      const t = typeof e.value == "string", i = t ? JSON.parse(e.value) : e.value, c = i.contentData;
      if (c) {
        for (const r of c)
          for (const u of n.blocks)
            if (u.contentTypeKey ? r.contentTypeKey === u.contentTypeKey : r.key === u.key) {
              for (const l of u.properties ?? []) {
                const f = `${r.key}:${l.alias}`;
                if ((l.type === "text" || l.type === "textArea") && p.has(f)) {
                  const y = r.values?.find((k) => k.alias === l.alias);
                  y && typeof y.value == "string" && (y.value = N(y.value));
                }
                if (l.type === "richText" && p.has(f)) {
                  const y = r.values?.find((k) => k.alias === l.alias);
                  y && typeof y.value == "string" && (y.value = S(K(y.value)));
                }
              }
              break;
            }
        e.value = t ? JSON.stringify(i) : i;
      }
    }
  }
}
export {
  fe as UpDocEntityAction,
  fe as default
};
//# sourceMappingURL=up-doc-action-C84jpg3Y.js.map
