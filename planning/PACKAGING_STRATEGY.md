# Packaging Strategy — UpDoc as a Distributable Umbraco Package

**STATUS**: PLANNING — nothing in this document should be implemented without explicit approval.

---

## Overview

UpDoc is a **NuGet library package** (Razor Class Library) that gets installed into an existing Umbraco site via `dotnet add package`. This is the standard Umbraco package model — fundamentally different from UmBootstrap, which is a dotnet project template.

The package will eventually be distributed across three platforms:
- **GitHub** — source code, issues, contributor workflow (UmTemplates org)
- **NuGet** — installable package via `dotnet add package`
- **Umbraco Marketplace** — discovery and listing for Umbraco users (auto-syncs from NuGet + GitHub)

### ⚠ TWO-PHASE RELEASE STRATEGY

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

**Sections 5 (Marketplace JSON) and parts of section 3 (PackageTags) in this document describe Phase B work. They are included for completeness but must NOT be implemented during Phase A.**

---

## 1. Prerequisites

### 1.1 Transfer repo to UmTemplates org

The repo is currently at `deanleigh/UpDoc` and must be transferred to `UmTemplates/UpDoc` before any publishing setup.

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

### 1.2 Move local folder to UmTemplates directory

The local repo is currently at:
```
D:\Users\deanl\source\repos\Umbraco Extensions\UpDoc
```

Once the GitHub transfer is complete, move it to sit alongside UmBootstrap:
```
D:\Users\deanl\source\repos\UmTemplates\UpDoc
```

**⚠ HIGH RISK — several months of work depends on this going cleanly. Follow every step.**

**Pre-move checklist:**
1. [x] Ensure the Umbraco test site is NOT running
2. [x] Ensure no editors have the project open (VS Code, Visual Studio, Rider)
3. [x] Ensure no terminal sessions have a working directory inside the UpDoc folder
4. [x] Commit or stash all uncommitted work — `git status` must be clean
5. [x] Verify git remote is already updated (step 1.1.4 above)

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
| `.git/config` | Remote URL | Already updated in step 1.1.4 |
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

### 1.3 Create `develop` branch

The current workflow uses `main` only. Before publishing:
1. [x] Create `develop` branch from `main`
2. [x] Set `develop` as the default branch on GitHub
3. [ ] ~~Set up branch protection on `main`~~ — Skipped for now (solo developer, UmBootstrap doesn't use it either). Can add later.
4. [x] All future feature branches branch from `develop`, PRs merge to `develop`
5. [x] `develop` → `main` merge for releases

### 1.3 Secrets

These GitHub Actions secrets need to be configured on the `UmTemplates/UpDoc` repo:
- [ ] **`NUGET_API_KEY`** — NuGet.org API key for the `dean.leigh` account. Generate a new key scoped to `Umbraco.Community.UpDoc` push.
- [ ] **`ADD_TO_PROJECT_PAT`** — already exists org-wide for UmTemplates (expires Mar 11 2027). Verify it covers the new repo.

---

## 2. Project Structure

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

### TypeScript source exclusion

The `src/` TypeScript folder is under `wwwroot/` and would be included in the package by default. Add an exclusion to the csproj:

```xml
<ItemGroup>
  <Content Remove="wwwroot\App_Plugins\UpDoc\src\**" />
</ItemGroup>
```

This keeps only the built `dist/updoc.js` in the package.

### PdfPig custom build

UpDoc currently uses `UglyToad.PdfPig Version="1.7.0-custom-5"`. This is a custom build — it won't resolve from NuGet.org for end users. **This must be resolved before publishing.** Options:
1. Switch to the official PdfPig release (if the needed fixes are upstream)
2. Publish the custom build to NuGet.org under a different package ID
3. Include PdfPig as a bundled DLL (not ideal)

**Decision needed.**

---

## 3. NuGet Package Setup — csproj Metadata

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

## 4. Three READMEs

### 4.1 `README.md` (repo root) — GitHub landing page

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

### 4.2 `assets/README_nuget.md` — NuGet.org package page

Short summary with links. Following the UmBootstrap pattern:

```markdown
# UpDoc — Create Umbraco Documents from External Sources

Extract content from PDFs, web pages, and markdown files and map it to Umbraco document blueprints using configurable workflows.

Please visit [GitHub](https://github.com/UmTemplates/UpDoc) for full documentation and installation instructions.

Please visit [Documentation](https://deanleigh.github.io/UpDoc/) for detailed guides.
```

**Note:** The docs URL will change to `https://umtemplates.github.io/UpDoc/` after the repo transfer.

### 4.3 `umbraco-marketplace-readme.md` (repo root) — Umbraco Marketplace

Nearly identical to `README.md`. Unlike UmBootstrap, no warning banner is needed — UpDoc installs via the standard `dotnet add package` flow, which the marketplace buttons support natively.

---

## 5. Marketplace JSON

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

## 6. GitHub Actions

### 6.1 NuGet Publish Workflow

`.github/workflows/RELEASE_NUGET.yml` — triggered by semver tag push. Adapted from UmBootstrap but for a library package (builds the RCL project, not a template):

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

### 6.2 Auto-Add to Project Board

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

### 6.3 Docs Deployment (existing)

The docs deployment workflow may already exist or need updating to trigger from `develop`/`main` pushes. Verify after repo transfer.

---

## 7. Issue Templates

### 7.1 Bug Report (`.github/ISSUE_TEMPLATE/bug_report.yml`)

Adapted from UmBootstrap — change product name and version fields:

- Title prefix: `[Bug]: `
- Labels: `["Bug"]`
- Fields: description, steps to reproduce, expected behaviour, Umbraco version, **UpDoc version** (not UmBootstrap), screenshots, additional context

### 7.2 Feature Request (`.github/ISSUE_TEMPLATE/feature_request.yml`)

Adapted from UmBootstrap — change product name:

- Title prefix: `[Feature]: `
- Labels: `["Feature - New"]`
- Fields: description, use case, alternatives considered, additional context

### 7.3 Config (`.github/ISSUE_TEMPLATE/config.yml`)

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

## 8. Assets

### Required assets in `assets/` folder:

| File | Purpose | Status |
|------|---------|--------|
| `icon_nuget_updoc.png` | Package icon (NuGet + Marketplace) | **TO CREATE** |
| `README_nuget.md` | Short NuGet package readme | **TO CREATE** |

### Package icon requirements

- **NuGet**: 128x128 recommended, PNG format
- **Marketplace**: Referenced via raw GitHub URL from `develop` branch
- Design: Should be recognisable at small sizes, ideally incorporating the UpDoc branding

### Screenshots (optional but recommended)

Add screenshots to `assets/` showing:
- The "Create from Source" workflow in action
- The workflow editor / rules editor
- Before/after of source content → created document

These would be referenced in the marketplace JSON `Screenshots` array and in READMEs.

---

## 9. Release Process

### Phase A release checklist (NuGet only — no marketplace):

1. **Develop** — all feature work on feature branches, PRs to `develop`
2. **Pre-release testing** — verify the test site works, run E2E tests
3. **Build the frontend** — `cd src/UpDoc/wwwroot/App_Plugins/UpDoc && npm run build` — ensure `dist/updoc.js` is committed
4. **Verify NO marketplace triggers** — confirm `PackageTags` does NOT contain `umbraco-marketplace`, confirm `umbraco-marketplace.json` is NOT in the repo
5. **Merge `develop` → `main`** — PR or direct merge
6. **Tag on `main`** — `git tag 17.1.0-beta && git push origin 17.1.0-beta`
7. **Verify NuGet publish** — check GitHub Actions completed, verify package on nuget.org
8. **Test installation** — create a fresh Umbraco site, `dotnet add package Umbraco.Community.UpDoc --prerelease`, verify it works
9. **Verify NOT on marketplace** — check https://marketplace.umbraco.com/ to confirm UpDoc does not appear

### Phase B release checklist (marketplace listing — when ready):

1. Add `umbraco-marketplace` to `PackageTags` in csproj
2. Commit `umbraco-marketplace.json` to repo root
3. Commit `umbraco-marketplace-readme.md` to repo root
4. Validate with https://marketplace.umbraco.com/validate
5. Tag a new release (stable version, e.g. `17.0.0` or `17.1.0`)
6. Marketplace auto-syncs within 2-24 hours — verify listing

### Pre-release versions

Tag format: `17.1.0-beta`, `17.0.0-rc.1`, etc. These appear as pre-release on NuGet. Pre-release packages require `--prerelease` flag to install and do not show by default in NuGet search results — providing an extra layer of visibility control during Phase A.

---

## 10. Versioning

- **Git tag = package version** — no version hardcoded in csproj
- **Tag format**: `MAJOR.MINOR.PATCH` (e.g. `17.1.0`)
- **UpDoc version tracks Umbraco's exact version** — not just the major. If Umbraco is at `17.1.0`, UpDoc is `17.1.0`. If Umbraco skips a patch (e.g. `17.1.0` → `17.1.2`), UpDoc skips too. This matches the UmBootstrap convention.
- **Pre-release**: `MAJOR.MINOR.PATCH-suffix` (e.g. `17.1.0-beta`)
- **CI passes version**: `dotnet build /p:Version=${{github.ref_name}}`

### Testing strategy

UpDoc will be tested locally by installing it into an UmBootstrap site. The two packages are completely independent — UmBootstrap does not reference or depend on UpDoc, and UpDoc does not reference or depend on UmBootstrap. The UmBootstrap site is simply a convenient test host because it's a fully configured Umbraco site with content types and blueprints already in place.

### First release version

`17.1.0-beta` — matching the current Umbraco 17.1.0 that both UpDoc and UmBootstrap target.

---

## 11. Decisions to Make

These require user input before implementation:

### 11.1 PackageId — DECISION NEEDED

**Proposed:** `Umbraco.Community.UpDoc`

Convention check — existing Umbraco community packages:
- `Umbraco.Community.BlockPreview`
- `Umbraco.Community.Contentment`
- `Umbraco.Community.UmbNav`

`Umbraco.Community.UpDoc` follows the established pattern.

### 11.2 Marketplace Category — DECISION NEEDED

UmBootstrap uses "Themes & Starter Kits". UpDoc needs a different category.

Likely candidates (from [marketplace categories](https://marketplace.umbraco.com/)):
- **"Content Management"** — UpDoc manages content creation from external sources
- **"Developer Tools"** — it's a tool for content workflows
- **"Import & Export"** — content import from PDF/web/markdown

**Recommendation:** "Content Management" or "Import & Export" (check marketplace for exact category names).

### 11.3 License — DECISION NEEDED

**Proposed:** MIT (matches UmBootstrap). Need to create a `LICENSE` file in repo root.

### 11.4 PdfPig Custom Build — DECISION NEEDED

Currently using `UglyToad.PdfPig Version="1.7.0-custom-5"`. End users can't restore this from NuGet.org.

Options:
1. Switch to official PdfPig release (check if needed fixes are upstream)
2. Publish custom build to NuGet under a scoped package ID
3. Bundle the DLL directly

### 11.5 Git Branching — DECISION NEEDED

Switch from single `main` branch to `develop`/`main` model?

**Proposed:**
- `develop` — default branch, all PRs merge here
- `main` — release branch, `develop` merged here for releases
- Feature branches from `develop`

This matches the UmBootstrap pattern and separates development from releases.

### 11.6 MimeKit Pinning — DECISION NEEDED

The csproj currently pins `MimeKit 4.15.1` for CVE-2026-30227. This would become a transitive dependency for end users. Options:
1. Keep the pin (users get the security fix)
2. Remove it before publishing (let Umbraco's dependency resolve naturally once they update)
3. Add a conditional — only pin if Umbraco hasn't updated yet

### 11.7 Docs URL — DECISION NEEDED

Currently: `https://deanleigh.github.io/UpDoc/`
After transfer: should it move to `https://umtemplates.github.io/UpDoc/`?

This requires updating the GitHub Pages deployment to use the UmTemplates org.

### 11.8 First Release Scope — DISCUSSION NEEDED

What features need to be complete/stable before the first public release? Consider:
- Which source types must work? (PDF is proven, web and markdown are newer)
- Is the workflow editor UI ready for public consumption?
- Are there breaking changes still expected?

A `17.1.0-beta` or `17.0.0-alpha` release allows early feedback while signalling instability.

---

## Implementation Order

### Phase A — NuGet-only release (implement in this sequence):

1. [x] **Repo transfer** — Transfer to UmTemplates, update remotes
2. [x] **Move local folder** — Follow section 1.2 checklist exactly
3. [x] **Create `develop` branch** — Set as default, protect `main` (protection skipped for now)
4. [ ] **Create `assets/`** — Package icon, NuGet readme
5. [ ] **Update csproj** — Add NuGet metadata, TypeScript source exclusion. **No `umbraco-marketplace` tag.**
6. [ ] **Resolve PdfPig** — Fix custom build dependency
7. [ ] **Create `LICENSE`** — MIT license file
8. [ ] **Write READMEs** — GitHub README and NuGet README only. **No marketplace readme yet.**
9. [ ] **Create GitHub Actions** — NuGet publish + add-to-project workflows
10. [ ] **Create issue templates** — Bug report, feature request, config
11. [ ] **Test locally** — `dotnet pack` and verify package contents
12. [ ] **First pre-release** — Tag `17.1.0-beta` and publish to NuGet
13. [ ] **Test installation** — Fresh Umbraco site, `dotnet add package --prerelease`, verify it works
14. [ ] **Verify NOT on marketplace** — Confirm UpDoc does not appear on marketplace.umbraco.com

### Phase B — Marketplace listing (only when satisfied with package stability):

15. [ ] **Create `umbraco-marketplace.json`** — Marketplace listing
16. [ ] **Create `umbraco-marketplace-readme.md`** — Marketplace README
17. [ ] **Add `umbraco-marketplace` tag** — Update csproj PackageTags
18. [ ] **Validate** — https://marketplace.umbraco.com/validate
19. [ ] **Tag stable release** — e.g. `17.0.0` or `17.1.0`
20. [ ] **Verify marketplace listing** — Check listing appears correctly

---

## Reference

- UmBootstrap publishing strategy: `D:\Users\deanl\source\repos\UmTemplates\UmBootstrap\planning\PUBLISHING_STRATEGY.md`
- Umbraco Marketplace schema: https://marketplace.umbraco.com/umbraco-marketplace-schema.json
- Marketplace validation: https://marketplace.umbraco.com/validate
- NuGet community convention: https://www.nuget.org/packages?q=Umbraco.Community
