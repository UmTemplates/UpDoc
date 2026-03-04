---
title: "create-workflow-sidebar.token.ts"
---


Modal token definition for the Create Workflow sidebar.

## What it does

Defines the data and return value types for the Create Workflow sidebar modal, and exports the modal token used to open it.

## Interfaces

### CreateWorkflowSidebarData

```typescript
interface CreateWorkflowSidebarData {
    documentTypeUnique: string;  // Document type GUID
    documentTypeName: string;    // Display name
    documentTypeAlias: string;   // Umbraco alias (needed for backend)
    blueprintUnique: string;     // Blueprint GUID
    blueprintName: string;       // Blueprint display name
}
```

Populated by the blueprint picker dialog (step 1) before opening the sidebar (step 2).

### CreateWorkflowSidebarValue

```typescript
interface CreateWorkflowSidebarValue {
    name: string;              // Workflow folder name (kebab-case)
    sourceType: string;        // 'pdf' | 'markdown' | 'web' | 'doc'
    mediaUnique: string | null; // Selected sample media GUID (for PDF/Markdown/Word)
    sourceUrl: string | null;   // Sample URL (for Web source type)
    documentTypeAlias: string;  // Passed through from data
    blueprintId: string;        // Passed through from data
    blueprintName: string;      // Passed through from data
}
```

## Token

```typescript
export const UMB_CREATE_WORKFLOW_SIDEBAR = new UmbModalToken<CreateWorkflowSidebarData, CreateWorkflowSidebarValue>(
    'UpDoc.CreateWorkflowSidebar',
    { modal: { type: 'sidebar', size: 'small' } },
);
```

## Used by

- `up-doc-workflows-view.element.ts` — opens the modal (step 2 of Create Workflow flow) and handles the return value
- `create-workflow-sidebar.element.ts` — implements the modal UI
