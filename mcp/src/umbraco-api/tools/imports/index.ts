/**
 * Imports Tool Collection
 *
 * Running an UpDoc workflow: turning a source document into an Umbraco
 * document. Separate from the workflows collection, which is about discovering
 * what workflows exist rather than using one.
 */

import { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import createFromSourceTool from "./post/create-from-source.js";

const collection: ToolCollectionExport = {
  metadata: {
    name: "imports",
    displayName: "UpDoc Imports",
    description: "Create Umbraco documents from PDFs using UpDoc workflows",
  },
  tools: () => [createFromSourceTool],
};

export default collection;
