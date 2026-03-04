---
title: "visual-grouping.ts"
---


Pure utility module for computing visual groups from extraction elements based on font size hierarchy. No Lit or Umbraco dependencies.

## What it does

Groups a flat list of extracted elements into heading + children structures using font size analysis. Headings are elements with a font size larger than the most frequent (mode) font size on the page. This enables the source view to visually represent the document's structure (e.g., "FEATURES" heading with bullet points indented beneath it).

## Exports

### `groupElementsByHeading(elements: ExtractionElement[]): VisualGroup[]`

Takes a flat array of elements (typically one page's worth) and returns visual groups.

**Algorithm:**

1. Compute the **mode** (most frequent) font size — this is the body text size
2. Any element with fontSize **strictly greater** than the mode is a heading
3. Walk elements top-to-bottom: each heading starts a new group; body elements accumulate as children
4. Elements before the first heading form an ungrouped section (`heading: null`)
5. If all elements have the same font size, returns one ungrouped group

**Example:** For a page with 9pt body text and 12pt section headings:

- `VisualGroup { heading: "FEATURES" (12pt), children: ["• Hotel", "• Dinner", ...] }`
- `VisualGroup { heading: "ACCOMMODATION" (12pt), children: ["We stay four nights..."] }`

## Imports

```typescript
import type { ExtractionElement, VisualGroup } from './workflow.types.js';
```

## Used by

- `up-doc-workflow-source-view.element.ts` — calls `groupElementsByHeading()` in `#renderPageGroup()`
