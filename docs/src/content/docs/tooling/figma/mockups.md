---
title: "HTML Mockups"
---


Static HTML mockups provide a lightweight design workbench for iterating on UpDoc UI components without needing the Umbraco site running.

## Why Mockups?

| Problem | Mockup Solution |
|---------|----------------|
| Umbraco backoffice must be running to see components | Mockups render standalone in any browser |
| Shadow DOM blocks standard Figma capture | Mockups are plain HTML — standard capture works |
| Full site rebuild needed after TypeScript changes | Edit HTML, refresh browser, done |
| html.to.design plugin limited to ~9 captures/month (free tier) | Figma MCP capture script has no limit |

Mockups are **not** a replacement for the live backoffice. They are a fast iteration layer for designing individual components before translating approved designs into real Lit/UUI code.

## Directory

```
mockups/
  source-info-box.html      ← Source info box component
  ...future mockups
```

Each file is self-contained with inline CSS that approximates UUI variables (colors, spacing, fonts, border radius). No build step, no dependencies.

## How It Works

### Creating a Mockup

1. Claude reads the real Lit component code from `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/`
2. Claude creates a plain HTML file in `mockups/` that visually reproduces the component
3. UUI CSS custom properties are approximated with static values in a `:root` block

### The Design Loop

```
HTML mockup ←→ Browser preview ←→ Figma capture
     ↓                                    ↓
Real Lit/UUI code ←── Approved design ───┘
```

**Direction 1 — Code to Figma:**

1. Claude creates or updates the HTML mockup
2. Serve locally: `npx http-server mockups/ -p 3334 -c-1`
3. Open in browser to preview
4. Capture to Figma via MCP (see below)
5. User edits in Figma (move things, change colors, add elements)

**Direction 2 — Figma to Code:**

1. Claude reads the modified Figma design via `get_screenshot` / `get_metadata`
2. Claude updates the HTML mockup to match
3. When design is approved, Claude translates to real Lit/UUI code

## Capturing to Figma

### Setup

The capture script tag should be present in the mockup HTML `<head>`:

```html
<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
```

### Capture Process

1. **Start a local server** (if not already running):
   ```bash
   npx http-server mockups/ -p 3334 -c-1
   ```

2. **Claude requests a capture ID** from the Figma MCP `generate_figma_design` tool, targeting the "Back-office-work" file (`ZE8800trGvmQldnKeDq1Hy`)

3. **Claude opens the mockup** in the user's browser with the capture hash:
   ```
   start "" "http://localhost:3334/source-info-box.html#figmacapture=<ID>&figmaendpoint=<URL>&figmadelay=2000"
   ```

4. **User clicks "Send to Figma"** in the capture toolbar that appears in the browser

5. **Claude polls** the capture ID until status is `completed`

:::note[User action required]
The capture toolbar requires the user to click "Send to Figma". Claude cannot automate this step — it runs in the user's browser, not in the Playwright instance.
:::

## UUI Variable Reference

Mockups approximate UUI design tokens with static CSS values:

```css
:root {
  --uui-font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --uui-color-surface: #fff;
  --uui-color-border: #e0e0e0;
  --uui-color-text: #1b264f;
  --uui-color-text-alt: #666;
  --uui-color-default: #1b264f;
  --uui-color-default-emphasis: #2b3a6b;
  --uui-size-space-2: 6px;
  --uui-size-space-3: 9px;
  --uui-size-space-4: 12px;
  --uui-size-space-5: 15px;
  --uui-border-radius: 3px;
  --uui-type-small-size: 12px;
  --uui-type-default-size: 14px;
  --uui-type-h4-size: 18px;
}
```

These are approximations — check the [UUI Storybook](https://uui.umbraco.com/) for authoritative values.

## Tips

- **One component per file** — keep mockups focused on a single component or small group
- **Match real data** — use realistic content (actual filenames, dates, counts) so the design reflects real usage
- **SVG for icons** — inline SVGs approximate Umbraco's icon set without needing the icon font
- **Background color** — use `#f3f3f5` for body to match Umbraco's backoffice background
- **Leave the capture script in** — it only activates when opened with the capture hash parameters
