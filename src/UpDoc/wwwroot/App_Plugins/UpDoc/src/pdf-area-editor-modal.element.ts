import type { AreaEditorModalData, AreaEditorModalValue } from './pdf-area-editor-modal.token.js';
import type { AreaDefinition, AreaTemplate } from './workflow.types.js';
import { fetchPdfBlob } from './workflow.service.js';
import { html, customElement, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/App_Plugins/UpDoc/dist/pdf.worker.min.mjs';

// Area colors — cycling palette
const AREA_COLORS = [
	'#e84855', '#f9dc5c', '#3185fc', '#5bba6f', '#e56399',
	'#8338ec', '#ff6d00', '#06d6a0', '#118ab2', '#ef476f',
];

interface EditorArea {
	id: string;
	name: string;
	property: string;
	page: number;
	type: string;
	x: number;
	y: number;
	w: number;
	h: number;
	color: string;
	expectedSections: string[];
	notes: string;
}

type EditorMode = 'draw' | 'select';

@customElement('pdf-area-editor-modal')
export class PdfAreaEditorModalElement extends UmbModalBaseElement<
	AreaEditorModalData,
	AreaEditorModalValue
> {
	// PDF state
	@state() private _pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
	@state() private _currentPage = 1;
	@state() private _totalPages = 0;
	/** Pages available for area editing — filtered by prior page selection. */
	private _availablePages: number[] = [];
	@state() private _scale = 1.0;
	@state() private _loading = true;
	@state() private _error = '';

	// Area state
	@state() private _areas: EditorArea[] = [];
	@state() private _selectedAreaId: string | null = null;
	/** Area whose name clashes with another on the same page, if any. */
	@state() private _duplicateNameAreaId: string | null = null;
	@state() private _mode: EditorMode = 'draw';
	@state() private _pageWidth = 0;
	@state() private _pageHeight = 0;

	// Drawing state (not reactive — updated in mouse handlers)
	private _isDrawing = false;
	private _drawStart = { x: 0, y: 0 };
	private _drawCurrent = { x: 0, y: 0 };

	// Dragging/resizing state
	private _isDragging = false;
	private _isResizing = false;
	private _resizeHandle = '';
	private _dragStart = { x: 0, y: 0 };
	private _dragAreaStart = { x: 0, y: 0, w: 0, h: 0 };

	// Canvas refs
	private _canvas: HTMLCanvasElement | null = null;
	private _overlay: HTMLCanvasElement | null = null;

	// Next area ID counter
	private _nextId = 1;

	override async firstUpdated() {
		await this.#loadPdf();
	}

	async #getAuthToken(): Promise<string> {
		const authContext = await this.getContext(UMB_AUTH_CONTEXT);
		return authContext.getLatestToken();
	}

	async #loadPdf() {
		const workflowAlias = this.data?.workflowAlias;
		if (!workflowAlias) {
			this._error = 'No workflow name provided.';
			this._loading = false;
			return;
		}

		try {
			const token = await this.#getAuthToken();
			const blob = await fetchPdfBlob(workflowAlias, token);
			if (!blob) {
				this._error = 'Could not load PDF file.';
				this._loading = false;
				return;
			}

			const arrayBuffer = await blob.arrayBuffer();
			const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
			this._pdfDoc = await loadingTask.promise;
			this._totalPages = this._pdfDoc.numPages;

			// Only show pages the user previously selected
			const selected = this.data?.selectedPages;
			if (selected && selected.length > 0) {
				this._availablePages = selected.filter(p => p >= 1 && p <= this._totalPages).sort((a, b) => a - b);
			} else {
				this._availablePages = Array.from({ length: this._totalPages }, (_, i) => i + 1);
			}
			this._currentPage = this._availablePages[0] ?? 1;

			// Load existing template areas if provided
			if (this.data?.existingTemplate?.areas?.length) {
				this._areas = this.data.existingTemplate.areas.map((a, i) => ({
					id: `area-${i + 1}`,
					name: a.name,
					property: a.property,
					page: a.page,
					type: a.type,
					x: a.bounds.x,
					y: a.bounds.y,
					w: a.bounds.width,
					h: a.bounds.height,
					color: a.color || AREA_COLORS[i % AREA_COLORS.length],
					expectedSections: a.expectedSections,
					notes: a.notes,
				}));
				this._nextId = this._areas.length + 1;
			}

			this._loading = false;
			await this.updateComplete;
			await this.#renderPage();
		} catch (e) {
			this._error = `Failed to load PDF: ${e}`;
			this._loading = false;
		}
	}

	async #renderPage() {
		if (!this._pdfDoc) return;

		const page = await this._pdfDoc.getPage(this._currentPage);
		const viewport = page.getViewport({ scale: this._scale });

		this._pageWidth = viewport.width;
		this._pageHeight = viewport.height;

		// Get canvas elements from shadow DOM
		this._canvas = this.renderRoot.querySelector('#pdf-canvas') as HTMLCanvasElement;
		this._overlay = this.renderRoot.querySelector('#overlay-canvas') as HTMLCanvasElement;

		if (!this._canvas || !this._overlay) return;

		this._canvas.width = viewport.width;
		this._canvas.height = viewport.height;
		this._overlay.width = viewport.width;
		this._overlay.height = viewport.height;

		const ctx = this._canvas.getContext('2d')!;
		await page.render({ canvasContext: ctx, viewport }).promise;

		this.#drawOverlay();
	}

	// =========================================================================
	// Coordinate conversion — PDF point space ↔ canvas pixel space
	// PDF: origin bottom-left, Y up. Canvas: origin top-left, Y down.
	// =========================================================================

	#pdfToCanvas(pdfX: number, pdfY: number): { cx: number; cy: number } {
		const cx = pdfX * this._scale;
		const cy = (this._pageHeight / this._scale - pdfY) * this._scale;
		return { cx, cy };
	}

	#canvasToPdf(cx: number, cy: number): { px: number; py: number } {
		const px = cx / this._scale;
		const py = this._pageHeight / this._scale - cy / this._scale;
		return { px, py };
	}

	// =========================================================================
	// Overlay drawing — areas rendered as colored rectangles
	// =========================================================================

	#drawOverlay() {
		if (!this._overlay) return;
		const ctx = this._overlay.getContext('2d')!;
		ctx.clearRect(0, 0, this._overlay.width, this._overlay.height);

		// Draw existing areas for current page
		for (const area of this._areas) {
			if (area.page !== this._currentPage) continue;

			const topLeft = this.#pdfToCanvas(area.x, area.y + area.h);
			const bottomRight = this.#pdfToCanvas(area.x + area.w, area.y);
			const w = bottomRight.cx - topLeft.cx;
			const h = bottomRight.cy - topLeft.cy;

			// Fill
			ctx.fillStyle = area.color + '30'; // 30 = ~19% opacity
			ctx.fillRect(topLeft.cx, topLeft.cy, w, h);

			// Border
			ctx.strokeStyle = area.color;
			ctx.lineWidth = area.id === this._selectedAreaId ? 3 : 2;
			ctx.strokeRect(topLeft.cx, topLeft.cy, w, h);

			// Label
			ctx.fillStyle = area.color;
			ctx.font = 'bold 12px sans-serif';
			ctx.fillText(area.name || 'Unnamed', topLeft.cx + 4, topLeft.cy + 14);

			// Resize handles for selected area
			if (area.id === this._selectedAreaId) {
				const handleSize = 8;
				const handles = [
					{ x: topLeft.cx, y: topLeft.cy }, // top-left
					{ x: topLeft.cx + w, y: topLeft.cy }, // top-right
					{ x: topLeft.cx, y: topLeft.cy + h }, // bottom-left
					{ x: topLeft.cx + w, y: topLeft.cy + h }, // bottom-right
				];
				ctx.fillStyle = area.color;
				for (const h of handles) {
					ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
				}
			}
		}

		// Draw active drawing rectangle
		if (this._isDrawing) {
			const x = Math.min(this._drawStart.x, this._drawCurrent.x);
			const y = Math.min(this._drawStart.y, this._drawCurrent.y);
			const w = Math.abs(this._drawCurrent.x - this._drawStart.x);
			const h = Math.abs(this._drawCurrent.y - this._drawStart.y);

			ctx.strokeStyle = AREA_COLORS[this._areas.length % AREA_COLORS.length];
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);
			ctx.strokeRect(x, y, w, h);
			ctx.setLineDash([]);
		}
	}

	// =========================================================================
	// Mouse event handlers
	// =========================================================================

	#getCanvasPos(e: MouseEvent): { x: number; y: number } {
		if (!this._overlay) return { x: 0, y: 0 };
		const rect = this._overlay.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	#findAreaAtPos(cx: number, cy: number): EditorArea | null {
		for (const area of this._areas) {
			if (area.page !== this._currentPage) continue;
			const topLeft = this.#pdfToCanvas(area.x, area.y + area.h);
			const bottomRight = this.#pdfToCanvas(area.x + area.w, area.y);
			if (cx >= topLeft.cx && cx <= bottomRight.cx && cy >= topLeft.cy && cy <= bottomRight.cy) {
				return area;
			}
		}
		return null;
	}

	#findResizeHandle(area: EditorArea, cx: number, cy: number): string {
		const topLeft = this.#pdfToCanvas(area.x, area.y + area.h);
		const bottomRight = this.#pdfToCanvas(area.x + area.w, area.y);
		const threshold = 10;

		const nearLeft = Math.abs(cx - topLeft.cx) < threshold;
		const nearRight = Math.abs(cx - bottomRight.cx) < threshold;
		const nearTop = Math.abs(cy - topLeft.cy) < threshold;
		const nearBottom = Math.abs(cy - bottomRight.cy) < threshold;

		if (nearTop && nearLeft) return 'tl';
		if (nearTop && nearRight) return 'tr';
		if (nearBottom && nearLeft) return 'bl';
		if (nearBottom && nearRight) return 'br';
		return '';
	}

	#onMouseDown(e: MouseEvent) {
		const pos = this.#getCanvasPos(e);

		if (this._mode === 'draw') {
			this._isDrawing = true;
			this._drawStart = pos;
			this._drawCurrent = pos;
			return;
		}

		// Select mode
		const area = this.#findAreaAtPos(pos.x, pos.y);
		if (area) {
			this._selectedAreaId = area.id;
			this.#drawOverlay();

			// Check for resize handle
			const handle = this.#findResizeHandle(area, pos.x, pos.y);
			if (handle) {
				this._isResizing = true;
				this._resizeHandle = handle;
				this._dragStart = pos;
				this._dragAreaStart = { x: area.x, y: area.y, w: area.w, h: area.h };
			} else {
				this._isDragging = true;
				this._dragStart = pos;
				this._dragAreaStart = { x: area.x, y: area.y, w: area.w, h: area.h };
			}
		} else {
			this._selectedAreaId = null;
			this.#drawOverlay();
		}
	}

	#onMouseMove(e: MouseEvent) {
		const pos = this.#getCanvasPos(e);

		if (this._isDrawing) {
			this._drawCurrent = pos;
			this.#drawOverlay();
			return;
		}

		if (this._isDragging && this._selectedAreaId) {
			const area = this._areas.find(a => a.id === this._selectedAreaId);
			if (!area) return;

			const dx = (pos.x - this._dragStart.x) / this._scale;
			const dy = -(pos.y - this._dragStart.y) / this._scale; // invert Y

			area.x = this._dragAreaStart.x + dx;
			area.y = this._dragAreaStart.y + dy;
			this._areas = [...this._areas]; // trigger reactive update
			this.#drawOverlay();
			return;
		}

		if (this._isResizing && this._selectedAreaId) {
			const area = this._areas.find(a => a.id === this._selectedAreaId);
			if (!area) return;

			const dx = (pos.x - this._dragStart.x) / this._scale;
			const dy = -(pos.y - this._dragStart.y) / this._scale;
			const { x, y, w, h } = this._dragAreaStart;

			switch (this._resizeHandle) {
				case 'br':
					area.w = Math.max(20, w + dx);
					area.y = y + dy;
					area.h = Math.max(20, h - dy);
					break;
				case 'bl':
					area.x = x + dx;
					area.w = Math.max(20, w - dx);
					area.y = y + dy;
					area.h = Math.max(20, h - dy);
					break;
				case 'tr':
					area.w = Math.max(20, w + dx);
					area.h = Math.max(20, h + dy);
					break;
				case 'tl':
					area.x = x + dx;
					area.w = Math.max(20, w - dx);
					area.h = Math.max(20, h + dy);
					break;
			}
			this._areas = [...this._areas];
			this.#drawOverlay();
			return;
		}

		// Update cursor
		if (this._mode === 'select' && this._overlay) {
			const area = this.#findAreaAtPos(pos.x, pos.y);
			if (area && this._selectedAreaId === area.id) {
				const handle = this.#findResizeHandle(area, pos.x, pos.y);
				if (handle === 'tl' || handle === 'br') {
					this._overlay.style.cursor = 'nwse-resize';
				} else if (handle === 'tr' || handle === 'bl') {
					this._overlay.style.cursor = 'nesw-resize';
				} else {
					this._overlay.style.cursor = 'move';
				}
			} else if (area) {
				this._overlay.style.cursor = 'pointer';
			} else {
				this._overlay.style.cursor = 'default';
			}
		}
	}

	#onMouseUp(e: MouseEvent) {
		if (this._isDrawing) {
			this._isDrawing = false;
			const pos = this.#getCanvasPos(e);

			// Minimum size check
			const w = Math.abs(pos.x - this._drawStart.x);
			const h = Math.abs(pos.y - this._drawStart.y);
			if (w > 10 && h > 10) {
				// Convert to PDF coords
				const topLeft = this.#canvasToPdf(
					Math.min(this._drawStart.x, pos.x),
					Math.min(this._drawStart.y, pos.y)
				);
				const bottomRight = this.#canvasToPdf(
					Math.max(this._drawStart.x, pos.x),
					Math.max(this._drawStart.y, pos.y)
				);

				const newArea: EditorArea = {
					id: `area-${this._nextId++}`,
					name: `Area ${this._areas.filter(a => a.page === this._currentPage).length + 1}`,
					property: '',
					page: this._currentPage,
					type: '',
					x: topLeft.px,
					y: bottomRight.py,
					w: bottomRight.px - topLeft.px,
					h: topLeft.py - bottomRight.py,
					color: AREA_COLORS[(this._areas.length) % AREA_COLORS.length],
					expectedSections: [],
					notes: '',
				};

				this._areas = [...this._areas, newArea];
				this._selectedAreaId = newArea.id;
				this._mode = 'select';
			}
			this.#drawOverlay();
			return;
		}

		this._isDragging = false;
		this._isResizing = false;
	}

	// =========================================================================
	// Page navigation
	// =========================================================================

	async #goToPage(page: number) {
		if (!this._availablePages.includes(page)) return;
		this._currentPage = page;
		this._selectedAreaId = null;
		await this.updateComplete;
		await this.#renderPage();
	}


	#onZoomIn() {
		this._scale = Math.min(3.0, this._scale + 0.25);
		this.#renderPage();
	}

	#onZoomOut() {
		this._scale = Math.max(0.5, this._scale - 0.25);
		this.#renderPage();
	}

	// =========================================================================
	// Area management
	// =========================================================================

	#selectArea(id: string) {
		this._selectedAreaId = id;
		this._mode = 'select';
		// Navigate to the area's page if different
		const area = this._areas.find(a => a.id === id);
		if (area && area.page !== this._currentPage) {
			this.#goToPage(area.page);
		} else {
			this.#drawOverlay();
		}
	}

	#deleteArea(id: string) {
		this._areas = this._areas.filter(a => a.id !== id);
		if (this._selectedAreaId === id) {
			this._selectedAreaId = null;
		}
		this.#drawOverlay();
	}

	#onAreaNameChange(id: string, name: string) {
		const area = this._areas.find(a => a.id === id);
		if (!area) return;

		// Areas are keyed downstream by name + page, so two areas sharing a name on
		// one page makes their sort order ambiguous. Warn rather than block — the
		// name is still applied, so the author is not fighting the input while typing.
		const trimmed = name.trim();
		const clashes = this._areas.some(
			a => a.id !== id && a.page === area.page && a.name.trim().toLowerCase() === trimmed.toLowerCase(),
		);
		this._duplicateNameAreaId = trimmed && clashes ? id : null;

		area.name = name;
		this._areas = [...this._areas];
		this.#drawOverlay();
	}

	// =========================================================================
	// Save / Cancel
	// =========================================================================

	#onSave() {
		const template: AreaTemplate = {
			templateName: this.data?.existingTemplate?.templateName || this.data?.workflowAlias || 'Area Template',
			sourceFile: this.data?.existingTemplate?.sourceFile || '',
			pageSize: {
				width: this._pageWidth / this._scale,
				height: this._pageHeight / this._scale,
			},
			createdAt: new Date().toISOString(),
			areas: this._areas.map(a => ({
				name: a.name,
				property: a.property,
				page: a.page,
				type: a.type,
				bounds: {
					x: Math.round(a.x * 10) / 10,
					y: Math.round(a.y * 10) / 10,
					width: Math.round(a.w * 10) / 10,
					height: Math.round(a.h * 10) / 10,
				},
				color: a.color,
				expectedSections: a.expectedSections,
				notes: a.notes,
			})),
		};

		this.value = { template };
		this._submitModal();
	}

	#onCancel() {
		this._rejectModal();
	}

	// =========================================================================
	// Render
	// =========================================================================

	get #selectedArea(): EditorArea | null {
		return this._areas.find(a => a.id === this._selectedAreaId) ?? null;
	}

	get #currentPageAreas(): EditorArea[] {
		return this._areas.filter(a => a.page === this._currentPage);
	}

	override render() {
		if (this._loading) {
			return html`
				<umb-body-layout headline="Define Areas">
					<div class="loading">
						<uui-loader></uui-loader>
						<span>Loading PDF...</span>
					</div>
				</umb-body-layout>
			`;
		}

		if (this._error) {
			return html`
				<umb-body-layout headline="Define Areas">
					<div class="error">${this._error}</div>
					<uui-button slot="actions" label="Close" @click=${this.#onCancel}></uui-button>
				</umb-body-layout>
			`;
		}

		return html`
			<umb-body-layout headline="Define Areas">
				<div class="editor-layout">
					<!-- Left: PDF + canvas -->
					<div class="pdf-panel">
						<div class="toolbar">
							<div class="toolbar-group">
								<uui-button
									compact
									look=${this._mode === 'draw' ? 'primary' : 'secondary'}
									label="Draw"
									@click=${() => { this._mode = 'draw'; }}>
									Draw
								</uui-button>
								<uui-button
									compact
									look=${this._mode === 'select' ? 'primary' : 'secondary'}
									label="Select"
									@click=${() => { this._mode = 'select'; }}>
									Select
								</uui-button>
							</div>

							<div class="toolbar-group">
								<uui-button compact label="Zoom out" @click=${this.#onZoomOut}>&minus;</uui-button>
								<span class="zoom-info">${Math.round(this._scale * 100)}%</span>
								<uui-button compact label="Zoom in" @click=${this.#onZoomIn}>+</uui-button>
							</div>
						</div>

						<div class="canvas-container">
							<canvas id="pdf-canvas"></canvas>
							<canvas id="overlay-canvas"
								@mousedown=${this.#onMouseDown}
								@mousemove=${this.#onMouseMove}
								@mouseup=${this.#onMouseUp}
								style="cursor: ${this._mode === 'draw' ? 'crosshair' : 'default'}">
							</canvas>
						</div>
					</div>

					<!-- Right: Pages + Areas -->
					<div class="area-panel">
						${this._availablePages.length > 1 ? html`
							<uui-box headline="Pages">
								${this._availablePages.map(page => {
									const areaCount = this._areas.filter(a => a.page === page).length;
									const isActive = page === this._currentPage;
									return html`
										<div class="page-item ${isActive ? 'active' : ''}"
											@click=${() => this.#goToPage(page)}>
											<span class="page-item-label">Page ${page}</span>
											${areaCount > 0 ? html`
												<span class="page-item-count">${areaCount} area${areaCount !== 1 ? 's' : ''}</span>
											` : nothing}
										</div>
									`;
								})}
							</uui-box>
						` : nothing}

						<uui-box headline="Areas on this page" style="${this._availablePages.length > 1 ? 'margin-top: var(--uui-size-space-4)' : ''}">
							${this.#currentPageAreas.length === 0
								? html`<p class="empty-hint">Draw an area on the PDF to get started.</p>`
								: this.#currentPageAreas.map(area => html`
									<div class="area-item ${area.id === this._selectedAreaId ? 'selected' : ''}"
										@click=${() => this.#selectArea(area.id)}>
										<span class="area-color" style="background: ${area.color}"></span>
										<span class="area-name">${area.name || 'Unnamed'}</span>
										<uui-button compact look="secondary" label="Delete"
											@click=${(e: Event) => { e.stopPropagation(); this.#deleteArea(area.id); }}>
											<uui-icon name="icon-trash"></uui-icon>
										</uui-button>
									</div>
								`)}
						</uui-box>

						${this.#selectedArea ? html`
							<uui-box headline="Edit Area" style="margin-top: var(--uui-size-space-4)">
								<div class="edit-form">
									<label>Name</label>
									<uui-input
										.value=${this.#selectedArea.name}
										?error=${this._duplicateNameAreaId === this._selectedAreaId}
										@input=${(e: Event) => {
											this.#onAreaNameChange(
												this._selectedAreaId!,
												(e.target as HTMLInputElement).value
											);
										}}>
									</uui-input>
									${this._duplicateNameAreaId === this._selectedAreaId ? html`
										<small class="name-warning">
											Another area on this page already has this name. Give each area on a
											page a distinct name so their order is preserved correctly.
										</small>
									` : nothing}

									<label>Color</label>
									<div class="color-swatches">
										${AREA_COLORS.map(c => html`
											<button
												class="color-swatch ${c === this.#selectedArea!.color ? 'active' : ''}"
												style="background: ${c}"
												@click=${() => {
													const area = this._areas.find(a => a.id === this._selectedAreaId);
													if (area) { area.color = c; this._areas = [...this._areas]; this.#drawOverlay(); }
												}}>
											</button>
										`)}
									</div>
								</div>
							</uui-box>
						` : nothing}
					</div>
				</div>

				<uui-button
					slot="actions"
					look="primary"
					color="positive"
					label="Save"
					?disabled=${this._areas.length === 0}
					@click=${this.#onSave}>
					Save
				</uui-button>
				<uui-button
					slot="actions"
					label="Cancel"
					@click=${this.#onCancel}>
					Cancel
				</uui-button>
			</umb-body-layout>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
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
		`,
	];
}

export default PdfAreaEditorModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'pdf-area-editor-modal': PdfAreaEditorModalElement;
	}
}
