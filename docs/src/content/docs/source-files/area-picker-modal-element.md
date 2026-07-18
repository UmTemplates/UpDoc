---
title: "area-picker-modal.element.ts"
---


Sidebar modal for choosing which detected areas take part in a transform, and for promoting web containers into areas.

## What it does

Serves two source types from one modal, switching layout based on the data it receives:

```typescript
override render() {
    const hasContainers = (this.data?.containers?.length ?? 0) > 0;
    return html`
        <umb-body-layout headline="Define Areas">
            ${hasContainers ? this.#renderTwoPaneLayout() : this.#renderAreaOnlyLayout()}
```

- **Web sources** pass a container tree, producing a two-pane layout: the DOM container tree on the left, the resulting area list on the right.
- **PDF and markdown sources** pass no containers, producing a simple area list.

## State

```typescript
@state() private _excluded = new Set<string>();
@state() private _overrides: ContainerOverride[] = [];
@state() private _selectedContainers = new Set<string>();
@state() private _collapsedNodes = new Set<string>();
@state() private _showAllContainers = false;
```

Initialised from `this.data` in `connectedCallback`, copied rather than referenced so cancelling discards changes.

## Exclusion, not selection

Areas are included by default. The modal records what to leave *out*, in `_excluded`. This matters when re-extracting: a newly appearing area is included automatically rather than being silently dropped for not having been ticked.

## Container filtering

Web pages produce a large container tree, most of it structurally meaningless. `#passesFilter` keeps only containers with a class or id:

```typescript
#passesFilter(node: ContainerTreeNode): boolean {
    if (this._showAllContainers) return true;
    return !!(node.className || node.id);
}
```

`#hasVisibleDescendant` walks children recursively, so a plain wrapper is still shown when it contains named descendants. Without it, filtering would hide entire branches and make named containers unreachable.

`_showAllContainers` turns the filter off when the useful container genuinely has no class or id.

## Promoting containers to areas

A container can be promoted into an area via a `promoteToArea` override. `#effectiveAreas` merges those into the base list:

```typescript
get #effectiveAreas(): EffectiveArea[] {
    // base areas, then any promoted overrides not already present
}
```

Promoted areas are marked `isPromoted: true` and given a distinct colour so they read differently from detected areas.

## Label derivation

New areas get a readable name derived from the container path:

```typescript
#deriveLabel(containerPath: string): string {
    const lastSegment = containerPath.split('/').pop() || containerPath;
    const match = lastSegment.match(/[.#](.+)/);
    const raw = match ? match[1] : lastSegment;
    return raw.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
```

`div.country-banner` becomes "Country Banner". The label is editable afterwards.

## Return value

```typescript
#onSubmit() {
    this.value = {
        excludedAreas: [...this._excluded],
        containerOverrides: this._overrides.length > 0 ? this._overrides : undefined,
    };
    this.modalContext?.submit();
}
```

`containerOverrides` is omitted entirely when empty, keeping the saved config clean for non-web sources.

## Used by

- `up-doc-workflow-source-view.element.ts` — opens the modal
- `area-picker-modal.token.ts` — the token and type definitions
