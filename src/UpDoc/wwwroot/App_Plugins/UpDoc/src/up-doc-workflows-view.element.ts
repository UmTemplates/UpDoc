import { html, css, customElement, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_MODAL_MANAGER_CONTEXT, UMB_CONFIRM_MODAL, umbOpenModal } from '@umbraco-cms/backoffice/modal';
import { UMB_BLUEPRINT_PICKER_MODAL } from './blueprint-picker-modal.token.js';
import type { DocumentTypeOption } from './blueprint-picker-modal.token.js';
import { UMB_CREATE_WORKFLOW_SIDEBAR } from './create-workflow-sidebar.token.js';
import { clearConfigCache, readApiError, triggerSampleExtraction, triggerTransform } from './workflow.service.js';

interface WorkflowSummary {
	name: string;
	alias: string;
	documentTypeAlias: string;
	documentTypeName: string | null;
	blueprintId: string | null;
	blueprintName: string | null;
	sourceTypes: string[];
	mappingCount: number;
	isComplete: boolean;
	validationWarnings: string[];
}

@customElement('up-doc-workflows-view')
export class UpDocWorkflowsViewElement extends UmbLitElement {
	@state() private _workflows: WorkflowSummary[] = [];
	@state() private _loading = true;
	@state() private _error: string | null = null;

	override async connectedCallback() {
		super.connectedCallback();
		await this.#loadWorkflows();
	}

	async #loadWorkflows() {
		this._loading = true;
		this._error = null;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();

			const response = await fetch('/umbraco/management/api/v1/updoc/workflows', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to load workflows: ${response.statusText}`);
			}

			this._workflows = await response.json();
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Failed to load workflows:', err);
		} finally {
			this._loading = false;
		}
	}

	async #handleCreateWorkflow() {
		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();

			// Step 1: Fetch document types and their blueprints
			const docTypesResponse = await fetch('/umbraco/management/api/v1/updoc/document-types', {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!docTypesResponse.ok) {
				throw new Error('Failed to load document types');
			}

			const docTypes: Array<{ alias: string; name: string; icon: string; id: string }> =
				await docTypesResponse.json();

			// Step 2: Build DocumentTypeOption[] for the blueprint picker
			const documentTypeOptions: DocumentTypeOption[] = [];

			for (const dt of docTypes) {
				const bpResponse = await fetch(
					`/umbraco/management/api/v1/updoc/document-types/${encodeURIComponent(dt.alias)}/blueprints`,
					{ headers: { Authorization: `Bearer ${token}` } },
				);

				if (!bpResponse.ok) continue;

				const blueprints: Array<{ id: string; name: string }> = await bpResponse.json();
				if (blueprints.length > 0) {
					documentTypeOptions.push({
						documentTypeUnique: dt.id,
						documentTypeName: dt.name,
						documentTypeIcon: dt.icon ?? null,
						blueprints: blueprints.map((bp) => ({
							blueprintUnique: bp.id,
							blueprintName: bp.name,
						})),
					});
				}
			}

			if (!documentTypeOptions.length) {
				this._error = 'No document types with blueprints found. Create a Document Blueprint first.';
				return;
			}

			// Step 3: Open blueprint picker dialog
			let blueprintSelection;
			try {
				blueprintSelection = await umbOpenModal(this, UMB_BLUEPRINT_PICKER_MODAL, {
					data: { documentTypes: documentTypeOptions },
				});
			} catch {
				return; // Cancelled
			}

			const { blueprintUnique, documentTypeUnique } = blueprintSelection;
			const selectedDocType = documentTypeOptions.find((dt) => dt.documentTypeUnique === documentTypeUnique);
			const selectedBlueprint = selectedDocType?.blueprints.find((bp) => bp.blueprintUnique === blueprintUnique);

			// Find the alias for the selected document type
			const selectedDocTypeApi = docTypes.find((dt) => dt.id === documentTypeUnique);

			// Step 4: Open Create Workflow sidebar
			let sidebarResult;
			try {
				sidebarResult = await umbOpenModal(this, UMB_CREATE_WORKFLOW_SIDEBAR, {
					data: {
						documentTypeUnique,
						documentTypeName: selectedDocType?.documentTypeName ?? '',
						documentTypeAlias: selectedDocTypeApi?.alias ?? '',
						blueprintUnique,
						blueprintName: selectedBlueprint?.blueprintName ?? '',
					},
				});
			} catch {
				return; // Cancelled
			}

			// Step 5: POST to create the workflow
			const response = await fetch('/umbraco/management/api/v1/updoc/workflows', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: sidebarResult.name,
					alias: sidebarResult.alias,
					documentTypeAlias: sidebarResult.documentTypeAlias,
					sourceType: sidebarResult.sourceType,
					blueprintId: sidebarResult.blueprintId,
					blueprintName: sidebarResult.blueprintName,
				}),
			});

			if (!response.ok) {
				throw new Error(await readApiError(response, 'Failed to create workflow'));
			}

			// Step 6: Save page selection if user chose specific pages
			if (sidebarResult.selectedPages && sidebarResult.selectedPages.length > 0) {
				await fetch(
					`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(sidebarResult.alias)}/pages`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({ pages: sidebarResult.selectedPages }),
					},
				);
			}

			// Step 7: If a sample source was provided, trigger extraction + transform
			if (sidebarResult.mediaUnique || sidebarResult.sourceUrl) {
				try {
					await triggerSampleExtraction(
						sidebarResult.alias,
						sidebarResult.mediaUnique ?? '',
						token,
						sidebarResult.sourceUrl ?? undefined
					);
					// Step 8: Trigger area detection + transform so content is visible immediately
					if (sidebarResult.mediaUnique) {
						await triggerTransform(
							sidebarResult.alias,
							sidebarResult.mediaUnique,
							token,
						);
					}
				} catch (err) {
					console.warn('Sample extraction during workflow creation failed:', err);
				}
			}

			// Refresh the list
			await this.#loadWorkflows();
		} catch (err) {
			if (err instanceof Error) {
				this._error = err.message;
				console.error('Failed to create workflow:', err);
			}
		}
	}

	#handleViewWorkflow(workflow: WorkflowSummary) {
		const encodedAlias = encodeURIComponent(workflow.alias);
		window.history.pushState({}, '', `section/settings/workspace/updoc-workflow/edit/${encodedAlias}`);
		window.dispatchEvent(new PopStateEvent('popstate'));
	}

	async #handleDeleteWorkflow(workflow: WorkflowSummary) {
		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);

		try {
			await modalManager.open(this, UMB_CONFIRM_MODAL, {
				data: {
					headline: `Delete "${workflow.name}"?`,
					content: html`<p>This will permanently delete the workflow folder and all its configuration files (destination, map, and source configs).</p>
						<p>This action cannot be undone.</p>`,
					confirmLabel: 'Delete',
					color: 'danger',
				},
			}).onSubmit();
		} catch {
			// Cancelled
			return;
		}

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();

			const response = await fetch(`/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(workflow.alias)}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(await readApiError(response, 'Failed to delete workflow'));
			}

			// Clear the client-side cache so the condition re-evaluates
			clearConfigCache();

			// Refresh the list
			await this.#loadWorkflows();
		} catch (err) {
			this._error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Failed to delete workflow:', err);
		}
	}

	override render() {
		if (this._loading) {
			return html`<uui-loader-bar></uui-loader-bar>`;
		}

		if (this._error) {
			return html`
				<uui-box>
					<p style="color: var(--uui-color-danger);">Error: ${this._error}</p>
					<uui-button look="secondary" @click=${() => this.#loadWorkflows()}>Retry</uui-button>
				</uui-box>
			`;
		}

		if (this._workflows.length === 0) {
			return this.#renderEmptyState();
		}

		return this.#renderWorkflowList();
	}

	#formatSourceTypes(sourceTypes: string[]): string {
		if (!sourceTypes.length) return '—';
		const labels: Record<string, string> = { pdf: 'PDF', markdown: 'Markdown', web: 'Web', doc: 'Word' };
		return sourceTypes.map((t) => labels[t] ?? t).join(', ');
	}

	#renderEmptyState() {
		return html`
			<uui-box headline="No workflows configured">
				<p>
					Workflows define how content is extracted from external sources (PDFs, web pages, documents)
					and mapped to Umbraco document properties.
				</p>
				<p>
					Create a workflow to enable the <strong>"Create from Source"</strong> action
					for a document type.
				</p>
				<uui-button
					look="primary"
					color="positive"
					label="Create Workflow"
					@click=${this.#handleCreateWorkflow}></uui-button>
			</uui-box>
		`;
	}

	#renderWorkflowList() {
		return html`
			<div class="header">
				<uui-button
					look="primary"
					color="positive"
					label="Create Workflow"
					@click=${this.#handleCreateWorkflow}></uui-button>
			</div>
			<uui-box>
				<uui-table>
					<uui-table-head>
						<uui-table-head-cell>Workflow</uui-table-head-cell>
						<uui-table-head-cell>Alias</uui-table-head-cell>
						<uui-table-head-cell>Document Type</uui-table-head-cell>
						<uui-table-head-cell>Blueprint</uui-table-head-cell>
						<uui-table-head-cell>Source</uui-table-head-cell>
						<uui-table-head-cell>Mappings</uui-table-head-cell>
						<uui-table-head-cell>Status</uui-table-head-cell>
						<uui-table-head-cell style="width: 1px;"></uui-table-head-cell>
					</uui-table-head>
					${this._workflows.map(
						(w) => html`
							<uui-table-row class="clickable-row" @click=${() => this.#handleViewWorkflow(w)}>
								<uui-table-cell>${w.name}</uui-table-cell>
								<uui-table-cell class="alias-cell">${w.alias}</uui-table-cell>
								<uui-table-cell>${w.documentTypeName ?? w.documentTypeAlias}</uui-table-cell>
								<uui-table-cell>${w.blueprintName ?? w.blueprintId ?? '—'}</uui-table-cell>
								<uui-table-cell>${this.#formatSourceTypes(w.sourceTypes)}</uui-table-cell>
								<uui-table-cell>${w.mappingCount}</uui-table-cell>
								<uui-table-cell>
									<uui-tag
										look=${w.isComplete ? 'primary' : 'secondary'}
										color=${w.isComplete ? 'positive' : 'warning'}>
										${w.isComplete ? 'Ready' : 'Incomplete'}
									</uui-tag>
								</uui-table-cell>
								<uui-table-cell>
									<uui-button
										look="default"
										color="danger"
										label="Delete"
										compact
										@click=${(e: Event) => { e.stopPropagation(); this.#handleDeleteWorkflow(w); }}>
										<uui-icon name="icon-trash"></uui-icon>
									</uui-button>
								</uui-table-cell>
							</uui-table-row>
						`
					)}
				</uui-table>
			</uui-box>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
				padding: var(--uui-size-layout-1);
			}

			.header {
				display: flex;
				justify-content: flex-end;
				margin-bottom: var(--uui-size-space-4);
			}

			.clickable-row {
				cursor: pointer;
			}

			.clickable-row:hover {
				background: var(--uui-color-surface-alt);
			}

			.alias-cell {
				font-family: monospace;
				font-size: var(--uui-type-small-size);
				color: var(--uui-color-text-alt);
			}
		`,
	];
}

export default UpDocWorkflowsViewElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-workflows-view': UpDocWorkflowsViewElement;
	}
}
