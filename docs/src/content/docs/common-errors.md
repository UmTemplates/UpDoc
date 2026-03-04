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
