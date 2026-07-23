# Condition dropdown audit (issue #80)

Purpose: decide which condition types should appear in the rules-editor dropdown
for each source type. This report lists every condition, what it evaluates
against, and whether a **PDF** element actually carries that data.

The same list feeds both the **Conditions** and **Exceptions** dropdowns.

Today the dropdown only **reorders** by source type (web types first for web),
it never **removes**. So a PDF workflow shows all 20 conditions including the
web-only ones. This audit is the basis for filtering.

## What a PDF element carries

From `AreaElement` (Models/AreaDetectionResult.cs): a PDF element has `Text`,
`FontSize`, `FontName`, `Color`, `BoundingBox`. The web fields — `HtmlTag`,
`HtmlContainerPath`, `CssClasses`, `IsBold` — are documented "Empty for
PDF/markdown sources" and, confirmed in the sample extraction, are never
populated by PDF extraction.

## The 20 conditions

| Condition | Evaluates against | PDF has this? | PDF? |
|---|---|---|---|
| Text begins with | element text | ✅ | **yes** |
| Text ends with | element text | ✅ | **yes** |
| Text contains | element text | ✅ | **yes** |
| Text equals | element text | ✅ | **yes** |
| Text matches pattern | element text (regex) | ✅ | **yes** |
| Font size equals | `FontSize` | ✅ | **yes** |
| Font size above | `FontSize` | ✅ | **yes** |
| Font size below | `FontSize` | ✅ | **yes** |
| Font size between | `FontSize` | ✅ | **yes** |
| Font name contains | `FontName` | ✅ | **yes** |
| Font name equals | `FontName` | ✅ | **yes** |
| Color equals | `Color` | ✅ | **yes** |
| Position: first | element index | ✅ | **yes** |
| Position: last | element index | ✅ | **yes** |
| HTML tag equals | `HtmlTag` | ❌ empty on PDF | **no** |
| CSS class contains | `CssClasses` | ❌ empty on PDF | **no** |
| Container path contains | `HtmlContainerPath` | ❌ empty on PDF | **no** |
| Container ID equals | `HtmlContainerPath` | ❌ empty on PDF | **no** |
| Container class contains | `HtmlContainerPath` | ❌ empty on PDF | **no** |
| Is bold | `IsBold` | ❌ never set by PDF extraction | **no** |

## Findings

**14 conditions belong in the PDF dropdown** — all text, font size, font name,
colour and position conditions.

**6 should be removed from PDF** — the five HTML/container conditions plus
**Is bold**. Your instinct about CSS was right, and it extends further: every
web-derived condition reads a field that PDF extraction leaves empty, so they
can never meaningfully match a PDF element.

**Is bold — the one that surprised.** Conceptually bold is meaningful for PDF
(font weight), so the first instinct was to keep it in "both". But PDF
extraction never sets `IsBold` — only the web extractor does. So on a PDF it
always compares against `false` and is useless *in practice*. It is web-only
until PDF extraction learns to detect bold (a separate piece of work). For now:
**remove from PDF**.

## Proposed PDF list (14)

```
Text begins with, Text ends with, Text contains, Text equals, Text matches pattern,
Font size equals, Font size above, Font size below, Font size between,
Font name contains, Font name equals, Color equals,
Position: first, Position: last
```

## Not covered here

- **Web** dropdown — a separate audit; broadly the inverse (text + HTML/container
  + is bold), but web also has font size/colour from CSS extraction, so it needs
  its own check rather than assuming.
- **Markdown / Word** — no workflows exist yet; leave showing the full list for now.
- This audit is about *filtering the existing list*, not adding new conditions.
