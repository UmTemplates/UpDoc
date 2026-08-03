using System.Reflection;
using Microsoft.AspNetCore.HttpOverrides;
using TailoredTravel.Web.Services;
using Umbraco.Cms.Web.Common.PublishedModels;
using Umbraco.Community.BlockPreview.Extensions;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<INavIconResolver, NavIconResolver>();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.RequireHeaderSymmetry = false;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});
builder.Services.AddHealthChecks();

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddBlockPreview(options =>
    {
        var layoutAliases = typeof(Layout12).Assembly.GetTypes()
            .Where(t => t.Namespace == "Umbraco.Cms.Web.Common.PublishedModels")
            .Select(t => t.GetField("ModelTypeAlias",
                BindingFlags.Public | BindingFlags.Static)?.GetValue(null) as string)
            .Where(alias => alias != null && alias.StartsWith("layout"))
            .ToList();

        options.BlockGrid = new()
        {
            Enabled = true,
            IgnoredContentTypes = layoutAliases!,
            Stylesheets = ["/css/index.css"]
        };
    })
    .AddComposers()
    .Build();

WebApplication app = builder.Build();

app.UseForwardedHeaders();

await app.BootUmbracoAsync();

app.UseXfo(options => options.SameOrigin());
app.UseXContentTypeOptions();
app.UseReferrerPolicy(options => options.NoReferrerWhenDowngrade());

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
    await next();
});

app.MapHealthChecks("/health");


app.Use(async (context, next) =>
{
    // Enable request body buffering for Contentment data source API calls
    if (context.Request.Path.StartsWithSegments("/umbraco/management/api/v1/contentment"))
    {
        context.Request.EnableBuffering();
    }
    await next();
});

// TODO #577: Remove once stale manifest cache is no longer an issue
app.Use(async (context, next) =>
{
    if (context.Request.Path.Value?.EndsWith("tailored-travel-backoffice.js") == true)
    {
        context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        context.Response.Headers["Pragma"] = "no-cache";
        context.Response.Headers["Expires"] = "0";
    }
    await next();
});

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
        u.AppBuilder.UseMiddleware<TailoredTravel.Web.Routing.TailoredTourRedirectMiddleware>();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();