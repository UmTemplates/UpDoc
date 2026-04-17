# Docs Screenshot Automation — Planning Note

**Status:** Deferred — idea captured for future sessions.

**Context:** The UpDoc docs (Astro Starlight) are text-heavy. A tool this visual deserves screenshots of the UI flows it describes. Manually taking and maintaining screenshots is high-effort and rots fast — every UI tweak invalidates captures across the site.

**Proposal:** Use the existing Playwright setup to drive the backoffice through documented flows and capture screenshots at predetermined steps. Regenerate screenshots by running the spec after UI changes.

---

## Why this fits

- Authentication is already solved (`tests/e2e/auth.setup.ts`, Playwright API user, `.env` credentials)
- Known test content exists (Winchester PDFs, Group Tours tree, blueprint GUIDs are stable)
- Playwright's `page.screenshot({ path, clip, mask })` handles targeted captures
- One command rebuilds all docs imagery → screenshots stay in sync with reality
- The same infrastructure can capture `.webm` video for flow-based GIFs (drag-drop, modal flows)

---

## Scope for a first pass

Pick **one docs page** — suggest `usage.md` (content editor flow) — and build the pipeline end to end before generalising. Success criteria: running a single command regenerates every screenshot on that page from a clean backoffice state.

Once that works, replicate for:
1. `usage.md` — content editor flow
2. `user-journeys.md` — end-to-end scenarios
3. `setup.md` — workflow author first run
4. `mapping-directions.md` — three-tab model visuals
5. `ui` section — component overview

---

## Proposed structure

```
src/UpDoc/wwwroot/App_Plugins/UpDoc/tests/
  e2e/                           # existing E2E tests
  docs-screenshots/              # NEW — separate folder, separate purpose
    usage.screenshots.ts
    user-journeys.screenshots.ts
    setup.screenshots.ts
    helpers/
      viewport.ts                # fixed viewport (1440×900) for consistency
      capture.ts                 # wrapper around page.screenshot with defaults
      cleanup.ts                 # remove test documents after capture

docs/src/assets/screenshots/
  usage/
    01-context-menu.png
    02-blueprint-picker.png
    03-source-sidebar.png
    ...
  user-journeys/
    ...
```

**Separation from E2E tests**: different purpose (artefact generation vs correctness check), different run cadence (on-demand vs CI), different failure tolerance (screenshots can fail silently; tests must not).

---

## Key decisions to make before implementing

### Viewport

Fix viewport size (e.g. 1440×900). Variable sizes produce visual drift between captures and make it harder to spot real changes.

### Theme

Pick light or dark and stick with it across all docs. Mixing produces jarring visual inconsistency. Suggest light (matches Umbraco default).

### Annotations

Playwright can't draw arrows or callout numbers natively. Three options:

1. **No annotations** — rely on surrounding markdown prose to direct attention. Simplest; accepts a loss of precision.
2. **CSS overlay in Astro** — define hotspots in markdown using a custom component. Screenshots stay clean; annotations live alongside prose. More flexible, more code.
3. **Post-processing** — run captured PNGs through a tool (Sharp, `@napi-rs/canvas`) that overlays arrows/numbers from a config. Most polished output, most moving parts.

Recommended starting point: option 1. If prose isn't enough, graduate to option 2.

### Sensitive content

Every screenshot is reviewed for:
- Client tour/page names that shouldn't appear in public docs
- Email addresses (Playwright API user is fine, real users aren't)
- Internal URLs
- Authentication tokens in dev tools (don't capture browser devtools)

Prefer using seeded content (`Test Group Tours` tree branch) over real client content for captures.

### File paths and git

Screenshots committed to the repo under `docs/src/assets/screenshots/`. Pros: docs are self-contained, GitHub Pages serves them directly. Cons: PNGs bloat git history. Alternatives:

- Store in git LFS — adds setup complexity
- Generate at build time — defeats the "review the output" benefit
- Commit anyway — probably fine for this size of project

Commit anyway, revisit if repo size becomes a problem.

### Videos/GIFs

Playwright records `.webm`. Converting to `.gif` or `.mp4` requires ffmpeg. Scope: skip initially. Revisit only for genuinely flow-based things (drag-and-drop) that screenshots can't convey. Keep under 15 seconds — easier to re-record, smaller files, easier on readers.

---

## Implementation sketch

```typescript
// tests/docs-screenshots/helpers/capture.ts
export async function capture(page: Page, name: string, options?: CaptureOptions) {
  const docPage = options?.docPage ?? 'usage';
  const outputPath = path.join(
    'docs/src/assets/screenshots',
    docPage,
    `${name}.png`
  );
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    ...options,
  });
}

// tests/docs-screenshots/usage.screenshots.ts
test.use({ viewport: { width: 1440, height: 900 } });

test('usage.md flow', async ({ page }) => {
  await page.goto('/umbraco');
  await expect(page.getByText('Content')).toBeVisible();

  // Navigate to parent node
  await page.getByLabel('Expand child items for Home').click();
  await page.getByText('Test Group Tours').click();
  await capture(page, '01-content-tree');

  // Open actions menu
  await page.getByLabel('Open actions menu').click();
  await capture(page, '02-actions-menu');

  // Click Create from Source
  await page.getByText('Create Document from Source').click();
  await capture(page, '03-blueprint-picker');

  // ... continue through the flow
});
```

Markdown consumes them like:

```markdown
![Content tree with Test Group Tours node](../assets/screenshots/usage/01-content-tree.png)

Click the **"..."** button on the parent node to open the actions menu.

![Actions menu open with Create Document from Source highlighted](../assets/screenshots/usage/02-actions-menu.png)
```

---

## Running and regenerating

Scripts in `package.json`:

```json
{
  "scripts": {
    "docs:screenshots": "playwright test --config=playwright.docs.config.ts",
    "docs:screenshots:usage": "playwright test --config=playwright.docs.config.ts usage.screenshots"
  }
}
```

Separate Playwright config so these runs don't mix with E2E (different reporter, different base URL maybe, no retries).

---

## Cost / benefit

**Cost:**
- ~1 day to build the pipeline end-to-end for one page
- ~2 hours per additional page after that
- Ongoing maintenance when UI changes (but far less than manual re-capture)
- Repo size growth from committed PNGs

**Benefit:**
- Docs that show what they describe
- Screenshots stay current (one command to regenerate)
- Onboarding improves materially for new workflow authors
- A base for video snippets later if needed

**Verdict:** High value when tackled properly. Not urgent — manual screenshots would also be fine short-term for the one or two pages that most need them. The automation pays back when you have 5+ pages needing imagery.

---

## Open questions

1. **CI integration**: should the screenshot spec run on merge to `develop` to catch UI regressions that break captures? Or on-demand only? Default: on-demand. Automated runs would need a way to handle diffs.

2. **Diff review**: when re-running, how do we catch unintended visual changes? Manual review of PR diff is the obvious answer; Playwright's visual comparison isn't suitable here (screenshots aren't assertions).

3. **Multiple locales**: if UpDoc ever ships localised docs, do we regenerate screenshots per locale? Probably yes, with the spec parameterised on locale query string. Not a concern until localised docs exist.

4. **Dark mode coverage**: future consideration — capture both themes and let Starlight switch between them via CSS `prefers-color-scheme`. More work, better UX. Park for now.

---

## Prior art to review before implementing

- Astro Starlight's own docs — how they handle imagery
- Umbraco docs (docs.umbraco.com) — screenshot-heavy, good reference for annotation style
- Playwright's own docs — they dog-food their own tool for screenshots

---

## Related

- See `CLAUDE.md` and `memory/playwright-testing.md` for existing Playwright conventions
- `tests/e2e/auth.setup.ts` is the auth foundation this would build on
- Screenshot automation would also make the `user-journeys.md` page dramatically more useful
