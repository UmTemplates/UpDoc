# workflow.types.ts

TypeScript interfaces for the three-file configuration architecture. These types mirror the C# models for type-safe handling on the frontend.

## What it does

Defines the TypeScript shape of the three configuration files (`source.json`, `destination.json`, `map.json`) and the combined `DocumentTypeConfig` returned by the API. Used by the workflow service, modal, and entity action.

## Three-File Architecture

UpDoc uses a three-file configuration system:

| File | Purpose | TypeScript Type |
|------|---------|-----------------|
| `source.json` | HOW to extract sections from source documents | `SourceConfig` |
| `destination.json` | WHAT fields are available in the target document type | `DestinationConfig` |
| `map.json` | WIRING between source sections and destination fields | `MapConfig` |

## Source Config Types (source.json)

```typescript
export interface SourceConfig {
    version: string;
    sourceTypes: string[];           // e.g. ["pdf"]
    globals?: SourceGlobals;
    sections: SourceSection[];
}

export interface SourceGlobals {
    columnDetection?: ColumnDetectionConfig;
    pageRange?: PageRangeConfig;
}

export interface SourceSection {
    key: string;                     // Unique identifier referenced in map.json
    label: string;                   // Human-readable name for UI
    description?: string;
    strategy: ExtractionStrategy;    // Extraction algorithm
    outputFormat: 'text' | 'markdown' | 'html';
    required?: boolean;
    pages?: number[] | 'all';
    columnFilter?: boolean;
    occurrence?: 'first' | 'last' | 'all';
    strategyParams?: StrategyParams;
}

export type ExtractionStrategy =
    | 'largestFont'      // Text at/above font size threshold
    | 'regex'            // Pattern matching
    | 'betweenPatterns'  // Content between start/stop markers
    | 'region'           // Bounding box extraction
    | 'afterLabel'       // Text following a label
    | 'firstHeading'     // First heading at specified level (markdown)
    | 'firstParagraph'   // First paragraph after a heading (markdown)
    | 'cssSelector'      // CSS selector (web)
    | 'xpath';           // XPath expression (web/Word)
```

### Strategy Parameters

```typescript
export interface StrategyParams {
    // largestFont
    fontSizeThreshold?: number;

    // regex
    pattern?: string;
    flags?: string;
    captureGroup?: number;

    // betweenPatterns
    startPattern?: string;
    stopPatterns?: string[];
    includeStartLine?: boolean;
    headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    // region
    region?: RegionConfig;

    // firstHeading (markdown)
    level?: number;

    // afterLabel
    label?: string;
    labelPattern?: string;
    extractMode?: 'sameLine' | 'nextLine' | 'untilBlank';

    // cssSelector (web)
    selector?: string;
    attribute?: string;

    // xpath (web/Word)
    xpath?: string;
}
```

## Destination Config Types (destination.json)

```typescript
export interface DestinationConfig {
    version: string;
    documentTypeAlias: string;
    documentTypeName?: string;
    blueprintId?: string;
    blueprintName?: string;
    fields: DestinationField[];
    blockGrids?: DestinationBlockGrid[];
}

export interface DestinationField {
    key: string;              // Key used in map.json target paths
    alias: string;            // Umbraco property alias
    label: string;
    description?: string;
    type: FieldType;
    tab?: string;
    mandatory?: boolean;
    acceptsFormats?: ContentFormat[];
}

export interface DestinationBlockGrid {
    key: string;              // Key used in map.json (e.g. "contentGrid")
    alias: string;            // Umbraco property alias
    label: string;
    blocks: DestinationBlock[];
}

export interface DestinationBlock {
    key: string;              // Key used in map.json (e.g. "itineraryBlock")
    contentTypeAlias: string;
    label: string;
    identifyBy?: BlockIdentifier;    // How to find this block instance
    properties?: BlockProperty[];
}

export interface BlockIdentifier {
    property: string;         // Property alias to search
    value: string;            // Value to match (case-insensitive)
}
```

## Map Config Types (map.json)

```typescript
export interface MapConfig {
    version: string;
    name?: string;
    description?: string;
    mappings: SectionMapping[];
}

export interface SectionMapping {
    source: string;                  // Key from source.json section
    destinations: MappingDestination[];
    enabled?: boolean;               // Set false to skip this mapping
    comment?: string;
}

export interface MappingDestination {
    target: string;                  // Property alias (see below)
    blockKey?: string;               // Block instance key for disambiguation
    transforms?: MappingTransform[];
}

export interface MappingTransform {
    type: TransformType;
    params?: TransformParams;
}

export type TransformType =
    | 'convertMarkdownToHtml'
    | 'convertHtmlToMarkdown'
    | 'truncate'
    | 'template'
    | 'regex'
    | 'trim'
    | 'uppercase'
    | 'lowercase'
    | 'stripHtml';
```

### Target Syntax

| Pattern | Example | Meaning |
|---------|---------|---------|
| Simple field | `{ target: "pageTitle" }` | Direct property on document |
| Block property | `{ target: "richTextContent", blockKey: "67f05ceb-..." }` | Property within a specific block instance |
| Block property (legacy) | `{ target: "contentGrid.itineraryBlock.richTextContent" }` | Dot-path format (backwards compat) |

When `blockKey` is present, the bridge code looks up the block instance in `destination.json` to find its `identifyBy` matcher, then uses that to locate the correct block in the scaffold at content creation time. See [Mapping Directions](../mapping-directions.md) for details on how disambiguation works.

## Combined Document Type Config

The API returns all three configs bundled together:

```typescript
export interface DocumentTypeConfig {
    folderPath: string;              // Path to config folder
    documentTypeAlias: string;
    sources: Record<string, SourceConfig>;  // Keyed by source type (e.g. "pdf", "markdown")
    destination: DestinationConfig;
    map: MapConfig;
}
```

## API Response Type

```typescript
export interface ExtractSectionsResponse {
    sections: Record<string, string>;  // Extracted sections keyed by source key
    config: DocumentTypeConfig;        // Full config for property mapping
}
```

The `ExtractSectionsResponse` is returned by the `/updoc/extract-sections` endpoint. It bundles extracted section values with the full config so the action can apply mappings client-side.

## JSON Schema Validation

Each configuration file type has a corresponding JSON Schema for editor validation and IntelliSense support:

| Config File | Schema Location |
|-------------|-----------------|
| `*-source-*.json` | `App_Plugins/UpDoc/schemas/source.schema.json` |
| `*-destination-*.json` | `App_Plugins/UpDoc/schemas/destination.schema.json` |
| `*-map.json` | `App_Plugins/UpDoc/schemas/map.schema.json` |

### Using Schemas

Add a `$schema` property to your config files for validation:

```json
{
  "$schema": "relative/path/to/schemas/source.schema.json",
  "version": "1.0",
  ...
}
```

The path should be relative from your config file to the schemas folder in `App_Plugins/UpDoc/schemas/`.

!!! note
    The schema files contain `$id` properties with `https://updoc.dev/schemas/...` URLs. These are canonical identifiers for the schemas, but the actual schema files are local. Always use relative paths in your `$schema` references.

## Section Rule Types

Types for the rules engine that powers the Shape layer (Extract → **Shape** → Map).

### Rule Condition Types

```typescript
export type RuleConditionType =
    | 'textBeginsWith' | 'textEndsWith' | 'textContains' | 'textMatchesPattern'
    | 'fontSizeEquals' | 'fontSizeRange' | 'fontSizeAbove' | 'fontSizeBelow'
    | 'fontNameContains'
    | 'colorEquals'
    | 'isBoldEquals'
    | 'htmlTagEquals' | 'cssClassContains' | 'htmlContainerPathContains'
    | 'positionFirst' | 'positionLast';
```

| Type | Description | Value |
|------|-------------|-------|
| `fontSizeEquals` | Font size matches within 0.5pt tolerance | number |
| `fontSizeRange` | Font size within min/max range (inclusive) | `{ min: number, max: number }` |
| `fontSizeAbove` | Font size greater than value | number |
| `fontSizeBelow` | Font size less than value | number |
| `fontNameContains` | Font name contains value (case-sensitive) | string |
| `colorEquals` | Color hex matches | string |
| `isBoldEquals` | Element is bold (true/false) | boolean |
| `htmlTagEquals` | HTML tag name matches (web sources) | string |
| `cssClassContains` | CSS class list contains value (web sources) | string |
| `htmlContainerPathContains` | HTML container path contains value (web sources) | string |
| `positionFirst` | First element in section | (none) |
| `positionLast` | Last element in section | (none) |
| `textBeginsWith` | Element text starts with value | string |
| `textEndsWith` | Element text ends with value | string |
| `textContains` | Element text contains value | string |
| `textMatchesPattern` | Element text matches regex | regex string |

The `fontSizeRange` condition is preferred over `fontSizeEquals` for cross-PDF compatibility, since font metrics can vary by 1-3 points across PDFs from the same template.

### Text Replacement

```typescript
export type FindType = 'textBeginsWith' | 'textEndsWith' | 'textContains';
export type ReplaceType = 'replaceWith' | 'replaceAll';

export interface TextReplacement {
    findType: FindType;
    find: string;
    replaceType: ReplaceType;
    replace: string;
}
```

Text replacements are applied to matched element text before formatting. Each rule's `textReplacements` array is processed in order. The `findType` determines matching behavior:

- `textBeginsWith` — replaces only at the start of the text
- `textEndsWith` — replaces only at the end of the text
- `textContains` — replaces all occurrences

The `replaceType` adapts automatically based on `findType` in the UI.

## Transform Result Types

Types for the transform pipeline output (Extract → Shape → Map).

### TransformResult

```typescript
export interface TransformResult {
    version: string;
    areas: TransformArea[];
    diagnostics: TransformDiagnostics;
}
```

### TransformArea

```typescript
export interface TransformArea {
    name: string;
    color?: string;
    page: number;
    sortOrder?: number | null;     // User-defined sort order. Null = document order.
    groups: TransformGroup[];
    sections: TransformedSection[];
}
```

### TransformedSection

```typescript
export interface TransformedSection {
    id: string;
    stableKey?: string;
    originalHeading?: string;
    heading?: string;
    content: string;
    description?: string;
    summary?: string;
    pattern: string;
    page: number;
    areaColor?: string;
    areaName?: string;
    groupName?: string;
    ruleName?: string;
    childCount: number;
    included: boolean;
    sortOrder?: number | null;     // User-defined sort order within area. Null = document order.
}
```

The `sortOrder` property on both `TransformArea` and `TransformedSection` enables user-controlled ordering. When null, items render in document order (the order they appear in the source). When set, items are sorted by this value ascending. Sort order is persisted in `transform.json` and preserved across re-transforms.

## Key Concepts

### Separation of Concerns

- **source.json**: Defines extraction logic (strategies, patterns)
- **destination.json**: Documents available targets (fields, blocks)
- **map.json**: Pure relational mapping (no extraction logic, no field metadata)

### Used By

- `workflow.service.ts` -- Return types for `fetchConfig()` and `extractSections()`
- `up-doc-modal.token.ts` -- `DocumentTypeConfig` is part of `UmbUpDocModalValue`
- `up-doc-action.ts` -- Uses `config.map.mappings` and `config.destination.blockGrids`
- `up-doc-modal.element.ts` -- Stores `DocumentTypeConfig` as component state

## Imports

This file has no imports -- it defines only interfaces and types.
