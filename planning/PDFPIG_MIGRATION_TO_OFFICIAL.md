# Migrate PdfPig from Custom Fork to Official Release

**Status:** IN PROGRESS (Sprints 1-2 COMPLETE, v0.1.1-beta published)
**Branch:** `feature/pdfpig-official-release` (merged to develop + main)
**Related:** `PACKAGING_STRATEGY.md` Step 6 ("Resolve PdfPig Custom Build")

---

## Why This Migration

UpDoc depends on `UglyToad.PdfPig 1.7.0-custom-5`, a third-party fork published by "grinay" on NuGet.org. This is a real NuGet package (it restores for users), but relying on someone else's fork is a risk:

- **Could be delisted or abandoned** at any time
- **Version numbering is misleading** — the official PdfPig is at `0.1.13`, so `1.7.0` implies a non-existent major version
- **Blocks stable release** — identified in PACKAGING_STRATEGY.md as a prerequisite before going stable on Marketplace
- **Unknown modifications** — we can't verify what the fork changed from upstream

The fork was originally chosen because it included Document Layout Analysis (DLA) features and possibly XYZ coordinate extensions. **We no longer need the fork-specific features** — areas are now created manually by the user via PDF.js in the browser, not auto-detected via PdfPig's path/color analysis.

---

## What We Use from PdfPig Today

### Production Code (`PdfPagePropertiesService.cs` — ~2,000 lines)

| API | What It Does | Used Where | Available in 0.1.13? |
|-----|-------------|------------|---------------------|
| `PdfDocument.Open(filePath/stream)` | Open PDF | Multiple places | YES |
| `document.NumberOfPages` | Page count | Validation, iteration | YES |
| `document.GetPage(n)` / `GetPages()` | Page access | Main extraction loop | YES |
| `page.GetWords()` | Word extraction | Line 305, 840 | YES |
| `page.Width` / `page.Height` | Page dimensions | Area filtering | YES |
| `Word.Text` | Word text content | Throughout | YES |
| `Word.BoundingBox` (.Left/.Right/.Top/.Bottom/.Width/.Height) | Word position | Line grouping, column detection | YES |
| `Word.FontName` | Font identifier | Line 949, continuation detection | YES |
| `Word.Letters` | Individual characters | Font size, color extraction | YES |
| `Letter.PointSize` | Actual font size in points | Line 955 — primary font size source | YES (check) |
| `Letter.Color` (IColor) | Text color | Line 956, hex conversion | YES (check) |
| `IColor.ToRGBValues()` | Color space conversion | Line 1143 | YES (check) |
| **`page.ExperimentalAccess.Paths`** | **Vector paths on page** | **Line 463 — filled rectangle detection** | **YES (check)** |
| `PdfPath.FillColor` | Fill color of path | Line 473 | YES (check) |
| `PdfPath.GetBoundingRectangle()` | Path bounds | Line 476 | YES (check) |

### Controller (`WorkflowController.cs`)

| API | What It Does | Available in 0.1.13? |
|-----|-------------|---------------------|
| `PdfDocument.Open(filePath)` | Open PDF for page count validation | YES |
| `document.NumberOfPages` | Validate page selection config | YES |

### Spike Tool (`tools/PdfPigSpike/` — NOT production)

Uses `UglyToad.PdfPig.DocumentLayoutAnalysis` (RecursiveXYCut, DocstrumBoundingBoxes, etc.). This is a separate package and was only used for research. **Not integrated into production code.**

---

## What We Can Drop

### 1. ExperimentalAccess.Paths — Filled Rectangle / Area Detection

`DetectPageFilledRects()` (lines 459-517) uses `page.ExperimentalAccess.Paths` to auto-detect coloured rectangles in PDFs (blue header/footer boxes in Tailored Travels PDFs). This was the original area detection approach.

**Why we don't need it anymore:**
- Areas are now **manually defined by the user** via the PDF.js area picker in the browser
- The Web Container Overrides feature (Mar 2026) established the pattern: users draw areas, not algorithms
- Auto-detection was unreliable across different PDF styles — the manual approach is more robust
- This was the primary reason for choosing the fork (XYZ coordinate/path extensions)

**Impact of removing:**
- `DetectPageFilledRects()` method can be removed or made a no-op
- `AreaDetectionResult.TotalPathsFound` / `PathsAfterFiltering` diagnostics become unused
- The `ConvertColorToHex()` helper is still needed for `Letter.Color` (text color extraction)
- Any callers of area auto-detection need to be checked — they may already have fallbacks

### 2. DocumentLayoutAnalysis Package

Only used in `tools/PdfPigSpike/`. Not a production dependency. The spike tool's csproj can be updated separately or left as-is (it's not part of the package).

---

## Migration Steps

### Sprint 1: Swap Package + Compile — COMPLETE

**Goal:** Replace the package reference and get the solution compiling.

**Key discovery:** The official package was **renamed** from `UglyToad.PdfPig` to `PdfPig`. The `UglyToad.PdfPig.*` namespaces are preserved internally, so all `using` statements work unchanged.

**Changes made:**

1. `src/UpDoc/UpDoc.csproj` — `UglyToad.PdfPig 1.7.0-custom-5` → `PdfPig 0.1.13`
2. `tools/PdfPigSpike/PdfPigSpike.csproj` — same swap, removed separate `UglyToad.PdfPig.DocumentLayoutAnalysis` package (DLA is now bundled in the main `PdfPig` package)
3. `PdfPagePropertiesService.cs` — `page.ExperimentalAccess.Paths` → `page.Paths` (old API marked `[Obsolete]`)
4. `PdfPigSpike/Program.cs` — same `ExperimentalAccess` fix

**API surface verified (all exist in 0.1.13):**
- `Letter.PointSize` ✅
- `Letter.Color` ✅
- `IColor.ToRGBValues()` ✅
- `page.Paths` ✅ (replaces `page.ExperimentalAccess.Paths`)
- `PdfPath.FillColor` / `PdfPath.GetBoundingRectangle()` ✅

**Regression test:** Re-extracted `updoc-test-01.pdf` via Tailored Tour PDF workflow. Results identical: 58 elements, same font sizes (10.8, 31, 12, 14.4, 8.5), same colors (#FFD200, #FFFFFF, #16549D), same bounding boxes. Only difference: 3 new empty web-source metadata fields (`htmlTag`, `htmlContainerPath`, `cssClasses`) now serialized by the current model — pre-existing issue, not PdfPig-related (tracked: GitHub #7).

**Build:** `dotnet build UpDoc.sln` — 0 errors, 0 PdfPig warnings.

### Sprint 2: Area Auto-Detection Audit — COMPLETE (kept as fallback)

**Goal:** Determine if `DetectPageFilledRects()` should be removed or kept.

**Audit result:** `DetectPageFilledRects()` is a ~60-line fallback method that detects coloured rectangles using `page.Paths` (no longer `ExperimentalAccess.Paths` — fixed in Sprint 1). It's called from `DetectAreasFromDocument()` when no user-defined area template exists. The frontend always sends workflow-specific area templates, so this fallback is rarely hit in practice.

**Decision:** Keep it. The method uses non-obsolete API (`page.Paths`), is only ~60 lines, and provides a useful fallback for edge cases. No code changes needed.

### Sprint 3: Extraction Regression Testing

**Goal:** Verify all PDF extraction still works identically.

Test against the known test PDFs in the project:

1. **Test PDFs to use:**
   - `updoc-test-01.pdf`, `updoc-test-02.pdf`, `updoc-test-03.pdf` (E2E test PDFs)
   - Tailored Travels PDFs (Liverpool, Dresden, Suffolk, Bruges) if available in test site

2. **What to compare (before vs after):**
   - **Element count** — same number of extracted elements per page
   - **Text content** — identical text extraction (word-for-word)
   - **Font sizes** — same `Letter.PointSize` values (within tolerance)
   - **Font names** — same `Word.FontName` / `Letter.FontName` values
   - **Text colors** — same hex values from `Letter.Color`
   - **Bounding boxes** — same positions (Left/Top/Width/Height within tolerance)
   - **Line grouping** — same number of lines, same words per line

3. **How to compare:**
   - Extract rich elements from each PDF with the current fork → save as JSON baseline
   - Swap to official → extract again → compare JSON output
   - Script or manual diff — element-by-element comparison

4. **Transform regression:**
   - Run transform rules against extracted elements
   - Verify same sections produced with same content
   - Check font-size-based conditions still match (tolerance was already `<= 0.5`)

### Sprint 4: E2E Test Validation

**Goal:** Existing Playwright E2E tests pass.

1. Run all 4 existing E2E tests (visibility, blueprint picker, full flow, preview)
2. Run a full Create from Source flow with a PDF → verify document created correctly
3. Check block content populated correctly (the end-to-end pipeline)

### Sprint 5: Cleanup + Documentation

1. **Remove custom package from local NuGet cache** (optional, user's machine only):
   ```
   rm -rf ~/.nuget/packages/uglytoad.pdfpig/1.7.0-custom-5
   rm -rf ~/.nuget/packages/uglytoad.pdfpig.core/1.7.0-custom-5
   rm -rf ~/.nuget/packages/uglytoad.pdfpig.fonts/1.7.0-custom-5
   rm -rf ~/.nuget/packages/uglytoad.pdfpig.tokenization/1.7.0-custom-5
   rm -rf ~/.nuget/packages/uglytoad.pdfpig.tokens/1.7.0-custom-5
   ```

2. **Update planning docs:**
   - Mark PACKAGING_STRATEGY.md Step 6 as `[x]`
   - Update NEXT_SESSION_PROMPT.md to remove PdfPig from deferred items
   - Archive `planning/archive/PDFPIG_DLA_SPIKE_RESULTS.md` notes about custom version
   - Archive `planning/archive/RECURSIVE_XY_CUT_PLAN.md` references to custom version

3. **Update memory:**
   - Remove references to `1.7.0-custom-5` from MEMORY.md
   - Note official version in use

4. **Rebuild frontend** (if any TypeScript references to extraction metadata changed — unlikely but verify)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API names changed between fork and official | Medium | High (compile errors) | Sprint 1 catches all at compile time |
| `Letter.PointSize` doesn't exist in 0.1.13 | Low | Medium | Fall back to `BoundingBox.Height` (already have this as fallback, line 961) |
| `ExperimentalAccess.Paths` removed in official | Low | Low | We're removing this dependency anyway (Sprint 2) |
| Font size values differ slightly | Medium | Medium | Existing tolerance (`<= 0.5pt`) should absorb this |
| Text extraction produces different word boundaries | Low | High | Sprint 3 comparison catches this |
| `IColor.ToRGBValues()` API changed | Low | Low | Simple to adapt — just colour conversion |

---

## Key Files to Modify

| File | Change | Status |
|------|--------|--------|
| `src/UpDoc/UpDoc.csproj` | `UglyToad.PdfPig 1.7.0-custom-5` → `PdfPig 0.1.13` | ✅ Done |
| `src/UpDoc/Services/PdfPagePropertiesService.cs` | `ExperimentalAccess.Paths` → `page.Paths`; possibly remove `DetectPageFilledRects()` | ✅ Paths fixed; Sprint 2 for removal |
| `src/UpDoc/Models/AreaDetectionResult.cs` | Remove path diagnostics if area auto-detection removed | Sprint 2 |
| `src/UpDoc/Controllers/WorkflowController.cs` | `PdfDocument.Open` — no change needed | ✅ Verified |
| `tools/PdfPigSpike/PdfPigSpike.csproj` | `PdfPig 0.1.13`, removed separate DLA package | ✅ Done |
| `tools/PdfPigSpike/Program.cs` | `ExperimentalAccess.Paths` → `page.Paths` | ✅ Done |
| `planning/PACKAGING_STRATEGY.md` | Mark Step 6 complete | Sprint 5 |

---

## Decision: What About DocumentLayoutAnalysis?

The official PdfPig wiki documents DLA as part of the library (RecursiveXYCut, DocstrumBoundingBoxes, etc.). In the fork, it was a separate `UglyToad.PdfPig.DocumentLayoutAnalysis` package.

**For this migration:** DLA is only used in the spike tool, not production. We don't need to resolve this now. If DLA is needed in future, it's available in the official release per the wiki.

---

## Verification Checklist

- [x] `dotnet build UpDoc.sln` compiles clean with 0.1.13
- [x] No `1.7.0-custom-5` references remain in any `.csproj` file
- [x] PDF extraction produces same element count for test PDFs (58 elements)
- [x] Font sizes match within tolerance (0.5pt) — identical values
- [x] Text content matches word-for-word
- [x] Text colors match (hex values) — identical
- [ ] Transform rules produce same sections
- [ ] E2E tests pass (all 4)
- [x] `dotnet pack` produces clean NuGet package with official PdfPig dependency
- [x] v0.1.1-beta published to NuGet via Trusted Publishing
- [ ] Create from Source full flow works end-to-end
