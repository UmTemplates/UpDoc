using System.Text.Json;
using Microsoft.Extensions.Logging;
using UpDoc.Models;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace UpDoc.Services;

public interface IDestinationStructureService
{
    /// <summary>
    /// Builds a DestinationConfig by introspecting the document type and blueprint content.
    /// Includes all text-mappable properties from the document type (regardless of blueprint population).
    /// Block grids and block lists only include block instances actually placed in the blueprint.
    /// All tabs are included — the text-mappable filter ensures only relevant field types appear.
    /// </summary>
    Task<DestinationConfig> BuildDestinationConfigAsync(
        string documentTypeAlias,
        string? blueprintId,
        string? blueprintName);
}

public class DestinationStructureService : IDestinationStructureService
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IContentService _contentService;
    private readonly ILogger<DestinationStructureService> _logger;

    // Property editor types that can receive text-based mapped content
    private static readonly HashSet<string> TextMappableTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "text", "textArea", "richText"
    };

    public DestinationStructureService(
        IContentTypeService contentTypeService,
        IContentService contentService,
        ILogger<DestinationStructureService> logger)
    {
        _contentTypeService = contentTypeService;
        _contentService = contentService;
        _logger = logger;
    }

    public Task<DestinationConfig> BuildDestinationConfigAsync(
        string documentTypeAlias,
        string? blueprintId,
        string? blueprintName)
    {
        var contentType = _contentTypeService.Get(documentTypeAlias);
        if (contentType == null)
        {
            throw new InvalidOperationException($"Document type '{documentTypeAlias}' not found.");
        }

        var config = new DestinationConfig
        {
            Version = "1.0",
            DocumentTypeAlias = documentTypeAlias,
            DocumentTypeName = contentType.Name,
            BlueprintId = blueprintId,
            BlueprintName = blueprintName,
            Fields = new List<DestinationField>(),
            BlockGrids = new List<DestinationBlockGrid>(),
            BlockLists = new List<DestinationBlockGrid>()
        };

        // Load the actual blueprint content to filter by what's populated
        IContent? blueprint = null;
        if (!string.IsNullOrWhiteSpace(blueprintId) && Guid.TryParse(blueprintId, out var bpGuid))
        {
            blueprint = _contentService.GetBlueprintById(bpGuid);
            if (blueprint == null)
            {
                _logger.LogWarning("Blueprint '{BlueprintId}' not found. Destination will be empty.", blueprintId);
            }
        }

        if (blueprint == null)
        {
            _logger.LogWarning("No blueprint available for '{Alias}'. Cannot build destination config.", documentTypeAlias);
            return Task.FromResult(config);
        }

        // Walk property groups (tabs) and their properties — use CompositionPropertyGroups
        // to include properties from compositions, not just directly-defined ones
        var groupedPropertyAliases = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var group in contentType.CompositionPropertyGroups.OrderBy(g => g.SortOrder))
        {
            var tabName = group.Name ?? "General";

            // All tabs are included — the TextMappableTypes filter in BuildFieldIfEligible
            // ensures only relevant field types appear. Workflow authors can choose which
            // fields to map; no tabs are excluded at generation time.

            foreach (var propertyType in group.PropertyTypes?.OrderBy(p => p.SortOrder) ?? Enumerable.Empty<IPropertyType>())
            {
                groupedPropertyAliases.Add(propertyType.Alias);

                if (propertyType.PropertyEditorAlias == "Umbraco.BlockGrid")
                {
                    var blockGrid = BuildBlockContainerFromBlueprint(propertyType, blueprint, "Umbraco.BlockGrid", tabName);
                    if (blockGrid != null)
                    {
                        config.BlockGrids!.Add(blockGrid);
                    }
                }
                else if (propertyType.PropertyEditorAlias == "Umbraco.BlockList")
                {
                    var blockList = BuildBlockContainerFromBlueprint(propertyType, blueprint, "Umbraco.BlockList", tabName);
                    if (blockList != null)
                    {
                        config.BlockLists!.Add(blockList);
                    }
                }
                else
                {
                    var field = BuildFieldIfEligible(propertyType, tabName, blueprint);
                    if (field != null)
                    {
                        config.Fields.Add(field);
                    }
                }
            }
        }

        // Handle ungrouped composition properties (not in any group)
        foreach (var propertyType in contentType.CompositionPropertyTypes
            .Where(p => !groupedPropertyAliases.Contains(p.Alias))
            .OrderBy(p => p.SortOrder))
        {
            if (propertyType.PropertyEditorAlias == "Umbraco.BlockGrid")
            {
                var blockGrid = BuildBlockContainerFromBlueprint(propertyType, blueprint, "Umbraco.BlockGrid", "General");
                if (blockGrid != null)
                {
                    config.BlockGrids!.Add(blockGrid);
                }
            }
            else if (propertyType.PropertyEditorAlias == "Umbraco.BlockList")
            {
                var blockList = BuildBlockContainerFromBlueprint(propertyType, blueprint, "Umbraco.BlockList", "General");
                if (blockList != null)
                {
                    config.BlockLists!.Add(blockList);
                }
            }
            else
            {
                var field = BuildFieldIfEligible(propertyType, "General", blueprint);
                if (field != null)
                {
                    config.Fields.Add(field);
                }
            }
        }

        _logger.LogInformation(
            "Built destination config for '{Alias}': {FieldCount} fields, {BlockGridCount} block grids, {BlockListCount} block lists",
            documentTypeAlias, config.Fields.Count, config.BlockGrids?.Count ?? 0, config.BlockLists?.Count ?? 0);

        return Task.FromResult(config);
    }

    /// <summary>
    /// Builds a DestinationField if the property is text-mappable.
    /// All text-mappable properties are included as mapping targets, regardless of whether
    /// they are populated in the blueprint. Properties like organiser fields are empty in the
    /// blueprint because they're meant to be filled from the source.
    /// </summary>
    private DestinationField? BuildFieldIfEligible(IPropertyType propertyType, string tabName, IContent blueprint)
    {
        var fieldType = MapEditorAlias(propertyType.PropertyEditorAlias);

        // Only include text-mappable types
        if (!TextMappableTypes.Contains(fieldType))
        {
            return null;
        }

        return new DestinationField
        {
            Key = propertyType.Key.ToString(),
            Alias = propertyType.Alias,
            Label = propertyType.Name ?? propertyType.Alias,
            Description = propertyType.Description,
            Type = fieldType,
            Tab = tabName,
            Mandatory = propertyType.Mandatory,
            AcceptsFormats = GetAcceptsFormats(fieldType)
        };
    }

    /// <summary>
    /// Builds a block container (Block Grid or Block List) by reading the actual block instances
    /// placed in the blueprint, rather than listing all allowed block types from the editor configuration.
    /// </summary>
    private DestinationBlockGrid? BuildBlockContainerFromBlueprint(
        IPropertyType propertyType, IContent blueprint, string layoutKey, string tabName)
    {
        // Get block value from the blueprint — may be string, JsonElement, or JsonNode
        var rawObj = blueprint.GetValue(propertyType.Alias);
        if (rawObj == null)
        {
            _logger.LogWarning("Block container '{Alias}': no value found on blueprint", propertyType.Alias);
            return null;
        }

        // Convert to a JSON string regardless of the runtime type
        string rawJson;
        if (rawObj is string s)
        {
            rawJson = s;
        }
        else
        {
            // Handles JsonElement, JsonNode, or any other type Umbraco might store
            rawJson = JsonSerializer.Serialize(rawObj);
        }

        if (string.IsNullOrWhiteSpace(rawJson))
        {
            return null;
        }

        _logger.LogDebug("Block container '{Alias}': raw type={Type}, length={Length}",
            propertyType.Alias, rawObj.GetType().Name, rawJson.Length);

        JsonDocument doc;
        try
        {
            doc = JsonDocument.Parse(rawJson);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse block container JSON for property '{Alias}'", propertyType.Alias);
            return null;
        }

        using (doc)
        {
            var root = doc.RootElement;

            // Get contentData array — try both camelCase and PascalCase
            if (!root.TryGetProperty("contentData", out var contentDataArray) &&
                !root.TryGetProperty("ContentData", out contentDataArray))
            {
                _logger.LogWarning("Block container '{Alias}': no contentData found in JSON. Keys: {Keys}",
                    propertyType.Alias,
                    string.Join(", ", root.EnumerateObject().Select(p => p.Name)));
                return null;
            }

            if (contentDataArray.ValueKind != JsonValueKind.Array)
            {
                return null;
            }

            var container = new DestinationBlockGrid
            {
                Key = propertyType.Key.ToString(),
                Alias = propertyType.Alias,
                Label = propertyType.Name ?? propertyType.Alias,
                Description = propertyType.Description,
                Tab = tabName,
                Blocks = new List<DestinationBlock>()
            };

            // Build blocks from contentData (unordered), keyed by their instance key
            var blocksByKey = new Dictionary<string, DestinationBlock>(StringComparer.OrdinalIgnoreCase);
            foreach (var blockData in contentDataArray.EnumerateArray())
            {
                var block = BuildBlockFromInstance(blockData);
                if (block != null)
                {
                    blocksByKey[block.Key] = block;
                }
            }

            // Reorder blocks using the layout tree (visual order) if available
            if (TryGetLayoutArray(root, layoutKey, out var layoutArray))
            {
                container.Blocks = GetBlocksInLayoutOrder(layoutArray, blocksByKey);
            }
            else
            {
                // Fallback: contentData order (previous behaviour)
                container.Blocks = blocksByKey.Values.ToList();
            }

            // Only return the container if it has blocks with text-mappable properties
            return container.Blocks.Count > 0 ? container : null;
        }
    }

    /// <summary>
    /// Builds a DestinationBlock from a single block instance in the blueprint's contentData.
    /// Only includes blocks that have at least one text-mappable property.
    /// Derives an identifyBy label from the block's populated text properties.
    /// </summary>
    private DestinationBlock? BuildBlockFromInstance(JsonElement blockData)
    {
        if (!TryGetJsonProperty(blockData, "contentTypeKey", out var contentTypeKeyElement))
        {
            return null;
        }

        var contentTypeKey = contentTypeKeyElement.GetGuid();
        var elementType = _contentTypeService.Get(contentTypeKey);
        if (elementType == null)
        {
            _logger.LogWarning("Element type not found for ContentTypeKey '{Key}'", contentTypeKey);
            return null;
        }

        // Get the block instance's property values from the JSON.
        // Handles both v17 format (values array: [{alias, value}]) and
        // v13 format (properties directly on the object: {title: "...", text: "..."})
        var instanceValues = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (TryGetJsonProperty(blockData, "values", out var valuesArray) &&
            valuesArray.ValueKind == JsonValueKind.Array)
        {
            // v17 format: values array with {alias, value} objects
            foreach (var val in valuesArray.EnumerateArray())
            {
                var alias = TryGetJsonProperty(val, "alias", out var a) ? a.GetString() : null;
                if (string.IsNullOrEmpty(alias)) continue;

                var value = TryGetJsonProperty(val, "value", out var v) ? ExtractStringValue(v) : null;
                if (!string.IsNullOrWhiteSpace(value))
                {
                    instanceValues[alias] = value;
                }
            }
        }
        else
        {
            // v13 format: properties directly on the contentData object
            // Known system properties to skip
            var systemProps = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                { "contentTypeKey", "ContentTypeKey", "udi", "Udi", "key", "Key" };

            foreach (var prop in blockData.EnumerateObject())
            {
                if (systemProps.Contains(prop.Name)) continue;

                var value = ExtractStringValue(prop.Value);
                if (!string.IsNullOrWhiteSpace(value))
                {
                    instanceValues[prop.Name] = value;
                }
            }
        }

        // Collect text-mappable properties from the element type definition
        // Use CompositionPropertyTypes to include properties from compositions,
        // not just directly-defined ones (same pattern as the document type iteration)
        var textMappableProperties = new List<BlockProperty>();
        BlockIdentifier? identifyBy = null;

        foreach (var elementProp in elementType.CompositionPropertyTypes.OrderBy(p => p.SortOrder))
        {
            var propType = MapEditorAlias(elementProp.PropertyEditorAlias);

            if (TextMappableTypes.Contains(propType))
            {
                textMappableProperties.Add(new BlockProperty
                {
                    Key = elementProp.Key.ToString(),
                    Alias = elementProp.Alias,
                    Label = elementProp.Name,
                    Type = propType,
                    AcceptsFormats = GetAcceptsFormats(propType)
                });
            }

            // Find identifying label: first text/textArea property with a non-empty value
            if (identifyBy == null &&
                (propType == "text" || propType == "textArea") &&
                instanceValues.TryGetValue(elementProp.Alias, out var identValue))
            {
                identifyBy = new BlockIdentifier
                {
                    Property = elementProp.Alias,
                    Value = identValue
                };
            }
        }

        // Skip blocks that have no text-mappable properties (e.g., layout blocks)
        if (textMappableProperties.Count == 0)
        {
            return null;
        }

        // Build a human-readable label from the identifying value.
        // Fall back to element type name when the value is a JSON array (e.g., Navigation In Page
        // stores block keys as '["guid1","guid2"]') which isn't human-readable.
        var label = identifyBy != null
            && !identifyBy.Value.StartsWith('[')
            ? identifyBy.Value
            : elementType.Name ?? elementType.Alias;

        var blockKey = TryGetJsonProperty(blockData, "key", out var keyElement)
            ? keyElement.GetGuid().ToString()
            : contentTypeKey.ToString();

        return new DestinationBlock
        {
            Key = blockKey,
            ContentTypeAlias = elementType.Alias,
            ContentTypeKey = contentTypeKey.ToString(),
            Label = label,
            Description = elementType.Description,
            IdentifyBy = identifyBy,
            Properties = textMappableProperties
        };
    }

    /// <summary>
    /// Extracts a string value from a JSON element. Handles both simple strings
    /// and complex objects (returns null for complex objects like rich text markup).
    /// </summary>
    private static string? ExtractStringValue(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => null // Complex objects (arrays, objects) are not suitable for identification
        };
    }

    private static bool IsValueEmpty(object? value)
    {
        if (value == null) return true;
        if (value is string s) return string.IsNullOrWhiteSpace(s);
        return false;
    }

    private static string MapEditorAlias(string editorAlias) => editorAlias switch
    {
        "Umbraco.TextBox" => "text",
        "Umbraco.TextArea" => "textArea",
        "Umbraco.RichText" or "Umbraco.TinyMCE" => "richText",
        "Umbraco.Integer" or "Umbraco.Decimal" => "number",
        "Umbraco.DateTime" => "date",
        "Umbraco.TrueFalse" => "boolean",
        "Umbraco.MediaPicker3" => "mediaPicker",
        "Umbraco.ContentPicker" or "Umbraco.MultiNodeTreePicker" => "contentPicker",
        "Umbraco.BlockList" => "blockList",
        _ => "text"
    };

    private static List<string> GetAcceptsFormats(string fieldType) => fieldType switch
    {
        "richText" => new List<string> { "html", "markdown", "text" },
        "textArea" => new List<string> { "text", "markdown" },
        _ => new List<string> { "text" }
    };

    /// <summary>
    /// Case-insensitive JSON property lookup — tries camelCase then PascalCase.
    /// </summary>
    private static bool TryGetJsonProperty(JsonElement element, string name, out JsonElement value)
    {
        // Try as-is (camelCase)
        if (element.TryGetProperty(name, out value))
            return true;

        // Try PascalCase
        var pascal = char.ToUpperInvariant(name[0]) + name[1..];
        if (element.TryGetProperty(pascal, out value))
            return true;

        // Try camelCase (in case the input was PascalCase)
        var camel = char.ToLowerInvariant(name[0]) + name[1..];
        return element.TryGetProperty(camel, out value);
    }

    /// <summary>
    /// Extracts the block layout array from the root JSON element for the given layout key.
    /// The layout tree defines the visual order of blocks.
    /// </summary>
    private static bool TryGetLayoutArray(JsonElement root, string layoutKey, out JsonElement layoutArray)
    {
        layoutArray = default;

        if (!TryGetJsonProperty(root, "layout", out var layoutObj))
            return false;

        if (layoutObj.TryGetProperty(layoutKey, out layoutArray) &&
            layoutArray.ValueKind == JsonValueKind.Array)
            return true;

        return false;
    }

    /// <summary>
    /// Walks the block grid layout tree depth-first to produce blocks
    /// in visual order (top-to-bottom, left-to-right within each layout row).
    /// Layout blocks themselves are skipped (they have no text-mappable properties
    /// so they won't be in blocksByKey) but their nested content blocks are included.
    /// </summary>
    private static List<DestinationBlock> GetBlocksInLayoutOrder(
        JsonElement layoutArray,
        Dictionary<string, DestinationBlock> blocksByKey)
    {
        var ordered = new List<DestinationBlock>();
        WalkLayoutItems(layoutArray, blocksByKey, ordered);
        return ordered;
    }

    private static void WalkLayoutItems(
        JsonElement items,
        Dictionary<string, DestinationBlock> blocksByKey,
        List<DestinationBlock> ordered)
    {
        foreach (var item in items.EnumerateArray())
        {
            // Get contentKey for this layout item
            if (TryGetJsonProperty(item, "contentKey", out var keyEl))
            {
                var key = keyEl.GetString();
                if (key != null && blocksByKey.TryGetValue(key, out var block))
                {
                    ordered.Add(block);
                    blocksByKey.Remove(key); // Prevent duplicates
                }
            }

            // Recurse into areas → items
            if (TryGetJsonProperty(item, "areas", out var areas) &&
                areas.ValueKind == JsonValueKind.Array)
            {
                foreach (var area in areas.EnumerateArray())
                {
                    if (TryGetJsonProperty(area, "items", out var areaItems) &&
                        areaItems.ValueKind == JsonValueKind.Array)
                    {
                        WalkLayoutItems(areaItems, blocksByKey, ordered);
                    }
                }
            }
        }
    }
}
