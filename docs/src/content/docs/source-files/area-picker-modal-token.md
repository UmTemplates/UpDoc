---
title: "area-picker-modal.token.ts"
---


Modal token for the area picker, used to choose which detected areas are included in a transform.

## Interfaces

### AreaPickerModalData

```typescript
export interface AreaPickerModalData {
    /** List of all detected area names (e.g., "Navigation", "Main Content"). */
    areas: Array<{ name: string; elementCount: number; color: string }>;
    /** Currently excluded area names in kebab-case. */
    excludedAreas: string[];
    /** For web sources: hierarchical container tree from sample extraction. */
    containers?: ContainerTreeNode[] | null;
    /** For web sources: current container overrides from source config. */
    containerOverrides?: ContainerOverride[];
}
```

The two `containers` fields are web-only. When present, the modal renders a two-pane layout with the container tree alongside the area list; when absent, it falls back to a simple area list. That branch is what makes one modal serve both PDF and web sources.

### AreaPickerModalValue

```typescript
export interface AreaPickerModalValue {
    excludedAreas: string[];
    containerOverrides?: ContainerOverride[];
}
```

Note both fields describe **exclusions and overrides**, not selections. Areas are included by default; the modal records what to leave out.

## Token

```typescript
export const UMB_AREA_PICKER_MODAL = new UmbModalToken<
    AreaPickerModalData,
    AreaPickerModalValue
>('UpDoc.AreaPickerModal', {
    modal: {
        type: 'sidebar',
        size: 'large',
    },
});
```

## Used by

- `area-picker-modal.element.ts` — the modal element consuming these types
- `up-doc-workflow-source-view.element.ts` — opens the picker
