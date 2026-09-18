---
title: "Multi-Workflow Blueprint Resolution"
description: "Why two workflows on one blueprint silently apply the wrong map, what it corrupts, and the four sprints that would fix it."
---

:::caution[Known defect, not yet fixed]
When two or more workflows target the same blueprint, `GetConfigForBlueprint` merges their sources but returns the first workflow's map and destination. The second source type becomes selectable and then imports through the wrong mappings, with no error.

**Not reachable with one workflow per blueprint**, which is the only configuration in production use today. Recorded here because the merge branch exists and will fire the moment a second workflow is added.
:::

## What the code does

`src/UpDoc/Services/WorkflowService.cs`:

```csharp
public DocumentTypeConfig? GetConfigForBlueprint(Guid blueprintId)
{
    var configs = LoadConfigs();
    var idString = blueprintId.ToString();
    var matching = configs.Where(c =>
        !string.IsNullOrEmpty(c.Destination.BlueprintId) &&
        c.Destination.BlueprintId.Equals(idString, StringComparison.OrdinalIgnoreCase))
        .ToList();

    if (matching.Count == 0) return null;
    if (matching.Count == 1) return matching[0];

    // Multiple workflows for same blueprint (e.g. PDF + web) - merge their Sources
    var merged = matching[0];
    for (int i = 1; i < matching.Count; i++)
    {
        foreach (var kvp in matching[i].Sources)
        {
            merged.Sources.TryAdd(kvp.Key, kvp.Value);
        }
    }
    return merged;
}
```

The intent is reasonable: make every source type configured for a blueprint appear available. The problem is what comes back with them.

## Why it is wrong

`DocumentTypeConfig` holds **one** map, **one** destination and **one** folder path:

```csharp
public string FolderPath { get; set; } = string.Empty;
public string DocumentTypeAlias { get; set; } = string.Empty;
public Dictionary<string, SourceConfig> Sources { get; set; } = new();
public DestinationConfig Destination { get; set; } = new();
public MapConfig Map { get; set; } = new();
```

Only `Sources` is merged. So the returned config advertises the second workflow's source type while carrying the first workflow's mappings.

Choose that source type and the extraction runs correctly, then the values land according to a map that was never written for them. Fields end up empty or holding the wrong content. **Nothing errors.**

## Three consequences, in order of severity

### 1. It corrupts shared state, permanently

`merged` is a reference to `matching[0]`, not a copy. `TryAdd` writes into the object held in the service's cache.

`WorkflowService` is registered as a **singleton**:

```csharp
builder.Services.AddSingleton<IWorkflowService, WorkflowService>();
```

and `LoadConfigs()` caches into an instance field, cleared only by an explicit `ClearCache()`.

So a single call on a doubly-configured blueprint pollutes the first workflow's config **for the lifetime of the process**. Every later caller of `GetConfigForBlueprint`, `GetConfigForDocumentType` or `GetAllConfigs` sees sources that do not belong to that workflow.

This is the part that makes the defect worse than "one call gets the wrong map". One call poisons the well.

### 2. The default source type becomes non-deterministic

`DocumentCreationService` falls back when no source type is given:

```csharp
request.SourceType ?? config.Sources.Keys.FirstOrDefault() ?? "pdf"
```

On a merged config, `FirstOrDefault()` returns whichever workflow happened to load first, which depends on directory enumeration order.

### 3. The workflow is misreported

`DocumentCreationService` derives the alias from the config's folder path:

```csharp
Path.GetFileName(config.FolderPath)
```

A merged config carries the **first** workflow's folder path. So an import running the second workflow's source type is reported, in the API response and the logs, as the first workflow.

That makes the failure harder to diagnose than it needs to be: the evidence points at the wrong workflow.

## How it is reached

Three call sites, all funnelling through the same method:

| Caller | Path |
|---|---|
| `PdfExtractionController.GetConfigForBlueprint` | `GET /updoc/config/{blueprintId}` |
| `PdfExtractionController` (second call site) | Config lookup during extraction |
| `DocumentCreationService.CreateAsync` | The create endpoint, and therefore the MCP tool |

The backoffice reaches the first of these from `workflow.service.ts`:

```typescript
`/umbraco/management/api/v1/updoc/config/${blueprintId}`
```

So both the browser path and the API path hit it. There is no route that avoids the merge.

## Why this has not bitten anyone

Production use is one workflow per blueprint. With `matching.Count == 1` the method returns early and the merge never executes.

The exposure begins the moment a second workflow points at a blueprint that already has one, which is a supported and natural thing to do: a PDF workflow and a web workflow producing the same page type is exactly the case the merge was written for.

## Three ways to fix it

### Option 1: resolve by workflow, not by blueprint

Pass the source type or workflow alias into the lookup and return that workflow's own config.

**Most correct.** A blueprint plus a source type identifies exactly one workflow, which is the real relationship. The current signature asks a question that does not have one answer.

**Largest change.** Every caller has to know which source type it means, including the backoffice, which currently resolves config before the user has chosen a source.

### Option 2: move `Map` under `Sources`

One map per source type, merged alongside the sources it belongs to.

**Matches how the data is used.** A map describes how to read one kind of source into one blueprint, and pairing them makes that explicit.

**Config schema change**, so existing workflow folders need migrating, and `map.json` moves or gains a level.

### Option 3: refuse to merge

Return the single match, or nothing, and raise a validation warning when two workflows claim one blueprint.

**Smallest change, and honest.** The system stops advertising support it does not have. `list-workflows` already surfaces validation warnings, so the reporting channel exists.

**Does not deliver the feature.** Two source types for one blueprint remains unsupported, it is just no longer silently broken.

## Recommended sequencing

Four sprints, each independently testable and shippable.

### Sprint 1: stop the corruption

Copy rather than mutate. Whatever else changes, `GetConfigForBlueprint` must not write into the cache.

```csharp
var merged = CloneConfig(matching[0]);
```

**Small, safe, and correct under every option below.** Worth doing on its own even if nothing else is scheduled, because it converts a persistent state bug into a transient one.

**Testable by:** calling the method twice on a doubly-configured blueprint and asserting the first workflow's `Sources` is unchanged after the first call.

### Sprint 2: make it honest

Implement option 3. Refuse the merge, emit a validation warning naming both workflows, and surface it through `list-workflows` and the workflow list in the backoffice.

**Testable by:** configuring two workflows on one blueprint and asserting the warning appears and no silently-wrong import is possible.

After this sprint the defect is closed. What follows is the feature it was standing in for.

### Sprint 3: resolve by source type

Implement option 1 at the service layer. Add an overload taking a source type, keep the existing signature working for the single-workflow case, and move `DocumentCreationService` onto it first, since it already knows the source type.

**Testable by:** creating from each source type on a doubly-configured blueprint and asserting each uses its own map, destination and reported alias.

### Sprint 4: move the backoffice onto it

The modal resolves config before a source type is chosen, so this needs a UI change as well as a service one: either resolve later, or resolve per source type as the user picks.

**Testable by:** the existing `create-from-source` E2E spec, extended to cover a blueprint with two workflows.

Option 2 is not in this sequence. It is a cleaner eventual shape, but it is a schema migration, and sprints 1 to 3 remove the defect without one. Worth revisiting only if the map genuinely needs to differ per source in ways the destination does not.

## Related

- Issue [#153](https://github.com/UmTemplates/UpDoc/issues/153): the tracked work, with these sprints as a checklist
- [WorkflowService.cs](../source-files/workflow-service.md): where the method lives
- [Two Implementations](../mcp/two-implementations/): the backoffice and the endpoint both reach this code
- [Stable Section Identity](./stable-section-identity/): another design problem recorded before it was fixed
