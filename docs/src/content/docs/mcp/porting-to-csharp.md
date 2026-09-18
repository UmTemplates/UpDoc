---
title: "Porting the Mapping to C#"
description: "Moving import logic from browser TypeScript to the server, and the four things that behaved differently."
---

The mapping logic had only ever existed as browser TypeScript. Creating the endpoint meant moving it to C#.

Each piece is a **port rather than a reimplementation**. The TypeScript had run around sixty real imports and carried comments explaining why it worked the way it did. Those comments came across with the code.

## What moved

| Service | Responsibility |
|---|---|
| `SectionLookupBuilder` | Flattens transform sections into the `sectionId.part` keys `map.json` addresses |
| `MappingApplicationService` | Applies `map.json` to a document's property values |
| `ValueCoercion` | Turns `"£1,199"` into `1199` and `"30th September 2026"` into a date |
| `MarkdownStripper` | Strips markdown for plain-text destinations |
| `MarkdownConversionService` | Converts markdown to HTML for rich text destinations |
| `MediaFilePathResolver` | Resolves a media key to a file path on disk |
| `DocumentCreationService` | Orchestrates all of the above |

All live in `src/UpDoc/Services/`.

## What the endpoint does

`DocumentCreationService.CreateAsync` runs what the backoffice runs when an editor clicks Create:

1. **Blueprint to workflow.** The blueprint decides the workflow, because a workflow folder exists per blueprint per source type.
2. **Resolve source type.** The request's, or the workflow's first configured one, defaulting to `pdf`.
3. **Extract and transform.** Resolve the media path, load the area template, detect areas, reuse the previous transform so include/exclude choices survive, then transform.
4. **Build section lookups.**
5. **Scaffold from the blueprint.** The scaffold carries the blueprint's own content, so unmapped fields keep their defaults.
6. **Apply mappings**, returning the set of written field keys.
7. **Create the document** via `IContentEditingService`.

Step 3's source comment notes it is "the same path the backoffice uses when it shows 'Content extracted successfully'", which is the property that makes the two agree.

## Four things that behaved differently

### 1. Markdown, which turned out not to be a problem

This was the risk that nearly drove the whole project down a different route.

The browser uses `marked`. C# would need a different library. Two markdown engines do not produce identical HTML, so documents created through the API could differ subtly from ones created by clicking.

**Measured rather than assumed.** Markdig 0.45 and marked emit byte-identical HTML for the four shapes UpDoc actually produces (bullet lists, `h3` headings, paragraphs, and mixtures of the three), including newline placement and the trailing newline.

The measurement is now enforced in code:

```csharp
// Built once. The pipeline is immutable and thread-safe once constructed,
// and rebuilding it per call is pure overhead.
private static readonly MarkdownPipeline Pipeline = new MarkdownPipelineBuilder().Build();
```

Note `.Build()` with **no** `.UseAdvancedExtensions()`. The source comment is explicit about why:

> Do not add pipeline extensions without re-checking that. Markdig's defaults are what match; advanced extensions change the output.

That warning is the durable part. The equivalence holds for Markdig's defaults and for the shapes UpDoc currently produces. Change either and it needs re-measuring.

### 2. JsonNode's indexer throws where JavaScript returns undefined

This one took the first real call down with a 500.

```csharp
if (container?["contentData"] is not JsonArray contentData)
    return;
```

That works until a property that is not a block container reaches it. A media picker holds an array. `JsonNode`'s indexer **throws** on a non-object rather than returning null, where JavaScript quietly returns `undefined`.

The error was `The node must be of type 'JsonObject'`.

The fix is to check the type before indexing. Obvious in hindsight, not obvious when porting line by line from a language that does not care.

The source comment now says so:

> Must be an object before contentData can be read. JsonNode's indexer throws on a non-object rather than returning null, and a property that is not a block container — a media picker holds an array — would otherwise take down the whole import.

### 3. Block grid values arrive in a different form

The Management API hands the **browser** a block grid as a JSON **string**.

Server-side, the scaffold has already parsed it into an **object**.

The porting code has to handle both, and this is not discoverable by reading the TypeScript, because the TypeScript only ever sees one of the two.

### 4. Absent is not the same as empty

A property only appears in `contentData` once a value has been saved against it.

So two blocks that look identical in the backoffice can differ in the underlying JSON, depending on the blueprint's editing history. An absent property is **created** rather than dropped.

## Two decisions carried over from the TypeScript

These were already right and are worth restating because both are easy to get wrong again.

### Blocks match on contentTypeKey

Umbraco regenerates block instance keys when creating from a blueprint, so the element type GUID is the only stable identifier.

There is a second, distinct reason in the conversion pass:

> An identifyBy text search is unreliable here because the apply pass may already have overwritten the blueprint default that the search looks for.

Two different failure modes, same conclusion.

### Ambiguous dates are refused, not guessed

`ValueCoercion` accepts named months in either order, with or without ordinal suffixes, plus ISO input. It **deliberately refuses** all-numeric formats.

The source comment capitalises `DELIBERATELY REFUSES`, and the reasoning is worth quoting in full:

> That is 6 July to a British reader and 7 June to an American one, and nothing in the source document says which. Guessing would write a wrong date that looks entirely valid, with no error to notice. Refusing leaves the field empty, which is visible. A future per-workflow date-format setting can enable these formats explicitly, rather than having to correct data already stored.

This is the general principle in the coercion layer: **each coercion returns null rather than guessing**, so a field that cannot be parsed keeps its blueprint default instead of storing something wrong.

Impossible dates are guarded too. "31 February" would roll forward into March under a lenient parse, so it is rejected instead.

### The date JSON shape

A bare `"2027-09-26"` is rejected by Umbraco's date editors.

All four v17 date editors derive from `DateTimePropertyEditorBase`, which declares `ValueType = ValueTypes.Json`. So the value must be an object:

```json
{ "date": "2026-09-30", "timeZone": null }
```

`timeZone` is null because the DateOnly editor ships with no configuration, so the `TimeZoneMode.Custom` validator does not apply.

## Ordering matters in two places

**Type conversion runs last**, so concatenation happens on raw strings first.

**The first write to a field replaces the blueprint's default; later writes concatenate.** That is how a title split across two source elements ends up in one field.

## What it produced

Verified against a real brochure, 19 of 19 mappings resolved:

| Field | Value |
|---|---|
| Page Title | Flemish Masters – Bruges, Antwerp & Ghent |
| Tour Duration | `5` (from "5 days") |
| Tour Price | `1199` (from "£1,199") |
| Departure Date | `{"date":"2026-09-30","timeZone":null}` (from "30th September 2026") |
| Itinerary | `<h3>Day 1</h3><p>We depart by executive coach…` |
| Features | `<ul><li><p>4* central Bruges hotel</p></li>…` |
| Brochure | Media picker pointing at the source PDF |

Sixteen blocks matched by `contentTypeKey`. Unmapped ones left on their blueprint defaults.

## The lesson

**The riskiest part of moving logic between languages is the part you are confident about.**

Markdown was the stated risk and turned out to be a non-issue. `JsonNode`'s indexer was not on anyone's list and took down the first real call.

## Further reading

- [Two Implementations](/UpDoc/mcp/two-implementations/): why this port did not replace the TypeScript
- [Routes Considered](/UpDoc/mcp/routes-considered/): where the markdown risk nearly led
