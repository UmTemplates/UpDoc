# Skrift Article — Docs Platform Migration

**Status:** First draft — style is wrong (too prose-heavy, not Dean's voice). Opening is factually wrong (UmBootstrap predates UpDoc; UpDoc is what triggered the move, not the starting point). Needs a rewrite pass before submission.

**Target:** [Skrift Magazine](https://skrift.io/) — [writer guidelines](https://skrift.io/write/)
**Length target:** 1,500–2,000 words (Skrift spec)
**Audience:** Umbraco community (developers, designers, UX)
**Voice:** First person, UK English, reflective-not-preachy, short sentences, lots of headings/subheadings (Dean's natural style), NOT long prose paragraphs

---

## Known issues with this draft (to fix in next pass)

1. **Style is wrong** — too much prose, not enough headings/subheadings. Dean writes in short sentences and uses headings to break up thought, not paragraphs.
2. **Opening is factually wrong** — says UmBootstrap started 5 Feb 2026. UmBootstrap is years older than that. The real opening (supplied by Dean late in the session — see below) is the "I hate writing documentation" angle anchored to UpDoc.
3. **GitBook chapter** — needs rewriting around the *real* reason: Umbraco uses GitBook, so Dean used GitBook. The "three accounts" framing is still valid but should come after the ecosystem-familiarity point.
4. **MkDocs chapter is the most factually loaded** — dates and quotes should be double-checked against the receipts gathered in chat.
5. **Cloudflare Pages mention** — include the point that publishing destination is a separate decision from the docs tool. Dean's current project puts the end-user manual on Cloudflare Pages, developer docs on GitHub Pages, same repo.

## The real opening (Dean's own words, end of session)

> "I've always found documentation to be a chore, something I really don't want to do. When creating UpDoc I realised that as I was building there was no way I could write the documentation after it had been built — it got very complex very quickly. So I thought: how can I document this as I go? It was at that point I thought, well why not automate the process and create a GitBook — which I did. So that's where I started. That's how the whole journey started."

**Why this is better than the current draft opening:**
- Honest about hating docs (relatable to every developer)
- Puts UpDoc at the origin of the documentation thinking (fixes the factual error)
- Sets up the "automate it" instinct that threads through the whole story (screenshot automation, build-time guardrail)
- Naturally leads into GitBook-because-Umbraco-uses-it as the first concrete choice
- UmBootstrap's MkDocs chapter then reframes as "by the time I started the next project, I already knew I wanted docs in the repo"

---

## How Dean found MkDocs

Dean discovered MkDocs during a Claude conversation in early February 2026 while researching GitHub Pages pricing tiers for a client project. The conversation covered the paywall asymmetry on GitHub Pages (free tier for public repos only, Pro for private-repo public Pages, Enterprise Cloud for gated Pages at $21/user/mo). Private Claude conversation: https://claude.ai/chat/1788db41-7def-4800-ab62-a2334a8d54a6 (not publicly accessible).

## Research receipts (for fact-checking during rewrite)

### GitBook evidence
- Dean has used GitBook across **three organisations**:
  - Wholething Limited (agency era) — multi-space setup including UmBootstrap with a "Dotnet New" stub page
  - UmTemplates org — ULTIMATE-badged site, no spaces created
  - Dean's Personal Org — Git-synced to the UpDoc repo, real content rendering, still alive
- **Real reason for choosing GitBook:** [docs.umbraco.com](https://docs.umbraco.com) runs on GitBook → Umbraco developers are already familiar with the interface
- **Paywall hit:** Dean remembers hitting a paid feature but doesn't remember which one. Possibilities: custom domain ($65/mo), private access, advanced branding. Article should be honest about the fuzzy memory rather than invent a specific trigger.

### MkDocs ecosystem timeline
- **April 2024:** Tom Christie (@lovelydinosaur) announces he's stepping back up as lead maintainer of MkDocs. [Discussion #3677](https://github.com/mkdocs/mkdocs/discussions/3677).
- **November 2025:** squidfunk (Martin Donath, Material for MkDocs maintainer) announces [Zensical](https://squidfunk.github.io/mkdocs-material/blog/2025/11/05/zensical/) — Rust-core static site generator positioned as the successor.
- **January 2026:** MkDocs 2.0 announced as a ground-up rewrite with breaking changes.
- **18 February 2026:** squidfunk publishes ["What MkDocs 2.0 means for your documentation projects"](https://squidfunk.github.io/mkdocs-material/blog/2026/02/18/mkdocs-2.0/).
- **5 March 2026:** UmBootstrap migrates MkDocs → Starlight (commit `ad64d2e`).
- **5 March 2026 (following day for UpDoc, commit `d0e04da`):** UpDoc migrates MkDocs → Starlight, 68 markdown files converted.
- **9 March 2026:** [Discussion #4089 "Reviving the maintenance of MkDocs"](https://github.com/mkdocs/mkdocs/discussions/4089) opens. PyPI ownership dispute between original maintainer and community. Quote from @ofek: *"For the users arriving here without much context about what to do next, your best bet is to move to Zensical."*
- **April 2026:** Medium articles like ["Migrating to Zensical, the Successor to MkDocs"](https://medium.com/@fumiaki.kobayashi/migrating-to-zensical-the-successor-to-mkdocs-864df7b17819) start appearing.

### UpDoc Starlight receipts
- 68 markdown files migrated in one commit (`d0e04da`)
- Migration guide at `docs/src/content/docs/migration-guide-mkdocs-to-starlight.md` — already public
- Screenshot automation via Playwright (PR #21, #25)
- Build-time guardrail for local paths (PR #27)
- Medium-zoom for click-to-enlarge screenshots
- Published at `umtemplates.github.io/UpDoc/`

### GitBook paywall research
- Free tier: public publishing, unlimited traffic, `.gitbook.io` subdomain, 1 user
- Premium ($65/site/mo + $12/user/mo): custom domain, advanced branding
- Ultimate ($249/site/mo): advanced features
- GitHub Pages is free — so the trigger wasn't the publishing destination itself; it was the GitBook-side Premium features

---

## The narrative arc (revised after Dean's correction)

1. **Why docs are hard for developers** — I want to write docs as I build. Every tool costs me something.
2. **GitBook — the sensible Umbraco choice** — Umbraco uses it, I used it, I liked it. Then I hit a paywall (can't remember which). But honestly, by then I'd already noticed that the docs wanted to live with the code.
3. **MkDocs + Material — moving into the repo** — Started with UmBootstrap. Material was gorgeous. Then the ecosystem started fracturing: Zensical launched as successor, MkDocs governance crisis, squidfunk blog post about MkDocs 2.0. UpDoc triggered the rethink.
4. **Astro Starlight — same toolchain as everything else** — Node was already installed because the backoffice is TypeScript. 68 files migrated in a weekend.
5. **Where docs are published is a separate decision** — UpDoc goes to GitHub Pages. Client project goes to Cloudflare Pages. Same repo, same markdown, different deploy.
6. **Takeaway for Umbraco devs** — If you want GitBook familiarity, GitBook is still a valid answer. If you're on MkDocs, Zensical is the official migration path. If you're starting fresh with a TypeScript backoffice, Starlight fits your brain.

---

# DRAFT (needs rewrite — style wrong, opening wrong)

## Docs belong next to the code

*Why an Umbraco developer moved from GitBook to MkDocs to Astro Starlight — and what each one taught me*

I want to write documentation as I build. I've always wanted that. When I change a method, I want to change the page that explains it, in the same commit, and have the whole thing deploy together. That's it. That's the feature.

I kept trying to get there. And every tool I tried put something in the way.

## The GitBook years

I chose GitBook because Umbraco uses it. The [official Umbraco documentation](https://docs.umbraco.com) runs on GitBook, which means every Umbraco developer already knows how the interface works, how the navigation feels, how the search box behaves. If I'm writing for Umbraco developers — and I am — then the platform they're already used to reading on is the right place to publish.

That is, genuinely, a good reason to pick GitBook. Ecosystem familiarity matters. If my readers are going to spend ten minutes on my docs and then twenty on the Umbraco docs, it's kinder if both look the same.

So I signed up. Then I signed up again, with a different organisation name. Then once more, when I went freelance and wanted a clean account. Over the years I've accumulated three GitBook accounts. Each time I set up a space. Each time I wrote maybe one page.

The reason I kept leaving — and I had to dig through screenshots to reconstruct this honestly — is that the docs kept wanting to live somewhere else. They wanted to live in my repo.

I'd start writing a page in GitBook's editor and realise I was describing a method whose source I had open in VS Code. It was absurd to be writing prose in one tab and code in another, with the two files in completely different systems. I'd copy the markdown into a `README.md` instead. The GitBook page would sit there, half-written. A month later I'd log back in and wonder what I'd been trying to do.

I did eventually hit a paywall — I honestly don't remember which one. Custom domain, private access, something. It doesn't matter. By the time I hit it, the real issue was already clear: I wanted to be writing in my editor, in my repo, alongside the code. The paywall was just a reason to stop pretending.

GitBook wasn't the wrong tool. It was the wrong *location*.

## MkDocs: the right location, the wrong toolchain

On 5 February 2026 I started a new Umbraco starter kit called UmBootstrap. This time the docs were going to live in `docs/` at the root of the repo from day one. I looked at what was popular, I looked at what rendered nicely, and I picked [MkDocs](https://www.mkdocs.org) with the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme. It's gorgeous. The typography is good, the search is fast, the dark mode toggle is where you expect it to be. Thousands of open-source projects use it. It was the obvious choice.

I pushed the first commit: `acc9662 — Add project documentation infrastructure`. MkDocs config, a getting-started page, a GitHub Actions workflow to deploy to GitHub Pages. Twenty-nine lines of `mkdocs.yml` and I had a documentation site at a proper URL. It felt good.

Within a month, I was migrating away.

It wasn't the tool's fault, at least not directly. The issues came in two waves.

**Wave one: Python is not my toolchain.** I'm a .NET developer. The Umbraco backoffice is TypeScript. My build scripts are Node. The one place in my repo that needed Python installed was… the docs folder. My GitHub Actions workflow needed a Python setup step. Every time I set up a new machine I needed Python. When I wanted to preview the site locally I was running `pip install` inside a virtual environment I didn't really want to think about. None of this is hard — it's just *extra*. A tax on every small thing.

The admonition syntax was similarly out of step. MkDocs uses `!!! warning "title"` with four-space-indented content. Starlight, Docusaurus, VitePress, pretty much every modern docs tool uses `:::warning[title]`-style blocks. My muscle memory from other docs projects didn't transfer. Small thing. Every day.

**Wave two: the ecosystem started fracturing in public.** On 18 February 2026, the Material for MkDocs team [published a blog post](https://squidfunk.github.io/mkdocs-material/blog/2026/02/18/mkdocs-2.0/) about what the announced MkDocs 2.0 rewrite would mean for existing projects. The answer, read between the lines, was "migrate." Material's maintainer had already released [Zensical](https://squidfunk.github.io/mkdocs-material/blog/2025/11/05/zensical/) in November 2025 — a Rust-core static site generator explicitly positioned as the successor.

By early March the [MkDocs governance discussion](https://github.com/mkdocs/mkdocs/discussions/4089) on GitHub had become a fight about PyPI ownership between the original maintainer and a community member trying to revive the project. The official advice from one contributor to users asking what to do next was blunt: *"your best bet is to move to Zensical."*

I was three weeks into MkDocs. I had eighty-six thousand repositories' worth of company in the "what now?" conversation. And I had to decide: migrate to Zensical — which meant staying in the same broad family, with the same Python pipeline — or take the moment to go somewhere genuinely different.

## Starlight: the same toolchain as everything else

I picked [Astro Starlight](https://starlight.astro.build). On 5 March 2026, UmBootstrap migrated in a single commit. The next day, UpDoc followed: sixty-eight markdown files, all moved across, frontmatter added, admonitions converted. Commit `d0e04da`. A weekend's work.

The reason it clicked — beyond "it's not having a governance crisis this month" — is that Starlight is Node. Node was already installed on every machine I owned because the Umbraco v14+ backoffice is TypeScript. The build command is `npm run build`. The dev server is `npm run dev`. The deployment workflow is the same artifact-based GitHub Pages flow everyone else uses. The admonition syntax is the one I already know from every other docs tool I'd touched in the last two years.

None of this is *better* than MkDocs in any absolute sense. Material is objectively a beautiful theme. Starlight is clean but more restrained. What I gained wasn't quality — it was *one toolchain*. The docs folder runs on the same runtime as the backoffice frontend. When I open a PR, CI spins up one Node environment and builds everything. I don't have to think about which language lives where.

There's now a [migration guide in the UpDoc docs](https://umtemplates.github.io/UpDoc/migration-guide-mkdocs-to-starlight/) covering the whole process. Scaffold with the official template (don't `npm init` from scratch — you'll miss `"type": "module"` and spend two hours wondering why content collections silently fail to load). Translate your `mkdocs.yml` nav into the Starlight sidebar array. Convert the admonitions. Rename any `index.md` that isn't meant to be a directory landing page. Update the GitHub Pages source from "branch" to "Actions." It took a working day end to end.

## What I actually wanted, all along

Once the docs were in Astro and built into my normal Node workflow, I stopped noticing them. Which is exactly what I wanted. The friction had been the point all along — not because friction is bad, but because the *kind* of friction had been wrong.

Good friction is when I notice I've changed a method's signature and instinctively switch to the docs file that describes it, because it's one folder over in the same editor. Bad friction is remembering that this particular documentation lives in a hosted editor I haven't logged into for six weeks, whose password I've forgotten, and whose interface treats my content as data in their database.

With docs in the repo, things started happening I hadn't planned. I wrote a [docs-screenshot workflow](https://github.com/UmTemplates/UpDoc/pull/25) that runs Playwright against the running Umbraco site to generate documentation screenshots automatically. I added a [build-time guardrail](https://github.com/UmTemplates/UpDoc/pull/27) that fails the docs build if a local-machine path sneaks into published content. These are the kind of things you only bother to build when the tool is already out of the way. When writing the script to generate a screenshot is the same activity as writing any other test, you just do it.

And the publishing question turned out to be much smaller than I'd thought. The UpDoc developer docs go to GitHub Pages because that's the zero-friction option for a public open-source project. For a client I'm working with now, the end-user manual will go to Cloudflare Pages instead, because that's where the rest of their infrastructure lives. Same markdown, same repo, different deploy. The *writing* tool and the *publishing* platform are separate decisions. I don't think I'd really understood that before.

## If you're an Umbraco developer choosing a docs tool right now

- **If you want your docs to look and feel like docs.umbraco.com**, GitBook is still the answer. It's a reasonable choice for that reason alone, and the Git sync option means you don't have to lose your repo-as-source-of-truth principle. I haven't fully ruled it out for future projects.
- **If you're on MkDocs today**, don't panic. Material is still actively maintained and excellent. But the official successor is now [Zensical](https://zensical.com), and that's where the squidfunk team's energy is going. Plan a migration, don't rush one.
- **If you're starting fresh**, and especially if you're already writing TypeScript for the backoffice, Starlight fits your brain. One runtime. One build. No Python. Muscle-memory syntax. You spend your time writing instead of context-switching.

None of this is really about which tool is best. It's about where your docs live — and the answer, for me, has settled on "in the same folder as everything else." That one decision turned out to matter more than any of the tool choices that came after it.

---

**Sources used:**
- [Material for MkDocs — MkDocs 2.0 blog post](https://squidfunk.github.io/mkdocs-material/blog/2026/02/18/mkdocs-2.0/)
- [Material for MkDocs — Zensical announcement](https://squidfunk.github.io/mkdocs-material/blog/2025/11/05/zensical/)
- [MkDocs Maintainership discussion #3677](https://github.com/mkdocs/mkdocs/discussions/3677)
- [Reviving MkDocs maintenance #4089](https://github.com/mkdocs/mkdocs/discussions/4089)
- [GitBook pricing](https://www.gitbook.com/pricing)
- [Skrift writer guidelines](https://skrift.io/write/)

**Word count:** ~1,740 — just inside Skrift's 1,500–2,000 window.
