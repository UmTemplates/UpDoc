import type { DocumentTypeConfig, SectionMapping, MappingDestination, RichExtractionResult } from './workflow.types.js';
import { fetchWorkflowByAlias, fetchSampleExtraction, saveMapConfig } from './workflow.service.js';
import { getDestinationTabs, resolveDestinationTab, resolveBlockLabel, getAllBlockContainers } from './destination-utils.js';
import { html, customElement, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';

@customElement('up-doc-workflow-map-view')
export class UpDocWorkflowMapViewElement extends UmbLitElement {
	@state() private _config: DocumentTypeConfig | null = null;
	@state() private _extraction: RichExtractionResult | null = null;
	@state() private _loading = true;
	@state() private _error: string | null = null;
	#orphanedKeys = new Set<string>();
	#orphanedSources = new Set<string>();
	#workflowAlias = '';
	#token = '';
	#workspaceContext: any = null;

	override connectedCallback() {
		super.connectedCallback();
		this.consumeContext(UMB_WORKSPACE_CONTEXT, (context) => {
			if (!context) return;
			this.#workspaceContext = context;
			// Register refresh handler so the workspace Refresh button reloads all data
			(context as any).setRefreshHandler(() => this.#loadData());
			this.observe((context as any).unique, (unique: string | null) => {
				if (unique) {
					this.#workflowAlias = decodeURIComponent(unique);
					this.#loadData();
				}
			});
		});
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this.#workspaceContext?.setRefreshHandler(null);
	}

	async #loadData() {
		this._loading = true;
		this._error = null;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			this.#token = await authContext.getLatestToken();
			this._config = await fetchWorkflowByAlias(this.#workflowAlias, this.#token);

			if (!this._config) {
				this._error = `Workflow "${this.#workflowAlias}" not found`;
				return;
			}

			// Build set of orphaned destinations from validation warnings
			this.#orphanedKeys = new Set<string>();
			this.#orphanedSources = new Set<string>();
			for (const w of this._config.validationWarnings ?? []) {
				const m = w.match(/blockKey '([^']+)' for target '([^']+)'/);
				if (m) this.#orphanedKeys.add(`${m[1]}:${m[2]}`);
				const s = w.match(/source '([^']+)' not found in transform\.json/);
				if (s) this.#orphanedSources.add(s[1]);
			}

			this._extraction = await fetchSampleExtraction(this.#workflowAlias, this.#token);
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Failed to load workflow';
			console.error('Failed to load workflow config:', err);
		} finally {
			this._loading = false;
		}
	}

	#resolveDestinationLabel(dest: MappingDestination): string {
		if (!this._config) return dest.target;

		// If blockKey present, find the specific block
		if (dest.blockKey) {
			for (const container of getAllBlockContainers(this._config.destination)) {
				const block = container.blocks.find((b) => b.key === dest.blockKey);
				if (block) {
					const prop = block.properties?.find((p) => p.alias === dest.target);
					return `${block.label} > ${prop?.label || dest.target}`;
				}
			}
		}

		// Top-level field
		for (const field of this._config.destination.fields) {
			if (field.alias === dest.target) return field.label;
		}

		// Fall back: first block match (backwards compat for old mappings without blockKey)
		for (const container of getAllBlockContainers(this._config.destination)) {
			for (const block of container.blocks) {
				for (const prop of block.properties ?? []) {
					if (prop.alias === dest.target) {
						return `${block.label} > ${prop.label || prop.alias}`;
					}
				}
			}
		}

		return dest.target;
	}

	#resolveSourceText(sourceId: string): string {
		if (!this._extraction) return sourceId;

		const element = this._extraction.elements.find((e) => e.id === sourceId);
		if (!element) return sourceId;

		const text = element.text.length > 60 ? element.text.substring(0, 60) + '...' : element.text;
		return text;
	}

	async #deleteMapping(index: number) {
		if (!this._config) return;

		const updatedMap = {
			...this._config.map,
			mappings: this._config.map.mappings.filter((_, i) => i !== index),
		};

		const result = await saveMapConfig(this.#workflowAlias, updatedMap, this.#token);
		if (result) {
			this._config = { ...this._config, map: updatedMap };
		}
	}

	#renderEmptyState() {
		return html`
			<div class="empty-state">
				<uui-icon name="icon-nodes" class="empty-icon"></uui-icon>
				<p class="empty-title">No mappings yet</p>
				<p class="empty-message">Use the Source tab to map extracted content to destination fields.</p>
			</div>
		`;
	}

	#isMappingOrphaned(mapping: SectionMapping): { dest: boolean; source: boolean } {
		const dest = mapping.destinations.some(
			(d) => d.blockKey && this.#orphanedKeys.has(`${d.blockKey}:${d.target}`)
		);
		const source = this.#orphanedSources.has(mapping.source);
		return { dest, source };
	}

	#renderMappingRow(mapping: SectionMapping, index: number) {
		const orphaned = this.#isMappingOrphaned(mapping);

		return html`
			<uui-table-row>
				<uui-table-cell class="source-cell">
					<span class="source-id">${mapping.source}</span>
					<span class="source-text">${this.#resolveSourceText(mapping.source)}</span>
				</uui-table-cell>
				<uui-table-cell class="arrow-cell">
					<uui-icon name="icon-arrow-right"></uui-icon>
				</uui-table-cell>
				<uui-table-cell class="destination-cell">
					${mapping.destinations.map(
						(dest) => html`
							<span class="destination-target">${this.#resolveDestinationLabel(dest)}</span>
							${dest.transforms?.length
								? html`<span class="transform-badge">${dest.transforms.map((t) => t.type).join(', ')}</span>`
								: nothing}
						`
					)}
				</uui-table-cell>
				<uui-table-cell class="actions-cell">
					${orphaned.source ? html`<uui-tag color="warning" class="orphaned-badge">Orphaned Source</uui-tag>` : nothing}
					${orphaned.dest ? html`<uui-tag color="warning" class="orphaned-badge">Orphaned</uui-tag>` : nothing}
					${!mapping.enabled ? html`<uui-tag look="secondary" class="disabled-badge">Disabled</uui-tag>` : nothing}
					<uui-button
						compact
						look="outline"
						color="danger"
						label="Delete"
						@click=${() => this.#deleteMapping(index)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-table-cell>
			</uui-table-row>
		`;
	}

	/**
	 * Groups mappings by their destination tab and block.
	 * Uses the first destination in each mapping to determine the group.
	 */
	#groupMappingsByDestination(): Array<{
		tabId: string;
		tabLabel: string;
		blockKey?: string;
		blockLabel?: string;
		mappings: Array<{ mapping: SectionMapping; index: number }>;
	}> {
		if (!this._config?.destination) return [];

		const destination = this._config.destination;
		const allTabs = getDestinationTabs(destination);

		// Composite key: "tabId" for top-level, "tabId:blockKey" for blocks
		const groupMap = new Map<string, {
			tabId: string;
			tabLabel: string;
			blockKey?: string;
			blockLabel?: string;
			mappings: Array<{ mapping: SectionMapping; index: number }>;
		}>();

		for (let index = 0; index < this._config.map.mappings.length; index++) {
			const mapping = this._config.map.mappings[index];
			const firstDest = mapping.destinations[0];
			if (!firstDest) continue;

			const tabId = resolveDestinationTab(firstDest, destination) ?? 'unmapped';
			const tabLabel = allTabs.find((t) => t.id === tabId)?.label ?? 'Unmapped';
			const blockKey = firstDest.blockKey;
			const blockLabel = blockKey ? resolveBlockLabel(blockKey, destination) : undefined;

			const groupKey = blockKey ? `${tabId}:${blockKey}` : tabId;

			if (!groupMap.has(groupKey)) {
				groupMap.set(groupKey, {
					tabId,
					tabLabel,
					blockKey: blockKey ?? undefined,
					blockLabel: blockLabel ?? undefined,
					mappings: [],
				});
			}

			groupMap.get(groupKey)!.mappings.push({ mapping, index });
		}

		// Order groups: by tab order, then blocks by their order in destination.json
		const result: typeof groupMap extends Map<string, infer V> ? V[] : never = [];
		const blockOrder = new Map<string, number>();
		let blockIdx = 0;
		for (const container of getAllBlockContainers(destination)) {
			for (const block of container.blocks) {
				blockOrder.set(block.key, blockIdx++);
			}
		}

		// Add groups in tab order
		for (const tab of allTabs) {
			// Non-block groups for this tab
			const nonBlockGroup = groupMap.get(tab.id);
			if (nonBlockGroup) {
				result.push(nonBlockGroup);
			}

			// Block groups for this tab, ordered by block position
			const blockGroups = Array.from(groupMap.entries())
				.filter(([key, group]) => group.tabId === tab.id && group.blockKey)
				.sort(([, a], [, b]) => {
					const orderA = blockOrder.get(a.blockKey!) ?? 999;
					const orderB = blockOrder.get(b.blockKey!) ?? 999;
					return orderA - orderB;
				})
				.map(([, group]) => group);

			result.push(...blockGroups);
		}

		// Add unmapped group at the end
		const unmapped = groupMap.get('unmapped');
		if (unmapped) {
			result.push(unmapped);
		}

		return result;
	}

	#renderMappingGroup(group: {
		tabLabel: string;
		blockLabel?: string;
		mappings: Array<{ mapping: SectionMapping; index: number }>;
	}) {
		const label = group.blockLabel
			? `${group.tabLabel} \u2014 ${group.blockLabel}`
			: group.tabLabel;

		return html`
			<div class="mapping-group">
				<div class="mapping-group-header">
					<span class="mapping-group-label">${label}</span>
					<span class="mapping-group-count">${group.mappings.length}</span>
				</div>
				<uui-table>
					<uui-table-head>
						<uui-table-head-cell>Source</uui-table-head-cell>
						<uui-table-head-cell style="width: 40px;"></uui-table-head-cell>
						<uui-table-head-cell>Destination</uui-table-head-cell>
						<uui-table-head-cell style="width: 100px;"></uui-table-head-cell>
					</uui-table-head>
					${group.mappings.map(({ mapping, index }) =>
						this.#renderMappingRow(mapping, index)
					)}
				</uui-table>
			</div>
		`;
	}

	#renderMappingsTable() {
		if (!this._config) return nothing;

		const mappings = this._config.map.mappings;
		if (mappings.length === 0) return this.#renderEmptyState();

		const groups = this.#groupMappingsByDestination();

		return html`
			<div class="mappings-header">
				<span class="mapping-count">${mappings.length} mapping${mappings.length !== 1 ? 's' : ''}</span>
			</div>
			${groups.map((group) => this.#renderMappingGroup(group))}
		`;
	}

	override render() {
		if (this._loading) {
			return html`<div class="loading"><uui-loader-bar></uui-loader-bar></div>`;
		}

		if (this._error) {
			return html`<p style="color: var(--uui-color-danger);">${this._error}</p>`;
		}

		return html`
			<umb-body-layout header-fit-height>
				<uui-box>
					${this.#renderMappingsTable()}
				</uui-box>
			</umb-body-layout>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
				height: 100%;
			}

			.loading {
				padding: var(--uui-size-layout-1);
			}

			.empty-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: var(--uui-size-layout-3) var(--uui-size-layout-1);
				color: var(--uui-color-text-alt);
			}

			.empty-icon {
				font-size: 3rem;
				margin-bottom: var(--uui-size-space-4);
				opacity: 0.4;
			}

			.empty-title {
				font-size: var(--uui-type-h5-size);
				font-weight: 600;
				margin: 0 0 var(--uui-size-space-2);
			}

			.empty-message {
				margin: 0;
				font-style: italic;
			}

			.mappings-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: var(--uui-size-space-4);
			}

			.mapping-count {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}

			.mapping-group {
				margin-bottom: var(--uui-size-space-5);
			}

			.mapping-group:last-child {
				margin-bottom: 0;
			}

			.mapping-group-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.mapping-group-label {
				font-weight: 600;
			}

			.mapping-group-count {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface);
				padding: 1px 8px;
				border-radius: var(--uui-border-radius);
				border: 1px solid var(--uui-color-border);
			}

			.source-cell {
				display: flex;
				flex-direction: column;
				gap: 2px;
			}

			.source-id {
				font-size: 11px;
				font-family: monospace;
				color: var(--uui-color-text-alt);
			}

			.source-text {
				font-size: var(--uui-type-small-size);
			}

			.arrow-cell {
				text-align: center;
				color: var(--uui-color-text-alt);
			}

			.destination-cell {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.destination-target {
				font-weight: 600;
			}

			.transform-badge {
				font-size: 11px;
				color: var(--uui-color-text-alt);
				background: var(--uui-color-surface-alt);
				padding: 2px 8px;
				border-radius: var(--uui-border-radius);
				width: fit-content;
			}

			.disabled-badge,
			.orphaned-badge {
				font-size: 11px;
			}

			.actions-cell {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				justify-content: flex-end;
			}
		`,
	];
}

export default UpDocWorkflowMapViewElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-workflow-map-view': UpDocWorkflowMapViewElement;
	}
}
