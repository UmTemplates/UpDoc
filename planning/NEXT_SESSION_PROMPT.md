# Next Session Prompt

Copy/paste this into Claude Code to continue where we left off.

---

## Where We Are

On `develop` branch, clean. Working through PACKAGING_STRATEGY.md to prepare UpDoc as a distributable NuGet/Umbraco Marketplace package.

### Completed Steps (1-8)

1. **Repo transfer** — `deanleigh/UpDoc` → `UmTemplates/UpDoc`
2. **Move local folder** — to `D:\Users\deanl\source\repos\UmTemplates\UpDoc`
3. **Create `develop` branch** — develop/main model, develop is default. GitHub Pages environment updated to allow deployments from both `develop` and `main`.
4. **Assets** — `assets/icon_updoc.svg` (vector carrot), `assets/icon_nuget_updoc.png` (128x128), `assets/README_nuget.md`
5. **csproj metadata** — PackageId: `Umbraco.Community.UpDoc`, MIT license, icon, readme, tags (no `umbraco-marketplace` yet)
6. **PdfPig** — DEFERRED. `UglyToad.PdfPig 1.7.0-custom-5` is a third-party fork on NuGet.org (by "grinay"), not a local build. Will restore for users. Migration to official `PdfPig 0.1.13` planned as separate work before stable release.
7. **LICENSE** — MIT, repo root
8. **READMEs** — GitHub README.md rewritten with correct package name, NuGet badge, docs URL (`umtemplates.github.io/UpDoc/`). NuGet readme already in assets/.

### Next Step: 9. GitHub Actions + Secrets

This needs:
- **`NUGET_API_KEY`** secret — generate on nuget.org scoped to `Umbraco.Community.UpDoc`
- **`RELEASE_NUGET.yml`** workflow — build, pack, push on semver tag
- **`add-to-project.yml`** workflow — auto-add issues to UmTemplates project board
- Verify `ADD_TO_PROJECT_PAT` org secret covers the UpDoc repo

### Decisions Still Needed

- **Marketplace Category** (Phase B) — "Content Management" or "Import & Export"
- **MimeKit Pinning** — keep, remove, or conditional
- **First Release Scope** — which features must be stable

### Bugs Still Open (from `planning/BUG_FIXING_PROMPT.md`)

1. **GetConfigForBlueprint merge bug (C# side)** — `WorkflowService.GetConfigForBlueprint()` returns incorrect data for non-first source types. Frontend workaround in place.
2. **Markdown heading prefix in Content tab** — `# ` prefix showing on Page Title.
3. **ValidateConfig startup warnings** — WARN about map.json sources for PDF workflows.
4. **Workspace header input re-renders on keystroke** — Low priority.

## What I'd Like to Work On

[Tell Claude which step to tackle next — step 9 (GitHub Actions) is the natural next one]
