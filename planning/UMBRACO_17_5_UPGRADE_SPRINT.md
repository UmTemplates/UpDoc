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

The standing rule this establishes: **UpDoc's Umbraco reference tracks the
version the stack is on, and the stack moves as one.** It is not pinned low to
support older consumers, because there are none — the consumer moves in step.

Steps marked **(A)** below are therefore in scope.

---

## Stack ordering — UpDoc before Tailored Travel

Since the stack moves as one, the order across repos matters.

**UpDoc must be upgraded and released before Tailored Travel upgrades.** TT
installs UpDoc from NuGet, so a TT site on 17.5.3 needs an UpDoc package built
against 17.5.3 to be available.

1. UmBootstrap → 17.5.3 ✅ done 2026-07-20
2. **UpDoc → 17.5.3, released to NuGet** ← this sprint
3. Tailored Travel → 17.5.3, taking the new UpDoc package

Doing TT second means it never sits on a version UpDoc cannot support.

## Preparation

- [ ] Site stopped (Ctrl+C, not a force kill — SQLite leaves orphaned
      `-shm`/`-wal` files otherwise)
- [ ] Database backed up — migrations are not undone by `git revert`
- [ ] Branch created from `develop`
- [ ] Working tree clean

## Step 1 — Umbraco.Cms 17.2.2 → 17.5.3

- [ ] `src/UpDoc.TestSite/UpDoc.TestSite.csproj`
- [ ] **(A)** `src/UpDoc/UpDoc.csproj` — `Web.Common` and `Api.Common` together
- [ ] `dotnet restore --force-evaluate` clean, no downgrade warnings
- [ ] `dotnet build UpDoc.sln` — 0 errors
- [ ] Site starts, no `[ERR]`/`[FTL]` in the startup log
- [ ] Migration completes — check the backoffice version badge reads 17.5.3

**Expected:** a generic "Unknown error" toast on completing the migration. It is
cosmetic; the migration has already succeeded. Check the version badge before
assuming failure.

**Expected:** Umbraco boots into upgrade mode and waits for a manual Continue.

**Expected:** the uSync 500. See step 2.

- [ ] Commit — schema files regenerated on boot committed **separately**

## Step 2 — uSync, immediately after

Done early rather than last, on the handover's own recommendation. uSync is the
package most coupled to the CMS version.

- [ ] uSync 17.0.4 → 17.3.6
- [ ] uSync.Complete 17.1.3 → 17.3.11
- [ ] Restore, build, site starts
- [ ] `GET /umbraco/usync/api/v1/Publisher/GetCurrent` returns 401, not 500
- [ ] Backoffice loads with no error toast
- [ ] Commit

## Step 3 — community packages

Independent of each other; can go together or separately.

- [ ] BlockPreview 5.3.2 → 5.5.0 (requires `Api.Common >= 17.3.0`, so after step 1)
- [ ] Contentment 6.1.1 → 6.2.1
- [ ] UmbNav 4.1.4 → 4.1.8
- [ ] Restore, build, site starts
- [ ] Commit

## Step 4 — MimeKit pin **(A only)**

Under option B the RCL is untouched and the pin stays.

- [ ] Confirm resolution: `dotnet list package --include-transitive | grep -i mimekit`
- [ ] MimeKit resolves >= 4.15.1 (expected 4.16.0 via MailKit 4.16.0)
- [ ] Remove the `<PackageReference Include="MimeKit" />` line and its comment
- [ ] Restore, build
- [ ] Re-verify MimeKit still resolves >= 4.15.1 **after** removal
- [ ] Commit

## Step 5 — verification

### Imports, against the known-good results in `DEPENDENCY_UPDATES_2026_07.md`

- [ ] **PDF (Flemish Masters)** — 5 day headings as `<h3>`, 9 features,
      9 sights, organiser block list populated, no raw markdown
- [ ] **Web (Suffolk page)** — title, description, 5-day itinerary, 6 features,
      11 sights, accommodation paragraph

### uSync — the gap UmBootstrap left

Not verified there. Three minor versions of serialisation changes untested, and
UpDoc uses uSync to move content downstream.

- [ ] uSync dashboard loads
- [ ] Report runs without error
- [ ] Export produces no unexpected changes to `src/UpDoc.TestSite/uSync/`
- [ ] `git diff` on the uSync folder reviewed — serialisation format changes
      would show here

### Backoffice, visual

- [ ] UpDoc section loads, workflows list renders
- [ ] A workflow workspace opens — Source, Map, Destination tabs
- [ ] BlockPreview renders in a block grid editor
- [ ] Contentment editors render (the in-page navigation data list)

### Tests

- [ ] `create-from-source.spec.ts` passes

## Cleanup

- [ ] Any test content created during verification removed, including its
      uSync config
- [ ] Recycle bin emptied
- [ ] Working tree clean
- [ ] PR, merge to develop, merge to main

---

## Watch for

**Staging.** `git add -A` swept uSync content configs into a package-upgrade
commit on UmBootstrap. Stage explicitly.

**Schema files.** Umbraco regenerates `appsettings-schema.*.json` and
`umbraco-package-schema.json` on boot. Commit separately so the version diff
stays readable.

**Dependabot.** Do not auto-merge. It does not understand that these packages
publish separate lines per Umbraco major, and offered UmBootstrap a package
from a discontinued line.

**The version-line trap.** For every one of these packages the higher version
number is the Umbraco 18 line. Verify from the nuspec, not the number:

```bash
curl -s -o p.nupkg "https://api.nuget.org/v3-flatcontainer/PACKAGE/VERSION/PACKAGE.VERSION.nupkg" \
  && unzip -p p.nupkg "*.nuspec" | grep -oE '<dependency id="Umbraco[A-Za-z.]*" version="[^"]*"'
```

## Not in scope

Tracked in `planning/DEPENDENCY_UPDATES_2026_07.md`:

- AngleSharp 1.4.0 → 1.5.2
- AngleSharp.Css — on a **beta** (`1.0.0-beta.154`) in a shipped package
- PdfPig 0.1.13 → 0.1.15 — the extraction engine, must move alone
- `tools/PdfPigSpike/` also pins PdfPig 0.1.13 and will drift

Also out of scope: Umbraco 18, ImageSharp 4.0.0.
