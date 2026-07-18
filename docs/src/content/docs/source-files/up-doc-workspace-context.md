---
title: "up-doc-workspace.context.ts"
---


Workspace context for the UpDoc Settings section entry.

## What it does

Provides the workspace context Umbraco expects when a tree item is opened, and registers the route that renders it. This is the *section* workspace — distinct from `up-doc-workflow-workspace.context.ts`, which handles individual workflows.

## Editor element

Declared in the same file, a thin wrapper around Umbraco's workspace editor:

```typescript
@customElement('up-doc-workspace-editor')
class UpDocWorkspaceEditorElement extends LitElement {
    override render() {
        return html`<umb-workspace-editor></umb-workspace-editor>`;
    }
}
```

`umb-workspace-editor` supplies the chrome — header, tabs, action bar. Tabs themselves come from views registered in `manifest.ts` (About, Workflows, Configuration).

## Context class

```typescript
export class UpDocWorkspaceContext extends UmbContextBase {
    public readonly workspaceAlias = 'UpDoc.Workspace';

    #data = new UmbObjectState<UpDocWorkspaceData | undefined>(undefined);
    readonly data = this.#data.asObservable();
    readonly unique = this.#data.asObservablePart((data) => data?.unique);
    readonly name = this.#data.asObservablePart((data) => data?.name);

    readonly routes = new UmbWorkspaceRouteManager(this);
}
```

State is held in an `UmbObjectState` with two derived observable parts, following the standard Umbraco state pattern. Views consume the context and observe `unique` or `name` rather than reading state directly.

## Routing

One route, registered in the constructor:

```typescript
this.routes.setRoutes([
    {
        path: 'edit/:unique',
        component: UpDocWorkspaceEditorElement,
        setup: (_component, info) => {
            const unique = info.match.params.unique;
            this.load(unique);
        },
    },
]);
```

`load()` sets the unique and a fixed name of "UpDoc". There is no server call — the section has a single entry and nothing to fetch.

## Cleanup

`destroy()` disposes the state object before delegating to the base class. Omitting that leaks the observable.

## Used by

- `manifest.ts` — registers the workspace and its views
- `up-doc-tree.repository.ts` — supplies `UPDOC_ENTITY_TYPE`, returned by `getEntityType()`

## See also

- [`up-doc-workflow-workspace.context.ts`](/UpDoc/source-files/up-doc-workflow-workspace-context/) — the per-workflow workspace, which is where the real work happens
