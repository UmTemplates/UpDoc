# Claude Instructions

## Session Startup (MANDATORY)

At the start of **every session or continued conversation**, you MUST read the following files using the Read tool before doing ANY other work. Do not rely on summaries, system reminders, or compacted context for these files — read them fresh every time.

1. `planning/REFACTOR_TO_CONFIGURABLE.md` — Config-driven extraction and mapping architecture
2. `planning/CREATE_FROM_SOURCE_SIDEBAR.md` — Unified sidebar modal design
3. `planning/CREATE_FROM_SOURCE_UI.md` — Single entry point UI design
4. `planning/DESTINATION_DRIVEN_MAPPING.md` — Outlook-rules-inspired destination-driven mapping (Phases 2-5)

These files contain agreed-upon design decisions, config schemas, and implementation roadmaps. You must have their full content in your working context before answering questions, entering plan mode, or writing any code. If you find yourself unsure about an architectural decision, the answer is almost certainly in these files.

---

## Work Approval (MANDATORY)

**Do NOT start implementing a new piece of work without asking the user first.** When the user describes a task or feature, your first response must be to discuss the approach — explain what you'd change, where, and why — then wait for explicit approval before writing any code. This applies to the initial start of each new task, not to every individual edit within an approved task. Once the user approves the approach, proceed without asking for permission on each step.

This does not apply to trivial fixes the user explicitly asks for (e.g., "fix this typo", "commit this").

---

## Project Structure

This project is a two-project solution:

- **`src/UpDoc/`** — The Razor Class Library (RCL). This is the installable NuGet package containing the Umbraco extension.
- **`src/UpDoc.TestSite/`** — The Umbraco host site used for development and testing. References the RCL via `<ProjectReference>`.
- **`UpDoc.sln`** — Solution file at the repo root.

## Umbraco Skills Marketplace

This project uses the Umbraco Skills Marketplace for Claude Code. When working on Umbraco backoffice customizations, use the available skills for guidance on extension types, patterns, and testing.

**Required plugins:**
- `umbraco-cms-backoffice-skills` - 57 skills for backoffice extensions
- `umbraco-cms-backoffice-testing-skills` - 8 skills for testing

**To install (if not already installed):**
```bash
/plugin marketplace add umbraco/Umbraco-CMS-Backoffice-Skills
/plugin install umbraco-cms-backoffice-skills@umbraco-backoffice-marketplace
/plugin install umbraco-cms-backoffice-testing-skills@umbraco-backoffice-marketplace
```

**When to use skills:**
- Before implementing any Umbraco backoffice extension, invoke the relevant skill (e.g., `/umbraco-entity-actions`, `/umbraco-modals`, `/umbraco-dashboard`)
- For testing, use `/umbraco-testing` to choose the right testing approach
- Skills provide official docs, patterns, and working examples

## Planning Files

The `planning/` folder contains architectural planning documents for this project. These files are read at session startup (see **Session Startup** above) and must be in your working context at all times.

Do not duplicate or contradict decisions already made in these files. If the current task relates to an existing planning document, build on it rather than designing from scratch. Never ask the user questions that are already answered in the planning files.

**Saving plans:** At the end of any significant planning phase (architecture decisions, multi-step implementation plans, design brainstorms), ask the user if they'd like the plan saved to `planning/` and suggest a meaningful filename. Claude Code's `.claude/plans/` directory uses auto-generated names that are hard to find later — the `planning/` directory is the permanent, human-readable record.

## Git Branching

This project uses a `develop`/`main` branching model:

- **`develop`** — the default branch. All feature branches merge here. Day-to-day development happens on `develop`.
- **`main`** — the release branch. Only updated via PR from `develop` when ready to tag and publish a NuGet package.

Before starting work on any feature, bug fix, or refactoring task, create a feature branch from `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/short-description
```

Do not work directly on `develop` or `main`. Each feature branch should represent a single, small increment of work that leaves the project in a working state. Only merge back to `develop` when the feature is complete and tested.

**Important:** Before creating a new feature branch, check the current branch. If the current branch is not `develop`, alert the user and ask whether to:
1. Finish and merge the current branch first
2. Stash/commit current work and switch to `develop` to create the new branch
3. Continue working on the current branch instead

Do not create a new feature branch while another feature branch is checked out without explicit user approval.

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

## Umbraco References

- **UUI Storybook** — base UI primitives (`uui-button`, `uui-box`, `uui-tab`, `uui-icon`, `uui-table`, etc.): https://uui.umbraco.com/
- **Umbraco API Docs Storybook** — Umbraco-specific composed components, layout patterns, property editors, and dashboard patterns (`umb-body-layout`, `umb-property`, collection views, etc.): https://apidocs.umbraco.com/v17/ui/

When implementing UI, check **both** references. UUI for base components, API Docs for how Umbraco composes them into higher-level patterns. The API Docs Storybook often shows patterns (stat boxes, tables, dashboard layouts) that aren't in UUI alone.

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

The Umbraco site may be running during development. Before performing any work that requires the site to be stopped (e.g. `dotnet build`, `dotnet run`, modifying C# files that need recompilation, or changes that lock files), prompt the user to stop the site first. Do not assume the site is stopped.

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
