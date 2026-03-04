import { g as Qe, b as Xe } from "./workflow.types-CVkhzFGj.js";
import { UmbSorterController as Je } from "@umbraco-cms/backoffice/sorter";
import { css as P, property as G, state as b, customElement as Y, nothing as c, repeat as Ze, html as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as et } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as tt, UMB_MODAL_MANAGER_CONTEXT as it } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as ot } from "@umbraco-cms/backoffice/style";
import { U as at } from "./up-doc-sort-modal.token-Dk9qC_N0.js";
const K = P`
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
var st = Object.defineProperty, nt = Object.getOwnPropertyDescriptor, j = (e) => {
  throw TypeError(e);
}, w = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? nt(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (o = (a ? l(t, i, o) : l(o)) || o);
  return a && o && st(t, i, o), o;
}, rt = (e, t, i) => t.has(e) || j("Cannot " + i), lt = (e, t, i) => (rt(e, t, "read from private field"), i ? i.call(e) : t.get(e)), ut = (e, t, i) => t.has(e) ? j("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), L;
let $ = class extends et {
  constructor() {
    super(...arguments), ut(this, L, new Je(this, {
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
    this._rules = e, lt(this, L).setModel(e);
  }
  get rules() {
    return this._rules;
  }
  render() {
    return this._rules.length === 0 && !this.renderItem ? c : u`
			<div class="rules-container">
				${Ze(
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
L = /* @__PURE__ */ new WeakMap();
$.styles = [
  K,
  P`
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
w([
  G({ attribute: !1 })
], $.prototype, "rules", 1);
w([
  b()
], $.prototype, "_rules", 2);
w([
  G({ attribute: !1 })
], $.prototype, "expandedIds", 2);
w([
  G({ attribute: !1 })
], $.prototype, "renderItem", 2);
$ = w([
  Y("updoc-sortable-rules")
], $);
var ct = Object.defineProperty, dt = Object.getOwnPropertyDescriptor, Q = (e) => {
  throw TypeError(e);
}, x = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? dt(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (o = (a ? l(t, i, o) : l(o)) || o);
  return a && o && ct(t, i, o), o;
}, X = (e, t, i) => t.has(e) || Q("Cannot " + i), h = (e, t, i) => (X(e, t, "read from private field"), i ? i.call(e) : t.get(e)), pt = (e, t, i) => t.has(e) ? Q("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (X(e, t, "access private method"), i), s, g, y, J, k, q, B, O, Z, z, ee, N, _, E, M, te, ie, oe, ae, F, se, ne, re, d, le, V, ue, ce, de, pe, he, fe, ge, S, T, me, ve, be, xe, _e, $e, ye, we, Ce, ze, A, ke, Se, Ee, Re, Le, Oe, Ne, Te, Ae, Pe, D, Ge, qe, Be, Me, Fe, Ve, De, We, Ue, He, W, Ie, Ye;
let ht = 0;
function U() {
  return `r-${++ht}`;
}
const Ke = {
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
  isBoldEquals: "Is bold"
}, R = ["positionFirst", "positionLast", "isBoldEquals"], H = [
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
  "isBoldEquals"
], je = {
  title: "Title",
  content: "Content",
  description: "Description",
  summary: "Summary"
}, ft = ["title", "content", "description", "summary"], gt = {
  block: "Block",
  style: "Style"
}, mt = ["block", "style"], vt = {
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
}, bt = [
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
], xt = {
  bold: "Bold",
  italic: "Italic",
  strikethrough: "Strikethrough",
  code: "Code",
  highlight: "Highlight"
}, _t = ["bold", "italic", "strikethrough", "code", "highlight"], p = "Ungrouped", $t = {
  textBeginsWith: "Text begins with",
  textEndsWith: "Text ends with",
  textContains: "Text contains"
}, yt = ["textBeginsWith", "textEndsWith", "textContains"], I = {
  replaceWith: "Replace with",
  replaceAll: "Replace all with"
};
let m = class extends tt {
  constructor() {
    super(...arguments), pt(this, s), this._rules = [], this._groupOrder = [], this._expandedSections = /* @__PURE__ */ new Set(), this._expandedRules = /* @__PURE__ */ new Set(), this._collapsedGroups = /* @__PURE__ */ new Set(), this._renamingGroup = null, this._renameValue = "";
  }
  firstUpdated() {
    const e = this.data?.existingRules;
    if (!e) return;
    const t = [], i = [];
    for (const o of e.groups ?? []) {
      i.push(o.name);
      for (const n of o.rules)
        t.push(r(this, s, N).call(this, n, o.name));
    }
    const a = e.rules ?? [];
    if (a.length > 0) {
      i.push(p);
      for (const o of a)
        t.push(r(this, s, N).call(this, o, p));
    }
    this._rules = t, this._groupOrder = i;
  }
  render() {
    const e = r(this, s, oe).call(this), t = /* @__PURE__ */ new Map();
    for (const [a, o] of e) {
      const n = h(this, s, _).find((l) => l.id === a);
      if (n) {
        const l = t.get(o) ?? [];
        l.push(n), t.set(o, l);
      }
    }
    const i = h(this, s, ie);
    return u`
			<umb-body-layout headline="Edit Sections: ${h(this, s, te)}">
				<div id="main">
					<div class="section-info">
						${this.data?.sectionCount != null ? u`<span class="meta-badge">${this.data.sectionCount} section${this.data.sectionCount !== 1 ? "s" : ""}</span>` : c}
						<span class="meta-badge">${h(this, s, _).length} elements</span>
						<span class="meta-badge">${this._rules.length} rules</span>
						<span class="meta-badge">${e.size} matched</span>
						<span class="meta-badge">${h(this, s, _).length - e.size} unmatched</span>
						${(() => {
      const a = this._groupOrder.filter((o) => o !== p).length;
      return a > 0 ? u`<span class="meta-badge">${a} group${a !== 1 ? "s" : ""}</span>` : c;
    })()}
						${this._groupOrder.length > 0 ? u`
							<uui-button
								compact
								look="outline"
								label=${h(this, s, z) ? "Expand all" : "Collapse all"}
								@click=${() => r(this, s, Z).call(this)}>
								<uui-symbol-expand .open=${!h(this, s, z)}></uui-symbol-expand>
								${h(this, s, z) ? "Expand all" : "Collapse all"}
							</uui-button>
						` : c}
						${this._groupOrder.filter((a) => a !== p).length >= 2 ? u`
							<uui-button
								compact
								look="outline"
								label="Reorder groups"
								@click=${() => r(this, s, ee).call(this)}>
								<uui-icon name="icon-navigation"></uui-icon>
								Reorder
							</uui-button>
						` : c}
					</div>

					${(() => {
      const a = i.filter((l) => l.group !== p), o = i.find((l) => l.group === p), n = (l) => {
        const f = r(this, s, B).call(this, l.group), v = (C) => r(this, s, We).call(this, C, t.get(C._id) ?? []);
        return u`
								<div class="group-container ${f ? "collapsed" : ""}">
									${r(this, s, Ie).call(this, l.group)}
									${f ? c : u`
									<div class="group-rules">
										<updoc-sortable-rules
											.rules=${l.rules}
											.expandedIds=${this._expandedRules}
											.renderItem=${v}
											@sort-change=${(C) => r(this, s, ve).call(this, l.group, C)}
										></updoc-sortable-rules>
										<uui-button
											look="placeholder"
											label="Add rule to ${l.group}"
											@click=${() => r(this, s, le).call(this, l.group)}>
											+ Add rule
										</uui-button>
									</div>
									`}
								</div>
							`;
      };
      return u`
							${a.map((l) => n(l))}
							${o ? n(o) : c}
						`;
    })()}

					<uui-button
						look="outline"
						label="Add group"
						@click=${() => r(this, s, fe).call(this)}>
						<uui-icon name="icon-add"></uui-icon>
						Add group
					</uui-button>

					${r(this, s, Ye).call(this, e)}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${r(this, s, Be)}>Close</uui-button>
					<uui-button
						label="Save"
						look="secondary"
						@click=${r(this, s, Ge)}>
						Save
					</uui-button>
					<uui-button
						label="Save and Close"
						look="primary"
						color="positive"
						@click=${r(this, s, qe)}>
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
y = function(e, t) {
  const i = `${e}-${t}`, a = new Set(this._expandedSections);
  a.has(i) ? a.delete(i) : a.add(i), this._expandedSections = a;
};
J = function(e) {
  return this._expandedRules.has(e);
};
k = function(e) {
  const t = new Set(this._expandedRules);
  t.has(e) ? t.delete(e) : t.add(e), this._expandedRules = t;
};
q = function(e) {
  if (!this._expandedRules.has(e)) {
    const t = new Set(this._expandedRules);
    t.add(e), this._expandedRules = t;
  }
};
B = function(e) {
  return this._collapsedGroups.has(e);
};
O = function(e) {
  const t = new Set(this._collapsedGroups);
  t.has(e) ? t.delete(e) : t.add(e), this._collapsedGroups = t;
};
Z = function() {
  const e = this._groupOrder;
  e.every((i) => this._collapsedGroups.has(i)) ? this._collapsedGroups = /* @__PURE__ */ new Set() : this._collapsedGroups = new Set(e);
};
z = function() {
  return this._groupOrder.length > 0 && this._groupOrder.every((e) => this._collapsedGroups.has(e));
};
ee = async function() {
  const e = this._groupOrder.filter((a) => a !== p);
  if (e.length < 2) return;
  const i = (await this.getContext(it)).open(this, at, {
    data: {
      headline: "Reorder groups",
      items: e.map((a) => ({ id: a, name: a }))
    }
  });
  try {
    const a = await i.onSubmit(), o = this._groupOrder.includes(p);
    this._groupOrder = o ? [...a.sortedIds, p] : [...a.sortedIds];
  } catch {
  }
};
N = function(e, t) {
  let i = e.part, a = e.exclude ?? !1;
  if (!i && !a) {
    const n = Qe(e);
    n === "exclude" ? a = !0 : i = n;
  }
  let o = e.formats;
  return (!o || o.length === 0) && (o = [{ type: "block", value: e.format ?? Xe(e) }]), {
    ...e,
    part: i,
    exclude: a,
    formats: o,
    _id: U(),
    _groupName: t
  };
};
_ = function() {
  return this.data?.elements ?? [];
};
E = function() {
  return this.data?.sourceType ?? "pdf";
};
M = function() {
  if (h(this, s, E) === "web") {
    const e = ["htmlTagEquals", "containerIdEquals", "containerClassContains", "cssClassContains", "htmlContainerPathContains"];
    return [...e, ...H.filter((t) => !e.includes(t))];
  }
  return H;
};
te = function() {
  return this.data?.sectionHeading ?? "Section";
};
ie = function() {
  const e = [];
  for (const t of this._groupOrder)
    e.push({
      group: t,
      rules: this._rules.filter((i) => i._groupName === t)
    });
  return e;
};
oe = function() {
  const e = /* @__PURE__ */ new Map(), t = h(this, s, _);
  for (const i of this._rules)
    if (i.conditions.length !== 0)
      for (let a = 0; a < t.length; a++) {
        const o = t[a];
        if (!e.has(o.id) && r(this, s, ae).call(this, o, i.conditions, a, t.length)) {
          if (i.exceptions?.length && i.exceptions.some(
            (l) => r(this, s, F).call(this, o, l, a, t.length)
          ))
            continue;
          e.set(o.id, i._id);
        }
      }
  return e;
};
ae = function(e, t, i, a) {
  return t.every((o) => r(this, s, F).call(this, e, o, i, a));
};
F = function(e, t, i, a) {
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
      return (e.htmlContainerPath ?? "").split("/").some((f) => {
        const v = f.indexOf("#");
        return v >= 0 && f.substring(v + 1).toLowerCase() === o.toLowerCase();
      });
    case "containerClassContains":
      return (e.htmlContainerPath ?? "").split("/").some((f) => {
        const v = f.indexOf(".");
        return v >= 0 && f.substring(v + 1).toLowerCase().includes(o.toLowerCase());
      });
    case "isBoldEquals":
      return e.isBold === !0;
    default:
      return !1;
  }
};
se = function(e, t, i) {
  return h(this, s, E) === "web" ? r(this, s, ne).call(this, e) : r(this, s, re).call(this, e, t, i);
};
ne = function(e) {
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
re = function(e, t, i) {
  const a = [];
  if (a.push({ type: "fontSizeEquals", value: e.fontSize }), e.fontName) {
    const n = e.fontName.includes("+") ? e.fontName.substring(e.fontName.indexOf("+") + 1) : e.fontName;
    a.push({ type: "fontNameContains", value: n });
  }
  e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && a.push({ type: "colorEquals", value: e.color });
  const o = e.text.indexOf(":");
  return o > 0 && o < 30 && a.push({ type: "textBeginsWith", value: e.text.substring(0, o + 1) }), t === 0 ? a.push({ type: "positionFirst" }) : t === i - 1 && a.push({ type: "positionLast" }), a;
};
d = function(e, t) {
  this._rules = this._rules.map((i) => i._id === e ? t(i) : i);
};
le = function(e = p) {
  this._groupOrder.includes(e) || (this._groupOrder = [...this._groupOrder, e]);
  const t = U();
  this._rules = [...this._rules, {
    role: "",
    part: "content",
    conditions: [],
    formats: [{ type: "block", value: "auto" }],
    _id: t,
    _groupName: e
  }], r(this, s, q).call(this, t);
};
V = function(e) {
  this._rules = this._rules.filter((t) => t._id !== e);
};
ue = function(e, t) {
  const i = r(this, s, se).call(this, e, t, h(this, s, _).length), a = e.text.split(/[\s:,]+/).slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, ""), o = U();
  this._groupOrder.includes(p) || (this._groupOrder = [...this._groupOrder, p]), this._rules = [...this._rules, {
    role: a,
    part: "content",
    conditions: i,
    formats: [{ type: "block", value: "auto" }],
    _id: o,
    _groupName: p
  }], r(this, s, q).call(this, o);
};
ce = function(e, t) {
  r(this, s, d).call(this, e, (i) => ({ ...i, role: t }));
};
de = function(e, t) {
  r(this, s, d).call(this, e, (i) => ({ ...i, part: t }));
};
pe = function(e, t) {
  r(this, s, d).call(this, e, (i) => ({ ...i, exclude: t }));
};
he = function(e, t) {
  r(this, s, d).call(this, e, (i) => ({ ...i, _groupName: t }));
};
fe = function() {
  let e = "New Group", t = 1;
  for (; this._groupOrder.includes(e); )
    e = `New Group ${++t}`;
  this._groupOrder = [...this._groupOrder, e], this._renamingGroup = e, this._renameValue = e;
};
ge = function(e) {
  this._renamingGroup = e, this._renameValue = e;
};
S = function() {
  if (!this._renamingGroup || !this._renameValue.trim()) return;
  const e = this._renamingGroup, t = this._renameValue.trim();
  e !== t && (this._groupOrder = this._groupOrder.map((i) => i === e ? t : i), this._rules = this._rules.map(
    (i) => i._groupName === e ? { ...i, _groupName: t } : i
  )), this._renamingGroup = null, this._renameValue = "";
};
T = function() {
  this._renamingGroup = null, this._renameValue = "";
};
me = function(e) {
  this._rules = this._rules.map(
    (t) => t._groupName === e ? { ...t, _groupName: p } : t
  ), this._groupOrder = this._groupOrder.filter((t) => t !== e), this._groupOrder.includes(p) || (this._groupOrder = [...this._groupOrder, p]);
};
ve = function(e, t) {
  const i = t.detail.rules, a = new Set(i.map((n) => n._id)), o = [];
  for (const n of this._groupOrder)
    n === e ? o.push(...i.map((l) => ({ ...l, _groupName: n }))) : o.push(...this._rules.filter((l) => l._groupName === n && !a.has(l._id)));
  this._rules = o;
};
be = function(e) {
  r(this, s, d).call(this, e, (t) => ({
    ...t,
    formats: [...t.formats ?? [], { type: "block", value: "auto" }]
  }));
};
xe = function(e, t) {
  r(this, s, d).call(this, e, (i) => ({
    ...i,
    formats: (i.formats ?? []).filter((a, o) => o !== t)
  }));
};
_e = function(e, t, i) {
  const a = i === "block" ? "auto" : "bold";
  r(this, s, d).call(this, e, (o) => {
    const n = [...o.formats ?? []];
    return n[t] = { type: i, value: a }, { ...o, formats: n };
  });
};
$e = function(e, t, i) {
  r(this, s, d).call(this, e, (a) => {
    const o = [...a.formats ?? []];
    return o[t] = { ...o[t], value: i }, { ...a, formats: o };
  });
};
ye = function(e) {
  r(this, s, d).call(this, e, (t) => ({
    ...t,
    conditions: [...t.conditions, { type: "textBeginsWith", value: "" }]
  }));
};
we = function(e, t) {
  r(this, s, d).call(this, e, (i) => ({
    ...i,
    conditions: i.conditions.filter((a, o) => o !== t)
  }));
};
Ce = function(e, t, i) {
  r(this, s, d).call(this, e, (a) => {
    const o = [...a.conditions];
    let n;
    return R.includes(i) ? n = void 0 : i === "fontSizeRange" ? n = { min: 0, max: 100 } : n = o[t].value, o[t] = { type: i, value: n }, { ...a, conditions: o };
  });
};
ze = function(e, t, i) {
  r(this, s, d).call(this, e, (a) => {
    const o = [...a.conditions], n = o[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return o[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...a, conditions: o };
  });
};
A = function(e, t, i, a) {
  r(this, s, d).call(this, e, (o) => {
    const n = [...o.conditions], l = n[t], f = l.value && typeof l.value == "object" ? l.value : { min: 0, max: 100 }, v = isNaN(Number(a)) ? 0 : Number(a);
    return n[t] = { ...l, value: { ...f, [i]: v } }, { ...o, conditions: n };
  });
};
ke = function(e) {
  r(this, s, d).call(this, e, (t) => ({
    ...t,
    exceptions: [...t.exceptions ?? [], { type: "textContains", value: "" }]
  }));
};
Se = function(e, t) {
  r(this, s, d).call(this, e, (i) => ({
    ...i,
    exceptions: (i.exceptions ?? []).filter((a, o) => o !== t)
  }));
};
Ee = function(e, t, i) {
  r(this, s, d).call(this, e, (a) => {
    const o = [...a.exceptions ?? []];
    return o[t] = {
      type: i,
      value: R.includes(i) ? void 0 : o[t].value
    }, { ...a, exceptions: o };
  });
};
Re = function(e, t, i) {
  r(this, s, d).call(this, e, (a) => {
    const o = [...a.exceptions ?? []], n = o[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return o[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...a, exceptions: o };
  });
};
Le = function(e) {
  r(this, s, d).call(this, e, (t) => ({
    ...t,
    textReplacements: [...t.textReplacements ?? [], { findType: "textBeginsWith", find: "", replaceType: "replaceWith", replace: "" }]
  }));
};
Oe = function(e, t) {
  r(this, s, d).call(this, e, (i) => ({
    ...i,
    textReplacements: (i.textReplacements ?? []).filter((a, o) => o !== t)
  }));
};
Ne = function(e, t, i) {
  r(this, s, d).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []], n = i === "textContains" ? "replaceAll" : "replaceWith";
    return o[t] = { ...o[t], findType: i, replaceType: n }, { ...a, textReplacements: o };
  });
};
Te = function(e, t, i) {
  r(this, s, d).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []];
    return o[t] = { ...o[t], find: i }, { ...a, textReplacements: o };
  });
};
Ae = function(e, t, i) {
  r(this, s, d).call(this, e, (a) => {
    const o = [...a.textReplacements ?? []];
    return o[t] = { ...o[t], replace: i }, { ...a, textReplacements: o };
  });
};
Pe = function(e) {
  const t = (e.formats ?? []).find((l) => l.type === "block"), { _id: i, _groupName: a, action: o, ...n } = e;
  return {
    ...n,
    format: t?.value ?? "auto"
  };
};
D = function() {
  this._renamingGroup && r(this, s, S).call(this);
  const e = [];
  let t = [];
  for (const i of this._groupOrder) {
    const a = this._rules.filter((o) => o._groupName === i).map((o) => r(this, s, Pe).call(this, o));
    i === p ? t = a : e.push({ name: i, rules: a });
  }
  return { groups: e, rules: t };
};
Ge = async function() {
  const e = r(this, s, D).call(this);
  this.data?.onSave && await this.data.onSave(e);
};
qe = function() {
  const e = r(this, s, D).call(this);
  this.value = { rules: e }, this.modalContext?.submit();
};
Be = function() {
  this.modalContext?.reject();
};
Me = function(e, t, i) {
  const a = R.includes(i.type), o = i.type === "fontSizeRange", n = o && i.value && typeof i.value == "object" ? i.value : { min: 0, max: 100 };
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(l) => r(this, s, Ce).call(this, e, t, l.target.value)}>
					${h(this, s, M).map((l) => u`
						<option value=${l} ?selected=${l === i.type}>${Ke[l]}</option>
					`)}
				</select>
				${o ? u`
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Min"
						.value=${String(n.min)}
						@input=${(l) => r(this, s, A).call(this, e, t, "min", l.target.value)} />
					<span class="range-separator">–</span>
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Max"
						.value=${String(n.max)}
						@input=${(l) => r(this, s, A).call(this, e, t, "max", l.target.value)} />
				` : a ? c : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(l) => r(this, s, ze).call(this, e, t, l.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove condition"
					@click=${() => r(this, s, we).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Fe = function(e, t, i) {
  const a = R.includes(i.type);
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(o) => r(this, s, Ee).call(this, e, t, o.target.value)}>
					${h(this, s, M).map((o) => u`
						<option value=${o} ?selected=${o === i.type}>${Ke[o]}</option>
					`)}
				</select>
				${a ? c : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(o) => r(this, s, Re).call(this, e, t, o.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove exception"
					@click=${() => r(this, s, Se).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Ve = function(e, t, i) {
  const a = i.type === "block" ? bt : _t, o = i.type === "block" ? vt : xt;
  return u`
			<div class="condition-row">
				<select
					class="format-type-select"
					.value=${i.type}
					@change=${(n) => r(this, s, _e).call(this, e, t, n.target.value)}>
					${mt.map((n) => u`
						<option value=${n} ?selected=${n === i.type}>${gt[n]}</option>
					`)}
				</select>
				<select
					class="format-value-select"
					.value=${i.value}
					@change=${(n) => r(this, s, $e).call(this, e, t, n.target.value)}>
					${a.map((n) => u`
						<option value=${n} ?selected=${n === i.value}>${o[n]}</option>
					`)}
				</select>
				<uui-button
					compact
					look="secondary"
					label="Remove format"
					@click=${() => r(this, s, xe).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
De = function(e, t, i) {
  const a = i.findType === "textContains" ? I.replaceAll : I.replaceWith;
  return u`
			<div class="find-replace-entry">
				<div class="condition-row">
					<select
						class="condition-type-select"
						.value=${i.findType}
						@change=${(o) => r(this, s, Ne).call(this, e, t, o.target.value)}>
						${yt.map((o) => u`
							<option value=${o} ?selected=${o === i.findType}>${$t[o]}</option>
						`)}
					</select>
					<input
						type="text"
						class="condition-value-input"
						placeholder="Find..."
						.value=${i.find}
						@input=${(o) => r(this, s, Te).call(this, e, t, o.target.value)} />
					<uui-button
						compact
						look="secondary"
						label="Remove replacement"
						@click=${() => r(this, s, Oe).call(this, e, t)}>
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
						@input=${(o) => r(this, s, Ae).call(this, e, t, o.target.value)} />
				</div>
			</div>
		`;
};
We = function(e, t) {
  return r(this, s, J).call(this, e._id) ? r(this, s, He).call(this, e, t) : r(this, s, Ue).call(this, e, t);
};
Ue = function(e, t) {
  const i = e.exclude, a = e.part ?? "content", o = i ? "Exclude" : je[a] ?? a, n = t.length, l = e.role || "(unnamed rule)";
  return u`
			<div class="rule-row" @click=${() => r(this, s, k).call(this, e._id)}>
				<span class="rule-grip" title="Drag to reorder" @click=${(f) => f.stopPropagation()}>⠿</span>
				<span class="rule-row-name">${l}</span>
				<span class="rule-row-part ${i ? "excluded" : ""}">${o}</span>
				${n > 0 ? u`<span class="rule-row-match ${i ? "excluded" : "matched"}">${n}&times;</span>` : u`<span class="rule-row-match no-match">0</span>`}
				<uui-action-bar class="rule-row-actions"
					@click=${(f) => f.stopPropagation()}>
					<uui-button pristine look="primary" label="Edit rule"
						@click=${() => r(this, s, k).call(this, e._id)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete rule"
						@click=${() => r(this, s, V).call(this, e._id)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
He = function(e, t) {
  const i = e.exclude, a = e.part ?? "content", o = e._id;
  return u`
			<div class="rule-card">
				<div class="rule-header">
					<uui-icon class="rule-row-chevron expanded" name="icon-navigation-down"
						@click=${() => r(this, s, k).call(this, o)}
						style="cursor:pointer"></uui-icon>
					<input
						type="text"
						class="role-name-input"
						placeholder="Section name (e.g. tour-title)"
						.value=${e.role}
						@input=${(n) => r(this, s, ce).call(this, o, n.target.value)} />
					<uui-button
						compact
						look="secondary"
						color="danger"
						label="Remove rule"
						@click=${() => r(this, s, V).call(this, o)}>
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
    r(this, s, he).call(this, o, l);
  }}>
						${this._groupOrder.map((n) => u`
							<option value=${n} ?selected=${n === e._groupName}>${n}</option>
						`)}
					</select>
				</div>
				` : c}

				<div class="conditions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "conditions", o)}>
						<uui-icon name=${r(this, s, g).call(this, "conditions", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Conditions${e.conditions.length > 0 ? ` (${e.conditions.length})` : ""}
					</div>
					${r(this, s, g).call(this, "conditions", o) ? u`
						${e.conditions.map((n, l) => r(this, s, Me).call(this, o, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add condition"
							@click=${() => r(this, s, ye).call(this, o)}>
							+ Add condition
						</uui-button>
					` : c}
				</div>

				<div class="exceptions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "exceptions", o)}>
						<uui-icon name=${r(this, s, g).call(this, "exceptions", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Exceptions${(e.exceptions ?? []).length > 0 ? ` (${(e.exceptions ?? []).length})` : ""}
					</div>
					${r(this, s, g).call(this, "exceptions", o) ? u`
						${(e.exceptions ?? []).map((n, l) => r(this, s, Fe).call(this, o, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add exception"
							@click=${() => r(this, s, ke).call(this, o)}>
							+ Add exception
						</uui-button>
					` : c}
				</div>

				<div class="part-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "part", o)}>
						<uui-icon name=${r(this, s, g).call(this, "part", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Part
					</div>
					${r(this, s, g).call(this, "part", o) ? u`
						<div class="part-controls">
							<select
								class="part-select"
								.value=${a}
								?disabled=${i}
								@change=${(n) => r(this, s, de).call(this, o, n.target.value)}>
								${ft.map((n) => u`
									<option value=${n} ?selected=${n === a}>${je[n]}</option>
								`)}
							</select>
							<label class="exclude-label">
								<input
									type="checkbox"
									.checked=${i}
									@change=${(n) => r(this, s, pe).call(this, o, n.target.checked)} />
								Exclude
							</label>
						</div>
					` : c}
				</div>

				${i ? c : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "format", o)}>
						<uui-icon name=${r(this, s, g).call(this, "format", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Format${(e.formats ?? []).length > 0 ? ` (${(e.formats ?? []).length})` : ""}
					</div>
					${r(this, s, g).call(this, "format", o) ? u`
						${(e.formats ?? []).map((n, l) => r(this, s, Ve).call(this, o, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add format"
							@click=${() => r(this, s, be).call(this, o)}>
							+ Add format
						</uui-button>
					` : c}
				</div>
				`}

				${i ? c : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "findReplace", o)}>
						<uui-icon name=${r(this, s, g).call(this, "findReplace", o) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Find &amp; Replace${(e.textReplacements ?? []).length > 0 ? ` (${(e.textReplacements ?? []).length})` : ""}
					</div>
					${r(this, s, g).call(this, "findReplace", o) ? u`
						${(e.textReplacements ?? []).map((n, l) => r(this, s, De).call(this, o, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add find & replace"
							@click=${() => r(this, s, Le).call(this, o)}>
							+ Add find &amp; replace
						</uui-button>
					` : c}
				</div>
				`}

				<div class="match-preview ${t.length > 0 ? i ? "excluded" : "matched" : "no-match"}">
					${t.length > 0 ? u`<uui-icon name=${i ? "icon-block" : "icon-check"}></uui-icon> ${i ? "Excluded" : "Matched"} <strong>${t.length}&times;</strong>${t.length <= 5 ? u`: ${t.map((n, l) => u`${l > 0 ? u`, ` : c}<strong>${r(this, s, W).call(this, n.text, 40)}</strong>`)}` : c}` : u`<uui-icon name="icon-alert"></uui-icon> ${e.conditions.length === 0 ? "Add conditions to match elements" : "No match"}`}
				</div>
			</div>
		`;
};
W = function(e, t) {
  return e.length > t ? e.substring(0, t) + "..." : e;
};
Ie = function(e) {
  const t = r(this, s, B).call(this, e);
  return e === p ? u`
				<div class="group-header" @click=${() => r(this, s, O).call(this, e)} style="cursor: pointer;">
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
    i.key === "Enter" && r(this, s, S).call(this), i.key === "Escape" && r(this, s, T).call(this);
  }} />
					<uui-button compact look="primary" label="Confirm" @click=${() => r(this, s, S).call(this)}>
						<uui-icon name="icon-check"></uui-icon>
					</uui-button>
					<uui-button compact look="secondary" label="Cancel" @click=${() => r(this, s, T).call(this)}>
						<uui-icon name="icon-wrong"></uui-icon>
					</uui-button>
				</div>
			` : u`
			<div class="group-header" @click=${() => r(this, s, O).call(this, e)} style="cursor: pointer;">
				<uui-symbol-expand .open=${!t}></uui-symbol-expand>
				<strong class="group-name">${e}</strong>
				<span class="header-spacer"></span>
				<uui-action-bar class="group-header-actions" @click=${(i) => i.stopPropagation()}>
					<uui-button pristine look="primary" label="Rename" @click=${() => r(this, s, ge).call(this, e)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete group"
						title="Delete group (rules move to ungrouped)"
						@click=${() => r(this, s, me).call(this, e)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
Ye = function(e) {
  const t = h(this, s, _), i = t.filter((a) => !e.has(a.id));
  return i.length === 0 ? c : u`
			<div class="unmatched-section">
				<h4>Unmatched elements (${i.length})</h4>
				${i.map((a) => {
    const o = t.indexOf(a);
    return u`
						<div class="unmatched-element">
							<div class="unmatched-text">${r(this, s, W).call(this, a.text, 80)}</div>
							<div class="unmatched-meta">
								${h(this, s, E) === "web" ? u`
										${a.htmlTag ? u`<span class="meta-badge tag-badge">&lt;${a.htmlTag}&gt;</span>` : c}
										<span class="meta-badge">${a.fontSize}pt</span>
										${a.isBold ? u`<span class="meta-badge tag-badge"><b>B</b></span>` : c}
										${a.cssClasses ? u`<span class="meta-badge class-badge">.${a.cssClasses.split(" ")[0]}</span>` : c}
										${a.color !== "#000000" ? u`<span class="meta-badge" style="border-left: 3px solid ${a.color};">${a.color}</span>` : c}
									` : u`
										<span class="meta-badge">${a.fontSize}pt</span>
										<span class="meta-badge">${a.fontName}</span>
										${a.color !== "#000000" ? u`<span class="meta-badge" style="border-left: 3px solid ${a.color};">${a.color}</span>` : c}
									`}
							</div>
							<uui-button
								compact
								look="outline"
								label="Define rule from this"
								@click=${() => r(this, s, ue).call(this, a, o)}>
								Define rule
							</uui-button>
						</div>
					`;
  })}
			</div>
		`;
};
m.styles = [
  ot,
  K,
  P`
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
], m.prototype, "_rules", 2);
x([
  b()
], m.prototype, "_groupOrder", 2);
x([
  b()
], m.prototype, "_expandedSections", 2);
x([
  b()
], m.prototype, "_expandedRules", 2);
x([
  b()
], m.prototype, "_collapsedGroups", 2);
x([
  b()
], m.prototype, "_renamingGroup", 2);
x([
  b()
], m.prototype, "_renameValue", 2);
m = x([
  Y("up-doc-section-rules-editor-modal")
], m);
const Lt = m;
export {
  m as UpDocSectionRulesEditorModalElement,
  Lt as default
};
//# sourceMappingURL=section-rules-editor-modal.element-DJGUq3k-.js.map
