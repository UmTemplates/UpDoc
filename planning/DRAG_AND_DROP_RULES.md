# Drag-and-Drop Rules — Implementation Plan

> **STATUS: COMPLETE** (Mar 2026, branch `feature/fix-drag-drop-dead-zone`, commits `3b631c6` + `38859c1`)
>
> The dead zone between sortable containers was fixed by introducing an "Ungrouped" sentinel group
> that puts all rules inside `<updoc-sortable-rules>` containers. See `docs/errors/drag-drop-dead-zone.md`
> for the full technical write-up.

## Branch
`feature/rules-editor-groups` (original), `feature/fix-drag-drop-dead-zone` (final fix)

## Final State
- All rules inside sortable containers (one per group, including "Ungrouped")
- Cross-container drag-and-drop works via shared `identifier: 'updoc-rules-sorter'`
- "Ungrouped" sentinel group: renders as a group, saves as top-level `rules[]`
- Move-to-group dropdown remains as reliable fallback
- Collapsed rule rows: grip | chevron | name | part badge | match badge | action bar (hover)
- Expanded rules: greyed-out grip (not draggable) | chevron (collapse) | name input | trash
- Group header: uui-action-bar (hover) with rename + delete
- Save / Save and Close buttons working
- Only collapsed rules should be draggable

## What Needs to Happen

### Step 1: Create `<updoc-sortable-rules>` custom element

**New file:** `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/sortable-rules-container.element.ts`

This is a lightweight container element — one instance per group + one for ungrouped. Each has its own `UmbSorterController`.

```typescript
import { UmbSorterController } from '@umbraco-cms/backoffice/sorter';
import { html, customElement, property, state, repeat } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

interface SortableRule {
  _id: string;
  [key: string]: any;
}

@customElement('updoc-sortable-rules')
export class UpdocSortableRulesElement extends UmbLitElement {
  #sorter = new UmbSorterController<SortableRule, HTMLElement>(this, {
    getUniqueOfElement: (el) => el.dataset.id ?? '',
    getUniqueOfModel: (rule) => rule._id,
    identifier: 'updoc-rules-sorter',       // SHARED across all containers
    itemSelector: '.sortable-rule',
    containerSelector: '.rules-container',
    onChange: ({ model }) => {
      this._rules = model;
      this.dispatchEvent(new CustomEvent('sort-change', {
        detail: { rules: model },
        bubbles: true,
        composed: true,
      }));
    },
  });

  @property({ attribute: false })
  set rules(val: SortableRule[]) {
    this._rules = val;
    this.#sorter.setModel(val);
  }
  get rules() { return this._rules; }
  @state() private _rules: SortableRule[] = [];

  // Render callback provided by the parent modal
  @property({ attribute: false })
  renderItem?: (rule: SortableRule) => unknown;

  override render() {
    return html`
      <div class="rules-container">
        ${repeat(
          this._rules,
          (rule) => rule._id,
          (rule) => html`
            <div class="sortable-rule" data-id=${rule._id}>
              ${this.renderItem?.(rule) ?? html`<span>${rule._id}</span>`}
            </div>
          `
        )}
      </div>
    `;
  }
}
```

**Key points:**
- `identifier: 'updoc-rules-sorter'` is the SAME on every instance — this enables cross-container dragging
- `itemSelector: '.sortable-rule'` targets the wrapper divs
- `containerSelector: '.rules-container'` targets the inner container
- `renderItem` callback lets the parent modal provide the full rule rendering (collapsed row with action bar, badges, etc.)
- `sort-change` custom event fires when order changes or an item arrives from another container
- Uses `repeat()` directive with key function for proper DOM diffing

### Step 2: Update the modal to use `<updoc-sortable-rules>`

In `section-rules-editor-modal.element.ts`:

1. **Import** the new element
2. **Replace** the current rule rendering loops (for groups and ungrouped) with `<updoc-sortable-rules>` instances
3. **Pass** a `renderItem` callback that calls `this.#renderRuleCard(rule, flatIdx, matchedElements)`
4. **Listen** for `sort-change` events to update `_rules` and `_groupName`

**For each group:**
```html
<updoc-sortable-rules
  .rules=${rulesForThisGroup}
  .renderItem=${(rule) => this.#renderRuleCard(rule, ...)}
  @sort-change=${(e) => this.#onGroupSortChange(groupName, e.detail.rules)}
></updoc-sortable-rules>
```

**For ungrouped:**
```html
<updoc-sortable-rules
  .rules=${ungroupedRules}
  .renderItem=${(rule) => this.#renderRuleCard(rule, ...)}
  @sort-change=${(e) => this.#onGroupSortChange(null, e.detail.rules)}
></updoc-sortable-rules>
```

### Step 3: Handle cross-container moves

When `sort-change` fires on a container:
- The `model` contains the rules now in that container
- For cross-container moves, the source container also fires with the item removed
- Update `_groupName` on moved rules based on which container they're now in
- Rebuild the flat `_rules` array from all container models

```typescript
#onGroupSortChange(groupName: string | null, newRules: EditableRule[]) {
  // Set _groupName on all rules in this container
  for (const rule of newRules) {
    rule._groupName = groupName;
  }

  // Rebuild flat _rules: collect from all containers in order
  const allRules: EditableRule[] = [];
  for (const gName of this._groupOrder) {
    if (gName === groupName) {
      allRules.push(...newRules);
    } else {
      allRules.push(...this._rules.filter(r => r._groupName === gName));
    }
  }
  // Add ungrouped
  if (groupName === null) {
    allRules.push(...newRules);
  } else {
    allRules.push(...this._rules.filter(r => r._groupName === null));
  }

  this._rules = allRules;
}
```

### Step 4: Handle drag handle restriction

The `UmbSorterController` doesn't have a built-in `handleSelector` option. The drag initiates on any mousedown within the item. To restrict to the grip:
- Option A: Use CSS `pointer-events: none` on everything except the grip within `.sortable-rule`
- Option B: Check if the sorter supports a `dragHandleSelector` option (check CMS source)
- Option C: Use a thin wrapper that only captures mousedown on the grip area

**Check the CMS source** at `Umbraco-CMS/src/Umbraco.Web.UI.Client/src/packages/core/sorter/` for handle support before implementing.

### Step 5: Register the element and add to manifest

Add to `manifest.ts` if needed (may not be needed if imported directly by the modal).

### Step 6: Cleanup (Step 4 from original plan)

- Remove "Move to group" dropdown from expanded rules (drag replaces it)
- Remove the `moveOptions` and `#moveToGroup` logic
- Test all flows: reorder within group, drag between groups, drag to/from ungrouped

## UX Decisions Already Made

- Only collapsed rules are draggable (expanded grip is greyed out)
- Grip is leftmost element, chevron second — continuous expand zone
- `uui-action-bar` on hover for edit/delete (pristine look="primary")
- Group header actions also hover-only
- Save keeps modal open; Save and Close persists and closes

## Reference Files

- **UmbSorterController skill:** Invoke `umbraco-sorter` skill
- **CMS two-container example:** `Umbraco-CMS/src/Umbraco.Web.UI.Client/examples/sorter-with-two-containers/`
- **CMS sorter source:** `Umbraco-CMS/src/Umbraco.Web.UI.Client/src/packages/core/sorter/`
- **Current modal:** `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/section-rules-editor-modal.element.ts`

## Important: renderItem Callback Challenge

The `renderItem` callback from the modal needs access to:
- `_expandedRules` set (to determine collapsed/expanded)
- Element matching (to compute match count)
- All the rule CRUD methods (`#removeRule`, `#toggleRuleExpanded`, etc.)

Since the callback is a closure from the modal, it has access to `this`. But the `flatIdx` (used for remove/update) needs to be derived from the rule's `_id` in the flat `_rules` array.

**Solution:** Change rule CRUD methods to accept `_id` instead of `flatIdx`:
```typescript
#removeRuleById(id: string) {
  this._rules = this._rules.filter(r => r._id !== id);
}
```

This is cleaner anyway and avoids index-staleness bugs.
