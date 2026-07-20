# Dependency updates — July 2026

Written 2026-07-20.

## The rule

**UpDoc tracks Umbraco LTS 17.** It is installed into Tailored Travel, which
runs LTS, and the RCL's `Umbraco.Cms.*` reference sets the minimum version a
consumer must be on.

Upgrades happen **within the LTS line**. Currently 17.2.2 → 17.5.3.

Do not raise the major version. If a future session sees a newer major
available and reads the gap as neglect, the answer is in this file: it is
deliberate, and it follows the consumer.

## Two groups, two lifecycles

The dependencies split into two sets that should be upgraded separately,
because they are constrained by different things.

### Group A — Umbraco and its ecosystem

**Constrained by the consumer.** These follow Tailored Travel's Umbraco
version and move together as a set.

| Project | Package | Current | Target |
|---|---|---|---|
| RCL | Umbraco.Cms.Web.Common | 17.2.2 | 17.5.3 |
| RCL | Umbraco.Cms.Api.Common | 17.2.2 | 17.5.3 |
| Test site | Umbraco.Cms | 17.2.2 | 17.5.3 |
| Test site | uSync | 17.0.4 | latest 17.x |
| Test site | uSync.Complete | 17.1.3 | latest 17.x |
| Test site | Umbraco.Community.Contentment | 6.1.1 | latest supporting 17 |
| Test site | Umbraco.Community.UmbNav | 4.1.4 | latest supporting 17 |
| Test site | Umbraco.Community.BlockPreview | 5.3.2 | latest supporting 17 |
| Test site | SixLabors.ImageSharp | 3.1.12 | let Umbraco resolve it |

The RCL and test site Umbraco versions **must match**. Upgrade them in one
change.

For the community packages, check each one's own Umbraco dependency first. A
package's latest release may require a newer Umbraco major — take the newest
release that still supports 17.

`SixLabors.ImageSharp` is transitive. Let Umbraco resolve it rather than
pinning, unless there is a security reason to pin.

### Group B — UpDoc's own dependencies

**Not constrained by Umbraco.** These are UpDoc's own choices, upgradeable on
their own schedule, and nothing about the consumer's Umbraco version limits
them.

| Package | Current | Target | What it does |
|---|---|---|---|
| AngleSharp | 1.4.0 | 1.5.2 | HTML parsing for the web source |
| AngleSharp.Css | 1.0.0-beta.154 | check | Computed CSS for web extraction |
| PdfPig | 0.1.13 | 0.1.15 | PDF text extraction |
| MimeKit | 4.15.1 | 4.17.0 | Pinned for CVE — see below |

These can be done independently of Group A, and arguably should be, so a
regression is attributable to one group or the other.

Note `AngleSharp.Css` is on a **beta**. Worth checking whether a stable release
exists, since a beta in a shipped package is a standing risk.

## MimeKit

`UpDoc.csproj` carries this comment:

```xml
<!-- Pin MimeKit to patched version (CVE-2026-30227). Umbraco 17.2.2 resolves
     this transitively but the RCL alone resolves to 4.14.0. Keep until
     Umbraco's minimum dependency is >= 4.15.1. -->
```

The pin exists for a security reason, not a preference.

**Check after upgrading Umbraco to 17.5.3:** if its own MimeKit dependency now
clears 4.15.1, the pin can be removed entirely. If not, keep it and update the
comment's version numbers to match.

## PdfPig — the one to watch

0.1.13 → 0.1.15 changes the **extraction engine**. Text extraction output could
shift subtly: element counts, line grouping, font size reporting.

This is the "still works, but the output got slightly worse" case, which is
invisible to a pass/fail test.

**Bump PdfPig separately and last**, so any change in extraction output is
attributable to one package rather than a batch.

## Sequencing

Do the two groups as separate changes, so a regression is attributable.

**Group A — Umbraco ecosystem**

1. Umbraco 17.2.2 → 17.5.3 in **both** projects together — they must match
2. Verify, then check whether the MimeKit pin can be dropped (see below)
3. Community packages, checking each one's Umbraco compatibility first

**Group B — UpDoc's own**

4. AngleSharp (+ AngleSharp.Css if a stable release exists), MimeKit — low risk
5. **PdfPig last, alone**, with extraction output compared before and after

## Verification

After each step:

- [ ] `dotnet build UpDoc.sln` clean
- [ ] Site starts, backoffice loads, UpDoc section present
- [ ] PDF import (Flemish Masters) — fields populated, no raw markdown,
      day headings as `<h3>`, lists as `<ul>`, organiser block populated
- [ ] Web import (Suffolk page) — same checks
- [ ] Relevant E2E spec passes

For PdfPig specifically, compare **element counts and extracted text**, not just
"a page was created".

Known-good reference from 2026-07-19, before any of these upgrades:

- Flemish Masters PDF: 4 pages, 611 elements, 5 day headings as `<h3>`,
  9 features, 9 sights, organiser block list populated
- Suffolk web page: title, description, 5-day itinerary, 6 features,
  11 sights, accommodation paragraph

## Gate

Ideally after **#40** (release-safety baseline), which turns the verification
above from "looks right" into a diff.

If these need doing before #40, the known-good reference in the previous
section is the fallback comparison. It is weaker, but it is not nothing.

## Related, tracked elsewhere

- npm advisories in the frontend package, incl. `pdfjs-dist` — **#51**
- Dependabot PRs #46-#49 (devDependencies; #49 is vite 5→6, a major) — **#51**
- GitHub Actions off Node 20 — **#54**
