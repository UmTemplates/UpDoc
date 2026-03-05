---
title: "Migration Guide: MkDocs to Astro Starlight"
---

Step-by-step instructions for migrating a documentation site from MkDocs (with Material for MkDocs theme) to Astro Starlight. Written so another Claude (or human) can follow it without hitting the same pitfalls.

## Prerequisites

- Node.js 22+ installed
- Existing MkDocs site with markdown files and `mkdocs.yml`

## Step 1: Scaffold with the official template

**This is critical.** Do NOT manually create the Astro project with `npm init` + `npm install`. The official template includes configuration that is easy to miss (notably `"type": "module"` in `package.json`, which is required for content collections to load files).

```bash
cd your-repo
npm create astro@latest -- --template starlight --no-install --no-git docs-astro
```

This creates a `docs-astro/` folder alongside your existing `docs/`. Choose the defaults when prompted.

Then install dependencies:

```bash
cd docs-astro
npm install
```

Verify the template works before touching anything:

```bash
npm run build
```

You should see ~4 pages built (the template's sample content). If this doesn't work, fix it before proceeding.

## Step 2: Configure `astro.config.mjs`

Open `docs-astro/astro.config.mjs` and configure:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  // If deploying to GitHub Pages at username.github.io/repo-name/
  site: 'https://YOUR_USERNAME.github.io',
  base: '/YOUR_REPO',
  integrations: [
    starlight({
      title: 'Your Project',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/your/repo' },
      ],
      // Optional: custom accent colours
      customCss: ['./src/styles/custom.css'],
      // Build the sidebar to match your mkdocs.yml nav structure
      sidebar: [
        { label: 'Getting Started', slug: 'getting-started' },
        {
          label: 'Guides',
          items: [
            { label: 'First Guide', slug: 'guides/first-guide' },
            { label: 'Second Guide', slug: 'guides/second-guide' },
          ],
        },
      ],
    }),
  ],
});
```

**Sidebar mapping:** Translate your `mkdocs.yml` `nav:` structure into the `sidebar` array. Each entry needs a `label` and `slug` (the slug is the file path relative to `src/content/docs/` without the `.md` extension).

## Step 3: Copy and migrate markdown files

Copy your markdown files from `docs/` into `docs-astro/src/content/docs/`, preserving the folder structure.

### Add YAML frontmatter

Every markdown file needs a `title` in its frontmatter. If your files already have frontmatter, just ensure `title` is present. If not, add it — typically derived from the first `# Heading` in the file:

```markdown
---
title: "Your Page Title"
---

Rest of the content...
```

Remove the `# Heading` line if it duplicates the title (Starlight renders the frontmatter title as the page heading).

### Convert MkDocs admonitions to Starlight asides

MkDocs/Material syntax:

```markdown
!!! warning "Watch out"
    This is indented content
    across multiple lines.
```

Starlight syntax:

```markdown
:::caution[Watch out]
This is NOT indented.
Across multiple lines.
:::
```

**Type mapping:**

| MkDocs type | Starlight type |
|-------------|---------------|
| `note` | `note` |
| `warning` | `caution` |
| `danger` | `danger` |
| `tip` | `tip` |
| `info` | `note` |

Key differences:
- Starlight uses `:::type[title]` instead of `!!! type "title"`
- Content is NOT indented (no 4-space indent)
- Closing `:::` is required

### Handle `index.md` in subdirectories

Starlight treats `index.md` inside a subdirectory as the directory's index page (its slug becomes the directory name, not `directory/index`). If you have an `index.md` that isn't meant to be a directory index, rename it. For example, if `source-files/index.md` documents a file called `index.ts`, rename it to `source-files/index-ts.md`.

## Step 4: Optional custom CSS

Create `docs-astro/src/styles/custom.css` for theme customisation:

```css
:root {
  --sl-color-accent-low: #4a148c;
  --sl-color-accent: #7c4dff;
  --sl-color-accent-high: #e8d5ff;
}
:root[data-theme='light'] {
  --sl-color-accent-low: #f3e5f5;
  --sl-color-accent: #7b1fa2;
  --sl-color-accent-high: #4a148c;
}
```

## Step 5: Build and preview

```bash
cd docs-astro
npm run build    # Check page count matches expectations
npm run dev      # Preview at localhost:4321
```

## Step 6: Replace MkDocs with Astro

Once you're happy with the Starlight site:

1. Delete `mkdocs.yml`
2. Delete the old `docs/` content (the raw markdown that MkDocs used)
3. Delete any MkDocs GitHub Action workflow
4. Move `docs-astro/` to `docs/`:
   ```bash
   # STOP any running dev server first — mv will fail on locked files
   mv docs-astro docs
   ```
5. Update `.gitignore`:
   ```
   docs/dist/
   docs/.astro/
   ```

## Step 7: GitHub Action for deployment

Replace your MkDocs Python workflow with an Astro Node.js workflow.

**Important:** In your GitHub repo settings, go to **Settings > Pages** and change **Source** from "Deploy from a branch" to **"GitHub Actions"**. The old MkDocs approach deployed to a `gh-pages` branch; Astro uses artifact-based deployment.

Create `.github/workflows/docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths: ['docs/**']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - working-directory: docs
        run: npm ci
      - working-directory: docs
        run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Common pitfalls

1. **Missing `"type": "module"` in `package.json`** — Content collections silently fail to load files. The site builds but only shows 1 page. Using the official `--template starlight` scaffolding avoids this.

2. **`index.md` slug conflicts** — An `index.md` in a subdirectory gets the directory name as its slug, not `directory/index`. Rename if this conflicts.

3. **Admonition indentation** — MkDocs requires 4-space indentation inside admonitions. Starlight does NOT. Remove the indentation or your content will render as a code block.

4. **`mv` fails with "Device or resource busy"** — Stop the Astro dev server before moving/renaming the docs directory.

5. **GitHub Pages shows 404 after deploy** — You forgot to change the Pages source to "GitHub Actions" in repo settings.

6. **Python not needed** — Astro is Node.js only. No Python dependency required (unlike MkDocs).
