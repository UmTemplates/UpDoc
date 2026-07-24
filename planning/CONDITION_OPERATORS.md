# Condition Operators — AND / OR / NOT and the rule-as-query model

Status: plan. Written 2026-07-24. Builds directly on `SEGMENT_AND_OPERATORS.md`
(design thinking, 2026-07-23) and closes its open questions where the code now
answers them.

Tracking issue: #100.

---

## Why now

The date field mapping (#34, shipped to develop) works but leans on a workaround.
The `tailoredTourPdf` Departure Date rule matches on the stem `Depart` because the
test content contains both `Departs 26th September 2027` and
`Departing 30th September 2026`, and **conditions are AND-only** — a single
condition cannot say "either spelling".

Cutting on the stem leaves the extracted piece as `ing 30th September 2026`. The
stored date is correct (the parser scans for a named-month date anywhere in the
string) but the piece reads as broken in the rules editor preview, and would
write literally if ever mapped to a text field.

`Departs` **OR** `Departing` in one condition is the clean fix. That is the
smallest member of a larger, already-half-designed family.

---

## The frame: a rule is a query (settled in SEGMENT_AND_OPERATORS.md)

Conditions, exceptions, segment and operators are all clauses in one small query
language. The prior doc settled the vocabulary:

| Modifier | What it changes | Status today |
|---|---|---|
| **AND** | conditions combine — all must hold | implicit, invisible |
| **OR** | conditions combine — any may hold | **missing — this work** |
| **NOT** | disqualify a match | exists as **Exceptions** (a separate list) |
| **Segment** | the match *target* — element → a piece of it | value shipped (#96 groundwork); evaluator pending |

AND / OR / NOT modify how conditions relate. Segment modifies what they point at.
Same family, different level.

**This plan scopes AND / OR / NOT only.** Segment's evaluator is separate work
(see "Explicitly out of scope"). But the data model below is designed so segment
slots into it without a second migration.

---

## Hard constraint discovered in the code (changes the prior design)

`SEGMENT_AND_OPERATORS.md` proposed segmenting by colour — "the yellow run" vs
"the white run" of the strapline. **The code cannot do this today**, and that
changes what OR has to carry.

`AreaElement` (`Models/AreaDetectionResult.cs:86`) holds a **single** `Color`,
`FontSize`, `FontName` per element. Line grouping merges per-letter PdfPig data
into one value per element. By rule-evaluation time the runs are gone.

Consequence: colour cannot discriminate *within* the merged strapline. The white
date run and the yellow price run share one flattened `Color`. So the date rule
**must** disambiguate by text (`Departs` / `Departing`), which is exactly why OR
is needed rather than optional. Segment-by-colour would need the extractor to
retain runs — a much larger change, correctly deferred.

This is worth stating loudly: **OR is not a nicety, it is the current-model
answer** to the strapline, precisely because segment-by-property is not yet
reachable.

---

## Prior art: what real query builders offer, and what we actually need

Surveyed to think outside the box (jQuery QueryBuilder, react-querybuilder,
Umbraco's own content-picker filters, Outlook rules, GitHub/Gmail search,
Notion/Airtable filter groups). The union of their features:

| Feature | Seen in | Do we need it? |
|---|---|---|
| AND / OR toggle per group | all of them | **Yes** — the core ask |
| NOT / negate a condition | react-querybuilder, Outlook | **Yes** — we have it as Exceptions; unify or leave |
| Nested groups (AND of ORs of ANDs) | jQuery QB, react-querybuilder | **Not yet** — no example demands it; huge UI cost |
| Multi-value in one condition (`in [a,b,c]`) | Airtable, SQL `IN` | **Yes, and it may be enough** — see "Two ways to spell OR" |
| Relational (this vs previous/next element) | none directly; hinted in prior doc | **No** — flagged speculative, resist until an example needs it |
| Per-condition operator picker (`=`, `≠`, `>`, `contains`) | all | **Partly have it** — our condition *type* already encodes the operator (`textContains`, `fontSizeAbove`). Do not rebuild. |
| Drag to reorder / regroup | jQuery QB | reorder shipped (#90); regroup only if nesting arrives |

The discipline from the prior doc holds: **examples define the language.** Only
clauses a real rewritten rule needs earn their place. The table above is honest
about what that currently is: **one flat OR, expressible as multi-value.**

---

## Two ways to spell OR, and the recommendation

The strapline needs "text contains Departs OR text contains Departing". There are
two shapes, and they are very different sizes of work.

### Option A — Multi-value condition (recommended)

One condition, several values, any of which satisfies it.

```
Text contains   [ Departs ] [ Departing ]        ← "any of"
```

- **Data:** `value` becomes `string | string[]`. A `string[]` means OR-of-values.
- **Evaluator:** where a text condition tests one string, it tests "any of the
  array". ~6 lines each side (C# + TS mirror).
- **UI:** the value box becomes a small tag-input (type, Enter, chip appears).
  No new condition type, no grouping, no precedence.
- **Backwards compatible:** a plain `string` behaves exactly as today. Existing
  rules untouched, existing `source.json` files byte-identical until edited.
- **Covers:** every example we actually have.

### Option B — Condition-level OR groups (deferred)

Each condition (or group of conditions) gets an AND/OR relationship to the next,
with grouping and precedence — the full query-builder tree.

- **Data:** conditions gain a `combinator` and nesting; `RuleCondition[]` becomes
  a tree, not a flat list. Migration for every existing rule.
- **Evaluator:** recursive descent respecting precedence, both sides.
- **UI:** the genuinely hard part. Nested drag-and-drop group boxes. The prior
  doc's own advice: "steal from an existing drag-and-drop query builder, do not
  design fresh."
- **Covers:** everything, including cases we do not yet have.

### Recommendation

**Build A now. Leave B until an example demands it.**

A solves the shipped workaround, is a few days including tests and docs, and is
low-risk (additive, backwards compatible). B is a major feature with a hard UI
and no current worked example that needs it. The whole point of the "examples
define the language" discipline is to not build B speculatively.

A is also a **subset** of B: multi-value is OR-within-a-condition; B would add
OR-between-conditions on top. Shipping A does not block B and is not throwaway —
B would keep multi-value and add grouping around it.

The rest of this plan implements **Option A**.

---

## Data model (Option A)

`RuleCondition.value` today is `object?` (C#) / `string | number | {min,max}` (TS).

Add: a text condition's `value` may be a **`string[]`**, meaning "match if the
element satisfies this condition for ANY listed value".

```jsonc
// Single value (today — unchanged)
{ "type": "textContains", "value": "Departs" }

// Multi-value (new — OR)
{ "type": "textContains", "value": ["Departs", "Departing"] }
```

Rules:

- Applies to **text conditions only** at first: `textContains`, `textBeginsWith`,
  `textEndsWith`, `textEquals`. (These are where OR-of-values is meaningful and
  demanded. Font/colour/size can follow if an example asks; not now.)
- Empty array or absent → treated as no constraint (same as empty string today).
- The array is an **OR**. AND across *different* conditions is unchanged.
- Also flows through to **exceptions** (which reuse the condition vocabulary) and
  to **segment piece conditions** — so the date rule can cut after
  `Departs`/`Departing` cleanly, killing the `ing…` workaround at its root.

Why `value` overloading rather than a new field: it keeps the single-value path
byte-identical, needs no schema version bump, and the evaluator change is a
one-line "normalise to array, then `.Any()`".

---

## Implementation phases (each independently testable)

### Phase 1 — Evaluator: honour multi-value (server + mirror)

- [ ] `PdfPagePropertiesService.MatchesCondition` — for the four text types,
      normalise `value` to `string[]` and match if **any** entry satisfies.
      One helper: `AsValues(object?) → IEnumerable<string>`.
- [ ] Mirror in the editor's TS matcher (`#elementMatchesCondition` in
      `section-rules-editor-modal.element.ts`) — same normalise-then-any.
- [ ] Segment piece conditions: `SegmentEvaluator` + `segment.ts` — `textFollows`
      / `textPrecedes` accept an array, using the **first value that is found**
      in the text (so `Departs` OR `Departing`, whichever the element has).
- [ ] `ApplyTextReplacements` left alone for now (find/replace is single-value;
      no example needs multi-value there).

**Testable, no site:** a node/xunit table.

| Element text | Condition | Expect |
|---|---|---|
| `…Departs 26th…` | `textContains ["Departs","Departing"]` | match |
| `…Departing 30th…` | `textContains ["Departs","Departing"]` | match |
| `…leaves 1st…` | `textContains ["Departs","Departing"]` | no match |
| `…Departing 30th…` | `textFollows ["Departs","Departing"]` cut | `30th September 2026` (no `ing`) |
| `…Departs 26th…` | `textFollows ["Departs","Departing"]` cut | `26th September 2027` |

### Phase 2 — Editor UI: tag input for text-condition values

- [ ] When a text condition is selected, render the value as a chip/tag input
      instead of a plain text box: type a value, Enter, it becomes a chip; each
      chip removable; the set is the OR list.
- [ ] Single chip serialises as a plain `string` (not a one-element array) so
      the common case stays byte-identical on disk.
- [ ] Two or more chips serialise as `string[]`.
- [ ] Live preview (`#previewText` / match badges) reflects multi-value.
- [ ] Same treatment inside the Exceptions block and segment piece conditions.

**Testable in the running site:** open the Departure Date rule, change
`Text contains` to two chips `Departs` + `Departing`, save, confirm
`source.json` shows `"value": ["Departs","Departing"]`.

### Phase 3 — Retire the workaround

- [ ] Change the `tailoredTourPdf` Departure Date rule from stem `Depart` to
      explicit `["Departs","Departing"]` on both the `textContains` match and the
      `textFollows` cut.
- [ ] Regenerate / re-verify: the extracted piece now reads
      `30th September 2026` cleanly (no `ing`), date still lands as `2026-09-30`.
- [ ] Confirm the `Departs` variant (Winchester Istanbul PDF) still cuts to
      `26th September 2027`.

**Testable end to end:** import Flemish Masters *and* Winchester Istanbul; both
produce a clean date piece and a correct picker value.

### Phase 4 — Docs + verify

- [ ] Update the rules-editor source-file docs for the multi-value input.
- [ ] Run `create-from-source.spec.ts` and `transformed-view.spec.ts`.
- [ ] Confirm a rule with a single value still round-trips as a plain string
      (no accidental array churn in existing workflows).

---

## Backwards compatibility

- Single-value conditions unchanged on disk and in behaviour.
- No schema version bump: `value` was already `object?`; an array is just another
  shape it can take.
- No migration of existing `source.json` files.
- Exceptions and segment piece conditions gain the capability for free, since
  they reuse the same condition + value shape.

---

## Explicitly out of scope (and why)

- **Condition-level OR groups / nesting (Option B).** No worked example needs it;
  the UI is a major undertaking. Multi-value is a clean subset to build on later.
- **Segment-by-property (colour/font run selection).** Blocked by the flattened
  `AreaElement` model — runs are discarded at merge time. Needs the extractor to
  retain per-run data first. Tracked separately; see the constraint section.
- **Relational conditions** ("red except when it follows blue"). Flagged
  speculative in the prior doc; no example demands it.
- **Folding Exceptions into a unified NOT operator.** The prior doc parks this
  until the operator UI exists. Multi-value does not force the decision; leave
  Exceptions as-is for now. Revisit once Phase 2 shows how the value UI feels.
- **Multi-value on non-text conditions** (font/colour/size). Meaningful but
  unexercised. Add per example.

---

## Open questions for review

1. **Tag-input widget.** UUI has no first-class tag input. Options: build a small
   one (chips + text field), or piggyback on an existing multi-value UUI control.
   Prefer a minimal bespoke chip input scoped to this editor — no dependency.
2. **Whitespace / case in chips.** Trim on entry. Matching is already
   `OrdinalIgnoreCase`, so `Departs` and `departs` are equivalent — no per-chip
   case option needed.
3. **`textEquals` with multiple values.** Reads as "equals any of" — an
   enumeration. Sensible; include it.
4. **Empty chip guard.** An empty chip must not serialise (would act as
   "contains empty string" = always true). Drop empties on save.

---

## Files touched (Option A)

| File | Change |
|---|---|
| `Services/PdfPagePropertiesService.cs` | `MatchesCondition` text types → any-of |
| `Services/SegmentEvaluator.cs` | `textFollows`/`textPrecedes` accept array (first found) |
| `wwwroot/.../src/segment.ts` | mirror of the above |
| `wwwroot/.../src/section-rules-editor-modal.element.ts` | tag-input UI + matcher mirror |
| `wwwroot/.../src/workflow.types.ts` | `value` type widened to allow `string[]` |
| `updoc/workflows/tailoredTourPdf/source/source.json` | retire the `Depart` stem workaround |

## Relationship to shipped / adjacent work

- Undoes the documented workaround from the date PR (#99).
- Builds on condition reordering (#90) and the segment value dropdown (#96/#97).
- `SEGMENT_AND_OPERATORS.md` remains the conceptual parent; this doc is the
  buildable subset with the code constraints filled in.
