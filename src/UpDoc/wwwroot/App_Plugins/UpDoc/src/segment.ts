import type { Segment, SegmentBoundary, RuleCondition } from './workflow.types.js';

// KEEP IN SYNC with SegmentEvaluator.cs — this is the editor preview mirror.

const NUMBER_RUN = /\d[\d,]*/;

/**
 * Normalises a condition value to the list of candidate strings to match against.
 * A plain string yields one candidate; an array yields several (multi-value OR).
 * Empty strings are dropped so a stray empty chip cannot match everything.
 * KEEP IN SYNC with the C# equivalent in PdfPagePropertiesService.
 */
export function conditionTextValues(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((v) => String(v ?? '')).filter((v) => v.length > 0);
	}
	if (value == null) return [];
	const s = String(value);
	return s.length > 0 ? [s] : [];
}

/** Index of the "segment" marker condition, or -1 if none. */
export function segmentMarkerIndex(conditions: RuleCondition[]): number {
	return conditions.findIndex((c) => c.type === 'segment');
}

/** Conditions before the marker (match the element); all conditions if no marker. */
export function matchConditions(conditions: RuleCondition[]): RuleCondition[] {
	const i = segmentMarkerIndex(conditions);
	return i < 0 ? conditions : conditions.slice(0, i);
}

/** Conditions after the marker (define the piece); empty if no marker. */
export function segmentConditions(conditions: RuleCondition[]): RuleCondition[] {
	const i = segmentMarkerIndex(conditions);
	return i < 0 ? [] : conditions.slice(i + 1);
}

/**
 * Extract driven by the piece conditions after a "segment" marker.
 * textFollows → from after marker; textPrecedes → to before marker;
 * number → to after the numeric run. Marker not found → ''. None → whole text.
 */
export function applySegmentConditions(text: string, pieceConditions: RuleCondition[]): string {
	if (!pieceConditions || pieceConditions.length === 0) return text;

	let from: SegmentBoundary | undefined;
	let to: SegmentBoundary | undefined;

	for (const c of pieceConditions) {
		switch (c.type) {
			case 'textFollows':
				// Multi-value: use the first candidate marker that occurs in the text,
				// so "Departs"/"Departing" both cut cleanly whichever the element has.
				from = { anchor: 'afterMarker', marker: firstMarkerFound(text, c.value) };
				break;
			case 'textPrecedes':
				to = { anchor: 'beforeMarker', marker: firstMarkerFound(text, c.value) };
				break;
			case 'number':
				to = { anchor: 'number' };
				break;
		}
	}

	return applySegment(text, { from, to });
}

/**
 * Picks the marker to cut on when a piece condition carries several candidates.
 * Returns the first candidate that occurs in the text (case-insensitive); falls
 * back to the first candidate so a not-found marker still collapses the segment
 * to empty via the existing resolve logic. undefined when there are none.
 */
function firstMarkerFound(text: string, value: unknown): string | undefined {
	const candidates = conditionTextValues(value);
	if (candidates.length === 0) return undefined;
	const lower = text.toLowerCase();
	return candidates.find((c) => lower.includes(c.toLowerCase())) ?? candidates[0];
}

export function applySegment(text: string, segment?: Segment): string {
	if (!segment) return text;

	let startIndex = 0;
	if (segment.from) {
		const s = resolveFrom(text, segment.from);
		if (s < 0) return '';
		startIndex = s;
	}

	const region = text.slice(startIndex);

	let endIndex = region.length;
	if (segment.to) {
		const e = resolveTo(region, segment.to);
		if (e < 0) return '';
		endIndex = e;
	}

	return region.slice(0, endIndex).trim();
}

function resolveFrom(text: string, b: SegmentBoundary): number {
	switch (b.anchor) {
		case 'afterMarker': return findAfter(text, b.marker);
		case 'beforeMarker': return findBefore(text, b.marker);
		case 'start':
		default: return 0;
	}
}

function resolveTo(region: string, b: SegmentBoundary): number {
	switch (b.anchor) {
		case 'end': return region.length;
		case 'beforeMarker': return indexOfMarker(region, b.marker);
		case 'afterMarker': return afterMarkerEnd(region, b.marker);
		case 'number': return numberEnd(region);
		default: return region.length;
	}
}

function findAfter(text: string, marker?: string): number {
	if (!marker) return 0;
	const i = text.toLowerCase().indexOf(marker.toLowerCase());
	return i < 0 ? -1 : i + marker.length;
}

function findBefore(text: string, marker?: string): number {
	if (!marker) return 0;
	const i = text.toLowerCase().indexOf(marker.toLowerCase());
	return i < 0 ? -1 : i;
}

function indexOfMarker(region: string, marker?: string): number {
	if (!marker) return region.length;
	const i = region.toLowerCase().indexOf(marker.toLowerCase());
	return i < 0 ? -1 : i;
}

function afterMarkerEnd(region: string, marker?: string): number {
	if (!marker) return region.length;
	const i = region.toLowerCase().indexOf(marker.toLowerCase());
	return i < 0 ? -1 : i + marker.length;
}

function numberEnd(region: string): number {
	const m = NUMBER_RUN.exec(region);
	return m ? m.index + m[0].length : -1;
}
