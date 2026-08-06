/**
 * List Workflows Tool
 *
 * The first question a session asks before importing anything: what can this
 * site import, and from what kind of source?
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUpDocAPI } from "../../../api/generated/updocApi.js";
import { getUmbracoManagementApiV1UpdocWorkflowsResponseItem } from "../../../api/generated/updocApi.zod.js";

type UpDocApiClient = ReturnType<typeof getUpDocAPI>;

const inputSchema = {};

/**
 * Shape comes from the generated Zod schema, so it cannot drift from the C#.
 * UpDoc #138 added [ProducesResponseType] to the controllers, which is what
 * makes the generated schema describe the response rather than void.
 *
 * The descriptions are layered on here rather than generated. Orval emits field
 * types but no .describe() text, and an LLM choosing between tools reads those
 * descriptions - "alias" alone does not say it is the identifier every other
 * UpDoc tool takes. Generated shape, hand-written meaning.
 */
const workflowSummary = getUmbracoManagementApiV1UpdocWorkflowsResponseItem.describe(
  "A configured way of creating a document from an external source",
).extend({
  name: getUmbracoManagementApiV1UpdocWorkflowsResponseItem.shape.name.describe(
    "Human-readable workflow name",
  ),
  alias: getUmbracoManagementApiV1UpdocWorkflowsResponseItem.shape.alias.describe(
    "Folder name on disk, and the identifier every other UpDoc tool takes",
  ),
  documentTypeAlias:
    getUmbracoManagementApiV1UpdocWorkflowsResponseItem.shape.documentTypeAlias.describe(
      "The Umbraco document type this workflow creates",
    ),
  sourceTypes: getUmbracoManagementApiV1UpdocWorkflowsResponseItem.shape.sourceTypes.describe(
    "What this workflow can import from: pdf, markdown, web, doc",
  ),
  mappingCount: getUmbracoManagementApiV1UpdocWorkflowsResponseItem.shape.mappingCount.describe(
    "How many source-to-destination mappings are configured",
  ),
  isComplete: getUmbracoManagementApiV1UpdocWorkflowsResponseItem.shape.isComplete.describe(
    "Whether the workflow has everything it needs to run. Incomplete ones will not import",
  ),
  validationWarnings:
    getUmbracoManagementApiV1UpdocWorkflowsResponseItem.shape.validationWarnings.describe(
      "Problems found in the workflow's configuration. Empty when it is sound",
    ),
});

const outputSchema = z.object({
  items: z.array(workflowSummary),
});

const listWorkflowsTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "list-workflows",
  description:
    "Lists the UpDoc workflows configured on this site. Each one describes a way of creating a " +
    "document from an external source — which document type and blueprint it produces, and which " +
    "source types it accepts. Use this to find the workflow alias other UpDoc tools need. " +
    "Workflows where isComplete is false are missing configuration and will not import.",
  inputSchema,
  outputSchema,
  slices: ["list"],
  annotations: {
    readOnlyHint: true,
  },
  handler: async () => {
    return executeGetApiCall<
      ReturnType<UpDocApiClient["getUmbracoManagementApiV1UpdocWorkflows"]>,
      UpDocApiClient
    >((client) =>
      client.getUmbracoManagementApiV1UpdocWorkflows(CAPTURE_RAW_HTTP_RESPONSE),
    );
  },
};

export default withStandardDecorators(listWorkflowsTool);
