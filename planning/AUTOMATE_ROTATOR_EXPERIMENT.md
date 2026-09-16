# Umbraco Automate: Findings and the Rotator Experiment

**Status:** Proposed experiment. No build committed.
**Date:** 18 August 2026
**Origin:** Blue-sky session. Dean watched an Automate demo and identified rotator population as a candidate. Findings verified against the Automate source (`github.com/umbraco/Umbraco.Automate`, shallow clone of `main` and `v17/main`) and docs.

---

## What Umbraco Automate is

Visual automation engine inside the backoffice, launched at Codegarden June 2026. Flows are built on a canvas from **triggers** (events) and **actions** (units of work), with data flowing between steps.

Key verified facts:

| Fact | Detail |
|---|---|
| Licence | MIT, free, no licence key |
| Version for us | `Umbraco.Automate` 17.2.0, requires CMS >= 17.4.0, `net10.0`. Fits UpDoc's 17.5.3 |
| Custom actions | One C# class inheriting `ActionBase<TSettings, TOutput>`, settings POCO with `[Field]` attributes. Canvas UI auto-generated. **Auto-discovered by attribute; zero registration, zero frontend** |
| Custom triggers | Same pattern (`TriggerBase`, `NotificationTriggerBase`). Packages can also fire triggers programmatically via `ITriggerDispatcher`, optionally targeting one specific automation |
| Data between steps | Typed step outputs referenced by bindings: `${ trigger.mediaKey }`, `${ steps.listSites.sites }`, `${ previous.x }`. Control flow: If, Switch, ForEach, While, Parallel |
| AI steps | Separate `Umbraco.AI.Automate` add-on, built on Umbraco.AI. `Run Agent` action (structured-output fields become named bindings) and `Transcribe Audio`. Also triggers: agent-run-completed and "agent invokes automation as a tool" |
| Human approval | Built-in `Request Approval` action: durably suspends the run, Approvals dashboard, permission-gated, optional auto-reject timeout, approved/rejected branch handles on the canvas |
| Run history | Full per-step audit of what each step produced |

## Caveats

1. **The Manual trigger takes no payload.** An editor can "Run now" on an automation, but there is no content/media entity action that starts a flow with a chosen item. "Editor picks a PDF and runs this" is not an out-of-the-box shape. Event-driven shapes (Content Published, Media Saved, filtered by type) are the native fit. A package can close the gap by firing its own trigger from its own UI via `ITriggerDispatcher`.
2. **Two months old.** Breaking changes are landing in minor releases (approval outcomes changed in 18.2.0). Fortnightly cadence. 18.x is the lead line; 17.x lags slightly. Fine for a thin optional add-on; wrong for a foundation.
3. AI steps drag in the `Umbraco.AI` + `Umbraco.AI.Automate` dependency chain (site owner installs these, not UpDoc).

## Strategic position (agreed 18 Aug)

- Automate is a **third surface** alongside the MCP server and a future backoffice button. Same principle as the others: UpDoc's engine, JSON storage and endpoints stay UpDoc's; Automate provides orchestration glue, review queue and audit trail we would otherwise build ourselves.
- If UpDoc integrates, it is as a thin optional **add-on package** exposing 2-3 actions (e.g. extract, create-document) and possibly a trigger (workflow-completed). A handful of classes given the auto-discovery model.
- **Not now.** First, learn the product by using it on the Tailored Travel mirror, where nothing shipped is at risk. That is the rotator experiment.

---

## The rotator experiment

**Goal:** when a Tailored Tour is published with a placeholder rotator, populate the rotator's images automatically, with human approval. Currently a repeated manual/MCP-session chore in the migration (~135 tours remaining).

This is a **Tailored Travel site automation, not an UpDoc feature**. It touches nothing in the RCL. It is the cheapest possible way to learn Automate's real behaviour before deciding on an UpDoc add-on.

### The flow

| # | Step | Mechanism | Exists? |
|---|---|---|---|
| 1 | Tailored Tour published | Content Published trigger, filtered by content type | Built in |
| 2 | Has it a rotator with placeholder? Has it an itinerary? | If step over document properties (needs a small read-document action or condition) | Small custom action |
| 3 | List the sites/places named in the itinerary (and the sites section) | `Run Agent` with structured output: list of site names | Built in (AI add-on) |
| 4 | Find similar tours, collect the images they use | Custom action: content query | Custom action |
| 5 | Match media library image names against the site list | Second `Run Agent` step. NOTE: this is fuzzy matching ("Hagia Sophia" vs `hagia-sofia-exterior-02.jpg`), an AI task, not string comparison | Built in (AI add-on) + custom media-search action to supply candidates |
| 6 | Human review | `Request Approval` step, approve/reject branches | Built in |
| 7 | Update the rotator block's media values | Custom action: surgical block-property update. The block already exists with a placeholder; this is an update of one property inside an existing block, matched by `contentTypeKey`. Same proven pattern as the MCP surgical edits, moved server-side | Custom action |

### Where the intermediate lists live

Nowhere persistent, by design. Each step's output lives in the run and is consumed via bindings (`${ steps.listSites.sites }`). Run history keeps the audit of what the AI proposed. No new storage, no temp files, no schema.

### What needs building

Three or four small custom actions in a Tailored Travel-side project (mirror first):

1. Read-document properties (for the If conditions), unless a built-in condition proves sufficient.
2. Similar-tours query.
3. Media search returning candidate image names for a folder/scope.
4. Surgical rotator update (port of the proven MCP surgical block-property pattern to C#).

Plus: Umbraco.AI + a provider + `Umbraco.AI.Automate` installed on the mirror, an agent configured with a structured-output schema for the site list.

### Test fixtures

The mirror already contains migrated tours with correctly populated rotators. Method: take one, empty its rotator back to placeholder, republish, and diff the automation's output against the hand-chosen images.

### What the experiment tells us

- Whether Automate's canvas, bindings and approval flow hold up in real use.
- Whether `Run Agent` structured output is reliable enough for list-extraction and fuzzy matching.
- Whether the custom-action developer experience is as light as the source suggests.
- Consequently: whether an official `UpDoc` Automate add-on is worth shipping, and what its actions should be.

## Open questions

1. Does Automate ship built-in content-read/content-update actions that remove the need for custom actions 1 and 4? (Docs list built-in triggers thoroughly; the built-in action catalogue was not exhaustively verified.)
2. Trigger loop risk: step 7 saves/publishes the document, which could re-fire the Content Published trigger. Automate has idempotency keys and circuit breakers per automation; verify the correct pattern (e.g. save without publish, or filter re-entry) during the experiment.
3. Which agent/provider the mirror should use, and cost per run.

## Sources

- https://github.com/umbraco/Umbraco.Automate (MIT; `Umbraco.Automate.Core` actions/triggers/bindings source)
- https://docs.umbraco.com/umbraco-automate (extending: custom-action, custom-trigger; concepts: triggers; add-ons: AI; backoffice: approvals)
- https://umbraco.com/blog/launching-umbraco-automate/
- NuGet flat-container metadata for `umbraco.automate` (17.0.0-beta through 18.2.0)
