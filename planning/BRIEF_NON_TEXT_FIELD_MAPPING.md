# Brief: support mapping into non-text destination fields (integer, date)

Raised: 2026-07-18, from the Tailored Travel project.
Status: brief for triage — not yet an agreed plan.

## Summary

UpDoc's PDF workflow can only map extracted content into **text**, **textArea**
and **richText** document-type properties. Integer, date, and other typed
properties are silently dropped from the destination mapping, so they can never
be populated on import.

This is the first real-world workflow to need typed fields, so the gap has not
surfaced before. It now blocks a live use case (see "Motivating case").

## Root cause (confirmed in source)

`src/UpDoc/Services/DestinationStructureService.cs`:

**1. The allow-list excludes everything but text.** Lines 30-33:

```csharp
private static readonly HashSet<string> TextMappableTypes = new(StringComparer.OrdinalIgnoreCase)
{
    "text", "textArea", "richText"
};
```

`BuildFieldIfEligible` (lines 172-193) maps the editor alias, then drops any
field whose mapped type is not in that set (lines 176-180):

```csharp
var fieldType = MapEditorAlias(propertyType.PropertyEditorAlias);
if (!TextMappableTypes.Contains(fieldType))
{
    return null;   // field never offered as a mapping target
}
```

The same filter applies to block properties (lines 364-376).

**2. `MapEditorAlias` already recognises the types — they just aren't allowed
through.** Lines 444-456:

```csharp
private static string MapEditorAlias(string editorAlias) => editorAlias switch
{
    "Umbraco.TextBox" => "text",
    "Umbraco.TextArea" => "textArea",
    "Umbraco.RichText" or "Umbraco.TinyMCE" => "richText",
    "Umbraco.Integer" or "Umbraco.Decimal" => "number",
    "Umbraco.DateTime" => "date",
    "Umbraco.TrueFalse" => "boolean",
    "Umbraco.MediaPicker3" => "mediaPicker",
    "Umbraco.ContentPicker" or "Umbraco.MultiNodeTreePicker" => "contentPicker",
    "Umbraco.BlockList" => "blockList",
    _ => "text"
};
```

So `Umbraco.Integer` → `"number"` (dropped by the filter), and
**`Umbraco.DateOnly` is not in the switch at all** — it falls through to
`_ => "text"`, which is why a DateOnly field currently sneaks in *as text*
(inconsistent, and it won't coerce to a real date on write).

## What "done" looks like

At minimum, integer and date properties should be offerable as mapping targets
and receive a correctly-typed value on import. Concretely:

1. Add `"number"` and `"date"` to `TextMappableTypes` (or replace the allow-list
   with an explicit unsupported-list — design choice).
2. Add `Umbraco.DateOnly` to `MapEditorAlias` so it maps to `"date"`, not the
   text fallback. Consider `Umbraco.DateTime` and `Umbraco.DateOnly` together.
3. **The write/apply path must coerce the captured string to the target type.**
   A capture like `1,999` must land in an integer property as `1999`, and
   `29 September 2027` in a DateOnly property as a real date. This is the part
   that needs the most care — find where the mapped value is written onto the
   content property and ensure typed conversion happens there.

## Open questions for the implementer

- **Where is the value applied to the content property?** It was not obvious in
  the server-side services (`WorkflowService`, `ContentTransformService`). It
  may run client-side (the map executes in the browser, then content is created
  via the Management API). The fix likely spans both the server field filter and
  the client apply step — confirm before scoping.
- **Cleanup responsibility.** UpDoc already has a regex find-and-replace in the
  rule editor. Should the raw→typed cleaning (strip `,` from price, strip ordinal
  from a date) stay the editor's job via find-and-replace, or should the typed
  write coerce leniently? Recommend: editor find-and-replace does the string
  cleanup, the write does a strict parse and fails loudly if the cleaned string
  is not valid for the type.
- **AcceptsFormats / UI.** `GetAcceptsFormats` (lines 458-463) only knows text
  shapes. A number/date target may want its own accepted formats and a different
  editor affordance in the mapping UI.
- **Other typed editors.** `boolean`, `mediaPicker`, `contentPicker` are mapped
  by `MapEditorAlias` but also excluded. Out of scope for this brief (no current
  need) but worth noting the same filter blocks them — a general "typed field
  mapping" design would cover all of them rather than special-casing number/date.

## Motivating case (Tailored Travel)

A tailored-tour PDF has a one-line strapline, e.g.:

```
6 days from £1,999   Departs 29th September 2027
```

The destination doc type splits this into three typed properties:

| Property | Editor | Value |
|---|---|---|
| `pagePropertyTourDuration` | Umbraco.Integer | `6` |
| `pagePropertyTourPriceFrom` | Umbraco.Integer | `1999` |
| `pagePropertyTourDepartureDate` | Umbraco.DateOnly | `2027-09-29` |

The source side works: UpDoc already isolates the strapline as a discrete
section, and three anchor-based rules with regex find-and-replace can capture
and clean each value (before `day`; after `£` with `,`→``; after `Depart` with
`(\d{1,2})(st|nd|rd|th)`→`$1`). The **only** blocker is the destination: the two
integer fields are never offered, and the date field is mis-typed as text.

## Suggested next step

Create a GitHub issue on the UpDoc repo from this brief (`gh issue create`),
then plan the fix per the project's planning-doc convention.
