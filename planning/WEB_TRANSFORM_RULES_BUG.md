# Bug: Web Transform Doesn't Apply Section Rules

## Status: TO FIX

## Problem

The PDF and web pipelines use different code paths to generate `transform.json`:

- **PDF**: extraction → `DetectAreas()` → `ContentTransformService.Transform()` → `transform.json`
- **Web**: extraction → `ConvertStructuredToTransformResult()` → `transform.json`

`ContentTransformService.Transform()` applies area rules (conditions, formats, parts, groups, find & replace). It produces named sections like "Organisation", "Tour Title", "Tour Description" with proper markdown formatting (headings, paragraphs, bullet lists).

`ConvertStructuredToTransformResult()` does simple heading-based grouping only. It ignores `AreaRules` entirely. Section names come from detected headings, not rules. No formatting is applied.

**Result**: Rules defined in the web workflow's sections editor are saved to `source.json` but never used to generate `transform.json`. The Transformed tab shows flat, unformatted content identical to Extracted.

## Evidence (screenshots comparison)

**PDF Extracted tab**: Shows elements grouped into named sections (Organisation, Tour Title, Tour Description) under areas, with rule counts and mapping badges.

**PDF Transformed tab**: Shows rendered document preview — title as H1, description concatenated, features as bullet list, sections with headings and separators.

**Web Extracted tab**: Shows 3 flat elements under Page Header with metadata badges. No named sections despite 2 rules defined.

**Web Transformed tab**: Shows same 3 lines of text with no formatting — "5 days from", "£899", "Dublin's Fair City" as plain text. Rules not applied.

## Root Cause

In `WorkflowController.cs`:
- Web extraction (line ~390) calls `ConvertStructuredToTransformResult()` — no rules
- PDF extraction (line ~692) calls `_contentTransformService.Transform()` — applies rules
- `UpdateSectionRules` endpoint (line 875) saves rules to `source.json` but does NOT regenerate `transform.json`

## Fix

Web sources need to go through `ContentTransformService.Transform()` the same way PDF does. The flow should be:

1. Web extraction builds `area-detection.json` via `BuildAreaDetectionFromWeb()` (already works)
2. Transform should call `_contentTransformService.Transform(areaResult, sourceConfig?.AreaRules, previousTransform)` using the area detection result — same as PDF
3. `UpdateSectionRules` endpoint should regenerate `transform.json` after saving rules (for all source types)

The area detection result from `BuildAreaDetectionFromWeb()` produces the same `AreaDetectionResult` model that `ContentTransformService.Transform()` expects. The fix should be replacing `ConvertStructuredToTransformResult()` calls for web sources with the `ContentTransformService.Transform()` path.

## Files to Change

- `WorkflowController.cs` — Replace `ConvertStructuredToTransformResult()` for web sources with `ContentTransformService.Transform()`. Add transform regeneration to `UpdateSectionRules`.
- Verify `ContentTransformService.TransformAreaWithRules()` works with web-sourced area detection (HTML condition types like `htmlTagEquals`, `containerPathContains`).

## Scope

Small, targeted fix. The rendering code (`up-doc-workflow-source-view.element.ts`) and the rules editor UI are both working correctly — only the backend transform generation needs changing.

## Status: FIXED (commit pending)

Core fix applied — web/markdown sources now route through `ContentTransformService.Transform()`. Rules are applied and named sections appear in the Extracted and Transformed tabs.

## Follow-Up Issues (not blocking)

1. **Rule ordering not respected in output.** Sections appear in DOM order (Tour Description before Tour Title) instead of rule order. The drag-and-drop ordering in the rules editor should control output order. This affects both PDF and web — PDF just happens to have elements in the "right" order naturally. `ContentTransformService.TransformAreaWithRules()` processes elements in document order; it should respect rule ordering instead.

2. **Multi-match concatenation.** Two elements matching the same rule (e.g., "5 days from" and "£899" both matching Tour Description) produce two separate sections instead of one concatenated section ("5 days from £899"). The transform service should merge consecutive elements matched by the same ungrouped rule into a single section.
