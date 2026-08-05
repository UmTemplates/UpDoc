// SwaggerDoc is an extension method on SwaggerGenOptions declared in the
// Microsoft.Extensions.DependencyInjection namespace, not in Swashbuckle's own.
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace UpDoc.OpenApi;

/// <summary>
/// Registers UpDoc's Swagger document.
///
/// UpDoc's controllers have always declared [MapToApi(UpDocApiConfiguration.ApiName)],
/// but that attribute only says which document an endpoint belongs to — something still
/// has to create the document. Without this, /umbraco/swagger/updoc/swagger.json returned
/// 404 and UpDoc's API was invisible to anything reading Swagger, despite working
/// perfectly well for the backoffice.
///
/// Follows the pattern Umbraco uses for its own separate APIs, e.g.
/// ConfigureUmbracoDeliveryApiSwaggerGenOptions.
/// </summary>
public class ConfigureUpDocSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
{
    public void Configure(SwaggerGenOptions swaggerGenOptions)
        => swaggerGenOptions.SwaggerDoc(
            UpDocApiConfiguration.ApiName,
            new OpenApiInfo
            {
                Title = UpDocApiConfiguration.ApiTitle,
                Version = "Latest",
                Description =
                    "Create Umbraco documents from external sources (PDF, web pages, markdown) "
                    + "using configurable extraction workflows. "
                    + $"You can find out more in [the documentation]({UpDocApiConfiguration.ApiDocumentationLink})."
            });
}
