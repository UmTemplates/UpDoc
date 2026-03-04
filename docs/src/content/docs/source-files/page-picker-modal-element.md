---
title: "page-picker-modal.element.ts"
---


Sidebar modal that displays a grid of PDF page thumbnails for selecting which pages to include in extraction.

## What it does

Renders all pages of a PDF as thumbnail images in a 4-column grid, with Umbraco-native selectable checkboxes. Users can select/deselect individual pages or use Select All/Deselect All. Returns the selected page numbers on confirm.

## How it works

1. On `firstUpdated`, fetches an auth token for PDF thumbnail rendering
2. Initialises selection: if `selectedPages` data is provided, uses that; otherwise selects all pages
3. Renders a `uui-card-media` for each page with `selectable select-only` attributes (checkbox in top-left corner, matching Umbraco media library pattern)
4. Each card contains an `up-doc-pdf-thumbnail` component that renders the actual PDF page via PDF.js
5. On confirm: if all pages selected, returns `null` (meaning "all"); otherwise returns the sorted array of selected page numbers

## UI layout

- **Header toolbar**: Selection count ("X of Y pages selected") + Select All/Deselect All toggle button
- **Page grid**: 4-column CSS Grid of `uui-card-media` cards, each 200px thumbnail width
- **Actions**: Cancel + Confirm button (disabled when no pages selected)

## Key patterns

- Uses `@selected` and `@deselected` as separate event handlers on `uui-card-media` (not a single toggle event)
- Selection tracked as `Set<number>` with immutable updates (new Set on each change) for Lit reactivity
- Confirm button label changes dynamically: "Include all pages" vs "Include X page(s)"

## Custom element

`<up-doc-page-picker-modal>`

## Registered in

- `manifest.ts` — alias `UpDoc.PagePickerModal`

## Used by

- Opened via `UMB_PAGE_PICKER_MODAL` token from:
    - `create-workflow-sidebar.element.ts` (workflow creation flow)
    - `up-doc-workflow-source-view.element.ts` (Source workspace tab)
