# PdfPagePropertiesService.cs

Service that extracts page properties (title and description) from PDF files using font size and position analysis.

## What it does

Analyzes the first page of a PDF to extract structured page properties:

1. Opens PDF files from file path or stream
2. Extracts text with position and font size data
3. Groups words into lines by Y-coordinate
4. Identifies title from largest font text at top of page
5. Identifies description from next text block below title

## Interface

```csharp
public interface IPdfPagePropertiesService
{
    PdfPageProperties ExtractFromFile(string filePath);
    PdfPageProperties ExtractFromStream(Stream stream);
    PdfSectionResult ExtractSectionByHeading(string filePath, string headingText);
    PdfMarkdownResult ExtractAsMarkdown(string filePath);
    ExtractionResult ExtractSections(string filePath, PdfExtractionRules rules);
}
```

## Result classes

```csharp
public class PdfPageProperties
{
    public string Title { get; set; }        // Document title from largest font
    public string Description { get; set; }  // Description from text below title
    public string? Error { get; set; }       // Error message if extraction failed
}

public class PdfSectionResult
{
    public string Heading { get; set; }      // The heading that was found
    public string Content { get; set; }      // The content text extracted under the heading
    public string? Error { get; set; }       // Error message if extraction failed
}

public class PdfMarkdownResult
{
    public string Title { get; set; }        // Document title (H1)
    public string Subtitle { get; set; }     // Document subtitle/description
    public string Markdown { get; set; }     // Full content as Markdown
    public string RawText { get; set; }      // Raw text for debugging
    public string? Error { get; set; }       // Error message if extraction failed
}

public class ExtractionResult
{
    public Dictionary<string, string> Sections { get; set; } = new();  // Keyed by type: title, description, content
    public string RawText { get; set; } = string.Empty;                // Raw text with font sizes for debugging
    public string? Error { get; set; }                                 // Error message if extraction failed
}
```

## Property mapping

The extracted properties map to Umbraco page fields:

| Extracted Property | Umbraco Field(s) |
|-------------------|------------------|
| Title | Page Title, Page Title Short, Node Name |
| Description | Page Description |

## Key concepts

### Title extraction

1. Groups words into lines by Y-coordinate proximity
2. Calculates average font size per line
3. Identifies largest font size in document
4. Collects consecutive lines from top with similar large font
5. Combines into single title string

### Description extraction

1. Finds first non-title line with content
2. Collects lines with similar font size (15% tolerance)
3. Limits to 3 lines maximum
4. Combines into description string

### Font size estimation

Uses word bounding box height as a proxy for font size since PDF Pig's `GetWords()` provides reliable bounding boxes.

### Section extraction by heading

The `ExtractSectionByHeading` method extracts content from a specific section:

1. Searches all pages for a line containing the heading text (case-insensitive)
2. Captures all text lines below the heading
3. Stops when it encounters another heading (similar or larger font size)
4. Returns the heading found and the content as plain text

**Special handling for itinerary extraction:**
When the heading matches a "Day N" pattern (e.g., "Day 1"), the extraction continues through all subsequent "Day N" headings (Day 2, Day 3, etc.) until a non-Day heading is encountered. This allows extracting complete itineraries that span multiple days.

```csharp
// Example: Extract full itinerary by searching for "Day 1"
var result = _pagePropertiesService.ExtractSectionByHeading(path, "Day 1");
// Result.Content will contain Day 1, Day 2, Day 3... until end of itinerary
```

### Markdown extraction with column detection

The `ExtractAsMarkdown` method extracts the full PDF content as Markdown, with intelligent column detection for multi-column layouts common in travel brochures and itineraries:

1. Analyzes word positions to detect column boundaries
2. Merges multi-column content into a single flow
3. Identifies headings by font size and applies Markdown heading levels
4. Preserves paragraph structure with proper spacing

```csharp
// Example: Extract full PDF as Markdown
var result = _pagePropertiesService.ExtractAsMarkdown(path);
// Result.Title = "The Castles and Gardens of Kent"
// Result.Subtitle = "5 days from £889"
// Result.Markdown = "## Day 1\n\nArrive at...\n\n## Day 2\n\nVisit..."
```

### Map-driven section extraction (ExtractSections)

The `ExtractSections` method extracts structured sections from a PDF using rules defined in a `PdfExtractionRules` object (from a map file). Instead of hardcoded patterns, it uses configurable rules for title detection, description matching, content start/stop boundaries, and heading levels.

```csharp
var result = _pagePropertiesService.ExtractSections(path, mapFile.SourceTypes.Pdf.Extraction);
// result.Sections["title"] = "The Castles and Gardens of Kent"
// result.Sections["description"] = "5 days from £889"
// result.Sections["content"] = "## Day 1\n\nArrive at..."
```

The extraction process:

1. Extracts text lines from all pages (with optional column detection filtering)
2. Identifies the title using the `TitleDetection.FontSizeThreshold` ratio against the largest font
3. Matches the description using the `DescriptionPattern` regex
4. Captures content between the `Content.StartPattern` regex and any `Content.StopPatterns`
5. Formats content headings using the configured `Content.HeadingLevel` (h1-h4)
6. Returns a `Dictionary<string, string>` with keys: `title`, `description`, `content`

The private `ExtractSectionsFromDocument` method implements this logic, using `Regex` objects built from the map file rules instead of the hardcoded patterns used by `ExtractAsMarkdown`.

## Usage

```csharp
public class MyController : ControllerBase
{
    private readonly IPdfPagePropertiesService _pagePropertiesService;

    public MyController(IPdfPagePropertiesService pagePropertiesService)
    {
        _pagePropertiesService = pagePropertiesService;
    }

    public IActionResult GetPageProperties(string path)
    {
        var result = _pagePropertiesService.ExtractFromFile(path);

        if (!string.IsNullOrEmpty(result.Error))
            return BadRequest(result.Error);

        return Ok(new
        {
            title = result.Title,
            description = result.Description
        });
    }
}
```

### Rule condition matching (MatchesCondition)

The static `MatchesCondition` method evaluates a single rule condition against a PDF element. Used by `ContentTransformService` during the Shape layer to determine which rule matches each element.

```csharp
public static bool MatchesCondition(PdfElement element, RuleCondition condition, int index, int total)
```

Supported condition types:

| Type | Matching Logic |
|------|----------------|
| `fontSizeEquals` | `Math.Abs(element.FontSize - value) <= 0.5` |
| `fontSizeRange` | `fontSize >= min && fontSize <= max` (parses `{ min, max }` JSON object) |
| `fontSizeAbove` | `element.FontSize > value` |
| `fontSizeBelow` | `element.FontSize < value` |
| `fontNameContains` | Case-insensitive substring match on font name |
| `colorEquals` | Case-insensitive hex color comparison |
| `isBoldEquals` | Compares `element.IsBold` to parsed boolean value |
| `htmlTagEquals` | Case-insensitive match on `element.HtmlTag` |
| `cssClassContains` | Case-insensitive substring match on `element.CssClasses` |
| `htmlContainerPathContains` | Case-insensitive substring match on `element.ContainerPath` |
| `positionFirst` | `index == 0` |
| `positionLast` | `index == total - 1` |
| `textBeginsWith` | Case-insensitive `StartsWith` on element text |
| `textEndsWith` | Case-insensitive `EndsWith` on element text |
| `textContains` | Case-insensitive `Contains` on element text |
| `textMatchesPattern` | Regex match on element text |

The `fontSizeRange` condition accepts a JSON object `{ "min": 9, "max": 13 }` and is preferred over `fontSizeEquals` for cross-PDF compatibility, since font metrics can vary by 1-3 points across PDFs from the same template.

## Registration

Registered via `UpDocComposer` as a scoped service.
