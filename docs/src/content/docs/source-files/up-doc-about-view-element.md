---
title: "up-doc-about-view.element.ts"
---


The About tab in the UpDoc section of Settings.

## What it does

Renders static content describing what UpDoc is, a four-step summary of how it works, and links out to the documentation and repository.

```typescript
@customElement('up-doc-about-view')
export class UpDocAboutViewElement extends UmbLitElement {
    override render() {
        return html`
            <uui-box headline="UpDoc">
                <p>UpDoc enables creating Umbraco documents from external sources...</p>
                <h4>How it works</h4>
                <ol>...</ol>
                <h4>Resources</h4>
                <uui-ref-list>...</uui-ref-list>
            </uui-box>
        `;
    }
}
```

No state, no data fetching. Content is hardcoded in the template.

## Resource links

Two `uui-ref-node` entries inside a `uui-ref-list`, each opening in a new tab:

| Link | Target |
|---|---|
| Documentation | `https://umtemplates.github.io/UpDoc/` |
| Source Code | GitHub repository |

## Maintenance note

Because the copy is hardcoded rather than pulled from anywhere, it drifts silently. The "How it works" list in particular describes the workflow model and will need revisiting if that model changes.

The repository link is currently wrong — it points at a user account rather than the `UmTemplates` organisation. Tracked separately.

## Used by

- `manifest.ts` — registers the view in the UpDoc workspace
