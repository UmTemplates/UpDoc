---
title: "up-doc-pdf-thumbnail.element.ts"
---


Renders a single PDF page as an image thumbnail using PDF.js. Used inside `uui-card-media` and other components that need a visual preview of a PDF page.

## What it does

Given a media key and page number, fetches the PDF from the UpDoc API, renders the specified page to an **offscreen canvas** using PDF.js, then converts it to a PNG data URL via `canvas.toDataURL('image/png')`. The result is a standard `<img>` element that works anywhere — no visible canvas in the DOM.

## How the canvas-to-image technique works

This is the key architectural decision that makes PDF thumbnails work inside Umbraco's existing components:

1. **Fetch PDF bytes** — calls `GET /updoc/workflows/media-pdf?mediaKey={guid}` with auth token
2. **Load into PDF.js** — `pdfjsLib.getDocument({ data: arrayBuffer })` returns a `PDFDocumentProxy`
3. **Get page** — `pdfDoc.getPage(pageNumber)` returns a `PDFPageProxy`
4. **Create offscreen canvas** — `document.createElement('canvas')` (never added to the DOM)
5. **Render to offscreen canvas** — `pdfPage.render({ canvasContext, viewport })` draws the PDF page at the desired scale
6. **Convert to data URL** — `offscreenCanvas.toDataURL('image/png')` produces a `data:image/png;base64,...` string
7. **Render as `<img>`** — the data URL is a standard image source that works in any `<img>` tag, `uui-card-media`, or anywhere else

This approach means Umbraco components like `uui-card-media` see a normal image — no shadow DOM hacking, no custom slots, no special integration needed. The PDF rendering is entirely invisible to the consuming component.

## Caching

- **PDF documents** are cached in a module-level `Map<string, PDFDocumentProxy>` keyed by media key. Fetching the same PDF twice reuses the loaded document.
- **Rendered images** are not cached separately — each render produces a new data URL. This is acceptable because the offscreen canvas render is fast (~50ms) compared to the PDF fetch.

## Concurrency protection

PDF.js throws if `pdfPage.render()` is called while another render is in progress on the same canvas. The component handles this with:

- `_currentRenderTask` — tracks the active `RenderTask`, cancelled before starting a new render
- `_rendering` boolean guard — prevents overlapping async calls
- Render only triggers on property changes (`mediaKey`, `page`, `token`), not on internal state changes (`_loading`, `_error`)

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `mediaKey` | `String` | `''` | Umbraco media item GUID |
| `page` | `Number` | `1` | Page number to render (1-based) |
| `width` | `Number` | `300` | Render width in pixels (aspect ratio preserved) |
| `token` | `String` | `''` | Bearer auth token for the PDF fetch |

## Render states

- **Loading** — `<uui-loader-bar>` shown while fetching/rendering
- **Error** — icon + message (e.g., "Page 5 out of range (1-4)")
- **Ready** — `<img>` with the rendered PDF page

## API dependency

Requires the `GET /updoc/workflows/media-pdf` endpoint (added in this feature) which serves raw PDF bytes by media key. This endpoint exists because during Create Workflow, no workflow folder exists yet — so the existing workflow-based PDF endpoint can't be used.

## Used by

- `up-doc-pdf-picker.element.ts` — single page preview inside `uui-card-media`
- Future: page picker sidebar (grid of all pages with checkboxes)
