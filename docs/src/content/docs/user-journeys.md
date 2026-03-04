---
title: "User Journeys"
---


Step-by-step paths through the UpDoc interface for creating documents from external sources.

---

## Journey 1: Create from Source via the Content Tree

The primary entry point — available from the "..." actions menu on any content node that has child types with configured workflows.

1. Navigate to the **Content** section in Umbraco backoffice
2. In the content tree (left panel), find the parent node where you want to create a child document (e.g., "Group Tours")
3. Click the **"..."** actions button on that node
4. Click **"Create Document from Source"**
5. The **blueprint picker dialog** appears:
    - If multiple document types are allowed, select the document type first
    - Then select a blueprint (only blueprints with configured workflows are shown)
6. The **source sidebar** slides open from the right:
    - Choose a **source type** from the dropdown (e.g., PDF, Markdown)
    - Select a source file using the media picker
    - The extracted content appears in the preview area
    - Edit the **document name** if needed
    - Review the extracted sections
7. Click **"Create"**
8. The document is created and you are navigated to the new document editor

**When is this available?** The "Create Document from Source" action only appears on nodes where at least one allowed child document type has a blueprint with a complete workflow (destination + map + at least one source type configured).

---

## Journey 2: Create from Source via the Collection View

A secondary entry point — available as a toolbar button when viewing a document collection (list view).

1. Navigate to a content node that uses a **list view** (e.g., click "Group Tours" to see the collection of tours)
2. In the collection toolbar, next to the existing "Create Group Tour" button, click **"Create from Source"**
3. The **blueprint picker dialog** appears (same as Journey 1, step 5)
4. The **source sidebar** slides open (same as Journey 1, step 6)
5. Click **"Create"**
6. The document is created and you are navigated to the new document editor

**When is this available?** The "Create from Source" button only appears on document collections where at least one allowed child document type has a blueprint with a complete workflow. If no workflows are configured, the button is hidden.

---

## Entry Point Comparison

| Feature | Content Tree (Journey 1) | Collection View (Journey 2) |
|---------|--------------------------|----------------------------|
| Location | "..." actions menu on tree nodes | Toolbar button in collection view |
| Visibility | Controlled by `HasAvailableWorkflows` condition | Self-hiding element checks workflows internally |
| Context | `UMB_ENTITY_CONTEXT` provides parent node | `UMB_DOCUMENT_WORKSPACE_CONTEXT` provides parent node |
| Flow after click | Identical | Identical |
| Result | New document created under parent | New document created under parent |

Both journeys lead to the same blueprint picker → source sidebar → document creation flow. The only difference is where the user starts.

---

## How Source Content is Extracted

When a source document is imported, UpDoc analyses its structure and organises the extracted content into a four-level hierarchy:

```
Page
└── Area
    └── Section
        └── Text
```

### Page

Each page of the source document is processed independently. Content is extracted page by page, preserving the original document order. For single-page sources (such as a web page), all content belongs to one page.

### Area

Within each page, UpDoc detects visually distinct areas that group content together. In a PDF, these are colored filled rectangles — background colors used to separate content into columns, sidebars, or feature panels. Each colored region becomes an area.

Content that falls outside any detected area is grouped as "undefined" content.

### Section

Within each area, UpDoc identifies sections by detecting headings. A section consists of a heading and all the content that follows it, up to the next heading or the end of the area.

Headings are identified by font size — text that is significantly larger than the surrounding body text is treated as a section heading.

Sections are the primary unit of mapping. When creating mappings from source to destination, the workflow author works with sections.

### Text

Within each section, individual text items are classified by their content pattern:

- **Headings** — The section's title text, identified by a larger font size relative to the body text within the section.
- **Lists** — Ordered items (1, 2, 3) or unordered items (bullet points). Identified by leading bullet characters or numeric patterns.
- **Paragraphs** — Free-form body text that does not match a heading or list pattern.

### Summary Counts

At each level of the hierarchy, UpDoc provides summary counts so the workflow author can quickly assess the structure of the extracted content:

| Level | Shows |
|-------|-------|
| Page | Number of areas detected |
| Area | Number of sections identified |
| Section | Number of text items within the section |

These counts help the workflow author identify whether the extraction has correctly understood the document's structure before proceeding to map content to destination fields.

---

## Known Behaviours

### Duplicate document names and the Recycle Bin

When creating a document, Umbraco checks for name conflicts among **live sibling documents** (documents under the same parent). If a document with the same name already exists and is live, Umbraco appends a number in brackets — e.g., "The Art and History of Dresden (1)".

However, **documents in the Recycle Bin are not considered name conflicts**. If a document called "The Art and History of Dresden" has been moved to the Recycle Bin and a new document with the same name is created under the same parent, the new document keeps the original name without any numbering suffix.

This means:

- Repeatedly creating and deleting documents from the same source will not cause name inflation ("(1)", "(2)", etc.) as long as previous copies are moved to the Recycle Bin before the next is created.
- If a previous document is still **live** under the same parent when a new one is created from the same source, the new document will receive a numbered suffix.
