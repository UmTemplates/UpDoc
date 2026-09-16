# AI Spike Findings: Umbraco.AI Surface Verification

**Status:** Complete (research spike, no code)
**Date:** 18 August 2026
**Origin:** Blue-sky session on AI-assisted workflow authoring. This document is the Phase 1 output called for in `AI_SOURCE_IDENTIFICATION.md` (issue #31), done as a reading spike against the Umbraco.AI source and docs rather than a code spike.

---

## Verdict

**Issue #31 can unpark.** The reason it was parked (April 2026: "current surface is not the right foundation, context-aware update in development") no longer holds. The new surface has shipped, and it supports exactly what UpDoc needs.

A short code spike (install, one structured-output call from the test site) is still worth doing before Phase 2, but the API-shape risk is resolved.

---

## Versioning correction (important)

Umbraco.AI abandoned semver 1.x. Versions now track the CMS major:

```
1.4.1 ... 1.14.0 -> 17.0.0 ... 17.3.1 (current 17.x) and an 18.x line
```

- **Target: Umbraco.AI 17.3.1** (or later 17.x). Requires CMS >= 17.5.0. UpDoc is on 17.5.3.
- Do NOT build against 1.4.x. Structured output does not exist before 1.8.0.
- Reference **`Umbraco.AI.Core`** only. Never the metapackage, never a provider package.
- All packages are `net10.0` only.
- Licence: MIT. Cost is the site owner's provider API key.

## Structured output (the make-or-break feature): YES

```csharp
var response = await _chatService.GetChatResponseAsync(
    chat => chat
        .WithAlias("updoc-identify")
        .WithOutputSchema(AIOutputSchema.FromJsonSchema(runtimeSchema)),
    messages);

if (response.TryGetResult<RuleProposal>(out var proposal)) { ... }
```

- `AIOutputSchema.FromJsonSchema(JsonElement)` accepts a **runtime** JSON Schema. This matters: UpDoc's destination shape is derived from a blueprint at runtime, not known at compile time.
- `AIOutputSchema.FromType<T>()` exists for compile-time shapes.
- Use `TryGetResult<T>()`, never `GetResult<T>()`. Weaker providers can return schema-violating JSON. A violation is a recoverable proposal failure, not an exception.

## Current API surface

- `IAIChatService` (namespace `Umbraco.AI.Core.Chat`), builder-based: `GetChatResponseAsync(Action<AIChatBuilder>, messages, ct)`, plus streaming and `CreateChatClientAsync`.
- The entire old overload surface (profile/options parameters) is `[Obsolete]`, removal slated for v3. Docs found in older tags show the deprecated API. Expect churn.
- `WithAlias(...)` is **required** (throws without it). The alias drives telemetry and audit. Use stable aliases (`updoc-identify`, `updoc-map`) so site owners can see UpDoc's usage and spend separately.
- Guardrails: use additive `WithGuardrails(...)`, never `SetGuardrails(...)`. Site-owner-configured guardrails must keep applying to UpDoc's calls.

## Contexts vs per-request payload

- Umbraco.AI **Contexts** are persisted, versioned, backoffice-managed entities. Wrong vehicle for per-request extraction payloads (one DB row plus version-history entry per call).
- Per-request data goes in the messages themselves or via `WithContextItems(...)` (transient `AIRequestContextItem`, not persisted).
- Contexts ARE a good optional fit for one thing: a site-owner-editable house-style/tone context attached via `.WithContexts("updoc-house-style")`.

## The optional-dependency problem

There is **no sanctioned pattern** for a package to depend on Umbraco.AI optionally. Verified mechanics:

- `IAIChatService` is a plain singleton registered by Umbraco.AI's composer. `GetService<IAIChatService>()` returns null when absent. Never constructor-inject it non-optionally.
- **A null check is not enough.** .NET prepares a whole method before running any of it. If a method body names an Umbraco.AI type (e.g. `AIOutputSchema`), that type must load when the method is first JIT-compiled, even if the guarded branch never runs. Result: `TypeLoadException` / `FileNotFoundException` on sites without Umbraco.AI.

Mitigation options (decision NOT yet made):

1. **Separate optional assembly/package.** Core UpDoc defines its own small interface (e.g. `IUpDocAiClient`); the optional assembly implements it and is the only place Umbraco.AI types are named. Structurally safe. Also absorbs Umbraco.AI's expected v3 breaking changes without versioning core UpDoc.
2. **Method-boundary isolation in core.** Keep every Umbraco.AI-touching method small and only reachable behind the null check. Works, but fragile: one inlining refactor silently breaks non-AI sites at startup.

Naming note (Dean, 18 Aug): do not reflexively name things "UpDoc.AI". Separate what is actually AI (prompt build, call, parse; small) from what is safe-JSON tooling (validation, which is not AI and belongs in core unconditionally).

## Gaps UpDoc must own

Verified absent from Umbraco.AI: input-size guidance, chunking, token counting, retry/backoff, rate-limit handling. Consequences:

- **Strip the sample extraction before sending** (text plus key metadata only, never raw PdfPig output). This mitigation from `AI_SOURCE_IDENTIFICATION.md` is mandatory, not optional.
- Own retry/backoff around the call.
- `response.Usage?.TotalTokenCount` is available after the fact; surface it so owners can see what a proposal cost.

## Prompts add-on

`Umbraco.AI.Prompt` is a real separate package (17.x line exists). A package can seed editable prompt templates only by convention (check alias on boot, `SavePromptAsync` if absent). No sanctioned registration API; seeded prompts drift once admins edit them. Defer; not needed for Phase 2.

---

## Decisions from the 18 Aug session

These update, but do not rewrite, `AI_SOURCE_IDENTIFICATION.md`:

1. **PDF first, not web first.** April's web-first ordering is superseded. The live migration work is PDF-driven and the PDF extraction path is the most complete. (Dean, 18 Aug.)
2. **Mapping remains the trivial part.** The session started as "a map tool" and re-derived #31's conclusion: source identification is where the hours go. Build rule-writing assistance, not field-matching.
3. **AI is a user.** The framing for all of this: AI performs the task a human would, using the tools a human would. The UI's dropdowns and pickers are what make the human's writes safe; programmatic callers (AI, MCP, hand-edits) need an equivalent gate. Therefore: **validation on every write path to workflow JSON, unconditionally, regardless of caller.** This is core UpDoc work with no AI dependency, valuable on its own (the twice-burned `contentTypeKey` class of bug becomes a write-time rejection).
4. **Two doors, one set of endpoints.** (a) MCP authoring tools for developers and agents: works today, no dependency. (b) Backoffice button via Umbraco.AI for editors: the shipped product experience, later. Both call the same UpDoc endpoints; building (a) first wastes nothing and cheaply tests whether models are actually good at rule-writing.
5. **The endpoints already exist.** The authoring loop is fully covered by the current API: `POST/GET {alias}/sample-extraction`, `POST {alias}/regenerate-destination`, `POST {alias}/transform`, `PUT {alias}/map`. The MCP server (2 tools today: `create-from-source`, `list-workflows`) needs authoring wrappers added; no new backend capability is required for the agent route.
6. **Umbraco Automate is a third surface, optional add-on altitude, not a foundation.** See `AUTOMATE_ROTATOR_EXPERIMENT.md`.

## Next actions (not yet started)

- [ ] Create prerequisite issue: targeted destination fields (`targeted: true` on `destination.json`).
- [ ] Create prerequisite issue: web/markdown identify-via-rules consistency (verify whether it still blocks a PDF-first Phase 2, or can be deferred).
- [ ] Update issue #31: unpark, link this doc, note PDF-first reordering.
- [ ] Decide the optional-dependency approach (option 1 vs 2 above).
- [ ] Short code spike in the test site: install Umbraco.AI 17.x plus one provider, one `FromJsonSchema` call, confirm `TryGetResult` round-trip.
- [ ] Design the write-path validation gate (core, no AI).

## Sources

- https://github.com/umbraco/Umbraco.AI (source read at `v17/dev` and tags 1.4.1 through 17.0.0)
- https://docs.umbraco.com/ai-in-umbraco (structured output, IAIChatService reference, contexts, advanced options)
- NuGet flat-container metadata for `Umbraco.AI`, `Umbraco.AI.Startup`, `Umbraco.AI.Prompt`
