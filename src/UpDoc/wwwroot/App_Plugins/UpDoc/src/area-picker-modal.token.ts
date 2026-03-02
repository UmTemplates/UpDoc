import { UmbModalToken } from '@umbraco-cms/backoffice/modal';

export interface AreaPickerModalData {
	/** List of all detected area names (e.g., "Navigation", "Main Content"). */
	areas: Array<{ name: string; elementCount: number; color: string }>;
	/** Currently excluded area names in kebab-case. */
	excludedAreas: string[];
}

export interface AreaPickerModalValue {
	/** Updated list of excluded area names in kebab-case. */
	excludedAreas: string[];
}

export const UMB_AREA_PICKER_MODAL = new UmbModalToken<
	AreaPickerModalData,
	AreaPickerModalValue
>('UpDoc.AreaPickerModal', {
	modal: {
		type: 'sidebar',
		size: 'small',
	},
});
