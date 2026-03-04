import { a as Ce } from "./workflow.types-CVkhzFGj.js";
import { g as lt, b as ct, h as ut, i as T, j as C, k as dt, l as re, m as ee, s as le, n as pt, o as ht, p as mt, q as ft, r as gt, u as Se, v as Me, w as bt, x as vt } from "./workflow.service-DRM8gMCY.js";
import { m as R, n as L } from "./transforms-BkZeboOX.js";
import { g as Ae } from "./destination-utils-DUfOJy5W.js";
import { UmbModalToken as j, UMB_MODAL_MANAGER_CONTEXT as A } from "@umbraco-cms/backoffice/modal";
import { U as xt } from "./page-picker-modal.token-B0CgP9f1.js";
import { html as u, nothing as m, unsafeHTML as P, css as _t, state as x, customElement as wt } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as yt } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as $t } from "@umbraco-cms/backoffice/style";
import { UMB_AUTH_CONTEXT as ce } from "@umbraco-cms/backoffice/auth";
import { UMB_WORKSPACE_CONTEXT as kt } from "@umbraco-cms/backoffice/workspace";
import { UMB_MEDIA_PICKER_MODAL as At } from "@umbraco-cms/backoffice/media";
import { U as te } from "./up-doc-sort-modal.token-Dk9qC_N0.js";
const zt = new j(
  "UpDoc.AreaEditorModal",
  {
    modal: {
      type: "sidebar",
      size: "large"
    }
  }
), Ct = new j("UpDoc.AreaPickerModal", {
  modal: {
    type: "sidebar",
    size: "large"
  }
}), St = new j(
  "UpDoc.SectionRulesEditorModal",
  {
    modal: {
      type: "sidebar",
      size: "medium"
    }
  }
), Mt = new j("UpDoc.DestinationPickerModal", {
  modal: {
    type: "sidebar",
    size: "medium"
  }
});
var Rt = Object.defineProperty, Pt = Object.getOwnPropertyDescriptor, Re = (e) => {
  throw TypeError(e);
}, v = (e, t, i, s) => {
  for (var n = s > 1 ? void 0 : s ? Pt(t, i) : t, r = e.length - 1, l; r >= 0; r--)
    (l = e[r]) && (n = (s ? l(t, i, n) : l(n)) || n);
  return s && n && Rt(t, i, n), n;
}, ue = (e, t, i) => t.has(e) || Re("Cannot " + i), h = (e, t, i) => (ue(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Z = (e, t, i) => t.has(e) ? Re("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ze = (e, t, i, s) => (ue(e, t, "write to private field"), t.set(e, i), i), o = (e, t, i) => (ue(e, t, "access private method"), i), g, N, a, $, Pe, de, pe, he, Ee, Te, me, S, D, fe, ge, ie, U, De, Ie, be, ve, H, V, Oe, K, xe, B, I, Ne, ae, _e, se, Le, G, Ue, Ke, Be, oe, z, Fe, X, We, He, Ge, je, E, Ve, Xe, we, ne, qe, Je, Ye, Qe, Ze, q, J, F, et, tt, it, Y, k, at, st, ot, nt, ye, W, rt, O;
let b = class extends yt {
  constructor() {
    super(...arguments), Z(this, a), this._extraction = null, this._areaDetection = null, this._config = null, this._workflowAlias = null, this._loading = !0, this._extracting = !1, this._error = null, this._successMessage = null, this._collapsed = /* @__PURE__ */ new Set(), this._transformResult = null, this._viewMode = "elements", this._sourceConfig = null, this._pageMode = "all", this._pageInputValue = "", this._collapsePopoverOpen = !1, this._excludedAreas = /* @__PURE__ */ new Set(), this._areaTemplate = null, this._sectionPickerOpen = !1, this._teachingAreaIndex = null, this._inferenceResult = null, this._inferring = !1, this._sampleUrl = "", Z(this, g, ""), Z(this, N, /* @__PURE__ */ new Set());
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(kt, (e) => {
      e && (e.setRefreshHandler(() => o(this, a, K).call(this)), this.observe(e.unique, (t) => {
        t && (this._workflowAlias = decodeURIComponent(t), o(this, a, Pe).call(this));
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
    h(this, a, $);
    const e = h(this, a, $) === "web", t = h(this, a, $) === "markdown", i = this._areaDetection !== null || this._extraction !== null;
    return t ? u`
				<umb-body-layout header-fit-height>
					${i ? o(this, a, F).call(this) : m}
					${i && this._viewMode === "elements" ? o(this, a, at).call(this) : m}
					${o(this, a, ie).call(this)}
					${this._successMessage ? u`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : m}
					${i ? o(this, a, st).call(this) : o(this, a, W).call(this)}
				</umb-body-layout>
			` : e ? u`
				<umb-body-layout header-fit-height>
					${i ? o(this, a, F).call(this) : m}
					${i && this._viewMode === "elements" ? o(this, a, ot).call(this) : m}
					${o(this, a, ie).call(this)}
					${this._successMessage ? u`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : m}
					${i ? o(this, a, nt).call(this) : o(this, a, W).call(this)}
				</umb-body-layout>
			` : u`
			<umb-body-layout header-fit-height>
				${i ? o(this, a, F).call(this) : m}
				${i && this._viewMode === "elements" ? o(this, a, et).call(this) : m}
				${this._successMessage ? u`<div class="success-banner"><uui-icon name="icon-check"></uui-icon> ${this._successMessage}</div>` : m}
				${i ? o(this, a, tt).call(this) : o(this, a, W).call(this)}
			</umb-body-layout>
		`;
  }
};
g = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
$ = function() {
  return this._sourceConfig?.sourceTypes?.[0] ?? "pdf";
};
Pe = async function() {
  if (this._workflowAlias) {
    this._loading = !0, this._error = null;
    try {
      const e = await this.getContext(ce);
      ze(this, g, await e.getLatestToken());
      const [t, i, s] = await Promise.all([
        lt(this._workflowAlias, h(this, g)),
        ct(this._workflowAlias, h(this, g)),
        ut(this._workflowAlias, h(this, g))
      ]);
      this._extraction = t, this._config = i, this._sourceConfig = s, this._excludedAreas = new Set(s?.excludedAreas ?? []), ze(this, N, /* @__PURE__ */ new Set());
      for (const l of i?.validationWarnings ?? []) {
        const c = l.match(/blockKey '([^']+)' for target '([^']+)'/);
        c && h(this, N).add(`${c[1]}:${c[2]}`);
      }
      const n = (s?.sourceTypes?.[0] ?? "pdf") === "pdf", r = s?.sourceTypes?.[0] === "web";
      if (n) {
        const [l, c, p] = await Promise.all([
          T(this._workflowAlias, h(this, g)),
          C(this._workflowAlias, h(this, g)),
          dt(this._workflowAlias, h(this, g))
        ]);
        this._areaDetection = l, this._transformResult = c, this._areaTemplate = p;
        const d = t?.source.mediaKey;
        if (d && l) {
          const f = await re(this._workflowAlias, d, h(this, g));
          f && (this._transformResult = f);
        }
        s?.pages && Array.isArray(s.pages) && s.pages.length > 0 ? (this._pageMode = "custom", this._pageInputValue = o(this, a, pe).call(this, s.pages)) : (this._pageMode = "all", this._pageInputValue = "");
      } else if (r) {
        const [l, c] = await Promise.all([
          T(this._workflowAlias, h(this, g)),
          C(this._workflowAlias, h(this, g))
        ]);
        this._areaDetection = l, this._transformResult = c;
      } else {
        const [l, c] = await Promise.all([
          T(this._workflowAlias, h(this, g)),
          C(this._workflowAlias, h(this, g))
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
de = function(e) {
  const t = /* @__PURE__ */ new Set();
  for (const i of e.split(",")) {
    const s = i.trim();
    if (!s) continue;
    const n = s.split("-").map((r) => parseInt(r.trim(), 10));
    if (n.length === 1 && !isNaN(n[0]))
      t.add(n[0]);
    else if (n.length === 2 && !isNaN(n[0]) && !isNaN(n[1]))
      for (let r = n[0]; r <= n[1]; r++)
        t.add(r);
  }
  return [...t].sort((i, s) => i - s);
};
pe = function(e) {
  if (!e.length) return "";
  const t = [...e].sort((r, l) => r - l), i = [];
  let s = t[0], n = t[0];
  for (let r = 1; r < t.length; r++)
    t[r] === n + 1 || (i.push(s === n ? `${s}` : `${s}-${n}`), s = t[r]), n = t[r];
  return i.push(s === n ? `${s}` : `${s}-${n}`), i.join(", ");
};
he = function() {
  if (this._pageMode === "all") return null;
  const e = o(this, a, de).call(this, this._pageInputValue);
  return e.length > 0 ? e : null;
};
Ee = function(e) {
  if (this._pageMode === "all") return !0;
  const t = o(this, a, de).call(this, this._pageInputValue);
  return t.length === 0 || t.includes(e);
};
Te = async function() {
  if (!this._workflowAlias) return;
  const e = o(this, a, he).call(this);
  await mt(this._workflowAlias, e, h(this, g));
};
me = function(e) {
  if (!this._areaDetection) return [];
  const t = [];
  for (const i of this._areaDetection.pages) {
    const s = i.page;
    e === "pages" && t.push(`page-${s}`), e === "areas" && i.areas.forEach((n, r) => t.push(`area-p${s}-a${r}`)), e === "sections" && (i.areas.forEach((n, r) => {
      n.sections.forEach((l, c) => t.push(`p${s}-a${r}-s${c}`));
    }), i.areas.forEach((n) => {
      o(this, a, X).call(this, n, s).forEach((l) => t.push(`composed-${l.id}`));
    }));
  }
  return t;
};
S = function(e) {
  const t = o(this, a, me).call(this, e);
  return t.length > 0 && t.every((i) => this._collapsed.has(i));
};
D = function(e) {
  const t = o(this, a, me).call(this, e), i = o(this, a, S).call(this, e), s = new Set(this._collapsed);
  for (const n of t)
    i ? s.delete(n) : s.add(n);
  this._collapsed = s;
};
fe = function() {
  this._collapsed = /* @__PURE__ */ new Set();
};
ge = function(e) {
  this._collapsePopoverOpen = e.newState === "open";
};
ie = function() {
  return !this._areaDetection || this._viewMode !== "elements" ? m : u`
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
					@toggle=${o(this, a, ge)}>
					<umb-popover-layout>
						<uui-menu-item
							label="Expand All"
							@click=${() => o(this, a, fe).call(this)}>
							<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="${o(this, a, S).call(this, "areas") ? "Expand" : "Collapse"} Areas"
							@click=${() => o(this, a, D).call(this, "areas")}>
							<uui-icon slot="icon" name="icon-grid"></uui-icon>
						</uui-menu-item>
						<uui-menu-item
							label="${o(this, a, S).call(this, "sections") ? "Expand" : "Collapse"} Sections"
							@click=${() => o(this, a, D).call(this, "sections")}>
							<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
						</uui-menu-item>
					</umb-popover-layout>
				</uui-popover-container>
			</div>
		`;
};
U = async function() {
  if (!this._workflowAlias) return;
  const i = await (await this.getContext(A)).open(this, At, {
    data: {
      multiple: !1
    }
  }).onSubmit().catch(() => null);
  if (!i?.selection?.length) return;
  const s = i.selection[0];
  s && await o(this, a, xe).call(this, s);
};
De = async function() {
  if (!this._workflowAlias) return;
  const t = (await this.getContext(A)).open(this, zt, {
    data: {
      workflowAlias: this._workflowAlias,
      existingTemplate: this._areaTemplate,
      selectedPages: this._sourceConfig?.pages && Array.isArray(this._sourceConfig.pages) ? this._sourceConfig.pages : null
    }
  });
  try {
    const i = await t.onSubmit();
    if (i?.template) {
      const s = await le(this._workflowAlias, i.template, h(this, g));
      s && (this._areaTemplate = s, await o(this, a, K).call(this));
    }
  } catch {
  }
};
Ie = async function() {
  if (!this._workflowAlias || !this._areaDetection) return;
  const e = this._areaDetection.pages.flatMap(
    (s) => s.areas.map((n) => ({
      name: n.name || "Unnamed",
      elementCount: n.totalElements,
      color: n.color
    }))
  ), i = (await this.getContext(A)).open(this, Ct, {
    data: {
      areas: e,
      excludedAreas: [...this._excludedAreas],
      containers: this._extraction?.containers ?? null,
      containerOverrides: this._sourceConfig?.containerOverrides ?? []
    }
  });
  try {
    const s = await i.onSubmit();
    if (s) {
      if (JSON.stringify(s.containerOverrides ?? []) !== JSON.stringify(this._sourceConfig?.containerOverrides ?? [])) {
        const l = await pt(
          this._workflowAlias,
          s.containerOverrides ?? [],
          h(this, g)
        );
        l != null && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, containerOverrides: l });
        const [c, p] = await Promise.all([
          T(this._workflowAlias, h(this, g)),
          C(this._workflowAlias, h(this, g))
        ]);
        c && (this._areaDetection = c), p && (this._transformResult = p);
      }
      if (JSON.stringify([...s.excludedAreas].sort()) !== JSON.stringify([...this._excludedAreas].sort())) {
        this._excludedAreas = new Set(s.excludedAreas);
        const l = await ht(this._workflowAlias, s.excludedAreas, h(this, g));
        l != null && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, excludedAreas: l });
        const c = await C(this._workflowAlias, h(this, g));
        c && (this._transformResult = c);
      }
    }
  } catch {
  }
};
be = function() {
  if (!this._areaDetection) return [];
  const e = [], t = /* @__PURE__ */ new Set();
  for (const i of this._areaDetection.pages)
    for (const s of i.areas) {
      const n = s.name || "Area", r = L(n);
      if (t.has(r) || this._excludedAreas.has(r)) continue;
      t.add(r);
      const l = o(this, a, G).call(this, s), c = this._sourceConfig?.areaRules?.[r], p = !!c && ((c.groups?.length ?? 0) > 0 || (c.rules?.length ?? 0) > 0);
      e.push({ areaKey: r, areaName: n, elements: l, hasRules: p });
    }
  return e;
};
ve = function(e) {
  this._sectionPickerOpen = e.newState === "open";
};
H = async function(e, t) {
  if (!this._workflowAlias) return;
  const i = {
    ...this._sourceConfig?.areaRules ?? {}
  };
  t.groups.length > 0 || t.rules.length > 0 ? i[e] = t : delete i[e];
  const n = await ft(this._workflowAlias, i, h(this, g));
  n && this._sourceConfig && (this._sourceConfig = { ...this._sourceConfig, areaRules: n });
  const r = this._extraction?.source.mediaKey;
  if (r) {
    const l = await re(this._workflowAlias, r, h(this, g));
    l && (this._transformResult = l);
  } else {
    const l = await gt(this._workflowAlias, h(this, g));
    l && (this._transformResult = l);
  }
};
V = async function(e, t, i, s) {
  if (!this._workflowAlias) return;
  const n = this._sourceConfig?.areaRules?.[e] ?? null, l = (await this.getContext(A)).open(this, St, {
    data: {
      workflowAlias: this._workflowAlias,
      sectionId: e,
      sectionHeading: t,
      elements: i,
      existingRules: n,
      sectionCount: s,
      sourceType: h(this, a, $),
      onSave: async (c) => {
        await o(this, a, H).call(this, e, c);
      }
    }
  });
  try {
    const c = await l.onSubmit();
    c?.rules && await o(this, a, H).call(this, e, c.rules);
  } catch {
  }
};
Oe = async function() {
  const e = this._extraction?.source.mediaKey;
  if (!e) return;
  const t = this._areaDetection?.totalPages ?? this._extraction?.source.totalPages ?? 0;
  if (t === 0) return;
  const i = o(this, a, he).call(this), r = await (await this.getContext(A)).open(this, xt, {
    data: { mediaKey: e, totalPages: t, selectedPages: i }
  }).onSubmit().catch(() => null);
  r !== null && (r.selectedPages === null ? (this._pageMode = "all", this._pageInputValue = "") : (this._pageMode = "custom", this._pageInputValue = o(this, a, pe).call(this, r.selectedPages)), await o(this, a, Te).call(this));
};
K = async function() {
  if (h(this, a, $) === "web") {
    const t = this._extraction?.source.fileName;
    return t ? o(this, a, O).call(this, t) : void 0;
  }
  const e = this._extraction?.source.mediaKey;
  if (!e)
    return o(this, a, U).call(this);
  await o(this, a, xe).call(this, e);
};
xe = async function(e) {
  if (this._workflowAlias) {
    this._extracting = !0, this._error = null;
    try {
      const i = await (await this.getContext(ce)).getLatestToken();
      if (h(this, a, $) === "pdf") {
        const [n, r] = await Promise.all([
          ee(this._workflowAlias, e, i),
          re(this._workflowAlias, e, i)
        ]);
        if (n && (this._extraction = n), r) {
          this._transformResult = r;
          const l = await T(this._workflowAlias, i);
          this._areaDetection = l;
          const c = r.diagnostics, p = c.roleSections > 0 ? `, ${c.roleSections} role` : "";
          this._successMessage = `Content extracted — ${c.totalSections} sections (${c.bulletListSections} bullet, ${c.paragraphSections} paragraph, ${c.subHeadedSections} sub-headed${p})`, setTimeout(() => {
            this._successMessage = null;
          }, 5e3);
        } else n ? (this._successMessage = `Content extracted — ${n.elements.length} elements (transform unavailable)`, setTimeout(() => {
          this._successMessage = null;
        }, 5e3)) : this._error = "Extraction failed. Check that the selected media item is a PDF.";
      } else {
        const n = await ee(this._workflowAlias, e, i);
        if (n) {
          this._extraction = n;
          const r = await C(this._workflowAlias, i);
          this._transformResult = r, this._successMessage = `Content extracted — ${n.elements.length} elements`, setTimeout(() => {
            this._successMessage = null;
          }, 5e3);
        } else
          this._error = `Extraction failed. Check that the selected media item is a valid ${h(this, a, $)} file.`;
      }
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Extraction failed", console.error("Extraction failed:", t);
    } finally {
      this._extracting = !1;
    }
  }
};
B = function(e) {
  return this._collapsed.has(e);
};
I = function(e) {
  const t = new Set(this._collapsed);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsed = t;
};
Ne = function(e) {
  return this._transformResult ? Ce(this._transformResult).find((i) => i.id === e)?.included ?? !0 : !0;
};
ae = async function(e, t) {
  if (!this._workflowAlias) return;
  const i = await bt(this._workflowAlias, e, t, h(this, g));
  i && (this._transformResult = i);
};
_e = function(e) {
  if (!this._config?.map?.mappings) return [];
  const t = [];
  for (const i of this._config.map.mappings)
    if (i.source === e && i.enabled)
      for (const s of i.destinations)
        t.push(s);
  return t;
};
se = function(e) {
  if (!this._config?.destination) return e.target;
  if (e.blockKey)
    for (const i of Ae(this._config.destination)) {
      const s = i.blocks.find((n) => n.key === e.blockKey);
      if (s) {
        const n = s.properties?.find((r) => r.alias === e.target);
        return `${s.label} > ${n?.label || e.target}`;
      }
    }
  const t = this._config.destination.fields.find((i) => i.alias === e.target);
  if (t) return t.label;
  for (const i of Ae(this._config.destination))
    for (const s of i.blocks) {
      const n = s.properties?.find((r) => r.alias === e.target);
      if (n) return `${s.label} > ${n.label || n.alias}`;
    }
  return e.target;
};
Le = function(e, t) {
  if (!this._areaDetection) return t;
  let i = 0;
  for (const s of this._areaDetection.pages) {
    if (s.page === e) return i + t;
    i += s.areas.length;
  }
  return i + t;
};
G = function(e) {
  const t = [];
  for (const i of e.sections)
    i.heading && t.push(i.heading), t.push(...i.children);
  return t;
};
Ue = async function(e) {
  if (!(this._teachingAreaIndex === null || !this._workflowAlias || this._inferring)) {
    this._inferring = !0, this._inferenceResult = null;
    try {
      const t = await vt(
        this._workflowAlias,
        this._teachingAreaIndex,
        e,
        h(this, g)
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
  const i = { ...this._areaTemplate, areas: t }, s = await le(this._workflowAlias, i, h(this, g));
  s && (this._areaTemplate = s, this._teachingAreaIndex = null, this._inferenceResult = null, await o(this, a, K).call(this));
};
Be = async function() {
  if (this._teachingAreaIndex === null || !this._workflowAlias || !this._areaTemplate) return;
  const e = this._teachingAreaIndex;
  if (e < 0 || e >= this._areaTemplate.areas.length) return;
  const t = [...this._areaTemplate.areas];
  t[e] = { ...t[e], sectionPattern: { conditions: [] } };
  const i = { ...this._areaTemplate, areas: t }, s = await le(this._workflowAlias, i, h(this, g));
  s && (this._areaTemplate = s, this._teachingAreaIndex = null, this._inferenceResult = null, await o(this, a, K).call(this));
};
oe = function() {
  this._teachingAreaIndex = null, this._inferenceResult = null, this._inferring = !1;
};
z = function(e) {
  return L(e.name || "");
};
Fe = function(e) {
  const t = o(this, a, z).call(this, e), i = this._sourceConfig?.areaRules?.[t];
  return i ? (i.groups?.length ?? 0) > 0 || (i.rules?.length ?? 0) > 0 : !1;
};
X = function(e, t) {
  if (!this._transformResult) return [];
  const i = this._transformResult.areas.find(
    (r) => r.name === e.name && r.page === t
  );
  if (!i) return [];
  const s = [];
  for (const r of i.groups)
    s.push(...r.sections);
  return s.push(...i.sections), s.some((r) => r.sortOrder != null) && s.sort((r, l) => {
    const c = r.sortOrder ?? Number.MAX_SAFE_INTEGER, p = l.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return c - p;
  }), s;
};
We = function(e) {
  const t = e.currentTarget, i = t.shadowRoot?.querySelector("#header");
  if (!i) return;
  const s = i.getBoundingClientRect(), n = e.clientY >= s.top && e.clientY <= s.bottom;
  t.classList.toggle("page-header-hovered", n);
};
He = function(e) {
  e.currentTarget.classList.remove("page-header-hovered");
};
Ge = async function(e, t) {
  if (!this._workflowAlias) return;
  const s = (await this.getContext(A)).open(this, te, {
    data: {
      headline: "Sort areas",
      items: t.map((n) => ({ id: n.name, name: n.name }))
    }
  });
  try {
    const n = await s.onSubmit(), r = await Me(this._workflowAlias, e, null, n.sortedIds, h(this, g));
    r && (this._transformResult = r);
  } catch {
  }
};
je = async function(e, t) {
  if (!this._workflowAlias) return;
  const i = L(e.name || ""), s = this._sourceConfig?.areaRules?.[i];
  if (!!s && (s.groups?.length ?? 0) >= 2) {
    const l = (await this.getContext(A)).open(this, te, {
      data: {
        headline: `Sort sections — ${e.name}`,
        items: s.groups.map((c) => ({ id: c.name, name: c.name }))
      }
    });
    try {
      const p = (await l.onSubmit()).sortedIds.map((f) => s.groups.find((_) => _.name === f)).filter(Boolean), d = { ...s, groups: p };
      await o(this, a, H).call(this, i, d);
    } catch {
    }
  } else {
    const l = (this._transformResult ? o(this, a, X).call(this, e, t) : []).filter((d) => d.included), p = (await this.getContext(A)).open(this, te, {
      data: {
        headline: `Sort sections — ${e.name}`,
        items: l.map((d) => ({
          id: d.id,
          name: d.heading ?? d.groupName ?? d.ruleName ?? (d.areaName ? `${d.areaName} - Section` : "Section")
        }))
      }
    });
    try {
      const d = await p.onSubmit(), f = await Me(this._workflowAlias, t, e.name, d.sortedIds, h(this, g));
      f && (this._transformResult = f);
    } catch {
    }
  }
};
E = async function(e, t = "content") {
  if (!this._workflowAlias || !this._config?.destination) return;
  const s = (await this.getContext(A)).open(this, Mt, {
    data: {
      destination: this._config.destination,
      existingMappings: this._config.map?.mappings ?? []
    }
  });
  let n;
  try {
    n = await s.onSubmit();
  } catch {
    return;
  }
  if (!n?.selectedTargets?.length) return;
  const r = `${e.id}.${t}`, l = this._config.map?.mappings ?? [], c = {
    source: r,
    sourceKey: e.stableKey ?? void 0,
    destinations: n.selectedTargets.map((y) => ({ target: y.target, blockKey: y.blockKey, contentTypeKey: y.contentTypeKey })),
    enabled: !0
  }, p = l.findIndex((y) => y.source === r), d = p >= 0 ? l.map((y, M) => M === p ? c : y) : [...l, c], f = {
    ...this._config.map ?? { version: "1.0", mappings: [] },
    mappings: d
  }, _ = await Se(this._workflowAlias, f, h(this, g));
  _ && (this._config = { ...this._config, map: _ });
};
Ve = async function(e, t) {
  if (!this._workflowAlias || !this._config?.map) return;
  const i = this._config.map.mappings, s = i.findIndex((d) => d.source === e);
  if (s < 0) return;
  const r = i[s].destinations.filter(
    (d) => !(d.target === t.target && d.blockKey === t.blockKey)
  );
  let l;
  r.length === 0 ? l = i.filter((d, f) => f !== s) : l = i.map(
    (d, f) => f === s ? { ...d, destinations: r } : d
  );
  const c = { ...this._config.map, mappings: l }, p = await Se(this._workflowAlias, c, h(this, g));
  p && (this._config = { ...this._config, map: p });
};
Xe = function(e) {
  const t = ["content", "heading", "title", "description", "summary"], i = t.some((c) => o(this, a, _e).call(this, `${e.id}.${c}`).length > 0), s = `composed-${e.id}`, n = o(this, a, B).call(this, s), r = e.groupName ?? e.ruleName ?? (e.areaName ? `${e.areaName} - Section` : "Section"), l = !!e.groupName;
  return u`
			<div class="section-box">
				<div class="section-box-header" @click=${() => o(this, a, I).call(this, s)}>
					<uui-symbol-expand class="collapse-chevron" .open=${!n}></uui-symbol-expand>
					<uui-icon class="level-icon" name="icon-thumbnail-list"></uui-icon>
					<span class="section-box-label">${r}</span>
					<span class="header-spacer"></span>
					${i && n ? t.map((c) => o(this, a, k).call(this, `${e.id}.${c}`)) : m}
					<uui-action-bar class="row-actions"></uui-action-bar>
				</div>
				${n ? m : u`
					<div class="section-box-content">
						${l ? u`
							${e.heading ? u`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Title</span>
										<div class="part-box-content">${P(R(e.heading))}</div>
										<div class="part-box-actions">
											${o(this, a, k).call(this, `${e.id}.title`)}
											${o(this, a, k).call(this, `${e.id}.heading`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), o(this, a, E).call(this, e, "title");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : m}
							${e.content ? u`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Content</span>
										<div class="part-box-content">${P(R(e.content))}</div>
										<div class="part-box-actions">
											${o(this, a, k).call(this, `${e.id}.content`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), o(this, a, E).call(this, e, "content");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : m}
							${e.description ? u`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Description</span>
										<div class="part-box-content">${P(R(e.description))}</div>
										<div class="part-box-actions">
											${o(this, a, k).call(this, `${e.id}.description`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), o(this, a, E).call(this, e, "description");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : m}
							${e.summary ? u`
								<div class="part-box">
									<div class="part-box-row">
										<span class="part-box-label">Summary</span>
										<div class="part-box-content">${P(R(e.summary))}</div>
										<div class="part-box-actions">
											${o(this, a, k).call(this, `${e.id}.summary`)}
											<uui-button class="md-map-btn" look="outline" compact label="Map"
												@click=${(c) => {
    c.stopPropagation(), o(this, a, E).call(this, e, "summary");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
										</div>
									</div>
								</div>
							` : m}
						` : u`
							${e.content ? u`
								<div class="part-box-row">
									<div class="part-box-content">${P(R(e.content))}</div>
									<div class="part-box-actions">
										${t.map((c) => o(this, a, k).call(this, `${e.id}.${c}`))}
										<uui-button class="md-map-btn" look="outline" compact label="Map"
											@click=${(c) => {
    c.stopPropagation(), o(this, a, E).call(this, e, "content");
  }}><uui-icon name="icon-nodes"></uui-icon> Map</uui-button>
									</div>
								</div>
							` : m}
						`}
					</div>
				`}
			</div>
		`;
};
we = function(e) {
  const t = e.trimStart();
  return /^[•\-\*▪▸▶►●○◦‣⁃]/.test(t) || /^\d+[\.\)]\s/.test(t) ? "list" : "paragraph";
};
ne = function(e, t) {
  const i = t === "heading" ? "heading" : o(this, a, we).call(this, e.text), s = i === "heading" ? "Heading" : i === "list" ? "List Item" : "Paragraph", n = e.htmlTag || e.fontName, r = e.htmlContainerPath ? e.htmlContainerPath.split("/").pop() ?? "" : "";
  return u`
			<div class="element-item">
				<div class="element-content">
					<div class="element-text">${e.text}</div>
					<div class="element-meta">
						<span class="meta-badge text-type ${i}">${s}</span>
						<span class="meta-badge font-size">${e.fontSize}pt</span>
						<span class="meta-badge font-name">${n}</span>
						<span class="meta-badge color" style="border-left: 3px solid ${e.color};">${e.color}</span>
						${r ? u`<span class="meta-badge container-path" title="${e.htmlContainerPath ?? ""}">${r}</span>` : m}
						${e.text === e.text.toUpperCase() && e.text !== e.text.toLowerCase() ? u`<span class="meta-badge text-case">UPPERCASE</span>` : m}
					</div>
				</div>
			</div>
		`;
};
qe = function(e, t, i, s) {
  const n = o(this, a, B).call(this, t), r = e.heading ? L(e.heading.text) : `preamble-p${i}-a${s}`, l = o(this, a, Ne).call(this, r);
  if (!e.heading)
    return u`
				<div class="area-section ${l ? "" : "excluded"}">
					<div class="section-heading preamble" @click=${() => o(this, a, I).call(this, t)}>
						<uui-symbol-expand class="collapse-chevron" .open=${!n}></uui-symbol-expand>
						<span class="heading-text preamble-label">Content</span>
						<span class="group-count">${e.children.length} element${e.children.length !== 1 ? "s" : ""}</span>
						<uui-toggle
							label="${l ? "Included" : "Excluded"}"
							?checked=${l}
							@click=${(f) => f.stopPropagation()}
							@change=${(f) => o(this, a, ae).call(this, r, f.target.checked)}>
						</uui-toggle>
					</div>
					${l && !n ? u`
						${e.children.map((f) => o(this, a, ne).call(this, f))}
					` : m}
				</div>
			`;
  const c = e.heading, p = e.children.length, d = p > 0;
  return u`
			<div class="area-section ${l ? "" : "excluded"}">
				<div class="section-heading" @click=${d ? () => o(this, a, I).call(this, t) : m}>
					${d ? u`<uui-symbol-expand class="collapse-chevron" .open=${!n}></uui-symbol-expand>` : u`<uui-icon class="collapse-chevron placeholder"></uui-icon>`}
					<uui-icon class="level-icon" name="icon-thumbnail-list"></uui-icon>
					<span class="heading-text" title="${c.text}">${c.text}</span>
					${d ? u`<span class="group-count">${p} element${p !== 1 ? "s" : ""}</span>` : m}
					<uui-toggle
						label="${l ? "Included" : "Excluded"}"
						?checked=${l}
						@click=${(f) => f.stopPropagation()}
						@change=${(f) => o(this, a, ae).call(this, r, f.target.checked)}>
					</uui-toggle>
				</div>
				${d && !n && l ? u`
					<div class="section-children">
						${e.children.map((f) => o(this, a, ne).call(this, f))}
					</div>
				` : m}
			</div>
		`;
};
Je = function(e) {
  const t = this._inferenceResult?.clickedElementId === e.id, i = this._inferenceResult?.matchingElementIds?.includes(e.id) ?? !1, s = o(this, a, we).call(this, e.text), n = s === "list" ? "List Item" : "Paragraph", r = e.htmlTag || e.fontName, l = e.htmlContainerPath ? e.htmlContainerPath.split("/").pop() ?? "" : "";
  return u`
			<div class="element-item teach-element ${t ? "teach-clicked" : ""} ${i ? "teach-matched" : ""}"
				@click=${() => o(this, a, Ue).call(this, e.id)}>
				<div class="element-content">
					<div class="element-text">${e.text}</div>
					<div class="element-meta">
						<span class="meta-badge text-type ${s}">${n}</span>
						<span class="meta-badge font-size">${e.fontSize}pt</span>
						<span class="meta-badge font-name">${r}</span>
						<span class="meta-badge color" style="border-left: 3px solid ${e.color};">${e.color}</span>
						${l ? u`<span class="meta-badge container-path" title="${e.htmlContainerPath ?? ""}">${l}</span>` : m}
						${e.text === e.text.toUpperCase() && e.text !== e.text.toLowerCase() ? u`<span class="meta-badge text-case">UPPERCASE</span>` : m}
					</div>
				</div>
			</div>
		`;
};
Ye = function() {
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
						<uui-button look="primary" color="default" label="Confirm" @click=${() => o(this, a, Ke).call(this)}>
							<uui-icon name="icon-check"></uui-icon> Confirm
						</uui-button>
						<uui-button look="secondary" label="Cancel" @click=${() => o(this, a, oe).call(this)}>Cancel</uui-button>
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
					<uui-button look="secondary" compact label="No Sections" @click=${() => o(this, a, Be).call(this)}
						title="This area has no repeating section structure">
						No Sections
					</uui-button>
					<uui-button look="default" compact label="Cancel" @click=${() => o(this, a, oe).call(this)}>Cancel</uui-button>
				</div>
			</div>
		`;
};
Qe = function(e, t, i) {
  const s = `area-p${t}-a${i}`, n = o(this, a, Le).call(this, t, i), r = this._teachingAreaIndex === n, l = r ? !1 : o(this, a, B).call(this, s), c = o(this, a, z).call(this, e), p = o(this, a, Fe).call(this, e), d = p && this._transformResult ? o(this, a, X).call(this, e, t) : [], f = p && d.length > 0, _ = f ? d.length : e.sections.length, M = e.sectionPattern != null ? e.sectionPattern.conditions.length > 0 ? "Configured" : "Flat" : null, $e = this._sourceConfig?.areaRules?.[c], ke = ($e?.rules?.length ?? 0) + ($e?.groups?.reduce((w, Q) => w + Q.rules.length, 0) ?? 0);
  return u`
			<div class="detected-area ${r ? "area-teaching" : ""}" style="border-left-color: ${e.color};">
				<div class="area-header" @click=${() => !r && o(this, a, I).call(this, s)}>
					<uui-symbol-expand class="collapse-chevron" .open=${!l}></uui-symbol-expand>
					<uui-icon class="level-icon" name="icon-grid"></uui-icon>
					<span class="area-name">${e.name || `${i + 1}`}</span>
					${p ? u`<span class="meta-badge rules-info">${ke} rule${ke !== 1 ? "s" : ""}</span>` : m}
					${!p && M ? u`<span class="meta-badge structure-badge">${M}</span>` : m}
					<span class="header-spacer"></span>
					${r ? m : u`
						<span class="meta-badge section-count-badge">${_} section${_ !== 1 ? "s" : ""}</span>
					`}
					<uui-action-bar class="row-actions">
						<uui-button class="action-trigger" compact label="Actions"
							@click=${(w) => w.stopPropagation()}
							popovertarget="area-actions-${s}">
							<uui-symbol-more></uui-symbol-more>
						</uui-button>
						<uui-popover-container
							id="area-actions-${s}"
							placement="bottom-start">
							<umb-popover-layout>
								<uui-menu-item label="Edit sections"
									@click=${(w) => {
    w.stopPropagation(), o(this, a, V).call(this, c, e.name || "", o(this, a, G).call(this, e), _);
  }}>
									<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
								</uui-menu-item>
								<uui-menu-item label="Sort sections"
									@click=${(w) => {
    w.stopPropagation(), o(this, a, je).call(this, e, t);
  }}>
									<uui-icon slot="icon" name="icon-navigation"></uui-icon>
								</uui-menu-item>
							</umb-popover-layout>
						</uui-popover-container>
					</uui-action-bar>
				</div>
				${l ? m : u`
					${r ? u`
						${o(this, a, Ye).call(this)}
						<div class="teach-elements">
							${o(this, a, G).call(this, e).map((w) => o(this, a, Je).call(this, w))}
						</div>
					` : f ? u`
						<div class="composed-sections">
							${d.map((w) => o(this, a, Xe).call(this, w))}
						</div>
					` : u`
						${e.sections.map(
    (w, Q) => o(this, a, qe).call(this, w, `p${t}-a${i}-s${Q}`, t, i)
  )}
					`}
				`}
			</div>
		`;
};
Ze = function(e, t) {
  const i = t.filter((p) => {
    const d = o(this, a, z).call(this, p);
    return !this._excludedAreas.has(d);
  });
  if (i.length === 0) return m;
  if (this._transformResult) {
    const p = /* @__PURE__ */ new Map();
    for (const d of this._transformResult.areas)
      d.page === e && d.sortOrder != null && p.set(d.name.toLowerCase(), d.sortOrder);
    p.size > 0 && i.sort((d, f) => {
      const _ = p.get(d.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER, y = p.get(f.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      return _ - y;
    });
  }
  const s = `page-${e}`, n = o(this, a, B).call(this, s), r = i.length, l = i.reduce((p, d) => p + d.sections.length, 0), c = o(this, a, Ee).call(this, e);
  return u`
			<uui-box class="page-box ${c ? "" : "page-excluded"}"
				@mouseover=${(p) => o(this, a, We).call(this, p)}
				@mouseleave=${(p) => o(this, a, He).call(this, p)}>
				<div slot="header" class="tree-header"
					@click=${() => o(this, a, I).call(this, s)}>
					<uui-symbol-expand class="collapse-chevron" .open=${!n}></uui-symbol-expand>
					<uui-icon class="level-icon" name="icon-document"></uui-icon>
					<strong class="page-title">Page ${e}</strong>
				</div>
				<div slot="header-actions" class="page-header-actions">
					<span class="group-count">${l} section${l !== 1 ? "s" : ""}, ${r} area${r !== 1 ? "s" : ""}</span>
					<uui-action-bar class="row-actions">
						<uui-button class="action-trigger" compact label="Actions"
							@click=${(p) => p.stopPropagation()}
							popovertarget="page-actions-${s}">
							<uui-symbol-more></uui-symbol-more>
						</uui-button>
						<uui-popover-container
							id="page-actions-${s}"
							placement="bottom-start">
							<umb-popover-layout>
								<uui-menu-item label="Sort areas"
									@click=${(p) => {
    p.stopPropagation(), o(this, a, Ge).call(this, e, i);
  }}>
									<uui-icon slot="icon" name="icon-navigation"></uui-icon>
								</uui-menu-item>
							</umb-popover-layout>
						</uui-popover-container>
					</uui-action-bar>
				</div>
				${n ? m : u`
					${i.map((p, d) => o(this, a, Qe).call(this, p, e, d))}
				`}
			</uui-box>
		`;
};
q = function() {
  return this._areaDetection ? u`
			${this._areaDetection.pages.map(
    (e) => o(this, a, Ze).call(this, e.page, e.areas)
  )}
		` : m;
};
J = function() {
  return this._areaDetection ? this._areaDetection.pages.reduce((e, t) => e + t.areas.filter((i) => !this._excludedAreas.has(o(this, a, z).call(this, i))).reduce((i, s) => i + s.sections.length, 0), 0) : 0;
};
F = function() {
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
et = function() {
  const e = this._areaDetection !== null, t = this._extraction !== null;
  if (!e && !t) return m;
  const i = this._areaDetection?.totalPages ?? (t ? this._extraction.source.totalPages : 0), s = this._sourceConfig?.pages, n = Array.isArray(s) && s.length > 0, r = n ? s.length : i, l = n && i > 0 ? `${r} of ${i}` : `${i}`, c = e ? this._areaDetection.pages.reduce((_, y) => _ + y.areas.filter((M) => !this._excludedAreas.has(o(this, a, z).call(this, M))).length, 0) : 0, p = e ? o(this, a, J).call(this) : 0, d = t ? this._extraction.source.fileName : "", f = t ? new Date(this._extraction.source.extractedDate).toLocaleString() : "";
  return u`
			<div class="info-boxes">
				<uui-box class="info-box-item">
					<div slot="headline" class="box-headline-row">
						<span>Source</span>
						<span class="box-headline-meta">${f}</span>
					</div>
					<div class="box-content">
						<uui-icon name="icon-page-add" class="box-icon"></uui-icon>
						<span class="box-stat box-filename" title="${d}">${d}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Source" @click=${o(this, a, U)} ?disabled=${this._extracting}>
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
							<uui-button look="primary" color="default" label="Pages" @click=${o(this, a, Oe)}>
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
							<uui-button look="primary" color="default" label="Areas" @click=${o(this, a, De)}>
								<uui-icon name="icon-grid"></uui-icon>
								Areas
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Sections" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-thumbnail-list" class="box-icon"></uui-icon>
						<span class="box-stat">${p}</span>
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
									placement="bottom-start"
									@toggle=${o(this, a, ve)}>
									<umb-popover-layout>
										<div class="popover-heading">Areas</div>
										${o(this, a, be).call(this).map((_) => u`
											<uui-menu-item
												label="${_.areaName}"
												@click=${() => o(this, a, V).call(this, _.areaKey, _.areaName, _.elements)}>
												<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
												<span slot="badge" class="section-picker-meta">${_.elements.length} el</span>
											</uui-menu-item>
										`)}
									</umb-popover-layout>
								</uui-popover-container>
							</div>
						` : m}
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
						@toggle=${o(this, a, ge)}>
						<umb-popover-layout>
							<uui-menu-item
								label="Expand All"
								@click=${() => o(this, a, fe).call(this)}>
								<uui-icon slot="icon" name="icon-navigation-down"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${o(this, a, S).call(this, "pages") ? "Expand" : "Collapse"} Pages"
								@click=${() => o(this, a, D).call(this, "pages")}>
								<uui-icon slot="icon" name="icon-document"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${o(this, a, S).call(this, "areas") ? "Expand" : "Collapse"} Areas"
								@click=${() => o(this, a, D).call(this, "areas")}>
								<uui-icon slot="icon" name="icon-grid"></uui-icon>
							</uui-menu-item>
							<uui-menu-item
								label="${o(this, a, S).call(this, "sections") ? "Expand" : "Collapse"} Sections"
								@click=${() => o(this, a, D).call(this, "sections")}>
								<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
							</uui-menu-item>
						</umb-popover-layout>
					</uui-popover-container>
				</div>
			` : m}
		`;
};
tt = function() {
  const e = this._areaDetection !== null;
  return this._viewMode === "elements" ? e ? o(this, a, q).call(this) : m : o(this, a, Y).call(this);
};
it = function() {
  if (!this._transformResult) return "";
  const e = this._sourceConfig?.areaRules ?? {}, t = new Set(Object.keys(e).filter(
    (n) => {
      const r = e[n];
      return (r.groups?.length ?? 0) > 0 || (r.rules?.length ?? 0) > 0;
    }
  )), i = Ce(this._transformResult).filter((n) => {
    if (!n.included) return !1;
    if (t.size === 0) return !0;
    const r = n.areaName ? L(n.areaName) : null;
    return r != null && t.has(r);
  }), s = [];
  for (const n of i)
    n.heading && n.pattern !== "role" && (s.push(`## ${n.heading}`), s.push("")), n.content && s.push(n.content), n.description && s.push(n.description), n.summary && s.push(n.summary), s.length > 0 && s.push("");
  return s.join(`
`);
};
Y = function() {
  if (!this._transformResult)
    return u`
				<div class="empty-state">
					<uui-icon name="icon-lab" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
					<h3>No transform result</h3>
					<p>Save to extract content and generate the transformed view.</p>
				</div>
			`;
  const e = o(this, a, it).call(this);
  if (!e.trim())
    return u`
				<div class="empty-state">
					<uui-icon name="icon-lab" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
					<h3>No content</h3>
					<p>All sections are excluded. Include at least one section to see the preview.</p>
				</div>
			`;
  const t = R(e);
  return u`
			<div class="transformed-preview">
				<div class="md-section-content">${P(t)}</div>
			</div>
		`;
};
k = function(e) {
  const t = o(this, a, _e).call(this, e);
  return t.length === 0 ? m : t.map((i) => {
    const n = i.blockKey && h(this, N).has(`${i.blockKey}:${i.target}`) ? "warning" : "positive";
    return u`<uui-tag color="${n}" look="primary" class="mapped-tag" title="${o(this, a, se).call(this, i)}">
				${o(this, a, se).call(this, i)}
				<button class="unmap-x" title="Remove mapping" @click=${(r) => {
      r.stopPropagation(), o(this, a, Ve).call(this, e, i);
    }}>&times;</button>
			</uui-tag>`;
  });
};
at = function() {
  if (!this._extraction) return m;
  const e = this._extraction.source.fileName ?? "", t = new Date(this._extraction.source.extractedDate).toLocaleString(), i = this._areaDetection !== null, s = i ? this._areaDetection.pages.reduce((r, l) => r + l.areas.filter((c) => !this._excludedAreas.has(o(this, a, z).call(this, c))).length, 0) : 0, n = i ? o(this, a, J).call(this) : 0;
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
								@click=${o(this, a, U)} ?disabled=${this._extracting}>
								<uui-icon name="icon-document"></uui-icon> Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${s}</span>
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
st = function() {
  return this._viewMode === "transformed" ? o(this, a, Y).call(this) : this._areaDetection ? o(this, a, q).call(this) : o(this, a, ye).call(this);
};
ot = function() {
  if (!this._extraction) return m;
  const e = this._extraction.source.fileName ?? "", t = new Date(this._extraction.source.extractedDate).toLocaleString(), i = this._areaDetection !== null, s = i ? this._areaDetection.pages.reduce((r, l) => r + l.areas.filter((c) => !this._excludedAreas.has(o(this, a, z).call(this, c))).length, 0) : 0, n = i ? o(this, a, J).call(this) : 0;
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
    r.key === "Enter" && this._sampleUrl && o(this, a, O).call(this, this._sampleUrl);
  }}>
						</uui-input>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Source"
								@click=${() => o(this, a, O).call(this, this._sampleUrl || e)}
								?disabled=${this._extracting}>
								<uui-icon name="icon-globe"></uui-icon> Source
							</uui-button>
						</div>
					</div>
				</uui-box>

				<uui-box headline="Areas" class="info-box-item">
					<div class="box-content">
						<uui-icon name="icon-grid" class="box-icon"></uui-icon>
						<span class="box-stat">${s}</span>
						<div class="box-buttons">
							<uui-button look="primary" color="default" label="Areas" @click=${o(this, a, Ie)}>
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
									placement="bottom-start"
									@toggle=${o(this, a, ve)}>
									<umb-popover-layout>
										<div class="popover-heading">Areas</div>
										${o(this, a, be).call(this).map((r) => u`
											<uui-menu-item
												label="${r.areaName}"
												@click=${() => o(this, a, V).call(this, r.areaKey, r.areaName, r.elements)}>
												<uui-icon slot="icon" name="icon-thumbnail-list"></uui-icon>
												<span slot="badge" class="section-picker-meta">${r.elements.length} el</span>
											</uui-menu-item>
										`)}
									</umb-popover-layout>
								</uui-popover-container>
							</div>
						` : m}
					</div>
				</uui-box>
			</div>
		`;
};
nt = function() {
  return this._viewMode === "transformed" ? o(this, a, Y).call(this) : this._areaDetection ? o(this, a, q).call(this) : o(this, a, ye).call(this);
};
ye = function() {
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
								${o(this, a, k).call(this, e.id)}
							</div>
						</div>
					`;
  })}
			</div>
		` : u`<p style="padding: var(--uui-size-layout-1); color: var(--uui-color-text-alt);">No elements extracted.</p>`;
};
W = function() {
  if (h(this, a, $) === "web")
    return o(this, a, rt).call(this);
  const e = h(this, a, $) === "pdf", t = "Source...", i = e ? "Choose a PDF from the media library to extract text elements with their metadata." : `Choose a ${h(this, a, $)} file from the media library to extract content.`;
  return u`
			<div class="empty-state">
				<uui-icon name="icon-document" style="font-size: 48px; color: var(--uui-color-text-alt);"></uui-icon>
				<h3>No sample extraction</h3>
				<p>${i}</p>
				<uui-button look="primary" label="${t}" @click=${o(this, a, U)} ?disabled=${this._extracting}>
					${this._extracting ? u`<uui-loader-bar></uui-loader-bar>` : t}
				</uui-button>
			</div>
		`;
};
rt = function() {
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
    e.key === "Enter" && this._sampleUrl && o(this, a, O).call(this, this._sampleUrl);
  }}>
					</uui-input>
					<uui-button
						look="primary"
						label="Extract"
						?disabled=${!this._sampleUrl || this._extracting}
						@click=${() => o(this, a, O).call(this, this._sampleUrl)}>
						${this._extracting ? u`<uui-loader-bar></uui-loader-bar>` : "Extract"}
					</uui-button>
				</div>
			</div>
		`;
};
O = async function(e) {
  if (!(!this._workflowAlias || !e)) {
    this._extracting = !0, this._error = null;
    try {
      const i = await (await this.getContext(ce)).getLatestToken(), s = await ee(this._workflowAlias, "", i, e);
      if (s) {
        this._extraction = s;
        const [n, r] = await Promise.all([
          T(this._workflowAlias, i),
          C(this._workflowAlias, i)
        ]);
        this._areaDetection = n, this._transformResult = r;
        const l = n?.diagnostics?.areasDetected ?? 0;
        this._successMessage = `Content extracted — ${s.elements.length} elements in ${l} areas`, setTimeout(() => {
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
b.styles = [
  $t,
  _t`
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

			/* Popover menus — match Umbraco native flat alignment */
			umb-popover-layout {
				--uui-menu-item-indent: 0;
				--uui-menu-item-flat-structure: 1;
			}

			/* Row action bar — reserved space at far right of header rows */
			uui-action-bar.row-actions {
				width: 40px;
				flex-shrink: 0;
			}

			uui-action-bar.row-actions .action-trigger {
				opacity: 0;
				transition: opacity 0.15s;
			}

			.area-header:hover uui-action-bar.row-actions .action-trigger,
			.page-box.page-header-hovered uui-action-bar.row-actions .action-trigger,
			.section-box-header:hover uui-action-bar.row-actions .action-trigger {
				opacity: 1;
			}

			/* Grey hover bar for page header — style both slotted divs to cover the shadow DOM header */
			.page-box.page-header-hovered .tree-header,
			.page-box.page-header-hovered .page-header-actions {
				background: var(--uui-color-surface-emphasis);
			}

			.page-box.page-header-hovered .tree-header .collapse-chevron {
				color: var(--uui-color-text);
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
], b.prototype, "_extraction", 2);
v([
  x()
], b.prototype, "_areaDetection", 2);
v([
  x()
], b.prototype, "_config", 2);
v([
  x()
], b.prototype, "_workflowAlias", 2);
v([
  x()
], b.prototype, "_loading", 2);
v([
  x()
], b.prototype, "_extracting", 2);
v([
  x()
], b.prototype, "_error", 2);
v([
  x()
], b.prototype, "_successMessage", 2);
v([
  x()
], b.prototype, "_collapsed", 2);
v([
  x()
], b.prototype, "_transformResult", 2);
v([
  x()
], b.prototype, "_viewMode", 2);
v([
  x()
], b.prototype, "_sourceConfig", 2);
v([
  x()
], b.prototype, "_pageMode", 2);
v([
  x()
], b.prototype, "_pageInputValue", 2);
v([
  x()
], b.prototype, "_collapsePopoverOpen", 2);
v([
  x()
], b.prototype, "_excludedAreas", 2);
v([
  x()
], b.prototype, "_areaTemplate", 2);
v([
  x()
], b.prototype, "_sectionPickerOpen", 2);
v([
  x()
], b.prototype, "_teachingAreaIndex", 2);
v([
  x()
], b.prototype, "_inferenceResult", 2);
v([
  x()
], b.prototype, "_inferring", 2);
v([
  x()
], b.prototype, "_sampleUrl", 2);
b = v([
  wt("up-doc-workflow-source-view")
], b);
const Gt = b;
export {
  b as UpDocWorkflowSourceViewElement,
  Gt as default
};
//# sourceMappingURL=up-doc-workflow-source-view.element-Dyjx0d7x.js.map
