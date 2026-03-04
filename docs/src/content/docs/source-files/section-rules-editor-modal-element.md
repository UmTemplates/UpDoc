---
title: "section-rules-editor-modal.element.ts"
---


Sidebar modal for defining rules that break a transform section into individually-mappable roles using the Outlook email rules pattern.

## What it does

Allows the workflow author to define rules for a single section (e.g., "Organiser Info"). Each rule assigns a **role name** to elements matching a set of conditions. Rules are evaluated first-match-wins against the section's elements, with live preview showing matched/unmatched elements.

## How it works

1. On `firstUpdated`, deep-clones existing rules (if any) to avoid mutating the original
2. Renders rule cards with role name input + condition rows
3. Evaluates all rules against elements in real-time (client-side, no server calls)
4. Shows matched element per rule (green) or "No match" (amber)
5. Lists unmatched elements at the bottom with "Create rule" buttons
6. On save, returns the complete rule set to the caller

## Rule evaluation

- **First-match-wins**: Rules evaluated top-to-bottom. An element claimed by one rule is excluded from later rules.
- **AND logic**: All conditions in a rule must match for an element to be claimed.
- **One match per rule**: Each rule matches at most one element (first match only).

## Condition types

| Type | Description | Value |
|------|-------------|-------|
| `textBeginsWith` | Element text starts with value | string |
| `textEndsWith` | Element text ends with value | string |
| `textContains` | Element text contains value | string |
| `textMatchesPattern` | Element text matches regex | regex string |
| `fontSizeEquals` | Font size matches (within 0.5pt) | number |
| `fontSizeRange` | Font size within min/max range (inclusive) | `{ min, max }` |
| `fontSizeAbove` | Font size greater than value | number |
| `fontSizeBelow` | Font size less than value | number |
| `fontNameContains` | Font name contains value | string |
| `colorEquals` | Color hex matches | string |
| `isBoldEquals` | Element is bold (true/false) | boolean |
| `htmlTagEquals` | HTML tag name matches | string |
| `cssClassContains` | CSS class list contains value | string |
| `htmlContainerPathContains` | HTML container path contains value (raw substring match) | string |
| `containerIdEquals` | Any ancestor container has this HTML ID (e.g., `tab3` matches `div#tab3`) | string |
| `containerClassContains` | Any ancestor container has a class containing this value | string |
| `positionFirst` | First element in section | (none) |
| `positionLast` | Last element in section | (none) |

## Auto-populate

Clicking "Create rule" on an unmatched element pre-fills conditions from **all** its metadata. The conditions offered are **source-type aware** — PDF and web sources offer different condition types:

**All sources:**
- Font size (always)
- Font name (always)
- Color (if not black)
- Text prefix (if text contains a colon within first 30 chars)
- Position (if first or last element)

**Web sources additionally:**
- Bold detection (`isBoldEquals`)
- HTML tag (`htmlTagEquals`)
- CSS classes (`cssClassContains`)
- Container ID or class — prefers the most specific ancestor container: ID first (`containerIdEquals`), then class (`containerClassContains`), then raw path (`htmlContainerPathContains`) as fallback

The condition type dropdown is sorted with the most relevant conditions first (source-type-specific conditions appear before generic ones for web sources).

Role name is auto-suggested from the first few words of the element text (kebab-case).

## Group management

Rules are organized into named groups plus a special "Ungrouped" sentinel group. All rules — including ungrouped ones — live inside `<updoc-sortable-rules>` containers, which enables cross-container drag-and-drop via `UmbSorterController`. See [Drag-and-drop dead zone](../errors/drag-drop-dead-zone.md) for the technical background.

The "Ungrouped" group:

- Renders with a simple header (no rename/delete buttons)
- On save, its rules are written to the top-level `rules[]` array in JSON (not as a named group)
- On load, top-level rules are loaded into the "Ungrouped" group
- The group count badge in the area header excludes "Ungrouped"

## Collapsible groups

Groups are collapsible via chevron toggles on each group header. An **Expand/Collapse All** button in the toolbar toggles all groups at once. Collapsed groups hide their rules, showing only the group header with name and rule count.

## Group reorder

When 2+ named groups exist, a **Reorder** button appears in the toolbar. It opens the `UP_DOC_SORT_MODAL` with group names, allowing drag-and-drop reorder. The "Ungrouped" group always stays at the end and is excluded from the sort modal.

The `groups[]` array order in the rules file is the **single source of truth** for section ordering. The C# `ContentTransformService` emits grouped sections in rules group order (not DOM order). Both the rules editor Reorder button and the Source tab "Sort sections" action write to this same backing store.

## Move to group

Each rule card has a "Move to..." dropdown (visible when there are 2+ groups) allowing the rule to be moved to a different group. This serves as a reliable fallback alongside drag-and-drop.

## UI layout

- **Section info bar**: Element count, rule count, matched/unmatched counts
- **Rule cards**: Numbered cards with role name input, condition rows (type dropdown + value input + remove), live match preview
- **Unmatched elements**: Dashed border section at bottom listing unclaimed elements with their metadata badges and "Create rule" buttons
- **Actions**: Close + Save button

## Find & Replace

Each rule can have a "Find & Replace" section for cleaning up matched element text before it enters the transform output. Entries are applied in order.

Each entry consists of two rows:

| Row | Dropdown | Input |
|-----|----------|-------|
| Find | Text begins with / Text ends with / Text contains | Text to find |
| Replace | Replace with / Replace all with (adapts to find type) | Replacement text |

- **Text begins with** — replaces only at the start, "Replace with"
- **Text ends with** — replaces only at the end, "Replace with"
- **Text contains** — replaces all occurrences, "Replace all with"

The find type dropdown reuses the same vocabulary as rule conditions, making the UI consistent.

## Inner section collapsing

All inner sections within expanded rules (Conditions, Exceptions, Part, Format, Find & Replace) are collapsed by default. Section headers act as toggles — click to expand/collapse. This keeps rule cards compact even when expanded.

## Custom element

- Tag: `<up-doc-section-rules-editor-modal>`
- Extends: `UmbModalBaseElement<SectionRulesEditorModalData, SectionRulesEditorModalValue>`
