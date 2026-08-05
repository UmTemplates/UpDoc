using UpDoc.OpenApi;
using UpDoc.Services;
using UpDoc.NotificationHandlers;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace UpDoc.Composers;

public class UpDocComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IPdfExtractionService, PdfExtractionService>();
        builder.Services.AddScoped<IPdfPagePropertiesService, PdfPagePropertiesService>();
        builder.Services.AddScoped<IMarkdownExtractionService, MarkdownExtractionService>();
        builder.Services.AddScoped<IHtmlExtractionService, HtmlExtractionService>();
        builder.Services.AddHttpClient("UpDocHtml", client =>
        {
            client.DefaultRequestHeaders.Add("User-Agent", "UpDoc/1.0 (Umbraco CMS Extension)");
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        builder.Services.AddSingleton<IWorkflowService, WorkflowService>();
        builder.Services.AddScoped<IDestinationStructureService, DestinationStructureService>();
        builder.Services.AddSingleton<IContentTransformService, ContentTransformService>();
        builder.AddNotificationHandler<UmbracoApplicationStartedNotification, WorkflowMigrationHandler>();

        // Describes UpDoc's API at /umbraco/swagger/updoc/swagger.json. The controllers
        // already declare [MapToApi] but nothing created the document they name.
        builder.Services.ConfigureOptions<ConfigureUpDocSwaggerGenOptions>();
    }
}
