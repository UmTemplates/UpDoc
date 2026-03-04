---
title: "up-doc-has-workflows.condition.ts"
---


Custom Umbraco condition that controls when the "Create Document from Source" entity action is visible.

## What it does

Performs a **per-node check**: for each content node, it checks whether any of that node's allowed child document types have a blueprint with a complete UpDoc workflow. If not, the entity action is hidden for that specific node.

This means the "Create Document from Source" menu item only appears on nodes where it would actually work -- e.g., on "Group Tours" (which allows groupTour children with a workflow) but not on "Standard Pages" (which only allows standardWebPage children with no workflow).

## How it works

1. Consumes `UMB_ENTITY_CONTEXT` to get the current node's unique ID (reacts to navigation)
2. Consumes `UMB_AUTH_CONTEXT` to get a bearer token
3. When both are available, evaluates:
   a. Fetches active workflows (cached globally via `fetchActiveWorkflows()`)
   b. Looks up the entity's document type via `UmbDocumentItemRepository`
   c. Gets allowed child types via `UmbDocumentTypeStructureRepository`
   d. For each allowed child type, checks if any blueprint ID is in the active set
   e. Sets `this.permitted = true` on first match, `false` if no matches
4. Re-evaluates when the entity unique changes (navigating between nodes)

```typescript
export class UpDocHasWorkflowsCondition
    extends UmbConditionBase<UpDocHasWorkflowsConditionConfig>
    implements UmbExtensionCondition
{
    #documentTypeStructureRepository = new UmbDocumentTypeStructureRepository(this);
    #blueprintItemRepository = new UmbDocumentBlueprintItemRepository(this);
    #documentItemRepository = new UmbDocumentItemRepository(this);

    constructor(host, args) {
        super(host, args);

        this.consumeContext(UMB_AUTH_CONTEXT, (authContext) => {
            this.#authContext = authContext;
            this.#tryEvaluate();
        });

        this.consumeContext(UMB_ENTITY_CONTEXT, (entityContext) => {
            this.observe(entityContext.unique, (unique) => {
                this.#entityUnique = unique ?? null;
                this.#tryEvaluate();
            });
        });
    }
}
```

## Key concepts

### Per-node evaluation via UMB_ENTITY_CONTEXT

The condition uses Umbraco's `UMB_ENTITY_CONTEXT` to get the entity unique for the content node being evaluated. This context is provided per-entity in the content tree, so each node gets its own condition evaluation.

The `observe()` pattern means the condition re-evaluates when navigating between nodes, not just on first load.

### Two-context coordination

Both `UMB_AUTH_CONTEXT` and `UMB_ENTITY_CONTEXT` arrive asynchronously. The condition stores both values and only evaluates when both are available:

```typescript
#tryEvaluate() {
    if (this.#authContext && this.#entityUnique !== undefined) {
        this.#evaluate(this.#authContext, this.#entityUnique);
    }
}
```

### Performance

- **Active workflows**: Globally cached, one API call per browser session
- **Document item lookup**: Cached by Umbraco's `UmbDocumentItemRepository`
- **Allowed children**: Cached by Umbraco's `UmbDocumentTypeStructureRepository`
- **Blueprint lookup**: Cached by Umbraco's `UmbDocumentBlueprintItemRepository`
- **Early exit**: Stops checking child types on first blueprint match

### Global condition config type

The config type is registered globally so Umbraco's extension registry can match the condition alias:

```typescript
export type UpDocHasWorkflowsConditionConfig =
    UmbConditionConfigBase<'UpDoc.Condition.HasAvailableWorkflows'>;

declare global {
    interface UmbExtensionConditionConfigMap {
        UpDocHasWorkflowsConditionConfig: UpDocHasWorkflowsConditionConfig;
    }
}
```

### Fail-safe behaviour

If any API call fails (network error, server down, etc.), the condition defaults to `permitted = false`. This means the entity action is hidden rather than showing a broken experience.

## Imports

```typescript
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';
import type {
    UmbConditionConfigBase,
    UmbConditionControllerArguments,
    UmbExtensionCondition,
} from '@umbraco-cms/backoffice/extension-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_ENTITY_CONTEXT } from '@umbraco-cms/backoffice/entity';
import { UmbDocumentTypeStructureRepository } from '@umbraco-cms/backoffice/document-type';
import { UmbDocumentBlueprintItemRepository } from '@umbraco-cms/backoffice/document-blueprint';
import { UmbDocumentItemRepository } from '@umbraco-cms/backoffice/document';
import { fetchActiveWorkflows } from './workflow.service.js';
```

## Registered in

- `manifest.ts` -- registered as a `condition` extension type with alias `UpDoc.Condition.HasAvailableWorkflows`
- Used by the `UpDoc.EntityAction` entity action as a condition

## Used by

- `up-doc-action.ts` -- the entity action this condition gates
