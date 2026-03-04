---
title: "create-workflow-sidebar.element.ts"
---


Sidebar modal for creating a new UpDoc workflow. Part of a stepped flow: blueprint picker dialog (step 1) then this sidebar (step 2).

## What it does

Provides a sidebar with two tabs for configuring a new workflow:

1. **Source tab** (default) — Workflow name, source format dropdown, conditional sample document picker, PDF page selection
2. **Destination tab** — Read-only display of the selected document type and blueprint

## How it works

1. Receives document type and blueprint details as modal data (passed from the blueprint picker dialog)
2. User selects a source format from the dropdown (PDF, Markdown, Web Page, Word Document)
3. Workflow name auto-generates as `{kebab-case-blueprint-name}-{sourceType}` (user can override)
4. A format-specific sample document box appears:
   - **PDF** — `up-doc-pdf-picker` with PDF.js thumbnail preview. After selection, runs `extractRich()` to get page count and element count. Extraction stats (filename, pages, elements) shown below the thumbnail.
   - **Markdown** — `umb-input-media` picker for a sample file
   - **Web** — URL text input
   - **Word Document** — `umb-input-media` picker
5. For PDF: a Pages box appears after extraction with page count summary and full-width "Choose Pages" button that opens the page picker modal
6. On submit, returns `CreateWorkflowSidebarValue` with name, sourceType, mediaUnique, sourceUrl, documentTypeAlias, blueprintId, blueprintName, and selectedPages

## Source tab layout (separate boxes)

Each section is its own `uui-box`:

| Box | Headline | Content |
|-----|----------|---------|
| **Workflow Name** | Workflow Name | `uui-input` with auto-generated kebab-case name |
| **Format** | Format | `uui-select` dropdown (PDF/Markdown/Web/Word) |
| **Sample Document** | Sample Document / Sample File / Sample URL | Format-specific picker + extraction stats for PDF |
| **Pages** | Pages | Page count label + full-width "Choose Pages" button (PDF only, after extraction) |

## PDF extraction stats

After selecting a PDF, `extractRich()` runs automatically. On success, a stats panel appears below the thumbnail:

- **Filename** (bold, with `word-break: break-all` to show full names that `uui-card-media` would truncate)
- **Page count** with `icon-thumbnails-small` icon
- **Element count** with `icon-list` icon

## Key behaviours

- Workflow name auto-generation uses `toKebabCase()` on the blueprint name plus the source type suffix
- Once the user manually edits the name, auto-generation stops (tracked by `_nameManuallyEdited` flag)
- Changing source type clears the media selection and URL (prevents stale references)
- Create button requires both name and source type; media/URL selection is optional
- Page picker opens as a nested sidebar modal via `UMB_PAGE_PICKER_MODAL`
- Selected pages stored as `number[] | null` (null = all pages)

## Tabs

Uses `uui-tab-group` in the `navigation` slot of `umb-body-layout`:

- **Source** — `icon-page-add` icon
- **Destination** — `icon-document` icon

Text content must be placed inside the `<uui-tab>` element (not just the `label` attribute) for visible rendering inside `umb-body-layout`.

## Registered in

- `manifest.ts` — registered as a `modal` with alias `UpDoc.CreateWorkflowSidebar`

## Used by

- Opened from `up-doc-workflows-view.element.ts` as step 2 of the "Create Workflow" flow (after the blueprint picker dialog)
