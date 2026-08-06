using Asp.Versioning;
using UpDoc.OpenApi;
using UpDoc.Models;
using UpDoc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Web.Common.Authorization;

namespace UpDoc.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("umbraco/management/api/v{version:apiVersion}/updoc")]
[MapToApi(UpDocApiConfiguration.ApiName)]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[JsonOptionsName("UmbracoManagementApi")]
public class PdfExtractionController : UpDocControllerBase
{
    private readonly IMediaService _mediaService;
    private readonly IPdfExtractionService _pdfExtractionService;
    private readonly IPdfPagePropertiesService _pdfPagePropertiesService;
    private readonly IMarkdownExtractionService _markdownExtractionService;
    private readonly IWorkflowService _workflowService;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger<PdfExtractionController> _logger;

    public PdfExtractionController(
        IMediaService mediaService,
        IPdfExtractionService pdfExtractionService,
        IPdfPagePropertiesService pdfPagePropertiesService,
        IMarkdownExtractionService markdownExtractionService,
        IWorkflowService workflowService,
        IWebHostEnvironment webHostEnvironment,
        ILogger<PdfExtractionController> logger)
    {
        _mediaService = mediaService;
        _pdfExtractionService = pdfExtractionService;
        _pdfPagePropertiesService = pdfPagePropertiesService;
        _markdownExtractionService = markdownExtractionService;
        _workflowService = workflowService;
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;
    }

    [HttpGet("extract")]
    public IActionResult Extract(Guid mediaKey)
    {
        var media = _mediaService.GetById(mediaKey);
        if (media == null)
        {
            return NotFoundProblem("Media item not found");
        }

        var umbracoFile = media.GetValue<string>("umbracoFile");
        if (string.IsNullOrEmpty(umbracoFile))
        {
            return BadRequestProblem("Media item has no file");
        }

        // The umbracoFile value can be JSON or a simple path
        string filePath;
        if (umbracoFile.StartsWith("{"))
        {
            // JSON format: {"src":"/media/xxx/file.pdf"}
            var json = System.Text.Json.JsonDocument.Parse(umbracoFile);
            filePath = json.RootElement.GetProperty("src").GetString() ?? string.Empty;
        }
        else
        {
            filePath = umbracoFile;
        }

        if (string.IsNullOrEmpty(filePath))
        {
            return BadRequestProblem("Could not determine file path");
        }

        // Convert relative path to absolute file system path
        var absolutePath = Path.Combine(_webHostEnvironment.WebRootPath, filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

        if (!System.IO.File.Exists(absolutePath))
        {
            return NotFoundProblem($"File not found on disk: {filePath}");
        }

        var result = _pdfExtractionService.ExtractFromFile(absolutePath);

        if (!string.IsNullOrEmpty(result.Error))
        {
            return BadRequestProblem(result.Error);
        }

        return Ok(new
        {
            text = result.RawText,
            pageCount = result.PageCount
        });
    }

    [HttpGet("page-properties")]
    public IActionResult GetPageProperties(Guid mediaKey)
    {
        var media = _mediaService.GetById(mediaKey);
        if (media == null)
        {
            return NotFoundProblem("Media item not found");
        }

        var umbracoFile = media.GetValue<string>("umbracoFile");
        if (string.IsNullOrEmpty(umbracoFile))
        {
            return BadRequestProblem("Media item has no file");
        }

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

        if (string.IsNullOrEmpty(filePath))
        {
            return BadRequestProblem("Could not determine file path");
        }

        var absolutePath = Path.Combine(_webHostEnvironment.WebRootPath, filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

        if (!System.IO.File.Exists(absolutePath))
        {
            return NotFoundProblem($"File not found on disk: {filePath}");
        }

        var result = _pdfPagePropertiesService.ExtractFromFile(absolutePath);

        if (!string.IsNullOrEmpty(result.Error))
        {
            return BadRequestProblem(result.Error);
        }

        // Log to console for testing
        _logger.LogInformation("=== PDF Page Properties ===");
        _logger.LogInformation("Title → Page Title, Page Title Short: {Title}", result.Title);
        _logger.LogInformation("Description → Page Description: {Description}", result.Description);
        _logger.LogInformation("===========================");

        return Ok(new
        {
            title = result.Title,
            description = result.Description
        });
    }

    [HttpGet("page-section")]
    public IActionResult GetPageSection(Guid mediaKey, string heading)
    {
        if (string.IsNullOrWhiteSpace(heading))
        {
            return BadRequestProblem("Heading parameter is required");
        }

        var media = _mediaService.GetById(mediaKey);
        if (media == null)
        {
            return NotFoundProblem("Media item not found");
        }

        var umbracoFile = media.GetValue<string>("umbracoFile");
        if (string.IsNullOrEmpty(umbracoFile))
        {
            return BadRequestProblem("Media item has no file");
        }

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

        if (string.IsNullOrEmpty(filePath))
        {
            return BadRequestProblem("Could not determine file path");
        }

        var absolutePath = Path.Combine(_webHostEnvironment.WebRootPath, filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

        if (!System.IO.File.Exists(absolutePath))
        {
            return NotFoundProblem($"File not found on disk: {filePath}");
        }

        var result = _pdfPagePropertiesService.ExtractSectionByHeading(absolutePath, heading);

        if (!string.IsNullOrEmpty(result.Error))
        {
            return BadRequestProblem(result.Error);
        }

        _logger.LogInformation("=== PDF Section Extraction ===");
        _logger.LogInformation("Heading found: {Heading}", result.Heading);
        _logger.LogInformation("Content length: {Length} chars", result.Content.Length);
        _logger.LogInformation("==============================");

        return Ok(new
        {
            heading = result.Heading,
            content = result.Content
        });
    }

    [HttpGet("extract-markdown")]
    public IActionResult ExtractMarkdown(Guid mediaKey)
    {
        var media = _mediaService.GetById(mediaKey);
        if (media == null)
        {
            return NotFoundProblem("Media item not found");
        }

        var umbracoFile = media.GetValue<string>("umbracoFile");
        if (string.IsNullOrEmpty(umbracoFile))
        {
            return BadRequestProblem("Media item has no file");
        }

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

        if (string.IsNullOrEmpty(filePath))
        {
            return BadRequestProblem("Could not determine file path");
        }

        var absolutePath = Path.Combine(_webHostEnvironment.WebRootPath, filePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

        if (!System.IO.File.Exists(absolutePath))
        {
            return NotFoundProblem($"File not found on disk: {filePath}");
        }

        var result = _pdfPagePropertiesService.ExtractAsMarkdown(absolutePath);

        if (!string.IsNullOrEmpty(result.Error))
        {
            return BadRequestProblem(result.Error);
        }

        _logger.LogInformation("=== PDF Markdown Extraction ===");
        _logger.LogInformation("Title: {Title}", result.Title);
        _logger.LogInformation("Subtitle: {Subtitle}", result.Subtitle);
        _logger.LogInformation("Markdown length: {Length} chars", result.Markdown.Length);
        _logger.LogInformation("================================");

        return Ok(new
        {
            title = result.Title,
            subtitle = result.Subtitle,
            markdown = result.Markdown,
            rawText = result.RawText
        });
    }

    [HttpGet("extract-rich")]
    public IActionResult ExtractRich(Guid mediaKey)
    {
        var absolutePath = ResolveMediaFilePath(mediaKey);
        if (absolutePath == null)
        {
            return NotFoundProblem("Media item not found or file not on disk");
        }

        var media = _mediaService.GetById(mediaKey);
        var fileName = media?.Name ?? Path.GetFileName(absolutePath);

        var result = _pdfPagePropertiesService.ExtractRichDump(absolutePath);

        if (!string.IsNullOrEmpty(result.Error))
        {
            return BadRequestProblem(result.Error);
        }

        // Populate source metadata
        result.Source.FileName = fileName;
        result.Source.MediaKey = mediaKey.ToString();

        _logger.LogInformation("=== Rich PDF Extraction ===");
        _logger.LogInformation("File: {FileName}", fileName);
        _logger.LogInformation("Pages: {Pages}", result.Source.TotalPages);
        _logger.LogInformation("Elements: {Count}", result.Elements.Count);
        _logger.LogInformation("===========================");

        return Ok(result);
    }

    [HttpGet("config/{blueprintId}")]
    public IActionResult GetConfigForBlueprint(Guid blueprintId)
    {
        var config = _workflowService.GetConfigForBlueprint(blueprintId);
        if (config == null)
        {
            return NotFoundProblem($"No config found for blueprint {blueprintId}");
        }

        return Ok(config);
    }

    [HttpGet("extract-sections")]
    public IActionResult ExtractSections(Guid mediaKey, Guid blueprintId, string sourceType = "pdf")
    {
        var config = _workflowService.GetConfigForBlueprint(blueprintId);
        if (config == null)
        {
            return NotFoundProblem($"No config found for blueprint {blueprintId}");
        }

        if (!config.Sources.TryGetValue(sourceType, out var sourceConfig))
        {
            return BadRequestProblem($"Config does not support '{sourceType}' source type. Available: {string.Join(", ", config.Sources.Keys)}");
        }

        var absolutePath = ResolveMediaFilePath(mediaKey);
        if (absolutePath == null)
        {
            return NotFoundProblem("Media item not found or file not on disk");
        }

        // Route to correct extraction service based on source type
        var result = sourceType switch
        {
            "pdf" => _pdfPagePropertiesService.ExtractSectionsFromConfig(absolutePath, sourceConfig),
            "markdown" => _markdownExtractionService.ExtractSectionsFromConfig(absolutePath, sourceConfig),
            _ => new ExtractionResult { Error = $"Unsupported source type: {sourceType}" }
        };

        if (!string.IsNullOrEmpty(result.Error))
        {
            return BadRequestProblem(result.Error);
        }

        _logger.LogInformation("=== {SourceType} Section Extraction (Strategy-driven) ===", sourceType);
        foreach (var section in result.Sections)
        {
            _logger.LogInformation("{Key}: {Length} chars", section.Key, section.Value.Length);
        }
        _logger.LogInformation("================================================");

        return Ok(new
        {
            sections = result.Sections,
            config = config,
        });
    }

    /// <summary>
    /// Converts the new SourceConfig format to legacy PdfExtractionRules for backward compatibility.
    /// This will be removed once the extraction service is refactored to be strategy-driven.
    /// </summary>
    private static PdfExtractionRules ConvertToExtractionRules(SourceConfig source)
    {
        var rules = new PdfExtractionRules();

        // Global column detection
        if (source.Globals?.ColumnDetection != null)
        {
            rules.ColumnDetection = new ColumnDetectionConfig
            {
                Enabled = source.Globals.ColumnDetection.Enabled,
                ThresholdPercent = source.Globals.ColumnDetection.ThresholdPercent
            };
        }

        // Find title section (largestFont strategy)
        var titleSection = source.Sections.FirstOrDefault(s => s.Strategy == "largestFont");
        if (titleSection?.StrategyParams?.FontSizeThreshold != null)
        {
            rules.TitleDetection = new TitleDetectionConfig
            {
                FontSizeThreshold = titleSection.StrategyParams.FontSizeThreshold.Value
            };
        }

        // Find description section (regex strategy)
        var descSection = source.Sections.FirstOrDefault(s => s.Strategy == "regex");
        if (descSection?.StrategyParams?.Pattern != null)
        {
            rules.DescriptionPattern = descSection.StrategyParams.Pattern;
        }

        // Find content section (betweenPatterns strategy)
        var contentSection = source.Sections.FirstOrDefault(s => s.Strategy == "betweenPatterns");
        if (contentSection?.StrategyParams != null)
        {
            rules.Content = new ContentExtractionConfig
            {
                StartPattern = contentSection.StrategyParams.StartPattern,
                StopPatterns = contentSection.StrategyParams.StopPatterns ?? new List<string>(),
                HeadingLevel = contentSection.StrategyParams.HeadingLevel ?? "h2"
            };
        }

        return rules;
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
