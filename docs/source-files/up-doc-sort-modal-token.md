# up-doc-sort-modal.token.ts

Modal token for the sort modal used to reorder areas and sections.

## What it does

Defines the `UmbModalToken` for the sort modal with type-safe data and return value interfaces.

## Interfaces

### UpDocSortModalData

```typescript
export interface UpDocSortModalData {
    headline: string;                          // e.g. "Sort areas" or "Sort sections — Main Content"
    items: Array<{ id: string; name: string }>; // Items in current order
}
```

### UpDocSortModalValue

```typescript
export interface UpDocSortModalValue {
    sortedIds: string[];  // Item IDs in new order
}
```

## Token

```typescript
export const UP_DOC_SORT_MODAL = new UmbModalToken<UpDocSortModalData, UpDocSortModalValue>(
    'UpDoc.SortModal',
    {
        modal: {
            type: 'sidebar',
            size: 'small',
        },
    },
);
```

Opens as a sidebar modal (right panel), same as other UpDoc modals.

## Used by

- `up-doc-workflow-source-view.element.ts` — imports the token and opens the modal for area/section sorting
- `up-doc-sort-modal.element.ts` — the modal element that consumes this token's data types
