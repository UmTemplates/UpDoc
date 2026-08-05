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

type UpDocApiClient = ReturnType<typeof getUpDocAPI>;

const inputSchema = {};

/**
 * Described by hand rather than taken from the generated Zod schemas.
 *
 * UpDoc's controllers do not declare [ProducesResponseType], so the Swagger
 * document describes the routes but not their response shapes — every generated
 * operation returns void. Until that is fixed, the shape lives here, matching
 * WorkflowSummary in UpDoc's WorkflowService.
 */
const workflowSummary = z.object({
  name: z.string().describe("Human-readable workflow name"),
  alias: z
    .string()
    .describe("Folder name on disk, and the identifier every other UpDoc tool takes"),
  documentTypeAlias: z.string().describe("The Umbraco document type this workflow creates"),
  documentTypeName: z.string().nullable().optional(),
  blueprintId: z.string().nullable().optional(),
  blueprintName: z.string().nullable().optional(),
  sourceTypes: z
    .array(z.string())
    .describe("What this workflow can import from: pdf, markdown, web, doc"),
  mappingCount: z.number().describe("How many source-to-destination mappings are configured"),
  isComplete: z
    .boolean()
    .describe("Whether the workflow has everything it needs to run. Incomplete ones will not import"),
  validationWarnings: z.array(z.string()),
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
