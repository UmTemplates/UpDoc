---
title: "pdf-area-editor-modal.element.ts"
---


Sidebar modal for drawing extraction areas directly onto a rendered PDF page.

The largest single component in UpDoc. It renders a PDF to canvas, lets the user draw rectangles over it, and saves those rectangles as an `AreaTemplate`.

## PDF.js setup

```typescript
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/App_Plugins/UpDoc/dist/pdf.worker.min.mjs';
```

The worker path points at the built plugin output. `pdf.worker.min.mjs` is copied there by the `copy:pdfworker` npm script after every Vite build — the worker is not bundled, so a build that skips that step leaves the editor unable to render.

## Two canvases

```typescript
this._canvas = this.renderRoot.querySelector('#pdf-canvas');
this._overlay = this.renderRoot.querySelector('#overlay-canvas');
```

The PDF renders to one canvas, area rectangles to a second overlaid on top. Keeping them separate means redrawing an area during a drag does not require re-rendering the page, which would be far too slow to feel responsive.

Both are resized to match the viewport at the current scale before rendering.

## Coordinate conversion

The central complexity. PDF coordinate space has its origin at the **bottom-left with Y increasing upward**; canvas has its origin at the **top-left with Y increasing downward**.

Areas are stored in PDF point space so they remain valid regardless of zoom, but drawn in canvas pixel space. Every interaction crosses that boundary, and the conversion also has to account for the current `_scale`.

## Modes

```typescript
type EditorMode = 'draw' | 'select';
```

- **draw** — dragging creates a new rectangle; cursor is a crosshair
- **select** — dragging moves or resizes an existing area

The editor switches to `select` automatically after a rectangle is drawn, on the assumption the next action is adjusting what was just created.

## Area model

```typescript
interface EditorArea {
    id: string;
    name: string;
    property: string;
    page: number;
    type: string;
    x: number; y: number; w: number; h: number;
    color: string;
    expectedSections: string[];
    notes: string;
}
```

Geometry is per-page — `page` is part of the area, so one template can define different areas on different pages.

Colours cycle through a fixed ten-colour palette so adjacent areas stay visually distinct.

## Page navigation and zoom

`_currentPage`, `_totalPages` and `_scale` drive navigation. Changing any of them calls `#renderPage()`, which re-renders the PDF and redraws the overlay.

When the modal is opened with `selectedPages`, navigation is limited to that subset, matching the workflow's page selection.

## Loading

The PDF is fetched as a blob via `fetchPdfBlob` from `workflow.service.ts`, which handles backoffice authentication. `_loading` and `_error` drive the loading and failure states — a PDF that fails to fetch shows an error rather than an empty canvas.

## Used by

- `up-doc-workflow-source-view.element.ts` — opens the editor
- `pdf-area-editor-modal.token.ts` — token and type definitions
- `workflow.service.ts` — `fetchPdfBlob`

## Related

`pdfjs-dist` is a direct runtime dependency and ships in the built output. It currently carries a security advisory — see [issue #51](https://github.com/UmTemplates/UpDoc/issues/51).
