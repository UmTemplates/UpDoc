import { g as dt, b as pt } from "./workflow.types-CVkhzFGj.js";
import { UmbSorterController as ht } from "@umbraco-cms/backoffice/sorter";
import { css as V, property as U, state as _, customElement as te, nothing as d, repeat as ft, html as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as mt } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as gt, UMB_MODAL_MANAGER_CONTEXT as vt } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as bt } from "@umbraco-cms/backoffice/style";
import { U as xt } from "./up-doc-sort-modal.token-Dk9qC_N0.js";
const _t = /\d[\d,]*/;
function ie(e) {
  if (Array.isArray(e))
    return e.map((i) => String(i ?? "")).filter((i) => i.length > 0);
  if (e == null) return [];
  const t = String(e);
  return t.length > 0 ? [t] : [];
}
function oe(e) {
  return e.findIndex((t) => t.type === "segment");
}
function ae(e) {
  const t = oe(e);
  return t < 0 ? e : e.slice(0, t);
}
function $t(e) {
  const t = oe(e);
  return t < 0 ? [] : e.slice(t + 1);
}
function yt(e, t) {
  if (!t || t.length === 0) return e;
  let i, a;
  for (const o of t)
    switch (o.type) {
      case "textFollows":
        i = { anchor: "afterMarker", marker: Z(e, o.value) };
        break;
      case "textPrecedes":
        a = { anchor: "beforeMarker", marker: Z(e, o.value) };
        break;
      case "number":
        a = { anchor: "number" };
        break;
    }
  return wt(e, { from: i, to: a });
}
function Z(e, t) {
  const i = ie(t);
  if (i.length === 0) return;
  const a = e.toLowerCase();
  return i.find((o) => a.includes(o.toLowerCase())) ?? i[0];
}
function wt(e, t) {
  if (!t) return e;
  let i = 0;
  if (t.from) {
    const s = Ct(e, t.from);
    if (s < 0) return "";
    i = s;
  }
  const a = e.slice(i);
  let o = a.length;
  if (t.to) {
    const s = zt(a, t.to);
    if (s < 0) return "";
    o = s;
  }
  return a.slice(0, o).trim();
}
function Ct(e, t) {
  switch (t.anchor) {
    case "afterMarker":
      return kt(e, t.marker);
    case "beforeMarker":
      return Et(e, t.marker);
    case "start":
    default:
      return 0;
  }
}
function zt(e, t) {
  switch (t.anchor) {
    case "end":
      return e.length;
    case "beforeMarker":
      return St(e, t.marker);
    case "afterMarker":
      return Rt(e, t.marker);
    case "number":
      return Lt(e);
    default:
      return e.length;
  }
}
function kt(e, t) {
  if (!t) return 0;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i + t.length;
}
function Et(e, t) {
  if (!t) return 0;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i;
}
function St(e, t) {
  if (!t) return e.length;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i;
}
function Rt(e, t) {
  if (!t) return e.length;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i + t.length;
}
function Lt(e) {
  const t = _t.exec(e);
  return t ? t.index + t[0].length : -1;
}
const se = V`
	/* Collapsed rule row */
	.rule-row {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-3);
		padding: var(--uui-size-space-2) var(--uui-size-space-4);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		cursor: pointer;
		user-select: none;
		background: var(--uui-color-surface);
		transition: background 120ms ease;
	}

	.rule-row:hover {
		background: var(--uui-color-surface-alt);
	}

	.rule-row-name {
		flex: 1;
		font-size: var(--uui-type-default-size);
		font-weight: 600;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.rule-row-part {
		font-size: 11px;
		font-weight: 600;
		padding: 1px 8px;
		border-radius: var(--uui-border-radius);
		background: var(--uui-color-surface-alt);
		color: var(--uui-color-text-alt);
		flex-shrink: 0;
	}

	.rule-row-part.excluded {
		background: color-mix(in srgb, var(--uui-color-danger) 15%, transparent);
		color: var(--uui-color-danger-standalone);
	}

	.rule-row-match {
		font-size: 11px;
		font-weight: 700;
		padding: 1px 6px;
		border-radius: var(--uui-border-radius);
		flex-shrink: 0;
	}

	.rule-row-match.matched {
		background: color-mix(in srgb, var(--uui-color-positive) 15%, transparent);
		color: var(--uui-color-positive-standalone);
	}

	.rule-row-match.excluded {
		background: color-mix(in srgb, var(--uui-color-danger) 15%, transparent);
		color: var(--uui-color-danger-standalone);
	}

	.rule-row-match.no-match {
		background: color-mix(in srgb, var(--uui-color-warning) 15%, transparent);
		color: var(--uui-color-warning-standalone);
	}

	.rule-row-chevron {
		font-size: 12px;
		color: var(--uui-color-text-alt);
		flex-shrink: 0;
		transition: transform 120ms ease;
	}

	/* Action bar: hidden by default, appears on hover */
	.rule-row-actions {
		flex-shrink: 0;
		opacity: 0;
		transition: opacity 120ms ease;
	}

	.rule-row:hover .rule-row-actions {
		opacity: 1;
	}

	/* Rule cards (expanded) */
	.rule-card {
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		overflow: hidden;
	}

	.rule-header {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-3);
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		background: var(--uui-color-surface-alt);
		border-bottom: 1px solid var(--uui-color-border);
	}

	.rule-grip {
		cursor: grab;
		color: var(--uui-color-text-alt);
		font-size: 14px;
		user-select: none;
		flex-shrink: 0;
	}

	.rule-grip:active {
		cursor: grabbing;
	}

	.role-name-input {
		flex: 1;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-default-size);
		font-family: monospace;
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.role-name-input:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	/* Section headers within rule cards */
	.section-header {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--uui-color-text-alt);
		margin-bottom: var(--uui-size-space-1);
	}

	.section-header.collapsible {
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-1);
		user-select: none;
	}

	.section-header.collapsible:hover {
		color: var(--uui-color-text);
	}

	.section-header.collapsible uui-icon {
		font-size: 10px;
	}

	/* Conditions */
	.conditions-area {
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-2);
	}

	/* Exceptions */
	.exceptions-area {
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-2);
		border-top: 1px solid var(--uui-color-border);
	}

	.condition-row {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-2);
	}

	.condition-type-select {
		min-width: 180px;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.condition-type-select:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	.condition-value-input {
		flex: 1;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		font-family: monospace;
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.condition-value-input:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	.condition-value-input.range-input {
		max-width: 80px;
		flex: 0 0 auto;
	}

	.range-separator {
		font-size: var(--uui-type-small-size);
		color: var(--uui-color-text-alt);
		align-self: center;
	}

	/* Multi-value chip input (OR of several values on a text condition) */
	.chip-input {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--uui-size-space-1);
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		background: var(--uui-color-surface);
	}

	.chip-input:focus-within {
		border-color: var(--uui-color-focus);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--uui-size-space-1);
		padding: 0 var(--uui-size-space-1);
		background: var(--uui-color-surface-alt);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		font-family: monospace;
	}

	.chip-remove {
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		font-size: var(--uui-type-default-size);
		color: var(--uui-color-text-alt);
	}

	.chip-remove:hover {
		color: var(--uui-color-danger);
	}

	.chip-field {
		flex: 1;
		min-width: 4rem;
		border: none;
		outline: none;
		padding: 0;
		font-size: var(--uui-type-small-size);
		font-family: monospace;
		background: transparent;
		color: var(--uui-color-text);
	}

	/* Format row selects */
	.format-type-select {
		min-width: 100px;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.format-type-select:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	.format-value-select {
		flex: 1;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.format-value-select:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	/* Part area */
	.part-area {
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-2);
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		border-top: 1px solid var(--uui-color-border);
	}

	.part-controls {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-3);
	}

	.part-select {
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.part-select:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	.part-select:disabled {
		opacity: 0.5;
	}

	.exclude-label {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-1);
		font-size: var(--uui-type-small-size);
		color: var(--uui-color-text-alt);
		cursor: pointer;
		user-select: none;
	}

	/* Format area */
	.format-area {
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-2);
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		border-top: 1px solid var(--uui-color-border);
	}

	/* Find & Replace entries */
	.find-replace-entry {
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-1);
		padding: var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		background: var(--uui-color-surface);
	}

	.replace-label {
		min-width: 180px;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		font-size: var(--uui-type-small-size);
		color: var(--uui-color-text-alt);
		font-weight: 600;
	}

	/* Match preview */
	.match-preview {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-2);
		padding: var(--uui-size-space-2) var(--uui-size-space-4);
		font-size: var(--uui-type-small-size);
		border-top: 1px solid var(--uui-color-border);
	}

	.match-preview.matched {
		background: color-mix(in srgb, var(--uui-color-positive) 10%, transparent);
		color: var(--uui-color-positive-standalone);
	}

	.match-preview.excluded {
		background: color-mix(in srgb, var(--uui-color-danger) 10%, transparent);
		color: var(--uui-color-danger-standalone);
	}

	.match-preview.no-match {
		background: color-mix(in srgb, var(--uui-color-warning) 10%, transparent);
		color: var(--uui-color-warning-standalone);
	}

	.match-preview strong {
		font-weight: 600;
	}
`;
var Ot = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, ne = (e) => {
  throw TypeError(e);
}, k = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? Nt(t, i) : t, s = e.length - 1, l; s >= 0; s--)
    (l = e[s]) && (o = (a ? l(t, i, o) : l(o)) || o);
  return a && o && Ot(t, i, o), o;
}, Tt = (e, t, i) => t.has(e) || ne("Cannot " + i), At = (e, t, i) => (Tt(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Mt = (e, t, i) => t.has(e) ? ne("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), T;
let w = class extends mt {
  constructor() {
    super(...arguments), Mt(this, T, new ht(this, {
      getUniqueOfElement: (e) => e.dataset.sortId ?? "",
      getUniqueOfModel: (e) => e._id,
      identifier: "updoc-rules-sorter",
      itemSelector: ".sortable-rule",
      containerSelector: ".rules-container",
      handleSelector: ".rule-grip",
      disabledItemSelector: "[data-expanded]",
      placeholderAttr: "drag-placeholder",
      onChange: ({ model: e }) => {
        this._rules = e, this.dispatchEvent(new CustomEvent("sort-change", {
          detail: { rules: e },
          bubbles: !0,
          composed: !0
        }));
      }
    })), this._rules = [], this.expandedIds = /* @__PURE__ */ new Set();
  }
  set rules(e) {
    this._rules = e, At(this, T).setModel(e);
  }
  get rules() {
    return this._rules;
  }
  render() {
    return this._rules.length === 0 && !this.renderItem ? d : u`
			<div class="rules-container">
				${ft(
      this._rules,
      (e) => e._id,
      (e) => u`
						<div class="sortable-rule"
							data-sort-id=${e._id}
							?data-expanded=${this.expandedIds.has(e._id)}>
							${this.renderItem?.(e) ?? u`<span>${e._id}</span>`}
						</div>
					`
    )}
			</div>
		`;
  }
};
T = /* @__PURE__ */ new WeakMap();
w.styles = [
  se,
  V`
			:host {
				display: block;
			}

			.rules-container {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-3, 12px);
				min-height: 8px;
			}

			.sortable-rule[drag-placeholder] {
				opacity: 0.2;
			}
		`
];
k([
  U({ attribute: !1 })
], w.prototype, "rules", 1);
k([
  _()
], w.prototype, "_rules", 2);
k([
  U({ attribute: !1 })
], w.prototype, "expandedIds", 2);
k([
  U({ attribute: !1 })
], w.prototype, "renderItem", 2);
w = k([
  te("updoc-sortable-rules")
], w);
var Pt = Object.defineProperty, Gt = Object.getOwnPropertyDescriptor, re = (e) => {
  throw TypeError(e);
}, $ = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? Gt(t, i) : t, s = e.length - 1, l; s >= 0; s--)
    (l = e[s]) && (o = (a ? l(t, i, o) : l(o)) || o);
  return a && o && Pt(t, i, o), o;
}, le = (e, t, i) => t.has(e) || re("Cannot " + i), m = (e, t, i) => (le(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Ft = (e, t, i) => t.has(e) ? re("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (le(e, t, "access private method"), i), n, b, C, ue, S, D, W, A, ce, E, de, M, y, z, pe, H, he, fe, me, ge, ve, Y, be, xe, _e, p, I, $e, K, ye, we, Ce, ze, ke, Ee, Se, R, P, Re, Le, Oe, Ne, Te, Ae, Me, Pe, G, Ge, F, q, L, j, Fe, B, qe, Be, Ve, Ue, De, We, He, Ye, Ie, Ke, Q, je, Qe, Xe, Je, Ze, et, tt, it, ot, at, st, X, nt, rt;
let qt = 0;
function J() {
  return `r-${++qt}`;
}
const lt = {
  textBeginsWith: "Text begins with",
  textEndsWith: "Text ends with",
  textContains: "Text contains",
  textEquals: "Text equals",
  textMatchesPattern: "Text matches pattern",
  fontSizeEquals: "Font size equals",
  fontSizeAbove: "Font size above",
  fontSizeBelow: "Font size below",
  fontSizeRange: "Font size between",
  fontNameContains: "Font name contains",
  fontNameEquals: "Font name equals",
  colorEquals: "Color equals",
  positionFirst: "Position: first",
  positionLast: "Position: last",
  // HTML-specific (web sources)
  htmlTagEquals: "HTML tag equals",
  cssClassContains: "CSS class contains",
  htmlContainerPathContains: "Container path contains",
  containerIdEquals: "Container ID equals",
  containerClassContains: "Container class contains",
  isBoldEquals: "Is bold",
  segment: "Segment",
  textFollows: "Text follows",
  textPrecedes: "Text precedes",
  number: "Number"
}, O = ["positionFirst", "positionLast", "isBoldEquals", "number"], Bt = [
  "textBeginsWith",
  "textEndsWith",
  "textContains",
  "textEquals",
  "textMatchesPattern",
  "textFollows",
  "textPrecedes"
], Vt = {
  start: "Start",
  end: "End"
}, Ut = ["start", "end"], ut = "start", N = [
  "textBeginsWith",
  "textEndsWith",
  "textContains",
  "textEquals",
  "textMatchesPattern",
  "fontSizeEquals",
  "fontSizeAbove",
  "fontSizeBelow",
  "fontSizeRange",
  "fontNameContains",
  "fontNameEquals",
  "colorEquals",
  "positionFirst",
  "positionLast",
  // HTML-specific (web sources)
  "htmlTagEquals",
  "cssClassContains",
  "htmlContainerPathContains",
  "containerIdEquals",
  "containerClassContains",
  "isBoldEquals",
  "segment",
  "textFollows",
  "textPrecedes",
  "number"
], Dt = /* @__PURE__ */ new Set([
  "textBeginsWith",
  "textEndsWith",
  "textContains",
  "textEquals",
  "textMatchesPattern",
  "fontSizeEquals",
  "fontSizeAbove",
  "fontSizeBelow",
  "fontSizeRange",
  "fontNameContains",
  "fontNameEquals",
  "colorEquals",
  "positionFirst",
  "positionLast",
  "segment",
  "textFollows",
  "textPrecedes",
  "number"
]), ct = {
  title: "Title",
  content: "Content",
  description: "Description",
  summary: "Summary"
}, Wt = ["title", "content", "description", "summary"], Ht = {
  block: "Block",
  style: "Style"
}, Yt = ["block", "style"], It = {
  auto: "Auto",
  paragraph: "Paragraph",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  heading4: "Heading 4",
  heading5: "Heading 5",
  heading6: "Heading 6",
  bulletListItem: "Bullet List",
  numberedListItem: "Numbered List",
  quote: "Quote"
}, Kt = [
  "auto",
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "heading5",
  "heading6",
  "bulletListItem",
  "numberedListItem",
  "quote"
], jt = {
  bold: "Bold",
  italic: "Italic",
  strikethrough: "Strikethrough",
  code: "Code",
  highlight: "Highlight"
}, Qt = ["bold", "italic", "strikethrough", "code", "highlight"], h = "Ungrouped", Xt = {
  textBeginsWith: "Text begins with",
  textEndsWith: "Text ends with",
  textContains: "Text contains"
}, Jt = ["textBeginsWith", "textEndsWith", "textContains"], ee = {
  replaceWith: "Replace with",
  replaceAll: "Replace all with"
};
let x = class extends gt {
  constructor() {
    super(...arguments), Ft(this, n), this._rules = [], this._groupOrder = [], this._expandedSections = /* @__PURE__ */ new Set(), this._expandedRules = /* @__PURE__ */ new Set(), this._collapsedGroups = /* @__PURE__ */ new Set(), this._renamingGroup = null, this._renameValue = "";
  }
  firstUpdated() {
    const e = this.data?.existingRules;
    if (!e) return;
    const t = [], i = [];
    for (const o of e.groups ?? []) {
      i.push(o.name);
      for (const s of o.rules)
        t.push(r(this, n, M).call(this, s, o.name));
    }
    const a = e.rules ?? [];
    if (a.length > 0) {
      i.push(h);
      for (const o of a)
        t.push(r(this, n, M).call(this, o, h));
    }
    this._rules = t, this._groupOrder = i;
  }
  render() {
    const e = r(this, n, ge).call(this), t = /* @__PURE__ */ new Map();
    for (const [a, o] of e) {
      const s = m(this, n, y).find((l) => l.id === a);
      if (s)
        for (const l of o) {
          const c = t.get(l) ?? [];
          c.push(s), t.set(l, c);
        }
    }
    const i = m(this, n, fe);
    return u`
			<umb-body-layout headline="Edit Sections: ${m(this, n, he)}">
				<div id="main">
					<div class="section-info">
						${this.data?.sectionCount != null ? u`<span class="meta-badge">${this.data.sectionCount} section${this.data.sectionCount !== 1 ? "s" : ""}</span>` : d}
						<span class="meta-badge">${m(this, n, y).length} elements</span>
						<span class="meta-badge">${this._rules.length} rules</span>
						<span class="meta-badge">${e.size} matched</span>
						<span class="meta-badge">${m(this, n, y).length - e.size} unmatched</span>
						${(() => {
      const a = this._groupOrder.filter((o) => o !== h).length;
      return a > 0 ? u`<span class="meta-badge">${a} group${a !== 1 ? "s" : ""}</span>` : d;
    })()}
						${this._groupOrder.length > 0 ? u`
							<uui-button
								compact
								look="outline"
								label=${m(this, n, E) ? "Expand all" : "Collapse all"}
								@click=${() => r(this, n, ce).call(this)}>
								<uui-symbol-expand .open=${!m(this, n, E)}></uui-symbol-expand>
								${m(this, n, E) ? "Expand all" : "Collapse all"}
							</uui-button>
						` : d}
						${this._groupOrder.filter((a) => a !== h).length >= 2 ? u`
							<uui-button
								compact
								look="outline"
								label="Reorder groups"
								@click=${() => r(this, n, de).call(this)}>
								<uui-icon name="icon-navigation"></uui-icon>
								Reorder
							</uui-button>
						` : d}
					</div>

					${(() => {
      const a = i.filter((l) => l.group !== h), o = i.find((l) => l.group === h), s = (l) => {
        const c = r(this, n, W).call(this, l.group), g = (v) => r(this, n, ot).call(this, v, t.get(v._id) ?? []);
        return u`
								<div class="group-container ${c ? "collapsed" : ""}">
									${r(this, n, nt).call(this, l.group)}
									${c ? d : u`
									<div class="group-rules">
										<updoc-sortable-rules
											.rules=${l.rules}
											.expandedIds=${this._expandedRules}
											.renderItem=${g}
											@sort-change=${(v) => r(this, n, Le).call(this, l.group, v)}
										></updoc-sortable-rules>
										<uui-button
											look="placeholder"
											label="Add rule to ${l.group}"
											@click=${() => r(this, n, $e).call(this, l.group)}>
											+ Add rule
										</uui-button>
									</div>
									`}
								</div>
							`;
      };
      return u`
							${a.map((l) => s(l))}
							${o ? s(o) : d}
						`;
    })()}

					<uui-button
						look="outline"
						label="Add group"
						@click=${() => r(this, n, Ee).call(this)}>
						<uui-icon name="icon-add"></uui-icon>
						Add group
					</uui-button>

					${r(this, n, rt).call(this, e)}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${r(this, n, Xe)}>Close</uui-button>
					<uui-button
						label="Save"
						look="secondary"
						@click=${r(this, n, je)}>
						Save
					</uui-button>
					<uui-button
						label="Save and Close"
						look="primary"
						color="positive"
						@click=${r(this, n, Qe)}>
						Save and Close
					</uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
n = /* @__PURE__ */ new WeakSet();
b = function(e, t) {
  return this._expandedSections.has(`${e}-${t}`);
};
C = function(e, t) {
  const i = `${e}-${t}`, a = new Set(this._expandedSections);
  a.has(i) ? a.delete(i) : a.add(i), this._expandedSections = a;
};
ue = function(e) {
  return this._expandedRules.has(e);
};
S = function(e) {
  const t = new Set(this._expandedRules);
  t.has(e) ? t.delete(e) : t.add(e), this._expandedRules = t;
};
D = function(e) {
  if (!this._expandedRules.has(e)) {
    const t = new Set(this._expandedRules);
    t.add(e), this._expandedRules = t;
  }
};
W = function(e) {
  return this._collapsedGroups.has(e);
};
A = function(e) {
  const t = new Set(this._collapsedGroups);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsedGroups = t;
};
ce = function() {
  const e = this._groupOrder;
  e.every((i) => this._collapsedGroups.has(i)) ? this._collapsedGroups = /* @__PURE__ */ new Set() : this._collapsedGroups = new Set(e);
};
E = function() {
  return this._groupOrder.length > 0 && this._groupOrder.every((e) => this._collapsedGroups.has(e));
};
de = async function() {
  const e = this._groupOrder.filter((a) => a !== h);
  if (e.length < 2) return;
  const i = (await this.getContext(vt)).open(this, xt, {
    data: {
      headline: "Reorder groups",
      items: e.map((a) => ({ id: a, name: a }))
    }
  });
  try {
    const a = await i.onSubmit(), o = this._groupOrder.includes(h);
    this._groupOrder = o ? [...a.sortedIds, h] : [...a.sortedIds];
  } catch {
  }
};
M = function(e, t) {
  let i = e.part, a = e.exclude ?? !1;
  if (!i && !a) {
    const l = dt(e);
    l === "exclude" ? a = !0 : i = l;
  }
  let o = e.formats;
  (!o || o.length === 0) && (o = [{ type: "block", value: e.format ?? pt(e) }]);
  const s = [...e.conditions ?? []].map((l, c) => ({ ...l, sortOrder: l.sortOrder ?? c })).sort((l, c) => l.sortOrder - c.sortOrder);
  return {
    ...e,
    part: i,
    exclude: a,
    formats: o,
    conditions: s,
    _id: J(),
    _groupName: t
  };
};
y = function() {
  return this.data?.elements ?? [];
};
z = function() {
  return this.data?.sourceType ?? "pdf";
};
pe = function() {
  if (m(this, n, z) === "pdf")
    return N.filter((e) => Dt.has(e));
  if (m(this, n, z) === "web") {
    const e = [
      "htmlTagEquals",
      "containerIdEquals",
      "containerClassContains",
      "cssClassContains",
      "htmlContainerPathContains"
    ];
    return [...e, ...N.filter((t) => !e.includes(t))];
  }
  return N;
};
H = function(e) {
  const t = m(this, n, pe);
  return t.includes(e) ? t : [e, ...t];
};
he = function() {
  return this.data?.sectionHeading ?? "Section";
};
fe = function() {
  const e = [];
  for (const t of this._groupOrder)
    e.push({
      group: t,
      rules: this._rules.filter((i) => i._groupName === t)
    });
  return e;
};
me = function(e, t) {
  const i = $t(e.conditions);
  return i.length > 0 ? yt(t, i) : t;
};
ge = function() {
  const e = /* @__PURE__ */ new Map(), t = m(this, n, y);
  for (const i of this._rules) {
    const a = ae(i.conditions);
    if (a.length === 0) continue;
    const o = i._groupName === h;
    for (let s = 0; s < t.length; s++) {
      const l = t[s], c = e.get(l.id);
      if (!(c && !o) && r(this, n, ve).call(this, l, a, s, t.length)) {
        if (i.exceptions?.length && i.exceptions.some(
          (v) => r(this, n, Y).call(this, l, v, s, t.length)
        ))
          continue;
        c ? c.push(i._id) : e.set(l.id, [i._id]);
      }
    }
  }
  return e;
};
ve = function(e, t, i, a) {
  return t.every((o) => r(this, n, Y).call(this, e, o, i, a));
};
Y = function(e, t, i, a) {
  const o = String(t.value ?? ""), s = Number(t.value), l = ie(t.value);
  switch (t.type) {
    case "textBeginsWith":
      return l.some((c) => e.text.toLowerCase().startsWith(c.toLowerCase()));
    case "textEndsWith":
      return l.some((c) => e.text.toLowerCase().endsWith(c.toLowerCase()));
    case "textContains":
      return l.some((c) => e.text.toLowerCase().includes(c.toLowerCase()));
    case "textMatchesPattern":
      return l.some((c) => {
        try {
          return new RegExp(c, "i").test(e.text);
        } catch {
          return !1;
        }
      });
    case "fontSizeEquals":
      return !isNaN(s) && Math.abs(e.fontSize - s) <= 0.5;
    case "fontSizeAbove":
      return !isNaN(s) && e.fontSize > s;
    case "fontSizeBelow":
      return !isNaN(s) && e.fontSize < s;
    case "fontSizeRange": {
      const c = t.value && typeof t.value == "object" ? t.value : null;
      return c !== null && e.fontSize >= c.min && e.fontSize <= c.max;
    }
    case "fontNameContains":
      return e.fontName.toLowerCase().includes(o.toLowerCase());
    case "colorEquals":
      return e.color.toLowerCase() === o.toLowerCase();
    case "positionFirst":
      return i === 0;
    case "positionLast":
      return i === a - 1;
    case "htmlTagEquals":
      return (e.htmlTag ?? "").toLowerCase() === o.toLowerCase();
    case "cssClassContains":
      return (e.cssClasses ?? "").toLowerCase().includes(o.toLowerCase());
    case "htmlContainerPathContains":
      return (e.htmlContainerPath ?? "").toLowerCase().includes(o.toLowerCase());
    case "containerIdEquals":
      return (e.htmlContainerPath ?? "").split("/").some((g) => {
        const v = g.indexOf("#");
        return v >= 0 && g.substring(v + 1).toLowerCase() === o.toLowerCase();
      });
    case "containerClassContains":
      return (e.htmlContainerPath ?? "").split("/").some((g) => {
        const v = g.indexOf(".");
        return v >= 0 && g.substring(v + 1).toLowerCase().includes(o.toLowerCase());
      });
    case "isBoldEquals":
      return e.isBold === !0;
    default:
      return !1;
  }
};
be = function(e, t, i) {
  return m(this, n, z) === "web" ? r(this, n, xe).call(this, e) : r(this, n, _e).call(this, e, t, i);
};
xe = function(e) {
  const t = [];
  if (e.htmlTag && t.push({ type: "htmlTagEquals", value: e.htmlTag }), e.fontSize > 0 && t.push({ type: "fontSizeEquals", value: e.fontSize }), e.cssClasses) {
    const i = e.cssClasses.split(" ")[0];
    i && t.push({ type: "cssClassContains", value: i });
  }
  if (e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && t.push({ type: "colorEquals", value: e.color }), e.htmlContainerPath) {
    const i = e.htmlContainerPath.split("/"), a = [...i].reverse().find((o) => o.includes("#"));
    if (a) {
      const o = a.substring(a.indexOf("#") + 1);
      t.push({ type: "containerIdEquals", value: o });
    } else {
      const o = [...i].reverse().find((s) => s.includes("."));
      if (o) {
        const s = o.substring(o.indexOf(".") + 1);
        t.push({ type: "containerClassContains", value: s });
      } else {
        const s = i[i.length - 1];
        s && t.push({ type: "htmlContainerPathContains", value: s });
      }
    }
  }
  return e.isBold && t.push({ type: "isBoldEquals", value: "true" }), t;
};
_e = function(e, t, i) {
  const a = [];
  if (a.push({ type: "fontSizeEquals", value: e.fontSize }), e.fontName) {
    const s = e.fontName.includes("+") ? e.fontName.substring(e.fontName.indexOf("+") + 1) : e.fontName;
    a.push({ type: "fontNameContains", value: s });
  }
  e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && a.push({ type: "colorEquals", value: e.color });
  const o = e.text.indexOf(":");
  return o > 0 && o < 30 && a.push({ type: "textBeginsWith", value: e.text.substring(0, o + 1) }), t === 0 ? a.push({ type: "positionFirst" }) : t === i - 1 && a.push({ type: "positionLast" }), a;
};
p = function(e, t) {
  this._rules = this._rules.map((i) => i._id === e ? t(i) : i);
};
I = function(e) {
  return this._rules.find((t) => t._id === e);
};
$e = function(e = h) {
  this._groupOrder.includes(e) || (this._groupOrder = [...this._groupOrder, e]);
  const t = J();
  this._rules = [...this._rules, {
    role: "",
    part: "content",
    conditions: [],
    formats: [{ type: "block", value: "auto" }],
    _id: t,
    _groupName: e
  }], r(this, n, D).call(this, t);
};
K = function(e) {
  this._rules = this._rules.filter((t) => t._id !== e);
};
ye = function(e, t) {
  const i = r(this, n, be).call(this, e, t, m(this, n, y).length), a = e.text.split(/[\s:,]+/).slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, ""), o = J();
  this._groupOrder.includes(h) || (this._groupOrder = [...this._groupOrder, h]), this._rules = [...this._rules, {
    role: a,
    part: "content",
    conditions: i,
    formats: [{ type: "block", value: "auto" }],
    _id: o,
    _groupName: h
  }], r(this, n, D).call(this, o);
};
we = function(e, t) {
  r(this, n, p).call(this, e, (i) => ({ ...i, role: t }));
};
Ce = function(e, t) {
  r(this, n, p).call(this, e, (i) => ({ ...i, part: t }));
};
ze = function(e, t) {
  r(this, n, p).call(this, e, (i) => ({ ...i, exclude: t }));
};
ke = function(e, t) {
  r(this, n, p).call(this, e, (i) => ({ ...i, _groupName: t }));
};
Ee = function() {
  let e = "New Group", t = 1;
  for (; this._groupOrder.includes(e); )
    e = `New Group ${++t}`;
  this._groupOrder = [...this._groupOrder, e], this._renamingGroup = e, this._renameValue = e;
};
Se = function(e) {
  this._renamingGroup = e, this._renameValue = e;
};
R = function() {
  if (!this._renamingGroup || !this._renameValue.trim()) return;
  const e = this._renamingGroup, t = this._renameValue.trim();
  e !== t && (this._groupOrder = this._groupOrder.map((i) => i === e ? t : i), this._rules = this._rules.map(
    (i) => i._groupName === e ? { ...i, _groupName: t } : i
  )), this._renamingGroup = null, this._renameValue = "";
};
P = function() {
  this._renamingGroup = null, this._renameValue = "";
};
Re = function(e) {
  this._rules = this._rules.map(
    (t) => t._groupName === e ? { ...t, _groupName: h } : t
  ), this._groupOrder = this._groupOrder.filter((t) => t !== e), this._groupOrder.includes(h) || (this._groupOrder = [...this._groupOrder, h]);
};
Le = function(e, t) {
  const i = t.detail.rules, a = new Set(i.map((s) => s._id)), o = [];
  for (const s of this._groupOrder)
    s === e ? o.push(...i.map((l) => ({ ...l, _groupName: s }))) : o.push(...this._rules.filter((l) => l._groupName === s && !a.has(l._id)));
  this._rules = o;
};
Oe = function(e) {
  r(this, n, p).call(this, e, (t) => ({
    ...t,
    formats: [...t.formats ?? [], { type: "block", value: "auto" }]
  }));
};
Ne = function(e, t) {
  r(this, n, p).call(this, e, (i) => ({
    ...i,
    formats: (i.formats ?? []).filter((a, o) => o !== t)
  }));
};
Te = function(e, t, i) {
  const a = i === "block" ? "auto" : "bold";
  r(this, n, p).call(this, e, (o) => {
    const s = [...o.formats ?? []];
    return s[t] = { type: i, value: a }, { ...o, formats: s };
  });
};
Ae = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.formats ?? []];
    return o[t] = { ...o[t], value: i }, { ...a, formats: o };
  });
};
Me = function(e) {
  r(this, n, p).call(this, e, (t) => ({
    ...t,
    conditions: [...t.conditions, { type: "textBeginsWith", value: "" }]
  }));
};
Pe = function(e, t) {
  r(this, n, p).call(this, e, (i) => ({
    ...i,
    conditions: i.conditions.filter((a, o) => o !== t)
  }));
};
G = function(e, t, i) {
  const a = t + i;
  r(this, n, p).call(this, e, (o) => {
    if (a < 0 || a >= o.conditions.length) return o;
    const s = [...o.conditions];
    return [s[t], s[a]] = [s[a], s[t]], { ...o, conditions: s };
  });
};
Ge = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.conditions];
    let s;
    return O.includes(i) ? s = void 0 : i === "fontSizeRange" ? s = { min: 0, max: 100 } : i === "segment" ? s = ut : s = o[t].value, o[t] = { type: i, value: s }, { ...a, conditions: o };
  });
};
F = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.conditions], s = o[t], l = s.type === "fontSizeEquals" || s.type === "fontSizeAbove" || s.type === "fontSizeBelow";
    return o[t] = { ...s, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...a, conditions: o };
  });
};
q = function(e, t, i, a) {
  r(this, n, p).call(this, e, (o) => {
    const s = [...o.conditions], l = s[t], c = l.value && typeof l.value == "object" ? l.value : { min: 0, max: 100 }, g = isNaN(Number(a)) ? 0 : Number(a);
    return s[t] = { ...l, value: { ...c, [i]: g } }, { ...o, conditions: s };
  });
};
L = function(e) {
  return Array.isArray(e) ? e.map((t) => String(t)) : e == null || e === "" ? [] : [String(e)];
};
j = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.conditions], s = i.map((c) => c.trim()).filter((c) => c.length > 0), l = s.length === 0 ? "" : s.length === 1 ? s[0] : s;
    return o[t] = { ...o[t], value: l }, { ...a, conditions: o };
  });
};
Fe = function(e, t, i) {
  const a = i.trim();
  if (!a) return;
  const o = r(this, n, I).call(this, e)?.conditions[t];
  o && r(this, n, j).call(this, e, t, [...r(this, n, L).call(this, o.value), a]);
};
B = function(e, t, i) {
  const a = r(this, n, I).call(this, e)?.conditions[t];
  a && r(this, n, j).call(this, e, t, r(this, n, L).call(this, a.value).filter((o, s) => s !== i));
};
qe = function(e) {
  r(this, n, p).call(this, e, (t) => ({
    ...t,
    exceptions: [...t.exceptions ?? [], { type: "textContains", value: "" }]
  }));
};
Be = function(e, t) {
  r(this, n, p).call(this, e, (i) => ({
    ...i,
    exceptions: (i.exceptions ?? []).filter((a, o) => o !== t)
  }));
};
Ve = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.exceptions ?? []];
    return o[t] = {
      type: i,
      value: O.includes(i) || i === "segment" ? void 0 : o[t].value
    }, { ...a, exceptions: o };
  });
};
Ue = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.exceptions ?? []], s = o[t], l = s.type === "fontSizeEquals" || s.type === "fontSizeAbove" || s.type === "fontSizeBelow";
    return o[t] = { ...s, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...a, exceptions: o };
  });
};
De = function(e) {
  r(this, n, p).call(this, e, (t) => ({
    ...t,
    textReplacements: [...t.textReplacements ?? [], { findType: "textBeginsWith", find: "", replaceType: "replaceWith", replace: "" }]
  }));
};
We = function(e, t) {
  r(this, n, p).call(this, e, (i) => ({
    ...i,
    textReplacements: (i.textReplacements ?? []).filter((a, o) => o !== t)
  }));
};
He = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []], s = i === "textContains" ? "replaceAll" : "replaceWith";
    return o[t] = { ...o[t], findType: i, replaceType: s }, { ...a, textReplacements: o };
  });
};
Ye = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []];
    return o[t] = { ...o[t], find: i }, { ...a, textReplacements: o };
  });
};
Ie = function(e, t, i) {
  r(this, n, p).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []];
    return o[t] = { ...o[t], replace: i }, { ...a, textReplacements: o };
  });
};
Ke = function(e) {
  const t = (e.formats ?? []).find((c) => c.type === "block"), { _id: i, _groupName: a, action: o, ...s } = e, l = (s.conditions ?? []).map((c, g) => ({ ...c, sortOrder: g }));
  return {
    ...s,
    conditions: l,
    format: t?.value ?? "auto"
  };
};
Q = function() {
  this._renamingGroup && r(this, n, R).call(this);
  const e = [];
  let t = [];
  for (const i of this._groupOrder) {
    const a = this._rules.filter((o) => o._groupName === i).map((o) => r(this, n, Ke).call(this, o));
    i === h ? t = a : e.push({ name: i, rules: a });
  }
  return { groups: e, rules: t };
};
je = async function() {
  const e = r(this, n, Q).call(this);
  this.data?.onSave && await this.data.onSave(e);
};
Qe = function() {
  const e = r(this, n, Q).call(this);
  this.value = { rules: e }, this.modalContext?.submit();
};
Xe = function() {
  this.modalContext?.reject();
};
Je = function(e, t, i) {
  const a = r(this, n, L).call(this, i.value), o = (s) => {
    s.value.trim() && (r(this, n, Fe).call(this, e, t, s.value), s.value = "");
  };
  return u`
			<div class="chip-input">
				${a.map((s, l) => u`
					<span class="chip">
						<span class="chip-label">${s}</span>
						<button
							type="button"
							class="chip-remove"
							aria-label="Remove ${s}"
							@click=${() => r(this, n, B).call(this, e, t, l)}>&times;</button>
					</span>
				`)}
				<input
					type="text"
					class="chip-field"
					placeholder=${a.length ? "Or…" : "Value…"}
					@keydown=${(s) => {
    const l = s.target;
    s.key === "Enter" || s.key === "," ? (s.preventDefault(), o(l)) : s.key === "Backspace" && l.value === "" && a.length && r(this, n, B).call(this, e, t, a.length - 1);
  }}
					@blur=${(s) => o(s.target)} />
			</div>
		`;
};
Ze = function(e, t, i, a) {
  const o = O.includes(i.type), s = i.type === "fontSizeRange", l = i.type === "segment", c = Bt.includes(i.type), g = l ? String(i.value ?? ut) : "", v = s && i.value && typeof i.value == "object" ? i.value : { min: 0, max: 100 };
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(f) => r(this, n, Ge).call(this, e, t, f.target.value)}>
					${r(this, n, H).call(this, i.type).map((f) => u`
						<option value=${f} ?selected=${f === i.type}>${lt[f]}</option>
					`)}
				</select>
				${s ? u`
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Min"
						.value=${String(v.min)}
						@input=${(f) => r(this, n, q).call(this, e, t, "min", f.target.value)} />
					<span class="range-separator">–</span>
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Max"
						.value=${String(v.max)}
						@input=${(f) => r(this, n, q).call(this, e, t, "max", f.target.value)} />
				` : l ? u`
					<select
						class="condition-value-input"
						aria-label="Segment bracket"
						.value=${g}
						@change=${(f) => r(this, n, F).call(this, e, t, f.target.value)}>
						${Ut.map((f) => u`
							<option value=${f} ?selected=${f === g}>${Vt[f]}</option>
						`)}
					</select>
				` : c ? r(this, n, Je).call(this, e, t, i) : o ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(f) => r(this, n, F).call(this, e, t, f.target.value)} />
				`}
				<uui-action-bar>
					<uui-button
						compact
						label="Move condition up"
						title="Move up"
						?disabled=${t === 0}
						@click=${() => r(this, n, G).call(this, e, t, -1)}>
						<uui-icon name="icon-arrow-up"></uui-icon>
					</uui-button>
					<uui-button
						compact
						label="Move condition down"
						title="Move down"
						?disabled=${t === a - 1}
						@click=${() => r(this, n, G).call(this, e, t, 1)}>
						<uui-icon name="icon-arrow-down"></uui-icon>
					</uui-button>
					<uui-button
						compact
						label="Remove condition"
						@click=${() => r(this, n, Pe).call(this, e, t)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
et = function(e, t, i) {
  const a = O.includes(i.type) || i.type === "segment";
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(o) => r(this, n, Ve).call(this, e, t, o.target.value)}>
					${r(this, n, H).call(this, i.type).map((o) => u`
						<option value=${o} ?selected=${o === i.type}>${lt[o]}</option>
					`)}
				</select>
				${a ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(o) => r(this, n, Ue).call(this, e, t, o.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove exception"
					@click=${() => r(this, n, Be).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
tt = function(e, t, i) {
  const a = i.type === "block" ? Kt : Qt, o = i.type === "block" ? It : jt;
  return u`
			<div class="condition-row">
				<select
					class="format-type-select"
					.value=${i.type}
					@change=${(s) => r(this, n, Te).call(this, e, t, s.target.value)}>
					${Yt.map((s) => u`
						<option value=${s} ?selected=${s === i.type}>${Ht[s]}</option>
					`)}
				</select>
				<select
					class="format-value-select"
					.value=${i.value}
					@change=${(s) => r(this, n, Ae).call(this, e, t, s.target.value)}>
					${a.map((s) => u`
						<option value=${s} ?selected=${s === i.value}>${o[s]}</option>
					`)}
				</select>
				<uui-button
					compact
					look="secondary"
					label="Remove format"
					@click=${() => r(this, n, Ne).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
it = function(e, t, i) {
  const a = i.findType === "textContains" ? ee.replaceAll : ee.replaceWith;
  return u`
			<div class="find-replace-entry">
				<div class="condition-row">
					<select
						class="condition-type-select"
						.value=${i.findType}
						@change=${(o) => r(this, n, He).call(this, e, t, o.target.value)}>
						${Jt.map((o) => u`
							<option value=${o} ?selected=${o === i.findType}>${Xt[o]}</option>
						`)}
					</select>
					<input
						type="text"
						class="condition-value-input"
						placeholder="Find..."
						.value=${i.find}
						@input=${(o) => r(this, n, Ye).call(this, e, t, o.target.value)} />
					<uui-button
						compact
						look="secondary"
						label="Remove replacement"
						@click=${() => r(this, n, We).call(this, e, t)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</div>
				<div class="condition-row">
					<span class="replace-label">${a}</span>
					<input
						type="text"
						class="condition-value-input"
						placeholder="(empty = remove)"
						.value=${i.replace}
						@input=${(o) => r(this, n, Ie).call(this, e, t, o.target.value)} />
				</div>
			</div>
		`;
};
ot = function(e, t) {
  return r(this, n, ue).call(this, e._id) ? r(this, n, st).call(this, e, t) : r(this, n, at).call(this, e, t);
};
at = function(e, t) {
  const i = e.exclude, a = e.part ?? "content", o = i ? "Exclude" : ct[a] ?? a, s = t.length, l = e.role || "(unnamed rule)";
  return u`
			<div class="rule-row" @click=${() => r(this, n, S).call(this, e._id)}>
				<span class="rule-grip" title="Drag to reorder" @click=${(c) => c.stopPropagation()}>⠿</span>
				<span class="rule-row-name">${l}</span>
				<span class="rule-row-part ${i ? "excluded" : ""}">${o}</span>
				${s > 0 ? u`<span class="rule-row-match ${i ? "excluded" : "matched"}">${s}&times;</span>` : u`<span class="rule-row-match no-match">0</span>`}
				<uui-action-bar class="rule-row-actions"
					@click=${(c) => c.stopPropagation()}>
					<uui-button pristine look="primary" label="Edit rule"
						@click=${() => r(this, n, S).call(this, e._id)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete rule"
						@click=${() => r(this, n, K).call(this, e._id)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
st = function(e, t) {
  const i = e.exclude, a = e.part ?? "content", o = e._id;
  return u`
			<div class="rule-card">
				<div class="rule-header">
					<uui-icon class="rule-row-chevron expanded" name="icon-navigation-down"
						@click=${() => r(this, n, S).call(this, o)}
						style="cursor:pointer"></uui-icon>
					<input
						type="text"
						class="role-name-input"
						placeholder="Section name (e.g. tour-title)"
						.value=${e.role}
						@input=${(s) => r(this, n, we).call(this, o, s.target.value)} />
					<uui-button
						compact
						look="secondary"
						color="danger"
						label="Remove rule"
						@click=${() => r(this, n, K).call(this, o)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</div>

				${this._groupOrder.length > 1 ? u`
				<div class="group-move-area">
					<label class="group-move-label">Group</label>
					<select
						class="group-move-select"
						@change=${(s) => {
    const l = s.target.value;
    r(this, n, ke).call(this, o, l);
  }}>
						${this._groupOrder.map((s) => u`
							<option value=${s} ?selected=${s === e._groupName}>${s}</option>
						`)}
					</select>
				</div>
				` : d}

				<div class="conditions-area">
					<div class="section-header collapsible" @click=${() => r(this, n, C).call(this, "conditions", o)}>
						<uui-icon name=${r(this, n, b).call(this, "conditions", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Conditions${e.conditions.length > 0 ? ` (${e.conditions.length})` : ""}
					</div>
					${r(this, n, b).call(this, "conditions", o) ? u`
						${e.conditions.map((s, l) => r(this, n, Ze).call(this, o, l, s, e.conditions.length))}
						<uui-button
							compact
							look="placeholder"
							label="Add condition"
							@click=${() => r(this, n, Me).call(this, o)}>
							+ Add condition
						</uui-button>
					` : d}
				</div>

				<div class="exceptions-area">
					<div class="section-header collapsible" @click=${() => r(this, n, C).call(this, "exceptions", o)}>
						<uui-icon name=${r(this, n, b).call(this, "exceptions", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Exceptions${(e.exceptions ?? []).length > 0 ? ` (${(e.exceptions ?? []).length})` : ""}
					</div>
					${r(this, n, b).call(this, "exceptions", o) ? u`
						${(e.exceptions ?? []).map((s, l) => r(this, n, et).call(this, o, l, s))}
						<uui-button
							compact
							look="placeholder"
							label="Add exception"
							@click=${() => r(this, n, qe).call(this, o)}>
							+ Add exception
						</uui-button>
					` : d}
				</div>

				<div class="part-area">
					<div class="section-header collapsible" @click=${() => r(this, n, C).call(this, "part", o)}>
						<uui-icon name=${r(this, n, b).call(this, "part", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Part
					</div>
					${r(this, n, b).call(this, "part", o) ? u`
						<div class="part-controls">
							<select
								class="part-select"
								.value=${a}
								?disabled=${i}
								@change=${(s) => r(this, n, Ce).call(this, o, s.target.value)}>
								${Wt.map((s) => u`
									<option value=${s} ?selected=${s === a}>${ct[s]}</option>
								`)}
							</select>
							<label class="exclude-label">
								<input
									type="checkbox"
									.checked=${i}
									@change=${(s) => r(this, n, ze).call(this, o, s.target.checked)} />
								Exclude
							</label>
						</div>
					` : d}
				</div>

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, n, C).call(this, "format", o)}>
						<uui-icon name=${r(this, n, b).call(this, "format", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Format${(e.formats ?? []).length > 0 ? ` (${(e.formats ?? []).length})` : ""}
					</div>
					${r(this, n, b).call(this, "format", o) ? u`
						${(e.formats ?? []).map((s, l) => r(this, n, tt).call(this, o, l, s))}
						<uui-button
							compact
							look="placeholder"
							label="Add format"
							@click=${() => r(this, n, Oe).call(this, o)}>
							+ Add format
						</uui-button>
					` : d}
				</div>
				`}

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, n, C).call(this, "findReplace", o)}>
						<uui-icon name=${r(this, n, b).call(this, "findReplace", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Find &amp; Replace${(e.textReplacements ?? []).length > 0 ? ` (${(e.textReplacements ?? []).length})` : ""}
					</div>
					${r(this, n, b).call(this, "findReplace", o) ? u`
						${(e.textReplacements ?? []).map((s, l) => r(this, n, it).call(this, o, l, s))}
						<uui-button
							compact
							look="placeholder"
							label="Add find & replace"
							@click=${() => r(this, n, De).call(this, o)}>
							+ Add find &amp; replace
						</uui-button>
					` : d}
				</div>
				`}

				<div class="match-preview ${t.length > 0 ? i ? "excluded" : "matched" : "no-match"}">
					${t.length > 0 ? u`<uui-icon name=${i ? "icon-block" : "icon-check"}></uui-icon> ${i ? "Excluded" : "Matched"} <strong>${t.length}&times;</strong>${t.length <= 5 ? u`: ${t.map((s, l) => u`${l > 0 ? u`, ` : d}<strong>${r(this, n, X).call(this, r(this, n, me).call(this, e, s.text), 40)}</strong>`)}` : d}` : u`<uui-icon name="icon-alert"></uui-icon> ${ae(e.conditions).length === 0 ? "Add conditions to match elements" : "No match"}`}
				</div>
			</div>
		`;
};
X = function(e, t) {
  return e.length > t ? e.substring(0, t) + "..." : e;
};
nt = function(e) {
  const t = r(this, n, W).call(this, e);
  return e === h ? u`
				<div class="group-header" @click=${() => r(this, n, A).call(this, e)} style="cursor: pointer;">
					<uui-symbol-expand .open=${!t}></uui-symbol-expand>
					<strong class="group-name">${e}</strong>
				</div>
			` : this._renamingGroup === e ? u`
				<div class="group-header">
					<uui-symbol-expand .open=${!t}></uui-symbol-expand>
					<input
						type="text"
						class="group-rename-input"
						.value=${this._renameValue}
						@input=${(i) => {
    this._renameValue = i.target.value;
  }}
						@keydown=${(i) => {
    i.key === "Enter" && r(this, n, R).call(this), i.key === "Escape" && r(this, n, P).call(this);
  }} />
					<uui-button compact look="primary" label="Confirm" @click=${() => r(this, n, R).call(this)}>
						<uui-icon name="icon-check"></uui-icon>
					</uui-button>
					<uui-button compact look="secondary" label="Cancel" @click=${() => r(this, n, P).call(this)}>
						<uui-icon name="icon-wrong"></uui-icon>
					</uui-button>
				</div>
			` : u`
			<div class="group-header" @click=${() => r(this, n, A).call(this, e)} style="cursor: pointer;">
				<uui-symbol-expand .open=${!t}></uui-symbol-expand>
				<strong class="group-name">${e}</strong>
				<span class="header-spacer"></span>
				<uui-action-bar class="group-header-actions" @click=${(i) => i.stopPropagation()}>
					<uui-button pristine look="primary" label="Rename" @click=${() => r(this, n, Se).call(this, e)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete group"
						title="Delete group (rules move to ungrouped)"
						@click=${() => r(this, n, Re).call(this, e)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
rt = function(e) {
  const t = m(this, n, y), i = t.filter((a) => !e.has(a.id));
  return i.length === 0 ? d : u`
			<div class="unmatched-section">
				<h4>Unmatched elements (${i.length})</h4>
				${i.map((a) => {
    const o = t.indexOf(a);
    return u`
						<div class="unmatched-element">
							<div class="unmatched-text">${r(this, n, X).call(this, a.text, 80)}</div>
							<div class="unmatched-meta">
								${m(this, n, z) === "web" ? u`
										${a.htmlTag ? u`<span class="meta-badge tag-badge">&lt;${a.htmlTag}&gt;</span>` : d}
										<span class="meta-badge">${a.fontSize}pt</span>
										${a.isBold ? u`<span class="meta-badge tag-badge"><b>B</b></span>` : d}
										${a.cssClasses ? u`<span class="meta-badge class-badge">.${a.cssClasses.split(" ")[0]}</span>` : d}
										${a.color !== "#000000" ? u`<span class="meta-badge" style="border-left: 3px solid ${a.color};">${a.color}</span>` : d}
									` : u`
										<span class="meta-badge">${a.fontSize}pt</span>
										<span class="meta-badge">${a.fontName}</span>
										${a.color !== "#000000" ? u`<span class="meta-badge" style="border-left: 3px solid ${a.color};">${a.color}</span>` : d}
									`}
							</div>
							<uui-button
								compact
								look="outline"
								label="Define rule from this"
								@click=${() => r(this, n, ye).call(this, a, o)}>
								Define rule
							</uui-button>
						</div>
					`;
  })}
			</div>
		`;
};
x.styles = [
  bt,
  se,
  V`
			:host {
				display: block;
				height: 100%;
			}

			#main {
				padding: var(--uui-size-space-4);
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-4);
			}

			.section-info {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				flex-wrap: wrap;
			}

			.meta-badge {
				font-size: 11px;
				font-family: monospace;
				padding: 1px 6px;
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
			}
			.tag-badge {
				background: var(--uui-color-violet-light);
				color: var(--uui-color-violet-standalone);
			}
			.class-badge {
				background: var(--uui-color-warning-light);
				color: var(--uui-color-warning-standalone);
			}

			/* Group containers */
			.group-container {
				border: 2px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				overflow: hidden;
			}

			.group-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.group-container.collapsed .group-header {
				border-bottom: none;
			}

			.group-name {
				font-size: var(--uui-type-default-size);
				color: var(--uui-color-text);
			}

			.group-header-actions {
				opacity: 0;
				transition: opacity 120ms ease;
			}

			.group-header:hover .group-header-actions {
				opacity: 1;
			}

			.group-rename-input {
				flex: 1;
				padding: var(--uui-size-space-1) var(--uui-size-space-2);
				border: 1px solid var(--uui-color-focus);
				border-radius: var(--uui-border-radius);
				font-size: var(--uui-type-default-size);
				background: var(--uui-color-surface);
				color: var(--uui-color-text);
			}

			.group-rename-input:focus {
				outline: none;
			}

			.header-spacer {
				flex: 1;
			}

			.group-rules {
				padding: var(--uui-size-space-3);
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-3);
			}

			/* Group move dropdown on expanded rules */
			.group-move-area {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: 0 var(--uui-size-space-3);
			}

			.group-move-label {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				white-space: nowrap;
			}

			.group-move-select {
				flex: 1;
				padding: var(--uui-size-space-1) var(--uui-size-space-2);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				font-size: var(--uui-type-small-size);
				background: var(--uui-color-surface);
				color: var(--uui-color-text);
			}


			/* Unmatched elements */
			.unmatched-section {
				border: 1px dashed var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
			}

			.unmatched-section h4 {
				margin: 0 0 var(--uui-size-space-3);
				color: var(--uui-color-text-alt);
				font-size: var(--uui-type-small-size);
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}

			.unmatched-element {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-2) 0;
				border-bottom: 1px solid var(--uui-color-border);
			}

			.unmatched-element:last-child {
				border-bottom: none;
			}

			.unmatched-text {
				flex: 1;
				font-size: var(--uui-type-small-size);
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.unmatched-meta {
				display: flex;
				gap: var(--uui-size-space-1);
				flex-shrink: 0;
			}
		`
];
$([
  _()
], x.prototype, "_rules", 2);
$([
  _()
], x.prototype, "_groupOrder", 2);
$([
  _()
], x.prototype, "_expandedSections", 2);
$([
  _()
], x.prototype, "_expandedRules", 2);
$([
  _()
], x.prototype, "_collapsedGroups", 2);
$([
  _()
], x.prototype, "_renamingGroup", 2);
$([
  _()
], x.prototype, "_renameValue", 2);
x = $([
  te("up-doc-section-rules-editor-modal")
], x);
const ni = x;
export {
  x as UpDocSectionRulesEditorModalElement,
  ni as default
};
//# sourceMappingURL=section-rules-editor-modal.element-DMywUdSo.js.map
