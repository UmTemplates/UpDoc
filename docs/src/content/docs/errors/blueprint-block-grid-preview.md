---
title: "Blueprint block grid preview shows wrong content"
---


## Symptom

When editing a Document Blueprint in **Settings > Document Blueprints**, block grid blocks that read from the parent document's properties via `Umbraco.AssignedContentItem` display content from an existing published page instead of the blueprint's own property values.

For example, a "Feature - Page - Title and Description" block that renders `@currentPage.PageTitle` shows "The Moorish Treasures of Andalucia" (from an existing Tailored Tour page) instead of `[Page Title]` (the blueprint's placeholder value).

**Blocks with their own stored values** (e.g. Rich Text Editor blocks with inline content) are **not affected** - they display and save correctly in the blueprint editor.

## Cause

This is an Umbraco core issue with how `Umbraco.AssignedContentItem` is resolved during block grid server-side rendering (SSR) previews.

When a block's Razor partial reads from `Umbraco.AssignedContentItem`, the resolution chain in `UmbracoViewPage.cs` is:

1. Check if the view model is `IPublishedContent` - it's a `BlockGridItem`, so no
2. Check if the view model is `IContentModel` - it's not
3. **Fallback:** use `UmbracoContext.PublishedRequest.PublishedContent`

The fallback is the problem. Blueprints are not in the published content cache (`IsBlueprint = true`, draft-only items). So `PublishedRequest.PublishedContent` resolves to whatever published content was last in context - typically an existing page of the same document type.

**Key source files in Umbraco CMS:**

- `src/Umbraco.Web.Common/Views/UmbracoViewPage.cs` - where `AssignedContentItem` is set
- `src/Umbraco.Web.Common/Templates/TemplateRenderer.cs` - where `PublishedRequest.PublishedContent` is determined

## Impact on UpDoc

This is a **cosmetic issue in the blueprint editor only**. It does not affect UpDoc's content creation pipeline:

- The blueprint's stored data is correct (confirmed via uSync XML export)
- When UpDoc creates a real document from the blueprint, `AssignedContentItem` resolves to the new document with the correct page properties
- The editor will see the correct values on the created page

## Workaround

There is no workaround within the blueprint editor. The preview will show stale content from an existing page regardless of what the blueprint's page properties contain.

**Options:**

1. **Accept the cosmetic issue** - the blueprint data is correct even though the preview is misleading
2. **Use a real content page as a reference** - create and maintain a `[Tailored Tours Blueprint]` content node alongside the actual blueprint, so you can verify the block grid layout on a real page
3. **Edit via uSync XML** - modify the blueprint's `uSync/v17/Blueprints/*.config` file directly and import via uSync. The blueprint GUID is preserved, so workflow configurations remain valid.

## Upstream issues

- **Umbraco CMS:** [umbraco/Umbraco-CMS#21919](https://github.com/umbraco/Umbraco-CMS/issues/21919) — closed, redirected to Block Preview
- **Block Preview:** [rickbutterfield/BlockPreview#271](https://github.com/rickbutterfield/BlockPreview/issues/271) — submitted Mar 2026

## Affected versions

- Umbraco CMS v17 (confirmed)
- Likely affects all versions using block grid SSR preview in blueprint editor
