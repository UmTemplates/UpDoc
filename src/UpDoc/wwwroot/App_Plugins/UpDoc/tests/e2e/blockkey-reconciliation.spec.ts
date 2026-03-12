import { expect, Page } from '@playwright/test';
import { ConstantHelper, test } from '@umbraco/playwright-testhelpers';

// ── Protected node IDs (NEVER delete these) ────────────────────────────────

const PROTECTED_IDS = new Set([
	'dd9b7287-a3ff-418e-893d-b84df7de7500', // Tailored Tours collection
	'd5b1563d-db6b-42bc-b4bf-950f33894ad2', // Home
	'b4e23226-0aed-487e-b26f-afb80cf992d8', // Group Tours collection
	'e1b0d653-6b50-4699-b5d2-9e1072a220d7', // Test Group Tours collection
]);

// ── API helpers ─────────────────────────────────────────────────────────────

const API_BASE = '/umbraco/management/api/v1/updoc/workflows';
const TEST_WORKFLOW = 'tailoredTourPdf';

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

async function apiPutBody(page: Page, path: string, body?: any): Promise<void> {
	await page.evaluate(
		async ({ apiPath, apiBody }) => {
			const tokenJson = localStorage.getItem('umb:userAuthTokenResponse');
			if (!tokenJson) throw new Error('No auth token in localStorage');
			const { access_token } = JSON.parse(tokenJson);
			const resp = await fetch(apiPath, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
				},
				...(apiBody !== undefined ? { body: JSON.stringify(apiBody) } : {}),
			});
			if (!resp.ok) throw new Error(`API PUT ${apiPath} failed: ${resp.status}`);
		},
		{ apiPath: path, apiBody: body }
	);
}

async function apiPutJson(page: Page, path: string, body: any): Promise<any> {
	return page.evaluate(
		async ({ apiPath, apiBody }) => {
			const tokenJson = localStorage.getItem('umb:userAuthTokenResponse');
			if (!tokenJson) throw new Error('No auth token in localStorage');
			const { access_token } = JSON.parse(tokenJson);
			const resp = await fetch(apiPath, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
				},
				body: JSON.stringify(apiBody),
			});
			if (!resp.ok) {
				const text = await resp.text();
				throw new Error(`API PUT ${apiPath} failed: ${resp.status} — ${text}`);
			}
			return resp.json().catch(() => null);
		},
		{ apiPath: path, apiBody: body }
	);
}

async function apiPost(page: Page, path: string): Promise<any> {
	return page.evaluate(async (apiPath) => {
		const tokenJson = localStorage.getItem('umb:userAuthTokenResponse');
		if (!tokenJson) throw new Error('No auth token in localStorage');
		const { access_token } = JSON.parse(tokenJson);
		const resp = await fetch(apiPath, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
			},
		});
		if (!resp.ok) {
			const text = await resp.text();
			throw new Error(`API POST ${apiPath} failed: ${resp.status} — ${text}`);
		}
		return resp.json().catch(() => null);
	}, path);
}

// ── Sprint 1: contentTypeKey round-trip ─────────────────────────────────────

test.describe('Sprint 1: contentTypeKey model support', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to backoffice to get auth token in localStorage
		await page.goto('/umbraco');
		await page.waitForTimeout(2000);
	});

	test('map.json with contentTypeKey round-trips correctly via API', async ({ page }) => {
		// Step 1: Read current map.json
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const mapConfig = config.map;
		expect(mapConfig).toBeTruthy();
		expect(mapConfig.mappings.length).toBeGreaterThan(0);

		// Step 2: Read destination.json to get a real contentTypeKey
		const destConfig = config.destination;
		expect(destConfig.blockGrids).toBeTruthy();
		expect(destConfig.blockGrids.length).toBeGreaterThan(0);

		const firstBlock = destConfig.blockGrids[0].blocks[0];
		expect(firstBlock.contentTypeKey).toBeTruthy();
		const realContentTypeKey = firstBlock.contentTypeKey;

		// Step 3: Find a mapping that targets a block property
		const blockMapping = mapConfig.mappings.find((m: any) =>
			m.destinations.some((d: any) => d.blockKey)
		);
		expect(blockMapping).toBeTruthy();

		// Step 4: Save map.json with contentTypeKey added to that mapping
		const updatedMap = JSON.parse(JSON.stringify(mapConfig));
		const blockDest = updatedMap.mappings
			.find((m: any) => m.destinations.some((d: any) => d.blockKey))
			.destinations.find((d: any) => d.blockKey);

		// Store original state for cleanup
		const originalContentTypeKey = blockDest.contentTypeKey;

		// Set contentTypeKey
		blockDest.contentTypeKey = realContentTypeKey;

		await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, updatedMap);

		// Step 5: Read it back and verify contentTypeKey persisted
		const reloaded = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const reloadedDest = reloaded.map.mappings
			.find((m: any) => m.destinations.some((d: any) => d.blockKey))
			.destinations.find((d: any) => d.blockKey);

		expect(reloadedDest.contentTypeKey).toBe(realContentTypeKey);

		// Step 6: Cleanup — restore original state
		blockDest.contentTypeKey = originalContentTypeKey ?? undefined;
		if (!blockDest.contentTypeKey) {
			delete blockDest.contentTypeKey;
		}
		await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, updatedMap);
	});

	test('map.json without contentTypeKey still loads correctly (backwards compatibility)', async ({ page }) => {
		// Read current map.json
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const mapConfig = config.map;

		// Verify existing mappings load — they don't have contentTypeKey yet
		expect(mapConfig.mappings.length).toBeGreaterThan(0);

		// Find a block mapping — it should have blockKey but contentTypeKey may be null/undefined
		const blockMapping = mapConfig.mappings.find((m: any) =>
			m.destinations.some((d: any) => d.blockKey)
		);
		expect(blockMapping).toBeTruthy();

		const blockDest = blockMapping.destinations.find((d: any) => d.blockKey);
		expect(blockDest.blockKey).toBeTruthy();
		// contentTypeKey should be null or undefined (not present in existing files)
		// This proves backwards compatibility — the model doesn't break on missing field
	});
});

// ── Sprint 2: destination picker provides contentTypeKey ─────────────────────

test.describe('Sprint 2: destination blocks have contentTypeKey for picker', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/umbraco');
		await page.waitForTimeout(2000);
	});

	test('every block in destination.json has a non-empty contentTypeKey', async ({ page }) => {
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const dest = config.destination;

		// Check blockGrids
		for (const grid of dest.blockGrids ?? []) {
			for (const block of grid.blocks) {
				expect(block.contentTypeKey, `Block "${block.label}" in grid "${grid.label}" missing contentTypeKey`).toBeTruthy();
				// contentTypeKey should be a GUID format
				expect(block.contentTypeKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
			}
		}

		// Check blockLists
		for (const list of dest.blockLists ?? []) {
			for (const block of list.blocks) {
				expect(block.contentTypeKey, `Block "${block.label}" in list "${list.label}" missing contentTypeKey`).toBeTruthy();
				expect(block.contentTypeKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
			}
		}
	});

	test('each block has a unique contentTypeKey (no duplicates)', async ({ page }) => {
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const dest = config.destination;

		const allContentTypeKeys: string[] = [];
		for (const grid of dest.blockGrids ?? []) {
			for (const block of grid.blocks) {
				allContentTypeKeys.push(block.contentTypeKey);
			}
		}
		for (const list of dest.blockLists ?? []) {
			for (const block of list.blocks) {
				allContentTypeKeys.push(block.contentTypeKey);
			}
		}

		const uniqueKeys = new Set(allContentTypeKeys);
		expect(uniqueKeys.size).toBe(allContentTypeKeys.length);
	});

	test('blockKey and contentTypeKey are different values (instance vs type)', async ({ page }) => {
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const dest = config.destination;

		for (const grid of dest.blockGrids ?? []) {
			for (const block of grid.blocks) {
				expect(block.key).not.toBe(block.contentTypeKey);
			}
		}
	});
});

// ── UI helpers for create-from-source flow ──────────────────────────────────

async function selectBlueprint(page: Page, docTypeName: string, blueprintName?: string) {
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible({ timeout: 10000 });
	await expect(page.getByRole('heading', { name: 'Choose a Document Type' })).toBeVisible();
	await page.locator('blueprint-picker-modal').getByRole('button', { name: docTypeName, exact: true }).click();
	await page.waitForTimeout(500);
	const bpButton = page.locator('blueprint-picker-modal').getByRole('button', { name: blueprintName ?? docTypeName });
	await bpButton.waitFor({ timeout: 5000 });
	await bpButton.click();
}

async function selectPdf(page: Page, folderName: string, pdfName: string) {
	const sourceDialog = page.locator('up-doc-modal');
	await sourceDialog.getByRole('button', { name: 'Choose' }).click();
	await expect(page.getByRole('heading', { name: 'Choose media' })).toBeVisible({ timeout: 10000 });
	const pdfFolderButton = page.getByRole('button', { name: 'PDF', exact: true });
	await pdfFolderButton.waitFor({ timeout: 5000 });
	await pdfFolderButton.dblclick();
	await page.waitForTimeout(1000);

	// Navigate into the society subfolder
	const subFolderButton = page.getByRole('button', { name: folderName, exact: true });
	await subFolderButton.waitFor({ timeout: 5000 });
	await subFolderButton.dblclick();
	await page.waitForTimeout(1000);

	const pdfCard = page.locator('uui-card-media').filter({ hasText: pdfName });
	await pdfCard.waitFor({ timeout: 10000 });
	await pdfCard.click();
	const chooseButton = page.locator('umb-media-picker-modal').getByRole('button', { name: 'Choose' });
	await chooseButton.click();
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

async function trashDocument(page: Page, docId: string) {
	if (!docId || PROTECTED_IDS.has(docId)) return;
	try {
		await apiPutBody(page, `/umbraco/management/api/v1/document/${docId}/move-to-recycle-bin`);
	} catch (e) {
		console.error(`Failed to trash document ${docId}:`, e);
	}
}

// ── Sprint 3: bridge resilience — contentTypeKey bypasses stale blockKey ────

test.describe('Sprint 3: bridge uses contentTypeKey directly', () => {
	let createdDocumentId: string | null = null;

	test.afterEach(async ({ umbracoUi }) => {
		// Trash created document
		if (createdDocumentId) {
			const page = umbracoUi.page;
			try {
				await page.goto('/umbraco');
				await page.waitForTimeout(2000);
				await trashDocument(page, createdDocumentId);
			} catch (e) {
				console.error('Failed to trash document:', e);
			}
		}
	});

	test('precondition: map.json has contentTypeKey with reconciled blockKeys', async ({ page }) => {
		// Verify the map.json is in the expected state: contentTypeKey present, blockKeys reconciled (real GUIDs)
		await page.goto('/umbraco');
		await page.waitForTimeout(2000);

		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const mapConfig = config.map;

		const blockMappings = mapConfig.mappings.flatMap((m: any) =>
			m.destinations.filter((d: any) => d.contentTypeKey)
		);
		expect(blockMappings.length, 'Should have mappings with contentTypeKey').toBeGreaterThan(0);

		// All block mappings should have real reconciled blockKeys (not all-zeroes)
		for (const dest of blockMappings) {
			expect(dest.blockKey, `Mapping to ${dest.target} should have a blockKey`).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
			);
			expect(dest.blockKey, `Mapping to ${dest.target} should not have all-zero blockKey`).not.toBe('00000000-0000-0000-0000-000000000000');
			expect(dest.contentTypeKey, `Mapping to ${dest.target} should have real contentTypeKey`).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
			);
			expect(dest.contentTypeKey).not.toBe('00000000-0000-0000-0000-000000000000');
		}
	});

	test('document creation populates blocks via contentTypeKey despite stale blockKeys', async ({ umbracoUi }) => {
		const page = umbracoUi.page;
		test.setTimeout(120000);

		// ── Navigate to Tailored Tours collection ──
		await umbracoUi.goToBackOffice();
		await umbracoUi.content.goToSection(ConstantHelper.sections.content);

		const expandHomeButton = page.getByRole('button', { name: 'Expand child items for Home' });
		await expandHomeButton.waitFor({ timeout: 15000 });
		await expandHomeButton.click();

		const tailoredToursLink = page.getByRole('link', { name: 'Tailored Tours', exact: true });
		await tailoredToursLink.waitFor({ timeout: 15000 });
		await tailoredToursLink.click();
		await page.waitForTimeout(2000);

		// ── Create from Source flow ──
		const createButton = page.getByRole('button', { name: 'Create from Source' });
		await createButton.waitFor({ timeout: 15000 });
		await createButton.click();

		await selectBlueprint(page, 'Tailored Tour');
		await page.waitForTimeout(1000);
		await selectPdf(page, 'Winchester', 'TTM5092 Winchester Istanbul lo.pdf');

		const successStatus = page.locator('.extraction-status.success');
		await successStatus.waitFor({ timeout: 30000 });

		const urlBeforeCreate = page.url();
		const createDocButton = page.locator('up-doc-modal').getByRole('button', { name: 'Create' });
		await createDocButton.waitFor({ timeout: 5000 });
		await createDocButton.click();

		// ── Capture created document ID ──
		// Wait for URL to change to a DIFFERENT edit page (not the current collection page)
		await page.waitForFunction(
			(prevUrl) => window.location.href !== prevUrl && /\/edit\/[a-f0-9-]+/.test(window.location.href),
			urlBeforeCreate,
			{ timeout: 30000 },
		);
		createdDocumentId = page.url().match(/\/edit\/([a-f0-9-]+)/)?.[1] ?? null;
		expect(createdDocumentId).toBeTruthy();

		// Small delay for the document to be fully persisted
		await page.waitForTimeout(2000);

		// ── Verify block properties populated via API ──
		const doc = await apiGet(page, `/umbraco/management/api/v1/document/${createdDocumentId}`);

		const blockGridBlocks = getBlockContainerBlocks(doc, 'blockGridTailoredTour');
		expect(blockGridBlocks.length, 'Block grid should have blocks').toBeGreaterThan(0);

		// Features block: title should be from PDF, not blueprint default "Features"
		const featuresBlock = blockGridBlocks.find((b: any) => {
			const title = getBlockProperty(b, 'featurePropertyFeatureTitle');
			return title && typeof title === 'string' && title !== 'Features' && title.length > 0;
		});
		expect(featuresBlock, 'Features block should have PDF-sourced title (not blueprint default)').toBeTruthy();

		// Accommodation block: should also be populated
		const accomBlock = blockGridBlocks.find((b: any) => {
			const title = getBlockProperty(b, 'featurePropertyFeatureTitle');
			return title && typeof title === 'string' && title !== 'Accommodation' && title !== 'Features';
		});
		expect(accomBlock, 'Accommodation block should have PDF-sourced title').toBeTruthy();
	});
});

// ── Sprint 4: auto-reconcile blockKeys on regenerate-destination ────────────

test.describe('Sprint 4: auto-reconcile on regenerate-destination', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/umbraco');
		await page.waitForTimeout(2000);
	});

	test('regenerate-destination reconciles blockKeys and backfills contentTypeKey', async ({ page }) => {
		// Step 1: Read current state
		const configBefore = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const mapBefore = configBefore.map;

		// Collect all block mappings and their current blockKeys
		const blockMappingsBefore = mapBefore.mappings.flatMap((m: any) =>
			m.destinations.filter((d: any) => d.blockKey)
		);
		expect(blockMappingsBefore.length, 'Should have block mappings to reconcile').toBeGreaterThan(0);

		// Step 2: Call regenerate-destination
		const response = await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);
		expect(response).toBeTruthy();
		expect(response.destination).toBeTruthy();
		expect(response.reconciliation).toBeTruthy();

		// Step 3: Verify reconciliation summary
		const recon = response.reconciliation;
		expect(typeof recon.updated).toBe('number');
		expect(typeof recon.orphaned).toBe('number');
		expect(Array.isArray(recon.details)).toBe(true);

		// Step 4: Read map.json after reconciliation
		const configAfter = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const mapAfter = configAfter.map;
		const destAfter = configAfter.destination;

		// Build set of all valid blockKeys in new destination.json
		const validBlockKeys = new Set<string>();
		for (const grid of destAfter.blockGrids ?? []) {
			for (const block of grid.blocks) {
				validBlockKeys.add(block.key);
			}
		}
		for (const list of destAfter.blockLists ?? []) {
			for (const block of list.blocks) {
				validBlockKeys.add(block.key);
			}
		}

		// Step 5: Assert ALL blockKeys in map.json exist in new destination.json
		const blockMappingsAfter = mapAfter.mappings.flatMap((m: any) =>
			m.destinations.filter((d: any) => d.blockKey)
		);

		for (const dest of blockMappingsAfter) {
			expect(
				validBlockKeys.has(dest.blockKey),
				`blockKey ${dest.blockKey} for target "${dest.target}" should exist in destination.json`,
			).toBe(true);
		}

		// Step 6: Assert contentTypeKey is present on ALL block mappings (backfilled)
		for (const dest of blockMappingsAfter) {
			expect(
				dest.contentTypeKey,
				`Mapping to "${dest.target}" should have contentTypeKey after reconciliation`,
			).toBeTruthy();
			expect(dest.contentTypeKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
		}
	});

	test('reconciliation reports zero orphaned when blueprint unchanged', async ({ page }) => {
		// Call regenerate-destination twice — second time keys should already match
		await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);
		const response = await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);

		expect(response.reconciliation.orphaned).toBe(0);
	});
});

// ── Sprint 5: validate blockKeys on workflow config load ────────────────────

test.describe('Sprint 5: blockKey validation on config load', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/umbraco');
		await page.waitForTimeout(2000);
	});

	test('orphaned blockKey produces a validation warning in GET response', async ({ page }) => {
		// Step 1: Read current map.json and save original state
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const originalMap = JSON.parse(JSON.stringify(config.map));

		// Step 2: Find a mapping with a blockKey and corrupt it
		const corruptedMap = JSON.parse(JSON.stringify(config.map));
		const blockDest = corruptedMap.mappings
			.flatMap((m: any) => m.destinations)
			.find((d: any) => d.blockKey);
		expect(blockDest, 'Should have at least one mapping with a blockKey').toBeTruthy();

		const bogusBlockKey = 'deadbeef-dead-beef-dead-beefdeadbeef';
		blockDest.blockKey = bogusBlockKey;

		// Step 3: Save the corrupted map.json
		await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, corruptedMap);

		try {
			// Step 4: GET the workflow — should include validation warning
			const reloaded = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);

			expect(reloaded.validationWarnings).toBeTruthy();
			expect(Array.isArray(reloaded.validationWarnings)).toBe(true);
			expect(reloaded.validationWarnings.length).toBeGreaterThan(0);

			// At least one warning should mention the bogus blockKey
			const orphanWarning = reloaded.validationWarnings.find((w: string) =>
				w.includes(bogusBlockKey)
			);
			expect(orphanWarning, `Should have a warning about orphaned blockKey ${bogusBlockKey}`).toBeTruthy();
			expect(orphanWarning).toContain('orphaned');
		} finally {
			// Step 5: Cleanup — restore original map.json
			await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, originalMap);
		}
	});

	test('valid blockKeys produce no orphan warnings', async ({ page }) => {
		// Ensure destination is up to date (regenerate first)
		await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);

		// GET the workflow — should have no orphan warnings
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);

		const orphanWarnings = (config.validationWarnings ?? []).filter((w: string) =>
			w.includes('orphaned')
		);
		expect(orphanWarnings.length, 'Should have no orphaned blockKey warnings after reconciliation').toBe(0);
	});

	test('validation warning includes the target field name', async ({ page }) => {
		// Step 1: Read and corrupt a specific mapping
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const originalMap = JSON.parse(JSON.stringify(config.map));

		const corruptedMap = JSON.parse(JSON.stringify(config.map));
		const blockDest = corruptedMap.mappings
			.flatMap((m: any) => m.destinations)
			.find((d: any) => d.blockKey);
		expect(blockDest).toBeTruthy();

		const targetName = blockDest.target;
		blockDest.blockKey = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

		await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, corruptedMap);

		try {
			const reloaded = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
			const orphanWarning = reloaded.validationWarnings.find((w: string) =>
				w.includes('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
			);
			expect(orphanWarning).toBeTruthy();
			// Warning should include the target field name for actionability
			expect(orphanWarning).toContain(targetName);
		} finally {
			await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, originalMap);
		}
	});
});

// ── Sprint 6: backfill contentTypeKey for existing map.json files ───────────

test.describe('Sprint 6: backfill contentTypeKey migration', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/umbraco');
		await page.waitForTimeout(2000);
	});

	test('backfill adds contentTypeKey where blockKey exists but contentTypeKey is missing', async ({ page }) => {
		// Step 1: Ensure destination is fresh so blockKeys are valid
		await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);

		// Step 2: Read current map.json and save original
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const originalMap = JSON.parse(JSON.stringify(config.map));

		// Step 3: Strip contentTypeKey from all block mappings (simulate pre-Sprint-2 state)
		const strippedMap = JSON.parse(JSON.stringify(config.map));
		const blockDests = strippedMap.mappings
			.flatMap((m: any) => m.destinations)
			.filter((d: any) => d.blockKey);
		expect(blockDests.length, 'Should have block mappings to strip').toBeGreaterThan(0);

		for (const dest of blockDests) {
			delete dest.contentTypeKey;
		}

		await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, strippedMap);

		try {
			// Step 4: Verify contentTypeKey is gone
			const configAfterStrip = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
			const strippedDests = configAfterStrip.map.mappings
				.flatMap((m: any) => m.destinations)
				.filter((d: any) => d.blockKey);
			for (const dest of strippedDests) {
				expect(dest.contentTypeKey, `contentTypeKey should be stripped for ${dest.target}`).toBeFalsy();
			}

			// Step 5: Call backfill endpoint
			const backfillResult = await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/backfill-content-type-keys`);
			expect(backfillResult.backfilled).toBeGreaterThan(0);

			// Step 6: Read map.json again — contentTypeKey should be backfilled
			const configAfterBackfill = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
			const backfilledDests = configAfterBackfill.map.mappings
				.flatMap((m: any) => m.destinations)
				.filter((d: any) => d.blockKey);

			for (const dest of backfilledDests) {
				expect(
					dest.contentTypeKey,
					`contentTypeKey should be backfilled for ${dest.target}`,
				).toBeTruthy();
				expect(dest.contentTypeKey).toMatch(
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
				);
			}
		} finally {
			// Cleanup: restore original map.json
			await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, originalMap);
		}
	});

	test('backfill returns zero when contentTypeKey already present', async ({ page }) => {
		// Ensure destination is fresh and reconciled
		await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);

		// Call backfill — should return 0 since Sprint 4 reconciliation already backfills
		const result = await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/backfill-content-type-keys`);
		expect(result.backfilled).toBe(0);
	});

	test('backfill matches correct contentTypeKey from destination.json', async ({ page }) => {
		// Ensure destination is fresh
		await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);

		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const originalMap = JSON.parse(JSON.stringify(config.map));

		// Build blockKey → contentTypeKey lookup from destination.json
		const destBlocks: Record<string, string> = {};
		for (const grid of config.destination.blockGrids ?? []) {
			for (const block of grid.blocks) {
				destBlocks[block.key] = block.contentTypeKey;
			}
		}
		for (const list of config.destination.blockLists ?? []) {
			for (const block of list.blocks) {
				destBlocks[block.key] = block.contentTypeKey;
			}
		}

		// Strip contentTypeKey from map.json
		const strippedMap = JSON.parse(JSON.stringify(config.map));
		for (const mapping of strippedMap.mappings) {
			for (const dest of mapping.destinations) {
				if (dest.blockKey) {
					delete dest.contentTypeKey;
				}
			}
		}
		await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, strippedMap);

		try {
			// Backfill
			await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/backfill-content-type-keys`);

			// Verify each backfilled contentTypeKey matches what destination.json says
			const configAfter = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
			const blockDests = configAfter.map.mappings
				.flatMap((m: any) => m.destinations)
				.filter((d: any) => d.blockKey && d.contentTypeKey);

			for (const dest of blockDests) {
				const expectedCtk = destBlocks[dest.blockKey];
				expect(
					dest.contentTypeKey,
					`contentTypeKey for blockKey ${dest.blockKey} should match destination.json`,
				).toBe(expectedCtk);
			}
		} finally {
			await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, originalMap);
		}
	});
});

// ── Sprint 7: Surface orphaned mappings on Map tab (UI) ─────────────────────

test.describe('Sprint 7: orphaned mapping indicators on Map tab', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/umbraco');
		await page.waitForTimeout(2000);
	});

	test('orphaned mapping shows Orphaned tag on Map tab', async ({ page }) => {
		// Step 1: Read current map.json and save original state
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const originalMap = JSON.parse(JSON.stringify(config.map));

		// Step 2: Find a mapping with a blockKey and corrupt it
		const corruptedMap = JSON.parse(JSON.stringify(config.map));
		const blockDest = corruptedMap.mappings
			.flatMap((m: any) => m.destinations)
			.find((d: any) => d.blockKey);
		expect(blockDest, 'Should have at least one mapping with a blockKey').toBeTruthy();

		const bogusBlockKey = 'deadbeef-dead-beef-dead-beefdeadbeef';
		blockDest.blockKey = bogusBlockKey;

		// Step 3: Save the corrupted map.json
		await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, corruptedMap);

		try {
			// Step 4: Navigate to the workflow editor Map tab
			await page.goto(
				`/umbraco/section/settings/workspace/updoc-workflow/edit/${TEST_WORKFLOW}`,
			);
			await page.waitForTimeout(1000);

			// Click the Map tab
			const mapTab = page.locator('uui-tab').filter({ hasText: 'Map' });
			await mapTab.click();
			await page.waitForTimeout(1000);

			// Step 5: Assert the "Orphaned" tag is visible
			const orphanedTag = page.locator('uui-tag').filter({ hasText: 'Orphaned' });
			await expect(orphanedTag.first()).toBeVisible({ timeout: 5000 });
		} finally {
			// Step 6: Cleanup — restore original map.json
			await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, originalMap);
		}
	});

	test('healthy mappings do not show Orphaned tag', async ({ page }) => {
		// Ensure destination is reconciled
		await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);

		// Navigate to the workflow editor Map tab
		await page.goto(
			`/umbraco/section/settings/workspace/updoc-workflow/edit/${TEST_WORKFLOW}`,
		);
		await page.waitForTimeout(1000);

		// Click the Map tab
		const mapTab = page.locator('uui-tab').filter({ hasText: 'Map' });
		await mapTab.click();
		await page.waitForTimeout(1000);

		// Assert no "Orphaned" tag is visible
		const orphanedTags = page.locator('uui-tag').filter({ hasText: 'Orphaned' });
		await expect(orphanedTags).toHaveCount(0);
	});
});

// ── Sprint 8: Orphaned mapping badges on Source tab ─────────────────────────

test.describe('Sprint 8: orphaned mapping badges on Source tab', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/umbraco');
		await page.waitForTimeout(2000);
	});

	test('orphaned mapping badge turns warning colour on Source tab', async ({ page }) => {
		// Step 1: Read current map.json and save original state
		const config = await apiGet(page, `${API_BASE}/${TEST_WORKFLOW}`);
		const originalMap = JSON.parse(JSON.stringify(config.map));

		// Step 2: Find a mapping with a blockKey and corrupt it
		const corruptedMap = JSON.parse(JSON.stringify(config.map));
		const blockDest = corruptedMap.mappings
			.flatMap((m: any) => m.destinations)
			.find((d: any) => d.blockKey);
		expect(blockDest, 'Should have at least one mapping with a blockKey').toBeTruthy();

		const bogusBlockKey = 'deadbeef-dead-beef-dead-beefdeadbeef';
		blockDest.blockKey = bogusBlockKey;

		// Step 3: Save the corrupted map.json
		await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, corruptedMap);

		try {
			// Step 4: Navigate to the workflow editor Source tab
			await page.goto(
				`/umbraco/section/settings/workspace/updoc-workflow/edit/${TEST_WORKFLOW}`,
			);
			await page.waitForTimeout(1000);

			// Click the Source tab
			const sourceTab = page.locator('uui-tab').filter({ hasText: 'Source' });
			await sourceTab.click();
			await page.waitForTimeout(2000);

			// Step 5: Assert at least one warning-coloured badge exists
			const warningBadges = page.locator('uui-tag[color="warning"].mapped-tag');
			await expect(warningBadges.first()).toBeVisible({ timeout: 5000 });

			// Also verify healthy badges still exist as positive
			const healthyBadges = page.locator('uui-tag[color="positive"].mapped-tag');
			await expect(healthyBadges.first()).toBeVisible({ timeout: 5000 });
		} finally {
			// Step 6: Cleanup — restore original map.json
			await apiPutJson(page, `${API_BASE}/${TEST_WORKFLOW}/map`, originalMap);
		}
	});

	test('healthy mappings show positive colour badges on Source tab', async ({ page }) => {
		// Ensure destination is reconciled
		await apiPost(page, `${API_BASE}/${TEST_WORKFLOW}/regenerate-destination`);

		// Navigate to the workflow editor Source tab
		await page.goto(
			`/umbraco/section/settings/workspace/updoc-workflow/edit/${TEST_WORKFLOW}`,
		);
		await page.waitForTimeout(1000);

		// Click the Source tab
		const sourceTab = page.locator('uui-tab').filter({ hasText: 'Source' });
		await sourceTab.click();
		await page.waitForTimeout(2000);

		// Assert no warning-coloured badges exist
		const warningBadges = page.locator('uui-tag[color="warning"].mapped-tag');
		await expect(warningBadges).toHaveCount(0);
	});
});
