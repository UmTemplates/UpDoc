---
title: "Workspace Refresh"
---

How the Refresh button works across workflow workspace views, and the handler registration lifecycle.

## Overview

Each workflow workspace view (Source, Destination, Map) registers a refresh handler with the workspace context when it mounts. The Refresh toolbar button calls this handler, triggering a full data reload on the active tab.

**Principle:** Refresh always reloads all data on the active view — equivalent to navigating away and back. There are no partial reloads.

## How it works

```
┌─────────────────┐     ┌───────────────────────┐     ┌──────────────┐
│ Refresh button   │────▶│ Workspace context      │────▶│ Active view  │
│ (toolbar action) │     │ refresh()              │     │ #loadData()  │
└─────────────────┘     │ delegates to handler   │     └──────────────┘
                        └───────────────────────┘
```

1. **`up-doc-refresh.action.ts`** — workspace action that calls `workspaceContext.refresh()`
2. **`up-doc-workflow-workspace.context.ts`** — holds a single `#refreshHandler` callback, set by the active view
3. **Active view** — registers its `#loadData()` (or `#loadConfig()`) as the handler

## Handler lifecycle

Each view registers its handler in `connectedCallback` and clears it in `disconnectedCallback`:

```typescript
override connectedCallback() {
    super.connectedCallback();
    this.consumeContext(UMB_WORKSPACE_CONTEXT, (context) => {
        this.#workspaceContext = context;
        (context as any).setRefreshHandler(() => this.#loadData());
        // ... observe unique, etc.
    });
}

override disconnectedCallback() {
    super.disconnectedCallback();
    this.#workspaceContext?.setRefreshHandler(null);
}
```

Since only one handler can be registered at a time, switching tabs naturally replaces the handler — the new view's `connectedCallback` fires and sets its own handler, while the previous view's `disconnectedCallback` clears the stale reference.

## What each view reloads

| View | Method | Data reloaded |
|------|--------|---------------|
| **Source** | `#loadData()` | Sample extraction, workflow config, source config (area rules, excluded areas, page selection, container overrides), area detection, transform result, area template |
| **Destination** | `#loadConfig()` | Workflow config, blueprint validation |
| **Map** | `#loadData()` | Workflow config (includes map.json, destination.json, validation warnings), sample extraction |

All views show a loading indicator (`uui-loader-bar`) during refresh, as the load methods set `_loading = true`.

## Why full reload, not selective

An earlier implementation only re-fetched extraction and transform data on refresh, skipping source config and workflow config. This caused stale data when files were edited directly on disk — the backend applied the correct rules, but the frontend UI still showed old values. Worse, saving from the rules editor would overwrite the disk changes with the stale in-memory copy.

Full reload avoids this class of bug entirely and requires no maintenance when new data dependencies are added — they're automatically included.

## Views without refresh

| View | Reason |
|------|--------|
| **Configuration** | Static UI, no data to reload |
| **Workflows list** | Explicitly reloads after create/delete operations |
| **About** | Static UI |
