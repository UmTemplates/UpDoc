# Plan: Per-Feature Settings Migration (from UmBootstrap)

## Status: PLANNING

## Context

UmBootstrap completed a per-feature settings migration (commit `ee8c3b4` on develop/main). This introduced:
- `featureSettingsNavigation` — a per-feature settings type for navigation blocks (composes Color Picker + Hide Display + Sticky Nav toggle)
- `featureSettingsComponentStickyNav` — new element type with `featureSettingsEnableSticky` property
- `featureSettingsComponentHideDisplay` — renamed from `featureSettingsComponentColorPicker1` (alias bug fix)
- `Feature Settings Component - Enable Sticky` — dedicated DataType (True/False, default TRUE)
- Conditional `sticky-nav` class in both navigation views (was hard-coded, now editor-controlled)

UpDoc needs the same changes. Currently UpDoc has:
- Hard-coded `sticky-nav` on both `featureNavigationInPage.cshtml` (line 17) and `featureNavigationDescendants.cshtml` (line 36)
- The old `featureSettings` type (`ec9f83f9`) on all feature blocks
- The naming bug (`featuresettingscomponentcolorpicker1.config` instead of `featuresettingscomponenthidedisplay.config`)
- 69 content files total, 50 referencing `featureSettings` (`ec9f83f9`)
- 39 pages with `featureNavigationDescendants` blocks, 1 page with `featureNavigationInPage`

## What Needs to Change

### A. uSync Files to Copy (UmBootstrap → UpDoc)

These files define the schema — element types and data types. Copying them and running a uSync import creates the new types in UpDoc's database.

**Source**: `Umbootstrap.Web/uSync/v17/`
**Destination**: `UpDoc/src/UpDoc.TestSite/uSync/v17/`

#### ContentTypes (copy or overwrite)

| File | Action | Notes |
|------|--------|-------|
| `ContentTypes/featuresettingscomponenthidedisplay.config` | **Copy** (new file) | Replaces the old `featuresettingscomponentcolorpicker1.config` |
| `ContentTypes/featuresettingscomponentcolorpicker1.config` | **Delete** | Old file with wrong alias — replaced by above |
| `ContentTypes/featuresettingscomponentstickynav.config` | **Copy** (new file) | New sticky nav component |
| `ContentTypes/featuresettingsnavigation.config` | **Copy** (new file) | New per-feature settings type for navigation |
| `ContentTypes/featuresettings.config` | **Compare** | May have changed if compositions were updated — diff before overwriting |

#### DataTypes (copy)

| File | Action | Notes |
|------|--------|-------|
| `DataTypes/FeatureSettingsComponentEnableSticky.config` | **Copy** (new file) | True/False with default TRUE |

#### DataTypes (manual update in backoffice)

The Block Grid DataType config must be updated to assign `featureSettingsNavigation` to the two navigation blocks instead of `featureSettings`. This is easiest done in the backoffice, then uSync exported.

### B. View Updates

| File | Change |
|------|--------|
| `featureNavigationInPage.cshtml` | Replace hard-coded `sticky-nav` with conditional: `@(enableSticky ? "sticky-nav" : "")` |
| `featureNavigationDescendants.cshtml` | Same pattern |

The pattern (from UmBootstrap):
```razor
@{
    var enableSticky = Model.Settings?.Value<bool>("featureSettingsEnableSticky") ?? false;
}
```

### C. Database Content Migration (MCP)

After the schema is in place (uSync import + Block Grid DataType update), existing content pages still have the old `contentTypeKey` (`ec9f83f9`) on their navigation settings blocks. These need migrating to `featureSettingsNavigation` (`e85bbfdf`).

**Key learning from UmBootstrap**: `update-block-property` CANNOT do this — it validates against the block's current `contentTypeKey`. Must use `update-document` with full payload to swap `contentTypeKey` AND set `featureSettingsEnableSticky = true` simultaneously.

#### Pages to migrate

- **39 pages** with `featureNavigationDescendants` blocks → swap settings `contentTypeKey` from `ec9f83f9` to `e85bbfdf`, add `featureSettingsEnableSticky = true`
- **1 page** with `featureNavigationInPage` block → same swap

**Important**: Only swap the settings blocks that belong to navigation content blocks. Other feature blocks on the same page keep `featureSettings` (`ec9f83f9`).

After each `update-document`, must call `publish-document` (documents go to `PublishedPendingChanges` state).

### D. Post-Migration

1. **uSync Export** — capture all database changes back to XML files
2. **Verify** — check a few pages in backoffice (settings tab should show Color Picker + Hide Display + Enable Sticky)
3. **Test** — frontend sticky on/off behaviour

## Execution Order

### Phase 1: Schema (Safe — no content changes)

1. Create a feature branch from `main` (e.g. `feature/per-feature-settings`)
2. Copy uSync ContentType files from UmBootstrap
3. Delete old `featuresettingscomponentcolorpicker1.config`
4. Copy new DataType file from UmBootstrap
5. Copy updated views from UmBootstrap (with conditional sticky)
6. Start UpDoc's Umbraco instance
7. Run uSync **Import** — creates new element types and DataType
8. In backoffice: update Block Grid DataType — change settings type for `featureNavigationInPage` and `featureNavigationDescendants` from `featureSettings` to `featureSettingsNavigation`
9. Run uSync **Export** to capture the DataType change

### Phase 2: Content Migration (Requires MCP + running Umbraco)

10. Use MCP to migrate navigation settings blocks on all 40 pages:
    - Read document → find navigation settings blocks → swap `contentTypeKey` → add sticky property → save → publish
    - Process in parallel batches (subagents) for speed
11. Run uSync **Export** to capture content changes

### Phase 3: Verify and Commit

12. `dotnet build` to verify compilation
13. Test in backoffice — navigation block settings should show the sticky toggle
14. Test frontend — sticky on/off should work
15. Commit and push feature branch
16. PR to main

## GUIDs Reference

| Entity | GUID |
|--------|------|
| `featureSettings` (old shared) | `ec9f83f9-c543-431e-b3dd-807bcbf5f792` |
| `featureSettingsNavigation` (new) | `e85bbfdf-53b9-48f4-88d6-cae09a6d1f24` |
| `featureSettingsComponentStickyNav` | `109d3f51-0efd-4a2f-9572-8b3f52258bb8` |
| `featureSettingsComponentHideDisplay` (renamed) | `44fa7109-c225-48e7-8af7-8bc761663077` |
| `Feature Settings Component - Enable Sticky` (DataType) | `9c8712bf-84e2-4fd8-8199-c9bd8994c2e4` |
| `featureNavigationDescendants` (content type) | `c345e5ce-768f-47e0-968a-e7859dbe0b07` |
| `featureNavigationInPage` (content type) | `c4b3a613-0d2c-4470-8d06-f7efea52d6e0` |

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Wrong content blocks get their settings swapped | Filter by navigation content type GUIDs only |
| MCP updates fail mid-migration | Each page is independent — can resume from where it stopped |
| uSync import breaks existing types | Feature branch isolates changes; can abandon if needed |
| UpDoc has different GUIDs for element types | ContentType GUIDs come from the uSync files — as long as UpDoc imported from UmBootstrap originally, GUIDs match. Verify with `get-document-type-by-id` before starting migration. |
| Forgetting to publish after update | Script/subagent always calls `publish-document` after `update-document` |

## Safety Checklist

- [ ] Work on a feature branch, not main
- [ ] Verify GUIDs match between UmBootstrap and UpDoc before starting
- [ ] Back up UpDoc database before Phase 2 (or at minimum, ensure clean git state)
- [ ] Test uSync import on schema files before touching content
- [ ] Migrate one page manually first as a smoke test before bulk migration
- [ ] uSync export after every significant step
- [ ] Full frontend test before merging
