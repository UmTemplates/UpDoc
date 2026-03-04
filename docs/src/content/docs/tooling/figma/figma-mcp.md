---
title: "Figma MCP Plugin"
---


The [Figma MCP Plugin](https://claude.com/plugins/figma) is the official integration between Claude Code and Figma. It provides Claude with direct access to read designs and push web captures to Figma via MCP (Model Context Protocol) tools.

## Installation

The plugin is installed via Claude Code's plugin system. Once connected, Claude has access to Figma MCP tools automatically.

## Bidirectional — But Not Element-Level Editing

The Figma MCP integration is described as "bidirectional", but this does **not** mean Claude can edit individual Figma elements (move layers, swap icons, change text). The two directions are:

| Direction | What it means | Tools |
|-----------|--------------|-------|
| **Figma → Code** | Claude reads designs and implements them in code | `get_screenshot`, `get_metadata`, `get_design_context` |
| **Code → Figma** | Claude captures a running web page and pushes it as editable Figma layers | `generate_figma_design` |

The round-trip workflow is: build UI in code → push to Figma → user edits in Figma → Claude reads back and updates code. But Claude cannot reach into an existing Figma design and modify individual elements.

For element-level editing from Claude, see [claude-talk-to-figma-mcp](https://github.com/arinspunk/claude-talk-to-figma-mcp) — a third-party MCP server that adds read/analyze/modify capabilities. Not tested with this project.

## Key Tools

### Reading Designs (Figma → Claude)

| Tool | What it returns | Token cost |
|------|----------------|------------|
| `get_screenshot` | Visual image of a node | Low — uses vision tokens |
| `get_metadata` | XML tree of all nodes (IDs, types, names, positions, sizes) | **High** — can be enormous for complex frames |
| `get_design_context` | Generated code + screenshot + contextual hints | **High** — includes code and metadata |
| `get_variable_defs` | Design token values (colours, spacing, etc.) | Low |

### Writing Designs (Code → Figma)

| Tool | Purpose |
|------|---------|
| `generate_figma_design` | Capture a running web page and push it to Figma as editable layers |
| `generate_diagram` | Create flowcharts, sequence diagrams, etc. in FigJam |

`generate_figma_design` supports three modes:

- **New file** — creates a fresh Figma file with the captured design
- **Existing file** — adds the capture to an existing Figma file (e.g., "Back-office-work")
- **Clipboard** — copies the captured design for manual pasting

The capture process works by running a JavaScript snippet in the browser, which serializes the page into Figma layers. Text becomes editable text, buttons become separate components, and layouts use auto-layout.

### Component Mapping (Code Connect)

| Tool | Purpose |
|------|---------|
| `get_code_connect_map` | Get existing mappings between Figma components and codebase |
| `add_code_connect_map` | Create a new mapping |
| `get_code_connect_suggestions` | Get suggested mappings for a node |

## Getting Node IDs

To target a specific element, Claude needs its **node ID**. In Figma:

1. **Desktop app:** Select the element, press **Ctrl+L** to copy the link
2. **Browser:** The URL updates automatically with `?node-id=XX-YY` when you select an element

Paste the copied link — Claude extracts the file key and node ID from the URL format:
```
figma.com/design/:fileKey/:fileName?node-id=XX-YY
```

The `XX-YY` in the URL becomes `XX:YY` as the node ID.

## Token Management

All Figma MCP tool responses flow into **Claude's context window** — there are no separate "Figma tokens". This means large payloads directly reduce your available conversation context.

### Strategies

1. **Use `get_screenshot` first** — it gives Claude enough visual context to understand layout changes without the XML overhead
2. **Target specific nodes** — instead of reading an entire frame, select just the component or section you've edited and use that node's ID
3. **Avoid `get_metadata` on large frames** — a full Umbraco backoffice capture can have hundreds of nested elements. Only request metadata for focused areas
4. **`get_design_context` is for implementation** — use it when you're ready to write code, not for exploration

### Validated: Targeted Screenshot Test (Feb 2026)

Successfully tested targeted node reading on the "Icons and Text" frame (node `16:1141`):

- Selected a specific layer in Figma desktop → Ctrl+L → pasted URL
- Claude called `get_screenshot` on just that node
- Result: clear, complete image of the config toolbar + section tree
- Token cost: low (single image, no XML overhead)

This confirmed the workflow: **select a layer → copy link → paste → Claude screenshots just that area**.

### What Happened on Our Second Attempt

The first design iteration worked perfectly — a simple flat list of section boxes with badges. The second attempt captured a much more complex view (config toolbar, hierarchical tree, multiple button types, nested sections) and the metadata payload consumed too much of the context window.

**Lesson:** Always scope your Figma reads to the specific area you're working on, not the entire captured frame.

## Limitations

- **`generate_figma_design` does NOT work for Umbraco** — the built-in web capture cannot see Shadow DOM content, resulting in blank pages. Use [html.to.design](html-to-design.md) instead.
- **No element-level editing** — Claude cannot modify individual Figma elements (move layers, replace icons, edit text). The user must make visual edits in Figma.
- **Code output is React + Tailwind by default** — the generated code is a reference, not final code. Always adapt to the target project's stack (Lit + UUI in UpDoc's case).

## References

- [Figma MCP Plugin](https://claude.com/plugins/figma) — official plugin listing
- [Introducing Claude Code to Figma](https://www.figma.com/blog/introducing-claude-code-to-figma/) — Figma blog: "Code to Canvas" announcement
- [Claude Code to Figma Tutorial (Builder.io)](https://www.builder.io/blog/claude-code-to-figma) — detailed tutorial and limitations
- [Guide to the Figma MCP server (Figma Help)](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) — official documentation
- [claude-talk-to-figma-mcp](https://github.com/arinspunk/claude-talk-to-figma-mcp) — third-party MCP for element-level editing (untested)
