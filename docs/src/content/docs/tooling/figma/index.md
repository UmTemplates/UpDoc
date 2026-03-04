---
title: "Figma"
---


Figma is used in UpDoc development for UI design iteration — capturing the current Umbraco backoffice state, making visual changes in Figma, and having Claude implement those changes in code.

This workflow is necessary because Umbraco's backoffice uses **Shadow DOM extensively**, which makes traditional screenshot-based design tools unreliable. A specialised capture plugin (html.to.design) is required.

## Tools

| Tool | Purpose |
|------|---------|
| [Figma MCP Plugin](figma-mcp.md) | Official Claude Code integration — reads designs, pushes web captures, manages component mappings |
| [html.to.design](html-to-design.md) | Figma plugin that captures web pages including Shadow DOM content |
| [HTML Mockups](mockups.md) | Static HTML mockups for fast component design iteration without the Umbraco site |
| [Design Workflow](workflow.md) | The end-to-end capture → edit → read → implement workflow and token management strategies |

## How It Works

The integration is **bidirectional** but with different capabilities in each direction:

| Direction | Capability | Limitation |
|-----------|-----------|------------|
| **Figma → Code** | Claude reads any design element (screenshot, metadata, code context) | Large frames consume many tokens |
| **Code → Figma** | Claude pushes running web pages as editable Figma layers | Cannot see Shadow DOM (use html.to.design instead) |
| **Edit in Figma** | User only — Claude cannot modify individual Figma elements | No element-level editing via MCP |

The practical workflow for Umbraco projects:

1. **User** captures the backoffice UI with html.to.design
2. **User** edits the design in Figma (move, add, remove elements)
3. **User** selects the modified area and copies the link (Ctrl+L)
4. **Claude** reads the targeted node via `get_screenshot`
5. **Claude** implements the changes in Lit/UUI code

For component-level design iteration without the Umbraco site running, see [HTML Mockups](mockups.md).

## Figma File

The UpDoc design work uses a single Figma file:

- **File:** "Back-office-work"
- **File key:** `ZE8800trGvmQldnKeDq1Hy`
- **Key node:** `12:2` (main captured frame "1920w default")

## References

- [Figma MCP Plugin listing](https://claude.com/plugins/figma) — official Claude Code plugin page
- [Introducing Claude Code to Figma](https://www.figma.com/blog/introducing-claude-code-to-figma/) — Figma blog: "Code to Canvas" announcement
- [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) — official Figma documentation
- [html.to.design on Figma Community](https://www.figma.com/community/plugin/1159123024924461424) — the Shadow DOM capture plugin
- [claude-talk-to-figma-mcp](https://github.com/arinspunk/claude-talk-to-figma-mcp) — third-party MCP for element-level editing (untested)
