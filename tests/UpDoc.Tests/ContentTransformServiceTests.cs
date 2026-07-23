using System.Text.Json;
using UpDoc.Models;
using UpDoc.Services;

namespace UpDoc.Tests;

/// <summary>
/// Characterisation tests for ContentTransformService. These pin down the
/// transform's behaviour so changes to the matching model (element re-use)
/// can be made without silently altering existing single-rule output.
/// </summary>
public class ContentTransformServiceTests
{
    private static readonly ContentTransformService Service = new();

    /// <summary>
    /// Builds a single-area, single-page detection result from a list of
    /// (text, fontSize, colour) elements, so tests can construct input tersely.
    /// </summary>
    private static AreaDetectionResult OneArea(string areaName, params AreaElement[] elements)
    {
        return new AreaDetectionResult
        {
            TotalPages = 1,
            Pages =
            {
                new PageAreas
                {
                    Page = 1,
                    Areas =
                    {
                        new DetectedArea
                        {
                            Name = areaName,
                            Page = 1,
                            TotalElements = elements.Length,
                            Sections = { new DetectedSection { Children = elements.ToList() } },
                        },
                    },
                },
            },
        };
    }

    private static AreaElement El(string id, string text, double fontSize = 12, string color = "#000000") =>
        new() { Id = id, Text = text, FontSize = fontSize, Color = color };

    private static Dictionary<string, AreaRules> Rules(string areaName, params SectionRule[] ungrouped) =>
        new() { [ContentTransformServiceTests.Kebab(areaName)] = new AreaRules { Rules = ungrouped.ToList() } };

    // Mirror of the service's private NormalizeToKebabCase for keying areaRules.
    private static string Kebab(string text) =>
        new string(text.ToLowerInvariant().Trim()
            .Select(c => char.IsLetterOrDigit(c) ? c : '-').ToArray())
            .Trim('-');

    private static SectionRule ContentRule(string role, string containsText) => new()
    {
        Id = Guid.NewGuid().ToString(),
        Role = role,
        Part = "content",
        Conditions = { new RuleCondition { Type = "textContains", Value = containsText } },
    };


    // ---- Characterisation: current single-rule behaviour ----

    [Fact]
    public void SingleContentRule_ProducesOneSection_ForTheMatchedElement()
    {
        var detection = OneArea("Header",
            El("e1", "5 days from £1,199 Departing 30th September 2026", fontSize: 14.4, color: "#FFD200"));

        var rules = Rules("Header", ContentRule("Price", "£"));

        var result = Service.Transform(detection, rules);

        var sections = result.Areas.SelectMany(a => a.Sections).ToList();
        Assert.Single(sections);
        Assert.Contains("£1,199", sections[0].Content);
    }

    /// <summary>
    /// ELEMENT RE-USE: two ungrouped content rules both match the strapline (it
    /// contains both "£" and "Days"). Each should produce its own section, so the
    /// one element feeds two mappings. This is the Sprint 1 behaviour.
    /// </summary>
    [Fact]
    public void TwoUngroupedContentRulesMatchingOneElement_ProduceTwoSections()
    {
        var detection = OneArea("Header",
            El("e1", "5 days from £1,199 Departing 30th September 2026", fontSize: 14.4, color: "#FFD200"));

        var rules = Rules("Header",
            ContentRule("Price", "£"),
            ContentRule("Duration", "Days"));

        var result = Service.Transform(detection, rules);

        var sections = result.Areas.SelectMany(a => a.Sections).ToList();

        Assert.Equal(2, sections.Count);
        Assert.Contains(sections, s => s.RuleName == "Price");
        Assert.Contains(sections, s => s.RuleName == "Duration");
    }

    /// <summary>
    /// Each rule applies its own find & replace to its own copy of the element
    /// text — one rule's replacement must not leak into the other's section.
    /// </summary>
    [Fact]
    public void EachReusingRule_AppliesItsOwnTextReplacements_Independently()
    {
        var detection = OneArea("Header",
            El("e1", "5 days from £1,199 Departing 30th September 2026", fontSize: 14.4, color: "#FFD200"));

        var price = ContentRule("Price", "£");
        price.TextReplacements = new()
        {
            new TextReplacement { FindType = "textContains", Find = "5 days from £", ReplaceType = "replaceAll", Replace = "" },
            new TextReplacement { FindType = "textContains", Find = " Departing 30th September 2026", ReplaceType = "replaceAll", Replace = "" },
        };

        var duration = ContentRule("Duration", "Days");
        duration.TextReplacements = new()
        {
            new TextReplacement { FindType = "textContains", Find = " days from £1,199 Departing 30th September 2026", ReplaceType = "replaceAll", Replace = "" },
        };

        var rules = Rules("Header", price, duration);

        var result = Service.Transform(detection, rules);
        var sections = result.Areas.SelectMany(a => a.Sections).ToList();

        var priceSection = sections.Single(s => s.RuleName == "Price");
        var durationSection = sections.Single(s => s.RuleName == "Duration");

        Assert.Equal("1,199", priceSection.Content.Trim());
        Assert.Equal("5", durationSection.Content.Trim());
    }

    // ---- Regression guard: a single ungrouped rule is unaffected by re-use ----

    /// <summary>
    /// The element-re-use change must not alter output when only one rule matches an
    /// element. Two elements, one rule each — each produces its own section exactly as
    /// before. This guards the common single-match path against the new code.
    /// </summary>
    [Fact]
    public void OneRulePerElement_AcrossSeveralElements_IsUnaffected()
    {
        var detection = OneArea("Body",
            El("e1", "The Arts Society Wensum presents", fontSize: 13),
            El("e2", "Flemish Masters – Bruges, Antwerp & Ghent", fontSize: 28));

        var rules = Rules("Body",
            ContentRule("Society", "Society"),
            ContentRule("Title", "Flemish"));

        var result = Service.Transform(detection, rules);
        var sections = result.Areas.SelectMany(a => a.Sections).ToList();

        Assert.Equal(2, sections.Count);
        Assert.Contains(sections, s => s.RuleName == "Society" && s.Content.Contains("Wensum"));
        Assert.Contains(sections, s => s.RuleName == "Title" && s.Content.Contains("Flemish"));
    }

    // ---- Regression guard against the real Tailored Tour workflow fixture ----

    /// <summary>
    /// End-to-end regression: transform the real tailoredTourPdf workflow (grouped
    /// itinerary/features rules + ungrouped organiser rules) using its stored
    /// area-detection and areaRules, and assert the section headings and their order
    /// match the committed transform.json exactly. This is the fragile grouped path
    /// memory warns about — element re-use must not disturb it.
    ///
    /// If the fixture is not present (running outside the repo layout), the test is
    /// skipped rather than failed.
    /// </summary>
    [Fact]
    public void RealTailoredTourWorkflow_ProducesTheSameSectionHeadings_AsBeforeReuse()
    {
        var (detectionPath, sourcePath, transformPath) = FixturePaths();
        if (detectionPath == null)
            return; // fixture not found in this environment — nothing to verify

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true,
        };

        var detection = JsonSerializer.Deserialize<AreaDetectionResult>(
            File.ReadAllText(detectionPath), jsonOptions)!;
        var source = JsonSerializer.Deserialize<SourceConfig>(
            File.ReadAllText(sourcePath!), jsonOptions)!;
        var expected = JsonSerializer.Deserialize<TransformResult>(
            File.ReadAllText(transformPath!), jsonOptions)!;

        var actual = Service.Transform(detection, source.AreaRules);

        var expectedHeadings = expected.Areas
            .SelectMany(a => a.Sections)
            .Select(s => s.OriginalHeading ?? s.Id)
            .ToList();
        var actualHeadings = actual.Areas
            .SelectMany(a => a.Sections)
            .Select(s => s.OriginalHeading ?? s.Id)
            .ToList();

        Assert.Equal(expectedHeadings, actualHeadings);
    }

    /// <summary>
    /// Walks up from the test assembly to find the tailoredTourPdf workflow fixture
    /// in the repo. Returns (null, null, null) if not found.
    /// </summary>
    private static (string? detection, string? source, string? transform) FixturePaths()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null)
        {
            var candidate = Path.Combine(dir.FullName,
                "src", "UpDoc.TestSite", "updoc", "workflows", "tailoredTourPdf", "source");
            if (Directory.Exists(candidate))
            {
                return (
                    Path.Combine(candidate, "area-detection.json"),
                    Path.Combine(candidate, "source.json"),
                    Path.Combine(candidate, "transform.json"));
            }
            dir = dir.Parent;
        }
        return (null, null, null);
    }

    [Fact]
    public void SegmentedRule_ExtractsThePriceFromTheStrapline()
    {
        var detection = OneArea("Header",
            El("e1", "5 days from £1,199 Departing 30th September 2026", fontSize: 14.4, color: "#FFD200"));

        var price = ContentRule("Price", "£");
        price.Segment = new Segment
        {
            From = new SegmentBoundary { Anchor = "afterMarker", Marker = "£" },
            To = new SegmentBoundary { Anchor = "number" },
        };

        var result = Service.Transform(detection, Rules("Header", price));
        var section = result.Areas.SelectMany(a => a.Sections).Single(s => s.RuleName == "Price");

        Assert.Equal("1,199", section.Content.Trim());
    }

    [Fact]
    public void TwoSegmentedRules_OnOneElement_ExtractDurationAndPrice()
    {
        var detection = OneArea("Header",
            El("e1", "5 days from £1,199 Departing 30th September 2026", fontSize: 14.4, color: "#FFD200"));

        var duration = ContentRule("Duration", "days");
        duration.Segment = new Segment
        {
            From = new SegmentBoundary { Anchor = "start" },
            To = new SegmentBoundary { Anchor = "beforeMarker", Marker = "days" },
        };
        var price = ContentRule("Price", "£");
        price.Segment = new Segment
        {
            From = new SegmentBoundary { Anchor = "afterMarker", Marker = "£" },
            To = new SegmentBoundary { Anchor = "number" },
        };

        var result = Service.Transform(detection, Rules("Header", duration, price));
        var sections = result.Areas.SelectMany(a => a.Sections).ToList();

        Assert.Equal("5", sections.Single(s => s.RuleName == "Duration").Content.Trim());
        Assert.Equal("1,199", sections.Single(s => s.RuleName == "Price").Content.Trim());
    }
}
