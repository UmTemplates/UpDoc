---
title: "up-doc-workflow-destination-view.element.ts"
---


Workspace view for the Destination tab of a workflow. Displays the blueprint's fields and block grids organised by inner tabs (Page Properties, Page Content).

## What it does

Renders a read-only view of the workflow's destination configuration — the blueprint fields that content will be mapped into. Fields are grouped by their tab assignment (e.g. "Page Properties") and block grids appear under "Page Content".

## How it works

1. On `connectedCallback`, consumes `UMB_WORKSPACE_CONTEXT` and observes the `unique` value
2. Registers a refresh handler so the workspace Refresh button triggers a full `#loadConfig()` reload
3. When `unique` changes, calls `fetchWorkflowByAlias()` to load the workflow configuration
4. Uses `getDestinationTabs()` from `destination-utils.ts` to build inner tabs (shared logic with Map view and Content tab)
5. If block grids exist and there's no explicit "Page Content" tab, adds one automatically (handled by the shared utility)
6. Renders using Umbraco's native `umb-body-layout` + `uui-tab-group` + `uui-tab` pattern

### Refresh behaviour

The workspace Refresh button triggers a full `#loadConfig()` reload — re-fetching the workflow config and re-validating the blueprint. The handler is cleared in `disconnectedCallback` when switching tabs. See [Workspace Refresh](/UpDoc/frontend/workspace-refresh/) for the cross-cutting architecture.

### Tab structure

```
umb-body-layout (header-fit-height)
├── uui-tab-group (slot="header")
│   ├── uui-tab "Page Properties"
│   └── uui-tab "Page Content"
└── uui-box
    └── (tab content: fields or block grids)
```

The inner tabs follow Umbraco's content-area tab pattern (as seen in the Document Type editor and Content editor). The `uui-tab` elements require both a `label` attribute and text content inside the element for the label to render visibly.

### Field rendering

Each field displays:

- **Label** (bold) + **type badge** (e.g. "Umbraco.TextBox") + **Required** tag if mandatory
- **Alias** (monospace) + **description** (if present)

### Block grid rendering

Block grids show:

- Grid header with label and alias
- Each block with icon, label, and "identified by" hint
- Block properties with label, type badge, and accepted formats

## Key concepts

### Inner tabs vs workspace tabs

This view has its own internal tab bar (Page Properties / Page Content) which is separate from the top-level workspace view tabs (Destination / Markdown / Pdf). The inner tabs use `umb-body-layout header-fit-height` with `uui-tab-group slot="header"`, while the workspace tabs are managed by `umb-workspace-editor`.

### uui-tab rendering

The `uui-tab` element requires text content inside it (`${tab.label}`) in addition to the `label` attribute for the text to be visible when rendered inside `umb-body-layout`. This is a key implementation detail.

## Imports

```typescript
import type { DocumentTypeConfig, DestinationField, DestinationBlockGrid } from './workflow.types.js';
import { fetchWorkflowByName } from './workflow.service.js';
import { getDestinationTabs } from './destination-utils.js';
import { html, customElement, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
```

## Registered in

- `manifest.ts` — registered as a `workspaceView` with alias `UpDoc.WorkflowWorkspaceView.Destination`, weight 300 (leftmost tab)
- Conditioned on `Umb.Condition.WorkspaceAlias` matching `UpDoc.WorkflowWorkspace`

## Used by

- Displayed as the "Destination" tab when viewing an individual workflow in the workflow workspace
