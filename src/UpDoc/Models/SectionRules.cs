using System.Text.Json.Serialization;

namespace UpDoc.Models;

/// <summary>
/// Top-level container for an area's rules. Rules are organized into named groups
/// (for multi-part sections like Tour Details) and ungrouped rules (for single properties).
///
/// Backward compatible: when reading old format { "rules": [...] }, all rules go into
/// the ungrouped Rules array with Groups empty.
/// </summary>
public class AreaRules
{
    [JsonPropertyName("groups")]
    public List<RuleGroup> Groups { get; set; } = new();

    /// <summary>Ungrouped rules (single properties).</summary>
    [JsonPropertyName("rules")]
    public List<SectionRule> Rules { get; set; } = new();

    /// <summary>
    /// Returns all rules across all groups and ungrouped, preserving order:
    /// groups first (in group order, rules within each group in order), then ungrouped.
    /// </summary>
    public IEnumerable<SectionRule> AllRules()
    {
        foreach (var group in Groups)
            foreach (var rule in group.Rules)
                yield return rule;
        foreach (var rule in Rules)
            yield return rule;
    }

    /// <summary>
    /// Normalizes legacy flat rules into groups. Rules with section-scoped legacy actions
    /// (sectionTitle, sectionContent, sectionDescription, sectionSummary, createSection,
    /// setAsHeading, addAsContent, addAsList) are moved from the ungrouped Rules list
    /// into a synthetic group. Rules with singleProperty action stay ungrouped.
    ///
    /// Only runs when Groups is empty (old format). If groups already exist, this is a no-op.
    /// </summary>
    /// <param name="groupName">Name for the auto-created group (typically the area name).</param>
    public void NormalizeLegacyRules(string groupName)
    {
        // Already has groups → new format, nothing to do
        if (Groups.Count > 0) return;

        // Check if any rules have legacy section-scoped actions
        var sectionRules = new List<SectionRule>();
        var ungroupedRules = new List<SectionRule>();

        foreach (var rule in Rules)
        {
            if (IsLegacySectionAction(rule.Action))
            {
                sectionRules.Add(rule);
            }
            else
            {
                ungroupedRules.Add(rule);
            }
        }

        // Nothing to group → leave as-is
        if (sectionRules.Count == 0) return;

        // Move section rules into a group, keep single-property rules ungrouped
        Groups.Add(new RuleGroup { Name = groupName, Rules = sectionRules });
        Rules = ungroupedRules;
    }

    /// <summary>
    /// Returns whether a legacy action value represents a section-scoped (grouped) concept.
    /// </summary>
    private static bool IsLegacySectionAction(string? action)
    {
        return action is "sectionTitle" or "sectionContent" or "sectionDescription"
            or "sectionSummary" or "createSection" or "setAsHeading" or "addAsContent"
            or "addAsList";
    }
}

/// <summary>
/// A named group of rules. Groups represent multi-part sections (e.g., "Tour Detail"
/// with title + content rules). The group name becomes the mapping key prefix.
/// </summary>
public class RuleGroup
{
    /// <summary>Stable GUID identity — survives renames and reordering.</summary>
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("rules")]
    public List<SectionRule> Rules { get; set; } = new();
}

/// <summary>
/// Legacy flat rule set — kept for backward-compatible deserialization.
/// Convert to AreaRules via ToAreaRules() for processing.
/// </summary>
public class SectionRuleSet
{
    [JsonPropertyName("rules")]
    public List<SectionRule> Rules { get; set; } = new();

    /// <summary>
    /// Convert legacy flat rule set to AreaRules (all rules ungrouped).
    /// </summary>
    public AreaRules ToAreaRules()
    {
        return new AreaRules { Rules = Rules };
    }
}

/// <summary>
/// A single rule that assigns a role name to elements matching all conditions.
/// Rules are evaluated first-match-wins: an element claimed by one rule is excluded from later rules.
///
/// Part values (v3): title, content, description, summary
/// Legacy Action values still accepted on deserialization and normalized to Part via GetEffectivePart().
///
/// Format values: auto, paragraph, heading1-6, bulletListItem, numberedListItem, quote
/// </summary>
public class SectionRule
{
    /// <summary>Stable GUID identity — survives renames and reordering.</summary>
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Which slot this rule fills: "title", "content", "description", "summary".
    /// Title triggers section boundaries in grouped rules.
    /// </summary>
    [JsonPropertyName("part")]
    public string? Part { get; set; }

    /// <summary>
    /// Legacy action field — kept for backward-compatible deserialization.
    /// When Part is set, Action is ignored. When only Action is set, Part is derived from it.
    /// Not written on new saves (only Part is written).
    /// </summary>
    [JsonPropertyName("action")]
    public string? Action { get; set; }

    /// <summary>
    /// Markdown block format: auto, paragraph, heading1-6, bulletListItem, numberedListItem, quote.
    /// "auto" = system decides based on content patterns. Default is "auto".
    /// </summary>
    [JsonPropertyName("format")]
    public string? Format { get; set; }

    /// <summary>
    /// When true, matched elements are skipped entirely (not included in any section).
    /// Replaces the legacy action="exclude".
    /// </summary>
    [JsonPropertyName("exclude")]
    public bool Exclude { get; set; }

    [JsonPropertyName("conditions")]
    public List<RuleCondition> Conditions { get; set; } = new();

    /// <summary>
    /// Negative conditions: if any exception matches, the rule does not apply to that element.
    /// Uses the same condition vocabulary as Conditions.
    /// </summary>
    [JsonPropertyName("exceptions")]
    public List<RuleCondition>? Exceptions { get; set; }

    /// <summary>
    /// Find-and-replace entries applied to matched element text before formatting.
    /// Applied in order. Each entry's findType determines matching behavior.
    /// </summary>
    [JsonPropertyName("textReplacements")]
    public List<TextReplacement>? TextReplacements { get; set; }

    /// <summary>
    /// Optional segment: narrows the element's text to a from/to bounded piece
    /// before find & replace and formatting run. Null = whole element.
    /// Legacy (object) form — superseded by the "segment" marker condition in
    /// the conditions list. Kept for backward compatibility on read.
    /// </summary>
    [JsonPropertyName("segment")]
    public Segment? Segment { get; set; }

    /// <summary>
    /// True when the conditions list contains a "segment" marker condition.
    /// Conditions before the marker match the element; conditions after it
    /// (textFollows / textPrecedes) define the piece to extract.
    /// </summary>
    public bool HasSegmentMarker =>
        Conditions.Any(c => string.Equals(c.Type, "segment", StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Conditions used to MATCH the element: everything before the "segment"
    /// marker (or all conditions when there is no marker).
    /// </summary>
    public List<RuleCondition> MatchConditions
    {
        get
        {
            var idx = Conditions.FindIndex(c => string.Equals(c.Type, "segment", StringComparison.OrdinalIgnoreCase));
            return idx < 0 ? Conditions : Conditions.Take(idx).ToList();
        }
    }

    /// <summary>
    /// Conditions that DEFINE the piece to extract: everything after the
    /// "segment" marker (empty when there is no marker).
    /// </summary>
    public List<RuleCondition> SegmentConditions
    {
        get
        {
            var idx = Conditions.FindIndex(c => string.Equals(c.Type, "segment", StringComparison.OrdinalIgnoreCase));
            return idx < 0 ? new List<RuleCondition>() : Conditions.Skip(idx + 1).ToList();
        }
    }

    /// <summary>
    /// Returns the effective part, normalizing legacy action values.
    /// Priority: Exclude flag → Part field → Action field → default "content".
    /// </summary>
    public string GetEffectivePart()
    {
        if (Exclude) return "exclude";
        if (!string.IsNullOrEmpty(Part)) return Part;

        // Normalize from legacy Action field
        return Action switch
        {
            "singleProperty" or "sectionProperty" => "content",
            "sectionTitle" or "createSection" or "setAsHeading" => "title",
            "sectionContent" or "addAsContent" => "content",
            "addAsList" => "content",
            "sectionDescription" => "description",
            "sectionSummary" => "summary",
            "exclude" => "exclude",
            _ => "content",
        };
    }

    /// <summary>
    /// Returns the effective format, with defaults applied.
    /// </summary>
    public string GetEffectiveFormat()
    {
        // Explicit format always wins
        if (!string.IsNullOrEmpty(Format)) return Format;

        // Legacy action-derived defaults
        if (!string.IsNullOrEmpty(Action))
        {
            return Action switch
            {
                "addAsList" => "bulletListItem",
                _ => "auto",
            };
        }

        return "auto";
    }

    /// <summary>
    /// Returns whether this rule acts as a standalone single-property section.
    /// In legacy format, this is action="singleProperty". In new format, it's
    /// determined by the rule being ungrouped (not inside a RuleGroup).
    /// This method checks the legacy action for backward compat; callers should
    /// prefer checking group membership directly.
    /// </summary>
    public bool IsSinglePropertyLegacy()
    {
        return Action is "singleProperty" or "sectionProperty";
    }

    /// <summary>
    /// Legacy normalization — kept for backward compatibility with code that
    /// still uses the old (Action, Format) tuple pattern.
    /// Prefer GetEffectivePart() and GetEffectiveFormat() for new code.
    /// </summary>
    public (string Action, string? Format) GetNormalizedAction()
    {
        var part = GetEffectivePart();
        var format = GetEffectiveFormat();

        return part switch
        {
            "exclude" => ("exclude", null),
            "title" => ("sectionTitle", null),
            "content" when IsSinglePropertyLegacy() => ("singleProperty", format),
            "content" => ("sectionContent", format),
            "description" => ("sectionDescription", format),
            "summary" => ("sectionSummary", format),
            _ => ("sectionContent", format),
        };
    }
}

/// <summary>
/// A find-and-replace entry applied to matched element text before formatting.
/// The find type determines how the find value is matched:
/// textBeginsWith — matches only at the start of the text
/// textEndsWith — matches only at the end of the text
/// textContains — matches all occurrences
/// </summary>
public class TextReplacement
{
    /// <summary>
    /// How to find the text: textBeginsWith, textEndsWith, textContains.
    /// </summary>
    [JsonPropertyName("findType")]
    public string FindType { get; set; } = "textBeginsWith";

    /// <summary>
    /// The text to find.
    /// </summary>
    [JsonPropertyName("find")]
    public string Find { get; set; } = string.Empty;

    /// <summary>
    /// How to apply the replacement: replaceWith (single match for begins/ends),
    /// replaceAll (all occurrences for contains).
    /// </summary>
    [JsonPropertyName("replaceType")]
    public string ReplaceType { get; set; } = "replaceWith";

    /// <summary>
    /// The replacement text. Empty string means "remove".
    /// </summary>
    [JsonPropertyName("replace")]
    public string Replace { get; set; } = string.Empty;
}

/// <summary>
/// A single condition within a rule. All conditions in a rule must match (AND logic).
/// </summary>
public class RuleCondition
{
    /// <summary>
    /// Condition type: textBeginsWith, textEndsWith, textContains, textEquals, textMatchesPattern,
    /// fontSizeEquals, fontSizeAbove, fontSizeBelow, fontSizeRange, fontNameContains, fontNameEquals,
    /// colorEquals, positionFirst, positionLast
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// The value to match against. Type depends on condition:
    /// string for text/font/color conditions, number (as string) for font size,
    /// object with min/max for fontSizeRange. Not used for positionFirst/positionLast.
    /// </summary>
    [JsonPropertyName("value")]
    public object? Value { get; set; }

    /// <summary>
    /// Author-controlled order of this condition within its rule (0-based, contiguous).
    /// Nullable for backwards compatibility: conditions saved before this field existed
    /// have no value and are backfilled from array position on load. Ordering is
    /// mechanism-only today — it does not affect matching, which remains AND across all
    /// conditions regardless of order.
    /// </summary>
    [JsonPropertyName("sortOrder")]
    public int? SortOrder { get; set; }
}

/// <summary>
/// Optional narrowing of an element's text before the rest of a rule runs.
/// Absent = the rule operates on the whole element (default behaviour).
/// </summary>
public class Segment
{
    [JsonPropertyName("from")]
    public SegmentBoundary? From { get; set; }

    [JsonPropertyName("to")]
    public SegmentBoundary? To { get; set; }
}

/// <summary>
/// One boundary of a segment. Anchor kinds:
/// start, end, beforeMarker, afterMarker, number.
/// Marker is required only for beforeMarker / afterMarker.
/// </summary>
public class SegmentBoundary
{
    [JsonPropertyName("anchor")]
    public string Anchor { get; set; } = string.Empty;

    [JsonPropertyName("marker")]
    public string? Marker { get; set; }
}
