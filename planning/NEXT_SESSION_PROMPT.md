# Next Session Prompt

Copy/paste this into Claude Code to continue where we left off.

---

## Where We Are

On `main` branch. Bug-fixing session complete — `feature/fix-drag-drop-dead-zone` merged.

### Just Completed (branch `feature/fix-drag-drop-dead-zone`)

1. **Drag-and-drop Ungrouped sentinel group** (commit `3b631c6`) — All rules now live inside `<updoc-sortable-rules>` containers. Ungrouped rules use a sentinel "Ungrouped" group that renders as a real group container but saves as top-level `rules[]` in JSON. This eliminates the dead zone caused by non-sortable HTML between containers.

2. **Transform group splitting fix** (commit `38859c1`) — `ContentTransformService` part-driven mode now flushes the current section when the group name changes. Fixes content-only groups (Features 5 items + Sights 11 items) being merged into a single 16-item section.

### Bugs Still Open (from `planning/BUG_FIXING_PROMPT.md`)

1. **GetConfigForBlueprint merge bug (C# side)** — `WorkflowService.GetConfigForBlueprint()` returns incorrect data for non-first source types. Frontend workaround in place.

2. **Markdown heading prefix in Content tab** — `# ` prefix showing on Page Title.

3. **ValidateConfig startup warnings** — WARN about map.json sources for PDF workflows.

4. **Workspace header input re-renders on keystroke** — Low priority.

### Polish Items
- Strategy badge contrast, button label consistency, Transformed heading cleanup
- Content tab preview: raw markdown instead of rendered HTML with friendly labels

## What I'd Like to Work On

[Tell Claude which bug or feature to tackle next]
