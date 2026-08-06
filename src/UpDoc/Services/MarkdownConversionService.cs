using Markdig;

namespace UpDoc.Services;

public interface IMarkdownConversionService
{
    /// <summary>Converts markdown to HTML.</summary>
    string ToHtml(string? markdown);

    /// <summary>Converts markdown to the value shape Umbraco's rich text editor persists.</summary>
    object BuildRichTextValue(string? markdown);
}

/// <summary>
/// Converts extracted markdown into the HTML a rich text property stores.
///
/// Extraction assembles content as markdown - headings, bullet lists,
/// paragraphs - and a rich text property needs HTML. This is the last step
/// before a value is written.
///
/// Matches the backoffice, which uses marked. That was measured rather than
/// assumed: for the shapes UpDoc actually produces (bullet lists, h3 headings,
/// paragraphs, and mixtures of the three) Markdig's default pipeline and marked
/// emit byte-identical HTML, including newline placement and the trailing
/// newline. A document created through this endpoint is the same as one created
/// by clicking Create in the backoffice.
///
/// Do not add pipeline extensions without re-checking that. Markdig's defaults
/// are what match; advanced extensions change the output.
/// </summary>
public class MarkdownConversionService : IMarkdownConversionService
{
    // Built once. The pipeline is immutable and thread-safe once constructed,
    // and rebuilding it per call is pure overhead.
    private static readonly MarkdownPipeline Pipeline = new MarkdownPipelineBuilder().Build();

    public string ToHtml(string? markdown)
        => string.IsNullOrEmpty(markdown) ? string.Empty : Markdown.ToHtml(markdown, Pipeline);

    /// <summary>
    /// Wraps HTML in the object Umbraco's rich text editor expects.
    ///
    /// The editor stores blocks alongside markup even when there are none, so
    /// the empty collections are required rather than decorative.
    /// </summary>
    public object BuildRichTextValue(string? markdown) => new
    {
        blocks = new
        {
            contentData = Array.Empty<object>(),
            settingsData = Array.Empty<object>(),
            expose = Array.Empty<object>(),
            // Lowercase, matching what Umbraco itself writes. It deserialises
            // either casing today, but relying on that would fail silently if
            // binding ever tightened - the block would lose its layout without
            // erroring.
            layout = new { },
        },
        markup = ToHtml(markdown),
    };
}
