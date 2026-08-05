namespace UpDoc.Models;

/// <summary>
/// Mapping sources that describe the import itself rather than content extracted
/// from it — the file the editor picked, and in future the URL they typed.
///
/// These are not sections, so anything that resolves or validates a mapping source
/// against extracted content has to skip them. The "$" prefix marks them as such.
///
/// Mirrors IMPORT_FACT_SOURCE_FILE in workflow.types.ts. The two must agree: the
/// TypeScript side writes these into map.json, this side reads them back.
/// </summary>
public static class ImportFacts
{
    /// <summary>Marks a map.json source as an import fact rather than a section id.</summary>
    public const string Prefix = "$";

    /// <summary>The file picked for this import.</summary>
    public const string SourceFile = "$sourceFile";

    /// <summary>
    /// Whether a map.json source describes the import rather than naming a section.
    /// </summary>
    public static bool IsImportFact(string? source) =>
        source?.StartsWith(Prefix, StringComparison.Ordinal) == true;
}
