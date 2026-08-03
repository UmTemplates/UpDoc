using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Umbraco.Cms.Core.Services;

namespace TailoredTravel.Web.Services;

public interface INavIconResolver
{
    Task<string?> GetIconAsync(string contentTypeAlias, IEnumerable<int> dataTypeIds);
}

public class NavIconResolver : INavIconResolver
{
    private readonly IHostEnvironment _hostEnvironment;
    private readonly Task<IReadOnlyDictionary<int, IReadOnlyDictionary<string, string>>> _iconsByDataType;

    public NavIconResolver(IDataTypeService dataTypeService, IHostEnvironment hostEnvironment, IContentTypeService contentTypeService)
    {
        _hostEnvironment = hostEnvironment;
        _iconsByDataType = BuildIconMapAsync(dataTypeService, contentTypeService);
    }

    public async Task<string?> GetIconAsync(string contentTypeAlias, IEnumerable<int> dataTypeIds)
    {
        var map = await _iconsByDataType;
        foreach (var id in dataTypeIds)
        {
            if (map.TryGetValue(id, out var aliasMap)
                && aliasMap.TryGetValue(contentTypeAlias, out var svg))
            {
                return svg;
            }
        }
        return null;
    }

    private async Task<IReadOnlyDictionary<int, IReadOnlyDictionary<string, string>>> BuildIconMapAsync(
        IDataTypeService dataTypeService,
        IContentTypeService contentTypeService)
    {
        var aliasByKey = BuildAliasByKey(contentTypeService);
        var result = new Dictionary<int, IReadOnlyDictionary<string, string>>();

        var allDataTypes = await dataTypeService.GetAllAsync();
        var blockGridDataTypes = allDataTypes.Where(dt => dt.EditorAlias == "Umbraco.BlockGrid");

        foreach (var dataType in blockGridDataTypes)
        {
            if (dataType.ConfigurationData is null) continue;

            string configJson;
            try { configJson = JsonSerializer.Serialize(dataType.ConfigurationData); }
            catch { continue; }

            using var doc = JsonDocument.Parse(configJson);
            if (!doc.RootElement.TryGetProperty("blocks", out var blocks)) continue;

            var aliasMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var block in blocks.EnumerateArray())
            {
                if (!block.TryGetProperty("contentElementTypeKey", out var keyProp)) continue;
                if (!Guid.TryParse(keyProp.GetString(), out var elementKey)) continue;
                if (!aliasByKey.TryGetValue(elementKey, out var alias)) continue;

                if (!block.TryGetProperty("thumbnail", out var thumbProp)) continue;
                if (thumbProp.ValueKind != JsonValueKind.String) continue;

                var thumbPath = thumbProp.GetString();
                if (string.IsNullOrWhiteSpace(thumbPath)) continue;

                var relative = thumbPath.TrimStart('/').Replace('/', System.IO.Path.DirectorySeparatorChar);
                var fullPath = System.IO.Path.Combine(_hostEnvironment.ContentRootPath, relative);
                if (!System.IO.File.Exists(fullPath)) continue;

                var svg = System.IO.File.ReadAllText(fullPath);
                aliasMap[alias] = svg;
            }

            result[dataType.Id] = aliasMap;
        }

        return result;
    }

    private static IReadOnlyDictionary<Guid, string> BuildAliasByKey(IContentTypeService contentTypeService)
    {
        var map = new Dictionary<Guid, string>();
        foreach (var ct in contentTypeService.GetAll())
        {
            map[ct.Key] = ct.Alias;
        }
        return map;
    }
}
