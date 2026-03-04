---
title: "workflow.service.ts"
---


Frontend service for fetching config, active workflows, and extracting sections from the UpDoc backend API.

## What it does

Provides exported async functions that communicate with the backend API:

1. `fetchActiveWorkflows` -- retrieves which workflows are complete (have destination + map + source)
2. `fetchConfig` -- retrieves the combined config (source, destination, map) for a blueprint
3. `extractSections` -- extracts structured sections from a media item using the config's extraction rules
4. `clearConfigCache` -- clears all in-memory caches

All functions require a bearer token for Umbraco Management API authentication.

## Functions

### fetchActiveWorkflows

```typescript
export async function fetchActiveWorkflows(
    token: string
): Promise<ActiveWorkflows>
```

Fetches the list of document type aliases and blueprint IDs that have complete workflows from `GET /umbraco/management/api/v1/updoc/workflows/active`.

- Returns an `ActiveWorkflows` object containing:
  - `documentTypeAliases` -- string array of document type aliases with complete workflows
  - `blueprintIds` -- string array of blueprint IDs with complete workflows
- Uses a **global singleton cache** with deduplication (concurrent calls share one request)
- Returns `{ documentTypeAliases: [], blueprintIds: [] }` on error (fails silently)
- Cache persists for the browser session; cleared by `clearConfigCache()`

### fetchConfig

```typescript
export async function fetchConfig(
    blueprintId: string,
    token: string
): Promise<DocumentTypeConfig | null>
```

Fetches the combined config for a blueprint from `GET /umbraco/management/api/v1/updoc/config/{blueprintId}`.

- Uses an in-memory `Map<string, DocumentTypeConfig>` cache to avoid repeated network requests
- Returns `null` and logs a warning if no config exists for the blueprint (404 response)
- Returns the cached config on subsequent calls with the same `blueprintId`

### extractSections

```typescript
export async function extractSections(
    mediaKey: string,
    blueprintId: string,
    token: string,
    sourceType: string = 'pdf'
): Promise<ExtractSectionsResponse | null>
```

Calls `GET /umbraco/management/api/v1/updoc/extract-sections?mediaKey={mediaKey}&blueprintId={blueprintId}&sourceType={sourceType}` to extract content from a media item using the config's extraction rules. The `sourceType` parameter (default `'pdf'`) tells the backend which extraction service to use.

- Returns an `ExtractSectionsResponse` containing:
  - `sections` -- a `Record<string, string>` of extracted values keyed by section key
  - `config` -- the full `DocumentTypeConfig` for property mapping
- Returns `null` and logs the error if the request fails
- Does not cache results (each media item extraction is unique)

### clearConfigCache

```typescript
export function clearConfigCache(): void
```

Clears the in-memory config cache. Useful when configs have been modified and need to be reloaded.

### saveSortOrder

```typescript
export async function saveSortOrder(
    workflowAlias: string,
    page: number,
    areaName: string | null,
    sortedIds: string[],
    token: string
): Promise<TransformResult | null>
```

Saves a new sort order for areas within a page (when `areaName` is null) or sections within an area (when `areaName` is provided). Calls `PUT /umbraco/management/api/v1/updoc/workflows/{alias}/transform/sort-order`.

- Returns the updated `TransformResult` with new `sortOrder` values applied
- Returns `null` if the request fails
- The backend updates `transform.json` with `sortOrder` indices (0-based)

## Key concepts

### In-memory caches

Two module-level caches persist for the browser session:

```typescript
const configCache = new Map<string, DocumentTypeConfig>();

let activeWorkflowsCache: ActiveWorkflows | null = null;
let activeWorkflowsPromise: Promise<ActiveWorkflows> | null = null;
```

The config cache avoids re-fetching per-blueprint configs. The active workflows cache avoids re-fetching the global workflow list — this is shared between the condition (visibility check) and the action (blueprint filtering).

The `activeWorkflowsPromise` ensures concurrent callers (e.g., condition evaluating on multiple nodes) share a single in-flight request rather than making duplicate calls.

### Authentication

Both functions pass the bearer token in the `Authorization` header:

```typescript
headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
}
```

The token is obtained from `UMB_AUTH_CONTEXT` by the calling code.

### Error handling

All functions handle non-OK responses gracefully:
- `fetchActiveWorkflows` returns empty arrays (fails silently so the condition defaults to hidden)
- `fetchConfig` returns `null` with a `console.warn`
- `extractSections` parses the error body and logs it with `console.error`, then returns `null`

### API response passthrough

The `extractSections` function passes through the API response directly:

```typescript
// API returns { sections, config } - pass through directly
return response.json();
```

This keeps the service simple -- all extraction and config loading happens on the backend.

## Imports

```typescript
import type { DocumentTypeConfig, ExtractSectionsResponse } from './workflow.types.js';
```

## Used by

- `up-doc-has-workflows.condition.ts` -- calls `fetchActiveWorkflows` to decide whether to show the entity action
- `up-doc-action.ts` -- calls `fetchActiveWorkflows` to filter the blueprint picker; uses the config from the modal value to apply mappings
- `up-doc-modal.element.ts` -- calls `extractSections` when a source document (PDF or Markdown) is selected
