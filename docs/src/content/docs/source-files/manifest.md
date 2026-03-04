---
title: "manifest.ts"
---


Defines all extension manifests that get registered with Umbraco's extension registry.

## What it does

Exports an array of `UmbExtensionManifest` objects that tell Umbraco about our custom extensions:

1. An **entity action** that adds "Create Document from Source" to document context menus
2. A **condition** that controls when the entity action is visible
3. **Modals** for the source selection sidebar, blueprint picker, workflow creation sidebar, and workflow detail
4. A **settings sidebar** with tree and workspace for the UpDoc dashboard

## Entity Action

```typescript
{
    type: 'entityAction',
    kind: 'default',
    alias: 'UpDoc.EntityAction',
    name: 'UpDoc Entity Action',
    weight: 1100,
    api: () => import('./up-doc-action.js'),
    forEntityTypes: ['document'],
    meta: {
        icon: 'icon-document',
        label: 'Create Document from Source',
    },
    conditions: [
        {
            alias: 'Umb.Condition.EntityIsNotTrashed',
        },
        {
            alias: 'UpDoc.Condition.HasAvailableWorkflows',
        },
    ],
}
```

**Key properties:**
- `type: 'entityAction'` - Adds an action to entity context menus
- `forEntityTypes: ['document']` - Only shows on document nodes
- `weight: 1100` - Controls menu item position (higher = higher in list)
- `api` - Lazy loads the action class when needed
- `conditions` - Two conditions must both pass (AND logic):
    - `Umb.Condition.EntityIsNotTrashed` - hides the action for documents in the recycle bin
    - `UpDoc.Condition.HasAvailableWorkflows` - per-node check: hides the action unless the node's allowed child types have blueprints with complete workflows

## Condition: HasAvailableWorkflows

```typescript
{
    type: 'condition',
    alias: 'UpDoc.Condition.HasAvailableWorkflows',
    name: 'Has Available Workflows',
    api: () => import('./up-doc-has-workflows.condition.js'),
}
```

Registers the custom condition class. This is a **per-node check** -- it uses `UMB_ENTITY_CONTEXT` to get the current node, looks up its allowed child types, and checks whether any of them have blueprints with complete workflows. The entity action only appears on nodes where "Create Document from Source" would actually work.

See [up-doc-has-workflows.condition.ts](up-doc-has-workflows-condition.md) for implementation details.

## Modals

```typescript
{
    type: 'modal',
    alias: 'UpDoc.Modal',
    name: 'UpDoc Modal',
    element: () => import('./up-doc-modal.element.js'),
}
```

```typescript
{
    type: 'modal',
    alias: 'UpDoc.BlueprintPickerModal',
    name: 'Blueprint Picker Modal',
    element: () => import('./blueprint-picker-modal.element.js'),
}
```

```typescript
{
    type: 'modal',
    alias: 'UpDoc.CreateWorkflowSidebar',
    name: 'Create Workflow Sidebar',
    element: () => import('./create-workflow-sidebar.element.js'),
}
```

**Key properties:**
- `type: 'modal'` - Registers a modal dialog
- `alias` - Must match the token alias in the corresponding `.token.ts` file
- `element` - Lazy loads the Lit component

## Collection Action: Create from Source

```typescript
{
    type: 'collectionAction',
    kind: 'button',
    alias: 'UpDoc.CollectionAction',
    name: 'UpDoc Collection Action',
    element: () => import('./up-doc-collection-action.element.js'),
    weight: 50,
    meta: {
        label: 'Create from Source',
    },
    conditions: [
        {
            alias: 'Umb.Condition.CollectionAlias',
            match: 'Umb.Collection.Document',
        },
    ],
}
```

**Key properties:**
- `type: 'collectionAction'` — adds a button to the collection toolbar
- `kind: 'button'` — renders as a toolbar button
- `element` — uses a custom Lit element (not `api`) for conditional rendering and workspace context access
- `weight: 50` — appears after Umbraco's own create button (weight 100)
- `Umb.Condition.CollectionAlias` — only appears on document collections

The element handles its own visibility internally by checking for active workflows. See [up-doc-collection-action.element.ts](up-doc-collection-action-element.md) for details.

## Workflow Workspace — Individual Workflow Pages

These manifests register a routable workspace for viewing individual workflows as full pages:

```typescript
{
    type: 'workspace',
    kind: 'routable',
    alias: 'UpDoc.WorkflowWorkspace',
    name: 'UpDoc Workflow Workspace',
    api: () => import('./up-doc-workflow-workspace.context.js'),
    meta: {
        entityType: 'updoc-workflow',
    },
}
```

**Key properties:**
- `kind: 'routable'` — supports URL routing with `edit/:unique` path segments
- `entityType: 'updoc-workflow'` — connects the workspace to workflow navigation
- `api` — lazy loads the workspace context class

### Workflow Workspace Views

Three workspace views provide tabs within the workflow workspace:

| Alias | Label | Weight | Element | Description |
|-------|-------|--------|---------|-------------|
| `UpDoc.WorkflowWorkspaceView.Destination` | Destination | 300 | `up-doc-workflow-destination-view.element.js` | Blueprint fields and block grids |
| `UpDoc.WorkflowWorkspaceView.Source` | Source | 200 | `up-doc-workflow-source-view.element.js` | Sample extraction display + source-to-destination mapping |
| `UpDoc.WorkflowWorkspaceView.Map` | Map | 100 | `up-doc-workflow-map-view.element.js` | All mappings overview with delete |

All are conditioned on `Umb.Condition.WorkspaceAlias` matching `UpDoc.WorkflowWorkspace`.

### Destination Picker Modal

```typescript
{
    type: 'modal',
    alias: 'UpDoc.DestinationPickerModal',
    name: 'Destination Picker Modal',
    element: () => import('./destination-picker-modal.element.js'),
}
```

A sidebar modal for selecting destination fields when creating mappings from the Source tab.

## Sort Modal

```typescript
{
    type: 'modal',
    alias: 'UpDoc.SortModal',
    name: 'Sort Modal',
    element: () => import('./up-doc-sort-modal.element.js'),
}
```

Sidebar modal for reordering areas within a page or sections within an area. Uses `umb-table` with drag-and-drop sorting, following Umbraco's Sort Children pattern. See [up-doc-sort-modal.element.ts](up-doc-sort-modal-element.md) for details.

## Area Editor Modal

```typescript
{
    type: 'modal',
    alias: 'UpDoc.AreaEditorModal',
    name: 'Area Editor Modal',
    element: () => import('./pdf-area-editor-modal.element.js'),
}
```

Full-screen modal for drawing and naming rectangular areas on a PDF. Uses PDF.js for rendering and canvas overlay for area drawing. Areas define extraction regions — only content within defined areas is extracted.

## Settings Sidebar, Tree, and Workspace

The remaining manifests register the UpDoc dashboard in the Settings section.

### Sidebar integration (uSync-aware)

UpDoc appears under the "Synchronisation" group in the Settings sidebar. When uSync is installed, UpDoc registers as a `menuItem` inside uSync's existing `usync.menu`. When uSync is NOT installed, a fallback `sectionSidebarApp` creates its own "Synchronisation" group.

- **`condition`** (`UpDoc.Condition.UsyncNotInstalled`) — checks if `usync.menu` is NOT in the extension registry. Permits when uSync is absent.
- **`menuItem`** — targets both `usync.menu` and `UpDoc.Menu` (whichever is rendered). Uses `hideTreeRoot: true` for flat display.
- **`sectionSidebarApp`** (fallback) — creates "Synchronisation" group, conditioned on uSync NOT being installed.
- **`menu`** (`UpDoc.Menu`) — fallback menu container, only rendered by the fallback sectionSidebarApp.

### Other Settings manifests

- **`repository`** + **`tree`** + **`treeItem`** - Data source for workflow tree items
- **`workspace`** (`kind: 'routable'`) - Right panel with tabs for editing workflows
- **`workspaceView`** (x3) - Tabs: Workflows, Configuration, About

## Important notes

- All imports use `.js` extension (TypeScript compiles to JS)
- Lazy loading (`() => import()`) improves initial load performance
- The `alias` values must be unique and match corresponding tokens
- Conditions use AND logic — all must pass for the extension to appear
