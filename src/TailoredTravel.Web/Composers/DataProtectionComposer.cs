using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace TailoredTravel.Web.Composers;

// Persists ASP.NET Core DataProtection keys to a location outside the container's
// ephemeral filesystem so auth cookies / tokens survive container restarts on UmbHost
// GreenStack. Pattern provided by UmbHost:
// https://github.com/UmbHost/GreenStack.Umbraco/blob/main/GreenStack.Umbraco/Composers/DataProtectionComposer.cs
public class DataProtectionComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        var environment = builder.Services.BuildServiceProvider()
            .GetRequiredService<IHostEnvironment>();

        var keysPath = environment.IsProduction()
            ? "/app/keys"
            : Path.Combine(environment.ContentRootPath, "DataProtection-Keys");

        if (!Directory.Exists(keysPath))
        {
            Directory.CreateDirectory(keysPath);
        }

        builder.Services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(keysPath));
    }
}
