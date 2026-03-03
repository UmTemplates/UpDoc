# Next Session: Bug Fixing & Polish

## Recently Completed (merged to main, pushed to origin)

All 9 commits on main since `fc02e3f`:

| Commit | Description |
|--------|-------------|
| `9c2e82d` | Add DOM tree area picker planning doc and @umbraco-ui/uui devDependency |
| `9f69c1b` | Remove 'Choose' verb from info box buttons and add Areas heading to Sections popover |
| `7f54bc7` | Add web transform rules bug planning doc and update web workflow test data |
| `d2d44f7` | Route web/markdown transform through ContentTransformService so section rules apply |
| `836193a` | Fix ungrouped rule ordering, multi-match concatenation, and web Sections button |
| `3213e2b` | Fix multi-workflow blueprint support: route extraction to correct workflow |
| `e3150f1` | Fix document name prefill to prefer pageTitle over first top-level field |
| `5626595` | Add bold detection for web sources and move-to-group rule dropdown |
| `9b71185` | Fix per-workflow config: use source-type-specific map.json for document creation |

---

## Known Bugs

### 1. Day 1 formatting quirk in itinerary
Day 1 in web-extracted itineraries doesn't get `###` heading markers while Days 2-5 do. Day 1 heading runs together with its description text. Likely an extraction pipeline issue where the first day heading isn't being detected the same way as subsequent days.

### 2. Drag-and-drop dead zone between rule groups
The "Ungrouped" title div creates a gap between `<updoc-sortable-rules>` containers where `UmbSorterController` loses the drag operation. The move-to-group dropdown is the current workaround. A proper fix would either make the title div part of the sortable container or use a different layout approach.

### 3. GetConfigForBlueprint merge uses first workflow's map.json
`WorkflowService.GetConfigForBlueprint()` merges multiple workflows sharing a blueprint but only keeps the first workflow's map.json and destination.json. The frontend works around this by fetching per-workflow config via `fetchWorkflowByAlias()`, but the C# endpoint itself returns incorrect data for non-first workflows.

### 4. Markdown heading prefix in Content tab
Page Title shows with `# ` markdown heading prefix. The `stripMarkdown()` function should clean this but may not cover all cases. Affects both PDF and web source types.

### 5. ValidateConfig warnings for PDF workflows
Startup WARN messages for map.json sources not found in source.json — cosmetic only, because PDF workflows use areaRules instead of sections. See `memory/known-bugs.md`.

### 6. Workspace header input re-renders on keystroke
Editing workflow name in workspace header re-renders on every keystroke. Low priority cosmetic issue.

---

## Future Polish Ideas

### Configurable node name field
Currently the document name is derived from whichever mapping targets `pageTitle` (hardcoded default). Add a `nodeNameField` property to `destination.json` or `workflow.json` so the workflow author can configure which destination field maps to the node name.

### Search/filter bar on Source Extracted tab
Long extractions (20+ sections) make scrolling tedious. Add a filter input that filters visible sections by name or content text.

### Content tab preview quality
Content tab shows raw markdown and property aliases instead of rendered HTML with friendly labels.

### Strategy badge contrast, button label consistency, Transformed heading cleanup
Minor visual polish items.
