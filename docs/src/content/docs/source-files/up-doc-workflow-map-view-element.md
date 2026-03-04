---
title: "up-doc-workflow-map-view.element.ts"
---


Workspace view for the Map tab of a workflow. Displays all source-to-destination mappings from `map.json`, grouped by destination tab structure.

## What it does

Renders the current mapping configuration — showing which source extraction elements are wired to which destination fields. Mappings are grouped by destination tab (Page Properties, Page Content) and sub-grouped by block within Page Content. Provides a visual overview of all mappings and allows deletion of individual mappings.

## How it works

1. On `connectedCallback`, consumes `UMB_WORKSPACE_CONTEXT` and observes the `unique` value
2. When `unique` changes, calls `fetchWorkflowByName()` to load the workflow configuration (includes map.json and destination.json)
3. Also loads the sample extraction via `fetchSampleExtraction()` to resolve source element IDs to text previews
4. Groups mappings by destination tab using `resolveDestinationTab()` from `destination-utils.ts`, then sub-groups Page Content mappings by block using `resolveBlockLabel()`
5. Renders each group as a section with a header and its own `uui-table`
6. Delete button removes a mapping and saves via `saveMapConfig()` PUT endpoint

### Grouped sections

Mappings are organised into sections matching the destination document's tab structure:

- **Page Properties** — top-level fields like Page Title, Page Description
- **Page Content — [Block Label]** — block properties grouped by block (e.g., "Page Content — Features", "Page Content — Accommodation")
- **Unmapped** — orphaned mappings whose destination target no longer exists in `destination.json`

Each section has a header with the group name and a mapping count badge. Groups are ordered to match `getDestinationTabs()` output, with Unmapped at the bottom.

### Empty state

When no mappings exist, shows a centred message: "No mappings yet. Use the Source tab to map extracted content to destination fields."

### Mapping row rendering

Each row displays:

- **Source**: Element ID (monospace) + text preview (truncated to 60 chars)
- **Arrow**: Visual indicator
- **Destination**: Resolved field label (from destination.json), with block path for block properties
- **Actions**: Disabled badge (if mapping disabled) + delete button

### Label resolution

- **Destination labels**: Resolved from `destination.json` via `#resolveDestinationLabel(dest)` which accepts a `MappingDestination` object. When `blockKey` is present, finds the specific block by key for an accurate label. Otherwise checks top-level fields first, then falls back to first block match (backwards compat for old mappings). Block properties display as "Block Label > Property Label".
- **Source text**: Resolved from `sample-extraction.json` by matching element ID

## Imports

```typescript
import type { DocumentTypeConfig, SectionMapping, MappingDestination, RichExtractionResult } from './workflow.types.js';
import { fetchWorkflowByName, fetchSampleExtraction, saveMapConfig } from './workflow.service.js';
import { getDestinationTabs, resolveDestinationTab, resolveBlockLabel } from './destination-utils.js';
import { html, customElement, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
```

## Registered in

- `manifest.ts` — registered as a `workspaceView` with alias `UpDoc.WorkflowWorkspaceView.Map`, weight 100 (rightmost tab)
- Conditioned on `Umb.Condition.WorkspaceAlias` matching `UpDoc.WorkflowWorkspace`

## Used by

- Displayed as the "Map" tab when viewing an individual workflow in the workflow workspace
