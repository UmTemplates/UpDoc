---
title: "MarkdownExtractionService.cs"
---


Service that extracts structured sections from Markdown files using strategy-based extraction.

## What it does

Reads a Markdown file from disk, splits it into lines, and applies extraction strategies defined in a `SourceConfig` to produce named sections. Returns the same `ExtractionResult` as the PDF extraction service, making source types interchangeable.

## Interface

```csharp
public interface IMarkdownExtractionService
{
    ExtractionResult ExtractSectionsFromConfig(string filePath, SourceConfig sourceConfig);
}
```

## Extraction Strategies

| Strategy | Implementation |
|----------|---------------|
| `firstHeading` | Finds the first line matching `#{level} ` prefix. Returns heading text without the `#` prefix. |
| `firstParagraph` | Finds the first non-empty, non-heading line after a heading. Returns the text. |
| `betweenPatterns` | Scans lines, starts capturing at `startPattern` regex, stops at any `stopPatterns` regex. Respects `includeStartLine`. |
| `regex` | Matches a regex pattern against each line. Returns the first match (supports capture groups). |

### Key difference from PDF extraction

Markdown is already structured text — no PdfPig, no column detection, no font analysis needed. The service is simple line-based text parsing (~170 lines).

## Strategy Parameters

### firstHeading

- `level` (int) — Heading level to match (1 = `#`, 2 = `##`, etc.). Default: 1.

### betweenPatterns

- `startPattern` (string) — Regex to match the start line
- `stopPatterns` (string[]) — Regexes that stop capturing when matched
- `includeStartLine` (bool) — Whether to include the matched start line. Default: true.

### regex

- `pattern` (string) — Regex pattern to match
- `flags` (string) — Regex flags (e.g. `"i"` for case-insensitive)
- `captureGroup` (int) — Which capture group to return. Default: 0 (full match).

## Registration

Registered as scoped via `UpDocComposer`:

```csharp
builder.Services.AddScoped<IMarkdownExtractionService, MarkdownExtractionService>();
```

## Dependencies

- `ILogger<MarkdownExtractionService>` — for logging extraction progress and errors

## Namespace

```csharp
namespace UpDoc.Services;
```
