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

## The anatomy of a rule (agreed vocabulary)

Before deciding what to add, we pinned down what a rule already is. Terms
agreed in discussion:

- **Rule** — the whole card (matches the "+ Add rule" button). "Organisation"
  and "Tour Title" in the header area are two rules.
- **Role** — the rule's name/label. Loosely interchangeable with "rule", but
  precisely: the rule is the card, its role is its name.

A rule does three things, in order:

| Phase | Made of | Job |
|---|---|---|
| **1. Identify** | conditions + exceptions | find the content in the source |
| **2. Mark up** | part + format | label it for handover |
| **3. Change output** | find & replace | alter the text on the way out |

Conditions are ANDed; exceptions are NOT (disqualify a match). Part is the slot
the content fills (title, content, description, summary). Format shapes the
output (paragraph, heading, list, auto). Find & replace is the only phase that
transforms the text itself.

This frame tells us where the atoms problem lives: capturing `4` out of the
strapline is **phase 3** — changing the output. Phases 1 and 2 already found
and labelled one element. The open question is whether phase 3 can produce
*several* outputs from that one identified element, or only one.

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

## The key shift (2026-07-23)

The framing above still treats the strapline as "one element" that must be
split. That is the wrong mental model, and it was the thing that kept the
discussion stuck.

**An element is not what the PDF hands over. Rules define what an element is.**

The strapline is not intrinsically one element. Visually it is already two
pieces — yellow (`5 days from £1,699`) and white (`Departs 26th September 2027`)
— and our extraction merely happened to merge it into one. There is enough
information in the text to define three elements by rule:

- an integer **followed by** the word `days` → duration
- an integer **preceded by** `£` → price
- a date **preceded by** `Depart` → departure date

Each is its own element, defined by its own rule. So it is one rule per
element after all, and first-match-wins never applies — they are genuinely
three different elements, not three rules fighting over one.

**Intrinsic principle:** extract items as close to the destination shape as
possible. The destination wants a duration, a price and a date, so we extract
exactly those three, defined at the point of extraction.

This dissolves the "multi-claim" problem rather than solving it. The claim
loop (`elementRules[i]`, one rule per element) does not need to change,
provided the carving produces distinct elements before or during matching.

### What is genuinely new

Conditions today test a **whole** element (its font, colour, position, whole
text) and answer yes/no. Carving asks a rule to match a **span within** the
merged text and promote that span to an element in its own right — closer to a
capture group than a yes/no condition.

Undecided, and the main design question left: is carving

- **a new kind of condition** that captures a span, or
- **a pre-step** that splits merged elements before the normal rules run?

Different places in the pipeline, different sizes of change.

## Three blockers to a working demo

1. **Replace the description rule** with three new ones (duration, price, date).
   `pageDescription` is no longer captured as the composite — the tour
   templates concatenate it in Razor from the three atoms.
2. **No typed inputs on the test site.** See "Test fixture" below.
3. **`Departs` vs `Departing`.** The date verb varies between documents by
   design (space in the layout). The date rule needs **OR** on that condition.
   This is the cheap flavour of OR — one condition, several values — not OR
   across different condition types. This is where operators stop being a
   parked distraction and become required.

## Test fixture (deferred)

The typed fields cannot be tested until the destination doc types exist in a
test site. Options considered:

- **Hand-recreate** the doc types / data types / blueprints / templates —
  rejected. Hours of work, composition-heavy, error-prone.
- **uSync-merge into the existing test site** — rejected. Two dependency
  stacks would collide (overlapping aliases, mismatched data type config,
  dangling references). An import in name, a manual merge in practice.
- **Clean-room test site** — a fresh, empty, disposable host (e.g.
  `UpDoc.TailoredTravel`), with the **entire** Tailored Travel stack
  uSync-imported into it. No collisions because there is nothing to collide
  with. UpDoc drops in as a package reference on top. This is the right shape.
- **Develop inside Tailored Travel and port back** — firmly rejected. Couples
  the package to one client's site, the exact thing the generic-package /
  client-config architecture exists to prevent.

**Feasibility deferred.** UpDoc is far from finished; the fixture is built when
the feature is real enough to need it. The open unknown is how self-contained
the Tailored Travel uSync stack is (third-party package dependencies would have
to be present in the clean room too). Tracked by #39.

## Empirical session (2026-07-23) — the design settled

Built a throwaway workflow (`tailoredTourTestPdf`) on a real PDF, page 1 only,
and worked the problem in the actual UI. Findings, in order:

**Elements are lines, defined by Y-position, colour-blind.** Word grouping uses
`yTolerance = 5.0` (`PdfPagePropertiesService.cs:863`). The strapline is two
colours — yellow `5 days from £1,199` (#FFD200) and white `Departing 30th
September 2026` — but sits on one line, so it merges into one element. The
colour change does not break it.

**Conditions test the whole element, not a fragment.** A rule "text begins with
£" gave **no match** — the element text starts with `5`, and the £ is mid-line.
Confirmed live: conditions cannot reach inside an element.

**Consumption is deliberate, not incidental.** Matching an element removes it
from the unmatched list. This is the intended behaviour — it declutters the
editor as the author works. It is also exactly what blocks three rules on one
line. The same feature pulls two ways.

**Find & replace already works on substrings** (e.g. `&` → `and`). So the
carving tool exists; it is *conditions* that cannot address a fragment, not
find & replace.

### The model we landed on

Discarded "split the element" — nothing is actually being split. The reframe:

> The **same element is in use by several rules**, each pulling a different bit
> out of it. "In use" is simply not exclusive any more.

This dissolves the mechanism question. No new elements, no split concept, no
partial-match detection, no "do-not-consume" flag inferred from matches.

**Element state model.** An element is in one of three states, shown as
buckets in the UI:

- **Unmatched** — nothing has claimed it
- **In use** — one *or more* rules are using it
- **Ignored** — parked by the author, listed below and reversible (recover,
  don't destroy — same principle as the recycle bin)

"In use" leaving the unmatched list preserves the decluttering the current
consumption gives — the author still sees the pool shrink. The only change is
that an element can be in use more than once.

**Element-level actions.** The "Define rule" affordance on an unmatched element
becomes a small menu: Define rule / Ignore (and, later, a "where is this used"
report). Ignore moves the element to the Ignored bucket.

**Rules address the whole element as today.** A rule pulls its bit via its own
conditions + find & replace. Three rules on the strapline each pull duration,
price, date. Consumption/decluttering is preserved because "in use" still
removes it from Unmatched — it just does not forbid a second rule.

### The one real code change

`elementRules[i]` (`ContentTransformService.cs:244`) is a single
`SectionRule?` per element index. It becomes a **list**. First-match-wins
(`break` at line 273) is dropped: keep evaluating rules against an element even
after one matches. Every downstream consumer of `elementRules` must then handle
an element belonging to several rules.

This is the loop change the day opened worried about touching. It now has a
clear reason and a model behind it.

### Deferred, explicitly not now

- The "used in N places" report (click an in-use element, see the rules using
  it, jump to them). A reporting layer, not core.
- OR operator inside rules — still needed for `Departs`/`Departing`, still the
  cheap flavour (one condition, several values). See "Parked" below.
- Section-assembly interaction: if an element is in use by three rules, how
  does it contribute to sections without duplicating? This is the real risk in
  the loop change and must be worked through before implementation.

### Superseded candidates (kept for the record)

Earlier this doc proposed two shapes, both now superseded by the in-use model:

- **A. One rule, several named outputs** — a rule emitting several captures.
- **B. Per-rule "do not consume" flag** — a rule matching without claiming.

Both tried to avoid changing `elementRules`. The session concluded the honest
fix is to change it, and that "non-exclusive in use" is a cleaner mental model
than either.

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
