# Sprint 3: Promote to Area & Make Section — Sub-Sprint Plan

## Context

Sprint 3 of Web Container Detection lets users refine how web page containers map to areas and sections. Two actions:

1. **Promote to Area** — Move a container out of its current area into its own top-level area (e.g., `div.country-banner` out of "Main Content" into "Banner")
2. **Make Section** — Mark containers as section boundaries within their parent area (e.g., `div.featuring_col1` and `div.featuring_col2` each become separate sections)

The original Sprint 3 plan was monolithic. This breaks it into four independently testable sub-sprints.

**Key principle:** Only surface containers with a class or id. Bare `div`/`span` wrappers are noise — they stay in the container tree but are filtered from the UI.

---

## Data Model: `ContainerOverride`

Single list with action discriminator (simpler than separate promotion/splitter lists, extensible for future actions):

```csharp
public class ContainerOverride
{
    [JsonPropertyName("containerPath")]
    public string ContainerPath { get; set; } = string.Empty;  // full slash-delimited path

    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;  // "promoteToArea" or "makeSection"

    [JsonPropertyName("label")]
    public string? Label { get; set; }  // optional — auto-derived from CSS selector if null
}
```

Stored in `source.json` as `containerOverrides` on `SourceConfig`.

---

## Sub-Sprint 3a: C# Model + API Endpoint

**Goal:** Add `ContainerOverride` to data model and expose a PUT endpoint. No processing changes — just persistence.

**Files:**
- `src/UpDoc/Models/SourceConfig.cs` — Add `ContainerOverride` class + `ContainerOverrides` property on `SourceConfig`
- `src/UpDoc/Controllers/WorkflowController.cs` — Add `PUT {alias}/container-overrides` endpoint (mirrors `UpdateExcludedAreas` pattern at line 819)
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/workflow.types.ts` — Add `ContainerOverride` TS interface + property on `SourceConfig`

**Endpoint:**
```
PUT /umbraco/management/api/v1/updoc/workflows/{alias}/container-overrides
Body: { "overrides": [{ "containerPath": "...", "action": "promoteToArea", "label": "Banner" }] }
Response: { "containerOverrides": [...] }
```

The endpoint saves to source.json. In 3a it does NOT regenerate area-detection or transform (that comes in 3b/3c).

**Testing:** curl/Postman — PUT overrides, GET source config, verify JSON roundtrip. Existing functionality unaffected (null `containerOverrides` is fine via `JsonIgnore(WhenWritingNull)`).

---

## Sub-Sprint 3b: Promote to Area Processing

**Goal:** `BuildAreaDetectionFromWeb()` and `ConvertWebToTransformResult()` respect `promoteToArea` overrides.

**Files:**
- `src/UpDoc/Controllers/WorkflowController.cs` — Modify `BuildAreaDetectionFromWeb()`, `ConvertWebToTransformResult()`, `ConvertStructuredToTransformResult()`, and the `PUT container-overrides` endpoint to regenerate

**How it works:**

New static method `ApplyPromotions(elements, overrides)` — called before the `GroupBy(HtmlArea)` in both methods:
1. Collect `promoteToArea` overrides, sort by path length descending (most specific first)
2. For each element, if `htmlContainerPath` starts with a promotion's `containerPath`, override its `HtmlArea` to the promotion label
3. The existing GroupBy then naturally creates the new area

**Label derivation:** `div.country-banner` → "Country Banner" (title-case from class), `div#tab2` → "Tab 2" (from id). User can override with explicit label.

**Promoted area color:** Use `#FFCC80` (amber) for all user-promoted areas. Could later add user color choice.

**Regeneration:** The `PUT container-overrides` endpoint now also:
1. Calls `BuildAreaDetectionFromWeb()` with overrides → saves area-detection.json
2. Calls `ConvertStructuredToTransformResult()` with overrides + excludedAreas → saves transform.json

**Testing:**
1. PUT a `promoteToArea` override for `div.country-banner` with label "Banner"
2. Verify area-detection.json has a new "Banner" area with 5 elements
3. Verify "Main Content" no longer contains those 5 elements
4. Verify transform.json has a "Banner" `TransformArea` with correct sections

---

## Sub-Sprint 3c: Make Section Processing

**Goal:** `GroupElementsIntoSections()` respects `makeSection` overrides.

**Files:**
- `src/UpDoc/Controllers/WorkflowController.cs` — Modify `GroupElementsIntoSections()` signature and logic

**How it works:**

1. Extract existing heading-based logic into `GroupElementsByHeading(elements)` (pure rename/extract)
2. Modified `GroupElementsIntoSections(elements, containerOverrides?)`:
   - Collect `makeSection` container paths
   - If none, delegate to `GroupElementsByHeading` (unchanged behaviour)
   - If present, partition elements by their matching `makeSection` container (using `htmlContainerPath` prefix matching)
   - Within each partition, apply heading-based splitting normally
   - Elements not under any `makeSection` container go into a default partition

**Testing:**
1. PUT `makeSection` overrides for `div.featuring_col1` and `div.featuring_col2`
2. Verify area-detection.json shows Main Content with separate sections for each column
3. Verify transform.json has separate `TransformedSection` entries
4. Verify elements NOT under those containers still group by heading as before

Note: 3b and 3c are independent of each other (both depend only on 3a). Can be developed in either order.

---

## Sub-Sprint 3d: Frontend — Area Picker Modal Enhancement

**Goal:** Add container override UI to the area picker modal.

**Files:**
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/area-picker-modal.token.ts` — Extend data/value interfaces
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/area-picker-modal.element.ts` — Container list + actions
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/workflow.service.ts` — Add `saveContainerOverrides()`
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/up-doc-workflow-source-view.element.ts` — Pass containers to modal, handle result

**Modal data contract:**
```typescript
interface AreaPickerModalData {
    areas: Array<{ name: string; elementCount: number; color: string }>;
    excludedAreas: string[];
    containers?: ContainerTreeNode[] | null;        // NEW — from sample extraction
    containerOverrides?: ContainerOverride[];        // NEW — from source config
}

interface AreaPickerModalValue {
    excludedAreas: string[];
    containerOverrides?: ContainerOverride[];        // NEW
}
```

**UI layout:**
```
Choose Areas (headline)
────────────────────────────────────────
[Existing area rows with include/exclude checkboxes — unchanged]

Container Overrides (sub-section)
────────────────────────────────────────
Promote containers to areas or mark as section boundaries.

☐ div.country-banner (5 elements, in: Main Content)     [Promoted: "Banner"]
☐ div.featuring_col1 (5 elements, in: Main Content)
☐ div.featuring_col2 (11 elements, in: Main Content)
☐ div#tab1 (11 elements, in: Main Content)
...

Selected: 2
[Promote to Area]  [Make Section]  [Remove Override]
────────────────────────────────────────
[Close]  [Save]
```

**Container filtering:** Flatten container tree → keep only nodes with `className` or `id`. Show CSS selector, element count, and parent area name.

**Interaction:**
1. Multi-select containers with checkboxes
2. "Promote to Area" — applies `promoteToArea` override. Shows inline label edit (auto-derived, editable).
3. "Make Section" — applies `makeSection` override
4. "Remove Override" — clears override from selected containers
5. Containers with existing overrides show a badge
6. On Save: returns updated `excludedAreas` + `containerOverrides`

**Caller flow in source view:**
1. Pass `containers` from `_extraction.containers` and `containerOverrides` from `_sourceConfig`
2. On submit: if `containerOverrides` changed, call `saveContainerOverrides()` (which regenerates both area-detection + transform server-side)
3. If `excludedAreas` also changed, call `saveExcludedAreas()` (which regenerates transform only)
4. Re-fetch area detection + transform to update the UI

**Testing:** Full manual UI testing — open modal, select containers, apply actions, save, verify area/transform changes reflected in Extracted and Transformed views.

---

## Sub-Sprint Summary

| Sub-Sprint | Scope | Testable With | Depends On |
|-----------|-------|---------------|------------|
| **3a** | C# model + API endpoint + TS types | curl/Postman | — |
| **3b** | Promote to Area processing | API + inspect JSON | 3a |
| **3c** | Make Section processing | API + inspect JSON | 3a |
| **3d** | Frontend modal + service | Manual UI | 3a + 3b + 3c |

Each sub-sprint gets its own commit. Feature branch: `feature/web-container-overrides`.

---

## Edge Cases

- **Nested promotions** — Promoting both `div.country-banner` and `div.country-banner-left`: longest path wins (most specific)
- **Excluded promoted areas** — If user promotes to "Banner" then excludes it, the existing `excludedAreas` filter handles it (works on area names)
- **Save ordering** — Container overrides saved first (regenerates area-detection + transform), then excluded areas (regenerates transform only). Second call overwrites first's transform, which is correct since it includes both overrides and exclusions.
- **Element ordering** — Promoted areas get sort position based on their original position or a default (near Main Content). Unknown area names sort at position 3 in `GetAreaSortOrder`.

---

## UI Redesign Notes (from testing session, March 2026)

### Problem: Flat container list is unusable

The current 3d implementation uses a small sidebar with a flat list of all containers below the area checkboxes. Issues observed:

1. **Too many containers** — The Dublin page has ~40 containers with class/id. Scrolling through a flat list to find `div.country-banner` is painful.
2. **Action bar off-screen** — When a container is selected far down the list, the action bar ("Promote to Area" / "Make Section") appears at the top, completely off-screen.
3. **No spatial context** — Containers listed alphabetically/by-depth give no sense of which area they belong to or where they sit in the page structure.

### Solution: Two-pane layout (modelled on PDF area editor)

Reference: The **Define Areas** modal for PDFs (`pdf-area-editor-modal.element.ts`) uses a wide sidebar with two panes — PDF preview on the left, area list on the right. This is the proven UX pattern.

**Proposed layout for web container overrides:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Define Areas                                                       │
├────────────────────────────────────────┬────────────────────────────┤
│  LEFT PANEL: Containers by area        │  RIGHT PANEL: Areas        │
│                                        │                            │
│  ▼ Header (10 elements)               │  Areas on this page        │
│    ☐ div.header-container  12 el      │                            │
│    ☐ div#header            6 el       │  ● Header          10 el  │
│    ☐ div#right_banner      3 el       │  ● Navigation       7 el  │
│    ☐ div.callus            2 el       │  ● Main Content    79 el  │
│                                        │  ● Country Banner   5 el  │ ← appears live
│  ▼ Navigation (7 elements)            │  ● Footer          45 el  │
│    ☐ a.mobile-menu         1 el       │  ● Ungrouped       11 el  │
│    ☐ span.sb-toggle-right  1 el       │                            │
│                                        │  [Include/exclude toggles] │
│  ▼ Main Content (79 elements)         │                            │
│    ☐ div#body_content      84 el      │                            │
│    ☐ div.country-banner    5 el  🟠   │                            │
│    ☐ div.featuring_col1    5 el       │                            │
│    ☐ div.featuring_col2    11 el      │                            │
│    ☐ div#tab1              11 el      │                            │
│    ...                                 │                            │
│                                        │                            │
│  [Promote to Area] [Make Section]      │                            │
│  [Remove Override]                     │                            │
├────────────────────────────────────────┴────────────────────────────┤
│                                                    [Save] [Cancel]  │
└─────────────────────────────────────────────────────────────────────┘
```

**Key UX improvements over current flat list:**
- **Containers grouped by area** — collapsible sections, easy to find what you're looking for
- **Live area list on right** — as you promote a container, the new area appears immediately in the right panel
- **Action buttons always visible** — sticky at bottom of left panel or floating
- **Wide sidebar** — use `size: 'large'` or `size: 'full'` to give enough room for two panes
- **Include/exclude toggles on right** — area management stays visible while browsing containers
- **Override badges inline** — amber dot/badge on containers that have overrides (visible in left panel)

**Implementation approach:**
- Reuse the sidebar modal pattern but switch to `size: 'large'`
- Left panel: accordion/collapsible groups by area name, each containing filtered containers
- Right panel: area list with include/exclude toggles + element counts (mirrors current area rows)
- Action buttons: sticky at bottom of left panel, activated when checkboxes are selected
- On promote: right panel area list updates immediately (local state), left panel shows badge
- On save: persist overrides + excluded areas, regenerate server-side

**This is a separate task** — the current 3d implementation works functionally but needs this UX overhaul before it's production-ready.
