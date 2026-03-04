# up-doc-workflow-source-view.element.ts

Workspace view for the Source tab in the workflow workspace. Displays extracted content and the transformed content view for all three source types (PDF, Markdown, Web).

## What it does

Displays the sample extraction for a workflow in two modes:

- **Extracted** — for PDF: area detection hierarchy showing pages, areas (colour-coded), sections (with headings), and individual text elements with metadata. For Markdown/Web: flat element list with metadata badges.
- **Transformed** — assembled sections with pattern detection (bullet list, paragraph, sub-headed, preamble). For PDF: includes mapping controls. For Markdown/Web: read-only preview of heading-grouped sections rendered as HTML.

All three source types share the same Extracted/Transformed tab pair and info box layout for a consistent user experience. PDF uses a rich four-level hierarchy with area detection; Markdown and Web use a simpler flat element display on the Extracted tab but share the same Transformed tab rendering.

Users can include/exclude sections (via toggle), include/exclude pages, map sections to destination fields, collapse/expand any level, reorder areas and sections via sort modals, and re-extract from a different source. For web sources, excluded areas (managed via the area picker modal) are filtered out entirely — they don't render on the Extracted tab, matching PDF behaviour.

## How it works

### Layout pattern

Uses `umb-body-layout header-fit-height` with a single `slot="header"` div containing `uui-tab-group` for view switching (Extracted / Transformed). Info boxes and content are in the scrollable area below.

```html
<umb-body-layout header-fit-height>
    <div slot="header" class="source-header">
        <uui-tab-group><!-- Extracted / Transformed --></uui-tab-group>
    </div>
    <div class="info-boxes"><!-- uui-box cards: Source, Pages, Areas, Sections --></div>
    <div class="collapse-row"><!-- Collapse All button, right-aligned --></div>
    <!-- scrollable content -->
</umb-body-layout>
```

### Info boxes (uSync-inspired)

Four equal-width `<uui-box>` cards in a flex row with `flex-grow: 1`, following the uSync dashboard pattern. Each box uses the `headline` attribute for its title label.

1. **Source** — h2 filename, document icon, extraction date, Re-extract and Change PDF buttons
2. **Pages** — stat number (e.g., "2 of 4" or "All"), "Choose Pages" button opens page picker modal
3. **Areas** — stat number, "Edit Areas" or "Define Areas" button opens area editor modal
4. **Sections** — stat number, "Edit Sections" button that opens a section picker popover listing all transform sections. Each menu item shows `icon-check` (green) if the section already has rules, or `icon-thumbnail-list` (default) if not. Clicking a section opens the Section Rules Editor modal.

All boxes use equal-height layout via `min-height: 180px` on `.box-content` with `margin-top: auto` on `.box-buttons` to pin buttons to the bottom. Stat numbers are vertically centred using flex. All buttons use `color="default"` for consistent styling.

The Collapse All / Expand All button sits in its own row below the boxes, right-aligned.

### Page selection

Users can filter which PDF pages are extracted. Stored in `source.json` as a `pages` array of page numbers. Page selection is managed via the "Choose Pages" button in the Pages info box, which opens a page picker modal. Selection is saved immediately and applied on next re-extract.

### Data loading

On load, the component:

1. Consumes `UMB_WORKSPACE_CONTEXT` and observes the `unique` value (workflow name)
2. For **PDF** sources: loads in parallel — sample extraction, area detection, workflow config, transform result, source config. Initialises page selection state from source config. If sample extraction and area detection exist, automatically triggers a fresh transform to ensure data is current.
3. For **Markdown/Web** sources: loads sample extraction, workflow config, and transform result (auto-generated during extraction by the backend). No area detection or page selection.
4. Stores all in state for rendering

### Extracted mode (area detection hierarchy)

Elements are displayed in a four-level collapsible hierarchy:

1. **Page** — `uui-box` with "Page N" headline, section/area counts, page include toggle, and collapse chevron in `header-actions` slot. Excluded pages are dimmed.
2. **Area** — colour-coded left border with area name label, "N rules" badge (if rules exist), "N sections" count badge, and collapse chevron. Excluded areas (managed via area picker modal) are filtered out entirely and don't render. Areas without rules show a "Flat"/"Configured" structure badge. The `...` action menu provides "Edit sections" (opens rules editor) and "Sort sections" (opens sort modal). For areas with rules, composed sections from the transform pipeline are rendered instead of raw elements, showing role name, content preview, and mapping status badges.
3. **Section** — structural label "Section – {name}" with include/exclude toggle, element count, and collapse chevron. The heading text from the PDF is rendered as the first child element (with a HEADING badge), not as the section header itself. This separates our structural UI from the actual PDF content. Preamble sections (no heading) show "Content" as the structural label.
4. **Element** — individual elements with semantic role badge (Heading/List Item/Paragraph), font size, font name, and colour badges.

### Collapse behaviour

All four levels are collapsible via a consistent chevron icon (`icon-navigation-right` when collapsed, `icon-navigation-down` when expanded). The chevron is always the rightmost element in each row.

State is managed by a single `_collapsed` Set with key prefixes:
- Pages: `page-${pageNum}`
- Areas: `area-p${pageNum}-a${areaIndex}` or `area-p${pageNum}-undefined`
- Sections: `p${pageNum}-a${areaIndex}-s${sIdx}`

A **Collapse dropdown** (using `uui-button` + `uui-popover-container` + `uui-menu-item`, matching Umbraco's "Create" dropdown pattern) provides per-level toggle controls:

- **Expand All** — opens everything
- **Collapse/Expand Pages** — toggles all page-level items
- **Collapse/Expand Areas** — toggles all area-level items
- **Collapse/Expand Sections** — toggles all section-level items

Each label dynamically flips based on current state (e.g., "Collapse Areas" → "Expand Areas" when all areas are collapsed). The include/exclude toggle uses `@click stopPropagation` to prevent also triggering collapse.

### Transformed mode

Shows assembled sections from the transform pipeline as individual `uui-box` cards:

- Each section is a `uui-box` with the section heading as the headline
- **Simple sections** (heading-only or duplicate heading/content): one body row with rendered Markdown content on the left and mapping badge + Map button on the right
- **Multi-part sections** (heading + any content): separate rows within the box for title and content, each with its own badge + Map button, separated by horizontal border lines. Any section with both a heading and content gets a separate title row for independent mapping, regardless of content complexity.
- Content text is clamped to `max-width: 75ch` for comfortable reading line length; badges and Map buttons are right-aligned via `margin-left: auto` on `.md-part-actions`
- Map buttons are hidden by default and appear on box hover (like Umbraco's block grid editor)
- Mapped sections show a green left border and green `uui-tag` badges with an "x" button to unmap directly
- Markdown content is rendered as HTML via `markdownToHtml()` — headings, bullet lists, blockquotes, and inline formatting are all visible

### Section rules editing

The "Edit Sections" button in the Sections info box opens a popover section picker. The picker lists all transform sections (built from area detection data) as `uui-menu-item` entries. Selecting a section opens the `UMB_SECTION_RULES_EDITOR_MODAL` sidebar, passing the section's elements from area detection. When the modal returns saved rules, they're persisted via the `saveSectionRules()` API.

The section-to-element lookup walks area detection pages to find elements belonging to each transform section, matching by section ID (kebab-case for headed sections, `preamble-p{page}-a{area}` for preamble sections).

### Mapping

From the Transformed view, users can map section parts (title, content, description, summary) to destination fields. Each mappable part has its own Map button that opens `UMB_DESTINATION_PICKER_MODAL`. Results are saved to `map.json` using source keys in the format `${sectionId}.${partSuffix}` (e.g., `features.title`, `features.content`). Mapped parts show green `uui-tag` badges with an "x" button for inline unmapping. Mapped sections get a green left border on the `uui-box`.

### Non-PDF render path (Markdown/Web)

For markdown and web source types, the component uses the same `umb-body-layout` with `#renderExtractionHeader()` for tab switching. Key differences from PDF:

- **Info boxes**: `#renderNonPdfInfoBoxes()` renders 4 boxes — a functional Source box (filename/URL, extraction date, Change file/Re-extract button) plus 3 placeholder boxes ("Box 1", "Box 2", "Box 3") reserved for future features.
- **Extracted tab**: `#renderSimpleElements()` shows a flat list of extracted elements with metadata badges (font name, font size, colour).
- **Transformed tab**: `#renderTransformed()` / `#buildFullMarkdown()` renders the auto-generated transform result as HTML sections — identical rendering to PDF's Transformed view.
- **Extraction flow**: After extraction, the backend auto-generates `transform.json` (deterministic heading-based grouping), which the frontend immediately fetches so the Transformed tab is populated without a separate trigger step.

### Row action buttons

Page and area rows have a `...` action button that appears on hover. Clicking it opens a `uui-popover-container` with contextual actions:

- **Page rows**: "Sort areas" — opens sort modal with the page's included areas
- **Area rows**: "Edit sections" — opens the Section Rules Editor modal; "Sort sections" — opens sort modal. When an area has rule groups (2+), Sort sections reorders the `groups[]` array in the rules file (single source of truth). Areas without rule groups fall back to `SortOrder` in transform.json.

The button is inside a `uui-action-bar` with fixed 40px width at the far right of each row. Section rows have an empty action bar for consistent spacing.

Popover menus use `placement="bottom-start"` and set `--uui-menu-item-indent: 0` / `--uui-menu-item-flat-structure: 1` on `umb-popover-layout` to match Umbraco's native flat menu alignment.

#### Page header hover detection

The page row uses `uui-box` which renders header content in shadow DOM. CSS-only `:hover` would trigger for the entire box (including all child areas/sections). Instead, JavaScript `mouseover` with `clientY` comparison against the shadow DOM `#header` bounding rect is used to detect when the mouse is specifically over the page header area.

### Sort ordering

Areas and sections can be reordered via sort modals that use `umb-table` with `.sortable=${true}` (Umbraco's Sort Children pattern).

- `#onSortAreas(pageNum)` — opens sort modal for areas on a page, saves via `saveSortOrder()` API
- `#onSortSections(area, pageNum)` — when the area has rule groups (2+), reorders `groups[]` in the rules file via `saveAreaRules()` (single source of truth for section ordering). Areas without rule groups fall back to `SortOrder` in transform.json via `saveSortOrder()` API.
- `#renderAreaPage()` sorts included areas by `sortOrder` before rendering
- `#getTransformSectionsForArea()` sorts sections by `sortOrder` before returning

Area sort order persists across re-transforms (C# `ContentTransformService` preserves `SortOrder` from previous transform). Section ordering for rule-grouped areas is driven by the `groups[]` array order in the rules file — the C# transform emits sections in that order.

### Empty state

When no sample extraction exists, shows a source-appropriate empty state:
- **PDF**: centered prompt with "Choose PDF" button
- **Markdown**: file picker prompt
- **Web**: URL input field with "Extract" button, plus file upload fallback

## Key methods

| Method | Purpose |
|--------|---------|
| `#loadData()` | Loads extraction, area detection, config, transform, source config in parallel |
| `#parsePageRange(input)` | Converts "1-3, 5" to `[1, 2, 3, 5]` |
| `#pagesToRangeString(pages)` | Converts `[1, 2, 3, 5]` to "1-3, 5" |
| `#togglePage(pageNum)` | Toggles a page on/off and updates the range input |
| `#savePageSelection()` | Persists page selection to source.json |
| `#onReExtract()` | Re-extracts using previously stored media key |
| `#onPickMedia()` | Opens media picker, runs extraction on selected PDF |
| `#isCollapsed(key)` | Checks if a page/area/section is collapsed |
| `#toggleCollapse(key)` | Toggles collapse state for any level |
| `#getKeysForLevel(level)` | Returns all collapse keys for a given level (pages/areas/sections) |
| `#isLevelCollapsed(level)` | Checks if all items at a level are currently collapsed |
| `#toggleLevel(level)` | Toggles all items at a given level (collapse ↔ expand) |
| `#expandAll()` | Expands everything (clears collapsed set) |
| `#onEditAreas()` | Opens area editor modal for defining/editing extraction areas |
| `#getTransformSectionsWithElements()` | Builds list of transform sections with their area detection elements for the section picker |
| `#findElementsForSection(sectionId)` | Walks area detection pages to find elements matching a transform section by ID |
| `#buildPreambleId(pageNum, areaIdx)` | Constructs preamble section IDs matching the transform convention |
| `#onSectionPickerToggle(e)` | Handles popover open/close for the section picker |
| `#onEditSectionRules(sectionId, heading, elements)` | Opens rules editor modal for a section, saves returned rules via API |
| `#renderExtractionHeader()` | Tab group slotted into header |
| `#renderInfoBoxes()` | Four equal-height uui-box cards (Source, Pages, Areas, Sections) |
| `#renderExtractionContent()` | Dispatches to area detection or transformed view |
| `#renderAreaPage()` | Renders a page with toggle, area count, and collapse. Filters out excluded areas before rendering; returns nothing if all areas on the page are excluded. |
| `#renderArea()` | Renders "Area N" with sections and collapse |
| `#renderUndefinedArea()` | Renders "Undefined" area for unclassified content |
| `#renderSection()` | Renders a section with toggle, heading, children, collapse |
| `#renderAreaElement()` | Renders individual text element with type + metadata badges |
| `#classifyText()` | Classifies text as 'list' or 'paragraph' by leading pattern |
| `#renderTransformedSection()` | Renders an assembled section with pattern badge and mapping |
| `#computeSectionCount()` | Counts total sections across all pages, filtering out excluded areas |
| `#renderNonPdfInfoBoxes()` | Four info boxes for markdown/web: functional Source box + 3 placeholders |
| `#renderNonPdfContent()` | Routes non-PDF between `#renderSimpleElements()` (Extracted) and `#renderTransformed()` (Transformed) |
| `#renderMappingBadges()` | Shows Map button or green mapped-target badges |
| `#hasAreaRules(area)` | Checks if an area has rules defined in source config |
| `#getTransformSectionsForArea(area, pageNum)` | Gets transform sections belonging to an area (matched by colour + page) |
| `#onMapSection(section)` | Opens destination picker for a section's content key (`{id}.content`), saves result to map.json |
| `#renderComposedSectionRow(section)` | Renders a composed section row with role name, content preview, mapping badges, and Map button |
| `#onSortAreas(pageNum)` | Opens sort modal for areas on a page, saves new order via API |
| `#onSortSections(area, pageNum)` | Opens sort modal for sections in an area (filters excluded), saves via API |
| `#onPageBoxMouseOver(e)` | Detects mouse over page header via shadow DOM `#header` bounding rect |
| `#onPageBoxMouseLeave(e)` | Removes page header hover state |

## Imports

```typescript
import type { RichExtractionResult, DocumentTypeConfig, MappingDestination, AreaDetectionResult, DetectedArea, DetectedSection, AreaElement, TransformResult, TransformedSection, SourceConfig, AreaTemplate, SectionRuleSet, InferSectionPatternResponse, MapConfig, SectionMapping } from './workflow.types.js';
import { fetchSampleExtraction, triggerSampleExtraction, fetchWorkflowByName, fetchAreaDetection, triggerTransform, fetchTransformResult, updateSectionInclusion, savePageSelection, fetchSourceConfig, fetchAreaTemplate, saveAreaTemplate, saveAreaRules, inferSectionPattern, saveMapConfig } from './workflow.service.js';
import { markdownToHtml, normalizeToKebabCase } from './transforms.js';
import { UMB_DESTINATION_PICKER_MODAL } from './destination-picker-modal.token.js';
import { UMB_SECTION_RULES_EDITOR_MODAL } from './section-rules-editor-modal.token.js';
import { UP_DOC_SORT_MODAL } from './up-doc-sort-modal.token.js';
import { saveSortOrder } from './workflow.service.js';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import { UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { UMB_MEDIA_PICKER_MODAL } from '@umbraco-cms/backoffice/media';
```

## Registered in

- `manifest.ts` — single `workspaceView` registration:
    - `UpDoc.WorkflowWorkspaceView.Source` (weight 200, icon `icon-page-add`)
- Conditioned on `Umb.Condition.WorkspaceAlias` matching `UpDoc.WorkflowWorkspace`

## Used by

- Displayed as the Source tab when viewing an individual workflow in the workflow workspace
