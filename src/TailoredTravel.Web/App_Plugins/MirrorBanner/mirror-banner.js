/**
 * Marks this install as the local mirror rather than the live Tailored Travel site.
 *
 * Registered as a `bundle` in umbraco-package.json, which Umbraco loads on every
 * backoffice startup. A `theme` would have been the obvious choice, but themes are
 * a per-user preference stored in localStorage and selected from the profile
 * screen, so it would only apply once someone remembered to turn it on and would
 * vanish if browser data were cleared. This always applies.
 */

const STYLESHEET_HREF = '/App_Plugins/MirrorBanner/mirror-banner.css';

function injectStylesheet() {
	if (document.querySelector(`link[href="${STYLESHEET_HREF}"]`)) return;

	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = STYLESHEET_HREF;
	document.head.appendChild(link);
}

injectStylesheet();

export const onInit = () => {
	injectStylesheet();
};
