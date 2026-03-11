import { html, css, customElement } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

@customElement('up-doc-about-view')
export class UpDocAboutViewElement extends UmbLitElement {
	override render() {
		return html`
			<uui-box headline="UpDoc">
				<p>
					UpDoc enables creating Umbraco documents from external sources — PDFs, web pages,
					and other document formats. Content is extracted, mapped to document properties,
					and used to scaffold new pages from blueprints.
				</p>

				<h4>How it works</h4>
				<ol>
					<li>Create a <strong>workflow</strong> linking a blueprint to extraction rules</li>
					<li>Use <strong>"Create from Source"</strong> on any content node</li>
					<li>Select a source (PDF, markdown, etc.) and extract content</li>
					<li>Review extracted content, then create the document</li>
				</ol>

				<h4>Resources</h4>
				<uui-ref-list>
					<uui-ref-node
						name="Documentation"
						detail="User guides and API reference"
						href="https://umtemplates.github.io/UpDoc/"
						target="_blank">
						<uui-icon slot="icon" name="icon-book-alt"></uui-icon>
					</uui-ref-node>
					<uui-ref-node
						name="Source Code"
						detail="GitHub repository"
						href="https://github.com/DeanLeigh/UpDoc"
						target="_blank">
						<uui-icon slot="icon" name="icon-code"></uui-icon>
					</uui-ref-node>
				</uui-ref-list>
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

			h4 {
				margin-top: var(--uui-size-layout-1);
				margin-bottom: var(--uui-size-space-3);
			}

			ol {
				padding-left: var(--uui-size-layout-1);
			}

			li {
				margin-bottom: var(--uui-size-space-2);
			}
		`,
	];
}

export default UpDocAboutViewElement;

declare global {
	interface HTMLElementTagNameMap {
		'up-doc-about-view': UpDocAboutViewElement;
	}
}
