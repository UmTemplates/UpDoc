# Umbraco Marketplace Listing — Planning

## Context

UpDoc is currently published to NuGet as `0.1.0-beta` (pre-release). We want to:
1. Publish a stable release as `17.2.2` (matching the Umbraco version)
2. List on the Umbraco Marketplace

Hotfix versioning: four-part versions (e.g. `17.2.2.1`) for patches between Umbraco releases. Mix three/four digits freely — NuGet treats both as stable.

**Reference:** https://docs.umbraco.com/umbraco-dxp/marketplace/listing-your-package

---

## Decisions Required

### 1. Category — DECISION NEEDED

Available categories:
- Analytics & Insights
- Artificial Intelligence
- Campaign & Marketing
- Commerce
- **Developer Tools** ← tools for developers building sites
- **Editor Tools** ← tools for content editors using the backoffice
- Headless
- PIM & DAM
- Search
- Themes & Starter Kits
- Translations

**Options:**
- **Editor Tools** — UpDoc is used by content editors to create documents from external sources. The workflow author sets up rules in Settings, but the end result is a content editor tool.
- **Developer Tools** — The workflow configuration side is developer-focused.

**Recommendation:** "Editor Tools" as primary. The `AlternateCategory` field allows a secondary — could use "Developer Tools" there.

### 2. MimeKit Pin — DECISION NEEDED

The csproj pins `MimeKit 4.15.1` for CVE-2026-30227. This becomes a transitive dependency for end users.

**Options:**
- **Keep it** — users get the security fix automatically
- **Remove it** — let Umbraco's dependency resolve naturally when they update
- **Keep with a TODO comment** — remove once Umbraco ships with >= 4.15.1

**Recommendation:** Keep with TODO (already has one in the csproj). Security fix is worth the transitive dep.

### 3. Screenshots — DECISION NEEDED

The marketplace listing supports screenshots (ImageUrl + optional Caption). Good screenshots significantly improve discoverability.

**Candidates:**
- Workflow editor showing extraction rules
- Source tab with PDF extraction and Transformed view
- Map tab showing source-to-destination mappings
- Before/after: PDF → created Umbraco document

**Options:**
- Take screenshots now and include in the listing
- Skip for initial release, add later
- Use a short video (YouTube/Vimeo supported) instead of or alongside screenshots

**Recommendation:** Take 3-4 screenshots before release. Store in `assets/screenshots/` and reference via raw GitHub URLs.

### 4. README — DECISION NEEDED

Three READMEs to consider:
- `README.md` (repo root) — already exists, used by GitHub
- `assets/README_nuget.md` — already exists, short summary for NuGet
- `umbraco-marketplace-readme.md` (repo root) — optional, marketplace-specific

**Options:**
- Use the GitHub README as-is (marketplace fetches from NuGet, which uses `README_nuget.md`)
- Create a dedicated `umbraco-marketplace-readme.md` with marketplace-specific content (install button, feature highlights)

**Recommendation:** Create `umbraco-marketplace-readme.md` — can be more visual/marketing-oriented than the developer-focused GitHub README.

---

## Implementation Steps

### Step 1: Add `umbraco-marketplace` tag to csproj

**File:** `src/UpDoc/UpDoc.csproj`

Change:
```xml
<PackageTags>umbraco;pdf;extraction;content-import;workflow</PackageTags>
```
To:
```xml
<PackageTags>umbraco;umbraco-marketplace;pdf;extraction;content-import;workflow</PackageTags>
```

**This is the trigger** — the `umbraco-marketplace` tag is what makes the marketplace discover the package. Do NOT add this until everything else is ready.

**Breaking changes:** None. Tag is NuGet metadata only.

**Test:** `dotnet pack` and inspect the `.nuspec` inside the `.nupkg` to confirm the tag is present.

---

### Step 2: Create `umbraco-marketplace.json`

**File:** repo root (`umbraco-marketplace.json`)

The marketplace looks for this file at the NuGet `PackageProjectUrl` — which is `https://github.com/UmTemplates/UpDoc`. GitHub serves raw files, and the marketplace resolves from the repo root on the default branch.

```json
{
  "$schema": "https://marketplace.umbraco.com/umbraco-marketplace-schema.json",
  "Title": "UpDoc",
  "Description": "Create Umbraco documents from external sources (PDF, web pages, markdown) using configurable extraction workflows with rule-based field mapping.",
  "Categories": ["Editor Tools"],
  "AlternateCategory": "Developer Tools",
  "PackageType": "Package",
  "LicenseTypes": ["Free"],
  "AuthorDetails": {
    "Name": "Dean Leigh",
    "Description": "Freelance Umbraco developer and creator of UpDoc and UmBootstrap",
    "Url": "https://github.com/UmTemplates",
    "ImageUrl": "https://raw.githubusercontent.com/UmTemplates/UpDoc/develop/assets/icon_nuget_updoc.png",
    "Contributors": [
      {
        "Name": "Dean Leigh",
        "Url": "https://deanleigh.co.uk/"
      }
    ],
    "SyncContributorsFromRepository": true
  },
  "DocumentationUrl": "https://umtemplates.github.io/UpDoc/",
  "IssueTrackerUrl": "https://github.com/UmTemplates/UpDoc/issues",
  "DiscussionForumUrl": "",
  "VideoUrl": "",
  "Tags": ["pdf", "content-import", "extraction", "workflow", "mapping", "blueprint"],
  "Screenshots": [],
  "PackagesByAuthor": [
    "Umbraco.Community.Templates.UmBootstrap"
  ],
  "RelatedPackages": [],
  "AddOnPackagesRequiredForUmbracoCloud": [],
  "VersionSpecificPackageIds": [
    {
      "UmbracoMajorVersion": 17,
      "PackageId": "Umbraco.Community.UpDoc"
    }
  ],
  "VersionDependencyMode": "Default"
}
```

**Note:** `Screenshots` array left empty — populate in Step 3 if we're doing screenshots.

**Breaking changes:** None. This is a new file.

**Test:** Validate at https://marketplace.umbraco.com/validate after committing to `develop`.

---

### Step 3: Screenshots (if doing them)

Take screenshots of:
1. **Workflow list** — Settings section showing configured workflows
2. **Source tab** — PDF extraction with Extracted/Transformed views
3. **Rules editor** — Section rules with conditions
4. **Map tab** — Source-to-destination mappings

Store in `assets/screenshots/` (e.g. `workflow-list.png`, `source-tab.png`, etc.).

Update `umbraco-marketplace.json`:
```json
"Screenshots": [
  {
    "ImageUrl": "https://raw.githubusercontent.com/UmTemplates/UpDoc/develop/assets/screenshots/workflow-list.png",
    "Caption": "Workflow configuration in Umbraco Settings"
  },
  {
    "ImageUrl": "https://raw.githubusercontent.com/UmTemplates/UpDoc/develop/assets/screenshots/source-tab.png",
    "Caption": "PDF extraction with area detection and transform rules"
  }
]
```

**Note:** Raw GitHub URLs from `develop` branch. These update automatically when screenshots are updated.

---

### Step 4: Create `umbraco-marketplace-readme.md` (optional)

**File:** repo root (`umbraco-marketplace-readme.md`)

More visual/marketing-focused than the GitHub README. Include:
- Feature highlights with screenshots
- Installation command
- Link to full docs
- Supported source types

If skipped, the marketplace uses the NuGet README (`assets/README_nuget.md`).

---

### Step 5: Validate

Before tagging the release:

1. Commit Steps 1-4 to `develop`
2. Merge `develop` → `main`
3. Visit https://marketplace.umbraco.com/validate
4. Enter `Umbraco.Community.UpDoc` and check for errors
5. Fix any issues before tagging

**Note:** The validator checks the NuGet package and the JSON file. The JSON must be discoverable from the `PackageProjectUrl`.

---

### Step 6: Tag stable release

```bash
git checkout main
git pull
git tag 17.2.2
git push origin 17.2.2
```

GitHub Actions (`release.yml`) will:
1. Build and pack the RCL with version `17.2.2`
2. Push to NuGet via Trusted Publishing
3. Create a GitHub Release with auto-generated notes

**This is a stable release** (no `-` suffix) — users get it via `dotnet add package Umbraco.Community.UpDoc`.

---

### Step 7: Verify marketplace listing

- **New packages sync every 24 hours** (0400 UTC)
- **Manual trigger available:** POST to `https://functions.marketplace.umbraco.com/api/InitiateSinglePackageSyncFunction` with `{"PackageId": "Umbraco.Community.UpDoc"}` (1 request/minute limit)
- Check https://marketplace.umbraco.com/ for the listing
- Verify: icon, description, categories, screenshots, documentation link, license

---

## Sync Schedule (for reference)

| What | Frequency |
|------|-----------|
| New tagged packages | Every 24 hours (0400 UTC) |
| Package info refresh | Every 2 hours |
| Download counts | Hourly |

---

## Order of Operations

1. [ ] Decide: Category (Editor Tools + Developer Tools alternate?)
2. [ ] Decide: MimeKit pin (keep with TODO?)
3. [ ] Decide: Screenshots (take now or skip?)
4. [ ] Decide: Marketplace README (create or skip?)
5. [ ] Create feature branch `feature/marketplace-listing`
6. [ ] Add `umbraco-marketplace` tag to csproj
7. [ ] Create `umbraco-marketplace.json`
8. [ ] Take screenshots (if doing them)
9. [ ] Create `umbraco-marketplace-readme.md` (if doing it)
10. [ ] PR to `develop`, merge
11. [ ] Merge `develop` → `main`
12. [ ] Validate at marketplace.umbraco.com/validate
13. [ ] Tag `17.2.2` on `main`
14. [ ] Verify NuGet publish via GitHub Actions
15. [ ] Trigger marketplace sync or wait 24 hours
16. [ ] Verify marketplace listing
