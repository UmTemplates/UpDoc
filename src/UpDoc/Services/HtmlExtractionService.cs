using System.Globalization;
using System.Text.RegularExpressions;
using AngleSharp;
using AngleSharp.Css.Dom;
using AngleSharp.Dom;
using Microsoft.Extensions.Logging;
using UpDoc.Models;

namespace UpDoc.Services;

public interface IHtmlExtractionService
{
    Task<RichExtractionResult> ExtractRichFromUrl(string url);
    RichExtractionResult ExtractRichFromFile(string filePath);
}

public class HtmlExtractionService : IHtmlExtractionService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<HtmlExtractionService> _logger;

    public HtmlExtractionService(
        IHttpClientFactory httpClientFactory,
        ILogger<HtmlExtractionService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <summary>
    /// Fetches HTML from a URL and extracts structured content.
    /// Uses AngleSharp to open the URL directly so it can discover and fetch
    /// external stylesheets, enabling accurate CSS computed style resolution.
    /// </summary>
    public async Task<RichExtractionResult> ExtractRichFromUrl(string url)
    {
        try
        {
            return await ExtractRichFromUrlDirect(url);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch HTML from URL: {Url}", url);
            return new RichExtractionResult
            {
                SourceType = "web",
                Error = $"Failed to fetch URL: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Opens a URL directly via AngleSharp's browsing context so that external
    /// stylesheets are automatically discovered, fetched, and parsed.
    /// This gives ComputeCurrentStyle() access to all CSS rules.
    /// </summary>
    private async Task<RichExtractionResult> ExtractRichFromUrlDirect(string url)
    {
        var config = Configuration.Default
            .WithCss()
            .WithRenderDevice(new AngleSharp.Css.DefaultRenderDevice { DeviceWidth = 1920, DeviceHeight = 1080, ViewPortWidth = 1920, ViewPortHeight = 1080 })
            .WithDefaultLoader(new AngleSharp.Io.LoaderOptions { IsResourceLoadingEnabled = true });
        var context = BrowsingContext.New(config);

        // Let AngleSharp navigate to the URL — it will fetch HTML, discover <link> stylesheets,
        // and load them automatically because IsResourceLoadingEnabled is true.
        var document = await context.OpenAsync(url);

        _logger.LogInformation("AngleSharp.Css loaded {StyleSheetCount} stylesheets for {Source}",
            document.StyleSheets.Length, url);

        return ExtractFromDocument(document, url);
    }

    /// <summary>
    /// Reads an HTML file from disk and extracts structured content.
    /// Fallback for when URL-based fetching doesn't work (scraping protection, etc.)
    /// </summary>
    public RichExtractionResult ExtractRichFromFile(string filePath)
    {
        try
        {
            var html = File.ReadAllText(filePath);
            return ExtractRichFromHtml(html, filePath).GetAwaiter().GetResult();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract from HTML file: {FilePath}", filePath);
            return new RichExtractionResult
            {
                SourceType = "web",
                Error = $"Failed to read HTML file: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Parses an HTML string (from file upload) with AngleSharp.Css.
    /// Without a base URL, external stylesheets won't be fetched — computed
    /// styles will be limited to inline styles, style blocks, and UA defaults.
    /// </summary>
    private async Task<RichExtractionResult> ExtractRichFromHtml(string html, string source)
    {
        var config = Configuration.Default
            .WithCss()
            .WithDefaultLoader(new AngleSharp.Io.LoaderOptions { IsResourceLoadingEnabled = true });
        var context = BrowsingContext.New(config);
        var document = await context.OpenAsync(req => req.Content(html));

        _logger.LogInformation("AngleSharp.Css loaded {StyleSheetCount} stylesheets from HTML string for {Source}",
            document.StyleSheets.Length, source);

        return ExtractFromDocument(document, source);
    }

    /// <summary>
    /// Shared document processing: walks the DOM, extracts elements with computed CSS metadata,
    /// builds the container tree, and returns the extraction result.
    /// </summary>
    private RichExtractionResult ExtractFromDocument(IDocument document, string source)
    {
        var body = document.Body ?? document.DocumentElement;

        var elements = new List<ExtractionElement>();
        var containerRoot = new ContainerTreeNode
        {
            Tag = "body",
            CssSelector = "body",
            Path = "body",
            Depth = 0
        };
        var elementIndex = 0;

        ExtractElements(body, elements, ref elementIndex, "Ungrouped", "", containerRoot);

        // Strip empty elements
        elements = elements.Where(e => !string.IsNullOrWhiteSpace(e.Text)).ToList();

        // Update element counts up the container tree
        UpdateElementCounts(containerRoot, elements);

        // Prune containers with no extracted elements
        PruneEmptyContainers(containerRoot);

        _logger.LogInformation("Extracted {Count} elements from HTML: {Source}",
            elements.Count, source);

        // Log area distribution
        var areaGroups = elements.GroupBy(e => e.Metadata.HtmlArea).OrderByDescending(g => g.Count());
        foreach (var group in areaGroups)
        {
            _logger.LogDebug("  Area '{Area}': {Count} elements", group.Key, group.Count());
        }

        return new RichExtractionResult
        {
            SourceType = "web",
            Source = new ExtractionSource
            {
                ExtractedDate = DateTime.UtcNow,
                TotalPages = 1,
                FileName = source,
            },
            Elements = elements,
            Containers = containerRoot.Children
        };
    }

    /// <summary>
    /// Recursively walks the DOM tree extracting content elements.
    /// Each element is tagged with its containing HTML area and container path.
    /// Captures text from headings, paragraphs, list items, table cells,
    /// and direct text containers (innermost divs/spans with text but no child elements containing text).
    /// </summary>
    private static void ExtractElements(IElement root, List<ExtractionElement> elements,
        ref int elementIndex, string currentArea, string containerPath,
        ContainerTreeNode parentContainer)
    {
        foreach (var node in root.Children)
        {
            var tagName = node.TagName.ToLowerInvariant();

            // Skip non-content elements (script, style, svg, iframe, form inputs)
            if (IsSkippableElement(tagName))
                continue;

            // Check if this element IS an area boundary
            var detectedArea = DetectArea(node);
            var areaForChildren = detectedArea ?? currentArea;

            // Headings
            if (tagName is "h1" or "h2" or "h3" or "h4" or "h5" or "h6")
            {
                var text = CleanText(node.TextContent);
                if (!string.IsNullOrWhiteSpace(text))
                {
                    elements.Add(new ExtractionElement
                    {
                        Id = $"html-{elementIndex++}",
                        Page = 1,
                        Text = text,
                        Metadata = BuildMetadata(node, areaForChildren, tagName, containerPath)
                    });
                }
                continue;
            }

            // Paragraphs
            if (tagName == "p")
            {
                var text = CleanText(node.TextContent);
                if (!string.IsNullOrWhiteSpace(text))
                {
                    var metadata = BuildMetadata(node, areaForChildren, "p", containerPath);

                    elements.Add(new ExtractionElement
                    {
                        Id = $"html-{elementIndex++}",
                        Page = 1,
                        Text = text,
                        Metadata = metadata,
                    });
                }
                continue;
            }

            // List items
            if (tagName == "li")
            {
                var text = CleanText(node.TextContent);
                if (!string.IsNullOrWhiteSpace(text))
                {
                    elements.Add(new ExtractionElement
                    {
                        Id = $"html-{elementIndex++}",
                        Page = 1,
                        Text = $"- {text}",
                        Metadata = BuildMetadata(node, areaForChildren, "li", containerPath)
                    });
                }
                continue;
            }

            // Table cells — extract as body text
            if (tagName is "td" or "th")
            {
                var text = CleanText(node.TextContent);
                if (!string.IsNullOrWhiteSpace(text))
                {
                    elements.Add(new ExtractionElement
                    {
                        Id = $"html-{elementIndex++}",
                        Page = 1,
                        Text = text,
                        Metadata = BuildMetadata(node, areaForChildren, tagName, containerPath)
                    });
                }
                continue;
            }

            // Container elements (div, section, article, span, etc.) — build container
            // path and tree node, then either extract leaf text or recurse into children.
            var containerSelector = BuildCssSelector(node);
            var childPath = string.IsNullOrEmpty(containerPath)
                ? containerSelector
                : $"{containerPath}/{containerSelector}";

            var containerNode = new ContainerTreeNode
            {
                Tag = tagName,
                Id = string.IsNullOrWhiteSpace(node.Id) ? null : node.Id,
                ClassName = string.IsNullOrWhiteSpace(node.ClassName) ? null : node.ClassName,
                CssSelector = containerSelector,
                Path = childPath,
                Depth = parentContainer.Depth + 1,
                Area = areaForChildren
            };

            parentContainer.Children ??= new List<ContainerTreeNode>();
            parentContainer.Children.Add(containerNode);

            // Check if this is a direct text container — an innermost container
            // with text but no child elements that themselves contain text.
            // Example: <div class="price">5 days from £899</div>
            if (IsDirectTextContainer(node))
            {
                var text = CleanText(node.TextContent);
                if (!string.IsNullOrWhiteSpace(text))
                {
                    elements.Add(new ExtractionElement
                    {
                        Id = $"html-{elementIndex++}",
                        Page = 1,
                        Text = text,
                        Metadata = BuildMetadata(node, areaForChildren, tagName, childPath)
                    });
                }
            }
            else
            {
                // Recurse into children
                ExtractElements(node, elements, ref elementIndex, areaForChildren,
                    childPath, containerNode);
            }
        }
    }

    /// <summary>
    /// Builds ElementMetadata with real computed CSS values from AngleSharp.Css.
    /// Falls back to sensible defaults when computed styles are unavailable.
    /// </summary>
    private static ElementMetadata BuildMetadata(IElement node, string area, string htmlTag, string containerPath)
    {
        var fontSize = GetComputedFontSizeInPoints(node);
        var fontName = GetComputedFontFamily(node);
        var color = GetComputedColorHex(node);
        var cssClasses = GetCssClasses(node);
        var isBold = DetectBold(node);

        return new ElementMetadata
        {
            FontSize = fontSize,
            FontName = fontName,
            Color = color,
            HtmlArea = area,
            HtmlTag = htmlTag,
            HtmlContainerPath = containerPath,
            CssClasses = cssClasses,
            IsBold = isBold,
        };
    }

    /// <summary>
    /// Detects whether an element's text content is bold — either via a direct
    /// &lt;strong&gt;/&lt;b&gt; child wrapping most of the text, or via CSS font-weight.
    /// </summary>
    private static bool DetectBold(IElement node)
    {
        // Check for <strong> or <b> child that contains most of the text
        var nodeText = node.TextContent?.Trim() ?? "";
        if (nodeText.Length == 0) return false;

        // Check direct children first
        foreach (var child in node.Children)
        {
            var childTag = child.TagName.ToLowerInvariant();
            if (childTag is "strong" or "b")
            {
                var childText = child.TextContent?.Trim() ?? "";
                // If the bold child contains most of the element's text, it's a bold element
                if (childText.Length > 0 && childText.Length >= nodeText.Length * 0.8)
                    return true;
            }
        }

        // Check ALL descendants (handles <p><a><strong>text</strong></a></p>)
        foreach (var descendant in node.QuerySelectorAll("strong, b"))
        {
            var descText = descendant.TextContent?.Trim() ?? "";
            if (descText.Length > 0 && descText.Length >= nodeText.Length * 0.8)
                return true;
        }

        // Check CSS font-weight (covers inline styles and stylesheets)
        try
        {
            var style = node.ComputeCurrentStyle();
            var fontWeight = style?.GetPropertyValue("font-weight");
            if (!string.IsNullOrEmpty(fontWeight))
            {
                if (fontWeight is "bold" or "bolder")
                    return true;
                if (int.TryParse(fontWeight, out var weight) && weight >= 700)
                    return true;
            }
        }
        catch
        {
            // CSS computation not available — ignore
        }

        return false;
    }

    /// <summary>
    /// Gets the computed font-size in points from CSS.
    /// CSS returns px; convert to pt via pt = px * 0.75.
    /// </summary>
    private static double GetComputedFontSizeInPoints(IElement element)
    {
        try
        {
            var style = element.ComputeCurrentStyle();
            var fontSizeValue = style?.GetPropertyValue("font-size");
            if (string.IsNullOrEmpty(fontSizeValue)) return 0;

            // ComputeCurrentStyle typically resolves to px values
            if (fontSizeValue.EndsWith("px", StringComparison.OrdinalIgnoreCase) &&
                double.TryParse(fontSizeValue[..^2], NumberStyles.Any, CultureInfo.InvariantCulture, out var px))
            {
                return Math.Round(px * 0.75, 1); // px to pt
            }

            // Handle pt values directly
            if (fontSizeValue.EndsWith("pt", StringComparison.OrdinalIgnoreCase) &&
                double.TryParse(fontSizeValue[..^2], NumberStyles.Any, CultureInfo.InvariantCulture, out var pt))
            {
                return Math.Round(pt, 1);
            }

            // Try parsing as bare number (some CSS engines return unitless)
            if (double.TryParse(fontSizeValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var bare))
            {
                return Math.Round(bare * 0.75, 1);
            }
        }
        catch
        {
            // ComputeCurrentStyle may throw if CSS context is not available
        }

        return 0;
    }

    /// <summary>
    /// Gets the computed font-family from CSS.
    /// Returns the first family name, stripping quotes.
    /// </summary>
    private static string GetComputedFontFamily(IElement element)
    {
        try
        {
            var style = element.ComputeCurrentStyle();
            var fontFamily = style?.GetPropertyValue("font-family");
            if (string.IsNullOrEmpty(fontFamily)) return string.Empty;

            // Take first family name: "'ClarendonLTStdRoman', Arial, sans-serif" → "ClarendonLTStdRoman"
            var first = fontFamily.Split(',')[0].Trim().Trim('\'', '"');
            return string.IsNullOrEmpty(first) ? string.Empty : first;
        }
        catch
        {
            return string.Empty;
        }
    }

    /// <summary>
    /// Gets the computed color from CSS as a hex string.
    /// CSS may return rgb(r,g,b), rgba(r,g,b,a), or hex values.
    /// </summary>
    private static string GetComputedColorHex(IElement element)
    {
        try
        {
            var style = element.ComputeCurrentStyle();
            var colorValue = style?.GetPropertyValue("color");
            if (string.IsNullOrEmpty(colorValue)) return "#000000";

            return ParseCssColorToHex(colorValue);
        }
        catch
        {
            return "#000000";
        }
    }

    /// <summary>
    /// Parses a CSS color value to hex format.
    /// Handles rgb(r,g,b), rgba(r,g,b,a), and hex values.
    /// </summary>
    private static string ParseCssColorToHex(string cssColor)
    {
        if (string.IsNullOrEmpty(cssColor)) return "#000000";

        // Already hex
        if (cssColor.StartsWith('#'))
            return cssColor.Length == 4
                ? $"#{cssColor[1]}{cssColor[1]}{cssColor[2]}{cssColor[2]}{cssColor[3]}{cssColor[3]}"
                : cssColor.ToUpperInvariant();

        // rgb(r, g, b) or rgba(r, g, b, a)
        var match = Regex.Match(cssColor, @"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)");
        if (match.Success)
        {
            var r = int.Parse(match.Groups[1].Value);
            var g = int.Parse(match.Groups[2].Value);
            var b = int.Parse(match.Groups[3].Value);
            return $"#{r:X2}{g:X2}{b:X2}";
        }

        return "#000000";
    }

    /// <summary>
    /// Gets CSS class names from the element as a space-separated string.
    /// </summary>
    private static string GetCssClasses(IElement element)
    {
        return element.ClassList.Length > 0
            ? string.Join(" ", element.ClassList)
            : string.Empty;
    }

    /// <summary>
    /// Builds a CSS-like selector for a container element.
    /// Uses tag + first meaningful class or id (e.g., "div.country-banner", "section#main-content").
    /// </summary>
    private static string BuildCssSelector(IElement element)
    {
        var tagName = element.TagName.ToLowerInvariant();

        // Prefer id (more specific)
        if (!string.IsNullOrWhiteSpace(element.Id))
            return $"{tagName}#{element.Id.Trim()}";

        // Use first class name if available
        if (!string.IsNullOrWhiteSpace(element.ClassName))
        {
            var firstClass = element.ClassName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (firstClass.Length > 0)
                return $"{tagName}.{firstClass[0]}";
        }

        return tagName;
    }

    /// <summary>
    /// Checks if a container element is a "direct text container" — the innermost
    /// container that has text content but no child elements with their own text.
    /// This catches text in bare divs/spans that would otherwise be lost, e.g.:
    ///   &lt;div class="price"&gt;5 days from £899&lt;/div&gt;
    ///
    /// A container is NOT direct text if:
    /// - It has child elements that are content producers (p, h1-h6, li, td/th, lists, tables)
    /// - It has child containers (div, span, section, a, etc.) that themselves contain text
    /// - It has more than 3 child elements (too structural to be a simple text wrapper)
    /// </summary>
    private static bool IsDirectTextContainer(IElement element)
    {
        // Must have some text content
        if (string.IsNullOrWhiteSpace(element.TextContent))
            return false;

        // Too many children = structural container, not a text wrapper
        if (element.Children.Length > 3)
            return false;

        foreach (var child in element.Children)
        {
            var childTag = child.TagName.ToLowerInvariant();

            // Skip non-content children
            if (IsSkippableElement(childTag))
                continue;

            // If child is a content-producing element, this is not a direct text container
            if (childTag is "p" or "h1" or "h2" or "h3" or "h4" or "h5" or "h6"
                or "li" or "td" or "th")
                return false;

            // If child is a list or table container, not a direct text container
            if (childTag is "ul" or "ol" or "table" or "tr" or "tbody" or "thead")
                return false;

            // If child is any element with text content, this container should
            // let recursion handle it — it's not the innermost text holder
            if (childTag is "div" or "section" or "article" or "span" or "a"
                or "strong" or "em" or "b" or "i")
            {
                if (!string.IsNullOrWhiteSpace(child.TextContent))
                    return false;
            }
        }

        return true;
    }

    /// <summary>
    /// Two-tier area detection: semantic HTML5 elements + class/ID pattern matching.
    /// Returns a human-readable area name, or null if this element is not an area boundary.
    /// </summary>
    private static string? DetectArea(IElement element)
    {
        var tagName = element.TagName.ToLowerInvariant();

        // Tier 1: Semantic HTML5 elements
        switch (tagName)
        {
            case "header":
                return "Header";
            case "nav":
                return "Navigation";
            case "main":
                return "Main Content";
            case "aside":
                return "Sidebar";
            case "footer":
                return "Footer";
            case "article":
                return "Article";
            case "section":
                // <section> is too generic on its own — only treat as area if it has a
                // class/id that suggests a distinct region. Otherwise fall through to Tier 2.
                break;
        }

        // Tier 2: Class/ID pattern matching for legacy sites (div, table, section, etc.)
        if (tagName is "div" or "table" or "section" or "td")
        {
            var classAttr = element.GetAttribute("class")?.ToLowerInvariant() ?? "";
            var idAttr = element.GetAttribute("id")?.ToLowerInvariant() ?? "";
            var roleAttr = element.GetAttribute("role")?.ToLowerInvariant() ?? "";

            // Check role attribute first
            if (roleAttr == "banner" || roleAttr == "navigation" || roleAttr == "main"
                || roleAttr == "complementary" || roleAttr == "contentinfo")
            {
                return roleAttr switch
                {
                    "banner" => "Header",
                    "navigation" => "Navigation",
                    "main" => "Main Content",
                    "complementary" => "Sidebar",
                    "contentinfo" => "Footer",
                    _ => null
                };
            }

            // Check class and id patterns
            var combined = $"{classAttr} {idAttr}";

            // Order matters — check more specific patterns first
            if (ContainsPattern(combined, "nav", "navigation", "menu"))
                return "Navigation";
            if (ContainsPattern(combined, "header", "masthead", "site-header", "page-header"))
                return "Header";
            if (ContainsPattern(combined, "footer", "site-footer", "page-footer"))
                return "Footer";
            if (ContainsPattern(combined, "sidebar", "aside", "side-bar", "widget-area"))
                return "Sidebar";
            if (ContainsPattern(combined, "main-content", "page-content", "content-area",
                "main-body", "primary-content"))
                return "Main Content";
            // "content" alone is a weaker signal — only match if it's a standalone word
            // to avoid false positives on things like "content-type", "disclaimer-content"
            if (ContainsStandaloneWord(combined, "main") || ContainsStandaloneWord(combined, "content"))
                return "Main Content";
        }

        return null;
    }

    /// <summary>
    /// Checks if the combined class/id string contains any of the given patterns as substrings.
    /// </summary>
    private static bool ContainsPattern(string combined, params string[] patterns)
    {
        foreach (var pattern in patterns)
        {
            if (combined.Contains(pattern, StringComparison.Ordinal))
                return true;
        }
        return false;
    }

    /// <summary>
    /// Checks if a word appears as a standalone token in a space-separated string.
    /// "content" matches "content wrapper" but not "disclaimer-content".
    /// </summary>
    private static bool ContainsStandaloneWord(string combined, string word)
    {
        var tokens = combined.Split(new[] { ' ', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
        return tokens.Any(t => t.Equals(word, StringComparison.Ordinal));
    }

    /// <summary>
    /// Determines if an element should be completely skipped during extraction.
    /// These are elements that never contain useful text content.
    /// Note: nav, header, footer are NOT skipped — they are extracted but tagged with their area.
    /// </summary>
    private static bool IsSkippableElement(string tagName)
    {
        return tagName is "script" or "style" or "noscript" or "svg" or "iframe"
            or "form" or "button" or "input" or "select" or "textarea"
            or "meta" or "link" or "head";
    }

    /// <summary>
    /// Cleans extracted text: collapses whitespace, trims.
    /// </summary>
    private static string CleanText(string text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;

        // Collapse all whitespace (including newlines) to single spaces
        var cleaned = Regex.Replace(text, @"\s+", " ");
        return cleaned.Trim();
    }

    /// <summary>
    /// Walks the container tree and sets ElementCount on each node
    /// by counting how many extracted elements have a container path
    /// that starts with (or equals) this container's path.
    /// </summary>
    private static void UpdateElementCounts(ContainerTreeNode node, List<ExtractionElement> elements)
    {
        node.ElementCount = elements.Count(e =>
            !string.IsNullOrEmpty(e.Metadata.HtmlContainerPath) &&
            (e.Metadata.HtmlContainerPath == node.Path ||
             e.Metadata.HtmlContainerPath.StartsWith(node.Path + "/", StringComparison.Ordinal)));

        if (node.Children == null) return;
        foreach (var child in node.Children)
        {
            UpdateElementCounts(child, elements);
        }
    }

    /// <summary>
    /// Removes container nodes that have zero extracted elements and no children with elements.
    /// Keeps the tree focused on containers that actually hold content.
    /// </summary>
    private static void PruneEmptyContainers(ContainerTreeNode node)
    {
        if (node.Children == null) return;

        // Recurse first so children are pruned before we check them
        foreach (var child in node.Children)
        {
            PruneEmptyContainers(child);
        }

        // Remove children with no elements and no remaining grandchildren
        node.Children = node.Children
            .Where(c => c.ElementCount > 0 || (c.Children != null && c.Children.Count > 0))
            .ToList();

        if (node.Children.Count == 0)
            node.Children = null;
    }
}
