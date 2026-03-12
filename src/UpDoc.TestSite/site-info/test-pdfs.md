# Test PDFs & Matching Web Pages

Reference document for test PDFs uploaded to the Umbraco media library and their matching web pages on the old Tailored Travel website.

## Naming Convention

PDF filenames follow the pattern: `TTM[number] [Organiser/Area] [Destination]`

- **TTM number** — Tailored Travel internal reference (higher = newer)
- Each PDF has a **web lookup code** at the bottom (e.g. `sowu161`) used at `www.tailored-travel.co.uk`
- The web code is a combination of the organiser abbreviation + sequence number

## Media Library Location

Test PDFs are stored in: **Media > PDF > Test**

## Test PDFs

| TTM Code | Filename | Destination | Web Code | Web URL | Organiser | Media Name |
|----------|----------|-------------|----------|---------|-----------|------------|
| TTM5098 | Winchester Greenwich London | Greenwich & SE London | _TBC_ | _TBC_ | Arts Society Winchester | _TBC_ |
| | | | | | | |

<!-- Add rows as PDFs are identified and uploaded -->

## Current Test PDFs in Media Library (PDF folder)

These are the existing test PDFs that need renaming/reorganising:

| Current Name | TTM Code | Destination | Notes |
|-------------|----------|-------------|-------|
| updoc-test-01.pdf | TTM5059? | Dresden, Saxony | Used by Playwright document-verification test |
| updoc-test-02.pdf | _TBC_ | Suffolk | Used by Playwright document-verification test |
| updoc-test-03.pdf | _TBC_ | Andalucia | Fails pageTitle extraction — rules don't match this PDF |

## Matching Web Pages

For testing both PDF and Web source types against the same tour content:

| Tour | PDF | Web URL | Status |
|------|-----|---------|--------|
| Greenwich & SE London | TTM5098 | _TBC_ | Identified, not yet uploaded |

<!-- Status: Identified / Uploaded / Tested / Verified -->
