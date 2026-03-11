# PdfPig Document Layout Analysis — Spike Results

## Date: Feb 2026

## Purpose

Tested PdfPig's built-in Document Layout Analysis (DLA) tools against Tailored Travels PDFs to see if they could replace or improve UpDoc's custom extraction code.

**Spike code:** `tools/PdfPigSpike/Program.cs`
**NuGet package:** `PdfPig` (version 0.1.13) — DLA is bundled in the main package. Previously used `UglyToad.PdfPig.DocumentLayoutAnalysis 1.7.0-custom-5` (fork, now replaced).

---

## Tools Tested

| Tool | What It Does | Result |
|------|-------------|--------|
| **DecorationTextBlockClassifier** | Identifies repeated headers/footers/page numbers by comparing text across pages (string edit distance) | **Not useful.** Found almost nothing — your PDFs have same visual template but different text per page. Classifier looks for repeated *text*, not repeated *visual regions*. |
| **RecursiveXYCut** | Top-down page segmentation — finds columns and content blocks by detecting whitespace gaps | **Very promising.** Produces clean, semantically meaningful blocks. Better than custom column detection. |
| **DocstrumBoundingBoxes** | Bottom-up clustering — handles rotated text, L-shaped text, multi-column | **Works.** Similar block count to RecursiveXYCut but groups some things differently (e.g., merges "5 days from £814" with "Departing 5th October 2026" into one block). |
| **NearestNeighbourWordExtractor** | Alternative word extraction that handles rotated/curved text | **Different output.** Gets ~650 words vs ~360 from default extractor on same page. More granular — worth investigating if default extractor is merging things incorrectly. |
| **UnsupervisedReadingOrderDetector** | Orders blocks using spatial reasoning (Allen's interval algebra) | **Works but reading order is odd.** Starts with image captions and footer text before title. May need tuning via the `T` (tolerance) parameter. |
| **WhitespaceCoverExtractor** | Finds maximal empty rectangles on the page | **Not tested** — requires different API approach. Could be useful for finding section gaps. |

---

## Key Findings

### 1. DecorationTextBlockClassifier is a Dead End

**Liverpool PDF (4 pages):** Found only 2 "decorations" — an email address and a URL. Completely missed the blue header/footer boxes.

**Dresden, Suffolk, Bruges (4 pages each):** Found **zero** decorations.

**Why:** The classifier compares text content across pages using edit distance. It's designed for scanned books with literal "Page X of Y" headers. Tailored Travels PDFs have the same visual template (blue boxes, logo) but different text content on each page. The repeated visual elements aren't detectable through text comparison.

**Alternative for blue boxes:** The existing filled rectangle detection (`page.ExperimentalAccess.Paths`) already identifies these perfectly by color (`#16549D` = dark blue, `#C6EAFA` = light blue sidebar). This is the right approach — don't change it.

### 2. RecursiveXYCut Produces Clean Content Blocks

**Liverpool Page 1 — 24 blocks found:**

| Block | Content | Notes |
|-------|---------|-------|
| 1 | "ACCOMMODATION" | Section heading — clean |
| 2 | "Liverpool" | Title part 2 |
| 3 | "The Arts Society Kingston presents" | Subtitle |
| 4 | "The Art & History of" | Title part 1 |
| 5 | "FEATURES" | Section heading — clean |
| 6 | "5 days from £814" | Pricing — separate from departure date |
| 7 | "Departing 5th October 2026" | Departure — separate from pricing |
| 8 | Bullet list (features) | Correctly grouped |
| 9 | "WHAT WE WILL SEE" | Section heading — clean |
| 10 | Bullet list (what we'll see) | Correctly grouped |
| 11 | Accommodation body text | Correctly grouped |
| 12 | "EXTRAS TO YOUR TOUR" | Section heading — clean |
| 13 | "The Liver Building" | Image caption — isolated |
| 14 | Extras bullet list | Correctly grouped |
| 15 | Disclaimer text | Correctly grouped |
| 16-24 | Contact info, ATOL, footer | Each separated |

**Liverpool Page 2 — 21 blocks:**
- Day 1-5 itinerary entries each as separate blocks
- Sidebar "WHAT WE WILL SEE" list as a block
- Image captions ("Little Moreton Hall", "Liverpool Cathedral") isolated
- NB disclaimer as its own block

**Quality assessment:** Section headings (FEATURES, ACCOMMODATION, WHAT WE WILL SEE, EXTRAS TO YOUR TOUR) are cleanly separated as individual blocks. Body content under each heading is grouped correctly. Image captions are isolated (easy to exclude). This is significantly better than our custom line-grouping approach.

### 3. Filled Rectangles Are Consistent Across All PDFs

Dark blue boxes (`#16549D`) appear at consistent positions across all 4 test PDFs:

| PDF | Page 1 Blue Boxes |
|-----|-------------------|
| Liverpool | (14.2, 27.2) 380.6x129.7 + (394.7, 27.2) 186.4x129.7 + (14.2, 696.4) 380.6x131.3 |
| Dresden | (14.2, 14.3) 380.6x129.7 + (394.7, 14.3) 186.4x129.7 + (14.2, 662.0) 380.6x165.9 |
| Suffolk | (14.2, 27.2) 380.6x129.7 + (394.7, 27.2) 186.4x129.7 + (14.2, 697.4) 380.6x130.3 |
| Bruges | (14.2, 27.2) 380.6x129.7 + (394.7, 27.2) 186.4x129.7 + (14.2, 705.8) 380.6x121.9 |

**Pattern:** Blue header boxes are at nearly identical positions (within ~15pt). Blue footer box position varies slightly based on content length. Light blue sidebar (`#C6EAFA`) is always 186.4pt wide.

This confirms: **filled rectangle detection is the right approach for template chrome exclusion**, and the positions are stable enough to define area-based exclusion rules.

### 4. Word Extraction: NearestNeighbour Gets More Words

| PDF | Default | NearestNeighbour |
|-----|---------|-----------------|
| Liverpool | 366 | 658 |
| Dresden | 357 | 631 |
| Suffolk | 293 | 452 |
| Bruges | 363 | 668 |

NearestNeighbour consistently gets ~1.8x more words. This is because it handles letter-spacing and kerning differently. Worth investigating whether the extra words are useful or noise.

---

## Recommended Extraction Pipeline

Based on these results, the optimal pipeline combines existing and new tools:

### Step 1: Exclude Template Chrome (existing — keep as-is)
- Use `page.ExperimentalAccess.Paths` to find filled rectangles
- Filter by color: `#16549D` (dark blue header/footer), `#C6EAFA` (light blue sidebar)
- Any text whose center point falls within these rectangles is template content → exclude
- **This already works well. Don't change it.**

### Step 2: Segment Remaining Content (NEW — swap in RecursiveXYCut)
- After excluding template chrome words, run `RecursiveXYCut.Instance.GetBlocks(remainingWords)`
- This replaces the custom column detection + line grouping code
- Produces clean content blocks with proper boundaries
- **Requires adding `UglyToad.PdfPig.DocumentLayoutAnalysis` NuGet package to UpDoc.csproj**

### Step 3: Classify Blocks (existing — refine)
- Use font size to identify section headings within blocks
- Headings in ALL CAPS with larger font size = section headers (FEATURES, ACCOMMODATION, etc.)
- Group heading blocks with their following content blocks = named sections
- Image captions (small blocks near page edges, small font) can be excluded by size/position heuristics

### Step 4: Shape & Map (existing — unchanged)
- Three-layer pipeline continues as designed
- Sections are now cleaner because they come from proper page segmentation

---

## Implementation Notes

### Adding the DLA Package

```xml
<!-- Add to src/UpDoc/UpDoc.csproj -->
<PackageReference Include="UglyToad.PdfPig.DocumentLayoutAnalysis" Version="1.7.0-custom-5" />
```

### RecursiveXYCut Usage

```csharp
using UglyToad.PdfPig.DocumentLayoutAnalysis.PageSegmenter;
using UglyToad.PdfPig.DocumentLayoutAnalysis.WordExtractor;

var page = document.GetPage(pageNum);
var words = page.GetWords(NearestNeighbourWordExtractor.Instance);

// Filter out words inside template chrome rectangles (existing logic)
var contentWords = words.Where(w => !IsInsideTemplateChromeRect(w));

// Segment into blocks
var blocks = RecursiveXYCut.Instance.GetBlocks(contentWords);
```

### RecursiveXYCut Has Tunable Parameters

The `Instance` property uses defaults. Custom parameters available via constructor:
- Minimum block width
- Gap size function (how big a whitespace gap triggers a split)

May need tuning for the Tailored Travels layout. Test with defaults first.

---

## What NOT to Use

- **DecorationTextBlockClassifier** — doesn't work for graphic design templates. Only useful for scanned documents with literal repeated text headers/footers.
- **UnsupervisedReadingOrderDetector** — reading order was incorrect (started with image captions). The existing top-to-bottom + left-to-right sort is more reliable for these PDFs.

---

## Future Exploration

- **WhitespaceCoverExtractor** — not tested in this spike. Finds maximal empty rectangles on the page. Could help identify section gaps more precisely than font-size-based splitting. Worth testing separately.
- **NearestNeighbourWordExtractor** — gets more words but unclear if the extras are useful. Worth comparing output quality with specific edge cases (hyphenated words, tight kerning).
- **PDF.js Area Editor** — standalone HTML tool built externally that renders PDFs and lets users draw area rectangles. Outputs JSON with PDF point coordinates. Could serve as escape hatch for PDFs where automated detection fails. See screenshots from Feb 2026 conversation. This is a v5+ feature.
