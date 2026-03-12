import { marked } from 'marked';

/**
 * Converts Markdown to HTML using the marked library.
 */
export function markdownToHtml(markdown: string): string {
	if (!markdown) return '';

	try {
		const html = marked.parse(markdown, {
			gfm: true,
			breaks: false,
		});

		if (typeof html === 'string') {
			return html;
		}

		// Fallback for async (shouldn't happen with sync config)
		console.warn('marked returned Promise, using fallback');
		return `<p>${markdown}</p>`;
	} catch (error) {
		console.error('Markdown conversion failed:', error);
		return `<p>${markdown.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
	}
}

/**
 * Normalizes text to kebab-case for use as a section ID.
 * Mirrors the C# NormalizeToKebabCase in ContentTransformService.
 * "FEATURES" → "features", "WHAT WE WILL SEE" → "what-we-will-see"
 */
export function normalizeToKebabCase(text: string): string {
	return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Strips Markdown formatting from text, returning plain text.
 * Used when mapping markdown content to plain text fields (text, textArea).
 * Removes heading prefixes (# ## ###), bold/italic markers, bullet prefixes, etc.
 */
export function stripMarkdown(markdown: string): string {
	if (!markdown) return '';
	return markdown
		.replace(/^#{1,6}\s+/gm, '')      // heading prefixes at line start
		.replace(/\s#{1,6}\s+/g, ' ')     // heading prefixes mid-string (concatenated headings)
		.replace(/\*\*(.+?)\*\*/g, '$1')  // bold
		.replace(/\*(.+?)\*/g, '$1')      // italic
		.replace(/~~(.+?)~~/g, '$1')      // strikethrough
		.replace(/`(.+?)`/g, '$1')        // inline code
		.replace(/^\s*[-*+]\s+/gm, '')    // bullet list prefixes
		.replace(/^\s*\d+\.\s+/gm, '')    // numbered list prefixes
		.replace(/^\s*>\s+/gm, '')        // blockquote prefixes
		.trim();
}

/**
 * Builds an Umbraco RTE (Rich Text Editor) value object from HTML markup.
 */
export function buildRteValue(htmlContent: string) {
	return {
		blocks: {
			contentData: [],
			settingsData: [],
			expose: [],
			Layout: {},
		},
		markup: htmlContent,
	};
}
