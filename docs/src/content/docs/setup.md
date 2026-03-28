---
title: "Setting Up a Workflow"
---

Before editors can create documents from source, a workflow author needs to set up a workflow. This is a one-time process per source type and document blueprint combination.

A workflow connects three things:

1. **A source** — the type of document to extract from (PDF, web page, or markdown)
2. **A destination** — an Umbraco document blueprint that defines the target structure
3. **A mapping** — rules that connect extracted content to destination fields

This guide walks through the complete setup process.

---

## Prerequisites

Before creating a workflow, you need:

- **UpDoc installed** in your Umbraco 17+ project (`dotnet add package Umbraco.Community.UpDoc`)
- **A document type** for the content you want to create (e.g., "Group Tour", "Product Page")
- **A document blueprint** based on that document type, with block grid/block list content already structured as you want it
- **A sample source document** to test with (a PDF in the media library, or a URL for a web page)

### Why blueprints?

UpDoc creates documents from blueprints, not empty document types. Blueprints provide the block grid structure (which blocks exist, in what order) and default property values. Without a blueprint, UpDoc would need to create block instances from scratch — which blocks to add, in what order, with what settings — adding significant complexity.

If your document type uses a block grid, the blueprint should already contain the block instances you want populated. UpDoc fills in the content; the blueprint provides the structure.

---

## Step 1: Prepare your source

### For PDF sources

1. Go to the **Media** section in Umbraco
2. Upload your PDF to an appropriate folder
3. Note where it is — you'll select it via the media picker when testing

### For web page sources

1. Have the URL ready for the page you want to extract from
2. The page must be publicly accessible (UpDoc fetches it server-side)
3. If the page is behind authentication or blocks scraping, you can upload a saved HTML file to the media library as a fallback

### For markdown sources

1. Upload the markdown file to the **Media** section
2. Standard markdown syntax is supported (headings, lists, paragraphs, code blocks)

---

## Step 2: Create a document blueprint

If you don't already have a blueprint for your document type:

1. Go to **Settings > Document Blueprints**
2. Click **Create** and select your document type
3. Give it a meaningful name (e.g., "[Group Tour Blueprint]")
4. **Populate the block grid** with the block instances you want in every document of this type — for example, an "Itinerary" block, a "Features" block, an "Accommodation" block
5. Set any default property values that should be consistent across documents
6. **Save** the blueprint

The blueprint defines the destination structure. UpDoc will populate its fields and block properties with content extracted from the source.

---

## Step 3: Create a workflow

1. Go to **Settings** in the Umbraco backoffice
2. Find **UpDoc** in the settings tree
3. Click **Create Workflow**
4. Fill in the workflow details:
   - **Name** — a descriptive name (e.g., "Group Tour from PDF")
   - **Document Type** — the document type this workflow creates
   - **Blueprint** — the blueprint to use as the template
   - **Source Type** — PDF, Web, or Markdown
5. **Save** the workflow

This creates a workflow folder in `updoc/workflows/` with the configuration files that drive the extraction pipeline.

---

## Step 4: Set up transform rules

Transform rules tell UpDoc how to interpret the raw extracted content. Without rules, UpDoc extracts every text element but doesn't know which ones are headings, which are body text, and how they relate to each other.

### Open the rules editor

1. Open your workflow in the Settings section
2. Go to the **Source** tab
3. Run an extraction against your sample document to see the raw elements
4. Click **Edit Rules** to open the rules editor

### How rules work

Each rule matches elements in the extraction by their metadata and assigns them a role:

- **Conditions** define what to match — font size, colour, HTML tag, text content, container path
- **Role** gives the match a human-readable label (e.g., "Tour Title", "Day Heading", "Feature Description")
- **Part** defines the slot — "title" for headings, "content" for body text, "description" for summaries
- **Format** controls markdown output — paragraph, heading level, bullet list, etc.

### Example: PDF rules

For a travel brochure PDF, you might create rules like:

| Role | Part | Conditions | What it matches |
|------|------|-----------|----------------|
| Tour Title | title | Font size 36, colour #1A3C6E | The large blue title on page 1 |
| Day Heading | title | Font size 14, colour #333333, bold | "Day 1:", "Day 2:", etc. |
| Day Content | content | Font size 10, colour #333333 | Body text under each day heading |
| Feature Title | title | Font size 12, colour #FFFFFF | White text on coloured background panels |

### Example: Web page rules

For a web page, conditions use HTML structure instead of font metrics:

| Role | Part | Conditions | What it matches |
|------|------|-----------|----------------|
| Tour Title | title | HTML tag `h1`, container `.tour_name` | The main heading |
| Section Heading | title | HTML tag `h2`, container `.content-area` | Section headings |
| Section Content | content | HTML tag `p`, container `.content-area` | Body paragraphs |

### Grouping rules

Related rules can be grouped together. For example, a "Tour Detail" group might contain a "Title" rule (part: title) and a "Content" rule (part: content). When UpDoc processes the extraction, it creates sections where a title rule triggers a new section boundary and content rules fill the body.

### Testing rules

After creating rules, re-run the extraction to see the **Transformed** view. This shows the content organised into sections based on your rules. Check that:

- Headings are correctly identified
- Content is grouped under the right headings
- No content is missing or misassigned

Iterate on the rules until the transformed output matches your expectations.

---

## Step 5: Generate the destination structure

The destination structure tells UpDoc what fields and blocks are available in the blueprint.

1. Open your workflow
2. Go to the **Destination** tab
3. Click **Regenerate Destination**

UpDoc reads the blueprint and builds a `destination.json` that lists:

- **Simple fields** — text, textarea, rich text properties on the document type
- **Block grid blocks** — each block instance in the blueprint, with its properties
- **Block list items** — each block list item, with its properties

Only text-mappable properties that are populated in the blueprint are included. Properties in a "Page Settings" tab are excluded.

---

## Step 6: Create mappings

Mappings connect transformed source sections to destination fields. There are three ways to create them:

### From the Source tab (source-to-destination)

1. On the **Source** tab, find the transformed section you want to map
2. Tick the checkbox(es) for the content you want
3. Click **"Map to..."**
4. The destination picker opens — select the target field or block property
5. The mapping is created

### From the Destination tab (destination-to-source)

1. On the **Destination** tab, click on a field you want to populate
2. A source picker shows the available transformed sections
3. Select the source content
4. The mapping is created

### From the Map tab (direct editing)

1. The **Map** tab shows all existing mappings
2. You can edit, delete, or reorder mappings here
3. This is the single source of truth — all mappings created from either direction appear here

### Testing the full pipeline

Once you have rules and mappings in place:

1. Go to the **Content** section
2. Navigate to the parent node where documents of this type live
3. Right-click and choose **"Create from Source"** (or use the collection toolbar button)
4. Select the blueprint, choose a source document
5. Verify the created document has the correct content in the correct fields

---

## Multiple workflows

You can create multiple workflows for the same document type:

- **"Group Tour from PDF"** — extracts from PDF brochures
- **"Group Tour from Web"** — extracts from legacy web pages

Each workflow has its own rules and mappings tailored to that source format. The same blueprint and destination structure can be shared — only the source configuration and rules differ.

When an editor creates a document, they choose the source type, and UpDoc uses the matching workflow.

---

## Workflow files

For reference, each workflow creates a folder under `updoc/workflows/` with this structure:

```
updoc/workflows/groupTourPdf/
├── workflow.json          # Identity (name, alias, document type, source type)
├── source/
│   └── source.json        # Transform rules and extraction configuration
├── destination/
│   └── destination.json   # Blueprint field structure (auto-generated)
└── map/
    └── map.json            # Source-to-destination mappings
```

These are plain JSON files — human-readable, git-trackable, and compatible with uSync and Umbraco Deploy for deployment across environments.
