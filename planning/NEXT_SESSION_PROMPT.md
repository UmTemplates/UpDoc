# Next Session Prompt

Copy/paste this into Claude Code to continue where we left off.

---

## Where We Are

On `develop` branch, clean. Phase A of PACKAGING_STRATEGY.md is nearly complete — first beta published and tested.

### What I'd Like to Work On

**Migrate PdfPig from custom fork to official release.** Full plan is in `planning/PDFPIG_MIGRATION_TO_OFFICIAL.md` — read it first.

Summary: Replace `UglyToad.PdfPig 1.7.0-custom-5` (third-party fork by "grinay") with official `UglyToad.PdfPig 0.1.13`. The fork was originally chosen for XYZ coordinate/path extensions used in area auto-detection, but areas are now manually defined by users via PDF.js — we no longer need the fork-specific features.

**5 sprints in the plan:**
1. Swap package + compile (fix any API differences)
2. Remove area auto-detection dependency (`ExperimentalAccess.Paths`)
3. Extraction regression testing (element-by-element comparison against test PDFs)
4. E2E test validation (Playwright tests + full Create from Source flow)
5. Cleanup + documentation updates

Create a feature branch `feature/pdfpig-official-release` from `develop` and start with Sprint 1.

### Background Context

- PACKAGING_STRATEGY.md Step 6 ("Resolve PdfPig Custom Build") is the parent task — currently marked `[~]` (deferred)
- The PdfPig wiki is comprehensive: https://github.com/UglyToad/PdfPig/wiki
- DLA docs: https://github.com/UglyToad/PdfPig/wiki/Document-Layout-Analysis
- Main extraction engine: `src/UpDoc/Services/PdfPagePropertiesService.cs` (~2,000 lines)
- Key APIs: `PdfDocument.Open`, `page.GetWords()`, `Word.BoundingBox`, `Letter.PointSize`, `Letter.Color`, `IColor.ToRGBValues()`
- Area auto-detection (`page.ExperimentalAccess.Paths`) in `DetectPageFilledRects()` — this is the fork-dependent code to remove

### Other Pending Items (not this session)

- **Step 14**: Verify NOT on Umbraco Marketplace
- **Marketplace Category** (Phase B) — "Content Management" or "Import & Export"
- **MimeKit Pinning** — keep, remove, or conditional
- **Bugs**: GetConfigForBlueprint merge bug, markdown heading prefix, ValidateConfig warnings, workspace header re-render
