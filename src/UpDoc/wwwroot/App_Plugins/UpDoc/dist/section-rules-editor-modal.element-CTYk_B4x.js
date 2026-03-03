import { g as Ge, b as De } from "./workflow.types-CVkhzFGj.js";
import { UmbSorterController as Ue } from "@umbraco-cms/backoffice/sorter";
import { css as A, property as O, state as g, customElement as U, nothing as d, repeat as He, html as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as Ye } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as Ke } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as je } from "@umbraco-cms/backoffice/style";
const H = A`
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
var Ie = Object.defineProperty, Qe = Object.getOwnPropertyDescriptor, Y = (e) => {
  throw TypeError(e);
}, $ = (e, t, i, o) => {
  for (var a = o > 1 ? void 0 : o ? Qe(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (a = (o ? l(t, i, a) : l(a)) || a);
  return o && a && Ie(t, i, a), a;
}, Je = (e, t, i) => t.has(e) || Y("Cannot " + i), Xe = (e, t, i) => (Je(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Ze = (e, t, i) => t.has(e) ? Y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), k;
let v = class extends Ye {
  constructor() {
    super(...arguments), Ze(this, k, new Ue(this, {
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
    this._rules = e, Xe(this, k).setModel(e);
  }
  get rules() {
    return this._rules;
  }
  render() {
    return this._rules.length === 0 && !this.renderItem ? d : u`
			<div class="rules-container">
				${He(
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
k = /* @__PURE__ */ new WeakMap();
v.styles = [
  H,
  A`
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
$([
  O({ attribute: !1 })
], v.prototype, "rules", 1);
$([
  g()
], v.prototype, "_rules", 2);
$([
  O({ attribute: !1 })
], v.prototype, "expandedIds", 2);
$([
  O({ attribute: !1 })
], v.prototype, "renderItem", 2);
v = $([
  U("updoc-sortable-rules")
], v);
var et = Object.defineProperty, tt = Object.getOwnPropertyDescriptor, K = (e) => {
  throw TypeError(e);
}, b = (e, t, i, o) => {
  for (var a = o > 1 ? void 0 : o ? tt(t, i) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (a = (o ? l(t, i, a) : l(a)) || a);
  return o && a && et(t, i, a), a;
}, j = (e, t, i) => t.has(e) || K("Cannot " + i), p = (e, t, i) => (j(e, t, "read from private field"), i ? i.call(e) : t.get(e)), it = (e, t, i) => t.has(e) ? K("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), r = (e, t, i) => (j(e, t, "access private method"), i), s, h, x, I, y, P, S, m, z, F, Q, J, X, Z, q, ee, te, ie, c, R, M, ae, oe, se, ne, re, le, w, E, ue, L, ce, de, pe, he, fe, me, ve, ge, N, be, xe, _e, $e, ye, we, ze, Ce, ke, T, B, Se, Re, Ee, Le, Ne, Te, Ae, Oe, Pe, Fe, V, qe, Me;
let at = 0;
function W() {
  return `r-${++at}`;
}
const Be = {
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
  htmlContainerPathContains: "Container path contains"
}, C = ["positionFirst", "positionLast"], G = [
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
  "htmlContainerPathContains"
], Ve = {
  title: "Title",
  content: "Content",
  description: "Description",
  summary: "Summary"
}, ot = ["title", "content", "description", "summary"], st = {
  block: "Block",
  style: "Style"
}, nt = ["block", "style"], rt = {
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
}, lt = [
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
], ut = {
  bold: "Bold",
  italic: "Italic",
  strikethrough: "Strikethrough",
  code: "Code",
  highlight: "Highlight"
}, ct = ["bold", "italic", "strikethrough", "code", "highlight"], dt = {
  textBeginsWith: "Text begins with",
  textEndsWith: "Text ends with",
  textContains: "Text contains"
}, pt = ["textBeginsWith", "textEndsWith", "textContains"], D = {
  replaceWith: "Replace with",
  replaceAll: "Replace all with"
};
let f = class extends Ke {
  constructor() {
    super(...arguments), it(this, s), this._rules = [], this._groupOrder = [], this._expandedSections = /* @__PURE__ */ new Set(), this._expandedRules = /* @__PURE__ */ new Set(), this._renamingGroup = null, this._renameValue = "";
  }
  firstUpdated() {
    const e = this.data?.existingRules;
    if (!e) return;
    const t = [], i = [];
    for (const o of e.groups ?? []) {
      i.push(o.name);
      for (const a of o.rules)
        t.push(r(this, s, S).call(this, a, o.name));
    }
    for (const o of e.rules ?? [])
      t.push(r(this, s, S).call(this, o, null));
    this._rules = t, this._groupOrder = i;
  }
  render() {
    const e = r(this, s, X).call(this), t = /* @__PURE__ */ new Map();
    for (const [o, a] of e) {
      const n = p(this, s, m).find((l) => l.id === o);
      if (n) {
        const l = t.get(a) ?? [];
        l.push(n), t.set(a, l);
      }
    }
    const i = p(this, s, J);
    return u`
			<umb-body-layout headline="Edit Sections: ${p(this, s, Q)}">
				<div id="main">
					<div class="section-info">
						${this.data?.sectionCount != null ? u`<span class="meta-badge">${this.data.sectionCount} section${this.data.sectionCount !== 1 ? "s" : ""}</span>` : d}
						<span class="meta-badge">${p(this, s, m).length} elements</span>
						<span class="meta-badge">${this._rules.length} rules</span>
						<span class="meta-badge">${e.size} matched</span>
						<span class="meta-badge">${p(this, s, m).length - e.size} unmatched</span>
						${this._groupOrder.length > 0 ? u`<span class="meta-badge">${this._groupOrder.length} group${this._groupOrder.length !== 1 ? "s" : ""}</span>` : d}
					</div>

					${i.map((o) => {
      const a = (n) => r(this, s, Oe).call(this, n, t.get(n._id) ?? []);
      return o.group !== null ? u`
								<div class="group-container">
									${r(this, s, qe).call(this, o.group)}
									<div class="group-rules">
										<updoc-sortable-rules
											.rules=${o.rules}
											.expandedIds=${this._expandedRules}
											.renderItem=${a}
											@sort-change=${(n) => r(this, s, L).call(this, o.group, n)}
										></updoc-sortable-rules>
										<uui-button
											look="placeholder"
											label="Add rule to ${o.group}"
											@click=${() => r(this, s, R).call(this, o.group)}>
											+ Add rule
										</uui-button>
									</div>
								</div>
							` : u`
							${this._groupOrder.length > 0 ? u`
								<div class="ungrouped-label">Ungrouped</div>
							` : d}
							<updoc-sortable-rules
								.rules=${o.rules}
								.expandedIds=${this._expandedRules}
								.renderItem=${a}
								@sort-change=${(n) => r(this, s, L).call(this, null, n)}
							></updoc-sortable-rules>
							<uui-button
								look="placeholder"
								label="Add rule"
								@click=${() => r(this, s, R).call(this, null)}>
								+ Add rule
							</uui-button>
						`;
    })}

					<uui-button
						look="outline"
						label="Add group"
						@click=${() => r(this, s, re).call(this)}>
						<uui-icon name="icon-add"></uui-icon>
						Add group
					</uui-button>

					${r(this, s, Me).call(this, e)}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${r(this, s, Ee)}>Close</uui-button>
					<uui-button
						label="Save"
						look="secondary"
						@click=${r(this, s, Se)}>
						Save
					</uui-button>
					<uui-button
						label="Save and Close"
						look="primary"
						color="positive"
						@click=${r(this, s, Re)}>
						Save and Close
					</uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
s = /* @__PURE__ */ new WeakSet();
h = function(e, t) {
  return this._expandedSections.has(`${e}-${t}`);
};
x = function(e, t) {
  const i = `${e}-${t}`, o = new Set(this._expandedSections);
  o.has(i) ? o.delete(i) : o.add(i), this._expandedSections = o;
};
I = function(e) {
  return this._expandedRules.has(e);
};
y = function(e) {
  const t = new Set(this._expandedRules);
  t.has(e) ? t.delete(e) : t.add(e), this._expandedRules = t;
};
P = function(e) {
  if (!this._expandedRules.has(e)) {
    const t = new Set(this._expandedRules);
    t.add(e), this._expandedRules = t;
  }
};
S = function(e, t) {
  let i = e.part, o = e.exclude ?? !1;
  if (!i && !o) {
    const n = Ge(e);
    n === "exclude" ? o = !0 : i = n;
  }
  let a = e.formats;
  return (!a || a.length === 0) && (a = [{ type: "block", value: e.format ?? De(e) }]), {
    ...e,
    part: i,
    exclude: o,
    formats: a,
    _id: W(),
    _groupName: t
  };
};
m = function() {
  return this.data?.elements ?? [];
};
z = function() {
  return this.data?.sourceType ?? "pdf";
};
F = function() {
  if (p(this, s, z) === "web") {
    const e = ["htmlTagEquals", "cssClassContains", "htmlContainerPathContains"];
    return [...e, ...G.filter((t) => !e.includes(t))];
  }
  return G;
};
Q = function() {
  return this.data?.sectionHeading ?? "Section";
};
J = function() {
  const e = [];
  for (const t of this._groupOrder)
    e.push({
      group: t,
      rules: this._rules.filter((i) => i._groupName === t)
    });
  return e.push({
    group: null,
    rules: this._rules.filter((t) => t._groupName === null)
  }), e;
};
X = function() {
  const e = /* @__PURE__ */ new Map(), t = p(this, s, m);
  for (const i of this._rules)
    if (i.conditions.length !== 0)
      for (let o = 0; o < t.length; o++) {
        const a = t[o];
        if (!e.has(a.id) && r(this, s, Z).call(this, a, i.conditions, o, t.length)) {
          if (i.exceptions?.length && i.exceptions.some(
            (l) => r(this, s, q).call(this, a, l, o, t.length)
          ))
            continue;
          e.set(a.id, i._id);
        }
      }
  return e;
};
Z = function(e, t, i, o) {
  return t.every((a) => r(this, s, q).call(this, e, a, i, o));
};
q = function(e, t, i, o) {
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
    default:
      return !1;
  }
};
ee = function(e, t, i) {
  return p(this, s, z) === "web" ? r(this, s, te).call(this, e) : r(this, s, ie).call(this, e, t, i);
};
te = function(e) {
  const t = [];
  if (e.htmlTag && t.push({ type: "htmlTagEquals", value: e.htmlTag }), e.fontSize > 0 && t.push({ type: "fontSizeEquals", value: e.fontSize }), e.cssClasses) {
    const i = e.cssClasses.split(" ")[0];
    i && t.push({ type: "cssClassContains", value: i });
  }
  if (e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && t.push({ type: "colorEquals", value: e.color }), e.htmlContainerPath) {
    const i = e.htmlContainerPath.split("/"), o = i[i.length - 1];
    o && t.push({ type: "htmlContainerPathContains", value: o });
  }
  return t;
};
ie = function(e, t, i) {
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
R = function(e = null) {
  const t = W();
  this._rules = [...this._rules, {
    role: "",
    part: "content",
    conditions: [],
    formats: [{ type: "block", value: "auto" }],
    _id: t,
    _groupName: e
  }], r(this, s, P).call(this, t);
};
M = function(e) {
  this._rules = this._rules.filter((t) => t._id !== e);
};
ae = function(e, t) {
  const i = r(this, s, ee).call(this, e, t, p(this, s, m).length), o = e.text.split(/[\s:,]+/).slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, ""), a = W();
  this._rules = [...this._rules, {
    role: o,
    part: "content",
    conditions: i,
    formats: [{ type: "block", value: "auto" }],
    _id: a,
    _groupName: null
  }], r(this, s, P).call(this, a);
};
oe = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({ ...i, role: t }));
};
se = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({ ...i, part: t }));
};
ne = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({ ...i, exclude: t }));
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
w = function() {
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
    (t) => t._groupName === e ? { ...t, _groupName: null } : t
  ), this._groupOrder = this._groupOrder.filter((t) => t !== e);
};
L = function(e, t) {
  const i = t.detail.rules, o = new Set(i.map((n) => n._id)), a = [];
  for (const n of this._groupOrder)
    n === e ? a.push(...i.map((l) => ({ ...l, _groupName: n }))) : a.push(...this._rules.filter((l) => l._groupName === n && !o.has(l._id)));
  e === null ? a.push(...i.map((n) => ({ ...n, _groupName: null }))) : a.push(...this._rules.filter((n) => n._groupName === null && !o.has(n._id))), this._rules = a;
};
ce = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    formats: [...t.formats ?? [], { type: "block", value: "auto" }]
  }));
};
de = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({
    ...i,
    formats: (i.formats ?? []).filter((o, a) => a !== t)
  }));
};
pe = function(e, t, i) {
  const o = i === "block" ? "auto" : "bold";
  r(this, s, c).call(this, e, (a) => {
    const n = [...a.formats ?? []];
    return n[t] = { type: i, value: o }, { ...a, formats: n };
  });
};
he = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.formats ?? []];
    return a[t] = { ...a[t], value: i }, { ...o, formats: a };
  });
};
fe = function(e) {
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
ve = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.conditions];
    let n;
    return C.includes(i) ? n = void 0 : i === "fontSizeRange" ? n = { min: 0, max: 100 } : n = a[t].value, a[t] = { type: i, value: n }, { ...o, conditions: a };
  });
};
ge = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.conditions], n = a[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return a[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...o, conditions: a };
  });
};
N = function(e, t, i, o) {
  r(this, s, c).call(this, e, (a) => {
    const n = [...a.conditions], l = n[t], _ = l.value && typeof l.value == "object" ? l.value : { min: 0, max: 100 }, We = isNaN(Number(o)) ? 0 : Number(o);
    return n[t] = { ...l, value: { ..._, [i]: We } }, { ...a, conditions: n };
  });
};
be = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    exceptions: [...t.exceptions ?? [], { type: "textContains", value: "" }]
  }));
};
xe = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({
    ...i,
    exceptions: (i.exceptions ?? []).filter((o, a) => a !== t)
  }));
};
_e = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.exceptions ?? []];
    return a[t] = {
      type: i,
      value: C.includes(i) ? void 0 : a[t].value
    }, { ...o, exceptions: a };
  });
};
$e = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.exceptions ?? []], n = a[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return a[t] = { ...n, value: l && !isNaN(Number(i)) ? Number(i) : i }, { ...o, exceptions: a };
  });
};
ye = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    textReplacements: [...t.textReplacements ?? [], { findType: "textBeginsWith", find: "", replaceType: "replaceWith", replace: "" }]
  }));
};
we = function(e, t) {
  r(this, s, c).call(this, e, (i) => ({
    ...i,
    textReplacements: (i.textReplacements ?? []).filter((o, a) => a !== t)
  }));
};
ze = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.textReplacements ?? []], n = i === "textContains" ? "replaceAll" : "replaceWith";
    return a[t] = { ...a[t], findType: i, replaceType: n }, { ...o, textReplacements: a };
  });
};
Ce = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.textReplacements ?? []];
    return a[t] = { ...a[t], find: i }, { ...o, textReplacements: a };
  });
};
ke = function(e, t, i) {
  r(this, s, c).call(this, e, (o) => {
    const a = [...o.textReplacements ?? []];
    return a[t] = { ...a[t], replace: i }, { ...o, textReplacements: a };
  });
};
T = function(e) {
  const t = (e.formats ?? []).find((l) => l.type === "block"), { _id: i, _groupName: o, action: a, ...n } = e;
  return {
    ...n,
    format: t?.value ?? "auto"
  };
};
B = function() {
  this._renamingGroup && r(this, s, w).call(this);
  const e = [];
  for (const i of this._groupOrder) {
    const o = this._rules.filter((a) => a._groupName === i).map((a) => r(this, s, T).call(this, a));
    e.push({ name: i, rules: o });
  }
  const t = this._rules.filter((i) => i._groupName === null).map((i) => r(this, s, T).call(this, i));
  return { groups: e, rules: t };
};
Se = async function() {
  const e = r(this, s, B).call(this);
  this.data?.onSave && await this.data.onSave(e);
};
Re = function() {
  const e = r(this, s, B).call(this);
  this.value = { rules: e }, this.modalContext?.submit();
};
Ee = function() {
  this.modalContext?.reject();
};
Le = function(e, t, i) {
  const o = C.includes(i.type), a = i.type === "fontSizeRange", n = a && i.value && typeof i.value == "object" ? i.value : { min: 0, max: 100 };
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(l) => r(this, s, ve).call(this, e, t, l.target.value)}>
					${p(this, s, F).map((l) => u`
						<option value=${l} ?selected=${l === i.type}>${Be[l]}</option>
					`)}
				</select>
				${a ? u`
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Min"
						.value=${String(n.min)}
						@input=${(l) => r(this, s, N).call(this, e, t, "min", l.target.value)} />
					<span class="range-separator">–</span>
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Max"
						.value=${String(n.max)}
						@input=${(l) => r(this, s, N).call(this, e, t, "max", l.target.value)} />
				` : o ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(l) => r(this, s, ge).call(this, e, t, l.target.value)} />
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
Ne = function(e, t, i) {
  const o = C.includes(i.type);
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${i.type}
					@change=${(a) => r(this, s, _e).call(this, e, t, a.target.value)}>
					${p(this, s, F).map((a) => u`
						<option value=${a} ?selected=${a === i.type}>${Be[a]}</option>
					`)}
				</select>
				${o ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(i.value ?? "")}
						@input=${(a) => r(this, s, $e).call(this, e, t, a.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove exception"
					@click=${() => r(this, s, xe).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Te = function(e, t, i) {
  const o = i.type === "block" ? lt : ct, a = i.type === "block" ? rt : ut;
  return u`
			<div class="condition-row">
				<select
					class="format-type-select"
					.value=${i.type}
					@change=${(n) => r(this, s, pe).call(this, e, t, n.target.value)}>
					${nt.map((n) => u`
						<option value=${n} ?selected=${n === i.type}>${st[n]}</option>
					`)}
				</select>
				<select
					class="format-value-select"
					.value=${i.value}
					@change=${(n) => r(this, s, he).call(this, e, t, n.target.value)}>
					${o.map((n) => u`
						<option value=${n} ?selected=${n === i.value}>${a[n]}</option>
					`)}
				</select>
				<uui-button
					compact
					look="secondary"
					label="Remove format"
					@click=${() => r(this, s, de).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Ae = function(e, t, i) {
  const o = i.findType === "textContains" ? D.replaceAll : D.replaceWith;
  return u`
			<div class="find-replace-entry">
				<div class="condition-row">
					<select
						class="condition-type-select"
						.value=${i.findType}
						@change=${(a) => r(this, s, ze).call(this, e, t, a.target.value)}>
						${pt.map((a) => u`
							<option value=${a} ?selected=${a === i.findType}>${dt[a]}</option>
						`)}
					</select>
					<input
						type="text"
						class="condition-value-input"
						placeholder="Find..."
						.value=${i.find}
						@input=${(a) => r(this, s, Ce).call(this, e, t, a.target.value)} />
					<uui-button
						compact
						look="secondary"
						label="Remove replacement"
						@click=${() => r(this, s, we).call(this, e, t)}>
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
						@input=${(a) => r(this, s, ke).call(this, e, t, a.target.value)} />
				</div>
			</div>
		`;
};
Oe = function(e, t) {
  return r(this, s, I).call(this, e._id) ? r(this, s, Fe).call(this, e, t) : r(this, s, Pe).call(this, e, t);
};
Pe = function(e, t) {
  const i = e.exclude, o = e.part ?? "content", a = i ? "Exclude" : Ve[o] ?? o, n = t.length, l = e.role || "(unnamed rule)";
  return u`
			<div class="rule-row" @click=${() => r(this, s, y).call(this, e._id)}>
				<span class="rule-grip" title="Drag to reorder" @click=${(_) => _.stopPropagation()}>⠿</span>
				<span class="rule-row-name">${l}</span>
				<span class="rule-row-part ${i ? "excluded" : ""}">${a}</span>
				${n > 0 ? u`<span class="rule-row-match ${i ? "excluded" : "matched"}">${n}&times;</span>` : u`<span class="rule-row-match no-match">0</span>`}
				<uui-action-bar class="rule-row-actions"
					@click=${(_) => _.stopPropagation()}>
					<uui-button pristine look="primary" label="Edit rule"
						@click=${() => r(this, s, y).call(this, e._id)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete rule"
						@click=${() => r(this, s, M).call(this, e._id)}>
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
						@click=${() => r(this, s, y).call(this, a)}
						style="cursor:pointer"></uui-icon>
					<input
						type="text"
						class="role-name-input"
						placeholder="Section name (e.g. tour-title)"
						.value=${e.role}
						@input=${(n) => r(this, s, oe).call(this, a, n.target.value)} />
					<uui-button
						compact
						look="secondary"
						color="danger"
						label="Remove rule"
						@click=${() => r(this, s, M).call(this, a)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</div>

				<div class="conditions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, x).call(this, "conditions", a)}>
						<uui-icon name=${r(this, s, h).call(this, "conditions", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Conditions${e.conditions.length > 0 ? ` (${e.conditions.length})` : ""}
					</div>
					${r(this, s, h).call(this, "conditions", a) ? u`
						${e.conditions.map((n, l) => r(this, s, Le).call(this, a, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add condition"
							@click=${() => r(this, s, fe).call(this, a)}>
							+ Add condition
						</uui-button>
					` : d}
				</div>

				<div class="exceptions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, x).call(this, "exceptions", a)}>
						<uui-icon name=${r(this, s, h).call(this, "exceptions", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Exceptions${(e.exceptions ?? []).length > 0 ? ` (${(e.exceptions ?? []).length})` : ""}
					</div>
					${r(this, s, h).call(this, "exceptions", a) ? u`
						${(e.exceptions ?? []).map((n, l) => r(this, s, Ne).call(this, a, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add exception"
							@click=${() => r(this, s, be).call(this, a)}>
							+ Add exception
						</uui-button>
					` : d}
				</div>

				<div class="part-area">
					<div class="section-header collapsible" @click=${() => r(this, s, x).call(this, "part", a)}>
						<uui-icon name=${r(this, s, h).call(this, "part", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Part
					</div>
					${r(this, s, h).call(this, "part", a) ? u`
						<div class="part-controls">
							<select
								class="part-select"
								.value=${o}
								?disabled=${i}
								@change=${(n) => r(this, s, se).call(this, a, n.target.value)}>
								${ot.map((n) => u`
									<option value=${n} ?selected=${n === o}>${Ve[n]}</option>
								`)}
							</select>
							<label class="exclude-label">
								<input
									type="checkbox"
									.checked=${i}
									@change=${(n) => r(this, s, ne).call(this, a, n.target.checked)} />
								Exclude
							</label>
						</div>
					` : d}
				</div>

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, x).call(this, "format", a)}>
						<uui-icon name=${r(this, s, h).call(this, "format", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Format${(e.formats ?? []).length > 0 ? ` (${(e.formats ?? []).length})` : ""}
					</div>
					${r(this, s, h).call(this, "format", a) ? u`
						${(e.formats ?? []).map((n, l) => r(this, s, Te).call(this, a, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add format"
							@click=${() => r(this, s, ce).call(this, a)}>
							+ Add format
						</uui-button>
					` : d}
				</div>
				`}

				${i ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, x).call(this, "findReplace", a)}>
						<uui-icon name=${r(this, s, h).call(this, "findReplace", a) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Find &amp; Replace${(e.textReplacements ?? []).length > 0 ? ` (${(e.textReplacements ?? []).length})` : ""}
					</div>
					${r(this, s, h).call(this, "findReplace", a) ? u`
						${(e.textReplacements ?? []).map((n, l) => r(this, s, Ae).call(this, a, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add find & replace"
							@click=${() => r(this, s, ye).call(this, a)}>
							+ Add find &amp; replace
						</uui-button>
					` : d}
				</div>
				`}

				<div class="match-preview ${t.length > 0 ? i ? "excluded" : "matched" : "no-match"}">
					${t.length > 0 ? u`<uui-icon name=${i ? "icon-block" : "icon-check"}></uui-icon> ${i ? "Excluded" : "Matched"} <strong>${t.length}&times;</strong>${t.length <= 5 ? u`: ${t.map((n, l) => u`${l > 0 ? u`, ` : d}<strong>${r(this, s, V).call(this, n.text, 40)}</strong>`)}` : d}` : u`<uui-icon name="icon-alert"></uui-icon> ${e.conditions.length === 0 ? "Add conditions to match elements" : "No match"}`}
				</div>
			</div>
		`;
};
V = function(e, t) {
  return e.length > t ? e.substring(0, t) + "..." : e;
};
qe = function(e) {
  return this._renamingGroup === e ? u`
				<div class="group-header">
					<input
						type="text"
						class="group-rename-input"
						.value=${this._renameValue}
						@input=${(t) => {
    this._renameValue = t.target.value;
  }}
						@keydown=${(t) => {
    t.key === "Enter" && r(this, s, w).call(this), t.key === "Escape" && r(this, s, E).call(this);
  }} />
					<uui-button compact look="primary" label="Confirm" @click=${() => r(this, s, w).call(this)}>
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
Me = function(e) {
  const t = p(this, s, m), i = t.filter((o) => !e.has(o.id));
  return i.length === 0 ? d : u`
			<div class="unmatched-section">
				<h4>Unmatched elements (${i.length})</h4>
				${i.map((o) => {
    const a = t.indexOf(o);
    return u`
						<div class="unmatched-element">
							<div class="unmatched-text">${r(this, s, V).call(this, o.text, 80)}</div>
							<div class="unmatched-meta">
								${p(this, s, z) === "web" ? u`
										${o.htmlTag ? u`<span class="meta-badge tag-badge">&lt;${o.htmlTag}&gt;</span>` : d}
										<span class="meta-badge">${o.fontSize}pt</span>
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
								@click=${() => r(this, s, ae).call(this, o, a)}>
								Define rule
							</uui-button>
						</div>
					`;
  })}
			</div>
		`;
};
f.styles = [
  je,
  H,
  A`
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

			.ungrouped-label {
				font-size: 11px;
				font-weight: 700;
				text-transform: uppercase;
				letter-spacing: 0.5px;
				color: var(--uui-color-text-alt);
				padding-top: var(--uui-size-space-2);
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
b([
  g()
], f.prototype, "_rules", 2);
b([
  g()
], f.prototype, "_groupOrder", 2);
b([
  g()
], f.prototype, "_expandedSections", 2);
b([
  g()
], f.prototype, "_expandedRules", 2);
b([
  g()
], f.prototype, "_renamingGroup", 2);
b([
  g()
], f.prototype, "_renameValue", 2);
f = b([
  U("up-doc-section-rules-editor-modal")
], f);
const xt = f;
export {
  f as UpDocSectionRulesEditorModalElement,
  xt as default
};
//# sourceMappingURL=section-rules-editor-modal.element-CTYk_B4x.js.map
