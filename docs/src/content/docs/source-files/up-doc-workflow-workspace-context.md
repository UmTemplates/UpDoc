---
title: "up-doc-workflow-workspace.context.ts"
---


Workspace context and editor element for individual workflow pages. Provides routing, state management, and the editor shell for the workflow workspace.

## What it does

Contains two exports:

1. **`UpDocWorkflowWorkspaceEditorElement`** — A minimal Lit element that renders `<umb-workspace-editor>` with a dynamic headline
2. **`UpDocWorkflowWorkspaceContext`** — The workspace context class that manages routing and state for individual workflow pages

When a user clicks a workflow in the collection view, the context receives the workflow name via the route parameter, formats it as a display name, and provides it to workspace views via observables.

## How it works

### Editor element

The editor element (`up-doc-workflow-workspace-editor`) consumes the workspace context to get the display name and renders the standard `<umb-workspace-editor>` component with it as the headline:

```typescript
@customElement('up-doc-workflow-workspace-editor')
class UpDocWorkflowWorkspaceEditorElement extends UmbLitElement {
    override render() {
        return html`<umb-workspace-editor headline=${this._name}></umb-workspace-editor>`;
    }
}
```

### Workspace context

The context class:

1. Extends `UmbContextBase` and registers under `UMB_WORKSPACE_CONTEXT`
2. Manages an `UmbObjectState<UpDocWorkflowData>` with `unique` and `name` fields
3. Exposes `unique` and `name` as observable parts for workspace views to consume
4. Configures a route `edit/:unique` that maps URL parameters to `load()`
5. Formats kebab-case workflow names to title case for display (e.g. `group-tour` → `Group Tour`)

```typescript
export class UpDocWorkflowWorkspaceContext extends UmbContextBase {
    public readonly workspaceAlias = 'UpDoc.WorkflowWorkspace';
    readonly unique = this.#data.asObservablePart((data) => data?.unique);
    readonly name = this.#data.asObservablePart((data) => data?.name);
    readonly routes = new UmbWorkspaceRouteManager(this);
}

export { UpDocWorkflowWorkspaceContext as api };
```

The `api` export is required by Umbraco's workspace manifest pattern for lazy-loaded workspace contexts.

## Key concepts

### Routable workspace pattern

Uses `kind: 'routable'` in the manifest, which means:

- URL routing with `edit/:unique` path segments
- Tree item selection state (if connected to a tree)
- Proper navigation between different workflow pages

### Entity type

Returns `'updoc-workflow'` from `getEntityType()`, matching the `entityType` in the workspace manifest. This connects the workspace to the correct tree items and navigation.

### Save and Refresh handlers

The context holds two callback slots — `#saveHandler` and `#refreshHandler` — that workspace views register when they mount. Only one handler is active at a time (the active tab's handler). Views register in `connectedCallback` and clear in `disconnectedCallback`.

- **`save()`** — called by `up-doc-save.action.ts` (Save toolbar button). Delegates to the active view's save logic.
- **`refresh()`** — called by `up-doc-refresh.action.ts` (Refresh toolbar button). Delegates to the active view's `#loadData()` for a full data reload.

See [Workspace Refresh](/UpDoc/frontend/workspace-refresh/) for the full architecture.

### Name formatting

Workflow folder names use kebab-case (e.g. `example-group-tour`). The `load()` method converts this to title case for the headline display.

## Imports

```typescript
import { UmbWorkspaceRouteManager, UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import { UmbObjectState } from '@umbraco-cms/backoffice/observable-api';
import { UmbContextBase } from '@umbraco-cms/backoffice/class-api';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
```

## Registered in

- `manifest.ts` — registered as a `workspace` with `kind: 'routable'`, alias `UpDoc.WorkflowWorkspace`, entity type `updoc-workflow`

## Used by

- Workspace views (`up-doc-workflow-destination-view.element.ts`, `up-doc-workflow-source-views.element.ts`) consume the context to get the current workflow name
- `up-doc-workflows-view.element.ts` navigates to this workspace via `history.pushState`
