import { g as Ue, b as He } from "./workflow.types-CVkhzFGj.js";
import { UmbSorterController as Ye } from "@umbraco-cms/backoffice/sorter";
import { css as T, property as O, state as _, customElement as D, nothing as d, repeat as Ie, html as u } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as Ke } from "@umbraco-cms/backoffice/lit-element";
import { UmbModalBaseElement as je } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as Qe } from "@umbraco-cms/backoffice/style";
const U = T`
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
var Je = Object.defineProperty, Xe = Object.getOwnPropertyDescriptor, H = (e) => {
  throw TypeError(e);
}, w = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? Xe(t, a) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (i = (o ? l(t, a, i) : l(i)) || i);
  return o && i && Je(t, a, i), i;
}, Ze = (e, t, a) => t.has(e) || H("Cannot " + a), et = (e, t, a) => (Ze(e, t, "read from private field"), a ? a.call(e) : t.get(e)), tt = (e, t, a) => t.has(e) ? H("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), E;
let x = class extends Ke {
  constructor() {
    super(...arguments), tt(this, E, new Ye(this, {
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
    this._rules = e, et(this, E).setModel(e);
  }
  get rules() {
    return this._rules;
  }
  render() {
    return this._rules.length === 0 && !this.renderItem ? d : u`
			<div class="rules-container">
				${Ie(
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
E = /* @__PURE__ */ new WeakMap();
x.styles = [
  U,
  T`
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
  O({ attribute: !1 })
], x.prototype, "rules", 1);
w([
  _()
], x.prototype, "_rules", 2);
w([
  O({ attribute: !1 })
], x.prototype, "expandedIds", 2);
w([
  O({ attribute: !1 })
], x.prototype, "renderItem", 2);
x = w([
  D("updoc-sortable-rules")
], x);
var it = Object.defineProperty, at = Object.getOwnPropertyDescriptor, Y = (e) => {
  throw TypeError(e);
}, $ = (e, t, a, o) => {
  for (var i = o > 1 ? void 0 : o ? at(t, a) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (i = (o ? l(t, a, i) : l(i)) || i);
  return o && i && it(t, a, i), i;
}, I = (e, t, a) => t.has(e) || Y("Cannot " + a), p = (e, t, a) => (I(e, t, "read from private field"), a ? a.call(e) : t.get(e)), ot = (e, t, a) => t.has(e) ? Y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), r = (e, t, a) => (I(e, t, "access private method"), a), s, m, y, K, z, A, R, b, k, P, j, Q, J, X, q, Z, ee, te, c, ie, B, ae, oe, se, ne, re, le, ue, C, L, ce, de, pe, he, fe, me, ve, ge, be, xe, N, _e, $e, ye, we, ze, Ce, ke, Se, Ee, Re, F, Le, Ne, Te, Oe, Ae, Pe, qe, Be, Fe, Me, M, Ve, Ge;
let st = 0;
function V() {
  return `r-${++st}`;
}
const We = {
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
}, S = ["positionFirst", "positionLast", "isBoldEquals"], G = [
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
], De = {
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
}, ft = ["textBeginsWith", "textEndsWith", "textContains"], W = {
  replaceWith: "Replace with",
  replaceAll: "Replace all with"
};
let v = class extends je {
  constructor() {
    super(...arguments), ot(this, s), this._rules = [], this._groupOrder = [], this._expandedSections = /* @__PURE__ */ new Set(), this._expandedRules = /* @__PURE__ */ new Set(), this._renamingGroup = null, this._renameValue = "";
  }
  firstUpdated() {
    const e = this.data?.existingRules;
    if (!e) return;
    const t = [], a = [];
    for (const i of e.groups ?? []) {
      a.push(i.name);
      for (const n of i.rules)
        t.push(r(this, s, R).call(this, n, i.name));
    }
    const o = e.rules ?? [];
    if (o.length > 0) {
      a.push(h);
      for (const i of o)
        t.push(r(this, s, R).call(this, i, h));
    }
    this._rules = t, this._groupOrder = a;
  }
  render() {
    const e = r(this, s, J).call(this), t = /* @__PURE__ */ new Map();
    for (const [o, i] of e) {
      const n = p(this, s, b).find((l) => l.id === o);
      if (n) {
        const l = t.get(i) ?? [];
        l.push(n), t.set(i, l);
      }
    }
    const a = p(this, s, Q);
    return u`
			<umb-body-layout headline="Edit Sections: ${p(this, s, j)}">
				<div id="main">
					<div class="section-info">
						${this.data?.sectionCount != null ? u`<span class="meta-badge">${this.data.sectionCount} section${this.data.sectionCount !== 1 ? "s" : ""}</span>` : d}
						<span class="meta-badge">${p(this, s, b).length} elements</span>
						<span class="meta-badge">${this._rules.length} rules</span>
						<span class="meta-badge">${e.size} matched</span>
						<span class="meta-badge">${p(this, s, b).length - e.size} unmatched</span>
						${(() => {
      const o = this._groupOrder.filter((i) => i !== h).length;
      return o > 0 ? u`<span class="meta-badge">${o} group${o !== 1 ? "s" : ""}</span>` : d;
    })()}
					</div>

					${a.map((o) => {
      const i = (n) => r(this, s, Be).call(this, n, t.get(n._id) ?? []);
      return u`
							<div class="group-container">
								${r(this, s, Ve).call(this, o.group)}
								<div class="group-rules">
									<updoc-sortable-rules
										.rules=${o.rules}
										.expandedIds=${this._expandedRules}
										.renderItem=${i}
										@sort-change=${(n) => r(this, s, de).call(this, o.group, n)}
									></updoc-sortable-rules>
									<uui-button
										look="placeholder"
										label="Add rule to ${o.group}"
										@click=${() => r(this, s, ie).call(this, o.group)}>
										+ Add rule
									</uui-button>
								</div>
							</div>
						`;
    })}

					<uui-button
						look="outline"
						label="Add group"
						@click=${() => r(this, s, le).call(this)}>
						<uui-icon name="icon-add"></uui-icon>
						Add group
					</uui-button>

					${r(this, s, Ge).call(this, e)}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${r(this, s, Te)}>Close</uui-button>
					<uui-button
						label="Save"
						look="secondary"
						@click=${r(this, s, Le)}>
						Save
					</uui-button>
					<uui-button
						label="Save and Close"
						look="primary"
						color="positive"
						@click=${r(this, s, Ne)}>
						Save and Close
					</uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
s = /* @__PURE__ */ new WeakSet();
m = function(e, t) {
  return this._expandedSections.has(`${e}-${t}`);
};
y = function(e, t) {
  const a = `${e}-${t}`, o = new Set(this._expandedSections);
  o.has(a) ? o.delete(a) : o.add(a), this._expandedSections = o;
};
K = function(e) {
  return this._expandedRules.has(e);
};
z = function(e) {
  const t = new Set(this._expandedRules);
  t.has(e) ? t.delete(e) : t.add(e), this._expandedRules = t;
};
A = function(e) {
  if (!this._expandedRules.has(e)) {
    const t = new Set(this._expandedRules);
    t.add(e), this._expandedRules = t;
  }
};
R = function(e, t) {
  let a = e.part, o = e.exclude ?? !1;
  if (!a && !o) {
    const n = Ue(e);
    n === "exclude" ? o = !0 : a = n;
  }
  let i = e.formats;
  return (!i || i.length === 0) && (i = [{ type: "block", value: e.format ?? He(e) }]), {
    ...e,
    part: a,
    exclude: o,
    formats: i,
    _id: V(),
    _groupName: t
  };
};
b = function() {
  return this.data?.elements ?? [];
};
k = function() {
  return this.data?.sourceType ?? "pdf";
};
P = function() {
  if (p(this, s, k) === "web") {
    const e = ["htmlTagEquals", "containerIdEquals", "containerClassContains", "cssClassContains", "htmlContainerPathContains"];
    return [...e, ...G.filter((t) => !e.includes(t))];
  }
  return G;
};
j = function() {
  return this.data?.sectionHeading ?? "Section";
};
Q = function() {
  const e = [];
  for (const t of this._groupOrder)
    e.push({
      group: t,
      rules: this._rules.filter((a) => a._groupName === t)
    });
  return e;
};
J = function() {
  const e = /* @__PURE__ */ new Map(), t = p(this, s, b);
  for (const a of this._rules)
    if (a.conditions.length !== 0)
      for (let o = 0; o < t.length; o++) {
        const i = t[o];
        if (!e.has(i.id) && r(this, s, X).call(this, i, a.conditions, o, t.length)) {
          if (a.exceptions?.length && a.exceptions.some(
            (l) => r(this, s, q).call(this, i, l, o, t.length)
          ))
            continue;
          e.set(i.id, a._id);
        }
      }
  return e;
};
X = function(e, t, a, o) {
  return t.every((i) => r(this, s, q).call(this, e, i, a, o));
};
q = function(e, t, a, o) {
  const i = String(t.value ?? ""), n = Number(t.value);
  switch (t.type) {
    case "textBeginsWith":
      return e.text.toLowerCase().startsWith(i.toLowerCase());
    case "textEndsWith":
      return e.text.toLowerCase().endsWith(i.toLowerCase());
    case "textContains":
      return e.text.toLowerCase().includes(i.toLowerCase());
    case "textMatchesPattern":
      try {
        return new RegExp(i, "i").test(e.text);
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
      return e.fontName.toLowerCase().includes(i.toLowerCase());
    case "colorEquals":
      return e.color.toLowerCase() === i.toLowerCase();
    case "positionFirst":
      return a === 0;
    case "positionLast":
      return a === o - 1;
    case "htmlTagEquals":
      return (e.htmlTag ?? "").toLowerCase() === i.toLowerCase();
    case "cssClassContains":
      return (e.cssClasses ?? "").toLowerCase().includes(i.toLowerCase());
    case "htmlContainerPathContains":
      return (e.htmlContainerPath ?? "").toLowerCase().includes(i.toLowerCase());
    case "containerIdEquals":
      return (e.htmlContainerPath ?? "").split("/").some((f) => {
        const g = f.indexOf("#");
        return g >= 0 && f.substring(g + 1).toLowerCase() === i.toLowerCase();
      });
    case "containerClassContains":
      return (e.htmlContainerPath ?? "").split("/").some((f) => {
        const g = f.indexOf(".");
        return g >= 0 && f.substring(g + 1).toLowerCase().includes(i.toLowerCase());
      });
    case "isBoldEquals":
      return e.isBold === !0;
    default:
      return !1;
  }
};
Z = function(e, t, a) {
  return p(this, s, k) === "web" ? r(this, s, ee).call(this, e) : r(this, s, te).call(this, e, t, a);
};
ee = function(e) {
  const t = [];
  if (e.htmlTag && t.push({ type: "htmlTagEquals", value: e.htmlTag }), e.fontSize > 0 && t.push({ type: "fontSizeEquals", value: e.fontSize }), e.cssClasses) {
    const a = e.cssClasses.split(" ")[0];
    a && t.push({ type: "cssClassContains", value: a });
  }
  if (e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && t.push({ type: "colorEquals", value: e.color }), e.htmlContainerPath) {
    const a = e.htmlContainerPath.split("/"), o = [...a].reverse().find((i) => i.includes("#"));
    if (o) {
      const i = o.substring(o.indexOf("#") + 1);
      t.push({ type: "containerIdEquals", value: i });
    } else {
      const i = [...a].reverse().find((n) => n.includes("."));
      if (i) {
        const n = i.substring(i.indexOf(".") + 1);
        t.push({ type: "containerClassContains", value: n });
      } else {
        const n = a[a.length - 1];
        n && t.push({ type: "htmlContainerPathContains", value: n });
      }
    }
  }
  return e.isBold && t.push({ type: "isBoldEquals", value: "true" }), t;
};
te = function(e, t, a) {
  const o = [];
  if (o.push({ type: "fontSizeEquals", value: e.fontSize }), e.fontName) {
    const n = e.fontName.includes("+") ? e.fontName.substring(e.fontName.indexOf("+") + 1) : e.fontName;
    o.push({ type: "fontNameContains", value: n });
  }
  e.color && e.color.toLowerCase() !== "#000000" && e.color.toLowerCase() !== "#000" && o.push({ type: "colorEquals", value: e.color });
  const i = e.text.indexOf(":");
  return i > 0 && i < 30 && o.push({ type: "textBeginsWith", value: e.text.substring(0, i + 1) }), t === 0 ? o.push({ type: "positionFirst" }) : t === a - 1 && o.push({ type: "positionLast" }), o;
};
c = function(e, t) {
  this._rules = this._rules.map((a) => a._id === e ? t(a) : a);
};
ie = function(e = h) {
  this._groupOrder.includes(e) || (this._groupOrder = [...this._groupOrder, e]);
  const t = V();
  this._rules = [...this._rules, {
    role: "",
    part: "content",
    conditions: [],
    formats: [{ type: "block", value: "auto" }],
    _id: t,
    _groupName: e
  }], r(this, s, A).call(this, t);
};
B = function(e) {
  this._rules = this._rules.filter((t) => t._id !== e);
};
ae = function(e, t) {
  const a = r(this, s, Z).call(this, e, t, p(this, s, b).length), o = e.text.split(/[\s:,]+/).slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, ""), i = V();
  this._groupOrder.includes(h) || (this._groupOrder = [...this._groupOrder, h]), this._rules = [...this._rules, {
    role: o,
    part: "content",
    conditions: a,
    formats: [{ type: "block", value: "auto" }],
    _id: i,
    _groupName: h
  }], r(this, s, A).call(this, i);
};
oe = function(e, t) {
  r(this, s, c).call(this, e, (a) => ({ ...a, role: t }));
};
se = function(e, t) {
  r(this, s, c).call(this, e, (a) => ({ ...a, part: t }));
};
ne = function(e, t) {
  r(this, s, c).call(this, e, (a) => ({ ...a, exclude: t }));
};
re = function(e, t) {
  r(this, s, c).call(this, e, (a) => ({ ...a, _groupName: t }));
};
le = function() {
  let e = "New Group", t = 1;
  for (; this._groupOrder.includes(e); )
    e = `New Group ${++t}`;
  this._groupOrder = [...this._groupOrder, e], this._renamingGroup = e, this._renameValue = e;
};
ue = function(e) {
  this._renamingGroup = e, this._renameValue = e;
};
C = function() {
  if (!this._renamingGroup || !this._renameValue.trim()) return;
  const e = this._renamingGroup, t = this._renameValue.trim();
  e !== t && (this._groupOrder = this._groupOrder.map((a) => a === e ? t : a), this._rules = this._rules.map(
    (a) => a._groupName === e ? { ...a, _groupName: t } : a
  )), this._renamingGroup = null, this._renameValue = "";
};
L = function() {
  this._renamingGroup = null, this._renameValue = "";
};
ce = function(e) {
  this._rules = this._rules.map(
    (t) => t._groupName === e ? { ...t, _groupName: h } : t
  ), this._groupOrder = this._groupOrder.filter((t) => t !== e), this._groupOrder.includes(h) || (this._groupOrder = [...this._groupOrder, h]);
};
de = function(e, t) {
  const a = t.detail.rules, o = new Set(a.map((n) => n._id)), i = [];
  for (const n of this._groupOrder)
    n === e ? i.push(...a.map((l) => ({ ...l, _groupName: n }))) : i.push(...this._rules.filter((l) => l._groupName === n && !o.has(l._id)));
  this._rules = i;
};
pe = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    formats: [...t.formats ?? [], { type: "block", value: "auto" }]
  }));
};
he = function(e, t) {
  r(this, s, c).call(this, e, (a) => ({
    ...a,
    formats: (a.formats ?? []).filter((o, i) => i !== t)
  }));
};
fe = function(e, t, a) {
  const o = a === "block" ? "auto" : "bold";
  r(this, s, c).call(this, e, (i) => {
    const n = [...i.formats ?? []];
    return n[t] = { type: a, value: o }, { ...i, formats: n };
  });
};
me = function(e, t, a) {
  r(this, s, c).call(this, e, (o) => {
    const i = [...o.formats ?? []];
    return i[t] = { ...i[t], value: a }, { ...o, formats: i };
  });
};
ve = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    conditions: [...t.conditions, { type: "textBeginsWith", value: "" }]
  }));
};
ge = function(e, t) {
  r(this, s, c).call(this, e, (a) => ({
    ...a,
    conditions: a.conditions.filter((o, i) => i !== t)
  }));
};
be = function(e, t, a) {
  r(this, s, c).call(this, e, (o) => {
    const i = [...o.conditions];
    let n;
    return S.includes(a) ? n = void 0 : a === "fontSizeRange" ? n = { min: 0, max: 100 } : n = i[t].value, i[t] = { type: a, value: n }, { ...o, conditions: i };
  });
};
xe = function(e, t, a) {
  r(this, s, c).call(this, e, (o) => {
    const i = [...o.conditions], n = i[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return i[t] = { ...n, value: l && !isNaN(Number(a)) ? Number(a) : a }, { ...o, conditions: i };
  });
};
N = function(e, t, a, o) {
  r(this, s, c).call(this, e, (i) => {
    const n = [...i.conditions], l = n[t], f = l.value && typeof l.value == "object" ? l.value : { min: 0, max: 100 }, g = isNaN(Number(o)) ? 0 : Number(o);
    return n[t] = { ...l, value: { ...f, [a]: g } }, { ...i, conditions: n };
  });
};
_e = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    exceptions: [...t.exceptions ?? [], { type: "textContains", value: "" }]
  }));
};
$e = function(e, t) {
  r(this, s, c).call(this, e, (a) => ({
    ...a,
    exceptions: (a.exceptions ?? []).filter((o, i) => i !== t)
  }));
};
ye = function(e, t, a) {
  r(this, s, c).call(this, e, (o) => {
    const i = [...o.exceptions ?? []];
    return i[t] = {
      type: a,
      value: S.includes(a) ? void 0 : i[t].value
    }, { ...o, exceptions: i };
  });
};
we = function(e, t, a) {
  r(this, s, c).call(this, e, (o) => {
    const i = [...o.exceptions ?? []], n = i[t], l = n.type === "fontSizeEquals" || n.type === "fontSizeAbove" || n.type === "fontSizeBelow";
    return i[t] = { ...n, value: l && !isNaN(Number(a)) ? Number(a) : a }, { ...o, exceptions: i };
  });
};
ze = function(e) {
  r(this, s, c).call(this, e, (t) => ({
    ...t,
    textReplacements: [...t.textReplacements ?? [], { findType: "textBeginsWith", find: "", replaceType: "replaceWith", replace: "" }]
  }));
};
Ce = function(e, t) {
  r(this, s, c).call(this, e, (a) => ({
    ...a,
    textReplacements: (a.textReplacements ?? []).filter((o, i) => i !== t)
  }));
};
ke = function(e, t, a) {
  r(this, s, c).call(this, e, (o) => {
    const i = [...o.textReplacements ?? []], n = a === "textContains" ? "replaceAll" : "replaceWith";
    return i[t] = { ...i[t], findType: a, replaceType: n }, { ...o, textReplacements: i };
  });
};
Se = function(e, t, a) {
  r(this, s, c).call(this, e, (o) => {
    const i = [...o.textReplacements ?? []];
    return i[t] = { ...i[t], find: a }, { ...o, textReplacements: i };
  });
};
Ee = function(e, t, a) {
  r(this, s, c).call(this, e, (o) => {
    const i = [...o.textReplacements ?? []];
    return i[t] = { ...i[t], replace: a }, { ...o, textReplacements: i };
  });
};
Re = function(e) {
  const t = (e.formats ?? []).find((l) => l.type === "block"), { _id: a, _groupName: o, action: i, ...n } = e;
  return {
    ...n,
    format: t?.value ?? "auto"
  };
};
F = function() {
  this._renamingGroup && r(this, s, C).call(this);
  const e = [];
  let t = [];
  for (const a of this._groupOrder) {
    const o = this._rules.filter((i) => i._groupName === a).map((i) => r(this, s, Re).call(this, i));
    a === h ? t = o : e.push({ name: a, rules: o });
  }
  return { groups: e, rules: t };
};
Le = async function() {
  const e = r(this, s, F).call(this);
  this.data?.onSave && await this.data.onSave(e);
};
Ne = function() {
  const e = r(this, s, F).call(this);
  this.value = { rules: e }, this.modalContext?.submit();
};
Te = function() {
  this.modalContext?.reject();
};
Oe = function(e, t, a) {
  const o = S.includes(a.type), i = a.type === "fontSizeRange", n = i && a.value && typeof a.value == "object" ? a.value : { min: 0, max: 100 };
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${a.type}
					@change=${(l) => r(this, s, be).call(this, e, t, l.target.value)}>
					${p(this, s, P).map((l) => u`
						<option value=${l} ?selected=${l === a.type}>${We[l]}</option>
					`)}
				</select>
				${i ? u`
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
						.value=${String(a.value ?? "")}
						@input=${(l) => r(this, s, xe).call(this, e, t, l.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove condition"
					@click=${() => r(this, s, ge).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Ae = function(e, t, a) {
  const o = S.includes(a.type);
  return u`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${a.type}
					@change=${(i) => r(this, s, ye).call(this, e, t, i.target.value)}>
					${p(this, s, P).map((i) => u`
						<option value=${i} ?selected=${i === a.type}>${We[i]}</option>
					`)}
				</select>
				${o ? d : u`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(a.value ?? "")}
						@input=${(i) => r(this, s, we).call(this, e, t, i.target.value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove exception"
					@click=${() => r(this, s, $e).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
Pe = function(e, t, a) {
  const o = a.type === "block" ? ct : pt, i = a.type === "block" ? ut : dt;
  return u`
			<div class="condition-row">
				<select
					class="format-type-select"
					.value=${a.type}
					@change=${(n) => r(this, s, fe).call(this, e, t, n.target.value)}>
					${lt.map((n) => u`
						<option value=${n} ?selected=${n === a.type}>${rt[n]}</option>
					`)}
				</select>
				<select
					class="format-value-select"
					.value=${a.value}
					@change=${(n) => r(this, s, me).call(this, e, t, n.target.value)}>
					${o.map((n) => u`
						<option value=${n} ?selected=${n === a.value}>${i[n]}</option>
					`)}
				</select>
				<uui-button
					compact
					look="secondary"
					label="Remove format"
					@click=${() => r(this, s, he).call(this, e, t)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
};
qe = function(e, t, a) {
  const o = a.findType === "textContains" ? W.replaceAll : W.replaceWith;
  return u`
			<div class="find-replace-entry">
				<div class="condition-row">
					<select
						class="condition-type-select"
						.value=${a.findType}
						@change=${(i) => r(this, s, ke).call(this, e, t, i.target.value)}>
						${ft.map((i) => u`
							<option value=${i} ?selected=${i === a.findType}>${ht[i]}</option>
						`)}
					</select>
					<input
						type="text"
						class="condition-value-input"
						placeholder="Find..."
						.value=${a.find}
						@input=${(i) => r(this, s, Se).call(this, e, t, i.target.value)} />
					<uui-button
						compact
						look="secondary"
						label="Remove replacement"
						@click=${() => r(this, s, Ce).call(this, e, t)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</div>
				<div class="condition-row">
					<span class="replace-label">${o}</span>
					<input
						type="text"
						class="condition-value-input"
						placeholder="(empty = remove)"
						.value=${a.replace}
						@input=${(i) => r(this, s, Ee).call(this, e, t, i.target.value)} />
				</div>
			</div>
		`;
};
Be = function(e, t) {
  return r(this, s, K).call(this, e._id) ? r(this, s, Me).call(this, e, t) : r(this, s, Fe).call(this, e, t);
};
Fe = function(e, t) {
  const a = e.exclude, o = e.part ?? "content", i = a ? "Exclude" : De[o] ?? o, n = t.length, l = e.role || "(unnamed rule)";
  return u`
			<div class="rule-row" @click=${() => r(this, s, z).call(this, e._id)}>
				<span class="rule-grip" title="Drag to reorder" @click=${(f) => f.stopPropagation()}>⠿</span>
				<span class="rule-row-name">${l}</span>
				<span class="rule-row-part ${a ? "excluded" : ""}">${i}</span>
				${n > 0 ? u`<span class="rule-row-match ${a ? "excluded" : "matched"}">${n}&times;</span>` : u`<span class="rule-row-match no-match">0</span>`}
				<uui-action-bar class="rule-row-actions"
					@click=${(f) => f.stopPropagation()}>
					<uui-button pristine look="primary" label="Edit rule"
						@click=${() => r(this, s, z).call(this, e._id)}>
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
Me = function(e, t) {
  const a = e.exclude, o = e.part ?? "content", i = e._id;
  return u`
			<div class="rule-card">
				<div class="rule-header">
					<uui-icon class="rule-row-chevron expanded" name="icon-navigation-down"
						@click=${() => r(this, s, z).call(this, i)}
						style="cursor:pointer"></uui-icon>
					<input
						type="text"
						class="role-name-input"
						placeholder="Section name (e.g. tour-title)"
						.value=${e.role}
						@input=${(n) => r(this, s, oe).call(this, i, n.target.value)} />
					<uui-button
						compact
						look="secondary"
						color="danger"
						label="Remove rule"
						@click=${() => r(this, s, B).call(this, i)}>
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
    r(this, s, re).call(this, i, l);
  }}>
						${this._groupOrder.map((n) => u`
							<option value=${n} ?selected=${n === e._groupName}>${n}</option>
						`)}
					</select>
				</div>
				` : d}

				<div class="conditions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "conditions", i)}>
						<uui-icon name=${r(this, s, m).call(this, "conditions", i) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Conditions${e.conditions.length > 0 ? ` (${e.conditions.length})` : ""}
					</div>
					${r(this, s, m).call(this, "conditions", i) ? u`
						${e.conditions.map((n, l) => r(this, s, Oe).call(this, i, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add condition"
							@click=${() => r(this, s, ve).call(this, i)}>
							+ Add condition
						</uui-button>
					` : d}
				</div>

				<div class="exceptions-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "exceptions", i)}>
						<uui-icon name=${r(this, s, m).call(this, "exceptions", i) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Exceptions${(e.exceptions ?? []).length > 0 ? ` (${(e.exceptions ?? []).length})` : ""}
					</div>
					${r(this, s, m).call(this, "exceptions", i) ? u`
						${(e.exceptions ?? []).map((n, l) => r(this, s, Ae).call(this, i, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add exception"
							@click=${() => r(this, s, _e).call(this, i)}>
							+ Add exception
						</uui-button>
					` : d}
				</div>

				<div class="part-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "part", i)}>
						<uui-icon name=${r(this, s, m).call(this, "part", i) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Part
					</div>
					${r(this, s, m).call(this, "part", i) ? u`
						<div class="part-controls">
							<select
								class="part-select"
								.value=${o}
								?disabled=${a}
								@change=${(n) => r(this, s, se).call(this, i, n.target.value)}>
								${nt.map((n) => u`
									<option value=${n} ?selected=${n === o}>${De[n]}</option>
								`)}
							</select>
							<label class="exclude-label">
								<input
									type="checkbox"
									.checked=${a}
									@change=${(n) => r(this, s, ne).call(this, i, n.target.checked)} />
								Exclude
							</label>
						</div>
					` : d}
				</div>

				${a ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "format", i)}>
						<uui-icon name=${r(this, s, m).call(this, "format", i) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Format${(e.formats ?? []).length > 0 ? ` (${(e.formats ?? []).length})` : ""}
					</div>
					${r(this, s, m).call(this, "format", i) ? u`
						${(e.formats ?? []).map((n, l) => r(this, s, Pe).call(this, i, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add format"
							@click=${() => r(this, s, pe).call(this, i)}>
							+ Add format
						</uui-button>
					` : d}
				</div>
				`}

				${a ? d : u`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => r(this, s, y).call(this, "findReplace", i)}>
						<uui-icon name=${r(this, s, m).call(this, "findReplace", i) ? "icon-navigation-down" : "icon-navigation-right"}></uui-icon>
						Find &amp; Replace${(e.textReplacements ?? []).length > 0 ? ` (${(e.textReplacements ?? []).length})` : ""}
					</div>
					${r(this, s, m).call(this, "findReplace", i) ? u`
						${(e.textReplacements ?? []).map((n, l) => r(this, s, qe).call(this, i, l, n))}
						<uui-button
							compact
							look="placeholder"
							label="Add find & replace"
							@click=${() => r(this, s, ze).call(this, i)}>
							+ Add find &amp; replace
						</uui-button>
					` : d}
				</div>
				`}

				<div class="match-preview ${t.length > 0 ? a ? "excluded" : "matched" : "no-match"}">
					${t.length > 0 ? u`<uui-icon name=${a ? "icon-block" : "icon-check"}></uui-icon> ${a ? "Excluded" : "Matched"} <strong>${t.length}&times;</strong>${t.length <= 5 ? u`: ${t.map((n, l) => u`${l > 0 ? u`, ` : d}<strong>${r(this, s, M).call(this, n.text, 40)}</strong>`)}` : d}` : u`<uui-icon name="icon-alert"></uui-icon> ${e.conditions.length === 0 ? "Add conditions to match elements" : "No match"}`}
				</div>
			</div>
		`;
};
M = function(e, t) {
  return e.length > t ? e.substring(0, t) + "..." : e;
};
Ve = function(e) {
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
    t.key === "Enter" && r(this, s, C).call(this), t.key === "Escape" && r(this, s, L).call(this);
  }} />
					<uui-button compact look="primary" label="Confirm" @click=${() => r(this, s, C).call(this)}>
						<uui-icon name="icon-check"></uui-icon>
					</uui-button>
					<uui-button compact look="secondary" label="Cancel" @click=${() => r(this, s, L).call(this)}>
						<uui-icon name="icon-wrong"></uui-icon>
					</uui-button>
				</div>
			` : u`
			<div class="group-header">
				<strong class="group-name">${e}</strong>
				<span class="header-spacer"></span>
				<uui-action-bar class="group-header-actions">
					<uui-button pristine look="primary" label="Rename" @click=${() => r(this, s, ue).call(this, e)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete group"
						title="Delete group (rules move to ungrouped)"
						@click=${() => r(this, s, ce).call(this, e)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
};
Ge = function(e) {
  const t = p(this, s, b), a = t.filter((o) => !e.has(o.id));
  return a.length === 0 ? d : u`
			<div class="unmatched-section">
				<h4>Unmatched elements (${a.length})</h4>
				${a.map((o) => {
    const i = t.indexOf(o);
    return u`
						<div class="unmatched-element">
							<div class="unmatched-text">${r(this, s, M).call(this, o.text, 80)}</div>
							<div class="unmatched-meta">
								${p(this, s, k) === "web" ? u`
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
								@click=${() => r(this, s, ae).call(this, o, i)}>
								Define rule
							</uui-button>
						</div>
					`;
  })}
			</div>
		`;
};
v.styles = [
  Qe,
  U,
  T`
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
$([
  _()
], v.prototype, "_rules", 2);
$([
  _()
], v.prototype, "_groupOrder", 2);
$([
  _()
], v.prototype, "_expandedSections", 2);
$([
  _()
], v.prototype, "_expandedRules", 2);
$([
  _()
], v.prototype, "_renamingGroup", 2);
$([
  _()
], v.prototype, "_renameValue", 2);
v = $([
  D("up-doc-section-rules-editor-modal")
], v);
const $t = v;
export {
  v as UpDocSectionRulesEditorModalElement,
  $t as default
};
//# sourceMappingURL=section-rules-editor-modal.element-u_LuVUG9.js.map
