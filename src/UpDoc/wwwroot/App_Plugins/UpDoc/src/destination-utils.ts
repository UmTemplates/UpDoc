import type { DestinationBlockGrid, DestinationConfig, DestinationField, MappingDestination } from './workflow.types.js';

export interface DestinationTab {
	id: string;
	label: string;
}

/**
 * Returns all block containers (grids + lists) from a destination config.
 * Use this instead of iterating blockGrids and blockLists separately.
 */
export function getAllBlockContainers(destination: DestinationConfig): DestinationBlockGrid[] {
	return [...(destination.blockGrids ?? []), ...(destination.blockLists ?? [])];
}

/** Converts a tab or group name to a stable DOM-safe id. */
export function toTabId(name: string): string {
	return name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Extracts the tab structure from a destination config.
 * Returns tabs in document order, with additional tabs for block containers.
 *
 * Tabs come from the `tab` property only. A field's `group` is a heading *within* a tab
 * (Umbraco's tab → group → property structure) and must not become a tab of its own —
 * doing so is what made UpDoc's tab strip disagree with the backoffice.
 */
export function getDestinationTabs(destination: DestinationConfig): DestinationTab[] {
	const tabs: DestinationTab[] = [];
	const seen = new Set<string>();

	const addTab = (name: string | undefined) => {
		const tabName = name ?? 'Page Content';
		if (seen.has(tabName)) return;
		seen.add(tabName);
		tabs.push({ id: toTabId(tabName), label: tabName });
	};

	for (const field of destination.fields) {
		if (field.tab) addTab(field.tab);
	}

	// Block containers (grids default to "Page Content", lists use their tab)
	for (const container of getAllBlockContainers(destination)) {
		addTab(container.tab);
	}

	return tabs;
}

/**
 * Groups a tab's fields and block containers under their `group` heading, preserving
 * document order. Ungrouped entries come first, under a null heading, matching Umbraco:
 * properties sitting directly on a tab appear above any groups.
 */
export function getTabGroups(
	destination: DestinationConfig,
	tabId: string,
): Array<{ group: string | null; fields: DestinationField[]; containers: DestinationBlockGrid[] }> {
	const order: Array<string | null> = [];
	const byGroup = new Map<string | null, { fields: DestinationField[]; containers: DestinationBlockGrid[] }>();

	const bucketFor = (group: string | null) => {
		if (!byGroup.has(group)) {
			byGroup.set(group, { fields: [], containers: [] });
			order.push(group);
		}
		return byGroup.get(group)!;
	};

	for (const field of destination.fields) {
		if (!field.tab || toTabId(field.tab) !== tabId) continue;
		bucketFor(field.group ?? null).fields.push(field);
	}

	for (const container of getAllBlockContainers(destination)) {
		if (toTabId(container.tab ?? 'Page Content') !== tabId) continue;
		bucketFor(container.group ?? null).containers.push(container);
	}

	// Ungrouped first, then groups in the order they were encountered.
	order.sort((a, b) => (a === null ? -1 : b === null ? 1 : 0));

	return order.map((group) => ({ group, ...byGroup.get(group)! }));
}

/**
 * Resolves which destination tab a mapping destination belongs to.
 * Block properties resolve to their container's tab (or "page-content" for grids).
 * Top-level fields resolve to their field's tab (kebab-case ID).
 * Returns null if the destination can't be matched.
 */
export function resolveDestinationTab(
	dest: MappingDestination,
	destination: DestinationConfig,
): string | null {
	if (dest.blockKey) {
		for (const container of getAllBlockContainers(destination)) {
			if (container.blocks.find((b) => b.key === dest.blockKey)) {
				const tab = container.tab ?? 'Page Content';
				return tab.toLowerCase().replace(/\s+/g, '-');
			}
		}
		return 'page-content';
	}

	const field = destination.fields.find((f) => f.alias === dest.target);
	if (field?.tab) {
		return field.tab.toLowerCase().replace(/\s+/g, '-');
	}

	return null;
}

/**
 * Finds the block's display label given its key.
 * Searches both block grids and block lists.
 */
export function resolveBlockLabel(
	blockKey: string,
	destination: DestinationConfig,
): string | null {
	for (const container of getAllBlockContainers(destination)) {
		const block = container.blocks.find((b) => b.key === blockKey);
		if (block) return block.label;
	}
	return null;
}
