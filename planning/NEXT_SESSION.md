# Next Session: Web Transform Polish

## Branch: `feature/transform-rule-ordering` (already created from main)

## Goal

Get the web pipeline producing the same quality output as PDF. The metadata is all there — HTML tags, CSS classes, container paths, computed font sizes/colors. Two code fixes needed.

---

## Fix 1: Rule Ordering

**Problem:** Sections appear in DOM order, not rule order. In the web test case, Tour Description elements ("5 days from", "£899") appear in the DOM before the Tour Title h1 ("Dublin's Fair City"), so the transform output has Description first, Title second — despite the rules editor having Title first.

**Where:** `ContentTransformService.TransformAreaWithRules()` (line 184), specifically the part-driven mode loop at line 354. It iterates `elements` (DOM order) and emits sections as it encounters them.

**Fix:** For ungrouped content rules, don't emit sections inline during the DOM-order loop. Instead:
1. First pass (already exists, lines 211–243): match each element to a rule
2. Collect matched elements per rule into a dictionary (keyed by rule reference)
3. Emit ungrouped content sections in **rule order** (iterating `areaRule.Rules`), not element order

Grouped rules (title/content/description/summary within groups) still process in DOM order — that's correct for those.

---

## Fix 2: Multi-Match Concatenation

**Problem:** Two elements matching the same ungrouped rule ("5 days from" + "£899" both matching Tour Description) produce two separate sections. Should produce one section with concatenated content: "5 days from £899".

**Where:** Same method, lines 361–383. Each ungrouped content match calls `FlushSection()` and creates a standalone section.

**Fix:** Collecting matched elements per rule (from Fix 1) naturally solves this. When emitting the section for Tour Description, join all matched elements' text into one content string.

---

## Fix 3: Top-Level Sections Button

**Problem:** The top-level "Sections" button in the info box opens a popover listing areas. The user said this one needs to work / give the same results as PDF. Need to verify:
- Does `#getAreasForRulesEditor()` return the correct areas for web sources?
- Does clicking an area in the popover open the rules editor with the right elements?
- Is the popover showing areas at all for web workflows?

**Where:** `up-doc-workflow-source-view.element.ts`, lines 1360–1394 (top-level Sections button + popover), and `#getAreasForRulesEditor()` which builds the area list.

**Action:** Test the top-level Sections button on the web workflow. If it's not working, trace `#getAreasForRulesEditor()` to find why. The per-area Sections button on the side already works (that's how rules were created in the test), so the top-level one just needs to list the same areas.

---

## Implementation Order

1. **Fix 1 + Fix 2 together** — both solved by the same refactor in `TransformAreaWithRules()`
2. **Build + test** — rebuild, run site, check web workflow Extracted + Transformed tabs
3. **Fix 3** — verify top-level Sections button, fix if broken
4. **Commit + merge**

## Test Case

Web workflow: `tailoredTourWebPage`, area: "Page Header" with 3 elements:
- "5 days from" (div, Tour Description rule)
- "£899" (div, Tour Description rule)
- "Dublin's Fair City" (h1, Tour Title rule)

**Expected after fix:**
- Tour Title section first (rule order), content: "Dublin's Fair City" as H1
- Tour Description section second, content: "5 days from £899" (concatenated)

## Files to Change

- `src/UpDoc/Services/ContentTransformService.cs` — refactor ungrouped content handling in `TransformAreaWithRules()`
- Possibly `src/UpDoc/wwwroot/App_Plugins/UpDoc/src/up-doc-workflow-source-view.element.ts` — if top-level Sections button needs fixing
