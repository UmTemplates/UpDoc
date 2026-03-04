---
title: "Playwright"
---


Playwright is used for two purposes in UpDoc:

1. **End-to-end testing** — automating browser interactions for the Create from Source workflow
2. **Figma capture** — logging into the Umbraco backoffice to capture authenticated pages for design iteration (via Playwright MCP)

## Setup

Playwright tests live in the UpDoc project alongside the extension code. The test configuration targets the local UpDoc.TestSite.

### Environment

| Variable | Purpose |
|----------|---------|
| `URL` | The Umbraco site URL (e.g., `https://localhost:44391`) |

**Note:** The environment variable is `URL`, not `UMBRACO_URL`.

### Test PDFs

Test PDFs are stored in the Umbraco media library:

| PDF | Purpose |
|-----|---------|
| `updoc-test-01` | Primary test document |
| `updoc-test-02` | Secondary test document |
| `updoc-test-03` | Third test document |

## Shadow DOM Considerations

Umbraco's backoffice uses Shadow DOM extensively. This affects how Playwright selects elements:

- **Use page-level queries** — `page.locator()` rather than scoped queries that can't cross shadow boundaries
- **Avoid strict shadow DOM selectors** — Playwright's `>>` shadow piercing syntax can be fragile with Umbraco's nested shadow roots
- **Test UUI components** — `uui-button`, `uui-input`, etc. are custom elements inside shadow roots

## Test Coverage

Four tests cover the Create from Source workflow:

1. **Visibility** — the "Create from Source" button appears in the collection toolbar
2. **Blueprint picker** — clicking the button opens the blueprint picker modal
3. **Full flow** — complete flow from button click through blueprint selection, PDF upload, extraction, and document creation
4. **Preview** — extraction preview renders correctly before document creation

## Backoffice User for Playwright

A dedicated Umbraco user account exists for Playwright automation. This user is used both by E2E tests and by the Playwright MCP server for Figma captures of authenticated backoffice pages.

:::caution[Credentials]
The Playwright user credentials are stored in environment variables, not in source control. Ask the project maintainer for the values if you need to configure a new machine.
:::

### Figma Capture via Playwright MCP

The Playwright MCP server can log into the Umbraco backoffice and capture authenticated pages directly — bypassing the html.to.design plugin and its Shadow DOM limitations. This is useful for capturing the **live** backoffice state (not just static mockups).

**When to use:**

| Approach | Best for |
|----------|----------|
| [HTML Mockups](../figma/mockups.md) | Designing individual components without the site running |
| html.to.design plugin | Capturing complex backoffice pages with full Shadow DOM fidelity |
| Playwright MCP capture | Automated capture of authenticated pages — no manual plugin step |

**How it works:**

1. Playwright MCP navigates to the Umbraco login page
2. Logs in with the dedicated Playwright user
3. Navigates to the target backoffice page
4. Injects the Figma capture script (stripping CSP headers)
5. Submits the capture to the Figma file

:::note[Status: Planned]
This workflow has been set up but not yet fully validated end-to-end with the Umbraco backoffice. The dedicated user exists and Playwright MCP is configured. Full validation is pending.
:::

## Known Issues

- **Cleanup:** tests currently do not delete created test documents. A cleanup step is needed to prevent test data accumulation.
- **Site must be running:** Playwright tests require the UpDoc.TestSite to be running before execution.

## Running Tests

```bash
npx playwright test
```

## Umbraco Testing Skills

Before writing new Playwright tests, invoke the relevant Claude Code skills:

- `umbraco-e2e-testing` — E2E patterns for Umbraco backoffice
- `umbraco-playwright-testhelpers` — `@umbraco/playwright-testhelpers` fixtures and helpers
- `umbraco-testing` — router skill for choosing the right testing approach

## References

- [Playwright documentation](https://playwright.dev/)
- [`@umbraco/playwright-testhelpers`](https://www.npmjs.com/package/@umbraco/playwright-testhelpers) — Umbraco's official test helpers
- [planning/PLAYWRIGHT_TESTING.md](https://github.com/deanleigh/UpDoc/blob/main/planning/PLAYWRIGHT_TESTING.md) — original test planning document
