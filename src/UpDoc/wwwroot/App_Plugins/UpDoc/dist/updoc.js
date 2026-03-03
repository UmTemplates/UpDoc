const o = [
  // =====================================================================
  // Entity Action — "Create from Source" on content nodes
  // =====================================================================
  {
    type: "entityAction",
    kind: "default",
    alias: "UpDoc.EntityAction",
    name: "UpDoc Entity Action",
    weight: 1100,
    api: () => import("./up-doc-action-B9aESrVg.js"),
    forEntityTypes: ["document"],
    meta: {
      icon: "icon-document",
      label: "Create Document from Source"
    },
    conditions: [
      {
        alias: "Umb.Condition.EntityIsNotTrashed"
      },
      {
        alias: "UpDoc.Condition.HasAvailableWorkflows"
      }
    ]
  },
  // =====================================================================
  // Condition — only show entity action when workflows exist
  // =====================================================================
  {
    type: "condition",
    alias: "UpDoc.Condition.HasAvailableWorkflows",
    name: "Has Available Workflows",
    api: () => import("./up-doc-has-workflows.condition-DdNJRdzZ.js")
  },
  // =====================================================================
  // Collection Action — "Create from Source" button in collection toolbar
  // =====================================================================
  {
    type: "collectionAction",
    kind: "button",
    alias: "UpDoc.CollectionAction",
    name: "UpDoc Collection Action",
    element: () => import("./up-doc-collection-action.element-CWL1mI6n.js"),
    weight: 50,
    meta: {
      label: "Create from Source"
    },
    conditions: [
      {
        alias: "Umb.Condition.CollectionAlias",
        match: "Umb.Collection.Document"
      }
    ]
  },
  // =====================================================================
  // Modals — Blueprint picker + sidebar workflow
  // =====================================================================
  {
    type: "modal",
    alias: "UpDoc.Modal",
    name: "UpDoc Modal",
    element: () => import("./up-doc-modal.element-CU8Smgd3.js")
  },
  {
    type: "modal",
    alias: "UpDoc.BlueprintPickerModal",
    name: "Blueprint Picker Modal",
    element: () => import("./blueprint-picker-modal.element-B53buJuY.js")
  },
  {
    type: "modal",
    alias: "UpDoc.CreateWorkflowSidebar",
    name: "Create Workflow Sidebar",
    element: () => import("./create-workflow-sidebar.element-Df4lhdWk.js")
  },
  {
    type: "modal",
    alias: "UpDoc.WorkflowDetailModal",
    name: "Workflow Detail Modal",
    element: () => import("./up-doc-workflow-detail-modal.element-JlfQ1IsP.js")
  },
  {
    type: "modal",
    alias: "UpDoc.DestinationPickerModal",
    name: "Destination Picker Modal",
    element: () => import("./destination-picker-modal.element-BuD7esN7.js")
  },
  {
    type: "modal",
    alias: "UpDoc.AreaEditorModal",
    name: "Area Editor Modal",
    element: () => import("./pdf-area-editor-modal.element-B4-Z860K.js")
  },
  {
    type: "modal",
    alias: "UpDoc.AreaPickerModal",
    name: "Area Picker Modal",
    element: () => import("./area-picker-modal.element-QA4TPO-f.js")
  },
  {
    type: "modal",
    alias: "UpDoc.PagePickerModal",
    name: "Page Picker Modal",
    element: () => import("./page-picker-modal.element-Frt23MRc.js")
  },
  {
    type: "modal",
    alias: "UpDoc.SectionRulesEditorModal",
    name: "Section Rules Editor Modal",
    element: () => import("./section-rules-editor-modal.element-4Mz_tTmS.js")
  },
  // =====================================================================
  // Workflow Workspace — full page for editing individual workflows
  // =====================================================================
  {
    type: "workspace",
    kind: "routable",
    alias: "UpDoc.WorkflowWorkspace",
    name: "UpDoc Workflow Workspace",
    api: () => import("./up-doc-workflow-workspace.context-BF9KTy-5.js"),
    meta: {
      entityType: "updoc-workflow"
    }
  },
  {
    type: "workspaceView",
    alias: "UpDoc.WorkflowWorkspaceView.Destination",
    name: "Destination",
    element: () => import("./up-doc-workflow-destination-view.element-DUpr6bDT.js"),
    weight: 300,
    meta: {
      label: "Destination",
      pathname: "destination",
      icon: "icon-blueprint"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "UpDoc.WorkflowWorkspace"
      }
    ]
  },
  {
    type: "workspaceView",
    alias: "UpDoc.WorkflowWorkspaceView.Source",
    name: "UpDoc Workflow Source View",
    element: () => import("./up-doc-workflow-source-view.element-Db-z2sfU.js"),
    weight: 200,
    meta: {
      label: "Source",
      pathname: "source",
      icon: "icon-page-add"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "UpDoc.WorkflowWorkspace"
      }
    ]
  },
  {
    type: "workspaceView",
    alias: "UpDoc.WorkflowWorkspaceView.Map",
    name: "UpDoc Workflow Map View",
    element: () => import("./up-doc-workflow-map-view.element-CTFZR8iD.js"),
    weight: 100,
    meta: {
      label: "Map",
      pathname: "map",
      icon: "icon-nodes"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "UpDoc.WorkflowWorkspace"
      }
    ]
  },
  // =====================================================================
  // Workspace Actions — Save + Refresh buttons in workflow workspace footer
  // =====================================================================
  {
    type: "workspaceAction",
    kind: "default",
    alias: "UpDoc.WorkflowWorkspace.Save",
    name: "Save",
    api: () => import("./up-doc-save.action-DGb0pvq-.js"),
    weight: 90,
    meta: {
      label: "Save",
      look: "primary",
      color: "positive"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "UpDoc.WorkflowWorkspace"
      }
    ]
  },
  {
    type: "workspaceAction",
    kind: "default",
    alias: "UpDoc.WorkflowWorkspace.Refresh",
    name: "Refresh",
    api: () => import("./up-doc-refresh.action-DBewFGwT.js"),
    weight: 100,
    meta: {
      label: "Refresh",
      look: "secondary"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "UpDoc.WorkflowWorkspace"
      }
    ]
  },
  // =====================================================================
  // Settings sidebar — UpDoc under uSync's "Synchronisation" group,
  // with fallback to its own group when uSync is not installed
  // =====================================================================
  {
    type: "condition",
    alias: "UpDoc.Condition.UsyncNotInstalled",
    name: "uSync Not Installed",
    api: () => import("./up-doc-usync-fallback.condition-CRxSTHGz.js")
  },
  {
    type: "menuItem",
    kind: "tree",
    alias: "UpDoc.MenuItem.Tree",
    name: "UpDoc Menu Item",
    meta: {
      treeAlias: "UpDoc.Tree",
      menus: ["usync.menu", "UpDoc.Menu"],
      hideTreeRoot: !0
    }
  },
  // Fallback: own sidebar group when uSync is not installed
  {
    type: "sectionSidebarApp",
    kind: "menu",
    alias: "UpDoc.SidebarApp",
    name: "UpDoc Sidebar",
    weight: 15,
    meta: {
      label: "Synchronisation",
      menu: "UpDoc.Menu"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Settings"
      },
      {
        alias: "UpDoc.Condition.UsyncNotInstalled"
      }
    ]
  },
  {
    type: "menu",
    alias: "UpDoc.Menu",
    name: "UpDoc Menu"
  },
  // =====================================================================
  // Tree — data source for sidebar items
  // =====================================================================
  {
    type: "repository",
    alias: "UpDoc.Tree.Repository",
    name: "UpDoc Tree Repository",
    api: () => import("./up-doc-tree.repository--8lbcPY9.js")
  },
  {
    type: "tree",
    kind: "default",
    alias: "UpDoc.Tree",
    name: "UpDoc Tree",
    meta: {
      repositoryAlias: "UpDoc.Tree.Repository"
    }
  },
  {
    type: "treeItem",
    kind: "default",
    alias: "UpDoc.TreeItem",
    name: "UpDoc Tree Item",
    forEntityTypes: ["updoc"]
  },
  // =====================================================================
  // Workspace — right panel with tabs
  // =====================================================================
  {
    type: "workspace",
    kind: "routable",
    alias: "UpDoc.Workspace",
    name: "UpDoc Workspace",
    api: () => import("./up-doc-workspace.context-D43zX7lf.js"),
    meta: {
      entityType: "updoc"
    }
  },
  // =====================================================================
  // Workspace Views — tabs across the top
  // =====================================================================
  {
    type: "workspaceView",
    alias: "UpDoc.WorkspaceView.Workflows",
    name: "Workflows",
    element: () => import("./up-doc-workflows-view.element-Bnrx_L8D.js"),
    weight: 300,
    meta: {
      label: "Workflows",
      pathname: "workflows",
      icon: "icon-nodes"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "UpDoc.Workspace"
      }
    ]
  },
  {
    type: "workspaceView",
    alias: "UpDoc.WorkspaceView.Configuration",
    name: "Configuration",
    element: () => import("./up-doc-configuration-view.element-Cqyu2QXk.js"),
    weight: 200,
    meta: {
      label: "Configuration",
      pathname: "configuration",
      icon: "icon-settings"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "UpDoc.Workspace"
      }
    ]
  },
  {
    type: "workspaceView",
    alias: "UpDoc.WorkspaceView.About",
    name: "About",
    element: () => import("./up-doc-about-view.element--cBDybu3.js"),
    weight: 100,
    meta: {
      label: "About",
      pathname: "about",
      icon: "icon-info"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "UpDoc.Workspace"
      }
    ]
  }
];
export {
  o as manifests
};
//# sourceMappingURL=updoc.js.map
