# Plan: Stable Section Identity

## Context

When a user changes the area/group structure of a workflow (e.g., moving "Suggested Itinerary" from its own area to a group within Main Content), section IDs in `transform.json` shift because they're positionally generated (`preamble-p1-z2`, `preamble-p1-z2-2`). `map.json` still references the old IDs, so content silently maps to wrong blocks. No warning is given.

This was discovered during a real workflow session: restructuring areas broke all 5 mappings, and the only fix was manually rewriting map.json. This will happen to any user who refines their workflow structure.

The multi-step save process makes this worse — rules editor save, area picker save, container override save, re-extraction, and section rules save ALL regenerate transform.json independently. Each regeneration can shift section IDs.

## Approach: Hybrid GUID + Human-Readable IDs

Same dual-identity pattern as the destination side (`blockKey` + `contentTypeKey`) and Umbraco itself (display names + GUIDs):

- **Every rule and group gets a GUID** (stored in `source.json`) — the stable anchor
- **Section IDs stay human-readable** (`features`, `suggested-itinerary`) — for debugging/display
- **`StableKey`** on `TransformedSection` carries the rule GUID into the transform output
- **`sourceKey`** on map.json mappings references the GUID — survives ID shifts
- **Reconciliation** runs after every transform regeneration — auto-fixes stale references
- **Preamble IDs** change from positional (`preamble-p1-z2`) to area-name-based (`preamble-main-content-p1`)

## Key Files

| File | Change |
|------|--------|
| `src/UpDoc/Models/SectionRules.cs` | Add `Id` (GUID) to `SectionRule` and `RuleGroup` |
| `src/UpDoc/Models/TransformResult.cs` | Add `StableKey` to `TransformedSection` |
| `src/UpDoc/Models/MapConfig.cs` | Add `SourceKey` to `SectionMapping` |
| `src/UpDoc/Services/ContentTransformService.cs` | Propagate rule GUIDs → StableKey, area-name preamble IDs |
| `src/UpDoc/Controllers/WorkflowController.cs` | `ReconcileSourceKeys()` + wire into all save points |
| `src/UpDoc/Services/WorkflowService.cs` | Source-side validation in `ValidateConfig()`, Migration Pass 5 |
| `src/UpDoc/wwwroot/.../up-doc-modal.element.ts` | StableKey fallback lookup in bridge code |
| `src/UpDoc/wwwroot/.../up-doc-collection-action.element.ts` | Same bridge changes (must stay in sync) |
| `src/UpDoc/wwwroot/.../up-doc-workflow-source-view.element.ts` | Populate `sourceKey` when creating mappings |
| `src/UpDoc/wwwroot/.../up-doc-workflow-map-view.element.ts` | Orange "Orphaned Source" badges |

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Stable anchor | Rule GUID (`SectionRule.Id`) | Same pattern as `contentTypeKey` on destination side |
| GUID storage | `source.json` on rules/groups | Rules are the origin; GUIDs propagate downstream |
| Section model | `StableKey` alongside `Id` | `Id` = human-readable, `StableKey` = machine-stable |
| Map model | `sourceKey` alongside `source` | Backward compatible; old map.json files work unchanged |
| Preamble IDs | Area-name-based (`preamble-{areaName}-p{page}`) | Area names stable across rule changes; positional index is not |
| Reconciliation trigger | Every save that regenerates transform.json | Extracted into helper; cannot be accidentally skipped |
| Warning format | Matches existing `WARN:` blockKey pattern | Frontend parsing already established |

## How Reconciliation Works

Mirrors the existing `ReconcileBlockKeys()` pattern:

1. **Before transform regeneration**: capture old transform's `sectionId → stableKey` mapping
2. **After transform regeneration**: build new transform's `stableKey → sectionId` mapping
3. **For each map.json mapping**: resolve `sourceKey` (or fall back to old transform lookup) → find new section ID → update `source` field
4. **If stableKey not found in new transform**: mark as orphaned (rule was deleted)
5. **Save map.json** if any changes were made

**Lookup priority** (bridge code at document creation time):
1. Try direct `sectionLookup[mapping.source]` (current behaviour)
2. If miss + `sourceKey` exists: resolve via `stableKeyLookup[sourceKey]` → find matching section → build key

## Multi-Step Save Handling

Extract a helper method that wraps transform regeneration + reconciliation:

```
RegenerateTransformWithReconciliation(alias, areaDetection, areaRules, previousTransform)
  1. Run ContentTransformService.Transform()
  2. Run ReconcileSourceKeys(alias, previousTransform, newTransform)
  3. Save transform.json
```

Replace all 6 existing `Transform() + SaveTransformResult()` call sites:
- `UpdateAreaRules` — area rules save
- `UpdateExcludedAreas` — excluded areas save
- `UpdateContainerOverrides` — container overrides save (regenerates area-detection too)
- `UpdateSectionRules` — section rules save
- `ExtractSample` — re-extraction (within transform block)
- Any future save point that regenerates transform

This ensures reconciliation is **never skipped** regardless of which modal/save triggers the change.

## Sprints

### Sprint 1: GUID on Rules and Groups
- Add `Id` property to `SectionRule` and `RuleGroup` in `SectionRules.cs`
- Auto-fill null IDs with `Guid.NewGuid().ToString()` in `UpdateAreaRules()` before saving
- **Verification**: Save rules via UI. Confirm source.json contains `"id"` fields. Old files without IDs load correctly.

### Sprint 2: StableKey on TransformedSection + Area-Name Preamble IDs
- Add `StableKey` to `TransformedSection` in `TransformResult.cs`
- In `ContentTransformService`: propagate rule GUIDs → `StableKey` when creating sections
- Change preamble ID format: `preamble-p{page}-z{areaIndex}` → `preamble-{areaNameKebab}-p{page}`
- **Verification**: Call transform API. Confirm sections have `stableKey` and preambles use area-name format.

### Sprint 3: SourceKey on MapConfig + Reconciliation Method
- Add `SourceKey` to `SectionMapping` in `MapConfig.cs`
- Implement `ReconcileSourceKeys()` in `WorkflowController.cs`
- **Verification**: Construct old/new transforms with shifted IDs. Verify reconciliation updates map.json.

### Sprint 4: Wire Reconciliation into All Save Points
- Extract `RegenerateTransformWithReconciliation()` helper
- Replace all 6 `Transform() + SaveTransformResult()` patterns
- **Verification**: Change area rules in UI. Confirm map.json source references auto-updated.

### Sprint 5: Validation Warnings + Frontend Orphaned Badges
- Add source-side validation to `ValidateConfig()` in `WorkflowService.cs`
- Parse warnings in map view, show orange "Orphaned Source" badge
- Warning format: `WARN: source '{source}' not found in transform.json (orphaned source)`
- **Verification**: Delete a rule that has mappings. Confirm orange badge on Map tab.

### Sprint 6: Bridge StableKey Lookup + SourceKey Population
- Build `stableKeyLookup` in bridge code (`up-doc-modal.element.ts` + collection action)
- Fallback resolution when section ID changes but stableKey matches
- New mappings created via Source tab include `sourceKey`
- **Verification**: Create mappings, restructure areas, run workflow. Content lands in correct blocks.

### Sprint 7: Migration Pass 5
- Pass 5a: Backfill GUIDs on rules/groups in source.json
- Pass 5b: Backfill StableKeys in transform.json (match rules by name)
- Pass 5c: Backfill sourceKeys in map.json (match sections in transform.json)
- **Verification**: Strip all IDs, restart site. Confirm migration backfills all fields.

## Known Limitations

- **Preamble sections** (no matching rule) cannot have a GUID-based StableKey. Area-name-based IDs are a significant improvement but not bulletproof — if an area is renamed, the preamble ID changes. Acceptable because preambles are typically noise (footer, navigation) that gets excluded, not mapped.
- **Heading-detected sections** (no rule, just auto-detected heading) also lack StableKey. These are rare in practice — most sections are produced by rules.
