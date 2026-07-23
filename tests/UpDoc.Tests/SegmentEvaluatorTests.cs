using UpDoc.Models;
using UpDoc.Services;

namespace UpDoc.Tests;

public class SegmentEvaluatorTests
{
    private const string Strapline = "5 days from £1,199 Departing 30th September 2026";

    [Fact]
    public void NullSegment_ReturnsTextUnchanged()
    {
        Assert.Equal(Strapline, SegmentEvaluator.Apply(Strapline, (Segment?)null));
    }

    [Fact]
    public void Duration_FromStart_ToBeforeDays_ReturnsFive()
    {
        var seg = new Segment
        {
            From = new SegmentBoundary { Anchor = "start" },
            To = new SegmentBoundary { Anchor = "beforeMarker", Marker = "days" },
        };
        Assert.Equal("5", SegmentEvaluator.Apply(Strapline, seg));
    }

    [Fact]
    public void Price_FromAfterPound_ToNumber_ReturnsAmountWithSeparator()
    {
        var seg = new Segment
        {
            From = new SegmentBoundary { Anchor = "afterMarker", Marker = "£" },
            To = new SegmentBoundary { Anchor = "number" },
        };
        Assert.Equal("1,199", SegmentEvaluator.Apply(Strapline, seg));
    }

    [Fact]
    public void MarkerNotFound_ReturnsEmpty()
    {
        var seg = new Segment
        {
            From = new SegmentBoundary { Anchor = "afterMarker", Marker = "$" },
            To = new SegmentBoundary { Anchor = "end" },
        };
        Assert.Equal("", SegmentEvaluator.Apply(Strapline, seg));
    }

    [Fact]
    public void FromOnly_RunsToEnd()
    {
        var seg = new Segment
        {
            From = new SegmentBoundary { Anchor = "afterMarker", Marker = "£" },
        };
        Assert.Equal("1,199 Departing 30th September 2026", SegmentEvaluator.Apply(Strapline, seg));
    }

    [Fact]
    public void ToOnly_RunsFromStart()
    {
        var seg = new Segment
        {
            To = new SegmentBoundary { Anchor = "beforeMarker", Marker = "days" },
        };
        Assert.Equal("5", SegmentEvaluator.Apply(Strapline, seg));
    }

    // ---- Condition-stream form (segment marker + follows/precedes) ----

    [Fact]
    public void NoSegmentConditions_ReturnsTextUnchanged()
    {
        Assert.Equal(Strapline, SegmentEvaluator.Apply(Strapline, new List<RuleCondition>()));
    }

    [Fact]
    public void Precedes_days_ReturnsDuration()
    {
        var conds = new List<RuleCondition>
        {
            new() { Type = "textPrecedes", Value = "days" },
        };
        Assert.Equal("5", SegmentEvaluator.Apply(Strapline, conds));
    }

    [Fact]
    public void Follows_pound_thenNumber_ReturnsPrice()
    {
        var conds = new List<RuleCondition>
        {
            new() { Type = "textFollows", Value = "£" },
            new() { Type = "number" },
        };
        Assert.Equal("1,199", SegmentEvaluator.Apply(Strapline, conds));
    }

    [Fact]
    public void Follows_pound_precedes_Departing_ReturnsPrice()
    {
        var conds = new List<RuleCondition>
        {
            new() { Type = "textFollows", Value = "£" },
            new() { Type = "textPrecedes", Value = " Departing" },
        };
        Assert.Equal("1,199", SegmentEvaluator.Apply(Strapline, conds));
    }

    [Fact]
    public void Follows_markerNotFound_ReturnsEmpty()
    {
        var conds = new List<RuleCondition>
        {
            new() { Type = "textFollows", Value = "$" },
        };
        Assert.Equal("", SegmentEvaluator.Apply(Strapline, conds));
    }
}
