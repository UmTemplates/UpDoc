using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Web;

namespace TailoredTravel.Web.Routing;

/// <summary>
/// Umbraco's Public Access transparently rewrites a protected page to the
/// login page while keeping the original URL. For Tailored Tours we want an
/// anonymous visitor to be sent away with a real redirect to the landing page,
/// so the protected tour URL never renders its content in place.
/// </summary>
public class TailoredTourRedirectMiddleware
{
    private const string LandingPagePath = "/tailored-tours/";

    private readonly RequestDelegate _next;

    public TailoredTourRedirectMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IUmbracoContextAccessor umbracoContextAccessor,
        IMemberManager memberManager)
    {
        if (await ShouldRedirectAsync(context, umbracoContextAccessor, memberManager))
        {
            context.Response.Redirect(LandingPagePath, permanent: false);
            return;
        }

        await _next(context);
    }

    private static async Task<bool> ShouldRedirectAsync(
        HttpContext context,
        IUmbracoContextAccessor umbracoContextAccessor,
        IMemberManager memberManager)
    {
        // Never interfere with the landing page itself, or we'd loop.
        if (context.Request.Path.Equals(LandingPagePath, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (!umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
        {
            return false;
        }

        var content = umbracoContext.PublishedRequest?.PublishedContent;
        if (content is null)
        {
            return false;
        }

        // Only act on protected pages the current visitor cannot see.
        if (!await memberManager.IsProtectedAsync(content.Path))
        {
            return false;
        }

        return !await memberManager.MemberHasAccessAsync(content.Path);
    }
}
