# Bug Fixing Session Prompt

Use this prompt to start a bug-fixing session. Copy/paste it into Claude Code.

---

## Prompt

I'd like to do a bug-fixing and polish session on the UpDoc project. Here's a summary of known loose ends from recent work:

### Bugs to investigate

1. **Drag-and-drop between groups** — Removing the "Ungrouped" label (done) wasn't sufficient. Drag loses tracking immediately after leaving the grip handle area. The real problem is non-sortable HTML between `<updoc-sortable-rules>` containers (Add rule buttons, group-container divs, Add group button). Need to investigate `UmbSorterController` cross-container drag requirements. Move-to-group dropdown works as a workaround.

1b. **Rules save persistence** — Rules created/modified in the section rules editor modal don't persist when reopening the modal. The save pipeline (`#onSave` → `data.onSave` → `#saveAreaRulesForKey` → API PUT) looks correct but rules are lost. Needs investigation.

2. **GetConfigForBlueprint merge bug (C# side)** — `WorkflowService.GetConfigForBlueprint()` merges multiple workflows sharing a blueprint but only keeps the first workflow's map.json and destination.json. The frontend works around this, but the C# endpoint itself returns incorrect data for non-first source types. Should be fixed properly so the API returns correct data.

3. **Markdown heading prefix in Content tab** — Page Title shows with `# ` prefix in the Create from Source Content tab. The `stripMarkdown()` function should be cleaning this. Check if it's being called in all code paths.

4. **ValidateConfig startup warnings** — WARN messages about map.json sources not found in source.json for PDF workflows. The validation checks against `sections[]` array which is empty for PDF workflows (they use `areaRules` instead). Quick fix: skip validation when sections is empty.

5. **Workspace header input re-renders on keystroke** — Editing workflow name in workspace header causes input to re-render on every keystroke. Likely the `@input`/`@change` handler triggers a state update that causes Lit to re-render. Low priority.

### Polish items

- Strategy badge contrast improvements
- Button label consistency across all views
- Transformed heading cleanup
- Content tab preview: shows raw markdown instead of rendered HTML with friendly labels

### Reference files

- `planning/NEXT_SESSION.md` — Full known issues list
- `memory/known-bugs.md` — Persistent bug tracking
- `memory/completed-phases.md` — What was done recently

Which bugs would you like to tackle first?
