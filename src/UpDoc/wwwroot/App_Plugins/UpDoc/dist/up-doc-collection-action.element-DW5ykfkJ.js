import { U as tt } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { U as et } from "./up-doc-modal.token-DHoS03yR.js";
import { f as J } from "./workflow.service-DXCyU5bG.js";
import { s as M, b as R, m as W } from "./transforms-BkZeboOX.js";
import { html as G, css as nt, state as I, customElement as ot } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as at } from "@umbraco-cms/backoffice/lit-element";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as it } from "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as j } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as st } from "@umbraco-cms/backoffice/notification";
import { umbOpenModal as P } from "@umbraco-cms/backoffice/modal";
import { UmbDocumentTypeStructureRepository as rt } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as ct } from "@umbraco-cms/backoffice/document-blueprint";
var lt = Object.defineProperty, ut = Object.getOwnPropertyDescriptor, z = (e) => {
  throw TypeError(e);
}, D = (e, t, s, l) => {
  for (var n = l > 1 ? void 0 : l ? ut(t, s) : t, o = e.length - 1, i; o >= 0; o--)
    (i = e[o]) && (n = (l ? i(t, s, n) : i(n)) || n);
  return l && n && lt(t, s, n), n;
}, H = (e, t, s) => t.has(e) || z("Cannot " + s), O = (e, t, s) => (H(e, t, "read from private field"), s ? s.call(e) : t.get(e)), K = (e, t, s) => t.has(e) ? z("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), v = (e, t, s) => (H(e, t, "access private method"), s), $, B, m, A, X, Q, E, V, Y;
let T = class extends at {
  constructor() {
    super(), K(this, m), K(this, $, new rt(this)), K(this, B, new ct(this)), this._hasWorkflows = !1, this.consumeContext(it, (e) => {
      this.observe(e?.unique, (t) => {
        this._documentUnique = t, v(this, m, A).call(this);
      }), this.observe(e?.contentTypeUnique, (t) => {
        this._documentTypeUnique = t, v(this, m, A).call(this);
      });
    });
  }
  render() {
    return this._hasWorkflows ? G`
			<uui-button
				color="default"
				look="outline"
				label="Create from Source"
				@click=${v(this, m, X)}>
				Create from Source
			</uui-button>
		` : G``;
  }
};
$ = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
A = async function() {
  if (this._documentTypeUnique)
    try {
      const t = await (await this.getContext(j)).getLatestToken(), s = await J(t), l = new Set(s.blueprintIds), { data: n } = await O(this, $).requestAllowedChildrenOf(
        this._documentTypeUnique,
        this._documentUnique || null
      );
      if (!n?.items?.length) return;
      for (const o of n.items) {
        const { data: i } = await O(this, B).requestItemsByDocumentType(o.unique);
        if (i?.some((a) => l.has(a.unique))) {
          this._hasWorkflows = !0;
          return;
        }
      }
    } catch {
    }
};
X = async function() {
  if (!this._documentTypeUnique) return;
  const e = await this.getContext(st), s = await (await this.getContext(j)).getLatestToken(), l = this._documentUnique ?? null;
  try {
    const n = await J(s), o = new Set(n.blueprintIds), { data: i } = await O(this, $).requestAllowedChildrenOf(
      this._documentTypeUnique,
      l
    );
    if (!i?.items?.length) {
      e.peek("danger", {
        data: { message: "No document types are allowed as children of this page." }
      });
      return;
    }
    const a = [];
    for (const f of i.items) {
      const { data: g } = await O(this, B).requestItemsByDocumentType(f.unique);
      if (g?.length) {
        const C = g.filter((q) => o.has(q.unique));
        C.length && a.push({
          documentTypeUnique: f.unique,
          documentTypeName: f.name,
          documentTypeIcon: f.icon ?? null,
          blueprints: C.map((q) => ({
            blueprintUnique: q.unique,
            blueprintName: q.name
          }))
        });
      }
    }
    if (!a.length) {
      e.peek("warning", {
        data: { message: "No workflows are configured for the document types allowed here." }
      });
      return;
    }
    let u;
    try {
      u = await P(this, tt, {
        data: { documentTypes: a }
      });
    } catch {
      return;
    }
    const { blueprintUnique: r, documentTypeUnique: d } = u, c = a.find((f) => f.documentTypeUnique === d)?.blueprints.find((f) => f.blueprintUnique === r);
    let h;
    try {
      h = await P(this, et, {
        data: {
          unique: l,
          blueprintName: c?.blueprintName ?? "",
          blueprintId: r
        }
      });
    } catch {
      return;
    }
    const { name: p, mediaUnique: k, sourceUrl: w, sectionLookup: Z, config: _ } = h;
    if (!p || !_ || !k && !w) return;
    const S = await fetch(
      `/umbraco/management/api/v1/document-blueprint/${r}/scaffold`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${s}`
        }
      }
    );
    if (!S.ok) {
      const f = await S.json();
      e.peek("danger", {
        data: { message: `Failed to scaffold from blueprint: ${f.title || "Unknown error"}` }
      });
      return;
    }
    const U = await S.json(), N = U.values ? JSON.parse(JSON.stringify(U.values)) : [], L = /* @__PURE__ */ new Set();
    for (const f of _.map.mappings) {
      if (f.enabled === !1) continue;
      const g = Z[f.source];
      if (g)
        for (const C of f.destinations)
          v(this, m, Q).call(this, N, C, g, _, L);
    }
    v(this, m, Y).call(this, N, _, L);
    const F = {
      parent: l ? { id: l } : null,
      documentType: { id: d },
      template: U.template ? { id: U.template.id } : null,
      values: N,
      variants: [{ name: p, culture: null, segment: null }]
    }, x = await fetch("/umbraco/management/api/v1/document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s}`
      },
      body: JSON.stringify(F)
    });
    if (!x.ok) {
      const f = await x.json();
      e.peek("danger", {
        data: { message: `Failed to create document: ${f.title || f.detail || "Unknown error"}` }
      });
      return;
    }
    const b = x.headers.get("Location")?.split("/").pop();
    if (b) {
      const f = await fetch(`/umbraco/management/api/v1/document/${b}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s}` }
      });
      if (f.ok) {
        const g = await f.json();
        await fetch(`/umbraco/management/api/v1/document/${b}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${s}` },
          body: JSON.stringify(g)
        });
      }
    }
    if (e.peek("positive", {
      data: { message: `Document "${p}" created successfully!` }
    }), b) {
      const f = `/umbraco/section/content/workspace/document/edit/${b}`;
      setTimeout(() => {
        window.location.href = f;
      }, 150);
    }
  } catch (n) {
    console.error("Error creating document:", n), e.peek("danger", {
      data: { message: "An unexpected error occurred while creating the document." }
    });
  }
};
Q = function(e, t, s, l, n) {
  const o = s;
  if (t.contentTypeKey) {
    for (const a of [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []])
      v(this, m, V).call(this, e, a.alias, t.contentTypeKey, t.target, o, n);
    return;
  }
  if (t.blockKey) {
    for (const a of [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []]) {
      const u = a.blocks.find((r) => r.key === t.blockKey);
      if (u) {
        const r = u.contentTypeKey;
        r ? v(this, m, V).call(this, e, a.alias, r, t.target, o, n) : u.identifyBy && v(this, m, E).call(this, e, a.alias, u.identifyBy, t.target, o, n);
        return;
      }
    }
    console.log(`Block ${t.blockKey} not found in destination config`);
    return;
  }
  const i = t.target.split(".");
  if (i.length === 1) {
    const a = i[0], u = e.find((r) => r.alias === a);
    if (u)
      if (n.has(a)) {
        const r = typeof u.value == "string" ? u.value : "";
        u.value = `${r} ${o}`;
      } else
        u.value = o;
    else
      e.push({ alias: a, value: o });
    n.add(a);
  } else if (i.length === 3) {
    const [a, u, r] = i, y = [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []].find((w) => w.key === a), c = y?.blocks.find((w) => w.key === u);
    if (!y || !c) return;
    const h = y.alias, p = c.properties?.find((w) => w.key === r)?.alias ?? r, k = c.identifyBy;
    if (!k) return;
    v(this, m, E).call(this, e, h, k, p, o, n);
  }
};
E = function(e, t, s, l, n, o) {
  const i = e.find((a) => a.alias === t);
  if (!(!i || !i.value))
    try {
      const a = typeof i.value == "string", u = a ? JSON.parse(i.value) : i.value, r = u.contentData;
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
      i.value = a ? JSON.stringify(u) : u;
    } catch (a) {
      console.error(`Failed to apply block mapping to ${t}:`, a);
    }
};
V = function(e, t, s, l, n, o) {
  const i = e.find((a) => a.alias === t);
  if (!(!i || !i.value))
    try {
      const a = typeof i.value == "string", u = a ? JSON.parse(i.value) : i.value, r = u.contentData;
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
      i.value = a ? JSON.stringify(u) : u;
    } catch (a) {
      console.error(`Failed to apply block mapping by content type to ${t}:`, a);
    }
};
Y = function(e, t, s) {
  for (const n of t.destination.fields)
    if ((n.type === "text" || n.type === "textArea") && s.has(n.alias)) {
      const o = e.find((i) => i.alias === n.alias);
      o && typeof o.value == "string" && (o.value = M(o.value));
    }
  for (const n of t.destination.fields)
    if (n.type === "richText" && s.has(n.alias)) {
      const o = e.find((i) => i.alias === n.alias);
      o && typeof o.value == "string" && (o.value = R(W(o.value)));
    }
  const l = [...t.destination.blockGrids ?? [], ...t.destination.blockLists ?? []];
  for (const n of l) {
    const o = e.find((r) => r.alias === n.alias);
    if (!o?.value) continue;
    const i = typeof o.value == "string", a = i ? JSON.parse(o.value) : o.value, u = a.contentData;
    if (u) {
      for (const r of u)
        for (const d of n.blocks)
          if (d.contentTypeKey ? r.contentTypeKey === d.contentTypeKey : r.key === d.key) {
            for (const c of d.properties ?? []) {
              const h = `${r.key}:${c.alias}`;
              if ((c.type === "text" || c.type === "textArea") && s.has(h)) {
                const p = r.values?.find((k) => k.alias === c.alias);
                p && typeof p.value == "string" && (p.value = M(p.value));
              }
              if (c.type === "richText" && s.has(h)) {
                const p = r.values?.find((k) => k.alias === c.alias);
                p && typeof p.value == "string" && (p.value = R(W(p.value)));
              }
            }
            break;
          }
      o.value = i ? JSON.stringify(a) : a;
    }
  }
};
T.styles = [
  nt`
			:host {
				display: contents;
			}
		`
];
D([
  I()
], T.prototype, "_documentUnique", 2);
D([
  I()
], T.prototype, "_documentTypeUnique", 2);
D([
  I()
], T.prototype, "_hasWorkflows", 2);
T = D([
  ot("up-doc-collection-action")
], T);
const Ut = T;
export {
  T as UpDocCollectionActionElement,
  Ut as default
};
//# sourceMappingURL=up-doc-collection-action.element-DW5ykfkJ.js.map
