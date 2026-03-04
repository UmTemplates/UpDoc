using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using UpDoc.Models;

namespace UpDoc.Services;

public interface IWorkflowService
{
    /// <summary>
    /// Gets the document type config for a given blueprint ID.
    /// </summary>
    DocumentTypeConfig? GetConfigForBlueprint(Guid blueprintId);

    /// <summary>
    /// Gets the document type config for a given document type alias.
    /// </summary>
    DocumentTypeConfig? GetConfigForDocumentType(string alias);

    /// <summary>
    /// Gets all loaded document type configs (validated — only complete workflows).
    /// </summary>
    IReadOnlyList<DocumentTypeConfig> GetAllConfigs();

    /// <summary>
    /// Gets a workflow config by alias, loading directly without validation.
    /// Used by workspace views that need to load partially-complete workflows.
    /// </summary>
    DocumentTypeConfig? GetConfigByAlias(string alias);

    /// <summary>
    /// Validates cross-file references in a document type config.
    /// Returns a list of validation errors (empty if valid).
    /// </summary>
    List<string> ValidateConfig(DocumentTypeConfig config);

    /// <summary>
    /// Lists all workflow folders for the dashboard, including incomplete ones
    /// that don't have source files yet.
    /// </summary>
    IReadOnlyList<WorkflowSummary> GetAllWorkflowSummaries();

    /// <summary>
    /// Clears the cached configs so new workflows are discovered on next load.
    /// </summary>
    void ClearCache();

    /// <summary>
    /// Creates a new workflow folder with stub source, destination, and map files.
    /// </summary>
    void CreateWorkflow(string alias, string displayName, string documentTypeAlias, string sourceType, string? blueprintId, string? blueprintName, string? documentTypeName = null);

    /// <summary>
    /// Updates the name and/or alias of an existing workflow.
    /// If the alias changes, the folder is renamed on disk.
    /// Returns the new alias (which may differ from the old one).
    /// </summary>
    string UpdateWorkflowIdentity(string currentAlias, string newName, string newAlias);

    /// <summary>
    /// Updates the document type and blueprint in workflow.json.
    /// Does NOT rename the folder or regenerate destination/map files.
    /// </summary>
    void UpdateWorkflowDestination(string alias, string documentTypeAlias, string? documentTypeName, string blueprintId, string? blueprintName);

    /// <summary>
    /// Deletes a workflow folder and all its files.
    /// </summary>
    void DeleteWorkflow(string alias);

    /// <summary>
    /// Saves a DestinationConfig as destination.json in the workflow folder, replacing the existing file.
    /// </summary>
    void SaveDestinationConfig(string workflowAlias, DestinationConfig config);

    /// <summary>
    /// Saves a rich extraction result as sample-extraction.json in the workflow folder.
    /// </summary>
    void SaveSampleExtraction(string workflowAlias, RichExtractionResult extraction);

    /// <summary>
    /// Loads the stored sample-extraction.json from a workflow folder, if it exists.
    /// </summary>
    RichExtractionResult? GetSampleExtraction(string workflowAlias);

    /// <summary>
    /// Saves a MapConfig as map.json in the workflow folder, replacing the existing file.
    /// </summary>
    void SaveMapConfig(string workflowAlias, MapConfig config);

    /// <summary>
    /// Loads the map.json from a workflow folder, if it exists.
    /// </summary>
    MapConfig? GetMapConfig(string workflowAlias);

    /// <summary>
    /// Loads the destination.json from a workflow folder, if it exists.
    /// </summary>
    DestinationConfig? GetDestinationConfig(string workflowAlias);

    /// <summary>
    /// Saves an area detection result as area-detection.json in the workflow folder.
    /// </summary>
    void SaveAreaDetection(string workflowAlias, AreaDetectionResult result);

    /// <summary>
    /// Loads the stored area-detection.json from a workflow folder, if it exists.
    /// Falls back to zone-detection.json for backwards compatibility.
    /// </summary>
    AreaDetectionResult? GetAreaDetection(string workflowAlias);

    /// <summary>
    /// Saves a transform result as transform.json in the workflow folder.
    /// </summary>
    void SaveTransformResult(string workflowAlias, TransformResult result);

    /// <summary>
    /// Loads the stored transform.json from a workflow folder, if it exists.
    /// </summary>
    TransformResult? GetTransformResult(string workflowAlias);

    /// <summary>
    /// Updates the Included flag for a single section in transform.json.
    /// Returns the updated TransformResult, or null if the workflow or section was not found.
    /// </summary>
    TransformResult? UpdateSectionInclusion(string workflowAlias, string sectionId, bool included);

    /// <summary>
    /// Updates sort order for areas or sections within a page's transform result.
    /// For areas: sets SortOrder on each area matching the given page.
    /// For sections: sets SortOrder on sections within the specified area.
    /// Returns the updated TransformResult, or null if the workflow was not found.
    /// </summary>
    TransformResult? UpdateSortOrder(string workflowAlias, int page, string? areaName, List<string> sortedIds);

    /// <summary>
    /// Loads the source.json from a workflow folder.
    /// </summary>
    SourceConfig? GetSourceConfig(string workflowAlias);

    /// <summary>
    /// Saves a SourceConfig as source.json in the workflow folder, replacing the existing file.
    /// </summary>
    void SaveSourceConfig(string workflowAlias, SourceConfig config);

    /// <summary>
    /// Saves an area template as area-template.json in the workflow folder.
    /// </summary>
    void SaveAreaTemplate(string workflowAlias, AreaTemplate template);

    /// <summary>
    /// Loads the stored area-template.json from a workflow folder, if it exists.
    /// Falls back to zone-template.json for backwards compatibility.
    /// </summary>
    AreaTemplate? GetAreaTemplate(string workflowAlias);

    /// <summary>
    /// Backfills contentTypeKey on map.json destinations that have blockKey but no contentTypeKey.
    /// Returns the number of mappings backfilled.
    /// </summary>
    int BackfillContentTypeKeysForWorkflow(string workflowAlias);
}

/// <summary>
/// Summary info for a workflow folder, used by the dashboard listing.
/// Includes incomplete workflows that don't have source files yet.
/// </summary>
public class WorkflowSummary
{
    public string Name { get; set; } = string.Empty;
    public string Alias { get; set; } = string.Empty;
    public string DocumentTypeAlias { get; set; } = string.Empty;
    public string? DocumentTypeName { get; set; }
    public string? BlueprintId { get; set; }
    public string? BlueprintName { get; set; }
    public string[] SourceTypes { get; set; } = [];
    public int MappingCount { get; set; }
    public bool IsComplete { get; set; }
    public string[] ValidationWarnings { get; set; } = [];
}

public class WorkflowService : IWorkflowService
{
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger<WorkflowService> _logger;
    private List<DocumentTypeConfig>? _cache;
    private readonly object _lock = new();

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
    };

    public WorkflowService(IWebHostEnvironment webHostEnvironment, ILogger<WorkflowService> logger)
    {
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;

        // Migrate existing workflows that don't have workflow.json yet
        MigrateExistingWorkflows();
    }

    public DocumentTypeConfig? GetConfigForBlueprint(Guid blueprintId)
    {
        var configs = LoadConfigs();
        var idString = blueprintId.ToString();
        var matching = configs.Where(c =>
            !string.IsNullOrEmpty(c.Destination.BlueprintId) &&
            c.Destination.BlueprintId.Equals(idString, StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (matching.Count == 0) return null;
        if (matching.Count == 1) return matching[0];

        // Multiple workflows for same blueprint (e.g. PDF + web) — merge their Sources
        var merged = matching[0];
        for (int i = 1; i < matching.Count; i++)
        {
            foreach (var kvp in matching[i].Sources)
            {
                merged.Sources.TryAdd(kvp.Key, kvp.Value);
            }
        }
        return merged;
    }

    public DocumentTypeConfig? GetConfigForDocumentType(string alias)
    {
        var configs = LoadConfigs();
        return configs.FirstOrDefault(c =>
            c.DocumentTypeAlias.Equals(alias, StringComparison.OrdinalIgnoreCase));
    }

    public IReadOnlyList<DocumentTypeConfig> GetAllConfigs()
    {
        return LoadConfigs().AsReadOnly();
    }

    public List<string> ValidateConfig(DocumentTypeConfig config)
    {
        var errors = new List<string>();

        // Get valid destination aliases (fields + block property aliases)
        var validDestinationKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Add simple field aliases
        foreach (var field in config.Destination.Fields)
        {
            validDestinationKeys.Add(field.Alias);
        }

        // Add block property aliases (Block Grids + Block Lists)
        foreach (var container in (config.Destination.BlockGrids ?? Enumerable.Empty<DestinationBlockGrid>())
            .Concat(config.Destination.BlockLists ?? Enumerable.Empty<DestinationBlockGrid>()))
        {
            foreach (var block in container.Blocks)
            {
                if (block.Properties != null)
                {
                    foreach (var prop in block.Properties)
                    {
                        validDestinationKeys.Add(prop.Alias);
                    }
                }
            }
        }

        // Validate mappings against each source config
        foreach (var (sourceType, sourceConfig) in config.Sources)
        {
            var validSourceKeys = sourceConfig.Sections
                .Select(s => s.Key)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var mapping in config.Map.Mappings)
            {
                if (!mapping.Enabled) continue;

                // Check source exists in this source config
                // Skip when sections is empty — area-rules workflows produce sections
                // dynamically via the transform pipeline, not statically in source.json
                if (validSourceKeys.Count > 0 && !validSourceKeys.Contains(mapping.Source))
                {
                    errors.Add($"WARN: map.json source '{mapping.Source}' not found in source-{sourceType}.json (will be skipped for this source type)");
                }

                // Check each destination exists
                foreach (var dest in mapping.Destinations)
                {
                    if (!validDestinationKeys.Contains(dest.Target))
                    {
                        errors.Add($"map.json: target '{dest.Target}' not found in destination-blueprint.json");
                    }
                }
            }

            // Warn about unmapped required sections
            var mappedSources = config.Map.Mappings
                .Where(m => m.Enabled)
                .Select(m => m.Source)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var section in sourceConfig.Sections.Where(s => s.Required))
            {
                if (!mappedSources.Contains(section.Key))
                {
                    errors.Add($"WARN: source-{sourceType}.json section '{section.Key}' (required: true) has no mapping");
                }
            }
        }

        // Validate blockKeys in map.json against destination.json
        // These warnings are surfaced in the UI, not logged at startup
        var validBlockKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var container in (config.Destination.BlockGrids ?? Enumerable.Empty<DestinationBlockGrid>())
            .Concat(config.Destination.BlockLists ?? Enumerable.Empty<DestinationBlockGrid>()))
        {
            foreach (var block in container.Blocks)
            {
                validBlockKeys.Add(block.Key);
            }
        }

        foreach (var mapping in config.Map.Mappings)
        {
            foreach (var dest in mapping.Destinations)
            {
                if (!string.IsNullOrEmpty(dest.BlockKey) && !validBlockKeys.Contains(dest.BlockKey))
                {
                    errors.Add($"WARN: blockKey '{dest.BlockKey}' for target '{dest.Target}' not found in destination.json (orphaned)");
                }
            }
        }

        // Validate source references in map.json against transform.json sections
        // Build the set of valid section part keys (e.g., "features.content", "tour-title.heading")
        var transformFile = ResolveFilePath(config.FolderPath, "source", "transform.json");
        if (File.Exists(transformFile))
        {
            try
            {
                var transformJson = File.ReadAllText(transformFile);
                var transform = JsonSerializer.Deserialize<TransformResult>(transformJson, JsonOptions);
                if (transform != null)
                {
                    var validSectionKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    foreach (var section in transform.AllSections)
                    {
                        if (!section.Included) continue;
                        validSectionKeys.Add($"{section.Id}.content");
                        if (section.Heading != null)
                        {
                            validSectionKeys.Add($"{section.Id}.heading");
                            validSectionKeys.Add($"{section.Id}.title");
                        }
                        if (section.Description != null)
                            validSectionKeys.Add($"{section.Id}.description");
                        if (section.Summary != null)
                            validSectionKeys.Add($"{section.Id}.summary");
                    }

                    foreach (var mapping in config.Map.Mappings)
                    {
                        if (!mapping.Enabled) continue;
                        if (!validSectionKeys.Contains(mapping.Source))
                        {
                            errors.Add($"WARN: source '{mapping.Source}' not found in transform.json (orphaned source)");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Validation: failed to read transform.json for source validation");
            }
        }

        return errors;
    }

    public IReadOnlyList<WorkflowSummary> GetAllWorkflowSummaries()
    {
        var summaries = new List<WorkflowSummary>();
        var workflowsDirectory = Path.Combine(_webHostEnvironment.ContentRootPath, "updoc", "workflows");

        if (!Directory.Exists(workflowsDirectory))
        {
            return summaries.AsReadOnly();
        }

        foreach (var folderPath in Directory.GetDirectories(workflowsDirectory))
        {
            var folderName = Path.GetFileName(folderPath);
            var summary = new WorkflowSummary { Alias = folderName };

            // Try workflow.json first (new identity file)
            var identity = ReadWorkflowIdentity(folderPath);
            if (identity != null)
            {
                summary.Name = identity.Name;
                summary.Alias = identity.Alias;
                summary.DocumentTypeAlias = identity.DocumentTypeAlias;
                summary.DocumentTypeName = identity.DocumentTypeName;
                summary.BlueprintId = identity.BlueprintId;
                summary.BlueprintName = identity.BlueprintName;
                if (!string.IsNullOrEmpty(identity.SourceType))
                {
                    summary.SourceTypes = [identity.SourceType];
                }
            }

            // Resolve file paths (subfolder-first, root-fallback for pre-migration compat)
            var destinationFile = ResolveFilePath(folderPath, "destination", "destination.json");
            var mapFile = ResolveFilePath(folderPath, "map", "map.json");

            // Read source types from source.json (if not already set from workflow.json)
            if (summary.SourceTypes.Length == 0)
            {
                var sourceFile = ResolveFilePath(folderPath, "source", "source.json");
                if (File.Exists(sourceFile))
                {
                    try
                    {
                        var json = File.ReadAllText(sourceFile);
                        var source = JsonSerializer.Deserialize<SourceConfig>(json, JsonOptions);
                        if (source?.SourceTypes.Count > 0)
                        {
                            summary.SourceTypes = source.SourceTypes.ToArray();
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to read source config for {Folder}", folderName);
                    }
                }
            }

            // Read destination config for metadata (fills in anything workflow.json didn't provide)
            if (string.IsNullOrEmpty(summary.DocumentTypeAlias) && File.Exists(destinationFile))
            {
                try
                {
                    var json = File.ReadAllText(destinationFile);
                    var dest = JsonSerializer.Deserialize<DestinationConfig>(json, JsonOptions);
                    if (dest != null)
                    {
                        summary.DocumentTypeAlias = dest.DocumentTypeAlias;
                        summary.BlueprintId = dest.BlueprintId;
                        summary.BlueprintName = dest.BlueprintName;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to read destination config for {Folder}", folderName);
                }
            }

            // Read map config for mapping count
            if (File.Exists(mapFile))
            {
                try
                {
                    var json = File.ReadAllText(mapFile);
                    var map = JsonSerializer.Deserialize<MapConfig>(json, JsonOptions);
                    if (map != null)
                    {
                        summary.MappingCount = map.Mappings.Count(m => m.Enabled);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to read map config for {Folder}", folderName);
                }
            }

            // A workflow is complete when it has destination + map + at least one source
            summary.IsComplete = File.Exists(destinationFile)
                && File.Exists(mapFile)
                && summary.SourceTypes.Length > 0;

            // Get validation warnings for complete workflows
            if (summary.IsComplete)
            {
                var config = LoadConfigs().FirstOrDefault(c =>
                    Path.GetFileName(c.FolderPath).Equals(folderName, StringComparison.OrdinalIgnoreCase));
                if (config != null)
                {
                    summary.ValidationWarnings = ValidateConfig(config)
                        .Where(e => e.StartsWith("WARN:"))
                        .ToArray();
                }
            }

            summaries.Add(summary);
        }

        return summaries.AsReadOnly();
    }

    public void ClearCache()
    {
        lock (_lock)
        {
            _cache = null;
        }
    }

    public void CreateWorkflow(string alias, string displayName, string documentTypeAlias, string sourceType, string? blueprintId, string? blueprintName, string? documentTypeName = null)
    {
        var workflowsDirectory = Path.Combine(_webHostEnvironment.ContentRootPath, "updoc", "workflows");
        var folderPath = Path.Combine(workflowsDirectory, alias);

        if (Directory.Exists(folderPath))
        {
            throw new InvalidOperationException($"Workflow '{alias}' already exists.");
        }

        Directory.CreateDirectory(folderPath);

        // Create subfolders
        var sourceFolder = GetSourceSubfolder(folderPath);
        var destinationFolder = GetDestinationSubfolder(folderPath);
        var mapFolder = GetMapSubfolder(folderPath);
        Directory.CreateDirectory(sourceFolder);
        Directory.CreateDirectory(destinationFolder);
        Directory.CreateDirectory(mapFolder);

        var writeOptions = new JsonSerializerOptions { WriteIndented = true };

        // Create workflow.json identity file (at root)
        var identity = new WorkflowIdentity
        {
            Name = displayName,
            Alias = alias,
            DocumentTypeAlias = documentTypeAlias,
            DocumentTypeName = documentTypeName,
            BlueprintId = blueprintId,
            BlueprintName = blueprintName,
            SourceType = sourceType,
        };
        var identityJson = JsonSerializer.Serialize(identity, writeOptions);
        File.WriteAllText(Path.Combine(folderPath, "workflow.json"), identityJson);

        // Create stub source/source.json
        var source = new
        {
            version = "1.0",
            sourceTypes = new[] { sourceType },
            sections = Array.Empty<object>()
        };
        var sourceJson = JsonSerializer.Serialize(source, writeOptions);
        File.WriteAllText(Path.Combine(sourceFolder, "source.json"), sourceJson);

        // Create stub destination/destination.json
        var destination = new
        {
            version = "1.0",
            documentTypeAlias,
            blueprintId,
            blueprintName,
            fields = Array.Empty<object>(),
            blockGrids = Array.Empty<object>()
        };
        var destinationJson = JsonSerializer.Serialize(destination, writeOptions);
        File.WriteAllText(Path.Combine(destinationFolder, "destination.json"), destinationJson);

        // Create stub map/map.json
        var map = new
        {
            version = "1.0",
            mappings = Array.Empty<object>()
        };
        var mapJson = JsonSerializer.Serialize(map, writeOptions);
        File.WriteAllText(Path.Combine(mapFolder, "map.json"), mapJson);

        _logger.LogInformation("Created workflow: {Alias} (name: {DisplayName}, docType: {DocType}, sourceType: {SourceType}, blueprint: {Blueprint})",
            alias, displayName, documentTypeAlias, sourceType, blueprintId ?? "none");

        ClearCache();
    }

    public string UpdateWorkflowIdentity(string currentAlias, string newName, string newAlias)
    {
        var workflowsDirectory = Path.Combine(_webHostEnvironment.ContentRootPath, "updoc", "workflows");
        var folderPath = Path.Combine(workflowsDirectory, currentAlias);

        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow '{currentAlias}' does not exist.");
        }

        // Read existing identity
        var identity = ReadWorkflowIdentity(folderPath)
            ?? throw new InvalidOperationException($"Workflow '{currentAlias}' has no workflow.json.");

        // Update name
        identity.Name = newName;

        // If alias changed, rename the folder
        if (!currentAlias.Equals(newAlias, StringComparison.Ordinal))
        {
            var newFolderPath = Path.Combine(workflowsDirectory, newAlias);

            // Safety: ensure paths are inside the workflows directory
            var fullNewPath = Path.GetFullPath(newFolderPath);
            var fullWorkflowsPath = Path.GetFullPath(workflowsDirectory);
            if (!fullNewPath.StartsWith(fullWorkflowsPath, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Invalid workflow alias.");
            }

            if (Directory.Exists(newFolderPath))
            {
                throw new InvalidOperationException($"A workflow with alias '{newAlias}' already exists.");
            }

            Directory.Move(folderPath, newFolderPath);
            folderPath = newFolderPath;
            identity.Alias = newAlias;

            _logger.LogInformation("Renamed workflow folder '{OldAlias}' → '{NewAlias}'", currentAlias, newAlias);
        }

        // Write updated identity
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var identityJson = JsonSerializer.Serialize(identity, writeOptions);
        File.WriteAllText(Path.Combine(folderPath, "workflow.json"), identityJson);

        ClearCache();

        return identity.Alias;
    }

    public void UpdateWorkflowDestination(string alias, string documentTypeAlias, string? documentTypeName, string blueprintId, string? blueprintName)
    {
        var workflowsDirectory = Path.Combine(_webHostEnvironment.ContentRootPath, "updoc", "workflows");
        var folderPath = Path.Combine(workflowsDirectory, alias);

        if (!Directory.Exists(folderPath))
            throw new DirectoryNotFoundException($"Workflow '{alias}' does not exist.");

        var identity = ReadWorkflowIdentity(folderPath)
            ?? throw new InvalidOperationException($"Workflow '{alias}' has no workflow.json.");

        identity.DocumentTypeAlias = documentTypeAlias;
        identity.DocumentTypeName = documentTypeName;
        identity.BlueprintId = blueprintId;
        identity.BlueprintName = blueprintName;

        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var identityJson = JsonSerializer.Serialize(identity, writeOptions);
        File.WriteAllText(Path.Combine(folderPath, "workflow.json"), identityJson);

        _logger.LogInformation(
            "Updated destination for workflow '{Alias}': docType={DocType}, blueprint={Blueprint}",
            alias, documentTypeAlias, blueprintId);

        ClearCache();
    }

    public void DeleteWorkflow(string alias)
    {
        var workflowsDirectory = Path.Combine(_webHostEnvironment.ContentRootPath, "updoc", "workflows");
        var folderPath = Path.Combine(workflowsDirectory, alias);

        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow '{alias}' does not exist.");
        }

        // Safety: ensure the folder is actually inside the workflows directory
        var fullFolderPath = Path.GetFullPath(folderPath);
        var fullWorkflowsPath = Path.GetFullPath(workflowsDirectory);
        if (!fullFolderPath.StartsWith(fullWorkflowsPath, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid workflow path.");
        }

        Directory.Delete(folderPath, recursive: true);

        _logger.LogInformation("Deleted workflow: {Alias}", alias);

        ClearCache();
    }

    public void SaveSampleExtraction(string workflowAlias, RichExtractionResult extraction)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow folder '{workflowAlias}' does not exist.");
        }

        var sourceFolder = GetSourceSubfolder(folderPath);
        Directory.CreateDirectory(sourceFolder);
        var filePath = Path.Combine(sourceFolder, "sample-extraction.json");
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(extraction, writeOptions);
        File.WriteAllText(filePath, json);

        _logger.LogInformation("Saved sample extraction to {Path} ({Count} elements)",
            filePath, extraction.Elements.Count);
    }

    public void SaveDestinationConfig(string workflowAlias, DestinationConfig config)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow folder '{workflowAlias}' does not exist.");
        }

        var destFolder = GetDestinationSubfolder(folderPath);
        Directory.CreateDirectory(destFolder);
        var filePath = Path.Combine(destFolder, "destination.json");
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(config, writeOptions);
        File.WriteAllText(filePath, json);

        _logger.LogInformation("Saved destination config to {Path} ({FieldCount} fields, {BlockCount} block grids)",
            filePath, config.Fields.Count, config.BlockGrids?.Count ?? 0);

        ClearCache();
    }

    public void SaveMapConfig(string workflowAlias, MapConfig config)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow folder '{workflowAlias}' does not exist.");
        }

        var mapFolder = GetMapSubfolder(folderPath);
        Directory.CreateDirectory(mapFolder);
        var filePath = Path.Combine(mapFolder, "map.json");
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(config, writeOptions);
        File.WriteAllText(filePath, json);

        _logger.LogInformation("Saved map config to {Path} ({Count} mappings)",
            filePath, config.Mappings.Count);

        ClearCache();
    }

    public MapConfig? GetMapConfig(string workflowAlias)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        var filePath = ResolveFilePath(folderPath, "map", "map.json");

        if (!File.Exists(filePath))
            return null;

        var json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<MapConfig>(json, JsonOptions);
    }

    public DestinationConfig? GetDestinationConfig(string workflowAlias)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        var filePath = ResolveFilePath(folderPath, "destination", "destination.json");

        if (!File.Exists(filePath))
            return null;

        var json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<DestinationConfig>(json, JsonOptions);
    }

    public DocumentTypeConfig? GetConfigByAlias(string alias)
    {
        var folderPath = GetWorkflowFolderPath(alias);
        if (!Directory.Exists(folderPath))
            return null;

        try
        {
            return LoadDocumentTypeConfig(folderPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load config for workflow '{Alias}'", alias);
            return null;
        }
    }

    public RichExtractionResult? GetSampleExtraction(string workflowAlias)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        var filePath = ResolveFilePath(folderPath, "source", "sample-extraction.json");

        if (!File.Exists(filePath))
            return null;

        var json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<RichExtractionResult>(json, JsonOptions);
    }

    public void SaveAreaDetection(string workflowAlias, AreaDetectionResult result)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow folder '{workflowAlias}' does not exist.");
        }

        var sourceFolder = GetSourceSubfolder(folderPath);
        Directory.CreateDirectory(sourceFolder);
        var filePath = Path.Combine(sourceFolder, "area-detection.json");
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(result, writeOptions);
        File.WriteAllText(filePath, json);

        _logger.LogInformation("Saved area detection to {Path} ({Areas} areas, {Elements} elements)",
            filePath, result.Diagnostics.AreasDetected, result.Diagnostics.ElementsInAreas);
    }

    public AreaDetectionResult? GetAreaDetection(string workflowAlias)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        var filePath = ResolveFilePath(folderPath, "source", "area-detection.json");

        if (!File.Exists(filePath))
            return null;

        var json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<AreaDetectionResult>(json, JsonOptions);
    }

    public void SaveTransformResult(string workflowAlias, TransformResult result)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow folder '{workflowAlias}' does not exist.");
        }

        var sourceFolder = GetSourceSubfolder(folderPath);
        Directory.CreateDirectory(sourceFolder);
        var filePath = Path.Combine(sourceFolder, "transform.json");
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(result, writeOptions);
        File.WriteAllText(filePath, json);

        _logger.LogInformation("Saved transform result to {Path} ({Sections} sections)",
            filePath, result.AllSections.Count());
    }

    public TransformResult? GetTransformResult(string workflowAlias)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        var filePath = ResolveFilePath(folderPath, "source", "transform.json");

        if (!File.Exists(filePath))
            return null;

        var json = File.ReadAllText(filePath);
        var result = JsonSerializer.Deserialize<TransformResult>(json, JsonOptions);

        // v1.0 files have flat "sections" array, no "areas". Return null to force re-transform.
        if (result != null && result.Areas.Count == 0 && result.Version != "2.0")
        {
            _logger.LogInformation("Transform result for '{Name}' is v1.0 format, needs re-transform", workflowAlias);
            return null;
        }

        return result;
    }

    public TransformResult? UpdateSectionInclusion(string workflowAlias, string sectionId, bool included)
    {
        var result = GetTransformResult(workflowAlias);
        if (result == null) return null;

        var section = result.AllSections.FirstOrDefault(s =>
            string.Equals(s.Id, sectionId, StringComparison.OrdinalIgnoreCase));
        if (section == null) return null;

        section.Included = included;
        SaveTransformResult(workflowAlias, result);

        _logger.LogInformation("Updated section '{SectionId}' in workflow '{Name}' to Included={Included}",
            sectionId, workflowAlias, included);

        return result;
    }

    public TransformResult? UpdateSortOrder(string workflowAlias, int page, string? areaName, List<string> sortedIds)
    {
        var result = GetTransformResult(workflowAlias);
        if (result == null) return null;

        if (areaName == null)
        {
            // Sort areas within a page
            var pageAreas = result.Areas.Where(a => a.Page == page).ToList();
            for (var i = 0; i < sortedIds.Count; i++)
            {
                var area = pageAreas.FirstOrDefault(a =>
                    string.Equals(a.Name, sortedIds[i], StringComparison.OrdinalIgnoreCase));
                if (area != null)
                    area.SortOrder = i;
            }
            _logger.LogInformation("Updated area sort order for page {Page} in workflow '{Name}': {Order}",
                page, workflowAlias, string.Join(", ", sortedIds));
        }
        else
        {
            // Sort sections within an area
            var area = result.Areas.FirstOrDefault(a =>
                a.Page == page && string.Equals(a.Name, areaName, StringComparison.OrdinalIgnoreCase));
            if (area == null) return null;

            var allSections = area.AllSections.ToList();
            for (var i = 0; i < sortedIds.Count; i++)
            {
                var section = allSections.FirstOrDefault(s =>
                    string.Equals(s.Id, sortedIds[i], StringComparison.OrdinalIgnoreCase));
                if (section != null)
                    section.SortOrder = i;
            }
            _logger.LogInformation("Updated section sort order for area '{Area}' page {Page} in workflow '{Name}': {Order}",
                areaName, page, workflowAlias, string.Join(", ", sortedIds));
        }

        SaveTransformResult(workflowAlias, result);
        return result;
    }

    public SourceConfig? GetSourceConfig(string workflowAlias)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        var filePath = ResolveFilePath(folderPath, "source", "source.json");

        if (!File.Exists(filePath))
            return null;

        var json = File.ReadAllText(filePath);
        var config = JsonSerializer.Deserialize<SourceConfig>(json, JsonOptions);

        // Normalize legacy flat rules into groups for backward compatibility.
        // Old source.json files have sectionTitle/sectionContent as flat rules —
        // these need to be grouped so ContentTransformService treats them correctly.
        if (config?.AreaRules != null)
        {
            foreach (var (areaKey, areaRules) in config.AreaRules)
            {
                areaRules.NormalizeLegacyRules(areaKey);
            }
        }

        return config;
    }

    public void SaveSourceConfig(string workflowAlias, SourceConfig config)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow folder '{workflowAlias}' does not exist.");
        }

        var sourceFolder = GetSourceSubfolder(folderPath);
        Directory.CreateDirectory(sourceFolder);
        var filePath = Path.Combine(sourceFolder, "source.json");
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(config, writeOptions);
        File.WriteAllText(filePath, json);

        _logger.LogInformation("Saved source config to {Path}", filePath);

        ClearCache();
    }

    public void SaveAreaTemplate(string workflowAlias, AreaTemplate template)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        if (!Directory.Exists(folderPath))
        {
            throw new DirectoryNotFoundException($"Workflow folder '{workflowAlias}' does not exist.");
        }

        var sourceFolder = GetSourceSubfolder(folderPath);
        Directory.CreateDirectory(sourceFolder);
        var filePath = Path.Combine(sourceFolder, "area-template.json");
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(template, writeOptions);
        File.WriteAllText(filePath, json);

        _logger.LogInformation("Saved area template to {Path} ({Count} areas)",
            filePath, template.Areas.Count);
    }

    public AreaTemplate? GetAreaTemplate(string workflowAlias)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        var filePath = ResolveFilePath(folderPath, "source", "area-template.json");

        if (!File.Exists(filePath))
            return null;

        var json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<AreaTemplate>(json, JsonOptions);
    }

    public int BackfillContentTypeKeysForWorkflow(string workflowAlias)
    {
        var folderPath = GetWorkflowFolderPath(workflowAlias);
        if (!Directory.Exists(folderPath))
            return 0;

        var count = BackfillContentTypeKeys(folderPath);
        if (count > 0)
        {
            ClearCache();
            _logger.LogInformation("Backfilled {Count} contentTypeKey(s) for workflow '{Alias}'", count, workflowAlias);
        }
        return count;
    }

    private string GetWorkflowFolderPath(string workflowAlias)
    {
        return Path.Combine(_webHostEnvironment.ContentRootPath, "updoc", "workflows", workflowAlias);
    }

    private static string GetSourceSubfolder(string folderPath) => Path.Combine(folderPath, "source");
    private static string GetDestinationSubfolder(string folderPath) => Path.Combine(folderPath, "destination");
    private static string GetMapSubfolder(string folderPath) => Path.Combine(folderPath, "map");

    /// <summary>
    /// Resolves a file path checking subfolder first, falling back to root (pre-migration compat).
    /// </summary>
    private static string ResolveFilePath(string folderPath, string subfolder, string fileName)
    {
        var subfolderFile = Path.Combine(folderPath, subfolder, fileName);
        if (File.Exists(subfolderFile))
            return subfolderFile;

        var rootFile = Path.Combine(folderPath, fileName);
        if (File.Exists(rootFile))
            return rootFile;

        return subfolderFile; // Default to subfolder path (even if not exists — callers check)
    }

    private List<DocumentTypeConfig> LoadConfigs()
    {
        if (_cache != null) return _cache;

        lock (_lock)
        {
            if (_cache != null) return _cache;

            var configs = new List<DocumentTypeConfig>();
            var workflowsDirectory = Path.Combine(_webHostEnvironment.ContentRootPath, "updoc", "workflows");

            if (!Directory.Exists(workflowsDirectory))
            {
                _logger.LogInformation("UpDoc workflows directory not found at {Path}. No configs loaded.", workflowsDirectory);
                _cache = configs;
                return _cache;
            }

            // Look for subdirectories (each is a document type)
            var docTypeFolders = Directory.GetDirectories(workflowsDirectory);
            _logger.LogInformation("Found {Count} document type folder(s) in {Path}", docTypeFolders.Length, workflowsDirectory);

            foreach (var folderPath in docTypeFolders)
            {
                try
                {
                    var config = LoadDocumentTypeConfig(folderPath);
                    if (config != null)
                    {
                        // Validate cross-file references
                        var validationErrors = ValidateConfig(config);
                        if (validationErrors.Any(e => !e.StartsWith("WARN:")))
                        {
                            _logger.LogError("Config validation failed for {Folder}: {Errors}",
                                Path.GetFileName(folderPath), string.Join("; ", validationErrors));
                            continue;
                        }

                        // Log warnings (except orphaned blockKeys — those are surfaced in the UI only)
                        foreach (var warning in validationErrors.Where(e => e.StartsWith("WARN:") && !e.Contains("orphaned")))
                        {
                            _logger.LogWarning("{Warning}", warning);
                        }

                        configs.Add(config);
                        _logger.LogInformation("Loaded config: {DocType} (blueprint: {Blueprint})",
                            config.DocumentTypeAlias, config.Destination.BlueprintId ?? "none");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to load config from folder: {Folder}", Path.GetFileName(folderPath));
                }
            }

            _cache = configs;
            return _cache;
        }
    }

    private DocumentTypeConfig? LoadDocumentTypeConfig(string folderPath)
    {
        var folderName = Path.GetFileName(folderPath);

        // Resolve file paths (subfolder-first, root-fallback for pre-migration compat)
        var destinationFile = ResolveFilePath(folderPath, "destination", "destination.json");
        var mapFile = ResolveFilePath(folderPath, "map", "map.json");
        var sourceFile = ResolveFilePath(folderPath, "source", "source.json");

        if (!File.Exists(destinationFile))
        {
            _logger.LogWarning("Config folder {Folder} missing destination file, skipping.", folderName);
            return null;
        }

        if (!File.Exists(mapFile))
        {
            _logger.LogWarning("Config folder {Folder} missing map file, skipping.", folderName);
            return null;
        }

        // Load source config
        var sources = new Dictionary<string, SourceConfig>(StringComparer.OrdinalIgnoreCase);

        if (File.Exists(sourceFile))
        {
            var sourceJson = File.ReadAllText(sourceFile);
            var source = JsonSerializer.Deserialize<SourceConfig>(sourceJson, JsonOptions);
            if (source != null && source.SourceTypes.Count > 0)
            {
                source.WorkflowAlias = folderName;
                sources[source.SourceTypes[0]] = source;
                _logger.LogInformation("  Loaded source config: {SourceType} from {Path}", source.SourceTypes[0], sourceFile);
            }
        }

        if (sources.Count == 0)
        {
            _logger.LogWarning("Config folder {Folder} has no source config, skipping.", folderName);
            return null;
        }

        // Load destination and map
        var destinationJson = File.ReadAllText(destinationFile);
        var destination = JsonSerializer.Deserialize<DestinationConfig>(destinationJson, JsonOptions);

        var mapJson = File.ReadAllText(mapFile);
        var map = JsonSerializer.Deserialize<MapConfig>(mapJson, JsonOptions);

        if (destination == null || map == null)
        {
            _logger.LogWarning("Failed to deserialize destination or map config in {Folder}.", folderName);
            return null;
        }

        if (string.IsNullOrEmpty(destination.DocumentTypeAlias))
        {
            _logger.LogWarning("Config folder {Folder} has no documentTypeAlias in destination.json, skipping.", folderName);
            return null;
        }

        return new DocumentTypeConfig
        {
            FolderPath = folderPath,
            DocumentTypeAlias = destination.DocumentTypeAlias,
            Sources = sources,
            Destination = destination,
            Map = map
        };
    }

    /// <summary>
    /// Reads workflow.json from a workflow folder, if it exists.
    /// </summary>
    private WorkflowIdentity? ReadWorkflowIdentity(string folderPath)
    {
        var identityFile = Path.Combine(folderPath, "workflow.json");
        if (!File.Exists(identityFile))
            return null;

        try
        {
            var json = File.ReadAllText(identityFile);
            return JsonSerializer.Deserialize<WorkflowIdentity>(json, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read workflow.json in {Folder}", Path.GetFileName(folderPath));
            return null;
        }
    }

    /// <summary>
    /// Generates a display name from blueprint name and source type.
    /// e.g. "Group Tour" + "pdf" → "Group Tour - PDF"
    /// </summary>
    internal static string GenerateDisplayName(string? blueprintName, string sourceType)
    {
        var sourceLabel = FormatSourceTypeLabel(sourceType);
        return string.IsNullOrEmpty(blueprintName)
            ? sourceLabel
            : $"{blueprintName} - {sourceLabel}";
    }

    /// <summary>
    /// Formats a source type key into a human-readable label.
    /// "pdf" → "PDF", "web" → "Web Page", "markdown" → "Markdown"
    /// </summary>
    private static string FormatSourceTypeLabel(string sourceType)
    {
        return sourceType.ToLowerInvariant() switch
        {
            "pdf" => "PDF",
            "web" => "Web Page",
            "web page" => "Web Page",
            "markdown" => "Markdown",
            "doc" => "Word Document",
            _ => System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(sourceType)
        };
    }

    /// <summary>
    /// Converts a friendly name to a camelCase alias, matching Umbraco's frontend toCamelCase() logic.
    /// e.g. "Group Tour - PDF" → "groupTourPdf", "Test Basic Markdown" → "testBasicMarkdown"
    /// </summary>
    internal static string ToCamelCase(string text)
    {
        var matches = Regex.Matches(text, @"[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+");
        if (matches.Count == 0) return string.Empty;
        var parts = matches.Select(m => char.ToUpperInvariant(m.Value[0]) + m.Value[1..].ToLowerInvariant());
        var joined = string.Concat(parts);
        return char.ToLowerInvariant(joined[0]) + joined[1..];
    }

    /// <summary>
    /// Scans all workflow folders and generates workflow.json for any that don't have one.
    /// Called on first access to ensure existing workflows are migrated.
    /// </summary>
    internal void MigrateExistingWorkflows()
    {
        var workflowsDirectory = Path.Combine(_webHostEnvironment.ContentRootPath, "updoc", "workflows");
        if (!Directory.Exists(workflowsDirectory))
            return;

        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var migrated = 0;

        foreach (var folderPath in Directory.GetDirectories(workflowsDirectory))
        {
            var identityFile = Path.Combine(folderPath, "workflow.json");
            if (File.Exists(identityFile))
                continue;

            var folderName = Path.GetFileName(folderPath);

            // Read metadata from existing files
            string? documentTypeAlias = null;
            string? blueprintId = null;
            string? blueprintName = null;
            string? sourceType = null;

            // Try destination.json for blueprint/doctype info
            var destinationFile = Path.Combine(folderPath, "destination.json");
            if (File.Exists(destinationFile))
            {
                try
                {
                    var json = File.ReadAllText(destinationFile);
                    var dest = JsonSerializer.Deserialize<DestinationConfig>(json, JsonOptions);
                    if (dest != null)
                    {
                        documentTypeAlias = dest.DocumentTypeAlias;
                        blueprintId = dest.BlueprintId;
                        blueprintName = dest.BlueprintName;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Migration: failed to read destination.json in {Folder}", folderName);
                }
            }

            // Try source.json for source type
            var sourceFile = Path.Combine(folderPath, "source.json");
            if (File.Exists(sourceFile))
            {
                try
                {
                    var json = File.ReadAllText(sourceFile);
                    var source = JsonSerializer.Deserialize<SourceConfig>(json, JsonOptions);
                    sourceType = source?.SourceTypes?.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Migration: failed to read source.json in {Folder}", folderName);
                }
            }

            // Generate identity
            var identity = new WorkflowIdentity
            {
                Name = GenerateDisplayName(blueprintName, sourceType ?? "unknown"),
                Alias = folderName,
                DocumentTypeAlias = documentTypeAlias ?? string.Empty,
                DocumentTypeName = null, // Resolved at API level via IContentTypeService
                BlueprintId = blueprintId,
                BlueprintName = blueprintName,
                SourceType = sourceType ?? string.Empty,
            };

            try
            {
                var identityJson = JsonSerializer.Serialize(identity, writeOptions);
                File.WriteAllText(identityFile, identityJson);
                migrated++;
                _logger.LogInformation("Migration: generated workflow.json for '{Folder}' (name: {Name})",
                    folderName, identity.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Migration: failed to write workflow.json for '{Folder}'", folderName);
            }
        }

        if (migrated > 0)
        {
            _logger.LogInformation("Migration: generated workflow.json for {Count} existing workflow(s)", migrated);
        }

        // Pass 2: Rename folders from kebab-case to camelCase and update workflow.json alias
        var renamed = 0;
        foreach (var folderPath in Directory.GetDirectories(workflowsDirectory))
        {
            var folderName = Path.GetFileName(folderPath);
            var identity = ReadWorkflowIdentity(folderPath);
            if (identity == null) continue;

            var expectedAlias = ToCamelCase(identity.Name);
            if (string.IsNullOrEmpty(expectedAlias)) continue;

            // Skip if folder already matches the expected camelCase alias
            if (folderName.Equals(expectedAlias, StringComparison.Ordinal)) continue;

            var newFolderPath = Path.Combine(workflowsDirectory, expectedAlias);

            // Skip if target folder already exists (avoid collision)
            if (Directory.Exists(newFolderPath))
            {
                _logger.LogWarning("Migration: cannot rename '{OldFolder}' → '{NewFolder}' — target already exists",
                    folderName, expectedAlias);
                continue;
            }

            try
            {
                Directory.Move(folderPath, newFolderPath);

                // Update workflow.json with the new alias
                identity.Alias = expectedAlias;
                var identityJson = JsonSerializer.Serialize(identity, writeOptions);
                File.WriteAllText(Path.Combine(newFolderPath, "workflow.json"), identityJson);

                renamed++;
                _logger.LogInformation("Migration: renamed folder '{OldFolder}' → '{NewFolder}' (alias: {Alias})",
                    folderName, expectedAlias, expectedAlias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Migration: failed to rename folder '{OldFolder}' → '{NewFolder}'",
                    folderName, expectedAlias);
            }
        }

        if (renamed > 0)
        {
            _logger.LogInformation("Migration: renamed {Count} workflow folder(s) to camelCase", renamed);
            ClearCache();
        }

        // Pass 3: Move files from flat root into source/, destination/, map/ subfolders
        var moved = 0;
        foreach (var folderPath in Directory.GetDirectories(workflowsDirectory))
        {
            var folderName = Path.GetFileName(folderPath);

            // Check if files are still at root (flat layout) — source.json at root means not yet migrated
            var rootSourceFile = Path.Combine(folderPath, "source.json");
            var subfolderSourceFile = Path.Combine(GetSourceSubfolder(folderPath), "source.json");
            if (!File.Exists(rootSourceFile) || File.Exists(subfolderSourceFile))
                continue; // Already migrated or no source.json

            try
            {
                // Create subfolders
                var sourceFolder = GetSourceSubfolder(folderPath);
                var destinationFolder = GetDestinationSubfolder(folderPath);
                var mapFolder = GetMapSubfolder(folderPath);
                Directory.CreateDirectory(sourceFolder);
                Directory.CreateDirectory(destinationFolder);
                Directory.CreateDirectory(mapFolder);

                // Move source files
                MoveFileIfExists(folderPath, sourceFolder, "source.json");
                MoveFileIfExists(folderPath, sourceFolder, "sample-extraction.json");
                MoveFileIfExists(folderPath, sourceFolder, "area-detection.json");
                MoveFileIfExists(folderPath, sourceFolder, "area-template.json");
                MoveFileIfExists(folderPath, sourceFolder, "transform.json");

                // Move destination file
                MoveFileIfExists(folderPath, destinationFolder, "destination.json");

                // Move map file
                MoveFileIfExists(folderPath, mapFolder, "map.json");

                moved++;
                _logger.LogInformation("Migration: moved files into subfolders for '{Folder}'", folderName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Migration: failed to move files into subfolders for '{Folder}'", folderName);
            }
        }

        if (moved > 0)
        {
            _logger.LogInformation("Migration: restructured {Count} workflow(s) into subfolders", moved);
            ClearCache();
        }

        // Pass 4: Backfill contentTypeKey on map.json destinations that have blockKey but no contentTypeKey
        var backfilled = 0;
        foreach (var folderPath in Directory.GetDirectories(workflowsDirectory))
        {
            var folderName = Path.GetFileName(folderPath);
            var count = BackfillContentTypeKeys(folderPath);
            if (count > 0)
            {
                backfilled += count;
                _logger.LogInformation("Migration: backfilled {Count} contentTypeKey(s) in '{Folder}'", count, folderName);
            }
        }

        if (backfilled > 0)
        {
            _logger.LogInformation("Migration: backfilled contentTypeKey for {Count} mapping(s) total", backfilled);
            ClearCache();
        }

        // Pass 5: Backfill stable GUIDs on rules/groups, StableKeys in transform.json, sourceKeys in map.json
        var pass5Count = 0;
        foreach (var folderPath in Directory.GetDirectories(workflowsDirectory))
        {
            var folderName = Path.GetFileName(folderPath);
            var count = BackfillStableIdentity(folderPath);
            if (count > 0)
            {
                pass5Count += count;
                _logger.LogInformation("Migration: backfilled {Count} stable identity field(s) in '{Folder}'", count, folderName);
            }
        }

        if (pass5Count > 0)
        {
            _logger.LogInformation("Migration: backfilled {Count} stable identity field(s) total", pass5Count);
            ClearCache();
        }
    }

    /// <summary>
    /// Backfills contentTypeKey on map.json destinations for a specific workflow folder.
    /// Returns the number of mappings backfilled.
    /// </summary>
    internal int BackfillContentTypeKeys(string folderPath)
    {
        var mapFile = ResolveFilePath(folderPath, "map", "map.json");
        var destinationFile = ResolveFilePath(folderPath, "destination", "destination.json");

        if (!File.Exists(mapFile) || !File.Exists(destinationFile))
            return 0;

        MapConfig? mapConfig;
        DestinationConfig? destConfig;
        try
        {
            mapConfig = JsonSerializer.Deserialize<MapConfig>(File.ReadAllText(mapFile), JsonOptions);
            destConfig = JsonSerializer.Deserialize<DestinationConfig>(File.ReadAllText(destinationFile), JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Backfill: failed to read map/destination in {Folder}", Path.GetFileName(folderPath));
            return 0;
        }

        if (mapConfig == null || destConfig == null) return 0;

        // Build blockKey → contentTypeKey lookup from destination.json
        var blockKeyToContentTypeKey = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var container in (destConfig.BlockGrids ?? Enumerable.Empty<DestinationBlockGrid>())
            .Concat(destConfig.BlockLists ?? Enumerable.Empty<DestinationBlockGrid>()))
        {
            foreach (var block in container.Blocks)
            {
                if (!string.IsNullOrEmpty(block.Key) && !string.IsNullOrEmpty(block.ContentTypeKey))
                {
                    blockKeyToContentTypeKey[block.Key] = block.ContentTypeKey;
                }
            }
        }

        // Backfill contentTypeKey where blockKey exists but contentTypeKey is missing
        var count = 0;
        foreach (var mapping in mapConfig.Mappings)
        {
            foreach (var dest in mapping.Destinations)
            {
                if (!string.IsNullOrEmpty(dest.BlockKey)
                    && string.IsNullOrEmpty(dest.ContentTypeKey)
                    && blockKeyToContentTypeKey.TryGetValue(dest.BlockKey, out var ctKey))
                {
                    dest.ContentTypeKey = ctKey;
                    count++;
                }
            }
        }

        if (count > 0)
        {
            var writeOptions = new JsonSerializerOptions { WriteIndented = true };
            File.WriteAllText(mapFile, JsonSerializer.Serialize(mapConfig, writeOptions));
        }

        return count;
    }

    /// <summary>
    /// Backfills stable identity fields for a workflow:
    /// 5a: GUIDs on rules/groups in source.json
    /// 5b: StableKeys in transform.json (matched by rule name)
    /// 5c: sourceKeys in map.json (matched by section in transform.json)
    /// </summary>
    internal int BackfillStableIdentity(string folderPath)
    {
        var writeOptions = new JsonSerializerOptions { WriteIndented = true };
        var totalBackfilled = 0;

        // --- Pass 5a: Backfill GUIDs on rules/groups in source.json ---
        var sourceFile = ResolveFilePath(folderPath, "source", "source.json");
        Dictionary<string, AreaRules>? areaRules = null;
        if (File.Exists(sourceFile))
        {
            try
            {
                var sourceConfig = JsonSerializer.Deserialize<SourceConfig>(File.ReadAllText(sourceFile), JsonOptions);
                if (sourceConfig?.AreaRules != null)
                {
                    areaRules = sourceConfig.AreaRules;
                    var rulesModified = false;

                    foreach (var area in areaRules.Values)
                    {
                        foreach (var group in area.Groups)
                        {
                            if (string.IsNullOrEmpty(group.Id))
                            {
                                group.Id = Guid.NewGuid().ToString();
                                rulesModified = true;
                                totalBackfilled++;
                            }
                            foreach (var rule in group.Rules)
                            {
                                if (string.IsNullOrEmpty(rule.Id))
                                {
                                    rule.Id = Guid.NewGuid().ToString();
                                    rulesModified = true;
                                    totalBackfilled++;
                                }
                            }
                        }
                        foreach (var rule in area.Rules)
                        {
                            if (string.IsNullOrEmpty(rule.Id))
                            {
                                rule.Id = Guid.NewGuid().ToString();
                                rulesModified = true;
                                totalBackfilled++;
                            }
                        }
                    }

                    if (rulesModified)
                    {
                        File.WriteAllText(sourceFile, JsonSerializer.Serialize(sourceConfig, writeOptions));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Migration 5a: failed to backfill GUIDs in source.json for {Folder}", Path.GetFileName(folderPath));
            }
        }

        // --- Pass 5b: Backfill StableKeys in transform.json (match rules by name) ---
        var transformFile = ResolveFilePath(folderPath, "source", "transform.json");
        TransformResult? transform = null;
        if (File.Exists(transformFile) && areaRules != null)
        {
            try
            {
                transform = JsonSerializer.Deserialize<TransformResult>(File.ReadAllText(transformFile), JsonOptions);
                if (transform != null)
                {
                    // Build ruleName → GUID lookup from areaRules
                    // For grouped rules, key is groupId (sections inherit the group GUID)
                    // For ungrouped rules, key is the rule's own Id
                    var ruleNameToId = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    var groupNameToId = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

                    foreach (var area in areaRules.Values)
                    {
                        foreach (var group in area.Groups)
                        {
                            if (!string.IsNullOrEmpty(group.Id))
                            {
                                groupNameToId.TryAdd(group.Name, group.Id);
                            }
                        }
                        foreach (var rule in area.Rules)
                        {
                            if (!string.IsNullOrEmpty(rule.Id) && !string.IsNullOrEmpty(rule.Role))
                            {
                                ruleNameToId.TryAdd(rule.Role, rule.Id);
                            }
                        }
                    }

                    var transformModified = false;
                    foreach (var section in transform.AllSections)
                    {
                        if (!string.IsNullOrEmpty(section.StableKey)) continue;

                        // Try matching by group name first (grouped sections)
                        if (!string.IsNullOrEmpty(section.GroupName) && groupNameToId.TryGetValue(section.GroupName, out var groupId))
                        {
                            section.StableKey = groupId;
                            transformModified = true;
                            totalBackfilled++;
                        }
                        // Then try matching by rule name (ungrouped sections)
                        else if (!string.IsNullOrEmpty(section.RuleName) && ruleNameToId.TryGetValue(section.RuleName, out var ruleId))
                        {
                            section.StableKey = ruleId;
                            transformModified = true;
                            totalBackfilled++;
                        }
                    }

                    if (transformModified)
                    {
                        File.WriteAllText(transformFile, JsonSerializer.Serialize(transform, writeOptions));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Migration 5b: failed to backfill StableKeys in transform.json for {Folder}", Path.GetFileName(folderPath));
            }
        }

        // --- Pass 5c: Backfill sourceKeys in map.json (match sections in transform.json) ---
        var mapFile = ResolveFilePath(folderPath, "map", "map.json");
        if (File.Exists(mapFile) && transform != null)
        {
            try
            {
                var mapConfig = JsonSerializer.Deserialize<MapConfig>(File.ReadAllText(mapFile), JsonOptions);
                if (mapConfig != null)
                {
                    // Build sectionId → stableKey lookup from transform
                    var sectionIdToStableKey = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                    foreach (var section in transform.AllSections)
                    {
                        if (!string.IsNullOrEmpty(section.StableKey))
                        {
                            sectionIdToStableKey[section.Id] = section.StableKey;
                        }
                    }

                    var mapModified = false;
                    foreach (var mapping in mapConfig.Mappings)
                    {
                        if (!string.IsNullOrEmpty(mapping.SourceKey)) continue;

                        // Extract section ID from source (e.g., "features.content" → "features")
                        var dotIndex = mapping.Source.LastIndexOf('.');
                        var sectionId = dotIndex >= 0 ? mapping.Source[..dotIndex] : mapping.Source;

                        if (sectionIdToStableKey.TryGetValue(sectionId, out var stableKey))
                        {
                            mapping.SourceKey = stableKey;
                            mapModified = true;
                            totalBackfilled++;
                        }
                    }

                    if (mapModified)
                    {
                        File.WriteAllText(mapFile, JsonSerializer.Serialize(mapConfig, writeOptions));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Migration 5c: failed to backfill sourceKeys in map.json for {Folder}", Path.GetFileName(folderPath));
            }
        }

        return totalBackfilled;
    }

    private static void MoveFileIfExists(string sourceDir, string targetDir, string fileName)
    {
        var sourcePath = Path.Combine(sourceDir, fileName);
        if (!File.Exists(sourcePath))
            return;

        var targetPath = Path.Combine(targetDir, fileName);
        File.Move(sourcePath, targetPath);
    }
}
