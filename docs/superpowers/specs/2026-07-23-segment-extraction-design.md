# Segment: extracting values from part of an element

Date: 2026-07-23
Issue: #83
Status: design, awaiting approval

## Goal (bounded)

Do exactly what is needed to split the tour strapline into typed values, built
on a clause model that can evolve toward a query language. Nothing more.

Success criterion: from the one strapline element
`5 days from £1,199 Departing 30th September 2026`, produce two separate segment
values:

- **duration** = `5`
- **price** = `1,199`

For this spec both are mapped to **text** destination fields, purely to prove the
extraction works end-to-end. The real fields are `Umbraco.Integer`; the typed
integer write is a **required follow-up** (issue #34), not part of this spec.

**Date is out of scope** — it needs "after Departs OR Departing", which needs the
OR operator (deferred, issue #83 follow-up).

## Why this scope

- Duration and price are each anchored by a single marker, so no OR is needed.
- Both are the same shape: "grab the number next to a marker". That shared
  primitive is simpler and more robust than generic text slicing.
- Delivers a testable win — two integer fields populated from the real PDF —
  that can be verified in the backoffice before date/OR work begins.

## Design principle: evolvable, not a bolt-on

The rule builder is, in the long run, a small query language: conditions,
exceptions, operators and segment are all clauses. This spec builds **segment**
as a first composable clause so later work is additive:

- **C (next):** OR operator → unlocks date.
- **B (after):** migrate existing conditions/exceptions onto the same clause
  model.

The segment clause is therefore modelled as a self-contained, extensible unit,
even though its UI stays a simple block on the existing rule card.

## The primitive: extract adjacent to a marker

A segment isolates a piece of the element's text using a **from** anchor and a
**to** anchor. Both are optional.

Anchor kinds needed for duration + price (minimal set):

| Anchor | Meaning |
|---|---|
| `start` | beginning of the element text |
| `end` | end of the element text |
| `afterMarker` | position just after a plain-text marker (e.g. after `£`) |
| `beforeMarker` | position just before a plain-text marker (e.g. before `days`) |
| `number` | the numeric run (digits, optional thousands separators) at the from-position |

The two fields expressed with these anchors:

| Field | from | to | raw | typed |
|---|---|---|---|---|
| duration | `start` | `beforeMarker "days"` | `5 ` | `5` |
| price | `afterMarker "£"` | `number` (stop after the numeric run) | `1,199` | `1199` |

`number` doubles as a self-terminating `to` anchor: from the from-position, take
the run of digits and separators and stop at the first non-number character.
This is why price does not depend on knowing that "Departing" follows — it stops
at the end of the number.

Duration could also use `number` (the leading number), but `beforeMarker "days"`
is shown to exercise the marker anchors. Either works; the implementation
supports both.

## Data model

New optional property on the existing `SectionRule` (and its TS mirror). Absent
= today's behaviour (whole element), so every existing rule is unchanged.

```jsonc
// SectionRule (addition)
"segment": {
  "from": { "anchor": "afterMarker", "marker": "£" },  // marker omitted for start/end/number
  "to":   { "anchor": "number" }
}
```

`SegmentBoundary`:
- `anchor`: `"start" | "end" | "beforeMarker" | "afterMarker" | "number"`
- `marker`: string, required only for `beforeMarker` / `afterMarker`

Modelled as its own object (not inlined fields) so it can gain more anchor kinds
(pattern, property-based) and, later, participate in the unified clause model
without a schema break.

## Where it runs in the pipeline

Segment runs **after** an element is claimed by a rule and **before** the rule's
text replacements and formatting — it narrows the text the rest of the rule
operates on.

In `ContentTransformService`, the per-rule text is already captured per element
(the element-reuse work, #81, gives each rule its own text copy). The segment
step transforms that captured text:

```
element text (or reused copy)
  → apply segment (from/to) → segment text
  → apply find & replace     → cleaned text
  → format                   → section content
```

If `segment` is absent, the text passes through unchanged. So the change is a
single new transform inserted ahead of find & replace, guarded by
`segment != null`. Grouped/section behaviour is untouched.

## Destination (text for now)

The two segment values map to **text** destination fields so the extraction can
be proven without the typed-write work. This means no change to
`DestinationStructureService` or the apply path in this spec — a segment value is
just a string, mapped like any other string today.

The real fields are integers, so a follow-up (issue #34) must add the typed
write: allow `number` fields as mapping targets, strip separators, parse, and
fail loud on bad input. Out of scope here.

## UI

A **Segment** block on the existing rule card, above Conditions (input scope is
declared before the query that runs within it). Collapsed/absent by default so
existing rules look unchanged.

Contents when expanded:
- **From**: anchor dropdown (start / after marker), + marker text input when
  "after marker" is chosen.
- **To**: anchor dropdown (end / before marker / number), + marker input when
  "before marker".

Live preview: show the resulting segment text against the sample element, the
same way conditions show match/no-match today.

The block renders in the client-side rules editor. Per the KEEP IN SYNC note
from #81, the segment *evaluation* logic exists in two places (C# transform +
any client preview) and both must implement it identically.

## Testing

Unit tests in `UpDoc.Tests` (the project added in #81), against
`ContentTransformService` as a pure function:

- Segment absent → whole element text unchanged (regression).
- `from start, to beforeMarker "days"` on the strapline → `5`.
- `from afterMarker "£", to number` → `1,199`.
- Marker not found → defined behaviour (return empty, or whole text — decide in
  plan; must be deterministic).
- The existing real-workflow regression test still passes (grouped path
  untouched).

## Explicitly out of scope

- **Date extraction** and the **OR operator** (follow-up C).
- **Property-based anchors** ("segment the yellow run") — the model allows a new
  anchor kind later; not built now.
- **Regex/pattern anchors** — later anchor kind.
- **Relational anchors** ("follows blue") — flagged, not built.
- **Migrating conditions/exceptions onto the clause model** (follow-up B).
- **Typed write** (integer/decimal/DateOnly) — segment values map to text fields
  in this spec; the integer write is the immediate follow-up (#34).

## Decisions

1. **Marker not found → return empty string.** A mis-authored anchor produces a
   visibly blank value the author will notice and fix, rather than silently
   dumping the whole line into a field that expected a fragment. Fail honestly.
2. **Live segment preview ships in v1.** The segment block shows its resulting
   text against the sample element, the same way conditions show match/no-match.
   Authoring an anchor blind is the exact friction this work exists to remove,
   and the preview machinery already exists.
