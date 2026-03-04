import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import type { DocumentTypeConfig } from './workflow.types.js';

export type SourceType = 'pdf' | 'markdown' | 'web' | 'doc';

export interface UmbUpDocModalData {
	unique: string | null;
	documentTypeName: string;
	blueprintName: string;
	blueprintId: string;
}

export interface UmbUpDocModalValue {
	name: string;
	sourceType: SourceType;
	mediaUnique: string | null;
	sourceUrl: string | null;
	sectionLookup: Record<string, string>;
	/** Maps stableKey → sectionId for fallback resolution when section IDs shift. */
	stableKeyLookup: Record<string, string>;
	config: DocumentTypeConfig | null;
}

export const UMB_UP_DOC_MODAL = new UmbModalToken<UmbUpDocModalData, UmbUpDocModalValue>(
	'UpDoc.Modal',
	{
		modal: {
			type: 'sidebar',
			size: 'medium',
		},
	},
);
