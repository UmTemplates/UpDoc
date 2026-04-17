# User Flow: Creating a PDF Workflow

**Status:** Draft — captured from conversation walkthrough, needs user review before becoming real docs.
**Purpose:** Faux-workflow document describing the "Create a Workflow" flow end-to-end. Dual-purpose:
1. Source for the real docs page (`docs/src/content/docs/creating-a-workflow.md`)
2. Script for a Playwright spec that captures screenshots at the 📸 markers

**Scope:** Covers workflow creation only — from opening UpDoc to the moment the workflow workspace appears with extracted content. Mapping, regenerating destinations, and downstream configuration are **separate docs pages**.

---

## Prerequisites

Before creating a workflow, the user needs:

- **A document type** for the content they want to create (e.g. "Tailored Tour")
- **A blueprint** for that document type, with the block grid structure already arranged as desired
- **A sample source document** in the media library — in this example, a PDF

See the **Setting Up a Workflow** docs page for full prerequisites.

---

## Step 1 — Navigate to UpDoc

The user is logged into the Umbraco backoffice. They click the **Settings** section in the top nav, then click **UpDoc** in the Settings tree.

UpDoc lives in the **Synchronisation** group of the Settings tree, between **uSync** and **Publisher**.

📸 `01-settings-tree-updoc.png` — Settings tree with UpDoc highlighted in the Synchronisation group.

---

## Step 2 — Open the Workflows dashboard

When UpDoc is selected, the main panel shows the UpDoc dashboard. Three tabs are visible in the top-right: **Workflows** (active by default), **Configuration**, and **About**.

The Workflows tab shows any existing workflows in a table with columns:

- **Workflow** — the display name
- **Alias** — the machine-readable identifier
- **Document Type** — the target document type
- **Blueprint** — the blueprint the workflow uses
- **Source** — PDF, Web, Markdown, etc.
- **Mappings** — how many source-to-destination mappings are configured
- **Status** — Ready / Incomplete / etc.

A green **Create Workflow** button sits above the table on the right.

📸 `02-workflows-list.png` — Workflows dashboard showing existing workflows and the Create Workflow button.

---

## Step 3 — Click Create Workflow

The user clicks the **Create Workflow** button. A centred dialog appears titled **"Choose a Document Type"**, listing the document types that have at least one blueprint available.

📸 `03-choose-document-type.png` — The "Choose a Document Type" dialog.

---

## Step 4 — Choose a document type

The user clicks the document type they want to create workflows for. In this example, **Tailored Tour** (Tailored Tours are the document type that uses PDFs in this project).

The dialog then shows **"Select a Document Blueprint"** with the blueprints available for the chosen document type. If there's only one blueprint it's the only option; if there are several, all are listed.

**Navigation in the dialog:**

- **Back** returns to the document type picker
- **Cancel** closes the flow entirely

📸 `04-select-blueprint.png` — The blueprint picker with Tailored Tour Blueprint listed.

---

## Step 5 — Choose a blueprint

The user clicks the blueprint they want the workflow to target. In this example, **[Tailored Tour Blueprint]**.

The dialog closes. A **Create Workflow** sidebar slides in, with two tabs in the top-right: **Source** (active) and **Destination**.

### The Destination tab

The Destination tab is already populated based on the choices from the picker dialogs:

- **Document Type**: the one chosen in Step 4
- **Blueprint**: the one chosen in Step 5

No action needed here — it's informational. The destination is pre-filled.

📸 `05-destination-tab.png` — Create Workflow sidebar, Destination tab showing the pre-filled choices.

### The Source tab

The Source tab needs user input. At this point it shows:

- **Workflow Name** input (placeholder: "Enter alias...")
- **Format** dropdown (placeholder: "Choose a format...")

📸 `06-source-tab-empty.png` — Source tab before the user fills anything in.

---

## Step 6 — Enter a workflow name and choose a format

The user types a name into the **Workflow Name** field. The alias (kebab-case-ish form of the name) appears greyed-out to the right as the user types — this is auto-derived.

Example: typing **"Test PDF Workflow"** produces the alias **`testPdfWorkflow`**.

The user then clicks the **Format** dropdown. Four options appear:

- PDF Document
- Markdown
- Web Page
- Word Document

The user selects **PDF Document**.

📸 `07-format-dropdown-open.png` — Format dropdown showing all four options.

---

## Step 7 — Choose a sample document

As soon as a format is selected, a new **Sample Document** section appears below the Format dropdown. It contains a dashed drop area with a **+ Choose** button in the middle.

The sample document acts as the **template** for the workflow. All future PDFs run through this workflow should follow roughly the same format as the sample.

📸 `08-sample-document-empty.png` — Sample Document section with the empty chooser.

The user clicks **+ Choose**. A **Choose media** dialog opens showing the media library, filtered to PDFs by default.

The user browses their media library to find the sample PDF they want to use. How deep the folder structure goes is project-specific — UpDoc doesn't care how media is organised. In this example the user navigates into the **Wensum** folder and selects the PDF inside.

📸 `09-choose-media-pdf-selected.png` — Media picker at the point the user has reached the PDF they want to select.

---

## Step 8 — Review the sample document

Once a PDF is selected, the Sample Document section updates to show:

- **Thumbnail preview** of the PDF cover
- **File name** (e.g. `TTM5063 Wensum Flemish Bruges Antwerp Ghent lo.pdf`)
- **Metadata**: total pages and total elements extracted (e.g. "4 pages · 611 elements")

A new **Pages** section also appears below Sample Document, with all pages included by default ("All 4 pages" and a **Choose Pages** button).

📸 `10-sample-document-populated.png` — Sample Document showing the preview, filename, and metadata, with the Pages section revealed.

---

## Step 9 — Choose which pages to include (optional)

By default UpDoc extracts from every page of the sample PDF. If the user wants to narrow this — for example, to skip booking-terms pages — they click **Choose Pages**.

A **Select pages to include** dialog opens showing every page as a thumbnail with a checkbox. By default all pages are checked; a **Deselect all** button sits at the top.

📸 `11-select-pages-dialog.png` — Page selection dialog showing all 4 pages.

The user deselects any pages they don't want. In this example, the user keeps **Page 1 only** (the cover/itinerary page) because pages 2-4 contain features, maps, and booking conditions that shouldn't drive extraction rules.

After confirming the selection, the dialog closes and the sidebar updates. The **Pages** section now shows **"1 of 4 pages"** instead of "All 4 pages".

📸 `12-sidebar-pages-updated.png` — Sidebar showing the updated "1 of 4 pages" status.

---

## Step 10 — Click Create

At the bottom of the sidebar, the user clicks the **Create** button.

UpDoc:

1. Creates the workflow folder on disk (`updoc/workflows/testPdfWorkflow/`)
2. Runs the sample PDF through extraction
3. Writes `source.json`, `destination.json`, and `sample-extraction.json` into the folder
4. Closes the sidebar
5. Returns to the Workflows list

The new workflow appears in the table. Its **Mappings** count is **0** (no mappings configured yet) but its **Status** is **Ready** (the configuration is valid — it just won't do anything useful until mappings are added).

📸 `13-workflow-list-with-new.png` — Workflows table now showing Test PDF Workflow alongside existing workflows.

---

## Step 11 — Open the workflow

The user clicks the new **Test PDF Workflow** row to open its workspace.

The workspace shows three tabs at the top matching the blueprint's structure (in this example: **Page Properties**, **Page Content**, **Tour Organiser**).

Above the tab content, three cards summarise the workflow:

- **Document Type** — Tailored Tour (with a **Change** button)
- **Blueprint** — [Tailored Tour Blueprint] (with a **Change** button)
- **Fields** — summary of the extracted destination structure (with a **Regenerate** button)

Below the cards, the **Block Grid** view shows every block from the blueprint with its properties listed underneath — property aliases, types, accepted formats.

📸 `14-workflow-workspace.png` — Workflow workspace showing the tabs, cards, and block grid breakdown.

---

## Where the user goes from here

At this point the workflow is created and the destination structure is visible, but **no source-to-destination mappings exist**. The user now needs to:

- Review what was extracted from the sample PDF (**Source** tab of the workspace)
- Create mappings between source content and destination fields (**Destination** tab, **Source** tab, or **Map** tab)
- Test the workflow by creating a content document using it

These steps are covered in the **Mapping a Workflow** docs page (to be written).

---

## Notes for the real docs page

When this becomes `docs/src/content/docs/creating-a-workflow.md`:

- Keep the step structure. Every step is a distinct screenshot moment.
- Drop the file names for screenshots (just use the image directly)
- Compress the "what happens behind the scenes" for Step 10 into one sentence — the real docs user doesn't need the folder layout, they need to know it worked
- Add a "Before you start" section up top referencing the Setup docs page
- Add a "What's next" section at the bottom linking to the Mapping docs page (even if that page doesn't exist yet — write the link, mark the target as planned)

---

## Notes for the Playwright spec

When this drives `tests/docs-screenshots/creating-a-workflow.screenshots.ts`:

- One spec, 14 screenshots, in order
- Use `test.use({ viewport: { width: 1440, height: 900 } })`
- Workflow name needs to be unique per run — suggest `Test PDF Workflow ${Date.now()}` to avoid clashes
- After screenshots are captured, the spec can optionally tear down (delete the workflow folder) — or leave it, since the test site is throwaway
- Key selectors to figure out:
  - Settings tree — `Synchronisation` group expand, `UpDoc` item
  - Create Workflow button (green, top-right)
  - The two-step document type → blueprint picker dialog
  - The Source / Destination tab switcher in the sidebar
  - Workflow Name input, Format select
  - + Choose (media picker trigger)
  - Media picker folder navigation (Wensum folder)
  - Media picker file selection (specific PDF)
  - Choose Pages button, Select pages dialog
  - Create button at the sidebar bottom
  - New row in the Workflows table

---

## Resolved decisions (from review)

1. **Destination tab screenshot** — capture it early, before Source is filled in. Pre-populated from the picker dialog choices, clean state is fine.
2. **PDF preview screenshot** — not needed. The thumbnail in the sample-document section is enough.
3. **Media picker navigation** — skip the folder drill-down. Single screenshot at the point the PDF is visible and about to be selected.
4. **Workflow name strategy** — use a fixed name (`Docs Screenshot Test PDF Workflow`) and delete-if-exists at spec start. Cleaner than timestamping; keeps screenshot captions stable.
