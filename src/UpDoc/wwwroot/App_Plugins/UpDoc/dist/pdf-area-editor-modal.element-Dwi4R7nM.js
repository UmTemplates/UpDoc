import { c as B } from "./workflow.service-DwTP3LNQ.js";
import { html as _, nothing as b, css as Z, state as p, customElement as G } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as q } from "@umbraco-cms/backoffice/style";
import { UmbModalBaseElement as X } from "@umbraco-cms/backoffice/modal";
import { UMB_AUTH_CONTEXT as j } from "@umbraco-cms/backoffice/auth";
import { _ as V, a as Y } from "./pdf-CwFtZUSJ.js";
var J = Object.defineProperty, K = Object.getOwnPropertyDescriptor, D = (e) => {
  throw TypeError(e);
}, d = (e, t, a, i) => {
  for (var o = i > 1 ? void 0 : i ? K(t, a) : t, l = e.length - 1, n; l >= 0; l--)
    (n = e[l]) && (o = (i ? n(t, a, o) : n(o)) || o);
  return i && o && J(t, a, o), o;
}, C = (e, t, a) => t.has(e) || D("Cannot " + a), m = (e, t, a) => (C(e, t, "read from private field"), a ? a.call(e) : t.get(e)), Q = (e, t, a) => t.has(e) ? D("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), r = (e, t, a) => (C(e, t, "access private method"), a), s, I, R, v, g, S, u, A, k, $, T, E, L, M, H, N, O, U, W, F, P, w, z;
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
    super(...arguments), Q(this, s), this._pdfDoc = null, this._currentPage = 1, this._totalPages = 0, this._availablePages = [], this._scale = 1, this._loading = !0, this._error = "", this._areas = [], this._selectedAreaId = null, this._duplicateNameAreaId = null, this._mode = "draw", this._pageWidth = 0, this._pageHeight = 0, this._isDrawing = !1, this._drawStart = { x: 0, y: 0 }, this._drawCurrent = { x: 0, y: 0 }, this._isDragging = !1, this._isResizing = !1, this._resizeHandle = "", this._dragStart = { x: 0, y: 0 }, this._dragAreaStart = { x: 0, y: 0, w: 0, h: 0 }, this._canvas = null, this._overlay = null, this._nextId = 1;
  }
  async firstUpdated() {
    await r(this, s, R).call(this);
  }
  render() {
    return this._loading ? _`
				<umb-body-layout headline="Define Areas">
					<div class="loading">
						<uui-loader></uui-loader>
						<span>Loading PDF...</span>
					</div>
				</umb-body-layout>
			` : this._error ? _`
				<umb-body-layout headline="Define Areas">
					<div class="error">${this._error}</div>
					<uui-button slot="actions" label="Close" @click=${r(this, s, P)}></uui-button>
				</umb-body-layout>
			` : _`
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
								<uui-button compact label="Zoom out" @click=${r(this, s, N)}>&minus;</uui-button>
								<span class="zoom-info">${Math.round(this._scale * 100)}%</span>
								<uui-button compact label="Zoom in" @click=${r(this, s, H)}>+</uui-button>
							</div>
						</div>

						<div class="canvas-container">
							<canvas id="pdf-canvas"></canvas>
							<canvas id="overlay-canvas"
								@mousedown=${r(this, s, T)}
								@mousemove=${r(this, s, E)}
								@mouseup=${r(this, s, L)}
								style="cursor: ${this._mode === "draw" ? "crosshair" : "default"}">
							</canvas>
						</div>
					</div>

					<!-- Right: Pages + Areas -->
					<div class="area-panel">
						${this._availablePages.length > 1 ? _`
							<uui-box headline="Pages">
								${this._availablePages.map((e) => {
      const t = this._areas.filter((i) => i.page === e).length, a = e === this._currentPage;
      return _`
										<div class="page-item ${a ? "active" : ""}"
											@click=${() => r(this, s, M).call(this, e)}>
											<span class="page-item-label">Page ${e}</span>
											${t > 0 ? _`
												<span class="page-item-count">${t} area${t !== 1 ? "s" : ""}</span>
											` : b}
										</div>
									`;
    })}
							</uui-box>
						` : b}

						<uui-box headline="Areas on this page" style="${this._availablePages.length > 1 ? "margin-top: var(--uui-size-space-4)" : ""}">
							${m(this, s, z).length === 0 ? _`<p class="empty-hint">Draw an area on the PDF to get started.</p>` : m(this, s, z).map((e) => _`
									<div class="area-item ${e.id === this._selectedAreaId ? "selected" : ""}"
										@click=${() => r(this, s, O).call(this, e.id)}>
										<span class="area-color" style="background: ${e.color}"></span>
										<span class="area-name">${e.name || "Unnamed"}</span>
										<uui-button compact look="secondary" label="Delete"
											@click=${(t) => {
      t.stopPropagation(), r(this, s, U).call(this, e.id);
    }}>
											<uui-icon name="icon-trash"></uui-icon>
										</uui-button>
									</div>
								`)}
						</uui-box>

						${m(this, s, w) ? _`
							<uui-box headline="Edit Area" style="margin-top: var(--uui-size-space-4)">
								<div class="edit-form">
									<label>Name</label>
									<uui-input
										.value=${m(this, s, w).name}
										?error=${this._duplicateNameAreaId === this._selectedAreaId}
										@input=${(e) => {
      r(this, s, W).call(this, this._selectedAreaId, e.target.value);
    }}>
									</uui-input>
									${this._duplicateNameAreaId === this._selectedAreaId ? _`
										<small class="name-warning">
											Another area on this page already has this name. Give each area on a
											page a distinct name so their order is preserved correctly.
										</small>
									` : b}

									<label>Color</label>
									<div class="color-swatches">
										${y.map((e) => _`
											<button
												class="color-swatch ${e === m(this, s, w).color ? "active" : ""}"
												style="background: ${e}"
												@click=${() => {
      const t = this._areas.find((a) => a.id === this._selectedAreaId);
      t && (t.color = e, this._areas = [...this._areas], r(this, s, u).call(this));
    }}>
											</button>
										`)}
									</div>
								</div>
							</uui-box>
						` : b}
					</div>
				</div>

				<uui-button
					slot="actions"
					look="primary"
					color="positive"
					label="Save"
					?disabled=${this._areas.length === 0}
					@click=${r(this, s, F)}>
					Save
				</uui-button>
				<uui-button
					slot="actions"
					label="Cancel"
					@click=${r(this, s, P)}>
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
  const e = this.data?.workflowAlias;
  if (!e) {
    this._error = "No workflow name provided.", this._loading = !1;
    return;
  }
  try {
    const t = await r(this, s, I).call(this), a = await B(e, t);
    if (!a) {
      this._error = "Could not load PDF file.", this._loading = !1;
      return;
    }
    const i = await a.arrayBuffer(), o = Y({ data: i });
    this._pdfDoc = await o.promise, this._totalPages = this._pdfDoc.numPages;
    const l = this.data?.selectedPages;
    l && l.length > 0 ? this._availablePages = l.filter((n) => n >= 1 && n <= this._totalPages).sort((n, c) => n - c) : this._availablePages = Array.from({ length: this._totalPages }, (n, c) => c + 1), this._currentPage = this._availablePages[0] ?? 1, this.data?.existingTemplate?.areas?.length && (this._areas = this.data.existingTemplate.areas.map((n, c) => ({
      id: `area-${c + 1}`,
      name: n.name,
      property: n.property,
      page: n.page,
      type: n.type,
      x: n.bounds.x,
      y: n.bounds.y,
      w: n.bounds.width,
      h: n.bounds.height,
      color: n.color || y[c % y.length],
      expectedSections: n.expectedSections,
      notes: n.notes
    })), this._nextId = this._areas.length + 1), this._loading = !1, await this.updateComplete, await r(this, s, v).call(this);
  } catch (t) {
    this._error = `Failed to load PDF: ${t}`, this._loading = !1;
  }
};
v = async function() {
  if (!this._pdfDoc) return;
  const e = await this._pdfDoc.getPage(this._currentPage), t = e.getViewport({ scale: this._scale });
  if (this._pageWidth = t.width, this._pageHeight = t.height, this._canvas = this.renderRoot.querySelector("#pdf-canvas"), this._overlay = this.renderRoot.querySelector("#overlay-canvas"), !this._canvas || !this._overlay) return;
  this._canvas.width = t.width, this._canvas.height = t.height, this._overlay.width = t.width, this._overlay.height = t.height;
  const a = this._canvas.getContext("2d");
  await e.render({ canvasContext: a, viewport: t }).promise, r(this, s, u).call(this);
};
g = function(e, t) {
  const a = e * this._scale, i = (this._pageHeight / this._scale - t) * this._scale;
  return { cx: a, cy: i };
};
S = function(e, t) {
  const a = e / this._scale, i = this._pageHeight / this._scale - t / this._scale;
  return { px: a, py: i };
};
u = function() {
  if (!this._overlay) return;
  const e = this._overlay.getContext("2d");
  e.clearRect(0, 0, this._overlay.width, this._overlay.height);
  for (const t of this._areas) {
    if (t.page !== this._currentPage) continue;
    const a = r(this, s, g).call(this, t.x, t.y + t.h), i = r(this, s, g).call(this, t.x + t.w, t.y), o = i.cx - a.cx, l = i.cy - a.cy;
    if (e.fillStyle = t.color + "30", e.fillRect(a.cx, a.cy, o, l), e.strokeStyle = t.color, e.lineWidth = t.id === this._selectedAreaId ? 3 : 2, e.strokeRect(a.cx, a.cy, o, l), e.fillStyle = t.color, e.font = "bold 12px sans-serif", e.fillText(t.name || "Unnamed", a.cx + 4, a.cy + 14), t.id === this._selectedAreaId) {
      const c = [
        { x: a.cx, y: a.cy },
        // top-left
        { x: a.cx + o, y: a.cy },
        // top-right
        { x: a.cx, y: a.cy + l },
        // bottom-left
        { x: a.cx + o, y: a.cy + l }
        // bottom-right
      ];
      e.fillStyle = t.color;
      for (const f of c)
        e.fillRect(f.x - 8 / 2, f.y - 8 / 2, 8, 8);
    }
  }
  if (this._isDrawing) {
    const t = Math.min(this._drawStart.x, this._drawCurrent.x), a = Math.min(this._drawStart.y, this._drawCurrent.y), i = Math.abs(this._drawCurrent.x - this._drawStart.x), o = Math.abs(this._drawCurrent.y - this._drawStart.y);
    e.strokeStyle = y[this._areas.length % y.length], e.lineWidth = 2, e.setLineDash([5, 5]), e.strokeRect(t, a, i, o), e.setLineDash([]);
  }
};
A = function(e) {
  if (!this._overlay) return { x: 0, y: 0 };
  const t = this._overlay.getBoundingClientRect();
  return { x: e.clientX - t.left, y: e.clientY - t.top };
};
k = function(e, t) {
  for (const a of this._areas) {
    if (a.page !== this._currentPage) continue;
    const i = r(this, s, g).call(this, a.x, a.y + a.h), o = r(this, s, g).call(this, a.x + a.w, a.y);
    if (e >= i.cx && e <= o.cx && t >= i.cy && t <= o.cy)
      return a;
  }
  return null;
};
$ = function(e, t, a) {
  const i = r(this, s, g).call(this, e.x, e.y + e.h), o = r(this, s, g).call(this, e.x + e.w, e.y), l = 10, n = Math.abs(t - i.cx) < l, c = Math.abs(t - o.cx) < l, f = Math.abs(a - i.cy) < l, x = Math.abs(a - o.cy) < l;
  return f && n ? "tl" : f && c ? "tr" : x && n ? "bl" : x && c ? "br" : "";
};
T = function(e) {
  const t = r(this, s, A).call(this, e);
  if (this._mode === "draw") {
    this._isDrawing = !0, this._drawStart = t, this._drawCurrent = t;
    return;
  }
  const a = r(this, s, k).call(this, t.x, t.y);
  if (a) {
    this._selectedAreaId = a.id, r(this, s, u).call(this);
    const i = r(this, s, $).call(this, a, t.x, t.y);
    i ? (this._isResizing = !0, this._resizeHandle = i, this._dragStart = t, this._dragAreaStart = { x: a.x, y: a.y, w: a.w, h: a.h }) : (this._isDragging = !0, this._dragStart = t, this._dragAreaStart = { x: a.x, y: a.y, w: a.w, h: a.h });
  } else
    this._selectedAreaId = null, r(this, s, u).call(this);
};
E = function(e) {
  const t = r(this, s, A).call(this, e);
  if (this._isDrawing) {
    this._drawCurrent = t, r(this, s, u).call(this);
    return;
  }
  if (this._isDragging && this._selectedAreaId) {
    const a = this._areas.find((l) => l.id === this._selectedAreaId);
    if (!a) return;
    const i = (t.x - this._dragStart.x) / this._scale, o = -(t.y - this._dragStart.y) / this._scale;
    a.x = this._dragAreaStart.x + i, a.y = this._dragAreaStart.y + o, this._areas = [...this._areas], r(this, s, u).call(this);
    return;
  }
  if (this._isResizing && this._selectedAreaId) {
    const a = this._areas.find((x) => x.id === this._selectedAreaId);
    if (!a) return;
    const i = (t.x - this._dragStart.x) / this._scale, o = -(t.y - this._dragStart.y) / this._scale, { x: l, y: n, w: c, h: f } = this._dragAreaStart;
    switch (this._resizeHandle) {
      case "br":
        a.w = Math.max(20, c + i), a.y = n + o, a.h = Math.max(20, f - o);
        break;
      case "bl":
        a.x = l + i, a.w = Math.max(20, c - i), a.y = n + o, a.h = Math.max(20, f - o);
        break;
      case "tr":
        a.w = Math.max(20, c + i), a.h = Math.max(20, f + o);
        break;
      case "tl":
        a.x = l + i, a.w = Math.max(20, c - i), a.h = Math.max(20, f + o);
        break;
    }
    this._areas = [...this._areas], r(this, s, u).call(this);
    return;
  }
  if (this._mode === "select" && this._overlay) {
    const a = r(this, s, k).call(this, t.x, t.y);
    if (a && this._selectedAreaId === a.id) {
      const i = r(this, s, $).call(this, a, t.x, t.y);
      i === "tl" || i === "br" ? this._overlay.style.cursor = "nwse-resize" : i === "tr" || i === "bl" ? this._overlay.style.cursor = "nesw-resize" : this._overlay.style.cursor = "move";
    } else a ? this._overlay.style.cursor = "pointer" : this._overlay.style.cursor = "default";
  }
};
L = function(e) {
  if (this._isDrawing) {
    this._isDrawing = !1;
    const t = r(this, s, A).call(this, e), a = Math.abs(t.x - this._drawStart.x), i = Math.abs(t.y - this._drawStart.y);
    if (a > 10 && i > 10) {
      const o = r(this, s, S).call(this, Math.min(this._drawStart.x, t.x), Math.min(this._drawStart.y, t.y)), l = r(this, s, S).call(this, Math.max(this._drawStart.x, t.x), Math.max(this._drawStart.y, t.y)), n = {
        id: `area-${this._nextId++}`,
        name: `Area ${this._areas.filter((c) => c.page === this._currentPage).length + 1}`,
        property: "",
        page: this._currentPage,
        type: "",
        x: o.px,
        y: l.py,
        w: l.px - o.px,
        h: o.py - l.py,
        color: y[this._areas.length % y.length],
        expectedSections: [],
        notes: ""
      };
      this._areas = [...this._areas, n], this._selectedAreaId = n.id, this._mode = "select";
    }
    r(this, s, u).call(this);
    return;
  }
  this._isDragging = !1, this._isResizing = !1;
};
M = async function(e) {
  this._availablePages.includes(e) && (this._currentPage = e, this._selectedAreaId = null, await this.updateComplete, await r(this, s, v).call(this));
};
H = function() {
  this._scale = Math.min(3, this._scale + 0.25), r(this, s, v).call(this);
};
N = function() {
  this._scale = Math.max(0.5, this._scale - 0.25), r(this, s, v).call(this);
};
O = function(e) {
  this._selectedAreaId = e, this._mode = "select";
  const t = this._areas.find((a) => a.id === e);
  t && t.page !== this._currentPage ? r(this, s, M).call(this, t.page) : r(this, s, u).call(this);
};
U = function(e) {
  this._areas = this._areas.filter((t) => t.id !== e), this._selectedAreaId === e && (this._selectedAreaId = null), r(this, s, u).call(this);
};
W = function(e, t) {
  const a = this._areas.find((l) => l.id === e);
  if (!a) return;
  const i = t.trim(), o = this._areas.some(
    (l) => l.id !== e && l.page === a.page && l.name.trim().toLowerCase() === i.toLowerCase()
  );
  this._duplicateNameAreaId = i && o ? e : null, a.name = t, this._areas = [...this._areas], r(this, s, u).call(this);
};
F = function() {
  const e = {
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
  this.value = { template: e }, this._submitModal();
};
P = function() {
  this._rejectModal();
};
w = function() {
  return this._areas.find((e) => e.id === this._selectedAreaId) ?? null;
};
z = function() {
  return this._areas.filter((e) => e.page === this._currentPage);
};
h.styles = [
  q,
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

			.name-warning {
				color: var(--uui-color-danger);
				font-size: var(--uui-type-small-size);
				margin-top: calc(var(--uui-size-space-3) * -1);
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
d([
  p()
], h.prototype, "_pdfDoc", 2);
d([
  p()
], h.prototype, "_currentPage", 2);
d([
  p()
], h.prototype, "_totalPages", 2);
d([
  p()
], h.prototype, "_scale", 2);
d([
  p()
], h.prototype, "_loading", 2);
d([
  p()
], h.prototype, "_error", 2);
d([
  p()
], h.prototype, "_areas", 2);
d([
  p()
], h.prototype, "_selectedAreaId", 2);
d([
  p()
], h.prototype, "_duplicateNameAreaId", 2);
d([
  p()
], h.prototype, "_mode", 2);
d([
  p()
], h.prototype, "_pageWidth", 2);
d([
  p()
], h.prototype, "_pageHeight", 2);
h = d([
  G("pdf-area-editor-modal")
], h);
const ot = h;
export {
  h as PdfAreaEditorModalElement,
  ot as default
};
//# sourceMappingURL=pdf-area-editor-modal.element-Dwi4R7nM.js.map
