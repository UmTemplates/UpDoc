using Asp.Versioning;
using UpDoc.Models;
using UpDoc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace UpDoc.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("umbraco/management/api/v{version:apiVersion}/updoc/workflows")]
[MapToApi("updoc")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[JsonOptionsName("UmbracoManagementApi")]
public class WorkflowController : ControllerBase
{
    private readonly IWorkflowService _workflowService;
    private readonly IDestinationStructureService _destinationStructureService;
    private readonly IPdfPagePropertiesService _pdfPagePropertiesService;
    private readonly IMarkdownExtractionService _markdownExtractionService;
    private readonly IHtmlExtractionService _htmlExtractionService;
    private readonly IContentTransformService _contentTransformService;
    private readonly IContentTypeService _contentTypeService;
    private readonly IMediaService _mediaService;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger<WorkflowController> _logger;

    public WorkflowController(
        IWorkflowService workflowService,
        IDestinationStructureService destinationStructureService,
        IPdfPagePropertiesService pdfPagePropertiesService,
        IMarkdownExtractionService markdownExtractionService,
        IHtmlExtractionService htmlExtractionService,
        IContentTransformService contentTransformService,
        IContentTypeService contentTypeService,
        IMediaService mediaService,
        IWebHostEnvironment webHostEnvironment,
        ILogger<WorkflowController> logger)
    {
        _workflowService = workflowService;
        _destinationStructureService = destinationStructureService;
        _pdfPagePropertiesService = pdfPagePropertiesService;
        _markdownExtractionService = markdownExtractionService;
        _htmlExtractionService = htmlExtractionService;
        _contentTransformService = contentTransformService;
        _contentTypeService = contentTypeService;
        _mediaService = mediaService;
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var summaries = _workflowService.GetAllWorkflowSummaries();

        // Resolve document type names for any summaries missing them
        foreach (var summary in summaries)
        {
            if (summary.DocumentTypeName == null && !string.IsNullOrEmpty(summary.DocumentTypeAlias))
            {
                var contentType = _contentTypeService.Get(summary.DocumentTypeAlias);
                if (contentType != null)
                {
                    summary.DocumentTypeName = contentType.Name;
                }
            }
        }

        return Ok(summaries);
    }

    [HttpGet("active")]
    public IActionResult GetActive()
    {
        var summaries = _workflowService.GetAllWorkflowSummaries();
        var complete = summaries.Where(s => s.IsComplete).ToList();

        return Ok(new
        {
            documentTypeAliases = complete
                .Select(s => s.DocumentTypeAlias)
                .Where(a => !string.IsNullOrEmpty(a))
                .Distinct()
                .ToArray(),
            blueprintIds = complete
                .Select(s => s.BlueprintId)
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .ToArray(),
        });
    }

    [HttpGet("{alias}")]
    public async Task<IActionResult> GetByAlias(string alias)
    {
        var config = _workflowService.GetConfigByAlias(alias);

        if (config == null)
        {
            return NotFound(new { error = $"No workflow found with alias '{alias}'" });
        }

        // Always regenerate destination from blueprint to ensure it reflects
        // the current blueprint state (block ordering, property changes, etc.)
        if (!string.IsNullOrEmpty(config.DocumentTypeAlias)
            && !string.IsNullOrEmpty(config.Destination.BlueprintId))
        {
            try
            {
                var destinationConfig = await _destinationStructureService.BuildDestinationConfigAsync(
                    config.DocumentTypeAlias,
                    config.Destination.BlueprintId,
                    config.Destination.BlueprintName);
                _workflowService.SaveDestinationConfig(alias, destinationConfig);
                config.Destination = destinationConfig;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to regenerate destination for workflow '{Alias}', using cached version", alias);
            }
        }

        // Validate cross-file references and attach warnings
        var validationErrors = _workflowService.ValidateConfig(config);
        config.ValidationWarnings = validationErrors
            .Where(e => e.StartsWith("WARN:"))
            .ToArray();

        return Ok(config);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkflowRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "Workflow name is required." });
        }

        if (string.IsNullOrWhiteSpace(request.DocumentTypeAlias))
        {
            return BadRequest(new { error = "Document type alias is required." });
        }

        if (string.IsNullOrWhiteSpace(request.SourceType))
        {
            return BadRequest(new { error = "Source type is required." });
        }

        try
        {
            var alias = string.IsNullOrWhiteSpace(request.Alias)
                ? WorkflowService.ToCamelCase(request.Name)
                : request.Alias;

            // Resolve document type name from alias
            string? documentTypeName = null;
            var contentType = _contentTypeService.Get(request.DocumentTypeAlias);
            if (contentType != null)
            {
                documentTypeName = contentType.Name;
            }

            _workflowService.CreateWorkflow(
                alias,
                request.Name,
                request.DocumentTypeAlias,
                request.SourceType,
                request.BlueprintId,
                request.BlueprintName,
                documentTypeName);

            // Auto-populate destination.json from document type structure
            try
            {
                var destinationConfig = await _destinationStructureService.BuildDestinationConfigAsync(
                    request.DocumentTypeAlias,
                    request.BlueprintId,
                    request.BlueprintName);
                _workflowService.SaveDestinationConfig(alias, destinationConfig);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to auto-populate destination for workflow '{Alias}'. Empty stub will be used.", alias);
            }

            return Created(
                $"/umbraco/management/api/v1/updoc/workflows/{alias}",
                new { name = request.Name, alias });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpDelete("{alias}")]
    public IActionResult Delete(string alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
        {
            return BadRequest(new { error = "Workflow alias is required." });
        }

        try
        {
            _workflowService.DeleteWorkflow(alias);
            return NoContent();
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{alias}/identity")]
    public IActionResult UpdateIdentity(string alias, [FromBody] UpdateIdentityRequest request)
    {
        if (string.IsNullOrWhiteSpace(alias))
        {
            return BadRequest(new { error = "Workflow alias is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "Workflow name is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Alias))
        {
            return BadRequest(new { error = "Workflow alias is required." });
        }

        try
        {
            var newAlias = _workflowService.UpdateWorkflowIdentity(alias, request.Name, request.Alias);
            return Ok(new { name = request.Name, alias = newAlias });
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{alias}/destination")]
    public async Task<IActionResult> ChangeDestination(string alias, [FromBody] ChangeDestinationRequest request)
    {
        if (string.IsNullOrWhiteSpace(alias))
            return BadRequest(new { error = "Workflow alias is required." });

        if (string.IsNullOrWhiteSpace(request.DocumentTypeAlias))
            return BadRequest(new { error = "Document type alias is required." });

        if (string.IsNullOrWhiteSpace(request.BlueprintId))
            return BadRequest(new { error = "Blueprint ID is required." });

        try
        {
            // Resolve document type name if not provided
            var documentTypeName = request.DocumentTypeName;
            if (string.IsNullOrEmpty(documentTypeName))
            {
                var contentType = _contentTypeService.Get(request.DocumentTypeAlias);
                documentTypeName = contentType?.Name;
            }

            // Step 1: Update workflow.json identity
            _workflowService.UpdateWorkflowDestination(
                alias,
                request.DocumentTypeAlias,
                documentTypeName,
                request.BlueprintId,
                request.BlueprintName);

            // Step 2: Load old destination.json before regenerating
            var oldDestination = _workflowService.GetDestinationConfig(alias);

            // Step 3: Generate new destination.json from the new blueprint
            var newDestination = await _destinationStructureService.BuildDestinationConfigAsync(
                request.DocumentTypeAlias,
                request.BlueprintId,
                request.BlueprintName);

            // Step 4: Reconcile map.json blockKeys
            var reconciliation = ReconcileBlockKeys(alias, oldDestination, newDestination);

            // Step 5: Save new destination.json
            _workflowService.SaveDestinationConfig(alias, newDestination);

            return Ok(new RegenerateDestinationResponse
            {
                Destination = newDestination,
                Reconciliation = reconciliation,
            });
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{alias}/sample-extraction")]
    public async Task<IActionResult> ExtractSample(string alias, [FromBody] SampleExtractionRequest request)
    {
        // Detect source type from workflow config
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        var sourceType = sourceConfig?.SourceTypes?.FirstOrDefault() ?? "pdf";

        RichExtractionResult result;
        string fileName;

        if (sourceType == "web" && !string.IsNullOrWhiteSpace(request.Url))
        {
            // Web extraction from URL
            result = await _htmlExtractionService.ExtractRichFromUrl(request.Url);
            fileName = request.Url;
        }
        else if (sourceType == "web" && request.MediaKey != Guid.Empty)
        {
            // Web extraction from uploaded HTML file (fallback)
            var absolutePath = ResolveMediaFilePath(request.MediaKey);
            if (absolutePath == null)
                return NotFound(new { error = "Media item not found or file not on disk" });
            result = _htmlExtractionService.ExtractRichFromFile(absolutePath);
            var media = _mediaService.GetById(request.MediaKey);
            fileName = media?.Name ?? Path.GetFileName(absolutePath);
        }
        else
        {
            // PDF or Markdown — require media key
            var absolutePath = ResolveMediaFilePath(request.MediaKey);
            if (absolutePath == null)
                return NotFound(new { error = "Media item not found or file not on disk" });

            var media = _mediaService.GetById(request.MediaKey);
            fileName = media?.Name ?? Path.GetFileName(absolutePath);

            if (sourceType == "markdown")
            {
                result = _markdownExtractionService.ExtractRich(absolutePath);
            }
            else
            {
                // PDF extraction (default)
                var includePages = ResolveIncludePages(absolutePath, sourceConfig);
                result = _pdfPagePropertiesService.ExtractRichDump(absolutePath, includePages);
            }
        }

        if (!string.IsNullOrEmpty(result.Error))
        {
            return BadRequest(new { error = result.Error });
        }

        // Populate source metadata
        result.Source.FileName = fileName;
        if (request.MediaKey != Guid.Empty)
            result.Source.MediaKey = request.MediaKey.ToString();

        try
        {
            _workflowService.SaveSampleExtraction(alias, result);

            if (sourceType == "web")
            {
                // Build area detection result from htmlArea tags on elements (respects container promotions)
                var areaDetection = BuildAreaDetectionFromWeb(result, sourceConfig?.ContainerOverrides);
                _workflowService.SaveAreaDetection(alias, areaDetection);

                // Generate transform from area-grouped content (respects excluded areas + container overrides)
                var transformResult = ConvertStructuredToTransformResult(result, sourceConfig?.ExcludedAreas, sourceConfig?.ContainerOverrides);
                _workflowService.SaveTransformResult(alias, transformResult);
            }
            else if (sourceType == "markdown")
            {
                // Build area detection with a single "Content" area for consistent UI
                var areaDetection = BuildAreaDetectionFromMarkdown(result);
                _workflowService.SaveAreaDetection(alias, areaDetection);

                // Auto-generate transform for markdown (heading-based grouping)
                var transformResult = ConvertStructuredToTransformResult(result);
                _workflowService.SaveTransformResult(alias, transformResult);
            }
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }

        _logger.LogInformation("Extracted and saved sample for workflow '{Alias}' ({SourceType}): {Count} elements from {FileName}",
            alias, sourceType, result.Elements.Count, fileName);

        return Ok(result);
    }

    [HttpPost("{alias}/regenerate-destination")]
    public async Task<IActionResult> RegenerateDestination(string alias)
    {
        var configs = _workflowService.GetAllConfigs();
        var config = configs.FirstOrDefault(c =>
            Path.GetFileName(c.FolderPath).Equals(alias, StringComparison.OrdinalIgnoreCase));

        if (config == null)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }

        try
        {
            // Step 1: Load old destination.json before regenerating
            var oldDestination = _workflowService.GetDestinationConfig(alias);

            // Step 2: Generate new destination.json
            var newDestination = await _destinationStructureService.BuildDestinationConfigAsync(
                config.DocumentTypeAlias,
                config.Destination.BlueprintId,
                config.Destination.BlueprintName);

            // Step 3: Reconcile map.json blockKeys
            var reconciliation = ReconcileBlockKeys(alias, oldDestination, newDestination);

            // Step 4: Save new destination.json
            _workflowService.SaveDestinationConfig(alias, newDestination);

            return Ok(new RegenerateDestinationResponse
            {
                Destination = newDestination,
                Reconciliation = reconciliation,
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{alias}/backfill-content-type-keys")]
    public IActionResult BackfillContentTypeKeys(string alias)
    {
        var count = _workflowService.BackfillContentTypeKeysForWorkflow(alias);
        return Ok(new { backfilled = count });
    }

    private ReconciliationResult ReconcileBlockKeys(
        string alias,
        DestinationConfig? oldDestination,
        DestinationConfig newDestination)
    {
        var result = new ReconciliationResult();

        var mapConfig = _workflowService.GetMapConfig(alias);
        if (mapConfig == null || oldDestination == null)
            return result;

        // Build lookup: contentTypeKey → new blockKey from new destination
        var newBlocksByContentTypeKey = GetAllBlocks(newDestination)
            .Where(b => !string.IsNullOrEmpty(b.ContentTypeKey))
            .ToDictionary(b => b.ContentTypeKey!, b => b);

        // Build lookup: old blockKey → contentTypeKey from old destination
        var oldBlockKeyToContentTypeKey = GetAllBlocks(oldDestination)
            .Where(b => !string.IsNullOrEmpty(b.ContentTypeKey) && !string.IsNullOrEmpty(b.Key))
            .ToDictionary(b => b.Key, b => b.ContentTypeKey!);

        var modified = false;

        foreach (var mapping in mapConfig.Mappings)
        {
            foreach (var dest in mapping.Destinations)
            {
                if (string.IsNullOrEmpty(dest.BlockKey))
                    continue;

                // Resolve contentTypeKey: prefer existing on the mapping, fall back to old destination lookup
                var contentTypeKey = dest.ContentTypeKey;
                if (string.IsNullOrEmpty(contentTypeKey))
                {
                    oldBlockKeyToContentTypeKey.TryGetValue(dest.BlockKey, out contentTypeKey);
                }

                if (string.IsNullOrEmpty(contentTypeKey))
                {
                    // Can't resolve — blockKey not found in old destination and no contentTypeKey on mapping
                    result.Orphaned++;
                    result.Details.Add(new ReconciliationDetail
                    {
                        ContentTypeKey = "",
                        OldBlockKey = dest.BlockKey,
                        NewBlockKey = null,
                        Action = "orphaned",
                    });
                    continue;
                }

                if (newBlocksByContentTypeKey.TryGetValue(contentTypeKey, out var newBlock))
                {
                    var oldBlockKey = dest.BlockKey;
                    dest.BlockKey = newBlock.Key;
                    dest.ContentTypeKey = contentTypeKey; // backfill if absent

                    if (oldBlockKey != newBlock.Key)
                    {
                        result.Updated++;
                        result.Details.Add(new ReconciliationDetail
                        {
                            ContentTypeKey = contentTypeKey,
                            ContentTypeAlias = newBlock.ContentTypeAlias,
                            OldBlockKey = oldBlockKey,
                            NewBlockKey = newBlock.Key,
                            Action = "updated",
                        });
                    }
                    modified = true;
                }
                else
                {
                    // contentTypeKey no longer exists in new destination — block removed from blueprint
                    result.Orphaned++;
                    result.Details.Add(new ReconciliationDetail
                    {
                        ContentTypeKey = contentTypeKey,
                        OldBlockKey = dest.BlockKey,
                        NewBlockKey = null,
                        Action = "orphaned",
                    });
                }
            }
        }

        if (modified)
        {
            _workflowService.SaveMapConfig(alias, mapConfig);
            _logger.LogInformation(
                "Reconciled blockKeys for workflow '{Alias}': {Updated} updated, {Orphaned} orphaned",
                alias, result.Updated, result.Orphaned);
        }

        return result;
    }

    private static List<DestinationBlock> GetAllBlocks(DestinationConfig config)
    {
        var blocks = new List<DestinationBlock>();
        if (config.BlockGrids != null)
        {
            foreach (var grid in config.BlockGrids)
                blocks.AddRange(grid.Blocks);
        }
        if (config.BlockLists != null)
        {
            foreach (var list in config.BlockLists)
                blocks.AddRange(list.Blocks);
        }
        return blocks;
    }

    [HttpPut("{alias}/map")]
    public IActionResult UpdateMap(string alias, [FromBody] MapConfig config)
    {
        try
        {
            _workflowService.SaveMapConfig(alias, config);
            return Ok(config);
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }
    }

    [HttpGet("{alias}/sample-extraction")]
    public IActionResult GetSampleExtraction(string alias)
    {
        var result = _workflowService.GetSampleExtraction(alias);
        if (result == null)
        {
            return NotFound(new { error = $"No sample extraction found for workflow '{alias}'." });
        }

        return Ok(result);
    }

    [HttpPost("detect-areas")]
    public IActionResult DetectAreas([FromBody] SampleExtractionRequest request)
    {
        var absolutePath = ResolveMediaFilePath(request.MediaKey);
        if (absolutePath == null)
        {
            return NotFound(new { error = "Media item not found or file not on disk" });
        }

        var result = _pdfPagePropertiesService.DetectAreas(absolutePath);

        _logger.LogInformation(
            "Area detection complete: {Areas} areas detected, {Elements} elements extracted",
            result.Diagnostics.AreasDetected,
            result.Diagnostics.ElementsInAreas);

        return Ok(result);
    }

    [HttpPost("{alias}/area-detection")]
    public IActionResult ExtractAreaDetection(string alias, [FromBody] SampleExtractionRequest request)
    {
        var absolutePath = ResolveMediaFilePath(request.MediaKey);
        if (absolutePath == null)
        {
            return NotFound(new { error = "Media item not found or file not on disk" });
        }

        // Read page selection and area template from workflow
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        var includePages = ResolveIncludePages(absolutePath, sourceConfig);
        var areaTemplate = _workflowService.GetAreaTemplate(alias);

        var result = _pdfPagePropertiesService.DetectAreas(absolutePath, includePages, areaTemplate);

        try
        {
            _workflowService.SaveAreaDetection(alias, result);
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }

        _logger.LogInformation("Area detection saved for workflow '{Alias}': {Areas} areas, {Elements} elements extracted",
            alias, result.Diagnostics.AreasDetected, result.Diagnostics.ElementsInAreas);

        return Ok(result);
    }

    [HttpGet("{alias}/area-detection")]
    public IActionResult GetAreaDetection(string alias)
    {
        var result = _workflowService.GetAreaDetection(alias);
        if (result == null)
        {
            return NotFound(new { error = $"No area detection found for workflow '{alias}'." });
        }

        return Ok(result);
    }

    [HttpPost("{alias}/transform")]
    public IActionResult ExtractTransform(string alias, [FromBody] SampleExtractionRequest request)
    {
        var absolutePath = ResolveMediaFilePath(request.MediaKey);
        if (absolutePath == null)
        {
            return NotFound(new { error = "Media item not found or file not on disk" });
        }

        // Read page selection and area template from workflow
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        var includePages = ResolveIncludePages(absolutePath, sourceConfig);
        var areaTemplate = _workflowService.GetAreaTemplate(alias);

        // Step 1: Run area detection (with page filtering and optional area template)
        var areaResult = _pdfPagePropertiesService.DetectAreas(absolutePath, includePages, areaTemplate);

        try
        {
            _workflowService.SaveAreaDetection(alias, areaResult);
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }

        // Step 2: Run transform on area detection output, preserving existing include/exclude state
        var previousTransform = _workflowService.GetTransformResult(alias);
        var transformResult = _contentTransformService.Transform(areaResult, sourceConfig?.AreaRules, previousTransform);
        _workflowService.SaveTransformResult(alias, transformResult);

        _logger.LogInformation(
            "Transform saved for workflow '{Alias}': {Sections} sections ({Bullets} bullet, {Paragraphs} paragraph, {SubHeaded} sub-headed, {Preambles} preamble, {Roles} role)",
            alias, transformResult.Diagnostics.TotalSections,
            transformResult.Diagnostics.BulletListSections,
            transformResult.Diagnostics.ParagraphSections,
            transformResult.Diagnostics.SubHeadedSections,
            transformResult.Diagnostics.PreambleSections,
            transformResult.Diagnostics.RoleSections);

        return Ok(transformResult);
    }

    [HttpGet("{alias}/transform")]
    public IActionResult GetTransform(string alias)
    {
        var result = _workflowService.GetTransformResult(alias);
        if (result == null)
        {
            return NotFound(new { error = $"No transform result found for workflow '{alias}'." });
        }

        return Ok(result);
    }

    [HttpPost("{alias}/transform-adhoc")]
    public async Task<IActionResult> TransformAdhoc(string alias, [FromBody] SampleExtractionRequest request)
    {
        try
        {
            var sourceConfig = _workflowService.GetSourceConfig(alias);
            var sourceType = sourceConfig?.SourceTypes?.FirstOrDefault() ?? "pdf";

            if (sourceType == "web")
            {
                RichExtractionResult extraction;
                if (!string.IsNullOrWhiteSpace(request.Url))
                {
                    extraction = await _htmlExtractionService.ExtractRichFromUrl(request.Url);
                }
                else if (request.MediaKey != Guid.Empty)
                {
                    var absolutePath = ResolveMediaFilePath(request.MediaKey);
                    if (absolutePath == null)
                        return NotFound(new { error = "Media item not found or file not on disk" });
                    extraction = _htmlExtractionService.ExtractRichFromFile(absolutePath);
                }
                else
                {
                    return BadRequest(new { error = "URL or media key is required for web extraction" });
                }

                var result = ConvertStructuredToTransformResult(extraction, sourceConfig?.ExcludedAreas, sourceConfig?.ContainerOverrides);
                return Ok(result);
            }
            else if (sourceType == "markdown")
            {
                var absolutePath = ResolveMediaFilePath(request.MediaKey);
                if (absolutePath == null)
                    return NotFound(new { error = "Media item not found or file not on disk" });
                var extraction = _markdownExtractionService.ExtractRich(absolutePath);
                var result = ConvertStructuredToTransformResult(extraction);
                return Ok(result);
            }
            else
            {
                // PDF: area detection + rule-based transform
                var absolutePath = ResolveMediaFilePath(request.MediaKey);
                if (absolutePath == null)
                    return NotFound(new { error = "Media item not found or file not on disk" });
                var includePages = ResolveIncludePages(absolutePath, sourceConfig);
                var areaTemplate = _workflowService.GetAreaTemplate(alias);

                var areaResult = _pdfPagePropertiesService.DetectAreas(absolutePath, includePages, areaTemplate);
                var previousTransform = _workflowService.GetTransformResult(alias);
                var result = _contentTransformService.Transform(areaResult, sourceConfig?.AreaRules, previousTransform);
                return Ok(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Transform-adhoc failed for workflow '{Alias}' with media {MediaKey}", alias, request.MediaKey);
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpPatch("{alias}/transform/sections/{sectionId}/included")]
    public IActionResult UpdateSectionInclusion(string alias, string sectionId, [FromBody] SectionInclusionRequest request)
    {
        var result = _workflowService.UpdateSectionInclusion(alias, sectionId, request.Included);
        if (result == null)
        {
            return NotFound(new { error = $"Workflow '{alias}' or section '{sectionId}' not found." });
        }

        return Ok(result);
    }

    [HttpPut("{alias}/pages")]
    public IActionResult UpdatePageSelection(string alias, [FromBody] PageSelectionRequest request)
    {
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        if (sourceConfig == null)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found or has no source.json." });
        }

        // Update just the pages property
        if (request.Pages == null || request.Pages.Count == 0)
        {
            sourceConfig.Pages = new Pages { IsAll = true };
        }
        else
        {
            sourceConfig.Pages = new Pages { PageNumbers = request.Pages.OrderBy(p => p).ToList() };
        }

        _workflowService.SaveSourceConfig(alias, sourceConfig);

        _logger.LogInformation("Updated page selection for workflow '{Alias}': {Pages}",
            alias, sourceConfig.Pages.IsAll ? "all" : string.Join(", ", sourceConfig.Pages.PageNumbers!));

        return Ok(new { pages = sourceConfig.Pages });
    }

    [HttpPut("{alias}/excluded-areas")]
    public IActionResult UpdateExcludedAreas(string alias, [FromBody] ExcludedAreasRequest request)
    {
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        if (sourceConfig == null)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found or has no source.json." });
        }

        sourceConfig.ExcludedAreas = request.ExcludedAreas?.Count > 0 ? request.ExcludedAreas : null;
        _workflowService.SaveSourceConfig(alias, sourceConfig);

        // Regenerate transform so excluded areas take effect (also respects container overrides)
        var extraction = _workflowService.GetSampleExtraction(alias);
        if (extraction != null)
        {
            var transformResult = ConvertStructuredToTransformResult(extraction, sourceConfig.ExcludedAreas, sourceConfig.ContainerOverrides);
            _workflowService.SaveTransformResult(alias, transformResult);
        }

        _logger.LogInformation("Updated excluded areas for workflow '{Alias}': {Areas}",
            alias, sourceConfig.ExcludedAreas != null ? string.Join(", ", sourceConfig.ExcludedAreas) : "none");

        return Ok(new { excludedAreas = sourceConfig.ExcludedAreas ?? new List<string>() });
    }

    [HttpPut("{alias}/container-overrides")]
    public IActionResult UpdateContainerOverrides(string alias, [FromBody] ContainerOverridesRequest request)
    {
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        if (sourceConfig == null)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found or has no source.json." });
        }

        sourceConfig.ContainerOverrides = request.Overrides?.Count > 0 ? request.Overrides : null;
        _workflowService.SaveSourceConfig(alias, sourceConfig);

        // Regenerate area detection and transform with the new overrides
        var extraction = _workflowService.GetSampleExtraction(alias);
        if (extraction != null && extraction.SourceType == "web")
        {
            var areaDetection = BuildAreaDetectionFromWeb(extraction, sourceConfig.ContainerOverrides);
            _workflowService.SaveAreaDetection(alias, areaDetection);

            var transformResult = ConvertStructuredToTransformResult(extraction, sourceConfig.ExcludedAreas, sourceConfig.ContainerOverrides);
            _workflowService.SaveTransformResult(alias, transformResult);
        }

        _logger.LogInformation("Updated container overrides for workflow '{Alias}': {Count} overrides",
            alias, sourceConfig.ContainerOverrides?.Count ?? 0);

        return Ok(new { containerOverrides = sourceConfig.ContainerOverrides ?? new List<ContainerOverride>() });
    }

    [HttpPut("{alias}/section-rules")]
    public IActionResult UpdateSectionRules(string alias, [FromBody] Dictionary<string, SectionRuleSet> sectionRules)
    {
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        if (sourceConfig == null)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found or has no source.json." });
        }

        sourceConfig.SectionRules = sectionRules;
        _workflowService.SaveSourceConfig(alias, sourceConfig);

        _logger.LogInformation("Updated section rules for workflow '{Alias}': {Count} sections with rules",
            alias, sectionRules.Count);

        return Ok(sectionRules);
    }

    [HttpPut("{alias}/area-rules")]
    public IActionResult UpdateAreaRules(string alias, [FromBody] Dictionary<string, AreaRules> areaRules)
    {
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        if (sourceConfig == null)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found or has no source.json." });
        }

        sourceConfig.AreaRules = areaRules;
        _workflowService.SaveSourceConfig(alias, sourceConfig);

        _logger.LogInformation("Updated area rules for workflow '{Alias}': {Count} areas with rules",
            alias, areaRules.Count);

        return Ok(areaRules);
    }

    [HttpGet("{alias}/source")]
    public IActionResult GetSource(string alias)
    {
        var sourceConfig = _workflowService.GetSourceConfig(alias);
        if (sourceConfig == null)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found or has no source.json." });
        }

        return Ok(sourceConfig);
    }

    [HttpPut("{alias}/area-template")]
    public IActionResult UpdateAreaTemplate(string alias, [FromBody] AreaTemplate template)
    {
        try
        {
            _workflowService.SaveAreaTemplate(alias, template);
            return Ok(template);
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }
    }

    [HttpGet("{alias}/area-template")]
    public IActionResult GetAreaTemplate(string alias)
    {
        var template = _workflowService.GetAreaTemplate(alias);
        if (template == null)
        {
            return NotFound(new { error = $"No area template found for workflow '{alias}'." });
        }

        return Ok(template);
    }

    [HttpGet("media-pdf")]
    public IActionResult GetMediaPdf([FromQuery] Guid mediaKey)
    {
        if (mediaKey == Guid.Empty)
        {
            return BadRequest(new { error = "Media key is required." });
        }

        var absolutePath = ResolveMediaFilePath(mediaKey);
        if (absolutePath == null)
        {
            return NotFound(new { error = "Media item not found or file not on disk." });
        }

        var fileStream = new FileStream(absolutePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(fileStream, "application/pdf");
    }

    [HttpGet("{alias}/pdf")]
    public IActionResult GetPdf(string alias, [FromQuery] Guid? mediaKey = null)
    {
        // If mediaKey not provided, try to get it from the stored sample extraction
        if (mediaKey == null || mediaKey == Guid.Empty)
        {
            var extraction = _workflowService.GetSampleExtraction(alias);
            if (extraction?.Source?.MediaKey == null || !Guid.TryParse(extraction.Source.MediaKey, out var parsedKey))
            {
                return BadRequest(new { error = "No media key provided and no sample extraction found." });
            }
            mediaKey = parsedKey;
        }

        var absolutePath = ResolveMediaFilePath(mediaKey.Value);
        if (absolutePath == null)
        {
            return NotFound(new { error = "Media item not found or file not on disk." });
        }

        var fileStream = new FileStream(absolutePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(fileStream, "application/pdf");
    }

    /// <summary>
    /// Infers a section pattern from a user-selected element.
    /// The user clicks one element as an example section heading, and the system
    /// finds the minimum distinguishing conditions that separate heading-like
    /// elements from non-heading elements in the same area.
    /// </summary>
    [HttpPost("{alias}/infer-section-pattern")]
    public IActionResult InferSectionPattern(string alias, [FromBody] InferSectionPatternRequest request)
    {
        try
        {
            // Load the area template to get area definitions
            var areaTemplate = _workflowService.GetAreaTemplate(alias);
            if (areaTemplate == null)
                return NotFound(new { error = $"No area template found for workflow '{alias}'." });

            if (request.AreaIndex < 0 || request.AreaIndex >= areaTemplate.Areas.Count)
                return BadRequest(new { error = $"Area index {request.AreaIndex} is out of range (0-{areaTemplate.Areas.Count - 1})." });

            // Get the source config for page selection
            var config = _workflowService.GetConfigByAlias(alias);
            var sourceConfig = config?.Sources.Values.FirstOrDefault();

            // Get the PDF file path
            var extraction = _workflowService.GetSampleExtraction(alias);
            if (extraction?.Source?.MediaKey == null || !Guid.TryParse(extraction.Source.MediaKey, out var mediaKey))
                return BadRequest(new { error = "No sample extraction found. Extract a PDF first." });

            var filePath = ResolveMediaFilePath(mediaKey);
            if (filePath == null)
                return NotFound(new { error = "PDF file not found on disk." });

            // Run area detection to get current elements
            var includePages = ResolveIncludePages(filePath, sourceConfig);
            var areaResult = _pdfPagePropertiesService.DetectAreas(filePath, includePages, areaTemplate);

            // Find the target area across all pages
            var targetAreaDef = areaTemplate.Areas[request.AreaIndex];
            DetectedArea? targetArea = null;
            foreach (var page in areaResult.Pages)
            {
                targetArea = page.Areas.FirstOrDefault(a => a.Name == targetAreaDef.Name && a.Page == targetAreaDef.Page);
                if (targetArea != null) break;
            }

            if (targetArea == null)
                return NotFound(new { error = $"Area '{targetAreaDef.Name}' not found in detection result." });

            // Find the clicked element
            var allElements = targetArea.Sections.SelectMany(s =>
            {
                var elems = new List<AreaElement>();
                if (s.Heading != null) elems.Add(s.Heading);
                elems.AddRange(s.Children);
                return elems;
            }).ToList();

            var clickedElement = allElements.FirstOrDefault(e => e.Id == request.ElementId);
            if (clickedElement == null)
                return NotFound(new { error = $"Element '{request.ElementId}' not found in area '{targetAreaDef.Name}'." });

            // Infer the minimum distinguishing conditions
            var otherElements = allElements.Where(e => e.Id != request.ElementId).ToList();
            var pattern = InferMinimumPattern(clickedElement, otherElements);

            // Find all elements matching the inferred pattern
            var matchingIds = allElements
                .Where(e => PdfPagePropertiesService.MatchesAllConditions(e, pattern.Conditions))
                .Select(e => e.Id)
                .ToList();

            return Ok(new InferSectionPatternResponse
            {
                Pattern = pattern,
                MatchingElementIds = matchingIds,
                ClickedElementId = request.ElementId,
                TotalElements = allElements.Count
            });
        }
        catch (DirectoryNotFoundException)
        {
            return NotFound(new { error = $"Workflow '{alias}' not found." });
        }
    }

    /// <summary>
    /// Infers the minimum set of conditions that distinguish the clicked element
    /// from other elements in the area. Tries each metadata dimension individually
    /// and returns the simplest pattern that uniquely identifies "heading-like" elements.
    /// </summary>
    private static SectionPattern InferMinimumPattern(AreaElement clicked, List<AreaElement> others)
    {
        // Try single-condition candidates in order of specificity (most useful first)
        var candidates = new List<RuleCondition>();

        // Font name — often the strongest signal (e.g., "Clarendon" vs "Helvetica")
        if (!string.IsNullOrEmpty(clicked.FontName))
        {
            // Extract the base font name (strip PDF subset prefix like "GHEALP+")
            var baseFontName = clicked.FontName.Contains('+')
                ? clicked.FontName.Substring(clicked.FontName.IndexOf('+') + 1)
                : clicked.FontName;

            candidates.Add(new RuleCondition { Type = "fontNameContains", Value = baseFontName });
        }

        // Font size — check if clicked element has a distinct font size
        var clickedSize = Math.Round(clicked.FontSize, 1);
        var otherSizes = others.Select(e => Math.Round(e.FontSize, 1)).Distinct().ToList();
        if (otherSizes.All(s => Math.Abs(s - clickedSize) >= 0.5))
        {
            candidates.Add(new RuleCondition { Type = "fontSizeEquals", Value = clickedSize });
        }
        if (otherSizes.Count > 0 && clickedSize > otherSizes.Max())
        {
            candidates.Add(new RuleCondition { Type = "fontSizeAbove", Value = otherSizes.Max() });
        }

        // Color — often useful when headings have a distinct color
        if (!string.IsNullOrEmpty(clicked.Color))
        {
            var otherColors = others.Select(e => e.Color).Distinct().ToList();
            if (!otherColors.Contains(clicked.Color, StringComparer.OrdinalIgnoreCase))
            {
                candidates.Add(new RuleCondition { Type = "colorEquals", Value = clicked.Color });
            }
        }

        // Try each single candidate — does it uniquely identify headings without false positives?
        foreach (var candidate in candidates)
        {
            var conditions = new List<RuleCondition> { candidate };
            var falsePositives = others.Count(e => PdfPagePropertiesService.MatchesAllConditions(e, conditions));
            if (falsePositives == 0)
            {
                // This single condition is sufficient
                return new SectionPattern { Conditions = conditions };
            }
        }

        // No single condition works — try pairs
        for (int i = 0; i < candidates.Count; i++)
        {
            for (int j = i + 1; j < candidates.Count; j++)
            {
                var conditions = new List<RuleCondition> { candidates[i], candidates[j] };
                var falsePositives = others.Count(e => PdfPagePropertiesService.MatchesAllConditions(e, conditions));
                if (falsePositives == 0)
                {
                    return new SectionPattern { Conditions = conditions };
                }
            }
        }

        // Fallback: use all non-empty candidates
        if (candidates.Count > 0)
        {
            return new SectionPattern { Conditions = candidates };
        }

        // Last resort: no distinguishing conditions found — use font size equals
        return new SectionPattern
        {
            Conditions = new List<RuleCondition>
            {
                new RuleCondition { Type = "fontSizeEquals", Value = Math.Round(clicked.FontSize, 1) }
            }
        };
    }

    /// <summary>
    /// Resolves page selection from source.json into a list of page numbers.
    /// Opens the PDF briefly to get the total page count for validation.
    /// Returns null if all pages should be included.
    /// </summary>
    /// <summary>
    /// Builds an AreaDetectionResult from web extraction elements that have been tagged
    /// with htmlArea metadata. Groups elements by their area, then within each area
    /// groups into sections by headings.
    /// </summary>
    private static AreaDetectionResult BuildAreaDetectionFromWeb(
        RichExtractionResult extraction,
        List<ContainerOverride>? containerOverrides = null)
    {
        // Apply promotions before grouping (operates on cloned elements)
        var elements = ApplyPromotions(extraction.Elements, containerOverrides);

        // Group elements by their htmlArea
        var areaGroups = elements
            .GroupBy(e => string.IsNullOrEmpty(e.Metadata.HtmlArea) ? "Ungrouped" : e.Metadata.HtmlArea)
            .OrderBy(g => GetAreaSortOrder(g.Key));

        var areas = new List<DetectedArea>();
        var areaColors = new Dictionary<string, string>
        {
            ["Header"] = "#90CAF9",
            ["Navigation"] = "#CE93D8",
            ["Main Content"] = "#A5D6A7",
            ["Article"] = "#A5D6A7",
            ["Sidebar"] = "#FFE082",
            ["Footer"] = "#EF9A9A",
            ["Ungrouped"] = "#B0BEC5",
        };

        // Default color for user-promoted areas
        const string promotedAreaColor = "#FFCC80";

        foreach (var group in areaGroups)
        {
            var areaElements = group.ToList();
            var sections = GroupElementsIntoSections(areaElements, containerOverrides);

            areas.Add(new DetectedArea
            {
                Name = group.Key,
                Color = areaColors.GetValueOrDefault(group.Key, promotedAreaColor),
                BoundingBox = new ElementBoundingBox(), // Not applicable for web
                Page = 1,
                Sections = sections,
                TotalElements = areaElements.Count,
            });
        }

        return new AreaDetectionResult
        {
            TotalPages = 1,
            Pages = new List<PageAreas>
            {
                new()
                {
                    Page = 1,
                    Areas = areas,
                }
            },
            Diagnostics = new AreaDiagnosticInfo
            {
                AreasDetected = areas.Count,
                ElementsInAreas = extraction.Elements.Count,
            }
        };
    }

    /// <summary>
    /// Builds an AreaDetectionResult from markdown extraction with a single "Content" area.
    /// This gives markdown the same Page > Area > Section hierarchy as PDF and web sources.
    /// </summary>
    private static AreaDetectionResult BuildAreaDetectionFromMarkdown(RichExtractionResult extraction)
    {
        var sections = GroupElementsIntoSections(extraction.Elements);

        var areas = new List<DetectedArea>
        {
            new()
            {
                Name = "Content",
                Color = "#A5D6A7",
                BoundingBox = new ElementBoundingBox(),
                Page = 1,
                Sections = sections,
                TotalElements = extraction.Elements.Count,
            }
        };

        return new AreaDetectionResult
        {
            TotalPages = 1,
            Pages = new List<PageAreas>
            {
                new()
                {
                    Page = 1,
                    Areas = areas,
                }
            },
            Diagnostics = new AreaDiagnosticInfo
            {
                AreasDetected = 1,
                ElementsInAreas = extraction.Elements.Count,
            }
        };
    }

    /// <summary>
    /// Groups extraction elements into sections based on headings and optional container overrides.
    /// Each heading starts a new section; body elements between headings are children.
    /// When "makeSection" overrides are present, elements are first partitioned by their
    /// matching container, then heading-based splitting is applied within each partition.
    /// </summary>
    private static List<DetectedSection> GroupElementsIntoSections(
        List<ExtractionElement> elements,
        List<ContainerOverride>? containerOverrides = null)
    {
        var sectionContainers = containerOverrides?
            .Where(o => o.Action == "makeSection")
            .ToList();

        if (sectionContainers == null || sectionContainers.Count == 0)
        {
            return GroupElementsByHeading(elements);
        }

        // Partition elements by their makeSection container
        var partitions = PartitionByContainer(elements, sectionContainers);
        var allSections = new List<DetectedSection>();
        foreach (var partition in partitions)
        {
            allSections.AddRange(GroupElementsByHeading(partition));
        }
        return allSections;
    }

    /// <summary>
    /// Groups extraction elements into sections based on heading boundaries only.
    /// </summary>
    private static List<DetectedSection> GroupElementsByHeading(List<ExtractionElement> elements)
    {
        var sections = new List<DetectedSection>();
        DetectedSection? currentSection = null;

        foreach (var element in elements)
        {
            var isHeading = element.Metadata.FontName.StartsWith("heading-");

            var areaElement = new AreaElement
            {
                Id = element.Id,
                Text = element.Text,
                FontSize = element.Metadata.FontSize,
                FontName = element.Metadata.FontName,
                Color = element.Metadata.Color,
                BoundingBox = element.Metadata.BoundingBox,
                HtmlTag = element.Metadata.HtmlTag,
                HtmlContainerPath = element.Metadata.HtmlContainerPath,
            };

            if (isHeading)
            {
                // Flush previous section
                if (currentSection != null)
                    sections.Add(currentSection);

                currentSection = new DetectedSection
                {
                    Heading = areaElement,
                    Children = new List<AreaElement>(),
                };
            }
            else
            {
                if (currentSection == null)
                {
                    // Body text before any heading — preamble section
                    currentSection = new DetectedSection
                    {
                        Heading = null,
                        Children = new List<AreaElement>(),
                    };
                }
                currentSection.Children.Add(areaElement);
            }
        }

        // Flush last section
        if (currentSection != null)
            sections.Add(currentSection);

        return sections;
    }

    /// <summary>
    /// Partitions elements into groups based on "makeSection" container paths.
    /// Elements under a matching container form one partition; elements not under any
    /// matching container go into adjacent default partitions. Consecutive elements
    /// in the same container (or both not matching) stay together.
    /// </summary>
    private static List<List<ExtractionElement>> PartitionByContainer(
        List<ExtractionElement> elements,
        List<ContainerOverride> sectionContainers)
    {
        var partitions = new List<List<ExtractionElement>>();
        string? currentContainerKey = null; // null = no matching container
        var currentBucket = new List<ExtractionElement>();

        foreach (var element in elements)
        {
            var containerKey = GetMatchingSectionContainer(element, sectionContainers);

            if (containerKey != currentContainerKey && currentBucket.Count > 0)
            {
                partitions.Add(currentBucket);
                currentBucket = new List<ExtractionElement>();
            }

            currentContainerKey = containerKey;
            currentBucket.Add(element);
        }

        if (currentBucket.Count > 0)
            partitions.Add(currentBucket);

        return partitions;
    }

    /// <summary>
    /// Returns the matching "makeSection" container path for an element, or null if none match.
    /// When multiple containers match, the most specific (longest path) wins.
    /// </summary>
    private static string? GetMatchingSectionContainer(
        ExtractionElement element,
        List<ContainerOverride> sectionContainers)
    {
        var path = element.Metadata.HtmlContainerPath;
        if (string.IsNullOrEmpty(path)) return null;

        string? bestMatch = null;
        foreach (var container in sectionContainers)
        {
            if (path.Equals(container.ContainerPath, StringComparison.Ordinal)
                || path.StartsWith(container.ContainerPath + "/", StringComparison.Ordinal))
            {
                if (bestMatch == null || container.ContainerPath.Length > bestMatch.Length)
                    bestMatch = container.ContainerPath;
            }
        }

        return bestMatch;
    }

    /// <summary>
    /// Sort order for areas so they appear in a logical reading order.
    /// </summary>
    private static int GetAreaSortOrder(string areaName) => areaName switch
    {
        "Header" => 0,
        "Navigation" => 1,
        "Main Content" => 2,
        "Article" => 3,
        "Sidebar" => 4,
        "Footer" => 5,
        "Ungrouped" => 6,
        _ => 3 // Unknown/promoted areas sort near main content
    };

    /// <summary>
    /// Applies "promoteToArea" container overrides to extraction elements.
    /// For each promotion, elements whose htmlContainerPath starts with (or equals)
    /// the promoted container's path get their HtmlArea overridden to the promotion label.
    /// Longest paths match first (most specific wins).
    /// Operates on a cloned list to avoid mutating the persisted sample extraction.
    /// </summary>
    private static List<ExtractionElement> ApplyPromotions(
        List<ExtractionElement> elements,
        List<ContainerOverride>? overrides)
    {
        if (overrides == null || overrides.Count == 0)
            return elements;

        var promotions = overrides
            .Where(o => o.Action == "promoteToArea")
            .OrderByDescending(o => o.ContainerPath.Length) // most specific first
            .ToList();

        if (promotions.Count == 0)
            return elements;

        // Deep-clone element metadata so we don't mutate the persisted extraction
        var cloned = elements.Select(e => new ExtractionElement
        {
            Id = e.Id,
            Page = e.Page,
            Text = e.Text,
            Metadata = new ElementMetadata
            {
                FontSize = e.Metadata.FontSize,
                FontName = e.Metadata.FontName,
                Position = e.Metadata.Position,
                BoundingBox = e.Metadata.BoundingBox,
                Color = e.Metadata.Color,
                HtmlArea = e.Metadata.HtmlArea,
                HtmlTag = e.Metadata.HtmlTag,
                HtmlContainerPath = e.Metadata.HtmlContainerPath,
            }
        }).ToList();

        foreach (var element in cloned)
        {
            var path = element.Metadata.HtmlContainerPath;
            if (string.IsNullOrEmpty(path)) continue;

            foreach (var promo in promotions)
            {
                if (path.Equals(promo.ContainerPath, StringComparison.Ordinal)
                    || path.StartsWith(promo.ContainerPath + "/", StringComparison.Ordinal))
                {
                    element.Metadata.HtmlArea = promo.Label ?? DeriveLabel(promo.ContainerPath);
                    break; // first (most specific) match wins
                }
            }
        }

        return cloned;
    }

    /// <summary>
    /// Derives a human-readable label from the last segment of a container CSS selector path.
    /// "div.country-banner" → "Country Banner", "div#tab2" → "Tab 2".
    /// </summary>
    private static string DeriveLabel(string containerPath)
    {
        // Take the last segment of the path
        var lastSegment = containerPath.Contains('/')
            ? containerPath[(containerPath.LastIndexOf('/') + 1)..]
            : containerPath;

        // Extract the class or id part (after the first . or #)
        string identifier;
        var dotIndex = lastSegment.IndexOf('.');
        var hashIndex = lastSegment.IndexOf('#');

        if (dotIndex >= 0)
            identifier = lastSegment[(dotIndex + 1)..];
        else if (hashIndex >= 0)
            identifier = lastSegment[(hashIndex + 1)..];
        else
            identifier = lastSegment; // bare tag

        // Convert kebab-case/underscore-case to title case
        var words = identifier
            .Replace('-', ' ')
            .Replace('_', ' ')
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return string.Join(" ", words.Select(w =>
            char.ToUpper(w[0]) + (w.Length > 1 ? w[1..] : "")));
    }

    /// <summary>
    /// Converts a structured RichExtractionResult (markdown or HTML) into a TransformResult.
    /// Groups elements by heading: each heading starts a new section with a kebab-case ID.
    /// Body elements between headings become the section's content.
    /// For web sources with htmlArea metadata, creates one TransformArea per detected area.
    /// Works for any source type that uses "heading-N" font names (markdown, HTML).
    /// </summary>
    private static TransformResult ConvertStructuredToTransformResult(
        RichExtractionResult extraction,
        List<string>? excludedAreas = null,
        List<ContainerOverride>? containerOverrides = null)
    {
        // Check if this is a web extraction with area metadata
        var hasAreas = extraction.SourceType == "web"
            && extraction.Elements.Any(e => !string.IsNullOrEmpty(e.Metadata.HtmlArea));

        if (hasAreas)
        {
            return ConvertWebToTransformResult(extraction, excludedAreas, containerOverrides);
        }

        // Original path for markdown and web-without-areas
        return ConvertFlatToTransformResult(extraction);
    }

    /// <summary>
    /// Converts web extraction with area metadata into a TransformResult.
    /// Groups elements by htmlArea first, then by heading within each area.
    /// Excluded areas (by kebab-case name) are filtered out of the output.
    /// </summary>
    private static TransformResult ConvertWebToTransformResult(
        RichExtractionResult extraction,
        List<string>? excludedAreas = null,
        List<ContainerOverride>? containerOverrides = null)
    {
        var seenIds = new Dictionary<string, int>();
        var areas = new List<TransformArea>();

        // Apply promotions before grouping (operates on cloned elements)
        var elements = ApplyPromotions(extraction.Elements, containerOverrides);

        // Build a set of excluded area names for fast lookup (kebab-case → original name)
        var excludedSet = excludedAreas != null && excludedAreas.Count > 0
            ? new HashSet<string>(excludedAreas, StringComparer.OrdinalIgnoreCase)
            : null;

        var areaGroups = elements
            .GroupBy(e => string.IsNullOrEmpty(e.Metadata.HtmlArea) ? "Ungrouped" : e.Metadata.HtmlArea)
            .OrderBy(g => GetAreaSortOrder(g.Key));

        foreach (var areaGroup in areaGroups)
        {
            // Skip excluded areas (compare kebab-case of area name to excluded list)
            var kebabName = NormalizeToKebabCase(areaGroup.Key);
            if (excludedSet != null && excludedSet.Contains(kebabName))
                continue;
            var sections = ConvertElementsToSections(areaGroup.ToList(), seenIds, containerOverrides);
            areas.Add(new TransformArea
            {
                Name = areaGroup.Key,
                Page = 1,
                Sections = sections,
            });
        }

        var allSections = areas.SelectMany(a => a.Sections).ToList();
        return new TransformResult
        {
            Areas = areas,
            Diagnostics = new TransformDiagnostics
            {
                TotalSections = allSections.Count,
                ParagraphSections = allSections.Count,
            }
        };
    }

    /// <summary>
    /// Original flat conversion for markdown and non-area web sources.
    /// </summary>
    private static TransformResult ConvertFlatToTransformResult(RichExtractionResult extraction)
    {
        var seenIds = new Dictionary<string, int>();
        var sections = ConvertElementsToSections(extraction.Elements, seenIds);

        return new TransformResult
        {
            Areas = new List<TransformArea>
            {
                new()
                {
                    Name = "Content",
                    Page = 1,
                    Sections = sections,
                }
            },
            Diagnostics = new TransformDiagnostics
            {
                TotalSections = sections.Count,
                ParagraphSections = sections.Count,
            }
        };
    }

    /// <summary>
    /// Converts a list of extraction elements into TransformedSections.
    /// Each heading starts a new section with a kebab-case ID.
    /// When "makeSection" overrides are present, elements are first partitioned by container,
    /// then heading-based splitting is applied within each partition.
    /// </summary>
    private static List<TransformedSection> ConvertElementsToSections(
        List<ExtractionElement> elements,
        Dictionary<string, int> seenIds,
        List<ContainerOverride>? containerOverrides = null)
    {
        var sectionContainers = containerOverrides?
            .Where(o => o.Action == "makeSection")
            .ToList();

        if (sectionContainers == null || sectionContainers.Count == 0)
        {
            return ConvertElementsByHeading(elements, seenIds);
        }

        // Partition elements by their makeSection container, then heading-split within each
        var partitions = PartitionByContainer(elements, sectionContainers);
        var allSections = new List<TransformedSection>();
        foreach (var partition in partitions)
        {
            allSections.AddRange(ConvertElementsByHeading(partition, seenIds));
        }
        return allSections;
    }

    /// <summary>
    /// Converts extraction elements into TransformedSections based on heading boundaries only.
    /// </summary>
    private static List<TransformedSection> ConvertElementsByHeading(
        List<ExtractionElement> elements, Dictionary<string, int> seenIds)
    {
        var sections = new List<TransformedSection>();

        string? currentHeading = null;
        string? currentId = null;
        var currentBodyLines = new List<string>();

        void FlushSection()
        {
            if (currentId == null) return;
            var content = string.Join("\n\n", currentBodyLines).Trim();
            var section = new TransformedSection
            {
                Id = EnsureUniqueId(currentId, seenIds),
                OriginalHeading = currentHeading,
                Heading = currentHeading,
                Content = content,
                Pattern = "paragraph",
                Page = 1,
                ChildCount = currentBodyLines.Count,
                Included = true,
            };
            sections.Add(section);
        }

        foreach (var element in elements)
        {
            var isHeading = element.Metadata.FontName.StartsWith("heading-");

            if (isHeading)
            {
                FlushSection();
                currentHeading = element.Text;
                currentId = NormalizeToKebabCase(element.Text);
                currentBodyLines.Clear();
            }
            else
            {
                if (currentId == null)
                {
                    currentHeading = null;
                    currentId = "preamble";
                }
                currentBodyLines.Add(element.Text);
            }
        }

        FlushSection();
        return sections;
    }

    private static string NormalizeToKebabCase(string text)
    {
        var lower = text.ToLower(System.Globalization.CultureInfo.InvariantCulture).Trim();
        var kebab = System.Text.RegularExpressions.Regex.Replace(lower, @"[^a-z0-9]+", "-");
        return kebab.Trim('-');
    }

    private static string EnsureUniqueId(string baseId, Dictionary<string, int> seenIds)
    {
        if (seenIds.TryGetValue(baseId, out var count))
        {
            seenIds[baseId] = count + 1;
            return $"{baseId}-{count + 1}";
        }

        seenIds[baseId] = 1;
        return baseId;
    }

    private static List<int>? ResolveIncludePages(string filePath, SourceConfig? sourceConfig)
    {
        if (sourceConfig?.Pages == null || sourceConfig.Pages.IsAll)
            return null;

        if (sourceConfig.Pages.PageNumbers == null || sourceConfig.Pages.PageNumbers.Count == 0)
            return null;

        // We need the total page count to validate page numbers.
        // Open the PDF briefly just to get the count — PdfPig is fast for this.
        using var document = UglyToad.PdfPig.PdfDocument.Open(filePath);
        return sourceConfig.ResolveIncludedPages(document.NumberOfPages);
    }

    private string? ResolveMediaFilePath(Guid mediaKey)
    {
        var media = _mediaService.GetById(mediaKey);
        if (media == null) return null;

        var umbracoFile = media.GetValue<string>("umbracoFile");
        if (string.IsNullOrEmpty(umbracoFile)) return null;

        string filePath;
        if (umbracoFile.StartsWith("{"))
        {
            var json = System.Text.Json.JsonDocument.Parse(umbracoFile);
            filePath = json.RootElement.GetProperty("src").GetString() ?? string.Empty;
        }
        else
        {
            filePath = umbracoFile;
        }

        if (string.IsNullOrEmpty(filePath)) return null;

        var absolutePath = Path.Combine(_webHostEnvironment.WebRootPath, filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        return System.IO.File.Exists(absolutePath) ? absolutePath : null;
    }
}

public class SampleExtractionRequest
{
    public Guid MediaKey { get; set; }
    /// <summary>
    /// URL for web page extraction. Used when source type is "web".
    /// </summary>
    public string? Url { get; set; }
}

public class CreateWorkflowRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Alias { get; set; }
    public string DocumentTypeAlias { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty;
    public string? BlueprintId { get; set; }
    public string? BlueprintName { get; set; }
}

public class UpdateIdentityRequest
{
    public string Name { get; set; } = string.Empty;
    public string Alias { get; set; } = string.Empty;
}

public class ChangeDestinationRequest
{
    public string DocumentTypeAlias { get; set; } = string.Empty;
    public string? DocumentTypeName { get; set; }
    public string BlueprintId { get; set; } = string.Empty;
    public string? BlueprintName { get; set; }
}

public class SectionInclusionRequest
{
    public bool Included { get; set; }
}

public class PageSelectionRequest
{
    /// <summary>
    /// List of page numbers to include in extraction. Null or empty = all pages.
    /// </summary>
    public List<int>? Pages { get; set; }
}

public class ExcludedAreasRequest
{
    /// <summary>
    /// List of area names (kebab-case) to exclude from transform output. Null or empty = include all.
    /// </summary>
    public List<string>? ExcludedAreas { get; set; }
}

public class ContainerOverridesRequest
{
    /// <summary>
    /// List of container overrides (promote to area, make section). Null or empty = clear all overrides.
    /// </summary>
    public List<ContainerOverride>? Overrides { get; set; }
}

public class InferSectionPatternRequest
{
    /// <summary>
    /// Zero-based index of the area in the area template's Areas list.
    /// </summary>
    public int AreaIndex { get; set; }

    /// <summary>
    /// The element ID (e.g., "p1-e5") that the user clicked as a section heading example.
    /// </summary>
    public string ElementId { get; set; } = string.Empty;
}

public class InferSectionPatternResponse
{
    /// <summary>
    /// The inferred section pattern with minimum distinguishing conditions.
    /// </summary>
    public SectionPattern Pattern { get; set; } = new();

    /// <summary>
    /// IDs of all elements in the area that match the inferred pattern.
    /// These are the proposed section headings.
    /// </summary>
    public List<string> MatchingElementIds { get; set; } = new();

    /// <summary>
    /// The element ID the user originally clicked.
    /// </summary>
    public string ClickedElementId { get; set; } = string.Empty;

    /// <summary>
    /// Total number of elements in the area, for context.
    /// </summary>
    public int TotalElements { get; set; }
}
