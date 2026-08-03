# AI-Driven Import: Routes to Removing the Last Manual Step

**Status:** Design discussion captured. No build committed. Decision deferred.
**Date:** 30 July 2026
**Origin:** Conversation exploring "Expose Create from Source as an API endpoint, then an MCP tool over it".

---

## The Problem

Importing a tour is the only step an AI session cannot do.

Everything after import already runs over the Umbraco MCP server: content fixes, rotator, brochure, destinations, publish. Everything before it is a human driving the Create from Source dialog.

The Tailored Travel migration has ~135 tours left. Each one starts with the same manual sequence: pick source PDF, pick workflow, type the node name, create.

The desired working model is unchanged: **one page at a time, human review between each**. Batch imports of 50 are explicitly not wanted. The goal is only that "make TTM5175" becomes a single instruction to an AI session.

## The Key Architectural Fact

The workflow is a recipe, not a machine. The recipe (rules, map, destination) is JSON in the workflow folder. The engine that executes it is split across two places:

| Workflow half | Where it runs | Language |
|---|---|---|
| Extract and transform (read PDF, shape content) | Server | C# (UpDoc controllers and services) |
| Fill in the page and create the document | Browser dialog | TypeScript |

The second half lives in two duplicated bridge files, ~600 lines each:

- `up-doc-action.ts` (entity action)
- `up-doc-collection-action.element.ts` (collection action)

That duplication is already tracked as issue #41.

Consequence: there is no server-side "run the workflow" command to call. Any automation route must either drive the browser (where the second half lives today) or relocate the second half.

## How the Umbraco MCP Server Does It (the reference pattern)

An MCP server is an ordinary program on the AI user's machine. It has no browser and no hands. It works by making HTTP calls.

For a block text edit, the Umbraco MCP server:

1. Decides what to send (TypeScript, on the user's machine). For block edits this includes surgical read-modify-write of the document JSON.
2. Sends it to Umbraco's Management API (C#, on the server) which validates, saves, and updates caches.

TypeScript decides, C# executes. The Umbraco MCP server needed no changes to Umbraco itself because Umbraco already exposes a complete Management API.

---

## The Routes

### Route 0: Playwright "keep the document" variant (interim, no-regret)

`smoke-test-pdf.spec.ts` already creates a document from any PDF by driving the real dialog in a real browser. It deletes the document afterwards.

Add a switch to keep the document instead.

- **Effort:** roughly a day.
- **Delivers:** "make Winchester Istanbul" works immediately. Migration can start now.
- **Limits:** needs the site and a browser running. Clunky. Never shipped in the package. A migration aid only.
- **Durability:** unaffected by ecosystem shifts. No regrets whatever else is built.

### Route A: C# import endpoint, then thin MCP tool (the original proposal)

Port the page-filling logic from TypeScript into a C# service inside UpDoc. Expose it as:

```
POST /umbraco/management/api/v1/updoc/import
{ "workflowAlias": "...", "sourceMediaKey": "...", "nodeName": "...", "parentId": "..." }
→ 201 { "documentKey": "..." }
```

No `blueprintId` parameter is needed: a workflow folder belongs to exactly one blueprint.

Then wrap the endpoint in a one-tool MCP server (trivial once the endpoint exists).

- **Effort:** large. TypeScript-to-C# translation of the apply pipeline, including block matching by contentTypeKey, blockKey reconciliation, absent-block-property creation, markdown conversion (Markdig replacing the homegrown converter). Roughly a month of careful work.
- **Delivers:** a plain HTTP API usable by anything (scripts, CI, MCP, other tools). The architecturally "proper" long-term home. Dialog can later become a thin caller of the endpoint, collapsing all duplication.
- **Costs:** the awkward middle period has the logic in both TypeScript (dialog) and C# (endpoint). Markdig output will differ subtly from the TypeScript converter (probably better; known bugs #42 and #43 live in the TypeScript one). Biggest single piece of work in the project's history.

### Route B: UpDoc MCP server orchestrates via existing APIs (the cheaper path)

Build the UpDoc MCP server the same way the Umbraco MCP server is built. The tool orchestrates the import itself, in TypeScript, against APIs that all exist today:

1. Call UpDoc's extraction and transform endpoints (C#, already built).
2. Fetch the blueprint scaffold from Umbraco's Management API.
3. Fill in the values using the dialog's own logic, extracted into a shared module.
4. POST the new document, return the key.

Step 3 means doing issue #41 properly: extract the apply logic from the two bridge files into one shared TypeScript module. The dialog imports it. The MCP server imports it. One copy of the logic, one language.

- **Effort:** small-to-medium. TypeScript-to-TypeScript adaptation, not translation. Roughly a week or two. Some rework needed where the bridge files use browser-only backoffice framework helpers (replace with direct Management API calls).
- **Delivers:** the actual goal (AI-driven one-at-a-time imports) plus the #41 fix as a side effect. Less total duplication than Route A's middle period.
- **Costs:** no plain HTTP API. The capability exists only where the MCP server runs. Partial-failure risk remains (a failure mid-orchestration can leave a half-made page, same as the dialog today).
- **Compatibility with Route A:** full. If the C# endpoint is built later, the MCP tool swaps its internals for one call, invisibly to users.

### Route C: Session skill, no MCP server at all (minimal)

The same orchestration as Route B, but written as a Claude Code project skill (or plain script) that makes the HTTP calls in-session using the API user's credentials. No npm package, no MCP registration.

- **Effort:** smallest of the API-based routes, especially after the #41 shared module exists.
- **Delivers:** imports for Dean's own sessions only.
- **Limits:** not shareable to the client's Claude Desktop, not discoverable, not a package feature. A private stepping stone, not a product.

### Route D: Partial mapping endpoint plus Umbraco MCP writes (ruled out)

Endpoint returns mapped values; the session assembles the document via existing Umbraco MCP tools.

Ruled out: no blueprint-scaffold path over MCP, and block-grid writes via generic MCP tools are exactly the operation this project's hard-won safety rules exist to avoid.

### Non-route: contributing a tool to the Umbraco MCP server

You cannot add tools into someone else's running MCP server, and would not want to: UpDoc's workflow execution is package-specific. MCP composition is the answer. Multiple servers run side by side and the AI sees one combined toolbox. No Umbraco HQ involvement is needed for any route.

---

## Comparison

| | Route 0 (Playwright) | Route A (C# endpoint) | Route B (MCP orchestration) | Route C (session skill) |
|---|---|---|---|---|
| Effort | ~1 day | ~1 month | ~1-2 weeks | days |
| Who can use it | Dean's sessions | anything (HTTP) | any MCP client | Dean's sessions |
| Needs browser + running dialog | yes | no | no | no |
| Fixes #41 | no | eventually | yes, immediately | yes (if module extracted) |
| Plain API for scripts/CI | no | yes | no | no |
| Package feature ("UpDoc works with AI") | no | yes | yes | no |
| Duplication during transition | none | TS + C# copies | one shared TS copy | one shared TS copy |

## Decisions Already Made

1. **Umbraco-only, forever.** No multi-CMS ambitions. UpDoc's value is deep Umbraco knowledge.
2. **Mirror the Umbraco MCP server's conventions exactly** (language, distribution via npm/npx, auth via Umbraco API user client credentials in environment variables, config shape, tool naming). First implementation step is reading its source, not working from memory.
3. **Same repo, own folder** for the MCP server (e.g. `src/UpDoc.Mcp/`), published as its own package. Endpoint contract and wrapper version together.
4. **Save, not publish.** Import returns the document key; publishing stays with the session's existing MCP flow and human review.
5. **One page at a time stays the working model.** The import itself is deterministic (rules, not AI improvisation), so there is no quality drift in the import step. Drift risk lives in the AI fix-up work afterwards, which is exactly where per-page human review sits.
6. **Dialog switchover is out of scope** for any first build. It is the eventual endgame of Route A only.
7. **Client-facing use is real but "later, deliberately".** The client could run Umbraco MCP + UpDoc MCP in Claude Desktop against the live site. Prerequisites: packaged guardrails (the project's hard-won MCP safety rules as project instructions and tool descriptions), a tightly scoped API user, and a human eye kept in the loop. Not a launch feature.

## Risks

1. **Two copies of the truth** (Route A's middle period). Mitigated by parity E2E tests; eliminated by Route B's shared module or Route A's eventual dialog switchover.
2. **Time sink** (Route A). The migration must never depend on the build finishing; Route 0 decouples them.
3. **Subtle output differences** (Route A: Markdig vs the TypeScript converter). Check against a real tour early.
4. **Moving playing field.** Umbraco now has editor and developer MCP servers; conventions may shift. Mitigation: UpDoc's workflow execution will never be covered by anyone else's server, so the core idea is durable; only packaging conventions might need to follow the ecosystem. Favour cheap, reversible moves (Routes 0 and B) over the big investment (Route A) until the field settles.
5. **Maintenance surface.** Any shipped MCP server adds npm dependency advisories on top of existing #51 noise.

What is not at risk: existing users and the shipped package. Every route is additive. The dialog and current behaviour stay untouched.

## Current Recommendation (as of 30 July 2026)

1. **Now:** nothing built. This document is the deliverable.
2. **When migration pressure bites:** Route 0 (a day, no regrets).
3. **When ready to invest:** Route B. It delivers the goal, fixes #41, mirrors the Umbraco MCP pattern exactly, and keeps Route A open as a future upgrade rather than a prerequisite.
4. **Route A:** only if demand for a plain HTTP API materialises (CI, non-AI integrations, other consumers).

## Open Questions

- What should import return beyond the document key? Warnings? Unmapped fields? Sections that matched nothing?
- Partial-failure behaviour: delete the half-made document, or leave it flagged for inspection?
- Which Umbraco MCP server is the convention reference now that editor and developer variants exist? Check the current ecosystem state before building.
- Auth for Route B/C: confirm the client-credentials API user flow against UpDoc's controller auth (backoffice-secured routes).
- Does the shared apply module (the #41 extraction) run cleanly in Node, or do browser-only dependencies run deeper than the initial scan suggested?
