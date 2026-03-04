---
title: "transforms.ts"
---


Utility functions for converting extracted content into formats suitable for Umbraco document properties.

## What it does

Provides four exported functions for content transformation:

1. `markdownToHtml` -- converts Markdown text to HTML using the `marked` library
2. `normalizeToKebabCase` -- normalizes text to kebab-case for section IDs (mirrors C# `NormalizeToKebabCase`)
3. `stripMarkdown` -- strips Markdown formatting, returning plain text (for text/textArea fields)
4. `buildRteValue` -- wraps HTML content in the Umbraco Rich Text Editor (RTE) value structure

## Functions

### markdownToHtml

```typescript
export function markdownToHtml(markdown: string): string
```

Converts a Markdown string to HTML using the `marked` library with GitHub Flavored Markdown (GFM) enabled:

```typescript
const html = marked.parse(markdown, {
    gfm: true,      // GitHub Flavored Markdown
    breaks: false,   // Don't convert \n to <br>
});
```

**Fallback handling:**
- Returns an empty string if the input is falsy
- If `marked.parse` returns a Promise (unexpected with sync config), falls back to wrapping in `<p>` tags
- If an exception occurs, falls back to manual conversion: double newlines become `</p><p>`, single newlines become `<br>`

### normalizeToKebabCase

```typescript
export function normalizeToKebabCase(text: string): string
```

Converts text to kebab-case for use as section IDs. Mirrors the C# `NormalizeToKebabCase` in `ContentTransformService`:

- Lowercases, trims, replaces non-alphanumeric runs with hyphens, strips leading/trailing hyphens
- `"FEATURES"` → `"features"`, `"WHAT WE WILL SEE"` → `"what-we-will-see"`

### stripMarkdown

```typescript
export function stripMarkdown(markdown: string): string
```

Strips Markdown formatting from text, returning plain text. Used when mapping markdown content to plain text fields (`text`, `textArea`). Removes:

- Heading prefixes (`# ## ###`)
- Bold (`**text**`) and italic (`*text*`) markers
- Strikethrough (`~~text~~`) and inline code (`` `text` ``)
- Bullet list prefixes (`- * +`), numbered list prefixes (`1. 2.`), blockquote prefixes (`>`)

Returns an empty string if the input is falsy.

### buildRteValue

```typescript
export function buildRteValue(htmlContent: string)
```

Builds the value object expected by Umbraco's Rich Text Editor property:

```typescript
return {
    blocks: {
        contentData: [],
        settingsData: [],
        expose: [],
        Layout: {},
    },
    markup: htmlContent,
};
```

The `blocks` structure is required by Umbraco's RTE even when no blocks are used. The `markup` field contains the actual HTML content.

## Key concepts

### Extracted from action

These functions were originally the `#convertToHtml` private method on `UpDocEntityAction`. They were extracted to a separate module so both the action's `#applyBlockMapping` method and any future consumers can reuse them.

### Used together

The typical usage pattern is to pipe content through both functions:

```typescript
const htmlContent = markdownToHtml(sectionValue);
targetValue.value = buildRteValue(htmlContent);
```

This converts extracted Markdown content into the full RTE value structure expected by Umbraco's Management API.

## Imports

```typescript
import { marked } from 'marked';
```

The `marked` library is a dependency of the UpDoc npm package.

## Used by

- `up-doc-action.ts` -- `markdownToHtml`/`buildRteValue` for richText fields, `stripMarkdown` for text/textArea fields
- `up-doc-collection-action.element.ts` -- same as above (bridge files kept in sync)
- `up-doc-modal.element.ts` -- `stripMarkdown` for document name pre-fill
