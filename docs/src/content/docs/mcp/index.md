---
title: "The MCP server"
---

UpDoc ships an [MCP](https://modelcontextprotocol.io/) server, so an AI assistant can create documents from PDFs without driving the backoffice.

```
@umtemplates/updoc-mcp
```

It is a separate npm package, not part of the NuGet package. The extension runs inside Umbraco on a server; the MCP server runs on your own machine next to your AI client, and talks to the site over HTTP. Different runtimes, so they cannot travel together.

## What you need

- **Umbraco 17** with `Umbraco.Community.UpDoc` **17.5.3.6 or later**
- At least one workflow configured
- An Umbraco API user with permission to read and create content
- **Node 22** or later

The version matters. The endpoint these tools call was added in 17.5.3.6, and against anything earlier they will return 404.

## Setting it up

### 1. Create an API user

In the backoffice, go to **Users**, create an API user, and give it permission to read and create content. Note the client id and secret.

### 2. Register the server

For Claude Code, that is `.mcp.json` in your project:

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

Against a local site with a self-signed certificate, add `"NODE_TLS_REJECT_UNAUTHORIZED": "0"`. Never against production.

**Keep this file out of version control.** It holds a secret.

Pinning a version — `@umtemplates/updoc-mcp@0.1.0` — is worth doing. Without it, `npx` fetches whatever is newest, and a future release changes your setup without you choosing it.

### 3. Restart your client

MCP servers connect at startup. The tools will not appear until you restart, and a rebuild or reinstall will not take effect until you do either.

## The tools

### `list-workflows`

Lists the workflows configured on the site: document type, blueprint, source types, mapping count, and any validation warnings.

Start here. `create-from-source` needs a blueprint id, and this is where it comes from.

### `create-from-source`

Creates a document from a PDF already in the media library.

| Argument | Description |
|----------|-------------|
| `parentId` | Document to create under |
| `documentTypeId` | The document type to create |
| `blueprintId` | The blueprint to build from — this also selects the workflow |
| `mediaId` | The PDF in the media library |
| `documentName` | Name for the new document |
| `sourceType` | Optional; defaults to the workflow's own |

Returns the new document's id, the workflow used, and `mappedValueCount`.

**The document is a draft.** Publish it separately once the content has been checked.

**The PDF must already be uploaded.** See below.

## Working alongside Umbraco's own server

This server provides UpDoc's tools only. For uploading media, reading a document back, or publishing, register [`@umbraco-cms/mcp-dev`](https://www.npmjs.com/package/@umbraco-cms/mcp-dev) as a second server:

```json
{
  "mcpServers": {
    "umbraco": {
      "command": "npx",
      "args": ["-y", "@umbraco-cms/mcp-dev"],
      "env": { }
    },
    "updoc": {
      "command": "npx",
      "args": ["-y", "@umtemplates/updoc-mcp"],
      "env": { }
    }
  }
}
```

A typical import is then two calls:

1. `create-media` on Umbraco's server, giving a media id
2. `create-from-source` on UpDoc's, giving a document id

Then `publish-document` when the content has been checked.

### Chaining

This server can chain to Umbraco's and proxy its tools, so everything arrives through one server. It is **off by default**.

Turning it on spawns a second MCP server at startup, which makes the first run on a clean machine hang while npm fetches it. It also re-exposes around 350 tools, which appear twice for anyone already running Umbraco's server directly.

Set `UMBRACO_MCP_CHAIN=true` if you want it anyway.

## Checking an import went well

`create-from-source` returns `mappedValueCount`. Compare it with the workflow's `mappingCount` from `list-workflows`.

Equal numbers mean every mapping resolved. A lower number means a section did not match its rule, and a field is sitting empty in the document that was created. It is the cheapest check available, and it costs one comparison.

## Running it by hand

The package includes a CLI, which is useful for checking configuration without an MCP client:

```bash
npx @umtemplates/updoc-mcp --list-tools
npx @umtemplates/updoc-mcp --call list-workflows
```

One caveat worth knowing: **the CLI does not validate tool output**, and it calls handlers directly rather than going through tool registration. So it proves the API call works and says nothing about whether the tool contract is right. If a tool behaves differently through an MCP client than through `--call`, that difference is the first place to look.

## Versioning

The MCP server uses semver and versions independently of the NuGet package. A fix to one does not require releasing the other.

| | Registry | Provides |
|--|----------|----------|
| `Umbraco.Community.UpDoc` | NuGet | The endpoints |
| `@umtemplates/updoc-mcp` | npm | The tools that call them |

## How this was built

The pages below record why the MCP server is the way it is: the decisions, the reversals, and the mistakes worth not repeating.

| Page | Answers |
|---|---|
| [Why UpDoc Needed an API](./why-an-api/) | Why a tool triggers rather than performs |
| [Routes Considered](./routes-considered/) | Five options, and why the build reversed the plan |
| [Making the API Visible](./making-the-api-visible/) | Why UpDoc's API was invisible for two years |
| [Describing the Responses](./describing-responses/) | Why response types come before tools |
| [Porting the Mapping to C#](./porting-to-csharp/) | What moved, and the four things that behaved differently |
| [Two Implementations](./two-implementations/) | Why the create logic exists twice, and what must agree |
| [Building the Tools](./building-the-tools/) | The two tools, and why descriptions matter |
| [Chaining](./chaining/) | Why it is off, and both kill switches |
| [Testing Traps](./testing-traps/) | Three bugs in six lines, all invisible to the CLI |
| [Publishing to npm](./publishing/) | Two registries, and what a dry run caught |
| [What Is Still Open](./still-open/) | Deliberate gaps and known defects |

## Further reading

- [The UpDoc API](../api/): the endpoints these tools wrap
- [@umtemplates/updoc-mcp on npm](https://www.npmjs.com/package/@umtemplates/updoc-mcp)
