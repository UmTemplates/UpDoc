---
title: "Custom Components"
---


Components built specifically for UpDoc (`up-doc-*` elements). These exist because no native UUI or Umbraco component provides the required functionality.

---

## Modals and Dialogs

### blueprint-picker-modal

Two-step blueprint selection dialog. Lists allowed document types, then shows blueprints for the selected type.

**Element:** `<blueprint-picker-modal>`
**Token:** `UMB_BLUEPRINT_PICKER_MODAL`
**Type:** Centered dialog (`uui-dialog-layout`)
**Source:** `blueprint-picker-modal.element.ts`

**Why custom:** Umbraco's native document creation dialog queries allowed child types and is not extensible for third-party use (see [Content Collection "Create" Button research](../user-journeys.md)). UpDoc needs to filter by blueprints that have configured workflows, which is domain-specific logic.

### up-doc-modal

Main extraction and document creation modal. Three-tab interface for source selection, content preview, and destination display.

**Element:** `<up-doc-modal>`
**Token:** `UMB_UP_DOC_MODAL` (type: `sidebar`, size: `small`)
**Source:** `up-doc-modal.element.ts`

**Why custom:** The entire extraction → preview → creation workflow is UpDoc-specific. No native equivalent exists.

### create-workflow-sidebar

Workflow creation sidebar modal. Collects workflow name, source type, and optional sample file.

**Element:** `<create-workflow-sidebar>`
**Token:** `UMB_CREATE_WORKFLOW_SIDEBAR`
**Source:** `create-workflow-sidebar.element.ts`

**Why custom:** Workflow creation is an UpDoc-specific concept with domain-specific validation (unique names, source type selection, auto-generated naming).

### up-doc-destination-picker-modal

Multi-select picker for mapping source content to destination fields and block properties.

**Element:** `<up-doc-destination-picker-modal>`
**Token:** `UMB_DESTINATION_PICKER_MODAL`
**Source:** `destination-picker-modal.element.ts`

**Why custom:** Maps UpDoc's extraction hierarchy to Umbraco's document type structure. Presents fields and block properties in tabs matching the destination blueprint structure.

---

## Workspace Views

### up-doc-workflow-destination-view

Read-only display of the blueprint structure showing available mapping targets.

**Element:** `<up-doc-workflow-destination-view>`
**Source:** `up-doc-workflow-destination-view.element.ts`

**Layout:** `umb-body-layout header-fit-height` with inner `uui-tab-group` tabs (Page Properties, Page Content).

**Why custom:** Displays the destination side of the mapping equation — fields and block grids from the blueprint. This is a domain-specific view over Umbraco content type data.

### up-doc-workflow-source-view

The extraction and transformation view. Two modes: Extracted (area detection hierarchy) and Transformed (assembled sections with pattern detection).

**Element:** `<up-doc-workflow-source-view>`
**Source:** `up-doc-workflow-source-view.element.ts`

**Layout:** `umb-body-layout header-fit-height` with a single `slot="header"` div containing `uui-tab-group` (left) and Re-extract button (right), following the Document Type editor pattern. Stat boxes (Pages, Areas, Sections, Source) are in the scrollable content area above the page hierarchy.

**Hierarchy:** Four-level collapsible display: Page (`uui-box` with `header-actions` chevron) → Area ("Area 1", "Area 2", or "Undefined" for unclassified content) → Section (with include/exclude toggle) → Text (with type/metadata badges). All levels use a consistent `collapse-chevron` icon positioned rightmost in each row.

**Why custom:** The entire extraction hierarchy display (Page → Area → Section → Text) is UpDoc-specific. No native Umbraco component displays this kind of nested content structure.

### up-doc-workflow-map-view

Table display of all mappings defined in `map.json`.

**Element:** `<up-doc-workflow-map-view>`
**Source:** `up-doc-workflow-map-view.element.ts`

**Layout:** `uui-table` with source → destination mappings, status indicators, and delete buttons.

**Why custom:** Mapping definitions are an UpDoc-specific data structure. The table displays source keys, destination targets (with block property disambiguation), and enabled/disabled status.

---

## Settings Views

### up-doc-workflows-view

Workflow management dashboard. Lists all configured workflows with their status.

**Element:** `<up-doc-workflows-view>`
**Source:** `up-doc-workflows-view.element.ts`

**Layout:** `uui-table` with columns for workflow name, document type, blueprint, source type, mapping count, and status. Includes Create and Delete actions.

**Why custom:** The workflow collection is an UpDoc-specific concept backed by JSON files on disk rather than Umbraco database entities.

### up-doc-configuration-view

Placeholder for future global configuration settings.

**Element:** `<up-doc-configuration-view>`
**Source:** `up-doc-configuration-view.element.ts`

### up-doc-about-view

Help and resources view with documentation links and project information.

**Element:** `<up-doc-about-view>`
**Source:** `up-doc-about-view.element.ts`

**Layout:** Uses `uui-ref-list` and `uui-ref-node` for external links.

---

## Collection Actions

### up-doc-collection-action

"Create from Source" button that appears in the content collection toolbar.

**Element:** `<up-doc-collection-action>`
**Source:** `up-doc-collection-action.element.ts`

**Renders:** A single `uui-button` (color: `default`, look: `outline`) that self-hides when no workflows are available.

**Why custom:** Umbraco's content collection "Create" button is not extensible for third-party options (see [Content Collection "Create" Button research](../user-journeys.md)). UpDoc registers a separate collection action that checks for available workflows before rendering.

---

## Entity Actions

### UpDoc Entity Action

"Create Document from Source" action in the content tree context menu.

**Class:** `UpDocEntityAction` (extends `UmbEntityActionBase`)
**Source:** `up-doc-action.ts`

**Why custom:** This is the primary entry point for UpDoc from the content tree. Standard Umbraco extension pattern (entity action registration).

---

## Gaps and Feedback for Umbraco HQ

### Content collection create button not extensible

The content collection "Create [Type]" button at `documents/documents/collection/action/` queries allowed child types from `UmbDocumentTypeStructureRepository.requestAllowedChildrenOf()` and has no extension point for adding custom options. The Settings section equivalent at `core/collection/action/create/` uses `entityCreateOptionAction` which IS extensible.

**Impact:** UpDoc must register a completely separate collection action button ("Create from Source") rather than adding an option to the existing create dropdown.

**Suggestion:** Make the content collection create button use the same `entityCreateOptionAction` extension registry as the Settings section, allowing third-party packages to add options alongside the standard document type options.

### No standard stat box / dashboard summary component

There is no UUI or Umbraco component specifically designed for dashboard-style stat boxes (e.g., "4 Pages", "9 Areas", "15 Sections"). Packages like Merchello and uSync build these from `uui-box` with custom CSS. A dedicated `uui-stat-box` or `umb-dashboard-stat` component would standardise this common pattern.
