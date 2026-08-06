using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.Common.Authorization;
using UpDoc.Models;
using UpDoc.OpenApi;
using UpDoc.Services;

namespace UpDoc.Controllers;

/// <summary>
/// Creating documents from source files.
///
/// This is "Create from Source" as an API call rather than a click. The
/// backoffice remains the way an editor does it; this is how anything else does
/// it - UpDoc's MCP server, a scheduled job, another site's code.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("umbraco/management/api/v{version:apiVersion}/updoc")]
[MapToApi(UpDocApiConfiguration.ApiName)]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[JsonOptionsName("UmbracoManagementApi")]
public class CreateFromSourceController : UpDocControllerBase
{
    private readonly IDocumentCreationService _documentCreationService;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;

    public CreateFromSourceController(
        IDocumentCreationService documentCreationService,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
    {
        _documentCreationService = documentCreationService;
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
    }

    /// <summary>
    /// Creates a document from a source file, using the workflow configured for
    /// the given blueprint.
    ///
    /// The source file must already exist in the media library. The document is
    /// created as a draft - publish it separately once the content has been
    /// checked.
    /// </summary>
    [HttpPost("create-from-source")]
    [ProducesResponseType<CreateFromSourceResult>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateFromSource([FromBody] CreateFromSourceRequest request)
    {
        if (request.BlueprintId == Guid.Empty)
            return BadRequestProblem("A blueprintId is required.", "It selects both the scaffold and the workflow.");

        if (request.DocumentTypeId == Guid.Empty)
            return BadRequestProblem("A documentTypeId is required.");

        if (string.IsNullOrWhiteSpace(request.DocumentName))
        {
            return BadRequestProblem(
                "A documentName is required.",
                "Name the document on creation rather than renaming it afterwards.");
        }

        var userKey = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser?.Key;
        if (userKey is null)
            return Unauthorized();

        var result = await _documentCreationService.CreateAsync(request, userKey.Value);

        if (!result.Success)
            return BadRequestProblem("The document could not be created.", result.Error);

        return Created(
            $"/umbraco/management/api/v1/document/{result.DocumentId}",
            result);
    }
}
