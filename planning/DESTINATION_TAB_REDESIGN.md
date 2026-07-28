# Plan: Destination Tab Redesign — Blueprint Re-extract & UX Improvements

## Status: NOT STARTED

---

## Problem

The Destination tab has several UX issues:

1. **No feedback on Regenerate** — The "Regenerate" buttons on Fields and Blocks info boxes are wired to the backend and functional, but give no visible feedback (no toast, no loading indicator, no "nothing changed" message). Users cannot tell if anything happened.

2. **Two Regenerate buttons for one action** — Both Fields and Blocks call the same `regenerateDestination()` endpoint. Having two buttons implies they do different things, but they don't.

3. **Conceptual mismatch** — "Regenerate Fields" and "Regenerate Blocks" suggest granular operations, but the actual operation is "re-read the blueprint and rebuild `destination.json`". The blueprint is the source of truth for both fields and blocks.

4. **No Re-extract on Blueprint** — When the user updates the blueprint content in Umbraco (e.g. adds a new block), there's no obvious way to tell UpDoc to re-read it. The "Regenerate" buttons exist but their purpose is unclear. A "Re-extract" button on the Blueprint info box would be the natural place — that's what the user is actually asking for: "re-read my blueprint".

5. **Refresh button ambiguity** — The Refresh button in the workspace bottom bar reloads the UI from disk (`destination.json`), but doesn't re-read the blueprint from Umbraco. Users may expect Refresh to pick up blueprint changes, but it only reloads what's already been generated.

---

## Proposed Redesign

### Info Box Layout (4 boxes, same as now)

| Box | Content | Button |
|-----|---------|--------|
| **Document Type** | Icon, name, alias | "Change" (existing, working) |
| **Blueprint** | Icon, name | "Change" (existing, working) + **"Re-extract"** (new, primary action) |
| **Fields** | Count, "text-mappable" label | Read-only summary, no button |
| **Blocks** | Count, "in blueprint" label | Read-only summary, no button |

### Button Styling (uSync pattern)

Following the uSync convention of colour-coded action buttons:
- **"Change"** buttons — neutral/default style (existing)
- **"Re-extract"** button on Blueprint — primary/blue style (this is the main action a workflow author needs)
- Future: green for "success" states if needed

### What "Re-extract" Does

Same as the current `regenerateDestination()` endpoint — but positioned correctly:

1. Re-reads the blueprint content from Umbraco via `IContentService.GetById(blueprintId)`
2. Rebuilds `destination.json` (fields from document type properties populated in blueprint, blocks from block grid content)
3. Reconciles `map.json` blockKeys (existing reconciliation logic)
4. Returns updated destination config
5. **Shows a toast notification** with the result:
   - "Destination updated — 3 fields, 6 blocks" (success, something changed)
   - "Destination unchanged — already up to date" (success, nothing changed)
   - Error message if blueprint not found

### What "Refresh" Does (bottom bar)

Reloads the Destination tab UI from the `destination.json` file on disk. This is the existing behaviour and remains useful for picking up manual file edits. No change needed here, but the distinction should be clear:
- **Re-extract** = re-read blueprint from Umbraco → regenerate `destination.json` → reload UI
- **Refresh** = reload UI from existing `destination.json`

---

## Implementation

### Sprint 1: Add toast feedback to regenerate

Before changing the layout, make the existing regenerate handler show a toast on success/failure. This is a quick win that fixes the "did anything happen?" problem immediately.

**Changes:**
- `up-doc-workflow-destination-view.element.ts`: In `#handleRegenerateDestination`, show a notification after the API call completes

**Files:**
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/up-doc-workflow-destination-view.element.ts`

### Sprint 2: Move Re-extract to Blueprint box, remove Regenerate from Fields/Blocks

**Changes:**
- Remove "Regenerate" buttons from Fields and Blocks info boxes
- Add "Re-extract" button to the Blueprint info box (alongside "Change")
- Wire "Re-extract" to the same `#handleRegenerateDestination` handler
- Style the button with a primary/blue appearance (uSync pattern)

**Files:**
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/up-doc-workflow-destination-view.element.ts`

### Sprint 3: Improve response detail

**Changes:**
- Backend: Return before/after counts in the `RegenerateDestinationResponse` so the frontend can show "3 fields, 6 blocks (unchanged)" vs "3 fields, 7 blocks (1 new block)"
- Frontend: Use the counts in the toast message

**Files:**
- `src/UpDoc/Controllers/WorkflowController.cs` (response model enhancement)
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/up-doc-workflow-destination-view.element.ts`

### Sprint 4: Documentation

**Changes:**
- Update Destination tab source-file docs
- Update user-facing docs if they reference Regenerate buttons

---

## Related Planning Documents

- **[CHANGE_DESTINATION.md](CHANGE_DESTINATION.md)** — Change buttons (switch doc type/blueprint). That work is complementary — this doc covers the Re-extract action, not the Change flow.
- **[WORKSPACE_VIEW_REFRESH.md](WORKSPACE_VIEW_REFRESH.md)** — Refresh button behaviour. Sprint 2 of that doc covers adding a refresh handler to the Destination view. That work remains valid and separate from this redesign.
- **[BLUEPRINT_MANAGEMENT.md](BLUEPRINT_MANAGEMENT.md)** — Documents the workflow for updating blueprints. Step 6 ("Regenerate Destination") will become "Re-extract Blueprint" in the UI.

---

## Verification

1. Open a workflow → Destination tab
2. Click "Re-extract" on the Blueprint box → toast shows "Destination updated — 3 fields, 6 blocks"
3. Click "Re-extract" again without changing anything → toast shows "Destination unchanged"
4. In Umbraco, add a new block to the blueprint → save → back to workflow → "Re-extract" → toast shows updated counts, new block appears in the Blocks section below
5. Fields and Blocks info boxes have no buttons — just summary counts
6. "Change" buttons on Document Type and Blueprint still work as before
7. Refresh button (bottom bar) reloads UI from disk as before
