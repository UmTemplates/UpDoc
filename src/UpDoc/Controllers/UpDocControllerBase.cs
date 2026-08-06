using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Builders;

namespace UpDoc.Controllers;

/// <summary>
/// Shared error responses for UpDoc's controllers.
///
/// Umbraco's Management API returns errors as <see cref="ProblemDetails"/> (RFC 7807),
/// declared on every action as [ProducesResponseType(typeof(ProblemDetails), ...)].
/// UpDoc previously returned an anonymous <c>{ error = "..." }</c>, which no consumer
/// could discover from the spec and which no Umbraco developer would expect.
///
/// These helpers exist so the shape is produced in one place. Writing
/// <c>NotFound(new { error = ... })</c> inline 89 times is how two error formats end
/// up in one API.
///
/// Note this is only about HTTP error responses. Some success payloads carry their own
/// <c>Error</c> field (see <c>RichExtractionResult.Error</c>) to report that extraction
/// failed while the request itself succeeded. Those are unaffected.
/// </summary>
public abstract class UpDocControllerBase : ControllerBase
{
    /// <summary>404 with a title, e.g. "Workflow 'group-tour-pdf' not found."</summary>
    protected IActionResult NotFoundProblem(string title, string? detail = null)
        => NotFound(Problem(title, detail));

    /// <summary>400 for a request the caller can correct.</summary>
    protected IActionResult BadRequestProblem(string title, string? detail = null)
        => BadRequest(Problem(title, detail));

    /// <summary>409 where the request conflicts with existing state, e.g. a duplicate alias.</summary>
    protected IActionResult ConflictProblem(string title, string? detail = null)
        => Conflict(Problem(title, detail));

    /// <summary>
    /// 500 for an unexpected failure.
    ///
    /// Deliberately carries no exception detail. The caller gets a title; the exception
    /// goes to the log, where it belongs. A stack trace in a documented response is a
    /// contract you did not mean to publish, and hands internals to anyone who can
    /// reach the endpoint.
    /// </summary>
    protected IActionResult ServerErrorProblem(string title, string? detail = null)
        => StatusCode(StatusCodes.Status500InternalServerError, Problem(title, detail));

    private static ProblemDetails Problem(string title, string? detail)
    {
        var builder = new ProblemDetailsBuilder().WithTitle(title);

        if (!string.IsNullOrWhiteSpace(detail))
            builder.WithDetail(detail);

        return builder.Build();
    }
}
