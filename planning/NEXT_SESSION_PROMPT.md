# Next Session

## Where We Are

All on `main`. Extraction pipeline complete for all three source types. Web container overrides merged.

### Recently Completed (Mar 2026)

- **Web Container Overrides** (`feature/web-container-overrides`) — Container override model/API, two-pane area picker modal, excluded areas hidden from Extracted tab (matching PDF behaviour), per-area toggles removed. Exclusion now managed solely via area picker modal.
- **BlockKey Reconciliation** (8 sprints) — Auto-reconcile, validation warnings, backfill migration, orphaned badges on Map + Source tabs.
- **Block List Support** — Full pipeline for Umbraco Block Lists alongside Block Grid.
- **Consistent Source Tabs** — All three source types share Extracted/Transformed sub-tabs, info boxes, rendered HTML in Transformed view.

### State of Extraction

Content comes through in reasonable shape for both PDF and web sources:
- **Web (Dublin tour):** 2 areas (Main Content, Ungrouped), 12 sections after exclusion. Sections: Content (days/price), Dublin's Fair City (banner quote), Suggested Itinerary (Days 1-5), Tour Features, Hotel, Extras, Tour Reviews, Tailor Make Your Group Tour.
- **PDF (Tailored tours):** Fully working with area detection, section rules, transform pipeline.
- **Markdown:** Working with auto-transform.
- **Tour Features observation:** `featuring_col1` and `featuring_col2` are flattened into one list in the Transformed view. Splitting them is a transform rule concern — deferred until mapping reveals whether the destination needs them separate.

## Next: Destination-Driven Mapping (Phase 4 Remaining)

Per `planning/DESTINATION_DRIVEN_MAPPING.md`, the outstanding Phase 4 work is:

### 1. Destination tab — mapping interaction (NOT STARTED, highest value)

The Destination workspace tab currently shows the `destination.json` structure (fields + blocks from the blueprint) but has no mapping interaction. It needs:
- Visual indicators: mapped (green badge with source label) vs unmapped fields
- Click a field → picker shows source content (Transformed view sections/parts) → select source → mapping created in map.json
- This is the reverse of what the Source tab already does — same map.json, opposite authoring direction

### 2. Map tab improvements (NOT STARTED)

- Table layout weird spacing with many items
- Edit mappings (currently delete-only)
- Reorder mappings

### 3. Mapping status indicators (NOT STARTED)

- Destination tab: green vs grey for mapped/unmapped
- Source tab: polish existing indicators

## Suggested Approach

Start with **Destination tab mapping interaction**. The Destination tab already renders the structure. Adding "click to map" + a **source content picker** (reverse of the existing `destination-picker-modal`) completes the bidirectional model. Map tab improvements and status indicators are polish.

## Key Files

- `up-doc-workflow-destination-view.element.ts` — Destination tab (structure display, no mapping yet)
- `destination-picker-modal.element.ts` — Existing picker (Source→Destination direction; need a reverse picker)
- `up-doc-workflow-map-view.element.ts` — Map tab
- `up-doc-workflow-source-view.element.ts` — Source tab (reference for mapping interaction patterns)
- `planning/DESTINATION_DRIVEN_MAPPING.md` — Full architectural plan

## Known Bugs

- **ValidateConfig warnings** — startup WARN messages about map.json sources not found in source.json. Cosmetic only.
- **PDF transform rules lost** — Tel:/Email: text replacements on organiser fields lost during a git merge.

## Parked Items

- Bordered-box layout (branch `feature/bordered-box-layout`, NOT MERGED)
- Web-specific transform rules (parent container context, heading-scoped content)
- Tour Features col1/col2 split (deferred until mapping reveals need)
- Button label consistency, Transformed heading cleanup, strategy badge contrast
- Content tab preview polish (raw markdown + property aliases instead of rendered HTML)
