---
title: "Routes Considered"
description: "Five ways to automate an import, which was recommended, and why the build chose a different one."
---

Before anything was built, five routes were considered and written up in `planning/AI_DRIVEN_IMPORT_ROUTES.md` (30 July 2026).

The plan recommended Route B. The build did Route A.

That reversal is the most consequential decision in the whole MCP effort, so it is worth recording properly rather than leaving the planning document to imply otherwise.

## The five routes

| Route | What | Estimate | Verdict |
|---|---|---|---|
| **0** | Playwright "keep the document" variant of the smoke test | ~1 day | Interim aid. Used during migration. |
| **A** | C# endpoint plus a thin MCP tool | ~1 month | **Built.** |
| **B** | MCP server orchestrates via existing APIs, reusing apply logic extracted to a shared TypeScript module | ~1-2 weeks | Recommended, not built. |
| **C** | Session-only skill making the same HTTP calls | days | Stepping stone, not a product. |
| **D** | Mapping endpoint plus generic Umbraco MCP writes | n/a | Ruled out. |

Route D was ruled out early: there is no blueprint scaffold over MCP, and block-grid writes through generic tools are unsafe.

## What the plan recommended

Route B, for reasons that were sound at the time:

- It delivered the goal in one to two weeks rather than a month
- It fixed the duplicated apply logic as a side effect
- It mirrored the Umbraco MCP server's pattern exactly
- It kept Route A open as a future upgrade rather than a prerequisite

The plan was explicit that Route A should happen **"only if demand for a plain HTTP API materialises (CI, non-AI integrations, other consumers)."**

It also named the risk that argued against Route A:

> **Subtle output differences** (Route A: Markdig vs the TypeScript converter). Check against a real tour early.

## Why the build went to Route A anyway

Three things changed the calculation once work started.

### The tool would have owned the logic

Route B puts the orchestration in the MCP server. That means the logic lives on the developer's machine, in a Node process, reachable only by that tool.

Route A puts it in UpDoc, on the Umbraco server, versioned with the package. Then anything can reach it: the tool, a script, a scheduled job, another site, the backoffice itself.

The plan treated this as a preference. In practice it is the difference between a feature existing and a tool existing.

### The markdown risk evaporated when measured

The objection that most argued for Route B was markdown.

The browser uses `marked`. A C# endpoint would need a different library. Two markdown engines do not produce identical HTML, so documents created through the API could differ subtly from ones created by clicking, invisibly, until someone compared two pages closely.

The reasoning is sound. It was also wrong.

The markdown UpDoc actually produces is `- ` bullets and `### ` headings. Nothing else. No links, no bold, no nesting, no tables.

Running both engines over four real samples:

| Input | marked | Markdig |
|-------|--------|---------|
| Bullet list | `<ul>\n<li>…</li>\n</ul>\n` | identical |
| Headings and paragraphs | `<h3>Day 1</h3>\n<p>…</p>\n` | identical |
| Paragraph | `<p>…</p>\n` | identical |
| Mixed | `<h3>…</h3>\n<ul>…</ul>\n<p>…</p>\n` | identical |

Byte for byte, including newline placement.

Ten minutes of measuring removed the main argument for the cheaper route. See [Porting the Mapping to C#](/UpDoc/mcp/porting-to-csharp/) for how that measurement is now enforced in code.

### Route B needed the extraction anyway

Route B's selling point was that it fixed the duplicated apply logic as a side effect. But Route A needed that extraction too, as a prerequisite rather than a bonus: you cannot expose a feature that exists twice without first picking which copy is authoritative.

So the work happened either way. It was done first, in its own commit, and the endpoint followed.

## What chaining was supposed to do

Route B's estimate rested on an assumption worth recording, because it also reversed.

The original premise was that UpDoc's server would own **only** extract, transform and apply mapping. Everything Umbraco-shaped (scaffold, create, save) would be delegated to `@umbraco-cms/mcp-dev` through chaining.

That is not how it turned out. UpDoc's tools call UpDoc's endpoints and never delegate, and [chaining is off by default](/UpDoc/mcp/chaining/).

## Decisions that did hold

Seven decisions were recorded alongside the routes. Most survived the build intact:

1. **Umbraco-only, forever.** No multi-CMS ambitions.
2. **Mirror the Umbraco MCP server's conventions exactly**: TypeScript, npm/npx distribution, API user client credentials in environment variables.
3. **Same repository, own folder**, versioned with the endpoint contract. The server lives at `mcp/` rather than `src/UpDoc.Mcp/`, because `src/` holds .NET projects and an MCP server is a Node process.
4. **Save, not publish.** Import returns the document key; publishing stays with human review.
5. **No `blueprintId` parameter**, because a workflow folder already belongs to exactly one blueprint.

Decision 5 is the one that did not survive. `create-from-source` takes `blueprintId` and uses it to select the workflow, which is the inverse of what was planned. It turned out to be the more useful direction: the caller knows which blueprint it wants, and the blueprint implies the workflow.

## What this means for a future decision

The pattern worth carrying forward: **the cheaper route is cheaper because it scopes the result more narrowly.** Route B was genuinely faster, and it would genuinely have produced a tool rather than a feature.

Where a risk argues for the narrower scope, measure the risk before accepting it.

## Further reading

- [Why UpDoc Needed an API](/UpDoc/mcp/why-an-api/): the problem these routes were answering
- [Chaining](/UpDoc/mcp/chaining/): the premise that reversed
- Issue [#106](https://github.com/UmTemplates/UpDoc/issues/106): the original design record
