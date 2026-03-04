using System.Text.Json.Serialization;

namespace UpDoc.Models;

/// <summary>
/// Result of transforming area detection output into assembled Markdown sections.
/// Each detected section's children are assembled into a single Markdown string
/// using the appropriate pattern (bullet list, paragraph, sub-headed content).
/// </summary>
public class TransformResult
{
    public string Version { get; set; } = "2.0";

    /// <summary>Hierarchical structure: areas containing groups and ungrouped sections.</summary>
    public List<TransformArea> Areas { get; set; } = new();

    public TransformDiagnostics Diagnostics { get; set; } = new();

    /// <summary>
    /// Flat accessor over all sections in all areas (groups + ungrouped).
    /// Use for code that needs to iterate every section regardless of hierarchy.
    /// </summary>
    [JsonIgnore]
    public IEnumerable<TransformedSection> AllSections =>
        Areas.SelectMany(a => a.AllSections);
}

/// <summary>
/// An area from the PDF page (e.g., "Page Header", "Tour Details", "Organiser Information").
/// Contains groups (multi-part sections from grouped rules) and ungrouped sections.
/// </summary>
public class TransformArea
{
    /// <summary>Area name from the area template (e.g., "Tour Details").</summary>
    public string Name { get; set; } = "";

    /// <summary>Hex color of the area boundary.</summary>
    public string? Color { get; set; }

    /// <summary>Source page number.</summary>
    public int Page { get; set; }

    /// <summary>User-defined sort order. Null = document order (default).</summary>
    public int? SortOrder { get; set; }

    /// <summary>Named groups of multi-part sections (e.g., "Tour Details - Section" with title + content).</summary>
    public List<TransformGroup> Groups { get; set; } = new();

    /// <summary>Sections not belonging to any group (ungrouped rules or standard heading detection).</summary>
    public List<TransformedSection> Sections { get; set; } = new();

    /// <summary>Flat accessor: all sections from groups + ungrouped.</summary>
    [JsonIgnore]
    public IEnumerable<TransformedSection> AllSections =>
        Groups.SelectMany(g => g.Sections).Concat(Sections);
}

/// <summary>
/// A named group of sections produced by grouped rules (e.g., "Tour Details - Section").
/// Each section in the group has a title + content + optional description/summary.
/// </summary>
public class TransformGroup
{
    /// <summary>Group name from the rule group (e.g., "Tour Details - Section").</summary>
    public string Name { get; set; } = "";

    /// <summary>Sections belonging to this group.</summary>
    public List<TransformedSection> Sections { get; set; } = new();
}

/// <summary>
/// A section whose children have been assembled into Markdown content.
/// </summary>
public class TransformedSection
{
    /// <summary>
    /// Semantic ID derived from heading text: "features", "what-we-will-see".
    /// For preamble sections (no heading): "preamble-{areaNameKebab}-p{page}".
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Stable GUID from the rule/group that produced this section.
    /// Survives section ID changes when areas/groups are restructured.
    /// Null for preamble and heading-detected sections (no originating rule).
    /// </summary>
    public string? StableKey { get; set; }

    /// <summary>Original heading text as extracted (e.g., "FEATURES").</summary>
    public string? OriginalHeading { get; set; }

    /// <summary>Title-cased heading (e.g., "Features"). Null for preamble sections.</summary>
    public string? Heading { get; set; }

    /// <summary>Assembled Markdown content from section children (sectionContent elements).</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Assembled Markdown from sectionDescription elements. Null if none.</summary>
    public string? Description { get; set; }

    /// <summary>Assembled Markdown from sectionSummary elements. Null if none.</summary>
    public string? Summary { get; set; }

    /// <summary>Which assembly pattern was applied: bulletList, paragraph, subHeaded, preamble.</summary>
    public string Pattern { get; set; } = "paragraph";

    /// <summary>Source page number.</summary>
    public int Page { get; set; }

    /// <summary>Hex color of the area this section belongs to.</summary>
    public string? AreaColor { get; set; }

    /// <summary>Name of the area this section belongs to (e.g., "Page Header", "Tour Details").</summary>
    public string? AreaName { get; set; }

    /// <summary>
    /// Name of the rule group that produced this section (e.g., "Tour Details - Section").
    /// Null for ungrouped (single-property) rules. Used by the frontend to distinguish
    /// grouped sections (box title = group name, sub-labeled parts) from ungrouped sections
    /// (box title = role name, content only).
    /// </summary>
    public string? GroupName { get; set; }

    /// <summary>
    /// Name of the individual rule that produced this section (from SectionRule.Role).
    /// For ungrouped rules: the rule's Role (e.g., "Organiser Name").
    /// For grouped rules: the title rule's Role that started this section.
    /// Null for sections not produced by rules (standard heading detection, preamble).
    /// </summary>
    public string? RuleName { get; set; }

    /// <summary>Number of children that were assembled.</summary>
    public int ChildCount { get; set; }

    /// <summary>
    /// Whether this section is included in the shaped output. Default: true.
    /// Author can exclude sections (preamble noise, footers, supplements)
    /// so they never reach the mapping or destination.
    /// </summary>
    public bool Included { get; set; } = true;

    /// <summary>User-defined sort order within its area. Null = document order (default).</summary>
    public int? SortOrder { get; set; }
}

/// <summary>
/// Diagnostic counts for the transform result.
/// </summary>
public class TransformDiagnostics
{
    public int TotalSections { get; set; }
    public int BulletListSections { get; set; }
    public int ParagraphSections { get; set; }
    public int SubHeadedSections { get; set; }
    public int PreambleSections { get; set; }
    public int RoleSections { get; set; }
}
