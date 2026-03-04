---
title: "index.ts"
---


The entry point for the plugin bundle. This file is loaded by Umbraco when the backoffice starts.

## What it does

Exports the `manifests` array which registers all the extension components (entity actions, modals, etc.) with Umbraco's extension registry.

## Key points

- **Must export `manifests`** - Umbraco's bundle loader looks for this export
- Does NOT use `onInit` function - bundles automatically register exported manifests
- Keep this file simple - just re-export from manifest.ts

## Code

```typescript
export { manifests } from './manifest.js';
```

## Common mistake

We initially tried using an `onInit` function pattern:

```typescript
// WRONG - this doesn't work for bundles
export const onInit = (host, extensionRegistry) => {
  extensionRegistry.registerMany(manifests);
};
```

Bundles don't call `onInit` - they just look for the `manifests` export. Use `backofficeEntryPoint` type instead if you need `onInit` behavior.
