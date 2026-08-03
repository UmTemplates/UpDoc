using Microsoft.AspNetCore.Mvc;
using TailoredTravel.Web.Models;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Logging;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Security;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Web.Website.Controllers;
using Umbraco.Extensions;

namespace TailoredTravel.Web.Controllers;

public class TailoredTourLoginController : SurfaceController
{
    private readonly IMemberSignInManager _signInManager;
    private readonly IMemberManager _memberManager;

    public TailoredTourLoginController(
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbracoDatabaseFactory databaseFactory,
        ServiceContext services,
        AppCaches appCaches,
        IProfilingLogger profilingLogger,
        IPublishedUrlProvider publishedUrlProvider,
        IMemberSignInManager signInManager,
        IMemberManager memberManager)
        : base(umbracoContextAccessor, databaseFactory, services, appCaches, profilingLogger, publishedUrlProvider)
    {
        _signInManager = signInManager;
        _memberManager = memberManager;
    }

    [HttpPost]
    public async Task<IActionResult> Submit(TailoredTourLoginModel model)
    {
        // The tour number printed on the customer's PDF is the only thing they type,
        // and it is the member's username. The number is the credential, so we sign
        // the member in by username without checking a password.
        var number = model.TourNumber?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(number))
        {
            TempData["TourLoginError"] = "Please enter the tour reference from your PDF.";
            return RedirectToCurrentUmbracoPage();
        }

        var member = await _memberManager.FindByNameAsync(number);

        if (member is null)
        {
            TempData["TourLoginError"] = "We couldn't find that tour reference. Please check the number on your PDF.";
            return RedirectToCurrentUmbracoPage();
        }

        await _signInManager.SignInAsync(member, isPersistent: false);

        var tourUrl = ResolveTourUrl(member);

        if (!string.IsNullOrEmpty(tourUrl))
        {
            return Redirect(tourUrl);
        }

        // Signed in but no tour mapped — fall back to the Tailored Tours landing page.
        return RedirectToCurrentUmbracoPage();
    }

    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Redirect("/tailored-tours/");
    }

    private string? ResolveTourUrl(MemberIdentityUser member)
    {
        var memberContent = _memberManager.AsPublishedMember(member);

        // memberTourPage is a Content Picker. Depending on how the value
        // resolves it may come back as a single item or a collection, so
        // handle both and take the picked tour page.
        var tourPage = memberContent?.Value<IPublishedContent>("memberTourPage")
            ?? memberContent?.Value<IEnumerable<IPublishedContent>>("memberTourPage")?.FirstOrDefault();

        return tourPage?.Url(PublishedUrlProvider);
    }
}
