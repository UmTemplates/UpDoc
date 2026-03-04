---
title: "PdfExtractionController.cs"
---


API controller that exposes PDF extraction functionality to the Umbraco backoffice.

## What it does

Provides Management API endpoints for extracting content from PDFs:

1. Accepts a media item's unique ID (GUID)
2. Retrieves the media item from Umbraco
3. Gets the file path from the media properties
4. Calls the PDF extraction service
5. Returns the extracted text and page count

## Endpoint

```
GET /umbraco/management/api/v1/updoc/extract?mediaKey={guid}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| mediaKey | Guid | The unique identifier of the media item |

### Response

```json
{
    "text": "Extracted text content...",
    "pageCount": 4
}
```

### Error responses

- `404 Not Found` - Media item not found or file not on disk
- `400 Bad Request` - Media has no file or extraction failed

## Section extraction endpoint

```
GET /umbraco/management/api/v1/updoc/page-section?mediaKey={guid}&heading={text}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| mediaKey | Guid | The unique identifier of the media item |
| heading | string | The heading text to search for (case-insensitive) |

### Response

```json
{
    "heading": "Suggested Itinerary",
    "content": "Day 1: Arrive in...\nDay 2: Visit..."
}
```

### Error responses

- `404 Not Found` - Media item not found or file not on disk
- `400 Bad Request` - Heading not found or extraction failed

## Markdown extraction endpoint

```
GET /umbraco/management/api/v1/updoc/extract-markdown?mediaKey={guid}
```

Extracts the full PDF content as Markdown with column detection for multi-column layouts.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| mediaKey | Guid | The unique identifier of the media item |

### Response

```json
{
    "title": "The Castles and Gardens of Kent",
    "subtitle": "5 days from £889",
    "markdown": "## Day 1\n\nArrive at...\n\n## Day 2\n\nVisit...",
    "rawText": "Full raw text for debugging"
}
```

### Error responses

- `404 Not Found` - Media item not found or file not on disk
- `400 Bad Request` - Extraction failed

## Map file endpoint

```
GET /umbraco/management/api/v1/updoc/maps/{blueprintId}
```

Returns the map file configuration for a given blueprint.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| blueprintId | Guid | The blueprint unique identifier |

### Response

Returns the full `MapFile` JSON object (name, documentTypeAlias, blueprintId, sourceTypes, propertyMappings).

### Error responses

- `404 Not Found` -- No map file found for the given blueprint

## Section extraction endpoint (config-driven)

```
GET /umbraco/management/api/v1/updoc/extract-sections?mediaKey={guid}&blueprintId={guid}&sourceType=pdf
```

Extracts structured sections from a source document using the extraction rules defined in the config for the given blueprint. Routes to the correct extraction service based on `sourceType`.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| mediaKey | Guid | The unique identifier of the media item |
| blueprintId | Guid | The blueprint unique identifier (used to look up the config) |
| sourceType | string | The source type (`pdf` or `markdown`). Defaults to `pdf`. |

### Response

```json
{
    "sections": {
        "title": "The Castles and Gardens of Kent",
        "description": "5 days from £889",
        "content": "## Day 1\n\nArrive at..."
    },
    "propertyMappings": [
        {
            "from": { "sectionType": "title" },
            "to": { "property": "pageTitle", "alsoMapTo": ["pageTitleShort"] }
        }
    ]
}
```

The response includes both the extracted `sections` and the `propertyMappings` from the map file, so the frontend can apply each mapping to the document being created.

### Error responses

- `404 Not Found` -- No map file found for the blueprint, or media item not found
- `400 Bad Request` -- Map file has no PDF extraction rules, or extraction failed

### Private helper: ResolveMediaFilePath

The new endpoints use a shared `ResolveMediaFilePath(Guid mediaKey)` private method that encapsulates the media lookup and file path resolution logic (handling both JSON and simple path formats for `umbracoFile`). Returns `null` if the media item is not found or the file does not exist on disk.

## Key concepts

### Umbraco 17 Management API

Uses the new Management API pattern introduced in Umbraco 14+:
- `[ApiVersion("1.0")]` - API versioning
- `[MapToApi("updoc")]` - API grouping for Swagger
- `[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]` - Backoffice auth
- `[JsonOptionsName("UmbracoManagementApi")]` - Umbraco JSON serialization

### Media file path resolution

The `umbracoFile` property can be stored as:
- Simple path: `/media/xxx/file.pdf`
- JSON object: `{"src":"/media/xxx/file.pdf"}`

The controller handles both formats.

## Dependencies

- `IMediaService` -- Umbraco media service
- `IPdfExtractionService` -- PDF extraction service
- `IPdfPagePropertiesService` -- PDF page properties service
- `IMarkdownExtractionService` -- Markdown extraction service
- `IWorkflowService` -- Map file service for blueprint-to-config lookups
- `IWebHostEnvironment` -- For resolving file paths
- `ILogger<PdfExtractionController>` -- Logging

## Frontend usage

```typescript
const response = await fetch(
    `/umbraco/management/api/v1/updoc/extract?mediaKey=${mediaUnique}`,
    {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    }
);
```
