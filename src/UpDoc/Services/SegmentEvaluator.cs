using System.Text.RegularExpressions;
using UpDoc.Models;

namespace UpDoc.Services;

/// <summary>
/// Narrows an element's text to a from/to bounded piece.
///
/// KEEP IN SYNC: mirrored client-side in App_Plugins/UpDoc/src/segment.ts for
/// the rules-editor live preview. Change both or the preview will disagree with
/// the transform.
/// </summary>
public static class SegmentEvaluator
{
    // Numeric run: digits with optional thousands separators, e.g. 1,199 or 5.
    private static readonly Regex NumberRun = new(@"\d[\d,]*", RegexOptions.Compiled);

    /// <summary>
    /// Applies segment extraction driven by the piece conditions that follow a
    /// "segment" marker in a rule's conditions list.
    ///
    /// Supported piece conditions (evaluated in order):
    ///   textFollows  → the piece starts after this marker (from)
    ///   textPrecedes → the piece ends before this marker (to)
    /// A "number" piece condition (no value) ends the piece after the numeric run.
    /// Marker not found → empty string. No piece conditions → whole text.
    /// </summary>
    public static string Apply(string text, IReadOnlyList<RuleCondition> segmentConditions)
    {
        if (segmentConditions == null || segmentConditions.Count == 0) return text;

        SegmentBoundary? from = null;
        SegmentBoundary? to = null;

        foreach (var c in segmentConditions)
        {
            var value = c.Value?.ToString();
            switch (c.Type?.ToLowerInvariant())
            {
                case "textfollows":
                    from = new SegmentBoundary { Anchor = "afterMarker", Marker = value };
                    break;
                case "textprecedes":
                    to = new SegmentBoundary { Anchor = "beforeMarker", Marker = value };
                    break;
                case "number":
                    to = new SegmentBoundary { Anchor = "number" };
                    break;
            }
        }

        return Apply(text, new Segment { From = from, To = to });
    }

    /// <summary>
    /// Applies the segment to the text. Null segment returns the text unchanged.
    /// A boundary whose marker is not found collapses the result to empty string.
    /// </summary>
    public static string Apply(string text, Segment? segment)
    {
        if (segment == null) return text;

        // Resolve the start index (inclusive).
        int startIndex = 0;
        if (segment.From != null)
        {
            var s = ResolveFrom(text, segment.From);
            if (s < 0) return string.Empty; // marker not found
            startIndex = s;
        }

        // Everything from startIndex onward is the working region.
        var region = text[startIndex..];

        // Resolve the end within the region (exclusive).
        int endIndex = region.Length;
        if (segment.To != null)
        {
            var e = ResolveTo(region, segment.To);
            if (e < 0) return string.Empty; // marker not found
            endIndex = e;
        }

        return region[..endIndex].Trim();
    }

    // Returns the index in `text` where the segment starts, or -1 if not found.
    private static int ResolveFrom(string text, SegmentBoundary b) => b.Anchor switch
    {
        "start" => 0,
        "afterMarker" => FindAfter(text, b.Marker),
        "beforeMarker" => FindBefore(text, b.Marker),
        _ => 0, // "end" / "number" are not meaningful as a from-anchor; treat as start
    };

    // Returns the exclusive end index within `region`, or -1 if not found.
    private static int ResolveTo(string region, SegmentBoundary b) => b.Anchor switch
    {
        "end" => region.Length,
        "beforeMarker" => IndexOfMarker(region, b.Marker),
        "afterMarker" => AfterMarkerEnd(region, b.Marker),
        "number" => NumberEnd(region),
        _ => region.Length,
    };

    private static int FindAfter(string text, string? marker)
    {
        if (string.IsNullOrEmpty(marker)) return 0;
        var i = text.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        return i < 0 ? -1 : i + marker.Length;
    }

    private static int FindBefore(string text, string? marker)
    {
        if (string.IsNullOrEmpty(marker)) return 0;
        var i = text.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        return i < 0 ? -1 : i;
    }

    private static int IndexOfMarker(string region, string? marker)
    {
        if (string.IsNullOrEmpty(marker)) return region.Length;
        var i = region.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        return i < 0 ? -1 : i;
    }

    private static int AfterMarkerEnd(string region, string? marker)
    {
        if (string.IsNullOrEmpty(marker)) return region.Length;
        var i = region.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        return i < 0 ? -1 : i + marker.Length;
    }

    // End of the first numeric run in the region (exclusive). -1 if no number.
    private static int NumberEnd(string region)
    {
        var m = NumberRun.Match(region);
        return m.Success ? m.Index + m.Length : -1;
    }
}
