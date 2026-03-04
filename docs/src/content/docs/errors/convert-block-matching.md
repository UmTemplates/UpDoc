---
title: "Block property conversion skipped when source content differs from blueprint label"
---


## Symptom

After creating a document from source (PDF, Markdown, or Web), block properties contain raw markdown instead of properly converted content:

- **Title fields** show markdown heading markup (e.g. `## What We Will See` instead of `What We Will See`)
- **Rich text fields** show markdown bullet syntax on a single line (e.g. `- Item 1 - Item 2 - Item 3`) instead of rendered HTML bullet lists
- **TextArea fields** retain markdown formatting characters

Other blocks in the same document may work correctly.

## Cause

The content creation pipeline has two passes:

1. **Apply pass** — writes mapped source values into block properties (matches blocks by `contentTypeKey`)
2. **Convert pass** — transforms values based on field type: `stripMarkdown()` for text/textArea, `markdownToHtml()` for richText

The bug was in the **convert pass**. It matched blocks using `identifyBy` — a text search that looks for the blueprint's original label value inside the block's title property. For example, a block labelled "Sights" in the blueprint would be matched by searching for the string `"Sights"` in `featurePropertyFeatureTitle`.

The problem: by the time the convert pass runs, the apply pass has **already overwritten** the title with the source content (e.g. `"## What We Will See"`). Since `"## What We Will See"` does not contain `"Sights"`, the block is not matched and the conversion is skipped entirely.

### Why it was latent

Existing blocks worked by coincidence — their source PDF section headings happened to match the blueprint labels:

| Blueprint label | Source section heading | Contains label? | Result |
|----------------|----------------------|-----------------|--------|
| Features | Features | Yes | Worked |
| Accommodation | Accommodation | Yes | Worked |
| Itinerary | Itinerary | Yes | Worked |
| **Sights** | **What We Will See** | **No** | **Broken** |

Any block where the source heading differs from the blueprint label would trigger this bug.

## Fix

Changed the convert pass to match blocks by `contentTypeKey` (element type GUID) instead of `identifyBy` text search. This is the same stable matching strategy already used by the apply pass.

`contentTypeKey` is the GUID of the element type (e.g. `featureRichTextEditorSights`), which is the same in the blueprint, the destination config, and any created document. It does not depend on the content of any property.

### Files changed

- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/up-doc-action.ts` — entity action bridge (tree context menu)
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/up-doc-collection-action.element.ts` — collection action bridge (primary code path)

### Before

```typescript
const matched = destBlock.identifyBy
    ? (() => {
        const searchVal = block.values?.find((v) => v.alias === destBlock.identifyBy!.property);
        return searchVal &&
            typeof searchVal.value === 'string' &&
            searchVal.value.toLowerCase().includes(destBlock.identifyBy!.value.toLowerCase());
    })()
    : block.key === destBlock.key;
```

### After

```typescript
const matched = destBlock.contentTypeKey
    ? block.contentTypeKey === destBlock.contentTypeKey
    : block.key === destBlock.key;
```

## Lesson learned

The apply pass and convert pass must use the **same matching strategy**. When values are modified between passes, any matching strategy that depends on property values will be unreliable. Use stable identifiers (`contentTypeKey`) that don't change based on content.

This reinforces the existing project rule: **match blocks by `contentTypeKey`, NOT instance `key` or property values.**
