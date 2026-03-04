# UpDoc — TODO / Issues

Tracked items for future work. Move to GitHub Issues when `gh` CLI is set up.

---

## Backlog

### Dynamic Synchronisation sidebar group detection
**Priority:** Low | **Type:** Enhancement

Currently hardcodes `usync.menu` alias to join uSync's "Synchronisation" sidebar group. Should instead dynamically discover any existing "Synchronisation" group by label, making it package-agnostic.

**Detail:** [planning/DYNAMIC_SIDEBAR_GROUP.md](DYNAMIC_SIDEBAR_GROUP.md)

---

### Install GitHub CLI for issue management
**Priority:** Low | **Type:** Tooling

Install `gh` CLI (`winget install GitHub.cli`) and authenticate (`gh auth login`) to enable creating/managing GitHub Issues directly from Claude Code.

---

### Node name uses page description instead of page title
**Priority:** Medium | **Type:** Bug

When creating a document via "Create from Source", the node name is set from the page description field rather than the page title. Observed during area editor testing with Liverpool PDF.

---

### Bullet list Markdown-to-HTML formatting
**Priority:** Medium | **Type:** Bug

Bullet list conversion from extracted content to Markdown to HTML appears incorrect in created documents. Observed during area editor testing.

---

### Playwright test cleanup
**Priority:** Low | **Type:** Tech Debt

Add `afterEach` cleanup to Playwright E2E tests to delete documents created during test runs. Currently each full-flow run leaves behind a document.

---

### CS8602 nullable warning in PdfPagePropertiesService
**Priority:** Low | **Type:** Tech Debt

`PdfPagePropertiesService.cs:1166` — `section.StrategyParams.Pattern` nullable dereference. Compiler doesn't carry null-check from line 1163 through to 1166. Add `!` or explicit null check.

---

## Workflow Creation UX Improvements

> Identified Feb 2026 while testing the Tailored Tour Pdf workflow. These are about the experience immediately after creating a new workflow.

### Separate Extract button from Save
**Priority:** High | **Type:** UX

After creating a workflow, the user arrives at an empty Source tab. Extraction only runs when Save is clicked, which is confusing — "Save" implies persisting data, not running a compute-heavy extraction process.

**Proposed flow:**
1. Create workflow → arrive at Source tab → see the selected PDF + page selection + an **Extract** button
2. Click **Extract** → processing runs → stats, areas, sections populate
3. Configure area rules, toggle sections, etc.
4. Click **Save** → persists configuration changes to JSON files

**Benefits:**
- Clear separation of intents: Extract = "process this PDF", Save = "persist my config"
- Enables re-extraction after changing rules/settings without ambiguity
- Extract button could sit in the stat bar area (near Source card), Save stays in footer
- Could disable Save until extraction has run at least once

---

### Page selection not persisted from creation phase
**Priority:** High | **Type:** Bug

Two related issues:

1. **Page selection not passed to extraction.** During workflow creation, the user selects specific pages (e.g., pages 1-2 of a 4-page PDF). However, the extraction processes ALL pages regardless. The page selection from the creation sidebar isn't being persisted to `source.json` or passed to the extraction pipeline.

2. **Pages stat shows total, not selected.** The Pages stat card shows the total number of pages in the PDF (e.g., "4"), not the pages the user selected. Should reflect the selection — e.g., "2 of 4" or "2" with tooltip showing total.

**Root cause investigation needed:**
- Does the creation sidebar persist page selection to `source.json`?
- Does the extraction API accept/honour a pages parameter?
- Does the "Choose Pages" button on the workspace update the stored selection?

**Related:** This ties into the Extract/Save separation — page selection would be visible on arrival, adjustable via "Choose Pages", then processed when Extract is clicked.

---

### Destination picker: tabs on same row as title
**Priority:** High | **Type:** Bug (UI)

In the destination picker sidebar (opened from Transformed tab "Map" button), the "Page Properties" / "Page Content" tabs render on the same row as the "Pick destination fiel..." title instead of on a new row below. This is a CSS layout issue — the tabs need their own row. Previously fixed in other sidebars with negative margins or layout restructuring.

Also affects the Create from Source sidebar when it has multiple tabs.

---

### Destination picker: missing Tour Properties tab
**Priority:** High | **Type:** Bug

The destination picker only shows Page Properties and Page Content tabs — Tour Properties tab is missing. Root cause: `DestinationStructureService` builds destination.json from **populated** blueprint fields only. Tour Properties fields (organiserName, organiserTelephone, organiserEmail, organiserAddress, organiserOrganisation) are empty in the blueprint because they're meant to be filled from the source.

**Fix options:**
1. **Workaround:** Populate blueprint Tour Properties fields with placeholder text, regenerate destination
2. **Proper fix:** Change `DestinationStructureService` to include all text-mappable property fields from the document type (not just populated ones). The "populated only" rule should apply to block grid content (only show placed blocks) but not to simple property fields — those should all be available as mapping targets.

---

### Transformed tab redesign
**Priority:** Medium | **Type:** UX

The Transformed tab is a POC and needs redesign to match the Extracted tab quality:
- Preserve area grouping (Page Header, Organiser Information, Tour Details)
- Section cards matching Extracted tab style (bold section name, content below, metadata badges)
- Single Map action per section (remove duplicated "Content: Map" + header "Map")
- Mapping status shown inline ("unmapped" / "mapped to X" labels)
- Pattern badges (Bullet List, Paragraph, Sub-Headed)

---

### Consider removing "Define Structure" button
**Priority:** Low | **Type:** UX Simplification

The "Define Structure" per-area button duplicates functionality that the "Edit Sections" / "Edit Rules" interface already provides. With the Section Builder actions (setAsHeading, createSection, addAsContent, etc.), heading detection rules are part of the rules editor. Having a separate "Define Structure" button adds visual clutter without adding capability. Consider removing it and folding all configuration into the rules editor.

Related: area/section toggle buttons could also be replaced by exclude rules, reducing per-area UI chrome. Revisit after Section Builder Phase 3 when actions are wired up.

---

### Consider forcing explicit action selection in rules editor
**Priority:** Low | **Type:** UX

Currently the action dropdown defaults to "Create section". Once other actions (setAsHeading, addAsContent, etc.) are functional, a default could lead to accidental wrong choices. Consider requiring explicit selection (no default / empty first item) to prevent errors. The right default may depend on area type (flat areas → createSection, heading-delimited → setAsHeading).

---

### Unify web area picker with PDF area editor
**Priority:** High | **Type:** UX

The web workflow's "Define Areas" modal (checkbox-based area picker) should match the PDF workflow's area editor UX:

1. **Area renaming** — Web areas currently use raw CSS selector names (e.g., "Main Content", "Right Column Button Wrapper"). Need an Edit Area panel with Name field, same as PDF's click-to-select → Edit Area → Name input.
2. **Area colours** — PDF areas have colour swatches. Web areas have auto-assigned colour dots but no picker.
3. **Delete via trash icon** — PDF areas have a trash icon per area for quick removal. Web areas use checkboxes to include/exclude. Align on the trash icon pattern.
4. **Remove checkboxes** — With trash icons for removal, the include/exclude checkboxes become redundant. The presence of an area in the list = included.

**Reference:** PDF area editor is in `pdf-area-editor-modal.element.ts`. Web area picker is in `area-picker-modal.element.ts`. The PDF editor's Select mode + Edit Area panel (Name, Color) is the target UX for both.
