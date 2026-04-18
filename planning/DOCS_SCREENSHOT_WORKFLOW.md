# Docs-with-Screenshots Workflow

**Issue:** #23
**Status:** Planning
**Scope:** This document captures the workflow for producing UpDoc docs pages with automated Playwright screenshots. Two companion artefacts make the pattern portable beyond this project — see "Related artefacts" at the bottom.

---

## The workflow

Seven steps. Roughly a half-day of elapsed time per docs page. The conversational walkthrough is the slowest part; the implementation tends to take about 30-45 minutes once we have a plan.

### 1. Open a GitHub issue

Before any writing, open an issue describing the docs page being written. Reference the issue in every commit and in the PR body. This keeps the GitHub project board accurate and gives future readers a single place to find all related work.

Use the `documentation` label (and `enhancement` if appropriate).

### 2. Conversational walkthrough

With the test site running and the relevant feature visible, walk through the flow step by step with Claude. Describe what's on screen, what you do, what changes, in natural language. Claude takes notes, asks clarifying questions, and flags potential screenshot moments with 📸.

Keep the test site on a stable branch — don't switch branches mid-walkthrough or the UI might change under you.

### 3. Planning doc (faux-flow)

Claude writes `planning/USER_FLOW_<PAGE_NAME>.md` — a numbered step-by-step walkthrough of the flow with screenshot markers. Dual-purpose: source for the real docs page, and script for the Playwright spec.

Review it, answer any open questions, approve.

### 4. Docs page

Claude turns the planning doc into `docs/src/content/docs/<page-name>.md` — real, polished prose with image references to `../../assets/screenshots/<page-name>/<nn>-<name>.png`.

**Critical: use `../../assets/`, not `../assets/`.** The image path is resolved relative to the markdown file's location (`docs/src/content/docs/`), so two levels of `..` are needed to reach `docs/src/assets/`. Astro's build fails on this silently in local dev but catches it on CI. (Lessons learned from #21/#22.)

Add the new page to `docs/astro.config.mjs` sidebar.

### 5. Playwright spec

Claude writes `src/UpDoc/wwwroot/App_Plugins/UpDoc/tests/e2e/<page-name>.screenshots.ts`. The spec drives the same flow, captures a screenshot at each 📸 marker, saves to `docs/src/assets/screenshots/<page-name>/`.

**Key patterns from UpDoc experience:**

- `test.use({ viewport: { width: 1440, height: 900 } })` — fixed viewport for consistency
- Fixed workflow/content names (no timestamps) for stable screenshot captions
- Delete-if-exists at spec start so re-runs are idempotent
- Scope sidebar queries to the custom element (`const sidebar = page.locator('create-workflow-sidebar')`) to avoid strict-mode violations with the tree or other panels
- Native `<select>` dropdowns cannot be screenshotted in the open state (the menu is OS-drawn, outside the DOM) — capture the closed state and describe options in prose
- UUI `<uui-card-media select-only>` cards don't respond to `.click()` — their selection model uses shadow DOM events that we haven't cracked yet (see #20)

**Run with:** `npx playwright test <page-name>.screenshots --project=docs-screenshots --reporter=line`

### 6. Iterate

Selectors are best-guess first time. Expect to re-run the spec several times, fixing one selector per iteration. Each run takes ~15-60 seconds depending on how far it gets before failing.

Common fixes:
- `getByText()` returns multiple matches → scope to a parent element
- Placeholder text matches both an outer component and the inner input → use `.first()` or target the `<input>` directly
- An action button's label depends on state (e.g. "Include all pages" vs "Include 1 page") → assert the current expected label, wait for state changes

### 7. Ship

When the spec runs clean, commit everything together: the PNGs, the markdown, the spec. Push, open PR, merge. GitHub Actions deploys docs to Pages automatically on merge to main.

Close the issue (PR body's `Closes #NN` handles this, but verify — it sometimes doesn't fire).

---

## UpDoc-specific bits

These are things the generic guide (in the standalone repo) won't have, because they're specific to this project's test site and content.

**Test site:**

- URL: `https://localhost:44390/umbraco`
- Run with: `dotnet run --project src/UpDoc.TestSite/UpDoc.TestSite.csproj` — NOT `dotnet watch` (restarts mid-run)
- Must be running before any spec starts

**Playwright API user:**

- Email: `play.wright@email.com`
- Credentials in `src/UpDoc/wwwroot/App_Plugins/UpDoc/.env` — never hardcoded
- Auth handled by `tests/e2e/auth.setup.ts` which saves storage state

**Sample content reserved for screenshots:**

- Workflow name: `Docs Screenshot Test PDF Workflow` (alias: `docsScreenshotTestPdfWorkflow`)
- Sample PDF: `TTM5063 Wensum Flemish Bruges Antwerp Ghent lo.pdf` in Media > PDF > Wensum
- Content tree root: `Home`
- Document type for PDF workflows: `Tailored Tour` / `[Tailored Tour Blueprint]`

**Existing reference spec:** `tests/e2e/creating-a-workflow.screenshots.ts` — copy-paste starting point for new pages.

**Playwright config:** `docs-screenshots` project is already defined in `playwright.config.ts`. Scoped to `*.screenshots.ts` files.

---

## Screenshot output convention

```
docs/src/assets/screenshots/
  <docs-page-slug>/
    01-<first-moment>.png
    02-<second-moment>.png
    ...
```

Filenames use `nn-name.png` so they sort correctly in the folder. Slug matches the markdown filename (e.g. `creating-a-workflow.md` → `creating-a-workflow/`).

---

## When to NOT automate the screenshots

Not everything needs a Playwright spec. Rough rules:

- **< 3 screenshots on a page** — just take them manually. Automation overhead exceeds the payoff.
- **One-off reference screenshots** (e.g. "here's what the NuGet package page looks like") — manual, single PNG in `docs/src/assets/`.
- **Screenshots of external tools** (Figma, VS Code, Umbraco admin UIs we don't test against) — manual.

Automate when the docs page walks through a flow in **our** UI, has **four or more** screenshot moments, and is expected to need regeneration when the UI changes.

---

## Known limitations

Will improve over time as we hit them:

- **Native `<select>` open state** — can't screenshot the OS-drawn dropdown menu. Mitigation: describe options in prose.
- **UUI `<uui-card-media select-only>`** — programmatic selection doesn't fire via standard click or event dispatch. Tracked in #20.
- **Animations / transient states** — capturing a toast fade-in, a modal slide-in, requires careful `waitFor` timing. Not a blocker but needs per-case attention.
- **Video** — Playwright can record `.webm` but we haven't used it. Future enhancement.

---

## Related artefacts

**Global Claude memory** — brief pattern description added to `~/.claude/CLAUDE.md` so any future Claude in any project knows this workflow exists. Written as part of #23.

**Standalone guide repo** (future) — `UmTemplates/docs-screenshot-guide` or similar. Generic template, no project specifics. Projects reference it from their CLAUDE.md.

---

## Open questions

1. **Do we regenerate screenshots on every merge to main, or only on-demand?** Default: on-demand (one command the maintainer runs). Automating regeneration in CI means we need to solve: how to diff PNGs in the PR review, what to do when the spec breaks because of a UI change (does CI go red?).
2. **Should the standalone guide repo include the Playwright helper as an npm package?** Probably not yet — the helper is thin enough to copy-paste. Revisit if we end up maintaining 3+ projects using this pattern.
3. **Medium-zoom** — see `planning/MEDIUM_ZOOM_INTEGRATION.md` for the separate decision on whether to add click-to-enlarge to the docs images.
