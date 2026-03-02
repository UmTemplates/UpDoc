# Plan: Web Container Detection and Section Refinement

## Context

The web extraction pipeline currently detects a limited set of semantic HTML areas (nav, main, footer, header, sidebar) and creates sections only by heading splits. This misses two important patterns:

1. **Meaningful containers not in the landmark set** — e.g., `div.country-banner` contains the tour title and price but falls into "Main Content" because "banner" isn't detected. The price text is lost entirely (it's in a div, not a p/h/li).

2. **Distinct sub-containers flattened together** — e.g., `div.featuring_col1` (Features) and `div.featuring_col2` (What We Will See) are merged into one section, losing the ability to map them to different CMS fields.

The goal is to mirror the PDF two-stage model: **Areas** (top-level page regions) → **Sections** (content groups within areas, each with title/description/content/summary). For web, container structure provides section boundaries that the PDF gets from rules.

Primary audience: Tailored Travel (the client). Package-level flexibility (user-defined schemas) comes later.

---

## Architecture: Areas vs Sections

- **Areas** = top-level page regions. On web: HTML5 landmarks + user-promoted containers. Examples: Navigation, Main Content, Footer, Banner (promoted from `div.country-banner`).
- **Sections** = meaningful content groups within an area, each mappable to CMS fields. Each section can have: title, content, description, summary (matching existing `TransformedSection`). On web: created by heading splits AND container structure within an area.

### Two user actions on containers

1. **Promote to Area** — for structural containers that are genuinely separate page regions. Example: promote `div.country-banner` to a "Banner" area. Within that area, the user can then work with its sections (Tour Title from the H1, Tour Description from the price text, ignore the review quote).

2. **Split into Sections** — for containers within an existing area where child containers represent distinct content groups. Example: within Main Content, `div.featuring_col1` and `div.featuring_col2` become separate sections "Features" and "What We Will See". The "Featuring" tab stays part of Main Content — it doesn't need to be an area.

### Dublin page example — after user refinement:

**Banner area** (promoted from `div.country-banner`):
| Section | Content |
|---------|---------|
| Tour Title | "Dublin's Fair City" (from H1) |
| Tour Description | "5 days from £899" (from price div) |

**Main Content area** (auto-detected):
| Section | Source | Title | Content |
|---------|--------|-------|---------|
| Suggested Itinerary | heading split | "Suggested Itinerary" | Day-by-day text |
| Features | split from `featuring_col1` | (user-named) | Feature list |
| What We Will See | split from `featuring_col2` | (user-named) | Sights list |
| Hotel | heading split | "Hotel" | Hotel description |
| Extras | heading split | "Extras" | Extras list |

---

## Sprint 1: Container-Aware Extraction (Backend Only)

**Goal:** Record container context on every extracted element and capture text from non-standard elements. No UI changes — just richer data in the extraction output.

### Changes

**`HtmlExtractionService.cs`:**
- Add `containerPath` parameter to `ExtractElements()` — accumulates a slash-delimited CSS selector path (e.g., `div.country-banner/div.price-name-wrapper`) as the method recurses into containers. For each container, build a selector like `div.country-banner` or `section#main-content` (tag + first meaningful class or id).
- Expand text extraction: capture text from `span`, `strong`, `em`, `b`, `i`, `a`, and bare-text `div` elements (leaf containers with direct text not already covered by a child content element). This fixes the "lost price text" problem.
- Build a `ContainerTree` alongside the flat element list. Each node: tag, id, className, cssSelector, parentSelector, depth, elementCount, children. This is a by-product of the existing recursive walk.

**`RichExtractionResult.cs` / `ElementMetadata`:**
- Add `HtmlContainerPath` (string) to `ElementMetadata` — e.g., `"div.country-banner/div.price-name-wrapper"`.
- Add `HtmlTag` (string) to `ElementMetadata` — actual HTML tag (`p`, `span`, `div`, `li`, `h2`). Currently `FontName` is overloaded for this.
- Add `ContainerTreeNode` model and `Containers` property on `RichExtractionResult`.
- All new fields use `[JsonIgnore(Condition = WhenWritingDefault)]` for backward compat with PDF/markdown.

**`WorkflowController.cs`:**
- `BuildAreaDetectionFromWeb()` includes container tree in the area detection output (saved to `area-detection.json`).
- Section grouping unchanged (heading-based) — Sprint 3 adds container-based splitting.

### Verification
- Re-extract Dublin page. Check that:
  - H1 has `htmlContainerPath` containing `"div.country-banner"`
  - Price/duration text is now extracted (was previously lost in bare div/span)
  - Container tree shows `div.country-banner`, `div.featuring_col1`, `div.featuring_col2`
  - Existing area detection and transform unchanged (backward compatible)

### Files
- `src/UpDoc/Services/HtmlExtractionService.cs`
- `src/UpDoc/Models/RichExtractionResult.cs`
- `src/UpDoc/Controllers/WorkflowController.cs`

---

## Sprint 2: Container Tree Display in UI

**Goal:** Show container hierarchy in the Extracted view so the user can see what was detected and understand the page structure.

### Changes

**`workflow.types.ts`:**
- Add `htmlContainerPath?: string` and `htmlTag?: string` to `ElementMetadata`.
- Add `ContainerTreeNode` interface.

**`up-doc-workflow-source-view.element.ts`:**
- In the web Extracted view, show container path as a subtle badge/tag on each element (immediate container's class name).
- Add a "Container View" toggle alongside the existing area-based view, showing the container tree as a collapsible hierarchy. Each node shows its CSS selector, element count, and can be expanded.
- Update info boxes: show container count.

### Verification
- Load Dublin web workflow. See container badges on elements. Toggle to container view. See `div.country-banner`, `div.featuring_col1`, etc. as named nodes with element counts.

### Files
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/workflow.types.ts`
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/up-doc-workflow-source-view.element.ts`

---

## Sprint 3: Promote to Area and Split into Sections

**Goal:** Let users promote containers to areas and split sections by container boundaries. Persist as config in `source.json`.

### Changes

**`SourceConfig.cs` — new models:**
```
ContainerOverrides:
  promotions: [{ selector, areaName, color }]         — promote container to area
  sectionSplitters: [{ parentSelector, splitOn, sectionNames }]  — split by child containers
```

**`HtmlExtractionService.cs`:**
- Accept `ContainerOverrides` as parameter. Promotions override `HtmlArea` for elements within the promoted container's subtree. This means promoted containers' elements get a new area label during extraction.

**`WorkflowController.cs`:**
- `BuildAreaDetectionFromWeb()` respects promotions — promoted containers appear as top-level areas with their user-given name and colour.
- `GroupElementsIntoSections()` respects section splitters — when consecutive elements have different container paths matching the `splitOn` selectors, a section break is inserted (in addition to heading-based splits). User-provided `sectionNames` become the section titles.
- `ConvertWebToTransformResult()` respects both — promotions create new `TransformArea` entries, splitters create additional `TransformedSection` entries.
- New endpoint: `PUT /workflows/{alias}/container-overrides` — saves config and regenerates transform.

**`area-picker-modal.element.ts` — enhance:**
- Two-level display: each area shows significant child containers (3+ elements or meaningful class/id) as indented sub-items.
- Per-container actions:
  - "Promote to Area" — text input for area name, colour picker optional
  - "Split into Sections" — shows child containers, user names each resulting section
- Save persists to `source.json` and regenerates transform.

### Verification
- Open area picker → see `div.country-banner` under Main Content → Promote to "Banner" → save → Banner appears as own area with H1 and price text
- See `featuring_col1`/`featuring_col2` under Main Content → Split into Sections → name "Features"/"What We Will See" → verify two separate sections in Transformed view
- Config persists in `source.json` under `containerOverrides`

### Files
- `src/UpDoc/Models/SourceConfig.cs`
- `src/UpDoc/Services/HtmlExtractionService.cs`
- `src/UpDoc/Controllers/WorkflowController.cs`
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/area-picker-modal.element.ts`
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/area-picker-modal.token.ts`
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/workflow.service.ts`

---

## Sprint 4: Web Section Rules (Enable "Choose Sections")

**Goal:** Enable the "Choose Sections" button for web sources. Web-specific rule conditions use the new container metadata.

### Changes

**`SourceConfig.cs`:**
- New `RuleCondition` types: `containerSelectorEquals`, `containerSelectorContains`, `htmlTagEquals`, `htmlClassContains`.

**`WorkflowController.cs`:**
- `GroupElementsIntoSections()` accepts web-aware `AreaRules` using new condition types alongside heading-based splitting.
- Section fields (title, description, content, summary) mappable from specific sub-containers.

**`section-rules-editor-modal.element.ts`:**
- When opened for web source: show web-specific condition types.
- "Teach by example": clicking an element auto-populates conditions from `htmlTag`, `htmlContainerPath`, text.

### Verification
- Open "Choose Sections" for web → define container-based rule → verify sections in Transformed view

### Files
- `src/UpDoc/Models/SourceConfig.cs`
- `src/UpDoc/Controllers/WorkflowController.cs`
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/section-rules-editor-modal.element.ts`

---

## Key Design Decisions

1. **Container path as a string** — `"div.country-banner/div.price-name-wrapper"` is compact and serializable. The separate `ContainerTree` provides structured hierarchy for the UI.

2. **Overrides are a post-processing layer** — auto-detection runs first (landmark areas + heading sections). Overrides refine: promote containers to areas, split sections by child containers. Works out-of-box; overrides only needed for complex layouts.

3. **Backward compatible** — `HtmlArea` remains. New fields (`htmlContainerPath`, `htmlTag`) are additive with `WhenWritingDefault`. Existing workflows without `containerOverrides` behave identically.

4. **"Significant" container filter** — only show containers with 3+ elements or meaningful class/id. Filter out empty wrapper divs.

5. **Sections stay within areas** — promoting to area is for genuine page regions (banner, sidebar). Content grouping within an area (featuring columns, tab panels) uses section splitting, not area promotion. This keeps the area count manageable.

6. **Section schema unchanged** — `TransformedSection` already has heading (title), content, description, summary. Container-split sections use user-provided names as headings.
