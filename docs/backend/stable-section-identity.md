# Stable Section Identity

## The Problem

When a workflow author restructures their workflow — for example, moving "Suggested Itinerary" from its own area to a group within Main Content — section IDs in `transform.json` shift. This happens because section IDs are generated from rule and group names combined with positional context. When the structure changes, the same content ends up with a different ID.

`map.json` still references the old section IDs, so content silently maps to the wrong destination blocks. No warning is given. The only fix was to manually rewrite `map.json`.

This affected any workflow restructuring: renaming groups, moving rules between groups, changing area boundaries, or re-running extraction after rule changes.

### Why IDs Shift

Section IDs are derived from rule names and group names, kebab-cased (e.g., `suggested-itinerary`, `tour-features`). When a rule moves from one group to another, or a group is renamed, the generated section ID changes. Preamble sections (content not matched by any rule) were even worse — they used positional indices (`preamble-p1-z2`) that shifted whenever areas were reordered.

### The Multi-Step Save Problem

The workflow editor has multiple save points that each regenerate `transform.json`:

- Area rules save
- Excluded areas save
- Container overrides save
- Section rules save
- Re-extraction

Each regeneration could shift section IDs, and any of them could silently break existing mappings.

---

## The Solution: Hybrid GUID + Human-Readable IDs

The solution follows the same dual-identity pattern used on the destination side (`blockKey` + `contentTypeKey`) and by Umbraco itself (display names + GUIDs):

| Layer | Human-Readable | Machine-Stable |
|-------|---------------|----------------|
| **Rules** (`source.json`) | `role` / group `name` | `id` (GUID) |
| **Sections** (`transform.json`) | `id` (e.g., `suggested-itinerary`) | `stableKey` (rule GUID) |
| **Mappings** (`map.json`) | `source` (e.g., `suggested-itinerary.content`) | `sourceKey` (rule GUID) |

### How It Works

1. **Every rule and group gets a GUID** stored as `id` in `source.json`. These are auto-generated when first saved and never change, even if the rule is renamed or moved.

2. **Section IDs stay human-readable** (`suggested-itinerary`, `tour-features`) for debugging and display. These are what the user sees in the UI.

3. **`stableKey`** on each `TransformedSection` carries the originating rule's GUID into the transform output. This links sections back to their source rule regardless of name changes.

4. **`sourceKey`** on each mapping in `map.json` stores the rule GUID alongside the human-readable `source` reference. When section IDs shift, the GUID provides a stable anchor.

5. **Reconciliation** runs automatically after every transform regeneration. It detects shifted section IDs and updates `map.json` references to match the new IDs — all transparent to the user.

### Preamble ID Improvement

Preamble sections (content before the first matched rule in an area) changed from positional IDs to area-name-based IDs:

- **Before:** `preamble-p1-z2` (page 1, area index 2)
- **After:** `preamble-main-content-p1` (area "Main Content", page 1)

Area names are more stable than positional indices — they only change if the area itself is renamed.

---

## Reconciliation Process

Reconciliation runs inside `RegenerateTransformWithReconciliation()`, which wraps every call to the transform pipeline. This ensures it cannot be accidentally skipped regardless of which save point triggers the change.

The process:

1. **Before transform**: capture old transform's `sectionId → stableKey` mapping
2. **After transform**: build new transform's `stableKey → sectionId` mapping
3. **For each mapping in `map.json`**: resolve `sourceKey` → find new section ID → update `source` field
4. **If stableKey not found** in new transform: the rule was deleted — mark as orphaned
5. **Save `map.json`** if any changes were made

### Bridge Fallback (Document Creation)

When creating a document from source, the bridge code (which runs in the browser) also uses stableKey fallback:

1. Try `sectionLookup[mapping.source]` (current section ID matches)
2. If miss and `sourceKey` exists: resolve via `stableKeyLookup[sourceKey]` → find new section ID → rebuild the source key with the original part suffix

This ensures documents are created correctly even if `map.json` hasn't been reconciled yet (edge case during concurrent edits).

---

## Validation and Orphaned Warnings

When a rule is deleted but its mappings remain, the system detects this and shows warnings:

- **Backend**: `ValidateConfig()` checks each mapping's `source` against valid section IDs in `transform.json`. Missing references produce: `WARN: source '{source}' not found in transform.json (orphaned source)`
- **Map tab**: Orphaned mappings show an orange "Orphaned Source" badge, matching the existing "Orphaned" badge pattern used for destination-side blockKey issues

---

## Migration (Pass 5)

Existing workflows created before this feature are automatically migrated at startup:

| Sub-pass | What |
|----------|------|
| **5a** | Backfill GUIDs on rules and groups in `source.json` that don't have an `id` |
| **5b** | Backfill `stableKey` in `transform.json` by matching section names to rule names |
| **5c** | Backfill `sourceKey` in `map.json` by looking up each mapping's section ID in the transform |

Migration is idempotent — running it multiple times has no effect on already-migrated files.

---

## Known Limitations

1. **Preamble sections** (content not matched by any rule) cannot have a GUID-based `stableKey` because they don't originate from a rule. Area-name-based IDs are a significant improvement over positional indices, but if an area is renamed, the preamble ID changes. This is acceptable because preambles are typically noise (navigation, footers) that gets excluded rather than mapped.

2. **Heading-detected sections** (auto-detected from document headings, no matching rule) also lack a `stableKey`. These are rare in practice — most sections in a mature workflow are produced by explicit rules.

3. **Name-based migration matching** (Pass 5b) relies on section names matching rule names. If a rule was renamed before migration runs, the match fails and no `stableKey` is assigned. The mapping still works via the human-readable `source` field — it just won't survive future restructuring until a new mapping is created.

---

## Files Changed

| File | What |
|------|------|
| `Models/SectionRules.cs` | `Id` (GUID) on `SectionRule` and `RuleGroup` |
| `Models/TransformResult.cs` | `StableKey` on `TransformedSection` |
| `Models/MapConfig.cs` | `SourceKey` on `SectionMapping` |
| `Services/ContentTransformService.cs` | Propagates rule GUIDs → `StableKey`, area-name preamble IDs |
| `Controllers/WorkflowController.cs` | `ReconcileSourceKeys()`, `RegenerateTransformWithReconciliation()` |
| `Services/WorkflowService.cs` | Source validation in `ValidateConfig()`, Migration Pass 5 |
| `workflow.types.ts` | `stableKey` on `TransformedSection`, `sourceKey` on `SectionMapping` |
| `up-doc-modal.token.ts` | `stableKeyLookup` on modal value |
| `up-doc-modal.element.ts` | StableKey fallback in bridge code |
| `up-doc-collection-action.element.ts` | StableKey fallback in bridge code |
| `up-doc-action.ts` | StableKey fallback in bridge code |
| `up-doc-workflow-source-view.element.ts` | Populates `sourceKey` on new mappings |
| `up-doc-workflow-map-view.element.ts` | Orphaned source badge rendering |
