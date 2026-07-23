import { U as et } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { U as nt } from "./up-doc-modal.token-DHoS03yR.js";
import { f as z } from "./workflow.service-DwTP3LNQ.js";
import { s as W, c as ot, b as G, m as P } from "./transforms-DNUIGMem.js";
import { html as J, css as at, state as V, customElement as it } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as st } from "@umbraco-cms/backoffice/lit-element";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as rt } from "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as H } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as ct } from "@umbraco-cms/backoffice/notification";
import { umbOpenModal as j } from "@umbraco-cms/backoffice/modal";
import { UmbDocumentTypeStructureRepository as lt } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as ut } from "@umbraco-cms/backoffice/document-blueprint";
var ft = Object.defineProperty, pt = Object.getOwnPropertyDescriptor, X = (t) => {
  throw TypeError(t);
}, O = (t, e, s, l) => {
  for (var n = l > 1 ? void 0 : l ? pt(e, s) : e, o = t.length - 1, a; o >= 0; o--)
    (a = t[o]) && (n = (l ? a(e, s, n) : a(n)) || n);
  return l && n && ft(e, s, n), n;
}, Q = (t, e, s) => e.has(t) || X("Cannot " + s), $ = (t, e, s) => (Q(t, e, "read from private field"), s ? s.call(t) : e.get(t)), K = (t, e, s) => e.has(t) ? X("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), k = (t, e, s) => (Q(t, e, "access private method"), s), D, S, m, I, Y, Z, A, E, F;
let _ = class extends st {
  constructor() {
    super(), K(this, m), K(this, D, new lt(this)), K(this, S, new ut(this)), this._hasWorkflows = !1, this.consumeContext(rt, (t) => {
      this.observe(t?.unique, (e) => {
        this._documentUnique = e, k(this, m, I).call(this);
      }), this.observe(t?.contentTypeUnique, (e) => {
        this._documentTypeUnique = e, k(this, m, I).call(this);
      });
    });
  }
  render() {
    return this._hasWorkflows ? J`
			<uui-button
				color="default"
				look="outline"
				label="Create from Source"
				@click=${k(this, m, Y)}>
				Create from Source
			</uui-button>
		` : J``;
  }
};
D = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
I = async function() {
  if (this._documentTypeUnique)
    try {
      const e = await (await this.getContext(H)).getLatestToken(), s = await z(e), l = new Set(s.blueprintIds), { data: n } = await $(this, D).requestAllowedChildrenOf(
        this._documentTypeUnique,
        this._documentUnique || null
      );
      if (!n?.items?.length) return;
      for (const o of n.items) {
        const { data: a } = await $(this, S).requestItemsByDocumentType(o.unique);
        if (a?.some((i) => l.has(i.unique))) {
          this._hasWorkflows = !0;
          return;
        }
      }
    } catch {
    }
};
Y = async function() {
  if (!this._documentTypeUnique) return;
  const t = await this.getContext(ct), s = await (await this.getContext(H)).getLatestToken(), l = this._documentUnique ?? null;
  try {
    const n = await z(s), o = new Set(n.blueprintIds), { data: a } = await $(this, D).requestAllowedChildrenOf(
      this._documentTypeUnique,
      l
    );
    if (!a?.items?.length) {
      t.peek("danger", {
        data: { message: "No document types are allowed as children of this page." }
      });
      return;
    }
    const i = [];
    for (const f of a.items) {
      const { data: v } = await $(this, S).requestItemsByDocumentType(f.unique);
      if (v?.length) {
        const T = v.filter((b) => o.has(b.unique));
        T.length && i.push({
          documentTypeUnique: f.unique,
          documentTypeName: f.name,
          documentTypeIcon: f.icon ?? null,
          blueprints: T.map((b) => ({
            blueprintUnique: b.unique,
            blueprintName: b.name
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
    let u;
    try {
      u = await j(this, et, {
        data: { documentTypes: i }
      });
    } catch {
      return;
    }
    const { blueprintUnique: r, documentTypeUnique: d } = u, c = i.find((f) => f.documentTypeUnique === d)?.blueprints.find((f) => f.blueprintUnique === r);
    let h;
    try {
      h = await j(this, nt, {
        data: {
          unique: l,
          blueprintName: c?.blueprintName ?? "",
          blueprintId: r
        }
      });
    } catch {
      return;
    }
    const { name: p, mediaUnique: w, sourceUrl: g, sectionLookup: L, stableKeyLookup: M, config: C } = h;
    if (!p || !C || !w && !g) return;
    const B = await fetch(
      `/umbraco/management/api/v1/document-blueprint/${r}/scaffold`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${s}`
        }
      }
    );
    if (!B.ok) {
      const f = await B.json();
      t.peek("danger", {
        data: { message: `Failed to scaffold from blueprint: ${f.title || "Unknown error"}` }
      });
      return;
    }
    const q = await B.json(), N = q.values ? JSON.parse(JSON.stringify(q.values)) : [], R = /* @__PURE__ */ new Set();
    for (const f of C.map.mappings) {
      if (f.enabled === !1) continue;
      let v = L[f.source];
      if (!v && f.sourceKey && M) {
        const T = M[f.sourceKey];
        if (T) {
          const b = f.source.split(".").pop();
          b && (v = L[`${T}.${b}`]);
        }
      }
      if (v)
        for (const T of f.destinations)
          k(this, m, Z).call(this, N, T, v, C, R);
    }
    k(this, m, F).call(this, N, C, R);
    const tt = {
      parent: l ? { id: l } : null,
      documentType: { id: d },
      template: q.template ? { id: q.template.id } : null,
      values: N,
      variants: [{ name: p, culture: null, segment: null }]
    }, x = await fetch("/umbraco/management/api/v1/document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s}`
      },
      body: JSON.stringify(tt)
    });
    if (!x.ok) {
      const f = await x.json();
      t.peek("danger", {
        data: { message: `Failed to create document: ${f.title || f.detail || "Unknown error"}` }
      });
      return;
    }
    const U = x.headers.get("Location")?.split("/").pop();
    if (U) {
      const f = await fetch(`/umbraco/management/api/v1/document/${U}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s}` }
      });
      if (f.ok) {
        const v = await f.json();
        await fetch(`/umbraco/management/api/v1/document/${U}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${s}` },
          body: JSON.stringify(v)
        });
      }
    }
    if (t.peek("positive", {
      data: { message: `Document "${p}" created successfully!` }
    }), U) {
      const f = `/umbraco/section/content/workspace/document/edit/${U}`;
      setTimeout(() => {
        window.location.href = f;
      }, 150);
    }
  } catch (n) {
    console.error("Error creating document:", n), t.peek("danger", {
      data: { message: "An unexpected error occurred while creating the document." }
    });
  }
};
Z = function(t, e, s, l, n) {
  const o = s;
  if (e.contentTypeKey) {
    for (const i of [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []])
      k(this, m, E).call(this, t, i.alias, e.contentTypeKey, e.target, o, n);
    return;
  }
  if (e.blockKey) {
    for (const i of [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []]) {
      const u = i.blocks.find((r) => r.key === e.blockKey);
      if (u) {
        const r = u.contentTypeKey;
        r ? k(this, m, E).call(this, t, i.alias, r, e.target, o, n) : u.identifyBy && k(this, m, A).call(this, t, i.alias, u.identifyBy, e.target, o, n);
        return;
      }
    }
    console.log(`Block ${e.blockKey} not found in destination config`);
    return;
  }
  const a = e.target.split(".");
  if (a.length === 1) {
    const i = a[0], u = t.find((r) => r.alias === i);
    if (u)
      if (n.has(i)) {
        const r = typeof u.value == "string" ? u.value : "";
        u.value = `${r} ${o}`;
      } else
        u.value = o;
    else
      t.push({ alias: i, value: o });
    n.add(i);
  } else if (a.length === 3) {
    const [i, u, r] = a, y = [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []].find((g) => g.key === i), c = y?.blocks.find((g) => g.key === u);
    if (!y || !c) return;
    const h = y.alias, p = c.properties?.find((g) => g.key === r)?.alias ?? r, w = c.identifyBy;
    if (!w) return;
    k(this, m, A).call(this, t, h, w, p, o, n);
  }
};
A = function(t, e, s, l, n, o) {
  const a = t.find((i) => i.alias === e);
  if (!(!a || !a.value))
    try {
      const i = typeof a.value == "string", u = i ? JSON.parse(a.value) : a.value, r = u.contentData;
      if (!r) return;
      for (const d of r) {
        const y = d.values?.find((c) => c.alias === s.property);
        if (y && typeof y.value == "string" && y.value.toLowerCase().includes(s.value.toLowerCase())) {
          const c = d.values?.find((h) => h.alias === l);
          if (c) {
            const h = `${d.key}:${l}`;
            if (o.has(h)) {
              const p = typeof c.value == "string" ? c.value : "";
              c.value = `${p}
${n}`;
            } else
              c.value = n;
            o.add(h);
          }
          break;
        }
      }
      a.value = i ? JSON.stringify(u) : u;
    } catch (i) {
      console.error(`Failed to apply block mapping to ${e}:`, i);
    }
};
E = function(t, e, s, l, n, o) {
  const a = t.find((i) => i.alias === e);
  if (!(!a || !a.value))
    try {
      const i = typeof a.value == "string", u = i ? JSON.parse(a.value) : a.value, r = u.contentData;
      if (!r) return;
      const d = r.find((c) => c.contentTypeKey === s);
      if (!d) return;
      const y = d.values?.find((c) => c.alias === l);
      if (y) {
        const c = `${d.key}:${l}`;
        if (o.has(c)) {
          const h = typeof y.value == "string" ? y.value : "";
          y.value = `${h}
${n}`;
        } else
          y.value = n;
        o.add(c);
      }
      a.value = i ? JSON.stringify(u) : u;
    } catch (i) {
      console.error(`Failed to apply block mapping by content type to ${e}:`, i);
    }
};
F = function(t, e, s) {
  for (const n of e.destination.fields)
    if ((n.type === "text" || n.type === "textArea") && s.has(n.alias)) {
      const o = t.find((a) => a.alias === n.alias);
      o && typeof o.value == "string" && (o.value = W(o.value));
    }
  for (const n of e.destination.fields)
    if (n.type === "number" && s.has(n.alias)) {
      const o = t.findIndex((a) => a.alias === n.alias);
      if (o !== -1 && typeof t[o].value == "string") {
        const a = ot(t[o].value);
        a === null ? (console.warn(`UpDoc: could not coerce "${t[o].value}" to an integer for field "${n.alias}" — leaving property unset.`), t.splice(o, 1)) : t[o].value = a;
      }
    }
  for (const n of e.destination.fields)
    if (n.type === "richText" && s.has(n.alias)) {
      const o = t.find((a) => a.alias === n.alias);
      o && typeof o.value == "string" && (o.value = G(P(o.value)));
    }
  const l = [...e.destination.blockGrids ?? [], ...e.destination.blockLists ?? []];
  for (const n of l) {
    const o = t.find((r) => r.alias === n.alias);
    if (!o?.value) continue;
    const a = typeof o.value == "string", i = a ? JSON.parse(o.value) : o.value, u = i.contentData;
    if (u) {
      for (const r of u)
        for (const d of n.blocks)
          if (d.contentTypeKey ? r.contentTypeKey === d.contentTypeKey : r.key === d.key) {
            for (const c of d.properties ?? []) {
              const h = `${r.key}:${c.alias}`;
              if ((c.type === "text" || c.type === "textArea") && s.has(h)) {
                const p = r.values?.find((w) => w.alias === c.alias);
                p && typeof p.value == "string" && (p.value = W(p.value));
              }
              if (c.type === "richText" && s.has(h)) {
                const p = r.values?.find((w) => w.alias === c.alias);
                p && typeof p.value == "string" && (p.value = G(P(p.value)));
              }
            }
            break;
          }
      o.value = a ? JSON.stringify(i) : i;
    }
  }
};
_.styles = [
  at`
			:host {
				display: contents;
			}
		`
];
O([
  V()
], _.prototype, "_documentUnique", 2);
O([
  V()
], _.prototype, "_documentTypeUnique", 2);
O([
  V()
], _.prototype, "_hasWorkflows", 2);
_ = O([
  it("up-doc-collection-action")
], _);
const qt = _;
export {
  _ as UpDocCollectionActionElement,
  qt as default
};
//# sourceMappingURL=up-doc-collection-action.element-IFfAeLc9.js.map
