import { g as it, b as ot } from "./workflow.types-CVkhzFGj.js";
import { UmbSorterController as at } from "@umbraco-cms/backoffice/sorter";
import { css as q, property as F, state as x, customElement as j, nothing as d, repeat as st, html as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as nt } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as rt, UMB_MODAL_MANAGER_CONTEXT as lt } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as ut } from "@umbraco-cms/backoffice/style";
import { U as ct } from "./up-doc-sort-modal.token-Dk9qC_N0.js";
const dt = /\d[\d,]*/;
function Q(e) {
  return e.findIndex((t) => t.type === "segment");
}
function X(e) {
  const t = Q(e);
  return t < 0 ? e : e.slice(0, t);
}
function pt(e) {
  const t = Q(e);
  return t < 0 ? [] : e.slice(t + 1);
}
function ht(e, t) {
  if (!t || t.length === 0) return e;
  let i, a;
  for (const o of t) {
    const n = o.value != null ? String(o.value) : void 0;
    switch (o.type) {
      case "textFollows":
        i = { anchor: "afterMarker", marker: n };
        break;
      case "textPrecedes":
        a = { anchor: "beforeMarker", marker: n };
        break;
      case "number":
        a = { anchor: "number" };
        break;
    }
  }
  return ft(e, { from: i, to: a });
}
function ft(e, t) {
  if (!t) return e;
  let i = 0;
  if (t.from) {
    const n = mt(e, t.from);
    if (n < 0) return "";
    i = n;
  }
  const a = e.slice(i);
  let o = a.length;
  if (t.to) {
    const n = gt(a, t.to);
    if (n < 0) return "";
    o = n;
  }
  return a.slice(0, o).trim();
}
function mt(e, t) {
  switch (t.anchor) {
    case "afterMarker":
      return vt(e, t.marker);
    case "beforeMarker":
      return bt(e, t.marker);
    case "start":
    default:
      return 0;
  }
}
function gt(e, t) {
  switch (t.anchor) {
    case "end":
      return e.length;
    case "beforeMarker":
      return xt(e, t.marker);
    case "afterMarker":
      return _t(e, t.marker);
    case "number":
      return $t(e);
    default:
      return e.length;
  }
}
function vt(e, t) {
  if (!t) return 0;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i + t.length;
}
function bt(e, t) {
  if (!t) return 0;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i;
}
function xt(e, t) {
  if (!t) return e.length;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i;
}
function _t(e, t) {
  if (!t) return e.length;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i + t.length;
}
function $t(e) {
  const t = dt.exec(e);
  return t ? t.index + t[0].length : -1;
}
const J = q`
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
var yt = Object.defineProperty, wt = Object.getOwnPropertyDescriptor, Z = (e) => {
  throw TypeError(e);
}, z = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? wt(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (o = (a ? l(t, i, o) : l(o)) || o);
  return a && o && yt(t, i, o), o;
}, Ct = (e, t, i) => t.has(e) || Z("Cannot " + i), zt = (e, t, i) => (Ct(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Et = (e, t, i) => t.has(e) ? Z("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), O;
let y = class extends nt {
  constructor() {
    super(...arguments), Et(this, O, new at(this, {
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
    this._rules = e, zt(this, O).setModel(e);
  }
  get rules() {
    return this._rules;
  }
  render() {
    return this._rules.length === 0 && !this.renderItem ? d : u`
			<div class="rules-container">
				${st(
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
O = /* @__PURE__ */ new WeakMap();
y.styles = [
  J,
  q`
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
z([
  F({ attribute: !1 })
], y.prototype, "rules", 1);
z([
  x()
], y.prototype, "_rules", 2);
z([
  F({ attribute: !1 })
], y.prototype, "expandedIds", 2);
z([
  F({ attribute: !1 })
], y.prototype, "renderItem", 2);
y = z([
  j("updoc-sortable-rules")
], y);
var St = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, ee = (e) => {
  throw TypeError(e);
}, _ = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? kt(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (o = (a ? l(t, i, o) : l(o)) || o);
  return a && o && St(t, i, o), o;
}, te = (e, t, i) => t.has(e) || ee("Cannot " + i), m = (e, t, i) => (te(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Rt = (e, t, i) => t.has(e) ? ee("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (te(e, t, "access private method"), i), s, v, w, ie, S, B, V, N, oe, E, ae, T, $, C, se, U, ne, re, le, ue, ce, D, de, pe, he, h, fe, W, me, ge, ve, be, xe, _e, $e, k, A, ye, we, Ce, ze, Ee, Se, ke, Re, P, Le, M, G, Oe, Ne, Te, Ae, Pe, Me, Ge, qe, Fe, Be, H, Ve, Ue, De, We, He, Ye, Ie, Ke, je, Qe, Y, Xe, Je;
let Lt = 0;
function I() {
  return `r-${++Lt}`;
}
const Ze = {
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
}, R = ["positionFirst", "positionLast", "isBoldEquals", "number"], Ot = {
  start: "Start",
  end: "End"
}, Nt = ["start", "end"], et = "start", L = [
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
], Tt = /* @__PURE__ */ new Set([
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
]), tt = {
  title: "Title",
  content: "Content",
  description: "Description",
  summary: "Summary"
}, At = ["title", "content", "description", "summary"], Pt = {
  block: "Block",
  style: "Style"
}, Mt = ["block", "style"], Gt = {
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
}, qt = [
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
], Ft = {
  bold: "Bold",
  italic: "Italic",
  strikethrough: "Strikethrough",
  code: "Code",
  highlight: "Highlight"
}, Bt = ["bold", "italic", "strikethrough", "code", "highlight"], f = "Ungrouped", Vt = {
  textBeginsWith: "Text begins with",
  textEndsWith: "Text ends with",
  textContains: "Text contains"
}, Ut = ["textBeginsWith", "textEndsWith", "textContains"], K = {
  replaceWith: "Replace with",
  replaceAll: "Replace all with"
};
let b = class extends rt {
  constructor() {
    super(...arguments), Rt(this, s), this._rules = [], this._groupOrder = [], this._expandedSections = /* @__PURE__ */ new Set(), this._expandedRules = /* @__PURE__ */ new Set(), this._collapsedGroups = /* @__PURE__ */ new Set(), this._renamingGroup = null, this._renameValue = "";
  }
  firstUpdated() {
    const e = this.data?.existingRules;
    if (!e) return;
    const t = [], i = [];
    for (const o of e.groups ?? []) {
      i.push(o.name);
      for (const n of o.rules)
        t.push(r(this, s, T).call(this, n, o.name));
    }
    const a = e.rules ?? [];
    if (a.length > 0) {
      i.push(f);
      for (const o of a)
        t.push(r(this, s, T).call(this, o, f));
    }
    this._rules = t, this._groupOrder = i;
  }
  render() {
    const e = r(this, s, ue).call(this), t = /* @__PURE__ */ new Map();
    for (const [a, o] of e) {
      const n = m(this, s, $).find((l) => l.id === a);
      if (n)
        for (const l of o) {
          const c = t.get(l) ?? [];
          c.push(n), t.set(l, c);
        }
    }
    const i = m(this, s, re);
    return u`
			<umb-body-layout headline="Edit Sections: ${m(this, s, ne)}">
				<div id="main">
					<div class="section-info">
						${this.data?.sectionCount != null ? u`<span class="meta-badge">${this.data.sectionCount} section${this.data.sectionCount !== 1 ? "s" : ""}</span>` : d}
						<span class="meta-badge">${m(this, s, $).length} elements</span>
						<span class="meta-badge">${this._rules.length} rules</span>
						<span class="meta-badge">${e.size} matched</span>
						<span class="meta-badge">${m(this, s, $).length - e.size} unmatched</span>
						${(() => {
      const a = this._groupOrder.filter((o) => o !== f).length;
      return a > 0 ? u`<span class="meta-badge">${a} group${a !== 1 ? "s" : ""}</span>` : d;
    })()}
						${this._groupOrder.length > 0 ? u`
							<uui-button
								compact
								look="outline"
								label=${m(this, s, E) ? "Expand all" : "Collapse all"}
								@click=${() => r(this, s, oe).call(this)}>
								<uui-symbol-expand .open=${!m(this, s, E)}></uui-symbol-expand>
								${m(this, s, E) ? "Expand all" : "Collapse all"}
							</uui-button>
						` : d}
						${this._groupOrder.filter((a) => a !== f).length >= 2 ? u`
							<uui-button
								compact
								look="outline"
								label="Reorder groups"
								@click=${() => r(this, s, ae).call(this)}>
								<uui-icon name="icon-navigation"></uui-icon>
								Reorder
							</uui-button>
						` : d}
					</div>

					${(() => {
      const a = i.filter((l) => l.group !== f), o = i.find((l) => l.group === f), n = (l) => {
        const c = r(this, s, V).call(this, l.group), g = (p) => r(this, s, Ke).call(this, p, t.get(p._id) ?? []);
        return u`
								<div class="group-container ${c ? "collapsed" : ""}">
									${r(this, s, Xe).call(this, l.group)}
									${c ? d : u`
									<div class="group-rules">
										<updoc-sortable-rules
											.rules=${l.rules}
											.expandedIds=${this._expandedRules}
											.renderItem=${g}
											@sort-change=${(p) => r(this, s, we).call(this, l.group, p)}
										></updoc-sortable-rules>
										<uui-button
											look="placeholder"
											label="Add rule to ${l.group}"
											@click=${() => r(this, s, fe).call(this, l.group)}>
											+ Add rule
										</uui-button>
									</div>
									`}
								</div>
							`;
      };
      return u`
							${a.map((l) => n(l))}
							${o ? n(o) : d}
						`;
    })()}

					<uui-button
						look="outline"
						label="Add group"
						@click=${() => r(this, s, _e).call(this)}>
						<uui-icon name="icon-add"></uui-icon>
						Add group
					</uui-button>

					${r(this, s, Je).call(this, e)}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${r(this, s, De)}>Close</uui-button>
					<uui-button
						label="Save"
						look="secondary"
						@click=${r(this, s, Ve)}>
						Save
					</uui-button>
					<uui-button
						label="Save and Close"
						look="primary"
						color="positive"
						@click=${r(this, s, Ue)}>
						Save and Close
					</uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
s = /* @__PURE__ */ new WeakSet();
v = function(e, t) {
  return this._expandedSections.has(`${e}-${t}`);
};
w = function(e, t) {
  const i = `${e}-${t}`, a = new Set(this._expandedSections);
  a.has(i) ? a.delete(i) : a.add(i), this._expandedSections = a;
};
ie = function(e) {
  return this._expandedRules.has(e);
};
S = function(e) {
  const t = new Set(this._expandedRules);
  t.has(e) ? t.delete(e) : t.add(e), this._expandedRules = t;
};
B = function(e) {
  if (!this._expandedRules.has(e)) {
    const t = new Set(this._expandedRules);
    t.add(e), this._expandedRules = t;
  }
};
V = function(e) {
  return this._collapsedGroups.has(e);
};
N = function(e) {
  const t = new Set(this._collapsedGroups);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsedGroups = t;
};
oe = function() {
  const e = this._groupOrder;
  e.every((i) => this._collapsedGroups.has(i)) ? this._collapsedGroups = /* @__PURE__ */ new Set() : this._collapsedGroups = new Set(e);
};
E = function() {
  return this._groupOrder.length > 0 && this._groupOrder.every((e) => this._collapsedGroups.has(e));
};
ae = async function() {
  const e = this._groupOrder.filter((a) => a !== f);
  if (e.length < 2) return;
  const i = (await this.getContext(lt)).open(this, ct, {
    data: {
      headline: "Reorder groups",
      items: e.map((a) => ({ id: a, name: a }))
    }
  });
  try {
    const a = await i.onSubmit(), o = this._groupOrder.includes(f);
    this._groupOrder = o ? [...a.sortedIds, f] : [...a.sortedIds];
  } catch {
  }
};
T = function(e, t) {
  let i = e.part, a = e.exclude ?? !1;
  if (!i && !a) {
    const l = it(e);
    l === "exclude" ? a = !0 : i = l;
  }
  let o = e.formats;
  (!o || o.length === 0) && (o = [{ type: "block", value: e.format ?? ot(e) }]);
  const n = [...e.conditions ?? []].map((l, c) => ({ ...l, sortOrder: l.sortOrder ?? c })).sort((l, c) => l.sortOrder - c.sortOrder);
  return {
    ...e,
    part: i,
    exclude: a,
    formats: o,
    conditions: n,
    _id: I(),
    _groupName: t
  };
};
$ = function() {
  return this.data?.elements ?? [];
};
C = function() {
  return this.data?.sourceType ?? "pdf";
};
se = function() {
  if (m(this, s, C) === "pdf")
    return L.filter((e) => Tt.has(e));
  if (m(this, s, C) === "web") {
    const e = [
      "htmlTagEquals",
      "containerIdEquals",
      "containerClassContains",
      "cssClassContains",
      "htmlContainerPathContains"
    ];
    return [...e, ...L.filter((t) => !e.includes(t))];
  }
  return L;
};
U = function(e) {
  const t = m(this, s, se);
  return t.includes(e) ? t : [e, ...t];
};
ne = function() {
  return this.data?.sectionHeading ?? "Section";
};
re = function() {
  const e = [];
  for (const t of this._groupOrder)
    e.push({
      group: t,
      rules: this._rules.filter((i) => i._groupName === t)
    });
  return e;
};
le = function(e, t) {
  const i = pt(e.conditions);
  return i.length > 0 ? ht(t, i) : t;
};
ue = function() {
  const e = /* @__PURE__ */ new Map(), t = m(this, s, $);
  for (const i of this._rules) {
    const a = X(i.conditions);
    if (a.length === 0) continue;
    const o = i._groupName === f;
    for (let n = 0; n < t.length; n++) {
      const l = t[n], c = e.get(l.id);
      if (!(c && !o) && r(this, s, ce).call(this, l, a, n, t.length)) {
        if (i.exceptions?.length && i.exceptions.some(
          (p) => r(this, s, D).call(this, l, p, n, t.length)
        ))
          continue;
        c ? c.push(i._id) : e.set(l.id, [i._id]);
      }
    }
  }
  return e;
};
ce = function(e, t, i, a) {
  return t.every((o) => r(this, s, D).call(this, e, o, i, a));
};
D = function(e, t, i, a) {
  const o = String(t.value ?? ""), n = Number(t.value);
  switch (t.type) {
    case "textBeginsWith":
      return e.text.toLowerCase().startsWith(o.toLowerCase());
    case "textEndsWith":
      return e.text.toLowerCase().endsWith(o.toLowerCase());
    case "textContains":
      return e.text.toLowerCase().includes(o.toLowerCase());
    case "textMatchesPattern":
      try {
        return new RegExp(o, "i").test(e.text);
      } catch {
        return !1;
      }
    case "fontSizeEquals":
      return !isNaN(n) && Math.abs(e.fontSize - n) <= 0.5;
    case "fontSizeAbove":
      return !isNaN(n) && e.fontSize > n;
    case "fontSizeBelow":
      return !isNaN(n) && e.fontSize < n;
    case "fontSizeRange": {
      const l = t.value && typeof t.value == "object" ? t.value : null;
      return l !== null && e.fontSize >= l.min && e.fontSize <= l.max;
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
      return (e.htmlContainerPath ?? "").split("/").some((c) => {
        const g = c.indexOf("#");
        return g >= 0 && c.substring(g + 1).toLowerCase() === o.toLowerCase();
      });
    case "containerClassContains":
      return (e.htmlContainerPath ?? "").split("/").some((c) => {
        const g = c.indexOf(".");
        return g >= 0 && c.substring(g + 1).toLowerCase().includes(o.toLowerCase());
      });
    case "isBoldEquals":
      return e.isBold === !0;
    default:
      return !1;
  }
};
de = function(e, t, i) {
  return m(this, s, C) === "web" ? r(this, s, pe).call(this, e) : r(this, s, he).call(this, e, t, i);
};
pe = function(e) {
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
      const o = [...i].reverse().find((n) => n.includes("."));
      if (o) {
        const n = o.substring(o.indexOf(".") + 1);
        t.push({ type: "containerClassContains", value: n });
      } else {
        const n = i[i.length - 1];
        n && t.push({ type: "htmlContainerPathContains", value: n });
      }
    }
  }
  return e.isBold && t.push({ type: "isBoldEquals", value: "true" }), t;
};
he = function(e, t, i) {
  const a = [];
  if (a.push({ type: "fontSizeEquals", value: e.fontSize }), e.fontName) {
    const n = e.fontName.includes("+") ? e.fontName.substring(e.fontName.indexOf("+") + 1) : e.fontName;
    a.push({ type: "fontNameContains", value: n });
  }
  e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && a.push({ type: "colorEquals", value: e.color });
  const o = e.text.indexOf(":");
  return o > 0 && o < 30 && a.push({ type: "textBeginsWith", value: e.text.substring(0, o + 1) }), t === 0 ? a.push({ type: "positionFirst" }) : t === i - 1 && a.push({ type: "positionLast" }), a;
};
h = function(e, t) {
  this._rules = this._rules.map((i) => i._id === e ? t(i) : i);
};
fe = function(e = f) {
  this._groupOrder.includes(e) || (this._groupOrder = [...this._groupOrder, e]);
  const t = I();
  this._rules = [...this._rules, {
    role: "",
    part: "content",
    conditions: [],
    formats: [{ type: "block", value: "auto" }],
    _id: t,
    _groupName: e
  }], r(this, s, B).call(this, t);
};
W = function(e) {
  this._rules = this._rules.filter((t) => t._id !== e);
};
me = function(e, t) {
  const i = r(this, s, de).call(this, e, t, m(this, s, $).length), a = e.text.split(/[\s:,]+/).slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, ""), o = I();
  this._groupOrder.includes(f) || (this._groupOrder = [...this._groupOrder, f]), this._rules = [...this._rules, {
    role: a,
    part: "content",
    conditions: i,
    formats: [{ type: "block", value: "auto" }],
    _id: o,
    _groupName: f
  }], r(this, s, B).call(this, o);
};
ge = function(e, t) {
  r(this, s, h).call(this, e, (i) => ({ ...i, role: t }));
};
ve = function(e, t) {
  r(this, s, h).call(this, e, (i) => ({ ...i, part: t }));
};
be = function(e, t) {
  r(this, s, h).call(this, e, (i) => ({ ...i, exclude: t }));
};
xe = function(e, t) {
  r(this, s, h).call(this, e, (i) => ({ ...i, _groupName: t }));
};
_e = function() {
  let e = "New Group", t = 1;
  for (; this._groupOrder.includes(e); )
    e = `New Group ${++t}`;
  this._groupOrder = [...this._groupOrder, e], this._renamingGroup = e, this._renameValue = e;
};
$e = function(e) {
  this._renamingGroup = e, this._renameValue = e;
};
k = function() {
  if (!this._renamingGroup || !this._renameValue.trim()) return;
  const e = this._renamingGroup, t = this._renameValue.trim();
  e !== t && (this._groupOrder = this._groupOrder.map((i) => i === e ? t : i), this._rules = this._rules.map(
    (i) => i._groupName === e ? { ...i, _groupName: t } : i
  )), this._renamingGroup = null, this._renameValue = "";
};
A = function() {
  this._renamingGroup = null, this._renameValue = "";
};
ye = function(e) {
  this._rules = this._rules.map(
    (t) => t._groupName === e ? { ...t, _groupName: f } : t
  ), this._groupOrder = this._groupOrder.filter((t) => t !== e), this._groupOrder.includes(f) || (this._groupOrder = [...this._groupOrder, f]);
};
we = function(e, t) {
  const i = t.detail.rules, a = new Set(i.map((n) => n._id)), o = [];
  for (const n of this._groupOrder)
    n === e ? o.push(...i.map((l) => ({ ...l, _groupName: n }))) : o.push(...this._rules.filter((l) => l._groupName === n && !a.has(l._id)));
  this._rules = o;
};
Ce = function(e) {
  r(this, s, h).call(this, e, (t) => ({
    ...t,
    formats: [...t.formats ?? [], { type: "block", value: "auto" }]
  }));
};
ze = function(e, t) {
  r(this, s, h).call(this, e, (i) => ({
    ...i,
    formats: (i.formats ?? []).filter((a, o) => o !== t)
  }));
};
Ee = function(e, t, i) {
  const a = i === "block" ? "auto" : "bold";
  r(this, s, h).call(this, e, (o) => {
    const n = [...o.formats ?? []];
    return n[t] = { type: i, value: a }, { ...o, formats: n };
  });
};
Se = function(e, t, i) {
  r(this, s, h).call(this, e, (a) => {
    const o = [...a.formats ?? []];
    return o[t] = { ...o[t], value: i }, { ...a, formats: o };
  });
};
ke = function(e) {
  r(this, s, h).call(this, e, (t) => ({
    ...t,
    conditions: [...t.conditions, { type: "textBeginsWith", value: "" }]
  }));
};
Re = function(e, t) {
  r(this, s, h).call(this, e, (i) => ({
    ...i,
    conditions: i.conditions.filter((a, o) => o !== t)
  }));
};
P = function(e, t, i) {
  const a = t + i;
  r(this, s, h).call(this, e, (o) => {
    if (a < 0 || a >= o.conditions.length) return o;
    const n = [...o.conditions];
    return [n[t], n[a]] = [n[a], n[t]], { ...o, conditions: n };
  });
};
Le = function(e, t, i) {
  r(this, s, h).call(this, e, (a) => {
    const o = [...a.conditions];
    let n;
    return R.includes(i) ? n = void 0 : i === "fontSizeRange" ? n = { min: 0, max: 100 } : i === "segment" ? n = et : n = o[t].value, o[t] = { type: i, value: n }, { ...a, conditions: o };
  });
};
M = function(e, t, i) {
  r(this, s, h).call(this, e, (a) => {
    const o = [...a.conditions], n = o[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return o[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...a, conditions: o };
  });
};
G = function(e, t, i, a) {
  r(this, s, h).call(this, e, (o) => {
    const n = [...o.conditions], l = n[t], c = l.value && typeof l.value == "object" ? l.value : { min: 0, max: 100 }, g = isNaN(Number(a)) ? 0 : Number(a);
    return n[t] = { ...l, value: { ...c, [i]: g } }, { ...o, conditions: n };
  });
};
Oe = function(e) {
  r(this, s, h).call(this, e, (t) => ({
    ...t,
    exceptions: [...t.exceptions ?? [], { type: "textContains", value: "" }]
  }));
};
Ne = function(e, t) {
  r(this, s, h).call(this, e, (i) => ({
    ...i,
    exceptions: (i.exceptions ?? []).filter((a, o) => o !== t)
  }));
};
Te = function(e, t, i) {
  r(this, s, h).call(this, e, (a) => {
    const o = [...a.exceptions ?? []];
    return o[t] = {
      type: i,
      value: R.includes(i) || i === "segment" ? void 0 : o[t].value
    }, { ...a, exceptions: o };
  });
};
Ae = function(e, t, i) {
  r(this, s, h).call(this, e, (a) => {
    const o = [...a.exceptions ?? []], n = o[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return o[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...a, exceptions: o };
  });
};
Pe = function(e) {
  r(this, s, h).call(this, e, (t) => ({
    ...t,
    textReplacements: [...t.textReplacements ?? [], { findType: "textBeginsWith", find: "", replaceType: "replaceWith", replace: "" }]
  }));
};
Me = function(e, t) {
  r(this, s, h).call(this, e, (i) => ({
    ...i,
    textReplacements: (i.textReplacements ?? []).filter((a, o) => o !== t)
  }));
};
Ge = function(e, t, i) {
  r(this, s, h).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []], n = i === "textContains" ? "replaceAll" : "replaceWith";
    return o[t] = { ...o[t], findType: i, replaceType: n }, { ...a, textReplacements: o };
  });
};
qe = function(e, t, i) {
  r(this, s, h).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []];
    return o[t] = { ...o[t], find: i }, { ...a, textReplacements: o };
  });
};
Fe = function(e, t, i) {
  r(this, s, h).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []];
    return o[t] = { ...o[t], replace: i }, { ...a, textReplacements: o };
  });
};
Be = function(e) {
  const t = (e.formats ?? []).find((c) => c.type === "block"), { _id: i, _groupName: a, action: o, ...n } = e, l = (n.conditions ?? []).map((c, g) => ({ ...c, sortOrder: g }));
  return {
    ...n,
    conditions: l,
    format: t?.value ?? "auto"
  };
};
H = function() {
  this._renamingGroup && r(this, s, k).call(this);
  const e = [];
  let t = [];
  for (const i of this._groupOrder) {
    const a = this._rules.filter((o) => o._groupName === i).map((o) => r(this, s, Be).call(this, o));
    i === f ? t = a : e.push({ name: i, rules: a });
  }
  return { groups: e, rules: t };
};
Ve = async function() {
  const e = r(this, s, H).call(this);
  this.data?.onSave && await this.data.onSave(e);
};
Ue = function() {
  const e = r(this, s, H).call(this);
  this.value = { rules: e }, this.modalContext?.submit();
};
De = function() {
  this.modalContext?.reject();
};
We = function(e, t, i, a) {
  const o = R.includes(i.type), n = i.type === "fontSizeRange", l = i.type === "segment", c = l ? String(i.value ?? et) : "", g = n && i.value && typeof i.value == "object" ? i.value : { min: 0, max: 100 };
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(p) => r(this, s, Le).call(this, e, t, p.target.value)}>
					${r(this, s, U).call(this, i.type).map((p) => u`
						<option value=${p} ?selected=${p === i.type}>${Ze[p]}</option>
					`)}
				</select>
				${n ? u`
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Min"
						.value=${String(g.min)}
						@input=${(p) => r(this, s, G).call(this, e, t, "min", p.target.value)} />
					<span class="range-separator">–</span>
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Max"
						.value=${String(g.max)}
						@input=${(p) => r(this, s, G).call(this, e, t, "max", p.target.value)} />
				` : l ? u`
					<select
						class="condition-value-input"
						aria-label="Segment bracket"
						.value=${c}
						@change=${(p) => r(this, s, M).call(this, e, t, p.target.value)}>
						${Nt.map((p) => u`
							<option value=${p} ?selected=${p === c}>${Ot[p]}</option>
						`)}
					</select>
				` : o ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(p) => r(this, s, M).call(this, e, t, p.target.value)} />
				`}
				<uui-action-bar>
					<uui-button
						compact
						label="Move condition up"
						title="Move up"
						?disabled=${t === 0}
						@click=${() => r(this, s, P).call(this, e, t, -1)}>
						<uui-icon name="icon-arrow-up"></uui-icon>
					</uui-button>
					<uui-button
						compact
						label="Move condition down"
						title="Move down"
						?disabled=${t === a - 1}
						@click=${() => r(this, s, P).call(this, e, t, 1)}>
						<uui-icon name="icon-arrow-down"></uui-icon>
					</uui-button>
					<uui-button
						compact
						label="Remove condition"
						@click=${() => r(this, s, Re).call(this, e, t)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
He = function(e, t, i) {
  const a = R.includes(i.type) || i.type === "segment";
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(o) => r(this, s, Te).call(this, e, t, o.target.value)}>
					${r(this, s, U).call(this, i.type).map((o) => u`
						<option value=${o} ?selected=${o === i.type}>${Ze[o]}</option>
					`)}
				</select>
				${a ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(o) => r(this, s, Ae).call(this, e, t, o.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove exception"
					@click=${() => r(this, s, Ne).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Ye = function(e, t, i) {
  const a = i.type === "block" ? qt : Bt, o = i.type === "block" ? Gt : Ft;
  return u`
			<div class="condition-row">
				<select
					class="format-type-select"
					.value=${i.type}
					@change=${(n) => r(this, s, Ee).call(this, e, t, n.target.value)}>
					${Mt.map((n) => u`
						<option value=${n} ?selected=${n === i.type}>${Pt[n]}</option>
					`)}
				</select>
				<select
					class="format-value-select"
					.value=${i.value}
					@change=${(n) => r(this, s, Se).call(this, e, t, n.target.value)}>
					${a.map((n) => u`
						<option value=${n} ?selected=${n === i.value}>${o[n]}</option>
					`)}
				</select>
				<uui-button
					compact
					look="secondary"
					label="Remove format"
					@click=${() => r(this, s, ze).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Ie = function(e, t, i) {
  const a = i.findType === "textContains" ? K.replaceAll : K.replaceWith;
  return u`
			<div class="find-replace-entry">
				<div class="condition-row">
					<select
						class="condition-type-select"
						.value=${i.findType}
						@change=${(o) => r(this, s, Ge).call(this, e, t, o.target.value)}>
						${Ut.map((o) => u`
							<option value=${o} ?selected=${o === i.findType}>${Vt[o]}</option>
						`)}
					</select>
					<input
						type="text"
						class="condition-value-input"
						placeholder="Find..."
						.value=${i.find}
						@input=${(o) => r(this, s, qe).call(this, e, t, o.target.value)} />
					<uui-button
						compact
						look="secondary"
						label="Remove replacement"
						@click=${() => r(this, s, Me).call(this, e, t)}>
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
						@input=${(o) => r(this, s, Fe).call(this, e, t, o.target.value)} />
				</div>
			</div>
		`;
};
Ke = function(e, t) {
  return r(this, s, ie).call(this, e._id) ? r(this, s, Qe).call(this, e, t) : r(this, s, je).call(this, e, t);
};
je = function(e, t) {
  const i = e.exclude, a = e.part ?? "content", o = i ? "Exclude" : tt[a] ?? a, n = t.length, l = e.role || "(unnamed rule)";
  return u`
			<div class="rule-row" @click=${() => r(this, s, S).call(this, e._id)}>
				<span class="rule-grip" title="Drag to reorder" @click=${(c) => c.stopPropagation()}>⠿</span>
				<span class="rule-row-name">${l}</span>
				<span class="rule-row-part ${i ? "excluded" : ""}">${o}</span>
				${n > 0 ? u`<span class="rule-row-match ${i ? "excluded" : "matched"}">${n}&times;</span>` : u`<span class="rule-row-match no-match">0</span>`}
				<uui-action-bar class="rule-row-actions"
					@click=${(c) => c.stopPropagation()}>
					<uui-button pristine look="primary" label="Edit rule"
						@click=${() => r(this, s, S).call(this, e._id)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete rule"
						@click=${() => r(this, s, W).call(this, e._id)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
Qe = function(e, t) {
  const i = e.exclude, a = e.part ?? "content", o = e._id;
  return u`
			<div class="rule-card">
				<div class="rule-header">
					<uui-icon class="rule-row-chevron expanded" name="icon-navigation-down"
						@click=${() => r(this, s, S).call(this, o)}
						style="cursor:pointer"></uui-icon>
					<input
						type="text"
						class="role-name-input"
						placeholder="Section name (e.g. tour-title)"
						.value=${e.role}
						@input=${(n) => r(this, s, ge).call(this, o, n.target.value)} />
					<uui-button
						compact
						look="secondary"
						color="danger"
						label="Remove rule"
						@click=${() => r(this, s, W).call(this, o)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</div>

				${this._groupOrder.length > 1 ? u`
				<div class="group-move-area">
					<label class="group-move-label">Group</label>
					<select
						class="group-move-select"
						@change=${(n) => {
    const l = n.target.value;
    r(this, s, xe).call(this, o, l);
  }}>
						${this._groupOrder.map((n) => u`
							<option value=${n} ?selected=${n === e._groupName}>${n}</option>
						`)}
					</select>
				</div>
				` : d}

				<div class="conditions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "conditions", o)}>
						<uui-icon name=${r(this, s, v).call(this, "conditions", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Conditions${e.conditions.length > 0 ? ` (${e.conditions.length})` : ""}
					</div>
					${r(this, s, v).call(this, "conditions", o) ? u`
						${e.conditions.map((n, l) => r(this, s, We).call(this, o, l, n, e.conditions.length))}
						<uui-button
							compact
							look="placeholder"
							label="Add condition"
							@click=${() => r(this, s, ke).call(this, o)}>
							+ Add condition
						</uui-button>
					` : d}
				</div>

				<div class="exceptions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "exceptions", o)}>
						<uui-icon name=${r(this, s, v).call(this, "exceptions", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Exceptions${(e.exceptions ?? []).length > 0 ? ` (${(e.exceptions ?? []).length})` : ""}
					</div>
					${r(this, s, v).call(this, "exceptions", o) ? u`
						${(e.exceptions ?? []).map((n, l) => r(this, s, He).call(this, o, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add exception"
							@click=${() => r(this, s, Oe).call(this, o)}>
							+ Add exception
						</uui-button>
					` : d}
				</div>

				<div class="part-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "part", o)}>
						<uui-icon name=${r(this, s, v).call(this, "part", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Part
					</div>
					${r(this, s, v).call(this, "part", o) ? u`
						<div class="part-controls">
							<select
								class="part-select"
								.value=${a}
								?disabled=${i}
								@change=${(n) => r(this, s, ve).call(this, o, n.target.value)}>
								${At.map((n) => u`
									<option value=${n} ?selected=${n === a}>${tt[n]}</option>
								`)}
							</select>
							<label class="exclude-label">
								<input
									type="checkbox"
									.checked=${i}
									@change=${(n) => r(this, s, be).call(this, o, n.target.checked)} />
								Exclude
							</label>
						</div>
					` : d}
				</div>

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "format", o)}>
						<uui-icon name=${r(this, s, v).call(this, "format", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Format${(e.formats ?? []).length > 0 ? ` (${(e.formats ?? []).length})` : ""}
					</div>
					${r(this, s, v).call(this, "format", o) ? u`
						${(e.formats ?? []).map((n, l) => r(this, s, Ye).call(this, o, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add format"
							@click=${() => r(this, s, Ce).call(this, o)}>
							+ Add format
						</uui-button>
					` : d}
				</div>
				`}

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "findReplace", o)}>
						<uui-icon name=${r(this, s, v).call(this, "findReplace", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Find &amp; Replace${(e.textReplacements ?? []).length > 0 ? ` (${(e.textReplacements ?? []).length})` : ""}
					</div>
					${r(this, s, v).call(this, "findReplace", o) ? u`
						${(e.textReplacements ?? []).map((n, l) => r(this, s, Ie).call(this, o, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add find & replace"
							@click=${() => r(this, s, Pe).call(this, o)}>
							+ Add find &amp; replace
						</uui-button>
					` : d}
				</div>
				`}

				<div class="match-preview ${t.length > 0 ? i ? "excluded" : "matched" : "no-match"}">
					${t.length > 0 ? u`<uui-icon name=${i ? "icon-block" : "icon-check"}></uui-icon> ${i ? "Excluded" : "Matched"} <strong>${t.length}&times;</strong>${t.length <= 5 ? u`: ${t.map((n, l) => u`${l > 0 ? u`, ` : d}<strong>${r(this, s, Y).call(this, r(this, s, le).call(this, e, n.text), 40)}</strong>`)}` : d}` : u`<uui-icon name="icon-alert"></uui-icon> ${X(e.conditions).length === 0 ? "Add conditions to match elements" : "No match"}`}
				</div>
			</div>
		`;
};
Y = function(e, t) {
  return e.length > t ? e.substring(0, t) + "..." : e;
};
Xe = function(e) {
  const t = r(this, s, V).call(this, e);
  return e === f ? u`
				<div class="group-header" @click=${() => r(this, s, N).call(this, e)} style="cursor: pointer;">
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
    i.key === "Enter" && r(this, s, k).call(this), i.key === "Escape" && r(this, s, A).call(this);
  }} />
					<uui-button compact look="primary" label="Confirm" @click=${() => r(this, s, k).call(this)}>
						<uui-icon name="icon-check"></uui-icon>
					</uui-button>
					<uui-button compact look="secondary" label="Cancel" @click=${() => r(this, s, A).call(this)}>
						<uui-icon name="icon-wrong"></uui-icon>
					</uui-button>
				</div>
			` : u`
			<div class="group-header" @click=${() => r(this, s, N).call(this, e)} style="cursor: pointer;">
				<uui-symbol-expand .open=${!t}></uui-symbol-expand>
				<strong class="group-name">${e}</strong>
				<span class="header-spacer"></span>
				<uui-action-bar class="group-header-actions" @click=${(i) => i.stopPropagation()}>
					<uui-button pristine look="primary" label="Rename" @click=${() => r(this, s, $e).call(this, e)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete group"
						title="Delete group (rules move to ungrouped)"
						@click=${() => r(this, s, ye).call(this, e)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
Je = function(e) {
  const t = m(this, s, $), i = t.filter((a) => !e.has(a.id));
  return i.length === 0 ? d : u`
			<div class="unmatched-section">
				<h4>Unmatched elements (${i.length})</h4>
				${i.map((a) => {
    const o = t.indexOf(a);
    return u`
						<div class="unmatched-element">
							<div class="unmatched-text">${r(this, s, Y).call(this, a.text, 80)}</div>
							<div class="unmatched-meta">
								${m(this, s, C) === "web" ? u`
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
								@click=${() => r(this, s, me).call(this, a, o)}>
								Define rule
							</uui-button>
						</div>
					`;
  })}
			</div>
		`;
};
b.styles = [
  ut,
  J,
  q`
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
_([
  x()
], b.prototype, "_rules", 2);
_([
  x()
], b.prototype, "_groupOrder", 2);
_([
  x()
], b.prototype, "_expandedSections", 2);
_([
  x()
], b.prototype, "_expandedRules", 2);
_([
  x()
], b.prototype, "_collapsedGroups", 2);
_([
  x()
], b.prototype, "_renamingGroup", 2);
_([
  x()
], b.prototype, "_renameValue", 2);
b = _([
  j("up-doc-section-rules-editor-modal")
], b);
const Qt = b;
export {
  b as UpDocSectionRulesEditorModalElement,
  Qt as default
};
//# sourceMappingURL=section-rules-editor-modal.element-BmSxl2HF.js.map
