---
title: "blueprint-picker-modal.token.ts"
---


Defines the modal token, data interface, and value interface for the blueprint picker dialog.

## What it does

Provides type-safe contracts for the blueprint picker dialog that opens as an interstitial step before the source sidebar modal. The dialog presents a two-step selection flow mirroring Umbraco's native Create dialog: first the user selects a document type, then a blueprint for that type.

## Interfaces

### BlueprintOption

Represents a single blueprint available for selection:

```typescript
export interface BlueprintOption {
    blueprintUnique: string;
    blueprintName: string;
}
```

### DocumentTypeOption

Represents a document type that has one or more blueprints, grouping the type's metadata with its available blueprints:

```typescript
export interface DocumentTypeOption {
    documentTypeUnique: string;
    documentTypeName: string;
    documentTypeIcon: string | null;
    blueprints: BlueprintOption[];
}
```

Only document types that have at least one blueprint are included. The `documentTypeIcon` is the icon alias from the document type definition (e.g. `icon-document`, `icon-home`), used to render the correct icon in the picker list.

### BlueprintPickerModalData

Data passed into the modal when opening it:

```typescript
export interface BlueprintPickerModalData {
    documentTypes: DocumentTypeOption[];
}
```

The `documentTypes` array contains allowed child document types that have blueprints. If no document types have blueprints, the array is empty and the dialog shows a "create a blueprint first" message.

### BlueprintPickerModalValue

Data returned when the user selects a blueprint:

```typescript
export interface BlueprintPickerModalValue {
    blueprintUnique: string;
    documentTypeUnique: string;
}
```

## Modal token

```typescript
export const UMB_BLUEPRINT_PICKER_MODAL = new UmbModalToken<BlueprintPickerModalData, BlueprintPickerModalValue>(
    'UpDoc.BlueprintPickerModal',
    {
        modal: {
            type: 'dialog',
            size: 'small',
        },
    },
);
```

- `type: 'dialog'` - Centered dialog (not a sidebar), matching Umbraco's native Create flow pattern
- `size: 'small'` - Compact dialog appropriate for a simple selection list
- The alias `UpDoc.BlueprintPickerModal` must match the manifest registration

## Usage

```typescript
import { UMB_BLUEPRINT_PICKER_MODAL } from './blueprint-picker-modal.token.js';
import { umbOpenModal } from '@umbraco-cms/backoffice/modal';

const result = await umbOpenModal(this, UMB_BLUEPRINT_PICKER_MODAL, {
    data: { documentTypes: documentTypeOptions },
});
// result.blueprintUnique - selected blueprint ID
// result.documentTypeUnique - selected document type ID
```
