import { U as te } from "./blueprint-picker-modal.token-mXZoRNwG.js";
import { U as ne } from "./up-doc-modal.token-DHoS03yR.js";
import { f as z } from "./workflow.service-DwTP3LNQ.js";
import { s as W, c as oe, a as ae, b as ie, d as G, m as J } from "./transforms-qqnY8EQ-.js";
import { html as P, css as se, state as E, customElement as re } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as ce } from "@umbraco-cms/backoffice/lit-element";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as le } from "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as H } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as ue } from "@umbraco-cms/backoffice/notification";
import { umbOpenModal as j } from "@umbraco-cms/backoffice/modal";
import { UmbDocumentTypeStructureRepository as fe } from "@umbraco-cms/backoffice/document-type";
import { UmbDocumentBlueprintItemRepository as pe } from "@umbraco-cms/backoffice/document-blueprint";
var de = Object.defineProperty, ye = Object.getOwnPropertyDescriptor, X = (e) => {
  throw TypeError(e);
}, D = (e, o, s, c) => {
  for (var t = c > 1 ? void 0 : c ? ye(o, s) : o, n = e.length - 1, a; n >= 0; n--)
    (a = e[n]) && (t = (c ? a(o, s, t) : a(t)) || t);
  return c && t && de(o, s, t), t;
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
    return this._hasWorkflows ? P`
			<uui-button
				color="default"
				look="outline"
				label="Create from Source"
				@click=${k(this, m, Y)}>
				Create from Source
			</uui-button>
		` : P``;
  }
};
O = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
I = async function() {
  if (this._documentTypeUnique)
    try {
      const o = await (await this.getContext(H)).getLatestToken(), s = await z(o), c = new Set(s.blueprintIds), { data: t } = await q(this, O).requestAllowedChildrenOf(
        this._documentTypeUnique,
        this._documentUnique || null
      );
      if (!t?.items?.length) return;
      for (const n of t.items) {
        const { data: a } = await q(this, S).requestItemsByDocumentType(n.unique);
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
  const e = await this.getContext(ue), s = await (await this.getContext(H)).getLatestToken(), c = this._documentUnique ?? null;
  try {
    const t = await z(s), n = new Set(t.blueprintIds), { data: a } = await q(this, O).requestAllowedChildrenOf(
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
    for (const u of a.items) {
      const { data: v } = await q(this, S).requestItemsByDocumentType(u.unique);
      if (v?.length) {
        const T = v.filter((b) => n.has(b.unique));
        T.length && i.push({
          documentTypeUnique: u.unique,
          documentTypeName: u.name,
          documentTypeIcon: u.icon ?? null,
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
    let l;
    try {
      l = await j(this, te, {
        data: { documentTypes: i }
      });
    } catch {
      return;
    }
    const { blueprintUnique: r, documentTypeUnique: p } = l, f = i.find((u) => u.documentTypeUnique === p)?.blueprints.find((u) => u.blueprintUnique === r);
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
    const { name: y, mediaUnique: w, sourceUrl: g, sectionLookup: L, stableKeyLookup: M, config: C } = d;
    if (!y || !C || !w && !g) return;
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
      const u = await B.json();
      e.peek("danger", {
        data: { message: `Failed to scaffold from blueprint: ${u.title || "Unknown error"}` }
      });
      return;
    }
    const $ = await B.json(), x = $.values ? JSON.parse(JSON.stringify($.values)) : [], R = /* @__PURE__ */ new Set();
    for (const u of C.map.mappings) {
      if (u.enabled === !1) continue;
      let v = L[u.source];
      if (!v && u.sourceKey && M) {
        const T = M[u.sourceKey];
        if (T) {
          const b = u.source.split(".").pop();
          b && (v = L[`${T}.${b}`]);
        }
      }
      if (v)
        for (const T of u.destinations)
          k(this, m, Z).call(this, x, T, v, C, R);
    }
    k(this, m, F).call(this, x, C, R);
    const ee = {
      parent: c ? { id: c } : null,
      documentType: { id: p },
      template: $.template ? { id: $.template.id } : null,
      values: x,
      variants: [{ name: y, culture: null, segment: null }]
    }, N = await fetch("/umbraco/management/api/v1/document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s}`
      },
      body: JSON.stringify(ee)
    });
    if (!N.ok) {
      const u = await N.json();
      e.peek("danger", {
        data: { message: `Failed to create document: ${u.title || u.detail || "Unknown error"}` }
      });
      return;
    }
    const U = N.headers.get("Location")?.split("/").pop();
    if (U) {
      const u = await fetch(`/umbraco/management/api/v1/document/${U}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s}` }
      });
      if (u.ok) {
        const v = await u.json();
        await fetch(`/umbraco/management/api/v1/document/${U}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${s}` },
          body: JSON.stringify(v)
        });
      }
    }
    if (e.peek("positive", {
      data: { message: `Document "${y}" created successfully!` }
    }), U) {
      const u = `/umbraco/section/content/workspace/document/edit/${U}`;
      setTimeout(() => {
        window.location.href = u;
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
      k(this, m, V).call(this, e, i.alias, o.contentTypeKey, o.target, n, t);
    return;
  }
  if (o.blockKey) {
    for (const i of [...c.destination.blockGrids ?? [], ...c.destination.blockLists ?? []]) {
      const l = i.blocks.find((r) => r.key === o.blockKey);
      if (l) {
        const r = l.contentTypeKey;
        r ? k(this, m, V).call(this, e, i.alias, r, o.target, n, t) : l.identifyBy && k(this, m, A).call(this, e, i.alias, l.identifyBy, o.target, n, t);
        return;
      }
    }
    console.log(`Block ${o.blockKey} not found in destination config`);
    return;
  }
  const a = o.target.split(".");
  if (a.length === 1) {
    const i = a[0], l = e.find((r) => r.alias === i);
    if (l)
      if (t.has(i)) {
        const r = typeof l.value == "string" ? l.value : "";
        l.value = `${r} ${n}`;
      } else
        l.value = n;
    else
      e.push({ alias: i, value: n });
    t.add(i);
  } else if (a.length === 3) {
    const [i, l, r] = a, h = [...c.destination.blockGrids ?? [], ...c.destination.blockLists ?? []].find((g) => g.key === i), f = h?.blocks.find((g) => g.key === l);
    if (!h || !f) return;
    const d = h.alias, y = f.properties?.find((g) => g.key === r)?.alias ?? r, w = f.identifyBy;
    if (!w) return;
    k(this, m, A).call(this, e, d, w, y, n, t);
  }
};
A = function(e, o, s, c, t, n) {
  const a = e.find((i) => i.alias === o);
  if (!(!a || !a.value))
    try {
      const i = typeof a.value == "string", l = i ? JSON.parse(a.value) : a.value, r = l.contentData;
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
      a.value = i ? JSON.stringify(l) : l;
    } catch (i) {
      console.error(`Failed to apply block mapping to ${o}:`, i);
    }
};
V = function(e, o, s, c, t, n) {
  const a = e.find((i) => i.alias === o);
  if (!(!a || !a.value))
    try {
      const i = typeof a.value == "string", l = i ? JSON.parse(a.value) : a.value, r = l.contentData;
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
      n.add(h), a.value = i ? JSON.stringify(l) : l;
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
        const a = oe(e[n].value);
        a === null ? (console.warn(`UpDoc: could not coerce "${e[n].value}" to an integer for field "${t.alias}" — leaving property unset.`), e.splice(n, 1)) : e[n].value = a;
      }
    }
  for (const t of o.destination.fields)
    if (t.type === "date" && s.has(t.alias)) {
      const n = e.findIndex((a) => a.alias === t.alias);
      if (n !== -1 && typeof e[n].value == "string") {
        const a = ae(e[n].value);
        a === null ? (console.warn(`UpDoc: could not coerce "${e[n].value}" to a date for field "${t.alias}" — leaving property unset.`), e.splice(n, 1)) : e[n].value = ie(a);
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
    const a = typeof n.value == "string", i = a ? JSON.parse(n.value) : n.value, l = i.contentData;
    if (l) {
      for (const r of l)
        for (const p of t.blocks)
          if (p.contentTypeKey ? r.contentTypeKey === p.contentTypeKey : r.key === p.key) {
            for (const f of p.properties ?? []) {
              const d = `${r.key}:${f.alias}`;
              if ((f.type === "text" || f.type === "textArea") && s.has(d)) {
                const y = r.values?.find((w) => w.alias === f.alias);
                y && typeof y.value == "string" && (y.value = W(y.value));
              }
              if (f.type === "richText" && s.has(d)) {
                const y = r.values?.find((w) => w.alias === f.alias);
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
//# sourceMappingURL=up-doc-collection-action.element-Cq9_Z5Rm.js.map
