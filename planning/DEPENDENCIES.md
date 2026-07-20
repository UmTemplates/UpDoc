# UpDoc dependencies

State as at 20 July 2026, after the Umbraco 17.5.3 upgrade.

**The governing rule: UpDoc tracks Umbraco LTS 17.** The RCL's `Umbraco.Cms.*`
reference is the minimum version every consumer must be on. UmBootstrap, UpDoc
and Tailored Travel are kept on the same stack version and move as one.

---

## The version-line trap — read this before bumping anything

`dotnet list package --outdated` currently reports nine packages as out of date.
**Seven of them are not.** They are showing the Umbraco 18 line.

Every Umbraco-ecosystem package publishes a separate line per Umbraco major, and
the higher version number is always the newer major:

| Package | Umbraco 17 line | Umbraco 18 line |
|---|---|---|
| Umbraco.Cms | **17.x** | 18.x |
| uSync | **17.x** | 18.x |
| uSync.Complete | **17.x** | 18.x |
| BlockPreview | **5.x** | 6.x |
| Contentment | **6.x** | 7.x |
| UmbNav | **4.x** | 5.x |

Verify from the nuspec, never from the number:

```bash
curl -s -o p.nupkg "https://api.nuget.org/v3-flatcontainer/PACKAGE/VERSION/PACKAGE.VERSION.nupkg" \
  && unzip -p p.nupkg "*.nuspec" | grep -oE '<dependency id="Umbraco[A-Za-z.]*" version="[^"]*"'
```

The 17-line releases declare exclusive upper bounds (e.g. `[17.3.0, 18.0.0)`),
so a mistake fails the restore rather than shipping silently. Small mercy.

**Dependabot does not understand this.** Read its PRs, do not auto-merge.

---

## 1. RCL — `src/UpDoc/UpDoc.csproj`

Ships to consumers. Everything here is a public dependency of the package.

| Package | Version | Purpose | Status |
|---|---|---|---|
| `Umbraco.Cms.Web.Common` | 17.5.3 | Backoffice integration | Current LTS |
| `Umbraco.Cms.Api.Common` | 17.5.3 | Management API | Current LTS |
| `AngleSharp` | 1.4.0 | HTML parsing, web source | ⚠️ **Moderate advisory**, 1.5.2 available |
| `AngleSharp.Css` | 1.0.0-beta.154 | Computed CSS, web extraction | ⚠️ **Beta in a shipped package** |
| `PdfPig` | 0.1.13 | PDF text extraction | 0.1.15 available |

**MimeKit is no longer pinned.** The pin existed for CVE-2026-30227 because
Umbraco 17.2.2 resolved MimeKit 4.14.0 transitively. Web.Common 17.5.3 declares
MailKit 4.16.0, requiring MimeKit >= 4.16.0, so the pin became a downgrade and
failed the restore. Removed 20 July 2026; MimeKit now resolves to 4.16.0.

## 2. Test site — `src/UpDoc.TestSite/UpDoc.TestSite.csproj`

Development and testing only. Does not ship.

| Package | Version | Status |
|---|---|---|
| `Umbraco.Cms` | 17.5.3 | Current LTS |
| `uSync` | 17.3.6 | Current 17 line |
| `uSync.Complete` | 17.3.11 | Current 17 line |
| `Umbraco.Community.BlockPreview` | 5.5.0 | Current 17 line |
| `Umbraco.Community.Contentment` | 6.2.1 | Current 17 line |
| `Umbraco.Community.UmbNav` | 4.1.8 | Current 17 line |
| `SixLabors.ImageSharp` | 3.1.12 | Transitive via Umbraco — do not force to 4.x |
| `Microsoft.ICU.ICU4C.Runtime` | 72.1.0.3 | ICU runtime |

## 3. Frontend — `App_Plugins/UpDoc/package.json`

Built by Vite. `dist/` **is committed and ships in the NuGet package.**

**Runtime dependencies (these ship):**

| Package | Version | Purpose |
|---|---|---|
| `marked` | ^17.0.1 | Markdown to HTML in the bridge |
| `pdfjs-dist` | ^4.2.67 | PDF rendering — `pdf.worker.min.mjs`, 1.3MB, ships in `dist/` |

**Build-time only (do not ship):** `@playwright/test`, `@types/node`,
`@umbraco-ui/uui`, `@umbraco/json-models-builders`,
`@umbraco/playwright-testhelpers`, `dotenv`, `tslib`, `typescript`, `vite`.

## 4. Docs — `docs/package.json`

Static site, ships to nobody. Upgraded to Astro 7 / Starlight 0.41 on
19 July 2026. `npm audit` clean.

## 5. `tools/PdfPigSpike/` — not in the solution

A standalone spike referencing `PdfPig 0.1.13`. Not built by `UpDoc.sln`, no
Umbraco dependency. **Will drift when PdfPig moves** — keep in step or retire it.

---

## Outstanding advisories

### .NET

| Package | Severity | Where | Direct? |
|---|---|---|---|
| `AngleSharp` 1.4.0 | Moderate | Both projects | **Direct** — we control this |
| `Microsoft.OpenApi` 2.4.1 | **High** | Both projects | Transitive via Umbraco |
| `SQLitePCLRaw.lib.e_sqlite3` 2.1.11 | **High** | Test site | Transitive via Umbraco |

Only AngleSharp is ours to fix directly. The other two arrive through Umbraco
17.5.3 and would need either an Umbraco release that updates them or an explicit
override — and overriding a transitive Umbraco dependency risks the same
downgrade failure the MimeKit pin caused.

`SQLitePCLRaw` is test-site only. SQLite is not used in production Umbraco
installs.

### npm — frontend package

| Package | Severity | Ships? |
|---|---|---|
| `minimatch` | **High** | No — build-time |
| `rollup` | **High** | No — build-time |
| `brace-expansion` | Moderate | No — build-time |
| `esbuild` | Moderate | No — build-time |
| `postcss` | Moderate | No — build-time |
| `pdfjs-dist` → `canvas` → `@mapbox/node-pre-gyp`, `tar` | **High** | **Yes — `pdfjs-dist` is a runtime dependency** |

Everything except `pdfjs-dist` is a devDependency and never reaches a consuming
site. `pdfjs-dist` is the one that matters, and it is tracked in #51.

Open question recorded there: whether `canvas` is actually reachable in the
browser bundle. It is a Node-native module and Vite appears to externalise it
(`__vite-browser-external-*.js` is present in `dist/`), which would drop the
practical severity considerably. **Not yet confirmed.**

---

## Upgrade cautions

**PdfPig is the extraction engine.** A bump can shift element counts, line
grouping and font-size reporting subtly — the "still works but the output got
worse" case that no pass/fail test catches. **Move it alone**, and compare
extracted element counts and text before and after.

### PdfPig — held at 0.1.13 deliberately

Checked 20 July 2026, because the surface and the maintenance status were both
in question. Both came back better than expected.

**One package, no plugins.** `PdfPig 0.1.13` is the only PdfPig-related entry in
the resolved tree. UpDoc imports exactly two namespaces, `UglyToad.PdfPig` and
`UglyToad.PdfPig.Content`.

Document Layout Analysis used to be separate. It is **bundled into the main
package** since the migration off the `UglyToad.PdfPig 1.7.0-custom-5` fork onto
official `PdfPig`. Nothing extra to keep in step.

**Area drawing does not use PdfPig.** `pdf-area-editor-modal.element.ts` renders
pages with **pdf.js** (`pdfjs-dist`) and draws on a canvas overlay. PdfPig is
server-side text extraction only. The two are independent.

**Actively maintained.** Eight alpha builds published between 26 June and
17 July 2026. The `0.1.x` version number reads as immature but is a versioning
choice — the project has been going for years.

**Held at 0.1.13 because there is no reason to move.** No advisory, no bug we
are chasing, and it is the component whose output is hardest to verify. Move it
when there is a reason, alone, with the #40 baseline in place.

**AngleSharp.Css is on a beta** in a shipped package. Worth checking whether a
stable release exists.

**`SixLabors.ImageSharp` 4.0.0** is a major and the CMS pins its own range.
Leave it transitive.

**Do not remove the MimeKit pin's explanatory comment** without reading it —
it records why the pin existed and why it went.

---

## Known-good extraction results

For comparing output after any change to PdfPig, AngleSharp or the transform
pipeline. Captured 19 July 2026 and re-verified byte-identical on 20 July after
the Umbraco 17.5.3 upgrade.

**PDF — Flemish Masters, via `tailoredTourPdf`:** 4 pages, ~611 elements.
Itinerary 5 days all `<h3>`; Features 9 items `<ul>/<li>`; Accommodation one
paragraph with hyperlink preserved; What We Will See 9 items; organiser block
list populated; no raw markdown.

**Web — Suffolk page, via `groupTourWebPage`:** Itinerary 5 days; Features
6 items; Sights 11 items; Accommodation paragraph.
Day 1 renders as `<p>` not `<h3>` — a **known pre-existing defect** from split
`<strong>` tags in the source, not a regression.
