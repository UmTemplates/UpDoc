---
title: "What Is Still Open"
description: "Deliberate gaps, known bugs, and the work that has not been done. Accurate as at September 2026."
---

The MCP server works and is published. It is also incomplete in several known ways, and the gaps are deliberate rather than forgotten.

## The duplication

**The backoffice still runs its own copy of the create logic.** It should call the endpoint instead, so there is one implementation rather than two that agree today.

This is deliberately not done. The browser path is what real client work depends on, and it gets switched over once the two are compared side by side.

See [Two Implementations](/UpDoc/mcp/two-implementations/) for what must stay in agreement meanwhile.

## PDF only

`create-from-source` supports PDF. Markdown and web sources return a 400 with a message pointing at the backoffice:

> The '{sourceType}' source type cannot be imported through this endpoint yet. Use the backoffice for markdown and web sources.

One source type was enough to prove the shape.

Note the asymmetry: **the capability exists elsewhere in the codebase.** `WorkflowController` fully supports all three, using `IHtmlExtractionService` for web and `IMarkdownExtractionService` for markdown. They are simply not wired into the create endpoint.

The request model's own documentation says `"pdf"`, `"markdown"`, `"web"`, describing the intent rather than the implementation. That is the cheapest item on the list: the same code path with a different extractor.

## Two tools of forty-two endpoints

The generated client exposes 42 operations. Two are wired to tools.

That is a position rather than an oversight. A tool is a contract to maintain, and each one should earn its place. But the ratio is worth knowing when asking what the server could do.

## Open issues

| Issue | What |
|---|---|
| [#131](https://github.com/UmTemplates/UpDoc/issues/131) | **Dry-run import.** Run extraction and return what would land in each field, creating nothing. Lets a session check a PDF before committing, and diagnose a bad mapping without creating and binning a page. |
| [#133](https://github.com/UmTemplates/UpDoc/issues/133) | **Import report.** Which mappings resolved and which did not. `mappedValueCount` is returned already, but a count without its denominator is not much use, since "19" only means something next to "of 19". |
| [#139](https://github.com/UmTemplates/UpDoc/issues/139) | **Stale mapping.** `extras-to-your-tour.summary` points at a section part `transform.json` does not produce. Surfaced by `list-workflows`. May be the mapping that was meant to fix the price-caveat placement problem, so worth understanding before deleting. |
| [#144](https://github.com/UmTemplates/UpDoc/issues/144) | **Tool wish list.** Running record of what to build next and what deliberately not to. |
| [#152](https://github.com/UmTemplates/UpDoc/issues/152) | **Stale references.** Scaffold residue in `mcp/`, and four frontend comments claiming the MCP server shares their code. |

## Candidate tools, not committed

From the wish list, with the reasoning that keeps them on it:

**`validate-workflow`** reports a workflow's problems in detail. `list-workflows` already surfaces warnings, so this is depth rather than new capability. Useful when an import produced less than expected and the question is whether the workflow or the source is at fault.

**`find-media`** searches the media library, returning size alongside the key. The specific job is "is this PDF already here, and is it the same revision?" That matters: nine brochures were bulk-seeded ahead of their tours and one was a stale revision, 43 bytes off the live file. **A search hit is not proof the right file is there.**

Open question whether `find-media` belongs in UpDoc's server at all. It is a media-library concern, and Umbraco's own server may be the right home.

## Known defects

Tracked on [#152](https://github.com/UmTemplates/UpDoc/issues/152), summarised here because they mislead anyone reading the source:

- The server identifies itself as `my-umbraco-mcp`, the scaffold's default, in four places
- Three files still reference `get-chained-info`, which was removed, including a live eval test
- Four frontend comments claim the MCP server shares `create-from-source.ts`. It does not.
- Four unused `MY_*` environment variables, template mock code, and two dead entries in the mode registry

## What will not be built

From the original design decisions, still holding:

- **Multi-CMS support.** Umbraco-only, forever.
- **Batch imports.** One page at a time with human review between each, deliberately.
- **Publishing from the tool.** The endpoint creates a draft. Publishing stays a separate decision with a human in the loop.

## Client-facing use

Running this against a live client site from a desktop AI client is real but deliberately deferred. It needs packaged guardrails, a tightly scoped API user, and a human eye in the loop.

---

*This page describes the state as at September 2026. Check the linked issues for current status.*

## Further reading

- [Two Implementations](/UpDoc/mcp/two-implementations/): the largest outstanding item
- [Building the Tools](/UpDoc/mcp/building-the-tools/): what exists today
