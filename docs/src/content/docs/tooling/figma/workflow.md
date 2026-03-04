---
title: "Design Workflow"
---


The end-to-end workflow for using Figma to iterate on UpDoc's UI.

## The Process

```
Capture → Edit → Read → Implement
```

### 1. Capture

The user captures the current Umbraco backoffice UI using the [html.to.design](html-to-design.md) Figma plugin. This creates an editable Figma frame representing the live state of the UI.

**Best practice:** Capture only the specific panel or component you want to iterate on, not the entire backoffice screen. Smaller captures = fewer Figma nodes = less token consumption when Claude reads it back.

### 2. Edit

The user rearranges, adds, or removes elements directly in Figma:

- Move components to different positions
- Add placeholder text or labels for new elements
- Delete elements that should be removed
- Annotate with notes about intended behaviour

No design skills required — the goal is communicating intent, not producing polished mockups.

:::note[Claude cannot edit Figma designs]
The Figma MCP plugin cannot modify individual elements. All visual editing must be done by the user in Figma. See [Figma MCP — Bidirectional](figma-mcp.md#bidirectional--but-not-element-level-editing) for details.
:::

### 3. Read

Claude reads the modified design using [Figma MCP](figma-mcp.md) tools.

**Step 1:** Select the modified area in Figma and copy the link:

- **Desktop app:** Select the layer → press **Ctrl+L**
- **Browser:** The URL updates automatically with `?node-id=XX-YY`

**Step 2:** Paste the link to Claude. Claude extracts the node ID and reads just that targeted area.

**Step 3:** Claude uses the appropriate tool:

- **`get_screenshot`** — always start here. Gives Claude visual understanding of the layout changes with low token cost
- **`get_metadata`** — only if structural details are needed (exact node hierarchy, positions, sizes). High token cost.
- **`get_design_context`** — only when ready to generate implementation code. High token cost.

### 4. Implement

Claude translates the design changes into Lit/UUI code, following UpDoc's existing patterns and Umbraco's component library.

The Figma MCP's code output is React + Tailwind — this is a **reference only**. Claude adapts it to the project's actual stack (Lit web components, UUI/Umbraco elements, CSS custom properties).

## Validated Examples

### First iteration — successful (Feb 2026)

- Captured the Extracted tab showing section boxes with badges
- User rearranged badge positions in Figma
- Claude read via `get_screenshot` + `get_metadata`
- Claude implemented the layout changes in Lit

### Second iteration — token issue (Feb 2026)

- Captured a much more complex view (config toolbar + hierarchical tree)
- `get_metadata` on the full frame consumed too much context
- **Root cause:** The frame had 3-5x the node count of the first iteration
- **Fix:** Should have targeted individual sections (toolbar OR tree, not both)

### Targeted node test — successful (Feb 2026)

- Selected the "Icons and Text" frame in Figma desktop (node `16:1141`)
- Copied link with Ctrl+L, pasted URL to Claude
- Claude called `get_screenshot` on just that node
- Result: clear image showing config toolbar + section tree, low token cost
- **Validated:** targeted reads solve the token problem

## Tips

- **One area at a time** — capture and iterate on one component or section per cycle
- **Screenshot first** — `get_screenshot` is usually sufficient for Claude to understand changes
- **Name your Figma nodes** — if you rename elements in Figma, those names appear in metadata and help Claude understand intent
- **Keep the Figma file organised** — use separate frames for different areas of the UI rather than one giant frame
- **Copy link, not node ID** — in Figma desktop use Ctrl+L to copy the link. Claude extracts the node ID from the URL automatically
