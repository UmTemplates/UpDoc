import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import type { ContainerTreeNode, ContainerOverride } from './workflow.types.js';

export interface AreaPickerModalData {
	/** List of all detected area names (e.g., "Navigation", "Main Content"). */
	areas: Array<{ name: string; elementCount: number; color: string }>;
	/** Currently excluded area names in kebab-case. */
	excludedAreas: string[];
	/** For web sources: hierarchical container tree from sample extraction. */
	containers?: ContainerTreeNode[] | null;
	/** For web sources: current container overrides from source config. */
	containerOverrides?: ContainerOverride[];
}

export interface AreaPickerModalValue {
	/** Updated list of excluded area names in kebab-case. */
	excludedAreas: string[];
	/** Updated container overrides (web sources only). */
	containerOverrides?: ContainerOverride[];
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
