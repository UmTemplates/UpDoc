// ============================================================================
// Source Config Types (source.json)
// ============================================================================

export interface SourceConfig {
	version: string;
	sourceTypes: string[];
	/** The workflow alias this source config belongs to (set at runtime, not persisted). */
	workflowAlias?: string;
	globals?: SourceGlobals;
	/** Top-level page selection: "all" or array of page numbers. */
	pages?: number[] | 'all';
	sections: SourceSection[];
	/** Legacy: rules keyed by section ID. Superseded by areaRules. */
	sectionRules?: Record<string, SectionRuleSet>;
	/** Rules for breaking area elements into individually-mappable sections, keyed by area name in kebab-case.
	 * Supports both old flat format { rules: [...] } and new grouped format { groups: [...], rules: [...] }. */
	areaRules?: Record<string, AreaRules>;
	/** Areas excluded from extraction/transform output, keyed by area name in kebab-case. */
	excludedAreas?: string[];
	/** User-defined overrides for container behaviour (web sources only). */
	containerOverrides?: ContainerOverride[];
}

// ============================================================================
// Container Override Types (stored in source.json under containerOverrides)
// ============================================================================

/** A user-defined override for a web container's behaviour. */
export interface ContainerOverride {
	/** Full slash-delimited CSS selector path of the container. */
	containerPath: string;
	/** Action to apply: promote to a top-level area, or mark as a section boundary. */
	action: 'promoteToArea' | 'makeSection';
	/** Optional human-readable label. Auto-derived from CSS selector if omitted. */
	label?: string;
}

// ============================================================================
// Section Rules Types (stored in source.json under sectionRules)
// ============================================================================

/** Legacy flat rule set — kept for backward-compatible deserialization of sectionRules. */
export interface SectionRuleSet {
	rules: SectionRule[];
}

// ============================================================================
// v3 Area Rules Types (groups + ungrouped)
// ============================================================================

/** Which slot a rule fills within a group. Title triggers section boundaries. */
export type RulePart = 'title' | 'content' | 'description' | 'summary';

/** Top-level container for an area's rules. Groups contain multi-part sections; ungrouped rules are single properties. */
export interface AreaRules {
	groups: RuleGroup[];
	rules: SectionRule[];  // Ungrouped
}

/** A named group of rules representing a multi-part section (e.g., "Tour Detail" with title + content). */
export interface RuleGroup {
	name: string;
	rules: SectionRule[];
}

/** Legacy action names — kept for backward compat deserialization */
export type RuleAction = 'singleProperty' | 'sectionTitle' | 'sectionContent' | 'sectionDescription' | 'sectionSummary' | 'exclude';
export type LegacyRuleAction = 'createSection' | 'setAsHeading' | 'addAsContent' | 'addAsList';

/**
 * Block-level Markdown format.
 * Determines what Markdown syntax the matched content produces.
 */
export type BlockFormat =
	| 'auto'
	| 'paragraph'
	| 'heading1' | 'heading2' | 'heading3'
	| 'heading4' | 'heading5' | 'heading6'
	| 'bulletListItem' | 'numberedListItem'
	| 'quote';

/** Legacy alias — kept for backward compat */
export type RuleContentFormat = BlockFormat;

/** Format entry types — Block (block-level Markdown) or Style (inline Markdown) */
export type FormatEntryType = 'block' | 'style';

/** Block-level format values — each maps to a Markdown block element */
export type BlockFormatValue =
	| 'auto'
	| 'paragraph'
	| 'heading1' | 'heading2' | 'heading3'
	| 'heading4' | 'heading5' | 'heading6'
	| 'bulletListItem' | 'numberedListItem'
	| 'quote';

/** Inline style format values — each wraps text in Markdown inline syntax */
export type StyleFormatValue = 'bold' | 'italic' | 'strikethrough' | 'code' | 'highlight';

/** A single format entry — either a block format or an inline style */
export interface FormatEntry {
	type: FormatEntryType;
	value: BlockFormatValue | StyleFormatValue;
}

/** Find type for text replacements */
export type FindType = 'textBeginsWith' | 'textEndsWith' | 'textContains';

/** Replace type for text replacements */
export type ReplaceType = 'replaceWith' | 'replaceAll';

export interface TextReplacement {
	findType: FindType;
	find: string;
	replaceType: ReplaceType;
	replace: string;
}

export interface SectionRule {
	role: string;
	/** v3: which slot this rule fills. */
	part?: RulePart;
	/** Legacy: action name. When part is set, action is ignored. */
	action?: RuleAction | LegacyRuleAction;
	/** Block format: auto, paragraph, heading1-6, etc. */
	format?: BlockFormat;
	/** Array of format entries (Block + Style rows). */
	formats?: FormatEntry[];
	/** When true, matched elements are skipped entirely. */
	exclude?: boolean;
	conditions: RuleCondition[];
	/** UNLESS conditions — if any single exception matches, the rule does not apply. */
	exceptions?: RuleCondition[];
	/** Find-and-replace entries applied to matched text before formatting. */
	textReplacements?: TextReplacement[];
	/** Transient: unique ID for drag-and-drop tracking. Not persisted. */
	_id?: string;
}

/** Get the effective part for a rule, normalizing from legacy action if needed. */
export function getEffectivePart(rule: SectionRule): RulePart | 'exclude' {
	if (rule.exclude) return 'exclude';
	if (rule.part) return rule.part;

	// Normalize from legacy action
	switch (rule.action) {
		case 'singleProperty':
		case 'sectionProperty':
		case 'sectionContent':
		case 'addAsContent':
		case 'addAsList':
			return 'content';
		case 'sectionTitle':
		case 'createSection':
		case 'setAsHeading':
			return 'title';
		case 'sectionDescription':
			return 'description';
		case 'sectionSummary':
			return 'summary';
		case 'exclude':
			return 'exclude';
		default:
			return 'content';
	}
}

/** Get the effective block format for a rule. */
export function getEffectiveFormat(rule: SectionRule): BlockFormat {
	if (rule.format) return rule.format;
	if (rule.action === 'addAsList') return 'bulletListItem';
	return 'auto';
}

/** Legacy normalize helper — kept for backward compat. Prefer getEffectivePart/getEffectiveFormat. */
export function normalizeAction(action: string, format?: RuleContentFormat): [RuleAction, RuleContentFormat | undefined] {
	switch (action) {
		case 'createSection':
		case 'setAsHeading':
			return ['sectionTitle', undefined];
		case 'addAsContent':
			return ['sectionContent', format ?? 'paragraph'];
		case 'addAsList':
			return ['sectionContent', format ?? 'bulletListItem'];
		case 'singleProperty':
		case 'sectionProperty':
			return ['singleProperty', format ?? 'paragraph'];
		case 'sectionTitle':
			return ['sectionTitle', undefined];
		case 'sectionContent':
			return ['sectionContent', format ?? 'paragraph'];
		case 'exclude':
			return ['exclude', undefined];
		default:
			return ['sectionContent', format ?? 'paragraph'];
	}
}

/**
 * Convert a legacy SectionRuleSet (flat rules) to AreaRules.
 * All rules go into the ungrouped array; groups is empty.
 */
export function toAreaRules(ruleSet: SectionRuleSet | AreaRules): AreaRules {
	// Already an AreaRules (has groups property)
	if ('groups' in ruleSet && Array.isArray(ruleSet.groups)) {
		return ruleSet as AreaRules;
	}
	// Legacy SectionRuleSet — wrap
	return { groups: [], rules: (ruleSet as SectionRuleSet).rules };
}

/** Get all rules from an AreaRules in order: grouped first, then ungrouped. */
export function allRules(areaRules: AreaRules): SectionRule[] {
	const result: SectionRule[] = [];
	for (const group of areaRules.groups) {
		result.push(...group.rules);
	}
	result.push(...areaRules.rules);
	return result;
}

export interface RuleCondition {
	type: RuleConditionType;
	value?: string | number;
}

export type RuleConditionType =
	| 'textBeginsWith'
	| 'textEndsWith'
	| 'textContains'
	| 'textEquals'
	| 'textMatchesPattern'
	| 'fontSizeEquals'
	| 'fontSizeAbove'
	| 'fontSizeBelow'
	| 'fontSizeRange'
	| 'fontNameContains'
	| 'fontNameEquals'
	| 'colorEquals'
	| 'positionFirst'
	| 'positionLast'
	// HTML-specific (web sources)
	| 'htmlTagEquals'
	| 'cssClassContains'
	| 'htmlContainerPathContains'
	| 'isBoldEquals';

/**
 * Pattern for identifying section heading elements within an area.
 * Null/undefined = auto-detect (bodySize * 1.15).
 * Empty conditions = flat section (no grouping).
 * Populated conditions = user-defined from teach-by-example.
 */
export interface SectionPattern {
	conditions: RuleCondition[];
}

export interface SourceGlobals {
	columnDetection?: ColumnDetectionConfig;
	pageRange?: PageRangeConfig;
}

export interface ColumnDetectionConfig {
	enabled: boolean;
	thresholdPercent: number;
}

export interface PageRangeConfig {
	start: number;
	end: number | 'last';
}

export interface SourceSection {
	key: string;
	label: string;
	description?: string;
	strategy: ExtractionStrategy;
	outputFormat: 'text' | 'markdown' | 'html';
	required?: boolean;
	pages?: number[] | 'all';
	columnFilter?: boolean;
	occurrence?: 'first' | 'last' | 'all';
	strategyParams?: StrategyParams;
}

export type ExtractionStrategy =
	| 'largestFont'
	| 'regex'
	| 'betweenPatterns'
	| 'region'
	| 'afterLabel'
	| 'firstHeading'
	| 'firstParagraph'
	| 'cssSelector'
	| 'xpath';

export interface StrategyParams {
	// largestFont
	fontSizeThreshold?: number;

	// regex
	pattern?: string;
	flags?: string;
	captureGroup?: number;

	// betweenPatterns
	startPattern?: string;
	stopPatterns?: string[];
	includeStartLine?: boolean;
	headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

	// region
	region?: RegionConfig;

	// firstHeading (markdown)
	level?: number;

	// afterLabel
	label?: string;
	labelPattern?: string;
	extractMode?: 'sameLine' | 'nextLine' | 'untilBlank';

	// cssSelector (web)
	selector?: string;
	attribute?: string;

	// xpath (web/Word)
	xpath?: string;
}

export interface RegionConfig {
	x?: { min?: number; max?: number };
	y?: { min?: number; max?: number };
	unit?: 'percent' | 'points';
}

// ============================================================================
// Destination Config Types (destination.json)
// ============================================================================

export interface DestinationConfig {
	version: string;
	documentTypeAlias: string;
	documentTypeName?: string;
	blueprintId?: string;
	blueprintName?: string;
	fields: DestinationField[];
	blockGrids?: DestinationBlockGrid[];
	blockLists?: DestinationBlockGrid[];
}

export interface DestinationField {
	key: string;
	alias: string;
	label: string;
	description?: string;
	type: FieldType;
	tab?: string;
	mandatory?: boolean;
	acceptsFormats?: ContentFormat[];
}

export type FieldType =
	| 'text'
	| 'textArea'
	| 'richText'
	| 'number'
	| 'date'
	| 'boolean'
	| 'mediaPicker'
	| 'contentPicker'
	| 'blockGrid'
	| 'blockList';

export type ContentFormat = 'text' | 'markdown' | 'html';

export interface DestinationBlockGrid {
	key: string;
	alias: string;
	label: string;
	description?: string;
	tab?: string;
	blocks: DestinationBlock[];
}

export interface DestinationBlock {
	key: string;
	contentTypeAlias: string;
	contentTypeKey?: string;
	label: string;
	description?: string;
	identifyBy?: BlockIdentifier;
	properties?: BlockProperty[];
}

export interface BlockIdentifier {
	property: string;
	value: string;
}

export interface BlockProperty {
	key: string;
	alias: string;
	label?: string;
	type: FieldType;
	acceptsFormats?: ContentFormat[];
}

// ============================================================================
// Map Config Types (map.json)
// ============================================================================

export interface MapConfig {
	version: string;
	name?: string;
	description?: string;
	mappings: SectionMapping[];
}

export interface SectionMapping {
	source: string;
	/** Stable GUID linking this mapping to the rule/group that produced the source section. */
	sourceKey?: string;
	destinations: MappingDestination[];
	enabled?: boolean;
	comment?: string;
}

export interface MappingDestination {
	target: string;
	blockKey?: string;
	contentTypeKey?: string;
	transforms?: MappingTransform[];
}

export interface MappingTransform {
	type: TransformType;
	params?: TransformParams;
}

export type TransformType =
	| 'convertMarkdownToHtml'
	| 'convertHtmlToMarkdown'
	| 'truncate'
	| 'template'
	| 'regex'
	| 'trim'
	| 'uppercase'
	| 'lowercase'
	| 'stripHtml';

export interface TransformParams {
	maxLength?: number;
	suffix?: string;
	template?: string;
	pattern?: string;
	replacement?: string;
}

// ============================================================================
// Combined Document Type Config
// ============================================================================

export interface DocumentTypeConfig {
	folderPath: string;
	documentTypeAlias: string;
	sources: Record<string, SourceConfig>;
	destination: DestinationConfig;
	map: MapConfig;
	validationWarnings?: string[];
}

// ============================================================================
// Rich Extraction Types (sample-extraction.json)
// ============================================================================

export interface RichExtractionResult {
	version: string;
	sourceType: string;
	source: ExtractionSource;
	elements: ExtractionElement[];
	/** For web sources: hierarchical container tree representing the HTML structure. */
	containers?: ContainerTreeNode[] | null;
}

export interface ExtractionSource {
	fileName: string;
	mediaKey: string;
	extractedDate: string;
	totalPages: number;
	/** Which pages were extracted. Null/undefined = all pages. */
	extractedPages?: number[] | null;
}

export interface ExtractionElement {
	id: string;
	page: number;
	text: string;
	metadata: ElementMetadata;
}

export interface ElementMetadata {
	fontSize: number;
	fontName: string;
	position: { x: number; y: number };
	boundingBox: { left: number; top: number; width: number; height: number };
	color: string;
	/** For web sources: auto-detected HTML area (e.g., "Header", "Main Content", "Footer"). */
	htmlArea?: string;
	/** For web sources: actual HTML tag (e.g., "p", "div", "h2", "li"). */
	htmlTag?: string;
	/** For web sources: slash-delimited CSS selector path of ancestor containers. */
	htmlContainerPath?: string;
	/** For web sources: space-separated CSS class names on this element. */
	cssClasses?: string;
}

// ============================================================================
// Visual Grouping Types (frontend-only, computed from extraction metadata)
// ============================================================================

export interface VisualGroup {
	heading: ExtractionElement | null;
	children: ExtractionElement[];
}

// ============================================================================
// Area Detection Types (area-detection.json — area-based hierarchical extraction)
// ============================================================================

export interface AreaDetectionResult {
	totalPages: number;
	pages: PageAreas[];
	diagnostics: AreaDiagnosticInfo;
}

export interface PageAreas {
	page: number;
	areas: DetectedArea[];
}

export interface DetectedArea {
	name?: string;
	color: string;
	boundingBox: { left: number; top: number; width: number; height: number };
	page: number;
	sections: DetectedSection[];
	totalElements: number;
	sectionPattern?: SectionPattern;
}

export interface DetectedSection {
	heading: AreaElement | null;
	children: AreaElement[];
}

export interface AreaElement {
	id: string;
	text: string;
	fontSize: number;
	fontName: string;
	color: string;
	boundingBox: { left: number; top: number; width: number; height: number };
	/** For web sources: actual HTML tag (e.g., "p", "div", "h2"). */
	htmlTag?: string;
	/** For web sources: slash-delimited CSS selector path of ancestor containers. */
	htmlContainerPath?: string;
	/** For web sources: space-separated CSS class names on this element. */
	cssClasses?: string;
	/** True when text is wrapped in <strong>/<b> or has CSS font-weight bold. */
	isBold?: boolean;
}

/** A node in the container tree representing an HTML element that contains extracted content. */
export interface ContainerTreeNode {
	tag: string;
	id?: string | null;
	className?: string | null;
	cssSelector: string;
	path: string;
	depth: number;
	elementCount: number;
	area?: string | null;
	children?: ContainerTreeNode[] | null;
}

export interface AreaDiagnosticInfo {
	totalPathsFound: number;
	pathsAfterFiltering: number;
	areasDetected: number;
	elementsInAreas: number;
}

// ============================================================================
// Transform Result Types (transform.json — assembled Markdown per section)
// ============================================================================

export interface TransformResult {
	version: string;
	areas: TransformArea[];
	diagnostics: TransformDiagnostics;
}

/** An area from the PDF page containing groups and ungrouped sections. */
export interface TransformArea {
	name: string;
	color: string | null;
	page: number;
	sortOrder?: number | null;
	groups: TransformGroup[];
	sections: TransformedSection[];
}

/** A named group of multi-part sections from grouped rules. */
export interface TransformGroup {
	name: string;
	sections: TransformedSection[];
}

/** Helper: get all sections from a TransformResult as a flat array. */
export function allTransformSections(result: TransformResult | null | undefined): TransformedSection[] {
	if (!result?.areas) return [];
	const sections: TransformedSection[] = [];
	for (const area of result.areas) {
		for (const group of area.groups) {
			sections.push(...group.sections);
		}
		sections.push(...area.sections);
	}
	return sections;
}

export interface TransformedSection {
	id: string;
	/** Stable GUID from the rule/group that produced this section. Null for preamble/heading-detected sections. */
	stableKey?: string | null;
	originalHeading: string | null;
	heading: string | null;
	content: string;
	/** Assembled Markdown from sectionDescription elements. Null if none. */
	description?: string | null;
	/** Assembled Markdown from sectionSummary elements. Null if none. */
	summary?: string | null;
	pattern: 'bulletList' | 'paragraph' | 'subHeaded' | 'preamble' | 'mixed' | 'role';
	page: number;
	areaColor: string | null;
	areaName: string | null;
	/** Rule group name for grouped sections (e.g., "Tour Details - Section"). Null for ungrouped. */
	groupName?: string | null;
	/** Individual rule name (from SectionRule.Role). For ungrouped: the rule name. For grouped: the title rule's name. Null for non-rule sections. */
	ruleName?: string | null;
	childCount: number;
	included: boolean;
	sortOrder?: number | null;
}

export interface TransformDiagnostics {
	totalSections: number;
	bulletListSections: number;
	paragraphSections: number;
	subHeadedSections: number;
	preambleSections: number;
	roleSections: number;
}

// ============================================================================
// Area Template Types (area-template.json — user-defined extraction areas)
// ============================================================================

export interface AreaTemplate {
	templateName: string;
	sourceFile: string;
	pageSize: { width: number; height: number };
	createdAt: string;
	areas: AreaDefinition[];
}

export interface AreaDefinition {
	name: string;
	property: string;
	page: number;
	type: string;
	bounds: AreaBounds;
	color: string;
	sectionPattern?: SectionPattern;
	expectedSections: string[];
	notes: string;
}

export interface AreaBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ExtractSectionsResponse {
	sections: Record<string, string>;
	config: DocumentTypeConfig;
}

export interface InferSectionPatternResponse {
	pattern: SectionPattern;
	matchingElementIds: string[];
	clickedElementId: string;
	totalElements: number;
}
