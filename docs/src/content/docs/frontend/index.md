---
title: "Frontend (TypeScript)"
---


The UpDoc backoffice extension is built with [Lit](https://lit.dev/) web components and TypeScript, following Umbraco's extension patterns.

All source files are in `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/`.

| File | Description |
|------|-------------|
| [index.ts](../source-files/index.md) | Entry point that registers all extension manifests with Umbraco |
| [manifest.ts](../source-files/manifest.md) | Extension manifest definitions — entity actions, modals, conditions, settings, and collection actions |
| [up-doc-action.ts](../source-files/up-doc-action.md) | Entity action that handles "Create Document from Source" from the content tree |
| [up-doc-collection-action.element.ts](../source-files/up-doc-collection-action-element.md) | Collection toolbar button for "Create from Source" in list views |
| [up-doc-has-workflows.condition.ts](../source-files/up-doc-has-workflows-condition.md) | Condition that hides the entity action when no workflows are configured |
| [up-doc-modal.element.ts](../source-files/up-doc-modal-element.md) | Source sidebar modal — source type selection, media picker, extraction preview |
| [up-doc-modal.token.ts](../source-files/up-doc-modal-token.md) | Modal token defining the data/value contract for the source sidebar |
| [blueprint-picker-modal.element.ts](../source-files/blueprint-picker-modal-element.md) | Blueprint picker dialog — document type and blueprint selection |
| [blueprint-picker-modal.token.ts](../source-files/blueprint-picker-modal-token.md) | Modal token for the blueprint picker |
| [workflow.types.ts](../source-files/workflow-types.md) | TypeScript type definitions for workflow configs |
| [workflow.service.ts](../source-files/workflow-service-ts.md) | API service for fetching workflows, configs, and extraction results |
| [up-doc-workflows-view.element.ts](../source-files/up-doc-workflows-view-element.md) | Settings workspace view listing configured workflows |
| [transforms.ts](../source-files/transforms.md) | Markdown-to-HTML conversion and RTE value building |
