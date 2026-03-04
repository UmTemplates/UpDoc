import { UmbModalToken } from '@umbraco-cms/backoffice/modal';

export interface UpDocSortModalData {
	headline: string;
	items: Array<{ id: string; name: string }>;
}

export interface UpDocSortModalValue {
	sortedIds: string[];
}

export const UP_DOC_SORT_MODAL = new UmbModalToken<UpDocSortModalData, UpDocSortModalValue>(
	'UpDoc.SortModal',
	{
		modal: {
			type: 'sidebar',
			size: 'small',
		},
	},
);
