import { g as m } from "./destination-utils-DQDyJQ_T.js";
import { html as r, nothing as d, css as D, state as _, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement as L } from "@umbraco-cms/backoffice/modal";
import { UmbTextStyles as U } from "@umbraco-cms/backoffice/style";
var B = Object.defineProperty, N = Object.getOwnPropertyDescriptor, $ = (t) => {
  throw TypeError(t);
}, k = (t, e, a, s) => {
  for (var o = s > 1 ? void 0 : s ? N(e, a) : e, u = t.length - 1, b; u >= 0; u--)
    (b = t[u]) && (o = (s ? b(e, a, o) : b(o)) || o);
  return s && o && B(e, a, o), o;
}, x = (t, e, a) => e.has(t) || $("Cannot " + a), c = (t, e, a) => (x(t, e, "read from private field"), a ? a.call(t) : e.get(t)), A = (t, e, a) => e.has(t) ? $("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), l = (t, e, a) => (x(t, e, "access private method"), a), i, n, y, h, g, v, f, T, z, C, w, M, P, S;
let p = class extends L {
  constructor() {
    super(...arguments), A(this, i), this._activeTab = "", this._selectedTargets = /* @__PURE__ */ new Map();
  }
  connectedCallback() {
    super.connectedCallback();
    const t = l(this, i, g).call(this);
    t.length > 0 && (this._activeTab = t[0].id);
  }
  render() {
    const t = l(this, i, g).call(this);
    return r`
			<umb-body-layout headline="Pick destination field(s)">
				<div class="tab-content">
					<uui-tab-group class="content-inner-tabs" dropdown-content-direction="vertical">
						${t.map(
      (e) => r`
								<uui-tab
									label=${e.label}
									?active=${this._activeTab === e.id}
									@click=${() => {
        this._activeTab = e.id;
      }}>
									${e.label}
								</uui-tab>
							`
    )}
					</uui-tab-group>

					${l(this, i, S).call(this)}
				</div>

				<div slot="actions">
					<uui-button label="Cancel" @click=${l(this, i, z)}>Cancel</uui-button>
					<uui-button
						look="primary"
						color="positive"
						label="Confirm"
						?disabled=${this._selectedTargets.size === 0}
						@click=${l(this, i, T)}>
						Map to ${this._selectedTargets.size} field${this._selectedTargets.size !== 1 ? "s" : ""}
					</uui-button>
				</div>
			</umb-body-layout>
		`;
  }
};
i = /* @__PURE__ */ new WeakSet();
n = function() {
  return this.data?.destination;
};
y = function() {
  const t = /* @__PURE__ */ new Map();
  for (const e of this.data?.existingMappings ?? [])
    if (e.enabled !== !1)
      for (const a of e.destinations)
        t.set(l(this, i, v).call(this, a.target, a.blockKey), e.source);
  return t;
};
h = function(t) {
  return t.replace(/\.(content|heading)$/, "").split("-").map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(" ");
};
g = function() {
  if (!c(this, i, n)) return [];
  const t = [], e = new Set(c(this, i, n).fields.map((a) => a.tab).filter(Boolean));
  for (const a of e)
    t.push({
      id: a.toLowerCase().replace(/\s+/g, "-"),
      label: a
    });
  for (const a of m(c(this, i, n))) {
    const s = a.tab ?? "Page Content";
    e.has(s) || (e.add(s), t.push({
      id: s.toLowerCase().replace(/\s+/g, "-"),
      label: s
    }));
  }
  return t;
};
v = function(t, e) {
  return e ? `${e}:${t}` : t;
};
f = function(t, e, a) {
  const s = l(this, i, v).call(this, t, e), o = new Map(this._selectedTargets);
  o.has(s) ? o.delete(s) : o.set(s, { target: t, blockKey: e, contentTypeKey: a }), this._selectedTargets = o;
};
T = function() {
  this.value = { selectedTargets: Array.from(this._selectedTargets.values()) }, this.modalContext?.submit();
};
z = function() {
  this.modalContext?.reject();
};
C = function(t) {
  const e = this._selectedTargets.has(t.alias), a = c(this, i, y).get(t.alias);
  return r`
			<div class="field-item ${e ? "field-selected" : ""}" @click=${() => l(this, i, f).call(this, t.alias)}>
				<uui-checkbox
					label="Select ${t.label}"
					?checked=${e}
					@click=${(s) => s.stopPropagation()}
					@change=${() => l(this, i, f).call(this, t.alias)}>
				</uui-checkbox>
				<div class="field-info">
					<span class="field-label">${t.label}</span>
					${a ? r`<span class="field-mapped" title="Mapped from: ${l(this, i, h).call(this, a)}">${l(this, i, h).call(this, a)}</span>` : d}
					<span class="field-type">${t.type}</span>
				</div>
			</div>
		`;
};
w = function(t) {
  if (!c(this, i, n)) return d;
  const e = c(this, i, n).fields.filter((a) => a.tab === t);
  return e.length === 0 ? r`<p class="empty-message">No fields in this tab.</p>` : r`
			<div class="field-list">
				${e.map((a) => l(this, i, C).call(this, a))}
			</div>
		`;
};
M = function(t) {
  if (!c(this, i, n)) return d;
  const e = m(c(this, i, n)).filter((a) => (a.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === t);
  return e.length ? r`
			${e.map((a) => l(this, i, P).call(this, a))}
		` : r`<p class="empty-message">No blocks configured.</p>`;
};
P = function(t) {
  return r`
			<div class="block-grid">
				<div class="block-grid-header">
					<span class="block-grid-label">${t.label}</span>
				</div>
				<div class="block-list">
					${t.blocks.map(
    (e) => r`
							<div class="block-item">
								<div class="block-header">
									<umb-icon name="icon-box"></umb-icon>
									<span class="block-label">${e.label}</span>
								</div>
								${e.properties?.length ? r`
										<div class="block-properties">
											${e.properties.map((a) => {
      const s = l(this, i, v).call(this, a.alias, e.key), o = this._selectedTargets.has(s), u = c(this, i, y).get(s);
      return r`
													<div class="block-property ${o ? "field-selected" : ""}" @click=${() => l(this, i, f).call(this, a.alias, e.key, e.contentTypeKey)}>
														<uui-checkbox
															label="Select ${a.label || a.alias}"
															?checked=${o}
															@click=${(b) => b.stopPropagation()}
															@change=${() => l(this, i, f).call(this, a.alias, e.key, e.contentTypeKey)}>
														</uui-checkbox>
														<span class="block-property-label">${a.label || a.alias}</span>
														${u ? r`<span class="field-mapped" title="Mapped from: ${l(this, i, h).call(this, u)}">${l(this, i, h).call(this, u)}</span>` : d}
														<span class="field-type">${a.type}</span>
													</div>
												`;
    })}
										</div>
									` : d}
							</div>
						`
  )}
				</div>
			</div>
		`;
};
S = function() {
  if (!c(this, i, n)) return d;
  const t = c(this, i, n).fields.find(
    (a) => a.tab && a.tab.toLowerCase().replace(/\s+/g, "-") === this._activeTab
  )?.tab, e = m(c(this, i, n)).some((a) => (a.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-") === this._activeTab);
  return r`
			${t ? l(this, i, w).call(this, t) : d}
			${e ? l(this, i, M).call(this, this._activeTab) : d}
		`;
};
p.styles = [
  U,
  D`
			:host {
				display: block;
				height: 100%;
				--uui-tab-background: var(--uui-color-surface);
			}

			.tab-content {
				display: flex;
				flex-direction: column;
			}

			/* Inner tabs — bleed edge-to-edge past body layout padding */
			.content-inner-tabs {
				margin: calc(var(--uui-size-layout-1) * -1);
				margin-bottom: var(--uui-size-space-4);
				background: var(--uui-color-surface);
				--uui-tab-background: var(--uui-color-surface);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.empty-message {
				color: var(--uui-color-text-alt);
				font-style: italic;
				padding: var(--uui-size-space-4);
			}

			.field-list {
				display: flex;
				flex-direction: column;
			}

			.field-item {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				border-bottom: 1px solid var(--uui-color-border);
				cursor: pointer;
			}

			.field-item:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.field-item.field-selected {
				background: var(--uui-color-selected);
			}

			.field-item:last-child {
				border-bottom: none;
			}

			.field-info {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				flex: 1;
			}

			.field-label {
				font-weight: 600;
			}

			.field-type {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface-alt);
				padding: 2px 8px;
				border-radius: var(--uui-border-radius);
			}

			.field-mapped {
				font-size: var(--uui-type-small-size);
				color: #fff;
				background: var(--uui-color-positive-standalone);
				padding: 2px 8px;
				border-radius: var(--uui-border-radius);
			}

			.block-grid {
				margin-bottom: var(--uui-size-space-3);
			}

			.block-grid-header {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.block-grid-label {
				font-weight: 600;
			}

			.block-list {
				display: flex;
				flex-direction: column;
			}

			.block-item {
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				padding-left: var(--uui-size-space-6);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.block-item:last-child {
				border-bottom: none;
			}

			.block-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				margin-bottom: var(--uui-size-space-2);
			}

			.block-label {
				font-weight: 600;
			}

			.block-properties {
				padding-left: var(--uui-size-space-5);
			}

			.block-property {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-2) var(--uui-size-space-3);
				cursor: pointer;
				border-radius: var(--uui-border-radius);
			}

			.block-property:hover {
				background: var(--uui-color-surface-emphasis);
			}

			.block-property.field-selected {
				background: var(--uui-color-selected);
			}

			.block-property-label {
				font-size: var(--uui-type-small-size);
			}
		`
];
k([
  _()
], p.prototype, "_activeTab", 2);
k([
  _()
], p.prototype, "_selectedTargets", 2);
p = k([
  E("up-doc-destination-picker-modal")
], p);
const G = p;
export {
  p as UpDocDestinationPickerModalElement,
  G as default
};
//# sourceMappingURL=destination-picker-modal.element-xZNmz2hz.js.map
