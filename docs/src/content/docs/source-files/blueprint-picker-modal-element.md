---
title: "blueprint-picker-modal.element.ts"
---


The UI component for the blueprint picker dialog.

## What it does

Renders a centered dialog that implements a two-step selection flow mirroring Umbraco's native Create dialog:

1. **Document Type view** — Lists allowed child document types that have blueprints
2. **Blueprint view** — Lists blueprints for the selected document type

If no document types have blueprints, shows an informational message telling the user to create a blueprint first.

This dialog opens as an interstitial step before the source sidebar modal.

## Class structure

```typescript
@customElement('blueprint-picker-modal')
export class BlueprintPickerModalElement extends UmbModalBaseElement<
    BlueprintPickerModalData,
    BlueprintPickerModalValue
> {
    @state() _selectedDocType: DocumentTypeOption | null = null;

    #handleDocTypeSelect(docType) { ... }
    #handleBlueprintSelect(blueprintUnique) { ... }
    #handleBack() { ... }
    #handleClose() { ... }
    #renderNoDocumentTypes() { ... }
    #renderDocumentTypeList() { ... }
    #renderBlueprintList() { ... }
    render() { ... }
}
```

## Two-step view switching

The dialog uses a single `@state()` property (`_selectedDocType`) to determine which view to render:

- `null` → show document type list
- set → show blueprint list for that doc type

View switching uses Lit's `when()` directive, matching the pattern used by Umbraco's own `document-create-options-modal.element.js`:

```typescript
${when(
    !hasDocumentTypes,
    () => this.#renderNoDocumentTypes(),
    () => when(
        showBlueprints,
        () => this.#renderBlueprintList(),
        () => this.#renderDocumentTypeList(),
    ),
)}
```

The headline updates dynamically based on the current view:
- Document type view: "Choose a Document Type"
- Blueprint view: Uses Umbraco's `blueprints_selectBlueprint` localization term

## Rendering states

### Document types available

Each document type is rendered as a `uui-menu-item` with its icon from the document type definition:

```html
<uui-menu-item label="Web Page">
    <umb-icon slot="icon" name="icon-document"></umb-icon>
</uui-menu-item>
```

Only document types that have at least one blueprint appear in the list.

### Blueprints available

After selecting a document type, blueprints for that type are rendered:

```html
<uui-menu-item label="Tour Page Blueprint">
    <umb-icon slot="icon" name="icon-blueprint"></umb-icon>
</uui-menu-item>
```

A "Back" button appears in the actions area to return to the document type list.

### No document types with blueprints

Shows a warning icon and message:
- Main message: "To create a document from a source, you first need to create a Document Blueprint."
- Hint: "Use the Create Document Blueprint option from the document actions menu."

The user can only close the dialog in this state; there is no submit action.

## Key patterns

### Modal submission

When a blueprint is selected, the value is set and the modal is submitted immediately (no separate confirmation button):

```typescript
#handleBlueprintSelect(blueprintUnique: string) {
    if (!this._selectedDocType) return;
    this.value = {
        blueprintUnique,
        documentTypeUnique: this._selectedDocType.documentTypeUnique,
    };
    this._submitModal();
}
```

### Back navigation

The Back button resets the selected document type, returning to the document type list:

```typescript
#handleBack() {
    this._selectedDocType = null;
}
```

### Modal cancellation

Closing the dialog rejects the modal, which the entity action catches to abort the workflow:

```typescript
#handleClose() {
    this._rejectModal();
}
```

### List rendering

Uses Lit's `repeat()` directive with unique keys for efficient DOM recycling:

```typescript
${repeat(
    documentTypes,
    (dt) => dt.documentTypeUnique,
    (dt) => html`<uui-menu-item ...>`,
)}
```

## Styles

- Uses `UmbTextStyles` for Umbraco base styles
- `.no-blueprints` - Centered column layout with warning icon, message, and hint text

## Design decisions

- **Always shown, even with one document type or one blueprint** — For consistency and discoverability. Users learn that document type and blueprint selection are part of the workflow.
- **Dialog type, not sidebar** — This is a quick selection step, not a workspace. Centered dialogs are appropriate for simple choices.
- **No "Blank" option** — Unlike Umbraco's native Create flow, there is no "blank" option because the Create from Source feature requires a blueprint to define the target field structure.
- **Only doc types with blueprints** — Document types that have no blueprints are filtered out since they cannot be used in the Create from Source workflow.
- **Back button included** — Unlike Umbraco's native Create dialog which has no back button, this dialog includes one for better UX since cancelling and restarting the workflow is more disruptive.
