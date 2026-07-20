# Handover: dependency upgrade, UmBootstrap → UpDoc

Written 2026-07-20, from the UmBootstrap upgrade done the same day.

## First, the question you asked up front

**UmBootstrap did NOT go above Umbraco 17.** It went 17.2.2 → 17.5.3, staying on
the LTS line deliberately.

Umbraco 18.0.2 was available and was explicitly rejected. Every community
package now publishes a separate line per Umbraco major, and the higher version
number is always the 18 one. Taking "latest" from NuGet on any of them silently
moves you off LTS.

So **every finding below applies to UpDoc within 17**. Nothing here is
contaminated by an 18 upgrade. The one thing to carry across most carefully is
the version-line trap in section 5, because it is the thing most likely to bite
someone reading a Dependabot PR.

---

## 1. What was upgraded

UmBootstrap has two csproj files that both reference Umbraco. Both were bumped;
they had drifted apart (UmbNav was 4.1.5 in one and 4.1.4 in the other).

### Umbootstrap.Web.csproj (the site)

| Package | From | To |
|---|---|---|
| Umbraco.Cms | 17.2.2 | 17.5.3 |
| Umbraco.AI | 1.6.0 | 17.1.1 |
| Umbraco.AI.Anthropic | 1.2.2 | 17.0.0 |
| Umbraco.AI.Prompt | 1.5.0 | 17.1.0 |
| Umbraco.Community.BlockPreview | 5.3.2 | 5.5.0 |
| Umbraco.Community.Contentment | 6.1.1 | 6.2.1 |
| Umbraco.Community.UmbNav | 4.1.5 | 4.1.8 |
| uSync | 17.0.4 | 17.3.6 |
| uSync.Complete | 17.1.3 | 17.3.11 |
| MimeKit | 4.15.1 | **reference removed** |
| SixLabors.ImageSharp | 3.1.12 | unchanged (deliberate) |

### UmBootstrap.DotNet.Template.csproj (the NuGet template)

Same versions: Umbraco.Cms 17.5.3, BlockPreview 5.5.0, Contentment 6.2.1,
UmbNav 4.1.4 → 4.1.8, uSync 17.3.6. No uSync.Complete, no AI packages.

### docs/ (Astro Starlight)

| Package | From | To |
|---|---|---|
| astro | 6.0.8 | 7.1.1 |
| @astrojs/starlight | 0.38.2 | 0.41.3 |

Target framework stayed `net10.0` throughout.

---

## 2. What broke or needed fixing

Honestly: **almost nothing**. No code changes were required. No API changes, no
config updates, no obsolete warnings to fix. Every sprint was a version bump
plus a restore.

Three things did happen that are worth knowing.

### 2a. The uSync 500 — this is the one that matters for UpDoc

After the CMS went to 17.5.3, the backoffice threw a toast reading **"An error
occurred / Unknown error"** on page load. It persisted through two more sprints
before being tracked down.

The browser console showed:

```
Failed to load resource: the server responded with a status of 500
[UmbTryExecuteController] Error in request: UmbApiError: Unknown error
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'appearance')
    at servers.context.ts:47:16
```

The Network tab identified the actual call:

```
GET /umbraco/usync/api/v1/Publisher/GetCurrent  →  500 Internal Server Error
```

That is **uSync.Complete's Publisher feature**, not an Umbraco endpoint. The
`getCurrentServer` in the stack trace is uSync's own client code, which reads as
Umbraco server-information if you skim it. That misdirection cost time.

Cause: uSync 17.0.4 / Complete 17.1.3 running under a CMS that had moved to
17.5.3. Upgrading uSync fixed it. The endpoint now returns 401 unauthenticated
rather than 500.

**Why this matters for UpDoc:** the test site is on uSync 17.0.4 /
Complete 17.1.3, exactly the versions that break. If you upgrade
`UpDoc.TestSite`'s `Umbraco.Cms` without also upgrading uSync, you will hit this
and the error message will point nowhere useful.

### 2b. The Umbraco installer's own error toast

On completing the database migration, the installer showed the same generic
"Unknown error" toast. The migration had **already succeeded**. The exception
was a `NullReferenceException` thrown by `BootFailedMiddleware` while rendering
its own error page.

Cosmetic, but alarming mid-upgrade. If you see it, check the backoffice version
badge before assuming failure.

### 2c. Upgrade mode requires a manual click

Umbraco boots into upgrade mode and waits. `UpgradeUnattended` was not set and
was deliberately left unset, so a human has to log in and click Continue.

Relevant to UpDoc only if the test site is ever deployed rather than run
locally. For a client site, worth knowing the deploy does not complete itself.

---

## 3. What was verified, and how

Being precise about this, because some of it was not verified and the
distinction matters.

### Verified

| Check | Method | Result |
|---|---|---|
| Build | `dotnet build Umbootstrap.slnx` after each sprint, plus a `dotnet clean` + rebuild at the end | 0 errors throughout |
| Restore | `dotnet restore --force-evaluate` | Clean, no downgrade or conflict warnings |
| MimeKit resolution | Read `packages.lock.json` directly | MailKit 4.16.0 → MimeKit 4.16.0 transitively |
| Site starts | Ran and watched the startup log for `[ERR]`/`[FTL]` | 0 errors after each sprint |
| CMS migration | Startup log + backoffice version badge | 17.5.3 confirmed |
| AI migration | Startup log | `Migrated 23 history record(s) from __EFMigrationsHistory to __UmbracoAIMigrationsHistory` |
| Contentment migration | Startup log | Package migration completed in 10ms |
| Front end | `curl` status codes on `/`, `/about`, `/layouts`, `/features` | All 200 |
| **Contentment data source** | Fetched the In-Page Navigation page and counted rendered elements | 26 `list-group-item`, `sticky-nav` present, ScrollSpy initialised |
| Content editing | Dean edited a rich text field and added an image in the backoffice, saved | Both worked |
| uSync boot behaviour | Startup log + `git status` on the export folder | First-boot handler completed in 2ms, no import ran, export untouched |
| The 500 fix | `curl` the previously failing endpoint | 401 not 500, and Dean confirmed the toast was gone |

The Contentment check is the one worth copying. UmBootstrap has a custom
`IContentmentDataSource` (`FeatureBlockDataSource`) that reads the document GUID
from the API POST body via `EnableBuffering()` middleware. That was the highest
risk in the whole upgrade and the front-end render exercises it end to end.

### NOT verified

Six things need a logged-in backoffice session and were never visually
confirmed:

- The AI section loading
- BlockPreview previews rendering in the block grid editor
- UmbNav editing
- The uSync dashboard, a report run, and an export

Nothing suggests any is broken, but they were not checked. **A uSync report and
export in particular were skipped**, so serialisation format changes across
three uSync minor versions remain untested. For UpDoc, where uSync moves content
between the test site and downstream projects, that is worth actually doing.

---

## 4. What was deliberately NOT upgraded

### Umbraco 18

Available as 18.0.2, rejected. UmBootstrap targets LTS. Same reasoning applies
to UpDoc with more force, since your RCL's `Umbraco.Cms.*` reference sets the
floor for every consumer.

### SixLabors.ImageSharp

Stayed at 3.1.12. 4.0.0 is a major version bump and the CMS pins its own range,
so moving it independently risks a conflict for no benefit. UpDoc has the same
3.1.12 reference in its test site; leave it.

### The dead 1.x AI line

Dependabot offered `Umbraco.AI 1.14.0`. That is the discontinued line. The
maintained line is 17.x. See section 5.

---

## 5. Gotchas, in priority order

### 5a. Version numbers now track the Umbraco major — this is the big one

Every one of these publishes two lines. The higher number is Umbraco 18.

| Package | Umbraco 17 line | Umbraco 18 line |
|---|---|---|
| BlockPreview | **5.x** (5.5.0) | 6.x |
| Contentment | **6.x** (6.2.1) | 7.x |
| UmbNav | **4.x** (4.1.8) | 5.x |
| uSync | **17.x** (17.3.6) | 18.x |
| uSync.Complete | **17.x** (17.3.11) | 18.x |
| Umbraco.AI | **17.x** (17.1.1) | 18.x |

Verify before bumping, by reading the nuspec rather than trusting the number:

```bash
curl -s -o p.nupkg "https://api.nuget.org/v3-flatcontainer/PACKAGE/VERSION/PACKAGE.VERSION.nupkg" \
  && unzip -p p.nupkg "*.nuspec" | grep -oE '<dependency id="Umbraco[A-Za-z.]*" version="[^"]*"'
```

The Umbraco 17 releases declare an exclusive upper bound, e.g. BlockPreview
5.5.0 requires `Umbraco.Cms.Api.Common [17.3.0, 18.0.0)`. NuGet will refuse to
install the 18 line on a 17 site, so a mistake fails the restore rather than
shipping silently. Small mercy.

**Dependabot does not understand this.** It offered UmBootstrap `Umbraco.AI
1.14.0` (dead line) and `Umbraco.Cms 17.4.0` (already superseded). Four
Dependabot PRs were closed rather than merged. Read them, do not auto-merge.

### 5b. MimeKit — UpDoc's pin is a different case from UmBootstrap's

UmBootstrap **removed** its pin. Do not assume UpDoc can.

The chain:

| | MailKit | resolves MimeKit |
|---|---|---|
| Umbraco 17.2.2 | 4.14.1 | 4.14.0 (CVE-2026-30227) |
| Umbraco 17.5.3 | 4.16.0 | 4.16.0 (patched) |

UmBootstrap references `Umbraco.Cms`, the full meta-package, so 17.5.3 pulls
MailKit 4.16.0 and the pin became dead weight.

**UpDoc's RCL is different, and its own comment says so:**

```xml
<!-- Pin MimeKit to patched version (CVE-2026-30227). Umbraco 17.2.2 resolves this transitively
     but the RCL alone resolves to 4.14.0. Keep until Umbraco's minimum dependency is >= 4.15.1. -->
<PackageReference Include="MimeKit" Version="4.15.1" />
```

`src/UpDoc/UpDoc.csproj` references `Umbraco.Cms.Web.Common` and
`Umbraco.Cms.Api.Common`, not the meta-package. Whether the pin can go depends
on what **those two specific packages** resolve at your chosen version, not on
what `Umbraco.Cms` does. Check before removing:

```bash
curl -s -o m.nupkg "https://api.nuget.org/v3-flatcontainer/umbraco.cms.infrastructure/VERSION/umbraco.cms.infrastructure.VERSION.nupkg" \
  && unzip -p m.nupkg "*.nuspec" | grep -oE '<dependency id="MailKit" version="[^"]*"'
```

There is a second consideration UmBootstrap did not have. Raising the RCL's
`Umbraco.Cms.*` floor raises the minimum for every consumer of UpDoc. Keeping
the MimeKit pin is cheap; forcing a client site to upgrade Umbraco is not. If
the pin is the only reason to raise the floor, keep the pin.

### 5c. Ordering is forced by one hard constraint

`Umbraco.AI` 17.x requires `Umbraco.Cms.Core >= 17.4.0`. The CMS must move
first or the restore fails outright.

`BlockPreview` 5.5.0 requires `Api.Common >= 17.3.0`, so it also could not have
been installed before the CMS moved.

The order used, which worked cleanly:

1. Umbraco.Cms (and drop the MimeKit pin)
2. Umbraco.AI packages
3. BlockPreview / Contentment / UmbNav (independent of each other)
4. uSync last

uSync last was a judgement call, on the grounds that it touches content
synchronisation and deserves a known-good CMS underneath. In hindsight it also
meant living with the 500 error for three sprints. **For UpDoc, consider doing
uSync earlier** — it is the package most coupled to the CMS version.

### 5d. Two csproj files drift

UmBootstrap's site and template csprojs had different UmbNav versions. UpDoc has
the same shape: `src/UpDoc/UpDoc.csproj` and `src/UpDoc.TestSite/`. Check both.

Note also that UpDoc has a **docs worktree at `.worktrees/docs`** containing a
second copy of every csproj. Those are the same files on a different branch, not
separate projects — do not edit them as though they were.

### 5e. Practical friction

- **Stop the site before restoring.** A running site locks `bin/` and the
  restore fails with MSB3027. This cost several retries.
- **Kill the site with Ctrl+C, not `taskkill /F`.** A force kill leaves
  `Umbraco.sqlite.db-shm` and `-wal` files orphaned, because SQLite never
  checkpoints. A clean shutdown folds the WAL back into the main file. Matters
  if you are taking a database backup, since copying only the `.db` would lose
  whatever is in the WAL.
- **Back up the database first.** Migrations are not reverted by `git revert`.
- **Umbraco regenerates schema files on boot** — `appsettings-schema.*.json`,
  `umbraco-package-schema.json`. They will show as modified. Commit them
  separately from the version bumps so the real diff stays readable.
- **Watch what `git add -A` sweeps up.** It caught two uSync content configs
  from manual testing and put them in a package-upgrade commit. Stage
  explicitly.

---

## 6. Rough effort

Four package sprints, each a bump plus restore, build, run, verify. Perhaps two
hours including the detour chasing the uSync 500, most of which was spent
looking in the wrong place because the error named a server-information
endpoint.

Knowing 5a and 5b in advance should make UpDoc's run considerably shorter.
