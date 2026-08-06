using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace UpDoc.Services;

public interface IMediaFilePathResolver
{
    /// <summary>
    /// Resolves a media item to an absolute path on disk, or null when the item
    /// does not exist, holds no file, or the file is missing.
    /// </summary>
    string? Resolve(Guid mediaKey);
}

/// <summary>
/// Finds the file behind a media item.
///
/// Extraction reads from disk, so every source import starts by turning a media
/// key into a path. The umbracoFile property holds either a bare path or a JSON
/// object depending on the media type's property editor, so both are handled.
/// </summary>
public class MediaFilePathResolver : IMediaFilePathResolver
{
    private readonly IMediaService _mediaService;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public MediaFilePathResolver(IMediaService mediaService, IWebHostEnvironment webHostEnvironment)
    {
        _mediaService = mediaService;
        _webHostEnvironment = webHostEnvironment;
    }

    public string? Resolve(Guid mediaKey)
    {
        var media = _mediaService.GetById(mediaKey);
        return media is null ? null : Resolve(media);
    }

    private string? Resolve(IMedia media)
    {
        var umbracoFile = media.GetValue<string>("umbracoFile");
        if (string.IsNullOrEmpty(umbracoFile))
            return null;

        var relativePath = umbracoFile.StartsWith('{')
            ? ReadSrcFromJson(umbracoFile)
            : umbracoFile;

        if (string.IsNullOrEmpty(relativePath))
            return null;

        var absolutePath = Path.Combine(
            _webHostEnvironment.WebRootPath,
            relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

        // Fully qualified: Umbraco.Cms.Core.Models has its own File type, so the
        // Umbraco.Extensions using above makes a bare File ambiguous.
        return System.IO.File.Exists(absolutePath) ? absolutePath : null;
    }

    /// <summary>
    /// Reads the path out of the JSON form, e.g. {"src":"/media/abc/file.pdf"}.
    /// </summary>
    private static string? ReadSrcFromJson(string umbracoFile)
    {
        try
        {
            using var document = JsonDocument.Parse(umbracoFile);
            return document.RootElement.TryGetProperty("src", out var src)
                ? src.GetString()
                : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
