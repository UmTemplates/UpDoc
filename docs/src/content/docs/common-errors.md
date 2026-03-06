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

If you're logged out of one Umbraco site when starting another on localhost, the sites are sharing the same Data Protection key ring. Each site encrypts/decrypts auth cookies with the same keys, so starting a new site can invalidate the other's cookies.

Fix: give each site a unique application name in `Program.cs`, **before** the Umbraco builder chain:

```csharp
builder.Services.AddDataProtection()
    .SetApplicationName("UpDoc"); // unique per site
```

Each site needs a different name (e.g. `"UpDoc"`, `"UmBootstrap"`).
