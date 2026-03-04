---
title: "up-doc-modal.token.ts"
---


Defines the modal token and TypeScript interfaces for type-safe modal communication.

## What it does

Creates a unique identifier (token) for the modal that:

1. Links the modal manifest to the modal element
2. Defines the data types for input and output
3. Configures modal appearance (sidebar vs dialog, size)

## Types

```typescript
export type SourceType = 'pdf' | 'markdown' | 'web' | 'doc';
```

Defines the available source types for content extraction. `pdf` and `markdown` are fully functional; `web` and `doc` are UI placeholders.

## The interfaces

```typescript
export interface UmbUpDocModalData {
    unique: string | null;     // Parent document ID
    documentTypeName: string;  // Display name of the document type
    blueprintName: string;     // Display name of the selected blueprint
    blueprintId: string;       // Blueprint GUID, used to fetch config
}

export interface UmbUpDocModalValue {
    name: string;                                    // The document name
    sourceType: SourceType;                          // Which source type was selected
    mediaUnique: string | null;                      // The selected media item's ID
    sourceUrl: string | null;                        // The entered URL (for web source)
    extractedSections: Record<string, string>;       // Extracted sections keyed by key
    config: DocumentTypeConfig | null;               // Full config for property mapping
}
```

The `UmbUpDocModalData` interface includes:
- `blueprintId` so the modal can pass it to the `extractSections` API call, which needs it to look up the correct config files on the backend
- `documentTypeName` and `blueprintName` for display on the Destination tab

The `UmbUpDocModalValue` interface returns:
- `extractedSections` -- a `Record<string, string>` containing all extracted values keyed by section key (from source.json)
- `config` -- the full `DocumentTypeConfig` containing source, destination, and map configs so the action knows how to apply each section

## The token

```typescript
export const UMB_UP_DOC_MODAL = new UmbModalToken<UmbUpDocModalData, UmbUpDocModalValue>(
    'UpDoc.Modal',  // Must match manifest alias
    {
        modal: {
            type: 'sidebar',  // Opens as sidebar panel
            size: 'small',    // Sidebar width
        },
    },
);
```

## Key concepts

### UmbModalToken

A generic class that provides:
- Type safety for `umbOpenModal()` calls
- Configuration for how the modal appears
- A unique string alias linking manifest to component

### Modal types

- `'sidebar'` -- Slides in from the right (used here)
- `'dialog'` -- Centered overlay dialog

### Sidebar sizes

- `'small'` -- Narrow sidebar (used here)
- `'medium'` -- Standard width
- `'large'` -- Wide sidebar
- `'full'` -- Full width

## Imports

```typescript
import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import type { DocumentTypeConfig } from './workflow.types.js';
```

The `DocumentTypeConfig` type is imported from `workflow.types.js` for use in `UmbUpDocModalValue`.

## Usage

When opening the modal:

```typescript
import { UMB_UP_DOC_MODAL } from './up-doc-modal.token.js';

const value = await umbOpenModal(this, UMB_UP_DOC_MODAL, {
    data: {
        unique: parentId,
        documentTypeName: 'Group Tour',
        blueprintName: 'My Blueprint',
        blueprintId: blueprintUnique,
    },  // TypeScript knows this must be UmbUpDocModalData
});
// value is typed as UmbUpDocModalValue
// Includes: name, sourceType, mediaUnique, sourceUrl, extractedSections, config
```
