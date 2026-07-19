---
title: "up-doc-save.action.ts"
---


Workspace action that saves the current workflow.

## What it does

Structurally identical to `up-doc-refresh.action.ts`, differing only in which context method it calls.

```typescript
export class UpDocSaveAction extends UmbWorkspaceActionBase {
    #retrieveContext: Promise<unknown>;
    #workspaceContext?: UpDocWorkflowWorkspaceContext;

    override async execute() {
        await this.#retrieveContext;
        await this.#workspaceContext?.save();
    }
}
```

Consumes `UMB_WORKSPACE_CONTEXT` in the constructor as a promise, awaits it in `execute()`, then calls `save()`.

## Delegation

As with the refresh action, the logic lives in the workspace context rather than the action. `UpDocWorkflowWorkspaceContext.save()` calls whichever save handler the active view registered.

## Used by

- `manifest.ts` — registers the action against `UpDoc.WorkflowWorkspace`
- `up-doc-workflow-workspace.context.ts` — provides `save()` and the handler registry

## See also

- [`up-doc-refresh.action.ts`](/UpDoc/source-files/up-doc-refresh-action/) — the sibling action
