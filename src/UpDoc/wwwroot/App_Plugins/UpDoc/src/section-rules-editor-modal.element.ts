import type { SectionRulesEditorModalData, SectionRulesEditorModalValue } from './section-rules-editor-modal.token.js';
import type { SectionRule, RuleCondition, RuleConditionType, RulePart, BlockFormat, FormatEntry, FormatEntryType, AreaElement, AreaRules, RuleGroup, TextReplacement, FindType, ReplaceType } from './workflow.types.js';
import type { SortChangeDetail, SortableRule } from './sortable-rules-container.element.js';
import { getEffectivePart, getEffectiveFormat } from './workflow.types.js';
import './sortable-rules-container.element.js';
import { ruleCardStyles } from './rule-card-styles.js';
import { html, css, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

/**
 * Editable rule: SectionRule + transient tracking fields for the modal.
 * _id is used for drag-and-drop tracking. _groupName tracks which group the rule belongs to.
 */
interface EditableRule extends SectionRule {
	_id: string;
	_groupName: string;
}

let _nextRuleId = 0;
function generateRuleId(): string {
	return `r-${++_nextRuleId}`;
}

/** Friendly labels for condition types */
const CONDITION_LABELS: Record<RuleConditionType, string> = {
	textBeginsWith: 'Text begins with',
	textEndsWith: 'Text ends with',
	textContains: 'Text contains',
	textEquals: 'Text equals',
	textMatchesPattern: 'Text matches pattern',
	fontSizeEquals: 'Font size equals',
	fontSizeAbove: 'Font size above',
	fontSizeBelow: 'Font size below',
	fontSizeRange: 'Font size between',
	fontNameContains: 'Font name contains',
	fontNameEquals: 'Font name equals',
	colorEquals: 'Color equals',
	positionFirst: 'Position: first',
	positionLast: 'Position: last',
	// HTML-specific (web sources)
	htmlTagEquals: 'HTML tag equals',
	cssClassContains: 'CSS class contains',
	htmlContainerPathContains: 'Container path contains',
	isBoldEquals: 'Is bold',
};

/** Condition types that don't need a value input */
const VALUELESS_CONDITIONS: RuleConditionType[] = ['positionFirst', 'positionLast', 'isBoldEquals'];

/** All available condition types */
const ALL_CONDITION_TYPES: RuleConditionType[] = [
	'textBeginsWith', 'textEndsWith', 'textContains', 'textEquals', 'textMatchesPattern',
	'fontSizeEquals', 'fontSizeAbove', 'fontSizeBelow', 'fontSizeRange',
	'fontNameContains', 'fontNameEquals', 'colorEquals',
	'positionFirst', 'positionLast',
	// HTML-specific (web sources)
	'htmlTagEquals', 'cssClassContains', 'htmlContainerPathContains', 'isBoldEquals',
];

/** Friendly labels for rule parts */
const PART_LABELS: Record<RulePart, string> = {
	title: 'Title',
	content: 'Content',
	description: 'Description',
	summary: 'Summary',
};

/** All available rule parts */
const ALL_PARTS: RulePart[] = ['title', 'content', 'description', 'summary'];

/** Format entry type labels */
const FORMAT_ENTRY_TYPE_LABELS: Record<FormatEntryType, string> = {
	block: 'Block',
	style: 'Style',
};

const ALL_FORMAT_ENTRY_TYPES: FormatEntryType[] = ['block', 'style'];

/** Block format value labels (block-level Markdown elements) */
const BLOCK_FORMAT_LABELS: Record<string, string> = {
	auto: 'Auto',
	paragraph: 'Paragraph',
	heading1: 'Heading 1',
	heading2: 'Heading 2',
	heading3: 'Heading 3',
	heading4: 'Heading 4',
	heading5: 'Heading 5',
	heading6: 'Heading 6',
	bulletListItem: 'Bullet List',
	numberedListItem: 'Numbered List',
	quote: 'Quote',
};

const ALL_BLOCK_FORMATS: string[] = [
	'auto', 'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6',
	'bulletListItem', 'numberedListItem', 'quote',
];

/** Style format value labels (inline Markdown decorations) */
const STYLE_FORMAT_LABELS: Record<string, string> = {
	bold: 'Bold',
	italic: 'Italic',
	strikethrough: 'Strikethrough',
	code: 'Code',
	highlight: 'Highlight',
};

const ALL_STYLE_FORMATS: string[] = ['bold', 'italic', 'strikethrough', 'code', 'highlight'];

/** Sentinel group name for ungrouped rules. Rendered as a real group container for drag-and-drop. */
const UNGROUPED_GROUP = 'Ungrouped';

/** Find type labels for text replacements */
const FIND_TYPE_LABELS: Record<FindType, string> = {
	textBeginsWith: 'Text begins with',
	textEndsWith: 'Text ends with',
	textContains: 'Text contains',
};

const ALL_FIND_TYPES: FindType[] = ['textBeginsWith', 'textEndsWith', 'textContains'];

/** Replace type labels — contextual based on find type */
const REPLACE_TYPE_LABELS: Record<ReplaceType, string> = {
	replaceWith: 'Replace with',
	replaceAll: 'Replace all with',
};

@customElement('up-doc-section-rules-editor-modal')
export class UpDocSectionRulesEditorModalElement extends UmbModalBaseElement<SectionRulesEditorModalData, SectionRulesEditorModalValue> {
	/** Flat array of all rules (grouped + ungrouped). Each carries _groupName for grouping. */
	@state() private _rules: EditableRule[] = [];
	/** Ordered list of group names. */
	@state() private _groupOrder: string[] = [];
	/** Track which inner sections are expanded (by "section-ruleId" key). All collapsed by default. */
	@state() private _expandedSections: Set<string> = new Set();
	/** Track which rules are expanded (by _id). All collapsed by default. */
	@state() private _expandedRules: Set<string> = new Set();
	/** Group currently being renamed (null = none). */
	@state() private _renamingGroup: string | null = null;
	@state() private _renameValue = '';

	#isSectionExpanded(section: string, ruleId: string): boolean {
		return this._expandedSections.has(`${section}-${ruleId}`);
	}

	#toggleSection(section: string, ruleId: string) {
		const key = `${section}-${ruleId}`;
		const next = new Set(this._expandedSections);
		if (next.has(key)) {
			next.delete(key);
		} else {
			next.add(key);
		}
		this._expandedSections = next;
	}

	#isRuleExpanded(ruleId: string): boolean {
		return this._expandedRules.has(ruleId);
	}

	#toggleRuleExpanded(ruleId: string) {
		const next = new Set(this._expandedRules);
		if (next.has(ruleId)) {
			next.delete(ruleId);
		} else {
			next.add(ruleId);
		}
		this._expandedRules = next;
	}

	#expandRule(ruleId: string) {
		if (!this._expandedRules.has(ruleId)) {
			const next = new Set(this._expandedRules);
			next.add(ruleId);
			this._expandedRules = next;
		}
	}

	override firstUpdated() {
		const areaRules = this.data?.existingRules;
		if (!areaRules) return;

		const editableRules: EditableRule[] = [];
		const groupOrder: string[] = [];

		// Grouped rules first
		for (const group of (areaRules.groups ?? [])) {
			groupOrder.push(group.name);
			for (const rule of group.rules) {
				editableRules.push(this.#normalizeRule(rule, group.name));
			}
		}

		// Ungrouped rules → put into the "Ungrouped" sentinel group
		const ungrouped = areaRules.rules ?? [];
		if (ungrouped.length > 0) {
			groupOrder.push(UNGROUPED_GROUP);
			for (const rule of ungrouped) {
				editableRules.push(this.#normalizeRule(rule, UNGROUPED_GROUP));
			}
		}

		this._rules = editableRules;
		this._groupOrder = groupOrder;
	}

	/** Normalize a rule on load: derive part from legacy action, migrate formats. */
	#normalizeRule(rule: SectionRule, groupName: string): EditableRule {
		let part = rule.part as RulePart | undefined;
		let exclude = rule.exclude ?? false;

		// Normalize from legacy action field
		if (!part && !exclude) {
			const derived = getEffectivePart(rule);
			if (derived === 'exclude') {
				exclude = true;
			} else {
				part = derived as RulePart;
			}
		}

		// Migrate old single format to formats array
		let formats = rule.formats;
		if (!formats || formats.length === 0) {
			const blockValue = rule.format ?? getEffectiveFormat(rule);
			formats = [{ type: 'block' as FormatEntryType, value: blockValue }];
		}

		return {
			...rule,
			part,
			exclude,
			formats,
			_id: generateRuleId(),
			_groupName: groupName,
		};
	}

	get #elements(): AreaElement[] {
		return this.data?.elements ?? [];
	}

	get #sourceType(): string {
		return this.data?.sourceType ?? 'pdf';
	}

	/** Condition types sorted by source-type relevance. Web-specific types first for web, last for PDF. */
	get #conditionTypes(): RuleConditionType[] {
		if (this.#sourceType === 'web') {
			const webTypes: RuleConditionType[] = ['htmlTagEquals', 'cssClassContains', 'htmlContainerPathContains'];
			return [...webTypes, ...ALL_CONDITION_TYPES.filter((t) => !webTypes.includes(t))];
		}
		// PDF: web types at end (already the default order)
		return ALL_CONDITION_TYPES;
	}

	get #sectionHeading(): string {
		return this.data?.sectionHeading ?? 'Section';
	}

	/**
	 * Returns a grouped view for rendering: groups in order, then ungrouped.
	 */
	get #groupedView(): Array<{ group: string; rules: EditableRule[] }> {
		const result: Array<{ group: string; rules: EditableRule[] }> = [];

		for (const name of this._groupOrder) {
			result.push({
				group: name,
				rules: this._rules.filter((r) => r._groupName === name),
			});
		}

		return result;
	}

	// ===== Rule evaluation (first-match-wins) =====

	/** Evaluate all rules against elements. Returns a map of elementId -> rule _id */
	#evaluateRules(): Map<string, string> {
		const claimed = new Map<string, string>();
		const elements = this.#elements;

		for (const rule of this._rules) {
			if (rule.conditions.length === 0) continue;

			for (let elIdx = 0; elIdx < elements.length; elIdx++) {
				const el = elements[elIdx];
				if (claimed.has(el.id)) continue; // already claimed by an earlier rule

				if (this.#elementMatchesAllConditions(el, rule.conditions, elIdx, elements.length)) {
					// Check exceptions — if any exception matches, skip this element for this rule
					if (rule.exceptions?.length) {
						const anyExceptionMatches = rule.exceptions.some((exc) =>
							this.#elementMatchesCondition(el, exc, elIdx, elements.length),
						);
						if (anyExceptionMatches) continue;
					}
					claimed.set(el.id, rule._id);
				}
			}
		}
		return claimed;
	}

	#elementMatchesAllConditions(el: AreaElement, conditions: RuleCondition[], index: number, total: number): boolean {
		return conditions.every((c) => this.#elementMatchesCondition(el, c, index, total));
	}

	#elementMatchesCondition(el: AreaElement, condition: RuleCondition, index: number, total: number): boolean {
		const val = String(condition.value ?? '');
		const numVal = Number(condition.value);

		switch (condition.type) {
			case 'textBeginsWith':
				return el.text.toLowerCase().startsWith(val.toLowerCase());
			case 'textEndsWith':
				return el.text.toLowerCase().endsWith(val.toLowerCase());
			case 'textContains':
				return el.text.toLowerCase().includes(val.toLowerCase());
			case 'textMatchesPattern':
				try { return new RegExp(val, 'i').test(el.text); } catch { return false; }
			case 'fontSizeEquals':
				return !isNaN(numVal) && Math.abs(el.fontSize - numVal) <= 0.5;
			case 'fontSizeAbove':
				return !isNaN(numVal) && el.fontSize > numVal;
			case 'fontSizeBelow':
				return !isNaN(numVal) && el.fontSize < numVal;
			case 'fontSizeRange': {
				const range = (condition.value && typeof condition.value === 'object')
					? condition.value as { min: number; max: number }
					: null;
				return range !== null && el.fontSize >= range.min && el.fontSize <= range.max;
			}
			case 'fontNameContains':
				return el.fontName.toLowerCase().includes(val.toLowerCase());
			case 'colorEquals':
				return el.color.toLowerCase() === val.toLowerCase();
			case 'positionFirst':
				return index === 0;
			case 'positionLast':
				return index === total - 1;
			// HTML-specific (web sources)
			case 'htmlTagEquals':
				return (el.htmlTag ?? '').toLowerCase() === val.toLowerCase();
			case 'cssClassContains':
				return (el.cssClasses ?? '').toLowerCase().includes(val.toLowerCase());
			case 'htmlContainerPathContains':
				return (el.htmlContainerPath ?? '').toLowerCase().includes(val.toLowerCase());
			case 'isBoldEquals':
				return el.isBold === true;
			default:
				return false;
		}
	}

	// ===== Auto-populate conditions from an element =====

	#autoPopulateConditions(el: AreaElement, elIndex: number, total: number): RuleCondition[] {
		if (this.#sourceType === 'web') {
			return this.#autoPopulateWebConditions(el);
		}
		return this.#autoPopulatePdfConditions(el, elIndex, total);
	}

	/** Auto-populate conditions for web sources using HTML structure + computed CSS. */
	#autoPopulateWebConditions(el: AreaElement): RuleCondition[] {
		const conditions: RuleCondition[] = [];

		// HTML tag (primary structural identifier for web)
		if (el.htmlTag) {
			conditions.push({ type: 'htmlTagEquals', value: el.htmlTag });
		}

		// Font size (real computed CSS value)
		if (el.fontSize > 0) {
			conditions.push({ type: 'fontSizeEquals', value: el.fontSize });
		}

		// CSS classes (first class as a condition)
		if (el.cssClasses) {
			const firstClass = el.cssClasses.split(' ')[0];
			if (firstClass) {
				conditions.push({ type: 'cssClassContains', value: firstClass });
			}
		}

		// Color (skip black as it's the default)
		if (el.color && el.color.toLowerCase() !== '#000000' && el.color.toLowerCase() !== '#000') {
			conditions.push({ type: 'colorEquals', value: el.color });
		}

		// Container path (last segment — most specific container)
		if (el.htmlContainerPath) {
			const segments = el.htmlContainerPath.split('/');
			const lastSegment = segments[segments.length - 1];
			if (lastSegment) {
				conditions.push({ type: 'htmlContainerPathContains', value: lastSegment });
			}
		}

		// Bold detection (<strong>/<b> or CSS font-weight)
		if (el.isBold) {
			conditions.push({ type: 'isBoldEquals', value: 'true' });
		}

		return conditions;
	}

	/** Auto-populate conditions for PDF sources using font metrics and position. */
	#autoPopulatePdfConditions(el: AreaElement, elIndex: number, total: number): RuleCondition[] {
		const conditions: RuleCondition[] = [];

		// Font size
		conditions.push({ type: 'fontSizeEquals', value: el.fontSize });

		// Font name — strip PDF subset prefix (e.g. "GHEALP+Clarendon" → "Clarendon")
		if (el.fontName) {
			const fontName = el.fontName.includes('+') ? el.fontName.substring(el.fontName.indexOf('+') + 1) : el.fontName;
			conditions.push({ type: 'fontNameContains', value: fontName });
		}

		// Color (skip black/very dark as it's the default)
		if (el.color && el.color.toLowerCase() !== '#000000' && el.color.toLowerCase() !== '#000') {
			conditions.push({ type: 'colorEquals', value: el.color });
		}

		// Text prefix — if text contains a colon, use "begins with" up to the colon
		const colonIdx = el.text.indexOf(':');
		if (colonIdx > 0 && colonIdx < 30) {
			conditions.push({ type: 'textBeginsWith', value: el.text.substring(0, colonIdx + 1) });
		}

		// Position
		if (elIndex === 0) {
			conditions.push({ type: 'positionFirst' });
		} else if (elIndex === total - 1) {
			conditions.push({ type: 'positionLast' });
		}

		return conditions;
	}

	// ===== Rule CRUD =====

	/** Generic helper: update a single rule by _id. */
	#updateRuleById(id: string, updater: (rule: EditableRule) => EditableRule) {
		this._rules = this._rules.map((r) => r._id === id ? updater(r) : r);
	}

	#addRule(groupName: string = UNGROUPED_GROUP) {
		// Ensure group exists (covers Ungrouped and first-time creation)
		if (!this._groupOrder.includes(groupName)) {
			this._groupOrder = [...this._groupOrder, groupName];
		}
		const id = generateRuleId();
		this._rules = [...this._rules, {
			role: '',
			part: 'content' as RulePart,
			conditions: [],
			formats: [{ type: 'block' as FormatEntryType, value: 'auto' }],
			_id: id,
			_groupName: groupName,
		}];
		// Auto-expand new rules so user can fill in details
		this.#expandRule(id);
	}

	#removeRuleById(id: string) {
		this._rules = this._rules.filter((r) => r._id !== id);
	}

	#createRuleFromElement(el: AreaElement, elIndex: number) {
		const conditions = this.#autoPopulateConditions(el, elIndex, this.#elements.length);
		// Derive a role name suggestion from text (kebab-case first few words)
		const roleSuggestion = el.text
			.split(/[\s:,]+/)
			.slice(0, 3)
			.join('-')
			.toLowerCase()
			.replace(/[^a-z0-9-]/g, '');
		const id = generateRuleId();
		// Ensure Ungrouped group exists for the new rule
		if (!this._groupOrder.includes(UNGROUPED_GROUP)) {
			this._groupOrder = [...this._groupOrder, UNGROUPED_GROUP];
		}
		this._rules = [...this._rules, {
			role: roleSuggestion,
			part: 'content' as RulePart,
			conditions,
			formats: [{ type: 'block' as FormatEntryType, value: 'auto' }],
			_id: id,
			_groupName: UNGROUPED_GROUP,
		}];
		// Auto-expand so user can review auto-populated conditions
		this.#expandRule(id);
	}

	#updateRoleName(id: string, value: string) {
		this.#updateRuleById(id, (r) => ({ ...r, role: value }));
	}

	#updatePart(id: string, value: RulePart) {
		this.#updateRuleById(id, (r) => ({ ...r, part: value }));
	}

	#updateExclude(id: string, value: boolean) {
		this.#updateRuleById(id, (r) => ({ ...r, exclude: value }));
	}

	#moveRuleToGroup(id: string, groupName: string) {
		this.#updateRuleById(id, (r) => ({ ...r, _groupName: groupName }));
	}

	// ===== Group CRUD =====

	#addGroup() {
		let name = 'New Group';
		let counter = 1;
		while (this._groupOrder.includes(name)) {
			name = `New Group ${++counter}`;
		}
		this._groupOrder = [...this._groupOrder, name];
		// Immediately enter rename mode
		this._renamingGroup = name;
		this._renameValue = name;
	}

	#startRenameGroup(name: string) {
		this._renamingGroup = name;
		this._renameValue = name;
	}

	#confirmRenameGroup() {
		if (!this._renamingGroup || !this._renameValue.trim()) return;
		const oldName = this._renamingGroup;
		const newName = this._renameValue.trim();

		if (oldName !== newName) {
			// Update group order
			this._groupOrder = this._groupOrder.map((n) => n === oldName ? newName : n);
			// Update all rules in this group
			this._rules = this._rules.map((r) =>
				r._groupName === oldName ? { ...r, _groupName: newName } : r,
			);
		}
		this._renamingGroup = null;
		this._renameValue = '';
	}

	#cancelRenameGroup() {
		this._renamingGroup = null;
		this._renameValue = '';
	}

	#deleteGroup(name: string) {
		// Move all rules from this group to Ungrouped
		this._rules = this._rules.map((r) =>
			r._groupName === name ? { ...r, _groupName: UNGROUPED_GROUP } : r,
		);
		this._groupOrder = this._groupOrder.filter((n) => n !== name);
		// Ensure Ungrouped group exists
		if (!this._groupOrder.includes(UNGROUPED_GROUP)) {
			this._groupOrder = [...this._groupOrder, UNGROUPED_GROUP];
		}
	}

	// ===== Drag-and-drop sort handling =====

	/**
	 * Handles sort-change from an <updoc-sortable-rules> container.
	 * Rebuilds the flat _rules array: rules arriving in this container get
	 * their _groupName set; rules no longer in this container but still in
	 * _rules keep their existing _groupName.
	 */
	#onSortChange(groupName: string, e: CustomEvent<SortChangeDetail>) {
		const newRules = e.detail.rules as EditableRule[];
		const newRuleIds = new Set(newRules.map((r) => r._id));

		// Rebuild flat array: all groups in order
		const allRules: EditableRule[] = [];

		for (const gName of this._groupOrder) {
			if (gName === groupName) {
				// Use the new order for this group, set _groupName
				allRules.push(...newRules.map((r) => ({ ...r, _groupName: gName })));
			} else {
				// Keep existing rules for other groups, exclude any that moved into the changed container
				allRules.push(...this._rules.filter((r) => r._groupName === gName && !newRuleIds.has(r._id)));
			}
		}

		this._rules = allRules;
	}

	// ===== Format entry CRUD =====

	#addFormatEntry(id: string) {
		this.#updateRuleById(id, (r) => ({
			...r,
			formats: [...(r.formats ?? []), { type: 'block' as FormatEntryType, value: 'auto' }],
		}));
	}

	#removeFormatEntry(id: string, fmtIdx: number) {
		this.#updateRuleById(id, (r) => ({
			...r,
			formats: (r.formats ?? []).filter((_, i) => i !== fmtIdx),
		}));
	}

	#updateFormatEntryType(id: string, fmtIdx: number, type: FormatEntryType) {
		const defaultValue = type === 'block' ? 'auto' : 'bold';
		this.#updateRuleById(id, (r) => {
			const formats = [...(r.formats ?? [])];
			formats[fmtIdx] = { type, value: defaultValue };
			return { ...r, formats };
		});
	}

	#updateFormatEntryValue(id: string, fmtIdx: number, value: string) {
		this.#updateRuleById(id, (r) => {
			const formats = [...(r.formats ?? [])];
			formats[fmtIdx] = { ...formats[fmtIdx], value: value as FormatEntry['value'] };
			return { ...r, formats };
		});
	}

	#addCondition(id: string) {
		this.#updateRuleById(id, (r) => ({
			...r,
			conditions: [...r.conditions, { type: 'textBeginsWith' as RuleConditionType, value: '' }],
		}));
	}

	#removeCondition(id: string, condIdx: number) {
		this.#updateRuleById(id, (r) => ({
			...r,
			conditions: r.conditions.filter((_, i) => i !== condIdx),
		}));
	}

	#updateConditionType(id: string, condIdx: number, type: RuleConditionType) {
		this.#updateRuleById(id, (r) => {
			const conditions = [...r.conditions];
			let value: string | number | { min: number; max: number } | undefined;
			if (VALUELESS_CONDITIONS.includes(type)) {
				value = undefined;
			} else if (type === 'fontSizeRange') {
				value = { min: 0, max: 100 };
			} else {
				value = conditions[condIdx].value;
			}
			conditions[condIdx] = { type, value };
			return { ...r, conditions };
		});
	}

	#updateConditionValue(id: string, condIdx: number, value: string) {
		this.#updateRuleById(id, (r) => {
			const conditions = [...r.conditions];
			const cond = conditions[condIdx];
			const isNumeric = cond.type === 'fontSizeEquals' || cond.type === 'fontSizeAbove' || cond.type === 'fontSizeBelow';
			conditions[condIdx] = { ...cond, value: isNumeric && !isNaN(Number(value)) ? Number(value) : value };
			return { ...r, conditions };
		});
	}

	#updateFontSizeRangeValue(id: string, condIdx: number, field: 'min' | 'max', value: string) {
		this.#updateRuleById(id, (r) => {
			const conditions = [...r.conditions];
			const cond = conditions[condIdx];
			const current = (cond.value && typeof cond.value === 'object') ? cond.value as { min: number; max: number } : { min: 0, max: 100 };
			const numValue = !isNaN(Number(value)) ? Number(value) : 0;
			conditions[condIdx] = { ...cond, value: { ...current, [field]: numValue } };
			return { ...r, conditions };
		});
	}

	// ===== Exception CRUD =====

	#addException(id: string) {
		this.#updateRuleById(id, (r) => ({
			...r,
			exceptions: [...(r.exceptions ?? []), { type: 'textContains' as RuleConditionType, value: '' }],
		}));
	}

	#removeException(id: string, excIdx: number) {
		this.#updateRuleById(id, (r) => ({
			...r,
			exceptions: (r.exceptions ?? []).filter((_, i) => i !== excIdx),
		}));
	}

	#updateExceptionType(id: string, excIdx: number, type: RuleConditionType) {
		this.#updateRuleById(id, (r) => {
			const exceptions = [...(r.exceptions ?? [])];
			exceptions[excIdx] = {
				type,
				value: VALUELESS_CONDITIONS.includes(type) ? undefined : exceptions[excIdx].value,
			};
			return { ...r, exceptions };
		});
	}

	#updateExceptionValue(id: string, excIdx: number, value: string) {
		this.#updateRuleById(id, (r) => {
			const exceptions = [...(r.exceptions ?? [])];
			const exc = exceptions[excIdx];
			const isNumeric = exc.type === 'fontSizeEquals' || exc.type === 'fontSizeAbove' || exc.type === 'fontSizeBelow';
			exceptions[excIdx] = { ...exc, value: isNumeric && !isNaN(Number(value)) ? Number(value) : value };
			return { ...r, exceptions };
		});
	}

	// ===== Text Replacement CRUD =====

	#addTextReplacement(id: string) {
		this.#updateRuleById(id, (r) => ({
			...r,
			textReplacements: [...(r.textReplacements ?? []), { findType: 'textBeginsWith' as FindType, find: '', replaceType: 'replaceWith' as ReplaceType, replace: '' }],
		}));
	}

	#removeTextReplacement(id: string, trIdx: number) {
		this.#updateRuleById(id, (r) => ({
			...r,
			textReplacements: (r.textReplacements ?? []).filter((_, i) => i !== trIdx),
		}));
	}

	#updateTextReplacementFindType(id: string, trIdx: number, findType: FindType) {
		this.#updateRuleById(id, (r) => {
			const trs = [...(r.textReplacements ?? [])];
			// Auto-set replaceType based on findType
			const replaceType: ReplaceType = findType === 'textContains' ? 'replaceAll' : 'replaceWith';
			trs[trIdx] = { ...trs[trIdx], findType, replaceType };
			return { ...r, textReplacements: trs };
		});
	}

	#updateTextReplacementFind(id: string, trIdx: number, find: string) {
		this.#updateRuleById(id, (r) => {
			const trs = [...(r.textReplacements ?? [])];
			trs[trIdx] = { ...trs[trIdx], find };
			return { ...r, textReplacements: trs };
		});
	}

	#updateTextReplacementReplaceType(id: string, trIdx: number, replaceType: ReplaceType) {
		this.#updateRuleById(id, (r) => {
			const trs = [...(r.textReplacements ?? [])];
			trs[trIdx] = { ...trs[trIdx], replaceType };
			return { ...r, textReplacements: trs };
		});
	}

	#updateTextReplacementReplace(id: string, trIdx: number, replace: string) {
		this.#updateRuleById(id, (r) => {
			const trs = [...(r.textReplacements ?? [])];
			trs[trIdx] = { ...trs[trIdx], replace };
			return { ...r, textReplacements: trs };
		});
	}

	// ===== Submit =====

	/** Strip transient fields and sync format for C# compatibility. */
	#cleanRule(rule: EditableRule): SectionRule {
		const blockEntry = (rule.formats ?? []).find((f) => f.type === 'block');
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { _id, _groupName, action, ...clean } = rule;
		return {
			...clean,
			format: (blockEntry?.value ?? 'auto') as BlockFormat,
		};
	}

	#buildRulesValue(): AreaRules {
		// Auto-confirm any pending group rename before building value
		if (this._renamingGroup) {
			this.#confirmRenameGroup();
		}

		const groups: RuleGroup[] = [];
		let ungroupedRules: SectionRule[] = [];

		for (const name of this._groupOrder) {
			const groupRules = this._rules
				.filter((r) => r._groupName === name)
				.map((r) => this.#cleanRule(r));
			if (name === UNGROUPED_GROUP) {
				// "Ungrouped" sentinel → save as top-level rules (not a named group)
				ungroupedRules = groupRules;
			} else {
				groups.push({ name, rules: groupRules });
			}
		}

		return { groups, rules: ungroupedRules };
	}

	async #onSave() {
		const rules = this.#buildRulesValue();
		if (this.data?.onSave) {
			await this.data.onSave(rules);
		}
	}

	#onSaveAndClose() {
		const rules = this.#buildRulesValue();
		this.value = { rules };
		this.modalContext?.submit();
	}

	#onClose() {
		this.modalContext?.reject();
	}

	// ===== Rendering =====

	#renderConditionRow(ruleId: string, condIdx: number, condition: RuleCondition) {
		const isValueless = VALUELESS_CONDITIONS.includes(condition.type);
		const isRange = condition.type === 'fontSizeRange';
		const rangeValue = isRange && condition.value && typeof condition.value === 'object'
			? condition.value as { min: number; max: number }
			: { min: 0, max: 100 };
		return html`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${condition.type}
					@change=${(e: Event) => this.#updateConditionType(ruleId, condIdx, (e.target as HTMLSelectElement).value as RuleConditionType)}>
					${this.#conditionTypes.map((t) => html`
						<option value=${t} ?selected=${t === condition.type}>${CONDITION_LABELS[t]}</option>
					`)}
				</select>
				${isRange ? html`
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Min"
						.value=${String(rangeValue.min)}
						@input=${(e: Event) => this.#updateFontSizeRangeValue(ruleId, condIdx, 'min', (e.target as HTMLInputElement).value)} />
					<span class="range-separator">–</span>
					<input
						type="number"
						class="condition-value-input range-input"
						placeholder="Max"
						.value=${String(rangeValue.max)}
						@input=${(e: Event) => this.#updateFontSizeRangeValue(ruleId, condIdx, 'max', (e.target as HTMLInputElement).value)} />
				` : isValueless ? nothing : html`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(condition.value ?? '')}
						@input=${(e: Event) => this.#updateConditionValue(ruleId, condIdx, (e.target as HTMLInputElement).value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove condition"
					@click=${() => this.#removeCondition(ruleId, condIdx)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
	}

	#renderExceptionRow(ruleId: string, excIdx: number, exception: RuleCondition) {
		const isValueless = VALUELESS_CONDITIONS.includes(exception.type);
		return html`
			<div class="condition-row">
				<select
					class="condition-type-select"
					.value=${exception.type}
					@change=${(e: Event) => this.#updateExceptionType(ruleId, excIdx, (e.target as HTMLSelectElement).value as RuleConditionType)}>
					${this.#conditionTypes.map((t) => html`
						<option value=${t} ?selected=${t === exception.type}>${CONDITION_LABELS[t]}</option>
					`)}
				</select>
				${isValueless ? nothing : html`
					<input
						type="text"
						class="condition-value-input"
						placeholder="Value..."
						.value=${String(exception.value ?? '')}
						@input=${(e: Event) => this.#updateExceptionValue(ruleId, excIdx, (e.target as HTMLInputElement).value)} />
				`}
				<uui-button
					compact
					look="secondary"
					label="Remove exception"
					@click=${() => this.#removeException(ruleId, excIdx)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
	}

	#renderFormatRow(ruleId: string, fmtIdx: number, entry: FormatEntry) {
		const valueOptions = entry.type === 'block' ? ALL_BLOCK_FORMATS : ALL_STYLE_FORMATS;
		const valueLabels = entry.type === 'block' ? BLOCK_FORMAT_LABELS : STYLE_FORMAT_LABELS;

		return html`
			<div class="condition-row">
				<select
					class="format-type-select"
					.value=${entry.type}
					@change=${(e: Event) => this.#updateFormatEntryType(ruleId, fmtIdx, (e.target as HTMLSelectElement).value as FormatEntryType)}>
					${ALL_FORMAT_ENTRY_TYPES.map((t) => html`
						<option value=${t} ?selected=${t === entry.type}>${FORMAT_ENTRY_TYPE_LABELS[t]}</option>
					`)}
				</select>
				<select
					class="format-value-select"
					.value=${entry.value}
					@change=${(e: Event) => this.#updateFormatEntryValue(ruleId, fmtIdx, (e.target as HTMLSelectElement).value)}>
					${valueOptions.map((v) => html`
						<option value=${v} ?selected=${v === entry.value}>${valueLabels[v]}</option>
					`)}
				</select>
				<uui-button
					compact
					look="secondary"
					label="Remove format"
					@click=${() => this.#removeFormatEntry(ruleId, fmtIdx)}>
					<uui-icon name="icon-trash"></uui-icon>
				</uui-button>
			</div>
		`;
	}

	#renderTextReplacementRow(ruleId: string, trIdx: number, tr: TextReplacement) {
		const replaceLabel = tr.findType === 'textContains'
			? REPLACE_TYPE_LABELS['replaceAll']
			: REPLACE_TYPE_LABELS['replaceWith'];

		return html`
			<div class="find-replace-entry">
				<div class="condition-row">
					<select
						class="condition-type-select"
						.value=${tr.findType}
						@change=${(e: Event) => this.#updateTextReplacementFindType(ruleId, trIdx, (e.target as HTMLSelectElement).value as FindType)}>
						${ALL_FIND_TYPES.map((t) => html`
							<option value=${t} ?selected=${t === tr.findType}>${FIND_TYPE_LABELS[t]}</option>
						`)}
					</select>
					<input
						type="text"
						class="condition-value-input"
						placeholder="Find..."
						.value=${tr.find}
						@input=${(e: Event) => this.#updateTextReplacementFind(ruleId, trIdx, (e.target as HTMLInputElement).value)} />
					<uui-button
						compact
						look="secondary"
						label="Remove replacement"
						@click=${() => this.#removeTextReplacement(ruleId, trIdx)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</div>
				<div class="condition-row">
					<span class="replace-label">${replaceLabel}</span>
					<input
						type="text"
						class="condition-value-input"
						placeholder="(empty = remove)"
						.value=${tr.replace}
						@input=${(e: Event) => this.#updateTextReplacementReplace(ruleId, trIdx, (e.target as HTMLInputElement).value)} />
				</div>
			</div>
		`;
	}

	#renderRuleCard(rule: EditableRule, matchedElements: AreaElement[]) {
		const isExpanded = this.#isRuleExpanded(rule._id);

		if (!isExpanded) {
			return this.#renderCollapsedRule(rule, matchedElements);
		}

		return this.#renderExpandedRule(rule, matchedElements);
	}

	#renderCollapsedRule(rule: EditableRule, matchedElements: AreaElement[]) {
		const isExcluded = rule.exclude;
		const currentPart = rule.part ?? 'content';
		const partLabel = isExcluded ? 'Exclude' : PART_LABELS[currentPart] ?? currentPart;
		const matchCount = matchedElements.length;
		const roleName = rule.role || '(unnamed rule)';

		return html`
			<div class="rule-row" @click=${() => this.#toggleRuleExpanded(rule._id)}>
				<span class="rule-grip" title="Drag to reorder" @click=${(e: Event) => e.stopPropagation()}>⠿</span>
				<span class="rule-row-name">${roleName}</span>
				<span class="rule-row-part ${isExcluded ? 'excluded' : ''}">${partLabel}</span>
				${matchCount > 0
					? html`<span class="rule-row-match ${isExcluded ? 'excluded' : 'matched'}">${matchCount}&times;</span>`
					: html`<span class="rule-row-match no-match">0</span>`}
				<uui-action-bar class="rule-row-actions"
					@click=${(e: Event) => e.stopPropagation()}>
					<uui-button pristine look="primary" label="Edit rule"
						@click=${() => this.#toggleRuleExpanded(rule._id)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete rule"
						@click=${() => this.#removeRuleById(rule._id)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
	}

	#renderExpandedRule(rule: EditableRule, matchedElements: AreaElement[]) {
		const isExcluded = rule.exclude;
		const currentPart = rule.part ?? 'content';
		const id = rule._id;

		return html`
			<div class="rule-card">
				<div class="rule-header">
					<uui-icon class="rule-row-chevron expanded" name="icon-navigation-down"
						@click=${() => this.#toggleRuleExpanded(id)}
						style="cursor:pointer"></uui-icon>
					<input
						type="text"
						class="role-name-input"
						placeholder="Section name (e.g. tour-title)"
						.value=${rule.role}
						@input=${(e: Event) => this.#updateRoleName(id, (e.target as HTMLInputElement).value)} />
					<uui-button
						compact
						look="secondary"
						color="danger"
						label="Remove rule"
						@click=${() => this.#removeRuleById(id)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</div>

				${this._groupOrder.length > 1 ? html`
				<div class="group-move-area">
					<label class="group-move-label">Group</label>
					<select
						class="group-move-select"
						@change=${(e: Event) => {
							const val = (e.target as HTMLSelectElement).value;
							this.#moveRuleToGroup(id, val);
						}}>
						${this._groupOrder.map((g) => html`
							<option value=${g} ?selected=${g === rule._groupName}>${g}</option>
						`)}
					</select>
				</div>
				` : nothing}

				<div class="conditions-area">
					<div class="section-header collapsible" @click=${() => this.#toggleSection('conditions', id)}>
						<uui-icon name=${this.#isSectionExpanded('conditions', id) ? 'icon-navigation-down' : 'icon-navigation-right'}></uui-icon>
						Conditions${rule.conditions.length > 0 ? ` (${rule.conditions.length})` : ''}
					</div>
					${this.#isSectionExpanded('conditions', id) ? html`
						${rule.conditions.map((cond, cIdx) => this.#renderConditionRow(id, cIdx, cond))}
						<uui-button
							compact
							look="placeholder"
							label="Add condition"
							@click=${() => this.#addCondition(id)}>
							+ Add condition
						</uui-button>
					` : nothing}
				</div>

				<div class="exceptions-area">
					<div class="section-header collapsible" @click=${() => this.#toggleSection('exceptions', id)}>
						<uui-icon name=${this.#isSectionExpanded('exceptions', id) ? 'icon-navigation-down' : 'icon-navigation-right'}></uui-icon>
						Exceptions${(rule.exceptions ?? []).length > 0 ? ` (${(rule.exceptions ?? []).length})` : ''}
					</div>
					${this.#isSectionExpanded('exceptions', id) ? html`
						${(rule.exceptions ?? []).map((exc, eIdx) => this.#renderExceptionRow(id, eIdx, exc))}
						<uui-button
							compact
							look="placeholder"
							label="Add exception"
							@click=${() => this.#addException(id)}>
							+ Add exception
						</uui-button>
					` : nothing}
				</div>

				<div class="part-area">
					<div class="section-header collapsible" @click=${() => this.#toggleSection('part', id)}>
						<uui-icon name=${this.#isSectionExpanded('part', id) ? 'icon-navigation-down' : 'icon-navigation-right'}></uui-icon>
						Part
					</div>
					${this.#isSectionExpanded('part', id) ? html`
						<div class="part-controls">
							<select
								class="part-select"
								.value=${currentPart}
								?disabled=${isExcluded}
								@change=${(e: Event) => this.#updatePart(id, (e.target as HTMLSelectElement).value as RulePart)}>
								${ALL_PARTS.map((p) => html`
									<option value=${p} ?selected=${p === currentPart}>${PART_LABELS[p]}</option>
								`)}
							</select>
							<label class="exclude-label">
								<input
									type="checkbox"
									.checked=${isExcluded}
									@change=${(e: Event) => this.#updateExclude(id, (e.target as HTMLInputElement).checked)} />
								Exclude
							</label>
						</div>
					` : nothing}
				</div>

				${!isExcluded ? html`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => this.#toggleSection('format', id)}>
						<uui-icon name=${this.#isSectionExpanded('format', id) ? 'icon-navigation-down' : 'icon-navigation-right'}></uui-icon>
						Format${(rule.formats ?? []).length > 0 ? ` (${(rule.formats ?? []).length})` : ''}
					</div>
					${this.#isSectionExpanded('format', id) ? html`
						${(rule.formats ?? []).map((fmt, fIdx) => this.#renderFormatRow(id, fIdx, fmt))}
						<uui-button
							compact
							look="placeholder"
							label="Add format"
							@click=${() => this.#addFormatEntry(id)}>
							+ Add format
						</uui-button>
					` : nothing}
				</div>
				` : nothing}

				${!isExcluded ? html`
				<div class="format-area">
					<div class="section-header collapsible" @click=${() => this.#toggleSection('findReplace', id)}>
						<uui-icon name=${this.#isSectionExpanded('findReplace', id) ? 'icon-navigation-down' : 'icon-navigation-right'}></uui-icon>
						Find &amp; Replace${(rule.textReplacements ?? []).length > 0 ? ` (${(rule.textReplacements ?? []).length})` : ''}
					</div>
					${this.#isSectionExpanded('findReplace', id) ? html`
						${(rule.textReplacements ?? []).map((tr, trIdx) => this.#renderTextReplacementRow(id, trIdx, tr))}
						<uui-button
							compact
							look="placeholder"
							label="Add find & replace"
							@click=${() => this.#addTextReplacement(id)}>
							+ Add find &amp; replace
						</uui-button>
					` : nothing}
				</div>
				` : nothing}

				<div class="match-preview ${matchedElements.length > 0 ? (isExcluded ? 'excluded' : 'matched') : 'no-match'}">
					${matchedElements.length > 0
						? html`<uui-icon name=${isExcluded ? 'icon-block' : 'icon-check'}></uui-icon> ${isExcluded ? 'Excluded' : 'Matched'} <strong>${matchedElements.length}&times;</strong>${matchedElements.length <= 5 ? html`: ${matchedElements.map((el, i) => html`${i > 0 ? html`, ` : nothing}<strong>${this.#truncate(el.text, 40)}</strong>`)}` : nothing}`
						: html`<uui-icon name="icon-alert"></uui-icon> ${rule.conditions.length === 0 ? 'Add conditions to match elements' : 'No match'}`}
				</div>
			</div>
		`;
	}

	#truncate(text: string, max: number): string {
		return text.length > max ? text.substring(0, max) + '...' : text;
	}

	#renderGroupHeader(name: string) {
		// Ungrouped sentinel: simple header, no rename/delete
		if (name === UNGROUPED_GROUP) {
			return html`
				<div class="group-header">
					<strong class="group-name">${name}</strong>
				</div>
			`;
		}

		if (this._renamingGroup === name) {
			return html`
				<div class="group-header">
					<input
						type="text"
						class="group-rename-input"
						.value=${this._renameValue}
						@input=${(e: Event) => { this._renameValue = (e.target as HTMLInputElement).value; }}
						@keydown=${(e: KeyboardEvent) => {
							if (e.key === 'Enter') this.#confirmRenameGroup();
							if (e.key === 'Escape') this.#cancelRenameGroup();
						}} />
					<uui-button compact look="primary" label="Confirm" @click=${() => this.#confirmRenameGroup()}>
						<uui-icon name="icon-check"></uui-icon>
					</uui-button>
					<uui-button compact look="secondary" label="Cancel" @click=${() => this.#cancelRenameGroup()}>
						<uui-icon name="icon-wrong"></uui-icon>
					</uui-button>
				</div>
			`;
		}

		return html`
			<div class="group-header">
				<strong class="group-name">${name}</strong>
				<span class="header-spacer"></span>
				<uui-action-bar class="group-header-actions">
					<uui-button pristine look="primary" label="Rename" @click=${() => this.#startRenameGroup(name)}>
						<uui-icon name="icon-edit"></uui-icon>
					</uui-button>
					<uui-button pristine look="primary" label="Delete group"
						title="Delete group (rules move to ungrouped)"
						@click=${() => this.#deleteGroup(name)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</div>
		`;
	}

	#renderUnmatchedElements(claimed: Map<string, number>) {
		const elements = this.#elements;
		const unmatched = elements.filter((el) => !claimed.has(el.id));
		if (unmatched.length === 0) return nothing;

		return html`
			<div class="unmatched-section">
				<h4>Unmatched elements (${unmatched.length})</h4>
				${unmatched.map((el) => {
					const elIndex = elements.indexOf(el);
					return html`
						<div class="unmatched-element">
							<div class="unmatched-text">${this.#truncate(el.text, 80)}</div>
							<div class="unmatched-meta">
								${this.#sourceType === 'web'
									? html`
										${el.htmlTag ? html`<span class="meta-badge tag-badge">&lt;${el.htmlTag}&gt;</span>` : nothing}
										<span class="meta-badge">${el.fontSize}pt</span>
										${el.isBold ? html`<span class="meta-badge tag-badge"><b>B</b></span>` : nothing}
										${el.cssClasses ? html`<span class="meta-badge class-badge">.${el.cssClasses.split(' ')[0]}</span>` : nothing}
										${el.color !== '#000000' ? html`<span class="meta-badge" style="border-left: 3px solid ${el.color};">${el.color}</span>` : nothing}
									`
									: html`
										<span class="meta-badge">${el.fontSize}pt</span>
										<span class="meta-badge">${el.fontName}</span>
										${el.color !== '#000000' ? html`<span class="meta-badge" style="border-left: 3px solid ${el.color};">${el.color}</span>` : nothing}
									`
								}
							</div>
							<uui-button
								compact
								look="outline"
								label="Define rule from this"
								@click=${() => this.#createRuleFromElement(el, elIndex)}>
								Define rule
							</uui-button>
						</div>
					`;
				})}
			</div>
		`;
	}

	override render() {
		const claimed = this.#evaluateRules();

		// Build rule _id -> all matched elements lookup
		const ruleMatches = new Map<string, AreaElement[]>();
		for (const [elId, ruleId] of claimed) {
			const el = this.#elements.find((e) => e.id === elId);
			if (el) {
				const existing = ruleMatches.get(ruleId) ?? [];
				existing.push(el);
				ruleMatches.set(ruleId, existing);
			}
		}

		const groupedView = this.#groupedView;

		return html`
			<umb-body-layout headline="Edit Sections: ${this.#sectionHeading}">
				<div id="main">
					<div class="section-info">
						${this.data?.sectionCount != null
							? html`<span class="meta-badge">${this.data.sectionCount} section${this.data.sectionCount !== 1 ? 's' : ''}</span>`
							: nothing}
						<span class="meta-badge">${this.#elements.length} elements</span>
						<span class="meta-badge">${this._rules.length} rules</span>
						<span class="meta-badge">${claimed.size} matched</span>
						<span class="meta-badge">${this.#elements.length - claimed.size} unmatched</span>
						${(() => {
							const realGroups = this._groupOrder.filter((g) => g !== UNGROUPED_GROUP).length;
							return realGroups > 0
								? html`<span class="meta-badge">${realGroups} group${realGroups !== 1 ? 's' : ''}</span>`
								: nothing;
						})()}
					</div>

					${groupedView.map((entry) => {
						const renderItemCb = (rule: SortableRule) =>
							this.#renderRuleCard(rule as EditableRule, ruleMatches.get(rule._id) ?? []);

						return html`
							<div class="group-container">
								${this.#renderGroupHeader(entry.group)}
								<div class="group-rules">
									<updoc-sortable-rules
										.rules=${entry.rules}
										.expandedIds=${this._expandedRules}
										.renderItem=${renderItemCb}
										@sort-change=${(e: CustomEvent<SortChangeDetail>) => this.#onSortChange(entry.group, e)}
									></updoc-sortable-rules>
									<uui-button
										look="placeholder"
										label="Add rule to ${entry.group}"
										@click=${() => this.#addRule(entry.group)}>
										+ Add rule
									</uui-button>
								</div>
							</div>
						`;
					})}

					<uui-button
						look="outline"
						label="Add group"
						@click=${() => this.#addGroup()}>
						<uui-icon name="icon-add"></uui-icon>
						Add group
					</uui-button>

					${this.#renderUnmatchedElements(claimed)}
				</div>

				<div slot="actions">
					<uui-button label="Close" @click=${this.#onClose}>Close</uui-button>
					<uui-button
						label="Save"
						look="secondary"
						@click=${this.#onSave}>
						Save
					</uui-button>
					<uui-button
						label="Save and Close"
						look="primary"
						color="positive"
						@click=${this.#onSaveAndClose}>
						Save and Close
					</uui-button>
				</div>
			</umb-body-layout>
		`;
	}

	static override styles = [
		UmbTextStyles,
		ruleCardStyles,
		css`
			:host {
				display: block;
				height: 100%;
			}

			#main {
				padding: var(--uui-size-space-4);
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-4);
			}

			.section-info {
				display: flex;
				gap: var(--uui-size-space-2);
				flex-wrap: wrap;
			}

			.meta-badge {
				font-size: 11px;
				font-family: monospace;
				padding: 1px 6px;
				border-radius: var(--uui-border-radius);
				background: var(--uui-color-surface-alt);
				color: var(--uui-color-text-alt);
			}
			.tag-badge {
				background: var(--uui-color-violet-light);
				color: var(--uui-color-violet-standalone);
			}
			.class-badge {
				background: var(--uui-color-warning-light);
				color: var(--uui-color-warning-standalone);
			}

			/* Group containers */
			.group-container {
				border: 2px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				overflow: hidden;
			}

			.group-header {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
				background: var(--uui-color-surface-alt);
				border-bottom: 1px solid var(--uui-color-border);
			}

			.group-name {
				font-size: var(--uui-type-default-size);
				color: var(--uui-color-text);
			}

			.group-header-actions {
				opacity: 0;
				transition: opacity 120ms ease;
			}

			.group-header:hover .group-header-actions {
				opacity: 1;
			}

			.group-rename-input {
				flex: 1;
				padding: var(--uui-size-space-1) var(--uui-size-space-2);
				border: 1px solid var(--uui-color-focus);
				border-radius: var(--uui-border-radius);
				font-size: var(--uui-type-default-size);
				background: var(--uui-color-surface);
				color: var(--uui-color-text);
			}

			.group-rename-input:focus {
				outline: none;
			}

			.header-spacer {
				flex: 1;
			}

			.group-rules {
				padding: var(--uui-size-space-3);
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-space-3);
			}

			/* Group move dropdown on expanded rules */
			.group-move-area {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-2);
				padding: 0 var(--uui-size-space-3);
			}

			.group-move-label {
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
				white-space: nowrap;
			}

			.group-move-select {
				flex: 1;
				padding: var(--uui-size-space-1) var(--uui-size-space-2);
				border: 1px solid var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				font-size: var(--uui-type-small-size);
				background: var(--uui-color-surface);
				color: var(--uui-color-text);
			}


			/* Unmatched elements */
			.unmatched-section {
				border: 1px dashed var(--uui-color-border);
				border-radius: var(--uui-border-radius);
				padding: var(--uui-size-space-3) var(--uui-size-space-4);
			}

			.unmatched-section h4 {
				margin: 0 0 var(--uui-size-space-3);
				color: var(--uui-color-text-alt);
				font-size: var(--uui-type-small-size);
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}

			.unmatched-element {
				display: flex;
				align-items: center;
				gap: var(--uui-size-space-3);
				padding: var(--uui-size-space-2) 0;
				border-bottom: 1px solid var(--uui-color-border);
			}

			.unmatched-element:last-child {
				border-bottom: none;
			}

			.unmatched-text {
				flex: 1;
				font-size: var(--uui-type-small-size);
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.unmatched-meta {
				display: flex;
				gap: var(--uui-size-space-1);
				flex-shrink: 0;
			}
		`,
	];
}

export default UpDocSectionRulesEditorModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-section-rules-editor-modal': UpDocSectionRulesEditorModalElement;
	}
}
