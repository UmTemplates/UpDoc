# Next Session Prompt

Copy/paste this into Claude Code to continue where we left off.

---

## Where We Are

On `develop` branch. PdfPig migration Sprints 1-2 complete, merged to main, `0.1.1-beta` published to NuGet. Full plan is in `planning/PDFPIG_MIGRATION_TO_OFFICIAL.md`.

### What I'd Like to Work On

**Finish PdfPig migration — Sprints 3-5 (testing + cleanup).**

Sprint 1 (DONE): Swapped `UglyToad.PdfPig 1.7.0-custom-5` (fork) → official `PdfPig 0.1.13`. Package renamed but namespaces preserved. Zero compile errors. Extraction output identical.

Sprint 2 (DONE): Audited area auto-detection. `DetectPageFilledRects()` is a harmless ~60-line fallback using non-obsolete `page.Paths`. Kept as-is.

**Remaining sprints:**
3. Extraction regression testing — transform rules produce same sections, verify across additional test PDFs
4. E2E test validation — run all 4 Playwright tests, full Create from Source flow end-to-end
5. Cleanup — close GitHub issue #3 (PdfPig migration), update memory, archive references to old fork

### Background Context

- PACKAGING_STRATEGY.md Step 6 ("Resolve PdfPig Custom Build") — now marked COMPLETE
- `0.1.1-beta` published to NuGet via Trusted Publishing (auto GitHub Release added to workflow for future tags)
- GitHub #7 tracks empty web-source metadata fields serialized in PDF extraction JSON (pre-existing, not PdfPig-related)

### Other Pending Items (not this session)

- **Step 14**: Verify NOT on Umbraco Marketplace
- **Marketplace Category** (Phase B) — "Content Management" or "Import & Export"
- **MimeKit Pinning** — keep, remove, or conditional
- **Bugs**: #5 ContentTransformService duplicate key exception, #4 Rules Editor empty groups not persisting
- **Bugs**: GetConfigForBlueprint merge bug, markdown heading prefix, ValidateConfig warnings, workspace header re-render
