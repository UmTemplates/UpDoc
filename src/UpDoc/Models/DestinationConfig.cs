using System.Text.Json.Serialization;

namespace UpDoc.Models;

/// <summary>
/// Root model for destination.json - defines available target fields in the Umbraco document type.
/// </summary>
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

    [JsonPropertyName("blockLists")]
    public List<DestinationBlockGrid>? BlockLists { get; set; }
}

/// <summary>
/// A simple property field on the document type.
/// </summary>
public class DestinationField
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;

    [JsonPropertyName("alias")]
    public string Alias { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "text";

    [JsonPropertyName("tab")]
    public string? Tab { get; set; }

    /// <summary>
    /// The group within the tab, when the property sits in one. Null for properties that
    /// sit directly on the tab. Mirrors Umbraco's tab → group → property structure so
    /// UpDoc's tab strip matches what an editor sees in the backoffice.
    /// </summary>
    [JsonPropertyName("group")]
    public string? Group { get; set; }

    [JsonPropertyName("mandatory")]
    public bool Mandatory { get; set; }

    [JsonPropertyName("acceptsFormats")]
    public List<string> AcceptsFormats { get; set; } = new() { "text" };

    /// <summary>
    /// Which mapping mechanisms can fill this field: "sourceContent" (text captured
    /// from the source by a rule) and/or "importFact" (a value describing the import
    /// itself, such as the picked file). A field may support both.
    /// The client offers only the mechanisms the workflow's source type can supply.
    /// </summary>
    [JsonPropertyName("fillableBy")]
    public List<string> FillableBy { get; set; } = new() { "sourceContent" };
}

/// <summary>
/// A block container property (Block Grid or Block List) with its nested block structure.
/// </summary>
public class DestinationBlockGrid
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;

    [JsonPropertyName("alias")]
    public string Alias { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("tab")]
    public string? Tab { get; set; }

    /// <summary>
    /// The group within the tab, when the container sits in one. See DestinationField.Group.
    /// </summary>
    [JsonPropertyName("group")]
    public string? Group { get; set; }

    [JsonPropertyName("blocks")]
    public List<DestinationBlock> Blocks { get; set; } = new();
}

/// <summary>
/// A block type within a block grid.
/// </summary>
public class DestinationBlock
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;

    [JsonPropertyName("contentTypeAlias")]
    public string ContentTypeAlias { get; set; } = string.Empty;

    [JsonPropertyName("contentTypeKey")]
    public string? ContentTypeKey { get; set; }

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("identifyBy")]
    public BlockIdentifier? IdentifyBy { get; set; }

    [JsonPropertyName("properties")]
    public List<BlockProperty>? Properties { get; set; }
}

/// <summary>
/// How to identify a specific block instance within the blueprint.
/// </summary>
public class BlockIdentifier
{
    [JsonPropertyName("property")]
    public string Property { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;
}

/// <summary>
/// A property within a block.
/// </summary>
public class BlockProperty
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;

    [JsonPropertyName("alias")]
    public string Alias { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "text";

    [JsonPropertyName("acceptsFormats")]
    public List<string>? AcceptsFormats { get; set; }

    /// <summary>
    /// Which mapping mechanisms can fill this block property. See DestinationField.FillableBy.
    /// </summary>
    [JsonPropertyName("fillableBy")]
    public List<string> FillableBy { get; set; } = new() { "sourceContent" };
}
