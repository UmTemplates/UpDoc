# Claude Instructions

## Session Startup (MANDATORY)

At the start of **every session or continued conversation**, you MUST read the following files using the Read tool before doing ANY other work. Do not rely on summaries, system reminders, or compacted context for these files — read them fresh every time.

1. `planning/REFACTOR_TO_CONFIGURABLE.md` — Config-driven extraction and mapping architecture
2. `planning/CREATE_FROM_SOURCE_SIDEBAR.md` — Unified sidebar modal design
3. `planning/CREATE_FROM_SOURCE_UI.md` — Single entry point UI design
4. `planning/DESTINATION_DRIVEN_MAPPING.md` — Outlook-rules-inspired destination-driven mapping (Phases 2-5)

These files contain agreed-upon design decisions, config schemas, and implementation roadmaps. You must have their full content in your working context before answering questions, entering plan mode, or writing any code. If you find yourself unsure about an architectural decision, the answer is almost certainly in these files.

---

## GitHub Issues

This project tracks work in GitHub Issues (visible in the GitHub Pull Requests and Issues VS Code extension sidebar). Before starting any non-trivial task — feature, bug fix, meaningful docs change, new planning doc — check `gh issue list` for an existing issue. If none exists, ask whether one should be created before proceeding. Reference the issue number in commits (`Closes #12`) and PR bodies so the board stays in sync with the work.

Issues are not required for trivial changes (typo fixes, one-line corrections) — use judgement. If in doubt, ask.

---

## Project Structure

This project is a two-project solution:

- **`src/UpDoc/`** — The Razor Class Library (RCL). This is the installable NuGet package containing the Umbraco extension.
- **`src/UpDoc.TestSite/`** — The Umbraco host site used for development and testing. References the RCL via `<ProjectReference>`.
- **`UpDoc.sln`** — Solution file at the repo root.

## Planning Files

The `planning/` folder contains architectural planning documents for this project. These files are read at session startup (see **Session Startup** above) and must be in your working context at all times.

Do not duplicate or contradict decisions already made in these files. If the current task relates to an existing planning document, build on it rather than designing from scratch. Never ask the user questions that are already answered in the planning files.

**Saving plans:** At the end of any significant planning phase (architecture decisions, multi-step implementation plans, design brainstorms), ask the user if they'd like the plan saved to `planning/` and suggest a meaningful filename. Claude Code's `.claude/plans/` directory uses auto-generated names that are hard to find later — the `planning/` directory is the permanent, human-readable record.

## Documentation Requirements

When modifying any file in `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/`, update the corresponding documentation in `docs/src/content/docs/source-files/`:

| Source File | Documentation File |
|-------------|-------------------|
| index.ts | docs/src/content/docs/source-files/index-ts.md |
| manifest.ts | docs/src/content/docs/source-files/manifest.md |
| up-doc-action.ts | docs/src/content/docs/source-files/up-doc-action.md |
| up-doc-modal.element.ts | docs/src/content/docs/source-files/up-doc-modal-element.md |
| up-doc-modal.token.ts | docs/src/content/docs/source-files/up-doc-modal-token.md |
| blueprint-picker-modal.element.ts | docs/src/content/docs/source-files/blueprint-picker-modal-element.md |
| blueprint-picker-modal.token.ts | docs/src/content/docs/source-files/blueprint-picker-modal-token.md |

If adding a new source file:
1. Create corresponding `.md` file in `docs/src/content/docs/source-files/`
2. Add entry to the `sidebar` array in `docs/astro.config.mjs`

## No Local-Machine Paths in Public Docs

The `docs/` directory is published to GitHub Pages and indexed by search engines. Never include references to local-machine paths in any file under `docs/src/content/`:

- No absolute Windows paths (`D:\Users\deanl\...`, `C:\...`)
- No absolute Unix/macOS user paths (`/home/deanl/...`, `/Users/deanl/...`)
- No references to personal usernames in file paths

When referring to external resources (e.g. "the Umbraco CMS source code"), link to the public GitHub URL and instruct readers to clone it locally themselves. The specific path on the maintainer's machine is irrelevant to docs readers.

**This is enforced automatically** — `docs/scripts/check-no-local-paths.mjs` runs as part of `npm run build` and fails the build if any blocked pattern appears in the published output. If the check flags a false positive, update the `ALLOWLIST` in the script; don't disable the check.

Developer-facing files outside `docs/src/content/` (e.g. `CLAUDE.md`, `planning/*.md`, this project's own README) **may** legitimately reference local paths when describing the maintainer's environment. Those files are not published.

## Naming Conventions

| Context | Format | Value |
|---------|--------|-------|
| Brand / display | PascalCase | UpDoc |
| C# namespace | PascalCase | `UpDoc.*` |
| Umbraco aliases | Dot notation | `UpDoc.EntityAction`, `UpDoc.Modal`, etc. |
| npm package | lowercase | `updoc` |
| App_Plugins folder | PascalCase | `App_Plugins/UpDoc/` |
| File names | kebab-case | `up-doc-action.ts`, `up-doc-modal.element.ts` |
| Custom HTML elements | kebab-case | `<up-doc-modal>` |
| API route | lowercase | `/umbraco/management/api/v1/updoc` |

## Umbraco CMS Source Code (CRITICAL)

A full clone of the Umbraco CMS source code is available at:

```
d:\Users\deanl\source\repos\Umbraco Extensions\Umbraco-CMS
```

**You MUST use this as your primary reference** when implementing Umbraco backoffice extensions. The Claude skills, UUI Storybook, and online docs are supplementary — the actual source code is the definitive reference for how Umbraco's backoffice works internally.

**When to use it:**
- Before implementing any extension type, search the Umbraco CMS source for how Umbraco itself implements similar features (e.g., search for `entityCreateOptionAction`, `collectionAction`, etc.)
- When a skill or doc describes an extension type, verify the actual implementation in the source
- When something doesn't work as expected, read the Umbraco source to understand why
- Look at `src/Umbraco.Web.UI.Client/src/packages/` for all backoffice TypeScript/Lit components

**Key paths:**
- Frontend source: `Umbraco-CMS/src/Umbraco.Web.UI.Client/src/`
- Document-related: `Umbraco-CMS/src/Umbraco.Web.UI.Client/src/packages/documents/`
- Core extension types: `Umbraco-CMS/src/Umbraco.Web.UI.Client/src/packages/core/`

## Documentation Worktree (READ BEFORE EDITING ANY DOCS FILE)

Documentation is edited in a **git worktree**, never from the main working directory.

```
UpDoc/                     main working directory — code, on a feature branch
UpDoc/.worktrees/docs/     docs worktree — always on docs/site
```

**Before editing any file under `docs/`, check the absolute path.** If it is not
under `.worktrees/docs/`, you are in the wrong place. The two folders look
identical in an editor; the path is the only way to tell.

Editing `docs/` from the main working directory puts the change on a code
feature branch, where it sits unpublished until that branch merges. That is the
exact friction the worktree exists to remove.

Commit and push docs changes as you make them, rather than batching. Pushing to
`docs/site` deploys.

Exception: documentation that is genuinely part of a code change (a source file
and its reference page changing together) can stay in the feature branch.

See `WORKTREES.md` for the full rules and rationale.

## Documentation (Astro Starlight)

Documentation is built with Astro Starlight and deployed to GitHub Pages via GitHub Actions. The site is at `https://umtemplates.github.io/UpDoc/`.

- Source files: `docs/src/content/docs/` (markdown with YAML frontmatter)
- Config: `docs/astro.config.mjs` (sidebar nav, site settings)
- Deployment: Automatic on push to `develop` or `main` when `docs/**` changes

To preview locally:
```bash
cd docs && npm run dev
```

## Build

### Frontend (TypeScript)

After changing TypeScript files, rebuild with:
```
cd src/UpDoc/wwwroot/App_Plugins/UpDoc && npm run build
```

### .NET Solution

Build the full solution with:
```
dotnet build UpDoc.sln
```

## Running Site

The test site can be run with:
```
dotnet run --project src/UpDoc.TestSite/UpDoc.TestSite.csproj
```

**NEVER run `dotnet build`, `dotnet run`, or `dotnet watch` yourself unless explicitly asked to.** The user builds and runs the site. If Claude starts the site, the user loses track of whether it is running, which corrupts the shared understanding of state (and can lock files or clash with the user's own running instance). When a change needs a build or restart (C# edits, uSync import, verifying in the running app), STOP and ask the user to build/run it, then continue once they confirm it is up. Do not assume the site is stopped, and do not start it to "check" something.

## Playwright E2E Testing

Tests are in `src/UpDoc/wwwroot/App_Plugins/UpDoc/tests/e2e/`. Config: `playwright.config.ts` in the same `App_Plugins/UpDoc/` directory.

**Running tests:**
The config uses `reporter: 'html'` which auto-opens the report in the browser when tests finish. Let it open — the user wants to see the report. The command will block until the user closes the report browser tab, so always run Playwright tests with `run_in_background: true`.

**IMPORTANT: Never run the full test suite unless the user explicitly asks for it.** Always run only the specific spec file relevant to the change. The full suite takes 6+ minutes.

```bash
cd src/UpDoc/wwwroot/App_Plugins/UpDoc && npx playwright test tests/e2e/filename.spec.ts  # single file (DEFAULT)
cd src/UpDoc/wwwroot/App_Plugins/UpDoc && npx playwright test                              # all tests (ONLY when asked)
```

**Which spec file to run:**
| Change area | Spec file |
|-------------|-----------|
| Create from Source flow, media picker, modal UI | `create-from-source.spec.ts` |
| Ad-hoc PDF testing (any folder/file) | `smoke-test-pdf.spec.ts` (via env vars) |
| blockKey, contentTypeKey, destination reconciliation | `blockkey-reconciliation.spec.ts` |
| Transformed tab, rules rendering | `transformed-view.spec.ts` |

**Prerequisites:**
- Run the site with `dotnet run` (NOT `dotnet watch`) — watch mode can restart mid-test causing timeouts
- A **Playwright API user** (`play.wright@email.com`) exists in Umbraco for test authentication
- Credentials are in `.env` at `src/UpDoc/wwwroot/App_Plugins/UpDoc/.env` — never hardcode them
- Auth is handled automatically by `tests/e2e/auth.setup.ts` which saves storage state

**Content tree:** The root content node is **"Home"**. Child nodes include Group Tours, Tailored Tours, Test Group Tours. Tests expand the tree using `'Expand child items for Home'`.

**Test PDFs:** PDFs are stored in Media > PDF, organised by society folder (Winchester, Kingston, Derby, etc.). The `create-from-source.spec.ts` and `blockkey-reconciliation.spec.ts` tests use `TTM5092 Winchester Istanbul lo.pdf` in the Winchester folder.

**Smoke test for any PDF:**
The user can say "test Winchester" or "test Derby Istanbul" to run the generic smoke test (`smoke-test-pdf.spec.ts`) against any PDF in the Media library. Workflow:
1. Search uSync Media configs for PDFs in that folder
2. If one PDF → run immediately. If multiple → ask which one (or all)
3. Run: `PDF_FOLDER=FolderName PDF_NAME="filename.pdf" npx playwright test smoke-test-pdf`

This creates a document from the PDF, verifies fields are populated and markdown-free, then cleans up.

**Key patterns:**
- UUI shadow DOM: use page-level queries, not scoped inside shadow roots
- API helpers use `page.evaluate()` with localStorage auth token for authenticated fetch calls
- Protected node IDs are hardcoded in tests to prevent accidental deletion of collection nodes
