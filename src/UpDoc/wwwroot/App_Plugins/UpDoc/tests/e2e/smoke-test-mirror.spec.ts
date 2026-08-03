import { expect, Page } from '@playwright/test';
import { ConstantHelper, test } from '@umbraco/playwright-testhelpers';
import { ensureBackofficeToken } from './auth-token';

/**
 * Smoke test for the Tailored Travel mirror.
 *
 * A clone of smoke-test-pdf.spec.ts, which cannot run here: it navigates into a
 * "PDF" folder and then a society subfolder, matching the test site's media
 * layout. The mirror is a copy of the live site, where the tour PDFs sit flat in
 * a single top-level "Tailored Tours" folder with the society in the filename.
 *
 * Usage (the mirror needs its own target — see playwright.config.ts):
 *   TARGET=mirror PDF_NAME="TTM5168 Topsham Battersea London Sinatra lo.pdf" \
 *     npx playwright test smoke-test-mirror
 *
 * PDF_FOLDER defaults to "Tailored Tours" and only needs setting for a PDF
 * somewhere else in the library.
 *
 * Unlike the test site's smoke test this asserts no specific duration or price:
 * the mirror's PDFs are real client brochures rather than a fixed fixture, so
 * the values differ per file. It checks the shape of what was imported, not
 * particular numbers.
 */

const PDF_FOLDER = process.env.PDF_FOLDER ?? 'Tailored Tours';
const PDF_NAME = process.env.PDF_NAME;

// ── UI helpers ───────────────────────────────────────────────────────────────

async function selectBlueprint(page: Page, docTypeName: string, blueprintName?: string) {
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible({ timeout: 10000 });

	await expect(page.getByRole('heading', { name: 'Choose a Document Type' })).toBeVisible();
	await page.locator('blueprint-picker-modal').getByRole('button', { name: docTypeName, exact: true }).click();

	await page.waitForTimeout(500);
	const bpButton = page
		.locator('blueprint-picker-modal')
		.getByRole('button', { name: blueprintName ?? docTypeName, exact: true });
	await bpButton.waitFor({ timeout: 5000 });
	await bpButton.click();
}

/**
 * Picks a PDF from the media library.
 *
 * folderPath may name nested folders with "/" ("PDF/Winchester"), so the same
 * helper copes with either library layout.
 */
async function selectPdf(page: Page, folderPath: string, pdfName: string) {
	const sourceDialog = page.locator('up-doc-modal');
	await sourceDialog.getByRole('button', { name: 'Choose' }).click();

	await expect(page.getByRole('heading', { name: 'Choose media' })).toBeVisible({ timeout: 10000 });

	for (const segment of folderPath.split('/').map((s) => s.trim()).filter(Boolean)) {
		const folderButton = page.getByRole('button', { name: segment, exact: true });
		await folderButton.waitFor({ timeout: 5000 });
		await folderButton.dblclick();
		await page.waitForTimeout(1000);
	}

	const pdfCard = page.locator('uui-card-media').filter({ hasText: pdfName });
	await pdfCard.waitFor({ timeout: 10000 });
	await pdfCard.click();

	const chooseButton = page.locator('umb-media-picker-modal').getByRole('button', { name: 'Choose' });
	await chooseButton.click();
}

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiGet(page: Page, path: string): Promise<any> {
	const token = await ensureBackofficeToken(page);
	return page.evaluate(
		async ({ apiPath, accessToken }) => {
			const resp = await fetch(apiPath, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (!resp.ok) throw new Error(`API GET ${apiPath} failed: ${resp.status}`);
			return resp.json();
		},
		{ apiPath: path, accessToken: token },
	);
}

async function apiPut(page: Page, path: string): Promise<void> {
	const token = await ensureBackofficeToken(page);
	await page.evaluate(
		async ({ apiPath, accessToken }) => {
			const resp = await fetch(apiPath, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (!resp.ok) throw new Error(`API PUT ${apiPath} failed: ${resp.status}`);
		},
		{ apiPath: path, accessToken: token },
	);
}

// ── Value helpers ────────────────────────────────────────────────────────────

function getFieldValue(doc: any, alias: string): string | null {
	const val = doc.values?.find((v: any) => v.alias === alias);
	if (!val?.value) return null;
	if (typeof val.value === 'string') return val.value;
	return null;
}

function getRawFieldValue(doc: any, alias: string): unknown {
	return doc.values?.find((v: any) => v.alias === alias)?.value ?? null;
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

// ── Test ─────────────────────────────────────────────────────────────────────

test.describe('Smoke Test — Tailored Travel mirror', () => {
	test.skip(!PDF_NAME, 'PDF_NAME env var required');
	test.skip(
		process.env.TARGET !== 'mirror',
		'Runs against the mirror only — pass TARGET=mirror',
	);

	let createdDocumentId: string | null = null;

	test.afterEach(async ({ umbracoUi }) => {
		if (!createdDocumentId) return;

		// The mirror holds a copy of real client content, so cleanup checks the
		// document type before deleting rather than relying on a list of protected
		// ids: anything that is not a freshly created tailoredTour is left alone.
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

		await umbracoUi.goToBackOffice();
		await umbracoUi.content.goToSection(ConstantHelper.sections.content);

		const expandHomeButton = page.getByRole('button', { name: 'Expand child items for Home' });
		await expandHomeButton.waitFor({ timeout: 15000 });
		await expandHomeButton.click();

		const tailoredToursLink = page.getByRole('link', { name: 'Tailored Tours', exact: true });
		await tailoredToursLink.waitFor({ timeout: 15000 });
		await tailoredToursLink.click();
		await page.waitForTimeout(2000);

		await page.getByRole('button', { name: 'Create from Source' }).click();
		await selectBlueprint(page, 'Tailored Tour', '[Tailored Tour Blueprint]');

		const sourceModal = page.locator('up-doc-modal');
		await expect(sourceModal).toBeVisible({ timeout: 10000 });

		await selectPdf(page, PDF_FOLDER, PDF_NAME!);

		const successStatus = sourceModal.locator('.extraction-status.success');
		await expect(successStatus).toBeVisible({ timeout: 30000 });

		const nameInput = sourceModal.locator('uui-input#name input');
		const docName = await nameInput.inputValue();
		expect(docName, 'Document name should be populated').toBeTruthy();
		expect(docName, 'Document name should not start with #').not.toMatch(/^#/);
		expect(docName, 'Document name should not contain mid-string # markers').not.toMatch(/\s#\s/);

		const urlBeforeCreate = page.url();
		const createButton = page.getByRole('button', { name: 'Create' }).last();
		await expect(createButton).toBeEnabled({ timeout: 5000 });
		await createButton.click();

		await page.waitForFunction(
			(prevUrl) => window.location.href !== prevUrl && /\/edit\/[a-f0-9-]+/.test(window.location.href),
			urlBeforeCreate,
			{ timeout: 30000 },
		);
		const url = page.url();
		createdDocumentId = url.match(/\/edit\/([a-f0-9-]+)/)?.[1] ?? null;
		expect(createdDocumentId, 'Should have captured document ID from URL').toBeTruthy();

		await page.waitForTimeout(2000);

		const doc = await apiGet(page, `/umbraco/management/api/v1/document/${createdDocumentId}`);
		expect(doc, 'API should return document').toBeTruthy();

		const variantName = doc.variants?.[0]?.name;
		expect(variantName, 'Document variant name should exist').toBeTruthy();
		expect(variantName, 'Name should not have markdown').not.toMatch(/^#{1,6}\s/);
		expect(variantName, 'Name should not have mid-string # markers').not.toMatch(/\s#{1,6}\s/);

		const pageTitle = getFieldValue(doc, 'pageTitle');
		expect(pageTitle, 'pageTitle should be populated').toBeTruthy();
		expect(pageTitle, 'pageTitle should not have markdown').not.toMatch(/#{1,6}\s/);

		expect(getFieldValue(doc, 'pageTitleShort'), 'pageTitleShort should be populated').toBeTruthy();
		expect(getFieldValue(doc, 'pageDescription'), 'pageDescription should be populated').toBeTruthy();

		// Duration and price vary per brochure, so assert the type rather than a
		// value: the point is that they were coerced from text, not left as strings.
		const tourDuration = getRawFieldValue(doc, 'pagePropertyTourDuration');
		expect(typeof tourDuration, 'Tour Duration should be a number, not a string').toBe('number');

		const tourPrice = getRawFieldValue(doc, 'pagePropertyTourPriceFrom');
		expect(typeof tourPrice, 'Tour Price should be a number, not a string').toBe('number');

		// The imported file itself should land in the brochure media picker (#124).
		// Its value is an array of picker entries, each carrying the media key.
		const brochureRaw = getRawFieldValue(doc, 'brochurePdf');
		const brochure = typeof brochureRaw === 'string' ? JSON.parse(brochureRaw) : brochureRaw;
		expect(Array.isArray(brochure), 'brochurePdf should hold a media picker array').toBe(true);
		expect(brochure.length, 'brochurePdf should reference exactly one media item').toBe(1);
		expect(brochure[0]?.mediaKey, 'brochurePdf entry should carry a media key').toBeTruthy();

		const organiserBlocks = getBlockContainerBlocks(doc, 'organisers');
		expect(organiserBlocks.length, 'Organisers should have at least one block').toBeGreaterThan(0);
		expect(
			getBlockProperty(organiserBlocks[0], 'organiserOrganisation'),
			'organiserOrganisation should be populated',
		).toBeTruthy();

		const blocks = getBlockContainerBlocks(doc, 'blockGridTailoredTour');
		expect(blocks.length, 'Block grid should have blocks').toBeGreaterThan(0);

		for (const block of blocks) {
			const title = getBlockProperty(block, 'featurePropertyFeatureTitle');
			if (title && typeof title === 'string') {
				expect(title, `Block title "${title}" should not have markdown`).not.toMatch(/#{1,6}\s/);
			}
		}
	});
});
