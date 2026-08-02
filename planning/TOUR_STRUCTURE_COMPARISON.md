# Tailored Tour: structure comparison

Side-by-side comparison of the Tailored Tour document type on both sites, at all three
levels: **tabs**, **groups**, and **properties**.

Written for #116, after the first pass of the #110 audit made two claims that turned out to
be incomplete. Everything below is extracted from the uSync configs by script, not read by
eye.

## Why tabs and groups are easy to confuse

uSync stores **both** tabs and groups inside a single `<Tabs>` element. They are told apart
only by the `<Type>` child:

```xml
<Tab>
  <Alias>tourProperties</Alias>          <!-- a TAB -->
  <Type>Tab</Type>
</Tab>
<Tab>
  <Alias>tourProperties/tourOrganiser</Alias>   <!-- a GROUP inside that tab -->
  <Type>Group</Type>
</Tab>
```

A group's alias is `parentTabAlias/groupAlias`. So `tourProperties/tourOrganiser` is the
**Tour Organiser group** inside the **Tour Properties tab**.

**The trap:** on the UpDoc test site there is also an *element type* whose alias is
`tourProperties`. Three different things share that name: an element type, a tab, and the
prefix of several group aliases. They are unrelated to each other.

---

## Level 1: Tabs on Tailored Tour

Tabs are declared by several compositions at once. Umbraco merges them by alias, so the
same tab appears from multiple sources. The lowest sort order wins.

### UpDoc test site

| Sort | Caption | Alias | Declared by |
|---|---|---|---|
| 10 | Page Properties | `pageProperties` | contentHeadingDefault |
| 10 | Tour Properties | `tourProperties` | pageComponentTourPrice |
| 15 | Tour Properties | `tourProperties` | **tourProperties** |
| 20 | Page Content | `pageContent` | contentGridTailoredTour |
| 20 | Tour Properties | `tourProperties` | pageComponentTourDuration |
| 20 | Tour Properties | `tourProperties` | pageComponentTourDepartureDate |
| 20 | Tour Properties | `tourProperties` | tourBrochure |
| 30 | Page Settings | `pageSettings` | contentHeadingDefault1 |

### Tailored Travel

| Sort | Caption | Alias | Declared by |
|---|---|---|---|
| 10 | Page Properties | `pageProperties` | contentHeadingDefault |
| 10 | Tour Properties | `tourProperties` | pageComponentTourPrice |
| 20 | Tour Properties | `tourProperties` | pageComponentTourDepartureDate |
| 20 | Tour Properties | `tourProperties` | pageComponentTourDuration |
| 20 | Tour Properties | `tourProperties` | tourBrochure |
| 20 | Tour Properties | `tourProperties` | tourDestinations |
| 20 | Tour Properties | `tourProperties` | **tourOrganisers** |
| 30 | Page Content | `pageContent` | contentGridTailoredTour |
| 30 | Page Settings | `pageSettings` | contentHeadingDefault1 |

### Differences

1. **`tourDestinations` is missing** from the test site. Known, and is step 3 of #116.
2. **Page Content sorts at 20 here, 30 on live.** Both sites currently render the same tab
   order because Tour Properties resolves to 10 on both, but the underlying value differs.
3. The test site declares the Tour Properties tab at sort **15** from the renamed
   composition, where live declares it at **20**.

**Tab set is otherwise identical: four tabs, same aliases, same captions.**

---

## Level 2: Groups inside the Tour Properties tab

### UpDoc test site

| Sort | Caption | Alias | Declared by |
|---|---|---|---|
| 0 | Tour Details | `tourProperties/tourDetails` | pageComponentTourDuration |
| 0 | Tour Details | `tourProperties/tourDetails` | pageComponentTourPrice |
| 0 | Tour Details | `tourProperties/tourDetails` | pageComponentTourDepartureDate |
| 0 | Tour Organiser | `tourProperties/tourOrganiser` | **tourProperties** |
| 30 | Tour Brochure | `tourProperties/tourBrochure` | tourBrochure |

### Tailored Travel

| Sort | Caption | Alias | Declared by |
|---|---|---|---|
| 0 | Tour Details | `tourProperties/tourDetails` | pageComponentTourDepartureDate |
| 0 | Tour Details | `tourProperties/tourDetails` | pageComponentTourDuration |
| 0 | Tour Details | `tourProperties/tourDetails` | pageComponentTourPrice |
| 0 | Tour Details | `tourProperties/tourDetails` | **tourDestinations** |
| 20 | Tour Organiser | `tourProperties/tourOrganiser` | **tourOrganisers** |
| 30 | Tour Brochure | `tourProperties/tourBrochure` | tourBrochure |

### Differences

1. **`tourDestinations` contributes to the Tour Details group** on live. Its Destinations
   property sits alongside Duration, Price and Departure Date, **not** in a group of its
   own. Step 3 of #116 must not invent a new group for it.
2. **Tour Organiser group sorts at 0 here, 20 on live.** On live that places it after Tour
   Details; here the two share sort 0 and fall back to another ordering. This is a real
   display difference.

**Group aliases and captions are otherwise identical.**

---

## Level 3: The two renamed element types

### `tourProperties` (UpDoc) vs `tourOrganisers` (Tailored Travel)

Same key: `213494ec-2a92-4f94-9bec-f7128cb3e91c`

| | UpDoc | Tailored Travel | Same? |
|---|---|---|---|
| Element type alias | `tourProperties` | `tourOrganisers` | **no** |
| Element type name | Tour Properties | Tour Organisers | **no** |
| Element type key | `213494ec…` | `213494ec…` | yes |
| Folder | Pages/Page+Components | Pages/Page+Components | yes |
| IsElement | true | true | yes |
| Compositions | none | none | yes |
| **Tab** alias | `tourProperties` | `tourProperties` | yes |
| Tab key | `db5ff556…` | `db5ff556…` | yes |
| Tab caption | Tour Properties | Tour Properties | yes |
| Tab sort | 15 | 20 | **no** |
| **Group** alias | `tourProperties/tourOrganiser` | `tourProperties/tourOrganiser` | yes |
| Group key | `4dfafdd8…` | `4dfafdd8…` | yes |
| Group caption | Tour Organiser | Tour Organiser | yes |
| Group sort | 0 | 20 | **no** |
| **Property** alias | `organisers` | `organisers` | yes |
| Property key | `6d9ed691…` | `6d9ed691…` | yes |
| Property name | Organisers | Organisers | yes |
| Property editor | Umbraco.BlockList | Umbraco.BlockList | yes |
| Property data type | `cc81477f…` | `cc81477f…` | yes |
| Property sort | 0 | 0 | yes |
| LabelOnTop | true | false | **no** |
| Mandatory | false | false | yes |

**Critical point:** the element type is renamed, but the **tab inside it stays
`tourProperties` on both sides**. Renaming the element type does not rename the tab. These
are separate things that happen to share a name on the test site.

Four differences: alias, name, two sort orders, and `LabelOnTop`.

### `featurePageOrganisers` (UpDoc) vs `featureCtaContactOrganiser` (Tailored Travel)

Same key: `a00f052f-2581-4b24-a04e-a49db5a87615`

| | UpDoc | Tailored Travel | Same? |
|---|---|---|---|
| Alias | `featurePageOrganisers` | `featureCtaContactOrganiser` | **no** |
| Name | Page - Organisers | CTA - Contact Organiser | **no** |
| Key | `a00f052f…` | `a00f052f…` | yes |
| Folder | Features | Features | yes |
| Compositions (4) | identical | identical | yes |
| Tabs | none | none | yes |
| Groups | none | none | yes |
| Properties | none | none | yes |

**This one is a pure rename.** No tabs, no groups, no properties of its own: everything
comes from its four compositions, which are identical on both sides. Only the alias and
name differ.

---

## Conclusions

**`featureCtaContactOrganiser` is safe.** A pure rename with nothing else attached.

**`tourOrganisers` is a rename plus three display changes.** The structure is genuinely
identical at every level, verified by key rather than by alias. But the group sort order
(0 vs 20) will move the Tour Organiser group in the backoffice, and `LabelOnTop` changes
how the field renders.

Recommend splitting: do the rename, decide on the sort orders and `LabelOnTop` separately
so the visual effect can be seen on its own.

**For step 3, `tourDestinations` joins the existing Tour Details group.** It does not get a
group of its own. Getting this wrong would put Destinations in the wrong place.

**Page Content tab sort differs (20 vs 30)** and is unrelated to either rename. Logged here
so it is not mistaken for something these changes caused.

## Method note

Every comparison above matches on **key**, never on alias. The first pass of the #110 audit
matched on alias and drew three wrong conclusions from it. A renamed type looks like two
unrelated types when compared by alias.
