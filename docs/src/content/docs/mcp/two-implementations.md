---
title: "Two Implementations"
description: "The create logic exists twice, deliberately. What that costs, what must stay in agreement, and which comments are now wrong."
---

:::caution[Read this before changing mapping behaviour]
The logic that turns a source document into an Umbraco document exists **twice**: once in C# and once in browser TypeScript. A change to one is not a change to the other.
:::

## The current state

Three consumers, two implementations:

| Consumer | Path |
|---|---|
| UpDoc's MCP server | C# endpoint (`POST /updoc/create-from-source`) |
| Backoffice, "..." actions menu | Browser TypeScript (`create-from-source.ts`) |
| Backoffice, Child items button | Browser TypeScript (`create-from-source.ts`) |

The C# is **not** yet the single source of truth.

## Why it is like this

Not by accident, and not by oversight.

The backoffice path is what real client work depends on. It has run around sixty imports. Switching it to the endpoint is a change to the thing that is currently working, and it gets made once the two are compared side by side, not before.

Adding the endpoint alongside was the lower-risk order. The commit that introduced it says so plainly:

> The backoffice is untouched. This is added alongside, and switching it over to the endpoint is a later step once the two are shown to agree.

## What must stay in agreement

The C# services carry the phrase **"The two must agree"** in four places, and it is the right warning:

| C# | TypeScript counterpart | What agrees |
|---|---|---|
| `SectionLookupBuilder` | `buildSectionLookups` in `create-from-source.ts` | The `sectionId.part` key scheme |
| `MappingApplicationService` | `applyMappings` in `create-from-source.ts` | How `map.json` resolves onto properties |
| `ValueCoercion` | `transforms.ts` | Number, date and text coercion |
| `MarkdownStripper` | `stripMarkdown` in `transforms.ts` | Which markdown is stripped |

The binding constraint: **the same `map.json` has to resolve identically either way.** A workflow configured through the backoffice must produce the same document whether an editor clicks Create or an agent calls the endpoint.

## One real difference

The TypeScript does a read-back after creating: a `GET` followed by a `PUT` on the new document, to trigger Umbraco's cache refresh.

The C# does not. It relies on `IContentEditingService`, which handles that itself.

This is a genuine behavioural difference between the two paths, not a porting oversight.

## Stale comments: do not trust these

Four comments in the frontend describe an arrangement that no longer holds. They are tracked in [issue #152](https://github.com/UmTemplates/UpDoc/issues/152).

When `create-from-source.ts` was extracted into a shared module, it was deliberately written to be environment-agnostic so that the MCP server could run it in Node:

> Nothing here touches `window`, `document`, Umbraco contexts or repositories. `fetch` and the auth token are passed in, so this runs equally in the backoffice and in Node — which is what lets UpDoc's MCP server create documents without driving a browser.

**That is no longer true.** The MCP server took a different route: it calls the C# endpoint through the generated client and never touches this file.

The claim survives in four places:

- `create-from-source.ts`: the header comment above
- `up-doc-action.ts` (~line 133): "Shared with UpDoc's MCP server"
- `up-doc-collection-action.element.ts` (~line 162): same
- `up-doc-modal.element.ts` (~line 190): same

The file is still worth sharing **between the two backoffice entry points**, which is what the extraction was really for. Only the MCP claim is wrong.

## What the extraction did fix

Before it, the create logic existed twice *within the backoffice*: 322 lines duplicated across both entry points.

They had already drifted. The collection action never passed `documentTypeName` to the modal, so the Destination tab showed an empty Document Type box when opened from the button and the correct name when opened from the menu.

Nobody had noticed, because who checks a read-only tab twice.

The extraction collapsed 620 + 641 lines into 180 + 233 + 564, and fixed the drift as the same root cause.

Two things changed shape while moving, worth knowing when comparing the two:

- `convertFieldTypes` runs one loop with early continues rather than four loops over the same fields
- `writeBlockProperty` replaces two near-identical blocks in `applyBlockGridValue` and `applyBlockValueByContentType`

Behaviour is unchanged in both cases.

## When this resolves

The backoffice switches to calling the endpoint. Then there is one implementation rather than two that agree today.

The gate is a side-by-side comparison showing the two produce identical documents from the same `map.json`. That has not been done.

Until it is, **a change to mapping behaviour needs making twice**, and the C# comments naming their TypeScript counterparts are the map of where.

## Further reading

- [Porting the Mapping to C#](/UpDoc/mcp/porting-to-csharp/): what the port involved
- [What Is Still Open](/UpDoc/mcp/still-open/): this, and the rest of the outstanding work
- Issues [#41](https://github.com/UmTemplates/UpDoc/issues/41) and [#152](https://github.com/UmTemplates/UpDoc/issues/152)
