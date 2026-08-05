namespace UpDoc.OpenApi;

/// <summary>
/// Identifies UpDoc's API to Swagger and to the [MapToApi] attribute on its controllers.
/// </summary>
public static class UpDocApiConfiguration
{
    /// <summary>
    /// The Swagger document name. Also the URL segment:
    /// /umbraco/swagger/updoc/swagger.json.
    ///
    /// Changing this breaks any consumer pointed at the old path, so treat it as a
    /// published contract rather than an internal name.
    /// </summary>
    public const string ApiName = "updoc";

    public const string ApiTitle = "UpDoc API";

    public const string ApiDocumentationLink = "https://umtemplates.github.io/UpDoc/";
}
