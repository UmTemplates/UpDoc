import { g as Ue, b as He } from "./workflow.types-CVkhzFGj.js";
import { UmbSorterController as Ye } from "@umbraco-cms/backoffice/sorter";
import { css as N, property as T, state as b, customElement as W, nothing as d, repeat as Ke, html as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as je } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as Qe } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as Ie } from "@umbraco-cms/backoffice/style";
const D = N`
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
var Je = Object.defineProperty, Xe = Object.getOwnPropertyDescriptor, U = (e) => {
  throw TypeError(e);
}, y = (e, t, i, o) => {
  for (var a = o > 1 ? void 0 : o ? Xe(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (a = (o ? l(t, i, a) : l(a)) || a);
  return o && a && Je(t, i, a), a;
}, Ze = (e, t, i) => t.has(e) || U("Cannot " + i), et = (e, t, i) => (Ze(e, t, "read from private field"), i ? i.call(e) : t.get(e)), tt = (e, t, i) => t.has(e) ? U("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), S;
let g = class extends je {
  constructor() {
    super(...arguments), tt(this, S, new Ye(this, {
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
    this._rules = e, et(this, S).setModel(e);
  }
  get rules() {
    return this._rules;
  }
  render() {
    return this._rules.length === 0 && !this.renderItem ? d : u`
			<div class="rules-container">
				${Ke(
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
S = /* @__PURE__ */ new WeakMap();
g.styles = [
  D,
  N`
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
y([
  T({ attribute: !1 })
], g.prototype, "rules", 1);
y([
  b()
], g.prototype, "_rules", 2);
y([
  T({ attribute: !1 })
], g.prototype, "expandedIds", 2);
y([
  T({ attribute: !1 })
], g.prototype, "renderItem", 2);
g = y([
  W("updoc-sortable-rules")
], g);
var it = Object.defineProperty, at = Object.getOwnPropertyDescriptor, H = (e) => {
  throw TypeError(e);
}, x = (e, t, i, o) => {
  for (var a = o > 1 ? void 0 : o ? at(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (a = (o ? l(t, i, a) : l(a)) || a);
  return o && a && it(t, i, a), a;
}, Y = (e, t, i) => t.has(e) || H("Cannot " + i), p = (e, t, i) => (Y(e, t, "read from private field"), i ? i.call(e) : t.get(e)), ot = (e, t, i) => t.has(e) ? H("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (Y(e, t, "access private method"), i), s, f, _, K, w, O, R, m, C, A, j, Q, I, J, P, X, Z, ee, c, te, B, ie, ae, oe, se, ne, re, le, z, E, ue, ce, de, pe, he, fe, ve, me, ge, be, L, xe, _e, $e, ye, we, ze, Ce, ke, Se, Re, q, Ee, Le, Ne, Te, Oe, Ae, Pe, Be, qe, Fe, F, Me, Ve;
let st = 0;
function M() {
  return `r-${++st}`;
}
const Ge = {
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
  isBoldEquals: "Is bold"
}, k = ["positionFirst", "positionLast", "isBoldEquals"], V = [
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
  "isBoldEquals"
], We = {
  title: "Title",
  content: "Content",
  description: "Description",
  summary: "Summary"
}, nt = ["title", "content", "description", "summary"], rt = {
  block: "Block",
  style: "Style"
}, lt = ["block", "style"], ut = {
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
}, ct = [
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
], dt = {
  bold: "Bold",
  italic: "Italic",
  strikethrough: "Strikethrough",
  code: "Code",
  highlight: "Highlight"
}, pt = ["bold", "italic", "strikethrough", "code", "highlight"], h = "Ungrouped", ht = {
  textBeginsWith: "Text begins with",
  textEndsWith: "Text ends with",
  textContains: "Text contains"
}, ft = ["textBeginsWith", "textEndsWith", "textContains"], G = {
  replaceWith: "Replace with",
  replaceAll: "Replace all with"
};
let v = class extends Qe {
  constructor() {
    super(...arguments), ot(this, s), this._rules = [], this._groupOrder = [], this._expandedSections = /* @__PURE__ */ new Set(), this._expandedRules = /* @__PURE__ */ new Set(), this._renamingGroup = null, this._renameValue = "";
  }
  firstUpdated() {
    const e = this.data?.existingRules;
    if (!e) return;
    const t = [], i = [];
    for (const a of e.groups ?? []) {
      i.push(a.name);
      for (const n of a.rules)
        t.push(r(this, s, R).call(this, n, a.name));
    }
    const o = e.rules ?? [];
    if (o.length > 0) {
      i.push(h);
      for (const a of o)
        t.push(r(this, s, R).call(this, a, h));
    }
    this._rules = t, this._groupOrder = i;
  }
  render() {
    const e = r(this, s, I).call(this), t = /* @__PURE__ */ new Map();
    for (const [o, a] of e) {
      const n = p(this, s, m).find((l) => l.id === o);
      if (n) {
        const l = t.get(a) ?? [];
        l.push(n), t.set(a, l);
      }
    }
    const i = p(this, s, Q);
    return u`
			<umb-body-layout headline="Edit Sections: ${p(this, s, j)}">
				<div id="main">
					<div class="section-info">
						${this.data?.sectionCount != null ? u`<span class="meta-badge">${this.data.sectionCount} section${this.data.sectionCount !== 1 ? "s" : ""}</span>` : d}
						<span class="meta-badge">${p(this, s, m).length} elements</span>
						<span class="meta-badge">${this._rules.length} rules</span>
						<span class="meta-badge">${e.size} matched</span>
						<span class="meta-badge">${p(this, s, m).length - e.size} unmatched</span>
						${(() => {
      const o = this._groupOrder.filter((a) => a !== h).length;
      return o > 0 ? u`<span class="meta-badge">${o} group${o !== 1 ? "s" : ""}</span>` : d;
    })()}
					</div>

					${i.map((o) => {
      const a = (n) => r(this, s, Be).call(this, n, t.get(n._id) ?? []);
      return u`
							<div class="group-container">
								${r(this, s, Me).call(this, o.group)}
								<div class="group-rules">
									<updoc-sortable-rules
										.rules=${o.rules}
										.expandedIds=${this._expandedRules}
										.renderItem=${a}
										@sort-change=${(n) => r(this, s, ce).call(this, o.group, n)}
									></updoc-sortable-rules>
									<uui-button
										look="placeholder"
										label="Add rule to ${o.group}"
										@click=${() => r(this, s, te).call(this, o.group)}>
										+ Add rule
									</uui-button>
								</div>
							</div>
						`;
    })}

					<uui-button
						look="outline"
						label="Add group"
						@click=${() => r(this, s, re).call(this)}>
						<uui-icon name="icon-add"></uui-icon>
						Add group
					</uui-button>

					${r(this, s, Ve).call(this, e)}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${r(this, s, Ne)}>Close</uui-button>
					<uui-button
						label="Save"
						look="secondary"
						@click=${r(this, s, Ee)}>
						Save
					</uui-button>
					<uui-button
						label="Save and Close"
						look="primary"
						color="positive"
						@click=${r(this, s, Le)}>
						Save and Close
					</uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
s = /* @__PURE__ */ new WeakSet();
f = function(e, t) {
  return this._expandedSections.has(`${e}-${t}`);
};
_ = function(e, t) {
  const i = `${e}-${t}`, o = new Set(this._expandedSections);
  o.has(i) ? o.delete(i) : o.add(i), this._expandedSections = o;
};
K = function(e) {
  return this._expandedRules.has(e);
};
w = function(e) {
  const t = new Set(this._expandedRules);
  t.has(e) ? t.delete(e) : t.add(e), this._expandedRules = t;
};
O = function(e) {
  if (!this._expandedRules.has(e)) {
    const t = new Set(this._expandedRules);
    t.add(e), this._expandedRules = t;
  }
};
R = function(e, t) {
  let i = e.part, o = e.exclude ?? !1;
  if (!i && !o) {
    const n = Ue(e);
    n === "exclude" ? o = !0 : i = n;
  }
  let a = e.formats;
  return (!a || a.length === 0) && (a = [{ type: "block", value: e.format ?? He(e) }]), {
    ...e,
    part: i,
    exclude: o,
    formats: a,
    _id: M(),
    _groupName: t
  };
};
m = function() {
  return this.data?.elements ?? [];
};
C = function() {
  return this.data?.sourceType ?? "pdf";
};
A = function() {
  if (p(this, s, C) === "web") {
    const e = ["htmlTagEquals", "cssClassContains", "htmlContainerPathContains"];
    return [...e, ...V.filter((t) => !e.includes(t))];
  }
  return V;
};
j = function() {
  return this.data?.sectionHeading ?? "Section";
};
Q = function() {
  const e = [];
  for (const t of this._groupOrder)
    e.push({
      group: t,
      rules: this._rules.filter((i) => i._groupName === t)
    });
  return e;
};
I = function() {
  const e = /* @__PURE__ */ new Map(), t = p(this, s, m);
  for (const i of this._rules)
    if (i.conditions.length !== 0)
      for (let o = 0; o < t.length; o++) {
        const a = t[o];
        if (!e.has(a.id) && r(this, s, J).call(this, a, i.conditions, o, t.length)) {
          if (i.exceptions?.length && i.exceptions.some(
            (l) => r(this, s, P).call(this, a, l, o, t.length)
          ))
            continue;
          e.set(a.id, i._id);
        }
      }
  return e;
};
J = function(e, t, i, o) {
  return t.every((a) => r(this, s, P).call(this, e, a, i, o));
};
P = function(e, t, i, o) {
  const a = String(t.value ?? ""), n = Number(t.value);
  switch (t.type) {
    case "textBeginsWith":
      return e.text.toLowerCase().startsWith(a.toLowerCase());
    case "textEndsWith":
      return e.text.toLowerCase().endsWith(a.toLowerCase());
    case "textContains":
      return e.text.toLowerCase().includes(a.toLowerCase());
    case "textMatchesPattern":
      try {
        return new RegExp(a, "i").test(e.text);
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
      return e.fontName.toLowerCase().includes(a.toLowerCase());
    case "colorEquals":
      return e.color.toLowerCase() === a.toLowerCase();
    case "positionFirst":
      return i === 0;
    case "positionLast":
      return i === o - 1;
    case "htmlTagEquals":
      return (e.htmlTag ?? "").toLowerCase() === a.toLowerCase();
    case "cssClassContains":
      return (e.cssClasses ?? "").toLowerCase().includes(a.toLowerCase());
    case "htmlContainerPathContains":
      return (e.htmlContainerPath ?? "").toLowerCase().includes(a.toLowerCase());
    case "isBoldEquals":
      return e.isBold === !0;
    default:
      return !1;
  }
};
X = function(e, t, i) {
  return p(this, s, C) === "web" ? r(this, s, Z).call(this, e) : r(this, s, ee).call(this, e, t, i);
};
Z = function(e) {
  const t = [];
  if (e.htmlTag && t.push({ type: "htmlTagEquals", value: e.htmlTag }), e.fontSize > 0 && t.push({ type: "fontSizeEquals", value: e.fontSize }), e.cssClasses) {
    const i = e.cssClasses.split(" ")[0];
    i && t.push({ type: "cssClassContains", value: i });
  }
  if (e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && t.push({ type: "colorEquals", value: e.color }), e.htmlContainerPath) {
    const i = e.htmlContainerPath.split("/"), o = i[i.length - 1];
    o && t.push({ type: "htmlContainerPathContains", value: o });
  }
  return e.isBold && t.push({ type: "isBoldEquals", value: "true" }), t;
};
ee = function(e, t, i) {
  const o = [];
  if (o.push({ type: "fontSizeEquals", value: e.fontSize }), e.fontName) {
    const n = e.fontName.includes("+") ? e.fontName.substring(e.fontName.indexOf("+") + 1) : e.fontName;
    o.push({ type: "fontNameContains", value: n });
  }
  e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && o.push({ type: "colorEquals", value: e.color });
  const a = e.text.indexOf(":");
  return a > 0 && a < 30 && o.push({ type: "textBeginsWith", value: e.text.substring(0, a + 1) }), t === 0 ? o.push({ type: "positionFirst" }) : t === i - 1 && o.push({ type: "positionLast" }), o;
};
c = function(e, t) {
  this._rules = this._rules.map((i) => i._id === e ? t(i) : i);
};
te = function(e = h) {
  this._groupOrder.includes(e) || (this._groupOrder = [...this._groupOrder, e]);
  const t = M();
  this._rules = [...this._rules, {
    role: "",
    part: "content",
    conditions: [],
    formats: [{ type: "block", value: "auto" }],
    _id: t,
    _groupName: e
  }], r(this, s, O).call(this, t);
};
B = function(e) {
  this._rules = this._rules.filter((t) => t._id !== e);
};
ie = function(e, t) {
  const i = r(this, s, X).call(this, e, t, p(this, s, m).length), o = e.text.split(/[\s:,]+/).slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, ""), a = M();
  this._groupOrder.includes(h) || (this._groupOrder = [...this._groupOrder, h]), this._rules = [...this._rules, {
    role: o,
    part: "content",
    conditions: i,
    formats: [{ type: "block", value: "auto" }],
    _id: a,
    _groupName: h
  }], r(this, s, O).call(this, a);
};
ae = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({ ...i, role: t }));
};
oe = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({ ...i, part: t }));
};
se = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({ ...i, exclude: t }));
};
ne = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({ ...i, _groupName: t }));
};
re = function() {
  let e = "New Group", t = 1;
  for (; this._groupOrder.includes(e); )
    e = `New Group ${++t}`;
  this._groupOrder = [...this._groupOrder, e], this._renamingGroup = e, this._renameValue = e;
};
le = function(e) {
  this._renamingGroup = e, this._renameValue = e;
};
z = function() {
  if (!this._renamingGroup || !this._renameValue.trim()) return;
  const e = this._renamingGroup, t = this._renameValue.trim();
  e !== t && (this._groupOrder = this._groupOrder.map((i) => i === e ? t : i), this._rules = this._rules.map(
    (i) => i._groupName === e ? { ...i, _groupName: t } : i
  )), this._renamingGroup = null, this._renameValue = "";
};
E = function() {
  this._renamingGroup = null, this._renameValue = "";
};
ue = function(e) {
  this._rules = this._rules.map(
    (t) => t._groupName === e ? { ...t, _groupName: h } : t
  ), this._groupOrder = this._groupOrder.filter((t) => t !== e), this._groupOrder.includes(h) || (this._groupOrder = [...this._groupOrder, h]);
};
ce = function(e, t) {
  const i = t.detail.rules, o = new Set(i.map((n) => n._id)), a = [];
  for (const n of this._groupOrder)
    n === e ? a.push(...i.map((l) => ({ ...l, _groupName: n }))) : a.push(...this._rules.filter((l) => l._groupName === n && !o.has(l._id)));
  this._rules = a;
};
de = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    formats: [...t.formats ?? [], { type: "block", value: "auto" }]
  }));
};
pe = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({
    ...i,
    formats: (i.formats ?? []).filter((o, a) => a !== t)
  }));
};
he = function(e, t, i) {
  const o = i === "block" ? "auto" : "bold";
  r(this, s, c).call(this, e, (a) => {
    const n = [...a.formats ?? []];
    return n[t] = { type: i, value: o }, { ...a, formats: n };
  });
};
fe = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.formats ?? []];
    return a[t] = { ...a[t], value: i }, { ...o, formats: a };
  });
};
ve = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    conditions: [...t.conditions, { type: "textBeginsWith", value: "" }]
  }));
};
me = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({
    ...i,
    conditions: i.conditions.filter((o, a) => a !== t)
  }));
};
ge = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.conditions];
    let n;
    return k.includes(i) ? n = void 0 : i === "fontSizeRange" ? n = { min: 0, max: 100 } : n = a[t].value, a[t] = { type: i, value: n }, { ...o, conditions: a };
  });
};
be = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.conditions], n = a[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return a[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...o, conditions: a };
  });
};
L = function(e, t, i, o) {
  r(this, s, c).call(this, e, (a) => {
    const n = [...a.conditions], l = n[t], $ = l.value && typeof l.value == "object" ? l.value : { min: 0, max: 100 }, De = isNaN(Number(o)) ? 0 : Number(o);
    return n[t] = { ...l, value: { ...$, [i]: De } }, { ...a, conditions: n };
  });
};
xe = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    exceptions: [...t.exceptions ?? [], { type: "textContains", value: "" }]
  }));
};
_e = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({
    ...i,
    exceptions: (i.exceptions ?? []).filter((o, a) => a !== t)
  }));
};
$e = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.exceptions ?? []];
    return a[t] = {
      type: i,
      value: k.includes(i) ? void 0 : a[t].value
    }, { ...o, exceptions: a };
  });
};
ye = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.exceptions ?? []], n = a[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return a[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...o, exceptions: a };
  });
};
we = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    textReplacements: [...t.textReplacements ?? [], { findType: "textBeginsWith", find: "", replaceType: "replaceWith", replace: "" }]
  }));
};
ze = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({
    ...i,
    textReplacements: (i.textReplacements ?? []).filter((o, a) => a !== t)
  }));
};
Ce = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.textReplacements ?? []], n = i === "textContains" ? "replaceAll" : "replaceWith";
    return a[t] = { ...a[t], findType: i, replaceType: n }, { ...o, textReplacements: a };
  });
};
ke = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.textReplacements ?? []];
    return a[t] = { ...a[t], find: i }, { ...o, textReplacements: a };
  });
};
Se = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.textReplacements ?? []];
    return a[t] = { ...a[t], replace: i }, { ...o, textReplacements: a };
  });
};
Re = function(e) {
  const t = (e.formats ?? []).find((l) => l.type === "block"), { _id: i, _groupName: o, action: a, ...n } = e;
  return {
    ...n,
    format: t?.value ?? "auto"
  };
};
q = function() {
  this._renamingGroup && r(this, s, z).call(this);
  const e = [];
  let t = [];
  for (const i of this._groupOrder) {
    const o = this._rules.filter((a) => a._groupName === i).map((a) => r(this, s, Re).call(this, a));
    i === h ? t = o : e.push({ name: i, rules: o });
  }
  return { groups: e, rules: t };
};
Ee = async function() {
  const e = r(this, s, q).call(this);
  this.data?.onSave && await this.data.onSave(e);
};
Le = function() {
  const e = r(this, s, q).call(this);
  this.value = { rules: e }, this.modalContext?.submit();
};
Ne = function() {
  this.modalContext?.reject();
};
Te = function(e, t, i) {
  const o = k.includes(i.type), a = i.type === "fontSizeRange", n = a && i.value && typeof i.value == "object" ? i.value : { min: 0, max: 100 };
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(l) => r(this, s, ge).call(this, e, t, l.target.value)}>
					${p(this, s, A).map((l) => u`
						<option value=${l} ?selected=${l === i.type}>${Ge[l]}</option>
					`)}
				</select>
				${a ? u`
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Min"
						.value=${String(n.min)}
						@input=${(l) => r(this, s, L).call(this, e, t, "min", l.target.value)} />
					<span class="range-separator">–</span>
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Max"
						.value=${String(n.max)}
						@input=${(l) => r(this, s, L).call(this, e, t, "max", l.target.value)} />
				` : o ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(l) => r(this, s, be).call(this, e, t, l.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove condition"
					@click=${() => r(this, s, me).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Oe = function(e, t, i) {
  const o = k.includes(i.type);
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(a) => r(this, s, $e).call(this, e, t, a.target.value)}>
					${p(this, s, A).map((a) => u`
						<option value=${a} ?selected=${a === i.type}>${Ge[a]}</option>
					`)}
				</select>
				${o ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(a) => r(this, s, ye).call(this, e, t, a.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove exception"
					@click=${() => r(this, s, _e).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Ae = function(e, t, i) {
  const o = i.type === "block" ? ct : pt, a = i.type === "block" ? ut : dt;
  return u`
			<div class="condition-row">
				<select
					class="format-type-select"
					.value=${i.type}
					@change=${(n) => r(this, s, he).call(this, e, t, n.target.value)}>
					${lt.map((n) => u`
						<option value=${n} ?selected=${n === i.type}>${rt[n]}</option>
					`)}
				</select>
				<select
					class="format-value-select"
					.value=${i.value}
					@change=${(n) => r(this, s, fe).call(this, e, t, n.target.value)}>
					${o.map((n) => u`
						<option value=${n} ?selected=${n === i.value}>${a[n]}</option>
					`)}
				</select>
				<uui-button
					compact
					look="secondary"
					label="Remove format"
					@click=${() => r(this, s, pe).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Pe = function(e, t, i) {
  const o = i.findType === "textContains" ? G.replaceAll : G.replaceWith;
  return u`
			<div class="find-replace-entry">
				<div class="condition-row">
					<select
						class="condition-type-select"
						.value=${i.findType}
						@change=${(a) => r(this, s, Ce).call(this, e, t, a.target.value)}>
						${ft.map((a) => u`
							<option value=${a} ?selected=${a === i.findType}>${ht[a]}</option>
						`)}
					</select>
					<input
						type="text"
						class="condition-value-input"
						placeholder="Find..."
						.value=${i.find}
						@input=${(a) => r(this, s, ke).call(this, e, t, a.target.value)} />
					<uui-button
						compact
						look="secondary"
						label="Remove replacement"
						@click=${() => r(this, s, ze).call(this, e, t)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</div>
				<div class="condition-row">
					<span class="replace-label">${o}</span>
					<input
						type="text"
						class="condition-value-input"
						placeholder="(empty = remove)"
						.value=${i.replace}
						@input=${(a) => r(this, s, Se).call(this, e, t, a.target.value)} />
				</div>
			</div>
		`;
};
Be = function(e, t) {
  return r(this, s, K).call(this, e._id) ? r(this, s, Fe).call(this, e, t) : r(this, s, qe).call(this, e, t);
};
qe = function(e, t) {
  const i = e.exclude, o = e.part ?? "content", a = i ? "Exclude" : We[o] ?? o, n = t.length, l = e.role || "(unnamed rule)";
  return u`
			<div class="rule-row" @click=${() => r(this, s, w).call(this, e._id)}>
				<span class="rule-grip" title="Drag to reorder" @click=${($) => $.stopPropagation()}>⠿</span>
				<span class="rule-row-name">${l}</span>
				<span class="rule-row-part ${i ? "excluded" : ""}">${a}</span>
				${n > 0 ? u`<span class="rule-row-match ${i ? "excluded" : "matched"}">${n}&times;</span>` : u`<span class="rule-row-match no-match">0</span>`}
				<uui-action-bar class="rule-row-actions"
					@click=${($) => $.stopPropagation()}>
					<uui-button pristine look="primary" label="Edit rule"
						@click=${() => r(this, s, w).call(this, e._id)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete rule"
						@click=${() => r(this, s, B).call(this, e._id)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
Fe = function(e, t) {
  const i = e.exclude, o = e.part ?? "content", a = e._id;
  return u`
			<div class="rule-card">
				<div class="rule-header">
					<uui-icon class="rule-row-chevron expanded" name="icon-navigation-down"
						@click=${() => r(this, s, w).call(this, a)}
						style="cursor:pointer"></uui-icon>
					<input
						type="text"
						class="role-name-input"
						placeholder="Section name (e.g. tour-title)"
						.value=${e.role}
						@input=${(n) => r(this, s, ae).call(this, a, n.target.value)} />
					<uui-button
						compact
						look="secondary"
						color="danger"
						label="Remove rule"
						@click=${() => r(this, s, B).call(this, a)}>
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
    r(this, s, ne).call(this, a, l);
  }}>
						${this._groupOrder.map((n) => u`
							<option value=${n} ?selected=${n === e._groupName}>${n}</option>
						`)}
					</select>
				</div>
				` : d}

				<div class="conditions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, _).call(this, "conditions", a)}>
						<uui-icon name=${r(this, s, f).call(this, "conditions", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Conditions${e.conditions.length > 0 ? ` (${e.conditions.length})` : ""}
					</div>
					${r(this, s, f).call(this, "conditions", a) ? u`
						${e.conditions.map((n, l) => r(this, s, Te).call(this, a, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add condition"
							@click=${() => r(this, s, ve).call(this, a)}>
							+ Add condition
						</uui-button>
					` : d}
				</div>

				<div class="exceptions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, _).call(this, "exceptions", a)}>
						<uui-icon name=${r(this, s, f).call(this, "exceptions", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Exceptions${(e.exceptions ?? []).length > 0 ? ` (${(e.exceptions ?? []).length})` : ""}
					</div>
					${r(this, s, f).call(this, "exceptions", a) ? u`
						${(e.exceptions ?? []).map((n, l) => r(this, s, Oe).call(this, a, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add exception"
							@click=${() => r(this, s, xe).call(this, a)}>
							+ Add exception
						</uui-button>
					` : d}
				</div>

				<div class="part-area">
					<div class="section-header collapsible" @click=${() => r(this, s, _).call(this, "part", a)}>
						<uui-icon name=${r(this, s, f).call(this, "part", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Part
					</div>
					${r(this, s, f).call(this, "part", a) ? u`
						<div class="part-controls">
							<select
								class="part-select"
								.value=${o}
								?disabled=${i}
								@change=${(n) => r(this, s, oe).call(this, a, n.target.value)}>
								${nt.map((n) => u`
									<option value=${n} ?selected=${n === o}>${We[n]}</option>
								`)}
							</select>
							<label class="exclude-label">
								<input
									type="checkbox"
									.checked=${i}
									@change=${(n) => r(this, s, se).call(this, a, n.target.checked)} />
								Exclude
							</label>
						</div>
					` : d}
				</div>

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, _).call(this, "format", a)}>
						<uui-icon name=${r(this, s, f).call(this, "format", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Format${(e.formats ?? []).length > 0 ? ` (${(e.formats ?? []).length})` : ""}
					</div>
					${r(this, s, f).call(this, "format", a) ? u`
						${(e.formats ?? []).map((n, l) => r(this, s, Ae).call(this, a, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add format"
							@click=${() => r(this, s, de).call(this, a)}>
							+ Add format
						</uui-button>
					` : d}
				</div>
				`}

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, _).call(this, "findReplace", a)}>
						<uui-icon name=${r(this, s, f).call(this, "findReplace", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Find &amp; Replace${(e.textReplacements ?? []).length > 0 ? ` (${(e.textReplacements ?? []).length})` : ""}
					</div>
					${r(this, s, f).call(this, "findReplace", a) ? u`
						${(e.textReplacements ?? []).map((n, l) => r(this, s, Pe).call(this, a, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add find & replace"
							@click=${() => r(this, s, we).call(this, a)}>
							+ Add find &amp; replace
						</uui-button>
					` : d}
				</div>
				`}

				<div class="match-preview ${t.length > 0 ? i ? "excluded" : "matched" : "no-match"}">
					${t.length > 0 ? u`<uui-icon name=${i ? "icon-block" : "icon-check"}></uui-icon> ${i ? "Excluded" : "Matched"} <strong>${t.length}&times;</strong>${t.length <= 5 ? u`: ${t.map((n, l) => u`${l > 0 ? u`, ` : d}<strong>${r(this, s, F).call(this, n.text, 40)}</strong>`)}` : d}` : u`<uui-icon name="icon-alert"></uui-icon> ${e.conditions.length === 0 ? "Add conditions to match elements" : "No match"}`}
				</div>
			</div>
		`;
};
F = function(e, t) {
  return e.length > t ? e.substring(0, t) + "..." : e;
};
Me = function(e) {
  return e === h ? u`
				<div class="group-header">
					<strong class="group-name">${e}</strong>
				</div>
			` : this._renamingGroup === e ? u`
				<div class="group-header">
					<input
						type="text"
						class="group-rename-input"
						.value=${this._renameValue}
						@input=${(t) => {
    this._renameValue = t.target.value;
  }}
						@keydown=${(t) => {
    t.key === "Enter" && r(this, s, z).call(this), t.key === "Escape" && r(this, s, E).call(this);
  }} />
					<uui-button compact look="primary" label="Confirm" @click=${() => r(this, s, z).call(this)}>
						<uui-icon name="icon-check"></uui-icon>
					</uui-button>
					<uui-button compact look="secondary" label="Cancel" @click=${() => r(this, s, E).call(this)}>
						<uui-icon name="icon-wrong"></uui-icon>
					</uui-button>
				</div>
			` : u`
			<div class="group-header">
				<strong class="group-name">${e}</strong>
				<span class="header-spacer"></span>
				<uui-action-bar class="group-header-actions">
					<uui-button pristine look="primary" label="Rename" @click=${() => r(this, s, le).call(this, e)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete group"
						title="Delete group (rules move to ungrouped)"
						@click=${() => r(this, s, ue).call(this, e)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
Ve = function(e) {
  const t = p(this, s, m), i = t.filter((o) => !e.has(o.id));
  return i.length === 0 ? d : u`
			<div class="unmatched-section">
				<h4>Unmatched elements (${i.length})</h4>
				${i.map((o) => {
    const a = t.indexOf(o);
    return u`
						<div class="unmatched-element">
							<div class="unmatched-text">${r(this, s, F).call(this, o.text, 80)}</div>
							<div class="unmatched-meta">
								${p(this, s, C) === "web" ? u`
										${o.htmlTag ? u`<span class="meta-badge tag-badge">&lt;${o.htmlTag}&gt;</span>` : d}
										<span class="meta-badge">${o.fontSize}pt</span>
										${o.isBold ? u`<span class="meta-badge tag-badge"><b>B</b></span>` : d}
										${o.cssClasses ? u`<span class="meta-badge class-badge">.${o.cssClasses.split(" ")[0]}</span>` : d}
										${o.color !== "#000000" ? u`<span class="meta-badge" style="border-left: 3px solid ${o.color};">${o.color}</span>` : d}
									` : u`
										<span class="meta-badge">${o.fontSize}pt</span>
										<span class="meta-badge">${o.fontName}</span>
										${o.color !== "#000000" ? u`<span class="meta-badge" style="border-left: 3px solid ${o.color};">${o.color}</span>` : d}
									`}
							</div>
							<uui-button
								compact
								look="outline"
								label="Define rule from this"
								@click=${() => r(this, s, ie).call(this, o, a)}>
								Define rule
							</uui-button>
						</div>
					`;
  })}
			</div>
		`;
};
v.styles = [
  Ie,
  D,
  N`
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
], v.prototype, "_renamingGroup", 2);
x([
  b()
], v.prototype, "_renameValue", 2);
v = x([
  W("up-doc-section-rules-editor-modal")
], v);
const $t = v;
export {
  v as UpDocSectionRulesEditorModalElement,
  $t as default
};
//# sourceMappingURL=section-rules-editor-modal.element-CtKs-5bX.js.map
