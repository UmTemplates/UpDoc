---
title: "html.to.design"
---


[html.to.design](https://www.figma.com/community/plugin/1159123024924461424) is a Figma plugin by div:RIOTS that captures live web pages and converts them into editable Figma designs. It is the **only reliable way** to capture Umbraco's backoffice UI into Figma.

## Why This Plugin

Umbraco's backoffice is built entirely with Web Components and **Shadow DOM**. Standard capture tools (including Figma's built-in `generate_figma_design` MCP tool) cannot see inside Shadow DOM boundaries — they produce blank or incomplete captures.

html.to.design traverses Shadow DOM trees and captures the rendered output faithfully, including:

- Custom elements (`uui-*`, `umb-*`, `up-doc-*`)
- Slotted content
- CSS custom properties (applied/computed values)
- Nested shadow roots

## Usage

1. Open the Umbraco backoffice in a browser and navigate to the view you want to capture
2. In Figma, run the html.to.design plugin
3. Enter the URL of the page to capture
4. The plugin renders the full page (including Shadow DOM) as editable Figma layers

The captured output preserves the visual structure — text, colours, spacing, layout — as real Figma elements that can be rearranged, resized, and annotated.

## Limitations

- **Free tier:** approximately 9 imports per month
- **Capture scope:** captures the visible viewport; scrolled content may need multiple captures
- **Not pixel-perfect:** some CSS properties (animations, complex gradients, backdrop filters) may not translate exactly
- **MCP tab available:** html.to.design has an MCP integration tab that could enable programmatic capture in future, but this has not been tested yet

## Alternatives Considered

| Tool | Result with Umbraco |
|------|-------------------|
| Figma MCP `generate_figma_design` | Blank page — cannot see Shadow DOM |
| Browser screenshot | Static image — not editable in Figma |
| Chrome DevTools capture | Captures DOM but not Shadow DOM structure |

html.to.design is currently the only viable option for Umbraco backoffice capture.

## References

- [html.to.design on Figma Community](https://www.figma.com/community/plugin/1159123024924461424) — plugin listing and documentation
- [div:RIOTS (plugin author)](https://www.divriots.com/) — the team behind html.to.design
