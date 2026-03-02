using System.Text.Json.Serialization;

namespace UpDoc.Models;

/// <summary>
/// Result of area detection from a PDF. Contains the full hierarchy:
/// Pages → Areas → Sections → Elements.
/// Area detection is destination-agnostic — it produces a complete structural
/// representation of the source PDF regardless of mapping configuration.
/// </summary>
public class AreaDetectionResult
{
    [JsonPropertyName("totalPages")]
    public int TotalPages { get; set; }

    [JsonPropertyName("pages")]
    public List<PageAreas> Pages { get; set; } = new();

    [JsonPropertyName("diagnostics")]
    public AreaDiagnosticInfo Diagnostics { get; set; } = new();
}

/// <summary>
/// All detected areas for a single page.
/// </summary>
public class PageAreas
{
    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("areas")]
    public List<DetectedArea> Areas { get; set; } = new();
}

/// <summary>
/// A spatial area detected from a filled rectangle in the PDF.
/// Contains sections (heading groups) within the area.
/// </summary>
public class DetectedArea
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("color")]
    public string Color { get; set; } = string.Empty;

    [JsonPropertyName("boundingBox")]
    public ElementBoundingBox BoundingBox { get; set; } = new();

    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("sections")]
    public List<DetectedSection> Sections { get; set; } = new();

    [JsonPropertyName("totalElements")]
    public int TotalElements { get; set; }

    /// <summary>
    /// The section pattern used for grouping elements in this area.
    /// Null = auto-detect was used (no user-defined pattern).
    /// Present = user-defined pattern from area template.
    /// </summary>
    [JsonPropertyName("sectionPattern")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public SectionPattern? SectionPattern { get; set; }
}

/// <summary>
/// A section within an area, defined by a heading and its children.
/// Heading is null for preamble content (elements before the first heading).
/// </summary>
public class DetectedSection
{
    [JsonPropertyName("heading")]
    public AreaElement? Heading { get; set; }

    [JsonPropertyName("children")]
    public List<AreaElement> Children { get; set; } = new();
}

/// <summary>
/// A text element within an area, carrying enough metadata to understand
/// the element in its hierarchical context without cross-referencing.
/// </summary>
public class AreaElement
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("fontSize")]
    public double FontSize { get; set; }

    [JsonPropertyName("fontName")]
    public string FontName { get; set; } = string.Empty;

    [JsonPropertyName("color")]
    public string Color { get; set; } = string.Empty;

    [JsonPropertyName("boundingBox")]
    public ElementBoundingBox BoundingBox { get; set; } = new();

    /// <summary>
    /// For web sources: the actual HTML tag (e.g., "p", "div", "h2", "li").
    /// Empty for PDF/markdown sources.
    /// </summary>
    [JsonPropertyName("htmlTag")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string HtmlTag { get; set; } = string.Empty;

    /// <summary>
    /// For web sources: slash-delimited CSS selector path of ancestor containers
    /// (e.g., "div.country-banner/div.price-name-wrapper").
    /// Empty for PDF/markdown sources.
    /// </summary>
    [JsonPropertyName("htmlContainerPath")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string HtmlContainerPath { get; set; } = string.Empty;
}

/// <summary>
/// Diagnostic information about the area detection process.
/// Useful for debugging and understanding what the detector found.
/// </summary>
public class AreaDiagnosticInfo
{
    [JsonPropertyName("totalPathsFound")]
    public int TotalPathsFound { get; set; }

    [JsonPropertyName("pathsAfterFiltering")]
    public int PathsAfterFiltering { get; set; }

    [JsonPropertyName("areasDetected")]
    public int AreasDetected { get; set; }

    [JsonPropertyName("elementsInAreas")]
    public int ElementsInAreas { get; set; }
}
