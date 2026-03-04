---
title: "Umbraco Components"
---


Higher-level Umbraco backoffice components (`umb-*`) used in UpDoc. These are composed from UUI primitives and provide Umbraco-specific layout and behaviour patterns.

---

## Layout

### umb-body-layout

The primary layout component for all workspace views and modal contents. Provides a structured layout with header, content area, and actions slots.

**Where used:** Every workspace view and sidebar modal in UpDoc.

**Attributes used:**

| Attribute | Purpose |
|-----------|---------|
| `headline` | Page/modal title text |
| `header-fit-height` | Allows header to size to content (used when tabs are in the header) |

**Slots used:**

| Slot | Purpose |
|------|---------|
| `header` | Tab groups and summary content placed here stay fixed above scrolling content |
| `actions` | Action buttons (Close, Create, Save) appear bottom-right |
| default | Main content area |

**Files:** `up-doc-modal.element.ts`, `create-workflow-sidebar.element.ts`, `up-doc-workflow-destination-view.element.ts`, `up-doc-workflow-source-view.element.ts`, `up-doc-workflow-map-view.element.ts`, `destination-picker-modal.element.ts`

**Example:**
```html
<!-- Destination view pattern: tabs only -->
<umb-body-layout header-fit-height>
    <uui-tab-group slot="header" dropdown-content-direction="vertical">
        <uui-tab label="Page Properties" ?active=${true}>Page Properties</uui-tab>
        <uui-tab label="Page Content">Page Content</uui-tab>
    </uui-tab-group>
    <uui-box>...</uui-box>
</umb-body-layout>

<!-- Source view pattern: tabs + action button in header, stat boxes in content -->
<umb-body-layout header-fit-height>
    <div slot="header" class="source-header">
        <uui-tab-group dropdown-content-direction="vertical">
            <uui-tab label="Extracted" ?active=${true}>Extracted</uui-tab>
            <uui-tab label="Transformed">Transformed</uui-tab>
        </uui-tab-group>
        <div class="header-actions">
            <uui-button look="outline" label="Re-extract">Re-extract</uui-button>
        </div>
    </div>
    <!-- stat boxes in scrollable content area -->
    <div class="stat-boxes"><!-- Pages, Areas, Sections, Source --></div>
    <!-- page hierarchy content -->
</umb-body-layout>
```

---

## Properties and Forms

### umb-property-layout

Form field wrapper that provides a consistent label + description + editor layout, matching how Umbraco property editors are displayed.

**Where used:** Form fields in modals — source type selector, document name, URL input, file pickers, workflow name.

**Attributes used:**

| Attribute | Purpose |
|-----------|---------|
| `label` | Field label text |
| `description` | Helper text below the label |
| `orientation` | `"vertical"` for stacked label/editor layout |

**Slots used:**

| Slot | Purpose |
|------|---------|
| `editor` | The input/control for this property |

**Files:** `up-doc-modal.element.ts`, `create-workflow-sidebar.element.ts`

**Example:**
```html
<umb-property-layout label="Document Name" description="Name for the new document">
    <uui-input slot="editor" id="documentName"
        .value=${this._documentName}
        @input=${this.#onNameChange}>
    </uui-input>
</umb-property-layout>
```

---

## Media

### umb-input-media

Media picker component for selecting files from the Umbraco media library.

**Where used:** PDF and Markdown file selection in the source modal and workflow source view.

**Attributes used:** `max="1"` (single file selection)

**Events:** `@change` — fires when media selection changes

**Files:** `up-doc-modal.element.ts`, `create-workflow-sidebar.element.ts`, `up-doc-workflow-source-view.element.ts`

---

## Icons

### umb-icon

Umbraco's icon component, used where document type or blueprint icons need to be displayed.

**Where used:** Document type and blueprint icons in selection lists, block icons in the destination view.

**Attributes used:** `name`, `slot="icon"`

**Files:** `blueprint-picker-modal.element.ts`, `up-doc-workflow-destination-view.element.ts`, `destination-picker-modal.element.ts`

---

## Imports and Base Classes

All UpDoc components extend `UmbLitElement` (from `@umbraco-cms/backoffice/lit-element`) rather than plain `LitElement`. This provides:

- Umbraco context consumption (`this.consumeContext()`, `this.getContext()`)
- Observable pattern (`this.observe()`)
- Automatic cleanup on disconnect

**Common imports:**

```typescript
import { html, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
```

**Context providers used:**

| Context | Purpose |
|---------|---------|
| `UMB_AUTH_CONTEXT` | Authentication token for API calls |
| `UMB_WORKSPACE_CONTEXT` | Current workspace entity info (unique ID) |
| `UMB_MODAL_MANAGER_CONTEXT` | Opening modals from within components |
| `UMB_NOTIFICATION_CONTEXT` | Toast notifications |
| `UMB_DOCUMENT_WORKSPACE_CONTEXT` | Document workspace info (for collection actions) |

**Modal base class:**
Modals extend `UmbModalBaseElement` (from `@umbraco-cms/backoffice/modal`) and use `UMB_MODAL_MANAGER_CONTEXT` for nested modal opening.

**Repository classes used:**
- `UmbDocumentBlueprintItemRepository` — blueprint lookups
- `UmbDocumentItemRepository` — document lookups
- `UmbDocumentTypeStructureRepository` — allowed child type queries
