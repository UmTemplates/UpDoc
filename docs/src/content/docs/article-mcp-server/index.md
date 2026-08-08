---
title: "Giving an Umbraco package its own MCP server"
description: "Why UpDoc needed an API before it needed an MCP tool, and what we learned building both in a day."
---

Umbraco's MCP server can drive Umbraco.

It cannot drive your package.

That is the whole problem in a sentence, and it took us most of a day to properly understand what to do about it.

## The situation

UpDoc creates Umbraco documents from PDFs, web pages and markdown files. A workflow describes where content comes from, how to interpret it, and which blueprint fields receive it.

It works. One client has imported around sixty tour brochures with it.

Those imports are increasingly driven by an AI agent. Fifteen of the sixteen steps run through Umbraco's Management API: find the PDF, upload it, read the created page, fix the content, check links, publish.

One step needed a browser.

The step where UpDoc actually creates the document.

## What the browser step looked like

The agent drove Playwright. Navigate to the parent node. Click "Create from Source". Choose a document type. Choose a blueprint. Type a name. Open the media picker. Search. Select the PDF. Wait for extraction. Click Create. Read the new document's ID out of the URL.

Every one of those dialogs is shadow DOM.

`page.evaluate` with `innerText` returns nothing. A recursive shadow-root walk returns nothing. `getByText` cannot see in. Even waiting for a button that is visibly on screen times out.

So the automation took a screenshot, read the PNG, and clicked by coordinate.

With a scale factor. Screenshots come back at a different width from the CSS viewport, 2000 against 2529, a factor of 1.2645. Click at raw screenshot coordinates and nothing happens at all. No error. The dialog just sits there.

That is not a criticism of Umbraco's backoffice. It is a perfectly reasonable UI. It is simply not an interface, and driving it as though it were is a losing game.

## The wrong answer, which we tried first

The obvious move is to write an MCP tool that does what the clicks do.

Extract the PDF. Scaffold from the blueprint. Apply the workflow's mappings. Create the document. Save it.

All of those are HTTP calls. The MCP server is a Node process. It could make them.

We got some way down this road before the problem became clear.

**The tool would be doing the work, not triggering it.**

Umbraco's MCP server never does that. `update-block-property` calls one endpoint. The endpoint decides what that means. The tool is a thin skin over an operation that already exists.

Building a tool that orchestrates five calls and applies mapping logic is not the same shape at all. It puts business logic in the MCP layer, where a second consumer cannot reach it and a second implementation will eventually appear.

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

Then the MCP tool is ten lines that call it.

This is the same relationship Umbraco's own server has with the Management API. UpDoc was simply missing the API half.

## Why the endpoint did not already exist

Because the logic lived in the browser.

Scaffolding, mapping, block matching, markdown conversion, type coercion: all of it was TypeScript running in the backoffice. Around 350 lines of it.

Worse, it lived there **twice**. UpDoc has two entry points, a button on the collection view and an item in the tree's actions menu, and each carried its own copy.

They had already drifted. One passed the document type name to the modal and the other did not, so the Destination tab showed an empty box depending on which route you took. Nobody had noticed, because who checks a read-only tab twice.

That is the real lesson, and it has nothing to do with MCP.

**If a feature only exists in your UI, it does not exist.**

Not to a scheduled job. Not to a deployment step. Not to another site. Not to an agent. Only to a person with a mouse.

## What we built

Four things, in this order. The order matters.

### 1. Describe what the API returns

UpDoc had 41 endpoints and a Swagger document that listed every route and described none of their payloads. No `[ProducesResponseType]` anywhere, so every generated client operation came back as `void`.

We had already felt this. The first MCP tool, `list-workflows`, hand-wrote its own output schema in TypeScript, duplicating a C# class. Every new tool would have repeated that, and each copy would be free to drift.

So: 95 attributes across 41 endpoints. Not blanket-applied. Each action's real return paths were mapped first, so an endpoint that can return 409 says so, and one that cannot does not claim it.

Ten response shapes were anonymous objects. An anonymous type cannot be named in an attribute, so it cannot be described at all. Those became named classes, with every JSON property name preserved exactly so no consumer saw a difference.

Errors became `ProblemDetails`, matching the rest of Umbraco. That was 89 return statements. Worth checking the convention rather than inventing one: Umbraco's Management API uses RFC 7807 throughout, built with a `ProblemDetailsBuilder` that is public in `Umbraco.Cms.Api.Common`.

One endpoint was returning `ex.StackTrace` in its 500 response. That came out. A stack trace in a documented contract is not something to publish deliberately.

### 2. Stop the logic living in two places

The duplicated create logic moved into one module.

This was already on the backlog as a maintenance problem. It became urgent because you cannot expose a feature that exists twice: you would be picking which copy is authoritative every time you touched it.

### 3. Build the endpoint

The mapping logic moved to C#.

`SectionLookupBuilder` flattens transform sections into the `sectionId.part` keys that `map.json` addresses. `MappingApplicationService` applies the mappings. `ValueCoercion` turns "£1,199" into `1199` and "30th September 2026" into the JSON shape Umbraco's date editors expect. `DocumentCreationService` ties it together.

Every one is a port rather than a reimplementation. The TypeScript had run sixty real imports. It carried comments about why blocks match on `contentTypeKey` and why ambiguous dates are refused. Those comments came across with the code.

### 4. Build the tool

The server itself was scaffolded with [`create-umbraco-mcp-server`](https://docs.umbraco.com/umbraco-in-ai/mcp/base-mcp/create-umbraco-mcp-server), which handles the parts nobody wants to write: OAuth against the Management API, tool registration, filtering, a CLI for calling tools without an MCP client, and chaining to other servers.

Two things caught us out there, both worth knowing before you start. Its `init` step asks for a base URL and means the **host**, not the Swagger URL — giving it the full `/swagger.json` path returns a 404. And its `discover` step reads Swagger, so an API that describes nothing is invisible to it. UpDoc's controllers declared `[MapToApi("updoc")]` but nothing had ever created the document they named, so the whole API simply did not appear.

The [instance preparation guide](https://docs.umbraco.com/umbraco-in-ai/mcp/base-mcp/create-umbraco-mcp-server/development-workflow#instance-preparation) covers setting up the API user you will need.

With that in place, the tool is small:

```typescript
const createFromSourceTool = {
  name: "create-from-source",
  description:
    "Creates an Umbraco document from a PDF already in the media library, using an UpDoc workflow. " +
    "The document is created as a DRAFT and is not published.",
  inputSchema,
  outputSchema,
  handler: async (model) =>
    executeGetApiCall((client) =>
      client.postUmbracoManagementApiV1UpdocCreateFromSource({ ... })),
};
```

That is the whole thing. The output schema comes from the generated Zod schema, so it cannot drift from the C#.

Which is step one paying off. Describing the response shapes is what makes a generated schema exist to use.

## Three things worth knowing if you do this

### Measure the thing you are worried about

The objection that nearly drove us to the wrong architecture was markdown.

The browser uses `marked`, a JavaScript library. A C# endpoint would need a different one. Two markdown engines do not produce identical HTML, so documents created through the API could differ subtly from ones created by clicking. Invisible until someone compared two pages closely.

That reasoning is sound. It was also wrong, and it cost hours.

The markdown UpDoc actually produces is `- ` bullets and `### ` headings. Nothing else. No links, no bold, no nesting, no tables.

Running both engines over four real samples:

| Input | marked | Markdig |
|-------|--------|---------|
| Bullet list | `<ul>\n<li>…</li>\n</ul>\n` | identical |
| Headings and paragraphs | `<h3>Day 1</h3>\n<p>…</p>\n` | identical |
| Paragraph | `<p>…</p>\n` | identical |
| Mixed | `<h3>…</h3>\n<ul>…</ul>\n<p>…</p>\n` | identical |

Byte for byte, including newline placement.

Ten minutes of measuring would have saved several hours of arguing.

### C# is stricter than JavaScript about JSON

Two differences bit us.

The Management API hands the browser a block grid as a JSON **string**. Server-side, the scaffold has already parsed it into an **object**. The porting code has to handle both.

And `JsonNode`'s indexer **throws** on a non-object where JavaScript quietly returns `undefined`. So this:

```csharp
if (container?["contentData"] is not JsonArray contentData)
    return;
```

works fine until a property that is not a block container reaches it. A media picker holds an array. The first real call returned a 500 with `The node must be of type 'JsonObject'`.

The fix is to check the type before indexing. Obvious in hindsight. Not obvious when porting line by line from a language that does not care.

### Say that the document is a draft

The endpoint creates a draft. It does not publish.

That is the right default. Publishing is a decision, and an import should be reviewed first.

But an agent will stop when a tool reports success. So the tool's description says the document is a draft and is not published, in those words. Otherwise you get a page that exists, looks fine in the backoffice, and is invisible on the front end.

Small thing. Easy to leave out. The kind of detail that decides whether the automation is trustworthy.

## Does it work

```
create-from-source
  → 201 Created
  → documentId 3e6b79de-6eac-42fe-987a-083aeba3947c
  → 19 of 19 mappings resolved
```

A tour page, built from a brochure PDF, by an agent, with one call.

Checking the created document:

| Field | Value |
|-------|-------|
| Page Title | Flemish Masters – Bruges, Antwerp & Ghent |
| Tour Duration | `5` (from "5 days") |
| Tour Price | `1199` (from "£1,199") |
| Departure Date | `{"date":"2026-09-30","timeZone":null}` (from "30th September 2026") |
| Itinerary | `<h3>Day 1</h3><p>We depart by executive coach…` |
| Features | `<ul><li><p>4* central Bruges hotel</p></li>…` |
| Brochure | Media picker pointing at the source PDF |

Sixteen blocks matched by `contentTypeKey`. Unmapped ones left on their blueprint defaults.

## What we would tell another package author

**Your MCP server is the easy part.** If it feels hard, you are probably building the wrong thing. A tool should trigger an operation, not perform one.

**Check whether your feature has an API.** Not whether it has a UI. Whether something without a mouse could use it. For most packages the answer is no, and that is the actual work.

**Describe your responses before you write tools.** Otherwise every tool hand-writes a schema that duplicates a class it cannot see, and they drift.

**Match the host's conventions.** `ProblemDetails` rather than your own error shape. It is what a consumer expects and what generated clients understand. Umbraco's source is the place to check, not the docs.

**Port carefully, and measure your assumptions.** The riskiest part of moving logic between languages is the part you are confident about.

## What is still to do

The backoffice still runs its own copy of the create logic. It should call the endpoint instead, so there is one implementation rather than two that agree today.

That is deliberately not done yet. The browser path is what real client work depends on. It gets switched over once the two are compared side by side, not before.

Markdown and web sources return a message pointing at the backoffice. PDF was enough to prove the shape.

## Two packages, two registries

A package author doing this ships **two** things, and they cannot travel together.

Installing UpDoc's NuGet package does not, and should not, bring a Node process with it. The extension runs inside Umbraco on a server. The MCP server runs on the developer's own machine, next to their AI client, and talks to the site over HTTP. Different runtimes, different machines, different lifecycles.

So:

| | Registry | Provides |
|---|---------|----------|
| `Umbraco.Community.UpDoc` | NuGet | The endpoints |
| `@umtemplates/updoc-mcp` | npm | The tools that call them |

Both are now published. A fix to one does not require releasing the other, which is worth knowing before you go looking for a bug in the wrong place.

### On chaining

The scaffold can chain to other MCP servers, proxying their tools through yours. It is on by default, pointed at `@umbraco-cms/mcp-dev`.

We turned it off. Three reasons, and only the third is arguable.

**The example tool had never worked.** `get-chained-info` ships with the scaffold to demonstrate the technique. It calls `get-server-info` on `mcp-dev`, which has no tool by that name, so it fails on first invocation with `Tool get-server-info not found`. It had been sitting there since the project was created, unnoticed, because nothing had called it. We removed it rather than fixing it.

**A fresh install hangs.** Chaining spawns `npx -y @umbraco-cms/mcp-dev` at startup. On a machine that has never fetched it, that downloads before responding: no output, no error, just a wait. Locally it looks instant because the package is cached — which is exactly why this survived until the packed tarball was installed into an empty directory.

**Around 350 tools get duplicated.** With `proxyTools`, every tool on the chained server is re-exposed through yours. Anyone already running `mcp-dev` alongside sees each tool twice and has to choose between them. Ours came back reported from the site using it: *"the updoc server now proxies the full Umbraco CMS API. Not something we asked for."*

That last one is a judgement rather than a bug. Chaining is right for a server meant to be the only one registered. It is wrong for an add-on server whose likely consumer already runs Umbraco's, which is the situation any package author is in.

`UMBRACO_MCP_CHAIN=true` turns it back on if a tool ever needs to delegate.

### What the dry run caught

Publishing to npm is irreversible — a version can be superseded but never replaced — so it is worth packing the tarball, installing it into an empty directory, and running it as a consumer would. That found five things the manifest could not:

- **`yargs` was a runtime dependency.** Nothing in the bundle imports it, so it looked safe to move to devDependencies. The SDK loads it *dynamically* to parse `--call` and `--list-tools`. Without it, both flags are silently ignored and the server simply starts instead.
- **Chaining hung a fresh install.** The scaffold spawns `npx -y @umbraco-cms/mcp-dev` at startup and proxies its ~350 tools. Locally that looks instant because the package is cached; on a clean machine the first run hangs with no output while it downloads. It also duplicates every Umbraco tool for anyone already running Umbraco's own server. Off by default now.
- **Four dependencies did not belong.** Cloudflare Worker and eval-test packages that never ship in `dist/`. A clean install went to 40 packages.
- **The README was the scaffold's**, titled `# mcp`, explaining how to build a template. It is the npm front page.
- **No `repository` field**, so nothing linked npm back to the source.

None of those are visible from reading the source tree. All five came from installing the thing and running it.

## Useful links

**Building one of these**

- [create-umbraco-mcp-server](https://docs.umbraco.com/umbraco-in-ai/mcp/base-mcp/create-umbraco-mcp-server) — the scaffolding tool. Start here.
- [Development workflow: instance preparation](https://docs.umbraco.com/umbraco-in-ai/mcp/base-mcp/create-umbraco-mcp-server/development-workflow#instance-preparation) — setting up the API user your server authenticates as.
- [Umbraco in AI](https://docs.umbraco.com/umbraco-in-ai) — the wider documentation this sits in.

**Reference implementations**

- [Umbraco-CMS-MCP-Dev](https://github.com/umbraco/Umbraco-CMS-MCP-Dev) — the developer server, published as `@umbraco-cms/mcp-dev`. Register it alongside UpDoc's rather than expecting UpDoc's to provide Umbraco's tools; see the note on chaining below.

**UpDoc**

- [UpDoc on GitHub](https://github.com/UmTemplates/UpDoc) — the MCP server is in `mcp/`, the endpoint in `src/UpDoc/Controllers/CreateFromSourceController.cs`.
- [UpDoc on NuGet](https://www.nuget.org/packages/Umbraco.Community.UpDoc) — the extension and its endpoints
- [@umtemplates/updoc-mcp on npm](https://www.npmjs.com/package/@umtemplates/updoc-mcp) — the MCP server
- [Model Context Protocol](https://modelcontextprotocol.io/) — the specification itself, if tools and servers are new to you.

---

*UpDoc is an Umbraco package for creating documents from PDFs, web pages and markdown.*
