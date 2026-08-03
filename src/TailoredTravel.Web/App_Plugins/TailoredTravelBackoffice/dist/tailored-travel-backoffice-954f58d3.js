const e = {
  type: "collectionView",
  alias: "TailoredTravel.CollectionView.TailoredTours.Table",
  name: "Tailored Tours Table View",
  element: () => import("./tailored-tours-table-collection-view.element-CNSspQuy.js"),
  weight: 400,
  meta: {
    label: "Tailored Tours",
    icon: "icon-table",
    pathName: "tt-table"
  },
  conditions: [
    {
      alias: "Umb.Condition.CollectionAlias",
      match: "Umb.Collection.Document"
    }
  ]
}, o = {
  type: "propertyEditorUi",
  alias: "TailoredTravel.PropertyEditorUi.TourRedirects",
  name: "Tour Redirects",
  element: () => import("./tour-redirects-property-editor-ui.element-D6yGVRIR.js"),
  meta: {
    label: "Tour Redirects",
    icon: "icon-arrow-right",
    group: "common",
    propertyEditorSchemaAlias: "Umbraco.Plain.String",
    supportsReadOnly: !0
  }
}, i = [e, o];
export {
  i as manifests
};
//# sourceMappingURL=tailored-travel-backoffice.js.map
