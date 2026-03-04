---
title: "up-doc-workflow-detail-modal.element.ts"
---


Read-only sidebar modal that displays the full configuration of an UpDoc workflow. Opened by clicking a workflow row in the workflows view.

## What it does

Displays a two-level tab structure showing destination configuration and source extraction rules for a workflow:

- **Top-level tabs** (workspace-style with icons): Destination + one tab per source type (e.g. Markdown, PDF)
- **Inner tabs** within Destination (content-area style): dynamically generated from document type field tab groupings (e.g. "Page Properties", "Page Content")

## How it works

1. Receives workflow name via modal data
2. Fetches full workflow config from `GET /umbraco/management/api/v1/updoc/workflows/{name}` via `fetchWorkflowByName()`
3. Renders destination fields with type badges, block grid configuration, and source extraction sections with strategy badges

## Tab structure

### Destination tab

Groups fields by their tab membership in the document type:

- Shows each field with its alias, type badge, and mapped status
- Block grid fields expand to show their block types and properties
- Fields that are mapped show their mapping source key

### Source tabs (one per source type)

Each source tab shows:

- Extraction sections with strategy badges (e.g. "largestFont", "regex", "betweenPatterns")
- Strategy parameters displayed as key-value pairs in a monospace code block
- Output format and page range metadata

## Key CSS classes

- `.field-type` — neutral badge for property editor type (uses `--uui-color-text-alt` on `--uui-color-surface-alt`)
- `.section-strategy` — neutral badge for extraction strategy (uses same neutral style)
- `.strategy-params` — monospace parameter display area

## Registered in

- `manifest.ts` — registered as a `modal` with alias `UpDoc.WorkflowDetailModal`

## Used by

- Opened from `up-doc-workflows-view.element.ts` when a workflow row is clicked
