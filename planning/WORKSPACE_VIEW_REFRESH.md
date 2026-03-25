# Workspace View Refresh — Full Reload on All Tabs

## Problem

The Refresh button in the workflow workspace only partially reloads data. When files are edited directly on disk (e.g. tweaking font-size rules in `source.json`), the backend picks up the changes (because `GetSourceConfig()` reads from disk every time), but the frontend holds stale data in memory. The Transformed tab shows the correct result (backend applied the new rules), but the rules editor modal still shows the old rules — and worse, saving from the modal overwrites the disk edits with the stale in-memory copy.

### Root cause

Each workspace view loads its data once in `#loadData()` (or `#loadConfig()`) on initial render. The Refresh button only calls `#onReExtract()` on the Source view, which re-triggers extraction and transform but **does not re-fetch** the supporting config objects (`sourceConfig`, `config`, `areaTemplate`). The Destination and Map views have **no refresh handler at all**.

### What the user experienced

1. Opened workflow workspace → Source tab loaded with correct rules
2. Edited `source.json` directly on disk (adjusted font-size tolerances)
3. Hit Refresh → Transformed tab showed correct output (backend read fresh file)
4. Rules editor modal still showed old rules (frontend held stale `_sourceConfig`)
5. Had to restart the server to get the UI to show the updated rules

## Scope

Make the Refresh button perform a **complete data reload** on whichever tab is active, equivalent to navigating away and back. No partial reloads — refresh means "reload everything on this page".

### Views affected

| View | Current behaviour | Change needed |
|------|-------------------|---------------|
| **Source** | Partial — re-extracts but skips sourceConfig, config, areaTemplate | Re-fetch all data |
| **Destination** | No refresh handler | Add refresh handler |
| **Map** | No refresh handler | Add refresh handler |
| Configuration | Static UI, no data | None |
| Workflows list | Reloads after create/delete | None |
| About | Static UI | None |

## Design

### Approach: refresh = re-run `#loadData()`

Each view already has a `#loadData()` (or `#loadConfig()`) method that fetches everything it needs. The simplest and most maintainable fix is to make the refresh handler call this same method.

This avoids:
- Duplicating fetch logic between "initial load" and "refresh"
- Missing newly-added fetches in future (refresh automatically gets them)
- Conditional logic about what to re-fetch

### Workspace context registration

Currently only the Source view registers a refresh handler via `context.setRefreshHandler()`. The Destination and Map views will register their own handlers. Since only one handler can be active at a time (it's a single callback, not a list), the **active tab's handler wins** — which is exactly correct, because only the visible view needs refreshing.

When the user switches tabs, the new view's `connectedCallback` fires and overwrites the handler. The previous view's `disconnectedCallback` should clear it to avoid stale references.

### Loading state

All views already have a `_loading` state property that shows a loader bar. Since `#loadData()` sets `_loading = true` at the start and `false` at the end, the refresh will naturally show a loading indicator — the user gets visual feedback that something is happening.

## Implementation

### Sprint 1: Source view — full refresh

**What changes:**
- `up-doc-workflow-source-view.element.ts`: Change the refresh handler from `() => this.#onReExtract()` to `() => this.#loadData()`

**What does NOT change:**
- No backend changes
- No new API calls
- `#onReExtract()` still exists and is still called by the "Re-extract" button in the Source info box — it intentionally re-triggers extraction from the source document. Refresh is a broader operation.

**Breaking changes:** None. The user-facing behaviour only improves — refresh now reloads everything including rules and config.

**Test:**
1. Open a workflow workspace → Source tab
2. Note the current area rules in the rules editor modal
3. Edit `source.json` directly on disk — change a `fontSizeEquals` value
4. Hit Refresh
5. Open the rules editor modal → **verify the new value is shown**
6. Also verify the Extracted and Transformed tabs still render correctly

**Files modified:**
- `up-doc-workflow-source-view.element.ts` (~1 line changed)

**Documentation:**
- Update `docs/src/content/docs/source-files/up-doc-workflow-source-view-element.md` — add a "Refresh behaviour" section

---

### Sprint 2: Destination view — add refresh handler

**What changes:**
- `up-doc-workflow-destination-view.element.ts`:
  - Register a refresh handler in `connectedCallback`: `context.setRefreshHandler(() => this.#loadConfig(this.#workflowAlias!))`
  - Clear the handler in `disconnectedCallback`: `context.setRefreshHandler(null)` (add `disconnectedCallback` if not present)

**What does NOT change:**
- No backend changes
- No new fetch logic — reuses existing `#loadConfig()`

**Breaking changes:** None. Previously, pressing Refresh while on the Destination tab did nothing (no handler registered). Now it reloads the config.

**Test:**
1. Open a workflow workspace → Destination tab
2. Note the blueprint fields shown
3. In Umbraco backoffice (separate tab), add a field to the document type or change the blueprint
4. Back in the workflow workspace, regenerate the destination via the API or UI
5. Hit Refresh → **verify the new field/structure appears without navigating away**

**Files modified:**
- `up-doc-workflow-destination-view.element.ts` (~5 lines added)

**Documentation:**
- Update `docs/src/content/docs/source-files/up-doc-workflow-destination-view-element.md` — add "Refresh behaviour" section

---

### Sprint 3: Map view — add refresh handler

**What changes:**
- `up-doc-workflow-map-view.element.ts`:
  - Register a refresh handler in `connectedCallback`: `context.setRefreshHandler(() => this.#loadData())`
  - Clear the handler in `disconnectedCallback` (add if not present)

**What does NOT change:**
- No backend changes
- No new fetch logic — reuses existing `#loadData()`

**Breaking changes:** None. Same as Destination — previously did nothing on refresh, now reloads.

**Test:**
1. Open a workflow workspace → Map tab
2. Note the current mappings
3. Edit `map.json` directly on disk — add or remove a mapping entry
4. Hit Refresh → **verify the Map tab reflects the new mappings**

**Files modified:**
- `up-doc-workflow-map-view.element.ts` (~5 lines added)

**Documentation:**
- Update `docs/src/content/docs/source-files/up-doc-workflow-map-view-element.md` — add "Refresh behaviour" section

---

### Sprint 4: Cleanup handlers on disconnect

**What changes:**
- All three views: ensure `disconnectedCallback` clears the refresh handler to prevent stale references when switching tabs

**Why this matters:**
- If the user is on the Source tab and switches to the Map tab, the Source view's `disconnectedCallback` fires. If it doesn't clear the handler, the workspace context still holds a reference to the Source view's `#loadData()` — which may reference detached DOM state.
- In practice, the Map view's `connectedCallback` will overwrite the handler anyway, but explicitly clearing is defensive and correct.

**What to check:**
- Source view: already has `connectedCallback` — check if it has `disconnectedCallback` and add handler cleanup if not
- Destination view: add `disconnectedCallback` with handler cleanup
- Map view: add `disconnectedCallback` with handler cleanup

**Test:**
1. Open Source tab → hit Refresh → works
2. Switch to Map tab → hit Refresh → works (Map reloads, not Source)
3. Switch to Destination tab → hit Refresh → works (Destination reloads)
4. Switch back to Source tab → hit Refresh → works (Source reloads)

No console errors at any point.

**Files modified:**
- `up-doc-workflow-source-view.element.ts` (add cleanup if missing)
- `up-doc-workflow-destination-view.element.ts` (add `disconnectedCallback`)
- `up-doc-workflow-map-view.element.ts` (add `disconnectedCallback`)

---

### Sprint 5: Documentation

**What changes:**
- Update three source-file docs with "Refresh behaviour" sections (may already be done inline with sprints 1-3)
- Add a new doc page `docs/src/content/docs/frontend/workspace-refresh.md` covering the cross-cutting refresh architecture:
  - How the refresh button works (action → workspace context → active view handler)
  - Which views support refresh and what they reload
  - The handler registration/cleanup lifecycle
  - Why refresh calls `#loadData()` rather than selective re-fetching
- Add the new page to the sidebar in `astro.config.mjs` — insert under the "Frontend (TypeScript)" group between the Overview and the source-file entries:
  ```js
  { label: 'Overview', slug: 'frontend' },
  { label: 'Workspace Refresh', slug: 'frontend/workspace-refresh' },  // new
  { label: 'index.ts', slug: 'source-files/index-ts' },
  ```
- Update `up-doc-workflow-workspace-context.md` to document the refresh handler contract (one active handler, views register/clear on connect/disconnect)

**Files modified:**
- `docs/src/content/docs/source-files/up-doc-workflow-source-view-element.md`
- `docs/src/content/docs/source-files/up-doc-workflow-destination-view-element.md`
- `docs/src/content/docs/source-files/up-doc-workflow-map-view-element.md`
- `docs/src/content/docs/source-files/up-doc-workflow-workspace-context.md`
- `docs/src/content/docs/frontend/workspace-refresh.md` (new)
- `docs/astro.config.mjs` (add sidebar entry)

---

## Summary

| Sprint | View | Change | Risk |
|--------|------|--------|------|
| 1 | Source | `#onReExtract()` → `#loadData()` | None — strictly more data |
| 2 | Destination | Register refresh handler → `#loadConfig()` | None — new behaviour where none existed |
| 3 | Map | Register refresh handler → `#loadData()` | None — new behaviour where none existed |
| 4 | All three | Clear handler on `disconnectedCallback` | None — defensive cleanup |
| 5 | Docs | New page + updates to 4 existing pages | None |

**Total files changed:** 3 TypeScript + 6 documentation
**No backend changes.** No new API endpoints. No breaking changes. No build step changes.
