using System.Text.RegularExpressions;

namespace UpDoc.Services;

/// <summary>
/// Removes markdown syntax from text destined for a plain-text property.
///
/// Extraction assembles content as markdown, which is right for a rich text
/// property and wrong for a title or a description - those would show a literal
/// "# " or "- " to the reader.
///
/// Ported from stripMarkdown in transforms.ts, pattern for pattern.
/// </summary>
public static partial class MarkdownStripper
{
    public static string Strip(string? markdown)
    {
        if (string.IsNullOrEmpty(markdown))
            return string.Empty;

        var text = markdown;
        text = HeadingAtLineStart().Replace(text, string.Empty);
        // Mid-string headings appear when two headings are concatenated into one field.
        text = HeadingMidString().Replace(text, " ");
        text = Bold().Replace(text, "$1");
        text = Italic().Replace(text, "$1");
        text = Strikethrough().Replace(text, "$1");
        text = InlineCode().Replace(text, "$1");
        text = BulletPrefix().Replace(text, string.Empty);
        text = NumberedPrefix().Replace(text, string.Empty);
        text = BlockquotePrefix().Replace(text, string.Empty);

        return text.Trim();
    }

    [GeneratedRegex(@"^#{1,6}\s+", RegexOptions.Multiline)]
    private static partial Regex HeadingAtLineStart();

    [GeneratedRegex(@"\s#{1,6}\s+")]
    private static partial Regex HeadingMidString();

    [GeneratedRegex(@"\*\*(.+?)\*\*")]
    private static partial Regex Bold();

    [GeneratedRegex(@"\*(.+?)\*")]
    private static partial Regex Italic();

    [GeneratedRegex(@"~~(.+?)~~")]
    private static partial Regex Strikethrough();

    [GeneratedRegex(@"`(.+?)`")]
    private static partial Regex InlineCode();

    [GeneratedRegex(@"^\s*[-*+]\s+", RegexOptions.Multiline)]
    private static partial Regex BulletPrefix();

    [GeneratedRegex(@"^\s*\d+\.\s+", RegexOptions.Multiline)]
    private static partial Regex NumberedPrefix();

    [GeneratedRegex(@"^\s*>\s+", RegexOptions.Multiline)]
    private static partial Regex BlockquotePrefix();
}
