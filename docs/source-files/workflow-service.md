# WorkflowService.cs

Service that manages workflow config JSON files in the `updoc/workflows/` directory at the site root.

## What it does

Provides CRUD operations for workflow folders and their config files (source.json, destination.json, map.json, sample-extraction.json). Loads configs from disk, validates them, and supports both batch loading (all workflows) and direct single-workflow loading.

## Interface

```csharp
public interface IWorkflowService
{
    IReadOnlyList<WorkflowSummary> GetAllWorkflowSummaries();
    IReadOnlyList<DocumentTypeConfig> GetAllConfigs();
    DocumentTypeConfig? GetConfigByName(string name);
    void CreateWorkflow(string name, string documentTypeAlias, string sourceType, string? blueprintId, string? blueprintName);
    void DeleteWorkflow(string name);
    void SaveDestinationConfig(string name, DestinationConfig config);
    void SaveMapConfig(string name, MapConfig config);
    void SaveSampleExtraction(string name, RichExtractionResult extraction);
    RichExtractionResult? GetSampleExtraction(string name);
}
```

| Method | Description |
|--------|-------------|
| `GetAllWorkflowSummaries` | Returns lightweight summaries for the collection view |
| `GetAllConfigs` | Loads all workflows with full validation |
| `GetConfigByName` | Loads a single workflow directly from disk **without validation** — for workspace editing |
| `CreateWorkflow` | Creates a workflow folder with stub JSON files |
| `DeleteWorkflow` | Deletes a workflow folder |
| `SaveDestinationConfig` | Writes destination.json |
| `SaveMapConfig` | Writes map.json |
| `SaveSampleExtraction` | Writes sample-extraction.json |
| `GetSampleExtraction` | Reads sample-extraction.json |

## Key concepts

### GetConfigByName vs GetAllConfigs vs GetConfigForBlueprint

`GetAllConfigs()` runs `ValidateConfig()` which checks that all map.json targets exist in destination.json. Workflows that fail validation are skipped — this is correct for the collection view (only show complete workflows).

`GetConfigByName(name)` loads directly from disk without validation — the workflow workspace needs to edit partially-complete workflows where mappings may reference targets that haven't been fully validated yet.

`GetConfigForBlueprint(blueprintId)` finds all workflows matching a blueprint and **merges** them into a single `DocumentTypeConfig`. Sources from all workflows are combined, but map.json and destination.json come from the **first** matching workflow only. This is used by the Create from Source modal to discover available source types, but is **not** suitable for document creation — use per-workflow config instead.

### Per-workflow config for document creation

When multiple workflows share the same blueprint (e.g., "Group Tour from PDF" and "Group Tour from Web"), each has its own map.json with source-type-specific mappings. The merged config from `GetConfigForBlueprint` only includes the first workflow's map.json, which is incorrect for non-first source types.

The frontend workaround: during extraction, the modal fetches per-workflow config via `fetchWorkflowByAlias()` and uses it for `#handleSave`. The C# merge logic in `GetConfigForBlueprint` is a known limitation — the frontend-side per-workflow fetch is the correct approach per the planning docs (DESTINATION_DRIVEN_MAPPING.md Decision #1: "Workflows are per-source-type").

### Validation fix

`ValidateConfig` uses `field.Alias` (human-readable like "pageTitle") to build the set of valid destination keys, not `field.Key` (GUIDs). The frontend writes aliases to map.json targets, so validation must match against aliases.

### UpdateSortOrder

Updates the sort order of areas within a page or sections within an area.

```csharp
TransformResult? UpdateSortOrder(string workflowAlias, int page, string? areaName, List<string> sortedIds);
```

- When `areaName` is null: assigns `SortOrder` values (0, 1, 2...) to areas on the specified page, matched by name
- When `areaName` is provided: assigns `SortOrder` values to sections within that area, matched by section ID
- Reads `transform.json`, updates sort order values, saves back to disk
- Returns the updated `TransformResult`, or null if the transform file doesn't exist

## Registration

Registered as a singleton via `UpDocComposer`:

```csharp
builder.Services.AddSingleton<IWorkflowService, WorkflowService>();
```

## Dependencies

- `IWebHostEnvironment` — for `ContentRootPath` to locate the workflows directory
- `ILogger<WorkflowService>` — for logging load status and errors

## Namespace

```csharp
namespace UpDoc.Services;
```
