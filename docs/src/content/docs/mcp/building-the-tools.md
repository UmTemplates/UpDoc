---
title: "Building the Tools"
description: "Two tools, what shapes them, and why the descriptions matter as much as the schemas."
---

The server was scaffolded with [`create-umbraco-mcp-server`](https://docs.umbraco.com/umbraco-in-ai/mcp/base-mcp/create-umbraco-mcp-server), which handles OAuth against the Management API, tool registration, filtering, a CLI, and chaining.

What remained was the tools themselves, and they are small.

## Two tools, not three

The npm package ships **two** tools over stdio:

| Tool | Slice | Annotation |
|---|---|---|
| `list-workflows` | `list` | `readOnlyHint: true` |
| `create-from-source` | `create` | `readOnlyHint: false`, `destructiveHint: false`, `idempotentHint: false` |

A third, `get-server-info`, exists in the source but is **deliberately excluded** from the stdio collection list. It appears only in the Cloudflare Worker export. It calls Umbraco's own server-information endpoint rather than anything of UpDoc's, and exists to prove the full auth chain end to end.

`src/index.ts` sets `const collections = [workflowsCollection, importsCollection]`. That is where the exclusion happens.

## Why `list-workflows` came first

It answers the question a session asks before importing anything: what can this site import, and from what?

It was also the right first tool for three practical reasons:

- Read-only, so no exposure to the write hazards
- Needs no chaining
- Exercises the whole path: host spawns server, server reads UpDoc's API, result comes back

It took no new code in UpDoc at all. `GET /updoc/workflows` had been there all along, answering the backoffice.

### What it immediately surfaced

The first real call reported a validation warning nobody had read:

```
source 'extras-to-your-tour.summary' not found in transform.json (orphaned source)
```

A mapping pointing at a section part the transform does not produce. It had presumably been in the startup log for a while.

That is tracked as [#139](https://github.com/UmTemplates/UpDoc/issues/139) and is still open. Worth noting as a side effect: **exposing configuration to a tool surfaces problems that a log does not.**

## Why `create-from-source` was the second

It is the only tool in UpDoc that writes.

The tool itself is thin, which is the point:

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

All the work is server-side, the same as Umbraco's own MCP server wrapping the Management API.

## Generated shape, hand-written meaning

Both tools take their output schema from the generated Zod schema, so it cannot drift from the C#.

But **descriptions are added by hand on top**, and this is not optional.

Orval emits field types and no `.describe()` text. Those descriptions are what an LLM reads when deciding whether a tool is the one it wants, and what each argument means. `alias` alone does not convey that it is the identifier every other UpDoc tool takes.

Compare the generated type with what the tool actually declares:

| Field | Generated | Described as |
|---|---|---|
| `alias` | `string` | "Folder name on disk, and the identifier every other UpDoc tool takes" |
| `mappingCount` | `number` | "How many source-to-destination mappings are configured" |
| `isComplete` | `boolean` | "Whether the workflow has everything it needs to run. Incomplete ones will not import" |

A straight swap to the generated schema would have passed the shape test and failed the usefulness one.

## Say that the document is a draft

The endpoint creates a draft. It does not publish.

That is the right default: publishing is a decision, and an import should be reviewed first.

But **an agent will stop when a tool reports success.** So the tool description says the document is a draft and is not published, in those words, and the output schema describes `published` as:

> Always false. The document is created as a draft, so publish it separately once the content has been checked.

Leave that out and you get a page that exists, looks fine in the backoffice, and is invisible on the front end.

Small thing. Easy to omit. It decides whether the automation is trustworthy.

## Descriptions that pre-empt a wrong call

Two argument descriptions do work beyond naming the field:

- `mediaId`: "It must already be uploaded. This creates a document, it does not upload files."
- `documentName`: "Set it here rather than renaming afterwards, which is a separate operation."

Both exist because the alternative is an agent discovering the constraint by failing.

## Annotations

`create-from-source` declares `destructiveHint: false`.

It creates a document and never modifies or removes one, so a client that treats destructive tools differently should not treat this one that way. The annotation is how it says so.

## The version check

The server checks the site's Umbraco major against the one it was generated for, on startup, and folds the result into the server's `instructions` so it reaches the model rather than only stderr.

A mismatch **blocks the first tool call** until the user retries.

Two details worth knowing:

- It deliberately does **not** compare against the package's own version. A new project starts at 1.0.0, which says nothing about the Umbraco major, and an implicit comparison falsely blocked the first tool call of every new server.
- It is skipped entirely when no client id is set, so CLI introspection works offline with no credentials.

## Where the target major comes from

`UMBRACO_TARGET_MAJOR` is generated, not typed, and it is generated by a **live API call** rather than read from the spec.

Every Umbraco Swagger spec hard-codes `info.version` to the literal string `"Latest"`. So the orval transformer calls `GET /umbraco/management/api/v1/server/information` instead, and writes the real major to `src/config/umbraco-target.generated.ts`.

It sits in the input-transformer slot specifically so the constant and the tools cannot drift.

## One stdio subtlety

`load-env.ts` imports dotenv programmatically with `config({ quiet: true })`.

dotenv 17 prints `◇ injected env (0) from .env` to **stdout**. On an MCP stdio server, stdout is the protocol channel. An unexpected line there corrupts the traffic, and it would corrupt the CLI's JSON output too.

## Further reading

- [Describing the Responses](/UpDoc/mcp/describing-responses/): what makes the generated schemas exist
- [Testing Traps](/UpDoc/mcp/testing-traps/): three bugs in six lines of schema
- [The MCP server](/UpDoc/mcp/): the tools as reference
