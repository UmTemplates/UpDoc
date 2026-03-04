---
title: "UUI Components"
---


Native Umbraco UI Library (`uui-*`) components used in UpDoc.

---

## Buttons and Actions

### uui-button

The primary interactive element throughout UpDoc. Used for all action buttons.

**Where used:** Every modal and workspace view — Create, Save, Delete, Close, Map, Re-extract buttons.

**Attributes used:**

| Attribute | Values | Context |
|-----------|--------|---------|
| `look` | `primary`, `secondary`, `outline`, `default` | Visual prominence |
| `color` | `positive`, `danger` | Semantic colour |
| `compact` | boolean | Smaller buttons in tight layouts |
| `disabled` | boolean | Prevents interaction during loading |
| `label` | string | Accessible label |

**Files:** All modal and view elements.

**Example:**
```html
<uui-button look="primary" label="Create" @click=${this.#onCreate}>Create</uui-button>
<uui-button look="secondary" label="Re-extract" @click=${this.#onPickMedia}>
    <uui-icon name="icon-refresh"></uui-icon> Re-extract
</uui-button>
```

### uui-action-bar

Toolbar container for grouping action buttons.

**Where used:** Copy button on content preview cards in the source modal.

**Files:** `up-doc-modal.element.ts`

---

## Navigation and Tabs

### uui-tab-group

Container for tab navigation. Used at two levels in UpDoc:

1. **Workspace-level tabs** — Destination, Source, Map (top-level navigation with icons)
2. **Content-area tabs** — Page Properties / Page Content (Destination view), Extracted / Transformed (Source view). Both use `slot="header"` on `umb-body-layout` for consistent positioning.

**Attributes used:** `dropdown-content-direction="vertical"`

**Files:** `up-doc-modal.element.ts`, `create-workflow-sidebar.element.ts`, `up-doc-workflow-destination-view.element.ts`, `up-doc-workflow-source-view.element.ts`, `destination-picker-modal.element.ts`

### uui-tab

Individual tab within a `uui-tab-group`.

**Attributes used:**

| Attribute | Purpose |
|-----------|---------|
| `label` | Tab label text |
| `active` | Whether this tab is currently selected |
| `disabled` | Greyed out when content unavailable |

:::caution[Text rendering gotcha]
`uui-tab` requires text content **inside** the element (`${tab.label}`) in addition to the `label` attribute. The `label` attribute alone does not render visible text when inside `umb-body-layout`. Always include both.
:::

**Example:**
```html
<uui-tab-group>
    <uui-tab label="Extracted" ?active=${this._viewMode === 'elements'}
        @click=${() => { this._viewMode = 'elements'; }}>Extracted</uui-tab>
    <uui-tab label="Transformed" ?active=${this._viewMode === 'transformed'}
        @click=${() => { this._viewMode = 'transformed'; }}
        ?disabled=${!this._transformResult}>Transformed</uui-tab>
</uui-tab-group>
```

---

## Input and Selection

### uui-input

Text input field.

**Where used:** Document name input, URL input for web sources, workflow name input.

**Files:** `up-doc-modal.element.ts`, `create-workflow-sidebar.element.ts`, `destination-picker-modal.element.ts`

:::caution[Testing gotcha]
`uui-input` is not a native input. In Playwright tests, use `locator('uui-input#id input')` to reach the inner `<input>` element for `inputValue()` or `toBeEmpty()`.
:::

### uui-select

Dropdown for single-value selection.

**Where used:** Source type picker (PDF, Markdown, Web, Word).

**Files:** `up-doc-modal.element.ts`, `create-workflow-sidebar.element.ts`

:::caution[Re-render gotcha]
`uui-select` requires explicit `this.requestUpdate()` after state changes to trigger Lit re-render of conditional UI below the dropdown.
:::

### uui-checkbox

Multi-select checkbox.

**Where used:** Field and block property selection in the destination picker modal.

**Files:** `destination-picker-modal.element.ts`

### uui-toggle

On/off toggle switch.

**Where used:** Section include/exclude toggle in the Source view (Extracted mode).

**Files:** `up-doc-workflow-source-view.element.ts`

---

## Layout and Containers

### uui-box

Bordered content container with optional headline.

**Where used:** Content sections throughout — workflow empty states, field/block groups, page containers, transformed sections.

**Attributes used:** `headline`

**Slots used:** `header-actions` (for badges and buttons in the box header)

**Files:** All view elements.

**Example:**
```html
<uui-box headline="Page 1" class="page-box">
    <!-- page content -->
</uui-box>
```

---

## Data Display

### uui-table, uui-table-head, uui-table-head-cell, uui-table-row, uui-table-cell

Standard table components for data display.

**Where used:**
- Workflow list in the Settings dashboard (`up-doc-workflows-view.element.ts`)
- Mapping definitions table (`up-doc-workflow-map-view.element.ts`)

**Notes:** Table rows in the workflow list are clickable for navigation.

### uui-tag

Status badge / label component.

**Where used:**
- Workflow status indicators: "Ready" (positive), "Incomplete" (warning)
- Required field markers on destination view
- Disabled mapping indicators

**Attributes used:**

| Attribute | Values |
|-----------|--------|
| `look` | `primary`, `secondary` |
| `color` | `positive`, `warning`, `danger` |

**Files:** `up-doc-workflows-view.element.ts`, `up-doc-workflow-destination-view.element.ts`, `up-doc-workflow-map-view.element.ts`

---

## Icons

### uui-icon

Inline icon component.

**Where used:** Throughout the entire UI — tab icons, status indicators, action buttons, badges.

**Icon names used in UpDoc:**

| Icon | Context |
|------|---------|
| `icon-document` | PDF/document references |
| `icon-document-dashed-line` | Empty states |
| `icon-blueprint` | Blueprint references |
| `icon-edit` | Edit actions |
| `icon-page-add` | Create actions |
| `icon-nodes` | Mapping/connections |
| `icon-settings` | Configuration |
| `icon-info` | Information |
| `icon-alert` | Warnings |
| `icon-check` | Success/mapped status |
| `icon-trash` | Delete actions |
| `icon-documents` | Document lists |
| `icon-box` | Block references |
| `icon-link` | Mapping link |
| `icon-refresh` | Re-extract |
| `icon-navigation-right` | Collapsed state |
| `icon-navigation-down` | Expanded state |
| `icon-arrow-right` | Source → Destination arrow |
| `icon-lab` | Transform/experimental |
| `icon-book-alt` | Documentation |
| `icon-code` | Source code |
| `icon-globe` | Web source type |

---

## Dialogs

### uui-dialog-layout

Container for centered dialog modals.

**Where used:** Blueprint picker dialog.

**Attributes used:** `headline`

**Files:** `blueprint-picker-modal.element.ts`

---

## Menus

### uui-menu-item

List item for selection lists.

**Where used:** Document type and blueprint selectors in the blueprint picker.

**Attributes used:** `label`

**Files:** `blueprint-picker-modal.element.ts`

---

## Loading and Status

### uui-loader-bar

Progress indicator bar.

**Where used:** Loading states during data fetch, extraction progress.

**Files:** All modal and view elements that perform async operations.

---

## Reference Links

### uui-ref-list, uui-ref-node

Reference link list and individual link items.

**Where used:** About/help view with documentation and source code links.

**Attributes used:** `name`, `detail`, `href`, `target`

**Files:** `up-doc-about-view.element.ts`

---

## CSS Custom Properties

All styling uses UUI CSS custom properties. No hardcoded colour values.

**Colours:**
`--uui-color-surface`, `--uui-color-surface-alt`, `--uui-color-surface-emphasis`, `--uui-color-border`, `--uui-color-border-standalone`, `--uui-color-text`, `--uui-color-text-alt`, `--uui-color-danger`, `--uui-color-positive`, `--uui-color-positive-emphasis`, `--uui-color-positive-contrast`, `--uui-color-warning`, `--uui-color-warning-emphasis`, `--uui-color-warning-contrast`, `--uui-color-selected`, `--uui-color-default-emphasis`, `--uui-color-default-contrast`

**Spacing:**
`--uui-size-space-1` through `--uui-size-space-6`, `--uui-size-layout-1`, `--uui-size-layout-2`

**Typography:**
`--uui-type-small-size`, `--uui-type-default-size`, `--uui-type-h5-size`

**Borders:**
`--uui-border-radius`

**Base styles mixin:**
All components include `UmbTextStyles` as the first entry in `static override styles`.
