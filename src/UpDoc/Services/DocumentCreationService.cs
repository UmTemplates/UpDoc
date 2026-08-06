using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.ContentEditing;
using Umbraco.Cms.Core.Services;
using UpDoc.Models;

namespace UpDoc.Services;

public interface IDocumentCreationService
{
    Task<CreateFromSourceResult> CreateAsync(CreateFromSourceRequest request, Guid userKey);
}

/// <summary>
/// Creates a document from a source file, start to finish.
///
/// This is what the backoffice does when an editor clicks Create, expressed as
/// one server-side operation: find the workflow, extract the source, apply the
/// workflow's mappings to a blueprint scaffold, and create the document.
///
/// Having it here rather than only in the browser is what lets anything else
/// drive an import - UpDoc's MCP server, a scheduled job, another site's code.
/// Before this, "Create from Source" existed solely as browser TypeScript and
/// could only be reached by clicking.
///
/// The document is created as a draft. Publishing is the caller's decision.
/// </summary>
public class DocumentCreationService : IDocumentCreationService
{
    private readonly IWorkflowService _workflowService;
    private readonly IPdfPagePropertiesService _pdfService;
    private readonly IMarkdownExtractionService _markdownService;
    private readonly IHtmlExtractionService _htmlService;
    private readonly IContentTransformService _transformService;
    private readonly IMappingApplicationService _mappingService;
    private readonly IContentBlueprintEditingService _blueprintService;
    private readonly IContentEditingService _contentEditingService;
    private readonly IMediaFilePathResolver _mediaPathResolver;
    private readonly IFileService _fileService;
    private readonly ILogger<DocumentCreationService> _logger;

    public DocumentCreationService(
        IWorkflowService workflowService,
        IPdfPagePropertiesService pdfService,
        IMarkdownExtractionService markdownService,
        IHtmlExtractionService htmlService,
        IContentTransformService transformService,
        IMappingApplicationService mappingService,
        IContentBlueprintEditingService blueprintService,
        IContentEditingService contentEditingService,
        IMediaFilePathResolver mediaPathResolver,
        IFileService fileService,
        ILogger<DocumentCreationService> logger)
    {
        _workflowService = workflowService;
        _pdfService = pdfService;
        _markdownService = markdownService;
        _htmlService = htmlService;
        _transformService = transformService;
        _mappingService = mappingService;
        _blueprintService = blueprintService;
        _contentEditingService = contentEditingService;
        _mediaPathResolver = mediaPathResolver;
        _fileService = fileService;
        _logger = logger;
    }

    public async Task<CreateFromSourceResult> CreateAsync(CreateFromSourceRequest request, Guid userKey)
    {
        // 1. The blueprint decides the workflow. A workflow folder exists per
        //    blueprint per source type, so this is what says how to read the
        //    source and where its content belongs.
        var config = _workflowService.GetConfigForBlueprint(request.BlueprintId);
        if (config is null)
            return CreateFromSourceResult.Failure($"No workflow is configured for blueprint {request.BlueprintId}.");

        // The workflow alias is its folder name on disk - the identifier every
        // other workflow endpoint takes.
        var workflowAlias = Path.GetFileName(config.FolderPath);

        var sourceType = request.SourceType ?? config.Sources.Keys.FirstOrDefault() ?? "pdf";
        if (!config.Sources.TryGetValue(sourceType, out var sourceConfig))
        {
            return CreateFromSourceResult.Failure(
                $"Workflow '{workflowAlias}' does not support the '{sourceType}' source type. " +
                $"It supports: {string.Join(", ", config.Sources.Keys)}.");
        }

        // 2. Extract and transform. This is the same path the backoffice uses
        //    when it shows "Content extracted successfully".
        var transform = ExtractAndTransform(request, sourceType, sourceConfig, workflowAlias);
        if (transform.Error is not null)
            return CreateFromSourceResult.Failure(transform.Error);

        var lookups = SectionLookupBuilder.Build(transform.Result!);

        // 3. Scaffold from the blueprint. The scaffold carries the blueprint's
        //    own content, so unmapped fields keep their defaults.
        var scaffold = await _blueprintService.GetScaffoldedAsync(request.BlueprintId);
        if (scaffold is null)
            return CreateFromSourceResult.Failure($"Blueprint {request.BlueprintId} could not be scaffolded.");

        var values = ReadScaffoldValues(scaffold);

        // 4. Apply the workflow's mappings.
        var mappedFields = _mappingService.Apply(
            values,
            lookups,
            config.Map,
            config.Destination,
            request.MediaId);

        // 5. Create the document.
        var createModel = new ContentCreateModel
        {
            ContentTypeKey = request.DocumentTypeId,
            ParentKey = request.ParentId,
            // IContent carries the template as an int id; the create model wants a
            // key, so it is resolved through the file service.
            TemplateKey = ResolveTemplateKey(scaffold.TemplateId),
            Properties = values
                .Where(v => v.Value is not null)
                .Select(v => new PropertyValueModel { Alias = v.Key, Value = v.Value })
                .ToArray(),
            Variants = [new VariantModel { Name = request.DocumentName, Culture = null, Segment = null }],
        };

        var attempt = await _contentEditingService.CreateAsync(createModel, userKey);

        if (!attempt.Success)
        {
            return CreateFromSourceResult.Failure(
                $"Umbraco rejected the document: {attempt.Status}.");
        }

        var documentId = attempt.Result.Content!.Key;

        _logger.LogInformation(
            "Created document {DocumentId} \"{Name}\" from {SourceType} using workflow '{Workflow}' ({MappedCount} values written)",
            documentId, request.DocumentName, sourceType, workflowAlias, mappedFields.Count);

        return CreateFromSourceResult.Created(documentId, workflowAlias, mappedFields.Count);
    }

    /// <summary>
    /// Runs the source through extraction and the workflow's transform rules,
    /// producing the sections that mappings resolve against.
    /// </summary>
    private (TransformResult? Result, string? Error) ExtractAndTransform(
        CreateFromSourceRequest request,
        string sourceType,
        SourceConfig sourceConfig,
        string workflowAlias)
    {
        AreaDetectionResult areaDetection;

        if (sourceType == "pdf")
        {
            if (request.MediaId is null)
                return (null, "A PDF source needs a mediaId.");

            var path = _mediaPathResolver.Resolve(request.MediaId.Value);
            if (path is null)
                return (null, $"Media item {request.MediaId} was not found, or its file is not on disk.");

            var areaTemplate = _workflowService.GetAreaTemplate(workflowAlias);
            var includePages = ResolveIncludePages(sourceConfig);
            areaDetection = _pdfService.DetectAreas(path, includePages, areaTemplate);
        }
        else
        {
            return (null,
                $"The '{sourceType}' source type cannot be imported through this endpoint yet. " +
                "Use the backoffice for markdown and web sources.");
        }

        // Reuse the previous transform so include/exclude choices survive.
        var previous = _workflowService.GetTransformResult(workflowAlias);
        var result = _transformService.Transform(areaDetection, sourceConfig.AreaRules, previous);

        return result.AllSections.Any()
            ? (result, null)
            : (null, "Nothing was extracted from the source.");
    }

    /// <summary>
    /// Reads a scaffold's property values into a plain dictionary, which is the
    /// shape the mapping service edits.
    /// </summary>
    private static Dictionary<string, object?> ReadScaffoldValues(Umbraco.Cms.Core.Models.IContent scaffold)
    {
        var values = new Dictionary<string, object?>(StringComparer.Ordinal);

        foreach (var property in scaffold.Properties)
            values[property.Alias] = property.GetValue();

        return values;
    }

    /// <summary>
    /// Turns the scaffold's template id into the key the create model wants.
    ///
    /// IContent carries the template as an int; ContentCreateModel takes a Guid,
    /// so the template has to be looked up rather than cast.
    /// </summary>
    private Guid? ResolveTemplateKey(int? templateId)
        => templateId is null ? null : _fileService.GetTemplate(templateId.Value)?.Key;

    /// <summary>The pages the workflow reads, or null for all of them.</summary>
    private static List<int>? ResolveIncludePages(SourceConfig sourceConfig)
        => sourceConfig.Pages?.IsAll == false ? sourceConfig.Pages.PageNumbers : null;
}
