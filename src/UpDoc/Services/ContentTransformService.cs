using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using UpDoc.Models;

namespace UpDoc.Services;

/// <summary>
/// Transforms area detection output into assembled Markdown sections.
/// Pure function: AreaDetectionResult → TransformResult.
/// </summary>
public interface IContentTransformService
{
    TransformResult Transform(AreaDetectionResult areaDetection, Dictionary<string, AreaRules>? areaRules = null, TransformResult? previous = null);
}

public class ContentTransformService : IContentTransformService
{
    private static readonly HashSet<char> BulletChars = new()
    {
        '•', '●', '○', '■', '□', '▪', '▫', '◆', '◇', '►', '▸', '\u2022'
    };

    public TransformResult Transform(AreaDetectionResult areaDetection, Dictionary<string, AreaRules>? areaRules = null, TransformResult? previous = null)
    {
        var result = new TransformResult();
        var diagnostics = new TransformDiagnostics();

        // Track seen IDs to deduplicate (same heading in multiple areas → same kebab ID)
        var seenIds = new Dictionary<string, int>();

        foreach (var page in areaDetection.Pages)
        {
            for (int areaIndex = 0; areaIndex < page.Areas.Count; areaIndex++)
            {
                var area = page.Areas[areaIndex];

                var transformArea = new TransformArea
                {
                    Name = area.Name ?? "",
                    Color = string.IsNullOrEmpty(area.Color) ? null : area.Color,
                    Page = page.Page,
                };

                // Check if this area has rules that should produce individual sections
                var areaKey = !string.IsNullOrEmpty(area.Name) ? NormalizeToKebabCase(area.Name) : null;
                AreaRules? areaRule = null;
                if (areaKey != null && areaRules != null)
                {
                    areaRules.TryGetValue(areaKey, out areaRule);
                }

                // When area rules exist, apply them to all elements in the area
                if (areaRule != null && areaRule.AllRules().Any())
                {
                    var roleSections = TransformAreaWithRules(
                        area, areaRule, page.Page, areaIndex, seenIds, diagnostics);

                    // Partition sections into groups and ungrouped by GroupName
                    var grouped = new Dictionary<string, List<TransformedSection>>();
                    foreach (var s in roleSections)
                    {
                        if (s.GroupName != null)
                        {
                            if (!grouped.ContainsKey(s.GroupName))
                                grouped[s.GroupName] = new List<TransformedSection>();
                            grouped[s.GroupName].Add(s);
                        }
                        else
                        {
                            transformArea.Sections.Add(s);
                        }
                    }

                    // Create TransformGroup objects preserving insertion order
                    foreach (var kvp in grouped)
                    {
                        transformArea.Groups.Add(new TransformGroup
                        {
                            Name = kvp.Key,
                            Sections = kvp.Value,
                        });
                    }
                }
                else
                {
                    // Normal processing: transform each detected section
                    foreach (var section in area.Sections)
                    {
                        var transformed = TransformSection(section, page.Page, area.Color, area.Name, areaIndex);
                        DeduplicateId(transformed, seenIds);
                        transformArea.Sections.Add(transformed);
                        UpdateDiagnostics(diagnostics, transformed.Pattern);
                    }
                }

                result.Areas.Add(transformArea);
            }
        }

        // Preserve include/exclude state from previous transform
        if (previous != null)
        {
            var previousInclusion = new Dictionary<string, bool>();
            foreach (var s in previous.AllSections)
            {
                previousInclusion.TryAdd(s.Id, s.Included);
            }

            foreach (var section in result.AllSections)
            {
                if (previousInclusion.TryGetValue(section.Id, out var included))
                {
                    section.Included = included;
                }
            }
        }

        var allSections = result.AllSections.ToList();
        diagnostics.TotalSections = allSections.Count;
        result.Diagnostics = diagnostics;
        return result;
    }

    private static TransformedSection TransformSection(
        DetectedSection section, int page, string? areaColor, string? areaName, int areaIndex)
    {
        var heading = section.Heading;
        var children = section.Children;

        // Generate section ID
        string id;
        string? originalHeading = null;
        string? titleCasedHeading = null;

        if (heading != null)
        {
            originalHeading = heading.Text;
            titleCasedHeading = ToTitleCaseIfAllCaps(heading.Text);
            id = NormalizeToKebabCase(heading.Text);
        }
        else
        {
            id = $"preamble-p{page}-z{areaIndex}";
        }

        // Detect pattern and assemble Markdown
        var pattern = DetectPattern(children);
        var content = AssembleMarkdown(children, pattern);

        return new TransformedSection
        {
            Id = id,
            OriginalHeading = originalHeading,
            Heading = titleCasedHeading,
            Content = content,
            Pattern = pattern,
            Page = page,
            AreaColor = string.IsNullOrEmpty(areaColor) ? null : areaColor,
            AreaName = areaName,
            ChildCount = children.Count,
        };
    }

    /// <summary>
    /// Transforms an area using area rules to produce sections driven by rule parts.
    /// Collects all elements from all sections (headings + children) and applies
    /// rules against the complete set (first-match-wins per element).
    ///
    /// Ungrouped rules with part="content" → standalone section (role name = heading, element text = content)
    /// Grouped rules:
    ///   part="title" → flush current section, start new section with this element as heading
    ///   part="content" → append to current section using the rule's Format for Markdown output
    ///   part="description" → append to description part
    ///   part="summary" → append to summary part
    ///   exclude=true → skip element entirely
    ///
    /// Format determines Markdown output for content parts:
    ///   auto → system decides, paragraph → plain text, heading1-6 → #..######,
    ///   bulletListItem → "- ", numberedListItem → "N. "
    ///
    /// Unmatched elements are appended as paragraph content to the current open section.
    /// </summary>
    private static List<TransformedSection> TransformAreaWithRules(
        DetectedArea area, AreaRules areaRule, int page, int areaIndex,
        Dictionary<string, int> seenIds, TransformDiagnostics diagnostics)
    {
        var sections = new List<TransformedSection>();

        // Flatten all elements from all sections (headings are elements too)
        var elements = new List<AreaElement>();
        foreach (var section in area.Sections)
        {
            if (section.Heading != null)
                elements.Add(section.Heading);
            elements.AddRange(section.Children);
        }

        var total = elements.Count;

        // Build a flat list of all rules for matching, a set of ungrouped rules,
        // and a rule-to-group-name mapping for grouped rules
        var allRules = areaRule.AllRules().ToList();
        var ungroupedRules = new HashSet<SectionRule>(areaRule.Rules);
        var ruleGroupNames = new Dictionary<SectionRule, string>();
        foreach (var group in areaRule.Groups)
            foreach (var rule in group.Rules)
                ruleGroupNames[rule] = group.Name;

        // For each element, determine which rule (if any) claims it (first-match-wins)
        var elementRules = new SectionRule?[elements.Count];
        for (int i = 0; i < elements.Count; i++)
        {
            foreach (var rule in allRules)
            {
                // Skip rules with no conditions — empty conditions match everything (vacuous truth)
                if (rule.Conditions.Count == 0)
                    continue;

                // Check exceptions: if any exception matches, skip this rule for this element
                if (rule.Exceptions != null && rule.Exceptions.Count > 0)
                {
                    bool exceptionMatches = false;
                    foreach (var exception in rule.Exceptions)
                    {
                        if (PdfPagePropertiesService.MatchesAllConditions(
                            elements[i], new List<RuleCondition> { exception }, i, total))
                        {
                            exceptionMatches = true;
                            break;
                        }
                    }
                    if (exceptionMatches)
                        continue;
                }

                if (PdfPagePropertiesService.MatchesAllConditions(elements[i], rule.Conditions, i, total))
                {
                    elementRules[i] = rule;
                    break; // first-match-wins: move to next element
                }
            }
        }

        // Resolve effective parts, formats, group membership, and group names for matched elements
        var elementParts = new string?[elements.Count];
        var elementFormats = new string?[elements.Count];
        var elementIsUngrouped = new bool[elements.Count];
        var elementGroupNames = new string?[elements.Count];
        for (int i = 0; i < elements.Count; i++)
        {
            if (elementRules[i] != null)
            {
                elementParts[i] = elementRules[i]!.GetEffectivePart();
                elementFormats[i] = elementRules[i]!.GetEffectiveFormat();
                elementIsUngrouped[i] = ungroupedRules.Contains(elementRules[i]!);
                ruleGroupNames.TryGetValue(elementRules[i]!, out var gn);
                elementGroupNames[i] = gn;
            }
        }

        // Apply text replacements from matched rules to element text
        for (int i = 0; i < elements.Count; i++)
        {
            if (elementRules[i]?.TextReplacements is { Count: > 0 } replacements)
            {
                elements[i].Text = ApplyTextReplacements(elements[i].Text, replacements);
            }
        }

        // Check if any rules use part-driven behavior (anything beyond just legacy title-only rules).
        // Ungrouped content rules, grouped content/description/summary, or excludes → part-driven mode.
        bool hasPartDrivenRules = false;
        for (int i = 0; i < elements.Count; i++)
        {
            var part = elementParts[i];
            if (part is "content" or "description" or "summary" or "exclude")
            {
                hasPartDrivenRules = true;
                break;
            }
        }

        if (hasPartDrivenRules)
        {
            // PART-DRIVEN MODE: each element's part determines behaviour.
            // Sections have separately-mappable parts: content, description, summary.
            string? currentHeadingText = null;
            string? currentGroupName = null;
            string? currentRuleName = null;
            var currentContentLines = new List<string>();
            var currentDescriptionLines = new List<string>();
            var currentSummaryLines = new List<string>();
            int numberedListCounter = 0;

            void FlushSection()
            {
                if (currentHeadingText == null && currentContentLines.Count == 0
                    && currentDescriptionLines.Count == 0 && currentSummaryLines.Count == 0) return;

                string id;
                string? titleCasedHeading = null;
                if (currentHeadingText != null)
                {
                    titleCasedHeading = ToTitleCaseIfAllCaps(currentHeadingText);
                    id = NormalizeToKebabCase(currentHeadingText);
                }
                else
                {
                    id = $"preamble-p{page}-z{areaIndex}";
                }

                var content = currentContentLines.Count > 0
                    ? string.Join("\n\n", currentContentLines)
                    : (currentHeadingText ?? string.Empty);

                // Detect pattern from content shape
                var pattern = currentContentLines.Count > 0
                    ? (currentContentLines.All(l => l.StartsWith("- ")) ? "bulletList" : "paragraph")
                    : "role";

                var s = new TransformedSection
                {
                    Id = id,
                    Heading = titleCasedHeading,
                    OriginalHeading = currentHeadingText,
                    Content = content,
                    Description = currentDescriptionLines.Count > 0
                        ? string.Join("\n", currentDescriptionLines)
                        : null,
                    Summary = currentSummaryLines.Count > 0
                        ? string.Join("\n", currentSummaryLines)
                        : null,
                    Pattern = pattern,
                    Page = page,
                    AreaColor = string.IsNullOrEmpty(area.Color) ? null : area.Color,
                    AreaName = area.Name,
                    GroupName = currentGroupName,
                    RuleName = currentRuleName,
                    ChildCount = currentContentLines.Count + currentDescriptionLines.Count + currentSummaryLines.Count,
                };
                DeduplicateId(s, seenIds);
                sections.Add(s);
                UpdateDiagnostics(diagnostics, s.Pattern);
                currentHeadingText = null;
                currentGroupName = null;
                currentRuleName = null;
                currentContentLines = new List<string>();
                currentDescriptionLines = new List<string>();
                currentSummaryLines = new List<string>();
                numberedListCounter = 0;
            }

            // PRE-PASS: collect ungrouped elements per rule, then emit in rule order.
            // This ensures (a) sections appear in rule order, not DOM order, and
            // (b) multiple elements matching the same rule are concatenated into one section.
            // Handles all ungrouped parts (title, content, etc.) — not just content.
            var ungroupedElementsByRule = new Dictionary<SectionRule, List<(int index, string formatted)>>();
            for (int i = 0; i < elements.Count; i++)
            {
                if (elementIsUngrouped[i] && elementRules[i] != null)
                {
                    var part = elementParts[i] ?? "content";
                    if (part == "exclude") continue;
                    var rule = elementRules[i]!;
                    if (!ungroupedElementsByRule.ContainsKey(rule))
                        ungroupedElementsByRule[rule] = new List<(int, string)>();
                    var format = elementFormats[i] ?? "auto";
                    var propLine = FormatContentLine(elements[i].Text, format, ref numberedListCounter);
                    ungroupedElementsByRule[rule].Add((i, propLine));
                }
            }

            // Emit ungrouped sections in rule order (iterating areaRule.Rules)
            foreach (var rule in areaRule.Rules)
            {
                if (ungroupedElementsByRule.TryGetValue(rule, out var entries) && entries.Count > 0)
                {
                    var roleName = rule.Role ?? entries[0].formatted;
                    var content = string.Join(" ", entries.Select(e => e.formatted));
                    var propId = NormalizeToKebabCase(roleName);
                    var propSection = new TransformedSection
                    {
                        Id = propId,
                        Heading = ToTitleCaseIfAllCaps(roleName),
                        OriginalHeading = roleName,
                        Content = content,
                        RuleName = rule.Role,
                        Pattern = "role",
                        Page = page,
                        AreaColor = string.IsNullOrEmpty(area.Color) ? null : area.Color,
                        AreaName = area.Name,
                        ChildCount = entries.Count,
                    };
                    DeduplicateId(propSection, seenIds);
                    sections.Add(propSection);
                    UpdateDiagnostics(diagnostics, propSection.Pattern);
                }
            }

            for (int i = 0; i < elements.Count; i++)
            {
                var part = elementParts[i] ?? "content";
                var format = elementFormats[i] ?? "auto";
                var isUngrouped = elementIsUngrouped[i];

                // Ungrouped rules already emitted in rule order above — skip
                if (isUngrouped)
                    continue;

                // Elements with no matching rule are unmatched — skip in part-driven mode
                if (elementRules[i] == null)
                    continue;

                switch (part)
                {
                    case "title":
                        FlushSection();
                        currentHeadingText = FormatContentLine(elements[i].Text, format, ref numberedListCounter);
                        currentGroupName = elementGroupNames[i];
                        currentRuleName = elementRules[i]?.Role;
                        break;

                    case "content":
                        // Flush when the group changes (e.g., Features → Sights, both content-only)
                        if (elementGroupNames[i] != null && currentGroupName != null
                            && elementGroupNames[i] != currentGroupName)
                        {
                            FlushSection();
                        }
                        if (currentGroupName == null && elementGroupNames[i] != null)
                            currentGroupName = elementGroupNames[i];
                        var contentLine = FormatContentLine(elements[i].Text, format, ref numberedListCounter);
                        currentContentLines.Add(contentLine);
                        break;

                    case "description":
                        if (elementGroupNames[i] != null && currentGroupName != null
                            && elementGroupNames[i] != currentGroupName)
                        {
                            FlushSection();
                        }
                        if (currentGroupName == null && elementGroupNames[i] != null)
                            currentGroupName = elementGroupNames[i];
                        var descLine = FormatContentLine(elements[i].Text, format, ref numberedListCounter);
                        currentDescriptionLines.Add(descLine);
                        break;

                    case "summary":
                        if (elementGroupNames[i] != null && currentGroupName != null
                            && elementGroupNames[i] != currentGroupName)
                        {
                            FlushSection();
                        }
                        if (currentGroupName == null && elementGroupNames[i] != null)
                            currentGroupName = elementGroupNames[i];
                        var summaryLine = FormatContentLine(elements[i].Text, format, ref numberedListCounter);
                        currentSummaryLines.Add(summaryLine);
                        break;

                    case "exclude":
                        // Skip entirely
                        break;
                }
            }
            FlushSection();
        }
        else
        {
            // LEGACY MODE: no part-driven rules, use role-count heuristic for backward
            // compatibility with rules that only use title parts (old createSection).
            var roleCounts = new Dictionary<string, int>();
            for (int i = 0; i < elements.Count; i++)
            {
                var role = elementRules[i]?.Role;
                if (role != null)
                    roleCounts[role] = (roleCounts.TryGetValue(role, out var c) ? c : 0) + 1;
            }

            var repeatingRoles = new HashSet<string>(roleCounts.Where(r => r.Value > 1).Select(r => r.Key));

            if (repeatingRoles.Count > 0)
            {
                // BOUNDARY MODE: each matched element starts a new section; following unmatched = content.
                string? currentHeadingText = null;
                var currentChildren = new List<AreaElement>();

                void FlushSection()
                {
                    if (currentHeadingText == null && currentChildren.Count == 0) return;

                    string id;
                    string? titleCasedHeading = null;
                    if (currentHeadingText != null)
                    {
                        titleCasedHeading = ToTitleCaseIfAllCaps(currentHeadingText);
                        id = NormalizeToKebabCase(currentHeadingText);
                    }
                    else
                    {
                        id = $"preamble-p{page}-z{areaIndex}";
                    }

                    var pat = DetectPattern(currentChildren);
                    var content = currentChildren.Count > 0
                        ? AssembleMarkdown(currentChildren, pat)
                        : (currentHeadingText ?? string.Empty);

                    var s = new TransformedSection
                    {
                        Id = id,
                        Heading = titleCasedHeading,
                        OriginalHeading = currentHeadingText,
                        Content = content,
                        Pattern = currentChildren.Count > 0 ? pat : "role",
                        Page = page,
                        AreaColor = string.IsNullOrEmpty(area.Color) ? null : area.Color,
                        AreaName = area.Name,
                        ChildCount = currentChildren.Count,
                    };
                    DeduplicateId(s, seenIds);
                    sections.Add(s);
                    UpdateDiagnostics(diagnostics, s.Pattern);
                    currentHeadingText = null;
                    currentChildren = new List<AreaElement>();
                }

                for (int i = 0; i < elements.Count; i++)
                {
                    var role = elementRules[i]?.Role;
                    if (role != null && repeatingRoles.Contains(role))
                    {
                        FlushSection();
                        currentHeadingText = elements[i].Text;
                    }
                    else
                    {
                        currentChildren.Add(elements[i]);
                    }
                }
                FlushSection();
            }
            else
            {
                // GROUPING MODE: one section per role (label → data pattern for single-match roles).
                var roleElements = new Dictionary<string, List<AreaElement>>();
                var unclaimed = new List<AreaElement>();
                for (int i = 0; i < elements.Count; i++)
                {
                    if (elementRules[i] != null)
                    {
                        var role = elementRules[i]!.Role;
                        if (!roleElements.ContainsKey(role))
                            roleElements[role] = new List<AreaElement>();
                        roleElements[role].Add(elements[i]);
                    }
                    else
                    {
                        unclaimed.Add(elements[i]);
                    }
                }

                foreach (var rule in allRules)
                {
                    if (roleElements.TryGetValue(rule.Role, out var roleEls) && roleEls.Count > 0)
                    {
                        var content = string.Join("\n\n", roleEls.Select(e => e.Text));
                        var section = new TransformedSection
                        {
                            Id = NormalizeToKebabCase(rule.Role),
                            Heading = rule.Role,
                            OriginalHeading = rule.Role,
                            Content = content,
                            RuleName = rule.Role,
                            Pattern = "role",
                            Page = page,
                            AreaColor = string.IsNullOrEmpty(area.Color) ? null : area.Color,
                            AreaName = area.Name,
                            ChildCount = roleEls.Count,
                        };
                        DeduplicateId(section, seenIds);
                        sections.Add(section);
                        UpdateDiagnostics(diagnostics, section.Pattern);
                    }
                }

                if (unclaimed.Count > 0)
                {
                    var pattern = DetectPattern(unclaimed);
                    var content = AssembleMarkdown(unclaimed, pattern);
                    var remainingSection = new TransformedSection
                    {
                        Id = $"preamble-p{page}-z{areaIndex}",
                        Heading = null,
                        OriginalHeading = null,
                        Content = content,
                        Pattern = pattern,
                        Page = page,
                        AreaColor = string.IsNullOrEmpty(area.Color) ? null : area.Color,
                        AreaName = area.Name,
                        ChildCount = unclaimed.Count,
                    };
                    DeduplicateId(remainingSection, seenIds);
                    sections.Add(remainingSection);
                    UpdateDiagnostics(diagnostics, remainingSection.Pattern);
                }
            }
        }

        return sections;
    }

    /// <summary>
    /// Applies text replacement entries to element text.
    /// Each entry's findType determines matching behavior:
    /// textBeginsWith — replaces only at the start
    /// textEndsWith — replaces only at the end
    /// textContains — replaces all occurrences
    /// </summary>
    private static string ApplyTextReplacements(string text, List<TextReplacement> replacements)
    {
        foreach (var tr in replacements)
        {
            if (string.IsNullOrEmpty(tr.Find)) continue;

            text = tr.FindType switch
            {
                "textBeginsWith" when text.StartsWith(tr.Find, StringComparison.OrdinalIgnoreCase)
                    => tr.Replace + text[tr.Find.Length..],
                "textEndsWith" when text.EndsWith(tr.Find, StringComparison.OrdinalIgnoreCase)
                    => text[..^tr.Find.Length] + tr.Replace,
                "textContains"
                    => text.Replace(tr.Find, tr.Replace, StringComparison.OrdinalIgnoreCase),
                _ => text,
            };
        }

        return text.Trim();
    }

    /// <summary>
    /// Formats an element's text according to the rule's format value.
    /// Produces the Markdown line that will be accumulated in the current section.
    /// </summary>
    private static string FormatContentLine(string text, string? format, ref int numberedListCounter)
    {
        // Reset numbered list counter when format is not numberedListItem
        if (format != "numberedListItem" && format != "auto")
            numberedListCounter = 0;

        return format switch
        {
            "heading1" => $"# {text}",
            "heading2" => $"## {text}",
            "heading3" => $"### {text}",
            "heading4" => $"#### {text}",
            "heading5" => $"##### {text}",
            "heading6" => $"###### {text}",
            "bulletListItem" => $"- {StripBulletPrefix(text)}",
            "numberedListItem" => $"{++numberedListCounter}. {text}",
            "quote" => $"> {text}",
            "auto" => AutoFormatLine(text, ref numberedListCounter),
            "paragraph" => text,
            _ => text, // null or unknown → plain text
        };
    }

    /// <summary>
    /// Auto-detects the appropriate Markdown format from text content.
    /// Bullet-prefixed text → "- text", numbered "N." prefix → "N. text", otherwise → plain paragraph.
    /// </summary>
    private static string AutoFormatLine(string text, ref int numberedListCounter)
    {
        var trimmed = text.TrimStart();

        // Check for bullet prefix
        if (trimmed.Length > 0 && BulletChars.Contains(trimmed[0]))
        {
            numberedListCounter = 0;
            return $"- {StripBulletPrefix(text)}";
        }

        // Check for numbered list prefix (e.g., "1. " or "1) ")
        var match = System.Text.RegularExpressions.Regex.Match(trimmed, @"^\d+[\.\)]\s");
        if (match.Success)
        {
            return $"{++numberedListCounter}. {trimmed[match.Length..]}";
        }

        // Plain paragraph
        numberedListCounter = 0;
        return text;
    }

    /// <summary>
    /// Detects which assembly pattern best fits the section children.
    /// </summary>
    private static string DetectPattern(List<AreaElement> children)
    {
        if (children.Count == 0)
            return "preamble";

        // Count bullet children
        int bulletCount = 0;
        foreach (var child in children)
        {
            var trimmed = child.Text.TrimStart();
            if (trimmed.Length > 0 && BulletChars.Contains(trimmed[0]))
                bulletCount++;
        }

        // If >50% are bullets, it's a bullet list
        if (bulletCount > children.Count / 2)
            return "bulletList";

        // Check for sub-headings (children with fontSize > mode of section children)
        if (children.Count >= 2 && HasSubHeadings(children))
            return "subHeaded";

        return "paragraph";
    }

    /// <summary>
    /// Checks whether children contain sub-headings (e.g., Day 1, Day 2...).
    /// Uses the same mode font size algorithm as GroupIntoSections.
    /// </summary>
    private static bool HasSubHeadings(List<AreaElement> children)
    {
        var fontSizeCounts = new Dictionary<double, int>();
        foreach (var el in children)
        {
            var size = Math.Round(el.FontSize, 1);
            fontSizeCounts[size] = fontSizeCounts.GetValueOrDefault(size) + 1;
        }

        var bodySize = fontSizeCounts.OrderByDescending(kvp => kvp.Value).First().Key;

        // Count children with font size > mode
        int subHeadingCount = 0;
        foreach (var el in children)
        {
            if (Math.Round(el.FontSize, 1) > bodySize)
                subHeadingCount++;
        }

        // Need at least 2 sub-headings and they shouldn't be the majority
        return subHeadingCount >= 2 && subHeadingCount < children.Count;
    }

    /// <summary>
    /// Assembles Markdown from section children based on the detected pattern.
    /// </summary>
    private static string AssembleMarkdown(List<AreaElement> children, string pattern)
    {
        if (children.Count == 0)
            return string.Empty;

        return pattern switch
        {
            "bulletList" => AssembleBulletList(children),
            "subHeaded" => AssembleSubHeaded(children),
            "paragraph" => AssembleParagraph(children),
            _ => AssemblePreamble(children),
        };
    }

    /// <summary>
    /// Strips bullet chars and produces a Markdown bulleted list.
    /// </summary>
    private static string AssembleBulletList(List<AreaElement> children)
    {
        var sb = new StringBuilder();
        foreach (var child in children)
        {
            var text = StripBulletPrefix(child.Text);
            sb.AppendLine($"- {text}");
        }
        return sb.ToString().TrimEnd();
    }

    /// <summary>
    /// Assembles sub-headed content with ## headings and paragraph body text.
    /// Children with fontSize > mode become ## sub-headings.
    /// </summary>
    private static string AssembleSubHeaded(List<AreaElement> children)
    {
        // Compute mode font size of children
        var fontSizeCounts = new Dictionary<double, int>();
        foreach (var el in children)
        {
            var size = Math.Round(el.FontSize, 1);
            fontSizeCounts[size] = fontSizeCounts.GetValueOrDefault(size) + 1;
        }
        var bodySize = fontSizeCounts.OrderByDescending(kvp => kvp.Value).First().Key;

        var sb = new StringBuilder();
        bool firstSection = true;

        foreach (var child in children)
        {
            var isSubHeading = Math.Round(child.FontSize, 1) > bodySize;

            if (isSubHeading)
            {
                if (!firstSection)
                    sb.AppendLine();
                sb.AppendLine($"## {child.Text}");
                firstSection = false;
            }
            else
            {
                // Body text — append as paragraph
                sb.AppendLine(child.Text);
            }
        }

        return sb.ToString().TrimEnd();
    }

    /// <summary>
    /// Joins children as paragraph text with double newlines between them.
    /// </summary>
    private static string AssembleParagraph(List<AreaElement> children)
    {
        return string.Join("\n\n", children.Select(c => c.Text));
    }

    /// <summary>
    /// Preamble: joins children with single newlines.
    /// </summary>
    private static string AssemblePreamble(List<AreaElement> children)
    {
        return string.Join("\n", children.Select(c => c.Text));
    }

    /// <summary>
    /// Strips leading bullet character and whitespace from text.
    /// "• 4* central Dresden hotel" → "4* central Dresden hotel"
    /// </summary>
    private static string StripBulletPrefix(string text)
    {
        var trimmed = text.TrimStart();
        if (trimmed.Length > 0 && BulletChars.Contains(trimmed[0]))
        {
            return trimmed[1..].TrimStart();
        }
        return text;
    }

    /// <summary>
    /// Converts ALL CAPS text to Title Case. Mixed case text is left as-is.
    /// "FEATURES" → "Features", "WHAT WE WILL SEE" → "What We Will See"
    /// "Day 1" → "Day 1" (already mixed case, unchanged)
    /// </summary>
    private static string ToTitleCaseIfAllCaps(string text)
    {
        // Check if all alphabetic characters are uppercase
        bool hasAlpha = false;
        bool allCaps = true;
        foreach (var c in text)
        {
            if (char.IsLetter(c))
            {
                hasAlpha = true;
                if (!char.IsUpper(c))
                {
                    allCaps = false;
                    break;
                }
            }
        }

        if (!hasAlpha || !allCaps)
            return text;

        return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(text.ToLower(CultureInfo.CurrentCulture));
    }

    /// <summary>
    /// Normalizes text to kebab-case for use as a section ID.
    /// "FEATURES" → "features", "WHAT WE WILL SEE" → "what-we-will-see"
    /// </summary>
    private static string NormalizeToKebabCase(string text)
    {
        // Lowercase, replace non-alphanumeric with hyphens, collapse multiples
        var lower = text.ToLower(CultureInfo.InvariantCulture).Trim();
        var kebab = Regex.Replace(lower, @"[^a-z0-9]+", "-");
        return kebab.Trim('-');
    }

    /// <summary>
    /// Ensures section IDs are unique by appending a numeric suffix for duplicates.
    /// "features" stays "features", second occurrence becomes "features-2", etc.
    /// </summary>
    private static void DeduplicateId(TransformedSection section, Dictionary<string, int> seenIds)
    {
        var baseId = section.Id;
        if (seenIds.TryGetValue(baseId, out var count))
        {
            seenIds[baseId] = count + 1;
            section.Id = $"{baseId}-{count + 1}";
        }
        else
        {
            seenIds[baseId] = 1;
        }
    }

    private static void UpdateDiagnostics(TransformDiagnostics diagnostics, string pattern)
    {
        switch (pattern)
        {
            case "bulletList": diagnostics.BulletListSections++; break;
            case "paragraph": diagnostics.ParagraphSections++; break;
            case "subHeaded": diagnostics.SubHeadedSections++; break;
            case "preamble": diagnostics.PreambleSections++; break;
            case "role": diagnostics.RoleSections++; break;
        }
    }
}
