using System.Text.Json;
using System.Text.Json.Serialization;

namespace UpDoc.Models;

/// <summary>
/// Root model for source.json - defines how to extract named sections from source documents.
/// </summary>
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

    /// <summary>
    /// Top-level page selection for extraction. Controls which PDF pages are processed.
    /// "all" = all pages (default), [1, 2, 7] = only those pages.
    /// </summary>
    [JsonPropertyName("pages")]
    [JsonConverter(typeof(PagesConverter))]
    public Pages Pages { get; set; } = new Pages { IsAll = true };

    [JsonPropertyName("sections")]
    public List<SourceSection> Sections { get; set; } = new();

    /// <summary>
    /// Legacy: rules keyed by transform section ID. Superseded by AreaRules.
    /// </summary>
    [JsonPropertyName("sectionRules")]
    public Dictionary<string, SectionRuleSet>? SectionRules { get; set; }

    /// <summary>
    /// Rules for breaking area elements into individually-mappable sections.
    /// Keyed by area name in kebab-case (e.g., "page-header", "tour-details").
    /// Supports both old flat format { "rules": [...] } and new grouped format
    /// { "groups": [...], "rules": [...] } — backward compatible by design.
    /// </summary>
    [JsonPropertyName("areaRules")]
    public Dictionary<string, AreaRules>? AreaRules { get; set; }

    /// <summary>
    /// Areas excluded from extraction/transform output.
    /// Keyed by area name in kebab-case (e.g., "navigation", "footer").
    /// </summary>
    [JsonPropertyName("excludedAreas")]
    public List<string>? ExcludedAreas { get; set; }

    /// <summary>
    /// Resolves the list of page numbers to process, given the total page count.
    /// Returns null if all pages should be processed.
    /// </summary>
    public List<int>? ResolveIncludedPages(int totalPages)
    {
        if (Pages.IsAll || Pages.PageNumbers == null || Pages.PageNumbers.Count == 0)
            return null; // all pages

        // Filter to valid page numbers only
        return Pages.PageNumbers
            .Where(p => p >= 1 && p <= totalPages)
            .Distinct()
            .OrderBy(p => p)
            .ToList();
    }
}

/// <summary>
/// Global extraction settings that apply unless overridden per-section.
/// </summary>
public class SourceGlobals
{
    [JsonPropertyName("columnDetection")]
    public SourceColumnDetection? ColumnDetection { get; set; }

    [JsonPropertyName("pageRange")]
    public PageRangeConfig? PageRange { get; set; }
}

/// <summary>
/// Column detection settings for multi-column PDFs (source.json).
/// </summary>
public class SourceColumnDetection
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("thresholdPercent")]
    public double ThresholdPercent { get; set; } = 0.35;
}

/// <summary>
/// Default page range for extraction.
/// </summary>
public class PageRangeConfig
{
    [JsonPropertyName("start")]
    public int Start { get; set; } = 1;

    [JsonPropertyName("end")]
    [JsonConverter(typeof(PageEndConverter))]
    public PageEnd End { get; set; } = new PageEnd { IsLast = true };
}

/// <summary>
/// Represents either a page number or "last".
/// </summary>
public class PageEnd
{
    public int? PageNumber { get; set; }
    public bool IsLast { get; set; }
}

/// <summary>
/// A named section to extract from the source document.
/// </summary>
public class SourceSection
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("strategy")]
    public string Strategy { get; set; } = string.Empty;

    [JsonPropertyName("outputFormat")]
    public string OutputFormat { get; set; } = "text";

    [JsonPropertyName("required")]
    public bool Required { get; set; }

    [JsonPropertyName("pages")]
    [JsonConverter(typeof(PagesConverter))]
    public Pages Pages { get; set; } = new Pages { IsAll = true };

    [JsonPropertyName("columnFilter")]
    public bool? ColumnFilter { get; set; }

    [JsonPropertyName("occurrence")]
    public string Occurrence { get; set; } = "first";

    [JsonPropertyName("strategyParams")]
    public StrategyParams? StrategyParams { get; set; }
}

/// <summary>
/// Represents either specific page numbers or "all".
/// </summary>
public class Pages
{
    public List<int>? PageNumbers { get; set; }
    public bool IsAll { get; set; }
}

/// <summary>
/// Parameters specific to extraction strategies.
/// </summary>
public class StrategyParams
{
    // largestFont strategy
    [JsonPropertyName("fontSizeThreshold")]
    public double? FontSizeThreshold { get; set; }

    // regex strategy
    [JsonPropertyName("pattern")]
    public string? Pattern { get; set; }

    [JsonPropertyName("flags")]
    public string? Flags { get; set; }

    [JsonPropertyName("captureGroup")]
    public int? CaptureGroup { get; set; }

    // betweenPatterns strategy
    [JsonPropertyName("startPattern")]
    public string? StartPattern { get; set; }

    [JsonPropertyName("stopPatterns")]
    public List<string>? StopPatterns { get; set; }

    [JsonPropertyName("includeStartLine")]
    public bool? IncludeStartLine { get; set; }

    [JsonPropertyName("headingLevel")]
    public string? HeadingLevel { get; set; }

    // region strategy
    [JsonPropertyName("region")]
    public RegionConfig? Region { get; set; }

    // afterLabel strategy
    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("labelPattern")]
    public string? LabelPattern { get; set; }

    [JsonPropertyName("extractMode")]
    public string? ExtractMode { get; set; }

    // firstHeading strategy (markdown)
    [JsonPropertyName("level")]
    public int? Level { get; set; }

    // cssSelector strategy (web)
    [JsonPropertyName("selector")]
    public string? Selector { get; set; }

    [JsonPropertyName("attribute")]
    public string? Attribute { get; set; }

    // xpath strategy (web/Word)
    [JsonPropertyName("xpath")]
    public string? Xpath { get; set; }
}

/// <summary>
/// Bounding box region for region-based extraction.
/// </summary>
public class RegionConfig
{
    [JsonPropertyName("x")]
    public RangeConfig? X { get; set; }

    [JsonPropertyName("y")]
    public RangeConfig? Y { get; set; }

    [JsonPropertyName("unit")]
    public string Unit { get; set; } = "percent";
}

/// <summary>
/// Min/max range for region coordinates.
/// </summary>
public class RangeConfig
{
    [JsonPropertyName("min")]
    public double? Min { get; set; }

    [JsonPropertyName("max")]
    public double? Max { get; set; }
}

/// <summary>
/// JSON converter for Pages (array of ints or "all").
/// </summary>
public class PagesConverter : JsonConverter<Pages>
{
    public override Pages Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var value = reader.GetString();
            return new Pages { IsAll = value?.ToLower() == "all" };
        }

        if (reader.TokenType == JsonTokenType.StartArray)
        {
            var pages = new List<int>();
            while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
            {
                if (reader.TokenType == JsonTokenType.Number)
                {
                    pages.Add(reader.GetInt32());
                }
            }
            return new Pages { PageNumbers = pages };
        }

        return new Pages { IsAll = true };
    }

    public override void Write(Utf8JsonWriter writer, Pages value, JsonSerializerOptions options)
    {
        if (value.IsAll)
        {
            writer.WriteStringValue("all");
        }
        else if (value.PageNumbers != null)
        {
            writer.WriteStartArray();
            foreach (var page in value.PageNumbers)
            {
                writer.WriteNumberValue(page);
            }
            writer.WriteEndArray();
        }
    }
}

/// <summary>
/// JSON converter for PageEnd (int or "last").
/// </summary>
public class PageEndConverter : JsonConverter<PageEnd>
{
    public override PageEnd Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var value = reader.GetString();
            return new PageEnd { IsLast = value?.ToLower() == "last" };
        }

        if (reader.TokenType == JsonTokenType.Number)
        {
            return new PageEnd { PageNumber = reader.GetInt32() };
        }

        return new PageEnd { IsLast = true };
    }

    public override void Write(Utf8JsonWriter writer, PageEnd value, JsonSerializerOptions options)
    {
        if (value.IsLast)
        {
            writer.WriteStringValue("last");
        }
        else if (value.PageNumber.HasValue)
        {
            writer.WriteNumberValue(value.PageNumber.Value);
        }
    }
}
