# Plan: DOM Tree Area Picker for Web Sources

## Status: PLANNING

## Problem

The current "Define Areas" modal for web sources shows a **flat list** of containers, grouped by auto-detected area (Header, Navigation, Main Content, Footer, Ungrouped). This has two critical UX problems:

1. **Flat list hides nesting.** Containers that are nested inside each other appear as siblings. `div.header-container` (12 elements) contains `div#header` (6 elements) which contains `div#right_banner` (3 elements) — but they all look like independent items. The user can't see the parent-child relationships.

2. **Auto-detected areas are too coarse.** "Main Content" contains 84 elements — breadcrumbs, tab navigation, banner, itinerary, features, hotel, extras, reviews, sidebar CTAs, and phone number prompts. The user needs to break this into meaningful groups but has no way to see or navigate the structure.

When the user opens the **section rules editor** for "Main Content", they see 84 flat, uncontextualised elements. An element labelled "Home" could be a breadcrumb, a navigation link, or a homepage heading — there's no visual grouping to disambiguate.

## Solution: User-Driven DOM Tree Picker

Replace the flat container list with a **collapsible DOM tree** that shows the actual HTML structure. The user clicks nodes in the tree to define named areas. Only elements inside user-defined areas appear in the Extracted tab and the rules editor.

### Core Interaction

1. Open "Define Areas" modal → see a collapsible DOM tree for the page
2. Click a node → name it → it becomes an area
3. Elements inside that container (and its descendants) become the area's content
4. Everything NOT inside a user-defined area is **implicitly excluded** — it never appears in the Extracted tab, the Transformed tab, or the rules editor
5. Save → Extracted tab shows only the named areas, each with its own Sections/rules editor

### Example: Dublin Tour Page

The DOM tree (filtered to named containers) would look like:

```
▶ div#sb-site
  └─ ▶ div.body-wrapper
       └─ ▶ div#body_content
            ├─ ▶ div.country-banner               5 elements   [Define Area: "Banner"]
            │    ├─ div.country-banner-left
            │    │    └─ div.price-name-wrapper
            │    │         ├─ div.day_price_wrapper
            │    │         └─ div.tour_name
            │    └─ div.country-banner-right
            │         └─ div.banner_text_wrapper
            └─ ▶ div.main-column
                 ├─ div#breadcrumb                 4 elements   [Define Area: "Breadcrumbs"]
                 └─ ▶ div#tour_wrapper
                      ├─ ▶ div.left-column
                      │    └─ ▶ div#tab_wrapper
                      │         ├─ ul.ireland_tabs            6 elements   [Define Area: "Tab Nav"]
                      │         └─ ▶ div.ireland_tab_container
                      │              ├─ div#tab1              10 elements  [Define Area: "Itinerary"]
                      │              ├─ div#tab2              16 elements  [Define Area: "Features"]
                      │              ├─ div#tab3               2 elements  [Define Area: "Hotel"]
                      │              ├─ div#tab4               5 elements  [Define Area: "Extras"]
                      │              ├─ div#tab5               5 elements  [Define Area: "Tailor-make"]
                      │              └─ div#tab6               9 elements  [Define Area: "Reviews"]
                      └─ ▶ div.right-column                   10 elements  [Define Area: "Sidebar"]
```

The user would define areas for the containers they care about (Itinerary, Features, Hotel, etc.) and leave breadcrumbs, tab nav, and sidebar unselected — those elements simply disappear from the pipeline.

### What Changes vs Current

| Aspect | Current | New |
|--------|---------|-----|
| Container display | Flat list | Collapsible DOM tree |
| Area creation | Auto-detected (Header, Main Content, etc.) | User-picked DOM nodes, user-named |
| Extracted tab | Shows all elements in included auto-areas | Shows only elements in user-defined areas |
| Rules editor element count | 84 elements in "Main Content" | 10 in "Itinerary", 16 in "Features", etc. |
| Excluding noise | Requires explicit exclude rules | Implicit — if you don't pick it, it's gone |
| Ungrouped elements | Shown in catch-all "Ungrouped" area | Don't exist — everything outside picks is dropped |

### Parallel with PDF Pipeline

This follows the exact same pipeline as PDF:

| Step | PDF | Web |
|------|-----|-----|
| 1. Select source | Choose Pages (which pages to include) | Define Areas (which DOM containers to include) |
| 2. Define regions | Choose Areas (bounding boxes on the page) | Same modal, tree picker instead of bounding boxes |
| 3. View content | Extracted tab shows elements per area | Extracted tab shows elements per area |
| 4. Define rules | Sections button → rules editor per area | Sections button → rules editor per area |
| 5. Transform | Rules produce named sections | Rules produce named sections |

Everything downstream of area definition is identical.

## Design Decisions

### 1. Filter toggle: "Named containers only" (default ON)

Most web pages have deeply nested `<div>` wrappers with no class or ID — pure structural noise. By default, the tree only shows containers that have a class or ID attribute. A toggle at the top ("Show all containers" / "Named containers only") lets power users see the full tree when needed.

**Note:** The current area picker already filters to named containers (`#flattenContainers` only includes nodes with `node.className || node.id`). This decision formalises and extends that behaviour to the tree view.

### 2. Implicit exclusion — no "Ungrouped" bucket

Elements outside all user-defined areas are **silently dropped**. No "Ungrouped" area, no "Other" bucket. If the user doesn't pick a container, its elements don't enter the pipeline.

This is the key simplification over the current system. Currently the user must explicitly exclude areas (Header, Navigation, Footer) and then deal with 84 elements in Main Content. With the new approach, the user only picks what they want — everything else is gone.

### 3. No auto-detected suggestions — semantic landmark highlighting instead

**Decision: No pre-highlighted suggestions.** The tree starts clean. Auto-detection (Header, Navigation, Main Content, Footer) is NOT used as suggestions because it bakes in assumptions — and for messy legacy sites (the primary use case), "Main Content: 84 elements" is exactly the problem we're solving.

**Instead:** Semantic HTML5 landmark elements (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`, `<section>`, `<article>`) get a subtle yellow background highlight in the tree. This provides orientation ("here are the structural landmarks") without imposing any grouping. The user still has to actively click and name areas themselves.

### 4. Area names are user-defined, not derived from CSS

When the user clicks a node to define an area, they get an inline text input to name it. The name defaults to a derived label from the CSS selector (`div#tab1` → "Tab1", `div.country-banner` → "Country Banner") but is fully editable. This matches the current `#deriveLabel` behaviour.

### 5. Nesting rules — last click wins, with protection for existing rules

If the user defines an area at `div.country-banner` (5 elements), they should NOT also be able to define a separate area at `div.country-banner-left` (a child). The child's elements are already claimed by the parent area.

**Rule:** When a node is selected as an area, its descendants are greyed out in the tree (visually marked as "included in [parent area name]"). The user can still expand them to see the structure, but can't select them independently.

**Conflict resolution — most recent click wins:**
- Selecting a parent that contains existing child areas **absorbs** them (the child areas are removed, the parent area takes over).
- Selecting a child inside an existing parent area **splits** it (the parent area remains but the child's elements move to the new area).
- **If absorbed areas have section rules defined:** show a confirmation listing what would be lost — e.g., "Itinerary Day 1 has 3 rules, Itinerary Day 2 has 2 rules. Merge into one area?"
- **If absorbed areas have no rules:** merge silently, no dialog.

### 6. Element counts reflect descendants

Each node in the tree shows the count of extracted text elements it contains (directly or via descendants). This is already available as `ContainerTreeNode.elementCount`. A leaf node's count is its direct elements; a parent's count includes all descendant elements.

### 7. This replaces the current area picker for web sources

The current two-pane layout (containers left, areas right with include/exclude checkboxes) is replaced entirely for web sources. The new tree picker produces the same output — a list of named areas with their elements — but through a better interaction.

PDF sources continue to use the existing area picker (or a simplified version with just include/exclude, since PDF areas are detected from visual clustering, not DOM structure).

### 8. Tree component — `uui-menu-item`, not `umb-tree`

Use `uui-menu-item` directly for tree node rendering. It provides the correct chevron, hover states, font styling, and expand/collapse via `hasChildren`/`showChildren` props — all inherited from Umbraco's design system.

Do NOT use `umb-tree` / `umb-tree-item` — those are Umbraco's content tree infrastructure with lazy loading, entity actions, repositories, and data sources. Overkill for a read-only DOM visualisation in a modal.

### 9. Visual alignment prerequisite

Before building the DOM tree picker, align all existing collapsible tree UI in UpDoc (Extracted tab sections, Destination tab, etc.) to use `uui-menu-item` instead of custom `section-box-header` divs. This ensures the new tree picker matches the rest of the UI and avoids building more misaligned custom trees.

**Scope:** Only align the interfaces directly relevant to the tree picker work — not a full project audit.

## Data Model Changes

### No new models needed

The output of the tree picker is the same as the current area picker:
- A list of named areas (each with a container path and a label)
- Stored as `containerOverrides` with `action: 'promoteToArea'` in `source.json`

The `ContainerTreeNode` model already has everything needed for the tree view: `tag`, `id`, `className`, `cssSelector`, `path`, `depth`, `elementCount`, `children`.

### Potential addition: `excludeUnpicked` flag

Currently, `excludedAreas` is a list of area names to exclude. With the new model, we'd want a flag that says "only include explicitly picked areas" — which is the inverse of the current "exclude these specific areas" approach.

Options:
- Add `excludeUnpicked: true` to source config (cleaner, explicit)
- Or keep `excludedAreas` and auto-populate it with all auto-detected areas that weren't picked (backwards compatible but hacky)

**Recommendation:** Add `areaMode: 'inclusive'` to source config. When `areaMode` is `'inclusive'`, only areas in `containerOverrides` with `action: 'promoteToArea'` are included. When `areaMode` is `'exclusive'` (default, backwards compatible), the current behaviour applies.

## Implementation Approach

### Phase 0: Visual alignment — `uui-menu-item` migration

**Prerequisite.** Before building the tree picker, align existing collapsible UI to use `uui-menu-item`:
- Extracted tab (PDF + web): section groups, part boxes
- Destination tab: field/block sections
- Any other collapsible tree UI directly relevant to the tree picker

Scope is limited to interfaces that feed into the tree picker work — not a full project audit.

### Phase 1: Tree rendering in the area picker modal

- Modify `area-picker-modal.element.ts` to render `ContainerTreeNode[]` as a collapsible tree using `uui-menu-item`
- `uui-menu-item` handles indentation via `--uui-menu-item-indent` CSS variable, expand/collapse via `hasChildren`/`showChildren`
- Add "Named containers only" filter toggle (default ON)
- Highlight semantic HTML5 landmarks (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`, `<section>`, `<article>`) with subtle yellow background
- Keep the right panel (areas list) as-is — it shows the result of user selections

### Phase 2: "Define Area" interaction + implicit exclusion

**Merged phases** — the define-area interaction doesn't make sense without implicit exclusion.

**Define Area:**
- Clicking a tree node shows a "Define Area" action (button or inline)
- User names the area → stored as `containerOverride` with `action: 'promoteToArea'`
- Selected nodes highlighted in tree with their area name
- Descendant nodes of selected areas greyed out
- Parent/child conflict: last click wins, with confirmation if absorbed areas have rules (see Decision #5)
- Right panel updates to show the user-defined areas

**Implicit exclusion:**
- Add `areaMode: 'inclusive'` to source config
- When `areaMode` is `'inclusive'`, the Extracted tab only shows elements whose `htmlContainerPath` starts with a defined area's `containerPath`
- Remove the include/exclude checkboxes from the areas panel (not needed in inclusive mode)
- The `excludedAreas` list becomes unnecessary for web sources using inclusive mode

### Phase 3: Extracted tab integration

- When areas are defined via the tree picker, the Extracted tab shows them as separate collapsible groups (replacing the current single "Main Content" block)
- Each group has its own "Sections" button → opens rules editor with only that group's elements
- Element counts per group are small and manageable

## Backend Changes

### Minimal

The backend already has:
- `ContainerTreeNode` model with full hierarchy
- `HtmlExtractionService` that builds the container tree
- `containerOverrides` in `SourceConfig` with `promoteToArea` action
- Area detection that respects container overrides

The main backend change is supporting `areaMode: 'inclusive'` — when set, area detection should ONLY produce areas from `containerOverrides` with `action: 'promoteToArea'`, ignoring auto-detected areas entirely.

## Resolved Questions

1. **~~Should auto-detected areas still appear as suggestions in the tree?~~** RESOLVED: No suggestions. Semantic HTML5 landmarks get a yellow highlight for orientation only — no grouping imposed. See Decision #3.

2. **~~Nesting conflict resolution?~~** RESOLVED: Last click wins. Silent merge if no rules; confirmation listing affected rules if they exist. See Decision #5.

3. **~~Tree component choice?~~** RESOLVED: `uui-menu-item` directly, not `umb-tree`. See Decision #8.

4. **~~Phase 2/3 coupling?~~** RESOLVED: Merged into single phase. See Implementation Phase 2.

## Open Questions

1. **What about pages with no class/ID structure?** Some old websites use bare `<div>` nesting with no semantic markup. The "Named containers only" filter would show an empty tree. The toggle to show all containers handles this, but the UX would be poor. Is this an edge case we accept?

2. **Multiple pages?** Web sources are currently single-page. If we ever support multi-page extraction (crawling), does each page get its own tree? Parked for now.

3. **Migration:** Existing web workflows with `excludedAreas` set need to keep working. The `areaMode` field defaults to `'exclusive'` for backwards compatibility. Only new workflows (or workflows that go through the new tree picker) get `areaMode: 'inclusive'`.
