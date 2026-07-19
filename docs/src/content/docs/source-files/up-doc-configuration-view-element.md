---
title: "up-doc-configuration-view.element.ts"
---


Placeholder view for global UpDoc configuration in the Settings section.

## What it does

Renders a single `uui-box` explaining that global configuration is not yet implemented, and pointing the reader at per-workflow settings instead.

```typescript
@customElement('up-doc-configuration-view')
export class UpDocConfigurationViewElement extends UmbLitElement {
    override render() {
        return html`
            <uui-box headline="Configuration">
                <p>Global configuration options for UpDoc will appear here in a future update.</p>
                <p>
                    Workflow-specific settings (source extraction rules, property mappings) are
                    configured per-workflow on the Workflows tab.
                </p>
            </uui-box>
        `;
    }
}
```

No state, no data fetching, no event handlers.

## Why it exists

The tab is deliberately present but empty. UpDoc currently has no global settings — everything is configured per workflow, in the workflow folder's JSON files. The view exists so the Settings section has a visible slot for configuration when there is something to put in it.

Whether global configuration is ever needed is an open question. The workflow folder convention (folder exists = feature enabled) deliberately avoids a settings layer.

## Used by

- `manifest.ts` — registers the view in the UpDoc workspace
