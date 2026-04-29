# Article notes — "What's up, docs?"

Working notes for the Skrift article at `docs/src/content/docs/article-whats-up-documentation/index.md`.

This is a living scratch pad, not the article itself. Once the article is published, archive or delete.

---

## Established timeline

### Pre-holiday groundwork

- **Late Nov – early Dec 2025** — `xDotNetTemplates/UmBootstrap-17-Test-01` set up. Files dated 25 Nov to 1 Dec. Not a git repo. Dean had an Umbraco 17 / UmBootstrap test environment ready before Christmas. The stack wasn't the variable when AI experiments began. Only AI was new.

### Christmas holiday (two weeks)

- **Fri 2 Jan 2026** — built UmBootstrap backoffice MCP server in one day. Posted to MVP Slack at 09:27. Phil Whittaker replied 14:59 pointing at his early Umbraco Claude skills repo (`hifi-phil/Umbraco_CC_Backoffice_Skills`), now official at `umbraco/Umbraco-CMS-Backoffice-Skills`. Reasoning: skills are better for progressive disclosure than MCP.
- **Sat 3 – Sun 4 Jan** — weekend. Likely playing with the skills Phil sent.

### Back to work

- **Mon 5 Jan** — back to work after holiday. First few days probably catch-up / client admin (no commits found in this window).
- **Thu 8 Jan** — fresh UmBootstrap repo: `xDotNetTemplates/UmBootstrap-2026-01-08`. First commit.
- **Fri 9 Jan** — *"Installed and tested MCP"* in this repo. Built features and content with the Umbraco MCP server: page title, 3-6-3 layout, RTE, multiple content updates.
- **Sat 10 Jan** — *"Removed global install of mcp"*, *"Uninstalled mcp again"*, *"mcp.json — Empty settings.json — Empty"*. Two-day MCP experiment abandoned. This is the "ghost pages on the client's old site" experience referenced in the 26 Jan message to Phil.

### Tailored Travel prototype

- **Wed 14 Jan** — `Tailored Travel Prototypes/tailored-travel-prototype-01` starts. Project files, `.gitattributes`, `.gitignore`, test content. Built without MCP this time.
- **Thu 15 Jan** — real client pages: Suffolk & Constable Country, Group Tours added, UK and France image batches.
- **Mon 19 Jan** — slideshow improvements. Continued building the prototype.
- *(Around this point: client conversation that revealed the actual workflow was copy-pasting sections from PDF brochures into the website. MCP wasn't the right fit because the source content lives in PDFs, not on a web page to scrape.)*

### Trying to extend the backoffice

- **Thu 22 Jan** — `Tailored Travel Prototypes/UmBootstrap-2026-01-22` starts. Commit messages tell the struggle in real time: *"testing a basic dashboard"* → *"Still trying to make a context menu item"* → *"Tried again with entity action"*. Lines up with the Phil message: *"after quite a few failures, it seemed to work out what was going wrong."*
- **Fri 23 Jan** — *"Entity Create Option Action"* (apparent progress) and *"no idea"* (still struggling). Something clicked overnight.

### UpDoc

- **Sat 24 Jan** — first UpDoc commits. UmBootstrap site set up, first app step, **`docs/` folder added on the same day** (commit three).
- **Sun 25 Jan** — per-file documentation, SUMMARY.md for GitBook navigation, CLAUDE.md with documentation sync instructions.
- **Mon 26 Jan** — message to Phil: PDF extraction working end-to-end, "I have Claude writing a GitBook as I go and it's even including where I got stuck." Discussed shift from MCP to skills, v14 vs v17 confusion, using Umbraco backoffice repo blueprints as worked examples.

### What this timeline shows for the article

- The whole arc from "first AI experiment" to "working UpDoc with auto-generated docs" is **24 days**, calendar time. Active build days are far fewer.
- The MCP-to-skills pivot wasn't a one-line decision. It was a two-day experiment (8-10 Jan) followed by a real-client conversation, then a switch of approach.
- Documentation appeared from day three of UpDoc (commit-history fact, not memory). Documenting from day one is in the repo.

## Source material

### Phil Slack thread, 2 Jan

Dean 09:27:
> Coding for fun holiday project... I created an Umbraco BackOffice Extension MCP server in UmBootstrap with current Backoffice tools e.g. create-property-editor, create-dashboard. It uses Lit and Typescript to create the web component, bundles it with Vite then auto-registers it in the manifest.
> Tested it today and it 'just works' so I would assume useful for anyone struggling to get started with extending the new backoffice.
> If anyone want to improve it in an Umbracollab session I think would would be both enjoyable and useful — although I am not sure how far to take it as I am sure @Phil Whittaker and the team would be working on this anyway?

Phil 14:59:
> Hey Dean. Happy New Year to you too.
> I'm sharing this with a few people as it's not finished yet.
> https://github.com/hifi-phil/Umbraco_CC_Backoffice_Skills
> I am using Claude Skills for this — https://code.claude.com/docs/en/skills
> Instead of mcp as should tend to be better for progressive disclosure to the LLM
> Skills are starting to become a standard and are supported of various degrees by OpenAI and Google Gemini
> Happy to have a chat about both approaches if you would like.
> I didn't think we will move away from MCP for the developer MCP and we will create an editor MCP too. I just thi[nk]...

Dean 15:02:
> Amazing! Thanks @Phil Whittaker will start having a play next week.

### Phil Slack message, 26 Jan

Dean to Phil:
> Just wanted to update you where I am with latest AI stuff.
> The MCP Server seemed to make pages from my client's old site reasonably well but now and again hiccupped creating 'ghost' pages that could only be removed by directly editing the database. I'm sure if I made all the instructions even more explicit it would be ok.
> However, after speaking with the client I realised this doesn't help them much going forwards as their workflow is to copy and paste sections from their PDF brochures into the website.
> I did offer to allow them to create the pages in the CMS and then export them as PDF but the layout of the PDFs can differ considerably, requires the graphic designer to change them, even though the content is pretty much always constant.
> I thought this was a good opportunity to try out your new Back Office Claude Skills, so I got myself a Claude Code licence and gave it a go.
> My aim is to allow my client to create a new page from a PDF that exists in the media library. I am aware of course they could do it by uploading it at the time, but I think this starts to add too many steps and room for error.
> So I tried with the Claude skills on their own and was not having much success and for some reason Claude kept using version 14 code. Some things that are required had changed in 17.
> I went back to your instructions and followed your advice of installing a back office repo which I then used the create blueprint workflow as an example for what I wanted to do. After quite a few failures, it seemed to work out what was going wrong. Eventually I was able to make a button or a menu item.
> From that point on, things became a bit easier. And I am now at the point where I can choose a PDF and extract the content and hopefully over the next few days I will get it to create a new page with the content from the PDF.

Dean to Phil (same day):
> I have Claude writing a GitBook as I go and it's even including where I got stuck.

### Screenshots

- **2 Jan 09:27 Slack post** (UmBootstrap backoffice MCP announcement)
- **2 Jan 09:01 desktop screenshot** — four-pane: Umbraco backoffice with `test-text` and `mcp-color-picker` properties, frontend rendering them, VS Code with two MCP servers installed (Astro docs + umbootstrap), Visual Studio with the project open
- **26 Jan GitBook screenshot** — auto-generated docs site with `create-from-pdf-action.ts` page, including TODO and stuck moments

Decision still open: do these go into the article, or into a future "how I built UpDoc" piece?

## Structural questions still open

- **One article or two?** Current draft tries to do "how I learned AI" + "how I document AI projects." The docs loop is the real subject. The AI-build journey could be a separate Skrift article or blog post on UmBootstrap.
- **Where does "Busman's holiday" land?** Currently at the top. Could be cut to a single sentence, or expanded with the screenshot. Lean is: keep it brief, the article is about the docs loop.
- **The "real client problem" beat.** The PDF brochure story is the *why* for UpDoc. Without it, "I built UpDoc" sounds arbitrary. With it, the docs loop has real stakes (a real client, a real workflow). Probably belongs in the article.
- **The "documenting from day one" beat.** The 26 Jan message to Phil ("Claude writing a GitBook as I go, even including where I got stuck") plus the 24-25 Jan commit history (docs folder on day one, CLAUDE.md sync instructions on day two) is the seed of the loop. This is probably the article's pivot point.
- **MkDocs screenshots.** Dean may have screenshots of the old MkDocs site on social media. If found, could illustrate the GitBook → MkDocs → Starlight journey. Otherwise the journey can stay text-only.

## Pieces drafted but not placed

- "On 26 January I messaged Phil: *I have Claude writing a GitBook as I go and it's even including where I got stuck.*"
- "Within a few weeks UpDoc was real enough to need real documentation."
- "The speed of AI made docs-from-day-one not just possible, but necessary."

## Bits to consider keeping

- The opening blockquote (*"The job isn't done until the documentation is done"* — anon).
- The bullet list of why docs never get written.
- The GitBook → MkDocs → Starlight tool-comparison middle.
- The Bluesky shout-out and the recommendations from the community.
- The five-step loop and the Mermaid diagram.
- The "Why this works" three-jobs-at-once framing.
- The "What it unlocked" section (medium-zoom, Mermaid, build-time guardrail).
- The closing recommendations for Umbraco developers.

## Bits to revisit or cut

- The current "All in on AI" opening conflates holiday learning with January commitment. If the article keeps the AI-journey beats, they need separating cleanly. If the article cuts them, "All in on AI" can probably go entirely.
- The "halfway in I realised the obvious" line in the current draft is wrong on the timeline. The realisation was on day one, not halfway in.

---

## Format constraints (Skrift)

Skrift magazine accepts only basic structure: headings, paragraphs, blockquotes, and images. No call-out boxes, no fancy components. Anything richer needs to be expressed inside those four primitives. The current Astro Starlight version of the article can be richer for our own publishing, but the Skrift submission has to flatten down.

## Title and metadata (decided 27 Apr 2026)

- Sidebar title (frontmatter): `"SKRIFT ARTICLE: Automating documentation"`
- Article title in body: `Document Everything Everywhere All At Once`
- Description (in body, immediately under title): `How to automatically generate documentation from a single source of truth that is written once and published everywhere.`
- The existing H2 *"Everything everywhere all at once"* now duplicates the article title. Needs renaming. To revisit.

## Busman's holiday — Dean's outline (27 Apr 2026)

The actual sequence of events during the two-week holiday, in Dean's own words:

1. **First experiment was Astro automation.** Built an Astro MCP server. Just simple instructions: "create a new page with the following content," "edit an existing page with the following content."
2. **Played with the existing Umbraco MCP server.** Interesting, but unreliable past a page or two.
3. **Real client project lined up for the New Year** — needed content brought in from PDFs and an old website on Umbraco 17.
4. **By end of holiday: built a custom Umbraco MCP server** that could create *parts of the backoffice* (extensions), using code examples learned at the official Umbraco "extending the backoffice" course.
5. **Posted about it on MVP Slack.** Phil Whittaker replied with links to the new Claude skills. Played with those over the weekend.

The arc of the holiday: started with MCP for content (Astro and Umbraco), ended with a personal MCP for creating Umbraco backoffice extensions in the new format (Lit + TypeScript + Vite).

**Came back to work in January** and began the client project, simultaneously experimenting with extracting content from PDFs and old websites into Umbraco. UpDoc the named repo started 24 January, but the work — extracting content into Umbraco — had been continuous since 2 January under different repo names.

## Client correspondence — 14 Jan 2026 email

Sent to client (call him "John") on 14 January, nine days after returning to work. Key bullets verbatim:

**Last week (5–10 Jan):**
- UmBootstrap Starter kit upgraded to Umbraco 17.1.0 (released the previous week)
- Whilst we may not use UmBootstrap directly, this would be the basis for prototyping
- Feasibility testing — pleased with the result so far
- Reviewed historical estimate of bringing the old site over by mapping database entries
- Previous estimate: ~3 weeks just to match all the fields up
- Decided to explore the AI route instead
- Set up an AI environment for copying content from the existing site
- Initial tests "worked to a degree for creating new pages from templates"

**Current week (11–14 Jan):**
- Continued testing AI for content migration with varying degrees of quality
- Had a meeting with Umbraco's AI manager to gain insights into best practice
- *"Whilst it is possible to bring the content over, the set up time may still not be as sufficient as bringing the content over manually"*
- *"Also the results had been quite hit and miss and when they miss, cleaning up the mess afterwards can be very time consuming"*
- Decided to test bringing content over manually
- Created additional test sites for manual migration — *"exceptionally quick"*

**Conclusion to client:**
> Whichever of the options we choose for bringing the content in is not holding up progress and it may be the case that we do the design work with content brought over manually and revisit AI later in the project.
> There are many people in the Umbraco community working on improving content manipulation with AI — things are moving fast so even within a few months it may be a lot more reliable.

### Why this email matters for the article

- Dated proof Dean tried the AI-content-migration route honestly and stepped away when it wasn't ready
- Shows the *pivot point*: AI couldn't reliably do content migration, but the *idea* of using AI was right. The pivot was from "AI moves the existing content" to "AI helps build the tools to handle the new content workflow"
- The mention of "Umbraco's AI manager" (Phil) shows community involvement was part of the journey, not a postscript
- The bullets land naturally as a Skrift-friendly paragraph or blockquote excerpt
- Could be excerpted into the article with light redaction (no client name, drop the greeting)

## GitBook → MkDocs Bluesky thread (27 Jan 2026 — Feb 2026)

**Dean, 27 Jan 2026, 09:44:**
> So I want to share docs for some of my open source projects and @gitbook.bsky.social want $65 / month / site, unless I have that wrong? Is anyone using MkDocs + @github.com Pages and can recommend that route? Perhaps one for your universe @bell.bz?

**Dean, follow-up post (about a month later):**
> Thanks everyone (especially @bell.bz for the shout out)
>
> I went with @github.com pages using MKDocs and Material for MkDocs
>
> It was incredibly easy to set up and it's great having my docs in the repo.
>
> Will defo look at Starlight as well though.
>
> Here's how it turned out: deanleigh.github.io/UpDoc/

### Replies in the thread (recommendations from the community)

- **Stuart Robson** (@sturobson.com) — *"what's UpDoc?"* (curiosity, not a recommendation, but a nice human moment)
- **Stefan Zweifel** (@stefanzweifel.dev) — VitePress + GitHub Pages: *"super easy for me. Was able to keep writing docs in Markdown and able to inject even some custom JavaScript component to render an OpenAPI spec."*
- **Owain Williams** (@owain.codes) — GitHub Wiki, or self-hosted on a subdomain
- **Moth** (@timothy.is) — Fumadocs + Vercel: *"pretty easy to setup, deploy free"*
- **Abhishek Rathore** (@abhirathore.bsky.social) — confirmed GitBook legacy accounts have free custom domain. New sites uses Hugo + docsy + Netlify: *"Not the easiest but Hugo developer experience is great"*
- **Niklaas** (@niklaas.bsky.social) — 11ty: *"because then you get to decide how much JS you want in the final build"*

### Why this matters for the article

- This is the **GitBook → MkDocs pivot in dated public form**. *"GitBook want $65 / month / site"* explains the move better than any prose can. This is the pricing wall, in your own words, on a dated post
- *"Will defo look at Starlight as well though"* foreshadows the next pivot. Beautiful narrative texture
- Andy Bell appears in **both** Bluesky threads (this one and the later Starlight one). The article already credits him for the second amplification. Worth noting he was also pinged in the first
- Some of the recommenders here (Stefan Zweifel, Moth, Abhishek Rathore, Owain Williams) reappear in the **second** Bluesky shout-out for Starlight. The current article's bulleted list of recommendations may already include some or all of them. Worth cross-checking which post each recommendation came from
- **Possible action**: the article currently has *one* community-recommendations section (around line 110). It might be more honest to acknowledge that the recommendations came across *two* community moments, separated by the MkDocs middle stage. Or condense both into the existing list with a note that the first batch came earlier

## MkDocs → Starlight pivot — 3 April 2026 post

From a Linen-archived Slack or Discord, posted **3 April 2026 at 9:12 PM**:

> I just moved my #UpDoc docs from MKDocs and Material for MKDocs to @astro.build and Starlight.
> It took 30 minutes to convert and looks amazing.
> I'm really loving automatically generated Documentation published to @github.com pages in the source repo.
> https://deanleigh.github.io/UpDoc/

### Why this matters for the article

- *"30 minutes to convert"* is a concrete fact worth keeping. The article currently says *"Sixty-eight markdown files migrated in one weekend"* — both honest, both true, supporting each other (30 mins for the framework swap, weekend for prose and config polish)
- Confirms the move happened on or just before 3 April. Gives the migration commit (`d0e04da`) a public-facing partner
- *"automatically generated Documentation published to @github.com pages in the source repo"* is the pitch of the article in one sentence. The post predates this article and is essentially its tagline

## Three dated pivot posts — summary

The article's tool-comparison middle (GitBook → MkDocs → Starlight) is supported by three dated public posts in Dean's own voice:

1. **27 Jan 2026** — *"GitBook want $65 / month / site... Is anyone using MkDocs + GitHub Pages?"* (Bluesky)
2. **~Late Feb 2026** — *"I went with @github.com pages using MKDocs and Material for MkDocs... Will defo look at Starlight as well though"* (Bluesky, follow-up)
3. **3 April 2026** — *"I just moved my UpDoc docs from MkDocs to Starlight. It took 30 minutes."* (Linen-archived Slack/Discord)

These three posts together tell the GitBook → MkDocs → Starlight journey across roughly ten weeks, in dated public artefacts.

## Decision: no MkDocs screenshot

Searched Discord, Slack, and Bluesky. No usable screenshot of the MkDocs Material version of UpDoc's docs found. The MkDocs subsection of the article will stay text-only. The journey is well-supported by the three Bluesky/Linen posts above and the prose itself. The two bookend hosts (GitBook and Starlight) get screenshots; MkDocs remains the deliberately compressed middle stage.

## Possible new article spine (27 Apr 2026)

After the morning's discussion, the strongest spine looks like:

1. **Opening** — docs are a chore, the blockquote, why they never get written
2. **Busman's holiday** — short. Astro MCP, Umbraco MCP, your own backoffice MCP, Phil's reply pointing to skills
3. **Back to work, the AI-content-migration experiment** — referencing the 14 Jan email. Honest about what worked and what didn't
4. **The pivot** — moved from "AI migrates content" to "AI builds the tooling around the content workflow." UpDoc was born from this pivot
5. **Documenting from day one** — the 24-26 Jan window: docs folder on day one, CLAUDE.md sync instructions on day two, GitBook auto-generating with stuck moments by day three
6. **The docs problem at scale** — once UpDoc grew, the day-one habit needed to be a system. Tried GitBook → MkDocs → Starlight
7. **The loop** — Playwright + planning docs + screenshots
8. **Why it works** — three jobs from one artefact
9. **What it unlocked** — Mermaid, medium-zoom, build-time guardrails
10. **Recommendations**

This puts the docs loop where it belongs: as the *answer* to a real problem the article has set up, not a tool announcement at the top.
