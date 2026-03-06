---
title: "Common Errors"
---


## Distributed cache error on startup

If you see `DISTRIBUTED CACHE IS NOT UPDATED. Failed to execute instructions` in the Umbraco log on startup, clear the stale cache instructions from the SQLite database:

```sql
DELETE FROM umbracoCacheInstruction;
```

Open `umbraco/Data/Umbraco.sqlite.db` in DB Browser for SQLite, run the query under **Execute SQL**, then click **Write Changes**. Restart the site.

This happens when the site is stopped while cache instructions are still being processed (common during development). It's harmless on a single-instance dev setup but will log errors on every startup until cleared.

## Auth cookies invalidated when running multiple Umbraco sites

If you're logged out of one Umbraco site when starting another on localhost, the sites are sharing cookies. Umbraco uses the same cookie name (`UMB_UCONTEXT`) on all sites, and Kestrel on `localhost` shares cookies across ports.

`SetApplicationName()`, `PersistKeysToFileSystem()`, and custom `AuthCookieName` settings were all tested but **do not resolve this** — Kestrel still shares cookies across localhost ports regardless.

The only reliable fix is to use different hostnames (e.g. `updoc.localhost` vs `umbootstrap.localhost`) but this has knock-on effects for MCP server config, bookmarks, etc. For now, just run one site at a time or accept re-logging in when switching.
