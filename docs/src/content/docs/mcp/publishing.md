---
title: "Publishing to npm"
description: "Two packages, two registries, and the five things a dry run caught that reading the manifest never would."
---

A package author adding an MCP server ships **two** things, and they cannot travel together.

| | Registry | Provides |
|---|---|---|
| `Umbraco.Community.UpDoc` | NuGet | The endpoints |
| `@umtemplates/updoc-mcp` | npm | The tools that call them |

Installing the NuGet package does not, and should not, bring a Node process with it. The extension runs inside Umbraco on a server. The MCP server runs on the developer's own machine, next to their AI client, and talks to the site over HTTP.

Different runtimes, different machines, different lifecycles.

A fix to one does not require releasing the other, which is worth knowing before going looking for a bug in the wrong place.

## Why the dry run mattered

**npm versions are permanent.** A version can be superseded but never replaced.

So before publishing: `npm pack` the tarball, install it into an empty directory, and run it exactly as a consumer would.

That found five things. **None of them were visible from reading the manifest.**

## What it caught

### 1. `yargs` was a runtime dependency after all

It had been moved to `devDependencies` on the evidence that nothing in the bundle imports it.

That evidence was wrong. The SDK loads it **dynamically** to parse `--call` and `--list-tools`.

Without it, both flags are silently ignored and the server simply starts instead. Which is a confusing way to fail: no error, no message, just the wrong behaviour.

A static import scan cannot see a dynamic require. Running the thing can.

### 2. Chaining hung the first run

Covered in full on [Chaining](/UpDoc/mcp/chaining/). The short version: chaining spawns `npx -y @umbraco-cms/mcp-dev` at startup, and on a machine that has never fetched it the first run hangs silently while it downloads.

Locally it looks instant because the package is cached. The empty directory is what exposed it.

### 3. Four dependencies did not belong

Cloudflare Worker and eval-test packages that never ship in `dist/`.

Moved to `devDependencies`. A clean install went from a much larger tree to **40 packages, 0 vulnerabilities**.

### 4. The README was the scaffold's

Titled `# mcp`, explaining how to build a template.

It is the npm front page. It now covers what the server is, what it needs, how to register it, and what the tools do.

### 5. No `repository` field

So nothing linked npm back to the source.

Added alongside `author`, `homepage` and `bugs`.

## The beta dependency

`@umbraco-cms/mcp-server-sdk` is pinned **exactly** rather than with a caret:

```json
"@umbraco-cms/mcp-server-sdk": "1.0.0-beta.35"
```

An exact pin so a new beta cannot change behaviour between releases.

Anyone installing this inherits that beta dependency, so the README says so and suggests pinning. That is normal for this ecosystem today, since Umbraco's own MCP packages are all beta, but not something to discover afterwards.

## What ships

```json
"files": ["dist"],
"bin": { "updoc-mcp": "./dist/index.js" },
"engines": { "node": ">=22.0.0" }
```

`dist` only. The generated API client is **gitignored** and rebuilt by `npm run generate` against a running instance, because it is large, derived, and specific to whichever instance it was pointed at.

## Consuming it

There is nothing to install. Create an API user in the backoffice, then add this to the client's MCP configuration:

```json
{
  "mcpServers": {
    "updoc": {
      "command": "npx",
      "args": ["-y", "@umtemplates/updoc-mcp"],
      "env": {
        "UMBRACO_BASE_URL": "https://your-site.com",
        "UMBRACO_CLIENT_ID": "your-api-user-client-id",
        "UMBRACO_CLIENT_SECRET": "your-api-user-secret"
      }
    }
  }
}
```

`npx` fetches the server and runs it on the consumer's own machine, next to their AI client, talking to the site over HTTPS. Nothing is added to their project except those few lines.

Pinning a version is worth doing. Without it, `npx` fetches whatever is newest and a future release changes their setup without them choosing it.

## Versioning

The MCP server uses semver and versions **independently** of the NuGet package.

The NuGet package alternates between 4-part Umbraco-pegged versions and 3-part semver. The npm package does not follow it.

There is one hard coupling worth documenting for consumers: the endpoint these tools call was added in UpDoc **17.5.3.6**. Against anything earlier, `create-from-source` returns 404.

## A note on documentation reaching npm

A README fix does not reach npm until a republish, since a published version is immutable.

So a documentation correction made after release sits in the repository until the next version goes out. Worth knowing when the npm page and the repository disagree: the repository is ahead.

## Further reading

- [Chaining](/UpDoc/mcp/chaining/): the default the dry run reversed
- [Testing Traps](/UpDoc/mcp/testing-traps/): the same lesson at the tool level
- [The MCP server](/UpDoc/mcp/): setup as reference
