using System.Text.Json.Serialization;

namespace UpDoc.Models;

/// <summary>
/// Root model for map.json - defines mappings from source sections to destination fields.
/// </summary>
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

/// <summary>
/// A single mapping from a source section to one or more destinations.
/// </summary>
public class SectionMapping
{
    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    /// <summary>
    /// Stable GUID linking this mapping to the rule/group that produced the source section.
    /// Survives section ID changes when areas/groups are restructured.
    /// </summary>
    [JsonPropertyName("sourceKey")]
    public string? SourceKey { get; set; }

    [JsonPropertyName("destinations")]
    public List<MappingDestination> Destinations { get; set; } = new();

    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonPropertyName("comment")]
    public string? Comment { get; set; }
}

/// <summary>
/// A target destination for extracted content.
/// </summary>
public class MappingDestination
{
    [JsonPropertyName("target")]
    public string Target { get; set; } = string.Empty;

    [JsonPropertyName("blockKey")]
    public string? BlockKey { get; set; }

    [JsonPropertyName("contentTypeKey")]
    public string? ContentTypeKey { get; set; }

    [JsonPropertyName("transforms")]
    public List<MappingTransform>? Transforms { get; set; }
}

/// <summary>
/// A transformation to apply to extracted content before writing.
/// </summary>
public class MappingTransform
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("params")]
    public TransformParams? Params { get; set; }
}

/// <summary>
/// Parameters for transformations.
/// </summary>
public class TransformParams
{
    // truncate transform
    [JsonPropertyName("maxLength")]
    public int? MaxLength { get; set; }

    [JsonPropertyName("suffix")]
    public string? Suffix { get; set; }

    // template transform
    [JsonPropertyName("template")]
    public string? Template { get; set; }

    // regex transform
    [JsonPropertyName("pattern")]
    public string? Pattern { get; set; }

    [JsonPropertyName("replacement")]
    public string? Replacement { get; set; }
}

/// <summary>
/// Container for loading all three config files from a document type folder.
/// </summary>
public class DocumentTypeConfig
{
    public string FolderPath { get; set; } = string.Empty;
    public string DocumentTypeAlias { get; set; } = string.Empty;
    public Dictionary<string, SourceConfig> Sources { get; set; } = new();
    public DestinationConfig Destination { get; set; } = new();
    public MapConfig Map { get; set; } = new();
    public string[] ValidationWarnings { get; set; } = [];
}
