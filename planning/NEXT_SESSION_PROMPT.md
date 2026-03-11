# Next Session Prompt

Copy/paste this into Claude Code to continue where we left off.

---

## Where We Are

On `feature/pdfpig-official-release` branch. Sprint 1 (package swap) is complete and committed. Full plan is in `planning/PDFPIG_MIGRATION_TO_OFFICIAL.md`.

### What I'd Like to Work On

**Continue PdfPig migration — Sprints 2-5.**

Sprint 1 (DONE): Swapped `UglyToad.PdfPig 1.7.0-custom-5` (fork) → official `PdfPig 0.1.13`. Package was renamed but namespaces preserved. Zero compile errors. Extraction output identical (58 elements, same font sizes/colors). Only code change: `page.ExperimentalAccess.Paths` → `page.Paths` (old API obsoleted).

**Remaining sprints:**
2. Remove area auto-detection dependency (`DetectPageFilledRects` uses `page.Paths` for filled rectangle detection — audit callers, possibly remove)
3. Extraction regression testing (element-by-element comparison against additional test PDFs)
4. E2E test validation (Playwright tests + full Create from Source flow)
5. Cleanup + documentation updates (mark PACKAGING_STRATEGY Step 6 complete, archive notes, update memory)

### Background Context

- PACKAGING_STRATEGY.md Step 6 ("Resolve PdfPig Custom Build") — now marked IN PROGRESS
- Key discovery: official package renamed from `UglyToad.PdfPig` to `PdfPig`, but `UglyToad.PdfPig.*` namespaces preserved
- DLA (DocumentLayoutAnalysis) is now bundled in the main `PdfPig` package — no separate package needed
- GitHub #7 tracks a separate issue: empty web-source metadata fields serialized in PDF extraction JSON

### Other Pending Items (not this session)

- **Step 14**: Verify NOT on Umbraco Marketplace
- **Marketplace Category** (Phase B) — "Content Management" or "Import & Export"
- **MimeKit Pinning** — keep, remove, or conditional
- **Bugs**: GetConfigForBlueprint merge bug, markdown heading prefix, ValidateConfig warnings, workspace header re-render
