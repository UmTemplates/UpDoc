import { expect, Page } from '@playwright/test';
import { ConstantHelper, test } from '@umbraco/playwright-testhelpers';

// Test PDF — stored in Media > PDF > Winchester
const TEST_PDF = 'TTM5092 Winchester Istanbul lo.pdf';
const TEST_PDF_FOLDER = 'Winchester';

/**
 * Selects a blueprint through the two-step blueprint picker dialog.
 * Step 1: Click the document type (e.g. "Group Tour")
 * Step 2: Click the blueprint (e.g. "Group Tour" blueprint)
 */
async function selectBlueprint(page: Page, docTypeName: string, blueprintName?: string) {
  // Wait for the blueprint picker dialog to appear
  // Note: heading and button queries use page-level scope because UUI shadow DOM
  // prevents scoped queries inside getByRole('dialog')
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 10000 });

  // Step 1: Select document type
  await expect(page.getByRole('heading', { name: 'Choose a Document Type' })).toBeVisible();
  await page.locator('blueprint-picker-modal').getByRole('button', { name: docTypeName, exact: true }).click();

  // Step 2: Select blueprint (dialog heading changes)
  await page.waitForTimeout(500);
  const bpButton = page.locator('blueprint-picker-modal').getByRole('button', { name: blueprintName ?? docTypeName });
  await bpButton.waitFor({ timeout: 5000 });
  await bpButton.click();
}

/**
 * Selects a PDF from the media picker within the source modal.
 */
async function selectPdf(page: Page, folderName: string, pdfName: string) {
  const sourceDialog = page.locator('up-doc-modal');
  await sourceDialog.getByRole('button', { name: 'Choose' }).click();

  await expect(page.getByRole('heading', { name: 'Choose media' })).toBeVisible({ timeout: 10000 });

  // Navigate into PDF folder
  const pdfFolderButton = page.getByRole('button', { name: 'PDF', exact: true });
  await pdfFolderButton.waitFor({ timeout: 5000 });
  await pdfFolderButton.dblclick();
  await page.waitForTimeout(1000);

  // Navigate into the society subfolder
  const subFolderButton = page.getByRole('button', { name: folderName, exact: true });
  await subFolderButton.waitFor({ timeout: 5000 });
  await subFolderButton.dblclick();
  await page.waitForTimeout(1000);

  // Select the PDF
  const pdfCard = page.locator('uui-card-media').filter({ hasText: pdfName });
  await pdfCard.waitFor({ timeout: 10000 });
  await pdfCard.click();

  const chooseButton = page.locator('umb-media-picker-modal').getByRole('button', { name: 'Choose' });
  await chooseButton.click();
}

test.describe('Create from Source', () => {

  test.beforeEach(async ({ umbracoUi }) => {
    const page = umbracoUi.page;

    // Navigate to the Content section
    await umbracoUi.goToBackOffice();
    await umbracoUi.content.goToSection(ConstantHelper.sections.content);

    // Expand the Home node to reveal child nodes
    const expandHomeButton = page.getByRole('button', { name: 'Expand child items for Home' });
    await expandHomeButton.waitFor({ timeout: 15000 });
    await expandHomeButton.click();

    // Navigate to Tailored Tours collection
    const tailoredToursLink = page.getByRole('link', { name: 'Tailored Tours', exact: true });
    await tailoredToursLink.waitFor({ timeout: 15000 });
    await tailoredToursLink.click();

    // Wait for the collection view to load
    await page.waitForTimeout(2000);
  });

  test('Create from Source button is visible on Tailored Tours collection', async ({ umbracoUi }) => {
    // The "Create from Source" button should be visible in the collection toolbar
    const createButton = umbracoUi.page.getByRole('button', { name: 'Create from Source' });
    await expect(createButton).toBeVisible({ timeout: 15000 });
  });

  test('Blueprint picker opens when clicking Create from Source', async ({ umbracoUi }) => {
    const page = umbracoUi.page;

    // Click the Create from Source button
    await page.getByRole('button', { name: 'Create from Source' }).click();

    // Blueprint picker dialog should open showing "Choose a Document Type"
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Choose a Document Type' })).toBeVisible();

    // Should show "Tailored Tour" as a selectable option
    const modal = page.locator('blueprint-picker-modal');
    await expect(modal.getByRole('button', { name: 'Tailored Tour' })).toBeVisible();
  });

  test('Full flow: Create document from PDF', async ({ umbracoUi }) => {
    const page = umbracoUi.page;

    // Step 1: Click Create from Source → Blueprint picker
    await page.getByRole('button', { name: 'Create from Source' }).click();
    await selectBlueprint(page, 'Tailored Tour', '[Tailored Tour Blueprint]');

    // Step 2: Source modal should open
    const sourceModal = page.locator('up-doc-modal');
    await expect(sourceModal).toBeVisible({ timeout: 10000 });

    // Step 3: Select test PDF
    await selectPdf(page, TEST_PDF_FOLDER, TEST_PDF);

    // Step 4: Wait for extraction to complete
    const extractingStatus = sourceModal.locator('.extraction-status.extracting');
    if (await extractingStatus.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(extractingStatus).not.toBeVisible({ timeout: 30000 });
    }

    // Verify extraction succeeded
    const successStatus = sourceModal.locator('.extraction-status.success');
    await expect(successStatus).toBeVisible({ timeout: 15000 });

    // Step 5: Document name should be auto-populated
    const nameInput = sourceModal.locator('uui-input#name input');
    await expect(nameInput).not.toBeEmpty({ timeout: 10000 });

    // Step 6: Create button should be enabled
    const createDocButton = page.getByRole('button', { name: 'Create' }).last();
    await expect(createDocButton).toBeEnabled({ timeout: 5000 });

    // Step 7: Click Create
    await createDocButton.click();

    // Step 8: Modal should close after document creation
    await expect(sourceModal).not.toBeVisible({ timeout: 15000 });
  });

  test('Content tab shows mapped preview after extraction', async ({ umbracoUi }) => {
    const page = umbracoUi.page;

    // Click Create from Source → select blueprint
    await page.getByRole('button', { name: 'Create from Source' }).click();
    await selectBlueprint(page, 'Tailored Tour', '[Tailored Tour Blueprint]');

    // Source modal should open
    const sourceModal = page.locator('up-doc-modal');
    await expect(sourceModal).toBeVisible({ timeout: 10000 });

    // Select test PDF
    await selectPdf(page, TEST_PDF_FOLDER, TEST_PDF);

    // Wait for extraction to succeed
    const successStatus = sourceModal.locator('.extraction-status.success');
    await expect(successStatus).toBeVisible({ timeout: 30000 });

    // Click Content tab
    const contentTab = sourceModal.locator('uui-tab').filter({ hasText: 'Content' });
    await expect(contentTab).toBeEnabled({ timeout: 5000 });
    await contentTab.click();

    // Should show mapped content preview cards
    const sectionCards = sourceModal.locator('.section-card');
    const cardCount = await sectionCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
});
