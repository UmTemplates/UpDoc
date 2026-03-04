# WorkflowController.cs

ASP.NET Core API controller for UpDoc workflow CRUD operations.

## Route

`/umbraco/management/api/v1/updoc/workflows`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Returns all workflow summaries |
| GET | `/active` | Returns document type aliases and blueprint IDs with complete workflows |
| GET | `/{name}` | Returns full configuration for a specific workflow (bypasses validation) |
| POST | `/` | Creates a new workflow folder with stub files + auto-populates destination.json |
| DELETE | `/{name}` | Deletes a workflow folder |
| POST | `/{name}/sample-extraction` | Extracts content from a source (PDF, Markdown, or Web URL) and saves as sample extraction. For markdown/web sources, also auto-generates transform.json via `ConvertStructuredToTransformResult` (deterministic heading-based grouping) |
| GET | `/{name}/sample-extraction` | Returns the saved sample extraction |
| POST | `/{name}/regenerate-destination` | Regenerates destination.json from the blueprint |
| PUT | `/{name}/map` | Saves updated map.json |
| POST | `/{name}/transform` | Runs area detection and content transform on the workflow's sample extraction |
| GET | `/{name}/transform` | Returns the saved transform result |
| POST | `/{name}/transform-adhoc` | Runs extract + transform against a media item or URL for a specific workflow (used by Create from Source modal) |
| PUT | `/{alias}/transform/sort-order` | Updates sort order of areas or sections in transform.json |
| GET | `/by-alias/{alias}` | Returns full configuration for a workflow matching a source type alias (per-workflow config for document creation) |

### GET /{name} — Direct config loading with auto-regeneration

Uses `GetConfigByName(name)` which loads the workflow config directly from disk without running validation. This is important because validation rejects workflows with partially-complete mappings (e.g., mappings referencing aliases that haven't been fully wired yet). The workspace editor needs to load these in-progress configs.

After loading, the endpoint always regenerates `destination.json` from the current blueprint content. This ensures the Destination tab reflects the latest blueprint state (block ordering, property changes, etc.) without requiring manual regeneration. If regeneration fails, the cached file on disk is used as a fallback.

## Dependencies

- `IWorkflowService` — handles workflow file operations, config loading, and validation
- `IDestinationStructureService` — builds destination.json from blueprint content
- `IPdfPagePropertiesService` — detects areas in PDFs via `DetectAreas()`
- `IContentTransformService` — assembles area detection into sections via `Transform()`
- `IMediaService` — resolves media file paths
- `IWebHostEnvironment` — provides web root path for file resolution

## DocumentTypeController.cs

A companion controller at `/umbraco/management/api/v1/updoc/document-types` provides endpoints for the Create Workflow modal pickers:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Returns all non-element document types (alias, name, icon, id) |
| GET | `/{alias}/blueprints` | Returns blueprints for a given document type |

### Dependencies

- `IContentTypeService` — Umbraco core service for document type lookups
- `IContentService` — Umbraco core service for blueprint lookups

## Authentication

All endpoints require `BackOfficeAccess` authorization policy. Frontend calls must include a bearer token from `UMB_AUTH_CONTEXT`.

## Used by

- `up-doc-workflows-view.element.ts` — CRUD operations on workflows
- `create-workflow-sidebar.element.ts` — document type and blueprint picker data
- `workflow.service.ts` — fetches active workflows, full configs, sample extractions, and saves map configs
- `up-doc-workflow-source-view.element.ts` — sample extraction trigger and retrieval
