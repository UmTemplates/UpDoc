import { css } from '@umbraco-cms/backoffice/external/lit';

/**
 * Shared styles for rule cards (collapsed rows + expanded cards).
 * Imported by both the section-rules-editor modal and the sortable-rules container
 * so styles apply across shadow DOM boundaries.
 */
export const ruleCardStyles = css`
	/* Collapsed rule row */
	.rule-row {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-3);
		padding: var(--uui-size-space-2) var(--uui-size-space-4);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		cursor: pointer;
		user-select: none;
		background: var(--uui-color-surface);
		transition: background 120ms ease;
	}

	.rule-row:hover {
		background: var(--uui-color-surface-alt);
	}

	.rule-row-name {
		flex: 1;
		font-size: var(--uui-type-default-size);
		font-weight: 600;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.rule-row-part {
		font-size: 11px;
		font-weight: 600;
		padding: 1px 8px;
		border-radius: var(--uui-border-radius);
		background: var(--uui-color-surface-alt);
		color: var(--uui-color-text-alt);
		flex-shrink: 0;
	}

	.rule-row-part.excluded {
		background: color-mix(in srgb, var(--uui-color-danger) 15%, transparent);
		color: var(--uui-color-danger-standalone);
	}

	.rule-row-match {
		font-size: 11px;
		font-weight: 700;
		padding: 1px 6px;
		border-radius: var(--uui-border-radius);
		flex-shrink: 0;
	}

	.rule-row-match.matched {
		background: color-mix(in srgb, var(--uui-color-positive) 15%, transparent);
		color: var(--uui-color-positive-standalone);
	}

	.rule-row-match.excluded {
		background: color-mix(in srgb, var(--uui-color-danger) 15%, transparent);
		color: var(--uui-color-danger-standalone);
	}

	.rule-row-match.no-match {
		background: color-mix(in srgb, var(--uui-color-warning) 15%, transparent);
		color: var(--uui-color-warning-standalone);
	}

	.rule-row-chevron {
		font-size: 12px;
		color: var(--uui-color-text-alt);
		flex-shrink: 0;
		transition: transform 120ms ease;
	}

	/* Action bar: hidden by default, appears on hover */
	.rule-row-actions {
		flex-shrink: 0;
		opacity: 0;
		transition: opacity 120ms ease;
	}

	.rule-row:hover .rule-row-actions {
		opacity: 1;
	}

	/* Rule cards (expanded) */
	.rule-card {
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		overflow: hidden;
	}

	.rule-header {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-3);
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		background: var(--uui-color-surface-alt);
		border-bottom: 1px solid var(--uui-color-border);
	}

	.rule-grip {
		cursor: grab;
		color: var(--uui-color-text-alt);
		font-size: 14px;
		user-select: none;
		flex-shrink: 0;
	}

	.rule-grip:active {
		cursor: grabbing;
	}

	.role-name-input {
		flex: 1;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-default-size);
		font-family: monospace;
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.role-name-input:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	/* Section headers within rule cards */
	.section-header {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--uui-color-text-alt);
		margin-bottom: var(--uui-size-space-1);
	}

	.section-header.collapsible {
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-1);
		user-select: none;
	}

	.section-header.collapsible:hover {
		color: var(--uui-color-text);
	}

	.section-header.collapsible uui-icon {
		font-size: 10px;
	}

	/* Conditions */
	.conditions-area {
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-2);
	}

	/* Exceptions */
	.exceptions-area {
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-2);
		border-top: 1px solid var(--uui-color-border);
	}

	.condition-row {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-2);
	}

	.condition-type-select {
		min-width: 180px;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.condition-type-select:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	.condition-value-input {
		flex: 1;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		font-family: monospace;
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.condition-value-input:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	.condition-value-input.range-input {
		max-width: 80px;
		flex: 0 0 auto;
	}

	.range-separator {
		font-size: var(--uui-type-small-size);
		color: var(--uui-color-text-alt);
		align-self: center;
	}

	/* Multi-value chip input (OR of several values on a text condition) */
	.chip-input {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--uui-size-space-1);
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		background: var(--uui-color-surface);
	}

	.chip-input:focus-within {
		border-color: var(--uui-color-focus);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--uui-size-space-1);
		padding: 0 var(--uui-size-space-1);
		background: var(--uui-color-surface-alt);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		font-family: monospace;
	}

	.chip-remove {
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		font-size: var(--uui-type-default-size);
		color: var(--uui-color-text-alt);
	}

	.chip-remove:hover {
		color: var(--uui-color-danger);
	}

	.chip-field {
		flex: 1;
		min-width: 4rem;
		border: none;
		outline: none;
		padding: 0;
		font-size: var(--uui-type-small-size);
		font-family: monospace;
		background: transparent;
		color: var(--uui-color-text);
	}

	/* Format row selects */
	.format-type-select {
		min-width: 100px;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.format-type-select:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	.format-value-select {
		flex: 1;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.format-value-select:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	/* Part area */
	.part-area {
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-2);
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		border-top: 1px solid var(--uui-color-border);
	}

	.part-controls {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-3);
	}

	.part-select {
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		font-size: var(--uui-type-small-size);
		background: var(--uui-color-surface);
		color: var(--uui-color-text);
	}

	.part-select:focus {
		outline: none;
		border-color: var(--uui-color-focus);
	}

	.part-select:disabled {
		opacity: 0.5;
	}

	.exclude-label {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-1);
		font-size: var(--uui-type-small-size);
		color: var(--uui-color-text-alt);
		cursor: pointer;
		user-select: none;
	}

	/* Format area */
	.format-area {
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-2);
		padding: var(--uui-size-space-3) var(--uui-size-space-4);
		border-top: 1px solid var(--uui-color-border);
	}

	/* Find & Replace entries */
	.find-replace-entry {
		display: flex;
		flex-direction: column;
		gap: var(--uui-size-space-1);
		padding: var(--uui-size-space-2);
		border: 1px solid var(--uui-color-border);
		border-radius: var(--uui-border-radius);
		background: var(--uui-color-surface);
	}

	.replace-label {
		min-width: 180px;
		padding: var(--uui-size-space-1) var(--uui-size-space-2);
		font-size: var(--uui-type-small-size);
		color: var(--uui-color-text-alt);
		font-weight: 600;
	}

	/* Match preview */
	.match-preview {
		display: flex;
		align-items: center;
		gap: var(--uui-size-space-2);
		padding: var(--uui-size-space-2) var(--uui-size-space-4);
		font-size: var(--uui-type-small-size);
		border-top: 1px solid var(--uui-color-border);
	}

	.match-preview.matched {
		background: color-mix(in srgb, var(--uui-color-positive) 10%, transparent);
		color: var(--uui-color-positive-standalone);
	}

	.match-preview.excluded {
		background: color-mix(in srgb, var(--uui-color-danger) 10%, transparent);
		color: var(--uui-color-danger-standalone);
	}

	.match-preview.no-match {
		background: color-mix(in srgb, var(--uui-color-warning) 10%, transparent);
		color: var(--uui-color-warning-standalone);
	}

	.match-preview strong {
		font-weight: 600;
	}
`;
