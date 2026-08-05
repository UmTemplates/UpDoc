/**
 * Workflows Tool Collection
 *
 * UpDoc workflows: the recipes that turn a PDF, web page or markdown file into
 * an Umbraco document. This collection covers discovering them; importing
 * through one is a separate collection.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import listWorkflowsTool from "./get/list-workflows.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "workflows",
    displayName: "UpDoc Workflows",
    description: "Discover the UpDoc workflows configured on this site",
  },
  tools: () => [listWorkflowsTool],
};

export default collection;
