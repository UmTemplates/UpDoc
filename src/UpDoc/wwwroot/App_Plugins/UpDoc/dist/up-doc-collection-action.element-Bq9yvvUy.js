import { U as te } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { U as ne } from "./up-doc-modal.token-DHoS03yR.js";
import { f as z } from "./workflow.service-DwTP3LNQ.js";
import { s as W, c as oe, a as ae, b as ie, d as G, m as P } from "./transforms-qqnY8EQ-.js";
import { html as J, css as se, state as E, customElement as re } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ce } from "@umbraco-cms/backoffice/lit-element";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as le } from "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as H } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as ue } from "@umbraco-cms/backoffice/notification";
import { umbOpenModal as j } from "@umbraco-cms/backoffice/modal";
import { UmbDocumentTypeStructureRepository as fe } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as pe } from "@umbraco-cms/backoffice/document-blueprint";
var de = Object.defineProperty, ye = Object.getOwnPropertyDescriptor, X = (e) => {
  throw TypeError(e);
}, D = (e, o, s, l) => {
  for (var n = l > 1 ? void 0 : l ? ye(o, s) : o, t = e.length - 1, a; t >= 0; t--)
    (a = e[t]) && (n = (l ? a(o, s, n) : a(n)) || n);
  return l && n && de(o, s, n), n;
}, Q = (e, o, s) => o.has(e) || X("Cannot " + s), q = (e, o, s) => (Q(e, o, "read from private field"), s ? s.call(e) : o.get(e)), K = (e, o, s) => o.has(e) ? X("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(e) : o.set(e, s), k = (e, o, s) => (Q(e, o, "access private method"), s), O, S, m, I, Y, Z, A, V, F;
let _ = class extends ce {
  constructor() {
    super(), K(this, m), K(this, O, new fe(this)), K(this, S, new pe(this)), this._hasWorkflows = !1, this.consumeContext(le, (e) => {
      this.observe(e?.unique, (o) => {
        this._documentUnique = o, k(this, m, I).call(this);
      }), this.observe(e?.contentTypeUnique, (o) => {
        this._documentTypeUnique = o, k(this, m, I).call(this);
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
O = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
I = async function() {
  if (this._documentTypeUnique)
    try {
      const o = await (await this.getContext(H)).getLatestToken(), s = await z(o), l = new Set(s.blueprintIds), { data: n } = await q(this, O).requestAllowedChildrenOf(
        this._documentTypeUnique,
        this._documentUnique || null
      );
      if (!n?.items?.length) return;
      for (const t of n.items) {
        const { data: a } = await q(this, S).requestItemsByDocumentType(t.unique);
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
  const e = await this.getContext(ue), s = await (await this.getContext(H)).getLatestToken(), l = this._documentUnique ?? null;
  try {
    const n = await z(s), t = new Set(n.blueprintIds), { data: a } = await q(this, O).requestAllowedChildrenOf(
      this._documentTypeUnique,
      l
    );
    if (!a?.items?.length) {
      e.peek("danger", {
        data: { message: "No document types are allowed as children of this page." }
      });
      return;
    }
    const i = [];
    for (const f of a.items) {
      const { data: v } = await q(this, S).requestItemsByDocumentType(f.unique);
      if (v?.length) {
        const T = v.filter((b) => t.has(b.unique));
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
    const { blueprintUnique: r, documentTypeUnique: d } = u, c = i.find((f) => f.documentTypeUnique === d)?.blueprints.find((f) => f.blueprintUnique === r);
    let h;
    try {
      h = await j(this, ne, {
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
      e.peek("danger", {
        data: { message: `Failed to scaffold from blueprint: ${f.title || "Unknown error"}` }
      });
      return;
    }
    const $ = await B.json(), x = $.values ? JSON.parse(JSON.stringify($.values)) : [], R = /* @__PURE__ */ new Set();
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
          k(this, m, Z).call(this, x, T, v, C, R);
    }
    k(this, m, F).call(this, x, C, R);
    const ee = {
      parent: l ? { id: l } : null,
      documentType: { id: d },
      template: $.template ? { id: $.template.id } : null,
      values: x,
      variants: [{ name: p, culture: null, segment: null }]
    }, N = await fetch("/umbraco/management/api/v1/document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s}`
      },
      body: JSON.stringify(ee)
    });
    if (!N.ok) {
      const f = await N.json();
      e.peek("danger", {
        data: { message: `Failed to create document: ${f.title || f.detail || "Unknown error"}` }
      });
      return;
    }
    const U = N.headers.get("Location")?.split("/").pop();
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
    if (e.peek("positive", {
      data: { message: `Document "${p}" created successfully!` }
    }), U) {
      const f = `/umbraco/section/content/workspace/document/edit/${U}`;
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
Z = function(e, o, s, l, n) {
  const t = s;
  if (o.contentTypeKey) {
    for (const i of [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []])
      k(this, m, V).call(this, e, i.alias, o.contentTypeKey, o.target, t, n);
    return;
  }
  if (o.blockKey) {
    for (const i of [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []]) {
      const u = i.blocks.find((r) => r.key === o.blockKey);
      if (u) {
        const r = u.contentTypeKey;
        r ? k(this, m, V).call(this, e, i.alias, r, o.target, t, n) : u.identifyBy && k(this, m, A).call(this, e, i.alias, u.identifyBy, o.target, t, n);
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
      if (n.has(i)) {
        const r = typeof u.value == "string" ? u.value : "";
        u.value = `${r} ${t}`;
      } else
        u.value = t;
    else
      e.push({ alias: i, value: t });
    n.add(i);
  } else if (a.length === 3) {
    const [i, u, r] = a, y = [...l.destination.blockGrids ?? [], ...l.destination.blockLists ?? []].find((g) => g.key === i), c = y?.blocks.find((g) => g.key === u);
    if (!y || !c) return;
    const h = y.alias, p = c.properties?.find((g) => g.key === r)?.alias ?? r, w = c.identifyBy;
    if (!w) return;
    k(this, m, A).call(this, e, h, w, p, t, n);
  }
};
A = function(e, o, s, l, n, t) {
  const a = e.find((i) => i.alias === o);
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
            if (t.has(h)) {
              const p = typeof c.value == "string" ? c.value : "";
              c.value = `${p}
${n}`;
            } else
              c.value = n;
            t.add(h);
          }
          break;
        }
      }
      a.value = i ? JSON.stringify(u) : u;
    } catch (i) {
      console.error(`Failed to apply block mapping to ${o}:`, i);
    }
};
V = function(e, o, s, l, n, t) {
  const a = e.find((i) => i.alias === o);
  if (!(!a || !a.value))
    try {
      const i = typeof a.value == "string", u = i ? JSON.parse(a.value) : a.value, r = u.contentData;
      if (!r) return;
      const d = r.find((c) => c.contentTypeKey === s);
      if (!d) return;
      const y = d.values?.find((c) => c.alias === l);
      if (y) {
        const c = `${d.key}:${l}`;
        if (t.has(c)) {
          const h = typeof y.value == "string" ? y.value : "";
          y.value = `${h}
${n}`;
        } else
          y.value = n;
        t.add(c);
      }
      a.value = i ? JSON.stringify(u) : u;
    } catch (i) {
      console.error(`Failed to apply block mapping by content type to ${o}:`, i);
    }
};
F = function(e, o, s) {
  for (const n of o.destination.fields)
    if ((n.type === "text" || n.type === "textArea") && s.has(n.alias)) {
      const t = e.find((a) => a.alias === n.alias);
      t && typeof t.value == "string" && (t.value = W(t.value));
    }
  for (const n of o.destination.fields)
    if (n.type === "number" && s.has(n.alias)) {
      const t = e.findIndex((a) => a.alias === n.alias);
      if (t !== -1 && typeof e[t].value == "string") {
        const a = oe(e[t].value);
        a === null ? (console.warn(`UpDoc: could not coerce "${e[t].value}" to an integer for field "${n.alias}" — leaving property unset.`), e.splice(t, 1)) : e[t].value = a;
      }
    }
  for (const n of o.destination.fields)
    if (n.type === "date" && s.has(n.alias)) {
      const t = e.findIndex((a) => a.alias === n.alias);
      if (t !== -1 && typeof e[t].value == "string") {
        const a = ae(e[t].value);
        a === null ? (console.warn(`UpDoc: could not coerce "${e[t].value}" to a date for field "${n.alias}" — leaving property unset.`), e.splice(t, 1)) : e[t].value = ie(a);
      }
    }
  for (const n of o.destination.fields)
    if (n.type === "richText" && s.has(n.alias)) {
      const t = e.find((a) => a.alias === n.alias);
      t && typeof t.value == "string" && (t.value = G(P(t.value)));
    }
  const l = [...o.destination.blockGrids ?? [], ...o.destination.blockLists ?? []];
  for (const n of l) {
    const t = e.find((r) => r.alias === n.alias);
    if (!t?.value) continue;
    const a = typeof t.value == "string", i = a ? JSON.parse(t.value) : t.value, u = i.contentData;
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
      t.value = a ? JSON.stringify(i) : i;
    }
  }
};
_.styles = [
  se`
			:host {
				display: contents;
			}
		`
];
D([
  E()
], _.prototype, "_documentUnique", 2);
D([
  E()
], _.prototype, "_documentTypeUnique", 2);
D([
  E()
], _.prototype, "_hasWorkflows", 2);
_ = D([
  re("up-doc-collection-action")
], _);
const De = _;
export {
  _ as UpDocCollectionActionElement,
  De as default
};
//# sourceMappingURL=up-doc-collection-action.element-Bq9yvvUy.js.map
