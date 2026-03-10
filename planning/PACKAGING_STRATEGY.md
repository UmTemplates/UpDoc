# Packaging Strategy — UpDoc as a Distributable Umbraco Package

**STATUS**: IN PROGRESS — following the implementation order below.

---

## Quick Index

| # | Step | Status | Section |
|---|------|--------|---------|
| 1 | Repo transfer | [x] | [1. Repo Transfer](#1-repo-transfer) |
| 2 | Move local folder | [x] | [2. Move Local Folder](#2-move-local-folder) |
| 3 | Create `develop` branch | [x] | [3. Create develop Branch](#3-create-develop-branch) |
| 4 | Create `assets/` | [x] | [4. Assets](#4-assets) |
| 5 | Update csproj | [x] | [5. NuGet Package Setup — csproj Metadata](#5-nuget-package-setup--csproj-metadata) |
| 6 | Resolve PdfPig | [~] | [6. Resolve PdfPig Custom Build](#6-resolve-pdfpig-custom-build) |
| 7 | Create `LICENSE` | [x] | [7. Create LICENSE](#7-create-license) |
| 8 | Write READMEs | [ ] | [8. READMEs](#8-readmes) |
| 9 | Create GitHub Actions + Secrets | [ ] | [9. GitHub Actions + Secrets](#9-github-actions--secrets) |
| 10 | Create issue templates | [ ] | [10. Issue Templates](#10-issue-templates) |
| 11 | Test locally | [ ] | [11. Test Locally](#11-test-locally) |
| 12 | First pre-release | [ ] | [12. First Pre-Release](#12-first-pre-release) |
| 13 | Test installation | [ ] | [13. Test Installation](#13-test-installation) |
| 14 | Verify NOT on marketplace | [ ] | [14. Verify NOT on Marketplace](#14-verify-not-on-marketplace) |
| — | **Phase B** | | |
| 15 | Create marketplace JSON | [ ] | [15. Marketplace JSON](#15-marketplace-json) |
| 16 | Create marketplace README | [ ] | [16. Marketplace README](#16-marketplace-readme) |
| 17 | Add marketplace tag | [ ] | [17. Add Marketplace Tag](#17-add-marketplace-tag) |
| 18 | Validate | [ ] | [18. Validate](#18-validate) |
| 19 | Tag stable release | [ ] | [19. Tag Stable Release](#19-tag-stable-release) |
| 20 | Verify marketplace listing | [ ] | [20. Verify Marketplace Listing](#20-verify-marketplace-listing) |

---

## Overview

UpDoc is a **NuGet library package** (Razor Class Library) that gets installed into an existing Umbraco site via `dotnet add package`. This is the standard Umbraco package model — fundamentally different from UmBootstrap, which is a dotnet project template.

The package will eventually be distributed across three platforms:
- **GitHub** — source code, issues, contributor workflow (UmTemplates org)
- **NuGet** — installable package via `dotnet add package`
- **Umbraco Marketplace** — discovery and listing for Umbraco users (auto-syncs from NuGet + GitHub)

### Two-Phase Release Strategy

**Phase A: NuGet only (initial release)**
- Package published to NuGet.org as a **pre-release** (e.g. `17.1.0-beta`)
- **NO `umbraco-marketplace` tag** in csproj `PackageTags` — this tag is what triggers automatic marketplace discovery. It must NOT be present until Phase B.
- **NO `umbraco-marketplace.json`** committed to the repo
- **NO `umbraco-marketplace-readme.md`** committed to the repo
- The package is installable via `dotnet add package Umbraco.Community.UpDoc --prerelease` but invisible on the Umbraco Marketplace
- This phase may last weeks or months while the package is tested and stabilised

**Phase B: Marketplace listing (when ready)**
- Add `umbraco-marketplace` to `PackageTags` in the csproj
- Commit `umbraco-marketplace.json` and `umbraco-marketplace-readme.md`
- Validate with https://marketplace.umbraco.com/validate
- Marketplace auto-syncs within 2-24 hours

### Project Structure

The existing structure is already correct for a library package:

```
UpDoc/
├── src/
│   ├── UpDoc/                    ← Razor Class Library (THE PACKAGE)
│   │   ├── UpDoc.csproj          ← Gets NuGet metadata added
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Models/
│   │   └── wwwroot/
│   │       └── App_Plugins/UpDoc/
│   │           ├── dist/         ← Built JS bundle
│   │           └── src/          ← TypeScript source
│   └── UpDoc.TestSite/           ← Dev/test Umbraco site (NOT PUBLISHED)
│       └── UpDoc.TestSite.csproj
├── assets/                       ← Package icon, NuGet readme (NEW)
├── docs/                         ← Starlight docs site
├── planning/                     ← Architecture plans
├── UpDoc.sln
├── README.md                     ← GitHub landing page (REWRITE)
├── umbraco-marketplace.json      ← Marketplace listing (PHASE B ONLY)
├── umbraco-marketplace-readme.md ← Marketplace README (PHASE B ONLY)
└── .github/
    ├── workflows/
    │   ├── RELEASE_NUGET.yml     ← NuGet publish on tag (NEW)
    │   └── add-to-project.yml    ← Auto-add issues to board (NEW)
    └── ISSUE_TEMPLATE/
        ├── bug_report.yml        ← (NEW)
        ├── feature_request.yml   ← (NEW)
        └── config.yml            ← (NEW)
```

**No restructuring needed.** The RCL (`src/UpDoc/`) is already the package project. The test site (`src/UpDoc.TestSite/`) references it via `<ProjectReference>` and is excluded from packaging by default (it's a separate project).

### What goes in the NuGet package

The RCL automatically packs:
- All compiled C# assemblies (Controllers, Services, Models)
- Static web assets from `wwwroot/` (the `App_Plugins/UpDoc/` folder with built JS)
- Razor views (if any)
- NuGet dependencies (AngleSharp, PdfPig, Umbraco.Cms references)

### What does NOT go in the package

- `src/UpDoc.TestSite/` — separate project, never packed
- `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/` — TypeScript source files (only `dist/` matters)
- `docs/` — documentation site, deployed separately
- `planning/` — internal architecture docs
- `tools/` — spike/prototype projects
- Test site data (`uSync`, `umbraco`, `updoc/workflows/` test data)

### Versioning

- **Git tag = package version** — no version hardcoded in csproj
- **Tag format**: `MAJOR.MINOR.PATCH` (e.g. `17.1.0`)
- **UpDoc version tracks Umbraco's exact version** — not just the major. If Umbraco is at `17.1.0`, UpDoc is `17.1.0`. If Umbraco skips a patch (e.g. `17.1.0` → `17.1.2`), UpDoc skips too. This matches the UmBootstrap convention.
- **Pre-release**: `MAJOR.MINOR.PATCH-suffix` (e.g. `17.1.0-beta`)
- **CI passes version**: `dotnet build /p:Version=${{github.ref_name}}`
- **First release version**: `17.1.0-beta` — matching the current Umbraco 17.1.0 that both UpDoc and UmBootstrap target.

### Testing strategy

UpDoc will be tested locally by installing it into an UmBootstrap site. The two packages are completely independent — UmBootstrap does not reference or depend on UpDoc, and UpDoc does not reference or depend on UmBootstrap. The UmBootstrap site is simply a convenient test host because it's a fully configured Umbraco site with content types and blueprints already in place.

---

## Phase A — NuGet-only release

---

### 1. Repo Transfer

> **STATUS: COMPLETE**

The repo was transferred from `deanleigh/UpDoc` to `UmTemplates/UpDoc`.

**Pre-transfer checks:**
- [x] Confirm you are an owner of the `UmTemplates` organisation
- [x] Confirm no repo named `UpDoc` already exists under `UmTemplates`
- [x] Note whether GitHub Pages is currently enabled on `deanleigh/UpDoc` (will need re-enabling after transfer)
- [x] Commit or stash all local work — `git status` must be clean

**Transfer steps:**
- [x] Go to `github.com/deanleigh/UpDoc` → Settings → Danger Zone → Transfer repository
- [x] Select `UmTemplates` as the destination organisation
- [x] Confirm the transfer
- [x] Verify the repo is now at `github.com/UmTemplates/UpDoc`
- [x] Verify `github.com/deanleigh/UpDoc` redirects to the new location
- [x] Update local git remote: `git remote set-url origin https://github.com/UmTemplates/UpDoc.git`
- [x] Verify remote: `git remote -v` — should show `UmTemplates/UpDoc`
- [x] Test push access: `git push --dry-run` (checks permissions without actually pushing)

---

### 2. Move Local Folder

> **STATUS: COMPLETE**

Moved from `D:\Users\deanl\source\repos\Umbraco Extensions\UpDoc` to `D:\Users\deanl\source\repos\UmTemplates\UpDoc`.

**Pre-move checklist:**
1. [x] Ensure the Umbraco test site is NOT running
2. [x] Ensure no editors have the project open (VS Code, Visual Studio, Rider)
3. [x] Ensure no terminal sessions have a working directory inside the UpDoc folder
4. [x] Commit or stash all uncommitted work — `git status` must be clean
5. [x] Verify git remote is already updated (step 1)

**Move steps:**
1. [x] Close all editors and terminals pointing to the old location
2. [x] Move the folder: `Umbraco Extensions\UpDoc` → `UmTemplates\UpDoc`
3. [x] Open the project from the new location
4. [x] Verify git still works: `git status`, `git log --oneline -5`, `git remote -v`
5. [x] Verify solution builds: `dotnet build UpDoc.sln`
6. [x] Verify frontend builds: `cd src/UpDoc/wwwroot/App_Plugins/UpDoc && npm run build`
7. [x] Verify test site runs: `dotnet run --project src/UpDoc.TestSite/UpDoc.TestSite.csproj`

**Files and configs that reference the old path — must update after move:**

| File | Path reference | Action |
|------|---------------|--------|
| `CLAUDE.md` | `d:\Users\deanl\source\repos\Umbraco Extensions\Umbraco-CMS` | Keep as-is (Umbraco-CMS is a read-only reference, not an UmTemplates project) |
| `CLAUDE.md` | Any self-referencing paths | Update if present |
| `~/.claude/projects/` | Auto-memory folder is keyed to working directory path | Claude Code will create a new project scope automatically. Copy `MEMORY.md` and topic files from the old scope to the new one. Old scope path: `d--Users-deanl-source-repos-Umbraco-Extensions-UpDoc`. New scope path: `d--Users-deanl-source-repos-UmTemplates-UpDoc` |
| `.git/config` | Remote URL | Already updated in step 1 |
| `node_modules/` | Absolute paths in some caches | Run `npm ci` in the frontend folder after move to be safe |

**The Umbraco-CMS reference clone stays at its current location** (`Umbraco Extensions\Umbraco-CMS`). It's not an UmTemplates project — it's a read-only reference for development. CLAUDE.md will continue to point there.

**Verification after all updates:**
- [x] `git status` clean at new location
- [x] `git push` works to `UmTemplates/UpDoc`
- [x] Solution builds
- [x] Frontend builds
- [x] Test site runs
- [x] Claude Code session in new location has memory files
- [x] CLAUDE.md paths are correct
- [x] Super user account updated to Dean Leigh (dean.leigh@deanleigh.co.uk, English UK)
- [x] Allen Key re-created as backup admin account

---

### 3. Create `develop` Branch

> **STATUS: COMPLETE**

Switched from single `main` branch to `develop`/`main` model:
- `develop` — default branch, all feature branches merge here
- `main` — release branch, `develop` merged here for releases
- Feature branches from `develop`

1. [x] Create `develop` branch from `main`
2. [x] Set `develop` as the default branch on GitHub
3. [ ] ~~Set up branch protection on `main`~~ — Skipped for now (solo developer, UmBootstrap doesn't use it either). Can add later.
4. [x] All future feature branches branch from `develop`, PRs merge to `develop`
5. [x] `develop` → `main` merge for releases

---

### 4. Assets

> **STATUS: COMPLETE**

Create the `assets/` folder with:

| File | Purpose | Status |
|------|---------|--------|
| `icon_nuget_updoc.png` | Package icon (NuGet + Marketplace) | **TO CREATE** |
| `README_nuget.md` | Short NuGet package readme | **TO CREATE** |

**Package icon requirements:**
- **NuGet**: 128x128 recommended, PNG format
- **Marketplace**: Referenced via raw GitHub URL from `develop` branch
- Design: Should be recognisable at small sizes, ideally incorporating the UpDoc branding

**NuGet readme** (`assets/README_nuget.md`) — short summary with links:

```markdown
# UpDoc — Create Umbraco Documents from External Sources

Extract content from PDFs, web pages, and markdown files and map it to Umbraco document blueprints using configurable workflows.

Please visit [GitHub](https://github.com/UmTemplates/UpDoc) for full documentation and installation instructions.

Please visit [Documentation](https://deanleigh.github.io/UpDoc/) for detailed guides.
```

**Screenshots** (optional but recommended) — add to `assets/` showing:
- The "Create from Source" workflow in action
- The workflow editor / rules editor
- Before/after of source content → created document

These would be referenced in the marketplace JSON `Screenshots` array and in READMEs.

---

### 5. NuGet Package Setup — csproj Metadata

> **STATUS: COMPLETE**

Add NuGet metadata to `src/UpDoc/UpDoc.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Razor">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <StaticWebAssetBasePath>/</StaticWebAssetBasePath>

    <!-- NuGet package metadata -->
    <PackageId>Umbraco.Community.UpDoc</PackageId>
    <Title>UpDoc</Title>
    <Authors>Dean Leigh</Authors>
    <Description>Create Umbraco documents from external sources (PDF, web pages, markdown) using configurable extraction workflows. Map source content to document blueprints with rule-based field mapping.</Description>
    <!-- PHASE A: Do NOT include 'umbraco-marketplace' tag — it triggers automatic marketplace listing -->
    <PackageTags>umbraco;pdf;extraction;content-import;workflow</PackageTags>
    <!-- PHASE B: When ready for marketplace, change to: umbraco;umbraco-marketplace;pdf;extraction;content-import;workflow -->
    <Copyright>$([System.DateTime]::UtcNow.ToString('yyyy')) © Dean Leigh</Copyright>
    <PackageIcon>icon_nuget_updoc.png</PackageIcon>
    <PackageReadmeFile>README_nuget.md</PackageReadmeFile>
    <RepositoryUrl>https://github.com/UmTemplates/UpDoc</RepositoryUrl>
    <RepositoryType>git</RepositoryType>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    <PackageProjectUrl>https://github.com/UmTemplates/UpDoc</PackageProjectUrl>
  </PropertyGroup>

  <!-- Exclude TypeScript source from package -->
  <ItemGroup>
    <Content Remove="wwwroot\App_Plugins\UpDoc\src\**" />
  </ItemGroup>

  <!-- Pack assets into NuGet package root -->
  <ItemGroup>
    <None Include="..\..\assets\README_nuget.md" Pack="true" PackagePath="\" />
    <None Include="..\..\assets\icon_nuget_updoc.png" Pack="true" PackagePath="\" />
  </ItemGroup>

  <!-- existing references... -->
</Project>
```

**Key differences from UmBootstrap csproj:**
- SDK is `Microsoft.NET.Sdk.Razor` (not `Microsoft.NET.Sdk`)
- No `PackageType: Template` — this is a standard library
- No `IncludeContentInPack`, `IncludeBuildOutput`, `ContentTargetFolders` — those are template-specific
- No `NoDefaultExcludes` — not needed for library packages
- Asset paths use `..\..\assets\` (relative from `src/UpDoc/`)

---

### 6. Resolve PdfPig Custom Build

> **STATUS: DEFERRED — not blocking Phase A**

UpDoc uses `UglyToad.PdfPig Version="1.7.0-custom-5"` (published by "grinay" on NuGet.org). This **will** restore for users — it's a real NuGet package, not a local-only build.

However, it's a third-party fork of the official `PdfPig` package (latest official: `PdfPig 0.1.13` by UglyToad). Relying on someone else's fork is risky long-term — it could be delisted or abandoned.

**Decision:** Proceed with Phase A using the current package. Migrate to official `PdfPig` as a separate feature branch before stable release. This requires testing since the namespace and API may differ.

**Migration task (future):**
1. Replace `UglyToad.PdfPig 1.7.0-custom-5` with official `PdfPig 0.1.13`
2. Update all `using` statements and API calls
3. Run full extraction tests against known PDFs
4. Verify no regressions in text extraction, page parsing, font handling

---

### 7. Create LICENSE

> **STATUS: COMPLETE**

Create a `LICENSE` file in repo root. MIT license (matches UmBootstrap).

---

### 8. READMEs

> **STATUS: TODO**

**Phase A: Two READMEs only.** No marketplace readme yet.

#### 8.1 `README.md` (repo root) — GitHub landing page

Full description, install guide, features overview, contributor info. Key sections:
- Description (what UpDoc does)
- Features (source types, workflow editor, rule-based mapping)
- Installation (`dotnet add package Umbraco.Community.UpDoc`)
- Quick Start (how to set up your first workflow)
- Documentation link
- Contributing
- License

Install is simple — one command:
```bash
dotnet add package Umbraco.Community.UpDoc
```

No Visual Studio template wizard, no `dotnet new` — just a standard NuGet package reference.

#### 8.2 `assets/README_nuget.md` — NuGet.org package page

Short summary with links (see section 4 for content).

---

### 9. GitHub Actions + Secrets

> **STATUS: TODO**

#### 9.1 Secrets

These GitHub Actions secrets need to be configured on the `UmTemplates/UpDoc` repo:
- [ ] **`NUGET_API_KEY`** — NuGet.org API key for the `dean.leigh` account. Generate a new key scoped to `Umbraco.Community.UpDoc` push.
- [ ] **`ADD_TO_PROJECT_PAT`** — already exists org-wide for UmTemplates (expires Mar 11 2027). Verify it covers the new repo.

#### 9.2 NuGet Publish Workflow

`.github/workflows/RELEASE_NUGET.yml` — triggered by semver tag push. Adapted from UmBootstrap but for a library package:

```yaml
name: Release Package

on:
  push:
    tags:
      - '[0-9]*.[0-9]*.[0-9]*'
      - '[0-9]*.[0-9]*.[0-9]*-*'
  workflow_dispatch:

jobs:
  build:
    runs-on: windows-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup dotnet
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: |
          10.x

    - name: Build
      run: dotnet build src\UpDoc\UpDoc.csproj -c Release /p:Version=${{github.ref_name}}

    - name: Pack
      run: dotnet pack src\UpDoc\UpDoc.csproj -c Release /p:Version=${{github.ref_name}} --no-build --output .

    - name: Push to NuGet
      run: dotnet nuget push **\*.nupkg -k ${{secrets.NUGET_API_KEY}} -s https://api.nuget.org/v3/index.json
```

**Key differences from UmBootstrap:**
- Builds `src\UpDoc\UpDoc.csproj` (not a template csproj at the root)
- Uses `actions/checkout@v4` and `actions/setup-dotnet@v4` (updated from v3)
- Standard library build/pack (no template-specific flags)

#### 9.3 Auto-Add to Project Board

`.github/workflows/add-to-project.yml` — identical to UmBootstrap:

```yaml
name: Add to project board

on:
  issues:
    types: [opened]

jobs:
  add-to-project:
    name: Add issue to project
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v1.0.2
        with:
          project-url: https://github.com/orgs/UmTemplates/projects/1
          github-token: ${{ secrets.ADD_TO_PROJECT_PAT }}
```

#### 9.4 Docs Deployment (existing)

Already configured — triggers on push to `develop` or `main` when `docs/**` changes. See `.github/workflows/docs.yml`.

---

### 10. Issue Templates

> **STATUS: TODO**

#### 10.1 Bug Report (`.github/ISSUE_TEMPLATE/bug_report.yml`)

Adapted from UmBootstrap — change product name and version fields:

- Title prefix: `[Bug]: `
- Labels: `["Bug"]`
- Fields: description, steps to reproduce, expected behaviour, Umbraco version, **UpDoc version** (not UmBootstrap), screenshots, additional context

#### 10.2 Feature Request (`.github/ISSUE_TEMPLATE/feature_request.yml`)

Adapted from UmBootstrap — change product name:

- Title prefix: `[Feature]: `
- Labels: `["Feature - New"]`
- Fields: description, use case, alternatives considered, additional context

#### 10.3 Config (`.github/ISSUE_TEMPLATE/config.yml`)

```yaml
blank_issues_enabled: false
contact_links:
  - name: Documentation
    url: https://umtemplates.github.io/UpDoc/
    about: Check the docs before raising an issue
  - name: Umbraco Documentation
    url: https://docs.umbraco.com/
    about: For general Umbraco questions
```

**Note:** UmBootstrap also has `content_request.yml` — this is starter-kit-specific and not relevant for UpDoc.

---

### 11. Test Locally

> **STATUS: TODO**

Run `dotnet pack` and verify package contents. Check that:
- TypeScript source files are excluded
- Built JS bundle is included
- Package icon and NuGet readme are included
- No test site files are included

---

### 12. First Pre-Release

> **STATUS: TODO**

Release checklist:
1. All feature work on feature branches, PRs to `develop`
2. Pre-release testing — verify the test site works, run E2E tests
3. Build the frontend — `cd src/UpDoc/wwwroot/App_Plugins/UpDoc && npm run build` — ensure `dist/updoc.js` is committed
4. Verify NO marketplace triggers — confirm `PackageTags` does NOT contain `umbraco-marketplace`, confirm `umbraco-marketplace.json` is NOT in the repo
5. Merge `develop` → `main` — PR or direct merge
6. Tag on `main` — `git tag 17.1.0-beta && git push origin 17.1.0-beta`
7. Verify NuGet publish — check GitHub Actions completed, verify package on nuget.org

Pre-release tag format: `17.1.0-beta`, `17.0.0-rc.1`, etc. These appear as pre-release on NuGet. Pre-release packages require `--prerelease` flag to install and do not show by default in NuGet search results — providing an extra layer of visibility control during Phase A.

---

### 13. Test Installation

> **STATUS: TODO**

Create a fresh Umbraco site, `dotnet add package Umbraco.Community.UpDoc --prerelease`, verify it works.

---

### 14. Verify NOT on Marketplace

> **STATUS: TODO**

Check https://marketplace.umbraco.com/ to confirm UpDoc does not appear.

---

## Phase B — Marketplace listing

Only start Phase B when satisfied with package stability.

---

### 15. Marketplace JSON

Create `umbraco-marketplace.json` in repo root:

```json
{
  "$schema": "https://marketplace.umbraco.com/umbraco-marketplace-schema.json",
  "AddOnPackagesRequiredForUmbracoCloud": [],
  "AlternateCategory": "",
  "AuthorDetails": {
    "Name": "Dean Leigh",
    "Description": "Umbraco developer and creator of UpDoc",
    "Url": "https://github.com/UmTemplates/UpDoc",
    "ImageUrl": "https://raw.githubusercontent.com/UmTemplates/UpDoc/develop/assets/icon_nuget_updoc.png",
    "Contributors": [
      {
        "Name": "Dean Leigh",
        "Url": "https://deanleigh.co.uk/"
      }
    ],
    "SyncContributorsFromRepository": true
  },
  "Category": "???",
  "Description": "Create Umbraco documents from external sources (PDF, web pages, markdown) using configurable extraction workflows with rule-based field mapping.",
  "DiscussionForumUrl": "",
  "DocumentationUrl": "https://umtemplates.github.io/UpDoc/",
  "LicenseTypes": ["Free"],
  "IssueTrackerUrl": "https://github.com/UmTemplates/UpDoc/issues",
  "IsSubPackageOf": "",
  "PackageType": "",
  "PackagesByAuthor": [
    "Umbraco.Community.Templates.UmBootstrap"
  ],
  "RelatedPackages": [],
  "Screenshots": [],
  "Tags": ["umbraco-marketplace", "pdf", "content-import", "extraction", "workflow", "mapping"],
  "Title": "UpDoc",
  "VersionSpecificPackageIds": [
    {
      "UmbracoMajorVersion": 17,
      "PackageId": "Umbraco.Community.UpDoc"
    }
  ],
  "VideoUrl": ""
}
```

**Category decision needed** — see Decisions section.

---

### 16. Marketplace README

Create `umbraco-marketplace-readme.md` in repo root. Nearly identical to `README.md`. Unlike UmBootstrap, no warning banner is needed — UpDoc installs via the standard `dotnet add package` flow, which the marketplace buttons support natively.

---

### 17. Add Marketplace Tag

Update `PackageTags` in csproj to include `umbraco-marketplace`:
```xml
<PackageTags>umbraco;umbraco-marketplace;pdf;extraction;content-import;workflow</PackageTags>
```

---

### 18. Validate

Validate with https://marketplace.umbraco.com/validate

---

### 19. Tag Stable Release

Tag a new release (stable version, e.g. `17.0.0` or `17.1.0`).

---

### 20. Verify Marketplace Listing

Marketplace auto-syncs within 2-24 hours — verify listing appears correctly.

---

## Decisions

These require user input before implementation:

### PackageId — DECISION NEEDED

**Proposed:** `Umbraco.Community.UpDoc`

Convention check — existing Umbraco community packages:
- `Umbraco.Community.BlockPreview`
- `Umbraco.Community.Contentment`
- `Umbraco.Community.UmbNav`

`Umbraco.Community.UpDoc` follows the established pattern.

### Marketplace Category — DECISION NEEDED (Phase B)

UmBootstrap uses "Themes & Starter Kits". UpDoc needs a different category.

Likely candidates (from [marketplace categories](https://marketplace.umbraco.com/)):
- **"Content Management"** — UpDoc manages content creation from external sources
- **"Developer Tools"** — it's a tool for content workflows
- **"Import & Export"** — content import from PDF/web/markdown

**Recommendation:** "Content Management" or "Import & Export" (check marketplace for exact category names).

### MimeKit Pinning — DECISION NEEDED

The csproj currently pins `MimeKit 4.15.1` for CVE-2026-30227. This would become a transitive dependency for end users. Options:
1. Keep the pin (users get the security fix)
2. Remove it before publishing (let Umbraco's dependency resolve naturally once they update)
3. Add a conditional — only pin if Umbraco hasn't updated yet

### Docs URL — DECISION NEEDED

Currently: `https://deanleigh.github.io/UpDoc/`
After transfer: should it move to `https://umtemplates.github.io/UpDoc/`?

This requires updating the GitHub Pages deployment to use the UmTemplates org.

### First Release Scope — DISCUSSION NEEDED

What features need to be complete/stable before the first public release? Consider:
- Which source types must work? (PDF is proven, web and markdown are newer)
- Is the workflow editor UI ready for public consumption?
- Are there breaking changes still expected?

A `17.1.0-beta` or `17.0.0-alpha` release allows early feedback while signalling instability.

---

## Reference

- UmBootstrap publishing strategy: `D:\Users\deanl\source\repos\UmTemplates\UmBootstrap\planning\PUBLISHING_STRATEGY.md`
- Umbraco Marketplace schema: https://marketplace.umbraco.com/umbraco-marketplace-schema.json
- Marketplace validation: https://marketplace.umbraco.com/validate
- NuGet community convention: https://www.nuget.org/packages?q=Umbraco.Community
