import type { ManifestCollectionView, ManifestPropertyEditorUi } from '@umbraco-cms/backoffice/extension-registry';

const collectionViewManifest: ManifestCollectionView = {
  type: 'collectionView',
  alias: 'TailoredTravel.CollectionView.TailoredTours.Table',
  name: 'Tailored Tours Table View',
  element: () => import('./tailored-tours-table-collection-view.element.js'),
  weight: 400,
  meta: {
    label: 'Tailored Tours',
    icon: 'icon-table',
    pathName: 'tt-table',
  },
  conditions: [
    {
      alias: 'Umb.Condition.CollectionAlias',
      match: 'Umb.Collection.Document',
    },
  ],
};

const tourRedirectsPropertyEditorUi: ManifestPropertyEditorUi = {
  type: 'propertyEditorUi',
  alias: 'TailoredTravel.PropertyEditorUi.TourRedirects',
  name: 'Tour Redirects',
  element: () => import('./tour-redirects-property-editor-ui.element.js'),
  meta: {
    label: 'Tour Redirects',
    icon: 'icon-arrow-right',
    group: 'common',
    propertyEditorSchemaAlias: 'Umbraco.Plain.String',
    supportsReadOnly: true,
  },
};

export const manifests = [collectionViewManifest, tourRedirectsPropertyEditorUi];
