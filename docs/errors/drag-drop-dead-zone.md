# Drag-and-drop dead zone between sortable containers

## Symptom

Dragging a rule card loses tracking immediately after leaving the grip handle. Rules cannot be dragged between groups or reordered within a group. The drag placeholder disappears and the item snaps back to its original position.

## Root cause

`UmbSorterController` (Umbraco's built-in drag-and-drop controller) relies on `dragover` events firing continuously on container elements. Each `<updoc-sortable-rules>` component has its own `UmbSorterController` instance sharing the same `identifier` string (`'updoc-rules-sorter'`), which enables cross-container dragging.

However, any non-sortable HTML between containers — group title dividers, "Add rule" buttons, "Add group" buttons — creates **dead zones** where `dragover` events never fire. When the user drags past these gaps, `UmbSorterController` loses track of the dragged item entirely.

This was confirmed by studying the Umbraco CMS source code at `Umbraco-CMS/src/Umbraco.Web.UI.Client/src/packages/core/sorter/sorter.controller.ts`. The `#itemDraggedOver` method (lines ~543-576) handles cross-container handoff via `dragover` listeners on container elements. No listener = no handoff.

Umbraco's own Content Type Design Editor avoids this by using flush CSS grid layouts with no non-sortable elements between containers.

## Solution

Put **all** rules inside sortable containers — including previously "ungrouped" rules that lived outside any group. The section rules editor modal now uses a sentinel group called "Ungrouped":

- All rules are inside a `<updoc-sortable-rules>` container (one per group, including "Ungrouped")
- No non-sortable HTML between containers (buttons moved inside containers)
- The "Ungrouped" group renders with a simpler header (no rename/delete buttons)
- On save, the "Ungrouped" group is converted back to top-level `rules[]` in the JSON (not saved as a named group)

This allows cross-container drag-and-drop to work because `dragover` events fire continuously across all containers.

## Remaining limitation

Drag-and-drop between groups is functional but can still be slightly flaky. The "Move to..." dropdown on each rule card remains as a reliable fallback for moving rules between groups.

## Key lesson

When using `UmbSorterController` with multiple containers (shared `identifier`), ensure there is zero non-sortable DOM between the container elements. Any gap — even a small heading div or button — breaks the `dragover` event chain that the controller depends on for cross-container operations.

## Related files

- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/section-rules-editor-modal.element.ts` — rules editor modal with Ungrouped sentinel
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/sortable-rules-container.element.ts` — wrapper around `UmbSorterController`
- `Umbraco-CMS/src/Umbraco.Web.UI.Client/src/packages/core/sorter/sorter.controller.ts` — Umbraco sorter source
