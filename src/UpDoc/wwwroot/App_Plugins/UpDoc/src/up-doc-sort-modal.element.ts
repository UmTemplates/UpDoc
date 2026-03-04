import type { UpDocSortModalData, UpDocSortModalValue } from './up-doc-sort-modal.token.js';
import { html, customElement, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import type {
	UmbTableColumn,
	UmbTableConfig,
	UmbTableElement,
	UmbTableItem,
	UmbTableOrderedEvent,
	UmbTableSortedEvent,
} from '@umbraco-cms/backoffice/components';

@customElement('up-doc-sort-modal')
export class UpDocSortModalElement extends UmbModalBaseElement<UpDocSortModalData, UpDocSortModalValue> {
	@state()
	private _tableColumns: Array<UmbTableColumn> = [
		{
			name: 'Name',
			alias: 'name',
			allowSorting: true,
		},
	];

	@state()
	private _tableConfig: UmbTableConfig = {
		allowSelection: false,
	};

	@state()
	private _tableItems: Array<UmbTableItem> = [];

	@state()
	private _sortable = false;

	#sortedUniques = new Set<string>();

	override firstUpdated() {
		const items = this.data?.items ?? [];
		this._tableItems = items.map((item) => ({
			id: item.id,
			icon: 'icon-navigation',
			data: [
				{
					columnAlias: 'name',
					value: item.name,
				},
			],
		}));
		this._sortable = items.length > 1;
	}

	#onSorted(event: UmbTableSortedEvent) {
		event.stopPropagation();
		const sortedId = event.getItemId();
		this.#sortedUniques.add(sortedId);
		const target = event.target as UmbTableElement;
		this._tableItems = target.items;
	}

	#onOrdered(event: UmbTableOrderedEvent) {
		event.stopPropagation();
		const target = event.target as UmbTableElement;
		const orderingColumn = target.orderingColumn;
		const orderingDesc = target.orderingDesc;

		this._tableItems = [...this._tableItems].sort((a, b) => {
			const aColumn = a.data.find((column) => column.columnAlias === orderingColumn);
			const bColumn = b.data.find((column) => column.columnAlias === orderingColumn);
			if (orderingColumn === 'name') {
				return (aColumn?.value as string).localeCompare(bColumn?.value as string);
			}
			return 0;
		});

		if (orderingDesc) {
			this._tableItems.reverse();
		}

		this.#sortedUniques.clear();
		this._tableItems.map((item) => item.id).forEach((u) => this.#sortedUniques.add(u));
	}

	#onSubmit() {
		const sortedIds = this._tableItems.map((item) => item.id);
		this.value = { sortedIds };
		this._submitModal();
	}

	override render() {
		return html`
			<umb-body-layout headline=${this.data?.headline ?? 'Sort'}>
				${this._tableItems.length === 0 ? this.#renderEmptyState() : this.#renderTable()}
				<uui-button slot="actions" label="Cancel" @click=${this._rejectModal}></uui-button>
				<uui-button
					slot="actions"
					color="positive"
					look="primary"
					label="Save"
					@click=${this.#onSubmit}></uui-button>
			</umb-body-layout>
		`;
	}

	#renderEmptyState() {
		return html`<uui-label>There are no items to sort</uui-label>`;
	}

	#renderTable() {
		return html`
			<umb-table
				.config=${this._tableConfig}
				.columns=${this._tableColumns}
				.items=${this._tableItems}
				.sortable=${this._sortable}
				@sorted=${this.#onSorted}
				@ordered=${this.#onOrdered}></umb-table>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
				height: 100%;
			}
		`,
	];
}

export { UpDocSortModalElement as element };

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-sort-modal': UpDocSortModalElement;
	}
}
