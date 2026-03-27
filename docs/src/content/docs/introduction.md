---
title: "Introduction"
---

UpDoc is an Umbraco package that lets editors create content documents by extracting content from external sources — PDFs, web pages, and markdown files — instead of manually copying and pasting.

## The problem

Organisations often have content that already exists in another format: travel brochure PDFs, legacy website pages, specification documents, marketing collateral. Getting that content into Umbraco means opening the source, copying text field by field, formatting it, and pasting it into the right properties. It's slow, repetitive, and error-prone.

## What UpDoc does

UpDoc adds a **"Create from Source"** option to Umbraco's content section. An editor selects a source document, and UpDoc extracts the content, maps it to the correct fields in a document blueprint, and creates a new Umbraco document — populated and ready to publish.

The extraction is driven by **workflows** — configurable pipelines that define:

- **Where content comes from** (the source — a PDF in the media library, a URL, or a markdown file)
- **How to interpret it** (transform rules that identify headings, body text, lists, and group them into meaningful sections)
- **Where it goes** (the destination — which blueprint fields and block grid properties receive which content)

## Who is it for?

UpDoc has two audiences:

### Content editors

Editors use UpDoc through the familiar Umbraco content section. They right-click a content node (or use the collection toolbar button), choose "Create from Source", select a source document, and get a new page. No technical knowledge needed — the workflows are already configured for them.

### Workflow authors

Workflow authors (typically developers or site administrators) set up the extraction workflows in the Umbraco Settings section. They define the transform rules that tell UpDoc how to interpret each source format, and map extracted sections to destination fields. This is a one-time setup per document type — once configured, editors can create as many documents as they need.

## Supported source types

| Source type | How it works |
|-------------|-------------|
| **PDF** | Upload a PDF to the Umbraco media library. UpDoc extracts text with full metadata (font size, colour, position) for precise rule matching. |
| **Web page** | Provide a URL. UpDoc fetches the page and extracts content using the HTML structure (tags, CSS classes, containers) for rule matching. |
| **Markdown** | Upload a markdown file to the media library. UpDoc parses the heading structure for straightforward section identification. |

## How it's installed

UpDoc is a Razor Class Library (RCL) distributed as a NuGet package. Install it into any Umbraco 17+ project:

```bash
dotnet add package Umbraco.Community.UpDoc
```

No database tables, no configuration files to create manually. UpDoc stores its workflow configuration as JSON files in the `updoc/workflows/` directory — human-readable, git-trackable, and compatible with deployment tools like uSync and Umbraco Deploy.

## Key concepts

| Concept | What it means |
|---------|--------------|
| **Workflow** | A complete pipeline connecting a source type to a destination blueprint. One workflow per source type per blueprint. |
| **Source** | The external document to extract content from (PDF, web page, or markdown file). |
| **Destination** | The Umbraco document blueprint that defines the target structure — fields, block grids, and block lists. |
| **Transform rules** | Rules that identify and classify extracted content (e.g., "text in 36pt blue Helvetica is a tour title"). |
| **Mapping** | The wiring between a transformed source section and a destination field or block property. |
| **Extraction** | The raw output from parsing a source document — every text element with its metadata. |
| **Transform** | The shaped output after applying rules — meaningful sections with headings, content, and descriptions. |
