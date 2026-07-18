---
title: "sortable-rules-container.element.ts"
---


Lightweight container that makes transform rules drag-and-drop sortable, including between groups.

## What it does

Wraps a list of rules in an `UmbSorterController`. One instance is rendered per rule group, plus one for ungrouped rules. All instances share the same sorter `identifier`, which is what allows a rule to be dragged from one group into another.

## Interfaces

```typescript
export interface SortableRule {
    _id: string;
    [key: string]: unknown;
}

export interface SortChangeDetail {
    rules: SortableRule[];
}
```

The rule shape is deliberately minimal — only `_id` is required. The container does not know or care what a rule contains; rendering is delegated to the parent.

## Sorter configuration

```typescript
#sorter = new UmbSorterController<SortableRule, HTMLElement>(this, {
    getUniqueOfElement: (el) => el.dataset.sortId ?? '',
    getUniqueOfModel: (rule) => rule._id,
    identifier: 'updoc-rules-sorter',
    itemSelector: '.sortable-rule',
    containerSelector: '.rules-container',
    handleSelector: '.rule-grip',
    disabledItemSelector: '[data-expanded]',
    placeholderAttr: 'drag-placeholder',
    onChange: ({ model }) => { /* emits sort-change */ },
});
```

Three options carry most of the behaviour:

- **`identifier`** — shared across every instance, enabling cross-group dragging
- **`handleSelector`** — drag starts only from the grip, so clicking a card body does not begin a drag
- **`disabledItemSelector`** — expanded rules cannot be dragged, since dragging a tall open card is unusable

## Rendering is delegated

The container does not render rule content. The parent passes a callback:

```typescript
@property({ attribute: false })
renderItem?: (rule: SortableRule) => unknown;
```

This keeps the container generic and leaves rule presentation with the editor modal that owns it.

## Events

Emits `sort-change` with the reordered model. The event is `bubbles: true, composed: true` so it crosses the shadow boundary to the parent modal.

## Shadow DOM and styling

`UmbSorterController` requires shadow DOM, so this component has its own shadow root. Styles defined on the parent modal cannot reach inside it, which is why `ruleCardStyles` is a shared constant composed into both.

## Known context

The "ungrouped" sentinel group exists because `UmbSorterController` requires zero non-sortable DOM between containers for cross-container dragging to work. Rules outside any group still need a sortable container, or dragging into and out of that region hits a dead zone. See `docs/errors/drag-drop-dead-zone.md`.

## See also

- [`rule-card-styles.ts`](/UpDoc/source-files/rule-card-styles/) — the shared styles
- [`section-rules-editor-modal.element.ts`](/UpDoc/source-files/section-rules-editor-modal-element/) — the parent
