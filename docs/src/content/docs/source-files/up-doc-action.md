---
title: "up-doc-action.ts"
---


The entity action class that handles the "Create Document from Source" menu click.

## What it does

When a user clicks "Create from Source" in the collection view, this action:

1. Gets the parent document's document type
2. Discovers allowed child document types and their blueprints (grouped by document type)
3. Fetches active workflows and **filters blueprints** to only those with complete workflows
4. Opens the **blueprint picker dialog** -- user selects a document type, then a blueprint
5. Opens the **source sidebar modal** -- passes the selected `blueprintId` so the modal can fetch the config and extract content
6. Receives `extractedSections` (element ID → text lookup) and `config` from the modal return value
7. Scaffolds from the selected blueprint to get default values
8. Loops over `config.map.mappings` to apply each mapping using path-based targeting, with first-write-replaces and subsequent-writes-concatenate semantics
9. Creates a new document via the Management API
10. Saves the document to properly persist it and trigger cache updates
11. Shows success/error notifications
12. Navigates to the newly created document

## Class structure

```typescript
export class UpDocEntityAction extends UmbEntityActionBase<never> {
    #documentTypeStructureRepository = new UmbDocumentTypeStructureRepository(this);
    #blueprintItemRepository = new UmbDocumentBlueprintItemRepository(this);
    #documentItemRepository = new UmbDocumentItemRepository(this);

    constructor(host: UmbControllerHost, args: UmbEntityActionArgs<never>) {
        super(host, args);
    }

    override async execute() {
        // Opens modals, discovers blueprints, creates document
    }
}
```

## Key concepts

### Modal handling with cancellation

The modal can be cancelled (clicking outside or Close button), which throws an error. This is handled gracefully:

```typescript
let modalValue;
try {
    modalValue = await umbOpenModal(this, UMB_UP_DOC_MODAL, {
        data: {
            unique: parentUnique,
            documentTypeName: selectedDocType?.documentTypeName ?? '',
            blueprintName: selectedBlueprint?.blueprintName ?? '',
            blueprintId: blueprintUnique,
        },
    });
} catch {
    // Modal was cancelled
    return;
}
```

### Destructuring modal return value

The modal returns `extractedSections` (a `Record<string, string>` keyed by element IDs like `p1-e2`) and `config` (the full `DocumentTypeConfig`):

```typescript
const { name, mediaUnique, extractedSections, config } = modalValue;

if (!mediaUnique || !name || !config) {
    return;
}
```

### Blueprint filtering via active workflows

Before opening the blueprint picker, the action fetches the list of active workflows and filters out blueprints that don't have complete workflows:

```typescript
const authContext = await this.getContext(UMB_AUTH_CONTEXT);
const token = await authContext.getLatestToken();

const activeWorkflows = await fetchActiveWorkflows(token);
const activeBlueprintIds = new Set(activeWorkflows.blueprintIds);

// Only include blueprints that have complete workflows
const workflowBlueprints = blueprints.filter((bp) => activeBlueprintIds.has(bp.unique));
```

This means editors only see blueprints where an admin has fully configured the workflow (destination + map + at least one source). If no workflows match any allowed child type, a warning notification is shown and the action exits early.

### Config-driven mapping loop with field tracking

The action loops over `config.map.mappings` and applies each mapping. A `mappedFields` Set tracks which destination fields have already been written:

```typescript
const mappedFields = new Set<string>();

for (const mapping of config.map.mappings) {
    if (mapping.enabled === false) continue;

    const sectionValue = extractedSections[mapping.source];
    if (!sectionValue) continue;

    for (const dest of mapping.destinations) {
        this.#applyDestinationMapping(values, dest, sectionValue, config, mappedFields);
    }
}
```

### Multi-element field handling

When multiple source elements map to the same destination field (e.g., a title split across two PDF lines), the `mappedFields` Set controls the behavior:

- **First write** to a field: **replaces** the blueprint default value
- **Subsequent writes** to the same field: **concatenates** with a space separator

```typescript
if (existing) {
    if (mappedFields.has(alias)) {
        // Already written — concatenate
        const currentValue = typeof existing.value === 'string' ? existing.value : '';
        existing.value = `${currentValue} ${transformedValue}`;
    } else {
        // First write — replace the blueprint default
        existing.value = transformedValue;
    }
} else {
    values.push({ alias, value: transformedValue });
}
mappedFields.add(alias);
```

This prevents blueprint defaults from being prepended to mapped values while still allowing multi-element concatenation.

### Destination mapping with block disambiguation

The `#applyDestinationMapping` method handles three cases:

1. **Block property with `blockKey`** — looks up the specific block instance in `destination.json` by key, retrieves its `identifyBy` matcher, then calls `#applyBlockGridValue` to find and update the correct block in the scaffold
2. **Simple field** — direct property alias (e.g., `"pageTitle"`)
3. **Dot-path block property** (legacy) — `"gridKey.blockKey.propertyKey"` format for backwards compatibility

```typescript
#applyDestinationMapping(values, dest, sectionValue, config, mappedFields) {
    // 1. Block property with blockKey — find specific block instance
    if (dest.blockKey) {
        // Look up block in destination config by key → get identifyBy → apply
    }

    // 2. Simple field: "pageTitle"
    if (pathParts.length === 1) { ... }

    // 3. Legacy dot-path: "contentGrid.itineraryBlock.richTextContent"
    if (pathParts.length === 3) { ... }
}
```

See [Mapping Directions](../mapping-directions.md) for details on how block disambiguation works in each mapping direction.

### Block grid value application

The `#applyBlockGridValue` method finds a block within a block grid by searching for a property value match, then writes the extracted content. It uses `mappedFields` with a compound key (`${block.key}:${targetProperty}`) to track writes — first write replaces the blueprint default, subsequent writes concatenate with newline:

```typescript
#applyBlockGridValue(
    values: Array<{ alias: string; value: unknown }>,
    gridAlias: string,
    blockSearch: { property: string; value: string },
    targetProperty: string,
    value: string,
    convertMarkdown: boolean | undefined,
    mappedFields: Set<string>
) {
    // Find block by identifyBy matcher, then:
    const fieldKey = `${block.key}:${targetProperty}`;
    if (mappedFields.has(fieldKey)) {
        // Concatenate with newline
        targetValue.value = `${currentValue}\n${value}`;
    } else {
        // First write — replace blueprint default
        targetValue.value = value;
    }
    mappedFields.add(fieldKey);
}
```

This allows multiple source elements mapped to the same block property (e.g., 12 bullet points → one rich text field) to assemble into a single concatenated value.

### Content format conversion

After all mappings are applied, `#convertRichTextFields` processes field values based on the destination field type (from `destination.json`):

- **`richText` fields**: Markdown is converted to HTML using `markdownToHtml` and wrapped in `buildRteValue`
- **`text` / `textArea` fields**: Markdown formatting is stripped using `stripMarkdown` (removes heading prefixes like `#`, bold markers, bullet prefixes, etc.)

This applies to both top-level document properties and block-level properties within the block grid.

### Scaffolding from blueprint

The scaffold endpoint returns the blueprint's default values including pre-populated block grids:

```typescript
const scaffoldResponse = await fetch(
    `/umbraco/management/api/v1/document-blueprint/${blueprintUnique}/scaffold`,
    { headers: { Authorization: `Bearer ${token}` } }
);
const scaffold = await scaffoldResponse.json();
```

### Authentication for API calls

Umbraco uses bearer token authentication for Management API calls:

```typescript
const authContext = await this.getContext(UMB_AUTH_CONTEXT);
const token = await authContext.getLatestToken();

const response = await fetch(url, {
    headers: {
        Authorization: `Bearer ${token}`,
    },
});
```

## Imports

```typescript
import { UMB_UP_DOC_MODAL } from './up-doc-modal.token.js';
import { UMB_BLUEPRINT_PICKER_MODAL } from './blueprint-picker-modal.token.js';
import type { DocumentTypeOption } from './blueprint-picker-modal.token.js';
import type { DocumentTypeConfig, MappingDestination } from './workflow.types.js';
import { fetchActiveWorkflows } from './workflow.service.js';
import { markdownToHtml, buildRteValue, stripMarkdown } from './transforms.js';
import { UmbEntityActionBase } from '@umbraco-cms/backoffice/entity-action';
import { umbOpenModal } from '@umbraco-cms/backoffice/modal';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UmbDocumentTypeStructureRepository } from '@umbraco-cms/backoffice/document-type';
import { UmbDocumentBlueprintItemRepository } from '@umbraco-cms/backoffice/document-blueprint';
import { UmbDocumentItemRepository } from '@umbraco-cms/backoffice/document';
```

## Data flow

1. `this.args.unique` -- Parent document ID (from the collection view context)
2. Action fetches parent document to get its document type unique
3. Action discovers allowed child document types and their blueprints
4. Fetches active workflows, filters blueprints to only those with complete workflows
5. Blueprint picker dialog returns `{ blueprintUnique, documentTypeUnique }`
6. Source sidebar modal receives `{ unique, documentTypeName, blueprintName, blueprintId }` and returns `{ name, mediaUnique, extractedSections, config }`
7. Scaffolds from selected blueprint to get default values
8. Loops over `config.map.mappings`, applying each to scaffold values (first write replaces, subsequent writes concatenate)
9. POSTs to create document API
10. Fetches and saves the document to properly persist it
11. Shows notification and navigates to the new document

### Navigation after creation

After successfully creating the document, the action navigates to the new document with a short delay:

```typescript
if (newDocumentId) {
    const newPath = `/umbraco/section/content/workspace/document/edit/${newDocumentId}`;
    setTimeout(() => {
        window.location.href = newPath;
    }, 150);
}
```

The delay helps avoid race condition errors with Block Preview that can occur during rapid navigation.

## Default export

The class is exported both as named and default export -- the default export is what the manifest's `api` loader expects.
