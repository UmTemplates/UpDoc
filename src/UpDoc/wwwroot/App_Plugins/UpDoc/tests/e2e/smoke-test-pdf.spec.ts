import { expect, Page } from '@playwright/test';
import { ConstantHelper, test } from '@umbraco/playwright-testhelpers';

/**
 * Generic smoke test for any PDF via environment variables.
 *
 * Usage:
 *   PDF_FOLDER=Winchester PDF_NAME="TTM5092 Winchester Istanbul lo.pdf" npx playwright test smoke-test-pdf
 *
 * Runs the full Create from Source flow and verifies:
 * - Document is created with a populated title (no markdown leaking)
 * - Block grid has at least one block
 * - Organiser block list has at least one block
 * - All text fields are free of markdown artifacts
 */

const PDF_FOLDER = process.env.PDF_FOLDER;
const PDF_NAME = process.env.PDF_NAME;

// ── UI helpers ───────────────────────────────────────────────────────────────

async function selectBlueprint(page: Page, docTypeName: string, blueprintName?: string) {
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible({ timeout: 10000 });

	await expect(page.getByRole('heading', { name: 'Choose a Document Type' })).toBeVisible();
	await page.locator('blueprint-picker-modal').getByRole('button', { name: docTypeName, exact: true }).click();

	await page.waitForTimeout(500);
	const bpButton = page.locator('blueprint-picker-modal').getByRole('button', { name: blueprintName ?? docTypeName, exact: true });
	await bpButton.waitFor({ timeout: 5000 });
	await bpButton.click();
}

async function selectPdf(page: Page, folderName: string, pdfName: string) {
	const sourceDialog = page.locator('up-doc-modal');
	await sourceDialog.getByRole('button', { name: 'Choose' }).click();

	await expect(page.getByRole('heading', { name: 'Choose media' })).toBeVisible({ timeout: 10000 });

	// Navigate into PDF folder
	const pdfFolderButton = page.getByRole('button', { name: 'PDF', exact: true });
	await pdfFolderButton.waitFor({ timeout: 5000 });
	await pdfFolderButton.dblclick();
	await page.waitForTimeout(1000);

	// Navigate into the society/organiser subfolder
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

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiGet(page: Page, path: string): Promise<any> {
	return page.evaluate(async (apiPath) => {
		const tokenJson = localStorage.getItem('umb:userAuthTokenResponse');
		if (!tokenJson) throw new Error('No auth token in localStorage');
		const { access_token } = JSON.parse(tokenJson);
		const resp = await fetch(apiPath, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
		});
		if (!resp.ok) throw new Error(`API GET ${apiPath} failed: ${resp.status}`);
		return resp.json();
	}, path);
}

async function apiPut(page: Page, path: string): Promise<void> {
	await page.evaluate(async (apiPath) => {
		const tokenJson = localStorage.getItem('umb:userAuthTokenResponse');
		if (!tokenJson) throw new Error('No auth token in localStorage');
		const { access_token } = JSON.parse(tokenJson);
		const resp = await fetch(apiPath, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
		});
		if (!resp.ok) throw new Error(`API PUT ${apiPath} failed: ${resp.status}`);
	}, path);
}

// ── Value helpers ────────────────────────────────────────────────────────────

function getFieldValue(doc: any, alias: string): string | null {
	const val = doc.values?.find((v: any) => v.alias === alias);
	if (!val?.value) return null;
	if (typeof val.value === 'string') return val.value;
	return null;
}

function getBlockContainerBlocks(doc: any, containerAlias: string): any[] {
	const containerVal = doc.values?.find((v: any) => v.alias === containerAlias);
	if (!containerVal?.value) return [];
	const parsed = typeof containerVal.value === 'string' ? JSON.parse(containerVal.value) : containerVal.value;
	return parsed?.contentData ?? [];
}

function getBlockProperty(block: any, alias: string): any {
	return block?.values?.find((v: any) => v.alias === alias)?.value ?? null;
}

// ── Protected node IDs (NEVER delete these) ──────────────────────────────────

const PROTECTED_IDS = new Set([
	'dd9b7287-a3ff-418e-893d-b84df7de7500', // Tailored Tours collection
	'd5b1563d-db6b-42bc-b4bf-950f33894ad2', // Home
	'b4e23226-0aed-487e-b26f-afb80cf992d8', // Group Tours collection
	'e1b0d653-6b50-4699-b5d2-9e1072a220d7', // Test Group Tours collection
]);

// ── Test ─────────────────────────────────────────────────────────────────────

test.describe('Smoke Test PDF', () => {
	test.skip(!PDF_FOLDER || !PDF_NAME, 'PDF_FOLDER and PDF_NAME env vars required');

	let createdDocumentId: string | null = null;

	test.afterEach(async ({ umbracoUi }) => {
		if (!createdDocumentId) return;
		if (PROTECTED_IDS.has(createdDocumentId)) {
			console.error(`BLOCKED: Refusing to delete protected node ${createdDocumentId}`);
			return;
		}

		try {
			const doc = await apiGet(umbracoUi.page, `/umbraco/management/api/v1/document/${createdDocumentId}`);
			const contentTypeId = doc?.documentType?.id;
			if (!contentTypeId) return;

			const docType = await apiGet(umbracoUi.page, `/umbraco/management/api/v1/document-type/${contentTypeId}`);
			if (docType?.alias !== 'tailoredTour') {
				console.error(`BLOCKED: Document is type "${docType?.alias}", not "tailoredTour". Skipping cleanup.`);
				return;
			}

			await apiPut(umbracoUi.page, `/umbraco/management/api/v1/document/${createdDocumentId}/move-to-recycle-bin`);
		} catch (e) {
			console.warn(`Cleanup failed for document ${createdDocumentId}:`, e);
		}
	});

	test(`Create and verify: ${PDF_NAME ?? 'unknown'}`, async ({ umbracoUi }) => {
		const page = umbracoUi.page;

		// Navigate to Tailored Tours collection
		await umbracoUi.goToBackOffice();
		await umbracoUi.content.goToSection(ConstantHelper.sections.content);

		const expandHomeButton = page.getByRole('button', { name: 'Expand child items for Home' });
		await expandHomeButton.waitFor({ timeout: 15000 });
		await expandHomeButton.click();

		const tailoredToursLink = page.getByRole('link', { name: 'Tailored Tours', exact: true });
		await tailoredToursLink.waitFor({ timeout: 15000 });
		await tailoredToursLink.click();
		await page.waitForTimeout(2000);

		// Create from Source
		await page.getByRole('button', { name: 'Create from Source' }).click();
		await selectBlueprint(page, 'Tailored Tour', '[Tailored Tour Blueprint]');

		const sourceModal = page.locator('up-doc-modal');
		await expect(sourceModal).toBeVisible({ timeout: 10000 });

		await selectPdf(page, PDF_FOLDER!, PDF_NAME!);

		// Wait for extraction
		const successStatus = sourceModal.locator('.extraction-status.success');
		await expect(successStatus).toBeVisible({ timeout: 30000 });

		// Verify document name is populated and clean
		const nameInput = sourceModal.locator('uui-input#name input');
		const docName = await nameInput.inputValue();
		expect(docName, 'Document name should be populated').toBeTruthy();
		expect(docName, 'Document name should not start with #').not.toMatch(/^#/);
		expect(docName, 'Document name should not contain mid-string # markers').not.toMatch(/\s#\s/);

		// Click Create
		const urlBeforeCreate = page.url();
		const createButton = page.getByRole('button', { name: 'Create' }).last();
		await expect(createButton).toBeEnabled({ timeout: 5000 });
		await createButton.click();

		// Wait for navigation to new document
		await page.waitForFunction(
			(prevUrl) => window.location.href !== prevUrl && /\/edit\/[a-f0-9-]+/.test(window.location.href),
			urlBeforeCreate,
			{ timeout: 30000 },
		);
		const url = page.url();
		createdDocumentId = url.match(/\/edit\/([a-f0-9-]+)/)?.[1] ?? null;
		expect(createdDocumentId, 'Should have captured document ID from URL').toBeTruthy();

		await page.waitForTimeout(2000);

		// Fetch document via API
		const doc = await apiGet(page, `/umbraco/management/api/v1/document/${createdDocumentId}`);
		expect(doc, 'API should return document').toBeTruthy();

		// Verify document name
		const variantName = doc.variants?.[0]?.name;
		expect(variantName, 'Document variant name should exist').toBeTruthy();
		expect(variantName, 'Name should not have markdown').not.toMatch(/^#{1,6}\s/);
		expect(variantName, 'Name should not have mid-string # markers').not.toMatch(/\s#{1,6}\s/);

		// Verify pageTitle
		const pageTitle = getFieldValue(doc, 'pageTitle');
		expect(pageTitle, 'pageTitle should be populated').toBeTruthy();
		expect(pageTitle, 'pageTitle should not have markdown').not.toMatch(/#{1,6}\s/);

		// Verify pageTitleShort
		const pageTitleShort = getFieldValue(doc, 'pageTitleShort');
		expect(pageTitleShort, 'pageTitleShort should be populated').toBeTruthy();

		// Verify pageDescription
		const pageDescription = getFieldValue(doc, 'pageDescription');
		expect(pageDescription, 'pageDescription should be populated').toBeTruthy();

		// Verify organiser Block List has content
		const organiserBlocks = getBlockContainerBlocks(doc, 'organisers');
		expect(organiserBlocks.length, 'Organisers should have at least one block').toBeGreaterThan(0);

		const orgValue = getBlockProperty(organiserBlocks[0], 'organiserOrganisation');
		expect(orgValue, 'organiserOrganisation should be populated').toBeTruthy();

		// Verify block grid has content
		const blocks = getBlockContainerBlocks(doc, 'blockGridTailoredTour');
		expect(blocks.length, 'Block grid should have blocks').toBeGreaterThan(0);

		// Check all block titles are markdown-free
		for (const block of blocks) {
			const title = getBlockProperty(block, 'featurePropertyFeatureTitle');
			if (title && typeof title === 'string') {
				expect(title, `Block title "${title}" should not have markdown`).not.toMatch(/#{1,6}\s/);
			}
		}
	});
});
