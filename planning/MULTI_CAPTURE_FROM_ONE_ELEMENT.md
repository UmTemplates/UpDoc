# Plan: capturing several values from one source element

Raised: 2026-07-22, continuing from `BRIEF_NON_TEXT_FIELD_MAPPING.md` and issue #34.
Status: discussion captured, not yet an agreed plan.

## Why this document exists

Issue #34 (typed destination fields) states that the source side already works
and only the destination is blocked. **That is wrong.** This document records
what the source side actually does, and reframes the problem.

## The motivating case

A tailored-tour PDF carries a one-line strapline:

```
4 days from £854 Departs 24th September 2026
3 days from £699 Departing 26th October 2026
```

Three values live in that line, and the destination doc type has a typed
property for each. All four properties already exist on the live Tailored
Travel site, in the Tour Properties tab, Tour Details group, each as its own
composition:

| Property | Editor |
|---|---|
| `pagePropertyTourDuration` | `Umbraco.Integer` |
| `pagePropertyTourPriceFrom` | `Umbraco.Integer` |
| `pagePropertyTourDepartureDate` | `Umbraco.DateOnly` |
| `destinations` | `Umbraco.MultiNodeTreePicker` |

They are all currently empty. Editors fill them by hand, or forget to.

## The actual blocker: one element, one rule

The strapline is a **single extracted element**. From
`tailoredTourPdf/source/sample-extraction.json`:

```json
{
  "id": "p1-e4",
  "text": "5 days from £1,699 Departs 26th September 2027",
  "metadata": { "fontSize": 14.4, "color": "#FFD200", ... }
}
```

Rules are first-match-wins, and this is structural rather than incidental.
`ContentTransformService.cs:270-274`:

```csharp
if (MatchesAllConditions(elements[i], rule.Conditions, i, total))
{
    elementRules[i] = rule;
    break;  // first-match-wins: move to next element
}
```

`elementRules` holds **one rule per element index**. It is not a list. So
"several rules each capturing a different part of the same line" cannot work
today, and could not be made to work by changing the loop alone — the data
structure would have to change, along with every downstream consumer of it.

The existing "Tour Description" rule already claims `p1-e4`. It matches on
styling alone:

- `fontSizeRange` 13-16
- `fontNameContains` HelveticaNeue-Medium
- `colorEquals` #FFD200
- `textReplacements: null`

So it takes the whole line, unmodified.

## The reframing

The instinct to reach for "let several rules claim one element" is wrong.
The better framing:

> Extraction should produce **named atoms**. Composition into sentences is a
> presentation concern and belongs in the template, not in the captured data.

Under that framing we should never have captured the composite strapline. The
three atoms are the content. `4 days from £854 Departs 24th September 2026` is
a rendering of them.

This matters beyond tidiness: if the client later wants
`from £854 for 4 days`, that is a template edit rather than a re-extraction.

Mapping already supports one named thing feeding several destinations, so no
new mapping capability is needed for the atoms themselves.

## What is still unresolved

Reframing removes the *motivation* for multi-claim but not the *mechanism*
question. The three atoms still live inside one PDF element, so something must
produce three named values from one match.

Two candidate shapes, not yet chosen:

**A. One rule, several named outputs.** A rule matches `p1-e4` once and emits
`tourDuration`, `tourPrice`, `tourDepartureDate`, each with its own capture
expression. Leaves first-match-wins untouched. Fits the "named atoms" framing.
Open question: how the capture expressions are authored and displayed.

**B. Per-rule "do not consume" flag.** A rule can match without claiming, so
later rules still see the element. Smaller conceptually, but `elementRules[i]`
still holds one rule, so this is a bigger change than it sounds. Also raises
the question of whether a non-consuming rule contributes to section assembly
(if it does, content duplicates).

A leans on the existing `textReplacements` machinery. B does not.

### Does the description rule stay?

Yes. `pageDescription` is still wanted, displayed elsewhere on the page.
So the strapline element is claimed by the description rule *and* needs to
yield three atoms. Whichever shape is chosen must handle that.

## Cleanup vs coercion

Carried forward from the brief, still the recommended split:

- **Rules editor** does string cleanup: strip `£`, strip `,`, strip the
  ordinal suffix from `24th`.
- **Typed write** does a strict parse and fails loudly on invalid input.

Two wrinkles found while reading real PDFs:

- The date verb varies: `Departs` in one document, `Departing` in another.
  A fixed-string replacement will not do; `textContains "Depart"` matches both.
- `24th September 2026` needs the ordinal suffix removed before any standard
  date parse will accept it. This is genuinely more work than the integers.

## Correction needed to existing documents

`planning/BRIEF_NON_TEXT_FIELD_MAPPING.md`, "Motivating case", currently says:

> The source side works: UpDoc already isolates the strapline as a discrete
> section, and three anchor-based rules with regex find-and-replace can capture
> and clean each value. The **only** blocker is the destination.

The first sentence is true; the claim about three rules is not, for the
first-match-wins reason above. Issue #34 repeats the same claim.

## Suggested sequence

1. Resolve the mechanism question (A or B above).
2. Multi-capture implementation.
3. Typed write path for integer (#34), then date.
4. MNTP / destination resolution — a different problem (text → node
   references, which can fail as not-found or ambiguous). Not part of this.

Integers cannot be demonstrated end-to-end until step 2 exists, because the
motivating case needs three values out of one element.

## Related

- #34 — Support mapping into non-text destination fields (integer, date)
- #39 — Add typed-field test fixture to test site (blocks #34)
- #44 — Design: complete typed destination field mapping (all editors)
- #37 — Regex find-and-replace in rules editor (+ ReDoS protection)

## Parked: boolean operators in rules

Raised in the same session, deliberately set aside as a separate concern.

Conditions are ANDed, exceptions are NOT. There is no OR. The AND is implicit
and invisible in the UI, which is itself worth fixing.

The whole combining step is two small loops in
`PdfPagePropertiesService.cs:614-636`; `MatchesCondition` is a flat switch and
does not care how results combine. So nested AND/OR groups would be a
contained change to the evaluator, though not to the editor UI.

Backwards compatibility is straightforward: absent operator means AND, so
existing rule files keep their current meaning with no migration.

Prior art worth borrowing rather than designing fresh: jQuery QueryBuilder,
Notion filters, GitHub search filters — nested AND/OR groups over a list of
typed conditions.

Two flavours, different sizes:

- **Multi-value on one condition** — `Text begins with: Bob, Simon`. Cheap.
- **True OR across condition types** — `colour is red OR font size is 14`.
  Needs grouping in model and UI.

Not needed for the typed-fields work. `textContains "Depart"` already covers
the `Departs`/`Departing` variation.

## Note on the uSync files

The property-editor inventory in `Tailored-Travel/.../uSync/v17/ContentTypes/`
is **behind the live database** — the site has had updates without a uSync
export. Directionally useful, not authoritative. The four Tour Properties
compositions above were confirmed in the live backoffice, not from uSync.
