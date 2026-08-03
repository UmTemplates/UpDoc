using System.Text.Json;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace TailoredTravel.Web.Composers;

// Auto-populates the read-only "Source Filename" provenance label on image media
// from the uploaded file, so we always retain the original (slugified) filename
// as the key to re-request an asset from its supplier — even after the node is
// later renamed to its editorial title (umbracoFile keeps the upload filename).
//
// The provenance label is read-only in the back office, so it cannot be written
// by an editor or via the API; it must be set server-side during save, the same
// way umbracoBytes / umbracoExtension are populated.
public class MediaSourceFilenameComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder) =>
        builder.AddNotificationHandler<MediaSavingNotification, MediaSourceFilenameHandler>();
}

public class MediaSourceFilenameHandler : INotificationHandler<MediaSavingNotification>
{
    private const string FileAlias = "umbracoFile";
    private const string SourceFilenameAlias = "mediaPropertyImageSourceFilename";

    public void Handle(MediaSavingNotification notification)
    {
        foreach (IMedia media in notification.SavedEntities)
        {
            if (!media.HasProperty(SourceFilenameAlias))
            {
                continue;
            }

            var rawPath = media.GetValue<string>(FileAlias);
            if (string.IsNullOrWhiteSpace(rawPath))
            {
                continue;
            }

            var filePath = ExtractPath(rawPath);
            if (string.IsNullOrWhiteSpace(filePath))
            {
                continue;
            }

            var fileName = Path.GetFileName(filePath);
            if (!string.IsNullOrWhiteSpace(fileName))
            {
                media.SetValue(SourceFilenameAlias, fileName);
            }
        }
    }

    // umbracoFile is ImageCropper JSON ({ "src": "/media/.../file.webp", ... })
    // on Image - Responsive, but can be a plain path on other media types.
    private static string? ExtractPath(string rawPath)
    {
        var trimmed = rawPath.TrimStart();
        if (!trimmed.StartsWith('{'))
        {
            return rawPath;
        }

        try
        {
            using var doc = JsonDocument.Parse(rawPath);
            return doc.RootElement.TryGetProperty("src", out var src)
                ? src.GetString()
                : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
