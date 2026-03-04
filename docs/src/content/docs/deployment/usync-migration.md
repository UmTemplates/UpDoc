---
title: "uSync Content Migration"
---


## Overview

UpDoc's test site serves as the development environment for both the package and client-specific content. Document types, templates, block grids, blueprints, and content are all built here and deployed to production sites via [uSync](https://docs.jumoo.co.uk/uSync/).

This guide covers how to export content from the UpDoc test site and import it into a target site.

## Full Import into a New Site

Use this when setting up a new site from scratch.

### Prerequisites

- Target site running Umbraco v17+ with uSync installed
- Target site should have a **clean database** (no existing content)

### Step 1: Copy Physical Files

uSync exports database records but **not physical files**. Copy these manually before importing:

| Source | Target | Notes |
|--------|--------|-------|
| `Views/*.cshtml` | `Views/` | Templates |
| `Views/Partials/` | `Views/Partials/` | Partial views (block grid components, layouts) |
| `wwwroot/media/` | `wwwroot/media/` | Media files (images, PDFs) |
| Custom stylesheets/scripts | Same paths | Any frontend assets |

:::caution[Templates must be copied first]
If template `.cshtml` files are not in place before import, template definitions will fail to import. This cascades to dependent content types, which also fail.
:::

### Step 2: Export from Source Site

1. Open the source site's backoffice
2. Go to **Settings > uSync**
3. Click **Export > Export to File** under Everything
4. Download the `usync-export.zip`

### Step 3: Import into Target Site

1. Complete the Umbraco install wizard on the target site
2. Go to **Settings > uSync**
3. Click **Import > Import from File** under Everything
4. Upload the export zip
5. Click **Import**

:::danger[Single-pass import required]
Always import everything in one shot into a clean database. Partial or repeated imports cause `UNIQUE constraint failed: umbracoNode.uniqueId` errors, particularly with **Document Blueprints**. Blueprint GUIDs clash with orphaned records from failed imports.
:::

### Step 4: Verify

Check these sections in the backoffice:

- **Content** — all content nodes present
- **Settings > Document Types** — all custom types present
- **Settings > Document Blueprints** — all blueprints present
- **Media** — all media items present
- **Settings > Templates** — all templates present, no warnings

## Incremental Updates

For day-to-day changes after the initial import.

1. Copy new/changed `.config` files from `uSync/v17/` subfolders
2. Copy any new `.cshtml` template files
3. Import via **Settings > uSync > Import** or restart the site

Incremental updates are additive and should not cause GUID clashes.

## UpDoc Workflow Files

UpDoc workflow configurations (`updoc/workflows/`) are custom JSON files outside Umbraco's content system. They are **not exported by uSync** and must be copied manually or managed via version control.

:::note[Blueprint GUIDs]
Workflow `destination.json` files reference blueprints by GUID. As long as the uSync import preserves blueprint GUIDs (which it does in a clean single-pass import), workflows will work correctly on the target site.
:::

## Running Multiple Sites

When running two Umbraco sites on localhost (different ports), authentication cookies conflict because they share the name `UMB_UCONTEXT`.

**Fix:** Set unique cookie names in each site's `appsettings.json`:

```json
{
  "Umbraco": {
    "CMS": {
      "Security": {
        "AuthCookieName": "UMB_UCONTEXT_MYSITE"
      }
    }
  }
}
```

## Starting Over

If an import fails:

1. Stop the site
2. Delete the SQLite database from `umbraco/Data/`
3. Remove the connection string from `appsettings.json`
4. Restart — Umbraco returns to Install mode
5. Re-run the wizard and reimport
