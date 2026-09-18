---
title: "Backend (C#)"
---


The UpDoc server-side code handles PDF/Markdown extraction, workflow configuration, and the Management API endpoints.

All source files are in `src/UpDoc/`.

| File | Description |
|------|-------------|
| [PdfExtractionService.cs](../source-files/pdf-extraction-service.md) | Orchestrates PDF extraction — loads media, delegates to page properties service |
| [PdfPagePropertiesService.cs](../source-files/pdf-page-properties-service.md) | Strategy-driven section extraction from PDF pages using PdfPig |
| [MarkdownExtractionService.cs](../source-files/markdown-extraction-service.md) | Extracts sections from Markdown files using heading-based splitting |
| [PdfExtractionController.cs](../source-files/pdf-extraction-controller.md) | Management API controller — endpoints for extraction, config, and workflow management |
| [UpDocComposer.cs](../source-files/up-doc-composer.md) | Umbraco composer that registers all UpDoc services with dependency injection |
| [WorkflowModels.cs](../source-files/workflow-models.md) | C# models for workflow JSON files (source, destination, map configs) |
| [WorkflowService.cs](../source-files/workflow-service.md) | Reads and manages workflow folders — scans `updoc/workflows/`, loads configs, lists active workflows |

## Creating documents from a source

Until these existed, creating a document from a source was browser TypeScript only, so a browser was the only way to run an import. Together they are what [the API](../api/) and [the MCP server](../mcp/) call.

| File | Description |
|------|-------------|
| [CreateFromSourceController.cs](../source-files/create-from-source-controller.md) | The `create-from-source` endpoint |
| [DocumentCreationService.cs](../source-files/document-creation-service.md) | Resolve workflow, extract, scaffold, map, create — the whole import |
| [MappingApplicationService.cs](../source-files/mapping-application-service.md) | Applies `map.json` to a document's property values |
| [SectionLookupBuilder.cs](../source-files/section-lookup-builder.md) | Flattens transform sections into the `sectionId.part` keys mappings address |
| [ValueCoercion.cs](../source-files/value-coercion.md) | Turns captured text into numbers and dates, refusing ambiguous input |
| [MarkdownStripper.cs](../source-files/markdown-stripper.md) | Strips markdown for plain-text destinations |
| [MarkdownConversionService.cs](../source-files/markdown-conversion-service.md) | Markdown to HTML for rich text destinations |
| [MediaFilePathResolver.cs](../source-files/media-file-path-resolver.md) | Turns a media key into a file on disk |
| [UpDocControllerBase.cs](../source-files/up-doc-controller-base.md) | Shared `ProblemDetails` error responses |

## Design notes

Problems recorded with their reasoning, whether or not they are fixed yet.

| Note | Covers |
|------|--------|
| [Stable Section Identity](stable-section-identity.md) | Why section IDs shift when a workflow is restructured, and how they are kept stable |
| [Multi-Workflow Blueprint Resolution](multi-workflow-blueprint-resolution.md) | **Known defect.** Two workflows on one blueprint apply the wrong map, and corrupt the singleton cache doing it |
