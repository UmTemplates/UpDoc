import { UMB_BLUEPRINT_PICKER_MODAL } from './blueprint-picker-modal.token.js';
import { UMB_UP_DOC_MODAL } from './up-doc-modal.token.js';
import type { DocumentTypeOption } from './blueprint-picker-modal.token.js';
import { fetchActiveWorkflows } from './workflow.service.js';
import { createDocumentFromSource } from './create-from-source.js';
import { css, customElement, html, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/document';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
import { umbOpenModal } from '@umbraco-cms/backoffice/modal';
import { UmbDocumentTypeStructureRepository } from '@umbraco-cms/backoffice/document-type';
import { UmbDocumentBlueprintItemRepository } from '@umbraco-cms/backoffice/document-blueprint';
import type { UmbEntityUnique } from '@umbraco-cms/backoffice/entity';

@customElement('up-doc-collection-action')
export class UpDocCollectionActionElement extends UmbLitElement {
	#documentTypeStructureRepository = new UmbDocumentTypeStructureRepository(this);
	#blueprintItemRepository = new UmbDocumentBlueprintItemRepository(this);

	@state()
	private _documentUnique?: UmbEntityUnique;

	@state()
	private _documentTypeUnique?: string;

	@state()
	private _hasWorkflows = false;

	constructor() {
		super();

		this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
			this.observe(workspaceContext?.unique, (unique) => {
				this._documentUnique = unique;
				this.#checkWorkflows();
			});
			this.observe(workspaceContext?.contentTypeUnique, (documentTypeUnique) => {
				this._documentTypeUnique = documentTypeUnique;
				this.#checkWorkflows();
			});
		});
	}

	async #checkWorkflows() {
		if (!this._documentTypeUnique) return;

		try {
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();
			const activeWorkflows = await fetchActiveWorkflows(token);
			const activeBlueprintIds = new Set(activeWorkflows.blueprintIds);

			// Check if any allowed child types have blueprints with workflows
			const { data } = await this.#documentTypeStructureRepository.requestAllowedChildrenOf(
				this._documentTypeUnique,
				this._documentUnique || null,
			);

			if (!data?.items?.length) return;

			for (const docType of data.items) {
				const { data: blueprints } = await this.#blueprintItemRepository.requestItemsByDocumentType(docType.unique);
				if (blueprints?.some((bp) => activeBlueprintIds.has(bp.unique))) {
					this._hasWorkflows = true;
					return;
				}
			}
		} catch {
			// Silently fail — button stays hidden
		}
	}

	async #onClick() {
		if (!this._documentTypeUnique) return;

		const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
		const authContext = await this.getContext(UMB_AUTH_CONTEXT);
		const token = await authContext.getLatestToken();
		const parentUnique = this._documentUnique ?? null;

		try {
			// Discover allowed child types with workflow blueprints
			const activeWorkflows = await fetchActiveWorkflows(token);
			const activeBlueprintIds = new Set(activeWorkflows.blueprintIds);

			const { data: allowedTypes } = await this.#documentTypeStructureRepository.requestAllowedChildrenOf(
				this._documentTypeUnique,
				parentUnique,
			);

			if (!allowedTypes?.items?.length) {
				notificationContext.peek('danger', {
					data: { message: 'No document types are allowed as children of this page.' },
				});
				return;
			}

			const documentTypeOptions: DocumentTypeOption[] = [];

			for (const docType of allowedTypes.items) {
				const { data: blueprints } = await this.#blueprintItemRepository.requestItemsByDocumentType(docType.unique);
				if (blueprints?.length) {
					const workflowBlueprints = blueprints.filter((bp) => activeBlueprintIds.has(bp.unique));
					if (workflowBlueprints.length) {
						documentTypeOptions.push({
							documentTypeUnique: docType.unique,
							documentTypeName: docType.name,
							documentTypeIcon: (docType as { icon?: string }).icon ?? null,
							blueprints: workflowBlueprints.map((bp) => ({
								blueprintUnique: bp.unique,
								blueprintName: bp.name,
							})),
						});
					}
				}
			}

			if (!documentTypeOptions.length) {
				notificationContext.peek('warning', {
					data: { message: 'No workflows are configured for the document types allowed here.' },
				});
				return;
			}

			// Open blueprint picker
			let blueprintSelection;
			try {
				blueprintSelection = await umbOpenModal(this, UMB_BLUEPRINT_PICKER_MODAL, {
					data: { documentTypes: documentTypeOptions },
				});
			} catch {
				return;
			}

			const { blueprintUnique, documentTypeUnique } = blueprintSelection;
			const selectedDocType = documentTypeOptions.find((dt) => dt.documentTypeUnique === documentTypeUnique);
			const selectedBlueprint = selectedDocType?.blueprints.find((bp) => bp.blueprintUnique === blueprintUnique);

			// Open source sidebar modal
			let modalValue;
			try {
				modalValue = await umbOpenModal(this, UMB_UP_DOC_MODAL, {
					data: {
						unique: parentUnique,
						documentTypeName: selectedDocType?.documentTypeName ?? '',
						blueprintName: selectedBlueprint?.blueprintName ?? '',
						blueprintId: blueprintUnique,
					},
				});
			} catch {
				return;
			}

			const { name, mediaUnique, sourceUrl, sectionLookup, stableKeyLookup, config } = modalValue;

			// Web source uses URL (no media), others need media key
			if (!name || !config) return;
			if (!mediaUnique && !sourceUrl) return;

			// Scaffold, apply the mappings, create and save. Shared with the entity
			// action and UpDoc's MCP server — see create-from-source.ts.
			const result = await createDocumentFromSource({
				parentUnique,
				documentTypeUnique,
				blueprintUnique,
				name,
				mediaUnique,
				sectionLookup,
				stableKeyLookup,
				config,
				fetchFn: window.fetch.bind(window),
				token,
			});

			if (!result.ok) {
				const prefix = result.stage === 'scaffold'
					? 'Failed to scaffold from blueprint'
					: 'Failed to create document';
				notificationContext.peek('danger', {
					data: { message: `${prefix}: ${result.message}` },
				});
				return;
			}

			notificationContext.peek('positive', {
				data: { message: `Document "${name}" created successfully!` },
			});

			if (result.documentId) {
				const newPath = `/umbraco/section/content/workspace/document/edit/${result.documentId}`;
				setTimeout(() => {
					window.location.href = newPath;
				}, 150);
			}
		} catch (error) {
			console.error('Error creating document:', error);
			notificationContext.peek('danger', {
				data: { message: 'An unexpected error occurred while creating the document.' },
			});
		}
	}

	override render() {
		if (!this._hasWorkflows) return html``;

		return html`
			<uui-button
				color="default"
				look="outline"
				label="Create from Source"
				@click=${this.#onClick}>
				Create from Source
			</uui-button>
		`;
	}

	static override styles = [
		css`
			:host {
				display: contents;
			}
		`,
	];
}

export default UpDocCollectionActionElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-collection-action': UpDocCollectionActionElement;
	}
}
