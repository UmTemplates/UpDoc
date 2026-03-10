# Next Session Prompt

Copy/paste this into Claude Code to continue where we left off.

---

## Where We Are

On `develop` branch, clean. Phase A of PACKAGING_STRATEGY.md is nearly complete — first beta published and tested.

### Completed Steps (1-13)

1. **Repo transfer** — `deanleigh/UpDoc` → `UmTemplates/UpDoc`
2. **Move local folder** — to `D:\Users\deanl\source\repos\UmTemplates\UpDoc`
3. **Create `develop` branch** — develop/main model, develop is default
4. **Assets** — carrot icon SVG + PNG, NuGet readme
5. **csproj metadata** — PackageId: `Umbraco.Community.UpDoc`, MIT license, icon, readme, tags (no `umbraco-marketplace` yet)
6. **PdfPig** — DEFERRED. Custom fork `1.7.0-custom-5` works. Migration to official planned before stable.
7. **LICENSE** — MIT, repo root
8. **READMEs** — GitHub + NuGet readmes
9. **GitHub Actions** — `release.yml` (NuGet Trusted Publishing, no API key), `add-to-project.yml` (project board)
10. **Issue templates** — bug report, feature request, config
11. **Test locally** — `dotnet pack` verified clean (dev files excluded from package)
12. **First pre-release** — `0.1.0-beta` published via Trusted Publishing
13. **Test installation** — fresh UmBootstrap site, `dotnet add package --prerelease`, backoffice loads, UpDoc section renders

### Versioning Decision

Independent semver during beta (`0.x.y-beta`). Switch to Umbraco version-matching (e.g. `17.x.y`) when going stable. Rationale: allows rapid iteration without burning Umbraco version numbers.

### Next Steps

- **Step 14**: Verify NOT on Umbraco Marketplace (quick check)
- **UmBootstrap Trusted Publishing** — set up same pattern for UmBootstrap repo, retire `umbtemplates` API key (expires in 6 months)
- **PdfPig swap test** — replace custom `1.7.0-custom-5` with official, test extraction still works
- **Bug fixes** — see below

### Decisions Still Needed

- **Marketplace Category** (Phase B) — "Content Management" or "Import & Export"
- **MimeKit Pinning** — keep, remove, or conditional

### Bugs Still Open (from `planning/BUG_FIXING_PROMPT.md`)

1. **GetConfigForBlueprint merge bug (C# side)** — `WorkflowService.GetConfigForBlueprint()` returns incorrect data for non-first source types. Frontend workaround in place.
2. **Markdown heading prefix in Content tab** — `# ` prefix showing on Page Title.
3. **ValidateConfig startup warnings** — WARN about map.json sources for PDF workflows.
4. **Workspace header input re-renders on keystroke** — Low priority.

## What I'd Like to Work On

[Tell Claude which step to tackle next]
