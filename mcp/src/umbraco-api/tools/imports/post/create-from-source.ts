/**
 * Create from Source Tool
 *
 * The one that does the work: turns a PDF already in the media library into a
 * populated Umbraco document, using the workflow configured for the chosen
 * blueprint.
 */

import {
  withStandardDecorators,
  executeGetApiCall,
  CAPTURE_RAW_HTTP_RESPONSE,
  ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import { z } from "zod";
import type { getUpDocAPI } from "../../../api/generated/updocApi.js";
import { postUmbracoManagementApiV1UpdocCreateFromSourceResponse } from "../../../api/generated/updocApi.zod.js";

type UpDocApiClient = ReturnType<typeof getUpDocAPI>;

const inputSchema = {
  parentId: z
    .string()
    .describe("Document to create under. The new document becomes its child."),
  documentTypeId: z.string().describe("The document type to create."),
  blueprintId: z
    .string()
    .describe(
      "The blueprint to build from. This also picks the workflow, so it decides how the source is read and where its content lands. Use list-workflows to find it.",
    ),
  mediaId: z
    .string()
    .describe(
      "The PDF in the media library. It must already be uploaded - this creates a document, it does not upload files.",
    ),
  documentName: z
    .string()
    .describe(
      "Name for the new document. Set it here rather than renaming afterwards, which is a separate operation.",
    ),
  sourceType: z
    .string()
    .optional()
    .describe("Source type to import. Defaults to the workflow's own. Only 'pdf' is supported today."),
};

/**
 * Shape comes from the generated schema, so it cannot drift from the C#.
 * Descriptions are added here because orval emits types but no .describe() text,
 * and those descriptions are what an agent reads when deciding what to do next.
 */
const outputSchema = postUmbracoManagementApiV1UpdocCreateFromSourceResponse.extend({
  documentId: postUmbracoManagementApiV1UpdocCreateFromSourceResponse.shape.documentId.describe(
    "The new document's id. Every follow-up - reading it back, fixing content, publishing - needs this.",
  ),
  mappedValueCount: postUmbracoManagementApiV1UpdocCreateFromSourceResponse.shape.mappedValueCount.describe(
    "How many values the workflow's mappings wrote. Well below the workflow's mapping count means sections did not resolve, and the document is worth checking.",
  ),
  published: postUmbracoManagementApiV1UpdocCreateFromSourceResponse.shape.published.describe(
    "Always false. The document is created as a draft - publish it separately once the content has been checked.",
  ),
});

const createFromSourceTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: "create-from-source",
  description:
    "Creates an Umbraco document from a PDF already in the media library, using an UpDoc workflow. " +
    "The workflow extracts the PDF's content and maps it into the blueprint's fields and blocks. " +
    "Returns the new document's id. " +
    "The document is created as a DRAFT and is not published - review the content, then publish it separately. " +
    "Upload the PDF first if it is not already in the media library.",
  inputSchema,
  outputSchema,
  slices: ["create"],
  annotations: {
    // Creates content, so not read-only. Not destructive either: it only ever
    // adds a new document, and never modifies or removes an existing one.
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
  handler: async (model) => {
    return executeGetApiCall<
      ReturnType<UpDocApiClient["postUmbracoManagementApiV1UpdocCreateFromSource"]>,
      UpDocApiClient
    >((client) =>
      client.postUmbracoManagementApiV1UpdocCreateFromSource(
        {
          parentId: model.parentId,
          documentTypeId: model.documentTypeId,
          blueprintId: model.blueprintId,
          mediaId: model.mediaId,
          documentName: model.documentName,
          sourceType: model.sourceType ?? "pdf",
        },
        CAPTURE_RAW_HTTP_RESPONSE,
      ),
    );
  },
};

export default withStandardDecorators(createFromSourceTool);
