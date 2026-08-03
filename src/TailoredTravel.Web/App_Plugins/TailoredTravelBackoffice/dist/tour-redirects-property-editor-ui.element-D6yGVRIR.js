import { html as l, css as y, property as E, state as u, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as C } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as T } from "@umbraco-cms/backoffice/auth";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as g } from "@umbraco-cms/backoffice/document";
var O = Object.defineProperty, P = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, n = (t, e, r, o) => {
  for (var i = o > 1 ? void 0 : o ? P(e, r) : e, d = t.length - 1, p; d >= 0; d--)
    (p = t[d]) && (i = (o ? p(e, r, i) : p(i)) || i);
  return o && i && O(e, r, i), i;
}, _ = (t, e, r) => e.has(t) || v("Cannot " + r), h = (t, e, r) => (_(t, e, "read from private field"), e.get(t)), f = (t, e, r) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), U = (t, e, r, o) => (_(t, e, "write to private field"), e.set(t, r), r), k = (t, e, r) => (_(t, e, "access private method"), r), a, c, m;
let s = class extends C {
  constructor() {
    super(), f(this, c), this.value = "", this._redirects = [], this._loaded = !1, f(this, a), this.consumeContext(T, (t) => {
      U(this, a, t);
    }), this.consumeContext(g, (t) => {
      t && this.observe(t.unique, (e) => {
        e && k(this, c, m).call(this, e);
      });
    });
  }
  render() {
    return !this._loaded || !this._redirects.length ? l`` : l`
      <ul>
        ${this._redirects.map((t) => l`<li><a href="https://www.tailored-travel.co.uk${t}" target="_blank" rel="noopener">${t}</a></li>`)}
      </ul>
    `;
  }
};
a = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakSet();
m = async function(t) {
  if (!h(this, a)) return;
  const e = await h(this, a).getLatestToken();
  try {
    const r = await fetch(`/umbraco/tailored-travel/tour-redirects/${t}`, {
      headers: { Authorization: `Bearer ${e}` }
    });
    if (!r.ok) return;
    this._redirects = await r.json();
  } finally {
    this._loaded = !0;
  }
};
s.styles = y`
    :host { display: block; }
    ul { list-style: none; margin: 0; padding: 0; }
    li { font-family: monospace; font-size: 0.875em; padding: 2px 0; }
  `;
n([
  E()
], s.prototype, "value", 2);
n([
  u()
], s.prototype, "_redirects", 2);
n([
  u()
], s.prototype, "_loaded", 2);
s = n([
  w("tt-tour-redirects-property-editor-ui")
], s);
const A = s;
export {
  s as TourRedirectsPropertyEditorUiElement,
  A as default
};
//# sourceMappingURL=tour-redirects-property-editor-ui.element-D6yGVRIR.js.map
