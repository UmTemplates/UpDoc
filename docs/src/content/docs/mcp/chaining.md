---
title: "Chaining"
description: "The scaffold turns it on. UpDoc turns it off. Three reasons, and two independent kill switches."
---

Chaining lets one MCP server spawn another and re-expose its tools as its own. The scaffold enables it by default, pointed at `@umbraco-cms/mcp-dev`.

**UpDoc turns it off.**

## It was supposed to be the whole design

Worth recording, because the original plan depended on it.

Issue #129 assumed UpDoc's server would own only extract, transform and apply mapping. Everything Umbraco-shaped (scaffold, create, save) would be delegated to `mcp-dev` through chaining. That assumption is what made the one-to-two-week estimate plausible.

The build went a different way. The logic moved to a C# endpoint, so UpDoc's tools call UpDoc's endpoints and never delegate to anything.

The chain earned nothing and cost three things.

## Three reasons it is off

### 1. A fresh install hangs

Chaining spawns `npx -y @umbraco-cms/mcp-dev@17` at startup.

On a machine that has never fetched that package, the first run downloads before responding: no output, no error, just a wait.

Locally it looks instant because the package is cached. **Which is exactly why this survived until the packed tarball was installed into an empty directory.**

### 2. Around 350 tools get duplicated

With `proxyTools`, every tool on the chained server is re-exposed through yours.

Anyone already running `mcp-dev` alongside sees each tool twice and has to choose between them.

This came back reported from the site using it:

> the updoc server now proxies the full Umbraco CMS API. Not something we asked for.

### 3. The example tool had never worked

`get-chained-info` shipped with the scaffold to demonstrate the technique. It calls `get-server-info` on `mcp-dev`, which has no tool by that name.

```
MCP error -32602: Tool get-server-info not found
```

It had been failing since the project was created, unnoticed, because nothing had called it. It surfaced on the first real MCP client registration.

It was **removed rather than fixed**. It demonstrates a technique the server does not use, and shipping a third tool that errors on first use is a poor introduction to the other two.

## The judgement, separated from the bugs

Reasons 1 and 3 are defects. Reason 2 is a judgement, and worth stating as one.

**Chaining is right for a server meant to be the only one registered.** It is wrong for an add-on server whose likely consumer already runs Umbraco's own.

Any package author is in the second situation.

## Turning it back on

```bash
UMBRACO_MCP_CHAIN=true
```

The proxying machinery is intact. Only the default changed, and the example tool is gone.

## Two independent kill switches

There are two, and they do not do the same thing:

| Control | Effect |
|---|---|
| `UMBRACO_MCP_CHAIN=true` | Adds the chained server to the list. Absent or false, the list is empty. |
| `DISABLE_MCP_CHAINING=true` | Hard-disables chaining **regardless** of the list. Also available as `--disable-mcp-chaining`. |

`DISABLE_MCP_CHAINING` overrides `UMBRACO_MCP_CHAIN`. The check is:

```typescript
chainingEnabled = mcpServers.length > 0 && !serverConfig.custom.disableMcpChaining
```

A third variable, `USE_MOCK_MCP_CHAIN=true`, swaps the real chained server for a mock used by the eval tests.

## How proxied tools appear

Registered under a prefixed name, with the description marked:

```
[Proxied from cms] <original description>
```

No input schema is passed on registration. Validation happens on the chained server, and the SDK expects Zod rather than raw JSON Schema.

Failures are caught and logged as a warning, so a chained server that will not start does not take the local tools down with it.

## The alternative, which is what to do instead

Register both servers. An import is then two calls:

```json
{
  "mcpServers": {
    "umbraco": {
      "command": "npx",
      "args": ["-y", "@umbraco-cms/mcp-dev"]
    },
    "updoc": {
      "command": "npx",
      "args": ["-y", "@umtemplates/updoc-mcp"]
    }
  }
}
```

1. `create-media` on Umbraco's server, giving a media id
2. `create-from-source` on UpDoc's, giving a document id

Then `publish-document` when the content has been checked.

The two servers meet in the agent session rather than in the code, which is the right seam.

## In the Worker

The Cloudflare Worker has in-process chaining machinery (`registerChainedTools`, `ChainedServerConsentConfig`) but it is **entirely commented out**.

The Worker is scaffolding rather than a deployed thing. Its `wrangler.toml` still carries placeholder values.

## Further reading

- [Routes Considered](/UpDoc/mcp/routes-considered/): where chaining was the whole premise
- [Testing Traps](/UpDoc/mcp/testing-traps/): how the broken example tool stayed hidden
- [Publishing to npm](/UpDoc/mcp/publishing/): where the fresh-install hang was found
