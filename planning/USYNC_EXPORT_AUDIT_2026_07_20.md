# uSync clean export audit — 20 July 2026

Forensic examination of every change produced by `Export (Clean)` after
upgrading Umbraco 17.2.2 → 17.5.3 and uSync 17.0.4 → 17.3.6.

**Verdict: no data loss. One real serialisation change, cosmetic in effect but
worth acting on.**

---

## Summary

| | Count |
|---|---|
| Files deleted | 24 |
| Files modified | 55 |
| Files with unexplained changes | **0** |
| Content lost | **none** |

Five folders came back **byte-identical** — DataTypes, Languages, MemberTypes,
RelationTypes, Templates. Same MD5 before and after.

---

## Finding 1 — `"Layout"` became `"layout"` (the only format change)

128 occurrences across Content and Blueprints:

```diff
-  "Layout": {}
+  "layout": {}
```

A JSON property key inside block grid and RTE values changed case. `usync.config`
still declares `format="10.7.0"`, so uSync's own format version did not move —
the change comes from Umbraco's serialiser, not uSync.

### It affects UpDoc's code

`src/UpDoc/wwwroot/App_Plugins/UpDoc/src/transforms.ts:66`:

```typescript
export function buildRteValue(htmlContent: string) {
	return {
		blocks: {
			contentData: [],
			settingsData: [],
			expose: [],
			Layout: {},        // <-- capital L
		},
		markup: htmlContent,
	};
}
```

### Effect: none, today

Verified by counting the exported files after content UpDoc created **on
17.5.3** was written:

| | Count |
|---|---|
| `"layout"` lowercase | 128 |
| `"Layout"` uppercase | **0** |

Umbraco normalises the casing on write. UpDoc sends `Layout`, Umbraco stores
`layout`, the content renders correctly. Both of today's imports produced output
byte-identical to the pre-upgrade known-good.

### Why it should still be changed

It works because Umbraco's deserialiser is case-tolerant. That is not a
guarantee. A future version that tightens JSON binding would silently drop the
layout object, and the failure would be quiet rather than loud — the block would
lose its layout without erroring.

Changing `Layout` to `layout` in `transforms.ts` costs one character and removes
the dependency on tolerant parsing.

**Raised as a follow-up issue. Not fixed in the upgrade branch.**

---

## Finding 2 — 24 deletions, every one verified

### Content (9 files) — all tombstones

Every deleted Content file was an `<Empty>` marker, not real content:

| File | Marker |
|---|---|
| `.config` (nameless) | `Change="Rename"`, Alias `[]` |
| `5-days-from-979` | `Change="Delete"` |
| `historic-houses-and-heritage-of-suffolk` | `Change="Delete"` |
| `killarney-the-ring-of-kerry` | `Change="Delete"` |
| `northern-ireland-the-titanic-experience-and-derry` | `Change="Delete"` |
| `surrey-heath-dfas-presents` | `Change="Delete"` |
| `the-art-and-history-of-dresden…` | `Change="Delete"` |
| `test-tailored-tour` | `Change="Delete"` |
| `tailored-tours-blueprint`, `updoc` | `Change="Rename"` |

These are records of content already deleted or renamed. Clearing them is the
point of a clean export.

### ContentTypes (5 files) — stale names for renamed element types

Checked each key against the live Umbraco instance:

| Deleted file | Key | Live status |
|---|---|---|
| `featurepagetitledescription1` | `a00f052f…` | **Exists**, renamed to `featurePageOrganisers` |
| `featurerichtexteditor1` | `2d9b0603…` | **Exists**, renamed to `featureRichTextEditorSights` |
| `featurerichtexteditorfeatures1` | `ed46ae0f…` | **404 — does not exist** |
| `featurerichtexteditors` | `ed46ae0f…` | same dead key |
| `featurerichtexteditorsig` | `ed46ae0f…` | same dead key |

The first two have current files present under their new names
(`featurepageorganisers.config`, `featurerichtexteditorsights.config`). The last
three were duplicate files for one element type that no longer exists at all.

### Blueprints (4 files) — one rename, three stale

| Deleted | Key | Fate |
|---|---|---|
| `tailored-tour-blueprint_dgge0x2j` | `5f4d8c19…` | **Renamed** to `tailored-tour-blueprint.config` |
| `group-tour` | `a6e0e5b8…` | Stale |
| `tailored-tour` | `15d1cb96…` | Stale |
| `tailored-tour-blueprint-template` | `4887ad29…` | Stale |

**Both blueprints UpDoc depends on survive**, keys matching the workflow configs
exactly:

| Workflow | `blueprintId` | Present in |
|---|---|---|
| `groupTourWebPage` | `f426ea83-619e-4811-9b8c-1baf57c0c2d1` | `group-tour-blueprint.config` |
| `tailoredTourPdf` | `5f4d8c19-3c89-48e6-9a53-baaac0ce8fa6` | `tailored-tour-blueprint.config` |

Content verified across the rename — 20/20 contentKeys, 18/18 contentTypeKeys,
4/4 markup blocks. Diffing the old file against the new with `Layout` case
normalised produces **no differences at all**.

### Media (5 files) — deleted media

`updoc-test-01/02/03.pdf`, `ttm2492-bookham-madrid-toledo-segovialo.pdf`,
`the-arts-society-winchester`. Spot-checked two keys against the live instance:
both return **404**. The media no longer exists.

Media had **zero modifications** — deletions only.

---

## Finding 3 — MediaTypes gained SVG dimensions

`umbracomediavectorgraphics.config` gained `umbracoWidth` and `umbracoHeight`
(`Umbraco.Label`). A genuine Umbraco 17.5.3 addition — SVG media now carries
dimensions. Correct to capture.

---

## Finding 4 — `usync.config` version stamp

```diff
-<uSync version="17.0.4.0" format="10.7.0" />
+<uSync version="17.3.6.0" format="10.7.0" hmac="" />
```

**`format="10.7.0"` unchanged.** uSync's own serialisation format did not move
between 17.0.4 and 17.3.6. The new `hmac` attribute is empty.

---

## What was NOT verified

Being explicit, since the point of this audit is not to overstate.

- **Import** was not run. Only report and export. A round-trip import would
  confirm the files still deserialise, and has not been done.
- **Media file bytes** were not checked — only that the deleted media items are
  absent from the database.
- **The 51 modified Content files** were verified by enumerating every distinct
  diff line across all of them, not by reading each file individually. The
  enumeration showed only two kinds of change (`Layout` case, tombstone
  removal), so per-file reading would add nothing.

---

## Actions

- [ ] **Change `Layout` to `layout` in `transforms.ts:66`** — separate issue,
      not part of the upgrade branch
- [ ] Commit the export as its own commit, separate from the package upgrades
- [ ] Consider whether a uSync **import** should be run to confirm round-trip
