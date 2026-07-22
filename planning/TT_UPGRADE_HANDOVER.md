# Handover: Umbraco 17.5.3 upgrade, UpDoc → Tailored Travel

Written 2026-07-20, from the UpDoc upgrade done the same day, which was itself
done from an UmBootstrap handover.

TT is the **third** site through this. UmBootstrap and UpDoc both went cleanly.
Everything below is observed, not predicted.

---

## First, the answer to the question you will ask

**Nothing went above Umbraco 17.** UmBootstrap and UpDoc both went 17.2.2 →
17.5.3 and stayed on LTS deliberately.

Umbraco 18.0.2 was available and rejected both times. Every community package
now publishes a separate line per Umbraco major, and **the higher version number
is always the 18 one**. Taking "latest" from NuGet on any of them silently moves
you off LTS. See §5a — it is the thing most likely to bite.

---

## 1. Target versions

Match these exactly. They are what UpDoc's test site runs and what UpDoc 17.5.3
was verified against.

| Package | To | Notes |
|---|---|---|
| `Umbraco.Cms` | **17.5.3** | |
| `uSync` | **17.3.6** | 17 line, not 18 |
| `uSync.Complete` | **17.3.11** | 17 line, not 18 |
| `Umbraco.Community.BlockPreview` | **5.5.0** | needs `Api.Common >= 17.3.0` |
| `Umbraco.Community.Contentment` | **6.2.1** | |
| `Umbraco.Community.UmbNav` | **4.1.8** | |
| `SixLabors.ImageSharp` | **leave alone** | transitive; CMS pins its own range |
| `Umbraco.Community.UpDoc` | **17.5.3** | **last, and alone** |

TT will have packages UpDoc's test site does not. Check each one's own Umbraco
dependency before bumping — take the newest release that still supports 17.

---

## 2. Order, and why

The first two positions are forced. The rest is risk sequencing.

**1. Umbraco.Cms 17.2.2 → 17.5.3**

Must be first. `BlockPreview 5.5.0` requires `Api.Common >= 17.3.0`, so it
cannot install before the CMS moves.

**2. uSync + uSync.Complete, immediately after**

Not last. uSync is the package most coupled to the CMS version. UmBootstrap left
it until last and spent three sprints chasing a 500 error caused by exactly that
gap. UpDoc moved it to second and never saw the error.

**3. BlockPreview, Contentment, UmbNav**

Independent of each other. Can go together.

**4. UpDoc 17.5.3, on its own, last**

Deliberately separate. If a TT import behaves differently afterwards, you want
it attributable to UpDoc rather than to four other packages at once.

---

## 3. Before you start

- [ ] **Stop the site with Ctrl+C**, not a force kill. A force kill leaves
      `-shm` and `-wal` files orphaned because SQLite never checkpoints. A
      backup taken from the `.db` alone would then be missing whatever sits in
      the WAL — on UpDoc that was **3MB**, including a day's work.
- [ ] **Back up the database.** Migrations are not undone by `git revert`.
- [ ] Confirm the WAL is gone after the clean shutdown — a single `.db` file.
- [ ] Feature branch off `develop`.
- [ ] Working tree clean.

---

## 4. What actually happened, both times

Honestly: **almost nothing broke**. No code changes were needed on either site.
No API changes, no config updates, **no obsolete or deprecated API warnings**.
Every step was a version bump plus a restore.

Four things did happen. All are expected. None mean failure.

### 4a. The MimeKit pin will fail the restore

If TT has a MimeKit pin, the restore **fails outright**:

```
error NU1605: Detected package downgrade: MimeKit from 4.16.0 to 4.15.1
  Umbraco.Cms.Web.Common 17.5.3 -> MailKit 4.16.0 -> MimeKit (>= 4.16.0)
```

The pin existed for CVE-2026-30227 because Umbraco 17.2.2 resolved MimeKit
4.14.0 transitively. Umbraco 17.5.3 declares MailKit 4.16.0, which requires
MimeKit >= 4.16.0 — so the pin became a **ceiling pulling MimeKit down**.

**Remove the pin in the same commit as the CMS bump.** Verify afterwards:

```bash
dotnet list package --include-transitive | grep -i mimekit    # expect 4.16.0
```

### 4b. Upgrade mode waits for a human

Umbraco boots into upgrade mode and stops. `UpgradeUnattended` is not set. Log
in, click Continue.

### 4c. A cosmetic error toast on completing the migration

The installer shows a generic **"Unknown error"** toast. The migration has
**already succeeded**. It is a `NullReferenceException` thrown by
`BootFailedMiddleware` while rendering its own error page.

Alarming mid-upgrade. **Check the backoffice version badge reads 17.5.3 before
assuming failure.**

### 4d. The uSync 500 — may or may not appear

After the CMS moves, the backoffice may show **"An error occurred / Unknown
error"** on page load, from:

```
GET /umbraco/usync/api/v1/Publisher/GetCurrent  →  500
```

The stack trace names `getCurrentServer`, which reads as an Umbraco
server-information endpoint but is uSync's own client code. That misdirection
cost UmBootstrap real time.

**UmBootstrap hit it. UpDoc did not.** The difference is uSync.Complete's
**Publisher** feature — UpDoc's uSync config is minimal (`ImportOnFirstBoot`
only, no Publisher), so the path is never exercised. **TT probably has more
uSync configuration than UpDoc, so expect it.**

Doing uSync at step 2 fixes it immediately. Afterwards the endpoint returns
**401**, which is correct for an unauthenticated call.

---

## 4e. What was deliberately NOT upgraded

### Umbraco 18

Available as 18.0.2. Rejected on both sites.

The whole stack — UmBootstrap, UpDoc, TT — is kept on the same version
deliberately, and that version is LTS. UpDoc's RCL references
`Umbraco.Cms.Web.Common 17.5.3`, which is the **minimum every consumer must be
on**. Moving TT to 18 would leave it unable to install UpDoc.

### SixLabors.ImageSharp

Left at 3.1.12. Version 4.0.0 is a major bump and the CMS pins its own range,
so moving it independently risks a conflict for no benefit. Let Umbraco resolve
it.

### PdfPig (UpDoc only, but worth knowing)

Held at 0.1.13. No advisory, and it is UpDoc's PDF extraction engine — a bump
can shift element counts and line grouping subtly, which no pass/fail test
catches. It will move on its own, with a proper output comparison, not as part
of a stack upgrade.

If TT sees different PDF extraction results after this upgrade, **PdfPig is not
the cause** — it has not changed.

---

## 5. Gotchas, in priority order

### 5a. Version numbers track the Umbraco major — the big one

Every one of these publishes two lines. **The higher number is Umbraco 18.**

| Package | Umbraco 17 line | Umbraco 18 line |
|---|---|---|
| BlockPreview | **5.x** (5.5.0) | 6.x |
| Contentment | **6.x** (6.2.1) | 7.x |
| UmbNav | **4.x** (4.1.8) | 5.x |
| uSync | **17.x** (17.3.6) | 18.x |
| uSync.Complete | **17.x** (17.3.11) | 18.x |

Verify from the nuspec, not the number:

```bash
curl -s -o p.nupkg "https://api.nuget.org/v3-flatcontainer/PACKAGE/VERSION/PACKAGE.VERSION.nupkg" \
  && unzip -p p.nupkg "*.nuspec" | grep -oE '<dependency id="Umbraco[A-Za-z.]*" version="[^"]*"'
```

Confirmed on UpDoc: the 17-line releases declare **exclusive upper bounds**,
e.g. BlockPreview 5.5.0 wants `Umbraco.Cms.Api.Common [17.3.0, 18.0.0)`. NuGet
refuses to install an 18-line package on a 17 site, so a mistake **fails the
restore rather than shipping silently**. Small mercy.

**Dependabot does not understand this.** It offered UmBootstrap a package from a
discontinued line. Read its PRs; do not auto-merge.

### 5b. `dotnet list package --outdated` lies

On UpDoc it reported **nine** packages out of date. **Seven were not** — they
were showing the 18 line. Only two had genuine updates within LTS.

Do not treat that command's output as a to-do list.

### 5c. Multiple csproj files drift apart

UmBootstrap has two csproj files that both reference Umbraco, and they **had
drifted** — UmbNav was 4.1.5 in one and 4.1.4 in the other. Easy to bump one
and miss the other.

UpDoc has the same shape: `src/UpDoc/UpDoc.csproj` and
`src/UpDoc.TestSite/UpDoc.TestSite.csproj`, whose Umbraco versions must match.
It also has a third, `tools/PdfPigSpike/`, which is not in the solution and was
missed by the handover we received.

**Find every csproj in TT before starting**, and check each one:

```bash
find . -name "*.csproj" -not -path "*/node_modules/*" -not -path "*/.worktrees/*"
```

The `.worktrees` exclusion matters if TT uses docs worktrees — those contain
duplicate copies of every csproj on another branch. They are the same files,
not separate projects. Do not edit them.

### 5d. Practical friction

- **Stop the site before restoring.** A running site locks `bin/` and the build
  fails with `MSB3027: The file is locked by: UpDoc.TestSite (53656)`. This cost
  several retries on UpDoc.
- **Checking whether the site is stopped:** use the process list. Moving a DLL
  is not a reliable test — Windows allows renaming a loaded DLL, so the check
  passes while the site is still running. It caught me out twice.
- **Umbraco regenerates schema files on boot** — `appsettings-schema.*.json`,
  `umbraco-package-schema.json`. On UpDoc that was **2,986 insertions**, which
  would have completely buried a 3-line version bump. **Commit them separately.**
- **Stage explicitly.** `git add -A` swept uSync content configs into a
  package-upgrade commit on UmBootstrap.

---

## 6. Verification

### After each step

- [ ] `dotnet restore --force-evaluate` — no downgrade or conflict warnings
- [ ] `dotnet build` — 0 errors
- [ ] Site starts, no `[ERR]` or `[FTL]` in the startup log
- [ ] Backoffice loads

### After the CMS step specifically

- [ ] Version badge reads **17.5.3**
- [ ] `GET /umbraco/usync/api/v1/Publisher/GetCurrent` returns **401**, not 500

### After UpDoc

**This is the part that matters for TT**, and it is the reason UpDoc goes last
and alone.

- [ ] Import a real tour — PDF and web, whichever TT uses
- [ ] Compare the result against how that page looks **now**, before the upgrade
- [ ] Check: fields populated, day headings as `<h3>`, lists as `<ul>/<li>`,
      **no raw markdown** (`###`, leading `- `), organiser block populated

On UpDoc's test site both source types produced output **byte-identical** to
the pre-upgrade result. TT's document types differ, so verify against TT's own
content rather than assuming.

### What is in UpDoc 17.5.3

Three bug fixes and dependency alignment. **No new features, no API changes.**

- Transform no longer crashes when two areas share a name on a page
- Block grid layout key now matches Umbraco's casing (`layout`, not `Layout`)
- About tab Source Code link fixed

If a TT import behaves differently after this, the layout-key change is the
only one that touches how content is written. It was verified as producing
identical output, but it is the first place to look.

---

## 7. What was NOT verified

Being explicit, because the point of a handover is not to overstate.

- **A uSync import** was never run on either site. Report and export only. On
  UpDoc an export was audited in full (24 deletions, 55 modifications, all
  accounted for, no data loss) but the files were never imported back.
- **TT's own packages.** TT will have packages neither UmBootstrap nor UpDoc
  has. Nothing here says anything about those.
- **UpDoc against TT's document types.** UpDoc was verified against its own
  test site, whose doc types have drifted from TT's considerably.

---

## 8. Rough effort

UpDoc took about two hours including verification and a full uSync export audit.
UmBootstrap took longer, mostly chasing the uSync 500 in the wrong place.

Knowing §4a and §5a in advance should make TT's run the shortest of the three.
