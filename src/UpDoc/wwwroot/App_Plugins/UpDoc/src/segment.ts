import type { Segment, SegmentBoundary } from './workflow.types.js';

// KEEP IN SYNC with SegmentEvaluator.cs — this is the editor preview mirror.

const NUMBER_RUN = /\d[\d,]*/;

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
