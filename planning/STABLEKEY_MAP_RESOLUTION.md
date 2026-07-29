# Plan: Map Should Resolve by StableKey, Not Section ID

## Status: NOT STARTED

---

## Problem

When a new group is inserted into `source.json` (e.g. adding "More Sights" between "Sights" and "Accommodation"), the auto-generated section IDs shift (e.g. `preamble-main-content-p1-4` becomes `preamble-main-content-p1-5`).

`map.json` currently resolves mappings using the `source` field (the section ID), which means inserting a new group breaks existing mappings — the mapping that pointed at Accommodation now points at the new "More Sights" section instead.

### Real-World Example (Tailored Travel)

- Accommodation was mapped via `preamble-main-content-p1-4`
- After adding "More Sights" group, Accommodation became `preamble-main-content-p1-5`
- The Accommodation mapping landed on "More Sights" instead
- Had to manually fix `map.json` to update both the source ID and the sourceKey

### Secondary Issue: sourceKey Not Populated Correctly

The `sourceKey` in the existing Accommodation mapping (`7df15acf-5938-45ce-a789-9ea2e8483437`) did not match the Accommodation group's actual ID (`96c2347e-4944-4d26-8a90-757cc45aae18`), suggesting the sourceKey may not have been populated correctly when the mapping was originally created via the UI.

---

## Expected Behaviour

1. When a `sourceKey` is present in a mapping, it should be used to resolve the source section — not the `source` (section ID) field
2. The `source` field should be treated as a display/fallback reference only
3. Inserting, removing, or reordering groups in `source.json` should not break existing mappings

---

## Investigation Required

Before implementing, these questions need answering:

### 1. Where does mapping resolution happen?

- **C# side:** Which service resolves `map.json` entries to actual extracted content during document creation? Likely in the bridge code or `ContentTransformService`.
- **TypeScript side:** Which components read `map.json` and display mapping status on the Source/Map tabs?

### 2. Where is sourceKey populated?

- When a mapping is created via the Source tab UI (checkbox → "Map to..." → destination picker), where does the `sourceKey` value come from?
- Is it pulling the group's stable ID from `source.json`, or something else?
- Why did it end up with a mismatched GUID in the real-world case?

### 3. What is the current resolution priority?

- Does the code try `sourceKey` first and fall back to `source`?
- Or does it only use `source` (section ID)?

---

## Reproduction Steps

1. Set up a workflow with groups mapped in `map.json` (e.g. Sights -> block, Accommodation -> block)
2. Insert a new group between them in `source.json`
3. Re-run the source extraction
4. Observe that the mapping for the section after the insertion now points to the wrong section

---

## Implementation Approach (TBD)

Pending investigation, but the broad fix is:

1. **Fix sourceKey population** — ensure the UI writes the correct group ID from `source.json` when creating mappings
2. **Fix resolution order** — resolve by `sourceKey` first, fall back to `source` (section ID) only when `sourceKey` is absent
3. **Apply to both C# and TypeScript** — the bridge code (document creation) and the workspace UI (mapping display) both need the same resolution logic
4. **Consider migration** — existing `map.json` files with incorrect sourceKeys may need a backfill pass

---

## Related Files (to investigate)

- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/` — TypeScript source tab, map tab, destination picker
- `src/UpDoc/Services/` — C# services that resolve mappings during document creation
- `src/UpDoc/Models/` — `MapConfig` or similar model containing `source` and `sourceKey` fields
- `updoc/workflows/` — real workflow folders with `map.json` and `source.json`
