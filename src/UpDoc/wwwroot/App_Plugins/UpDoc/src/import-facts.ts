import type { MappingDestination } from './workflow.types.js';

/**
 * Writing import facts into a document being created.
 *
 * An import fact is a value describing the import itself — which file the editor picked —
 * rather than content extracted from that file. It needs its own apply path because the
 * ordinary one resolves a source key against extracted sections, and an import fact is
 * not in there.
 *
 * Shared by both bridge files (entity action and collection action) so the two cannot
 * drift apart. See #41 for extracting the rest of the duplicated apply logic.
 */

/** One entry in a MediaPicker3 value. */
interface MediaPickerEntry {
	key: string;
	mediaKey: string;
	mediaTypeAlias: string;
	crops: unknown[];
	focalPoint: unknown | null;
}

/**
 * Builds a MediaPicker3 value for a single media item.
 *
 * `key` identifies this entry within the picker and is distinct from `mediaKey`, which
 * identifies the media item. Umbraco expects a fresh key per entry.
 *
 * `mediaTypeAlias` is deliberately left empty. Umbraco's MediaPicker3PropertyEditor
 * overwrites it from the real media item on save (UpdateMediaTypeAliases), and explicitly
 * tolerates it being absent on create, so sending a guess would be pointless at best and
 * wrong at worst.
 */
export function buildMediaPickerValue(mediaKey: string): MediaPickerEntry[] {
	return [
		{
			key: crypto.randomUUID(),
			mediaKey,
			mediaTypeAlias: '',
			crops: [],
			focalPoint: null,
		},
	];
}

/**
 * Writes the picked media into a destination field.
 *
 * Only top-level fields are supported: a media picker inside a block would need the
 * block's own value JSON rewritten, which the ordinary apply path handles for text but
 * has no equivalent for here. Block destinations are skipped rather than written wrongly.
 */
export function applyImportFactMedia(
	values: Array<{ alias: string; value: unknown }>,
	dest: MappingDestination,
	mediaKey: string,
): void {
	if (dest.blockKey) {
		console.warn(
			`UpDoc: import-fact mapping to a block property ("${dest.target}") is not supported yet — skipped.`,
		);
		return;
	}

	const value = buildMediaPickerValue(mediaKey);
	const existing = values.find((v) => v.alias === dest.target);

	if (existing) {
		existing.value = value;
	} else {
		values.push({ alias: dest.target, value });
	}
}
