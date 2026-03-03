import { a as ze } from "./workflow.types-sXs8a86t.js";
import { g as it, b as at, h as st, i as T, j as z, k as ot, l as oe, m as Y, s as ne, n as nt, o as rt, p as lt, q as ct, r as Ce, u as ut, v as dt } from "./workflow.service-DcrxYgqr.js";
import { m as M, n as H } from "./transforms-BkZeboOX.js";
import { g as ke } from "./destination-utils-DUfOJy5W.js";
import { UmbModalToken as j, UMB_MODAL_MANAGER_CONTEXT as U } from "@umbraco-cms/backoffice/modal";
import { U as pt } from "./page-picker-modal.token-B0CgP9f1.js";
import { html as u, nothing as d, unsafeHTML as P, css as ht, state as x, customElement as ft } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as mt } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as gt } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as re } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as bt } from "@umbraco-cms/backoffice/workspace";
import { UMB_MEDIA_PICKER_MODAL as vt } from "@umbraco-cms/backoffice/media";
const xt = new j(
  "UpDoc.AreaEditorModal",
  {
    modal: {
      type: "sidebar",
      size: "large"
    }
  }
), _t = new j("UpDoc.AreaPickerModal", {
  modal: {
    type: "sidebar",
    size: "large"
  }
}), wt = new j(
  "UpDoc.SectionRulesEditorModal",
  {
    modal: {
      type: "sidebar",
      size: "medium"
    }
  }
), yt = new j("UpDoc.DestinationPickerModal", {
  modal: {
    type: "sidebar",
    size: "medium"
  }
});
var $t = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, Se = (e) => {
  throw TypeError(e);
}, v = (e, t, i, o) => {
  for (var n = o > 1 ? void 0 : o ? kt(t, i) : t, r = e.length - 1, l; r >= 0; r--)
    (l = e[r]) && (n = (o ? l(t, i, n) : l(n)) || n);
  return o && n && $t(t, i, n), n;
}, le = (e, t, i) => t.has(e) || Se("Cannot " + i), p = (e, t, i) => (le(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Q = (e, t, i) => t.has(e) ? Se("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Ae = (e, t, i, o) => (le(e, t, "write to private field"), t.set(e, i), i), s = (e, t, i) => (le(e, t, "access private method"), i), m, L, a, w, Me, ce, ue, de, Pe, Re, pe, C, E, he, fe, Z, N, Te, Ee, me, ge, ee, V, De, O, be, K, D, Ie, te, ve, ie, Ue, F, Le, Ne, Oe, ae, A, Ke, xe, R, We, Be, _e, se, Fe, He, je, Ve, Ge, G, q, W, qe, Je, Xe, J, k, Qe, Ye, Ze, et, we, B, tt, I;
let g = class extends mt {
  constructor() {
    super(...arguments), Q(this, a), this._extraction = null, this._areaDetection = null, this._config = null, this._workflowAlias = null, this._loading = !0, this._extracting = !1, this._error = null, this._successMessage = null, this._collapsed = /* @__PURE__ */ new Set(), this._transformResult = null, this._viewMode = "elements", this._sourceConfig = null, this._pageMode = "all", this._pageInputValue = "", this._collapsePopoverOpen = !1, this._excludedAreas = /* @__PURE__ */ new Set(), this._areaTemplate = null, this._sectionPickerOpen = !1, this._teachingAreaIndex = null, this._inferenceResult = null, this._inferring = !1, this._sampleUrl = "", Q(this, m, ""), Q(this, L, /* @__PURE__ */ new Set());
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(bt, (e) => {
      e && (e.setRefreshHandler(() => s(this, a, O).call(this)), this.observe(e.unique, (t) => {
        t && (this._workflowAlias = decodeURIComponent(t), s(this, a, Me).call(this));
      }));
    });
  }
  render() {
    if (this._loading)
      return u`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
    if (this._error)
      return u`
				<umb-body-layout header-fit-height>
					<p style="color: var(--uui-color-danger); padding: var(--uui-size-layout-1);">${this._error}</p>
				</umb-body-layout>`;
    p(this, a, w);
    const e = p(this, a, w) === "web", t = p(this, a, w) === "markdown", i = this._areaDetection !== null || this._extraction !== null;
    return t ? u`
				<umb-body-layout header-fit-height>
					${i ? s(this, a, W).call(this) : d}
					${i && this._viewMode === "elements" ? s(this, a, Qe).call(this) : d}
					${s(this, a, Z).call(this)}
					${this._successMessage ? u`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : d}
					${i ? s(this, a, Ye).call(this) : s(this, a, B).call(this)}
				</umb-body-layout>
			` : e ? u`
				<umb-body-layout header-fit-height>
					${i ? s(this, a, W).call(this) : d}
					${i && this._viewMode === "elements" ? s(this, a, Ze).call(this) : d}
					${s(this, a, Z).call(this)}
					${this._successMessage ? u`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : d}
					${i ? s(this, a, et).call(this) : s(this, a, B).call(this)}
				</umb-body-layout>
			` : u`
			<umb-body-layout header-fit-height>
				${i ? s(this, a, W).call(this) : d}
				${i && this._viewMode === "elements" ? s(this, a, qe).call(this) : d}
				${this._successMessage ? u`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : d}
				${i ? s(this, a, Je).call(this) : s(this, a, B).call(this)}
			</umb-body-layout>
		`;
  }
};
m = /* @__PURE__ */ new WeakMap();
L = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
w = function() {
  return this._sourceConfig?.sourceTypes?.[0] ?? "pdf";
};
Me = async function() {
  if (this._workflowAlias) {
    this._loading = !0, this._error = null;
    try {
      const e = await this.getContext(re);
      Ae(this, m, await e.getLatestToken());
      const [t, i, o] = await Promise.all([
        it(this._workflowAlias, p(this, m)),
        at(this._workflowAlias, p(this, m)),
        st(this._workflowAlias, p(this, m))
      ]);
      this._extraction = t, this._config = i, this._sourceConfig = o, this._excludedAreas = new Set(o?.excludedAreas ?? []), Ae(this, L, /* @__PURE__ */ new Set());
      for (const l of i?.validationWarnings ?? []) {
        const c = l.match(/blockKey '([^']+)' for target '([^']+)'/);
        c && p(this, L).add(`${c[1]}:${c[2]}`);
      }
      const n = (o?.sourceTypes?.[0] ?? "pdf") === "pdf", r = o?.sourceTypes?.[0] === "web";
      if (n) {
        const [l, c, h] = await Promise.all([
          T(this._workflowAlias, p(this, m)),
          z(this._workflowAlias, p(this, m)),
          ot(this._workflowAlias, p(this, m))
        ]);
        this._areaDetection = l, this._transformResult = c, this._areaTemplate = h;
        const f = t?.source.mediaKey;
        if (f && l) {
          const b = await oe(this._workflowAlias, f, p(this, m));
          b && (this._transformResult = b);
        }
        o?.pages && Array.isArray(o.pages) && o.pages.length > 0 ? (this._pageMode = "custom", this._pageInputValue = s(this, a, ue).call(this, o.pages)) : (this._pageMode = "all", this._pageInputValue = "");
      } else if (r) {
        const [l, c] = await Promise.all([
          T(this._workflowAlias, p(this, m)),
          z(this._workflowAlias, p(this, m))
        ]);
        this._areaDetection = l, this._transformResult = c;
      } else {
        const [l, c] = await Promise.all([
          T(this._workflowAlias, p(this, m)),
          z(this._workflowAlias, p(this, m))
        ]);
        this._areaDetection = l, this._transformResult = c;
      }
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Failed to load data", console.error("Failed to load source data:", e);
    } finally {
      this._loading = !1;
    }
  }
};
ce = function(e) {
  const t = /* @__PURE__ */ new Set();
  for (const i of e.split(",")) {
    const o = i.trim();
    if (!o) continue;
    const n = o.split("-").map((r) => parseInt(r.trim(), 10));
    if (n.length === 1 && !isNaN(n[0]))
      t.add(n[0]);
    else if (n.length === 2 && !isNaN(n[0]) && !isNaN(n[1]))
      for (let r = n[0]; r <= n[1]; r++)
        t.add(r);
  }
  return [...t].sort((i, o) => i - o);
};
ue = function(e) {
  if (!e.length) return "";
  const t = [...e].sort((r, l) => r - l), i = [];
  let o = t[0], n = t[0];
  for (let r = 1; r < t.length; r++)
    t[r] === n + 1 || (i.push(o === n ? `${o}` : `${o}-${n}`), o = t[r]), n = t[r];
  return i.push(o === n ? `${o}` : `${o}-${n}`), i.join(", ");
};
de = function() {
  if (this._pageMode === "all") return null;
  const e = s(this, a, ce).call(this, this._pageInputValue);
  return e.length > 0 ? e : null;
};
Pe = function(e) {
  if (this._pageMode === "all") return !0;
  const t = s(this, a, ce).call(this, this._pageInputValue);
  return t.length === 0 || t.includes(e);
};
Re = async function() {
  if (!this._workflowAlias) return;
  const e = s(this, a, de).call(this);
  await lt(this._workflowAlias, e, p(this, m));
};
pe = function(e) {
  if (!this._areaDetection) return [];
  const t = [];
  for (const i of this._areaDetection.pages) {
    const o = i.page;
    e === "pages" && t.push(`page-${o}`), e === "areas" && i.areas.forEach((n, r) => t.push(`area-p${o}-a${r}`)), e === "sections" && (i.areas.forEach((n, r) => {
      n.sections.forEach((l, c) => t.push(`p${o}-a${r}-s${c}`));
    }), i.areas.forEach((n) => {
      s(this, a, xe).call(this, n, o).forEach((l) => t.push(`composed-${l.id}`));
    }));
  }
  return t;
};
C = function(e) {
  const t = s(this, a, pe).call(this, e);
  return t.length > 0 && t.every((i) => this._collapsed.has(i));
};
E = function(e) {
  const t = s(this, a, pe).call(this, e), i = s(this, a, C).call(this, e), o = new Set(this._collapsed);
  for (const n of t)
    i ? o.delete(n) : o.add(n);
  this._collapsed = o;
};
he = function() {
  this._collapsed = /* @__PURE__ */ new Set();
};
fe = function(e) {
  this._collapsePopoverOpen = e.newState === "open";
};
Z = function() {
  return !this._areaDetection || this._viewMode !== "elements" ? d : u`
			<div class="collapse-row">
				<uui-button
					look="outline"
					compact
					label="Collapse"
					popovertarget="collapse-level-popover">
					Collapse
					<uui-symbol-expand .open=${this._collapsePopoverOpen}></uui-symbol-expand>
				</uui-button>
				<uui-popover-container
					id="collapse-level-popover"
					placement="bottom-start"
					@toggle=${s(this, a, fe)}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => s(this, a, he).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="${s(this, a, C).call(this, "areas") ? "Expand" : "Collapse"} Areas"
							@click=${() => s(this, a, E).call(this, "areas")}>
							<uui-icon slot="icon" name="icon-grid"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="${s(this, a, C).call(this, "sections") ? "Expand" : "Collapse"} Sections"
							@click=${() => s(this, a, E).call(this, "sections")}>
							<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		`;
};
N = async function() {
  if (!this._workflowAlias) return;
  const i = await (await this.getContext(U)).open(this, vt, {
    data: {
      multiple: !1
    }
  }).onSubmit().catch(() => null);
  if (!i?.selection?.length) return;
  const o = i.selection[0];
  o && await s(this, a, be).call(this, o);
};
Te = async function() {
  if (!this._workflowAlias) return;
  const t = (await this.getContext(U)).open(this, xt, {
    data: {
      workflowAlias: this._workflowAlias,
      existingTemplate: this._areaTemplate,
      selectedPages: this._sourceConfig?.pages && Array.isArray(this._sourceConfig.pages) ? this._sourceConfig.pages : null
    }
  });
  try {
    const i = await t.onSubmit();
    if (i?.template) {
      const o = await ne(this._workflowAlias, i.template, p(this, m));
      o && (this._areaTemplate = o, await s(this, a, O).call(this));
    }
  } catch {
  }
};
Ee = async function() {
  if (!this._workflowAlias || !this._areaDetection) return;
  const e = this._areaDetection.pages.flatMap(
    (o) => o.areas.map((n) => ({
      name: n.name || "Unnamed",
      elementCount: n.totalElements,
      color: n.color
    }))
  ), i = (await this.getContext(U)).open(this, _t, {
    data: {
      areas: e,
      excludedAreas: [...this._excludedAreas],
      containers: this._extraction?.containers ?? null,
      containerOverrides: this._sourceConfig?.containerOverrides ?? []
    }
  });
  try {
    const o = await i.onSubmit();
    if (o) {
      if (JSON.stringify(o.containerOverrides ?? []) !== JSON.stringify(this._sourceConfig?.containerOverrides ?? [])) {
        const l = await nt(
          this._workflowAlias,
          o.containerOverrides ?? [],
          p(this, m)
        );
        l != null && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, containerOverrides: l });
        const [c, h] = await Promise.all([
          T(this._workflowAlias, p(this, m)),
          z(this._workflowAlias, p(this, m))
        ]);
        c && (this._areaDetection = c), h && (this._transformResult = h);
      }
      if (JSON.stringify([...o.excludedAreas].sort()) !== JSON.stringify([...this._excludedAreas].sort())) {
        this._excludedAreas = new Set(o.excludedAreas);
        const l = await rt(this._workflowAlias, o.excludedAreas, p(this, m));
        l != null && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, excludedAreas: l });
        const c = await z(this._workflowAlias, p(this, m));
        c && (this._transformResult = c);
      }
    }
  } catch {
  }
};
me = function() {
  if (!this._areaDetection) return [];
  const e = [], t = /* @__PURE__ */ new Set();
  for (const i of this._areaDetection.pages)
    for (const o of i.areas) {
      const n = o.name || "Area", r = H(n);
      if (t.has(r)) continue;
      t.add(r);
      const l = s(this, a, F).call(this, o), c = this._sourceConfig?.areaRules?.[r], h = !!c && ((c.groups?.length ?? 0) > 0 || (c.rules?.length ?? 0) > 0);
      e.push({ areaKey: r, areaName: n, elements: l, hasRules: h });
    }
  return e;
};
ge = function(e) {
  this._sectionPickerOpen = e.newState === "open";
};
ee = async function(e, t) {
  if (!this._workflowAlias) return;
  const i = {
    ...this._sourceConfig?.areaRules ?? {}
  };
  t.groups.length > 0 || t.rules.length > 0 ? i[e] = t : delete i[e];
  const n = await ct(this._workflowAlias, i, p(this, m));
  n && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, areaRules: n });
  const r = this._extraction?.source.mediaKey;
  if (r) {
    const l = await oe(this._workflowAlias, r, p(this, m));
    l && (this._transformResult = l);
  }
};
V = async function(e, t, i, o) {
  if (!this._workflowAlias) return;
  const n = this._sourceConfig?.areaRules?.[e] ?? null, l = (await this.getContext(U)).open(this, wt, {
    data: {
      workflowAlias: this._workflowAlias,
      sectionId: e,
      sectionHeading: t,
      elements: i,
      existingRules: n,
      sectionCount: o,
      sourceType: p(this, a, w),
      onSave: async (c) => {
        await s(this, a, ee).call(this, e, c);
      }
    }
  });
  try {
    const c = await l.onSubmit();
    c?.rules && await s(this, a, ee).call(this, e, c.rules);
  } catch {
  }
};
De = async function() {
  const e = this._extraction?.source.mediaKey;
  if (!e) return;
  const t = this._areaDetection?.totalPages ?? this._extraction?.source.totalPages ?? 0;
  if (t === 0) return;
  const i = s(this, a, de).call(this), r = await (await this.getContext(U)).open(this, pt, {
    data: { mediaKey: e, totalPages: t, selectedPages: i }
  }).onSubmit().catch(() => null);
  r !== null && (r.selectedPages === null ? (this._pageMode = "all", this._pageInputValue = "") : (this._pageMode = "custom", this._pageInputValue = s(this, a, ue).call(this, r.selectedPages)), await s(this, a, Re).call(this));
};
O = async function() {
  if (p(this, a, w) === "web") {
    const t = this._extraction?.source.fileName;
    return t ? s(this, a, I).call(this, t) : void 0;
  }
  const e = this._extraction?.source.mediaKey;
  if (!e)
    return s(this, a, N).call(this);
  await s(this, a, be).call(this, e);
};
be = async function(e) {
  if (this._workflowAlias) {
    this._extracting = !0, this._error = null;
    try {
      const i = await (await this.getContext(re)).getLatestToken();
      if (p(this, a, w) === "pdf") {
        const [n, r] = await Promise.all([
          Y(this._workflowAlias, e, i),
          oe(this._workflowAlias, e, i)
        ]);
        if (n && (this._extraction = n), r) {
          this._transformResult = r;
          const l = await T(this._workflowAlias, i);
          this._areaDetection = l;
          const c = r.diagnostics, h = c.roleSections > 0 ? `, ${c.roleSections} role` : "";
          this._successMessage = `Content extracted — ${c.totalSections} sections (${c.bulletListSections} bullet, ${c.paragraphSections} paragraph, ${c.subHeadedSections} sub-headed${h})`, setTimeout(() => {
            this._successMessage = null;
          }, 5e3);
        } else n ? (this._successMessage = `Content extracted — ${n.elements.length} elements (transform unavailable)`, setTimeout(() => {
          this._successMessage = null;
        }, 5e3)) : this._error = "Extraction failed. Check that the selected media item is a PDF.";
      } else {
        const n = await Y(this._workflowAlias, e, i);
        if (n) {
          this._extraction = n;
          const r = await z(this._workflowAlias, i);
          this._transformResult = r, this._successMessage = `Content extracted — ${n.elements.length} elements`, setTimeout(() => {
            this._successMessage = null;
          }, 5e3);
        } else
          this._error = `Extraction failed. Check that the selected media item is a valid ${p(this, a, w)} file.`;
      }
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Extraction failed", console.error("Extraction failed:", t);
    } finally {
      this._extracting = !1;
    }
  }
};
K = function(e) {
  return this._collapsed.has(e);
};
D = function(e) {
  const t = new Set(this._collapsed);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsed = t;
};
Ie = function(e) {
  return this._transformResult ? ze(this._transformResult).find((i) => i.id === e)?.included ?? !0 : !0;
};
te = async function(e, t) {
  if (!this._workflowAlias) return;
  const i = await ut(this._workflowAlias, e, t, p(this, m));
  i && (this._transformResult = i);
};
ve = function(e) {
  if (!this._config?.map?.mappings) return [];
  const t = [];
  for (const i of this._config.map.mappings)
    if (i.source === e && i.enabled)
      for (const o of i.destinations)
        t.push(o);
  return t;
};
ie = function(e) {
  if (!this._config?.destination) return e.target;
  if (e.blockKey)
    for (const i of ke(this._config.destination)) {
      const o = i.blocks.find((n) => n.key === e.blockKey);
      if (o) {
        const n = o.properties?.find((r) => r.alias === e.target);
        return `${o.label} > ${n?.label || e.target}`;
      }
    }
  const t = this._config.destination.fields.find((i) => i.alias === e.target);
  if (t) return t.label;
  for (const i of ke(this._config.destination))
    for (const o of i.blocks) {
      const n = o.properties?.find((r) => r.alias === e.target);
      if (n) return `${o.label} > ${n.label || n.alias}`;
    }
  return e.target;
};
Ue = function(e, t) {
  if (!this._areaDetection) return t;
  let i = 0;
  for (const o of this._areaDetection.pages) {
    if (o.page === e) return i + t;
    i += o.areas.length;
  }
  return i + t;
};
F = function(e) {
  const t = [];
  for (const i of e.sections)
    i.heading && t.push(i.heading), t.push(...i.children);
  return t;
};
Le = async function(e) {
  if (!(this._teachingAreaIndex === null || !this._workflowAlias || this._inferring)) {
    this._inferring = !0, this._inferenceResult = null;
    try {
      const t = await dt(
        this._workflowAlias,
        this._teachingAreaIndex,
        e,
        p(this, m)
      );
      this._inferenceResult = t;
    } catch (t) {
      console.error("Inference failed:", t), this._error = "Failed to infer section pattern";
    } finally {
      this._inferring = !1;
    }
  }
};
Ne = async function() {
  if (this._teachingAreaIndex === null || !this._inferenceResult || !this._workflowAlias || !this._areaTemplate) return;
  const e = this._teachingAreaIndex;
  if (e < 0 || e >= this._areaTemplate.areas.length) return;
  const t = [...this._areaTemplate.areas];
  t[e] = { ...t[e], sectionPattern: this._inferenceResult.pattern };
  const i = { ...this._areaTemplate, areas: t }, o = await ne(this._workflowAlias, i, p(this, m));
  o && (this._areaTemplate = o, this._teachingAreaIndex = null, this._inferenceResult = null, await s(this, a, O).call(this));
};
Oe = async function() {
  if (this._teachingAreaIndex === null || !this._workflowAlias || !this._areaTemplate) return;
  const e = this._teachingAreaIndex;
  if (e < 0 || e >= this._areaTemplate.areas.length) return;
  const t = [...this._areaTemplate.areas];
  t[e] = { ...t[e], sectionPattern: { conditions: [] } };
  const i = { ...this._areaTemplate, areas: t }, o = await ne(this._workflowAlias, i, p(this, m));
  o && (this._areaTemplate = o, this._teachingAreaIndex = null, this._inferenceResult = null, await s(this, a, O).call(this));
};
ae = function() {
  this._teachingAreaIndex = null, this._inferenceResult = null, this._inferring = !1;
};
A = function(e) {
  return H(e.name || "");
};
Ke = function(e) {
  const t = s(this, a, A).call(this, e), i = this._sourceConfig?.areaRules?.[t];
  return i ? (i.groups?.length ?? 0) > 0 || (i.rules?.length ?? 0) > 0 : !1;
};
xe = function(e, t) {
  if (!this._transformResult) return [];
  const i = this._transformResult.areas.find(
    (n) => n.color === e.color && n.page === t
  );
  if (!i) return [];
  const o = [];
  for (const n of i.groups)
    o.push(...n.sections);
  return o.push(...i.sections), o;
};
R = async function(e, t = "content") {
  if (!this._workflowAlias || !this._config?.destination) return;
  const o = (await this.getContext(U)).open(this, yt, {
    data: {
      destination: this._config.destination,
      existingMappings: this._config.map?.mappings ?? []
    }
  });
  let n;
  try {
    n = await o.onSubmit();
  } catch {
    return;
  }
  if (!n?.selectedTargets?.length) return;
  const r = `${e.id}.${t}`, l = this._config.map?.mappings ?? [], c = {
    source: r,
    destinations: n.selectedTargets.map((y) => ({ target: y.target, blockKey: y.blockKey, contentTypeKey: y.contentTypeKey })),
    enabled: !0
  }, h = l.findIndex((y) => y.source === r), f = h >= 0 ? l.map((y, S) => S === h ? c : y) : [...l, c], b = {
    ...this._config.map ?? { version: "1.0", mappings: [] },
    mappings: f
  }, _ = await Ce(this._workflowAlias, b, p(this, m));
  _ && (this._config = { ...this._config, map: _ });
};
We = async function(e, t) {
  if (!this._workflowAlias || !this._config?.map) return;
  const i = this._config.map.mappings, o = i.findIndex((f) => f.source === e);
  if (o < 0) return;
  const r = i[o].destinations.filter(
    (f) => !(f.target === t.target && f.blockKey === t.blockKey)
  );
  let l;
  r.length === 0 ? l = i.filter((f, b) => b !== o) : l = i.map(
    (f, b) => b === o ? { ...f, destinations: r } : f
  );
  const c = { ...this._config.map, mappings: l }, h = await Ce(this._workflowAlias, c, p(this, m));
  h && (this._config = { ...this._config, map: h });
};
Be = function(e) {
  const t = ["content", "heading", "title", "description", "summary"], i = t.some((c) => s(this, a, ve).call(this, `${e.id}.${c}`).length > 0), o = `composed-${e.id}`, n = s(this, a, K).call(this, o), r = e.groupName ?? e.ruleName ?? (e.areaName ? `${e.areaName} - Section` : "Section"), l = !!e.groupName;
  return u`
			<div class="section-box">
				<div class="section-box-header" @click=${() => s(this, a, D).call(this, o)}>
					<uui-icon class="collapse-chevron" name="${n ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon class="level-icon" name="icon-thumbnail-list"></uui-icon>
					<span class="section-box-label">${r}</span>
					<span class="header-spacer"></span>
					${i && n ? t.map((c) => s(this, a, k).call(this, `${e.id}.${c}`)) : d}
				</div>
				${n ? d : u`
					<div class="section-box-content">
						${l ? u`
							${e.heading ? u`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Title</span>
										<div class="part-box-content">${P(M(e.heading))}</div>
										<div class="part-box-actions">
											${s(this, a, k).call(this, `${e.id}.title`)}
											${s(this, a, k).call(this, `${e.id}.heading`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), s(this, a, R).call(this, e, "title");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : d}
							${e.content ? u`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Content</span>
										<div class="part-box-content">${P(M(e.content))}</div>
										<div class="part-box-actions">
											${s(this, a, k).call(this, `${e.id}.content`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), s(this, a, R).call(this, e, "content");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : d}
							${e.description ? u`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Description</span>
										<div class="part-box-content">${P(M(e.description))}</div>
										<div class="part-box-actions">
											${s(this, a, k).call(this, `${e.id}.description`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), s(this, a, R).call(this, e, "description");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : d}
							${e.summary ? u`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Summary</span>
										<div class="part-box-content">${P(M(e.summary))}</div>
										<div class="part-box-actions">
											${s(this, a, k).call(this, `${e.id}.summary`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), s(this, a, R).call(this, e, "summary");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : d}
						` : u`
							${e.content ? u`
								<div class="part-box-row">
									<div class="part-box-content">${P(M(e.content))}</div>
									<div class="part-box-actions">
										${t.map((c) => s(this, a, k).call(this, `${e.id}.${c}`))}
										<uui-button class="md-map-btn" look="outline" compact label="Map"
											@click=${(c) => {
    c.stopPropagation(), s(this, a, R).call(this, e, "content");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
									</div>
								</div>
							` : d}
						`}
					</div>
				`}
			</div>
		`;
};
_e = function(e) {
  const t = e.trimStart();
  return /^[•\-\*▪▸▶►●○◦‣⁃]/.test(t) || /^\d+[\.\)]\s/.test(t) ? "list" : "paragraph";
};
se = function(e, t) {
  const i = t === "heading" ? "heading" : s(this, a, _e).call(this, e.text), o = i === "heading" ? "Heading" : i === "list" ? "List Item" : "Paragraph", n = e.htmlTag || e.fontName, r = e.htmlContainerPath ? e.htmlContainerPath.split("/").pop() ?? "" : "";
  return u`
			<div class="element-item">
				<div class="element-content">
					<div class="element-text">${e.text}</div>
					<div class="element-meta">
						<span class="meta-badge text-type ${i}">${o}</span>
						<span class="meta-badge font-size">${e.fontSize}pt</span>
						<span class="meta-badge font-name">${n}</span>
						<span class="meta-badge color" style="border-left: 3px solid ${e.color};">${e.color}</span>
						${r ? u`<span class="meta-badge container-path" title="${e.htmlContainerPath ?? ""}">${r}</span>` : d}
						${e.text === e.text.toUpperCase() && e.text !== e.text.toLowerCase() ? u`<span class="meta-badge text-case">UPPERCASE</span>` : d}
					</div>
				</div>
			</div>
		`;
};
Fe = function(e, t, i, o) {
  const n = s(this, a, K).call(this, t), r = e.heading ? H(e.heading.text) : `preamble-p${i}-a${o}`, l = s(this, a, Ie).call(this, r);
  if (!e.heading)
    return u`
				<div class="area-section ${l ? "" : "excluded"}">
					<div class="section-heading preamble" @click=${() => s(this, a, D).call(this, t)}>
						<uui-icon class="collapse-chevron" name="${n ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
						<span class="heading-text preamble-label">Content</span>
						<span class="group-count">${e.children.length} element${e.children.length !== 1 ? "s" : ""}</span>
						<uui-toggle
							label="${l ? "Included" : "Excluded"}"
							?checked=${l}
							@click=${(b) => b.stopPropagation()}
							@change=${(b) => s(this, a, te).call(this, r, b.target.checked)}>
						</uui-toggle>
					</div>
					${l && !n ? u`
						${e.children.map((b) => s(this, a, se).call(this, b))}
					` : d}
				</div>
			`;
  const c = e.heading, h = e.children.length, f = h > 0;
  return u`
			<div class="area-section ${l ? "" : "excluded"}">
				<div class="section-heading" @click=${f ? () => s(this, a, D).call(this, t) : d}>
					${f ? u`<uui-icon class="collapse-chevron" name="${n ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>` : u`<uui-icon class="collapse-chevron placeholder"></uui-icon>`}
					<uui-icon class="level-icon" name="icon-thumbnail-list"></uui-icon>
					<span class="heading-text" title="${c.text}">${c.text}</span>
					${f ? u`<span class="group-count">${h} element${h !== 1 ? "s" : ""}</span>` : d}
					<uui-toggle
						label="${l ? "Included" : "Excluded"}"
						?checked=${l}
						@click=${(b) => b.stopPropagation()}
						@change=${(b) => s(this, a, te).call(this, r, b.target.checked)}>
					</uui-toggle>
				</div>
				${f && !n && l ? u`
					<div class="section-children">
						${e.children.map((b) => s(this, a, se).call(this, b))}
					</div>
				` : d}
			</div>
		`;
};
He = function(e) {
  const t = this._inferenceResult?.clickedElementId === e.id, i = this._inferenceResult?.matchingElementIds?.includes(e.id) ?? !1, o = s(this, a, _e).call(this, e.text), n = o === "list" ? "List Item" : "Paragraph", r = e.htmlTag || e.fontName, l = e.htmlContainerPath ? e.htmlContainerPath.split("/").pop() ?? "" : "";
  return u`
			<div class="element-item teach-element ${t ? "teach-clicked" : ""} ${i ? "teach-matched" : ""}"
				@click=${() => s(this, a, Le).call(this, e.id)}>
				<div class="element-content">
					<div class="element-text">${e.text}</div>
					<div class="element-meta">
						<span class="meta-badge text-type ${o}">${n}</span>
						<span class="meta-badge font-size">${e.fontSize}pt</span>
						<span class="meta-badge font-name">${r}</span>
						<span class="meta-badge color" style="border-left: 3px solid ${e.color};">${e.color}</span>
						${l ? u`<span class="meta-badge container-path" title="${e.htmlContainerPath ?? ""}">${l}</span>` : d}
						${e.text === e.text.toUpperCase() && e.text !== e.text.toLowerCase() ? u`<span class="meta-badge text-case">UPPERCASE</span>` : d}
					</div>
				</div>
			</div>
		`;
};
je = function() {
  if (this._inferenceResult) {
    const e = this._inferenceResult.matchingElementIds.length, t = this._inferenceResult.pattern.conditions.map((i) => `${i.type}: ${i.value}`).join(", ");
    return u`
				<div class="teach-confirmation">
					<div class="teach-confirmation-info">
						<uui-icon name="icon-check" style="color: var(--uui-color-positive);"></uui-icon>
						<span>Found <strong>${e}</strong> matching element${e !== 1 ? "s" : ""}</span>
						<span class="teach-condition-summary">${t}</span>
					</div>
					<div class="teach-confirmation-actions">
						<uui-button look="primary" color="default" label="Confirm" @click=${() => s(this, a, Ne).call(this)}>
							<uui-icon name="icon-check"></uui-icon> Confirm
						</uui-button>
						<uui-button look="secondary" label="Cancel" @click=${() => s(this, a, ae).call(this)}>Cancel</uui-button>
					</div>
				</div>
			`;
  }
  return u`
			<div class="teach-toolbar">
				<span class="teach-instruction">
					${this._inferring ? u`<uui-loader-bar></uui-loader-bar> Analysing...` : u`Click a section heading, or <strong>No Sections</strong> if this area has no repeating structure`}
				</span>
				<div class="teach-toolbar-actions">
					<uui-button look="secondary" compact label="No Sections" @click=${() => s(this, a, Oe).call(this)}
						title="This area has no repeating section structure">
						No Sections
					</uui-button>
					<uui-button look="default" compact label="Cancel" @click=${() => s(this, a, ae).call(this)}>Cancel</uui-button>
				</div>
			</div>
		`;
};
Ve = function(e, t, i) {
  const o = `area-p${t}-a${i}`, n = s(this, a, Ue).call(this, t, i), r = this._teachingAreaIndex === n, l = r ? !1 : s(this, a, K).call(this, o), c = s(this, a, A).call(this, e), h = s(this, a, Ke).call(this, e), f = h && this._transformResult ? s(this, a, xe).call(this, e, t) : [], b = h && f.length > 0, _ = b ? f.length : e.sections.length, S = e.sectionPattern != null ? e.sectionPattern.conditions.length > 0 ? "Configured" : "Flat" : null, ye = this._sourceConfig?.areaRules?.[c], $e = (ye?.rules?.length ?? 0) + (ye?.groups?.reduce(($, X) => $ + X.rules.length, 0) ?? 0);
  return u`
			<div class="detected-area ${r ? "area-teaching" : ""}" style="border-left-color: ${e.color};">
				<div class="area-header" @click=${() => !r && s(this, a, D).call(this, o)}>
					<uui-icon class="collapse-chevron" name="${l ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon class="level-icon" name="icon-grid"></uui-icon>
					<span class="area-name">${e.name || `${i + 1}`}</span>
					${h ? u`<span class="meta-badge rules-info">${$e} rule${$e !== 1 ? "s" : ""}</span>` : d}
					${!h && S ? u`<span class="meta-badge structure-badge">${S}</span>` : d}
					<span class="header-spacer"></span>
					${r ? d : u`
						<uui-button
							look="primary"
							color="default"
							label="Sections"
							@click=${($) => {
    $.stopPropagation(), s(this, a, V).call(this, c, e.name || "", s(this, a, F).call(this, e), _);
  }}
							?disabled=${this._teachingAreaIndex !== null}>
							<uui-icon name="icon-thumbnail-list"></uui-icon>
							Sections
							<uui-badge color="danger" look="primary">${_}</uui-badge>
						</uui-button>
					`}
				</div>
				${l ? d : u`
					${r ? u`
						${s(this, a, je).call(this)}
						<div class="teach-elements">
							${s(this, a, F).call(this, e).map(($) => s(this, a, He).call(this, $))}
						</div>
					` : b ? u`
						<div class="composed-sections">
							${f.map(($) => s(this, a, Be).call(this, $))}
						</div>
					` : u`
						${e.sections.map(
    ($, X) => s(this, a, Fe).call(this, $, `p${t}-a${i}-s${X}`, t, i)
  )}
					`}
				`}
			</div>
		`;
};
Ge = function(e, t) {
  const i = t.filter((h) => {
    const f = s(this, a, A).call(this, h);
    return !this._excludedAreas.has(f);
  });
  if (i.length === 0) return d;
  const o = `page-${e}`, n = s(this, a, K).call(this, o), r = i.length, l = i.reduce((h, f) => h + f.sections.length, 0), c = s(this, a, Pe).call(this, e);
  return u`
			<uui-box class="page-box ${c ? "" : "page-excluded"}">
				<div slot="header" class="tree-header" @click=${() => s(this, a, D).call(this, o)}>
					<uui-icon class="collapse-chevron" name="${n ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon class="level-icon" name="icon-document"></uui-icon>
					<strong class="page-title">Page ${e}</strong>
				</div>
				<div slot="header-actions" class="page-header-actions">
					<span class="group-count">${l} section${l !== 1 ? "s" : ""}, ${r} area${r !== 1 ? "s" : ""}</span>
				</div>
				${n ? d : u`
					${i.map((h, f) => s(this, a, Ve).call(this, h, e, f))}
				`}
			</uui-box>
		`;
};
G = function() {
  return this._areaDetection ? u`
			${this._areaDetection.pages.map(
    (e) => s(this, a, Ge).call(this, e.page, e.areas)
  )}
		` : d;
};
q = function() {
  return this._areaDetection ? this._areaDetection.pages.reduce((e, t) => e + t.areas.filter((i) => !this._excludedAreas.has(s(this, a, A).call(this, i))).reduce((i, o) => i + o.sections.length, 0), 0) : 0;
};
W = function() {
  return u`
			<div slot="header" class="source-header">
				<uui-tab-group dropdown-content-direction="vertical">
					<uui-tab label="Extracted" ?active=${this._viewMode === "elements"} @click=${() => {
    this._viewMode = "elements";
  }}>Extracted</uui-tab>
					<uui-tab label="Transformed" ?active=${this._viewMode === "transformed"} @click=${() => {
    this._viewMode = "transformed";
  }} ?disabled=${!this._transformResult}>Transformed</uui-tab>
				</uui-tab-group>
			</div>
		`;
};
qe = function() {
  const e = this._areaDetection !== null, t = this._extraction !== null;
  if (!e && !t) return d;
  const i = this._areaDetection?.totalPages ?? (t ? this._extraction.source.totalPages : 0), o = this._sourceConfig?.pages, n = Array.isArray(o) && o.length > 0, r = n ? o.length : i, l = n && i > 0 ? `${r} of ${i}` : `${i}`, c = e ? this._areaDetection.pages.reduce((_, y) => _ + y.areas.filter((S) => !this._excludedAreas.has(s(this, a, A).call(this, S))).length, 0) : 0, h = e ? s(this, a, q).call(this) : 0, f = t ? this._extraction.source.fileName : "", b = t ? new Date(this._extraction.source.extractedDate).toLocaleString() : "";
  return u`
			<div class="info-boxes">
				<uui-box class="info-box-item">
					<div slot="headline" class="box-headline-row">
						<span>Source</span>
						<span class="box-headline-meta">${b}</span>
					</div>
					<div class="box-content">
						<uui-icon name="icon-page-add" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${f}">${f}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Source" @click=${s(this, a, N)} ?disabled=${this._extracting}>
								<uui-icon name="icon-page-add"></uui-icon>
								Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Pages" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-document" class="box-icon"></uui-icon>
						<span class="box-stat">${l}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Pages" @click=${s(this, a, De)}>
								<uui-icon name="icon-document"></uui-icon>
								Pages
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${this._areaTemplate ? this._areaTemplate.areas.length : c}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Areas" @click=${s(this, a, Te)}>
								<uui-icon name="icon-grid"></uui-icon>
								Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${h}</span>
						${this._transformResult && this._areaDetection ? u`
							<div class="box-buttons">
								<uui-button
									look="primary"
									color="default"
									label="Sections"
									popovertarget="section-picker-popover">
									<uui-icon name="icon-thumbnail-list"></uui-icon>
									Sections
									<uui-symbol-expand .open=${this._sectionPickerOpen}></uui-symbol-expand>
								</uui-button>
								<uui-popover-container
									id="section-picker-popover"
									placement="bottom-end"
									@toggle=${s(this, a, ge)}>
									<umb-popover-layout>
										<div class="popover-heading">Areas</div>
										${s(this, a, me).call(this).map((_) => u`
											<uui-menu-item
												label="${_.areaName}"
												@click=${() => s(this, a, V).call(this, _.areaKey, _.areaName, _.elements)}>
												<uui-icon slot="icon" name="${_.hasRules ? "icon-check" : "icon-thumbnail-list"}"></uui-icon>
												<span slot="badge" class="section-picker-meta">${_.elements.length} el</span>
											</uui-menu-item>
										`)}
									</umb-popover-layout>
								</uui-popover-container>
							</div>
						` : d}
					</div>
				</uui-box>
			</div>

			${e ? u`
				<div class="collapse-row">
					<uui-button
						look="outline"
						compact
						label="Collapse"
						popovertarget="collapse-level-popover">
						Collapse
						<uui-symbol-expand .open=${this._collapsePopoverOpen}></uui-symbol-expand>
					</uui-button>
					<uui-popover-container
						id="collapse-level-popover"
						placement="bottom-start"
						@toggle=${s(this, a, fe)}>
						<umb-popover-layout>
							<uui-menu-item
								label="Expand All"
								@click=${() => s(this, a, he).call(this)}>
								<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${s(this, a, C).call(this, "pages") ? "Expand" : "Collapse"} Pages"
								@click=${() => s(this, a, E).call(this, "pages")}>
								<uui-icon slot="icon" name="icon-document"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${s(this, a, C).call(this, "areas") ? "Expand" : "Collapse"} Areas"
								@click=${() => s(this, a, E).call(this, "areas")}>
								<uui-icon slot="icon" name="icon-grid"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${s(this, a, C).call(this, "sections") ? "Expand" : "Collapse"} Sections"
								@click=${() => s(this, a, E).call(this, "sections")}>
								<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
							</uui-menu-item>
						</umb-popover-layout>
					</uui-popover-container>
				</div>
			` : d}
		`;
};
Je = function() {
  const e = this._areaDetection !== null;
  return this._viewMode === "elements" ? e ? s(this, a, G).call(this) : d : s(this, a, J).call(this);
};
Xe = function() {
  if (!this._transformResult) return "";
  const e = this._sourceConfig?.areaRules ?? {}, t = new Set(Object.keys(e).filter(
    (n) => {
      const r = e[n];
      return (r.groups?.length ?? 0) > 0 || (r.rules?.length ?? 0) > 0;
    }
  )), i = ze(this._transformResult).filter((n) => {
    if (!n.included) return !1;
    if (t.size === 0) return !0;
    const r = n.areaName ? H(n.areaName) : null;
    return r != null && t.has(r);
  }), o = [];
  for (const n of i)
    n.heading && n.pattern !== "role" && (o.push(`## ${n.heading}`), o.push("")), n.content && o.push(n.content), n.description && o.push(n.description), n.summary && o.push(n.summary), o.length > 0 && o.push("");
  return o.join(`
`);
};
J = function() {
  if (!this._transformResult)
    return u`
				<div class="empty-state">
					<uui-icon name="icon-lab" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
					<h3>No transform result</h3>
					<p>Save to extract content and generate the transformed view.</p>
				</div>
			`;
  const e = s(this, a, Xe).call(this);
  if (!e.trim())
    return u`
				<div class="empty-state">
					<uui-icon name="icon-lab" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
					<h3>No content</h3>
					<p>All sections are excluded. Include at least one section to see the preview.</p>
				</div>
			`;
  const t = M(e);
  return u`
			<div class="transformed-preview">
				<div class="md-section-content">${P(t)}</div>
			</div>
		`;
};
k = function(e) {
  const t = s(this, a, ve).call(this, e);
  return t.length === 0 ? d : t.map((i) => {
    const n = i.blockKey && p(this, L).has(`${i.blockKey}:${i.target}`) ? "warning" : "positive";
    return u`<uui-tag color="${n}" look="primary" class="mapped-tag" title="${s(this, a, ie).call(this, i)}">
				${s(this, a, ie).call(this, i)}
				<button class="unmap-x" title="Remove mapping" @click=${(r) => {
      r.stopPropagation(), s(this, a, We).call(this, e, i);
    }}>&times;</button>
			</uui-tag>`;
  });
};
Qe = function() {
  if (!this._extraction) return d;
  const e = this._extraction.source.fileName ?? "", t = new Date(this._extraction.source.extractedDate).toLocaleString(), i = this._areaDetection !== null, o = i ? this._areaDetection.pages.reduce((r, l) => r + l.areas.filter((c) => !this._excludedAreas.has(s(this, a, A).call(this, c))).length, 0) : 0, n = i ? s(this, a, q).call(this) : 0;
  return u`
			<div class="info-boxes">
				<uui-box class="info-box-item">
					<div slot="headline" class="box-headline-row">
						<span>Source</span>
						<span class="box-headline-meta">${t}</span>
					</div>
					<div class="box-content">
						<uui-icon name="icon-document" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${e}">${e}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Source"
								@click=${s(this, a, N)} ?disabled=${this._extracting}>
								<uui-icon name="icon-document"></uui-icon> Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${o}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Areas" disabled>
								<uui-icon name="icon-grid"></uui-icon> Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${n}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Sections" disabled>
								<uui-icon name="icon-thumbnail-list"></uui-icon> Sections
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
};
Ye = function() {
  return this._viewMode === "transformed" ? s(this, a, J).call(this) : this._areaDetection ? s(this, a, G).call(this) : s(this, a, we).call(this);
};
Ze = function() {
  if (!this._extraction) return d;
  const e = this._extraction.source.fileName ?? "", t = new Date(this._extraction.source.extractedDate).toLocaleString(), i = this._areaDetection !== null, o = i ? this._areaDetection.pages.reduce((r, l) => r + l.areas.filter((c) => !this._excludedAreas.has(s(this, a, A).call(this, c))).length, 0) : 0, n = i ? s(this, a, q).call(this) : 0;
  return u`
			<div class="info-boxes">
				<uui-box class="info-box-item">
					<div slot="headline" class="box-headline-row">
						<span>Source</span>
						<span class="box-headline-meta">${t}</span>
					</div>
					<div class="box-content">
						<uui-icon name="icon-globe" class="box-icon"></uui-icon>
						<uui-input
							label="URL"
							placeholder="https://example.com/page"
							class="box-url-input"
							.value=${this._sampleUrl || e}
							@input=${(r) => {
    this._sampleUrl = r.target.value;
  }}
							@keydown=${(r) => {
    r.key === "Enter" && this._sampleUrl && s(this, a, I).call(this, this._sampleUrl);
  }}>
						</uui-input>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Source"
								@click=${() => s(this, a, I).call(this, this._sampleUrl || e)}
								?disabled=${this._extracting}>
								<uui-icon name="icon-globe"></uui-icon> Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${o}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Areas" @click=${s(this, a, Ee)}>
								<uui-icon name="icon-grid"></uui-icon> Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${n}</span>
						${this._transformResult && this._areaDetection ? u`
							<div class="box-buttons">
								<uui-button
									look="primary"
									color="default"
									label="Sections"
									popovertarget="web-section-picker-popover">
									<uui-icon name="icon-thumbnail-list"></uui-icon>
									Sections
									<uui-symbol-expand .open=${this._sectionPickerOpen}></uui-symbol-expand>
								</uui-button>
								<uui-popover-container
									id="web-section-picker-popover"
									placement="bottom-end"
									@toggle=${s(this, a, ge)}>
									<umb-popover-layout>
										<div class="popover-heading">Areas</div>
										${s(this, a, me).call(this).map((r) => u`
											<uui-menu-item
												label="${r.areaName}"
												@click=${() => s(this, a, V).call(this, r.areaKey, r.areaName, r.elements)}>
												<uui-icon slot="icon" name="${r.hasRules ? "icon-check" : "icon-thumbnail-list"}"></uui-icon>
												<span slot="badge" class="section-picker-meta">${r.elements.length} el</span>
											</uui-menu-item>
										`)}
									</umb-popover-layout>
								</uui-popover-container>
							</div>
						` : d}
					</div>
				</uui-box>
			</div>
		`;
};
et = function() {
  return this._viewMode === "transformed" ? s(this, a, J).call(this) : this._areaDetection ? s(this, a, G).call(this) : s(this, a, we).call(this);
};
we = function() {
  return this._extraction?.elements?.length ? u`
			<div class="simple-elements">
				${this._extraction.elements.map((e) => {
    const t = e.metadata?.fontName?.startsWith("heading-") || /^h[1-6]$/.test(e.metadata?.htmlTag ?? ""), i = t ? e.metadata?.fontName?.startsWith("heading-") ? parseInt(e.metadata.fontName.replace("heading-", ""), 10) : parseInt((e.metadata?.htmlTag ?? "h6").substring(1), 10) : 0;
    return u`
						<div class="simple-element ${t ? "simple-element-heading" : ""}">
							<div class="simple-element-text" style="${t ? `font-size: ${24 - (i - 1) * 2}px; font-weight: bold;` : ""}">
								${e.text}
							</div>
							<div class="simple-element-actions">
								${s(this, a, k).call(this, e.id)}
							</div>
						</div>
					`;
  })}
			</div>
		` : u`<p style="padding: var(--uui-size-layout-1); color: var(--uui-color-text-alt);">No elements extracted.</p>`;
};
B = function() {
  if (p(this, a, w) === "web")
    return s(this, a, tt).call(this);
  const e = p(this, a, w) === "pdf", t = "Source...", i = e ? "Choose a PDF from the media library to extract text elements with their metadata." : `Choose a ${p(this, a, w)} file from the media library to extract content.`;
  return u`
			<div class="empty-state">
				<uui-icon name="icon-document" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
				<h3>No sample extraction</h3>
				<p>${i}</p>
				<uui-button look="primary" label="${t}" @click=${s(this, a, N)} ?disabled=${this._extracting}>
					${this._extracting ? u`<uui-loader-bar></uui-loader-bar>` : t}
				</uui-button>
			</div>
		`;
};
tt = function() {
  return u`
			<div class="empty-state">
				<uui-icon name="icon-globe" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
				<h3>No sample extraction</h3>
				<p>Enter a web page URL to extract content.</p>
				<div style="display: flex; gap: 8px; align-items: center; width: 100%; max-width: 500px;">
					<uui-input
						label="URL"
						placeholder="https://example.com/page"
						style="flex: 1;"
						.value=${this._sampleUrl}
						@input=${(e) => {
    this._sampleUrl = e.target.value;
  }}
						@keydown=${(e) => {
    e.key === "Enter" && this._sampleUrl && s(this, a, I).call(this, this._sampleUrl);
  }}>
					</uui-input>
					<uui-button
						look="primary"
						label="Extract"
						?disabled=${!this._sampleUrl || this._extracting}
						@click=${() => s(this, a, I).call(this, this._sampleUrl)}>
						${this._extracting ? u`<uui-loader-bar></uui-loader-bar>` : "Extract"}
					</uui-button>
				</div>
			</div>
		`;
};
I = async function(e) {
  if (!(!this._workflowAlias || !e)) {
    this._extracting = !0, this._error = null;
    try {
      const i = await (await this.getContext(re)).getLatestToken(), o = await Y(this._workflowAlias, "", i, e);
      if (o) {
        this._extraction = o;
        const [n, r] = await Promise.all([
          T(this._workflowAlias, i),
          z(this._workflowAlias, i)
        ]);
        this._areaDetection = n, this._transformResult = r;
        const l = n?.diagnostics?.areasDetected ?? 0;
        this._successMessage = `Content extracted — ${o.elements.length} elements in ${l} areas`, setTimeout(() => {
          this._successMessage = null;
        }, 5e3);
      } else
        this._error = "Extraction failed. Check that the URL is accessible.";
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Failed to extract from URL", console.error("URL extraction failed:", t);
    } finally {
      this._extracting = !1;
    }
  }
};
g.styles = [
  gt,
  ht`
			:host {
				display: block;
				height: 100%;
				overflow-x: hidden;
				--uui-tab-background: var(--uui-color-surface);
			}

			.loading {
				padding: var(--uui-size-layout-1);
			}

			.success-banner {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-2);
				border-radius: var(--uui-border-radius);
				background-color: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
				font-size: var(--uui-type-small-size);
			}

			/* Empty state */
			.empty-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: var(--uui-size-layout-2);
				gap: var(--uui-size-space-3);
				text-align: center;
				min-height: 300px;
			}

			.empty-state h3 {
				margin: 0;
				color: var(--uui-color-text);
			}

			.empty-state p {
				margin: 0;
				color: var(--uui-color-text-alt);
			}

			/* Simple view (non-PDF) */
			.simple-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: var(--uui-size-space-4) var(--uui-size-layout-1);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.simple-header-info {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			.simple-elements {
				padding: var(--uui-size-layout-1);
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-2);
			}

			.simple-element {
				display: flex;
				align-items: flex-start;
				justify-content: space-between;
				gap: var(--uui-size-space-4);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface);
			}

			.simple-element-heading {
				background: var(--uui-color-surface-alt);
			}

			.simple-element-text {
				flex: 1;
				white-space: pre-wrap;
				word-break: break-word;
				max-width: 75ch;
			}

			.simple-element-actions {
				display: flex;
				flex-wrap: wrap;
				gap: var(--uui-size-space-1);
				flex-shrink: 0;
			}

			/* Header: tabs only */
			.source-header {
				display: flex;
				align-items: center;
				width: 100%;
			}

			.source-header uui-tab-group {
				flex: 1;
			}

			/* Info boxes row (uSync-inspired) */
			.info-boxes {
				display: flex;
				gap: var(--uui-size-space-4);
				flex-wrap: wrap;
				padding: var(--uui-size-space-4);
			}

			.info-box-item {
				flex: 1;
			}

			.box-content {
				display: flex;
				flex-direction: column;
				align-items: center;
				text-align: center;
				gap: var(--uui-size-space-2);
				min-height: 180px;
			}

			.box-buttons {
				margin-top: auto;
				padding-top: var(--uui-size-space-2);
			}

			.box-icon {
				font-size: 48px;
				color: var(--uui-color-text-alt);
				margin-top: var(--uui-size-space-3);
			}

			.box-headline-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
			}

			.box-headline-meta {
				font-size: var(--uui-type-small-size);
				font-weight: 400;
				color: var(--uui-color-text-alt);
			}

			.box-filename {
				font-weight: 600;
				font-size: var(--uui-type-default-size) !important;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 100%;
			}

			.box-url-input {
				width: 100%;
				flex: 1;
				display: flex;
				align-items: center;
				font-weight: 600;
				font-size: var(--uui-type-default-size);
				text-align: center;
				--uui-input-border-color: transparent;
				--uui-input-border-color-hover: var(--uui-color-border-emphasis);
				--uui-input-border-color-focus: var(--uui-color-focus);
			}

			.box-buttons {
				display: flex;
				gap: var(--uui-size-space-2);
				margin-top: auto;
				padding-top: var(--uui-size-space-2);
			}

			.box-stat {
				font-size: var(--uui-type-h4-size);
				font-weight: 700;
				color: var(--uui-color-text);
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
			}


			/* Collapse row below boxes */
			.collapse-row {
				display: flex;
				justify-content: flex-end;
				padding: 0 var(--uui-size-space-4) var(--uui-size-space-2);
			}

			/* Page box include toggle */
			.page-header-actions {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
			}

			.page-box.page-excluded {
				opacity: 0.4;
			}

			.header-spacer {
				flex: 1;
			}

			/* Page groups */
			.page-box {
				margin: var(--uui-size-space-4);
			}

			/* Tree-style header for page boxes */
			.tree-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				cursor: pointer;
			}

			.tree-header:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.page-title {
				font-size: var(--uui-type-default-size);
			}

			/* Consistent collapse chevron across all levels */
			.collapse-chevron {
				color: var(--uui-color-text-alt);
				flex-shrink: 0;
				font-size: 12px;
			}

			.level-icon {
				color: var(--uui-color-text-alt);
				flex-shrink: 0;
				font-size: 12px;
			}

			/* Detected areas (Level 2) */
			.detected-area {
				border-left: 4px solid var(--uui-color-border);
				margin: var(--uui-size-space-4) 0;
				margin-left: var(--uui-size-space-3);
			}

			.area-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-2) var(--uui-size-space-3);
				cursor: pointer;
			}

			.area-header:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.area-header:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.area-color-swatch {
				display: inline-block;
				width: 12px;
				height: 12px;
				border-radius: 2px;
				border: 1px solid var(--uui-color-border);
			}

			.area-name {
				font-weight: 600;
				color: var(--uui-color-text);
			}

			/* Sections within detected areas (Level 3) */
			.area-section {
				margin-left: var(--uui-size-space-3);
			}

			.area-section + .area-section {
				border-top: 1px solid var(--uui-color-border);
			}

			.section-heading {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				cursor: pointer;
				overflow: hidden;
			}

			.section-heading:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.section-heading:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.heading-text {
				font-weight: 600;
				flex: 1;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.collapse-chevron.placeholder {
				opacity: 0;
				pointer-events: none;
			}

			.group-count {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				white-space: nowrap;
			}

			.section-children {
				padding-left: var(--uui-size-space-5);
				border-left: 2px solid var(--uui-color-border);
				margin-left: var(--uui-size-space-4);
			}

			/* Excluded sections */
			.area-section.excluded {
				opacity: 0.4;
			}

			.preamble-label {
				color: var(--uui-color-text-alt);
				font-style: italic;
			}

			/* Element items */
			.element-item {
				display: flex;
				align-items: flex-start;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.element-item:last-child {
				border-bottom: none;
			}

			.element-content {
				flex: 1;
				min-width: 0;
			}

			.element-text {
				font-size: var(--uui-type-default-size);
				margin-bottom: var(--uui-size-space-2);
				overflow-wrap: break-word;
			}

			.element-meta {
				display: flex;
				flex-wrap: wrap;
				gap: var(--uui-size-space-2);
			}

			.meta-badge {
				font-size: 11px;
				font-family: monospace;
				padding: 1px 6px;
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
			}

			.meta-badge.text-type {
				font-weight: 500;
				text-transform: uppercase;
				font-size: 10px;
				letter-spacing: 0.5px;
			}

			.meta-badge.text-type.heading {
				color: var(--uui-color-current);
			}

			.meta-badge.text-type.list {
				color: var(--uui-color-positive);
			}

			.meta-badge.font-size {
				font-weight: 600;
				color: var(--uui-color-text);
			}

			.meta-badge.container-path {
				color: var(--uui-color-interactive);
				font-style: italic;
				max-width: 200px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				cursor: help;
			}

			.meta-badge.text-case {
				font-weight: 500;
				text-transform: uppercase;
				font-size: 10px;
				letter-spacing: 0.5px;
				color: var(--uui-color-text-alt);
			}

			.mapped-tag {
				font-size: 12px;
			}

			.unmap-x {
				all: unset;
				cursor: pointer;
				font-size: 14px;
				line-height: 1;
				padding: 0 2px;
				margin-left: 4px;
				opacity: 0.7;
				font-weight: 700;
			}

			.unmap-x:hover {
				opacity: 1;
			}

			.diagnostics {
				display: flex;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				justify-content: flex-end;
			}

			/* Transformed sections */
			.transformed-section {
				margin: var(--uui-size-space-4);
			}

			.transformed-section.section-mapped {
				border-left: 3px solid var(--uui-color-positive);
			}

			.section-mapping-actions {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-2) var(--uui-size-space-4);
				border-top: 1px solid var(--uui-color-border);
			}

			.mapping-label {
				font-size: var(--uui-type-small-size);
				font-weight: 600;
				color: var(--uui-color-text-alt);
			}

			.transformed-header-badges {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
			}

			.pattern-badge {
				font-size: 11px;
				padding: 1px 8px;
				border-radius: 10px;
				font-weight: 500;
			}

			.pattern-badge.bulletList {
				background: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
			}

			.pattern-badge.paragraph {
				background: var(--uui-color-warning-emphasis);
				color: var(--uui-color-warning-contrast);
			}

			.pattern-badge.subHeaded {
				background: var(--uui-color-default-emphasis);
				color: var(--uui-color-default-contrast);
			}

			.pattern-badge.preamble {
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
				border: 1px solid var(--uui-color-border);
			}

			.pattern-badge.role {
				background: var(--uui-color-current-emphasis);
				color: var(--uui-color-current-contrast);
			}

			.transformed-content {
				padding: var(--uui-size-space-4);
				font-size: var(--uui-type-small-size);
				line-height: 1.6;
			}

			.transformed-content ul,
			.transformed-content ol {
				padding-left: var(--uui-size-space-5);
				margin: var(--uui-size-space-2) 0;
			}

			.transformed-content p {
				margin: var(--uui-size-space-2) 0;
			}

			.transformed-content h2 {
				font-size: var(--uui-type-default-size);
				margin: var(--uui-size-space-3) 0 var(--uui-size-space-2);
			}

			/* Popover heading bar */
			.popover-heading {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				font-size: var(--uui-type-small-size);
				font-weight: 700;
				color: var(--uui-color-text-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			/* Section picker popover */
			.section-picker-meta {
				font-size: 11px;
				font-family: monospace;
				color: var(--uui-color-text-alt);
			}

			/* Structure badge on area header */
			.structure-badge {
				background: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
				font-weight: 500;
			}

			/* Rules info text on area header */
			.rules-info {
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
				font-weight: 400;
			}

			/* Section boxes — bordered containers for each section */
			.composed-sections {
				margin-left: var(--uui-size-space-3);
			}

			.section-box {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin: var(--uui-size-space-3) 0;
			}

			.section-box:first-child {
				margin-top: 0;
			}

			.section-box-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				cursor: pointer;
			}

			.section-box-header:hover {
				background: var(--uui-color-surface-emphasis);
				border-radius: var(--uui-border-radius);
			}

			.section-box-header:hover .collapse-chevron {
				color: var(--uui-color-text);
			}

			.section-box-label {
				font-weight: 600;
				color: var(--uui-color-text);
				flex-shrink: 0;
			}

			.section-box-content {
				padding: 0 var(--uui-size-space-4) var(--uui-size-space-4);
			}

			/* Part boxes — nested bordered containers for grouped parts */
			.part-box {
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				margin-bottom: var(--uui-size-space-3);
			}

			.part-box:last-child {
				margin-bottom: 0;
			}

			/* Part row — flex layout for label + content + actions */
			.part-box-row {
				display: flex;
				align-items: flex-start;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
			}

			.part-box-label {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				min-width: 80px;
				flex-shrink: 0;
				padding-top: 2px;
			}

			.part-box-content {
				flex: 1;
				font-size: var(--uui-type-default-size);
				color: var(--uui-color-text);
				min-width: 0;
			}

			/* Headings inside part content render as plain bold text */
			.part-box-content h1,
			.part-box-content h2,
			.part-box-content h3,
			.part-box-content h4,
			.part-box-content h5,
			.part-box-content h6 {
				font-size: inherit;
				font-weight: 600;
				margin: 0.75em 0 0.25em;
				line-height: 1.4;
			}

			.part-box-content h1:first-child,
			.part-box-content h2:first-child,
			.part-box-content h3:first-child,
			.part-box-content h4:first-child,
			.part-box-content h5:first-child,
			.part-box-content h6:first-child {
				margin-top: 0;
			}

			.part-box-actions {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				flex-shrink: 0;
				padding-top: 2px;
			}

			.composed-unmapped {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				font-style: italic;
				white-space: nowrap;
			}

			/* Teach-by-example mode */
			.area-teaching {
				border-left-width: 4px;
				border-left-style: solid;
				box-shadow: 0 0 0 1px var(--uui-color-focus);
				border-radius: var(--uui-border-radius);
			}

			.teach-toolbar {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.teach-instruction {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
			}

			.teach-toolbar-actions {
				display: flex;
				gap: var(--uui-size-space-2);
			}

			.teach-confirmation {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-positive-emphasis);
				color: var(--uui-color-positive-contrast);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.teach-confirmation-info {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				font-size: var(--uui-type-small-size);
			}

			.teach-condition-summary {
				font-family: monospace;
				font-size: 11px;
				opacity: 0.8;
			}

			.teach-confirmation-actions {
				display: flex;
				gap: var(--uui-size-space-2);
			}

			.teach-elements {
				padding-left: var(--uui-size-space-3);
			}

			.teach-element {
				cursor: pointer;
				transition: background-color 0.15s;
			}

			.teach-element:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.teach-element.teach-clicked {
				background: color-mix(in srgb, var(--uui-color-focus) 15%, transparent);
				border-left: 3px solid var(--uui-color-focus);
			}

			.teach-element.teach-matched {
				background: color-mix(in srgb, var(--uui-color-positive) 10%, transparent);
				border-left: 3px solid var(--uui-color-positive);
			}

			.teach-element.teach-clicked.teach-matched {
				background: color-mix(in srgb, var(--uui-color-focus) 15%, transparent);
				border-left: 3px solid var(--uui-color-focus);
			}

			/* Transformed tab — read-only markdown preview */
			.transformed-preview {
				padding: var(--uui-size-space-5);
				max-width: 75ch;
			}

			/* Map button — hidden by default, shown on box hover */
			.md-map-btn {
				opacity: 0;
				transition: opacity 0.15s;
			}

			.part-box:hover .md-map-btn,
			.part-box-row:hover .md-map-btn {
				opacity: 1;
			}

			.md-section-content {
				line-height: 1.75;
				color: var(--uui-color-text);
				font-size: 15px;
			}

			/* Headings */
			.md-section-content h1 {
				font-size: 2em;
				font-weight: 700;
				margin: 0.67em 0 0.4em;
				line-height: 1.25;
				color: var(--uui-color-text);
			}

			.md-section-content h2 {
				font-size: 1.5em;
				font-weight: 600;
				margin: 1em 0 0.4em;
				padding-bottom: 0.3em;
				border-bottom: 1px solid var(--uui-color-border);
				line-height: 1.3;
				color: var(--uui-color-text);
			}

			.md-section-content h3 {
				font-size: 1.25em;
				font-weight: 600;
				margin: 0.8em 0 0.3em;
				line-height: 1.35;
				color: var(--uui-color-text);
			}

			.md-section-content h4 {
				font-size: 1.1em;
				font-weight: 600;
				margin: 0.6em 0 0.25em;
				color: var(--uui-color-text);
			}

			.md-section-content h5,
			.md-section-content h6 {
				font-size: 1em;
				font-weight: 600;
				margin: 0.5em 0 0.2em;
				color: var(--uui-color-text-alt);
			}

			/* Paragraphs */
			.md-section-content p {
				margin: 0.5em 0;
			}

			/* Lists */
			.md-section-content ul,
			.md-section-content ol {
				padding-left: 1.75em;
				margin: 0.5em 0;
			}

			.md-section-content li {
				margin: 0.2em 0;
			}

			.md-section-content ul li::marker {
				color: var(--uui-color-text-alt);
			}

			/* Blockquotes */
			.md-section-content blockquote {
				margin: 0.5em 0;
				padding: 0.25em 1em;
				border-left: 3px solid var(--uui-color-current);
				color: var(--uui-color-text-alt);
				background: color-mix(in srgb, var(--uui-color-current) 5%, transparent);
				border-radius: 0 var(--uui-border-radius) var(--uui-border-radius) 0;
			}

			.md-section-content blockquote p {
				margin: 0.25em 0;
			}

			/* Inline styles */
			.md-section-content strong {
				font-weight: 700;
				color: var(--uui-color-text);
			}

			.md-section-content em {
				font-style: italic;
			}

			.md-section-content code {
				font-family: monospace;
				font-size: 0.9em;
				padding: 0.1em 0.35em;
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-danger);
			}

			.md-section-content mark {
				background: color-mix(in srgb, var(--uui-color-warning) 30%, transparent);
				padding: 0.1em 0.2em;
				border-radius: 2px;
			}


		`
];
v([
  x()
], g.prototype, "_extraction", 2);
v([
  x()
], g.prototype, "_areaDetection", 2);
v([
  x()
], g.prototype, "_config", 2);
v([
  x()
], g.prototype, "_workflowAlias", 2);
v([
  x()
], g.prototype, "_loading", 2);
v([
  x()
], g.prototype, "_extracting", 2);
v([
  x()
], g.prototype, "_error", 2);
v([
  x()
], g.prototype, "_successMessage", 2);
v([
  x()
], g.prototype, "_collapsed", 2);
v([
  x()
], g.prototype, "_transformResult", 2);
v([
  x()
], g.prototype, "_viewMode", 2);
v([
  x()
], g.prototype, "_sourceConfig", 2);
v([
  x()
], g.prototype, "_pageMode", 2);
v([
  x()
], g.prototype, "_pageInputValue", 2);
v([
  x()
], g.prototype, "_collapsePopoverOpen", 2);
v([
  x()
], g.prototype, "_excludedAreas", 2);
v([
  x()
], g.prototype, "_areaTemplate", 2);
v([
  x()
], g.prototype, "_sectionPickerOpen", 2);
v([
  x()
], g.prototype, "_teachingAreaIndex", 2);
v([
  x()
], g.prototype, "_inferenceResult", 2);
v([
  x()
], g.prototype, "_inferring", 2);
v([
  x()
], g.prototype, "_sampleUrl", 2);
g = v([
  ft("up-doc-workflow-source-view")
], g);
const Lt = g;
export {
  g as UpDocWorkflowSourceViewElement,
  Lt as default
};
//# sourceMappingURL=up-doc-workflow-source-view.element-BpnoCJKL.js.map
