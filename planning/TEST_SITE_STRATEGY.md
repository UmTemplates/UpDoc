# Test site strategy

Decided 3 August 2026. Supersedes the premise behind #110 and most of #116.

## The problem

UpDoc's test site has drifted a long way from Tailored Travel: 58 content types and 32
data types behind, per the #110 audit. Bringing it into line is slow, archaeological work,
and it will drift again the moment the client site moves on.

Meanwhile Tailored Travel depends heavily on UpDoc, is not yet live, and has to keep
working once it is.

## The constraint that decides it

Tailored Travel is a real client site, not a laboratory. Experimenting against it risks
breaking something a client depends on. Yet it is the only place UpDoc's real behaviour can
be observed.

Any UpDoc change made without testing against the real site could break Tailored Travel
before launch, or after. That risk is present now, not hypothetical.

## Two jobs, one site, and they conflict

A test site is being asked to do two incompatible things.

**Job one: prove UpDoc works for Tailored Travel**

- Needs realistic, complex, opinionated structures
- In practice that means a copy of Tailored Travel

**Job two: be a fixture anyone can clone and run**

- Needs to be inert, unopinionated, self-contained
- Its own test PDFs and sample content, nothing client-specific
- Small enough to live in git properly

One site cannot do both well. The current test site feels wrong because it is trying to be
both, and succeeding at neither.

## Direction

### Now: bring in a copy of Tailored Travel

Tracked in #117.

- A local working mirror, not a clonable project
- Media and the SQLite database stay out of git, mirroring what the source repo already does
- Refresh by re-copying, not by pulling

Cheap to try, cheap to abandon. The deployment risks (`deploy.yml`, `.env`) live at the
live repo's root, outside the folder being copied, so they are excluded by construction
rather than by remembering to delete them.

### Later: build a genuine test fixture

- Purpose-built rather than derived from a client site
- Its own test PDFs and sample content
- Built in conjunction with **UmBootstrap** rather than a complex bespoke site
- Inert and unopinionated, so a collaborator could clone and run it

### Kept in view: an un-UpDoc'd experimental copy

A second copy of Tailored Travel without UpDoc installed, purely for experiments. Try
things there, bring back what works. Keeps risky work away from anything a client touches.

Not needed yet. Recorded so it is not re-invented later.

## What this settles

- The existing `UpDoc.TestSite` is **explicitly Tailored Travel-leaning**, not
  general-purpose. That is now a stated intent rather than accidental drift.
- The general-purpose fixture is a **separate, later** piece of work on UmBootstrap.
- Schema alignment (#110) is largely **redundant**. It existed to make the test site
  resemble something we will now have a real copy of.
- `UpDoc.TestSite` is not retired yet. The E2E suite still assumes it: hardcoded protected
  node IDs, "Home" as root, reserved sample content. Both exist for a while.

## Consequences for open issues

| Issue | Effect |
|---|---|
| #110 (schema audit) | Premise weakened. Alignment only matters where UpDoc maps. Keep as reference, do not work through it wholesale. |
| #116 (import compositions) | `tourBrochure` already done and still useful, it unblocks #109. The remaining renames and `tourDestinations` are no longer urgent. |
| #117 (copy Tailored Travel) | Now the active direction. |
| #109 (map source to media picker) | Unaffected and unblocked. |

## Note on collaborators

There are none today, and that is why "not clonable" costs nothing right now. It becomes a
real constraint the moment anyone else works on UpDoc, and that is what the UmBootstrap
fixture is for. Nobody outside should need access to a client site to contribute.
