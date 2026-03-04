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
