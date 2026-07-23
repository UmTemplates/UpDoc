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
    /// THE WALL: two content rules both match the strapline (it contains both
    /// "£" and "Days"), but first-match-wins means only the first produces a
    /// section. This test documents the CURRENT behaviour. When element re-use
    /// lands, this expectation changes to two sections.
    /// </summary>
    [Fact]
    public void TwoContentRulesMatchingOneElement_CurrentlyProducesOnlyOneSection()
    {
        var detection = OneArea("Header",
            El("e1", "5 days from £1,199 Departing 30th September 2026", fontSize: 14.4, color: "#FFD200"));

        var rules = Rules("Header",
            ContentRule("Price", "£"),
            ContentRule("Duration", "Days"));

        var result = Service.Transform(detection, rules);

        var sections = result.Areas.SelectMany(a => a.Sections).ToList();

        // Documents first-match-wins: only the first rule (Price) claims the element.
        Assert.Single(sections);
    }
}
