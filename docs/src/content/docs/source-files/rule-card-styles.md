---
title: "rule-card-styles.ts"
---


Shared Lit `css` block for rule cards in the transform rules editor.

## What it does

Exports a single constant:

```typescript
export const ruleCardStyles = css`...`;
```

Roughly 350 lines of styling covering rule card layout, the drag grip, expanded and collapsed states, condition and exception rows, the find-and-replace panel, and group containers.

## Why it is a separate file

`UmbSorterController` requires shadow DOM, so `sortable-rules-container.element.ts` renders rule cards inside its own shadow root. Styles defined on the parent modal cannot reach into that shadow root.

Both components therefore need the same styles, and a shared constant is how they get them:

```typescript
// sortable-rules-container.element.ts
static override styles = [
    ruleCardStyles,
    css`/* container-specific styles */`,
];
```

Without this split, rule cards would render unstyled once they were moved inside the sorter's shadow DOM — which is exactly what happened during the drag-and-drop work.

## Consumers

- `sortable-rules-container.element.ts` — renders cards inside shadow DOM
- `section-rules-editor-modal.element.ts` — renders the surrounding editor

Both compose `ruleCardStyles` into their own `styles` array alongside component-specific rules.

## Maintenance note

Because the styles are shared across a shadow boundary, a change here affects both the sorter and the modal. A rule that looks correct in one context can break the other — worth checking both after editing.

## See also

- [`sortable-rules-container.element.ts`](/UpDoc/source-files/sortable-rules-container-element/)
- [`section-rules-editor-modal.element.ts`](/UpDoc/source-files/section-rules-editor-modal-element/)
