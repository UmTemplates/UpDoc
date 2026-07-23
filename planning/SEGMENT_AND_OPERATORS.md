# Segment, and operators as one family

Status: design thinking, not yet a plan. Captured 2026-07-23.

This is the design for Sprint 2 (extracting small bits from one element) and it
reframes the parked "operators" work as part of the same idea.

## The problem it solves

A single extracted element can carry several values. The tour strapline
`5 days from £1,199 Departing 30th September 2026` is one element (line grouping
merges the whole line) but the destination wants three separate values —
duration, price, date.

Conditions today test the **whole element** (match / no match). They cannot
point at a piece of it. Find & replace can touch substrings, but only by
subtraction (delete everything else), which is brittle.

## The idea: Segment

**Segment is a mode switch at the top of a rule's conditions.** When it is off
(today's behaviour) the conditions test the whole element. When it is on, the
*same conditions* stop meaning "does the whole element match?" and start meaning
"find the part of the element that matches, and that part becomes the segment".

Everything downstream — Part, Format, Find & replace — then operates on the
segment instead of the whole element.

Key point: **no new condition vocabulary.** Segment reuses the conditions we
already have. The switch changes what they *do*, not what they are.

### Examples

- Segment on + `Color equals #FFD200` → the yellow run `5 days from £1,199`.
- Segment on + `Color equals #FFFFFF` → the white run `Departing 30th September 2026`.
- Segment on + `Begins with "Day"` + `Ends with "night"` → the run between.

The colour example is the important one: the strapline is genuinely two colours
(yellow + white) that line-grouping merged into one element. Segment lets a rule
recover a run by a property we **already extract** (PdfPig gives per-letter
colour), rather than guessing at text boundaries. It also sidesteps the
Departs/Departing variation — the white segment is the date whatever the verb.

### Why this is the right shape

- Reuses conditions, Part, Format, Find & replace unchanged.
- Uses data already extracted (colour, font, position per run).
- Not fragile text-matching — segments by real properties.
- Opt-in per rule; rules that don't use it behave exactly as today.

## Segment is an operator

The sharp realisation: segment belongs to the same family as the operators we
parked earlier.

| Modifier | What it changes | Status |
|---|---|---|
| **AND** | how conditions combine (all must hold) | implicit today, invisible |
| **OR** | how conditions combine (any may hold) | missing — the parked work |
| **NOT** | disqualify a match | exists today as **Exceptions** |
| **Segment** | the match *target* — element → a piece of it | this sprint |

AND/OR/NOT modify how conditions relate to each other. Segment modifies what
the conditions point at. Different level, but the same family: **operators that
modify the match.**

Practical consequence: segment, AND, OR, NOT probably want to share one mental
model and one part of the UI — "the knobs that change how matching works" —
rather than segment arriving as an unrelated bolt-on. Sprint 2 (segment) and the
operator work are two members of one concept, not two features.

## Open question: do Exceptions fold into operators?

Exceptions are already NOT — a separate list of conditions that, if any match,
disqualify the rule. They run "in their own capacity" (a separate block).

If operators become a first-class family, NOT could live there too, and
Exceptions might fold into the operator model rather than being a standalone
block. That would unify the concept.

Caveat (not yet decided): Exceptions have their own semantics — "any exception
matches → skip", evaluated against the whole element. Folding them in must
preserve that, and must not break existing rules that use exceptions. Worth
noting the maintainer has not needed exceptions in practice yet, so there is
little real-world usage to migrate. Park this decision until the operator UI
takes shape.

## What needs designing before code

1. **Where does Segment live in the rule UI?** A toggle at the top of the
   conditions block, per the "operators that modify the match" framing.
2. **What does a segment resolve to when conditions locate several runs?**
   First? All, concatenated? Needs a rule.
3. **Segmenting mechanics.** The element must be re-split into runs to segment
   over. PdfPig has per-letter font/colour/position; the merged element does
   not currently retain run boundaries. So segment needs access to the
   sub-element runs — either the extractor preserves them, or segment
   re-derives them. This is the real implementation cost and needs a look at
   what the extraction pipeline still holds at rule-evaluation time.
4. **Interaction with element re-use (shipped).** Three rules, each segmenting
   the same element differently, each emitting its own value. Element re-use
   already lets several rules claim one element; segment gives each a different
   piece. They compose.

## The bigger frame: a rule is a query

Segment is not a bolt-on feature. Writing the examples out shows the real shape:
**conditions, exceptions, operators and segment are all clauses in one query.**
The rule builder is a small query language. Whether a query targets the whole
element or a piece of it is just one clause (segment) among the rest.

Vocabulary, now settled:

- **Segment** = an *input* scope clause, declared first: whole element, or a
  named piece of it. (The name "part" was taken — see below.)
- **Part** = the *output* tag (title / content / description / summary): where
  the query's result goes. Unchanged.

So segment scopes the input, part tags the output — opposite ends of the rule,
no clash.

Exceptions were added after conditions, historically, as a separate NOT block.
Designed fresh, they would just be negated clauses in the one query. The
query-language frame absorbs them.

## Existing rules rewritten as queries

Grounding the design in rules that already exist (from `tailoredTourPdf`). If
these re-express cleanly, the frame holds.

**Tour Description** (today: 3 conditions, whole element)
```
SELECT element
WHERE fontSize in 13..16 AND fontName contains "HelveticaNeue-Medium" AND colour = #FFD200
TAG AS content
```

**Day Number** (itinerary heading)
```
SELECT element
WHERE fontSize in 9..12 AND fontName contains "HelveticaNeue-Medium" AND colour = #16549D
TAG AS content, FORMAT heading3
```

**Day Details** (itinerary body — same size/family as Day Number, differs only by colour)
```
SELECT element
WHERE fontSize in 9..12 AND fontName contains "HelveticaNeue" AND colour = #221F1F
TAG AS content, FORMAT paragraph
```

**The three strapline atoms** — the case that needs segment. One element,
`5 days from £1,199 Departing 30th September 2026`, two colour runs.
```
-- duration
SEGMENT the run WHERE colour = #FFD200        (the yellow "5 days from £1,199")
  then keep the number before "days"          (find & replace, or a capture)
TAG AS content → maps to Tour Duration

-- price
SEGMENT the run WHERE colour = #FFD200
  then keep the number after "£"
TAG AS content → maps to Tour Price

-- date
SEGMENT the run WHERE colour = #FFFFFF        (the white "Departing 30th September 2026")
  then keep the text after "Depart…"
TAG AS content → maps to Tour Departure Date
```

The date segment by colour sidesteps Departs/Departing entirely — the white run
is the date regardless of the verb.

**A relational example (from thinking out loud)** — "red, except when it follows
blue". Surfaces a clause type we do NOT have today: **relational/positional**
conditions about neighbouring runs.
```
SELECT element WHERE colour = red
  EXCEPT WHERE previous-run colour = blue
```
Not needed for the strapline, but the instinct reached for it immediately, so
real workflows may want "follows X" / "precedes Y" / "between X and Y". Flag as
a possible clause, do not build speculatively.

## Discipline: examples define the language

Query languages grow without bound, and the UI for arbitrary nested queries is
genuinely hard (hence: steal from an existing drag-and-drop query builder, do
not design fresh). The guard against over-building is this examples table: only
clauses that a real rewritten rule needs earn their place. Everything else is
resisted until an example demands it.

Add worked examples here as they come up. The table is the spec.

## Relationship to shipped work

- **Element re-use (#81, shipped):** one element, several rules. Segment builds
  on this — each reusing rule segments differently.
- **Condition dropdown filtering (#82, shipped):** unrelated, but confirms the
  principle that rules should only offer what the source actually provides.
