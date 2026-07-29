# AI-Assisted Source Identification

**Issue:** [#31](https://github.com/UmTemplates/UpDoc/issues/31)
**Status:** PARKED (2026-04-29) — see "Why parked" below
**Branch:** `feature/ai-source-identification`

---

## Why parked

A new context-aware Umbraco.AI is in development. The current Umbraco.AI surface is acknowledged as "not great" and the imminent improvements are predominantly about context-awareness — exactly the capability this feature depends on.

Building against today's API would mean rework when the new surface ships. Wait, then spike, then build.

When the new Umbraco.AI lands, the first action is the spike (see "Phasing → Phase 2"). One hour with the new API will tell us whether this plan still fits or needs rewriting.

---

## The pinch point

Setting up a workflow takes hours. Almost all of that time is spent on **identifying source content**: looking at a sample extraction with hundreds of elements, working out which are headings vs body vs noise, writing rules that pick them out across font-size variation, and grouping related elements into sections.

The mapping step at the end (named section → destination field) is trivial. The Transformed view iteration is what eats the time.

Any time saved authoring workflows comes from making source identification faster, not from making mapping faster.

## The deliverable

AI writes to the same JSON files the workspace UI writes to. No new format, no new persistence, no new schema.

The author marks which destination fields they want populated. They click "find this in the source" on a field. AI:

1. Reads the workflow's JSON files.
2. Identifies the source element(s) that should map to that field.
3. Writes rules to `source.json` that pick those elements out (with sensible tolerance).
4. Names the resulting section.
5. Writes the mapping to `map.json` wiring that section to the destination field.

The author reviews the proposed JSON edits in a diff-style UI. Accept commits the patch via the existing save endpoints. Reject discards.

AI is one client of the JSON files. The workspace UI is another. They produce the same artefacts.

## Why this works with what we already have

The pinch point is shallower or deeper depending on source type, because the noise floor varies.

| Source | Existing tools | AI's role |
|--------|---------------|-----------|
| **Web** | None spatial — author must traverse the DOM mentally | Replacement for a missing tool. DOM traversal is exactly the pattern-recognition task LLMs do well. **Sharpest pain, highest value.** |
| **PDF** | Area picker, container overrides, column detection, page filtering | Augmentation. Author narrows the region first; AI identifies elements inside it with sensible tolerance (`fontSizeRange`, not `fontSizeEquals`). |
| **Markdown** | Already structured | Nice-to-have. Lightest touch. |

Build order follows the pain. Web first.

## Runtime is unchanged

AI runs only in Settings, only during workflow authoring. Once the workflow is committed, content editors hit the same deterministic pipeline as today. No AI per document creation. No API key required to use a workflow. No behavioural drift between runs.

This is non-negotiable. UpDoc's value is repeatability — the same PDF run twice produces the same document. AI is a setup assistant, not a runtime component.

---

## Terminology note

When a source element has been picked out by a rule, it is **identified** — not a "candidate." Once a rule has matched it, the author (or AI) has committed to it being the right thing for the destination. The whole feature is "AI-assisted source **identification**" for that reason.

---

## Architecture

### Inputs to AI

The four JSON files in the workflow folder, plus the list of targeted destination fields:

- `destination.json` — what the blueprint exposes, with `targeted: true` flags
- `source.json` — existing source config and rules (may be partial)
- `sample-extraction.json` — rich extraction from the reference document
- `map.json` — existing mappings (may be partial)

### Outputs from AI

Proposed JSON patches against `source.json` and `map.json`. Shape:

```json
{
  "proposals": [
    {
      "destinationField": "pageTitle",
      "confidence": "high",
      "sourceElements": ["element-id-3", "element-id-4"],
      "proposedSection": {
        "key": "title",
        "rules": [
          { "type": "fontSizeRange", "min": 22, "max": 26 },
          { "type": "pageEquals", "value": 1 }
        ]
      },
      "proposedMapping": {
        "section": "title",
        "target": { "property": "pageTitle" }
      }
    }
  ]
}
```

The author reviews each proposal. On accept, the patch is applied via existing save endpoints. No new endpoints needed for persistence — only a new endpoint for the AI call itself.

### Per-field vs batch

Same backend, two entry points. Single field is just N=1.

| Mode | Where | Use case |
|------|-------|----------|
| Per-field | Magic-wand icon next to each targeted field on Destination tab | "I've done four manually, this one's tricky, let AI try" |
| Batch | "Find all targeted fields" button at top of Destination tab | "Fresh workflow, let AI take a first pass" |

Per-field ships first. Batch is per-field with a list and a review-all UI on top.

### Review UI

The bit that makes this not annoying to use.

- One row per proposal, grouped by destination field.
- Each row shows: destination label, proposed source preview text, proposed rules (compact), confidence indicator.
- Accept / Edit / Reject per row.
- "Accept all" for high-trust passes.
- Nothing written to disk until commit.

Confidence indication matters because the human then knows where to focus. AI is good at saying "I'm sure this is the title" vs "I'm guessing this might be the description" — surface that, derived either from the model's own confidence or from how unique the rule is.

---

## Prerequisites (separate issues, not yet created)

These are not part of this issue but must land first.

### Prerequisite 1: Targeted destination fields

Without this, AI has no way to know which fields the author cares about and would over-eagerly map every field to something. The blueprint exposes 20 fields; the author only wants 6 populated.

**Storage:** extend `destination.json`. Each field gets a `targeted: boolean` flag, default `false`. Survival: when `destination.json` is regenerated from the blueprint, preserve `targeted` flags by field alias.

**UI:** toggle on each field on the Destination tab. Default off (uncommon case is wanting it filled).

Useful on its own — Map tab gets less cluttered when the author can mark which fields matter. No AI dependency.

### Prerequisite 2: Web/markdown source consistency with PDF

Today the source types behave inconsistently:

- **PDF:** elements are not identified for mapping unless a rule fires. Default state: not identified.
- **Web/markdown:** areas default *included* — user opts them out via `excludedAreas`.

This needs inverting. Web and markdown should follow the PDF model: nothing is identified for mapping until a rule fires. The full source is always visible in the source view (it is the source, after all), but no element becomes a mapping target without explicit identification via rules.

Touches existing workflows. Needs a migration path for existing `excludedAreas` data. Worth doing on its own merits regardless of AI — it's a UX consistency improvement. AI feature gets a uniform mental model across source types as a free side-effect.

---

## Phasing (within this issue)

**Phase 1 — Umbraco.AI spike** *(do first when issue unparks)*

- Install the new Umbraco.AI in `UpDoc.TestSite`.
- Find the C# service interface for programmatic context-aware calls.
- Send a tiny test prompt: pass workflow JSON files as context, ask for a structured response, confirm we can reliably get well-formed JSON back.
- Decide: is Umbraco.AI's API the right surface, or do we need to call the underlying provider directly with Umbraco.AI providing only config / auth / context-management?
- Output: `planning/AI_SPIKE_FINDINGS.md` and a working test endpoint. No UI yet.

**Phase 2 — Per-field AI**

- New endpoint `POST /workflows/{name}/identify-source` taking a single targeted field alias.
- Backend reads the four JSON files, builds the prompt (or hands them to Umbraco.AI as context), parses the response, returns proposals.
- Magic-wand icon on each targeted field.
- Review modal per proposal.
- Accept / Edit / Reject. Accept calls existing save endpoints.

**Phase 3 — Batch AI**

- Same endpoint, takes a list of field aliases (or empty = all targeted).
- Review UI listing all proposals with per-row accept/reject.
- "Accept all" shortcut.

**Phase 4 — Source-type-aware prompts**

The prompt or context handed to AI must be source-type-aware. Web prompts: think CSS selectors, semantic HTML, DOM structure. PDF: font sizes, positions, pages, with tolerance. Markdown: heading levels.

Each source type gets its own prompt template (or context-shape). They all return the same proposal shape.

Possibly fold into Phase 2 if it's natural to handle there.

---

## Risks and mitigations

### Rule generalisation

AI sees one sample. It might write a rule that fits perfectly but breaks on the next document. This is the exact `fontSizeRange` lesson from February.

**Mitigation:** prompt explicitly asks for tolerance ranges, not exact values. Author should test the proposed workflow against a second sample document before declaring it done. Possibly a "test against second sample" follow-up feature.

### Confident wrong answers

LLMs sometimes return confident garbage. The review UI is the safety net — nothing commits without human approval. We never auto-commit AI proposals.

### Block matching

The codebase has the `contentTypeKey` rule (twice-burned). AI must be told to use `contentTypeKey`, not block label or instance `key`. Prompt-engineering responsibility, captured in the prompt template.

### Optional dependency

Umbraco.AI is a real dependency with API key requirements. UpDoc must remain installable and usable without it. If Umbraco.AI is not configured, the AI buttons hide cleanly with a tooltip explaining how to enable.

### Token cost

Each AI call sends the four JSON files. Sample extractions can be large. Mitigations:

- Strip the sample extraction to just text + key metadata before sending. Don't send raw PdfPig output.
- For per-field calls, only send what AI needs (the targeted field + relevant source elements).
- Cache AI responses keyed on a hash of inputs, so re-running on the same data doesn't re-call.

### "AI for AI's sake"

The whole point of this issue is that mapping is trivial and identification is the pain. If the implementation drifts toward "AI suggests mappings" instead of "AI identifies and writes rules", we've built the wrong thing. The deliverable is rule-writing, not field-matching.

---

## Out of scope

- AI at content-creation time. Editors using "Create from Source" never hit AI.
- New persistence formats. AI writes to `source.json` and `map.json` only.
- Auto-commit without review.
- AI-managed targeting. The author decides which fields are targeted; AI doesn't.
- Multi-sample training. AI sees one sample at a time. Cross-sample tolerance comes from the author testing against a second sample manually.

---

## File changes summary (provisional)

### Backend (C#)

- `Services/AiIdentificationService.cs` (NEW) — calls Umbraco.AI, builds prompts (or assembles context), parses responses.
- `Controllers/WorkflowController.cs` — new `POST /workflows/{name}/identify-source` endpoint.
- `Composers/UpDocComposer.cs` — register service conditionally on Umbraco.AI presence.

### Frontend (TypeScript)

- Destination workspace view — magic-wand icons on targeted fields, batch button.
- `ai-proposal-modal.element.ts` (NEW) — review UI.
- `ai-proposal-modal.token.ts` (NEW).
- `manifest.ts` — register new modal.

### Docs

- `docs/src/content/docs/source-files/` — entries for new TypeScript files (per CLAUDE.md docs requirement).

(Targeting model and consistency-change file work belongs in the prerequisite issues, not here.)

---

## Open questions

1. **Editing proposed rules in the review UI.** Inline tweak of proposed `fontSizeRange` values, or accept-then-edit-after via the existing rule editor? Inline is friendlier; accept-then-edit is simpler to build.

2. **What to do when AI returns nothing useful.** "Sorry, I can't identify content for this field" is a valid response. UI should handle this gracefully — probably "AI couldn't find a match, please add manually" with a link to the existing Source tab flow.

3. **Whether the new Umbraco.AI surface changes the prompt-vs-context-injection model.** If Umbraco.AI handles context registration natively, the implementation becomes thinner. The spike answers this.
