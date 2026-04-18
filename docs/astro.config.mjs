// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	site: 'https://umtemplates.github.io',
	base: '/UpDoc',
	integrations: [
		mermaid(),
		starlight({
			title: 'UpDoc',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/UmTemplates/UpDoc' },
				{ icon: 'pencil', label: "Draft article: What's up, documentation?", href: '/UpDoc/article-whats-up-documentation/' },
			],
			customCss: ['./src/styles/custom.css'],
			components: {
				Head: './src/components/Head.astro',
			},
			sidebar: [
				{ label: 'Introduction', slug: 'introduction' },
				{ label: 'Setting Up a Workflow', slug: 'setup' },
				{ label: 'Creating a Workflow', slug: 'creating-a-workflow' },
				{ label: 'Creating Documents from Source', slug: 'usage' },
				{ label: 'Updating Blueprints', slug: 'updating-blueprints' },
				{ label: 'User Journeys', slug: 'user-journeys' },
				{ label: 'Mapping Directions', slug: 'mapping-directions' },
				{
					label: 'User Interface',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'ui' },
						{ label: 'UUI Components', slug: 'ui/uui-components' },
						{ label: 'Umbraco Components', slug: 'ui/umbraco-components' },
						{ label: 'Custom Components', slug: 'ui/custom-components' },
					],
				},
				{
					label: 'Frontend (TypeScript)',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'frontend' },
						{ label: 'Workspace Refresh', slug: 'frontend/workspace-refresh' },
						{ label: 'index.ts', slug: 'source-files/index-ts' },
						{ label: 'manifest.ts', slug: 'source-files/manifest' },
						{ label: 'up-doc-action.ts', slug: 'source-files/up-doc-action' },
						{ label: 'up-doc-has-workflows.condition.ts', slug: 'source-files/up-doc-has-workflows-condition' },
						{ label: 'up-doc-modal.element.ts', slug: 'source-files/up-doc-modal-element' },
						{ label: 'up-doc-modal.token.ts', slug: 'source-files/up-doc-modal-token' },
						{ label: 'blueprint-picker-modal.element.ts', slug: 'source-files/blueprint-picker-modal-element' },
						{ label: 'blueprint-picker-modal.token.ts', slug: 'source-files/blueprint-picker-modal-token' },
						{ label: 'workflow.types.ts', slug: 'source-files/workflow-types' },
						{ label: 'workflow.service.ts', slug: 'source-files/workflow-service-ts' },
						{ label: 'up-doc-workflows-view.element.ts', slug: 'source-files/up-doc-workflows-view-element' },
						{ label: 'create-workflow-sidebar.element.ts', slug: 'source-files/create-workflow-sidebar-element' },
						{ label: 'create-workflow-sidebar.token.ts', slug: 'source-files/create-workflow-sidebar-token' },
						{ label: 'up-doc-workflow-detail-modal.element.ts', slug: 'source-files/up-doc-workflow-detail-modal-element' },
						{ label: 'up-doc-workflow-detail-modal.token.ts', slug: 'source-files/up-doc-workflow-detail-modal-token' },
						{ label: 'up-doc-workflow-workspace.context.ts', slug: 'source-files/up-doc-workflow-workspace-context' },
						{ label: 'up-doc-workflow-destination-view.element.ts', slug: 'source-files/up-doc-workflow-destination-view-element' },
						{ label: 'up-doc-workflow-source-view.element.ts', slug: 'source-files/up-doc-workflow-source-view-element' },
						{ label: 'up-doc-workflow-map-view.element.ts', slug: 'source-files/up-doc-workflow-map-view-element' },
						{ label: 'destination-picker-modal.element.ts', slug: 'source-files/destination-picker-modal-element' },
						{ label: 'destination-picker-modal.token.ts', slug: 'source-files/destination-picker-modal-token' },
						{ label: 'visual-grouping.ts', slug: 'source-files/visual-grouping' },
						{ label: 'transforms.ts', slug: 'source-files/transforms' },
						{ label: 'up-doc-collection-action.element.ts', slug: 'source-files/up-doc-collection-action-element' },
						{ label: 'destination-utils.ts', slug: 'source-files/destination-utils' },
						{ label: 'up-doc-pdf-thumbnail.element.ts', slug: 'source-files/up-doc-pdf-thumbnail-element' },
						{ label: 'up-doc-pdf-picker.element.ts', slug: 'source-files/up-doc-pdf-picker-element' },
						{ label: 'page-picker-modal.element.ts', slug: 'source-files/page-picker-modal-element' },
						{ label: 'page-picker-modal.token.ts', slug: 'source-files/page-picker-modal-token' },
						{ label: 'section-rules-editor-modal.element.ts', slug: 'source-files/section-rules-editor-modal-element' },
						{ label: 'section-rules-editor-modal.token.ts', slug: 'source-files/section-rules-editor-modal-token' },
						{ label: 'up-doc-sort-modal.element.ts', slug: 'source-files/up-doc-sort-modal-element' },
						{ label: 'up-doc-sort-modal.token.ts', slug: 'source-files/up-doc-sort-modal-token' },
						{ label: 'up-doc-usync-fallback.condition.ts', slug: 'source-files/up-doc-usync-fallback-condition' },
					],
				},
				{
					label: 'Backend (C#)',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'backend' },
						{ label: 'Stable Section Identity', slug: 'backend/stable-section-identity' },
						{ label: 'PdfExtractionService.cs', slug: 'source-files/pdf-extraction-service' },
						{ label: 'PdfPagePropertiesService.cs', slug: 'source-files/pdf-page-properties-service' },
						{ label: 'MarkdownExtractionService.cs', slug: 'source-files/markdown-extraction-service' },
						{ label: 'PdfExtractionController.cs', slug: 'source-files/pdf-extraction-controller' },
						{ label: 'UpDocComposer.cs', slug: 'source-files/up-doc-composer' },
						{ label: 'WorkflowModels.cs', slug: 'source-files/workflow-models' },
						{ label: 'WorkflowService.cs', slug: 'source-files/workflow-service' },
						{ label: 'WorkflowController.cs', slug: 'source-files/workflow-controller' },
					],
				},
				{
					label: 'Tooling',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'tooling' },
						{
							label: 'Figma',
							collapsed: true,
							items: [
								{ label: 'Overview', slug: 'tooling/figma' },
								{ label: 'Figma MCP', slug: 'tooling/figma/figma-mcp' },
								{ label: 'html.to.design', slug: 'tooling/figma/html-to-design' },
								{ label: 'HTML Mockups', slug: 'tooling/figma/mockups' },
								{ label: 'Design Workflow', slug: 'tooling/figma/workflow' },
							],
						},
						{
							label: 'Claude',
							collapsed: true,
							items: [
								{ label: 'Overview', slug: 'tooling/claude' },
								{ label: 'CLAUDE.md', slug: 'tooling/claude/claude-md' },
								{ label: 'Memory & Planning', slug: 'tooling/claude/memory-and-planning' },
							],
						},
						{
							label: 'Playwright',
							collapsed: true,
							items: [
								{ label: 'Overview', slug: 'tooling/playwright' },
							],
						},
						{
							label: 'Umbraco Claude Skills',
							collapsed: true,
							items: [
								{ label: 'Overview', slug: 'tooling/umbraco-skills' },
							],
						},
					],
				},
				{
					label: 'Testing',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'testing' },
						{ label: 'Create from Source UI', slug: 'testing/create-from-source-ui' },
						{ label: 'PDF to Document Verification', slug: 'testing/pdf-to-document-verification' },
						{ label: 'Transform Rules Rendering', slug: 'testing/transform-rules-rendering' },
						{ label: 'BlockKey Reconciliation', slug: 'testing/blockkey-reconciliation' },
					],
				},
				{
					label: 'Deployment',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'deployment' },
						{ label: 'Docs Migration', slug: 'deployment/docs-migration' },
						{ label: 'uSync Migration', slug: 'deployment/usync-migration' },
					],
				},
				{
					label: 'Common Errors',
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'errors' },
						{ label: 'Distributed cache error', slug: 'common-errors' },
						{ label: 'Blueprint block grid preview', slug: 'errors/blueprint-block-grid-preview' },
						{ label: 'Block property conversion skipped', slug: 'errors/convert-block-matching' },
						{ label: 'Drag-and-drop dead zone', slug: 'errors/drag-drop-dead-zone' },
					],
				},
			],
		}),
	],
});
