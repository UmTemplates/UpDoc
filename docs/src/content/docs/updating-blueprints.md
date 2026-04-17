---
title: "Updating Blueprints"
---

This guide is for workflow authors. It explains what happens to your workflow mappings when the underlying document blueprint changes — and what to do after making changes.

Blueprints evolve over time. You might add a new feature block, tweak default content, or even remake the blueprint from scratch because some block types can only be created on a published page (synchronised navigation blocks, for example). Understanding how UpDoc reconciles these changes helps you avoid surprises.

---

## The short answer

Most blueprint changes are safe. UpDoc identifies blocks by their **type** (content type key), not by their instance GUID. Remaking a blueprint with the same blocks preserves your mappings — even though every block instance has a new GUID under the hood.

There is one edge case to watch: **two or more blocks of the same type in one blueprint**. If your blueprint has that, read the "Duplicate block types" section below.

---

## How UpDoc identifies blocks

Every block in an Umbraco blueprint has two identifiers:

| Identifier | Stable? | Description |
|------------|---------|-------------|
| `contentTypeKey` | ✅ Yes | The element type GUID — e.g. "Feature Rich Text Itinerary" |
| Instance `key` | ❌ No | Unique per block instance; regenerated when the blueprint is remade |

UpDoc's mappings store both, but reconciliation uses `contentTypeKey` to find the equivalent block in a new version of the blueprint. Instance GUIDs are re-learned each time.

This is the same reason that Umbraco itself regenerates instance GUIDs when creating a document from a blueprint: the block *types* are what matters structurally, not the specific instances.

---

## What's safe to change

### ✅ Changing the source

You can freely change the source side of a workflow:

- Pick a different PDF or markdown file
- Change a web source URL
- Re-extract from the same source with different rules

None of this affects mappings. Mappings reference sources by stable section keys, not by the source document itself.

### ✅ Editing blueprint content

Changes to the blueprint that don't add or remove blocks are safe:

- Editing default property values
- Changing labels or descriptions on properties
- Reordering blocks within the same block grid (mappings survive — `contentTypeKey` still matches)

After any of these, you don't strictly need to regenerate the destination — but doing so picks up any changes to the filtered destination structure.

### ✅ Remaking a blueprint with the same blocks

This is the common "can't edit this block type, have to rebuild" scenario.

1. Create a new blueprint with the same blocks
2. In the workflow, point at the new blueprint (or if it has the same name, UpDoc picks it up)
3. Click **regenerate destination** on the workflow
4. UpDoc walks each mapping, finds the equivalent block by `contentTypeKey` in the new destination, and rewrites the instance GUID
5. Mappings survive

You'll see a confirmation like "Reconciled N blockKeys, 0 orphaned". As long as orphaned is zero, everything is wired correctly.

---

## What needs attention

### ⚠️ Adding a new block type

If you add a block to the blueprint that wasn't there before:

- Existing mappings keep working — the new block is simply unmapped
- The new block appears in the destination structure after regenerate-destination
- You can then map source content to it

### ⚠️ Removing a block from the blueprint

If you remove a block:

- Mappings that targeted that block are marked **orphaned** on the Map tab
- The document is still created successfully — the orphaned mappings are silently skipped
- Review orphaned entries and either delete them or re-map them to a different block

### ⚠️ Duplicate block types

This is the only tricky case. If your blueprint contains two or more blocks of the **same** `contentTypeKey` — for example, two "Feature Rich Text" blocks used for Introduction and Itinerary — reconciliation after a blueprint remake is ambiguous.

UpDoc can match the type, but can't distinguish which instance in the new blueprint was the "Introduction" one versus the "Itinerary" one. After regenerate-destination, all mappings to that block type may collapse onto a single instance.

**What to do:**

1. Check the Map tab after reconciliation
2. If multiple mappings point at the same block, reassign one of them to the correct instance using the destination picker
3. Most projects never hit this — using distinct block types per purpose sidesteps the issue entirely

---

## Workflow: updating a blueprint safely

1. **Make your blueprint changes** (edit, or remake as a new blueprint with the same name)
2. **Open the workflow** in Settings → UpDoc → Workflows
3. **Click "Regenerate destination"** — this re-reads the blueprint and reconciles blockKeys
4. **Read the result** — look for the "N reconciled, M orphaned" summary
5. **Check the Map tab** — any mapping tagged "Orphaned" needs attention
6. **Test** by creating a document from source and verifying the content lands in the right places

---

## Why blueprints at all?

UpDoc is a content *populator*, not a content *builder*. The blueprint defines the structural skeleton — which blocks exist, in what order, with what default settings — and UpDoc fills that skeleton with source content.

This design keeps UpDoc focused on the hard problem (extraction and mapping) rather than rebuilding the block composition UI. It's a trade-off: you can't create blocks that aren't in the blueprint, but the mapping flow stays simple and the blueprint remains the single source of truth for structure.

A "create blocks if missing" mode has been considered but would be a substantial architectural change. For now, every block you want populated needs to exist in the blueprint.

---

## Troubleshooting

**"All my mappings are orphaned after remaking the blueprint"**

Check that the new blueprint uses the same element types (same `contentTypeKey`s) as the old one. If you created new element types with the same names, they have different GUIDs and UpDoc can't match them. Solution: delete the new element types and use the originals.

**"Only some mappings reconciled"**

The unreconciled ones are mappings whose block type no longer exists in the new blueprint. Review them on the Map tab and either remove them or map them to a different target.

**"My mapping points at the wrong block instance"**

You probably have duplicate block types. See the "Duplicate block types" section above.

**"The new blueprint isn't showing up"**

UpDoc reads blueprints via the document type. Make sure the new blueprint is based on the same document type as the workflow expects. Check `workflow.json` in the workflow folder if you need to confirm.
