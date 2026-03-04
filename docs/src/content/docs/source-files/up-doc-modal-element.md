---
title: "up-doc-modal.element.ts"
---


The Lit component that renders the "Create from Source" sidebar modal.

## What it does

Provides the UI for users to:

1. Choose a source type (PDF Document, Markdown, Web Page, or Word Document)
2. Configure the source (pick a media item, paste a URL, etc.)
3. Enter a document name (or leave blank to auto-populate from mapped title elements)
4. For PDF and Markdown sources: automatically runs rich extraction when a media item is selected
5. Pre-fills the document name by finding elements mapped to the first destination field and concatenating them
6. Review mapped content in the **Content tab** — shows destination field labels with assembled values from the extraction
7. Copy individual mapped values via hover-reveal action buttons
8. Check the destination document type and blueprint in the **Destination tab**
9. Submit or cancel the operation

PDF, Markdown, and Web source types are fully functional. Word Document source type shows its UI (media picker) but displays "not yet available" messages and the Create button remains disabled.

The source type dropdown is **dynamically populated** from the workflow config. When the modal opens, it fetches the config for the selected blueprint and only shows source types that have config files (e.g., if only `source-pdf.json` exists, only "PDF Document" appears). If only one source type is available, it is auto-selected.

## Tabbed Interface

The modal uses a tabbed interface with navigation tabs in the header:

- **Source tab** (default, active on open): Choose a source type, provide the source file/URL, enter document name
- **Content tab**: Review mapped content before creating the document (disabled until extraction completes)
- **Destination tab**: Read-only reference showing the selected document type and blueprint

The tab order follows the user's workflow: Source (what to import) -> Content (review extraction) -> Destination (where it's going, already decided). The Source tab is active on arrival because that's the user's immediate next action. The Destination tab is last because the user already chose the document type and blueprint in the preceding dialog steps — it's a reference, not a next step.

The tabs follow Umbraco's sidebar modal header pattern using `slot="navigation"` on the `uui-tab-group`.

## Class structure

```typescript
type TabType = 'source' | 'content' | 'destination';

@customElement('up-doc-modal')
export class UpDocModalElement extends UmbModalBaseElement<
    UmbUpDocModalData,
    UmbUpDocModalValue
> {
    @state() private _activeTab: TabType = 'source';
    @state() private _documentName = '';
    @state() private _sourceType: SourceType | '' = '';
    @state() private _sourceUrl = '';
    @state() private _selectedMediaUnique: string | null = null;
    @state() private _extractedSections: Record<string, string> = {};
    @state() private _config: DocumentTypeConfig | null = null;
    @state() private _isExtracting = false;
    @state() private _extractionError: string | null = null;
    @state() private _availableSourceTypes: string[] = [];
    @state() private _loadingSourceTypes = true;

    // ... methods and render
}
```

The modal stores:
- `_activeTab` -- tracks which tab is currently active ('source', 'content', or 'destination')
- `_extractedSections` -- a `Record<string, string>` holding all extracted values keyed by **element ID** (e.g., `p1-e2`, `p1-e3`). These IDs match the source keys in `map.json`.
- `_config` -- the full `DocumentTypeConfig` loaded once at startup via `fetchConfig()`, containing source, destination, and map configs (merged across all workflows for the blueprint)
- `_workflowConfig` -- per-workflow `DocumentTypeConfig` fetched via `fetchWorkflowByAlias()` during extraction. Contains the correct map.json for the specific source type. Preferred over `_config` when available.

## Key concepts

### Extending UmbModalBaseElement

All Umbraco modals extend `UmbModalBaseElement<TData, TValue>`:
- `TData` -- The data passed TO the modal when opening
- `TValue` -- The data returned FROM the modal when submitted

### Area-aware extraction via #extractFromSource

The `#extractFromSource` method calls `transformAdhoc` from `workflow.service.ts` to run the full Extract → Shape pipeline. This produces sections with IDs matching `map.json` source keys:

1. Calls `transformAdhoc(workflowName, mediaUnique, token)` to get the transform result
2. Flattens all areas/groups/sections via `allTransformSections()`
3. Builds a `sectionLookup` record mapping composite keys (e.g., `features.content`, `features.title`) to text values
4. Fetches per-workflow config via `fetchWorkflowByAlias()` and stores in `_workflowConfig`
5. Pre-fills the document name from mapped title sections (with `stripMarkdown` applied)

The merged config (`_config`) is loaded once at modal startup. Per-workflow config (`_workflowConfig`) is fetched during extraction to ensure the correct map.json is used for the specific source type.

### Per-workflow config vs merged config

When multiple workflows share the same blueprint (e.g., "Group Tour from PDF" and "Group Tour from Web"), `fetchConfig()` returns a merged config that combines sources from all workflows but only includes the **first** workflow's map.json and destination.json. This is incorrect for document creation — each source type has its own mapping rules.

The fix: during extraction, `fetchWorkflowByAlias()` retrieves the source-type-specific workflow config. `#handleSave` uses `this._workflowConfig ?? this._config` (per-workflow preferred). This pattern is used in both `#extractFromSource` (PDF/Markdown) and `#extractFromUrl` (Web) extraction methods.

### Document name pre-fill

The `#prefillDocumentName` method finds the `pageTitle` destination target in `map.json` first, then falls back to the first top-level (non-block) destination target. It collects text from all sections mapped to that target, strips any markdown formatting, and joins them with spaces.

The method applies `stripMarkdown()` to remove heading prefixes (e.g., `# Title` → `Title`) since extracted content may contain markdown formatting that shouldn't appear in the document name.

This handles cases like a title split across two PDF lines (e.g., "Flemish Masters –" + "Bruges, Antwerp & Ghent" → "Flemish Masters – Bruges, Antwerp & Ghent"). If no mapping-based name is found, it falls back to the first non-empty section value (also stripped of markdown).

The method uses `effectiveConfig` (per-workflow config preferred over merged config) to ensure the correct map.json is consulted.

### Content tab with grouped preview

The Content tab shows destination field labels with assembled values from the extraction, grouped by the destination document's tab structure. This gives the user a preview that matches the layout they'll see when editing the document in Umbraco.

The `#buildGroupedPreview()` method groups mapped content by destination tab using shared utilities from `destination-utils.ts`:

```typescript
interface ContentTabGroup {
    tabId: string;
    tabLabel: string;
    items: Array<{ label: string; value: string; blockLabel?: string }>;
}
```

- Uses `resolveDestinationTab()` to classify each mapping into a destination tab
- Uses `resolveBlockLabel()` to resolve block labels for Page Content items
- Compound keys (`blockKey:alias`) ensure block property values are correctly grouped
- Items within Page Content are sub-grouped by block, with block headers as visual dividers
- Only tabs with mapped content are shown

When multiple tabs have content, inner `uui-tab-group` tabs appear (matching the Destination view's tab pattern). When only one tab has content, the tab bar is omitted to avoid a single useless tab.

### Destination tab

The Destination tab shows read-only reference information about where the extracted content will be created:

```typescript
#renderDestinationTab() {
    return html`
        <uui-box headline="Document Type">
            <div class="destination-value">
                <umb-icon name="icon-document-dashed-line"></umb-icon>
                <span>${this.data?.documentTypeName}</span>
            </div>
        </uui-box>
        <uui-box headline="Blueprint">
            <div class="destination-value">
                <umb-icon name="icon-blueprint"></umb-icon>
                <span>${this.data?.blueprintName}</span>
            </div>
        </uui-box>
    `;
}
```

Both `documentTypeName` and `blueprintName` are passed via the modal data from the preceding picker dialogs.

### Tab navigation

The tabs are rendered in the modal header using `slot="navigation"`:

```typescript
#renderTabs() {
    const hasContent = this.#hasExtractedContent();
    return html`
        <uui-tab-group slot="navigation">
            <uui-tab
                label="Source"
                ?active=${this._activeTab === 'source'}
                orientation="horizontal"
                @click=${() => this.#handleTabClick('source')}>
                <uui-icon slot="icon" name="icon-page-add"></uui-icon>
                Source
            </uui-tab>
            <uui-tab
                label="Content"
                ?active=${this._activeTab === 'content'}
                orientation="horizontal"
                ?disabled=${!hasContent}
                @click=${() => this.#handleTabClick('content')}>
                <uui-icon slot="icon" name="icon-edit"></uui-icon>
                Content
            </uui-tab>
            <uui-tab
                label="Destination"
                ?active=${this._activeTab === 'destination'}
                orientation="horizontal"
                @click=${() => this.#handleTabClick('destination')}>
                <uui-icon slot="icon" name="icon-document"></uui-icon>
                Destination
            </uui-tab>
        </uui-tab-group>
    `;
}

#hasExtractedContent(): boolean {
    return Object.keys(this._extractedSections).length > 0;
}
```

Tab content routing uses a switch statement:

```typescript
#renderTabContent() {
    switch (this._activeTab) {
        case 'source':
            return this.#renderSourceTab();
        case 'content':
            return this.#renderContentTab();
        case 'destination':
            return this.#renderDestinationTab();
    }
}
```

### Dynamic source type loading

When the modal opens, it immediately fetches the workflow config via `fetchConfig()` to discover which source types have config files. The config is stored in `_config` for use by extraction and preview:

```typescript
async #loadAvailableSourceTypes() {
    this._loadingSourceTypes = true;
    try {
        const config = await fetchConfig(blueprintId, token);
        if (config) {
            this._config = config;
            if (config.sources) {
                this._availableSourceTypes = Object.keys(config.sources);
                if (this._availableSourceTypes.length === 1) {
                    this._sourceType = this._availableSourceTypes[0] as SourceType;
                }
            }
        }
    } finally {
        this._loadingSourceTypes = false;
    }
}
```

The dropdown only shows source types that exist in the config's `sources` dictionary. This means if a workflow only has `source-pdf.json`, the user won't see Markdown, Web Page, or Word Document as options. Human-readable labels are mapped via `SOURCE_TYPE_LABELS`.

### Source type selection

The `uui-select` dropdown shows "Choose a source..." when no source type is selected (only when multiple source types are available). When the user changes the source type, source-specific state is reset (selected media, URL, extracted sections, extraction error). The `_config` is preserved across source type changes since it was loaded once at startup.

### Conditional source UI rendering

Each source type renders its own UI via `#renderSourceUI()`:
- **PDF** (`#renderPdfSource()`) -- Media picker + extraction status (fully functional)
- **Markdown** (`#renderMarkdownSource()`) -- Media picker + extraction status (fully functional, same pattern as PDF)
- **Web** (`#renderWebSource()`) -- URL input + Extract button (fully functional)
- **Doc** (`#renderDocSource()`) -- Media picker + "not yet available" message

### Create button enablement

The `#getCanCreate()` method controls when the Create button is enabled:
- Requires a document name and no active extraction
- For PDF and Markdown: also requires a selected media item
- For Web: also requires a source URL
- For Doc: always returns false (not yet functional)

### Modal context methods

```typescript
#handleSave() {
    const effectiveConfig = this._workflowConfig ?? this._config;
    this.value = {
        name: this._documentName,
        sourceType: this._sourceType as SourceType,
        mediaUnique: this._selectedMediaUnique,
        sourceUrl: this._sourceUrl || null,
        sectionLookup: this._sectionLookup,
        config: effectiveConfig,
    };
    this._submitModal();
}

#handleClose() {
    this._rejectModal();
}
```

The `#handleSave` method returns `sectionLookup` (composite key → text lookup) and the effective config (per-workflow preferred) so the action has everything needed to apply mappings.

## Template structure

The modal uses a tabbed interface with three tabs:

### Source Tab (default)

1. **Document Name box** -- Text input with explanatory text
2. **Source box** -- Contains a source type dropdown and conditional source-specific UI

### Content Tab
- **Inner tabs** matching the destination document's tab structure (Page Properties, Page Content, custom tabs)
- When only one tab has content, the tab bar is hidden
- **Page Content** items are sub-grouped by block with block name headers
- **Mapped field cards** -- Each destination field displayed as a card with:
  - Header showing the human-readable destination field label (resolved from destination config)
  - Body with assembled content from all mapped source elements (concatenated with spaces)
  - Hover-reveal action bar with Copy button
  - Empty state message when no mappings exist

### Destination Tab
- **Destination box** -- Read-only display of:
  - Document Type name with icon
  - Blueprint name with icon

Uses Umbraco's UI components:
- `umb-body-layout` -- Standard modal layout with headline "Create from Source"
- `uui-tab-group` -- Navigation tabs in the header (via `slot="navigation"`)
- `uui-tab` -- Individual tabs for Source, Content, and Destination
- `uui-box` -- Content containers with headlines
- `uui-select` -- Dropdown for choosing source type
- `umb-property-layout` -- Form field wrapper with label
- `umb-input-media` -- Media picker for selecting PDF/Doc
- `umb-icon` -- Umbraco icons for document type and blueprint display
- `uui-input` -- Text input for document name and URL
- `uui-loader-bar` -- Loading indicator during extraction
- `uui-icon` -- Status icons for success/error/info states
- `uui-action-bar` -- Container for hover-reveal action buttons
- `uui-button` -- Action buttons (Create, Close, Copy)

## Extraction status display

The modal shows visual feedback during and after extraction:
- **Extracting**: Loading bar with "Extracting content from source..." message
- **Error**: Red box with error message
- **Success**: Green box with "Content extracted successfully"

## Imports

```typescript
import type { UmbUpDocModalData, UmbUpDocModalValue, SourceType } from './up-doc-modal.token.js';
import type { DocumentTypeConfig } from './workflow.types.js';
import { transformAdhoc, allTransformSections, fetchConfig, fetchWorkflowByAlias } from './workflow.service.js';
import { getDestinationTabs, resolveDestinationTab, resolveBlockLabel } from './destination-utils.js';
import { stripMarkdown } from './transforms.js';
import { html, customElement, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
```

## Global declaration

```typescript
declare global {
    interface HTMLElementTagNameMap {
        'up-doc-modal': UpDocModalElement;
    }
}
```

This provides TypeScript support when using `document.createElement('up-doc-modal')`.
