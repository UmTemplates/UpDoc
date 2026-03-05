---
title: "Docs Migration: MkDocs to Astro Starlight"
---

In March 2026, the UpDoc documentation was migrated from MkDocs (with Material for MkDocs theme) to Astro Starlight.

## Why we migrated

- **MkDocs maintainer risk** — The MkDocs project was losing active maintainer support, creating long-term uncertainty.
- **Material for MkDocs theme risk** — The theme we relied on for navigation and styling was also at risk.
- **Python dependency removed** — MkDocs required Python. Astro Starlight is Node.js only, which aligns with our existing frontend toolchain.
- **Local preview** — `npm run dev` provides instant hot-reloading preview at `localhost:4321`.
- **Active community** — Astro Starlight is well-maintained, used by the Astro team for their own docs, and has a large community.

## What changed

| Before | After |
|--------|-------|
| `mkdocs.yml` config | `docs/astro.config.mjs` |
| `docs/*.md` (flat) | `docs/src/content/docs/**/*.md` |
| `package.manifest` not needed | `docs/package.json` with `"type": "module"` |
| Python + pip | Node.js + npm |
| `mkdocs serve` | `npm run dev` |
| `mkdocs gh-deploy` (branch-based) | GitHub Actions artifact deployment |
| MkDocs admonitions (`!!!`) | Starlight asides (`:::`) |

## What stayed the same

- Markdown files with YAML frontmatter
- Same content, same structure
- GitHub Pages hosting at `https://deanleigh.github.io/UpDoc/`
- Automatic deployment on push to `main`

## GitHub Pages setting

The deployment method changed from branch-based (`gh-pages` branch) to artifact-based (`deploy-pages@v4`). This required changing the repo's **Settings > Pages > Source** from "Deploy from a branch" to "GitHub Actions".

## Migration guide

A detailed step-by-step guide for migrating any MkDocs site to Astro Starlight is available at [MkDocs to Starlight Migration](/UpDoc/migration-guide-mkdocs-to-starlight/).
