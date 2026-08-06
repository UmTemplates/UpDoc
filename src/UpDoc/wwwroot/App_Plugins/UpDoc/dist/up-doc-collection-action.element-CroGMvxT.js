import { U as te } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { U as ne, a as oe } from "./import-facts-DXyB0qw7.js";
import { I as ae } from "./workflow.types-QrurYwv2.js";
import { f as z } from "./workflow.service-Coqu6zLj.js";
import { s as W, c as ie, a as se, b as re, d as G, m as J } from "./transforms-qqnY8EQ-.js";
import { html as P, css as ce, state as V, customElement as le } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ue } from "@umbraco-cms/backoffice/lit-element";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as fe } from "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as H } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as pe } from "@umbraco-cms/backoffice/notification";
import { umbOpenModal as j } from "@umbraco-cms/backoffice/modal";
import { UmbDocumentTypeStructureRepository as de } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as ye } from "@umbraco-cms/backoffice/document-blueprint";
var he = Object.defineProperty, me = Object.getOwnPropertyDescriptor, X = (e) => {
  throw TypeError(e);
}, D = (e, o, s, c) => {
  for (var t = c > 1 ? void 0 : c ? me(o, s) : o, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (t = (c ? a(o, s, t) : a(t)) || t);
  return c && t && he(o, s, t), t;
}, Q = (e, o, s) => o.has(e) || X("Cannot " + s), O = (e, o, s) => (Q(e, o, "read from private field"), s ? s.call(e) : o.get(e)), N = (e, o, s) => o.has(e) ? X("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(e) : o.set(e, s), T = (e, o, s) => (Q(e, o, "access private method"), s), S, B, m, K, Y, Z, A, E, F;
let _ = class extends ue {
  constructor() {
    super(), N(this, m), N(this, S, new de(this)), N(this, B, new ye(this)), this._hasWorkflows = !1, this.consumeContext(fe, (e) => {
      this.observe(e?.unique, (o) => {
        this._documentUnique = o, T(this, m, K).call(this);
      }), this.observe(e?.contentTypeUnique, (o) => {
        this._documentTypeUnique = o, T(this, m, K).call(this);
      });
    });
  }
  render() {
    return this._hasWorkflows ? P`
			<uui-button
				color="default"
				look="outline"
				label="Create from Source"
				@click=${T(this, m, Y)}>
				Create from Source
			</uui-button>
		` : P``;
  }
};
S = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
K = async function() {
  if (this._documentTypeUnique)
    try {
      const o = await (await this.getContext(H)).getLatestToken(), s = await z(o), c = new Set(s.blueprintIds), { data: t } = await O(this, S).requestAllowedChildrenOf(
        this._documentTypeUnique,
        this._documentUnique || null
      );
      if (!t?.items?.length) return;
      for (const n of t.items) {
        const { data: a } = await O(this, B).requestItemsByDocumentType(n.unique);
        if (a?.some((i) => c.has(i.unique))) {
          this._hasWorkflows = !0;
          return;
        }
      }
    } catch {
    }
};
Y = async function() {
  if (!this._documentTypeUnique) return;
  const e = await this.getContext(pe), s = await (await this.getContext(H)).getLatestToken(), c = this._documentUnique ?? null;
  try {
    const t = await z(s), n = new Set(t.blueprintIds), { data: a } = await O(this, S).requestAllowedChildrenOf(
      this._documentTypeUnique,
      c
    );
    if (!a?.items?.length) {
      e.peek("danger", {
        data: { message: "No document types are allowed as children of this page." }
      });
      return;
    }
    const i = [];
    for (const l of a.items) {
      const { data: k } = await O(this, B).requestItemsByDocumentType(l.unique);
      if (k?.length) {
        const w = k.filter((b) => n.has(b.unique));
        w.length && i.push({
          documentTypeUnique: l.unique,
          documentTypeName: l.name,
          documentTypeIcon: l.icon ?? null,
          blueprints: w.map((b) => ({
            blueprintUnique: b.unique,
            blueprintName: b.name
          }))
        });
      }
    }
    if (!i.length) {
      e.peek("warning", {
        data: { message: "No workflows are configured for the document types allowed here." }
      });
      return;
    }
    let u;
    try {
      u = await j(this, te, {
        data: { documentTypes: i }
      });
    } catch {
      return;
    }
    const { blueprintUnique: r, documentTypeUnique: p } = u, f = i.find((l) => l.documentTypeUnique === p)?.blueprints.find((l) => l.blueprintUnique === r);
    let d;
    try {
      d = await j(this, ne, {
        data: {
          unique: c,
          blueprintName: f?.blueprintName ?? "",
          blueprintId: r
        }
      });
    } catch {
      return;
    }
    const { name: y, mediaUnique: v, sourceUrl: g, sectionLookup: L, stableKeyLookup: M, config: C } = d;
    if (!y || !C || !v && !g) return;
    const x = await fetch(
      `/umbraco/management/api/v1/document-blueprint/${r}/scaffold`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${s}`
        }
      }
    );
    if (!x.ok) {
      const l = await x.json();
      e.peek("danger", {
        data: { message: `Failed to scaffold from blueprint: ${l.title || "Unknown error"}` }
      });
      return;
    }
    const $ = await x.json(), q = $.values ? JSON.parse(JSON.stringify($.values)) : [], R = /* @__PURE__ */ new Set();
    for (const l of C.map.mappings) {
      if (l.enabled === !1) continue;
      if (l.source === ae) {
        if (!v) continue;
        for (const w of l.destinations)
          oe(q, w, v);
        continue;
      }
      let k = L[l.source];
      if (!k && l.sourceKey && M) {
        const w = M[l.sourceKey];
        if (w) {
          const b = l.source.split(".").pop();
          b && (k = L[`${w}.${b}`]);
        }
      }
      if (k)
        for (const w of l.destinations)
          T(this, m, Z).call(this, q, w, k, C, R);
    }
    T(this, m, F).call(this, q, C, R);
    const ee = {
      parent: c ? { id: c } : null,
      documentType: { id: p },
      template: $.template ? { id: $.template.id } : null,
      values: q,
      variants: [{ name: y, culture: null, segment: null }]
    }, I = await fetch("/umbraco/management/api/v1/document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s}`
      },
      body: JSON.stringify(ee)
    });
    if (!I.ok) {
      const l = await I.json();
      e.peek("danger", {
        data: { message: `Failed to create document: ${l.title || l.detail || "Unknown error"}` }
      });
      return;
    }
    const U = I.headers.get("Location")?.split("/").pop();
    if (U) {
      const l = await fetch(`/umbraco/management/api/v1/document/${U}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s}` }
      });
      if (l.ok) {
        const k = await l.json();
        await fetch(`/umbraco/management/api/v1/document/${U}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${s}` },
          body: JSON.stringify(k)
        });
      }
    }
    if (e.peek("positive", {
      data: { message: `Document "${y}" created successfully!` }
    }), U) {
      const l = `/umbraco/section/content/workspace/document/edit/${U}`;
      setTimeout(() => {
        window.location.href = l;
      }, 150);
    }
  } catch (t) {
    console.error("Error creating document:", t), e.peek("danger", {
      data: { message: "An unexpected error occurred while creating the document." }
    });
  }
};
Z = function(e, o, s, c, t) {
  const n = s;
  if (o.contentTypeKey) {
    for (const i of [...c.destination.blockGrids ?? [], ...c.destination.blockLists ?? []])
      T(this, m, E).call(this, e, i.alias, o.contentTypeKey, o.target, n, t);
    return;
  }
  if (o.blockKey) {
    for (const i of [...c.destination.blockGrids ?? [], ...c.destination.blockLists ?? []]) {
      const u = i.blocks.find((r) => r.key === o.blockKey);
      if (u) {
        const r = u.contentTypeKey;
        r ? T(this, m, E).call(this, e, i.alias, r, o.target, n, t) : u.identifyBy && T(this, m, A).call(this, e, i.alias, u.identifyBy, o.target, n, t);
        return;
      }
    }
    console.log(`Block ${o.blockKey} not found in destination config`);
    return;
  }
  const a = o.target.split(".");
  if (a.length === 1) {
    const i = a[0], u = e.find((r) => r.alias === i);
    if (u)
      if (t.has(i)) {
        const r = typeof u.value == "string" ? u.value : "";
        u.value = `${r} ${n}`;
      } else
        u.value = n;
    else
      e.push({ alias: i, value: n });
    t.add(i);
  } else if (a.length === 3) {
    const [i, u, r] = a, h = [...c.destination.blockGrids ?? [], ...c.destination.blockLists ?? []].find((g) => g.key === i), f = h?.blocks.find((g) => g.key === u);
    if (!h || !f) return;
    const d = h.alias, y = f.properties?.find((g) => g.key === r)?.alias ?? r, v = f.identifyBy;
    if (!v) return;
    T(this, m, A).call(this, e, d, v, y, n, t);
  }
};
A = function(e, o, s, c, t, n) {
  const a = e.find((i) => i.alias === o);
  if (!(!a || !a.value))
    try {
      const i = typeof a.value == "string", u = i ? JSON.parse(a.value) : a.value, r = u.contentData;
      if (!r) return;
      for (const p of r) {
        const h = p.values?.find((f) => f.alias === s.property);
        if (h && typeof h.value == "string" && h.value.toLowerCase().includes(s.value.toLowerCase())) {
          const f = `${p.key}:${c}`, d = p.values?.find((y) => y.alias === c);
          if (d)
            if (n.has(f)) {
              const y = typeof d.value == "string" ? d.value : "";
              d.value = `${y}
${t}`;
            } else
              d.value = t;
          else
            p.values = p.values ?? [], p.values.push({ alias: c, value: t });
          n.add(f);
          break;
        }
      }
      a.value = i ? JSON.stringify(u) : u;
    } catch (i) {
      console.error(`Failed to apply block mapping to ${o}:`, i);
    }
};
E = function(e, o, s, c, t, n) {
  const a = e.find((i) => i.alias === o);
  if (!(!a || !a.value))
    try {
      const i = typeof a.value == "string", u = i ? JSON.parse(a.value) : a.value, r = u.contentData;
      if (!r) return;
      const p = r.find((d) => d.contentTypeKey === s);
      if (!p) return;
      const h = `${p.key}:${c}`, f = p.values?.find((d) => d.alias === c);
      if (f)
        if (n.has(h)) {
          const d = typeof f.value == "string" ? f.value : "";
          f.value = `${d}
${t}`;
        } else
          f.value = t;
      else
        p.values = p.values ?? [], p.values.push({ alias: c, value: t });
      n.add(h), a.value = i ? JSON.stringify(u) : u;
    } catch (i) {
      console.error(`Failed to apply block mapping by content type to ${o}:`, i);
    }
};
F = function(e, o, s) {
  for (const t of o.destination.fields)
    if ((t.type === "text" || t.type === "textArea") && s.has(t.alias)) {
      const n = e.find((a) => a.alias === t.alias);
      n && typeof n.value == "string" && (n.value = W(n.value));
    }
  for (const t of o.destination.fields)
    if (t.type === "number" && s.has(t.alias)) {
      const n = e.findIndex((a) => a.alias === t.alias);
      if (n !== -1 && typeof e[n].value == "string") {
        const a = ie(e[n].value);
        a === null ? (console.warn(`UpDoc: could not coerce "${e[n].value}" to an integer for field "${t.alias}" — leaving property unset.`), e.splice(n, 1)) : e[n].value = a;
      }
    }
  for (const t of o.destination.fields)
    if (t.type === "date" && s.has(t.alias)) {
      const n = e.findIndex((a) => a.alias === t.alias);
      if (n !== -1 && typeof e[n].value == "string") {
        const a = se(e[n].value);
        a === null ? (console.warn(`UpDoc: could not coerce "${e[n].value}" to a date for field "${t.alias}" — leaving property unset.`), e.splice(n, 1)) : e[n].value = re(a);
      }
    }
  for (const t of o.destination.fields)
    if (t.type === "richText" && s.has(t.alias)) {
      const n = e.find((a) => a.alias === t.alias);
      n && typeof n.value == "string" && (n.value = G(J(n.value)));
    }
  const c = [...o.destination.blockGrids ?? [], ...o.destination.blockLists ?? []];
  for (const t of c) {
    const n = e.find((r) => r.alias === t.alias);
    if (!n?.value) continue;
    const a = typeof n.value == "string", i = a ? JSON.parse(n.value) : n.value, u = i.contentData;
    if (u) {
      for (const r of u)
        for (const p of t.blocks)
          if (p.contentTypeKey ? r.contentTypeKey === p.contentTypeKey : r.key === p.key) {
            for (const f of p.properties ?? []) {
              const d = `${r.key}:${f.alias}`;
              if ((f.type === "text" || f.type === "textArea") && s.has(d)) {
                const y = r.values?.find((v) => v.alias === f.alias);
                y && typeof y.value == "string" && (y.value = W(y.value));
              }
              if (f.type === "richText" && s.has(d)) {
                const y = r.values?.find((v) => v.alias === f.alias);
                y && typeof y.value == "string" && (y.value = G(J(y.value)));
              }
            }
            break;
          }
      n.value = a ? JSON.stringify(i) : i;
    }
  }
};
_.styles = [
  ce`
			:host {
				display: contents;
			}
		`
];
D([
  V()
], _.prototype, "_documentUnique", 2);
D([
  V()
], _.prototype, "_documentTypeUnique", 2);
D([
  V()
], _.prototype, "_hasWorkflows", 2);
_ = D([
  le("up-doc-collection-action")
], _);
const Be = _;
export {
  _ as UpDocCollectionActionElement,
  Be as default
};
//# sourceMappingURL=up-doc-collection-action.element-CroGMvxT.js.map
