# Plan: UpDoc Documentation MCP Server

## Goal

Publish the UpDoc documentation as an MCP server so that any AI tool (Claude Code, Cursor, Copilot, etc.) can query UpDoc's architecture, patterns, error guides, and source file docs without reading raw files.

## Consumers

1. **You in Claude Code** — working on UpDoc itself
2. **Other developers** — contributing to or extending UpDoc
3. **Tailored Travel project** — a separate repo that consumes UpDoc as a NuGet package; Claude Code there needs to understand UpDoc's internals

## What it exposes

### Resources (read-only content)

Every markdown doc in `docs/src/content/docs/` becomes an MCP resource:

```
updoc://docs/source-files/workflow-service-ts
updoc://docs/errors/convert-block-matching
updoc://docs/backend/stable-section-identity
updoc://docs/testing/blockkey-reconciliation
```

~67 docs currently. Resource URIs derived from file paths relative to `docs/src/content/docs/`.

### Tools

| Tool | Description |
|------|-------------|
| `search_docs(query)` | Full-text search across all docs. Returns matching doc titles, paths, and relevant snippets. |
| `get_doc(path)` | Fetch a specific doc by its resource path (e.g., `source-files/workflow-service-ts`). |
| `list_docs(category?)` | List all available docs, optionally filtered by category (`source-files`, `errors`, `backend`, `testing`, etc.). |

## Package Design

### Published npm package: `@umtemplates/updoc-mcp`

- **Transport:** stdio (standard for local MCP servers)
- **Runtime:** Node.js
- **Docs bundled at build time** — the markdown files are included in the npm package so consumers don't need the UpDoc repo cloned
- **SDK:** `@modelcontextprotocol/sdk` (official MCP TypeScript SDK)

### Consumer setup

In any project's `.mcp.json`:

```json
{
  "mcpServers": {
    "updoc-docs": {
      "command": "npx",
      "args": ["@umtemplates/updoc-mcp"]
    }
  }
}
```

Or in Claude Code's global settings for use across all projects.

### Project structure

```
mcp/
├── package.json          # @umtemplates/updoc-mcp
├── tsconfig.json
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── resources.ts      # Resource provider (reads bundled docs)
│   ├── tools.ts          # search_docs, get_doc, list_docs
│   └── search.ts         # Simple full-text search index
├── docs/                 # Copied from docs/src/content/docs/ at build time
│   ├── source-files/
│   ├── errors/
│   ├── backend/
│   └── ...
└── dist/                 # Compiled output
```

### Build pipeline

1. `prebuild` script copies `docs/src/content/docs/**/*.md` → `mcp/docs/`
2. `tsc` compiles TypeScript
3. `npm publish` ships both compiled JS and bundled markdown

### Search implementation

Simple approach first — no vector DB or embeddings:

1. At startup, read all bundled markdown files
2. Build an in-memory index: `Map<docPath, { title, content, category, frontmatter }>`
3. `search_docs` does case-insensitive substring/keyword matching across title + content
4. Returns ranked results with snippets (context around matches)

Can upgrade to something smarter later if needed (e.g., `minisearch` for proper full-text indexing with TF-IDF scoring).

## Transport decision: Local npm package (stdio)

**Chosen: Option B — local npm package via npx.**

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **A: Remote server** (like Astro/Netlify) | Zero install, just a URL | Needs hosting, domain, deployment pipeline | Rejected — overkill for beta with small user base |
| **B: Local npm (npx)** | Simple, offline, no hosting costs | Consumers install/update | **Chosen** |
| **C: Both** | Best of both worlds | Double the maintenance | Future option if UpDoc grows |

Note: Astro's official docs-mcp uses remote streamable HTTP hosted on Netlify — makes sense for them since Astro was acquired by Netlify. For UpDoc, npm/npx is more practical. Can add remote endpoint later.

## Alternatives considered

| Option | Pros | Cons |
|--------|------|------|
| **MCP server in UpDoc repo** (chosen) | Docs always in sync, single publish pipeline | Consumers need npm package, not just the NuGet |
| **Separate repo** | Independent versioning | Docs drift, two repos to maintain |
| **Just use Claude Code memory** | Zero setup | Only works for one user, not shareable, doesn't scale |
| **Embed docs in NuGet** | Single package | NuGet isn't the right vehicle for AI tool integration |

## Open questions

1. **Where in the repo?** `mcp/` folder at repo root? Or `tools/mcp/`? Or separate workspace in the monorepo?
2. **Versioning:** Sync with UpDoc versions (0.1.2-beta etc.) or independent?
3. **Planning files too?** The `planning/` folder has rich architectural context. Include them as resources? They're more volatile than docs but extremely useful for AI context.
4. **CLAUDE.md as a resource?** Could expose the project instructions so other AI tools get the same guidance.
5. **Auto-publish:** GitHub Action that publishes to npm when docs change? Or manual for now?

## Design philosophy

The JSON config files (`source.json`, `destination.json`, `map.json`) are **already AI-friendly by design** — any AI with file access can read and edit them directly. The MCP server doesn't replace that.

What the MCP server adds is **discoverability** — an AI working in a different repo (e.g., Tailored Travel) or an AI without the UpDoc source cloned can query the docs without knowing which file to read. It turns the docs from "files you have to find" into "knowledge you can ask for".

## Potential skills (Phase 3+)

Beyond docs-as-resources, the MCP server could include **prompts/skills** — reusable workflows that guide the AI through common UpDoc tasks:

| Skill | What it does |
|-------|-------------|
| `create-workflow` | Scaffolds a workflow folder structure with valid JSON templates for source/destination/map |
| `add-source-rule` | Generates a source rule with conditions from a natural language description (e.g., "bold blue text in div.tab-wrapper") |
| `validate-config` | Checks a workflow's JSON files for common mistakes (missing fields, invalid condition types, orphaned blockKeys) |
| `explain-extraction` | Given a sample-extraction.json, explains what was found and suggests rules |

These turn docs from "reference you read" into "assistant that helps you do the work."

## Implementation phases

### Phase 1: Working local MCP server
- Set up `mcp/` project with `@modelcontextprotocol/sdk`
- Implement `list_docs`, `get_doc`, `search_docs`
- Bundle docs at build time
- Test locally via `.mcp.json` in UpDoc repo

### Phase 2: Publish to npm
- Configure `package.json` for publishing under `@umtemplates` scope
- GitHub Action for auto-publish (or manual)
- Document setup in UpDoc docs (meta!)

### Phase 3: Enrich with skills + schema references
- Add planning files as resources (if decided)
- Add CLAUDE.md as a resource
- Add config schema references (condition types, format options, text replacement types)
- Add example workflow configs as reference resources
- Implement skills/prompts (`create-workflow`, `add-source-rule`, `validate-config`)
- Consider `minisearch` for better search quality
