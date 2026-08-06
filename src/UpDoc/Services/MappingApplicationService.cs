using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Logging;
using UpDoc.Models;

namespace UpDoc.Services;

public interface IMappingApplicationService
{
    /// <summary>
    /// Applies a workflow's mappings to a set of property values, in place.
    /// </summary>
    /// <param name="values">Property alias to value. Block containers hold JSON.</param>
    /// <param name="lookups">Section text, keyed by "sectionId.part".</param>
    /// <param name="map">The workflow's map.json.</param>
    /// <param name="destination">The workflow's destination.json, for field types and block identity.</param>
    /// <param name="mediaKey">Media key of the source file, for import facts. Null for web sources.</param>
    /// <returns>The property aliases and block properties this run wrote.</returns>
    IReadOnlySet<string> Apply(
        IDictionary<string, object?> values,
        SectionLookups lookups,
        MapConfig map,
        DestinationConfig destination,
        Guid? mediaKey);
}

/// <summary>
/// Applies a workflow's mappings to a document's property values.
///
/// This is the middle of the pipeline: extraction has produced sections, the
/// blueprint has produced a set of properties, and map.json says which section
/// text belongs in which field. Nothing here reads the source or writes to
/// Umbraco - it works on values in memory and leaves persisting to the caller.
///
/// Ported from the backoffice's create-from-source.ts, which has run this logic
/// for every import to date. The two must agree: the same map.json is applied in
/// the browser when an editor clicks Create, and here when the API is called.
/// </summary>
public class MappingApplicationService : IMappingApplicationService
{
    private readonly IMarkdownConversionService _markdown;
    private readonly ILogger<MappingApplicationService> _logger;

    public MappingApplicationService(
        IMarkdownConversionService markdown,
        ILogger<MappingApplicationService> logger)
    {
        _markdown = markdown;
        _logger = logger;
    }

    public IReadOnlySet<string> Apply(
        IDictionary<string, object?> values,
        SectionLookups lookups,
        MapConfig map,
        DestinationConfig destination,
        Guid? mediaKey)
    {
        // Which fields this run has written. The first write to a field replaces
        // the blueprint's default; later writes concatenate, which is how a title
        // split across two source elements ends up in one field.
        var mappedFields = new HashSet<string>(StringComparer.Ordinal);

        foreach (var mapping in map.Mappings)
        {
            if (!mapping.Enabled)
                continue;

            // Import facts describe the import itself rather than anything
            // extracted from it, so they resolve from the request.
            if (ImportFacts.IsImportFact(mapping.Source))
            {
                if (mapping.Source == ImportFacts.SourceFile && mediaKey.HasValue)
                {
                    foreach (var dest in mapping.Destinations)
                        ApplyImportFactMedia(values, dest, mediaKey.Value, mappedFields);
                }
                continue;
            }

            var sectionValue = ResolveSectionValue(mapping, lookups);
            if (string.IsNullOrEmpty(sectionValue))
                continue;

            foreach (var dest in mapping.Destinations)
                ApplyDestination(values, dest, sectionValue, destination, mappedFields);
        }

        // Type conversion runs last, so concatenation happens on raw strings first.
        ConvertFieldTypes(values, destination, mappedFields);

        return mappedFields;
    }

    /// <summary>
    /// Finds the text for a mapping, falling back to the stableKey when the
    /// section id has shifted since the map was written.
    /// </summary>
    private static string? ResolveSectionValue(SectionMapping mapping, SectionLookups lookups)
    {
        if (lookups.SectionLookup.TryGetValue(mapping.Source, out var direct))
            return direct;

        if (string.IsNullOrEmpty(mapping.SourceKey))
            return null;

        if (!lookups.StableKeyLookup.TryGetValue(mapping.SourceKey, out var newSectionId))
            return null;

        var dotIndex = mapping.Source.LastIndexOf('.');
        if (dotIndex < 0)
            return null;

        var part = mapping.Source[(dotIndex + 1)..];
        return lookups.SectionLookup.TryGetValue($"{newSectionId}.{part}", out var viaStableKey)
            ? viaStableKey
            : null;
    }

    /// <summary>
    /// Applies one destination. Handles simple fields, blocks matched by
    /// contentTypeKey, and the legacy three-part dot path.
    /// </summary>
    private void ApplyDestination(
        IDictionary<string, object?> values,
        MappingDestination dest,
        string sectionValue,
        DestinationConfig destination,
        HashSet<string> mappedFields)
    {
        // contentTypeKey is preferred: Umbraco regenerates block instance keys
        // when creating from a blueprint, so the element type GUID is the only
        // stable identifier.
        if (!string.IsNullOrEmpty(dest.ContentTypeKey))
        {
            foreach (var container in AllContainers(destination))
                ApplyBlockValueByContentType(values, container.Alias, dest.ContentTypeKey, dest.Target, sectionValue, mappedFields);
            return;
        }

        // Fallback for mappings written before contentTypeKey was recorded.
        if (!string.IsNullOrEmpty(dest.BlockKey))
        {
            foreach (var container in AllContainers(destination))
            {
                var block = container.Blocks.FirstOrDefault(b => b.Key == dest.BlockKey);
                if (block is null)
                    continue;

                if (!string.IsNullOrEmpty(block.ContentTypeKey))
                    ApplyBlockValueByContentType(values, container.Alias, block.ContentTypeKey, dest.Target, sectionValue, mappedFields);
                else if (block.IdentifyBy is not null)
                    ApplyBlockValueByIdentifier(values, container.Alias, block.IdentifyBy, dest.Target, sectionValue, mappedFields);

                return;
            }

            _logger.LogWarning("Block {BlockKey} not found in destination config", dest.BlockKey);
            return;
        }

        var pathParts = dest.Target.Split('.');

        if (pathParts.Length == 1)
        {
            WriteSimpleField(values, pathParts[0], sectionValue, mappedFields);
            return;
        }

        if (pathParts.Length == 3)
        {
            // Legacy dot path, e.g. "contentGrid.itineraryBlock.richTextContent".
            var (gridKey, blockKey, propertyKey) = (pathParts[0], pathParts[1], pathParts[2]);

            var grid = AllContainers(destination).FirstOrDefault(g => g.Key == gridKey);
            var block = grid?.Blocks.FirstOrDefault(b => b.Key == blockKey);
            if (grid is null || block?.IdentifyBy is null)
                return;

            var targetProperty = block.Properties?.FirstOrDefault(p => p.Key == propertyKey)?.Alias ?? propertyKey;
            ApplyBlockValueByIdentifier(values, grid.Alias, block.IdentifyBy, targetProperty, sectionValue, mappedFields);
        }
    }

    /// <summary>Writes a top-level property, concatenating on a repeat write.</summary>
    private static void WriteSimpleField(
        IDictionary<string, object?> values,
        string alias,
        string value,
        HashSet<string> mappedFields)
    {
        if (mappedFields.Contains(alias) && values.TryGetValue(alias, out var existing) && existing is string current)
            values[alias] = $"{current} {value}";
        else
            values[alias] = value;

        mappedFields.Add(alias);
    }

    /// <summary>
    /// Writes a block property, matching the block by its element type GUID.
    /// </summary>
    private void ApplyBlockValueByContentType(
        IDictionary<string, object?> values,
        string containerAlias,
        string contentTypeKey,
        string targetProperty,
        string value,
        HashSet<string> mappedFields)
        => EditBlockContainer(values, containerAlias, contentData =>
        {
            var block = contentData
                .OfType<JsonObject>()
                .FirstOrDefault(b => b["contentTypeKey"]?.GetValue<string>() == contentTypeKey);

            if (block is not null)
                WriteBlockProperty(block, targetProperty, value, mappedFields);
        });

    /// <summary>
    /// Writes a block property, finding the block by a text match on one of its
    /// properties. Used only where no contentTypeKey is recorded.
    /// </summary>
    private void ApplyBlockValueByIdentifier(
        IDictionary<string, object?> values,
        string containerAlias,
        BlockIdentifier identifier,
        string targetProperty,
        string value,
        HashSet<string> mappedFields)
        => EditBlockContainer(values, containerAlias, contentData =>
        {
            foreach (var block in contentData.OfType<JsonObject>())
            {
                var searchValue = FindBlockValue(block, identifier.Property)?.GetValue<string>();
                if (searchValue is null ||
                    !searchValue.Contains(identifier.Value, StringComparison.OrdinalIgnoreCase))
                    continue;

                WriteBlockProperty(block, targetProperty, value, mappedFields);
                break;
            }
        });

    /// <summary>
    /// Writes one property on one block, concatenating on a repeat write.
    ///
    /// An absent property is created rather than dropped. Absent is not the same
    /// as empty: a property only appears in contentData once a value has been
    /// saved against it, so two blocks that look identical in the backoffice can
    /// differ in the underlying JSON depending on the blueprint's editing history.
    /// </summary>
    private static void WriteBlockProperty(
        JsonObject block,
        string targetProperty,
        string value,
        HashSet<string> mappedFields)
    {
        var blockKey = block["key"]?.GetValue<string>() ?? string.Empty;
        var fieldKey = $"{blockKey}:{targetProperty}";

        if (block["values"] is not JsonArray blockValues)
        {
            blockValues = new JsonArray();
            block["values"] = blockValues;
        }

        var existing = FindBlockValueNode(blockValues, targetProperty);

        if (existing is not null)
        {
            var current = existing["value"]?.GetValue<string>() ?? string.Empty;
            existing["value"] = mappedFields.Contains(fieldKey) ? $"{current}\n{value}" : value;
        }
        else
        {
            blockValues.Add(new JsonObject
            {
                ["alias"] = targetProperty,
                ["value"] = value,
            });
        }

        mappedFields.Add(fieldKey);
    }

    /// <summary>
    /// Reads a block container's JSON, hands its contentData to an edit, and
    /// writes it back in the shape it arrived in.
    /// </summary>
    private void EditBlockContainer(
        IDictionary<string, object?> values,
        string containerAlias,
        Action<JsonArray> edit)
    {
        if (!values.TryGetValue(containerAlias, out var raw) || raw is null)
            return;

        try
        {
            var wasString = raw is string;
            var container = wasString
                ? JsonNode.Parse((string)raw)
                : JsonSerializer.SerializeToNode(raw);

            // Must be an object before contentData can be read. JsonNode's indexer
            // throws on a non-object rather than returning null, and a property
            // that is not a block container - a media picker holds an array - would
            // otherwise take down the whole import.
            if (container is not JsonObject containerObject)
                return;

            if (containerObject["contentData"] is not JsonArray contentData)
                return;

            edit(contentData);

            values[containerAlias] = wasString
                ? containerObject.ToJsonString()
                : containerObject;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to apply block mapping to {ContainerAlias}", containerAlias);
        }
    }

    private static JsonNode? FindBlockValue(JsonObject block, string alias)
        => block["values"] is JsonArray values ? FindBlockValueNode(values, alias)?["value"] : null;

    private static JsonObject? FindBlockValueNode(JsonArray values, string alias)
        => values.OfType<JsonObject>().FirstOrDefault(v => v["alias"]?.GetValue<string>() == alias);

    /// <summary>Applies an import fact - a value describing the import, not its content.</summary>
    private static void ApplyImportFactMedia(
        IDictionary<string, object?> values,
        MappingDestination dest,
        Guid mediaKey,
        HashSet<string> mappedFields)
    {
        // Umbraco's media picker stores an array of { key, mediaKey } entries.
        var pickerValue = new JsonArray
        {
            new JsonObject
            {
                ["key"] = Guid.NewGuid().ToString(),
                ["mediaKey"] = mediaKey.ToString(),
            },
        };

        values[dest.Target] = pickerValue;
        mappedFields.Add(dest.Target);
    }

    /// <summary>
    /// Converts each written value to the shape its property editor expects,
    /// using the field types recorded in destination.json.
    ///
    /// Only fields this run wrote are touched, so blueprint defaults are left alone.
    /// </summary>
    private void ConvertFieldTypes(
        IDictionary<string, object?> values,
        DestinationConfig destination,
        HashSet<string> mappedFields)
    {
        foreach (var field in destination.Fields)
        {
            if (!mappedFields.Contains(field.Alias))
                continue;

            if (!values.TryGetValue(field.Alias, out var raw) || raw is not string text)
                continue;

            switch (field.Type)
            {
                case "text":
                case "textArea":
                    values[field.Alias] = MarkdownStripper.Strip(text);
                    break;

                case "number":
                    // "£1,199" becomes 1199. On failure the property is removed so it
                    // keeps its blueprint default, rather than sending a non-numeric
                    // string the API would reject.
                    var number = ValueCoercion.ToInteger(text);
                    if (number is null)
                    {
                        _logger.LogWarning(
                            "Could not coerce \"{Value}\" to an integer for field \"{Alias}\" - leaving the property unset",
                            text, field.Alias);
                        values.Remove(field.Alias);
                    }
                    else
                    {
                        values[field.Alias] = number.Value;
                    }
                    break;

                case "date":
                    // "26th September 2027" becomes { date: "2027-09-26", timeZone: null }.
                    // Not a bare ISO string: DateTimePropertyEditorBase declares
                    // ValueType = Json, so a plain string is deserialised as JSON and
                    // rejected. Unparseable or ambiguous input drops the value rather
                    // than storing a wrong date.
                    var date = ValueCoercion.ToDateOnly(text);
                    if (date is null)
                    {
                        _logger.LogWarning(
                            "Could not coerce \"{Value}\" to a date for field \"{Alias}\" - leaving the property unset",
                            text, field.Alias);
                        values.Remove(field.Alias);
                    }
                    else
                    {
                        values[field.Alias] = ValueCoercion.BuildDateValue(date.Value);
                    }
                    break;

                case "richText":
                    values[field.Alias] = _markdown.BuildRichTextValue(text);
                    break;
            }
        }

        ConvertBlockPropertyTypes(values, destination, mappedFields);
    }

    /// <summary>The same conversions, for properties inside blocks.</summary>
    private void ConvertBlockPropertyTypes(
        IDictionary<string, object?> values,
        DestinationConfig destination,
        HashSet<string> mappedFields)
    {
        foreach (var container in AllContainers(destination))
        {
            EditBlockContainer(values, container.Alias, contentData =>
            {
                foreach (var block in contentData.OfType<JsonObject>())
                {
                    var blockContentTypeKey = block["contentTypeKey"]?.GetValue<string>();
                    var blockKey = block["key"]?.GetValue<string>() ?? string.Empty;

                    // Match on contentTypeKey. An identifyBy text search is unreliable
                    // here because the apply pass may already have overwritten the
                    // blueprint default that the search looks for.
                    var destBlock = container.Blocks.FirstOrDefault(b =>
                        !string.IsNullOrEmpty(b.ContentTypeKey)
                            ? b.ContentTypeKey == blockContentTypeKey
                            : b.Key == blockKey);

                    if (destBlock?.Properties is null)
                        continue;

                    foreach (var prop in destBlock.Properties)
                    {
                        if (!mappedFields.Contains($"{blockKey}:{prop.Alias}"))
                            continue;

                        if (block["values"] is not JsonArray blockValues)
                            continue;

                        var node = FindBlockValueNode(blockValues, prop.Alias);
                        if (node?["value"]?.GetValue<string>() is not string text)
                            continue;

                        node["value"] = prop.Type switch
                        {
                            "text" or "textArea" => MarkdownStripper.Strip(text),
                            "richText" => JsonSerializer.SerializeToNode(_markdown.BuildRichTextValue(text)),
                            _ => node["value"],
                        };
                    }
                }
            });
        }
    }

    /// <summary>Block grids and block lists together - mappings treat them the same way.</summary>
    private static IEnumerable<DestinationBlockGrid> AllContainers(DestinationConfig destination)
        => (destination.BlockGrids ?? []).Concat(destination.BlockLists ?? []);
}
