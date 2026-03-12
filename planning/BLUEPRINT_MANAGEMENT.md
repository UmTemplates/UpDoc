# Blueprint Management Guide

## Overview

Blueprints are the foundation for UpDoc's Create from Source pipeline. Each workflow references a blueprint by GUID. This guide documents the reliable steps for creating, updating, and managing blueprints.

**Key insight:** Block Preview shows misleading content on blueprints (known upstream bug — Block Preview #271). Blocks that read from the parent document via `AssignedContentItem` will display content from a random published page, NOT the blueprint's actual data. **The stored data is correct** — only the preview is wrong. Use Sort Mode to verify block structure.

---

## Creating a New Blueprint

### Prerequisites
- A "template" content node with the correct block grid structure and placeholder content
- The template node should live under the appropriate collection (e.g., `Tailored Tours > [Tailored Tour Template]`)

### Steps

1. **Build your template content node**
   - Create a new content node under the relevant collection
   - Name it clearly, e.g., `[Tailored Tour Template]` (square brackets = not a real page)
   - Add all block grid layouts and blocks with placeholder content
   - Use `[Page Title]`, `[Page Description]`, `[Day 1 Itinerary]`, etc. as placeholder values
   - For blocks that read from parent properties (Page Title and Description, Organiser), the block itself stores no content — it renders from parent properties

2. **Save the template node**
   - Save (not publish) — the template is a working document, not a live page

3. **Verify in Sort Mode**
   - Switch to Sort Mode in the Block Grid Editor to verify the block structure
   - Do NOT trust the Block Preview rendering — it will show wrong content on blocks that use `AssignedContentItem`
   - Verify: correct layouts (e.g., Layout-12, Layout 3|6|3), correct block types in each area

4. **Create the blueprint**
   - Right-click the template node → "Create Document Blueprint"
   - Give it a clear name, e.g., `[Tailored Tour Blueprint]` or `[Tailored Tour Test 01]`
   - The blueprint will appear in Settings → Document Blueprints

5. **Verify the blueprint (in Sort Mode)**
   - Go to Settings → Document Blueprints → your new blueprint
   - Switch to Sort Mode to verify block structure matches the template
   - **Ignore the Block Preview content** — it will show random published page content

6. **Connect to workflow**
   - Open the UpDoc workflow in Settings → UpDoc
   - Click "Change" on the Blueprint card
   - Select the new blueprint
   - Click "Regenerate Destination" to update `destination.json` with the new blueprint's block keys

---

## Updating an Existing Blueprint

Umbraco blueprints **cannot be edited in place** in a meaningful way for block grid content. The recommended approach:

### Option A: Delete and Recreate (Recommended)
1. Note down the current blueprint name
2. Delete the blueprint in Settings → Document Blueprints
3. Update the template content node with your changes
4. Save the template node
5. Create a new blueprint from the template (follow steps above)
6. Update the workflow to point at the new blueprint
7. Regenerate destination in the workflow

### Option B: Edit the Template, Recreate Blueprint
1. Edit the `[Tailored Tour Template]` content node
2. Add/remove/modify blocks as needed
3. Save
4. Delete the old blueprint
5. Create new blueprint from the updated template
6. Update workflow + regenerate destination

**Important:** Every time you delete and recreate a blueprint, the GUID changes. The workflow must be updated to reference the new blueprint, and destination must be regenerated.

---

## Adding New Blocks to a Blueprint

When iterating on the blueprint to add more functionality:

1. **Edit the template node** — add the new block(s) to the block grid
2. **Verify in Sort Mode** — confirm structure is correct
3. **Delete the old blueprint**
4. **Create new blueprint** from the updated template
5. **Update workflow** — change blueprint reference, regenerate destination
6. **Update mappings** — new blocks will need source-to-destination mappings in the workflow's Map tab

---

## Troubleshooting

### Blueprint preview shows wrong content
**This is expected.** Block Preview bug #271. Use Sort Mode to verify structure. The actual data is correct.

### Created document missing blocks
- Check the blueprint in Sort Mode — is the block actually there?
- Check `destination.json` — was it regenerated after the blueprint change?
- Check the bridge code — does it handle all block types in the blueprint?

### Workflow shows "Config validation failed"
- Blueprint GUID has changed — update the workflow's blueprint reference
- Click "Regenerate Destination" after changing the blueprint

### Block Preview shows different random content each time
- Normal behaviour for the bug — it picks up whatever published page was last in the request context
- The content shown is NOT from the blueprint

---

## Template Node vs Blueprint

| Aspect | Template Node | Blueprint |
|--------|--------------|-----------|
| Location | Content tree | Settings → Document Blueprints |
| Purpose | Working document for building block structure | Immutable snapshot used by Create from Source |
| Editable | Yes — add/remove/modify blocks freely | Limited — better to delete and recreate |
| Block Preview | Shows wrong content (same bug) | Shows wrong content (same bug) |
| Used by UpDoc | No — indirectly via blueprint | Yes — referenced by workflow via GUID |

Keep the template node as your "master" — make all changes there, then snapshot to a new blueprint when ready.
