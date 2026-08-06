using System.Text.Json.Serialization;

namespace UpDoc.Models;

// Response shapes that were previously anonymous objects.
//
// An anonymous type cannot be named in [ProducesResponseType], so Swagger had
// nothing to describe and generated clients produced void. Naming them is what
// makes #138 possible for these endpoints.
//
// The JSON is deliberately unchanged - every property name here matches the
// anonymous object it replaces, so no consumer sees a difference.

/// <summary>
/// Document types and blueprints that have a complete workflow, so the backoffice
/// knows where to offer "Create from Source".
/// </summary>
public class ActiveWorkflowsResponse
{
    [JsonPropertyName("documentTypeAliases")]
    public string[] DocumentTypeAliases { get; set; } = [];

    [JsonPropertyName("blueprintIds")]
    public string[] BlueprintIds { get; set; } = [];
}

/// <summary>Identifies a workflow after it is created or renamed.</summary>
public class WorkflowIdentityResponse
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>Folder name on disk, and the identifier every other endpoint takes.</summary>
    [JsonPropertyName("alias")]
    public string Alias { get; set; } = string.Empty;
}

/// <summary>How many mappings gained a contentTypeKey during a backfill.</summary>
public class BackfillResponse
{
    [JsonPropertyName("backfilled")]
    public int Backfilled { get; set; }
}

/// <summary>The page selection now stored in source.json.</summary>
public class PageSelectionResponse
{
    [JsonPropertyName("pages")]
    public Pages Pages { get; set; } = new();
}

/// <summary>The area names now excluded from extraction.</summary>
public class ExcludedAreasResponse
{
    [JsonPropertyName("excludedAreas")]
    public List<string> ExcludedAreas { get; set; } = [];
}

/// <summary>The container overrides now stored in source.json.</summary>
public class ContainerOverridesResponse
{
    [JsonPropertyName("containerOverrides")]
    public List<ContainerOverride> ContainerOverrides { get; set; } = [];
}

/// <summary>A document type that can be a workflow destination.</summary>
public class DocumentTypeResponse
{
    [JsonPropertyName("alias")]
    public string Alias { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    [JsonPropertyName("id")]
    public Guid Id { get; set; }
}

/// <summary>A blueprint belonging to a document type.</summary>
public class BlueprintResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string? Name { get; set; }
}

/// <summary>Raw text extracted from a PDF, before any structuring.</summary>
public class ExtractTextResponse
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }

    [JsonPropertyName("pageCount")]
    public int PageCount { get; set; }
}

/// <summary>The title and description found on a PDF's first page.</summary>
public class PagePropertiesResponse
{
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

/// <summary>A single named section pulled out of a PDF.</summary>
public class PageSectionResponse
{
    [JsonPropertyName("heading")]
    public string? Heading { get; set; }

    [JsonPropertyName("content")]
    public string? Content { get; set; }
}

/// <summary>A PDF rendered to markdown, with the raw text it came from.</summary>
public class ExtractMarkdownResponse
{
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("subtitle")]
    public string? Subtitle { get; set; }

    [JsonPropertyName("markdown")]
    public string? Markdown { get; set; }

    [JsonPropertyName("rawText")]
    public string? RawText { get; set; }
}

/// <summary>Extracted sections alongside the config that produced them.</summary>
public class ExtractSectionsResponse
{
    [JsonPropertyName("sections")]
    public Dictionary<string, string> Sections { get; set; } = [];

    [JsonPropertyName("config")]
    public DocumentTypeConfig? Config { get; set; }
}
