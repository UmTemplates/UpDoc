# Sprint: Umbraco 17.5.3 upgrade

Issue: #66
Branch: `chore/umbraco-17-5-upgrade`
Handover: `planning/UMBRACO_17_5_UPGRADE_HANDOVER.md`

Stays on **LTS 17** throughout. Umbraco 18 is out of scope.

---

## Decision: Option A — the RCL floor moves

**Decided 2026-07-20.** UmBootstrap, UpDoc and Tailored Travel are kept on the
same stack version deliberately. All three move to 17.5.3 together.

So `src/UpDoc/UpDoc.csproj` goes to 17.5.3, raising the minimum version for
every consumer, and the MimeKit pin can be removed.

The standing rule: **UpDoc's Umbraco reference tracks the version the stack is
on, and the stack moves as one.** It is not pinned low to support older
consumers, because there are none.

## Stack ordering — UpDoc before Tailored Travel

TT installs UpDoc from NuGet, so a TT site on 17.5.3 needs a published UpDoc
package built against 17.5.3.

1. UmBootstrap → 17.5.3 ✅ done 2026-07-20
2. **UpDoc → 17.5.3, released to NuGet** ← this sprint
3. Tailored Travel → 17.5.3, taking the new UpDoc package

---

## Phase 0 — preparation

- [x] Site stopped, verified by moving `bin/…/UpDoc.TestSite.dll` and back
- [x] Clean shutdown confirmed — `-shm` and `-wal` gone, WAL checkpointed into
      the `.db`
- [x] Database backed up (by Dean, after the clean shutdown)
- [x] Branch `chore/umbraco-17-5-upgrade` created from `develop`
- [x] Working tree clean

---

## Phase 1 — Umbraco.Cms 17.2.2 → 17.5.3

### Edit

- [ ] `src/UpDoc/UpDoc.csproj` — `Umbraco.Cms.Web.Common` → 17.5.3
- [ ] `src/UpDoc/UpDoc.csproj` — `Umbraco.Cms.Api.Common` → 17.5.3
- [ ] `src/UpDoc.TestSite/UpDoc.TestSite.csproj` — `Umbraco.Cms` → 17.5.3

All three must match. Do not leave the RCL and test site on different versions.

### Restore and build

- [ ] `dotnet restore --force-evaluate` — no downgrade or conflict warnings
- [ ] `dotnet build UpDoc.sln` — 0 errors
- [ ] Note any new warnings; obsolete-API warnings would be the first sign of a
      breaking change

### Run

- [ ] Site starts
- [ ] Umbraco boots into **upgrade mode** and waits — expected, `UpgradeUnattended`
      is not set
- [ ] Log in, click Continue, migration runs
- [ ] **Expected:** a generic "Unknown error" toast on completing the migration.
      It is cosmetic — a `NullReferenceException` in `BootFailedMiddleware`
      rendering its own error page. The migration has already succeeded
- [ ] Backoffice version badge reads **17.5.3**
- [ ] Startup log has no `[ERR]` or `[FTL]`

### Expected failure at this point

- [ ] Backoffice shows "An error occurred / Unknown error" toast on page load

This is the uSync 500, caused by uSync 17.0.4 running under a 17.5.3 CMS.
`GET /umbraco/usync/api/v1/Publisher/GetCurrent` returns 500. Phase 2 fixes it.

If it does **not** appear, note that — it would mean the handover's diagnosis
does not transfer.

### Commit

- [ ] Stop the site (Ctrl+C)
- [ ] `git status` — review before staging
- [ ] Stage the three csproj files **explicitly**, not `git add -A`
- [ ] Commit
- [ ] Schema files (`appsettings-schema.*.json`, `umbraco-package-schema.json`)
      regenerate on boot — commit those **separately**

---

## Phase 2 — uSync, immediately after

Done early, on the handover's recommendation. uSync is the package most coupled
to the CMS version, and doing it last there meant three sprints of chasing a
misattributed error.

### Edit

- [ ] `uSync` 17.0.4 → 17.3.6
- [ ] `uSync.Complete` 17.1.3 → 17.3.11

### Verify

- [ ] `dotnet restore --force-evaluate` clean
- [ ] `dotnet build UpDoc.sln` — 0 errors
- [ ] Site starts, no `[ERR]`/`[FTL]`
- [ ] **The error toast is gone**
- [ ] `GET /umbraco/usync/api/v1/Publisher/GetCurrent` returns **401**, not 500
      (401 unauthenticated is correct)
- [ ] Commit

---

## Phase 3 — community packages

Independent of each other. `BlockPreview` requires `Api.Common >= 17.3.0`, so it
could not have gone before Phase 1.

- [ ] `Umbraco.Community.BlockPreview` 5.3.2 → 5.5.0
- [ ] `Umbraco.Community.Contentment` 6.1.1 → 6.2.1
- [ ] `Umbraco.Community.UmbNav` 4.1.4 → 4.1.8
- [ ] `dotnet restore --force-evaluate` clean
- [ ] `dotnet build UpDoc.sln` — 0 errors
- [ ] Site starts, no `[ERR]`/`[FTL]`
- [ ] Contentment package migration appears in the startup log
- [ ] Commit

---

## Phase 4 — remove the MimeKit pin

Verified in advance: `Umbraco.Cms.Web.Common 17.5.3` declares `MailKit 4.16.0`,
which resolves MimeKit 4.16.0 — above the 4.15.1 CVE floor the pin's own comment
specifies.

- [ ] `dotnet list package --include-transitive | grep -i mimekit` — confirm
      **before** removing
- [ ] Resolved MimeKit >= 4.15.1
- [ ] Remove the `<PackageReference Include="MimeKit" …>` line **and its
      comment** from `src/UpDoc/UpDoc.csproj`
- [ ] `dotnet restore --force-evaluate`
- [ ] `dotnet list package --include-transitive | grep -i mimekit` — confirm
      **after** removing, still >= 4.15.1
- [ ] `dotnet build UpDoc.sln` — 0 errors
- [ ] Commit

If the post-removal check comes back below 4.15.1, restore the pin and update
its comment to name the version that actually clears it.

---

## Phase 5 — verification

### Build and boot

- [ ] `dotnet clean` then full rebuild — 0 errors
- [ ] Site starts clean

### Backoffice, visual

- [ ] Backoffice loads, no error toasts
- [ ] Version badge reads 17.5.3
- [ ] UpDoc section appears in Settings
- [ ] Workflows list renders, both workflows present
- [ ] A workflow workspace opens — Source, Map, Destination tabs all render
- [ ] BlockPreview renders in a block grid editor
- [ ] Contentment editors render
- [ ] UmbNav editor opens

### Imports — against known-good results

Recorded 2026-07-19 in `DEPENDENCY_UPDATES_2026_07.md`, before any of this.

**PDF — Flemish Masters, via `tailoredTourPdf`:**

- [ ] Extraction: 4 pages, ~611 elements
- [ ] `pageTitle` and `pageTitleShort` populated
- [ ] `pageDescription` = the full strapline
- [ ] Itinerary: **5 day headings, all as `<h3>`**
- [ ] Features: 9 items as `<ul>/<li>`
- [ ] Accommodation: paragraph, **hyperlink preserved**
- [ ] What We Will See: 9 items as `<ul>/<li>`
- [ ] Organiser block list populated
- [ ] **No raw markdown anywhere** — no `###`, no leading `- `

**Web — the Suffolk page, via `groupTourWebPage`:**

- [ ] Title, description populated
- [ ] Itinerary: 5 days
- [ ] Features: 6 items as a list
- [ ] Sights: 11 items as a list
- [ ] Accommodation paragraph present

Note: Day 1 rendering as `<p>` rather than `<h3>` on the web import is a
**known pre-existing defect**, not a regression. Split `<strong>` tags in the
source. Do not chase it here.

### uSync — the gap UmBootstrap left

Not verified there, so three minor versions of serialisation changes are
untested. UpDoc uses uSync to move content downstream, so this matters more here.

- [ ] uSync dashboard loads
- [ ] **Report** runs without error
- [ ] **Export** runs without error
- [ ] `git diff src/UpDoc.TestSite/uSync/` reviewed — a serialisation format
      change would show as widespread diffs across untouched files
- [ ] If the diff is large, stop and assess before committing

### Tests

- [ ] `create-from-source.spec.ts` passes

---

## Phase 6 — cleanup and ship

- [ ] Any content created during verification deleted
- [ ] Its uSync `.config` file deleted
- [ ] Recycle bin emptied
- [ ] Throwaway workflows removed
- [ ] `git status` clean
- [ ] Push, PR, merge to `develop`
- [ ] Merge `develop` → `main`
- [ ] Release to NuGet — **required before Tailored Travel upgrades**

---

## Watch for

**Staging.** `git add -A` swept uSync content configs into a package-upgrade
commit on UmBootstrap. Stage explicitly, every time.

**Schema files.** Umbraco regenerates them on boot. Commit separately so the
version diff stays readable.

**Dependabot.** Do not auto-merge. It does not understand that these packages
publish a separate line per Umbraco major, and offered UmBootstrap a package
from a discontinued line.

**The version-line trap.** For every one of these, the higher version number is
the Umbraco 18 line. Verify from the nuspec, not the number:

```bash
curl -s -o p.nupkg "https://api.nuget.org/v3-flatcontainer/PACKAGE/VERSION/PACKAGE.VERSION.nupkg" \
  && unzip -p p.nupkg "*.nuspec" | grep -oE '<dependency id="Umbraco[A-Za-z.]*" version="[^"]*"'
```

Verified 2026-07-20 — all four community packages declare exclusive
`[17.x, 18.0.0)` bounds, so an accidental 18-line install fails the restore
rather than shipping silently.

**SQLite.** Stop the site with Ctrl+C. A force kill leaves `-shm`/`-wal` files
orphaned, and a backup taken from the `.db` alone would then be missing whatever
sits in the WAL.

---

## Not in scope

Tracked in `planning/DEPENDENCY_UPDATES_2026_07.md`, to be reviewed separately:

- AngleSharp 1.4.0 → 1.5.2
- AngleSharp.Css — on a **beta** (`1.0.0-beta.154`) in a shipped package
- PdfPig 0.1.13 → 0.1.15 — the extraction engine, must move alone so any
  extraction change is attributable
- `tools/PdfPigSpike/PdfPigSpike.csproj` also pins PdfPig 0.1.13 and will drift.
  Not in the solution, no Umbraco dependency

Also out of scope: Umbraco 18, `SixLabors.ImageSharp` 4.0.0 (major, and the CMS
pins its own range).
