import { html as b, css as S, state as _, customElement as L } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as j } from "@umbraco-cms/backoffice/lit-element";
import { UMB_COLLECTION_CONTEXT as R } from "@umbraco-cms/backoffice/collection";
import { UMB_AUTH_CONTEXT as W } from "@umbraco-cms/backoffice/auth";
import { UmbTextStyles as H } from "@umbraco-cms/backoffice/style";
import { UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as X } from "@umbraco-cms/backoffice/document";
var z = Object.defineProperty, G = Object.getOwnPropertyDescriptor, P = (t) => {
  throw TypeError(t);
}, o = (t, e, i, s) => {
  for (var a = s > 1 ? void 0 : s ? G(e, i) : e, h = t.length - 1, u; h >= 0; h--)
    (u = t[h]) && (a = (s ? u(e, i, a) : u(a)) || a);
  return s && a && z(e, i, a), a;
}, O = (t, e, i) => e.has(t) || P("Cannot " + i), E = (t, e, i) => (O(t, e, "read from private field"), i ? i.call(t) : e.get(t)), A = (t, e, i) => e.has(t) ? P("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), K = (t, e, i, s) => (O(t, e, "write to private field"), e.set(t, i), i), p = (t, e, i) => (O(t, e, "access private method"), i), w, n, U, q, M, B, v, V;
let r = class extends j {
  constructor() {
    super(), A(this, n), this._items = [], this._properties = /* @__PURE__ */ new Map(), this._filterTitle = "__all__", this._filterOrganisation = "__all__", this._filterOrganiser = "__all__", this._filterDestination = "__all__", this._searchTitle = "", this._searchOrganisation = "", this._searchOrganiser = "", this._searchDestination = "", A(this, w), this.consumeContext(W, (t) => {
      K(this, w, t);
    }), this.consumeContext(R, (t) => {
      t && this.observe(t.items, (e) => {
        this._items = e ?? [], p(this, n, U).call(this, this._items);
      });
    });
  }
  render() {
    const t = p(this, n, V).call(this);
    return b`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell class="member-col">Member</uui-table-head-cell>
          <uui-table-head-cell>Node Name</uui-table-head-cell>
          <uui-table-head-cell>
            ${p(this, n, v).call(this, "title", this._filterTitle, this._searchTitle, "All titles", (e) => this._searchTitle = e, (e) => {
      this._filterTitle = e, this._searchTitle = "";
    })}
          </uui-table-head-cell>
          <uui-table-head-cell>
            ${p(this, n, v).call(this, "organisations", this._filterOrganisation, this._searchOrganisation, "All organisations", (e) => this._searchOrganisation = e, (e) => {
      this._filterOrganisation = e, this._searchOrganisation = "";
    })}
          </uui-table-head-cell>
          <uui-table-head-cell>
            ${p(this, n, v).call(this, "organisers", this._filterOrganiser, this._searchOrganiser, "All organisers", (e) => this._searchOrganiser = e, (e) => {
      this._filterOrganiser = e, this._searchOrganiser = "";
    })}
          </uui-table-head-cell>
          <uui-table-head-cell>
            ${p(this, n, v).call(this, "destinations", this._filterDestination, this._searchDestination, "All destinations", (e) => this._searchDestination = e, (e) => {
      this._filterDestination = e, this._searchDestination = "";
    })}
          </uui-table-head-cell>
        </uui-table-head>
        ${t.map((e) => {
      const i = this._properties.get(e.unique);
      return b`
            <uui-table-row>
              <uui-table-cell class="member-col">
                ${i?.memberId ? b`
                  <uui-button
                    compact
                    look="default"
                    href=${p(this, n, M).call(this, i.memberId)}
                    label=${i.memberUsername}>
                    <uui-icon name="icon-user"></uui-icon>
                    ${i.memberUsername}
                  </uui-button>
                ` : ""}
              </uui-table-cell>
              <uui-table-cell>
                <uui-button
                  compact
                  look="default"
                  href=${p(this, n, q).call(this, e.unique)}
                  label=${e.variants?.[0]?.name ?? "(Untitled)"}>
                  ${e.variants?.[0]?.name ?? "(Untitled)"}
                </uui-button>
              </uui-table-cell>
              <uui-table-cell>${i?.title ?? ""}</uui-table-cell>
              <uui-table-cell>${i?.organisations ?? ""}</uui-table-cell>
              <uui-table-cell>${i?.organisers ?? ""}</uui-table-cell>
              <uui-table-cell>${i?.destinations ?? ""}</uui-table-cell>
            </uui-table-row>
          `;
    })}
      </uui-table>
    `;
  }
};
w = /* @__PURE__ */ new WeakMap();
n = /* @__PURE__ */ new WeakSet();
U = async function(t) {
  if (!t.length || !E(this, w)) return;
  const i = { Authorization: `Bearer ${await E(this, w).getLatestToken()}` }, s = await Promise.all(
    t.map(async (a) => {
      const h = { title: "", organisations: "", organisers: "", destinations: "", memberUsername: "", memberId: "" };
      try {
        const u = await fetch(`/umbraco/management/api/v1/document/${a.unique}`, { headers: i });
        if (!u.ok) return [a.unique, h];
        const g = await u.json(), $ = g.values?.find((l) => l.alias === "pageTitle")?.value ?? "", f = g.values?.find((l) => l.alias === "organisers")?.value?.contentData ?? [], k = [...new Set(f.map((l) => l.values?.find((m) => m.alias === "organiserOrganisation")?.value ?? "").filter(Boolean))].join(", "), N = f.map((l) => l.values?.find((m) => m.alias === "organiserName")?.value ?? "").filter(Boolean).join(", "), y = g.values?.find((l) => l.alias === "destinations")?.value;
        let C = "";
        if (y?.length) {
          const l = y.map((m) => m.unique).filter(Boolean);
          if (l.length) {
            const m = l.map((T) => `id=${T}`).join("&"), d = await fetch(`/umbraco/management/api/v1/item/document?${m}`, { headers: i });
            if (d.ok) {
              const T = await d.json();
              C = (T.items ?? T ?? []).map((I) => I.variants?.[0]?.name ?? "").filter(Boolean).join(", ");
            }
          }
        }
        let D = "", x = "";
        if (a.isProtected) {
          const l = await fetch(`/umbraco/management/api/v1/document/${a.unique}/public-access`, { headers: i });
          if (l.ok) {
            const d = (await l.json()).members?.[0];
            d && (x = d.id ?? "", D = d.variants?.[0]?.name ?? "");
          }
        }
        return [a.unique, { title: $, organisations: k, organisers: N, destinations: C, memberUsername: D, memberId: x }];
      } catch {
        return [a.unique, h];
      }
    })
  );
  this._properties = new Map(s);
};
q = function(t) {
  return X.generateAbsolute({ unique: t });
};
M = function(t) {
  return `/umbraco/section/member-management/workspace/member/edit/${t}/invariant`;
};
B = function(t) {
  const e = /* @__PURE__ */ new Set(), i = t === "title";
  for (const s of this._properties.values())
    if (i)
      s[t] && e.add(s[t]);
    else
      for (const a of s[t].split(", ").filter(Boolean))
        e.add(a);
  return Array.from(e).sort();
};
v = function(t, e, i, s, a, h) {
  const u = { value: "__all__", label: s }, g = p(this, n, B).call(this, t).filter(
    (c) => i ? c.toLowerCase().includes(i.toLowerCase()) : !0
  ), $ = !i || s.toLowerCase().includes(i.toLowerCase());
  return b`
      <uui-combobox
        placeholder=${s}
        .value=${e === "__all__" ? s : e}
        @search=${(c) => {
    const f = c.target?.search ?? "";
    a(f), f || h("__all__");
  }}
        @change=${(c) => {
    const f = c.composedPath()[0].value;
    h(f || "__all__");
  }}>
        <uui-combobox-list>
          ${$ ? b`<uui-combobox-list-option value=${u.value} .displayValue=${u.label}>${u.label}</uui-combobox-list-option>` : ""}
          ${g.map(
    (c) => b`<uui-combobox-list-option value=${c} .displayValue=${c}>${c}</uui-combobox-list-option>`
  )}
        </uui-combobox-list>
      </uui-combobox>
    `;
};
V = function() {
  return this._items.filter((t) => {
    const e = this._properties.get(t.unique);
    return e ? !(this._filterTitle !== "__all__" && e.title !== this._filterTitle || this._filterOrganisation !== "__all__" && !e.organisations.split(", ").includes(this._filterOrganisation) || this._filterOrganiser !== "__all__" && !e.organisers.split(", ").includes(this._filterOrganiser) || this._filterDestination !== "__all__" && !e.destinations.split(", ").includes(this._filterDestination)) : !0;
  });
};
r.styles = [
  H,
  S`
      :host {
        display: block;
        width: 100%;
      }

      uui-table-head-cell uui-combobox {
        width: 100%;
      }

      .member-col {
        width: 1px;
        white-space: nowrap;
      }

    `
];
o([
  _()
], r.prototype, "_items", 2);
o([
  _()
], r.prototype, "_properties", 2);
o([
  _()
], r.prototype, "_filterTitle", 2);
o([
  _()
], r.prototype, "_filterOrganisation", 2);
o([
  _()
], r.prototype, "_filterOrganiser", 2);
o([
  _()
], r.prototype, "_filterDestination", 2);
o([
  _()
], r.prototype, "_searchTitle", 2);
o([
  _()
], r.prototype, "_searchOrganisation", 2);
o([
  _()
], r.prototype, "_searchOrganiser", 2);
o([
  _()
], r.prototype, "_searchDestination", 2);
r = o([
  L("tt-tailored-tours-table-collection-view")
], r);
const te = r;
export {
  r as TailoredToursTableCollectionViewElement,
  te as default
};
//# sourceMappingURL=tailored-tours-table-collection-view.element-CNSspQuy.js.map
