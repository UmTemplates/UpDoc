---
title: "up-doc-workflow-detail-modal.token.ts"
---


Modal token definition for the Workflow Detail sidebar modal.

## What it does

Defines the data and return value types for the read-only workflow detail modal, and exports the modal token used to open it.

## Interfaces

### WorkflowDetailModalData

```typescript
interface WorkflowDetailModalData {
    workflowName: string; // The workflow folder name to display
}
```

### WorkflowDetailModalValue

Empty — the modal is read-only and returns no data.

## Token

```typescript
export const UMB_WORKFLOW_DETAIL_MODAL = new UmbModalToken<WorkflowDetailModalData, never>(
    'UpDoc.WorkflowDetailModal',
    { modal: { type: 'sidebar', size: 'medium' } },
);
```

## Used by

- `up-doc-workflows-view.element.ts` — opens the modal when a workflow row is clicked
- `up-doc-workflow-detail-modal.element.ts` — implements the modal UI
