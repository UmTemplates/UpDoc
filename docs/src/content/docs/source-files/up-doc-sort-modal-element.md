---
title: "up-doc-sort-modal.element.ts"
---


Sort modal for reordering areas within a page or sections within an area, following Umbraco's Sort Children modal pattern.

## What it does

Provides a sidebar modal with a sortable `umb-table` for drag-and-drop reordering. Used by the Source tab's row action buttons to sort areas and sections in the Transformed view.

## How it works

### Modal data flow

```
Source View → opens modal with items → user drags to reorder → modal returns sorted IDs → Source View saves via API
```

### Table setup

- Single "Name" column with `allowSorting: true`
- `umb-table` with `.sortable=${true}` enables drag-and-drop row reordering
- `allowSelection: false` — no checkboxes, sort only
- Each row has a drag handle icon (`icon-navigation`)

### Events

| Event | Handler | Purpose |
|-------|---------|---------|
| `@sorted` | `#onSorted` | Fires when a row is dragged to a new position — updates internal `_tableItems` |
| `@ordered` | `#onOrdered` | Fires when the "Name" column header is clicked — sorts alphabetically (asc/desc) |

### Modal result

On **Save**, returns `{ sortedIds: string[] }` — the item IDs in their new order.
On **Cancel**, rejects the modal (no changes applied).

## Layout

Uses `umb-body-layout` with `slot="actions"` for pinned bottom buttons. The `:host` has `height: 100%` to ensure `umb-body-layout` fills the sidebar and pins the action bar to the bottom (same pattern as the Section Rules Editor modal).

## Registration

```typescript
{
    type: 'modal',
    alias: 'UpDoc.SortModal',
    name: 'Sort Modal',
    element: () => import('./up-doc-sort-modal.element.js'),
}
```

## Token

See [up-doc-sort-modal.token.ts](up-doc-sort-modal-token.md).

## Used by

- `up-doc-workflow-source-view.element.ts` — `#onSortAreas()` and `#onSortSections()` open this modal
