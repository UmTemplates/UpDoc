---
title: "Creating Documents from Source"
---

This guide is for content editors. It explains how to create Umbraco documents from external sources using UpDoc, once a workflow has been set up by a developer or site administrator.

---

## Before you start

To create a document from source, the following must already be in place:

- At least one **workflow** configured for the document type you want to create
- A **document blueprint** for the target document type
- Your source document available — either uploaded as a PDF/markdown file in the media library, or as a URL for a web page

If you don't see the "Create from Source" option, it means no workflows have been configured for that document type yet. Ask your developer or site administrator to set one up.

---

## Option 1: From the content tree

This is the primary way to create a document from source.

1. Go to the **Content** section in the Umbraco backoffice
2. In the content tree on the left, find the parent node where you want to create a new child document (e.g., "Group Tours")
3. Click the **"..."** button on that node to open the actions menu
4. Click **"Create Document from Source"**

### Select a blueprint

A dialog appears listing the available blueprints:

- If there are multiple document types allowed under this parent, select the document type first
- Then select a blueprint — only blueprints with configured workflows are shown
- Click on the blueprint you want to use

### Choose your source

The source sidebar slides open from the right. Here you:

1. **Choose a source type** from the dropdown (e.g., PDF, Web, Markdown) — this determines which workflow is used
2. **Select your source document:**
   - For **PDF** or **Markdown**: click the media picker to browse the media library and select your file
   - For **Web**: enter the URL of the page you want to extract from
3. UpDoc extracts the content and shows a preview of what was found

### Review and create

1. Check the **document name** at the top — it's pre-filled from the extracted content but you can edit it
2. Review the extracted content in the preview area to make sure it looks right
3. Click **"Create"**

UpDoc creates the document, populates the fields and block grid content from the source, and navigates you to the new document editor where you can review and make any final adjustments before publishing.

---

## Option 2: From the collection view

If you're viewing a content collection (list view), there's a toolbar button for the same workflow.

1. Navigate to a content node that uses a list view (e.g., click "Group Tours" to see the list of tours)
2. In the collection toolbar, click the **"Create from Source"** button (next to the standard "Create" button)
3. The rest of the process is identical — select a blueprint, choose a source, review, and create

---

## After creation

The created document is a normal Umbraco document. You can:

- **Edit** any field — the extracted content is a starting point, not locked
- **Publish** when you're satisfied with the content
- **Delete** and re-create if the extraction didn't produce the result you expected

UpDoc doesn't maintain any link between the source document and the created page. Once created, the document is independent — editing the source PDF or web page won't affect the Umbraco document, and vice versa.

---

## Tips

- **Check the preview** before clicking Create. If the content looks wrong in the preview, it will be wrong in the document.
- **Document names** are generated from the extracted content (typically the main heading). Edit the name in the sidebar if the generated name isn't what you want.
- **Duplicate names**: if a document with the same name already exists under the same parent, Umbraco adds a number suffix (e.g., "My Tour (1)"). Documents in the Recycle Bin don't count as duplicates.
- **Multiple source types**: the same blueprint might support creation from different sources (PDF and web, for example). Choose the source type that matches what you have.
