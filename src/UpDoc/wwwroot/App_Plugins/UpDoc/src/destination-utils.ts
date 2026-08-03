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

	// tabOrder carries the backoffice's own tab order, including tabs whose properties
	// were all filtered out — skip those, or the strip shows tabs with nothing in them.
	// Fall back to discovery for destination.json files generated before tabOrder existed.
	const populated = new Set<string>();
	for (const field of destination.fields) {
		if (field.tab) populated.add(field.tab);
	}
	for (const container of getAllBlockContainers(destination)) {
		populated.add(container.tab ?? 'Page Content');
	}

	for (const tabName of destination.tabOrder ?? []) {
		if (populated.has(tabName)) addTab(tabName);
	}

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

	return sortGroupNames(order, destination, tabId).map((group) => ({
		group,
		...byGroup.get(group)!,
	}));
}

/**
 * Orders group names within a tab to match the backoffice: ungrouped first (those
 * properties sit directly on the tab, above any groups), then groups in the order
 * groupOrder records. Groups absent from groupOrder keep their existing relative
 * position at the end, which is what happens for files generated before it existed.
 */
export function sortGroupNames(
	names: Array<string | null>,
	destination: DestinationConfig,
	tabId: string,
): Array<string | null> {
	const tabName =
		(destination.tabOrder ?? []).find((t) => toTabId(t) === tabId) ??
		destination.fields.find((f) => f.tab && toTabId(f.tab) === tabId)?.tab;
	const known = (tabName ? destination.groupOrder?.[tabName] : undefined) ?? [];

	const rank = (name: string | null) => {
		if (name === null) return -1;
		const index = known.indexOf(name);
		return index === -1 ? Number.MAX_SAFE_INTEGER : index;
	};

	return [...names].sort((a, b) => rank(a) - rank(b));
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
 * Resolves which group within its tab a mapping destination belongs to.
 * Returns null for destinations that sit directly on the tab, or can't be matched.
 */
export function resolveDestinationGroup(
	dest: MappingDestination,
	destination: DestinationConfig,
): string | null {
	if (dest.blockKey) {
		for (const container of getAllBlockContainers(destination)) {
			if (container.blocks.find((b) => b.key === dest.blockKey)) {
				return container.group ?? null;
			}
		}
		return null;
	}

	return destination.fields.find((f) => f.alias === dest.target)?.group ?? null;
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
