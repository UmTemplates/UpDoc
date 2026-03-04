---
title: "up-doc-collection-action.element.ts"
---


A custom Lit element that renders a "Create from Source" button in the collection toolbar, next to the existing "Create [DocType]" button.

## What it does

When a user is viewing a document collection (e.g., Group Tours list view), this element:

1. Uses `UMB_DOCUMENT_WORKSPACE_CONTEXT` to get the current parent document and its document type
2. Checks whether any allowed child types have blueprints with complete workflows
3. If workflows exist, renders a "Create from Source" button
4. On click, runs the same flow as the entity action: blueprint picker → source sidebar → scaffold → map → create document

## Why a custom element (not an API class)

Umbraco's collection action system supports two patterns:
- **`api`** — a class extending `UmbCollectionActionBase` (for simple execute/getHref)
- **`element`** — a custom Lit element for full control over rendering

We use the `element` approach because:
- We need to **conditionally render** (hide the button when no workflows exist)
- We need to access `UMB_DOCUMENT_WORKSPACE_CONTEXT` for the parent document info
- Umbraco's own "Create Group Tour" button uses this same pattern

## Visibility

The button is self-hiding. Instead of using a custom condition (which would need `UMB_ENTITY_CONTEXT` — not available in collection context), the element:
1. Consumes `UMB_DOCUMENT_WORKSPACE_CONTEXT` to get the document type
2. Fetches active workflows
3. Checks if any allowed child types have workflow blueprints
4. Sets `_hasWorkflows = true` only if workflows exist
5. The `render()` method returns empty HTML when `_hasWorkflows` is false

## Manifest registration

```typescript
{
    type: 'collectionAction',
    kind: 'button',
    alias: 'UpDoc.CollectionAction',
    name: 'UpDoc Collection Action',
    element: () => import('./up-doc-collection-action.element.js'),
    weight: 50,
    meta: {
        label: 'Create from Source',
    },
    conditions: [
        {
            alias: 'Umb.Condition.CollectionAlias',
            match: 'Umb.Collection.Document',
        },
    ],
}
```

The `Umb.Condition.CollectionAlias` condition ensures it only appears on document collections (not media, members, etc.). The `weight: 50` places it after Umbraco's own create button (weight 100).

## Document creation and mapping

The collection action contains the full document creation pipeline:

1. Scaffolds a document from the selected blueprint
2. Deep-clones scaffold values
3. Iterates through `config.map.mappings`, applying each to the cloned values
4. Creates the document via Umbraco Management API POST
5. Immediately saves (PUT) to persist and trigger cache updates

### Destination mapping with block disambiguation

`#applyDestinationMapping` handles three cases:

1. **Block property with `blockKey`** — looks up the specific block instance in `destination.json` by key, retrieves its `identifyBy` matcher, then calls `#applyBlockGridValue`
2. **Simple field** — direct property alias (e.g., `"pageTitle"`)
3. **Legacy dot-path** — `"gridKey.blockKey.propertyKey"` format for backwards compat

### Content format conversion

After all mappings are applied, `#convertRichTextFields` processes field values based on the destination field type (from `destination.json`):

- **`richText` fields**: Markdown is converted to HTML using `markdownToHtml` and wrapped in `buildRteValue`
- **`text` / `textArea` fields**: Markdown formatting is stripped using `stripMarkdown` (removes heading prefixes like `#`, bold markers, bullet prefixes, etc.)

This applies to both top-level document properties and block-level properties within the block grid.

### Concatenation tracking

`mappedFields` (a `Set<string>`) tracks which fields have been written. First write replaces the blueprint default; subsequent writes concatenate:
- **Top-level fields**: key = alias (e.g., `"pageTitle"`), concatenated with space
- **Block properties**: key = `${block.key}:${propertyAlias}` (e.g., `"abc-123:richTextContent"`), concatenated with newline

This allows multiple source elements mapped to the same destination to assemble into one value (e.g., 12 bullet points → one rich text field).

## Relationship to up-doc-action.ts

The collection action duplicates the document creation logic from `up-doc-action.ts`. Both files contain:
- Blueprint discovery and filtering
- Modal opening (blueprint picker + source sidebar)
- Scaffolding from blueprint
- Property mapping (`#applyDestinationMapping`, `#applyBlockGridValue`)
- Concatenation tracking via `mappedFields`
- Document creation and save

This duplication exists because the entity action extends `UmbEntityActionBase` while the collection action extends `UmbLitElement` — they have different base classes and lifecycle patterns. A future refactoring could extract the shared logic into a service module.

**IMPORTANT:** When modifying mapping or bridge logic, changes must be applied to BOTH files. The collection action is the primary code path used by the "Create from Source" button in content collection views.

## Key difference from entity action

The entity action uses `this.args.unique` (from `UmbEntityActionArgs`) for the parent document ID. The collection action uses `UMB_DOCUMENT_WORKSPACE_CONTEXT` which provides `unique` and `contentTypeUnique` observables.
