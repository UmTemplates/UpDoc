---
title: "pdf-area-editor-modal.token.ts"
---


Modal token for the PDF area editor, where areas are drawn directly onto a rendered PDF page.

## Interfaces

### AreaEditorModalData

```typescript
export interface AreaEditorModalData {
    workflowAlias: string;
    existingTemplate?: AreaTemplate | null;
    selectedPages?: number[] | null;
}
```

`existingTemplate` is passed when editing an existing template rather than drawing a new one. `selectedPages` restricts the editor to a subset of pages, matching whatever the workflow's page selection allows.

### AreaEditorModalValue

```typescript
export interface AreaEditorModalValue {
    template: AreaTemplate;
}
```

Returns the drawn template. `AreaTemplate` is defined in `workflow.types.ts`.

## Token

```typescript
export const UMB_AREA_EDITOR_MODAL = new UmbModalToken<AreaEditorModalData, AreaEditorModalValue>(
    'UpDoc.AreaEditorModal',
    {
        modal: {
            type: 'sidebar',
            size: 'large',
        },
    },
);
```

Opens as a large sidebar modal. The extra width matters here — the modal renders a full PDF page to a canvas for drawing on.

## Used by

- `pdf-area-editor-modal.element.ts` — the modal element consuming these types
- `up-doc-workflow-source-view.element.ts` — opens the editor
