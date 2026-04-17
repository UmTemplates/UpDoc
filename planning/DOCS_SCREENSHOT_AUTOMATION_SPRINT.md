# Docs Screenshot Automation — Sprint Plan

**Issue:** #19
**Status:** Planning
**Supersedes planning scope in:** `planning/DOCS_SCREENSHOT_AUTOMATION.md` (kept as the high-level note; this doc is the detailed sprint plan)

---

## Goal

Prove the Playwright-driven docs screenshot pattern end-to-end on a single page. If it works, the pattern generalises to every other docs page that would benefit from imagery.

**Chosen first target:** `docs/src/content/docs/updating-blueprints.md`

**Why this page:**
- Small scope (one page, ~140 lines)
- Fresh in context — the blueprint-update flow is well-understood
- Natural screenshot moments: workflow workspace → Destination tab → Regenerate button → Map tab showing orphaned row
- If we can engineer an orphaned mapping during the spec, we capture the exact UI the docs describe

---

## Prerequisites

Before the spec can run:

1. **Test site running** — `dotnet run --project src/UpDoc.TestSite/UpDoc.TestSite.csproj` (NOT `dotnet watch` — restarts mid-run cause timeouts per CLAUDE.md)
2. **Playwright API user exists** — `play.wright@email.com` (already in `.env`)
3. **A workflow exists** to drive through — Group Tour from PDF (already set up in test site)
4. **Sample PDF** — `TTM5092 Winchester Istanbul lo.pdf` in Winchester folder (already present)

The spec assumes the site is up. If it isn't, tests fail fast at the navigation step. Not the spec's job to start the site.

---

## Decisions

### Viewport

**Fixed at 1440×900.** Umbraco's backoffice is designed for desktop; smaller captures would clip panels. Larger wastes pixels in the rendered docs.

### Theme

**Light theme.** Matches Umbraco default, matches Starlight docs default, better contrast for annotations if we add them later.

### Annotations

**None for this first pass.** Rely on surrounding markdown prose to direct attention. If a screenshot genuinely needs a callout ("click here"), we tackle it later as a separate concern (CSS hotspot overlay in Starlight, most likely).

### File paths

Screenshots: `docs/src/assets/screenshots/<page>/<nn>-<name>.png`

- `nn` is a two-digit sequence (`01`, `02`, `03`) for stable ordering in the folder
- `name` is kebab-case describing the moment captured
- Folder name matches the docs page slug

Example: `docs/src/assets/screenshots/updating-blueprints/01-workflow-destination-tab.png`

### Spec location

`src/UpDoc/wwwroot/App_Plugins/UpDoc/tests/docs-screenshots/updating-blueprints.screenshots.ts`

Separate folder from `tests/e2e/` because:
- Different purpose (artefact generation vs correctness check)
- Different cadence (on-demand vs CI)
- Different failure tolerance (screenshot drift is noise, test failures are signal)

### Config

**Reuse the existing `playwright.config.ts`** for this first pass. Filter by folder pattern when running. Extract a separate config only after proving the approach.

### npm script

Add to `src/UpDoc/wwwroot/App_Plugins/UpDoc/package.json`:

```json
"scripts": {
  "docs:screenshots": "playwright test tests/docs-screenshots/"
}
```

### Reporting

Use `reporter: 'list'` override for screenshot runs (don't want the HTML report popping open — it's not a test run, it's a capture run). Pass via CLI: `npx playwright test tests/docs-screenshots/ --reporter=list`.

---

## Screenshots for `updating-blueprints.md`

Target moments — subject to change as we actually build it:

| # | File | Moment | Where in docs |
|---|------|--------|---------------|
| 01 | `01-workflow-list.png` | Settings → UpDoc → Workflows collection view | Top of "Workflow: updating a blueprint safely" |
| 02 | `02-workflow-destination-tab.png` | Open a workflow, Destination tab showing blueprint structure | "How UpDoc identifies blocks" section |
| 03 | `03-regenerate-button.png` | Hover or highlight on Regenerate Destination button | "Workflow: updating a blueprint safely" step 3 |
| 04 | `04-reconciliation-toast.png` | Success toast "N reconciled, M orphaned" after regenerate | "Workflow: updating a blueprint safely" step 4 |
| 05 | `05-map-tab-orphaned.png` | Map tab showing an orphaned row (warning tag visible) | "Duplicate block types" section |

Five screenshots for this page. Some may be dropped if they don't add value in practice.

---

## Spec structure

```typescript
// updating-blueprints.screenshots.ts
import { test, expect } from '@playwright/test';
import { captureScreenshot } from './helpers/capture.js';

test.use({ viewport: { width: 1440, height: 900 } });

const DOC_PAGE = 'updating-blueprints';

test('updating-blueprints docs screenshots', async ({ page }) => {
  await page.goto('/umbraco');

  // 01 — Workflow list
  await page.getByLabel('Settings').click();
  await page.getByText('UpDoc').click();
  await page.getByText('Workflows').click();
  await captureScreenshot(page, DOC_PAGE, '01-workflow-list');

  // 02 — Open Group Tour workflow, Destination tab
  await page.getByText('Group Tour from PDF').click();
  await page.getByRole('tab', { name: 'Destination' }).click();
  await captureScreenshot(page, DOC_PAGE, '02-workflow-destination-tab');

  // 03 — Regenerate button (hover state)
  const regenerate = page.getByRole('button', { name: /regenerate/i });
  await regenerate.hover();
  await captureScreenshot(page, DOC_PAGE, '03-regenerate-button');

  // 04 — Click regenerate, capture success toast
  await regenerate.click();
  await page.getByText(/reconciled/i).waitFor();
  await captureScreenshot(page, DOC_PAGE, '04-reconciliation-toast');

  // 05 — Map tab showing mappings
  await page.getByRole('tab', { name: 'Map' }).click();
  await captureScreenshot(page, DOC_PAGE, '05-map-tab');
});
```

Selectors are illustrative — the real ones will be discovered by running against the actual UI.

---

## Helper

```typescript
// tests/docs-screenshots/helpers/capture.ts
import type { Page } from '@playwright/test';
import path from 'node:path';

const SCREENSHOTS_ROOT = path.resolve(
  __dirname,
  '../../../../../../../docs/src/assets/screenshots'
);

export async function captureScreenshot(
  page: Page,
  docPage: string,
  name: string
): Promise<void> {
  const outputPath = path.join(SCREENSHOTS_ROOT, docPage, `${name}.png`);
  await page.screenshot({ path: outputPath, fullPage: false });
}
```

Path resolution from deep inside `App_Plugins/UpDoc/tests/docs-screenshots/helpers/` back to `docs/src/assets/screenshots/` at the repo root — lots of `..`. Will verify when implementing.

---

## Markdown integration

After screenshots exist, update `updating-blueprints.md` to reference them:

```markdown
## How UpDoc identifies blocks

![Workflow Destination tab showing blueprint structure](../assets/screenshots/updating-blueprints/02-workflow-destination-tab.png)

Every block in an Umbraco blueprint has two identifiers:
...
```

Image paths are relative to the markdown file's location — `updating-blueprints.md` is in `docs/src/content/docs/`, screenshots in `docs/src/assets/screenshots/`, so `../assets/screenshots/...` is correct for Starlight's default resolution.

Verify image rendering in the local dev server before merging.

---

## Review workflow for screenshot changes

When the UI changes and screenshots are regenerated, the PR diff shows binary PNG diffs — GitHub renders them side-by-side. Reviewer checks:

1. Are the expected elements still visible?
2. No sensitive content (client tour names, real emails) captured?
3. No visual regressions (unexpected layout shifts)?

No automated visual regression — screenshots aren't assertions, they're artefacts. Manual review is the bar.

---

## Sensitive content audit

Checklist before committing any screenshot:

- [ ] No real client content (tour names, society folder names that don't belong in docs)
- [ ] No email addresses other than the Playwright test user
- [ ] No authentication tokens (devtools not open)
- [ ] No internal-only URLs in the browser chrome

If the test site contains client content (e.g. Tailored Travels real tours), we should consider creating dedicated "docs fixture" content — neutral-named tours purely for screenshot use. Not in scope for this first pass but worth noting.

---

## Sprint steps

1. **Create feature branch** — `feature/docs-screenshot-automation` (already done)
2. **Write spec and helper** — single file each, minimum viable
3. **Run against local site** — iterate selectors against real UI, adjust screenshot moments
4. **Audit captured screenshots** — sensitive content check, visual quality
5. **Reference from markdown** — edit `updating-blueprints.md` to embed the screenshots
6. **Verify in local dev server** — http://localhost:4322/UpDoc/updating-blueprints/
7. **Commit screenshots + markdown + spec together**
8. **PR to main** — includes binary PNGs, referenced from the docs page
9. **Merge** — docs auto-deploy to GitHub Pages

Closes #19 at merge.

---

## After this sprint

If the approach works cleanly:

- Extract a separate `playwright.docs.config.ts` with list reporter and no retries
- Add more pages one at a time (priority: `usage.md`, `user-journeys.md`, `setup.md`)
- Consider a GitHub Action that regenerates screenshots on demand (workflow_dispatch) — manual trigger, not automatic
- Revisit annotations if prose alone isn't enough

If the approach fails:

- Document why in this file
- Decide whether to iterate (different approach) or abandon (accept manual screenshots)

---

## Risks

- **Selector fragility** — backoffice UI uses many shadow DOM elements, custom components. Selectors may break between Umbraco versions. Mitigation: stable `data-mark` attributes or `aria-label` + role queries rather than CSS.
- **Flaky timing** — toast captures need the toast visible. `waitFor` with a timeout is cleaner than `waitForTimeout(ms)`.
- **Large PR diff** — adding several PNGs inflates the PR. Acceptable for the payoff. If it becomes a problem later, consider git LFS.
- **Site state pollution** — the spec may trigger real actions (regenerate destination). We should leave the site in a state equivalent to how we found it, or accept the site as a throwaway dev environment. CLAUDE.md already treats it as dev — no production data concern.

---

## Open questions (revisit during implementation)

1. Do we need a screenshot *before* regenerate (to show the state) and another *after* (to show the toast)? If so, that's two screenshots for one narrative moment — worth it or over-specified?
2. Should the Map tab screenshot engineer an orphaned mapping by deleting a block from the blueprint? Or is an all-healthy Map tab fine, with the orphaned edge case described in prose only? The former is more honest; the latter is simpler.
3. Do we record the Playwright video trace? Useful for debugging selector issues, extra storage cost. Default: yes, behind `PWDEBUG` env var, not committed.
