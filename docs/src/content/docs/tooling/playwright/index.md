---
title: "Playwright"
---

Playwright is used for two purposes in UpDoc:

1. **End-to-end testing** — automating browser interactions to test the Create from Source workflow and workflow editor
2. **Figma capture** — logging into the Umbraco backoffice to capture authenticated pages for design iteration (via Playwright MCP)

For detailed test documentation, see the [Testing](/UpDoc/testing/) section.

## Setup

Playwright tests live alongside the extension code at:

```
src/UpDoc/wwwroot/App_Plugins/UpDoc/
├── playwright.config.ts
└── tests/e2e/
    ├── .auth/              # Stored auth state
    ├── auth.setup.ts       # Login setup project
    ├── create-from-source.spec.ts
    ├── document-verification.spec.ts
    ├── transformed-view.spec.ts
    └── blockkey-reconciliation.spec.ts
```

## Configuration

| Setting | Value |
|---------|-------|
| Test directory | `tests/e2e` |
| Timeout | 60 seconds per test |
| Expect timeout | 10 seconds |
| Parallel | Disabled (`fullyParallel: false`, `workers: 1`) |
| Browser | Desktop Chrome |
| Base URL | `process.env.UMBRACO_URL` or `https://localhost:44390` |
| Test ID attribute | `data-mark` (Umbraco convention) |
| Auth | Setup project stores state, spec projects depend on it |

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `UMBRACO_URL` | The Umbraco site URL (e.g., `https://localhost:44390`) |

## Running Tests

```bash
# Run all tests
cd src/UpDoc/wwwroot/App_Plugins/UpDoc
npx playwright test

# Run a specific spec file
npx playwright test create-from-source

# Run with UI mode (interactive)
npx playwright test --ui

# Run with headed browser (visible)
npx playwright test --headed
```

## Shadow DOM Considerations

Umbraco's backoffice uses Shadow DOM extensively. This affects how Playwright selects elements:

- **Use page-level queries** — `page.locator()` rather than scoped queries that can't cross shadow boundaries
- **Avoid strict shadow DOM selectors** — Playwright's `>>` shadow piercing syntax can be fragile with Umbraco's nested shadow roots
- **Test UUI components** — `uui-button`, `uui-input`, etc. are custom elements inside shadow roots

## Backoffice User for Playwright

A dedicated Umbraco user account exists for Playwright automation. This user is used both by E2E tests and by the Playwright MCP server for Figma captures of authenticated backoffice pages.

:::caution[Credentials]
The Playwright user credentials are stored in environment variables, not in source control. Ask the project maintainer for the values if you need to configure a new machine.
:::

## Figma Capture via Playwright MCP

The Playwright MCP server can log into the Umbraco backoffice and capture authenticated pages directly — bypassing the html.to.design plugin and its Shadow DOM limitations.

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

## Umbraco Testing Skills

Before writing new Playwright tests, invoke the relevant Claude Code skills:

- `umbraco-e2e-testing` — E2E patterns for Umbraco backoffice
- `umbraco-playwright-testhelpers` — `@umbraco/playwright-testhelpers` fixtures and helpers
- `umbraco-testing` — router skill for choosing the right testing approach

## References

- [Playwright documentation](https://playwright.dev/)
- [`@umbraco/playwright-testhelpers`](https://www.npmjs.com/package/@umbraco/playwright-testhelpers) — Umbraco's official test helpers
- [planning/PLAYWRIGHT_TESTING.md](https://github.com/UmTemplates/UpDoc/blob/main/planning/PLAYWRIGHT_TESTING.md) — original test planning document
