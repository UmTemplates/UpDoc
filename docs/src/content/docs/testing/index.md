---
title: "Testing Overview"
---

UpDoc uses Playwright for end-to-end testing. All tests run against a live UpDoc.TestSite instance and exercise the full stack — from backoffice UI interactions through API calls to database persistence.

For Playwright setup, configuration, and how to run tests, see [Tooling → Playwright](/UpDoc/tooling/playwright/).

## Test Inventory

**4 spec files, 26 tests total.**

| Test | Spec File | Tests | What It Covers |
|------|-----------|-------|----------------|
| [Create from Source UI](/UpDoc/testing/create-from-source-ui/) | `create-from-source.spec.ts` | 4 | Collection button, blueprint picker, full PDF→document flow, content preview |
| [PDF to Document Verification](/UpDoc/testing/pdf-to-document-verification/) | `document-verification.spec.ts` | 3 ×3 PDFs | API verification of created document fields, blocks, markdown cleanup |
| [Transform Rules Rendering](/UpDoc/testing/transform-rules-rendering/) | `transformed-view.spec.ts` | 5 | Workflow editor: ungrouped/grouped rule display in Transformed tab |
| [BlockKey Reconciliation](/UpDoc/testing/blockkey-reconciliation/) | `blockkey-reconciliation.spec.ts` | 14 | contentTypeKey model, bridge resilience, reconciliation, validation, orphan indicators |

## Test PDFs

Test PDFs are stored in the Umbraco media library under a `PDF` folder:

| PDF | Content | Used By |
|-----|---------|---------|
| `updoc-test-01.pdf` | Dresden, Leipzig & Meißen | Create from Source UI, PDF to Document, BlockKey Reconciliation |
| `updoc-test-02.pdf` | Historic Houses & Heritage of Suffolk | Create from Source UI, PDF to Document |
| `updoc-test-03.pdf` | Moorish Treasures of Andalucía (has OPTIONAL section) | PDF to Document |

## Shared Helpers

Several helper functions are duplicated across spec files. These handle common UI interactions and API calls.

### UI Helpers

**`selectBlueprint(page, docTypeName, blueprintName?)`** — Navigates the two-step blueprint picker dialog:
1. Wait for dialog visible
2. Click document type button (e.g., "Group Tour")
3. Wait 500ms for step 2 to render
4. Click blueprint button (defaults to same name as doc type)

**`selectPdf(page, pdfName)`** — Selects a PDF from the media picker:
1. Click "Choose" button in source modal
2. Wait for "Choose media" heading
3. Double-click "PDF" folder to navigate into it
4. Click the `uui-card-media` matching the PDF name
5. Click "Choose" in the media picker footer

### API Helpers

Tests use `page.evaluate()` to make authenticated API calls from within the browser context, reading the auth token from `localStorage`:

- **`apiGet(page, path)`** — GET request, returns parsed JSON
- **`apiPut(page, path)`** — PUT request, no body
- **`apiPutBody(page, path, body?)`** — PUT request with optional body
- **`apiPutJson(page, path, body)`** — PUT request with JSON body, returns parsed JSON
- **`apiPost(page, path)`** — POST request, returns parsed JSON

### Document Helpers

- **`getFieldValue(doc, alias)`** — Extracts a string field value from a document's `values` array
- **`getBlockContainerBlocks(doc, containerAlias)`** — Extracts `contentData` blocks from a Block Grid or Block List property
- **`findBlockByTitle(blocks, titleValue)`** — Finds a block whose `featurePropertyFeatureTitle` contains the given text
- **`getBlockProperty(block, alias)`** — Extracts a property value from a block's `values` array

### Assertion Helpers

- **`assertNoMarkdown(value, fieldName)`** — Asserts no heading prefix (`# `) or bold markers (`**`) in text
- **`assertRichTextHasHtml(value, fieldName)`** — Asserts an RTE object has `markup` containing HTML tags and no raw heading prefixes

### Safety Helpers

- **`PROTECTED_IDS`** — Set of node GUIDs that must never be deleted (Home, collection nodes)
- **`trashDocument(page, docId)`** — Moves a document to recycle bin, with protected ID check

## Known Issues

- **Duplicated helpers** — `selectBlueprint`, `selectPdf`, and API helpers are copy-pasted across spec files. Should be extracted to a shared module.
- **Cleanup gaps** — `document-verification.spec.ts` and `blockkey-reconciliation.spec.ts` have cleanup via `afterEach`. `create-from-source.spec.ts` does not — test documents accumulate.
- **Site must be running** — all tests require UpDoc.TestSite to be running.
- **Hardcoded workflow alias** — `blockkey-reconciliation.spec.ts` uses `tailoredTourPdf` as the test workflow.
