import { html as p, css as w, state as d, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as M } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as D } from "@umbraco-cms/backoffice/modal";
var P = Object.defineProperty, U = Object.getOwnPropertyDescriptor, f = (t) => {
  throw TypeError(t);
}, u = (t, e, a, i) => {
  for (var s = i > 1 ? void 0 : i ? U(e, a) : e, l = t.length - 1, n; l >= 0; l--)
    (n = t[l]) && (s = (i ? n(e, a, s) : n(s)) || s);
  return i && s && P(e, a, s), s;
}, v = (t, e, a) => e.has(t) || f("Cannot " + a), _ = (t, e, a) => (v(t, e, "read from private field"), a ? a.call(t) : e.get(t)), b = (t, e, a) => e.has(t) ? f("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), m = (t, e, a) => (v(t, e, "access private method"), a), c, o, g, C, y, I, S;
let r = class extends D {
  constructor() {
    super(...arguments), b(this, o), this._tableColumns = [
      {
        name: "Name",
        alias: "name",
        allowSorting: !0
      }
    ], this._tableConfig = {
      allowSelection: !1
    }, this._tableItems = [], this._sortable = !1, b(this, c, /* @__PURE__ */ new Set());
  }
  firstUpdated() {
    const t = this.data?.items ?? [];
    this._tableItems = t.map((e) => ({
      id: e.id,
      icon: "icon-navigation",
      data: [
        {
          columnAlias: "name",
          value: e.name
        }
      ]
    })), this._sortable = t.length > 1;
  }
  render() {
    return p`
			<umb-body-layout headline=${this.data?.headline ?? "Sort"}>
				${this._tableItems.length === 0 ? m(this, o, I).call(this) : m(this, o, S).call(this)}
				<uui-button slot="actions" label="Cancel" @click=${this._rejectModal}></uui-button>
				<uui-button
					slot="actions"
					color="positive"
					look="primary"
					label="Save"
					@click=${m(this, o, y)}></uui-button>
			</umb-body-layout>
		`;
  }
};
c = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
g = function(t) {
  t.stopPropagation();
  const e = t.getItemId();
  _(this, c).add(e);
  const a = t.target;
  this._tableItems = a.items;
};
C = function(t) {
  t.stopPropagation();
  const e = t.target, a = e.orderingColumn, i = e.orderingDesc;
  this._tableItems = [...this._tableItems].sort((s, l) => {
    const n = s.data.find((h) => h.columnAlias === a), $ = l.data.find((h) => h.columnAlias === a);
    return a === "name" ? (n?.value).localeCompare($?.value) : 0;
  }), i && this._tableItems.reverse(), _(this, c).clear(), this._tableItems.map((s) => s.id).forEach((s) => _(this, c).add(s));
};
y = function() {
  const t = this._tableItems.map((e) => e.id);
  this.value = { sortedIds: t }, this._submitModal();
};
I = function() {
  return p`<uui-label>There are no items to sort</uui-label>`;
};
S = function() {
  return p`
			<umb-table
				.config=${this._tableConfig}
				.columns=${this._tableColumns}
				.items=${this._tableItems}
				.sortable=${this._sortable}
				@sorted=${m(this, o, g)}
				@ordered=${m(this, o, C)}></umb-table>
		`;
};
r.styles = [
  M,
  w`
			:host {
				display: block;
				height: 100%;
			}
		`
];
u([
  d()
], r.prototype, "_tableColumns", 2);
u([
  d()
], r.prototype, "_tableConfig", 2);
u([
  d()
], r.prototype, "_tableItems", 2);
u([
  d()
], r.prototype, "_sortable", 2);
r = u([
  E("up-doc-sort-modal")
], r);
export {
  r as UpDocSortModalElement,
  r as element
};
//# sourceMappingURL=up-doc-sort-modal.element-i7DaPusf.js.map
