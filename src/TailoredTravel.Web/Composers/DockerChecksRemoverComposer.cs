using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Infrastructure.Runtime.RuntimeModeValidators;

public class DockerChecksRemover : IComposer
{
    public void Compose(IUmbracoBuilder builder)
        => builder.RuntimeModeValidators().Remove<UseHttpsValidator>();
}
