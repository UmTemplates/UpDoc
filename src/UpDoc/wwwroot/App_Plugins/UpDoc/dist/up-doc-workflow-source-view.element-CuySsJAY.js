import { a as Ae } from "./workflow.types-sXs8a86t.js";
import { g as ot, b as nt, h as rt, i as D, j as A, k as lt, l as ie, m as X, s as ae, n as Ce, o as ct, p as ut, q as ze, u as dt, r as pt } from "./workflow.service-BQrmRF66.js";
import { m as z, n as B } from "./transforms-BkZeboOX.js";
import { g as $e } from "./destination-utils-DUfOJy5W.js";
import { UmbModalToken as F, UMB_MODAL_MANAGER_CONTEXT as E } from "@umbraco-cms/backoffice/modal";
import { U as ht } from "./page-picker-modal.token-B0CgP9f1.js";
import { html as l, nothing as d, unsafeHTML as S, css as ft, state as x, customElement as mt } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as gt } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as bt } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as se } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as vt } from "@umbraco-cms/backoffice/workspace";
import { UMB_MEDIA_PICKER_MODAL as xt } from "@umbraco-cms/backoffice/media";
const _t = new F(
  "UpDoc.AreaEditorModal",
  {
    modal: {
      type: "sidebar",
      size: "large"
    }
  }
), wt = new F("UpDoc.AreaPickerModal", {
  modal: {
    type: "sidebar",
    size: "small"
  }
}), yt = new F(
  "UpDoc.SectionRulesEditorModal",
  {
    modal: {
      type: "sidebar",
      size: "medium"
    }
  }
), $t = new F("UpDoc.DestinationPickerModal", {
  modal: {
    type: "sidebar",
    size: "medium"
  }
});
var kt = Object.defineProperty, At = Object.getOwnPropertyDescriptor, Se = (e) => {
  throw TypeError(e);
}, v = (e, t, i, o) => {
  for (var n = o > 1 ? void 0 : o ? At(t, i) : t, r = e.length - 1, u; r >= 0; r--)
    (u = e[r]) && (n = (o ? u(t, i, n) : u(n)) || n);
  return o && n && kt(t, i, n), n;
}, oe = (e, t, i) => t.has(e) || Se("Cannot " + i), p = (e, t, i) => (oe(e, t, "read from private field"), i ? i.call(e) : t.get(e)), q = (e, t, i) => t.has(e) ? Se("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ke = (e, t, i, o) => (oe(e, t, "write to private field"), t.set(e, i), i), s = (e, t, i) => (oe(e, t, "access private method"), i), h, I, a, $, Me, ne, re, le, Pe, Re, ce, C, P, ue, de, J, U, Te, Ee, De, Ie, Q, pe, Ue, L, he, N, R, Le, Y, fe, Z, Ne, W, Oe, Ke, We, ee, me, Be, ge, M, Fe, He, be, te, je, Ve, Ge, qe, Xe, Je, H, j, O, Qe, Ye, Ze, V, k, et, tt, it, at, ve, K, st, T;
let g = class extends gt {
  constructor() {
    super(...arguments), q(this, a), this._extraction = null, this._areaDetection = null, this._config = null, this._workflowAlias = null, this._loading = !0, this._extracting = !1, this._error = null, this._successMessage = null, this._collapsed = /* @__PURE__ */ new Set(), this._transformResult = null, this._viewMode = "elements", this._sourceConfig = null, this._pageMode = "all", this._pageInputValue = "", this._collapsePopoverOpen = !1, this._excludedAreas = /* @__PURE__ */ new Set(), this._areaTemplate = null, this._sectionPickerOpen = !1, this._teachingAreaIndex = null, this._inferenceResult = null, this._inferring = !1, this._sampleUrl = "", q(this, h, ""), q(this, I, /* @__PURE__ */ new Set());
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(vt, (e) => {
      e && (e.setRefreshHandler(() => s(this, a, L).call(this)), this.observe(e.unique, (t) => {
        t && (this._workflowAlias = decodeURIComponent(t), s(this, a, Me).call(this));
      }));
    });
  }
  render() {
    if (this._loading)
      return l`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
    if (this._error)
      return l`
				<umb-body-layout header-fit-height>
					<p style="color: var(--uui-color-danger); padding: var(--uui-size-layout-1);">${this._error}</p>
				</umb-body-layout>`;
    p(this, a, $);
    const e = p(this, a, $) === "web", t = p(this, a, $) === "markdown", i = this._areaDetection !== null || this._extraction !== null;
    return t ? l`
				<umb-body-layout header-fit-height>
					${i ? s(this, a, O).call(this) : d}
					${i && this._viewMode === "elements" ? s(this, a, et).call(this) : d}
					${s(this, a, J).call(this)}
					${this._successMessage ? l`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : d}
					${i ? s(this, a, tt).call(this) : s(this, a, K).call(this)}
				</umb-body-layout>
			` : e ? l`
				<umb-body-layout header-fit-height>
					${i ? s(this, a, O).call(this) : d}
					${i && this._viewMode === "elements" ? s(this, a, it).call(this) : d}
					${s(this, a, J).call(this)}
					${this._successMessage ? l`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : d}
					${i ? s(this, a, at).call(this) : s(this, a, K).call(this)}
				</umb-body-layout>
			` : l`
			<umb-body-layout header-fit-height>
				${i ? s(this, a, O).call(this) : d}
				${i && this._viewMode === "elements" ? s(this, a, Qe).call(this) : d}
				${this._successMessage ? l`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : d}
				${i ? s(this, a, Ye).call(this) : s(this, a, K).call(this)}
			</umb-body-layout>
		`;
  }
};
h = /* @__PURE__ */ new WeakMap();
I = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
$ = function() {
  return this._sourceConfig?.sourceTypes?.[0] ?? "pdf";
};
Me = async function() {
  if (this._workflowAlias) {
    this._loading = !0, this._error = null;
    try {
      const e = await this.getContext(se);
      ke(this, h, await e.getLatestToken());
      const [t, i, o] = await Promise.all([
        ot(this._workflowAlias, p(this, h)),
        nt(this._workflowAlias, p(this, h)),
        rt(this._workflowAlias, p(this, h))
      ]);
      this._extraction = t, this._config = i, this._sourceConfig = o, this._excludedAreas = new Set(o?.excludedAreas ?? []), ke(this, I, /* @__PURE__ */ new Set());
      for (const u of i?.validationWarnings ?? []) {
        const c = u.match(/blockKey '([^']+)' for target '([^']+)'/);
        c && p(this, I).add(`${c[1]}:${c[2]}`);
      }
      const n = (o?.sourceTypes?.[0] ?? "pdf") === "pdf", r = o?.sourceTypes?.[0] === "web";
      if (n) {
        const [u, c, b] = await Promise.all([
          D(this._workflowAlias, p(this, h)),
          A(this._workflowAlias, p(this, h)),
          lt(this._workflowAlias, p(this, h))
        ]);
        this._areaDetection = u, this._transformResult = c, this._areaTemplate = b;
        const f = t?.source.mediaKey;
        if (f && u) {
          const m = await ie(this._workflowAlias, f, p(this, h));
          m && (this._transformResult = m);
        }
        o?.pages && Array.isArray(o.pages) && o.pages.length > 0 ? (this._pageMode = "custom", this._pageInputValue = s(this, a, re).call(this, o.pages)) : (this._pageMode = "all", this._pageInputValue = "");
      } else if (r) {
        const [u, c] = await Promise.all([
          D(this._workflowAlias, p(this, h)),
          A(this._workflowAlias, p(this, h))
        ]);
        this._areaDetection = u, this._transformResult = c;
      } else {
        const [u, c] = await Promise.all([
          D(this._workflowAlias, p(this, h)),
          A(this._workflowAlias, p(this, h))
        ]);
        this._areaDetection = u, this._transformResult = c;
      }
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Failed to load data", console.error("Failed to load source data:", e);
    } finally {
      this._loading = !1;
    }
  }
};
ne = function(e) {
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
re = function(e) {
  if (!e.length) return "";
  const t = [...e].sort((r, u) => r - u), i = [];
  let o = t[0], n = t[0];
  for (let r = 1; r < t.length; r++)
    t[r] === n + 1 || (i.push(o === n ? `${o}` : `${o}-${n}`), o = t[r]), n = t[r];
  return i.push(o === n ? `${o}` : `${o}-${n}`), i.join(", ");
};
le = function() {
  if (this._pageMode === "all") return null;
  const e = s(this, a, ne).call(this, this._pageInputValue);
  return e.length > 0 ? e : null;
};
Pe = function(e) {
  if (this._pageMode === "all") return !0;
  const t = s(this, a, ne).call(this, this._pageInputValue);
  return t.length === 0 || t.includes(e);
};
Re = async function() {
  if (!this._workflowAlias) return;
  const e = s(this, a, le).call(this);
  await ct(this._workflowAlias, e, p(this, h));
};
ce = function(e) {
  if (!this._areaDetection) return [];
  const t = [];
  for (const i of this._areaDetection.pages) {
    const o = i.page;
    e === "pages" && t.push(`page-${o}`), e === "areas" && i.areas.forEach((n, r) => t.push(`area-p${o}-a${r}`)), e === "sections" && (i.areas.forEach((n, r) => {
      n.sections.forEach((u, c) => t.push(`p${o}-a${r}-s${c}`));
    }), i.areas.forEach((n) => {
      s(this, a, ge).call(this, n, o).forEach((u) => t.push(`composed-${u.id}`));
    }));
  }
  return t;
};
C = function(e) {
  const t = s(this, a, ce).call(this, e);
  return t.length > 0 && t.every((i) => this._collapsed.has(i));
};
P = function(e) {
  const t = s(this, a, ce).call(this, e), i = s(this, a, C).call(this, e), o = new Set(this._collapsed);
  for (const n of t)
    i ? o.delete(n) : o.add(n);
  this._collapsed = o;
};
ue = function() {
  this._collapsed = /* @__PURE__ */ new Set();
};
de = function(e) {
  this._collapsePopoverOpen = e.newState === "open";
};
J = function() {
  return !this._areaDetection || this._viewMode !== "elements" ? d : l`
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
					@toggle=${s(this, a, de)}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => s(this, a, ue).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="${s(this, a, C).call(this, "areas") ? "Expand" : "Collapse"} Areas"
							@click=${() => s(this, a, P).call(this, "areas")}>
							<uui-icon slot="icon" name="icon-grid"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="${s(this, a, C).call(this, "sections") ? "Expand" : "Collapse"} Sections"
							@click=${() => s(this, a, P).call(this, "sections")}>
							<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		`;
};
U = async function() {
  if (!this._workflowAlias) return;
  const i = await (await this.getContext(E)).open(this, xt, {
    data: {
      multiple: !1
    }
  }).onSubmit().catch(() => null);
  if (!i?.selection?.length) return;
  const o = i.selection[0];
  o && await s(this, a, he).call(this, o);
};
Te = async function() {
  if (!this._workflowAlias) return;
  const t = (await this.getContext(E)).open(this, _t, {
    data: {
      workflowAlias: this._workflowAlias,
      existingTemplate: this._areaTemplate,
      selectedPages: this._sourceConfig?.pages && Array.isArray(this._sourceConfig.pages) ? this._sourceConfig.pages : null
    }
  });
  try {
    const i = await t.onSubmit();
    if (i?.template) {
      const o = await ae(this._workflowAlias, i.template, p(this, h));
      o && (this._areaTemplate = o, await s(this, a, L).call(this));
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
  ), i = (await this.getContext(E)).open(this, wt, {
    data: {
      areas: e,
      excludedAreas: [...this._excludedAreas]
    }
  });
  try {
    const o = await i.onSubmit();
    if (o) {
      this._excludedAreas = new Set(o.excludedAreas);
      const n = await Ce(this._workflowAlias, o.excludedAreas, p(this, h));
      n != null && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, excludedAreas: n });
      const r = await A(this._workflowAlias, p(this, h));
      r && (this._transformResult = r);
    }
  } catch {
  }
};
De = function() {
  if (!this._areaDetection) return [];
  const e = [], t = /* @__PURE__ */ new Set();
  for (const i of this._areaDetection.pages)
    for (const o of i.areas) {
      const n = o.name || "Area", r = B(n);
      if (t.has(r)) continue;
      t.add(r);
      const u = s(this, a, W).call(this, o), c = this._sourceConfig?.areaRules?.[r], b = !!c && ((c.groups?.length ?? 0) > 0 || (c.rules?.length ?? 0) > 0);
      e.push({ areaKey: r, areaName: n, elements: u, hasRules: b });
    }
  return e;
};
Ie = function(e) {
  this._sectionPickerOpen = e.newState === "open";
};
Q = async function(e, t) {
  if (!this._workflowAlias) return;
  const i = {
    ...this._sourceConfig?.areaRules ?? {}
  };
  t.groups.length > 0 || t.rules.length > 0 ? i[e] = t : delete i[e];
  const n = await ut(this._workflowAlias, i, p(this, h));
  n && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, areaRules: n });
  const r = this._extraction?.source.mediaKey;
  if (r) {
    const u = await ie(this._workflowAlias, r, p(this, h));
    u && (this._transformResult = u);
  }
};
pe = async function(e, t, i, o) {
  if (!this._workflowAlias) return;
  const n = this._sourceConfig?.areaRules?.[e] ?? null, u = (await this.getContext(E)).open(this, yt, {
    data: {
      workflowAlias: this._workflowAlias,
      sectionId: e,
      sectionHeading: t,
      elements: i,
      existingRules: n,
      sectionCount: o,
      onSave: async (c) => {
        await s(this, a, Q).call(this, e, c);
      }
    }
  });
  try {
    const c = await u.onSubmit();
    c?.rules && await s(this, a, Q).call(this, e, c.rules);
  } catch {
  }
};
Ue = async function() {
  const e = this._extraction?.source.mediaKey;
  if (!e) return;
  const t = this._areaDetection?.totalPages ?? this._extraction?.source.totalPages ?? 0;
  if (t === 0) return;
  const i = s(this, a, le).call(this), r = await (await this.getContext(E)).open(this, ht, {
    data: { mediaKey: e, totalPages: t, selectedPages: i }
  }).onSubmit().catch(() => null);
  r !== null && (r.selectedPages === null ? (this._pageMode = "all", this._pageInputValue = "") : (this._pageMode = "custom", this._pageInputValue = s(this, a, re).call(this, r.selectedPages)), await s(this, a, Re).call(this));
};
L = async function() {
  if (p(this, a, $) === "web") {
    const t = this._extraction?.source.fileName;
    return t ? s(this, a, T).call(this, t) : void 0;
  }
  const e = this._extraction?.source.mediaKey;
  if (!e)
    return s(this, a, U).call(this);
  await s(this, a, he).call(this, e);
};
he = async function(e) {
  if (this._workflowAlias) {
    this._extracting = !0, this._error = null;
    try {
      const i = await (await this.getContext(se)).getLatestToken();
      if (p(this, a, $) === "pdf") {
        const [n, r] = await Promise.all([
          X(this._workflowAlias, e, i),
          ie(this._workflowAlias, e, i)
        ]);
        if (n && (this._extraction = n), r) {
          this._transformResult = r;
          const u = await D(this._workflowAlias, i);
          this._areaDetection = u;
          const c = r.diagnostics, b = c.roleSections > 0 ? `, ${c.roleSections} role` : "";
          this._successMessage = `Content extracted — ${c.totalSections} sections (${c.bulletListSections} bullet, ${c.paragraphSections} paragraph, ${c.subHeadedSections} sub-headed${b})`, setTimeout(() => {
            this._successMessage = null;
          }, 5e3);
        } else n ? (this._successMessage = `Content extracted — ${n.elements.length} elements (transform unavailable)`, setTimeout(() => {
          this._successMessage = null;
        }, 5e3)) : this._error = "Extraction failed. Check that the selected media item is a PDF.";
      } else {
        const n = await X(this._workflowAlias, e, i);
        if (n) {
          this._extraction = n;
          const r = await A(this._workflowAlias, i);
          this._transformResult = r, this._successMessage = `Content extracted — ${n.elements.length} elements`, setTimeout(() => {
            this._successMessage = null;
          }, 5e3);
        } else
          this._error = `Extraction failed. Check that the selected media item is a valid ${p(this, a, $)} file.`;
      }
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Extraction failed", console.error("Extraction failed:", t);
    } finally {
      this._extracting = !1;
    }
  }
};
N = function(e) {
  return this._collapsed.has(e);
};
R = function(e) {
  const t = new Set(this._collapsed);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsed = t;
};
Le = function(e) {
  return this._transformResult ? Ae(this._transformResult).find((i) => i.id === e)?.included ?? !0 : !0;
};
Y = async function(e, t) {
  if (!this._workflowAlias) return;
  const i = await dt(this._workflowAlias, e, t, p(this, h));
  i && (this._transformResult = i);
};
fe = function(e) {
  if (!this._config?.map?.mappings) return [];
  const t = [];
  for (const i of this._config.map.mappings)
    if (i.source === e && i.enabled)
      for (const o of i.destinations)
        t.push(o);
  return t;
};
Z = function(e) {
  if (!this._config?.destination) return e.target;
  if (e.blockKey)
    for (const i of $e(this._config.destination)) {
      const o = i.blocks.find((n) => n.key === e.blockKey);
      if (o) {
        const n = o.properties?.find((r) => r.alias === e.target);
        return `${o.label} > ${n?.label || e.target}`;
      }
    }
  const t = this._config.destination.fields.find((i) => i.alias === e.target);
  if (t) return t.label;
  for (const i of $e(this._config.destination))
    for (const o of i.blocks) {
      const n = o.properties?.find((r) => r.alias === e.target);
      if (n) return `${o.label} > ${n.label || n.alias}`;
    }
  return e.target;
};
Ne = function(e, t) {
  if (!this._areaDetection) return t;
  let i = 0;
  for (const o of this._areaDetection.pages) {
    if (o.page === e) return i + t;
    i += o.areas.length;
  }
  return i + t;
};
W = function(e) {
  const t = [];
  for (const i of e.sections)
    i.heading && t.push(i.heading), t.push(...i.children);
  return t;
};
Oe = async function(e) {
  if (!(this._teachingAreaIndex === null || !this._workflowAlias || this._inferring)) {
    this._inferring = !0, this._inferenceResult = null;
    try {
      const t = await pt(
        this._workflowAlias,
        this._teachingAreaIndex,
        e,
        p(this, h)
      );
      this._inferenceResult = t;
    } catch (t) {
      console.error("Inference failed:", t), this._error = "Failed to infer section pattern";
    } finally {
      this._inferring = !1;
    }
  }
};
Ke = async function() {
  if (this._teachingAreaIndex === null || !this._inferenceResult || !this._workflowAlias || !this._areaTemplate) return;
  const e = this._teachingAreaIndex;
  if (e < 0 || e >= this._areaTemplate.areas.length) return;
  const t = [...this._areaTemplate.areas];
  t[e] = { ...t[e], sectionPattern: this._inferenceResult.pattern };
  const i = { ...this._areaTemplate, areas: t }, o = await ae(this._workflowAlias, i, p(this, h));
  o && (this._areaTemplate = o, this._teachingAreaIndex = null, this._inferenceResult = null, await s(this, a, L).call(this));
};
We = async function() {
  if (this._teachingAreaIndex === null || !this._workflowAlias || !this._areaTemplate) return;
  const e = this._teachingAreaIndex;
  if (e < 0 || e >= this._areaTemplate.areas.length) return;
  const t = [...this._areaTemplate.areas];
  t[e] = { ...t[e], sectionPattern: { conditions: [] } };
  const i = { ...this._areaTemplate, areas: t }, o = await ae(this._workflowAlias, i, p(this, h));
  o && (this._areaTemplate = o, this._teachingAreaIndex = null, this._inferenceResult = null, await s(this, a, L).call(this));
};
ee = function() {
  this._teachingAreaIndex = null, this._inferenceResult = null, this._inferring = !1;
};
me = function(e) {
  return B(e.name || "");
};
Be = function(e) {
  const t = s(this, a, me).call(this, e), i = this._sourceConfig?.areaRules?.[t];
  return i ? (i.groups?.length ?? 0) > 0 || (i.rules?.length ?? 0) > 0 : !1;
};
ge = function(e, t) {
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
M = async function(e, t = "content") {
  if (!this._workflowAlias || !this._config?.destination) return;
  const o = (await this.getContext(E)).open(this, $t, {
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
  const r = `${e.id}.${t}`, u = this._config.map?.mappings ?? [], c = {
    source: r,
    destinations: n.selectedTargets.map((y) => ({ target: y.target, blockKey: y.blockKey, contentTypeKey: y.contentTypeKey })),
    enabled: !0
  }, b = u.findIndex((y) => y.source === r), f = b >= 0 ? u.map((y, xe) => xe === b ? c : y) : [...u, c], m = {
    ...this._config.map ?? { version: "1.0", mappings: [] },
    mappings: f
  }, _ = await ze(this._workflowAlias, m, p(this, h));
  _ && (this._config = { ...this._config, map: _ });
};
Fe = async function(e, t) {
  if (!this._workflowAlias || !this._config?.map) return;
  const i = this._config.map.mappings, o = i.findIndex((f) => f.source === e);
  if (o < 0) return;
  const r = i[o].destinations.filter(
    (f) => !(f.target === t.target && f.blockKey === t.blockKey)
  );
  let u;
  r.length === 0 ? u = i.filter((f, m) => m !== o) : u = i.map(
    (f, m) => m === o ? { ...f, destinations: r } : f
  );
  const c = { ...this._config.map, mappings: u }, b = await ze(this._workflowAlias, c, p(this, h));
  b && (this._config = { ...this._config, map: b });
};
He = function(e) {
  const t = ["content", "heading", "title", "description", "summary"], i = t.some((c) => s(this, a, fe).call(this, `${e.id}.${c}`).length > 0), o = `composed-${e.id}`, n = s(this, a, N).call(this, o), r = e.groupName ?? e.ruleName ?? (e.areaName ? `${e.areaName} - Section` : "Section"), u = !!e.groupName;
  return l`
			<div class="section-box">
				<div class="section-box-header" @click=${() => s(this, a, R).call(this, o)}>
					<uui-icon class="collapse-chevron" name="${n ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon class="level-icon" name="icon-thumbnail-list"></uui-icon>
					<span class="section-box-label">${r}</span>
					<span class="header-spacer"></span>
					${i && n ? t.map((c) => s(this, a, k).call(this, `${e.id}.${c}`)) : d}
				</div>
				${n ? d : l`
					<div class="section-box-content">
						${u ? l`
							${e.heading ? l`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Title</span>
										<div class="part-box-content">${S(z(e.heading))}</div>
										<div class="part-box-actions">
											${s(this, a, k).call(this, `${e.id}.title`)}
											${s(this, a, k).call(this, `${e.id}.heading`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), s(this, a, M).call(this, e, "title");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : d}
							${e.content ? l`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Content</span>
										<div class="part-box-content">${S(z(e.content))}</div>
										<div class="part-box-actions">
											${s(this, a, k).call(this, `${e.id}.content`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), s(this, a, M).call(this, e, "content");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : d}
							${e.description ? l`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Description</span>
										<div class="part-box-content">${S(z(e.description))}</div>
										<div class="part-box-actions">
											${s(this, a, k).call(this, `${e.id}.description`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), s(this, a, M).call(this, e, "description");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : d}
							${e.summary ? l`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Summary</span>
										<div class="part-box-content">${S(z(e.summary))}</div>
										<div class="part-box-actions">
											${s(this, a, k).call(this, `${e.id}.summary`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), s(this, a, M).call(this, e, "summary");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : d}
						` : l`
							${e.content ? l`
								<div class="part-box-row">
									<div class="part-box-content">${S(z(e.content))}</div>
									<div class="part-box-actions">
										${t.map((c) => s(this, a, k).call(this, `${e.id}.${c}`))}
										<uui-button class="md-map-btn" look="outline" compact label="Map"
											@click=${(c) => {
    c.stopPropagation(), s(this, a, M).call(this, e, "content");
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
be = function(e) {
  const t = e.trimStart();
  return /^[•\-\*▪▸▶►●○◦‣⁃]/.test(t) || /^\d+[\.\)]\s/.test(t) ? "list" : "paragraph";
};
te = function(e, t) {
  const i = t === "heading" ? "heading" : s(this, a, be).call(this, e.text), o = i === "heading" ? "Heading" : i === "list" ? "List Item" : "Paragraph", n = !!e.htmlTag, r = e.htmlTag || e.fontName, u = e.htmlContainerPath ? e.htmlContainerPath.split("/").pop() ?? "" : "";
  return l`
			<div class="element-item">
				<div class="element-content">
					<div class="element-text">${e.text}</div>
					<div class="element-meta">
						<span class="meta-badge text-type ${i}">${o}</span>
						${n ? d : l`<span class="meta-badge font-size">${e.fontSize}pt</span>`}
						<span class="meta-badge font-name">${r}</span>
						<span class="meta-badge color" style="border-left: 3px solid ${e.color};">${e.color}</span>
						${u ? l`<span class="meta-badge container-path" title="${e.htmlContainerPath ?? ""}">${u}</span>` : d}
						${e.text === e.text.toUpperCase() && e.text !== e.text.toLowerCase() ? l`<span class="meta-badge text-case">UPPERCASE</span>` : d}
					</div>
				</div>
			</div>
		`;
};
je = function(e, t, i, o) {
  const n = s(this, a, N).call(this, t), r = e.heading ? B(e.heading.text) : `preamble-p${i}-a${o}`, u = s(this, a, Le).call(this, r);
  if (!e.heading)
    return l`
				<div class="area-section ${u ? "" : "excluded"}">
					<div class="section-heading preamble" @click=${() => s(this, a, R).call(this, t)}>
						<uui-icon class="collapse-chevron" name="${n ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
						<span class="heading-text preamble-label">Content</span>
						<span class="group-count">${e.children.length} element${e.children.length !== 1 ? "s" : ""}</span>
						<uui-toggle
							label="${u ? "Included" : "Excluded"}"
							?checked=${u}
							@click=${(m) => m.stopPropagation()}
							@change=${(m) => s(this, a, Y).call(this, r, m.target.checked)}>
						</uui-toggle>
					</div>
					${u && !n ? l`
						${e.children.map((m) => s(this, a, te).call(this, m))}
					` : d}
				</div>
			`;
  const c = e.heading, b = e.children.length, f = b > 0;
  return l`
			<div class="area-section ${u ? "" : "excluded"}">
				<div class="section-heading" @click=${f ? () => s(this, a, R).call(this, t) : d}>
					${f ? l`<uui-icon class="collapse-chevron" name="${n ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>` : l`<uui-icon class="collapse-chevron placeholder"></uui-icon>`}
					<uui-icon class="level-icon" name="icon-thumbnail-list"></uui-icon>
					<span class="heading-text" title="${c.text}">${c.text}</span>
					${f ? l`<span class="group-count">${b} element${b !== 1 ? "s" : ""}</span>` : d}
					<uui-toggle
						label="${u ? "Included" : "Excluded"}"
						?checked=${u}
						@click=${(m) => m.stopPropagation()}
						@change=${(m) => s(this, a, Y).call(this, r, m.target.checked)}>
					</uui-toggle>
				</div>
				${f && !n && u ? l`
					<div class="section-children">
						${e.children.map((m) => s(this, a, te).call(this, m))}
					</div>
				` : d}
			</div>
		`;
};
Ve = async function(e, t) {
  const i = B(e), o = new Set(this._excludedAreas);
  if (o.has(i))
    o.delete(i);
  else {
    o.add(i);
    const n = new Set(this._collapsed);
    n.add(t), this._collapsed = n;
  }
  if (this._excludedAreas = o, this._workflowAlias) {
    const n = await Ce(this._workflowAlias, [...o], p(this, h));
    n != null && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, excludedAreas: n });
    const r = await A(this._workflowAlias, p(this, h));
    r && (this._transformResult = r);
  }
};
Ge = function(e) {
  const t = this._inferenceResult?.clickedElementId === e.id, i = this._inferenceResult?.matchingElementIds?.includes(e.id) ?? !1, o = s(this, a, be).call(this, e.text), n = o === "list" ? "List Item" : "Paragraph", r = !!e.htmlTag, u = e.htmlTag || e.fontName, c = e.htmlContainerPath ? e.htmlContainerPath.split("/").pop() ?? "" : "";
  return l`
			<div class="element-item teach-element ${t ? "teach-clicked" : ""} ${i ? "teach-matched" : ""}"
				@click=${() => s(this, a, Oe).call(this, e.id)}>
				<div class="element-content">
					<div class="element-text">${e.text}</div>
					<div class="element-meta">
						<span class="meta-badge text-type ${o}">${n}</span>
						${r ? d : l`<span class="meta-badge font-size">${e.fontSize}pt</span>`}
						<span class="meta-badge font-name">${u}</span>
						<span class="meta-badge color" style="border-left: 3px solid ${e.color};">${e.color}</span>
						${c ? l`<span class="meta-badge container-path" title="${e.htmlContainerPath ?? ""}">${c}</span>` : d}
						${e.text === e.text.toUpperCase() && e.text !== e.text.toLowerCase() ? l`<span class="meta-badge text-case">UPPERCASE</span>` : d}
					</div>
				</div>
			</div>
		`;
};
qe = function() {
  if (this._inferenceResult) {
    const e = this._inferenceResult.matchingElementIds.length, t = this._inferenceResult.pattern.conditions.map((i) => `${i.type}: ${i.value}`).join(", ");
    return l`
				<div class="teach-confirmation">
					<div class="teach-confirmation-info">
						<uui-icon name="icon-check" style="color: var(--uui-color-positive);"></uui-icon>
						<span>Found <strong>${e}</strong> matching element${e !== 1 ? "s" : ""}</span>
						<span class="teach-condition-summary">${t}</span>
					</div>
					<div class="teach-confirmation-actions">
						<uui-button look="primary" color="default" label="Confirm" @click=${() => s(this, a, Ke).call(this)}>
							<uui-icon name="icon-check"></uui-icon> Confirm
						</uui-button>
						<uui-button look="secondary" label="Cancel" @click=${() => s(this, a, ee).call(this)}>Cancel</uui-button>
					</div>
				</div>
			`;
  }
  return l`
			<div class="teach-toolbar">
				<span class="teach-instruction">
					${this._inferring ? l`<uui-loader-bar></uui-loader-bar> Analysing...` : l`Click a section heading, or <strong>No Sections</strong> if this area has no repeating structure`}
				</span>
				<div class="teach-toolbar-actions">
					<uui-button look="secondary" compact label="No Sections" @click=${() => s(this, a, We).call(this)}
						title="This area has no repeating section structure">
						No Sections
					</uui-button>
					<uui-button look="default" compact label="Cancel" @click=${() => s(this, a, ee).call(this)}>Cancel</uui-button>
				</div>
			</div>
		`;
};
Xe = function(e, t, i) {
  const o = `area-p${t}-a${i}`, n = s(this, a, Ne).call(this, t, i), r = this._teachingAreaIndex === n, u = r ? !1 : s(this, a, N).call(this, o), c = s(this, a, me).call(this, e), b = !this._excludedAreas.has(c), f = s(this, a, Be).call(this, e), m = f && this._transformResult ? s(this, a, ge).call(this, e, t) : [], _ = f && m.length > 0, y = _ ? m.length : e.sections.length, _e = e.sectionPattern != null ? e.sectionPattern.conditions.length > 0 ? "Configured" : "Flat" : null, we = this._sourceConfig?.areaRules?.[c], ye = (we?.rules?.length ?? 0) + (we?.groups?.reduce((w, G) => w + G.rules.length, 0) ?? 0);
  return l`
			<div class="detected-area ${b ? "" : "area-excluded"} ${r ? "area-teaching" : ""}" style="border-left-color: ${e.color};">
				<div class="area-header" @click=${() => !r && s(this, a, R).call(this, o)}>
					<uui-icon class="collapse-chevron" name="${u ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon class="level-icon" name="icon-grid"></uui-icon>
					<span class="area-name">${e.name || `${i + 1}`}</span>
					${f ? l`<span class="meta-badge rules-info">${ye} rule${ye !== 1 ? "s" : ""}</span>` : d}
					${!f && _e ? l`<span class="meta-badge structure-badge">${_e}</span>` : d}
					<span class="header-spacer"></span>
					${r ? d : l`
						<uui-button
							look="primary"
							color="default"
							label="Sections"
							@click=${(w) => {
    w.stopPropagation(), s(this, a, pe).call(this, c, e.name || "", s(this, a, W).call(this, e), y);
  }}
							?disabled=${this._teachingAreaIndex !== null}>
							<uui-icon name="icon-thumbnail-list"></uui-icon>
							Sections
							<uui-badge color="danger" look="primary">${y}</uui-badge>
						</uui-button>
					`}
					${f ? d : l`
						<uui-toggle
							label="${b ? "Included" : "Excluded"}"
							?checked=${b}
							@click=${(w) => w.stopPropagation()}
							@change=${() => s(this, a, Ve).call(this, e.name || "", o)}>
						</uui-toggle>
					`}
				</div>
				${u ? d : l`
					${r ? l`
						${s(this, a, qe).call(this)}
						<div class="teach-elements">
							${s(this, a, W).call(this, e).map((w) => s(this, a, Ge).call(this, w))}
						</div>
					` : _ ? l`
						<div class="composed-sections">
							${m.map((w) => s(this, a, He).call(this, w))}
						</div>
					` : l`
						${e.sections.map(
    (w, G) => s(this, a, je).call(this, w, `p${t}-a${i}-s${G}`, t, i)
  )}
					`}
				`}
			</div>
		`;
};
Je = function(e, t) {
  const i = `page-${e}`, o = s(this, a, N).call(this, i), n = t.length, r = t.reduce((c, b) => c + b.sections.length, 0), u = s(this, a, Pe).call(this, e);
  return l`
			<uui-box class="page-box ${u ? "" : "page-excluded"}">
				<div slot="header" class="tree-header" @click=${() => s(this, a, R).call(this, i)}>
					<uui-icon class="collapse-chevron" name="${o ? "icon-navigation-right" : "icon-navigation-down"}"></uui-icon>
					<uui-icon class="level-icon" name="icon-document"></uui-icon>
					<strong class="page-title">Page ${e}</strong>
				</div>
				<div slot="header-actions" class="page-header-actions">
					<span class="group-count">${r} section${r !== 1 ? "s" : ""}, ${n} area${n !== 1 ? "s" : ""}</span>
				</div>
				${o ? d : l`
					${t.map((c, b) => s(this, a, Xe).call(this, c, e, b))}
				`}
			</uui-box>
		`;
};
H = function() {
  return this._areaDetection ? l`
			${this._areaDetection.pages.map(
    (e) => s(this, a, Je).call(this, e.page, e.areas)
  )}
		` : d;
};
j = function() {
  return this._areaDetection ? this._areaDetection.pages.reduce((e, t) => e + t.areas.reduce((i, o) => i + o.sections.length, 0), 0) : 0;
};
O = function() {
  return l`
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
Qe = function() {
  const e = this._areaDetection !== null, t = this._extraction !== null;
  if (!e && !t) return d;
  const i = this._areaDetection?.totalPages ?? (t ? this._extraction.source.totalPages : 0), o = this._sourceConfig?.pages, n = Array.isArray(o) && o.length > 0, r = n ? o.length : i, u = n && i > 0 ? `${r} of ${i}` : `${i}`, c = e ? this._areaDetection.diagnostics.areasDetected : 0, b = e ? s(this, a, j).call(this) : 0, f = t ? this._extraction.source.fileName : "", m = t ? new Date(this._extraction.source.extractedDate).toLocaleString() : "";
  return l`
			<div class="info-boxes">
				<uui-box class="info-box-item">
					<div slot="headline" class="box-headline-row">
						<span>Source</span>
						<span class="box-headline-meta">${m}</span>
					</div>
					<div class="box-content">
						<uui-icon name="icon-page-add" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${f}">${f}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Choose Source" @click=${s(this, a, U)} ?disabled=${this._extracting}>
								<uui-icon name="icon-page-add"></uui-icon>
								Choose Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Pages" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-document" class="box-icon"></uui-icon>
						<span class="box-stat">${u}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Choose Pages" @click=${s(this, a, Ue)}>
								<uui-icon name="icon-document"></uui-icon>
								Choose Pages
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${this._areaTemplate ? this._areaTemplate.areas.length : c}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Choose Areas" @click=${s(this, a, Te)}>
								<uui-icon name="icon-grid"></uui-icon>
								Choose Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${b}</span>
						${this._transformResult && this._areaDetection ? l`
							<div class="box-buttons">
								<uui-button
									look="primary"
									color="default"
									label="Choose Sections"
									popovertarget="section-picker-popover">
									<uui-icon name="icon-thumbnail-list"></uui-icon>
									Choose Sections
									<uui-symbol-expand .open=${this._sectionPickerOpen}></uui-symbol-expand>
								</uui-button>
								<uui-popover-container
									id="section-picker-popover"
									placement="bottom-end"
									@toggle=${s(this, a, Ie)}>
									<umb-popover-layout>
										${s(this, a, De).call(this).map((_) => l`
											<uui-menu-item
												label="${_.areaName}"
												@click=${() => s(this, a, pe).call(this, _.areaKey, _.areaName, _.elements)}>
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

			${e ? l`
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
						@toggle=${s(this, a, de)}>
						<umb-popover-layout>
							<uui-menu-item
								label="Expand All"
								@click=${() => s(this, a, ue).call(this)}>
								<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${s(this, a, C).call(this, "pages") ? "Expand" : "Collapse"} Pages"
								@click=${() => s(this, a, P).call(this, "pages")}>
								<uui-icon slot="icon" name="icon-document"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${s(this, a, C).call(this, "areas") ? "Expand" : "Collapse"} Areas"
								@click=${() => s(this, a, P).call(this, "areas")}>
								<uui-icon slot="icon" name="icon-grid"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${s(this, a, C).call(this, "sections") ? "Expand" : "Collapse"} Sections"
								@click=${() => s(this, a, P).call(this, "sections")}>
								<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
							</uui-menu-item>
						</umb-popover-layout>
					</uui-popover-container>
				</div>
			` : d}
		`;
};
Ye = function() {
  const e = this._areaDetection !== null;
  return this._viewMode === "elements" ? e ? s(this, a, H).call(this) : d : s(this, a, V).call(this);
};
Ze = function() {
  if (!this._transformResult) return "";
  const e = Ae(this._transformResult).filter((i) => i.included), t = [];
  for (const i of e)
    i.heading && i.pattern !== "role" && (t.push(`## ${i.heading}`), t.push("")), i.content && t.push(i.content), i.description && t.push(i.description), i.summary && t.push(i.summary), t.length > 0 && t.push("");
  return t.join(`
`);
};
V = function() {
  if (!this._transformResult)
    return l`
				<div class="empty-state">
					<uui-icon name="icon-lab" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
					<h3>No transform result</h3>
					<p>Save to extract content and generate the transformed view.</p>
				</div>
			`;
  const e = s(this, a, Ze).call(this);
  if (!e.trim())
    return l`
				<div class="empty-state">
					<uui-icon name="icon-lab" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
					<h3>No content</h3>
					<p>All sections are excluded. Include at least one section to see the preview.</p>
				</div>
			`;
  const t = z(e);
  return l`
			<div class="transformed-preview">
				<div class="md-section-content">${S(t)}</div>
			</div>
		`;
};
k = function(e) {
  const t = s(this, a, fe).call(this, e);
  return t.length === 0 ? d : t.map((i) => {
    const n = i.blockKey && p(this, I).has(`${i.blockKey}:${i.target}`) ? "warning" : "positive";
    return l`<uui-tag color="${n}" look="primary" class="mapped-tag" title="${s(this, a, Z).call(this, i)}">
				${s(this, a, Z).call(this, i)}
				<button class="unmap-x" title="Remove mapping" @click=${(r) => {
      r.stopPropagation(), s(this, a, Fe).call(this, e, i);
    }}>&times;</button>
			</uui-tag>`;
  });
};
et = function() {
  if (!this._extraction) return d;
  const e = this._extraction.source.fileName ?? "", t = new Date(this._extraction.source.extractedDate).toLocaleString(), i = this._areaDetection !== null, o = i ? this._areaDetection.diagnostics.areasDetected : 0, n = i ? s(this, a, j).call(this) : 0;
  return l`
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
							<uui-button look="primary" color="default" label="Choose Source"
								@click=${s(this, a, U)} ?disabled=${this._extracting}>
								<uui-icon name="icon-document"></uui-icon> Choose Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${o}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Choose Areas" disabled>
								<uui-icon name="icon-grid"></uui-icon> Choose Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${n}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Choose Sections" disabled>
								<uui-icon name="icon-thumbnail-list"></uui-icon> Choose Sections
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
};
tt = function() {
  return this._viewMode === "transformed" ? s(this, a, V).call(this) : this._areaDetection ? s(this, a, H).call(this) : s(this, a, ve).call(this);
};
it = function() {
  if (!this._extraction) return d;
  const e = this._extraction.source.fileName ?? "", t = new Date(this._extraction.source.extractedDate).toLocaleString(), i = this._areaDetection !== null, o = i ? this._areaDetection.diagnostics.areasDetected : 0, n = i ? s(this, a, j).call(this) : 0;
  return l`
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
    r.key === "Enter" && this._sampleUrl && s(this, a, T).call(this, this._sampleUrl);
  }}>
						</uui-input>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Choose Source"
								@click=${() => s(this, a, T).call(this, this._sampleUrl || e)}
								?disabled=${this._extracting}>
								<uui-icon name="icon-globe"></uui-icon> Choose Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${o}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Choose Areas" @click=${s(this, a, Ee)}>
								<uui-icon name="icon-grid"></uui-icon> Choose Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${n}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Choose Sections" disabled>
								<uui-icon name="icon-thumbnail-list"></uui-icon> Choose Sections
							</uui-button>
						</div>
					</div>
				</uui-box>
			</div>
		`;
};
at = function() {
  return this._viewMode === "transformed" ? s(this, a, V).call(this) : this._areaDetection ? s(this, a, H).call(this) : s(this, a, ve).call(this);
};
ve = function() {
  return this._extraction?.elements?.length ? l`
			<div class="simple-elements">
				${this._extraction.elements.map((e) => {
    const t = e.metadata?.fontName?.startsWith("heading-"), i = t ? parseInt(e.metadata.fontName.replace("heading-", ""), 10) : 0;
    return l`
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
		` : l`<p style="padding: var(--uui-size-layout-1); color: var(--uui-color-text-alt);">No elements extracted.</p>`;
};
K = function() {
  if (p(this, a, $) === "web")
    return s(this, a, st).call(this);
  const e = p(this, a, $) === "pdf", t = "Choose Source...", i = e ? "Choose a PDF from the media library to extract text elements with their metadata." : `Choose a ${p(this, a, $)} file from the media library to extract content.`;
  return l`
			<div class="empty-state">
				<uui-icon name="icon-document" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
				<h3>No sample extraction</h3>
				<p>${i}</p>
				<uui-button look="primary" label="${t}" @click=${s(this, a, U)} ?disabled=${this._extracting}>
					${this._extracting ? l`<uui-loader-bar></uui-loader-bar>` : t}
				</uui-button>
			</div>
		`;
};
st = function() {
  return l`
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
    e.key === "Enter" && this._sampleUrl && s(this, a, T).call(this, this._sampleUrl);
  }}>
					</uui-input>
					<uui-button
						look="primary"
						label="Extract"
						?disabled=${!this._sampleUrl || this._extracting}
						@click=${() => s(this, a, T).call(this, this._sampleUrl)}>
						${this._extracting ? l`<uui-loader-bar></uui-loader-bar>` : "Extract"}
					</uui-button>
				</div>
			</div>
		`;
};
T = async function(e) {
  if (!(!this._workflowAlias || !e)) {
    this._extracting = !0, this._error = null;
    try {
      const i = await (await this.getContext(se)).getLatestToken(), o = await X(this._workflowAlias, "", i, e);
      if (o) {
        this._extraction = o;
        const [n, r] = await Promise.all([
          D(this._workflowAlias, i),
          A(this._workflowAlias, i)
        ]);
        this._areaDetection = n, this._transformResult = r;
        const u = n?.diagnostics?.areasDetected ?? 0;
        this._successMessage = `Content extracted — ${o.elements.length} elements in ${u} areas`, setTimeout(() => {
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
  bt,
  ft`
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

			.detected-area.area-excluded {
				opacity: 0.4;
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
  mt("up-doc-workflow-source-view")
], g);
const Nt = g;
export {
  g as UpDocWorkflowSourceViewElement,
  Nt as default
};
//# sourceMappingURL=up-doc-workflow-source-view.element-CuySsJAY.js.map
