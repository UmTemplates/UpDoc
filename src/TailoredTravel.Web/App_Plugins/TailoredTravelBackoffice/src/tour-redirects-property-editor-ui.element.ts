import { css, customElement, html, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/document';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/property-editor';

@customElement('tt-tour-redirects-property-editor-ui')
export class TourRedirectsPropertyEditorUiElement extends UmbLitElement implements UmbPropertyEditorUiElement {

  @property()
  public value = '';

  @state()
  private _redirects: string[] = [];

  @state()
  private _loaded = false;

  #authContext?: typeof UMB_AUTH_CONTEXT.TYPE;

  constructor() {
    super();

    this.consumeContext(UMB_AUTH_CONTEXT, (context) => {
      this.#authContext = context;
    });

    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
      if (!context) return;
      this.observe(context.unique, (unique) => {
        if (unique) this.#fetchRedirects(unique);
      });
    });
  }

  async #fetchRedirects(nodeKey: string) {
    if (!this.#authContext) return;
    const token = await this.#authContext.getLatestToken();
    try {
      const response = await fetch(`/umbraco/tailored-travel/tour-redirects/${nodeKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      this._redirects = await response.json();
    } finally {
      this._loaded = true;
    }
  }

  override render() {
    if (!this._loaded || !this._redirects.length) return html``;

    return html`
      <ul>
        ${this._redirects.map((url) => html`<li><a href="https://www.tailored-travel.co.uk${url}" target="_blank" rel="noopener">${url}</a></li>`)}
      </ul>
    `;
  }

  static override styles = css`
    :host { display: block; }
    ul { list-style: none; margin: 0; padding: 0; }
    li { font-family: monospace; font-size: 0.875em; padding: 2px 0; }
  `;
}

export default TourRedirectsPropertyEditorUiElement;

declare global {
  interface HTMLElementTagNameMap {
    'tt-tour-redirects-property-editor-ui': TourRedirectsPropertyEditorUiElement;
  }
}
