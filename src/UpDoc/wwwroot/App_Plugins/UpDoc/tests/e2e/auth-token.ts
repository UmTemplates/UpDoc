import { Page } from '@playwright/test';

/**
 * Fetches a Management API bearer token from the running backoffice.
 *
 * Umbraco 17.5.3 does not expose the token to scripts. `HideBackOfficeTokensHandler`
 * encrypts it into HTTP-only cookies, so `localStorage.getItem('umb:userAuthTokenResponse')`
 * returns null and a cookie-only `fetch` gets a 401: the Management API wants a bearer
 * token in the header, and cookies are only the refresh credential.
 *
 * The supported route is to ask the backoffice's own auth context. That means raising a
 * `umb:context-request` event, which is how every backoffice element resolves a context.
 * The event carries its properties directly rather than in `detail`, and `apiAlias`
 * defaults to `'default'`.
 *
 * Call this once per test and reuse the token. It requires a page already on `/umbraco`
 * with the backoffice booted.
 */
export async function getManagementApiToken(page: Page): Promise<string> {
	const token = await page.evaluate(async () => {
		return new Promise<string>((resolve, reject) => {
			let settled = false;
			const timer = setTimeout(() => {
				if (!settled) reject(new Error('Timed out waiting for UmbAuthContext'));
			}, 15000);

			const event: any = new Event('umb:context-request', {
				bubbles: true,
				composed: true,
				cancelable: true,
			});
			event.contextAlias = 'UmbAuthContext';
			event.apiAlias = 'default';
			event.stopAtContextMatch = true;
			event.callback = (context: any) => {
				if (settled) return true;
				settled = true;
				clearTimeout(timer);
				Promise.resolve(context.getLatestToken()).then(resolve).catch(reject);
				return true;
			};

			(document.querySelector('umb-app') || document.body).dispatchEvent(event);
		});
	});

	if (!token) throw new Error('UmbAuthContext returned an empty token');
	return token;
}

/**
 * Ensures the page is on the backoffice and its auth context is available, then returns
 * a token. Use when a spec has not already navigated to `/umbraco`.
 */
export async function ensureBackofficeToken(page: Page): Promise<string> {
	if (!page.url().includes('/umbraco')) {
		await page.goto('/umbraco');
	}
	await page.waitForFunction(() => !!document.querySelector('umb-app'), null, { timeout: 30000 });
	return getManagementApiToken(page);
}
