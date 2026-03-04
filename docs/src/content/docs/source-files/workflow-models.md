---
title: "C# Configuration Models"
---


Strongly-typed C# classes for deserializing the three-file configuration architecture. The models are split across multiple files in the `UpDoc.Models` namespace.

## Three-File Architecture

UpDoc uses a three-file configuration system stored in `updoc/workflows/{docType}/`:

| File | C# Model | Purpose |
|------|----------|---------|
| `source.json` | `SourceConfig` | HOW to extract sections from source documents |
| `destination.json` | `DestinationConfig` | WHAT fields are available in the target document type |
| `map.json` | `MapConfig` | WIRING between source sections and destination fields |

All three are loaded and bundled into `DocumentTypeConfig` by the `WorkflowService`.

---

## SourceConfig.cs (source.json)

Defines how to extract named sections from source documents using strategy-based extraction.

### Root Model

```csharp
public class SourceConfig
{
    [JsonPropertyName("$schema")]
    public string? Schema { get; set; }

    [JsonPropertyName("version")]
    public string Version { get; set; } = "1.0";

    [JsonPropertyName("sourceTypes")]
    public List<string> SourceTypes { get; set; } = new() { "pdf" };

    [JsonPropertyName("globals")]
    public SourceGlobals? Globals { get; set; }

    [JsonPropertyName("sections")]
    public List<SourceSection> Sections { get; set; } = new();
}
```

### SourceSection

Each section defines what to extract and how:

```csharp
public class SourceSection
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;      // Referenced in map.json

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;    // UI display name

    [JsonPropertyName("strategy")]
    public string Strategy { get; set; } = string.Empty; // Extraction algorithm

    [JsonPropertyName("outputFormat")]
    public string OutputFormat { get; set; } = "text";   // text, markdown, or html

    [JsonPropertyName("required")]
    public bool Required { get; set; }

    [JsonPropertyName("pages")]
    [JsonConverter(typeof(PagesConverter))]
    public Pages Pages { get; set; } = new Pages { IsAll = true };

    [JsonPropertyName("columnFilter")]
    public bool? ColumnFilter { get; set; }

    [JsonPropertyName("strategyParams")]
    public StrategyParams? StrategyParams { get; set; }
}
```

### Extraction Strategies

| Strategy | Purpose | Key Params |
|----------|---------|------------|
| `largestFont` | Text at/above font size threshold | `fontSizeThreshold` |
| `regex` | Pattern matching | `pattern`, `flags`, `captureGroup` |
| `betweenPatterns` | Content between start/stop markers | `startPattern`, `stopPatterns`, `headingLevel` |
| `region` | Bounding box extraction | `region: { x, y, unit }` |
| `afterLabel` | Text following a label | `label`, `labelPattern`, `extractMode` |
| `firstHeading` | First heading at level (markdown) | `level` |
| `firstParagraph` | First paragraph after heading (markdown) | -- |
| `cssSelector` | CSS selector (web) | `selector`, `attribute` |
| `xpath` | XPath expression (web/Word) | `xpath` |

### Custom JSON Converters

- `PagesConverter` - Handles `pages` as either `[1, 2, 3]` or `"all"`
- `PageEndConverter` - Handles `end` as either a number or `"last"`

---

## DestinationConfig.cs (destination.json)

Documents available target fields in the Umbraco document type. This is the contract for what can be mapped to.

### Root Model

```csharp
public class DestinationConfig
{
    [JsonPropertyName("$schema")]
    public string? Schema { get; set; }

    [JsonPropertyName("version")]
    public string Version { get; set; } = "1.0";

    [JsonPropertyName("documentTypeAlias")]
    public string DocumentTypeAlias { get; set; } = string.Empty;

    [JsonPropertyName("documentTypeName")]
    public string? DocumentTypeName { get; set; }

    [JsonPropertyName("blueprintId")]
    public string? BlueprintId { get; set; }

    [JsonPropertyName("blueprintName")]
    public string? BlueprintName { get; set; }

    [JsonPropertyName("fields")]
    public List<DestinationField> Fields { get; set; } = new();

    [JsonPropertyName("blockGrids")]
    public List<DestinationBlockGrid>? BlockGrids { get; set; }
}
```

### Block Grid Structure

```csharp
public class DestinationBlockGrid
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;     // Used in map.json paths

    [JsonPropertyName("alias")]
    public string Alias { get; set; } = string.Empty;   // Umbraco property alias

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("blocks")]
    public List<DestinationBlock> Blocks { get; set; } = new();
}

public class DestinationBlock
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;      // Used in map.json paths

    [JsonPropertyName("contentTypeAlias")]
    public string ContentTypeAlias { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("identifyBy")]
    public BlockIdentifier? IdentifyBy { get; set; }     // How to find this block

    [JsonPropertyName("properties")]
    public List<BlockProperty>? Properties { get; set; }
}

public class BlockIdentifier
{
    [JsonPropertyName("property")]
    public string Property { get; set; } = string.Empty;  // Property to search

    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;     // Value to match
}
```

---

## MapConfig.cs (map.json)

Pure relational mapping between source sections and destination fields. Contains no extraction logic or field metadata.

### Root Model

```csharp
public class MapConfig
{
    [JsonPropertyName("$schema")]
    public string? Schema { get; set; }

    [JsonPropertyName("version")]
    public string Version { get; set; } = "1.0";

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("mappings")]
    public List<SectionMapping> Mappings { get; set; } = new();
}
```

### Mapping Structure

```csharp
public class SectionMapping
{
    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;     // Key from source.json

    [JsonPropertyName("destinations")]
    public List<MappingDestination> Destinations { get; set; } = new();

    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("comment")]
    public string? Comment { get; set; }
}

public class MappingDestination
{
    [JsonPropertyName("target")]
    public string Target { get; set; } = string.Empty;     // Target path

    [JsonPropertyName("transforms")]
    public List<MappingTransform>? Transforms { get; set; }
}
```

### Target Path Syntax

| Pattern | Example | Meaning |
|---------|---------|---------|
| Simple field | `"pageTitle"` | Direct property on document |
| Block property | `"contentGrid.itineraryBlock.richTextContent"` | blockGridKey.blockKey.propertyKey |

### Transforms

```csharp
public class MappingTransform
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("params")]
    public TransformParams? Params { get; set; }
}
```

Available transform types: `convertMarkdownToHtml`, `convertHtmlToMarkdown`, `truncate`, `template`, `regex`, `trim`, `uppercase`, `lowercase`, `stripHtml`.

---

## DocumentTypeConfig (Combined)

Container returned by `WorkflowService.GetConfigByBlueprintIdAsync()`:

```csharp
public class DocumentTypeConfig
{
    public string FolderPath { get; set; } = string.Empty;
    public string DocumentTypeAlias { get; set; } = string.Empty;
    public Dictionary<string, SourceConfig> Sources { get; set; } = new();
    public DestinationConfig Destination { get; set; } = new();
    public MapConfig Map { get; set; } = new();
}
```

The `Sources` dictionary is keyed by source type (e.g. `"pdf"`, `"markdown"`), loaded from `{folderName}-source-{type}.json` files. This is serialized to JSON and returned by the `/updoc/config/{blueprintId}` and `/updoc/extract-sections` API endpoints.

---

## WorkflowModels.cs (Legacy)

Contains extraction rule classes used for backward compatibility:

- `PdfExtractionRules` - Legacy extraction settings
- `ColumnDetectionConfig` - Column detection (duplicated in SourceConfig)
- `TitleDetectionConfig` - Title detection
- `ContentExtractionConfig` - Content extraction

These are marked for refactoring as the extraction service transitions to strategy-driven extraction based on `SourceConfig`.

---

## Key Concepts

### JSON Serialization

All properties use `[JsonPropertyName("camelCase")]` so PascalCase C# properties serialize to camelCase JSON keys.

### Cross-File Validation

The `WorkflowService` validates:

1. Every `source` in map.json exists as a `key` in at least one source config (missing keys in a specific source type are warnings, not errors, since map.json is a superset across all source types)
2. Every `target` in map.json resolves to a valid path in destination.json

### Namespace

All models are in:

```csharp
namespace UpDoc.Models;
```
