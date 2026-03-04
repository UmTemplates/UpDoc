import { c as N } from "./workflow.service-DRM8gMCY.js";
import { html as f, nothing as A, css as Z, state as p, customElement as q } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as G } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as X } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as j } from "@umbraco-cms/backoffice/auth";
import { _ as V, a as Y } from "./pdf-CwFtZUSJ.js";
var J = Object.defineProperty, K = Object.getOwnPropertyDescriptor, D = (a) => {
  throw TypeError(a);
}, u = (a, t, e, r) => {
  for (var o = r > 1 ? void 0 : r ? K(t, e) : t, n = a.length - 1, l; n >= 0; n--)
    (l = a[n]) && (o = (r ? l(t, e, o) : l(o)) || o);
  return r && o && J(t, e, o), o;
}, C = (a, t, e) => t.has(a) || D("Cannot " + e), v = (a, t, e) => (C(a, t, "read from private field"), e ? e.call(a) : t.get(a)), Q = (a, t, e) => t.has(a) ? D("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(a) : t.set(a, e), i = (a, t, e) => (C(a, t, "access private method"), e), s, I, R, m, g, S, d, w, z, $, T, E, H, M, L, O, U, W, F, B, P, b, k;
V.workerSrc = "/App_Plugins/UpDoc/dist/pdf.worker.min.mjs";
const y = [
  "#e84855",
  "#f9dc5c",
  "#3185fc",
  "#5bba6f",
  "#e56399",
  "#8338ec",
  "#ff6d00",
  "#06d6a0",
  "#118ab2",
  "#ef476f"
];
let h = class extends X {
  constructor() {
    super(...arguments), Q(this, s), this._pdfDoc = null, this._currentPage = 1, this._totalPages = 0, this._availablePages = [], this._scale = 1, this._loading = !0, this._error = "", this._areas = [], this._selectedAreaId = null, this._mode = "draw", this._pageWidth = 0, this._pageHeight = 0, this._isDrawing = !1, this._drawStart = { x: 0, y: 0 }, this._drawCurrent = { x: 0, y: 0 }, this._isDragging = !1, this._isResizing = !1, this._resizeHandle = "", this._dragStart = { x: 0, y: 0 }, this._dragAreaStart = { x: 0, y: 0, w: 0, h: 0 }, this._canvas = null, this._overlay = null, this._nextId = 1;
  }
  async firstUpdated() {
    await i(this, s, R).call(this);
  }
  render() {
    return this._loading ? f`
				<umb-body-layout headline="Define Areas">
					<div class="loading">
						<uui-loader></uui-loader>
						<span>Loading PDF...</span>
					</div>
				</umb-body-layout>
			` : this._error ? f`
				<umb-body-layout headline="Define Areas">
					<div class="error">${this._error}</div>
					<uui-button slot="actions" label="Close" @click=${i(this, s, P)}></uui-button>
				</umb-body-layout>
			` : f`
			<umb-body-layout headline="Define Areas">
				<div class="editor-layout">
					<!-- Left: PDF + canvas -->
					<div class="pdf-panel">
						<div class="toolbar">
							<div class="toolbar-group">
								<uui-button
									compact
									look=${this._mode === "draw" ? "primary" : "secondary"}
									label="Draw"
									@click=${() => {
      this._mode = "draw";
    }}>
									Draw
								</uui-button>
								<uui-button
									compact
									look=${this._mode === "select" ? "primary" : "secondary"}
									label="Select"
									@click=${() => {
      this._mode = "select";
    }}>
									Select
								</uui-button>
							</div>

							<div class="toolbar-group">
								<uui-button compact label="Zoom out" @click=${i(this, s, O)}>&minus;</uui-button>
								<span class="zoom-info">${Math.round(this._scale * 100)}%</span>
								<uui-button compact label="Zoom in" @click=${i(this, s, L)}>+</uui-button>
							</div>
						</div>

						<div class="canvas-container">
							<canvas id="pdf-canvas"></canvas>
							<canvas id="overlay-canvas"
								@mousedown=${i(this, s, T)}
								@mousemove=${i(this, s, E)}
								@mouseup=${i(this, s, H)}
								style="cursor: ${this._mode === "draw" ? "crosshair" : "default"}">
							</canvas>
						</div>
					</div>

					<!-- Right: Pages + Areas -->
					<div class="area-panel">
						${this._availablePages.length > 1 ? f`
							<uui-box headline="Pages">
								${this._availablePages.map((a) => {
      const t = this._areas.filter((r) => r.page === a).length, e = a === this._currentPage;
      return f`
										<div class="page-item ${e ? "active" : ""}"
											@click=${() => i(this, s, M).call(this, a)}>
											<span class="page-item-label">Page ${a}</span>
											${t > 0 ? f`
												<span class="page-item-count">${t} area${t !== 1 ? "s" : ""}</span>
											` : A}
										</div>
									`;
    })}
							</uui-box>
						` : A}

						<uui-box headline="Areas on this page" style="${this._availablePages.length > 1 ? "margin-top: var(--uui-size-space-4)" : ""}">
							${v(this, s, k).length === 0 ? f`<p class="empty-hint">Draw an area on the PDF to get started.</p>` : v(this, s, k).map((a) => f`
									<div class="area-item ${a.id === this._selectedAreaId ? "selected" : ""}"
										@click=${() => i(this, s, U).call(this, a.id)}>
										<span class="area-color" style="background: ${a.color}"></span>
										<span class="area-name">${a.name || "Unnamed"}</span>
										<uui-button compact look="secondary" label="Delete"
											@click=${(t) => {
      t.stopPropagation(), i(this, s, W).call(this, a.id);
    }}>
											<uui-icon name="icon-trash"></uui-icon>
										</uui-button>
									</div>
								`)}
						</uui-box>

						${v(this, s, b) ? f`
							<uui-box headline="Edit Area" style="margin-top: var(--uui-size-space-4)">
								<div class="edit-form">
									<label>Name</label>
									<uui-input
										.value=${v(this, s, b).name}
										@change=${(a) => {
      i(this, s, F).call(this, this._selectedAreaId, a.target.value);
    }}>
									</uui-input>

									<label>Color</label>
									<div class="color-swatches">
										${y.map((a) => f`
											<button
												class="color-swatch ${a === v(this, s, b).color ? "active" : ""}"
												style="background: ${a}"
												@click=${() => {
      const t = this._areas.find((e) => e.id === this._selectedAreaId);
      t && (t.color = a, this._areas = [...this._areas], i(this, s, d).call(this));
    }}>
											</button>
										`)}
									</div>
								</div>
							</uui-box>
						` : A}
					</div>
				</div>

				<uui-button
					slot="actions"
					look="primary"
					color="positive"
					label="Save"
					?disabled=${this._areas.length === 0}
					@click=${i(this, s, B)}>
					Save
				</uui-button>
				<uui-button
					slot="actions"
					label="Cancel"
					@click=${i(this, s, P)}>
					Cancel
				</uui-button>
			</umb-body-layout>
		`;
  }
};
s = /* @__PURE__ */ new WeakSet();
I = async function() {
  return (await this.getContext(j)).getLatestToken();
};
R = async function() {
  const a = this.data?.workflowAlias;
  if (!a) {
    this._error = "No workflow name provided.", this._loading = !1;
    return;
  }
  try {
    const t = await i(this, s, I).call(this), e = await N(a, t);
    if (!e) {
      this._error = "Could not load PDF file.", this._loading = !1;
      return;
    }
    const r = await e.arrayBuffer(), o = Y({ data: r });
    this._pdfDoc = await o.promise, this._totalPages = this._pdfDoc.numPages;
    const n = this.data?.selectedPages;
    n && n.length > 0 ? this._availablePages = n.filter((l) => l >= 1 && l <= this._totalPages).sort((l, c) => l - c) : this._availablePages = Array.from({ length: this._totalPages }, (l, c) => c + 1), this._currentPage = this._availablePages[0] ?? 1, this.data?.existingTemplate?.areas?.length && (this._areas = this.data.existingTemplate.areas.map((l, c) => ({
      id: `area-${c + 1}`,
      name: l.name,
      property: l.property,
      page: l.page,
      type: l.type,
      x: l.bounds.x,
      y: l.bounds.y,
      w: l.bounds.width,
      h: l.bounds.height,
      color: l.color || y[c % y.length],
      expectedSections: l.expectedSections,
      notes: l.notes
    })), this._nextId = this._areas.length + 1), this._loading = !1, await this.updateComplete, await i(this, s, m).call(this);
  } catch (t) {
    this._error = `Failed to load PDF: ${t}`, this._loading = !1;
  }
};
m = async function() {
  if (!this._pdfDoc) return;
  const a = await this._pdfDoc.getPage(this._currentPage), t = a.getViewport({ scale: this._scale });
  if (this._pageWidth = t.width, this._pageHeight = t.height, this._canvas = this.renderRoot.querySelector("#pdf-canvas"), this._overlay = this.renderRoot.querySelector("#overlay-canvas"), !this._canvas || !this._overlay) return;
  this._canvas.width = t.width, this._canvas.height = t.height, this._overlay.width = t.width, this._overlay.height = t.height;
  const e = this._canvas.getContext("2d");
  await a.render({ canvasContext: e, viewport: t }).promise, i(this, s, d).call(this);
};
g = function(a, t) {
  const e = a * this._scale, r = (this._pageHeight / this._scale - t) * this._scale;
  return { cx: e, cy: r };
};
S = function(a, t) {
  const e = a / this._scale, r = this._pageHeight / this._scale - t / this._scale;
  return { px: e, py: r };
};
d = function() {
  if (!this._overlay) return;
  const a = this._overlay.getContext("2d");
  a.clearRect(0, 0, this._overlay.width, this._overlay.height);
  for (const t of this._areas) {
    if (t.page !== this._currentPage) continue;
    const e = i(this, s, g).call(this, t.x, t.y + t.h), r = i(this, s, g).call(this, t.x + t.w, t.y), o = r.cx - e.cx, n = r.cy - e.cy;
    if (a.fillStyle = t.color + "30", a.fillRect(e.cx, e.cy, o, n), a.strokeStyle = t.color, a.lineWidth = t.id === this._selectedAreaId ? 3 : 2, a.strokeRect(e.cx, e.cy, o, n), a.fillStyle = t.color, a.font = "bold 12px sans-serif", a.fillText(t.name || "Unnamed", e.cx + 4, e.cy + 14), t.id === this._selectedAreaId) {
      const c = [
        { x: e.cx, y: e.cy },
        // top-left
        { x: e.cx + o, y: e.cy },
        // top-right
        { x: e.cx, y: e.cy + n },
        // bottom-left
        { x: e.cx + o, y: e.cy + n }
        // bottom-right
      ];
      a.fillStyle = t.color;
      for (const _ of c)
        a.fillRect(_.x - 8 / 2, _.y - 8 / 2, 8, 8);
    }
  }
  if (this._isDrawing) {
    const t = Math.min(this._drawStart.x, this._drawCurrent.x), e = Math.min(this._drawStart.y, this._drawCurrent.y), r = Math.abs(this._drawCurrent.x - this._drawStart.x), o = Math.abs(this._drawCurrent.y - this._drawStart.y);
    a.strokeStyle = y[this._areas.length % y.length], a.lineWidth = 2, a.setLineDash([5, 5]), a.strokeRect(t, e, r, o), a.setLineDash([]);
  }
};
w = function(a) {
  if (!this._overlay) return { x: 0, y: 0 };
  const t = this._overlay.getBoundingClientRect();
  return { x: a.clientX - t.left, y: a.clientY - t.top };
};
z = function(a, t) {
  for (const e of this._areas) {
    if (e.page !== this._currentPage) continue;
    const r = i(this, s, g).call(this, e.x, e.y + e.h), o = i(this, s, g).call(this, e.x + e.w, e.y);
    if (a >= r.cx && a <= o.cx && t >= r.cy && t <= o.cy)
      return e;
  }
  return null;
};
$ = function(a, t, e) {
  const r = i(this, s, g).call(this, a.x, a.y + a.h), o = i(this, s, g).call(this, a.x + a.w, a.y), n = 10, l = Math.abs(t - r.cx) < n, c = Math.abs(t - o.cx) < n, _ = Math.abs(e - r.cy) < n, x = Math.abs(e - o.cy) < n;
  return _ && l ? "tl" : _ && c ? "tr" : x && l ? "bl" : x && c ? "br" : "";
};
T = function(a) {
  const t = i(this, s, w).call(this, a);
  if (this._mode === "draw") {
    this._isDrawing = !0, this._drawStart = t, this._drawCurrent = t;
    return;
  }
  const e = i(this, s, z).call(this, t.x, t.y);
  if (e) {
    this._selectedAreaId = e.id, i(this, s, d).call(this);
    const r = i(this, s, $).call(this, e, t.x, t.y);
    r ? (this._isResizing = !0, this._resizeHandle = r, this._dragStart = t, this._dragAreaStart = { x: e.x, y: e.y, w: e.w, h: e.h }) : (this._isDragging = !0, this._dragStart = t, this._dragAreaStart = { x: e.x, y: e.y, w: e.w, h: e.h });
  } else
    this._selectedAreaId = null, i(this, s, d).call(this);
};
E = function(a) {
  const t = i(this, s, w).call(this, a);
  if (this._isDrawing) {
    this._drawCurrent = t, i(this, s, d).call(this);
    return;
  }
  if (this._isDragging && this._selectedAreaId) {
    const e = this._areas.find((n) => n.id === this._selectedAreaId);
    if (!e) return;
    const r = (t.x - this._dragStart.x) / this._scale, o = -(t.y - this._dragStart.y) / this._scale;
    e.x = this._dragAreaStart.x + r, e.y = this._dragAreaStart.y + o, this._areas = [...this._areas], i(this, s, d).call(this);
    return;
  }
  if (this._isResizing && this._selectedAreaId) {
    const e = this._areas.find((x) => x.id === this._selectedAreaId);
    if (!e) return;
    const r = (t.x - this._dragStart.x) / this._scale, o = -(t.y - this._dragStart.y) / this._scale, { x: n, y: l, w: c, h: _ } = this._dragAreaStart;
    switch (this._resizeHandle) {
      case "br":
        e.w = Math.max(20, c + r), e.y = l + o, e.h = Math.max(20, _ - o);
        break;
      case "bl":
        e.x = n + r, e.w = Math.max(20, c - r), e.y = l + o, e.h = Math.max(20, _ - o);
        break;
      case "tr":
        e.w = Math.max(20, c + r), e.h = Math.max(20, _ + o);
        break;
      case "tl":
        e.x = n + r, e.w = Math.max(20, c - r), e.h = Math.max(20, _ + o);
        break;
    }
    this._areas = [...this._areas], i(this, s, d).call(this);
    return;
  }
  if (this._mode === "select" && this._overlay) {
    const e = i(this, s, z).call(this, t.x, t.y);
    if (e && this._selectedAreaId === e.id) {
      const r = i(this, s, $).call(this, e, t.x, t.y);
      r === "tl" || r === "br" ? this._overlay.style.cursor = "nwse-resize" : r === "tr" || r === "bl" ? this._overlay.style.cursor = "nesw-resize" : this._overlay.style.cursor = "move";
    } else e ? this._overlay.style.cursor = "pointer" : this._overlay.style.cursor = "default";
  }
};
H = function(a) {
  if (this._isDrawing) {
    this._isDrawing = !1;
    const t = i(this, s, w).call(this, a), e = Math.abs(t.x - this._drawStart.x), r = Math.abs(t.y - this._drawStart.y);
    if (e > 10 && r > 10) {
      const o = i(this, s, S).call(this, Math.min(this._drawStart.x, t.x), Math.min(this._drawStart.y, t.y)), n = i(this, s, S).call(this, Math.max(this._drawStart.x, t.x), Math.max(this._drawStart.y, t.y)), l = {
        id: `area-${this._nextId++}`,
        name: `Area ${this._areas.filter((c) => c.page === this._currentPage).length + 1}`,
        property: "",
        page: this._currentPage,
        type: "",
        x: o.px,
        y: n.py,
        w: n.px - o.px,
        h: o.py - n.py,
        color: y[this._areas.length % y.length],
        expectedSections: [],
        notes: ""
      };
      this._areas = [...this._areas, l], this._selectedAreaId = l.id, this._mode = "select";
    }
    i(this, s, d).call(this);
    return;
  }
  this._isDragging = !1, this._isResizing = !1;
};
M = async function(a) {
  this._availablePages.includes(a) && (this._currentPage = a, this._selectedAreaId = null, await this.updateComplete, await i(this, s, m).call(this));
};
L = function() {
  this._scale = Math.min(3, this._scale + 0.25), i(this, s, m).call(this);
};
O = function() {
  this._scale = Math.max(0.5, this._scale - 0.25), i(this, s, m).call(this);
};
U = function(a) {
  this._selectedAreaId = a, this._mode = "select";
  const t = this._areas.find((e) => e.id === a);
  t && t.page !== this._currentPage ? i(this, s, M).call(this, t.page) : i(this, s, d).call(this);
};
W = function(a) {
  this._areas = this._areas.filter((t) => t.id !== a), this._selectedAreaId === a && (this._selectedAreaId = null), i(this, s, d).call(this);
};
F = function(a, t) {
  const e = this._areas.find((r) => r.id === a);
  e && (e.name = t, this._areas = [...this._areas], i(this, s, d).call(this));
};
B = function() {
  const a = {
    templateName: this.data?.existingTemplate?.templateName || this.data?.workflowAlias || "Area Template",
    sourceFile: this.data?.existingTemplate?.sourceFile || "",
    pageSize: {
      width: this._pageWidth / this._scale,
      height: this._pageHeight / this._scale
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    areas: this._areas.map((t) => ({
      name: t.name,
      property: t.property,
      page: t.page,
      type: t.type,
      bounds: {
        x: Math.round(t.x * 10) / 10,
        y: Math.round(t.y * 10) / 10,
        width: Math.round(t.w * 10) / 10,
        height: Math.round(t.h * 10) / 10
      },
      color: t.color,
      expectedSections: t.expectedSections,
      notes: t.notes
    }))
  };
  this.value = { template: a }, this._submitModal();
};
P = function() {
  this._rejectModal();
};
b = function() {
  return this._areas.find((a) => a.id === this._selectedAreaId) ?? null;
};
k = function() {
  return this._areas.filter((a) => a.page === this._currentPage);
};
h.styles = [
  G,
  Z`
			:host {
				display: block;
				height: 100%;
			}

			.loading {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: var(--uui-size-space-4);
				padding: var(--uui-size-space-6);
			}

			.error {
				padding: var(--uui-size-space-4);
				color: var(--uui-color-danger);
			}

			.editor-layout {
				display: flex;
				gap: var(--uui-size-space-4);
				height: 100%;
				min-height: 0;
			}

			.pdf-panel {
				flex: 1;
				display: flex;
				flex-direction: column;
				min-width: 0;
			}

			.toolbar {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-4);
				padding: var(--uui-size-space-2) var(--uui-size-space-3);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
				flex-shrink: 0;
			}

			.toolbar-group {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
			}

			.zoom-info {
				font-size: var(--uui-type-small-size);
				white-space: nowrap;
			}

			.canvas-container {
				flex: 1;
				overflow: auto;
				position: relative;
				background: var(--uui-color-surface-alt);
			}

			.canvas-container canvas {
				display: block;
			}

			#overlay-canvas {
				position: absolute;
				top: 0;
				left: 0;
			}

			.area-panel {
				width: 300px;
				flex-shrink: 0;
				overflow-y: auto;
				padding-right: var(--uui-size-space-2);
			}

			.page-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: var(--uui-size-space-2) var(--uui-size-space-3);
				cursor: pointer;
				border-radius: var(--uui-border-radius);
				border: 1px solid transparent;
			}

			.page-item:hover {
				background: var(--uui-color-surface-alt);
			}

			.page-item.active {
				background: var(--uui-color-surface-emphasis);
				border-left: 3px solid var(--uui-color-current);
				font-weight: 600;
			}

			.page-item-label {
				flex: 1;
			}

			.page-item-count {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}

			.area-item {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-2) var(--uui-size-space-3);
				cursor: pointer;
				border-radius: var(--uui-border-radius);
				border: 1px solid transparent;
			}

			.area-item:hover {
				background: var(--uui-color-surface-alt);
			}

			.area-item.selected {
				background: var(--uui-color-selected);
				border-color: var(--uui-color-selected-emphasis);
			}

			.area-color {
				width: 14px;
				height: 14px;
				border-radius: 3px;
				flex-shrink: 0;
			}

			.area-name {
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.empty-hint {
				color: var(--uui-color-text-alt);
				font-size: var(--uui-type-small-size);
				text-align: center;
				padding: var(--uui-size-space-4);
			}

			.edit-form {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-3);
			}

			.edit-form label {
				font-size: var(--uui-type-small-size);
				font-weight: bold;
			}

			.color-swatches {
				display: flex;
				flex-wrap: wrap;
				gap: var(--uui-size-space-2);
			}

			.color-swatch {
				width: 24px;
				height: 24px;
				border-radius: 4px;
				border: 2px solid transparent;
				cursor: pointer;
				padding: 0;
			}

			.color-swatch:hover {
				opacity: 0.8;
			}

			.color-swatch.active {
				border-color: var(--uui-color-text);
				box-shadow: 0 0 0 2px var(--uui-color-surface);
			}
		`
];
u([
  p()
], h.prototype, "_pdfDoc", 2);
u([
  p()
], h.prototype, "_currentPage", 2);
u([
  p()
], h.prototype, "_totalPages", 2);
u([
  p()
], h.prototype, "_scale", 2);
u([
  p()
], h.prototype, "_loading", 2);
u([
  p()
], h.prototype, "_error", 2);
u([
  p()
], h.prototype, "_areas", 2);
u([
  p()
], h.prototype, "_selectedAreaId", 2);
u([
  p()
], h.prototype, "_mode", 2);
u([
  p()
], h.prototype, "_pageWidth", 2);
u([
  p()
], h.prototype, "_pageHeight", 2);
h = u([
  q("pdf-area-editor-modal")
], h);
const ot = h;
export {
  h as PdfAreaEditorModalElement,
  ot as default
};
//# sourceMappingURL=pdf-area-editor-modal.element-DsMuUOTk.js.map
