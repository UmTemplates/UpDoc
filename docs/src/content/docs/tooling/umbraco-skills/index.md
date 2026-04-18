---
title: "Umbraco Claude Skills"
---


The [Umbraco CMS Backoffice Skills](https://github.com/umbraco/Umbraco-CMS-Backoffice-Skills) are Claude Code plugins that provide guidance on building Umbraco backoffice extensions. They contain official documentation, patterns, and working examples for each extension type.

## Installation

```bash
/plugin marketplace add umbraco/Umbraco-CMS-Backoffice-Skills
/plugin install umbraco-cms-backoffice-skills@umbraco-backoffice-marketplace
/plugin install umbraco-cms-backoffice-testing-skills@umbraco-backoffice-marketplace
```

## Available Plugins

### umbraco-cms-backoffice-skills (57 skills)

Skills for every Umbraco backoffice extension type:

| Category | Key Skills |
|----------|-----------|
| **Actions** | `umbraco-entity-actions`, `umbraco-collection-action`, `umbraco-entity-bulk-actions`, `umbraco-entity-create-option-action` |
| **UI** | `umbraco-dashboard`, `umbraco-workspace`, `umbraco-modals`, `umbraco-sections`, `umbraco-tree` |
| **Property Editors** | `umbraco-property-editor-ui`, `umbraco-property-editor-schema`, `umbraco-property-action` |
| **Foundation** | `umbraco-context-api`, `umbraco-extension-registry`, `umbraco-conditions`, `umbraco-state-management` |
| **Rich Text** | `umbraco-tiptap-extension`, `umbraco-tiptap-toolbar-extension`, `umbraco-tiptap-statusbar-extension` |

### umbraco-cms-backoffice-testing-skills (8 skills)

| Skill | Purpose |
|-------|---------|
| `umbraco-testing` | Router — helps choose the right testing approach |
| `umbraco-e2e-testing` | Playwright E2E patterns for Umbraco |
| `umbraco-playwright-testhelpers` | `@umbraco/playwright-testhelpers` reference |
| `umbraco-unit-testing` | Unit/component testing with `@open-wc/testing` |
| `umbraco-msw-testing` | Mock Service Worker patterns |
| `umbraco-mocked-backoffice` | Run backoffice with mocked APIs |
| `umbraco-test-builders` | `JsonModels.Builders` for test data |
| `umbraco-example-generator` | Generate testable example extensions |

## When to Use Skills

- **Before implementing any extension type** — invoke the skill first to see official patterns
- **Before writing tests** — use `umbraco-testing` to choose the right approach
- **When something doesn't work** — skills may reveal configuration or registration steps you missed

## Critical Lesson: Skills Are Supplementary

:::caution[Always verify against the Umbraco CMS source code]
Skills provide excellent starting guidance, but the **Umbraco CMS source code** ([github.com/umbraco/Umbraco-CMS](https://github.com/umbraco/Umbraco-CMS)) is the definitive reference. Clone it locally and consult it for:
:::

    - How Umbraco itself implements similar features
    - The actual API signatures and expected behaviour
    - Edge cases not covered in documentation

    **Lesson learned (Feb 2026):** Multiple attempts to implement a collection create option failed because only skills/docs were consulted. The CMS source code revealed the extension point didn't exist in v17. Significant time and tokens were wasted.

### The Right Workflow

1. **Invoke the skill** — get the official pattern and example code
2. **Search the CMS source** — find how Umbraco implements the same extension type internally
3. **Compare and adapt** — use the skill's pattern but verify details against the source
4. **Implement** — with confidence that the approach actually works

## Key Source Paths

```
Umbraco-CMS/src/Umbraco.Web.UI.Client/src/packages/
├── core/          # Core extension types, registries, conditions
├── documents/     # Document-related features
├── media/         # Media handling
├── members/       # Member management
└── ...
```

## References

- [Umbraco CMS Backoffice Skills](https://github.com/umbraco/Umbraco-CMS-Backoffice-Skills) — plugin repository
- [Umbraco CMS source](https://github.com/umbraco/Umbraco-CMS) — definitive reference
- [UUI Storybook](https://uui.umbraco.com/) — base UI primitives
- [Umbraco API Docs Storybook](https://apidocs.umbraco.com/v17/ui/) — composed components and patterns
