using Asp.Versioning;
using UpDoc.OpenApi;
using Microsoft.AspNetCore.Authorization;
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
public class DocumentTypeController : ControllerBase
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IContentService _contentService;

    public DocumentTypeController(IContentTypeService contentTypeService, IContentService contentService)
    {
        _contentTypeService = contentTypeService;
        _contentService = contentService;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var documentTypes = _contentTypeService.GetAll()
            .Where(ct => !ct.IsElement)
            .OrderBy(ct => ct.Name)
            .Select(ct => new
            {
                alias = ct.Alias,
                name = ct.Name,
                icon = ct.Icon,
                id = ct.Key,
            });

        return Ok(documentTypes);
    }

    [HttpGet("{alias}/blueprints")]
    public IActionResult GetBlueprints(string alias)
    {
        var contentType = _contentTypeService.Get(alias);
        if (contentType == null)
        {
            return NotFound(new { error = $"Document type '{alias}' not found." });
        }

        var blueprints = _contentService.GetBlueprintsForContentTypes(contentType.Id)
            .OrderBy(b => b.Name)
            .Select(b => new
            {
                id = b.Key.ToString(),
                name = b.Name,
            });

        return Ok(blueprints);
    }
}
