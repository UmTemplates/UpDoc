import { expect, Page } from '@playwright/test';
import { ConstantHelper, test } from '@umbraco/playwright-testhelpers';

// ── Test data ───────────────────────────────────────────────────────────────

interface PdfTestCase {
	pdfName: string;
	label: string;
	titleSubstring: string;
}

const PDF_TEST_CASES: PdfTestCase[] = [
	{ pdfName: 'updoc-test-01.pdf', label: 'Dresden', titleSubstring: 'Dresden' },
	{ pdfName: 'updoc-test-02.pdf', label: 'Suffolk', titleSubstring: 'Suffolk' },
	{ pdfName: 'updoc-test-03.pdf', label: 'Andalucia', titleSubstring: 'Andaluc' },
];

// ── UI helpers (duplicated from create-from-source.spec.ts) ─────────────────

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

async function selectPdf(page: Page, pdfName: string) {
	const sourceDialog = page.locator('up-doc-modal');
	await sourceDialog.getByRole('button', { name: 'Choose' }).click();

	await expect(page.getByRole('heading', { name: 'Choose media' })).toBeVisible({ timeout: 10000 });

	const pdfFolderButton = page.getByRole('button', { name: 'PDF', exact: true });
	await pdfFolderButton.waitFor({ timeout: 5000 });
	await pdfFolderButton.dblclick();
	await page.waitForTimeout(1000);

	const pdfCard = page.locator('uui-card-media').filter({ hasText: pdfName });
	await pdfCard.waitFor({ timeout: 10000 });
	await pdfCard.click();

	const chooseButton = page.locator('umb-media-picker-modal').getByRole('button', { name: 'Choose' });
	await chooseButton.click();
}

// ── API helpers (run inside browser via page.evaluate) ──────────────────────

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

// ── Document value helpers ──────────────────────────────────────────────────

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

function findBlockByTitle(blocks: any[], titleValue: string): any | null {
	return (
		blocks.find((block: any) => {
			const titleProp = block.values?.find((v: any) => v.alias === 'featurePropertyFeatureTitle');
			return (
				titleProp?.value &&
				typeof titleProp.value === 'string' &&
				titleProp.value.toLowerCase().includes(titleValue.toLowerCase())
			);
		}) ?? null
	);
}

function getBlockProperty(block: any, alias: string): any {
	return block?.values?.find((v: any) => v.alias === alias)?.value ?? null;
}

// ── Assertion helpers ───────────────────────────────────────────────────────

function assertNoMarkdown(value: string, fieldName: string) {
	expect(value, `${fieldName} should not start with heading prefix`).not.toMatch(/^#{1,6}\s/);
	expect(value, `${fieldName} should not contain bold markers`).not.toContain('**');
}

function assertRichTextHasHtml(value: any, fieldName: string) {
	expect(value, `${fieldName} should be an RTE object`).toBeTruthy();
	const markup = typeof value === 'object' && value !== null ? value.markup : null;
	expect(markup, `${fieldName} should have markup`).toBeTruthy();
	expect(markup, `${fieldName} markup should contain HTML tags`).toMatch(/<[a-z]/);
	expect(markup, `${fieldName} markup should not have raw heading prefix`).not.toMatch(/^#{1,6}\s/m);
}

// ── Protected node IDs (NEVER delete these) ────────────────────────────────

const PROTECTED_IDS = new Set([
	'dd9b7287-a3ff-418e-893d-b84df7de7500', // Tailored Tours collection
	'd5b1563d-db6b-42bc-b4bf-950f33894ad2', // Home
	'b4e23226-0aed-487e-b26f-afb80cf992d8', // Group Tours collection
	'e1b0d653-6b50-4699-b5d2-9e1072a220d7', // Test Group Tours collection
]);

// ── Tests ───────────────────────────────────────────────────────────────────

test.describe('Document Verification — Tailored Tours', () => {
	let createdDocumentId: string | null = null;

	test.beforeEach(async ({ umbracoUi }) => {
		const page = umbracoUi.page;
		createdDocumentId = null;

		// Navigate to Content section
		await umbracoUi.goToBackOffice();
		await umbracoUi.content.goToSection(ConstantHelper.sections.content);

		// Expand Home node
		const expandHomeButton = page.getByRole('button', { name: 'Expand child items for Home' });
		await expandHomeButton.waitFor({ timeout: 15000 });
		await expandHomeButton.click();

		// Navigate to Tailored Tours collection
		const tailoredToursLink = page.getByRole('link', { name: 'Tailored Tours', exact: true });
		await tailoredToursLink.waitFor({ timeout: 15000 });
		await tailoredToursLink.click();

		// Wait for collection view to load
		await page.waitForTimeout(2000);
	});

	test.afterEach(async ({ umbracoUi }) => {
		// Cleanup: move created document to recycle bin (with safeguards)
		if (!createdDocumentId) return;

		// SAFEGUARD 1: Never delete protected nodes (collections, Home, etc.)
		if (PROTECTED_IDS.has(createdDocumentId)) {
			console.error(`BLOCKED: Refusing to delete protected node ${createdDocumentId}`);
			return;
		}

		try {
			// SAFEGUARD 2: Verify it's a Tailored Tour child, not a collection node
			// The document response only has documentType.id (GUID), not alias.
			// We need a second call to resolve the content type alias.
			const doc = await apiGet(umbracoUi.page, `/umbraco/management/api/v1/document/${createdDocumentId}`);
			const contentTypeId = doc?.documentType?.id;
			if (!contentTypeId) {
				console.error(`BLOCKED: Document ${createdDocumentId} has no documentType.id. Skipping cleanup.`);
				return;
			}

			const docType = await apiGet(umbracoUi.page, `/umbraco/management/api/v1/document-type/${contentTypeId}`);
			const contentTypeAlias = docType?.alias;
			if (contentTypeAlias !== 'tailoredTour') {
				console.error(`BLOCKED: Document ${createdDocumentId} is type "${contentTypeAlias}", not "tailoredTour". Skipping cleanup.`);
				return;
			}

			await apiPut(
				umbracoUi.page,
				`/umbraco/management/api/v1/document/${createdDocumentId}/move-to-recycle-bin`,
			);
		} catch (e) {
			console.warn(`Cleanup failed for document ${createdDocumentId}:`, e);
		}
	});

	for (const tc of PDF_TEST_CASES) {
		test(`Verify mapped fields: ${tc.label} (${tc.pdfName})`, async ({ umbracoUi }) => {
			const page = umbracoUi.page;

			// ── Step 1: Create from Source flow ──────────────────────────

			await page.getByRole('button', { name: 'Create from Source' }).click();
			await selectBlueprint(page, 'Tailored Tour', '[Tailored Tour Blueprint]');

			const sourceModal = page.locator('up-doc-modal');
			await expect(sourceModal).toBeVisible({ timeout: 10000 });

			await selectPdf(page, tc.pdfName);

			// Wait for extraction to complete
			const successStatus = sourceModal.locator('.extraction-status.success');
			await expect(successStatus).toBeVisible({ timeout: 30000 });

			// Verify document name is auto-populated and clean
			const nameInput = sourceModal.locator('uui-input#name input');
			const docNamePreCreate = await nameInput.inputValue();
			expect(docNamePreCreate, 'Document name should be populated').toBeTruthy();
			expect(docNamePreCreate, 'Document name should not start with #').not.toMatch(/^#/);

			// Click Create — capture URL before click so we can detect the change
			const urlBeforeCreate = page.url();
			const createButton = page.getByRole('button', { name: 'Create' }).last();
			await expect(createButton).toBeEnabled({ timeout: 5000 });
			await createButton.click();

			// ── Step 2: Capture document ID from URL ────────────────────

			// Wait for URL to change to a DIFFERENT document edit page
			await page.waitForFunction(
				(prevUrl) => window.location.href !== prevUrl && /\/edit\/[a-f0-9-]+/.test(window.location.href),
				urlBeforeCreate,
				{ timeout: 30000 },
			);
			const url = page.url();
			createdDocumentId = url.match(/\/edit\/([a-f0-9-]+)/)?.[1] ?? null;
			expect(createdDocumentId, 'Should have captured document ID from URL').toBeTruthy();
			expect(createdDocumentId, 'Should not capture parent collection ID').not.toBe('dd9b7287-a3ff-418e-893d-b84df7de7500');

			// Small delay for the document to be fully persisted
			await page.waitForTimeout(2000);

			// ── Step 3: Fetch document via API ──────────────────────────

			const doc = await apiGet(page, `/umbraco/management/api/v1/document/${createdDocumentId}`);
			expect(doc, 'API should return document').toBeTruthy();

			// ── Step 4: Verify document name ────────────────────────────

			const docName = doc.variants?.[0]?.name;
			expect(docName, 'Document variant name should exist').toBeTruthy();
			assertNoMarkdown(docName, 'Document name');

			// ── Step 5: Verify top-level text fields ────────────────────

			// pageTitle (text, mandatory)
			const pageTitle = getFieldValue(doc, 'pageTitle');
			expect(pageTitle, 'pageTitle should be populated').toBeTruthy();
			assertNoMarkdown(pageTitle!, 'pageTitle');
			expect(
				pageTitle!.toLowerCase(),
				`pageTitle should contain "${tc.titleSubstring}"`,
			).toContain(tc.titleSubstring.toLowerCase());

			// pageTitleShort (text, mandatory)
			const pageTitleShort = getFieldValue(doc, 'pageTitleShort');
			expect(pageTitleShort, 'pageTitleShort should be populated').toBeTruthy();
			assertNoMarkdown(pageTitleShort!, 'pageTitleShort');

			// pageDescription (textArea, mandatory)
			const pageDescription = getFieldValue(doc, 'pageDescription');
			expect(pageDescription, 'pageDescription should be populated').toBeTruthy();
			assertNoMarkdown(pageDescription!, 'pageDescription');

			// ── Step 6: Verify organiser Block List ─────────────────────

			const organiserBlocks = getBlockContainerBlocks(doc, 'organisers');
			expect(organiserBlocks.length, 'Organisers Block List should have at least one block').toBeGreaterThan(0);

			const organiserBlock = organiserBlocks[0];
			const organiserFields = [
				'organiserOrganisation',
				'organiserName',
				'organiserTelephone',
				'organiserEmail',
				'organiserAddress',
			];

			for (const alias of organiserFields) {
				const value = getBlockProperty(organiserBlock, alias);
				if (value && typeof value === 'string' && value.trim()) {
					// Verify it's not the blueprint dummy data
					expect(value, `${alias} should not be blueprint dummy "Organisation Test"`).not.toBe('Organisation Test');
					expect(value, `${alias} should not be blueprint dummy "Organiser Name Test"`).not.toBe('Organiser Name Test');
					assertNoMarkdown(value, alias);
				}
			}

			// organiserOrganisation specifically must be populated (it's the primary field)
			const orgValue = getBlockProperty(organiserBlock, 'organiserOrganisation');
			expect(orgValue, 'organiserOrganisation should be populated with PDF content').toBeTruthy();
			expect(orgValue, 'organiserOrganisation should not be blueprint dummy').not.toBe('Organisation Test');

			// ── Step 7: Verify block grid ───────────────────────────────

			const blocks = getBlockContainerBlocks(doc, 'blockGridTailoredTour');
			expect(blocks.length, 'Block grid should have blocks').toBeGreaterThan(0);

			// Features block
			const featuresBlock = findBlockByTitle(blocks, 'Features');
			if (featuresBlock) {
				const featureTitle = getBlockProperty(featuresBlock, 'featurePropertyFeatureTitle');
				expect(featureTitle, 'Features title should exist').toBeTruthy();
				assertNoMarkdown(String(featureTitle), 'Features title');

				const featureRichText = getBlockProperty(featuresBlock, 'richTextContent');
				assertRichTextHasHtml(featureRichText, 'Features richText');
			}

			// Accommodation block
			const accommodationBlock = findBlockByTitle(blocks, 'Accommodation');
			if (accommodationBlock) {
				const accTitle = getBlockProperty(accommodationBlock, 'featurePropertyFeatureTitle');
				expect(accTitle, 'Accommodation title should exist').toBeTruthy();
				assertNoMarkdown(String(accTitle), 'Accommodation title');

				const accRichText = getBlockProperty(accommodationBlock, 'richTextContent');
				assertRichTextHasHtml(accRichText, 'Accommodation richText');
			}

			// Suggested Itinerary block
			const itineraryBlock = findBlockByTitle(blocks, 'Suggested Itinerary');
			if (itineraryBlock) {
				const itinRichText = getBlockProperty(itineraryBlock, 'richTextContent');
				if (itinRichText) {
					assertRichTextHasHtml(itinRichText, 'Itinerary richText');
				}

				const itinSummary = getBlockProperty(itineraryBlock, 'featurePropertyFeatureSummary');
				if (itinSummary && typeof itinSummary === 'string' && itinSummary.trim()) {
					assertNoMarkdown(itinSummary, 'Itinerary summary');
				}
			}
		});
	}
});
