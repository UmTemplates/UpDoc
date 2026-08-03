using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skybrud.Umbraco.Redirects.Models;
using Skybrud.Umbraco.Redirects.Services;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace TailoredTravel.Web.Controllers.Api;

[ApiController]
[BackOfficeRoute("tailored-travel/tour-redirects")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
public class TourRedirectsApiController : Controller
{
    private readonly IRedirectsService _redirectsService;

    public TourRedirectsApiController(IRedirectsService redirectsService)
    {
        _redirectsService = redirectsService;
    }

    [HttpGet("{nodeKey:guid}")]
    public IActionResult GetRedirects(Guid nodeKey)
    {
        var redirects = _redirectsService.GetRedirectsByNodeKey(RedirectDestinationType.Content, nodeKey);
        var urls = redirects.Select(r => r.Url).ToArray();
        return new JsonResult(urls);
    }
}
