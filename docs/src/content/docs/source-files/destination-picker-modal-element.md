---
title: "destination-picker-modal.element.ts"
---


Sidebar modal for picking destination fields when creating a source-to-destination mapping.

## What it does

Presents the destination structure (fields and block grid properties) from `destination.json` in a tabbed interface. The user selects one or more target fields, then confirms to create the mapping.

## How it works

### Tab structure

Tabs are generated dynamically from the destination config:

- One tab per unique `tab` value in `destination.fields` (e.g., "Page Properties")
- A "Page Content" tab if `destination.blockGrids` has entries
- First tab is auto-selected on open

### Field rendering

Each field/property renders as a clickable row with:

- **Checkbox** with accessibility label (`label="Select ${field.label}"`)
- **Field label** (bold)
- **Type badge** showing the property editor type

Clicking the row or the checkbox toggles selection. Selected items get a highlighted background.

### Block grid rendering

Block grids show a header with the grid label, then nested blocks. Each block shows:

- Block icon and label
- Indented properties with checkboxes (same selection pattern as fields)

### Block property disambiguation

Multiple block instances can share the same property alias (e.g., three blocks all have `richTextContent`). The modal uses **compound keys** internally (`blockKey:alias`) so that selecting a property in one block does not affect the same property in other blocks. Each block property is independently selectable.

### Confirm action

The confirm button shows "Map to N field(s)" with a count. It's disabled when nothing is selected. On confirm, returns `{ selectedTargets: Array<{ target, blockKey? }> }` — structured objects with the property alias and optional block instance key for disambiguation.

## Data flow

```
Source tab selects elements → opens this modal with destination config
                           → user picks target fields (block context preserved)
                           → modal returns structured targets with blockKey
                           → Source tab creates mapping entries in map.json
```

## Imports

```typescript
import type { DestinationConfig, DestinationField, DestinationBlockGrid } from './workflow.types.js';
import type { DestinationPickerModalData, DestinationPickerModalValue } from './destination-picker-modal.token.js';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
```

## Registered in

- `manifest.ts` — modal registration with alias `UpDoc.DestinationPickerModal`

## Used by

- `up-doc-workflow-source-view.element.ts` — opened via `UMB_MODAL_MANAGER_CONTEXT` when "Map to..." is clicked
