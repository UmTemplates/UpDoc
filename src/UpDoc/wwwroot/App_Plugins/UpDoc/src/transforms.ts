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
 * Coerces a captured string to an integer for number-typed destination fields.
 * Strips thousands separators and surrounding non-digit text ("£1,199" → 1199).
 * Returns null when no integer can be parsed — callers should leave the blueprint
 * default in place rather than writing garbage.
 */
export function coerceToInteger(value: string): number | null {
	if (!value) return null;
	// Remove thousands separators, then take the first run of digits (with optional sign).
	const cleaned = value.replace(/,/g, '');
	const match = cleaned.match(/-?\d+/);
	if (!match) return null;
	const parsed = parseInt(match[0], 10);
	return Number.isNaN(parsed) ? null : parsed;
}

/** Month names and common abbreviations, indexed to their 1-based month number. */
const MONTH_NAMES: Record<string, number> = {
	january: 1, jan: 1,
	february: 2, feb: 2,
	march: 3, mar: 3,
	april: 4, apr: 4,
	may: 5,
	june: 6, jun: 6,
	july: 7, jul: 7,
	august: 8, aug: 8,
	september: 9, sept: 9, sep: 9,
	october: 10, oct: 10,
	november: 11, nov: 11,
	december: 12, dec: 12,
};

/** Zero-pads to two digits for ISO output. */
function pad2(n: number): string {
	return n < 10 ? `0${n}` : String(n);
}

/**
 * True when the parts describe a real calendar date. Guards against dates that
 * look plausible but do not exist ("31 February"), which a Date round-trip
 * would silently roll forward into March rather than rejecting.
 */
function isRealDate(year: number, month: number, day: number): boolean {
	if (month < 1 || month > 12 || day < 1 || day > 31) return false;
	const d = new Date(Date.UTC(year, month - 1, day));
	return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/**
 * Coerces a captured string to an ISO date (yyyy-MM-dd) for date-typed
 * destination fields. Returns null when the input cannot be parsed
 * unambiguously — callers should leave the blueprint default in place rather
 * than writing a wrong date.
 *
 * Accepts named months in either order, with or without ordinal suffixes:
 *   "26th September 2027", "26 Sept 2027", "September 26 2027"
 * and ISO input, which passes through validated: "2027-09-26".
 *
 * DELIBERATELY REFUSES all-numeric formats such as "06/07/2027". That is
 * 6 July to a British reader and 7 June to an American one, and nothing in the
 * source document says which. Guessing would write a wrong date that looks
 * entirely valid, with no error to notice. Refusing leaves the field empty,
 * which is visible. A future per-workflow date-format setting can then enable
 * these formats explicitly, rather than having to correct data already stored.
 *
 * ISO output matters: Umbraco parses this string with DateTimeOffset.TryParse,
 * which is culture-dependent. ISO is unambiguous in every culture.
 */
export function coerceToDateOnly(value: string): string | null {
	if (!value) return null;

	// Strip ordinal suffixes ("26th" → "26") so the number parses cleanly.
	const cleaned = value.trim().replace(/(\d+)(st|nd|rd|th)\b/gi, '$1');

	// ISO first — already unambiguous, but still validated as a real date.
	const iso = cleaned.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
	if (iso) {
		const [, y, m, d] = iso;
		const year = Number(y), month = Number(m), day = Number(d);
		return isRealDate(year, month, day) ? `${year}-${pad2(month)}-${pad2(day)}` : null;
	}

	const monthPattern = Object.keys(MONTH_NAMES).join('|');

	// "26 September 2027" — day first.
	const dayFirst = cleaned.match(new RegExp(`\\b(\\d{1,2})\\s+(${monthPattern})\\.?,?\\s+(\\d{4})\\b`, 'i'));
	// "September 26 2027" / "September 26, 2027" — month first.
	const monthFirst = cleaned.match(new RegExp(`\\b(${monthPattern})\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`, 'i'));

	let year: number, month: number, day: number;
	if (dayFirst) {
		day = Number(dayFirst[1]);
		month = MONTH_NAMES[dayFirst[2].toLowerCase()];
		year = Number(dayFirst[3]);
	} else if (monthFirst) {
		month = MONTH_NAMES[monthFirst[1].toLowerCase()];
		day = Number(monthFirst[2]);
		year = Number(monthFirst[3]);
	} else {
		// No named month found. Numeric-only input lands here and is refused.
		return null;
	}

	return isRealDate(year, month, day) ? `${year}-${pad2(month)}-${pad2(day)}` : null;
}

/**
 * Wraps an ISO date in the JSON shape Umbraco's date property editors persist.
 *
 * All four v17 date editors (DateOnly, DateTime, DateTimeUnspecified,
 * DateTimeWithTimeZone) derive from DateTimePropertyEditorBase, which declares
 * ValueType = ValueTypes.Json. A bare "2027-09-26" is therefore deserialised as
 * JSON and rejected — the value must be this object.
 *
 * timeZone is null: the DateOnly editor ships with no configuration, so the
 * TimeZoneMode.Custom validator does not apply.
 */
export function buildDateValue(isoDate: string) {
	return {
		date: isoDate,
		timeZone: null,
	};
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
			// Lowercase, matching what Umbraco itself writes. It deserialises either
			// casing today, but relying on that would fail silently if binding ever
			// tightened — the block would lose its layout without erroring.
			layout: {},
		},
		markup: htmlContent,
	};
}
