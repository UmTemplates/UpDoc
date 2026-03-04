# Plan: Collapsible Groups + Drag-and-Drop Group Reordering in Rules Editor

## Context

The Section Rules Editor modal shows groups (Features, Sights, Suggested Itinerary, Accommodation) in the order they were created. There's no way to reorder them, and with 4+ groups the modal gets visually busy. This plan adds:

1. **Collapsible groups** — click a group header to collapse/expand it
2. **Expand All / Collapse All toggle** — bulk toggle at the top
3. **Drag-and-drop group reordering** — drag handle on group headers, only when collapsed

The key insight: **collapsed groups have no visible child drag targets**, so the group-level `UmbSorterController` and the existing rule-level sorter never compete for the same gesture. This avoids the nested sortable complexity entirely.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Collapse mechanism | Same `Set<string>` pattern as source view | Proven pattern, no uui-box collapse exists |
| Drag-and-drop vs sort modal | Drag-and-drop (collapsed only) | Groups are already visual boxes — adding a grip icon when collapsed is natural. Collapsing removes inner sortable targets, avoiding nesting conflicts |
| Drag handle visibility | Only when collapsed | Prevents accidental group drag when editing rules inside. Clear mode distinction |
| Expand/Collapse All | Button in stats line area | Same pattern as Transformed tab's "Collapse" popover |
| Group order persistence | `sortOrder` on `RuleGroup` in `transform.json` | Same pattern as area/section sort order |
| Ungrouped group | Always last, not draggable | It's a sentinel, not a real group. Reordering it makes no sense |

---

## Sprint 1: Collapsible Groups

**Goal:** Groups can be individually collapsed/expanded. An "Expand all / Collapse all" toggle button at the top.

### Changes to `section-rules-editor-modal.element.ts`:

1. **Add collapse state:**
   ```typescript
   @state() private _collapsedGroups = new Set<string>();
   ```

2. **Toggle method:**
   ```typescript
   #isGroupCollapsed(groupName: string): boolean
   #toggleGroupCollapse(groupName: string): void
   ```

3. **Group header gets a chevron + click handler:**
   - Add `uui-symbol-expand` to group headers (both named groups and Ungrouped)
   - Click on header toggles collapse
   - `.open=${!this.#isGroupCollapsed(name)}`

4. **Conditional child rendering:**
   - When collapsed: hide `.group-rules` (the `<updoc-sortable-rules>` + "+ Add rule" button)
   - When expanded: render as today

5. **Expand All / Collapse All button:**
   - Add a button in the stats/info line area (top of modal)
   - Click toggles all groups
   - Label reflects current state: "Collapse all" when any are expanded, "Expand all" when all collapsed

### Testable outcomes:
- [ ] Click a group header → content collapses, chevron rotates
- [ ] Click again → content expands
- [ ] "Collapse all" button → all groups collapse
- [ ] "Expand all" button → all groups expand
- [ ] Ungrouped group also collapsible
- [ ] Rule drag-and-drop still works inside expanded groups (no regression)

---

## Sprint 2: Drag-and-Drop Group Reordering

**Goal:** Drag handle appears on collapsed group headers. Groups can be reordered by dragging. Order persists.

### Changes to `section-rules-editor-modal.element.ts`:

1. **Wrapper container for all groups:**
   - Wrap the `groupedView.map(...)` output in a `<div class="groups-container">` — this becomes the sortable container

2. **Second `UmbSorterController` for groups:**
   ```typescript
   #groupSorter = new UmbSorterController<{group: string}, HTMLElement>(this, {
       identifier: 'updoc-group-sorter',
       itemSelector: '.group-container',
       containerSelector: '.groups-container',
       handleSelector: '.group-grip',
       disabledItemSelector: '[data-group-expanded]',  // expanded groups not draggable
       ...
   });
   ```

3. **Drag handle on group headers:**
   - Add `.group-grip` element (same `::` dots icon as rule grip)
   - Only visible when group is collapsed (CSS: `.group-container[data-group-expanded] .group-grip { display: none }`)
   - Or: render grip conditionally based on collapsed state

4. **`data-group-expanded` attribute:**
   - Set on `.group-container` when group is expanded
   - Used by `disabledItemSelector` to prevent dragging expanded groups

5. **Ungrouped exclusion:**
   - Ungrouped sentinel group does NOT get a grip handle
   - Always rendered last, not part of the sortable model
   - Render it outside the `.groups-container` wrapper

6. **Order state:**
   - `_groupOrder` already exists and controls render order
   - `onChange` from the group sorter updates `_groupOrder`

### Changes to C# backend:

7. **`SortOrder` on `RuleGroup` model** (in `TransformResult.cs` or `transform.json` model):
   - Nullable `int? SortOrder` property
   - `ContentTransformService` preserves across re-transforms

8. **Persist on save:**
   - When the modal saves, group order is written back
   - The existing save endpoint writes `transform.json` — ensure group sort order is included

### Testable outcomes:
- [ ] Collapse a group → grip handle appears on header
- [ ] Drag collapsed group up/down → group moves, other groups shift
- [ ] Expand a group → grip handle disappears, group cannot be dragged
- [ ] Ungrouped group stays at bottom, no grip handle
- [ ] Save and reopen → group order preserved
- [ ] Re-transform → group order preserved
- [ ] Rule drag-and-drop within expanded groups still works (no regression)

---

## Files Modified

| File | Sprint | Changes |
|------|--------|---------|
| `section-rules-editor-modal.element.ts` | 1 + 2 | Collapse state, chevron, toggle, expand/collapse all, group sorter, grip handles, wrapper div |
| `workflow.types.ts` | 2 | `sortOrder` on RuleGroup type (if not already present) |
| `TransformResult.cs` | 2 | `SortOrder` on `RuleGroup` model |
| `ContentTransformService.cs` | 2 | Preserve group `SortOrder` across re-transforms |

## Files NOT Modified

| File | Why |
|------|-----|
| `sortable-rules-container.element.ts` | Rule-level sorting unchanged |
| `up-doc-sort-modal.element.ts` | Not using the sort modal for this |
| `WorkflowController.cs` | No new endpoint — group order saves with existing rule save |
