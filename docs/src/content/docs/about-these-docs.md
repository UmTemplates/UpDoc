---
title: About This Documentation
description: How the UpDoc documentation is built, hosted and maintained, and why it works the way it does.
---

This page explains how this documentation site is built and hosted.

It is here for two audiences. Contributors who need to change the docs, and
anyone curious about why the setup looks the way it does.

## What it is built with

The site is an [Astro Starlight](https://starlight.astro.build/) static site.

| Part | Choice |
|---|---|
| Framework | Astro |
| Docs theme | Starlight |
| Search | Pagefind |
| Diagrams | Mermaid, via `astro-mermaid` |
| Images | Sharp |

Starlight was chosen because it handles the tedious parts of a docs site
properly: sidebar navigation, search indexing, dark and light themes, mobile
layout, and code syntax highlighting. None of that had to be built.

The site was migrated from MkDocs in March 2026. See
[Docs Migration](/UpDoc/deployment/docs-migration/) for the reasoning.

## Where it lives

Everything is in the main UpDoc repository, under `docs/`.

The documentation is **not** in a separate repository. It sits with the code it
describes, so a change to a source file and a change to the page documenting it
can travel together in the same commit and the same pull request.

## Where it is hosted

GitHub Pages, at `https://umtemplates.github.io/UpDoc/`.

Deployment is automatic. A GitHub Actions workflow (`.github/workflows/docs.yml`)
builds the site and publishes it whenever anything under `docs/` changes on
`develop` or `main`.

The built output is **not** committed to the repository. It is generated in CI
on every deploy. This matters more than it sounds: committing build output is a
common source of noise, because a rebuild can produce dozens of files that
differ only by line endings, burying real content changes.

### Why GitHub Pages

UpDoc is a public package in a public repository, and the documentation is for
anyone evaluating or using it. There is nothing to gate and nobody to gate it
from, so the simplest option that does the job is the right one.

Other projects in this family host their docs on Cloudflare Pages, where the
audience is private and access control matters. UpDoc has neither requirement,
so it stays on GitHub Pages alongside the repository.

## Branching

UpDoc follows a `develop` and `main` model.

| Branch | Role |
|---|---|
| Feature branches | All work, branched from `develop` |
| `develop` | Main development branch |
| `main` | Release branch |

Documentation changes follow exactly the same path as code. Branch from
`develop`, open a pull request, merge. There is no separate docs branch and no
separate release process for the documentation.

This is a deliberate choice, and it differs from some sibling projects that keep
documentation on its own permanent branch so it can deploy independently of the
application. That pattern earns its keep when the docs and the product ship on
different schedules, or when several docs sites have different audiences.

UpDoc has one documentation site, one maintainer, and docs that describe the
code sitting next to them. Splitting them across branches would add ceremony
without removing any real friction.

## How the writing is organised

The sidebar is defined explicitly in `docs/astro.config.mjs` rather than
generated from the file structure. New pages must be added there or they will
not appear in the navigation, even though the page will still build and be
reachable by URL.

Content splits roughly into two audiences:

- **Task guides**, such as Creating a Workflow, aimed at whoever is setting up
  and using UpDoc in the backoffice.
- **Source file reference**, under Frontend and Backend, aimed at anyone working
  on UpDoc itself.

The project convention is that changing a source file means updating its
corresponding reference page in the same change.

## A build-time check worth knowing about

The build runs a script, `docs/scripts/check-no-local-paths.mjs`, that fails if
any local-machine path appears in the published output. Absolute Windows paths,
Unix home directories, personal usernames in file paths.

This exists because the site is public and indexed by search engines, and
because paths on a maintainer's machine are meaningless to a reader and mildly
leaky besides. If the check ever flags something legitimate, the fix is to
update the allowlist inside the script, not to disable the check.

## Working on the docs locally

```bash
cd docs
npm install
npm run dev
```

To check a change the way CI will see it, run the full build. This includes the
local-paths check, which `npm run dev` does not:

```bash
npm run build
```
