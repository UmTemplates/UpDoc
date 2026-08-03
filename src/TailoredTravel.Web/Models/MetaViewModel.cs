using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace TailoredTravel.Web.Models;

public class MetaViewModel
{
    public MetaViewModel(IPublishedContent currentPage, SiteSettings siteSettings)
    {
        CurrentPage = currentPage;
        SiteSettings = siteSettings;
    }

    public IPublishedContent CurrentPage { get; }
    public SiteSettings SiteSettings { get; }
}
