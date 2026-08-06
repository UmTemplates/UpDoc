using System.Text.Json.Serialization;

namespace UpDoc.Models;

/// <summary>
/// Everything needed to create a document from a source file.
///
/// Mirrors the choices an editor makes in the backoffice: where the document
/// goes, what it is, which blueprint shapes it, and which file to read.
/// </summary>
public class CreateFromSourceRequest
{
    /// <summary>Document to create under. Null creates at the content root.</summary>
    [JsonPropertyName("parentId")]
    public Guid? ParentId { get; set; }

    /// <summary>The document type to create.</summary>
    [JsonPropertyName("documentTypeId")]
    public Guid DocumentTypeId { get; set; }

    /// <summary>
    /// The blueprint to scaffold from. Also selects the workflow, since a
    /// workflow folder exists per blueprint per source type.
    /// </summary>
    [JsonPropertyName("blueprintId")]
    public Guid BlueprintId { get; set; }

    /// <summary>
    /// Which source type to import: "pdf", "markdown", "web". Defaults to the
    /// workflow's first configured source type.
    /// </summary>
    [JsonPropertyName("sourceType")]
    public string? SourceType { get; set; }

    /// <summary>
    /// The media item holding the source file. It must already be in the media
    /// library - this creates a document, it does not upload.
    /// </summary>
    [JsonPropertyName("mediaId")]
    public Guid? MediaId { get; set; }

    /// <summary>
    /// Name for the new document. Pass one explicitly rather than relying on a
    /// default: renaming afterwards is a separate operation, and on some sites
    /// an unwanted one.
    /// </summary>
    [JsonPropertyName("documentName")]
    public string DocumentName { get; set; } = string.Empty;
}

/// <summary>
/// The outcome of a create-from-source run.
/// </summary>
public class CreateFromSourceResult
{
    /// <summary>Whether the document was created.</summary>
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    /// <summary>
    /// The new document's key. Everything downstream - reading it back, fixing
    /// content, publishing - needs this.
    /// </summary>
    [JsonPropertyName("documentId")]
    public Guid? DocumentId { get; set; }

    /// <summary>The workflow that produced the document.</summary>
    [JsonPropertyName("workflowAlias")]
    public string? WorkflowAlias { get; set; }

    /// <summary>
    /// How many values the mappings wrote. A number well below the workflow's
    /// mapping count means sections did not resolve.
    /// </summary>
    [JsonPropertyName("mappedValueCount")]
    public int MappedValueCount { get; set; }

    /// <summary>Why the import failed. Null on success.</summary>
    [JsonPropertyName("error")]
    public string? Error { get; set; }

    /// <summary>
    /// The document is created as a draft. Publishing is a separate decision, so
    /// callers know there is a step left.
    /// </summary>
    [JsonPropertyName("published")]
    public bool Published => false;

    public static CreateFromSourceResult Created(Guid documentId, string workflowAlias, int mappedValueCount) => new()
    {
        Success = true,
        DocumentId = documentId,
        WorkflowAlias = workflowAlias,
        MappedValueCount = mappedValueCount,
    };

    public static CreateFromSourceResult Failure(string error) => new()
    {
        Success = false,
        Error = error,
    };
}
