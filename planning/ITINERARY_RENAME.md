# Plan: Rename the Itinerary element type to match Tailored Travel

Issue: #111. Blocks #110.

## The problem

The test site's itinerary element type is misspelled, in both its name and its alias,
and it carries a different key from the equivalent type on Tailored Travel.

| | Test site | Tailored Travel |
|---|---|---|
| Alias | `featureRichTextEditorItinery` | `featureRichTextEditorItinerary` |
| Name | Rich Text Editor - Itinery | Rich Text Editor - Itinerary |
| Key | `365fd365-6ec4-4fbb-9434-1df366aa77f8` | `837beecf-4239-4b3d-b683-1d611af3da2e` |

## Why the key matters here

The audit for #110 found that **all 61 content types shared between the two sites have
identical keys**. The test site was built from Tailored Travel's uSync export and keys
were preserved throughout.

The Itinerary type is the single exception. It is not one divergence among many, it is
the only one.

That changes the decision. Keeping the wrong key would leave a permanent, isolated break
in an otherwise complete alignment. Adopting Tailored Travel's key restores it.

Decision: **adopt Tailored Travel's key**. This is option B in #111.

## What references the type

21 occurrences of the key across 20 files, plus 4 occurrences of the alias.

### By key (`365fd365-...`)

| Area | Files | Occurrences |
|---|---|---|
| `uSync/v17/ContentTypes/` | 1 | 1 |
| `uSync/v17/DataTypes/` | 2 | 2 |
| `uSync/v17/Blueprints/` | 2 | 2 |
| `uSync/v17/Content/` | 10 | 10 |
| `updoc/workflows/` | 5 | 6 |

The two DataTypes are `BlockGridGroupTour.config` and `BlockGridTailoredTour.config`,
where the key appears as `contentElementTypeKey`. That is what binds block instances in
content to the element type.

### By alias (`featureRichTextEditorItinery`)

The element type definition, plus three UpDoc workflow `destination.json` files.

Note the workflow `map.json` files reference the key only, not the alias.

## Approach

A file-level find and replace across the uSync and UpDoc config, done in one commit, then
a single uSync import.

This is deliberately **not** a backoffice content migration. Copying block content into a
temporary property and back, as considered in discussion, would work, but it is manual
across 10 content nodes and 2 blueprints, and that manual step is where the pain came
from when this was fixed on Tailored Travel.

Because every reference is a plain GUID string in a text file, replacing them all at once
keeps the graph internally consistent at every point. Nothing is ever orphaned, because
nothing is ever half-renamed.

## Steps

- [ ] **1. Commit a clean baseline.** `uSync/v17/` and `updoc/` committed and pushed
      before any edit, so revert is a single `git checkout`.

- [ ] **2. Stop the site.** Dean does this. uSync reads and writes these files; editing
      them under a running site risks a partial read.

- [ ] **3. Rename the element type definition.**
      In `uSync/v17/ContentTypes/featurerichtexteditoritinery.config`:
      - `Key` → `837beecf-4239-4b3d-b683-1d611af3da2e`
      - `Alias` → `featureRichTextEditorItinerary`
      - `<Name>` → `Rich Text Editor - Itinerary`

- [ ] **4. Rename the file itself** to `featurerichtexteditoritinerary.config`, matching
      uSync's naming convention for the corrected alias.

- [ ] **5. Replace the key everywhere else.** All remaining occurrences of
      `365fd365-6ec4-4fbb-9434-1df366aa77f8` → `837beecf-4239-4b3d-b683-1d611af3da2e`
      across `uSync/v17/DataTypes/`, `Blueprints/`, `Content/` and `updoc/workflows/`.

- [ ] **6. Replace the alias in UpDoc workflow configs.** The three `destination.json`
      files referencing `featureRichTextEditorItinery`.

- [ ] **7. Verify no occurrences remain.** `grep -r` for both the old key and the old
      alias across the whole test site. Expect zero.

- [ ] **8. Verify the counts moved.** 21 occurrences of the new key, 4 of the new alias,
      in the same files as before.

- [ ] **9. Commit the rename** as a single atomic change.

- [ ] **10. Dean runs the site and performs a uSync import.**

- [ ] **11. Verify in the backoffice** (see below).

- [ ] **12. Run the E2E specs** (see below).

## Verification

Schema:

- [ ] The element type appears as **Rich Text Editor - Itinerary** in Settings
- [ ] No orphaned **Itinery** type remains

Content, the part that matters most:

- [ ] Every existing tour node still renders its itinerary block with content intact.
      Check at least Istanbul, Tuscany and Kent.
- [ ] Both blueprints still produce a working itinerary block when used

UpDoc:

- [ ] The `tailoredTourPdf` workflow still maps into the itinerary
- [ ] The `groupTourWebPage` workflow still maps into the itinerary
- [ ] No orphaned-block warnings in the Destination tab

Automated:

- [ ] `blockkey-reconciliation.spec.ts` passes
- [ ] `create-from-source.spec.ts` passes

## Risks

**Block data is keyed, not aliased.** If any occurrence of the old key is missed, blocks
referencing it become orphaned and their content stops rendering. Step 7 exists to catch
exactly this, and must be done before the import rather than after.

**uSync may treat the change as a new type.** If the import creates a second element type
instead of updating the existing one, stop and revert rather than trying to reconcile the
two in the backoffice.

**Content is sample data but not disposable.** It is a small set of tour pages, but they
are the fixtures the E2E specs depend on. The baseline commit in step 1 is the safety net.

## Not covered here

The remaining #110 gaps: 58 missing content types, 32 missing data types, the
`tourProperties` bundling divergence, and the 8 shared types with differing property sets.
Each of those is separate work.
