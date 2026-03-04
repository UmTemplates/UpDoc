---
title: "up-doc-pdf-picker.element.ts"
---


PDF media picker with thumbnail preview. Replaces `umb-input-media` for PDF selection in the Create Workflow sidebar.

## What it does

Provides a complete pick-preview-remove flow for selecting a PDF from Umbraco's media library:

1. **Empty state** — `<uui-button look="placeholder">` matching Umbraco's standard media picker "Choose" button
2. **After selection** — `<uui-card-media>` with a real PDF page 1 thumbnail (rendered by `up-doc-pdf-thumbnail`) and the media item's file name
3. **Actions** — Remove (trash icon) and Change (edit icon) in a `<uui-action-bar>` on the card

## Why not use umb-input-media?

`umb-input-media` uses `umb-imaging-thumbnail` which falls back to a generic icon for PDFs — there's no visual preview. By building our own picker, we can inject a real PDF page render via `up-doc-pdf-thumbnail` while keeping all other behaviour (media picker modal, card layout, action buttons) consistent with Umbraco's patterns.

## How it works

1. **Choose button** — opens `UMB_MEDIA_PICKER_MODAL` via `UMB_MODAL_MANAGER_CONTEXT` (standard Umbraco media picker)
2. **On selection** — stores the media key, fetches the media item name via `GET /umbraco/management/api/v1/media/item?id={guid}`
3. **Thumbnail render** — passes the media key and auth token to `<up-doc-pdf-thumbnail>` which handles PDF.js rendering
4. **Events** — dispatches `CustomEvent('change', { detail: { mediaKey } })` on selection or removal

## UUI patterns used

| Component | Usage |
|-----------|-------|
| `uui-button look="placeholder"` | Empty state "Choose" button — matches `umb-input-media`'s add button |
| `uui-card-media` | Card wrapper with name label — matches media library cards |
| `uui-action-bar slot="actions"` | Hover action buttons on the card |
| `uui-icon` | Icons for add, trash, edit actions |

## Registered in

- Not registered in `manifest.ts` — imported directly by `create-workflow-sidebar.element.ts`

## Used by

- `create-workflow-sidebar.element.ts` — PDF source type section
