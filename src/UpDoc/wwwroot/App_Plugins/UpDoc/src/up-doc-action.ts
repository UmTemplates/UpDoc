import { UMB_UP_DOC_MODAL } from './up-doc-modal.token.js';
import { UMB_BLUEPRINT_PICKER_MODAL } from './blueprint-picker-modal.token.js';
import type { DocumentTypeOption } from './blueprint-picker-modal.token.js';
import { fetchActiveWorkflows } from './workflow.service.js';
import { createDocumentFromSource } from './create-from-source.js';
import { UmbEntityActionBase } from '@umbraco-cms/backoffice/entity-action';
import { umbOpenModal } from '@umbraco-cms/backoffice/modal';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbEntityActionArgs } from '@umbraco-cms/backoffice/entity-action';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UmbDocumentTypeStructureRepository } from '@umbraco-cms/backoffice/document-type';
import { UmbDocumentBlueprintItemRepository } from '@umbraco-cms/backoffice/document-blueprint';
import { UmbDocumentItemRepository } from '@umbraco-cms/backoffice/document';

export class UpDocEntityAction extends UmbEntityActionBase<never> {
	#documentTypeStructureRepository = new UmbDocumentTypeStructureRepository(this);
	#blueprintItemRepository = new UmbDocumentBlueprintItemRepository(this);
	#documentItemRepository = new UmbDocumentItemRepository(this);

	constructor(host: UmbControllerHost, args: UmbEntityActionArgs<never>) {
		super(host, args);
	}

	override async execute() {
		const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
		const parentUnique = this.args.unique ?? null;

		try {
			// Step 1: Get the parent document's document type
			let parentDocTypeUnique: string | null = null;

			if (parentUnique) {
				const { data: parentItems } = await this.#documentItemRepository.requestItems([parentUnique]);
				if (parentItems?.length) {
					parentDocTypeUnique = parentItems[0].documentType.unique;
				}
			}

			// Step 2: Get allowed child document types
			const result = await this.#documentTypeStructureRepository.requestAllowedChildrenOf(
				parentDocTypeUnique,
				parentUnique
			);
			const allowedTypes = result.data;

			if (!allowedTypes?.items?.length) {
				notificationContext.peek('danger', {
					data: { message: 'No document types are allowed as children of this page.' },
				});
				return;
			}

			// Step 3: Discover blueprints for allowed child types, grouped by document type
			const authContext = await this.getContext(UMB_AUTH_CONTEXT);
			const token = await authContext.getLatestToken();

			// Fetch active workflows to filter blueprints
			const activeWorkflows = await fetchActiveWorkflows(token);
			const activeBlueprintIds = new Set(activeWorkflows.blueprintIds);

			const documentTypeOptions: DocumentTypeOption[] = [];

			for (const docType of allowedTypes.items) {
				const { data: blueprints } = await this.#blueprintItemRepository.requestItemsByDocumentType(docType.unique);
				if (blueprints?.length) {
					// Only include blueprints that have complete workflows
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

			// Step 4: Open blueprint picker dialog (doc type → blueprint selection)
			let blueprintSelection;
			try {
				blueprintSelection = await umbOpenModal(this, UMB_BLUEPRINT_PICKER_MODAL, {
					data: { documentTypes: documentTypeOptions },
				});
			} catch {
				// Dialog was cancelled
				return;
			}

			const { blueprintUnique, documentTypeUnique } = blueprintSelection;
			const selectedDocType = documentTypeOptions.find((dt) => dt.documentTypeUnique === documentTypeUnique);
			const selectedBlueprint = selectedDocType?.blueprints.find((bp) => bp.blueprintUnique === blueprintUnique);

			// Step 5: Open source sidebar modal (passes blueprintId for map file lookup)
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
				// Modal was cancelled
				return;
			}

			const { name, mediaUnique, sourceUrl, sectionLookup, stableKeyLookup, config } = modalValue;

			// Web source uses URL (no media), others need media key
			if (!name || !config) {
				return;
			}
			if (!mediaUnique && !sourceUrl) {
				return;
			}

			// Steps 6-9: scaffold, apply the mappings, create and save.
			// Shared with the collection action and UpDoc's MCP server — see
			// create-from-source.ts.
			const createResult = await createDocumentFromSource({
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

			if (!createResult.ok) {
				const prefix = createResult.stage === 'scaffold'
					? 'Failed to scaffold from blueprint'
					: 'Failed to create document';
				console.error(`${prefix}:`, createResult.message);
				notificationContext.peek('danger', {
					data: { message: `${prefix}: ${createResult.message}` },
				});
				return;
			}

			notificationContext.peek('positive', {
				data: { message: `Document "${name}" created successfully!` },
			});

			// Navigate to the new document after a short delay
			if (createResult.documentId) {
				const newPath = `/umbraco/section/content/workspace/document/edit/${createResult.documentId}`;
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

}

export default UpDocEntityAction;
