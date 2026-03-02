import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import type { AreaElement, AreaRules } from './workflow.types.js';

export interface SectionRulesEditorModalData {
	workflowAlias: string;
	sectionId: string;
	sectionHeading: string;
	/** The elements belonging to this section (from area detection). */
	elements: AreaElement[];
	/** Existing rules for this section, if any. */
	existingRules?: AreaRules | null;
	/** Number of sections produced by rules in this area. */
	sectionCount?: number;
	/** Callback for "Save" (persist without closing). Called with the current rules value. */
	onSave?: (rules: AreaRules) => Promise<void>;
	/** Source type of the workflow: 'pdf', 'web', 'markdown'. Used for source-aware auto-populate. */
	sourceType?: string;
}

export interface SectionRulesEditorModalValue {
	rules: AreaRules;
}

export const UMB_SECTION_RULES_EDITOR_MODAL = new UmbModalToken<SectionRulesEditorModalData, SectionRulesEditorModalValue>(
	'UpDoc.SectionRulesEditorModal',
	{
		modal: {
			type: 'sidebar',
			size: 'medium',
		},
	},
);
