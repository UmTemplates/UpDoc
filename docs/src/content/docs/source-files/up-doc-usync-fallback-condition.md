---
title: "up-doc-usync-fallback.condition.ts"
---


Custom Umbraco condition that permits when uSync is NOT installed. Used to control fallback sidebar group visibility.

## What it does

Observes the Umbraco extension registry for `menu` type extensions. If `usync.menu` is found, the condition is NOT permitted (uSync is present, so UpDoc joins uSync's group). If `usync.menu` is absent, the condition IS permitted (UpDoc creates its own "Synchronisation" sidebar group).

## How it works

```typescript
export class UpDocUsyncFallbackCondition
    extends UmbConditionBase<UmbConditionConfigBase>
    implements UmbExtensionCondition
{
    constructor(host, args) {
        super(host, args);
        this.observe(
            umbExtensionsRegistry.byType('menu'),
            (menus) => {
                const hasUsync = menus.some((m) => m.alias === 'usync.menu');
                this.permitted = !hasUsync;
            },
            'upDocUsyncCheck',
        );
    }
}
```

**Key pattern:** Extends `UmbConditionBase` (not `UmbControllerBase`). Uses `this.observe()` on the extension registry observable for reactive updates. The `permitted` setter automatically notifies the framework when the value changes.

## Registered in

- `manifest.ts` as `UpDoc.Condition.UsyncNotInstalled`
- Applied to the fallback `sectionSidebarApp` (`UpDoc.SidebarApp`)

## Used by

- `manifest.ts` — conditions array on the fallback sidebar group. When uSync IS installed, this condition blocks the fallback, preventing a duplicate "Synchronisation" header.

## Future improvement

Currently hardcodes `usync.menu` as the check. A future enhancement would dynamically discover ANY existing "Synchronisation" sidebar group by label, making it package-agnostic. See `planning/DYNAMIC_SIDEBAR_GROUP.md`.
