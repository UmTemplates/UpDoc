# Next Session: Polish & Testing

## Completed (merged to main)

- **Fix 1+2:** Rule ordering + multi-match concatenation (`836193a`)
- **Fix 3:** Web Sections button (`836193a`)
- **Multi-workflow blueprint support:** Route extraction to correct workflow per source type (`3213e2b`)
- **Workflow rename:** `tailoredTourWebPage` → `groupTourWebPage` (Group Tour blueprint, web source)

---

## Known Issues

### Markdown heading prefix in Content tab
Page Title and Page Title Short show `# Killarney & The Ring of Kerry` with the markdown `# ` prefix still present. Same issue appears in PDF extractions too. The `stripMarkdown()` function should be cleaning this but isn't being applied (or isn't handling heading prefixes). Affects both PDF and web source types — fix once for both.

### Workspace header input re-renders on keystroke
When editing the workflow name in the workspace header, the input field re-renders on every keystroke (likely the `@input`/`@change` handler triggers a save/state update that causes Lit to re-render, resetting cursor position). Low priority — cosmetic only.

---

## Future Polish Ideas

### Configurable node name field
Currently the document name is derived from whichever mapping targets `pageTitle` (hardcoded default). Package users need the ability to configure which destination field maps to the node name. Add a `nodeNameField` property to `destination.json` or `workflow.json` that the workflow author can set (e.g. `"nodeNameField": "productName"`). The `#prefillDocumentName` logic reads this, falling back to `pageTitle` if unset. Surface this in the Destination tab UI as a setting.

### Search/filter bar on Source Extracted tab
Long extractions (20+ sections across multiple areas) make scrolling tedious. Add a search/filter input in the Collapse row (alongside the Collapse button) that filters visible sections by name or content text. Useful for quickly finding a specific section in large web page or PDF extractions.

### Content tab preview quality
Content tab shows raw markdown and property aliases instead of rendered HTML with friendly labels. Not blocking but would improve the review experience before creating a document.

### Strategy badge contrast, button label consistency, Transformed heading cleanup
Minor visual polish items noted previously.
