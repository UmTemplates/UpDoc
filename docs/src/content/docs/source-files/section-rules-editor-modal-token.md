---
title: "section-rules-editor-modal.token.ts"
---


Modal token for the section rules editor sidebar.

## What it does

Defines the data contract and default configuration for opening the section rules editor modal. Uses Umbraco's `UmbModalToken` pattern with typed data in/value out.

## Interfaces

### `SectionRulesEditorModalData`

Data passed when opening the modal:

| Property | Type | Description |
|----------|------|-------------|
| `workflowName` | `string` | Name of the workflow (for context, not used in modal) |
| `sectionId` | `string` | Transform section ID (e.g., `"preamble-p1-z1"`, `"features"`) |
| `sectionHeading` | `string` | Human-readable section heading for the modal title |
| `elements` | `AreaElement[]` | The elements belonging to this section (from area detection) |
| `existingRules` | `SectionRuleSet \| null` | Existing rules for this section, if any |

### `SectionRulesEditorModalValue`

Value returned when the modal is submitted:

| Property | Type | Description |
|----------|------|-------------|
| `rules` | `SectionRuleSet` | The updated rule set for this section |

## Token

- **Alias**: `UpDoc.SectionRulesEditorModal`
- **Type**: sidebar
- **Size**: medium
