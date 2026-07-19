---
title: "up-doc-refresh.action.ts"
---


Workspace action that reloads the current workflow view.

## What it does

Registered as a workspace action on the workflow workspace. Consumes `UMB_WORKSPACE_CONTEXT`, casts it to `UpDocWorkflowWorkspaceContext`, and calls `refresh()` on it.

```typescript
export class UpDocRefreshAction extends UmbWorkspaceActionBase {
    #retrieveContext: Promise<unknown>;
    #workspaceContext?: UpDocWorkflowWorkspaceContext;

    override async execute() {
        await this.#retrieveContext;
        await this.#workspaceContext?.refresh();
    }
}
```

The context is retrieved as a promise in the constructor and awaited before use, so the action works even if it executes before context resolution completes.

## Delegation

The action itself holds no refresh logic. `UpDocWorkflowWorkspaceContext.refresh()` delegates to whichever handler the active workspace view registered via `setRefreshHandler()`.

That indirection is what lets one button do the right thing on three different tabs. It is also the source of a known defect — see below.

## Known issue

The handler is stored in a single slot, and each view clears it unconditionally when it disconnects. On tab switch, the outgoing view can clear the incoming view's handler, leaving `refresh()` with nothing to call. The button then does nothing, silently, with no error or notification.

Tracked in [issue #38](https://github.com/UmTemplates/UpDoc/issues/38), which also notes that on the Source view `refresh()` triggers a transform — a write — rather than a plain reload.

## Used by

- `manifest.ts` — registers the action against `UpDoc.WorkflowWorkspace`
- `up-doc-workflow-workspace.context.ts` — provides `refresh()` and the handler registry
