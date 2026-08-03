using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Html;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

namespace TailoredTravel.Web.Extensions;

public static class MediaExtensions
{
    private static readonly string[] DefaultSrcsetCrops =
    {
        "content3Col",
        "content6Col",
        "content9Col",
        "content12Col"
    };

    private static readonly int[] DefaultSrcsetWidths = { 384, 768, 1152, 1536 };

    private const string DefaultSizes =
        "(max-width: 576px) 100vw, (max-width: 992px) 100vw, 1536px";

    public static IHtmlContent RenderPicture(
        this MediaWithCrops? media,
        string crop = "content12Col",
        string? alt = null,
        string? cssClass = null,
        string? sizes = null,
        bool lazy = false,
        string[]? srcsetCrops = null,
        int[]? srcsetWidths = null)
    {
        if (media is null)
        {
            return HtmlString.Empty;
        }

        var altText = alt ?? media.Name ?? string.Empty;
        var sizesValue = sizes ?? DefaultSizes;
        var crops = srcsetCrops ?? DefaultSrcsetCrops;
        var widths = srcsetWidths ?? DefaultSrcsetWidths;

        // SVG: serve as-is. No <picture>, no transcoding.
        if (media.ContentType.Alias == "umbracoMediaVectorGraphics")
        {
            return BuildSvg(media, altText, cssClass);
        }

        // Animated GIF would lose animation under ?format=jpg. Serve as plain <img>.
        var sourceExt = GetSourceExtension(media);
        if (sourceExt == "gif")
        {
            return BuildPlainImg(media, crop, altText, cssClass, lazy);
        }

        var sourceIsWebp = sourceExt == "webp";

        // Branch: WebP source → fallback transcodes to jpg.
        //         Other source → <source> transcodes to webp, <img> serves original.
        var webpFormat = sourceIsWebp ? null : "webp";
        var fallbackFormat = sourceIsWebp ? "jpg" : null;

        var webpSrcset = BuildSrcset(media, crops, widths, webpFormat);
        var fallbackSrc = AppendFormat(media.GetCropUrl(crop), fallbackFormat) ?? string.Empty;
        var fallbackSrcset = BuildSrcset(media, crops, widths, fallbackFormat);

        var encoder = HtmlEncoder.Default;
        var html = new HtmlContentBuilder();

        html.AppendHtml("<picture>");

        html.AppendHtml("<source type=\"image/webp\" srcset=\"");
        html.AppendHtml(encoder.Encode(webpSrcset));
        html.AppendHtml("\" sizes=\"");
        html.AppendHtml(encoder.Encode(sizesValue));
        html.AppendHtml("\">");

        html.AppendHtml("<img src=\"");
        html.AppendHtml(encoder.Encode(fallbackSrc));
        html.AppendHtml("\" srcset=\"");
        html.AppendHtml(encoder.Encode(fallbackSrcset));
        html.AppendHtml("\" sizes=\"");
        html.AppendHtml(encoder.Encode(sizesValue));
        html.AppendHtml("\" alt=\"");
        html.AppendHtml(encoder.Encode(altText));
        html.AppendHtml("\"");

        if (!string.IsNullOrWhiteSpace(cssClass))
        {
            html.AppendHtml(" class=\"");
            html.AppendHtml(encoder.Encode(cssClass));
            html.AppendHtml("\"");
        }

        if (lazy)
        {
            html.AppendHtml(" loading=\"lazy\"");
        }

        html.AppendHtml("></picture>");

        return html;
    }

    private static IHtmlContent BuildSvg(MediaWithCrops media, string alt, string? cssClass)
    {
        var encoder = HtmlEncoder.Default;
        var html = new HtmlContentBuilder();

        html.AppendHtml("<img src=\"");
        html.AppendHtml(encoder.Encode(media.Url() ?? string.Empty));
        html.AppendHtml("\" alt=\"");
        html.AppendHtml(encoder.Encode(alt));
        html.AppendHtml("\"");

        if (!string.IsNullOrWhiteSpace(cssClass))
        {
            html.AppendHtml(" class=\"");
            html.AppendHtml(encoder.Encode(cssClass));
            html.AppendHtml("\"");
        }

        html.AppendHtml(">");
        return html;
    }

    private static IHtmlContent BuildPlainImg(
        MediaWithCrops media,
        string crop,
        string alt,
        string? cssClass,
        bool lazy)
    {
        var encoder = HtmlEncoder.Default;
        var html = new HtmlContentBuilder();

        html.AppendHtml("<img src=\"");
        html.AppendHtml(encoder.Encode(media.GetCropUrl(crop) ?? string.Empty));
        html.AppendHtml("\" alt=\"");
        html.AppendHtml(encoder.Encode(alt));
        html.AppendHtml("\"");

        if (!string.IsNullOrWhiteSpace(cssClass))
        {
            html.AppendHtml(" class=\"");
            html.AppendHtml(encoder.Encode(cssClass));
            html.AppendHtml("\"");
        }

        if (lazy)
        {
            html.AppendHtml(" loading=\"lazy\"");
        }

        html.AppendHtml(">");
        return html;
    }

    private static string BuildSrcset(
        MediaWithCrops media,
        string[] crops,
        int[] widths,
        string? format)
    {
        var parts = new string[crops.Length];
        for (var i = 0; i < crops.Length; i++)
        {
            var url = AppendFormat(media.GetCropUrl(crops[i]), format);
            parts[i] = $"{url} {widths[i]}w";
        }
        return string.Join(", ", parts);
    }

    private static string? AppendFormat(string? url, string? format)
    {
        if (string.IsNullOrEmpty(url))
        {
            return url;
        }
        if (string.IsNullOrEmpty(format))
        {
            return url;
        }
        var sep = url.Contains('?') ? "&" : "?";
        return $"{url}{sep}format={format}";
    }

    private static string GetSourceExtension(MediaWithCrops media)
    {
        var url = media.Url() ?? string.Empty;
        var lastDot = url.LastIndexOf('.');
        if (lastDot < 0 || lastDot == url.Length - 1)
        {
            return string.Empty;
        }
        return url[(lastDot + 1)..].ToLowerInvariant();
    }
}
