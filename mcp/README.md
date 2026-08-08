# @umtemplates/updoc-mcp

An MCP server for [UpDoc](https://github.com/UmTemplates/UpDoc), letting an AI assistant create Umbraco documents from PDFs.

UpDoc extracts content from a source document and maps it into a document blueprint using a configured workflow. This server exposes that as tools, so an assistant can run an import without driving the backoffice.

## Requirements

- **Umbraco 17** with [Umbraco.Community.UpDoc](https://www.nuget.org/packages/Umbraco.Community.UpDoc) **17.5.3.6 or later** installed
- At least one UpDoc workflow configured on the site
- An Umbraco API user the server can authenticate as
- Node 22 or later

The version matters: the endpoint these tools call was added in 17.5.3.6.

## Setup

### 1. Create an API user

In the Umbraco backoffice, go to **Users**, create an API user, and give it permission to read and create content. Note its client ID and secret.

### 2. Register the server

Add it to your MCP client's configuration. For Claude Code, that is `.mcp.json` in your project:

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

Running against a local site with a self-signed certificate? Add `"NODE_TLS_REJECT_UNAUTHORIZED": "0"` to `env`. Never do that against a production site.

Keep this file out of version control — it holds a secret.

### 3. Restart your MCP client

Servers connect at startup, so the tools will not appear until you restart.

## Tools

### `list-workflows`

Lists the workflows configured on the site: which document type and blueprint each produces, which source types it accepts, and whether it is complete.

Start here. Other tools need the blueprint id, and this is where you find it.

### `create-from-source`

Creates a document from a PDF already in the media library.

| Argument | Description |
|----------|-------------|
| `parentId` | Document to create under |
| `documentTypeId` | The document type to create |
| `blueprintId` | The blueprint to build from — also selects the workflow |
| `mediaId` | The PDF in the media library |
| `documentName` | Name for the new document |
| `sourceType` | Optional; defaults to the workflow's own |

Returns the new document's id, the workflow used, and how many values the mappings wrote.

**The document is created as a draft.** Review it, then publish separately.

**The PDF must already be uploaded.** This creates documents, it does not upload files — use Umbraco's own MCP server for that.

## Working alongside Umbraco's own MCP server

This server provides UpDoc's tools only. For everything else — uploading media, reading a document back, publishing — register [`@umbraco-cms/mcp-dev`](https://www.npmjs.com/package/@umbraco-cms/mcp-dev) as a second server:

```json
{
  "mcpServers": {
    "umbraco": { "command": "npx", "args": ["-y", "@umbraco-cms/mcp-dev"], "env": { } },
    "updoc":   { "command": "npx", "args": ["-y", "@umtemplates/updoc-mcp"], "env": { } }
  }
}
```

A typical import is two calls: upload the PDF with Umbraco's `create-media`, then pass the media id to `create-from-source`.

This server *can* chain to Umbraco's and proxy its tools, but that is off by default. Chaining spawns a second server at startup, which makes the first run on a clean machine hang while npm fetches it, and it re-exposes around 350 tools that appear twice for anyone already running Umbraco's server directly. Set `UMBRACO_MCP_CHAIN=true` if you want it.

## Notes

This is an early release, and it depends on `@umbraco-cms/mcp-server-sdk`, which is currently in beta. Pin a version rather than tracking the latest if that matters to you.

Only PDF sources are supported today. Markdown and web sources still go through the backoffice.

`mappedValueCount` is worth checking against the workflow's `mappingCount` from `list-workflows`. A lower number means some mappings did not resolve, and the document is worth a look before publishing.

## Documentation

- [UpDoc documentation](https://umtemplates.github.io/UpDoc/)
- [How and why this was built](https://umtemplates.github.io/UpDoc/article-mcp-server/)
- [Source and issues](https://github.com/UmTemplates/UpDoc)

## Licence

MIT
