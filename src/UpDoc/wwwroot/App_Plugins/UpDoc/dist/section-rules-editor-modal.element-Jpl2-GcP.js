import { g as tt, b as it } from "./workflow.types-CVkhzFGj.js";
import { UmbSorterController as ot } from "@umbraco-cms/backoffice/sorter";
import { css as G, property as q, state as b, customElement as K, nothing as d, repeat as at, html as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as st } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as nt, UMB_MODAL_MANAGER_CONTEXT as rt } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as lt } from "@umbraco-cms/backoffice/style";
import { U as ut } from "./up-doc-sort-modal.token-Dk9qC_N0.js";
const ct = /\d[\d,]*/;
function j(e) {
  return e.findIndex((t) => t.type === "segment");
}
function Q(e) {
  const t = j(e);
  return t < 0 ? e : e.slice(0, t);
}
function dt(e) {
  const t = j(e);
  return t < 0 ? [] : e.slice(t + 1);
}
function pt(e, t) {
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
  return ht(e, { from: i, to: a });
}
function ht(e, t) {
  if (!t) return e;
  let i = 0;
  if (t.from) {
    const n = ft(e, t.from);
    if (n < 0) return "";
    i = n;
  }
  const a = e.slice(i);
  let o = a.length;
  if (t.to) {
    const n = mt(a, t.to);
    if (n < 0) return "";
    o = n;
  }
  return a.slice(0, o).trim();
}
function ft(e, t) {
  switch (t.anchor) {
    case "afterMarker":
      return gt(e, t.marker);
    case "beforeMarker":
      return vt(e, t.marker);
    case "start":
    default:
      return 0;
  }
}
function mt(e, t) {
  switch (t.anchor) {
    case "end":
      return e.length;
    case "beforeMarker":
      return bt(e, t.marker);
    case "afterMarker":
      return xt(e, t.marker);
    case "number":
      return _t(e);
    default:
      return e.length;
  }
}
function gt(e, t) {
  if (!t) return 0;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i + t.length;
}
function vt(e, t) {
  if (!t) return 0;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i;
}
function bt(e, t) {
  if (!t) return e.length;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i;
}
function xt(e, t) {
  if (!t) return e.length;
  const i = e.toLowerCase().indexOf(t.toLowerCase());
  return i < 0 ? -1 : i + t.length;
}
function _t(e) {
  const t = ct.exec(e);
  return t ? t.index + t[0].length : -1;
}
const X = G`
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
var $t = Object.defineProperty, yt = Object.getOwnPropertyDescriptor, J = (e) => {
  throw TypeError(e);
}, z = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? yt(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (o = (a ? l(t, i, o) : l(o)) || o);
  return a && o && $t(t, i, o), o;
}, wt = (e, t, i) => t.has(e) || J("Cannot " + i), Ct = (e, t, i) => (wt(e, t, "read from private field"), i ? i.call(e) : t.get(e)), zt = (e, t, i) => t.has(e) ? J("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), O;
let $ = class extends st {
  constructor() {
    super(...arguments), zt(this, O, new ot(this, {
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
    this._rules = e, Ct(this, O).setModel(e);
  }
  get rules() {
    return this._rules;
  }
  render() {
    return this._rules.length === 0 && !this.renderItem ? d : u`
			<div class="rules-container">
				${at(
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
$.styles = [
  X,
  G`
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
  q({ attribute: !1 })
], $.prototype, "rules", 1);
z([
  b()
], $.prototype, "_rules", 2);
z([
  q({ attribute: !1 })
], $.prototype, "expandedIds", 2);
z([
  q({ attribute: !1 })
], $.prototype, "renderItem", 2);
$ = z([
  K("updoc-sortable-rules")
], $);
var kt = Object.defineProperty, St = Object.getOwnPropertyDescriptor, Z = (e) => {
  throw TypeError(e);
}, x = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? St(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (o = (a ? l(t, i, o) : l(o)) || o);
  return a && o && kt(t, i, o), o;
}, ee = (e, t, i) => t.has(e) || Z("Cannot " + i), f = (e, t, i) => (ee(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Et = (e, t, i) => t.has(e) ? Z("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (ee(e, t, "access private method"), i), s, g, w, te, S, F, B, N, ie, k, oe, T, _, C, ae, V, se, ne, re, le, ue, D, ce, de, pe, p, he, U, fe, me, ge, ve, be, xe, _e, E, A, $e, ye, we, Ce, ze, ke, Se, Ee, P, Re, Le, M, Oe, Ne, Te, Ae, Pe, Me, Ge, qe, Fe, Be, W, Ve, De, Ue, We, He, Ye, Ie, Ke, je, Qe, H, Xe, Je;
let Rt = 0;
function Y() {
  return `r-${++Rt}`;
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
  textPrecedes: "Text precedes"
}, R = ["positionFirst", "positionLast", "isBoldEquals", "segment"], L = [
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
  "textPrecedes"
], Lt = /* @__PURE__ */ new Set([
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
  "textPrecedes"
]), et = {
  title: "Title",
  content: "Content",
  description: "Description",
  summary: "Summary"
}, Ot = ["title", "content", "description", "summary"], Nt = {
  block: "Block",
  style: "Style"
}, Tt = ["block", "style"], At = {
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
}, Pt = [
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
], Mt = {
  bold: "Bold",
  italic: "Italic",
  strikethrough: "Strikethrough",
  code: "Code",
  highlight: "Highlight"
}, Gt = ["bold", "italic", "strikethrough", "code", "highlight"], h = "Ungrouped", qt = {
  textBeginsWith: "Text begins with",
  textEndsWith: "Text ends with",
  textContains: "Text contains"
}, Ft = ["textBeginsWith", "textEndsWith", "textContains"], I = {
  replaceWith: "Replace with",
  replaceAll: "Replace all with"
};
let v = class extends nt {
  constructor() {
    super(...arguments), Et(this, s), this._rules = [], this._groupOrder = [], this._expandedSections = /* @__PURE__ */ new Set(), this._expandedRules = /* @__PURE__ */ new Set(), this._collapsedGroups = /* @__PURE__ */ new Set(), this._renamingGroup = null, this._renameValue = "";
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
      i.push(h);
      for (const o of a)
        t.push(r(this, s, T).call(this, o, h));
    }
    this._rules = t, this._groupOrder = i;
  }
  render() {
    const e = r(this, s, le).call(this), t = /* @__PURE__ */ new Map();
    for (const [a, o] of e) {
      const n = f(this, s, _).find((l) => l.id === a);
      if (n)
        for (const l of o) {
          const c = t.get(l) ?? [];
          c.push(n), t.set(l, c);
        }
    }
    const i = f(this, s, ne);
    return u`
			<umb-body-layout headline="Edit Sections: ${f(this, s, se)}">
				<div id="main">
					<div class="section-info">
						${this.data?.sectionCount != null ? u`<span class="meta-badge">${this.data.sectionCount} section${this.data.sectionCount !== 1 ? "s" : ""}</span>` : d}
						<span class="meta-badge">${f(this, s, _).length} elements</span>
						<span class="meta-badge">${this._rules.length} rules</span>
						<span class="meta-badge">${e.size} matched</span>
						<span class="meta-badge">${f(this, s, _).length - e.size} unmatched</span>
						${(() => {
      const a = this._groupOrder.filter((o) => o !== h).length;
      return a > 0 ? u`<span class="meta-badge">${a} group${a !== 1 ? "s" : ""}</span>` : d;
    })()}
						${this._groupOrder.length > 0 ? u`
							<uui-button
								compact
								look="outline"
								label=${f(this, s, k) ? "Expand all" : "Collapse all"}
								@click=${() => r(this, s, ie).call(this)}>
								<uui-symbol-expand .open=${!f(this, s, k)}></uui-symbol-expand>
								${f(this, s, k) ? "Expand all" : "Collapse all"}
							</uui-button>
						` : d}
						${this._groupOrder.filter((a) => a !== h).length >= 2 ? u`
							<uui-button
								compact
								look="outline"
								label="Reorder groups"
								@click=${() => r(this, s, oe).call(this)}>
								<uui-icon name="icon-navigation"></uui-icon>
								Reorder
							</uui-button>
						` : d}
					</div>

					${(() => {
      const a = i.filter((l) => l.group !== h), o = i.find((l) => l.group === h), n = (l) => {
        const c = r(this, s, B).call(this, l.group), m = (y) => r(this, s, Ke).call(this, y, t.get(y._id) ?? []);
        return u`
								<div class="group-container ${c ? "collapsed" : ""}">
									${r(this, s, Xe).call(this, l.group)}
									${c ? d : u`
									<div class="group-rules">
										<updoc-sortable-rules
											.rules=${l.rules}
											.expandedIds=${this._expandedRules}
											.renderItem=${m}
											@sort-change=${(y) => r(this, s, ye).call(this, l.group, y)}
										></updoc-sortable-rules>
										<uui-button
											look="placeholder"
											label="Add rule to ${l.group}"
											@click=${() => r(this, s, he).call(this, l.group)}>
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
						@click=${() => r(this, s, xe).call(this)}>
						<uui-icon name="icon-add"></uui-icon>
						Add group
					</uui-button>

					${r(this, s, Je).call(this, e)}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${r(this, s, Ue)}>Close</uui-button>
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
						@click=${r(this, s, De)}>
						Save and Close
					</uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
s = /* @__PURE__ */ new WeakSet();
g = function(e, t) {
  return this._expandedSections.has(`${e}-${t}`);
};
w = function(e, t) {
  const i = `${e}-${t}`, a = new Set(this._expandedSections);
  a.has(i) ? a.delete(i) : a.add(i), this._expandedSections = a;
};
te = function(e) {
  return this._expandedRules.has(e);
};
S = function(e) {
  const t = new Set(this._expandedRules);
  t.has(e) ? t.delete(e) : t.add(e), this._expandedRules = t;
};
F = function(e) {
  if (!this._expandedRules.has(e)) {
    const t = new Set(this._expandedRules);
    t.add(e), this._expandedRules = t;
  }
};
B = function(e) {
  return this._collapsedGroups.has(e);
};
N = function(e) {
  const t = new Set(this._collapsedGroups);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsedGroups = t;
};
ie = function() {
  const e = this._groupOrder;
  e.every((i) => this._collapsedGroups.has(i)) ? this._collapsedGroups = /* @__PURE__ */ new Set() : this._collapsedGroups = new Set(e);
};
k = function() {
  return this._groupOrder.length > 0 && this._groupOrder.every((e) => this._collapsedGroups.has(e));
};
oe = async function() {
  const e = this._groupOrder.filter((a) => a !== h);
  if (e.length < 2) return;
  const i = (await this.getContext(rt)).open(this, ut, {
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
T = function(e, t) {
  let i = e.part, a = e.exclude ?? !1;
  if (!i && !a) {
    const l = tt(e);
    l === "exclude" ? a = !0 : i = l;
  }
  let o = e.formats;
  (!o || o.length === 0) && (o = [{ type: "block", value: e.format ?? it(e) }]);
  const n = [...e.conditions ?? []].map((l, c) => ({ ...l, sortOrder: l.sortOrder ?? c })).sort((l, c) => l.sortOrder - c.sortOrder);
  return {
    ...e,
    part: i,
    exclude: a,
    formats: o,
    conditions: n,
    _id: Y(),
    _groupName: t
  };
};
_ = function() {
  return this.data?.elements ?? [];
};
C = function() {
  return this.data?.sourceType ?? "pdf";
};
ae = function() {
  if (f(this, s, C) === "pdf")
    return L.filter((e) => Lt.has(e));
  if (f(this, s, C) === "web") {
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
V = function(e) {
  const t = f(this, s, ae);
  return t.includes(e) ? t : [e, ...t];
};
se = function() {
  return this.data?.sectionHeading ?? "Section";
};
ne = function() {
  const e = [];
  for (const t of this._groupOrder)
    e.push({
      group: t,
      rules: this._rules.filter((i) => i._groupName === t)
    });
  return e;
};
re = function(e, t) {
  const i = dt(e.conditions);
  return i.length > 0 ? pt(t, i) : t;
};
le = function() {
  const e = /* @__PURE__ */ new Map(), t = f(this, s, _);
  for (const i of this._rules) {
    const a = Q(i.conditions);
    if (a.length === 0) continue;
    const o = i._groupName === h;
    for (let n = 0; n < t.length; n++) {
      const l = t[n], c = e.get(l.id);
      if (!(c && !o) && r(this, s, ue).call(this, l, a, n, t.length)) {
        if (i.exceptions?.length && i.exceptions.some(
          (y) => r(this, s, D).call(this, l, y, n, t.length)
        ))
          continue;
        c ? c.push(i._id) : e.set(l.id, [i._id]);
      }
    }
  }
  return e;
};
ue = function(e, t, i, a) {
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
        const m = c.indexOf("#");
        return m >= 0 && c.substring(m + 1).toLowerCase() === o.toLowerCase();
      });
    case "containerClassContains":
      return (e.htmlContainerPath ?? "").split("/").some((c) => {
        const m = c.indexOf(".");
        return m >= 0 && c.substring(m + 1).toLowerCase().includes(o.toLowerCase());
      });
    case "isBoldEquals":
      return e.isBold === !0;
    default:
      return !1;
  }
};
ce = function(e, t, i) {
  return f(this, s, C) === "web" ? r(this, s, de).call(this, e) : r(this, s, pe).call(this, e, t, i);
};
de = function(e) {
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
pe = function(e, t, i) {
  const a = [];
  if (a.push({ type: "fontSizeEquals", value: e.fontSize }), e.fontName) {
    const n = e.fontName.includes("+") ? e.fontName.substring(e.fontName.indexOf("+") + 1) : e.fontName;
    a.push({ type: "fontNameContains", value: n });
  }
  e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && a.push({ type: "colorEquals", value: e.color });
  const o = e.text.indexOf(":");
  return o > 0 && o < 30 && a.push({ type: "textBeginsWith", value: e.text.substring(0, o + 1) }), t === 0 ? a.push({ type: "positionFirst" }) : t === i - 1 && a.push({ type: "positionLast" }), a;
};
p = function(e, t) {
  this._rules = this._rules.map((i) => i._id === e ? t(i) : i);
};
he = function(e = h) {
  this._groupOrder.includes(e) || (this._groupOrder = [...this._groupOrder, e]);
  const t = Y();
  this._rules = [...this._rules, {
    role: "",
    part: "content",
    conditions: [],
    formats: [{ type: "block", value: "auto" }],
    _id: t,
    _groupName: e
  }], r(this, s, F).call(this, t);
};
U = function(e) {
  this._rules = this._rules.filter((t) => t._id !== e);
};
fe = function(e, t) {
  const i = r(this, s, ce).call(this, e, t, f(this, s, _).length), a = e.text.split(/[\s:,]+/).slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, ""), o = Y();
  this._groupOrder.includes(h) || (this._groupOrder = [...this._groupOrder, h]), this._rules = [...this._rules, {
    role: a,
    part: "content",
    conditions: i,
    formats: [{ type: "block", value: "auto" }],
    _id: o,
    _groupName: h
  }], r(this, s, F).call(this, o);
};
me = function(e, t) {
  r(this, s, p).call(this, e, (i) => ({ ...i, role: t }));
};
ge = function(e, t) {
  r(this, s, p).call(this, e, (i) => ({ ...i, part: t }));
};
ve = function(e, t) {
  r(this, s, p).call(this, e, (i) => ({ ...i, exclude: t }));
};
be = function(e, t) {
  r(this, s, p).call(this, e, (i) => ({ ...i, _groupName: t }));
};
xe = function() {
  let e = "New Group", t = 1;
  for (; this._groupOrder.includes(e); )
    e = `New Group ${++t}`;
  this._groupOrder = [...this._groupOrder, e], this._renamingGroup = e, this._renameValue = e;
};
_e = function(e) {
  this._renamingGroup = e, this._renameValue = e;
};
E = function() {
  if (!this._renamingGroup || !this._renameValue.trim()) return;
  const e = this._renamingGroup, t = this._renameValue.trim();
  e !== t && (this._groupOrder = this._groupOrder.map((i) => i === e ? t : i), this._rules = this._rules.map(
    (i) => i._groupName === e ? { ...i, _groupName: t } : i
  )), this._renamingGroup = null, this._renameValue = "";
};
A = function() {
  this._renamingGroup = null, this._renameValue = "";
};
$e = function(e) {
  this._rules = this._rules.map(
    (t) => t._groupName === e ? { ...t, _groupName: h } : t
  ), this._groupOrder = this._groupOrder.filter((t) => t !== e), this._groupOrder.includes(h) || (this._groupOrder = [...this._groupOrder, h]);
};
ye = function(e, t) {
  const i = t.detail.rules, a = new Set(i.map((n) => n._id)), o = [];
  for (const n of this._groupOrder)
    n === e ? o.push(...i.map((l) => ({ ...l, _groupName: n }))) : o.push(...this._rules.filter((l) => l._groupName === n && !a.has(l._id)));
  this._rules = o;
};
we = function(e) {
  r(this, s, p).call(this, e, (t) => ({
    ...t,
    formats: [...t.formats ?? [], { type: "block", value: "auto" }]
  }));
};
Ce = function(e, t) {
  r(this, s, p).call(this, e, (i) => ({
    ...i,
    formats: (i.formats ?? []).filter((a, o) => o !== t)
  }));
};
ze = function(e, t, i) {
  const a = i === "block" ? "auto" : "bold";
  r(this, s, p).call(this, e, (o) => {
    const n = [...o.formats ?? []];
    return n[t] = { type: i, value: a }, { ...o, formats: n };
  });
};
ke = function(e, t, i) {
  r(this, s, p).call(this, e, (a) => {
    const o = [...a.formats ?? []];
    return o[t] = { ...o[t], value: i }, { ...a, formats: o };
  });
};
Se = function(e) {
  r(this, s, p).call(this, e, (t) => ({
    ...t,
    conditions: [...t.conditions, { type: "textBeginsWith", value: "" }]
  }));
};
Ee = function(e, t) {
  r(this, s, p).call(this, e, (i) => ({
    ...i,
    conditions: i.conditions.filter((a, o) => o !== t)
  }));
};
P = function(e, t, i) {
  const a = t + i;
  r(this, s, p).call(this, e, (o) => {
    if (a < 0 || a >= o.conditions.length) return o;
    const n = [...o.conditions];
    return [n[t], n[a]] = [n[a], n[t]], { ...o, conditions: n };
  });
};
Re = function(e, t, i) {
  r(this, s, p).call(this, e, (a) => {
    const o = [...a.conditions];
    let n;
    return R.includes(i) ? n = void 0 : i === "fontSizeRange" ? n = { min: 0, max: 100 } : n = o[t].value, o[t] = { type: i, value: n }, { ...a, conditions: o };
  });
};
Le = function(e, t, i) {
  r(this, s, p).call(this, e, (a) => {
    const o = [...a.conditions], n = o[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return o[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...a, conditions: o };
  });
};
M = function(e, t, i, a) {
  r(this, s, p).call(this, e, (o) => {
    const n = [...o.conditions], l = n[t], c = l.value && typeof l.value == "object" ? l.value : { min: 0, max: 100 }, m = isNaN(Number(a)) ? 0 : Number(a);
    return n[t] = { ...l, value: { ...c, [i]: m } }, { ...o, conditions: n };
  });
};
Oe = function(e) {
  r(this, s, p).call(this, e, (t) => ({
    ...t,
    exceptions: [...t.exceptions ?? [], { type: "textContains", value: "" }]
  }));
};
Ne = function(e, t) {
  r(this, s, p).call(this, e, (i) => ({
    ...i,
    exceptions: (i.exceptions ?? []).filter((a, o) => o !== t)
  }));
};
Te = function(e, t, i) {
  r(this, s, p).call(this, e, (a) => {
    const o = [...a.exceptions ?? []];
    return o[t] = {
      type: i,
      value: R.includes(i) ? void 0 : o[t].value
    }, { ...a, exceptions: o };
  });
};
Ae = function(e, t, i) {
  r(this, s, p).call(this, e, (a) => {
    const o = [...a.exceptions ?? []], n = o[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return o[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...a, exceptions: o };
  });
};
Pe = function(e) {
  r(this, s, p).call(this, e, (t) => ({
    ...t,
    textReplacements: [...t.textReplacements ?? [], { findType: "textBeginsWith", find: "", replaceType: "replaceWith", replace: "" }]
  }));
};
Me = function(e, t) {
  r(this, s, p).call(this, e, (i) => ({
    ...i,
    textReplacements: (i.textReplacements ?? []).filter((a, o) => o !== t)
  }));
};
Ge = function(e, t, i) {
  r(this, s, p).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []], n = i === "textContains" ? "replaceAll" : "replaceWith";
    return o[t] = { ...o[t], findType: i, replaceType: n }, { ...a, textReplacements: o };
  });
};
qe = function(e, t, i) {
  r(this, s, p).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []];
    return o[t] = { ...o[t], find: i }, { ...a, textReplacements: o };
  });
};
Fe = function(e, t, i) {
  r(this, s, p).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []];
    return o[t] = { ...o[t], replace: i }, { ...a, textReplacements: o };
  });
};
Be = function(e) {
  const t = (e.formats ?? []).find((c) => c.type === "block"), { _id: i, _groupName: a, action: o, ...n } = e, l = (n.conditions ?? []).map((c, m) => ({ ...c, sortOrder: m }));
  return {
    ...n,
    conditions: l,
    format: t?.value ?? "auto"
  };
};
W = function() {
  this._renamingGroup && r(this, s, E).call(this);
  const e = [];
  let t = [];
  for (const i of this._groupOrder) {
    const a = this._rules.filter((o) => o._groupName === i).map((o) => r(this, s, Be).call(this, o));
    i === h ? t = a : e.push({ name: i, rules: a });
  }
  return { groups: e, rules: t };
};
Ve = async function() {
  const e = r(this, s, W).call(this);
  this.data?.onSave && await this.data.onSave(e);
};
De = function() {
  const e = r(this, s, W).call(this);
  this.value = { rules: e }, this.modalContext?.submit();
};
Ue = function() {
  this.modalContext?.reject();
};
We = function(e, t, i, a) {
  const o = R.includes(i.type), n = i.type === "fontSizeRange", l = n && i.value && typeof i.value == "object" ? i.value : { min: 0, max: 100 };
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(c) => r(this, s, Re).call(this, e, t, c.target.value)}>
					${r(this, s, V).call(this, i.type).map((c) => u`
						<option value=${c} ?selected=${c === i.type}>${Ze[c]}</option>
					`)}
				</select>
				${n ? u`
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Min"
						.value=${String(l.min)}
						@input=${(c) => r(this, s, M).call(this, e, t, "min", c.target.value)} />
					<span class="range-separator">–</span>
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Max"
						.value=${String(l.max)}
						@input=${(c) => r(this, s, M).call(this, e, t, "max", c.target.value)} />
				` : o ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(c) => r(this, s, Le).call(this, e, t, c.target.value)} />
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
						@click=${() => r(this, s, Ee).call(this, e, t)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
He = function(e, t, i) {
  const a = R.includes(i.type);
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(o) => r(this, s, Te).call(this, e, t, o.target.value)}>
					${r(this, s, V).call(this, i.type).map((o) => u`
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
  const a = i.type === "block" ? Pt : Gt, o = i.type === "block" ? At : Mt;
  return u`
			<div class="condition-row">
				<select
					class="format-type-select"
					.value=${i.type}
					@change=${(n) => r(this, s, ze).call(this, e, t, n.target.value)}>
					${Tt.map((n) => u`
						<option value=${n} ?selected=${n === i.type}>${Nt[n]}</option>
					`)}
				</select>
				<select
					class="format-value-select"
					.value=${i.value}
					@change=${(n) => r(this, s, ke).call(this, e, t, n.target.value)}>
					${a.map((n) => u`
						<option value=${n} ?selected=${n === i.value}>${o[n]}</option>
					`)}
				</select>
				<uui-button
					compact
					look="secondary"
					label="Remove format"
					@click=${() => r(this, s, Ce).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Ie = function(e, t, i) {
  const a = i.findType === "textContains" ? I.replaceAll : I.replaceWith;
  return u`
			<div class="find-replace-entry">
				<div class="condition-row">
					<select
						class="condition-type-select"
						.value=${i.findType}
						@change=${(o) => r(this, s, Ge).call(this, e, t, o.target.value)}>
						${Ft.map((o) => u`
							<option value=${o} ?selected=${o === i.findType}>${qt[o]}</option>
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
  return r(this, s, te).call(this, e._id) ? r(this, s, Qe).call(this, e, t) : r(this, s, je).call(this, e, t);
};
je = function(e, t) {
  const i = e.exclude, a = e.part ?? "content", o = i ? "Exclude" : et[a] ?? a, n = t.length, l = e.role || "(unnamed rule)";
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
						@click=${() => r(this, s, U).call(this, e._id)}>
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
						@input=${(n) => r(this, s, me).call(this, o, n.target.value)} />
					<uui-button
						compact
						look="secondary"
						color="danger"
						label="Remove rule"
						@click=${() => r(this, s, U).call(this, o)}>
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
    r(this, s, be).call(this, o, l);
  }}>
						${this._groupOrder.map((n) => u`
							<option value=${n} ?selected=${n === e._groupName}>${n}</option>
						`)}
					</select>
				</div>
				` : d}

				<div class="conditions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "conditions", o)}>
						<uui-icon name=${r(this, s, g).call(this, "conditions", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Conditions${e.conditions.length > 0 ? ` (${e.conditions.length})` : ""}
					</div>
					${r(this, s, g).call(this, "conditions", o) ? u`
						${e.conditions.map((n, l) => r(this, s, We).call(this, o, l, n, e.conditions.length))}
						<uui-button
							compact
							look="placeholder"
							label="Add condition"
							@click=${() => r(this, s, Se).call(this, o)}>
							+ Add condition
						</uui-button>
					` : d}
				</div>

				<div class="exceptions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "exceptions", o)}>
						<uui-icon name=${r(this, s, g).call(this, "exceptions", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Exceptions${(e.exceptions ?? []).length > 0 ? ` (${(e.exceptions ?? []).length})` : ""}
					</div>
					${r(this, s, g).call(this, "exceptions", o) ? u`
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
						<uui-icon name=${r(this, s, g).call(this, "part", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Part
					</div>
					${r(this, s, g).call(this, "part", o) ? u`
						<div class="part-controls">
							<select
								class="part-select"
								.value=${a}
								?disabled=${i}
								@change=${(n) => r(this, s, ge).call(this, o, n.target.value)}>
								${Ot.map((n) => u`
									<option value=${n} ?selected=${n === a}>${et[n]}</option>
								`)}
							</select>
							<label class="exclude-label">
								<input
									type="checkbox"
									.checked=${i}
									@change=${(n) => r(this, s, ve).call(this, o, n.target.checked)} />
								Exclude
							</label>
						</div>
					` : d}
				</div>

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "format", o)}>
						<uui-icon name=${r(this, s, g).call(this, "format", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Format${(e.formats ?? []).length > 0 ? ` (${(e.formats ?? []).length})` : ""}
					</div>
					${r(this, s, g).call(this, "format", o) ? u`
						${(e.formats ?? []).map((n, l) => r(this, s, Ye).call(this, o, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add format"
							@click=${() => r(this, s, we).call(this, o)}>
							+ Add format
						</uui-button>
					` : d}
				</div>
				`}

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, w).call(this, "findReplace", o)}>
						<uui-icon name=${r(this, s, g).call(this, "findReplace", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Find &amp; Replace${(e.textReplacements ?? []).length > 0 ? ` (${(e.textReplacements ?? []).length})` : ""}
					</div>
					${r(this, s, g).call(this, "findReplace", o) ? u`
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
					${t.length > 0 ? u`<uui-icon name=${i ? "icon-block" : "icon-check"}></uui-icon> ${i ? "Excluded" : "Matched"} <strong>${t.length}&times;</strong>${t.length <= 5 ? u`: ${t.map((n, l) => u`${l > 0 ? u`, ` : d}<strong>${r(this, s, H).call(this, r(this, s, re).call(this, e, n.text), 40)}</strong>`)}` : d}` : u`<uui-icon name="icon-alert"></uui-icon> ${Q(e.conditions).length === 0 ? "Add conditions to match elements" : "No match"}`}
				</div>
			</div>
		`;
};
H = function(e, t) {
  return e.length > t ? e.substring(0, t) + "..." : e;
};
Xe = function(e) {
  const t = r(this, s, B).call(this, e);
  return e === h ? u`
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
    i.key === "Enter" && r(this, s, E).call(this), i.key === "Escape" && r(this, s, A).call(this);
  }} />
					<uui-button compact look="primary" label="Confirm" @click=${() => r(this, s, E).call(this)}>
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
					<uui-button pristine look="primary" label="Rename" @click=${() => r(this, s, _e).call(this, e)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete group"
						title="Delete group (rules move to ungrouped)"
						@click=${() => r(this, s, $e).call(this, e)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
Je = function(e) {
  const t = f(this, s, _), i = t.filter((a) => !e.has(a.id));
  return i.length === 0 ? d : u`
			<div class="unmatched-section">
				<h4>Unmatched elements (${i.length})</h4>
				${i.map((a) => {
    const o = t.indexOf(a);
    return u`
						<div class="unmatched-element">
							<div class="unmatched-text">${r(this, s, H).call(this, a.text, 80)}</div>
							<div class="unmatched-meta">
								${f(this, s, C) === "web" ? u`
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
								@click=${() => r(this, s, fe).call(this, a, o)}>
								Define rule
							</uui-button>
						</div>
					`;
  })}
			</div>
		`;
};
v.styles = [
  lt,
  X,
  G`
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
x([
  b()
], v.prototype, "_rules", 2);
x([
  b()
], v.prototype, "_groupOrder", 2);
x([
  b()
], v.prototype, "_expandedSections", 2);
x([
  b()
], v.prototype, "_expandedRules", 2);
x([
  b()
], v.prototype, "_collapsedGroups", 2);
x([
  b()
], v.prototype, "_renamingGroup", 2);
x([
  b()
], v.prototype, "_renameValue", 2);
v = x([
  K("up-doc-section-rules-editor-modal")
], v);
const It = v;
export {
  v as UpDocSectionRulesEditorModalElement,
  It as default
};
//# sourceMappingURL=section-rules-editor-modal.element-Jpl2-GcP.js.map
