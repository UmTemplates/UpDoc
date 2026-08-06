using Asp.Versioning;
using UpDoc.Models;
using UpDoc.OpenApi;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace UpDoc.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("umbraco/management/api/v{version:apiVersion}/updoc/document-types")]
[MapToApi(UpDocApiConfiguration.ApiName)]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[JsonOptionsName("UmbracoManagementApi")]
public class DocumentTypeController : UpDocControllerBase
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IContentService _contentService;

    public DocumentTypeController(IContentTypeService contentTypeService, IContentService contentService)
    {
        _contentTypeService = contentTypeService;
        _contentService = contentService;
    }

    /// <summary>Lists document types that can be a workflow destination. Element types are excluded.</summary>
    [HttpGet]
    [ProducesResponseType<IEnumerable<DocumentTypeResponse>>(StatusCodes.Status200OK)]
    public IActionResult GetAll()
    {
        var documentTypes = _contentTypeService.GetAll()
            .Where(ct => !ct.IsElement)
            .OrderBy(ct => ct.Name)
            .Select(ct => new DocumentTypeResponse
            {
                Alias = ct.Alias,
                Name = ct.Name,
                Icon = ct.Icon,
                Id = ct.Key,
            });

        return Ok(documentTypes);
    }

    /// <summary>Lists the blueprints belonging to a document type. A workflow targets exactly one.</summary>
    [HttpGet("{alias}/blueprints")]
    [ProducesResponseType<IEnumerable<BlueprintResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public IActionResult GetBlueprints(string alias)
    {
        var contentType = _contentTypeService.Get(alias);
        if (contentType == null)
        {
            return NotFoundProblem($"Document type '{alias}' not found.");
        }

        var blueprints = _contentService.GetBlueprintsForContentTypes(contentType.Id)
            .OrderBy(b => b.Name)
            .Select(b => new BlueprintResponse
            {
                Id = b.Key.ToString(),
                Name = b.Name,
            });

        return Ok(blueprints);
    }
}
