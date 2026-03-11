# Plan: Swap in RecursiveXYCut for PDF Extraction

## Context

UpDoc's PDF extraction pipeline in `PdfPagePropertiesService.cs` uses custom code for column detection (projection profile histogram), line grouping (Y-tolerance matching), and continuation line merging (font metadata matching). A spike test (`tools/PdfPigSpike/`) proved that PdfPig's built-in `RecursiveXYCut` page segmenter produces significantly cleaner content blocks — section headings isolated, body content properly grouped, image captions separated — with zero custom code. See `planning/PDFPIG_DLA_SPIKE_RESULTS.md` for full results.

The goal is to replace the custom extraction with RecursiveXYCut while keeping what already works (filled rectangle area detection, font-size heading detection).

## Branch

```
git checkout main && git checkout -b feature/recursive-xy-cut
```

## Files to Modify

| File | Change |
|------|--------|
| `src/UpDoc/UpDoc.csproj` | DLA is bundled in `PdfPig 0.1.13` — no separate package needed |
| `src/UpDoc/Services/PdfPagePropertiesService.cs` | New extraction methods, refactor two code paths |

**No changes needed:**
- `ContentTransformService.cs` — consumes `AreaDetectionResult`, shape preserved
- `WorkflowController.cs` — calls extraction methods, same signatures
- Models (`AreaDetectionResult.cs`, `RichExtractionResult.cs`) — same output shapes
- Frontend TypeScript — reads same JSON format
- Legacy strategy methods (`ExtractSectionsFromDocument`, etc.) — keep using `ExtractTextLines()` untouched

## New Pipeline (replaces custom column/line extraction)

```
Page
  ├── page.GetWords() → all words
  ├── DetectPageFilledRects(page) → filled rectangles [EXISTING, NO CHANGE]
  │
  ├── FilterChromeWords(words, rects)
  │     ├── chromeWords (center inside colored rect)
  │     └── contentWords (everything else)
  │
  ├── RecursiveXYCut.Instance.GetBlocks(contentWords)
  │     └── List<TextBlock> — clean content blocks
  │
  ├── Convert TextBlock → ContentBlock (add font metadata from first letter)
  │
  ├── [Rich Extraction] ContentBlock → ExtractionElement → RichExtractionResult
  └── [Area Detection]  ContentBlock → AreaElement → assign to areas → GroupIntoSections()
```

## Implementation Steps

### Step 1: Add NuGet Package

Add to `src/UpDoc/UpDoc.csproj`:
```xml
<PackageReference Include="UglyToad.PdfPig.DocumentLayoutAnalysis" Version="1.7.0-custom-5" />
```

### Step 2: New `ContentBlock` Private Class

Same shape as existing `RichTextLine` — mirrors the fields downstream code needs:
- Text, FontSize, FontName, Color, BoundingBox fields, Words list

### Step 3: New `FilterChromeWords()` Method

Takes all words + filled rectangles. For each word, center-point containment test (same math as existing area assignment at line 321). Returns two lists: content words, chrome words.

### Step 4: New `ExtractContentBlocks(Page page)` Method

The new shared core that replaces `ExtractRichTextLines()`:

1. `page.GetWords()` — get all words (default extractor first, NearestNeighbour later)
2. `DetectPageFilledRects(page)` — find colored rectangles
3. `FilterChromeWords(words, rects)` — separate chrome from content
4. `RecursiveXYCut.Instance.GetBlocks(contentWords)` — segment into blocks
5. Convert each `TextBlock` → `ContentBlock` with font metadata from first Letter

### Step 5: Refactor `ExtractRichDumpFromDocument` (line 516)

Replace:
```csharp
var lines = ExtractRichTextLines(page);  // OLD
```
With:
```csharp
var blocks = ExtractContentBlocks(page);  // NEW
```

Element creation loop stays the same shape — reads Text, FontSize, FontName, Color, BoundingBox from ContentBlock instead of RichTextLine. Element IDs (`p{n}-e{n}`) assigned the same way.

### Step 6: Refactor `DetectAreasFromDocument` (line 260)

Replace:
```csharp
var lines = ExtractRichTextLines(page);  // OLD
// ... build AreaElements from lines
```
With:
```csharp
var blocks = ExtractContentBlocks(page);  // NEW
// ... build AreaElements from blocks
```

Area assignment (center-point containment) and `GroupIntoSections()` (font-size heading detection) stay unchanged — they operate on `AreaElement` objects regardless of source.

**Chrome area handling:** Content blocks are already filtered (no chrome words). For areas to still show their contained text, optionally run a second RecursiveXYCut pass on chrome words grouped per rectangle. Can defer this — areas currently show text, but the include/exclude toggle means empty chrome areas are acceptable for now.

### Step 7: Mark Old Code Obsolete

- `ExtractRichTextLines()` → `[Obsolete]` (still used by legacy strategy methods)
- `DetectColumnBoundaries()` → `[Obsolete]`
- Do NOT delete yet — legacy `ExtractTextLines()` / `ExtractSectionsFromDocument()` still reference them

### Step 8: Test

Run against all 5 test PDFs:
1. POST `/updoc/workflows/{name}/sample-extraction` — verify elements are clean
2. POST `/updoc/workflows/{name}/area-detection` — verify areas + sections correct
3. POST `/updoc/workflows/{name}/transform` — verify Markdown sections assemble correctly
4. Full Create from Source flow — verify mapped content populates document
5. Page selection — verify `includePages` filter still works

## Element ID Impact

Element IDs (`p1-e5`) will change because RecursiveXYCut produces different groupings. This is expected — element IDs are already known to be fragile across PDFs (documented in `planning/SECTION_BASED_MAPPING.md`). Existing `map.json` files referencing old element IDs will need re-mapping. The three-layer pipeline's section-based IDs (`features.content`) are the permanent fix.

## What This Does NOT Change

- Filled rectangle detection — works perfectly, confirmed by spike
- Font-size heading detection (`GroupIntoSections`) — still valid
- API endpoints and JSON output shapes — preserved
- Frontend TypeScript — reads same format
- Legacy extraction methods (strategy-driven) — untouched, use old `ExtractTextLines()`
- `ContentTransformService` — consumes same `AreaDetectionResult` shape

## Verification

```bash
# Build
dotnet build UpDoc.sln

# Run site
dotnet run --project src/UpDoc.TestSite/UpDoc.TestSite.csproj

# Test: upload a PDF, run extraction from workspace Source tab
# Compare: area detection results should be cleaner
# Compare: transform should produce same/better Markdown sections
# Test: Create from Source should still create documents correctly
```
