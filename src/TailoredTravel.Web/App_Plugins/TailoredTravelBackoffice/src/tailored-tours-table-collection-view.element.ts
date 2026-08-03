import { css, customElement, html, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_COLLECTION_CONTEXT } from '@umbraco-cms/backoffice/collection';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN } from '@umbraco-cms/backoffice/document';

interface TourProperties {
  title: string;
  organisations: string;
  organisers: string;
  destinations: string;
  memberUsername: string;
  memberId: string;
}

@customElement('tt-tailored-tours-table-collection-view')
export class TailoredToursTableCollectionViewElement extends UmbLitElement {
  @state()
  private _items: Array<any> = [];

  @state()
  private _properties: Map<string, TourProperties> = new Map();

  @state()
  private _filterTitle = '__all__';

  @state()
  private _filterOrganisation = '__all__';

  @state()
  private _filterOrganiser = '__all__';

  @state()
  private _filterDestination = '__all__';

  @state()
  private _searchTitle = '';

  @state()
  private _searchOrganisation = '';

  @state()
  private _searchOrganiser = '';

  @state()
  private _searchDestination = '';

  #authContext?: typeof UMB_AUTH_CONTEXT.TYPE;

  constructor() {
    super();

    this.consumeContext(UMB_AUTH_CONTEXT, (context) => {
      this.#authContext = context;
    });

    this.consumeContext(UMB_COLLECTION_CONTEXT, (context) => {
      if (!context) return;
      this.observe(context.items, (items) => {
        this._items = items ?? [];
        this.#fetchProperties(this._items);
      });
    });
  }

  async #fetchProperties(items: Array<any>) {
    if (!items.length || !this.#authContext) return;
    const token = await this.#authContext.getLatestToken();
    const headers = { Authorization: `Bearer ${token}` };

    const entries = await Promise.all(
      items.map(async (item) => {
        const empty: TourProperties = { title: '', organisations: '', organisers: '', destinations: '', memberUsername: '', memberId: '' };
        try {
          const response = await fetch(`/umbraco/management/api/v1/document/${item.unique}`, { headers });
          if (!response.ok) return [item.unique, empty] as const;
          const doc = await response.json();

          const title = doc.values?.find((v: any) => v.alias === 'pageTitle')?.value ?? '';

          const organisersValue = doc.values?.find((v: any) => v.alias === 'organisers')?.value;
          const blocks = organisersValue?.contentData ?? [];
          const organisations = [...new Set(blocks
            .map((block: any) => block.values?.find((v: any) => v.alias === 'organiserOrganisation')?.value ?? '')
            .filter(Boolean))]
            .join(', ');
          const organisers = blocks
            .map((block: any) => block.values?.find((v: any) => v.alias === 'organiserName')?.value ?? '')
            .filter(Boolean)
            .join(', ');

          const destinationsValue = doc.values?.find((v: any) => v.alias === 'destinations')?.value;
          let destinations = '';
          if (destinationsValue?.length) {
            const keys = destinationsValue.map((d: any) => d.unique).filter(Boolean);
            if (keys.length) {
              const query = keys.map((k: string) => `id=${k}`).join('&');
              const destResponse = await fetch(`/umbraco/management/api/v1/item/document?${query}`, { headers });
              if (destResponse.ok) {
                const destData = await destResponse.json();
                destinations = (destData.items ?? destData ?? [])
                  .map((d: any) => d.variants?.[0]?.name ?? '')
                  .filter(Boolean)
                  .join(', ');
              }
            }
          }

          let memberUsername = '';
          let memberId = '';
          if (item.isProtected) {
            const accessResponse = await fetch(`/umbraco/management/api/v1/document/${item.unique}/public-access`, { headers });
            if (accessResponse.ok) {
              const accessData = await accessResponse.json();
              const member = accessData.members?.[0];
              if (member) {
                memberId = member.id ?? '';
                memberUsername = member.variants?.[0]?.name ?? '';
              }
            }
          }

          return [item.unique, { title, organisations, organisers, destinations, memberUsername, memberId }] as const;
        } catch {
          return [item.unique, empty] as const;
        }
      })
    );

    this._properties = new Map(entries);
  }

  #getEditPath(unique: string): string {
    return UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN.generateAbsolute({ unique });
  }

  #getMemberPath(memberId: string): string {
    return `/umbraco/section/member-management/workspace/member/edit/${memberId}/invariant`;
  }

  #uniqueValues(key: keyof TourProperties): Array<string> {
    const values = new Set<string>();
    const singleValue = key === 'title';
    for (const props of this._properties.values()) {
      if (singleValue) {
        if (props[key]) values.add(props[key]);
      } else {
        for (const val of props[key].split(', ').filter(Boolean)) {
          values.add(val);
        }
      }
    }
    return Array.from(values).sort();
  }

  #renderCombobox(
    key: keyof TourProperties,
    filterValue: string,
    search: string,
    allLabel: string,
    onSearch: (s: string) => void,
    onSelect: (v: string) => void,
  ) {
    const all = { value: '__all__', label: allLabel };
    const options = this.#uniqueValues(key).filter((v) =>
      search ? v.toLowerCase().includes(search.toLowerCase()) : true,
    );
    const showAll = !search || allLabel.toLowerCase().includes(search.toLowerCase());

    return html`
      <uui-combobox
        placeholder=${allLabel}
        .value=${filterValue === '__all__' ? allLabel : filterValue}
        @search=${(e: Event) => {
          const s = (e as any).target?.search ?? '';
          onSearch(s);
          if (!s) onSelect('__all__');
        }}
        @change=${(e: Event) => {
          const val = (e.composedPath()[0] as any).value;
          onSelect(val || '__all__');
        }}>
        <uui-combobox-list>
          ${showAll
            ? html`<uui-combobox-list-option value=${all.value} .displayValue=${all.label}>${all.label}</uui-combobox-list-option>`
            : ''}
          ${options.map(
            (v) => html`<uui-combobox-list-option value=${v} .displayValue=${v}>${v}</uui-combobox-list-option>`,
          )}
        </uui-combobox-list>
      </uui-combobox>
    `;
  }

  #filteredItems() {
    return this._items.filter((item) => {
      const props = this._properties.get(item.unique);
      if (!props) return true;
      if (this._filterTitle !== '__all__' && props.title !== this._filterTitle) return false;
      if (this._filterOrganisation !== '__all__' && !props.organisations.split(', ').includes(this._filterOrganisation)) return false;
      if (this._filterOrganiser !== '__all__' && !props.organisers.split(', ').includes(this._filterOrganiser)) return false;
      if (this._filterDestination !== '__all__' && !props.destinations.split(', ').includes(this._filterDestination)) return false;
      return true;
    });
  }

  override render() {
    const filtered = this.#filteredItems();

    return html`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell class="member-col">Member</uui-table-head-cell>
          <uui-table-head-cell>Node Name</uui-table-head-cell>
          <uui-table-head-cell>
            ${this.#renderCombobox(
              'title', this._filterTitle, this._searchTitle, 'All titles',
              (s) => (this._searchTitle = s),
              (v) => { this._filterTitle = v; this._searchTitle = ''; },
            )}
          </uui-table-head-cell>
          <uui-table-head-cell>
            ${this.#renderCombobox(
              'organisations', this._filterOrganisation, this._searchOrganisation, 'All organisations',
              (s) => (this._searchOrganisation = s),
              (v) => { this._filterOrganisation = v; this._searchOrganisation = ''; },
            )}
          </uui-table-head-cell>
          <uui-table-head-cell>
            ${this.#renderCombobox(
              'organisers', this._filterOrganiser, this._searchOrganiser, 'All organisers',
              (s) => (this._searchOrganiser = s),
              (v) => { this._filterOrganiser = v; this._searchOrganiser = ''; },
            )}
          </uui-table-head-cell>
          <uui-table-head-cell>
            ${this.#renderCombobox(
              'destinations', this._filterDestination, this._searchDestination, 'All destinations',
              (s) => (this._searchDestination = s),
              (v) => { this._filterDestination = v; this._searchDestination = ''; },
            )}
          </uui-table-head-cell>
        </uui-table-head>
        ${filtered.map((item) => {
          const props = this._properties.get(item.unique);
          return html`
            <uui-table-row>
              <uui-table-cell class="member-col">
                ${props?.memberId ? html`
                  <uui-button
                    compact
                    look="default"
                    href=${this.#getMemberPath(props.memberId)}
                    label=${props.memberUsername}>
                    <uui-icon name="icon-user"></uui-icon>
                    ${props.memberUsername}
                  </uui-button>
                ` : ''}
              </uui-table-cell>
              <uui-table-cell>
                <uui-button
                  compact
                  look="default"
                  href=${this.#getEditPath(item.unique)}
                  label=${item.variants?.[0]?.name ?? '(Untitled)'}>
                  ${item.variants?.[0]?.name ?? '(Untitled)'}
                </uui-button>
              </uui-table-cell>
              <uui-table-cell>${props?.title ?? ''}</uui-table-cell>
              <uui-table-cell>${props?.organisations ?? ''}</uui-table-cell>
              <uui-table-cell>${props?.organisers ?? ''}</uui-table-cell>
              <uui-table-cell>${props?.destinations ?? ''}</uui-table-cell>
            </uui-table-row>
          `;
        })}
      </uui-table>
    `;
  }

  static override styles = [
    UmbTextStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      uui-table-head-cell uui-combobox {
        width: 100%;
      }

      .member-col {
        width: 1px;
        white-space: nowrap;
      }

    `,
  ];
}

export default TailoredToursTableCollectionViewElement;

declare global {
  interface HTMLElementTagNameMap {
    'tt-tailored-tours-table-collection-view': TailoredToursTableCollectionViewElement;
  }
}
