/**
 * Docs screenshot capture: "Creating a Workflow"
 *
 * This spec drives the Create Workflow flow exactly as described in
 * docs/src/content/docs/creating-a-workflow.md and captures screenshots
 * at each documented step. Screenshots are saved to:
 *
 *   docs/src/assets/screenshots/creating-a-workflow/
 *
 * Binding to the docs: FILENAME ONLY. The spec does not read the markdown.
 * If the docs change, the spec continues to run. If the UI changes, the
 * spec breaks and needs updating.
 *
 * To run just this spec:
 *   npx playwright test creating-a-workflow.screenshots
 */

import { expect, Page } from '@playwright/test';
import { test } from '@umbraco/playwright-testhelpers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample PDF for the walkthrough — must exist in the media library
const SAMPLE_PDF_FOLDER = 'Wensum';
const SAMPLE_PDF_NAME = 'TTM5063 Wensum Flemish Bruges Antwerp Ghent lo.pdf';

// Fixed workflow name so screenshot captions stay stable across runs
const WORKFLOW_NAME = 'Docs Screenshot Test PDF Workflow';
const WORKFLOW_ALIAS = 'docsScreenshotTestPdfWorkflow';

// Screenshot output directory, resolved from this spec's location
// tests/e2e/ -> .../App_Plugins/UpDoc/tests/e2e -> repo root -> docs/src/assets/...
const SCREENSHOTS_DIR = path.resolve(
  __dirname,
  '../../../../../../../docs/src/assets/screenshots/creating-a-workflow'
);

async function capture(page: Page, name: string) {
  const outputPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: outputPath, fullPage: false });
}

/**
 * Deletes the workflow folder if it exists from a previous run,
 * so screenshots are captured against a known starting state.
 */
async function deleteWorkflowIfExists(page: Page, alias: string) {
  const token = await page.evaluate(() => localStorage.getItem('umb:userAuthTokenResponse'));
  if (!token) return;

  const authToken = JSON.parse(token).access_token;

  try {
    await page.request.delete(
      `/umbraco/management/api/v1/updoc/workflows/${alias}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        ignoreHTTPSErrors: true,
      }
    );
  } catch {
    // Ignore — workflow may not exist
  }
}

test.describe('Creating a Workflow — docs screenshots', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('capture all screenshots for creating-a-workflow.md', async ({ umbracoUi }) => {
    const page = umbracoUi.page;

    await umbracoUi.goToBackOffice();
    await deleteWorkflowIfExists(page, WORKFLOW_ALIAS);

    // ─────────────────────────────────────────────────────────────────
    // Step 1 — Navigate to UpDoc (Settings → Synchronisation → UpDoc)
    // ─────────────────────────────────────────────────────────────────
    await page.getByRole('tab', { name: 'Settings' }).click();
    const upDocLink = page.getByRole('link', { name: 'UpDoc', exact: true });
    await upDocLink.waitFor({ timeout: 15000 });
    await upDocLink.click();
    await expect(page.getByRole('tab', { name: 'Workflows' })).toBeVisible();
    await capture(page, '01-settings-tree-updoc');

    // ─────────────────────────────────────────────────────────────────
    // Step 2 — Workflows dashboard
    // ─────────────────────────────────────────────────────────────────
    await expect(page.getByRole('button', { name: 'Create Workflow' })).toBeVisible();
    await capture(page, '02-workflows-list');

    // ─────────────────────────────────────────────────────────────────
    // Step 3 — Click Create Workflow → Choose a Document Type dialog
    // ─────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: 'Create Workflow' }).click();
    await expect(page.getByRole('heading', { name: 'Choose a Document Type' })).toBeVisible({ timeout: 10000 });
    await capture(page, '03-choose-document-type');

    // ─────────────────────────────────────────────────────────────────
    // Step 4 — Select Tailored Tour → Blueprint picker
    // ─────────────────────────────────────────────────────────────────
    await page
      .locator('blueprint-picker-modal')
      .getByRole('button', { name: 'Tailored Tour', exact: true })
      .click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Select a Document Blueprint' })).toBeVisible();
    await capture(page, '04-select-blueprint');

    // ─────────────────────────────────────────────────────────────────
    // Step 5 — Click blueprint → sidebar opens → Destination tab
    // ─────────────────────────────────────────────────────────────────
    await page
      .locator('blueprint-picker-modal')
      .getByRole('button', { name: /Tailored Tour/ })
      .first()
      .click();

    // Wait for the Create Workflow sidebar
    await expect(page.getByRole('heading', { name: 'Create Workflow' })).toBeVisible({ timeout: 10000 });

    // Switch to Destination tab and capture
    await page.getByRole('tab', { name: 'Destination' }).click();
    await expect(page.getByText('Document Type')).toBeVisible();
    await capture(page, '05-destination-tab');

    // ─────────────────────────────────────────────────────────────────
    // Step 6 — Switch to Source tab (empty state)
    // ─────────────────────────────────────────────────────────────────
    await page.getByRole('tab', { name: 'Source' }).click();
    await expect(page.getByText('Workflow Name')).toBeVisible();
    await capture(page, '06-source-tab-empty');

    // ─────────────────────────────────────────────────────────────────
    // Step 7 — Enter name, open Format dropdown
    // ─────────────────────────────────────────────────────────────────
    await page.getByPlaceholder('Enter alias...').fill(WORKFLOW_NAME);
    const formatSelect = page.locator('select').first();
    await formatSelect.focus();
    // Capture with dropdown about to be opened (visible state preserved)
    await capture(page, '07-format-dropdown-open');
    await formatSelect.selectOption({ label: 'PDF Document' });

    // ─────────────────────────────────────────────────────────────────
    // Step 8 — Sample Document empty chooser
    // ─────────────────────────────────────────────────────────────────
    await expect(page.getByText('Sample Document')).toBeVisible();
    await capture(page, '08-sample-document-empty');

    // Click + Choose, navigate media picker
    await page.getByRole('button', { name: /Choose/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Choose media' })).toBeVisible({ timeout: 10000 });

    // Navigate into PDF folder then into the society subfolder
    await page.getByRole('button', { name: 'PDF', exact: true }).dblclick();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: SAMPLE_PDF_FOLDER, exact: true }).dblclick();
    await page.waitForTimeout(1000);

    // Wait for the PDF to appear
    const pdfCard = page.locator('uui-card-media').filter({ hasText: SAMPLE_PDF_NAME });
    await pdfCard.waitFor({ timeout: 10000 });
    await pdfCard.click();
    // Capture the media picker at the point of selection
    await capture(page, '09-choose-media-pdf-selected');

    // Confirm the choice
    await page.locator('umb-media-picker-modal').getByRole('button', { name: 'Choose' }).click();

    // ─────────────────────────────────────────────────────────────────
    // Step 9 — Sample Document populated
    // ─────────────────────────────────────────────────────────────────
    await expect(page.getByText(SAMPLE_PDF_NAME)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/\d+ pages/)).toBeVisible();
    await capture(page, '10-sample-document-populated');

    // ─────────────────────────────────────────────────────────────────
    // Step 10 — Choose Pages dialog, then 1 of 4 pages selected
    // ─────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: 'Choose Pages' }).click();
    await expect(page.getByRole('heading', { name: 'Select pages to include' })).toBeVisible();
    await capture(page, '11-select-pages-dialog');

    // Deselect all, then pick just page 1
    await page.getByRole('button', { name: 'Deselect all' }).click();
    await page.locator('[data-page="1"]').first().click();
    await page.getByRole('button', { name: 'Submit' }).click();

    // Back in the sidebar, pages status updated
    await expect(page.getByText(/1 of \d+ pages/)).toBeVisible();
    await capture(page, '12-sidebar-pages-updated');

    // ─────────────────────────────────────────────────────────────────
    // Step 11 — Create the workflow
    // ─────────────────────────────────────────────────────────────────
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for the sidebar to close and the workflow to appear in the table
    await expect(page.getByText(WORKFLOW_NAME)).toBeVisible({ timeout: 30000 });
    await capture(page, '13-workflow-list-with-new');

    // ─────────────────────────────────────────────────────────────────
    // Step 12 — Open the workflow workspace
    // ─────────────────────────────────────────────────────────────────
    await page.getByText(WORKFLOW_NAME).click();
    await expect(page.getByText('Document Type').first()).toBeVisible({ timeout: 15000 });
    await capture(page, '14-workflow-workspace');
  });
});
