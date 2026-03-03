# section-rules-editor-modal.element.ts

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
| `htmlContainerPathContains` | HTML container path contains value | string |
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
- Container path (`htmlContainerPathContains`)

The condition type dropdown is sorted with the most relevant conditions first (source-type-specific conditions appear before generic ones for web sources).

Role name is auto-suggested from the first few words of the element text (kebab-case).

## Move to group

When rules belong to a group, each rule card has a "Move to..." dropdown allowing the rule to be moved to a different group or to "Ungrouped". This serves as a workaround for the drag-and-drop dead zone between sortable containers caused by the group title dividers.

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
