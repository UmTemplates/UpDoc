# Segment Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a rule extract a from/to bounded piece of an element's text (a "segment"), so the tour strapline `5 days from £1,199 Departing 30th September 2026` can yield duration `5` and price `1,199` as separate values mapped to text fields.

**Architecture:** A new optional `Segment` object on `SectionRule`. During transform, when a rule has a segment, its text is narrowed by the from/to anchors *before* find & replace and formatting. The same evaluation is mirrored in the client-side rules editor for a live preview. Absent segment = today's behaviour, so existing rules are unchanged.

**Tech Stack:** C# (.NET 10, `ContentTransformService`), TypeScript/Lit (rules editor), xUnit (`UpDoc.Tests`).

---

## Design reference

Spec: `docs/superpowers/specs/2026-07-23-segment-extraction-design.md`.

Anchor kinds: `start`, `end`, `beforeMarker`, `afterMarker`, `number`.
Marker-not-found → empty string. Date and integer-write are out of scope.

The strapline segments:
- duration: `from start, to beforeMarker "days"` → `5`
- price: `from afterMarker "£", to number` → `1,199`

## File structure

- `src/UpDoc/Models/SectionRules.cs` — add `Segment` / `SegmentBoundary` models to `SectionRule`.
- `src/UpDoc/Services/SegmentEvaluator.cs` (new) — pure static `Apply(text, segment)`. Isolated so both the transform and tests use one implementation, and TS can mirror it.
- `src/UpDoc/Services/ContentTransformService.cs` — call the evaluator before find & replace at the two apply points.
- `tests/UpDoc.Tests/SegmentEvaluatorTests.cs` (new) — unit tests for the evaluator.
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/workflow.types.ts` — TS `Segment` types on `SectionRule`.
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/segment.ts` (new) — TS mirror of the evaluator (for preview).
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/section-rules-editor-modal.element.ts` — Segment UI block + live preview.

---

## Task 1: Segment models (C#)

**Files:**
- Modify: `src/UpDoc/Models/SectionRules.cs`

- [ ] **Step 1: Add the models**

Add to `src/UpDoc/Models/SectionRules.cs` (end of file, before the final closing brace of the namespace — the file is namespace-scoped, so just append the classes):

```csharp
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
```

- [ ] **Step 2: Add the property to `SectionRule`**

In `SectionRule` (same file), after the `TextReplacements` property, add:

```csharp
    /// <summary>
    /// Optional segment: narrows the element's text to a from/to bounded piece
    /// before find & replace and formatting run. Null = whole element.
    /// </summary>
    [JsonPropertyName("segment")]
    public Segment? Segment { get; set; }
```

- [ ] **Step 3: Build to verify it compiles**

Run: `dotnet build src/UpDoc/UpDoc.csproj`
Expected: `Build succeeded. 0 Error(s)` (NU1903 package warnings are pre-existing and expected).

> If the test site is running it will lock `UpDoc.dll` and the build fails with a file-in-use error. Stop the site first.

- [ ] **Step 4: Commit**

```bash
git add src/UpDoc/Models/SectionRules.cs
git commit -m "Add Segment / SegmentBoundary models to SectionRule"
```

---

## Task 2: SegmentEvaluator (C#, TDD)

**Files:**
- Create: `src/UpDoc/Services/SegmentEvaluator.cs`
- Test: `tests/UpDoc.Tests/SegmentEvaluatorTests.cs`

- [ ] **Step 1: Write the failing tests**

Create `tests/UpDoc.Tests/SegmentEvaluatorTests.cs`:

```csharp
using UpDoc.Models;
using UpDoc.Services;

namespace UpDoc.Tests;

public class SegmentEvaluatorTests
{
    private const string Strapline = "5 days from £1,199 Departing 30th September 2026";

    [Fact]
    public void NullSegment_ReturnsTextUnchanged()
    {
        Assert.Equal(Strapline, SegmentEvaluator.Apply(Strapline, null));
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
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test tests/UpDoc.Tests/UpDoc.Tests.csproj --filter "SegmentEvaluator"`
Expected: compile error — `SegmentEvaluator` does not exist.

- [ ] **Step 3: Implement the evaluator**

Create `src/UpDoc/Services/SegmentEvaluator.cs`:

```csharp
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test tests/UpDoc.Tests/UpDoc.Tests.csproj --filter "SegmentEvaluator"`
Expected: `Passed: 6`.

- [ ] **Step 5: Commit**

```bash
git add src/UpDoc/Services/SegmentEvaluator.cs tests/UpDoc.Tests/SegmentEvaluatorTests.cs
git commit -m "Add SegmentEvaluator with from/to anchor extraction"
```

---

## Task 3: Wire segment into the transform (C#, TDD)

**Files:**
- Modify: `src/UpDoc/Services/ContentTransformService.cs`
- Test: `tests/UpDoc.Tests/ContentTransformServiceTests.cs`

The segment must run **before** find & replace at BOTH apply points: the primary
rule (currently line ~340) and the extra reused-rule path (currently line ~472).

- [ ] **Step 1: Write the failing test**

Add to `tests/UpDoc.Tests/ContentTransformServiceTests.cs` (inside the class, using the existing `OneArea` / `El` / `Rules` / `ContentRule` helpers):

```csharp
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `dotnet test tests/UpDoc.Tests/UpDoc.Tests.csproj --filter "Segmented"`
Expected: FAIL — the price test gets the whole strapline (or the £-onwards text), not `1,199`, because segment is not applied yet.

- [ ] **Step 3: Apply segment at the primary rule path**

In `ContentTransformService.cs`, find the primary text-replacement block (the loop containing `elements[i].Text = ApplyTextReplacements(elements[i].Text, replacements);`). Replace that whole loop with one that applies the segment first:

```csharp
        // Apply segment (narrow to a from/to piece) then text replacements, per matched rule.
        for (int i = 0; i < elements.Count; i++)
        {
            var rule = elementRules[i];
            if (rule == null) continue;

            if (rule.Segment != null)
                elements[i].Text = SegmentEvaluator.Apply(elements[i].Text, rule.Segment);

            if (rule.TextReplacements is { Count: > 0 } replacements)
                elements[i].Text = ApplyTextReplacements(elements[i].Text, replacements);
        }
```

- [ ] **Step 4: Apply segment at the extra reused-rule path**

In the same file, find the extra-match block (`if (extraUngroupedMatches.TryGetValue(i, out var extraRules))`) and the line that builds `text` from `originalElementText[i]`. Replace the `text` assignment so the segment is applied to the original text before replacements:

Find:
```csharp
                        var text = rule.TextReplacements is { Count: > 0 } reps
                            ? ApplyTextReplacements(originalElementText[i], reps)
                            : originalElementText[i];
```

Replace with:
```csharp
                        var text = originalElementText[i];
                        if (rule.Segment != null)
                            text = SegmentEvaluator.Apply(text, rule.Segment);
                        if (rule.TextReplacements is { Count: > 0 } reps)
                            text = ApplyTextReplacements(text, reps);
```

- [ ] **Step 5: Run to verify the new tests pass**

Run: `dotnet test tests/UpDoc.Tests/UpDoc.Tests.csproj --filter "Segmented"`
Expected: `Passed: 2`.

- [ ] **Step 6: Run the full suite to confirm no regression**

Run: `dotnet test tests/UpDoc.Tests/UpDoc.Tests.csproj`
Expected: all pass, including the existing `RealTailoredTourWorkflow_...` regression (grouped path untouched — segment is null on those rules).

- [ ] **Step 7: Commit**

```bash
git add src/UpDoc/Services/ContentTransformService.cs tests/UpDoc.Tests/ContentTransformServiceTests.cs
git commit -m "Apply segment before find & replace in the transform"
```

---

## Task 4: TypeScript types + evaluator mirror

**Files:**
- Modify: `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/workflow.types.ts`
- Create: `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/segment.ts`

- [ ] **Step 1: Add TS types**

In `workflow.types.ts`, add near `SectionRule` (after the `TextReplacement` interface):

```typescript
export type SegmentAnchor = 'start' | 'end' | 'beforeMarker' | 'afterMarker' | 'number';

export interface SegmentBoundary {
	anchor: SegmentAnchor;
	/** Required only for beforeMarker / afterMarker. */
	marker?: string;
}

export interface Segment {
	from?: SegmentBoundary;
	to?: SegmentBoundary;
}
```

Then add `segment?: Segment;` to the `SectionRule` interface, after `textReplacements?`.

- [ ] **Step 2: Create the TS evaluator mirror**

Create `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/segment.ts`:

```typescript
import type { Segment, SegmentBoundary } from './workflow.types.js';

// KEEP IN SYNC with SegmentEvaluator.cs — this is the editor preview mirror.

const NUMBER_RUN = /\d[\d,]*/;

export function applySegment(text: string, segment?: Segment): string {
	if (!segment) return text;

	let startIndex = 0;
	if (segment.from) {
		const s = resolveFrom(text, segment.from);
		if (s < 0) return '';
		startIndex = s;
	}

	const region = text.slice(startIndex);

	let endIndex = region.length;
	if (segment.to) {
		const e = resolveTo(region, segment.to);
		if (e < 0) return '';
		endIndex = e;
	}

	return region.slice(0, endIndex).trim();
}

function resolveFrom(text: string, b: SegmentBoundary): number {
	switch (b.anchor) {
		case 'afterMarker': return findAfter(text, b.marker);
		case 'beforeMarker': return findBefore(text, b.marker);
		case 'start':
		default: return 0;
	}
}

function resolveTo(region: string, b: SegmentBoundary): number {
	switch (b.anchor) {
		case 'end': return region.length;
		case 'beforeMarker': return indexOfMarker(region, b.marker);
		case 'afterMarker': return afterMarkerEnd(region, b.marker);
		case 'number': return numberEnd(region);
		default: return region.length;
	}
}

function findAfter(text: string, marker?: string): number {
	if (!marker) return 0;
	const i = text.toLowerCase().indexOf(marker.toLowerCase());
	return i < 0 ? -1 : i + marker.length;
}

function findBefore(text: string, marker?: string): number {
	if (!marker) return 0;
	const i = text.toLowerCase().indexOf(marker.toLowerCase());
	return i < 0 ? -1 : i;
}

function indexOfMarker(region: string, marker?: string): number {
	if (!marker) return region.length;
	const i = region.toLowerCase().indexOf(marker.toLowerCase());
	return i < 0 ? -1 : i;
}

function afterMarkerEnd(region: string, marker?: string): number {
	if (!marker) return region.length;
	const i = region.toLowerCase().indexOf(marker.toLowerCase());
	return i < 0 ? -1 : i + marker.length;
}

function numberEnd(region: string): number {
	const m = NUMBER_RUN.exec(region);
	return m ? m.index + m[0].length : -1;
}
```

- [ ] **Step 3: Build TS to verify it compiles**

Run: `cd src/UpDoc/wwwroot/App_Plugins/UpDoc && npm run build`
Expected: `✓ built in ...` with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/UpDoc/wwwroot/App_Plugins/UpDoc/src/workflow.types.ts src/UpDoc/wwwroot/App_Plugins/UpDoc/src/segment.ts src/UpDoc/wwwroot/App_Plugins/UpDoc/dist/
git commit -m "Add TS segment types and evaluator mirror"
```

---

## Task 5: Segment UI block in the rules editor

**Files:**
- Modify: `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/section-rules-editor-modal.element.ts`

This adds a collapsible **Segment** block to each rule card, above Conditions, with a live preview of the extracted text.

- [ ] **Step 1: Import the evaluator and types**

At the top of the file, add to the existing imports:

```typescript
import { applySegment } from './segment.js';
import type { Segment, SegmentAnchor, SegmentBoundary } from './workflow.types.js';
```

(If `SectionRule`/related types are imported from `workflow.types.js` already, add the three new names to that import instead of a second statement.)

- [ ] **Step 2: Add mutation helpers**

Add these methods to the component class (near the other `#update...` rule helpers):

```typescript
	#updateSegmentBoundary(ruleId: string, side: 'from' | 'to', anchor: SegmentAnchor) {
		this.#updateRuleById(ruleId, (r) => {
			const segment: Segment = { ...(r.segment ?? {}) };
			if (anchor === 'start' && side === 'from') {
				segment.from = { anchor };
			} else if (anchor === 'end' && side === 'to') {
				segment.to = { anchor };
			} else {
				const existing = segment[side];
				segment[side] = { anchor, marker: existing?.marker ?? '' };
			}
			return { ...r, segment };
		});
	}

	#updateSegmentMarker(ruleId: string, side: 'from' | 'to', marker: string) {
		this.#updateRuleById(ruleId, (r) => {
			const segment: Segment = { ...(r.segment ?? {}) };
			const existing = segment[side];
			if (existing) segment[side] = { ...existing, marker };
			return { ...r, segment };
		});
	}

	#clearSegment(ruleId: string) {
		this.#updateRuleById(ruleId, (r) => {
			const { segment, ...rest } = r;
			return rest as typeof r;
		});
	}
```

> `#updateRuleById(id, updater)` is the existing helper (defined ~line 597): `this._rules = this._rules.map((r) => r._id === id ? updater(r) : r);`. It replaces a rule by id and the `@state() _rules` triggers a re-render.

- [ ] **Step 3: Add the render method**

Add a render method for the segment block:

```typescript
	#renderSegmentBlock(rule: EditableRule, sampleText: string) {
		const seg = rule.segment;
		const fromAnchor = seg?.from?.anchor ?? 'start';
		const toAnchor = seg?.to?.anchor ?? 'end';
		const preview = seg ? applySegment(sampleText, seg) : '';

		const fromAnchors: SegmentAnchor[] = ['start', 'afterMarker'];
		const toAnchors: SegmentAnchor[] = ['end', 'beforeMarker', 'afterMarker', 'number'];
		const label: Record<SegmentAnchor, string> = {
			start: 'Start of element',
			end: 'End of element',
			beforeMarker: 'Before text…',
			afterMarker: 'After text…',
			number: 'End of the number',
		};

		return html`
			<div class="segment-block">
				<div class="segment-header">
					<span>Segment (extract part of the element)</span>
					${seg ? html`<button class="link-button" @click=${() => this.#clearSegment(rule._id)}>Clear</button>` : nothing}
				</div>
				<div class="segment-row">
					<label>From</label>
					<select .value=${fromAnchor}
						@change=${(e: Event) => this.#updateSegmentBoundary(rule._id, 'from', (e.target as HTMLSelectElement).value as SegmentAnchor)}>
						${fromAnchors.map((a) => html`<option value=${a} ?selected=${a === fromAnchor}>${label[a]}</option>`)}
					</select>
					${fromAnchor === 'afterMarker' ? html`
						<input type="text" placeholder="marker" .value=${seg?.from?.marker ?? ''}
							@input=${(e: Event) => this.#updateSegmentMarker(rule._id, 'from', (e.target as HTMLInputElement).value)} />` : nothing}
				</div>
				<div class="segment-row">
					<label>To</label>
					<select .value=${toAnchor}
						@change=${(e: Event) => this.#updateSegmentBoundary(rule._id, 'to', (e.target as HTMLSelectElement).value as SegmentAnchor)}>
						${toAnchors.map((a) => html`<option value=${a} ?selected=${a === toAnchor}>${label[a]}</option>`)}
					</select>
					${toAnchor === 'beforeMarker' || toAnchor === 'afterMarker' ? html`
						<input type="text" placeholder="marker" .value=${seg?.to?.marker ?? ''}
							@input=${(e: Event) => this.#updateSegmentMarker(rule._id, 'to', (e.target as HTMLInputElement).value)} />` : nothing}
				</div>
				${seg ? html`<div class="segment-preview">Result: <strong>${preview || '(empty)'}</strong></div>` : nothing}
			</div>
		`;
	}
```

- [ ] **Step 4: Call the render method inside the rule card**

Find where a rule card renders its Conditions block (search for `CONDITIONS`). Immediately before the conditions block, insert a call to the segment block. It needs the sample text of the element this rule matches — use the first matched element's text if available, else empty:

```typescript
					${this.#renderSegmentBlock(rule, this.#sampleTextForRule(rule._id))}
```

Add the helper:

```typescript
	#sampleTextForRule(ruleId: string): string {
		// The element(s) this rule matched, if any — use the first for preview.
		const claimed = this.#evaluateRules();
		for (const [elId, ruleIds] of claimed) {
			if (ruleIds.includes(ruleId)) {
				return this.#elements.find((e) => e.id === elId)?.text ?? '';
			}
		}
		return '';
	}
```

> `#evaluateRules()` returns `Map<elementId, ruleId[]>` (from the element-reuse work). Confirm the shape in the file before use.

- [ ] **Step 5: Add minimal styles**

Add to the component's static styles (append to the existing `css` block):

```css
		.segment-block { border: 1px solid var(--uui-color-border); border-radius: 4px; padding: 8px; margin-bottom: 8px; }
		.segment-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 6px; }
		.segment-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
		.segment-row label { width: 3em; }
		.segment-preview { margin-top: 6px; font-size: 0.9em; }
		.link-button { background: none; border: none; color: var(--uui-color-interactive); cursor: pointer; }
```

- [ ] **Step 6: Build**

Run: `cd src/UpDoc/wwwroot/App_Plugins/UpDoc && npm run build`
Expected: `✓ built in ...`, no errors.

- [ ] **Step 7: Manual verification in the backoffice**

Start the site (`dotnet run --project src/UpDoc.TestSite/UpDoc.TestSite.csproj`), hard-refresh the backoffice, open the `tailoredTourTestPdf` Header rules. On the Price rule set Segment From = "After text…" marker `£`, To = "End of the number". Confirm the preview shows `1,199`. Add a Duration rule (From = Start, To = "Before text…" marker `days`) and confirm preview `5`.

- [ ] **Step 8: Commit**

```bash
git add src/UpDoc/wwwroot/App_Plugins/UpDoc/src/section-rules-editor-modal.element.ts src/UpDoc/wwwroot/App_Plugins/UpDoc/dist/
git commit -m "Add Segment UI block with live preview to the rules editor"
```

---

## Task 6: End-to-end verification and ship

- [ ] **Step 1: Full test suite**

Run: `dotnet test tests/UpDoc.Tests/UpDoc.Tests.csproj`
Expected: all pass.

- [ ] **Step 2: Real backoffice flow**

With the site running: in `tailoredTourTestPdf`, create Duration and Price segment rules, map each to a text destination field, run "Create from Source" against the Winchester (or any) tailored-tour PDF, and confirm the created document's two text fields contain the duration number and the price number.

- [ ] **Step 3: Open PR**

```bash
git push -u origin <branch>
gh pr create --base develop --title "Segment: extract duration and price from one element" --body "Implements the segment feature per docs/superpowers/specs/2026-07-23-segment-extraction-design.md. Closes #83 (segment portion). Duration and price extract from the strapline to text fields; date (needs OR) and integer write (#34) are follow-ups."
```

---

## Notes for the implementer

- **Two evaluators, keep in sync:** `SegmentEvaluator.cs` (authoritative, used by the transform) and `segment.ts` (editor preview). They must behave identically. Both carry a KEEP IN SYNC comment.
- **Site locks the DLL:** stop the running test site before any `dotnet build`/`dotnet test` that rebuilds `UpDoc.csproj`.
- **CRLF warnings** on `git add` of TS files are expected (the repo normalises line endings) and harmless.
- **Do not touch the grouped path.** Segment is only read per-rule and applied to that rule's text; grouped section assembly is unchanged. The `RealTailoredTourWorkflow_...` regression test is the guard.
