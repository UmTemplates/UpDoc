import { html as s, css as l, customElement as c } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as m } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles as d } from "@umbraco-cms/backoffice/style";
var p = Object.getOwnPropertyDescriptor, f = (i, r, a, n) => {
  for (var e = n > 1 ? void 0 : n ? p(r, a) : r, o = i.length - 1, u; o >= 0; o--)
    (u = i[o]) && (e = u(e) || e);
  return e;
};
let t = class extends m {
  render() {
    return s`
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
};
t.styles = [
  d,
  l`
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
		`
];
t = f([
  c("up-doc-about-view")
], t);
const w = t;
export {
  t as UpDocAboutViewElement,
  w as default
};
//# sourceMappingURL=up-doc-about-view.element-BsYAvUH4.js.map
