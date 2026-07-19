---
title: "up-doc-tree.repository.ts"
---


Tree repository that puts a single "UpDoc" entry in the Settings section sidebar.

## What it does

Implements Umbraco's tree repository pattern, but for a tree with exactly one node and no children. It exists to give UpDoc a place in the Settings sidebar, not to represent a hierarchy.

## Entity types

```typescript
export const UPDOC_ENTITY_TYPE = 'updoc';
export const UPDOC_ROOT_ENTITY_TYPE = 'updoc-root';
```

Imported elsewhere — `up-doc-workspace.context.ts` returns `UPDOC_ENTITY_TYPE` from `getEntityType()`.

## Data source

`UpDocTreeDataSource` extends `UmbTreeServerDataSourceBase`, but makes no server calls. All three required methods are satisfied locally:

| Method | Returns |
|---|---|
| `getRootItems` | One hardcoded item, "UpDoc", icon `icon-nodes` |
| `getChildrenOf` | Empty array |
| `getAncestorsOf` | Empty array |

The single root item appears in the sidebar because the tree is registered with `hideTreeRoot: true` — the actual root is hidden, so this item reads as the top level.

## Repository

```typescript
export class UpDocTreeRepository
    extends UmbTreeRepositoryBase<UpDocTreeItemModel, UmbTreeRootModel>
    implements UmbApi
{
    async requestTreeRoot() {
        const data: UmbTreeRootModel = {
            unique: null,
            entityType: UPDOC_ROOT_ENTITY_TYPE,
            name: 'UpDoc',
            hasChildren: true,
            isFolder: true,
        };
        return { data };
    }
}
```

## Why a tree at all

A flat entry would be simpler, but Umbraco's Settings section is built around trees. Implementing the tree interface for a single node is the conventional way to appear there — the same approach Umbraco's own single-item settings entries use.

## Used by

- `manifest.ts` — registers the tree and its repository
- `up-doc-workspace.context.ts` — imports `UPDOC_ENTITY_TYPE`
