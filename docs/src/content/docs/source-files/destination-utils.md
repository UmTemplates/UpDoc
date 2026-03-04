---
title: "destination-utils.ts"
---


Shared utility functions for resolving destination tab structure. Used by the Destination view, Map view, and Create from Source modal to ensure consistent grouping and ordering of destination fields.

## What it does

Provides three pure functions (no Lit or Umbraco dependencies) that operate on `DestinationConfig` from `workflow.types.ts`:

### `getDestinationTabs(destination)`

Extracts the tab structure from a destination config. Returns tabs in document order with kebab-case IDs, appending "Page Content" if blockGrids exist but no explicit "Page Content" tab is present.

### `resolveDestinationTab(dest, destination)`

Maps a `MappingDestination` to its destination tab ID. Block properties (those with `blockKey`) always resolve to `'page-content'`. Top-level fields resolve to their field's tab. Returns `null` for orphaned mappings.

### `resolveBlockLabel(blockKey, destination)`

Finds a block's display label given its key. Used for sub-grouping block properties within the Page Content tab.

## Used by

- `up-doc-workflow-destination-view.element.ts` -- uses `getDestinationTabs()` for inner tab rendering
- `up-doc-modal.element.ts` -- uses all three functions for Content tab grouped preview
- `up-doc-workflow-map-view.element.ts` -- uses all three functions for grouped mapping sections

## Imports

```typescript
import type { DestinationConfig, MappingDestination } from './workflow.types.js';
```
