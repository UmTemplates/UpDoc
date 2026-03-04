---
title: "page-picker-modal.token.ts"
---


Modal token for the PDF page picker sidebar.

## What it does

Defines the data contract and default configuration for opening the page picker modal. Uses Umbraco's `UmbModalToken` pattern with typed data in/value out.

## Interfaces

### `PagePickerModalData`

Data passed when opening the modal:

| Property | Type | Description |
|----------|------|-------------|
| `mediaKey` | `string` | Umbraco media item GUID for the PDF |
| `totalPages` | `number` | Total number of pages in the PDF |
| `selectedPages` | `number[] \| null` | Currently selected pages (1-based), or `null` for "all" |

### `PagePickerModalValue`

Value returned when the modal is submitted:

| Property | Type | Description |
|----------|------|-------------|
| `selectedPages` | `number[] \| null` | Selected page numbers (1-based), or `null` if all pages selected |

## Token

`UMB_PAGE_PICKER_MODAL` — sidebar type, medium size.

## Registered in

- `manifest.ts` — alias `UpDoc.PagePickerModal`

## Used by

- `create-workflow-sidebar.element.ts` — page picker during workflow creation
- `up-doc-workflow-source-view.element.ts` — page picker in the Source workspace tab
