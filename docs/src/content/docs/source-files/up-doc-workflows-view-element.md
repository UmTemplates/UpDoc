---
title: "up-doc-workflows-view.element.ts"
---


Dashboard view element that lists and manages UpDoc workflows. Displayed in the Settings section under the UpDoc tree.

## What it does

Provides a table-based UI for viewing all configured workflows, creating new ones, and deleting existing ones. Each workflow represents a complete pipeline from source extraction to document creation.

## How it works

1. On `connectedCallback`, fetches all workflows from the `/umbraco/management/api/v1/updoc/workflows` API
2. Renders workflows in a `uui-table` with columns for name, document type, blueprint, sources, mappings, and status
3. Shows an empty state with explanation text when no workflows exist
4. "Create Workflow" button triggers a stepped creation flow (see below)
5. Clicking a workflow row navigates to the workflow workspace page via `history.pushState`
6. "Delete" button shows a `UMB_CONFIRM_MODAL` confirmation dialog, then DELETEs the workflow and clears the client-side config cache

## Create Workflow flow (stepped)

The "Create Workflow" button triggers a multi-step flow using `umbOpenModal`:

1. **Fetch document types** — calls `GET /updoc/document-types` and `GET /updoc/document-types/{alias}/blueprints` for each
2. **Build DocumentTypeOption[]** — only includes document types that have at least one blueprint
3. **Open blueprint picker dialog** — `UMB_BLUEPRINT_PICKER_MODAL` shows doc type → blueprint selection
4. **Open Create Workflow sidebar** — `UMB_CREATE_WORKFLOW_SIDEBAR` collects workflow name, source type, and optional sample document
5. **POST to API** — creates the workflow folder on disk via `/updoc/workflows`
6. **Refresh** — reloads the workflow list

If no document types have blueprints, shows an error message instead of opening the picker.

## UI states

- **Loading**: Shows `uui-loader-bar`
- **Error**: Shows error message with "Retry" button
- **Empty**: Shows explanatory text and "Create Workflow" button
- **Populated**: Shows workflow table with "Create Workflow" button above

## Key concepts

### WorkflowSummary interface

The component consumes a `WorkflowSummary` interface from the API:

```typescript
interface WorkflowSummary {
    name: string;
    documentTypeAlias: string;
    blueprintId: string | null;
    blueprintName: string | null;
    sourceTypes: string[];
    mappingCount: number;
    isComplete: boolean;
    validationWarnings: string[];
}
```

### Workflow navigation

Clicking a workflow row navigates to the workflow workspace page using client-side routing:

```typescript
#handleViewWorkflow(workflow: WorkflowSummary) {
    const encodedName = encodeURIComponent(workflow.name);
    window.history.pushState({}, '', `section/settings/workspace/updoc-workflow/edit/${encodedName}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
}
```

The URL follows Umbraco's routable workspace pattern: `section/{section}/workspace/{entityType}/edit/{unique}`. The `popstate` event triggers Umbraco's router to handle the navigation.

### Cache invalidation on delete

After deleting a workflow, calls `clearConfigCache()` from `workflow.service.ts` to ensure the `UpDoc.Condition.HasAvailableWorkflows` condition re-evaluates. Without this, the entity action would remain visible for nodes whose workflows were just deleted.

### Authentication

All API calls use `UMB_AUTH_CONTEXT` to obtain a bearer token for the Management API.

## Imports

```typescript
import { html, css, customElement, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_MODAL_MANAGER_CONTEXT, UMB_CONFIRM_MODAL, umbOpenModal } from '@umbraco-cms/backoffice/modal';
import { UMB_BLUEPRINT_PICKER_MODAL } from './blueprint-picker-modal.token.js';
import { UMB_CREATE_WORKFLOW_SIDEBAR } from './create-workflow-sidebar.token.js';
import { clearConfigCache } from './workflow.service.js';
```

## Registered in

- `manifest.ts` -- registered as a `workspaceView` with alias `UpDoc.WorkspaceView.Workflows`

## Used by

- Displayed in the UpDoc settings section when navigating to the Workflows view
