---
title: "Why UpDoc Needed an API"
description: "The step that needed a browser, and why the fix was an endpoint rather than a cleverer tool."
---

UpDoc's MCP server exists because of one step in an import that could not be automated.

Everything else already could. A Tailored Travel import runs sixteen steps, and fifteen of them go through Umbraco's Management API: find the PDF, upload it, read the created page back, fix the content, check the links, publish.

The sixteenth step was creating the document, and it needed a browser.

## What the browser step involved

An agent driving Playwright had to:

1. Navigate the content tree to the parent node
2. Click "Create from Source"
3. Choose a document type
4. Choose a blueprint
5. Type a name
6. Open the media picker
7. Search for the PDF
8. Select it
9. Wait for extraction
10. Click Create
11. Read the new document's id out of the URL

Eleven interactions to pass what turns out to be five values.

## Why it was worse than it looks

Every dialog in that sequence is shadow DOM.

`page.evaluate` with `innerText` returns nothing. A recursive shadow-root walk returns nothing. `getByText` cannot see in. Waiting for a button that is plainly visible on screen times out.

So the automation took a screenshot, read the PNG, and clicked by coordinate.

That needed a scale factor. Screenshots come back at a different width from the CSS viewport, 2000 against 2529, a factor of 1.2645. Click at raw screenshot coordinates and nothing happens at all: no error, no exception, the dialog simply sits there.

This is not a criticism of the backoffice. It is a reasonable UI. It is just not an interface, and driving it as though it were is a losing game.

## The wrong answer, tried first

The obvious move is an MCP tool that does what the clicks do.

Extract the PDF. Scaffold from the blueprint. Apply the workflow's mappings. Create the document. Save it.

All of those are HTTP calls, and an MCP server is a Node process, so it could make them. This is also what [the planning document recommended](/UpDoc/mcp/routes-considered/), as Route B.

Work started down that road before the problem became clear.

**The tool would have been doing the work, not triggering it.**

Umbraco's own MCP server never does that. `update-block-property` calls one endpoint, and the endpoint decides what that means. The tool is a thin skin over an operation that already exists.

A tool that orchestrates five calls and applies mapping logic is a different shape entirely. It puts business logic in the MCP layer, where a second consumer cannot reach it and a second implementation will eventually appear.

## The right answer

UpDoc needed an endpoint.

```
POST /umbraco/management/api/v1/updoc/create-from-source

{
  "parentId":       "dd9b7287-...",
  "documentTypeId": "993a81c0-...",
  "blueprintId":    "2e79e2f0-...",
  "sourceType":     "pdf",
  "mediaId":        "d155485a-...",
  "documentName":   "TTM5063"
}
```

Returning:

```json
{
  "success": true,
  "documentId": "3e6b79de-6eac-42fe-987a-083aeba3947c",
  "workflowAlias": "tailoredTourPdf",
  "mappedValueCount": 19,
  "published": false
}
```

The MCP tool is then a name, a description, a schema and one call.

This is the same relationship Umbraco's server has with the Management API. UpDoc was missing the API half.

## What the eleven steps were actually doing

Worth being precise about what the endpoint replaced, because it is less than it appears.

Choosing a document type, picking a blueprint, finding the PDF, typing a name: none of these steps *do* anything. They are the UI collecting five values. Only the final click does any work.

So the endpoint takes those five values and does the work. Playwright had to sit through the whole dialog because it was navigating a screen. An agent skips it because it is not navigating anything.

## Why the endpoint did not already exist

Because the logic lived in the browser.

Scaffolding, mapping, block matching, markdown conversion, type coercion: all of it was TypeScript running in the backoffice. Around 322 lines of it.

Worse, it lived there **twice**. UpDoc has two entry points, a button on the collection view and an item in the tree's actions menu, and each carried its own copy. See [Two Implementations](/UpDoc/mcp/two-implementations/).

They had already drifted. One passed the document type name to the modal and the other did not, so the Destination tab showed an empty box depending on which route you took. Nobody had noticed, because who checks a read-only tab twice.

That is the real lesson, and it has nothing to do with MCP.

**If a feature only exists in your UI, it does not exist.**

Not to a scheduled job. Not to a deployment step. Not to another site. Not to an agent. Only to a person with a mouse.

## Further reading

- [Routes Considered](/UpDoc/mcp/routes-considered/): the five options and why this one won
- [Porting the Mapping to C#](/UpDoc/mcp/porting-to-csharp/): what moving the logic actually involved
- [The UpDoc API](/UpDoc/api/): the endpoint as reference
