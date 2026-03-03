using System.Text.RegularExpressions;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using UpDoc.Models;

namespace UpDoc.Services;

public interface IPdfPagePropertiesService
{
    PdfPageProperties ExtractFromFile(string filePath);
    PdfPageProperties ExtractFromStream(Stream stream);
    PdfSectionResult ExtractSectionByHeading(string filePath, string headingText);
    PdfMarkdownResult ExtractAsMarkdown(string filePath);

    /// <summary>
    /// Extracts structured sections from a PDF using rules defined in a map file.
    /// Returns typed sections (title, description, content) driven by the extraction config.
    /// </summary>
    [Obsolete("Use ExtractSectionsFromConfig instead")]
    ExtractionResult ExtractSections(string filePath, PdfExtractionRules rules);

    /// <summary>
    /// Extracts structured sections from a PDF using the SourceConfig section definitions.
    /// Each section is extracted according to its strategy and returned with its key.
    /// </summary>
    ExtractionResult ExtractSectionsFromConfig(string filePath, SourceConfig sourceConfig);

    /// <summary>
    /// Extracts every text element from a PDF with full metadata (font size, position,
    /// color, font name, bounding box). This is the "full dump" extraction that powers
    /// the destination-driven mapping workflow.
    /// </summary>
    /// <param name="filePath">Path to the PDF file.</param>
    /// <param name="includePages">Optional list of page numbers to extract. Null = all pages.</param>
    RichExtractionResult ExtractRichDump(string filePath, List<int>? includePages = null);

    /// <summary>
    /// Detects spatial areas from filled rectangles in the PDF and groups text elements
    /// into a hierarchy: Page → Area → Section → Elements.
    /// Area detection is destination-agnostic — it produces a complete structural
    /// representation of the source PDF.
    /// </summary>
    /// <param name="filePath">Path to the PDF file.</param>
    /// <param name="includePages">Optional list of page numbers to extract. Null = all pages.</param>
    /// <param name="areaTemplate">Optional user-defined area template. When provided, uses template areas instead of auto-detecting from filled rectangles.</param>
    AreaDetectionResult DetectAreas(string filePath, List<int>? includePages = null, AreaTemplate? areaTemplate = null);
}

/// <summary>
/// Represents the full PDF content extracted as Markdown.
/// </summary>
public class PdfMarkdownResult
{
    /// <summary>
    /// The document title (H1).
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// The document subtitle/description (e.g., "5 days from £889").
    /// </summary>
    public string Subtitle { get; set; } = string.Empty;

    /// <summary>
    /// The full content as Markdown, excluding title and subtitle.
    /// Includes Day headings as ## and body text as paragraphs.
    /// </summary>
    public string Markdown { get; set; } = string.Empty;

    /// <summary>
    /// The full raw text for debugging.
    /// </summary>
    public string RawText { get; set; } = string.Empty;

    public string? Error { get; set; }
}

/// <summary>
/// Represents a section of text extracted from a PDF by heading.
/// </summary>
public class PdfSectionResult
{
    /// <summary>
    /// The heading that was found.
    /// </summary>
    public string Heading { get; set; } = string.Empty;

    /// <summary>
    /// The content text extracted from under the heading.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    public string? Error { get; set; }
}

/// <summary>
/// Structured extraction result with typed sections, driven by map file rules.
/// </summary>
public class ExtractionResult
{
    public Dictionary<string, string> Sections { get; set; } = new();
    public string RawText { get; set; } = string.Empty;
    public string? Error { get; set; }
}

/// <summary>
/// Represents page properties extracted from a PDF document.
/// Title → Page Title, Page Title Short (and node name)
/// Description → Page Description
/// </summary>
public class PdfPageProperties
{
    /// <summary>
    /// The document title, extracted from the largest font text at the top of the first page.
    /// Used for: Page Title, Page Title Short, and node name.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// The document description, extracted from the text below the title.
    /// Used for: Page Description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    public string? Error { get; set; }
}

public class PdfPagePropertiesService : IPdfPagePropertiesService
{
    public PdfPageProperties ExtractFromFile(string filePath)
    {
        try
        {
            using var document = PdfDocument.Open(filePath);
            return ExtractFromDocument(document);
        }
        catch (Exception ex)
        {
            return new PdfPageProperties
            {
                Error = $"Failed to extract PDF page properties: {ex.Message}"
            };
        }
    }

    public PdfPageProperties ExtractFromStream(Stream stream)
    {
        try
        {
            using var document = PdfDocument.Open(stream);
            return ExtractFromDocument(document);
        }
        catch (Exception ex)
        {
            return new PdfPageProperties
            {
                Error = $"Failed to extract PDF page properties: {ex.Message}"
            };
        }
    }

    public PdfSectionResult ExtractSectionByHeading(string filePath, string headingText)
    {
        try
        {
            using var document = PdfDocument.Open(filePath);
            return ExtractSectionFromDocument(document, headingText);
        }
        catch (Exception ex)
        {
            return new PdfSectionResult
            {
                Error = $"Failed to extract PDF section: {ex.Message}"
            };
        }
    }

    public PdfMarkdownResult ExtractAsMarkdown(string filePath)
    {
        try
        {
            using var document = PdfDocument.Open(filePath);
            return ExtractMarkdownFromDocument(document);
        }
        catch (Exception ex)
        {
            return new PdfMarkdownResult
            {
                Error = $"Failed to extract PDF as Markdown: {ex.Message}"
            };
        }
    }

    public ExtractionResult ExtractSections(string filePath, PdfExtractionRules rules)
    {
        try
        {
            using var document = PdfDocument.Open(filePath);
            return ExtractSectionsFromDocument(document, rules);
        }
        catch (Exception ex)
        {
            return new ExtractionResult
            {
                Error = $"Failed to extract PDF sections: {ex.Message}"
            };
        }
    }

    public ExtractionResult ExtractSectionsFromConfig(string filePath, SourceConfig sourceConfig)
    {
        try
        {
            using var document = PdfDocument.Open(filePath);
            return ExtractSectionsFromSourceConfig(document, sourceConfig);
        }
        catch (Exception ex)
        {
            return new ExtractionResult
            {
                Error = $"Failed to extract PDF sections: {ex.Message}"
            };
        }
    }

    public RichExtractionResult ExtractRichDump(string filePath, List<int>? includePages = null)
    {
        try
        {
            using var document = PdfDocument.Open(filePath);
            return ExtractRichDumpFromDocument(document, includePages);
        }
        catch (Exception ex)
        {
            return new RichExtractionResult
            {
                Error = $"Failed to extract PDF: {ex.Message}"
            };
        }
    }

    public AreaDetectionResult DetectAreas(string filePath, List<int>? includePages = null, AreaTemplate? areaTemplate = null)
    {
        try
        {
            using var document = PdfDocument.Open(filePath);
            return DetectAreasFromDocument(document, includePages, areaTemplate);
        }
        catch (Exception)
        {
            return new AreaDetectionResult
            {
                Diagnostics = new AreaDiagnosticInfo
                {
                    TotalPathsFound = -1 // signals error
                }
            };
        }
    }

    private static AreaDetectionResult DetectAreasFromDocument(PdfDocument document, List<int>? includePages = null, AreaTemplate? areaTemplate = null)
    {
        var result = new AreaDetectionResult { TotalPages = document.NumberOfPages };
        var diagnostics = new AreaDiagnosticInfo();
        var totalElementIndex = 0;

        for (int pageNum = 1; pageNum <= document.NumberOfPages; pageNum++)
        {
            // Skip pages not in the include list (if specified)
            if (includePages != null && !includePages.Contains(pageNum))
                continue;
            var page = document.GetPage(pageNum);

            // Step 1: Build areas — from template if provided, otherwise auto-detect from filled rectangles
            List<DetectedArea> areas;
            if (areaTemplate != null)
            {
                areas = areaTemplate.Areas
                    .Where(a => a.Page == pageNum)
                    .Select(a => new DetectedArea
                    {
                        Name = a.Name,
                        Color = a.Color,
                        Page = pageNum,
                        SectionPattern = a.SectionPattern,
                        BoundingBox = new ElementBoundingBox
                        {
                            Left = a.Bounds.X,
                            Top = a.Bounds.Y + a.Bounds.Height, // Convert from bottom-left origin Y to Top
                            Width = a.Bounds.Width,
                            Height = a.Bounds.Height
                        }
                    })
                    .OrderBy(a => a.BoundingBox.Left)
                    .ToList();
            }
            else
            {
                areas = DetectPageFilledRects(page, pageNum, diagnostics)
                    .OrderBy(a => a.BoundingBox.Left)
                    .ToList();
            }

            // Step 2: Get all words from the page
            var allWords = page.GetWords().ToList();

            // Step 3: Extract text per area.
            // When user-defined areas exist (template), filter words INTO each area
            // BEFORE line grouping. This prevents cross-column text merging — words
            // from image captions can't merge with itinerary text if they're filtered
            // out before grouping. Without a template (auto-detected areas from filled
            // rects), fall back to the original center-point assignment of finished lines.
            var areaElements = new Dictionary<int, List<AreaElement>>();

            for (int i = 0; i < areas.Count; i++)
                areaElements[i] = new List<AreaElement>();

            if (areaTemplate != null)
            {
                // Template path: filter words per area, then group into lines per area.
                // Each area gets its own independent line extraction — no cross-area merging.
                var assignedWordIndices = new HashSet<int>();

                for (int i = 0; i < areas.Count; i++)
                {
                    var ab = areas[i].BoundingBox;
                    var areaLeft = ab.Left;
                    var areaRight = ab.Left + ab.Width;
                    var areaBottom = ab.Top - ab.Height;
                    var areaTop = ab.Top;

                    // Filter words whose center falls within this area
                    var areaWords = new List<Word>();
                    for (int wi = 0; wi < allWords.Count; wi++)
                    {
                        if (assignedWordIndices.Contains(wi))
                            continue;

                        var word = allWords[wi];
                        var wcx = (word.BoundingBox.Left + word.BoundingBox.Right) / 2;
                        var wcy = (word.BoundingBox.Bottom + word.BoundingBox.Top) / 2;

                        if (wcx >= areaLeft && wcx <= areaRight && wcy >= areaBottom && wcy <= areaTop)
                        {
                            areaWords.Add(word);
                            assignedWordIndices.Add(wi);
                        }
                    }

                    // Group filtered words into lines (independent per area)
                    var areaLines = ExtractRichTextLines(areaWords);

                    foreach (var line in areaLines)
                    {
                        totalElementIndex++;
                        areaElements[i].Add(new AreaElement
                        {
                            Id = $"p{pageNum}-e{totalElementIndex}",
                            Text = line.Text,
                            FontSize = Math.Round(line.FontSize, 1),
                            FontName = line.FontName,
                            Color = line.Color,
                            BoundingBox = new ElementBoundingBox
                            {
                                Left = Math.Round(line.BoundingBoxLeft, 1),
                                Top = Math.Round(line.BoundingBoxTop, 1),
                                Width = Math.Round(line.BoundingBoxWidth, 1),
                                Height = Math.Round(line.BoundingBoxHeight, 1)
                            }
                        });
                    }
                }

                // Template path: content outside drawn areas is intentionally excluded.
                // The user defines areas explicitly — anything outside is not wanted.
            }
            else
            {
                // Auto-detect path: extract all lines first, then assign to areas
                // by center-point containment (original behaviour).
                var lines = ExtractRichTextLines(allWords);

                var pageElements = new List<(AreaElement Element, double CenterX, double CenterY)>();
                foreach (var line in lines)
                {
                    totalElementIndex++;
                    var element = new AreaElement
                    {
                        Id = $"p{pageNum}-e{totalElementIndex}",
                        Text = line.Text,
                        FontSize = Math.Round(line.FontSize, 1),
                        FontName = line.FontName,
                        Color = line.Color,
                        BoundingBox = new ElementBoundingBox
                        {
                            Left = Math.Round(line.BoundingBoxLeft, 1),
                            Top = Math.Round(line.BoundingBoxTop, 1),
                            Width = Math.Round(line.BoundingBoxWidth, 1),
                            Height = Math.Round(line.BoundingBoxHeight, 1)
                        }
                    };

                    var centerX = line.BoundingBoxLeft + line.BoundingBoxWidth / 2;
                    var centerY = line.BoundingBoxTop - line.BoundingBoxHeight / 2;
                    pageElements.Add((element, centerX, centerY));
                }

                foreach (var (element, cx, cy) in pageElements)
                {
                    for (int i = 0; i < areas.Count; i++)
                    {
                        var ab = areas[i].BoundingBox;
                        var areaLeft = ab.Left;
                        var areaRight = ab.Left + ab.Width;
                        var areaBottom = ab.Top - ab.Height;
                        var areaTop = ab.Top;

                        if (cx >= areaLeft && cx <= areaRight && cy >= areaBottom && cy <= areaTop)
                        {
                            areaElements[i].Add(element);
                            break;
                        }
                    }

                }
            }

            // Step 4: Group elements into sections within each area
            var populatedAreas = new List<DetectedArea>();
            for (int i = 0; i < areas.Count; i++)
            {
                var elems = areaElements[i];
                areas[i].TotalElements = elems.Count;
                areas[i].Sections = GroupIntoSections(elems, areas[i].SectionPattern);
                diagnostics.ElementsInAreas += elems.Count;

                if (elems.Count > 0)
                    populatedAreas.Add(areas[i]);
            }
            areas = populatedAreas;

            result.Pages.Add(new PageAreas
            {
                Page = pageNum,
                Areas = areas
            });

            diagnostics.AreasDetected += areas.Count;
        }

        result.Diagnostics = diagnostics;
        return result;
    }

    /// <summary>
    /// Detects significant filled rectangles on a page using PdfPig's ExperimentalAccess.Paths.
    /// Filters out page-covering backgrounds and small decorative shapes.
    /// </summary>
    private static List<DetectedArea> DetectPageFilledRects(Page page, int pageNum, AreaDiagnosticInfo diagnostics)
    {
        var areas = new List<DetectedArea>();

        var paths = page.ExperimentalAccess.Paths;
        diagnostics.TotalPathsFound += paths.Count;

        var pageWidth = page.Width;
        var pageHeight = page.Height;
        var pageArea = pageWidth * pageHeight;

        foreach (var path in paths)
        {
            // Only interested in filled paths (not strokes)
            if (path.FillColor == null)
                continue;

            var rect = path.GetBoundingRectangle();
            if (!rect.HasValue)
                continue;

            var r = rect.Value;
            var rectWidth = r.Width;
            var rectHeight = r.Height;

            // Rule 3: Area noise filtering — stricter thresholds to reduce
            // decorative rectangles being detected as content areas.
            var rectArea = rectWidth * rectHeight;

            // Filter: too small — must be at least 2% of page area
            // (previously 80x80 which let through many decorative shapes)
            if (rectArea < pageArea * 0.02)
                continue;

            // Filter: too narrow or too short to contain meaningful content
            if (rectWidth < 80 || rectHeight < 40)
                continue;

            // Filter: covers >90% of page (page background)
            if (rectArea > pageArea * 0.9)
                continue;

            areas.Add(new DetectedArea
            {
                Color = ConvertColorToHex(path.FillColor),
                Page = pageNum,
                BoundingBox = new ElementBoundingBox
                {
                    Left = Math.Round(r.Left, 1),
                    Top = Math.Round(r.Top, 1),
                    Width = Math.Round(r.Width, 1),
                    Height = Math.Round(r.Height, 1)
                }
            });
        }

        diagnostics.PathsAfterFiltering += areas.Count;
        return areas;
    }

    /// <summary>
    /// Groups elements into sections based on the provided section pattern.
    ///
    /// Three modes:
    /// 1. sectionPattern is null → backwards-compatible auto-detect using bodySize * 1.15 threshold
    /// 2. sectionPattern has empty conditions → one flat section (no grouping)
    /// 3. sectionPattern has conditions → evaluate conditions against each element to find section headings
    ///
    /// In all heading modes, each heading + following non-heading elements = one section.
    /// Elements before the first heading become a preamble section (heading = null).
    /// </summary>
    private static List<DetectedSection> GroupIntoSections(List<AreaElement> elements, SectionPattern? sectionPattern)
    {
        if (elements.Count == 0)
            return new List<DetectedSection>();

        // Mode 2: Explicit flat section — no headings
        if (sectionPattern != null && sectionPattern.Conditions.Count == 0)
        {
            return new List<DetectedSection>
            {
                new DetectedSection { Heading = null, Children = new List<AreaElement>(elements) }
            };
        }

        // Determine which elements are headings
        Func<AreaElement, bool> isHeading;

        if (sectionPattern != null && sectionPattern.Conditions.Count > 0)
        {
            // Mode 3: User-defined pattern — evaluate conditions
            isHeading = el => MatchesAllConditions(el, sectionPattern.Conditions);
        }
        else
        {
            // Mode 1: Auto-detect using bodySize * 1.15 threshold (backwards compat)
            var fontSizeCounts = new Dictionary<double, int>();
            foreach (var el in elements)
            {
                var size = Math.Round(el.FontSize, 1);
                fontSizeCounts[size] = fontSizeCounts.GetValueOrDefault(size) + 1;
            }

            var bodySize = fontSizeCounts.OrderByDescending(kvp => kvp.Value).First().Key;
            var headingThreshold = bodySize * 1.15;

            // If no elements exceed the threshold, return flat section
            var hasHeadings = elements.Any(el => Math.Round(el.FontSize, 1) > headingThreshold);
            if (!hasHeadings)
            {
                return new List<DetectedSection>
                {
                    new DetectedSection { Heading = null, Children = new List<AreaElement>(elements) }
                };
            }

            isHeading = el => Math.Round(el.FontSize, 1) > headingThreshold;
        }

        // Walk elements: headings start new sections
        var sections = new List<DetectedSection>();
        var current = new DetectedSection();

        foreach (var el in elements)
        {
            if (isHeading(el))
            {
                // This element is a heading — push current and start new section
                if (current.Heading != null || current.Children.Count > 0)
                    sections.Add(current);

                current = new DetectedSection { Heading = el, Children = new List<AreaElement>() };
            }
            else
            {
                current.Children.Add(el);
            }
        }

        // Push final section
        if (current.Heading != null || current.Children.Count > 0)
            sections.Add(current);

        return sections;
    }

    /// <summary>
    /// Evaluates whether an element matches ALL conditions in a list (AND logic).
    /// Used by both SectionPattern (area-level) and SectionRules (section-level).
    /// </summary>
    internal static bool MatchesAllConditions(AreaElement element, List<RuleCondition> conditions)
    {
        foreach (var condition in conditions)
        {
            if (!MatchesCondition(element, condition))
                return false;
        }
        return true;
    }

    /// <summary>
    /// Evaluates whether an element matches ALL conditions, with position context.
    /// Supports positionFirst/positionLast conditions that need element index.
    /// </summary>
    internal static bool MatchesAllConditions(AreaElement element, List<RuleCondition> conditions, int index, int total)
    {
        foreach (var condition in conditions)
        {
            if (!MatchesCondition(element, condition, index, total))
                return false;
        }
        return true;
    }

    /// <summary>
    /// Evaluates a single condition against an element.
    /// </summary>
    private static bool MatchesCondition(AreaElement element, RuleCondition condition)
    {
        return MatchesCondition(element, condition, -1, -1);
    }

    /// <summary>
    /// Evaluates a single condition against an element, with optional position context.
    /// </summary>
    internal static bool MatchesCondition(AreaElement element, RuleCondition condition, int index, int total)
    {
        var valueStr = condition.Value?.ToString() ?? string.Empty;

        return condition.Type switch
        {
            // Text conditions
            "textBeginsWith" => element.Text.StartsWith(valueStr, StringComparison.OrdinalIgnoreCase),
            "textEndsWith" => element.Text.EndsWith(valueStr, StringComparison.OrdinalIgnoreCase),
            "textContains" => element.Text.Contains(valueStr, StringComparison.OrdinalIgnoreCase),
            "textEquals" => element.Text.Equals(valueStr, StringComparison.OrdinalIgnoreCase),
            "textMatchesPattern" => Regex.IsMatch(element.Text, valueStr, RegexOptions.IgnoreCase),

            // Font size conditions
            "fontSizeEquals" => Math.Abs(element.FontSize - ParseDouble(valueStr)) <= 0.5,
            "fontSizeAbove" => element.FontSize > ParseDouble(valueStr),
            "fontSizeBelow" => element.FontSize < ParseDouble(valueStr),
            "fontSizeRange" => ParseFontSizeRange(condition.Value, element.FontSize),

            // Font name conditions
            "fontNameContains" => element.FontName.Contains(valueStr, StringComparison.OrdinalIgnoreCase),
            "fontNameEquals" => element.FontName.Equals(valueStr, StringComparison.OrdinalIgnoreCase),

            // Color conditions
            "colorEquals" => element.Color.Equals(valueStr, StringComparison.OrdinalIgnoreCase),

            // Position conditions (require index context)
            "positionFirst" => index == 0,
            "positionLast" => index >= 0 && index == total - 1,

            // HTML-specific conditions (web sources)
            "htmlTagEquals" => element.HtmlTag.Equals(valueStr, StringComparison.OrdinalIgnoreCase),
            "cssClassContains" => element.CssClasses.Contains(valueStr, StringComparison.OrdinalIgnoreCase),
            "htmlContainerPathContains" => element.HtmlContainerPath.Contains(valueStr, StringComparison.OrdinalIgnoreCase),

            // Bold detection (web sources — <strong>/<b> or CSS font-weight)
            "isBoldEquals" => element.IsBold == valueStr.Equals("true", StringComparison.OrdinalIgnoreCase),

            _ => false // Unknown condition type — does not match
        };
    }

    private static double ParseDouble(string value)
    {
        return double.TryParse(value, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var result) ? result : 0;
    }

    /// <summary>
    /// Parses a fontSizeRange condition value (object with min/max) and checks if fontSize is within range.
    /// Accepts JSON object like {"min":25,"max":35} or already-deserialized JsonElement.
    /// </summary>
    private static bool ParseFontSizeRange(object? value, double fontSize)
    {
        if (value is null) return false;

        try
        {
            System.Text.Json.JsonElement json;
            if (value is System.Text.Json.JsonElement je)
            {
                json = je;
            }
            else
            {
                var str = value.ToString();
                if (string.IsNullOrEmpty(str)) return false;
                json = System.Text.Json.JsonDocument.Parse(str).RootElement;
            }

            if (json.TryGetProperty("min", out var minProp) && json.TryGetProperty("max", out var maxProp))
            {
                var min = minProp.GetDouble();
                var max = maxProp.GetDouble();
                return fontSize >= min && fontSize <= max;
            }
        }
        catch
        {
            // Malformed value — does not match
        }

        return false;
    }

    private static RichExtractionResult ExtractRichDumpFromDocument(PdfDocument document, List<int>? includePages = null)
    {
        if (document.NumberOfPages == 0)
        {
            return new RichExtractionResult { Error = "PDF has no pages" };
        }

        var elements = new List<ExtractionElement>();
        var elementIndex = 0;

        for (int pageNum = 1; pageNum <= document.NumberOfPages; pageNum++)
        {
            // Skip pages not in the include list (if specified)
            if (includePages != null && !includePages.Contains(pageNum))
                continue;
            var page = document.GetPage(pageNum);
            var lines = ExtractRichTextLines(page);

            foreach (var line in lines)
            {
                elementIndex++;
                elements.Add(new ExtractionElement
                {
                    Id = $"p{pageNum}-e{elementIndex}",
                    Page = pageNum,
                    Text = line.Text,
                    Metadata = new ElementMetadata
                    {
                        FontSize = Math.Round(line.FontSize, 1),
                        FontName = line.FontName,
                        Position = new ElementPosition
                        {
                            X = Math.Round(line.BoundingBoxLeft, 1),
                            Y = Math.Round(line.BoundingBoxTop, 1)
                        },
                        BoundingBox = new ElementBoundingBox
                        {
                            Left = Math.Round(line.BoundingBoxLeft, 1),
                            Top = Math.Round(line.BoundingBoxTop, 1),
                            Width = Math.Round(line.BoundingBoxWidth, 1),
                            Height = Math.Round(line.BoundingBoxHeight, 1)
                        },
                        Color = line.Color
                    }
                });
            }
        }

        return new RichExtractionResult
        {
            SourceType = "pdf",
            Source = new ExtractionSource
            {
                TotalPages = document.NumberOfPages,
                ExtractedPages = includePages,
                ExtractedDate = DateTime.UtcNow
            },
            Elements = elements
        };
    }

    /// <summary>
    /// Extracts text lines from a page with full metadata from PdfPig's Letter objects.
    /// Convenience overload that extracts all words from the page.
    /// </summary>
    private static List<RichTextLine> ExtractRichTextLines(Page page)
    {
        return ExtractRichTextLines(page.GetWords().ToList());
    }

    /// <summary>
    /// Extracts text lines from a list of words with full metadata from PdfPig's Letter objects.
    /// Unlike ExtractTextLines which only captures Y, Text, and average font size,
    /// this method captures font name, point size, color, and precise bounding boxes.
    /// Words are grouped into lines by Y-coordinate, split at column boundaries, and
    /// merged when they share font metadata (continuation lines).
    /// </summary>
    private static List<RichTextLine> ExtractRichTextLines(List<Word> words)
    {
        if (words.Count == 0)
            return new List<RichTextLine>();

        // Group words into lines by Y-coordinate (same logic as ExtractTextLines)
        var lines = new List<RichTextLine>();
        var sortedWords = words.OrderByDescending(w => w.BoundingBox.Bottom).ToList();
        const double yTolerance = 5.0;

        foreach (var word in sortedWords)
        {
            var existingLine = lines.FirstOrDefault(l =>
                Math.Abs(l.Y - word.BoundingBox.Bottom) < yTolerance);

            if (existingLine != null)
            {
                existingLine.Words.Add(word);
            }
            else
            {
                lines.Add(new RichTextLine
                {
                    Y = word.BoundingBox.Bottom,
                    Words = new List<Word> { word }
                });
            }
        }

        // Rule 1: Column-aware line splitting — detect column boundaries from word
        // positions across the entire page, then split lines at those boundaries.
        // Uses a projection profile: for each X position, count how many words cover it.
        // The widest uncovered gap (away from margins) is the column boundary.
        // This replaces the previous fixed 40pt threshold with data-driven detection
        // that works even for narrow column gaps (e.g., 15-20pt on page 2 of Dresden PDF).
        var columnBoundaries = DetectColumnBoundaries(words);
        const double fallbackGapThreshold = 40.0; // pts — fallback for gaps not caught by column detection

        var splitLines = new List<RichTextLine>();
        foreach (var line in lines)
        {
            line.Words = line.Words.OrderBy(w => w.BoundingBox.Left).ToList();

            var currentWords = new List<Word> { line.Words[0] };
            for (int i = 1; i < line.Words.Count; i++)
            {
                var prevRight = line.Words[i - 1].BoundingBox.Right;
                var nextLeft = line.Words[i].BoundingBox.Left;
                var gap = nextLeft - prevRight;

                bool shouldSplit = false;

                // Split if a detected column boundary falls between these words
                foreach (var boundary in columnBoundaries)
                {
                    if (prevRight < boundary && nextLeft > boundary)
                    {
                        shouldSplit = true;
                        break;
                    }
                }

                // Fallback: also split at large gaps (original Rule 1 behaviour)
                if (!shouldSplit && gap > fallbackGapThreshold)
                    shouldSplit = true;

                if (shouldSplit)
                {
                    splitLines.Add(new RichTextLine
                    {
                        Y = line.Y,
                        Words = new List<Word>(currentWords)
                    });
                    currentWords = new List<Word> { line.Words[i] };
                }
                else
                {
                    currentWords.Add(line.Words[i]);
                }
            }
            splitLines.Add(new RichTextLine
            {
                Y = line.Y,
                Words = currentWords
            });
        }

        // Process each line: compute text, bounding box, and font metadata
        foreach (var line in splitLines)
        {
            line.Text = string.Join(" ", line.Words.Select(w => w.Text));

            // Bounding box enclosing all words
            line.BoundingBoxLeft = line.Words.Min(w => w.BoundingBox.Left);
            line.BoundingBoxTop = line.Words.Max(w => w.BoundingBox.Top);
            line.BoundingBoxWidth = line.Words.Max(w => w.BoundingBox.Right) - line.BoundingBoxLeft;
            line.BoundingBoxHeight = line.BoundingBoxTop - line.Words.Min(w => w.BoundingBox.Bottom);

            // Font name from first word
            line.FontName = line.Words.First().FontName ?? string.Empty;

            // Font size: use Letter.PointSize from first letter (actual font size in points)
            var firstLetter = line.Words.SelectMany(w => w.Letters).FirstOrDefault();
            if (firstLetter != null)
            {
                line.FontSize = firstLetter.PointSize;
                line.Color = ConvertColorToHex(firstLetter.Color);
            }
            else
            {
                // Fallback to bounding box height estimate
                line.FontSize = line.Words.Average(w => w.BoundingBox.Height);
                line.Color = "#000000";
            }
        }

        // Rule 2: Continuation line merging — merge consecutive lines that are
        // part of the same logical element (wrapped bullets, paragraph text).
        // Lines merge when they have matching font metadata and the continuation
        // line doesn't start with a bullet character.
        var bulletChars = new HashSet<char> { '•', '●', '○', '■', '□', '▪', '▫', '◆', '◇', '►', '▸', '\u2022' };
        const double fontSizeTolerance = 0.5;
        const double xAlignmentTolerance = 10.0; // pts — continuation lines may indent slightly

        // Sort by column bucket, then Y descending (top to bottom) before merging.
        // After column splitting, lines from different columns can share the same Y.
        // Without column-aware sorting, they interleave and break consecutive merging.
        // E.g., sidebar line at Y=500 sits between two body lines at Y=500 and Y=490,
        // preventing the body lines from merging into a paragraph.
        splitLines = splitLines
            .OrderBy(l => GetColumnBucket(l.BoundingBoxLeft, columnBoundaries))
            .ThenByDescending(l => l.Y)
            .ToList();

        var mergedLines = new List<RichTextLine>();
        for (int i = 0; i < splitLines.Count; i++)
        {
            var current = splitLines[i];

            // Try to merge subsequent lines into current
            while (i + 1 < splitLines.Count)
            {
                var next = splitLines[i + 1];
                var nextText = next.Text.TrimStart();

                // Don't merge if next line starts with a bullet character
                if (nextText.Length > 0 && bulletChars.Contains(nextText[0]))
                    break;

                // Don't merge if font metadata doesn't match
                if (Math.Abs(current.FontSize - next.FontSize) > fontSizeTolerance)
                    break;
                if (current.FontName != next.FontName)
                    break;
                if (current.Color != next.Color)
                    break;

                // Don't merge if X positions are too far apart (different columns/indents)
                if (Math.Abs(current.BoundingBoxLeft - next.BoundingBoxLeft) > xAlignmentTolerance)
                    break;

                // Merge: append text and extend bounding box
                current.Text = current.Text + " " + next.Text;
                current.Words.AddRange(next.Words);
                current.BoundingBoxWidth = Math.Max(
                    current.BoundingBoxLeft + current.BoundingBoxWidth,
                    next.BoundingBoxLeft + next.BoundingBoxWidth) - current.BoundingBoxLeft;
                var newBottom = Math.Min(
                    current.BoundingBoxTop - current.BoundingBoxHeight,
                    next.BoundingBoxTop - next.BoundingBoxHeight);
                current.BoundingBoxHeight = current.BoundingBoxTop - newBottom;

                i++; // skip the merged line
            }

            mergedLines.Add(current);
        }

        // Sort lines top to bottom (higher Y = top in PDF coordinates)
        return mergedLines.OrderByDescending(l => l.Y).ToList();
    }

    /// <summary>
    /// Detects column boundaries on a page by analysing word X-positions.
    /// Uses a projection profile: for each X position across the page, count how
    /// many words cover it. Gaps in coverage (where no words exist) that exceed a
    /// minimum width indicate column boundaries.
    /// Returns the midpoint X of each detected gap, sorted left to right.
    /// </summary>
    private static List<double> DetectColumnBoundaries(List<Word> words)
    {
        if (words.Count < 2)
            return new List<double>();

        // Get page extent from word positions
        var minX = words.Min(w => w.BoundingBox.Left);
        var maxX = words.Max(w => w.BoundingBox.Right);
        var pageWidth = maxX - minX;

        if (pageWidth < 50) // too narrow to have columns
            return new List<double>();

        // Build a 1D projection profile at 1pt resolution
        // Each bucket counts how many words span that X position
        var resolution = 1.0; // 1 point per bucket
        var bucketCount = (int)Math.Ceiling(pageWidth / resolution) + 1;
        var profile = new int[bucketCount];

        foreach (var word in words)
        {
            var left = (int)Math.Floor((word.BoundingBox.Left - minX) / resolution);
            var right = (int)Math.Ceiling((word.BoundingBox.Right - minX) / resolution);
            left = Math.Max(0, Math.Min(left, bucketCount - 1));
            right = Math.Max(0, Math.Min(right, bucketCount - 1));

            for (int i = left; i <= right; i++)
                profile[i]++;
        }

        // Find gaps (runs of zero coverage) that could be column boundaries
        // Exclude margins: skip the first and last 5% of the page
        var marginBuckets = (int)(bucketCount * 0.05);
        var startBucket = marginBuckets;
        var endBucket = bucketCount - marginBuckets;

        const double minGapWidth = 8.0; // pts — minimum gap to qualify as a column boundary

        var gaps = new List<(int start, int end, double width)>();
        int gapStart = -1;

        for (int i = startBucket; i < endBucket; i++)
        {
            if (profile[i] == 0)
            {
                if (gapStart < 0)
                    gapStart = i;
            }
            else
            {
                if (gapStart >= 0)
                {
                    var gapWidth = (i - gapStart) * resolution;
                    if (gapWidth >= minGapWidth)
                        gaps.Add((gapStart, i, gapWidth));
                    gapStart = -1;
                }
            }
        }

        // Handle gap running to the end of the scan range
        if (gapStart >= 0)
        {
            var gapWidth = (endBucket - gapStart) * resolution;
            if (gapWidth >= minGapWidth)
                gaps.Add((gapStart, endBucket, gapWidth));
        }

        if (gaps.Count == 0)
            return new List<double>();

        // Return midpoints of detected gaps, converted back to page coordinates
        return gaps
            .OrderByDescending(g => g.width) // widest gaps first (most likely real column boundaries)
            .Take(3) // max 3 column boundaries (4 columns — very unlikely to need more)
            .Select(g => minX + ((g.start + g.end) / 2.0) * resolution)
            .OrderBy(x => x) // left to right
            .ToList();
    }

    /// <summary>
    /// Returns which column a line belongs to based on its X position and the detected
    /// column boundaries. Column 0 is left of the first boundary, column 1 between
    /// first and second, etc. Used to group same-column lines for continuation merging.
    /// </summary>
    private static int GetColumnBucket(double x, List<double> boundaries)
    {
        for (int i = 0; i < boundaries.Count; i++)
        {
            if (x < boundaries[i])
                return i;
        }
        return boundaries.Count;
    }

    /// <summary>
    /// Converts a PdfPig IColor to a hex string (e.g., "#1A3C6E").
    /// Handles RGB, Grayscale, and CMYK color spaces.
    /// </summary>
    private static string ConvertColorToHex(UglyToad.PdfPig.Graphics.Colors.IColor? color)
    {
        if (color == null)
            return "#000000";

        var rgb = color.ToRGBValues();
        var r = (byte)(rgb.r * 255);
        var g = (byte)(rgb.g * 255);
        var b = (byte)(rgb.b * 255);
        return $"#{r:X2}{g:X2}{b:X2}";
    }

    /// <summary>
    /// Rich text line with full metadata, used by ExtractRichTextLines.
    /// </summary>
    private class RichTextLine
    {
        public double Y { get; set; }
        public List<Word> Words { get; set; } = new();
        public string Text { get; set; } = string.Empty;
        public double FontSize { get; set; }
        public string FontName { get; set; } = string.Empty;
        public string Color { get; set; } = "#000000";
        public double BoundingBoxLeft { get; set; }
        public double BoundingBoxTop { get; set; }
        public double BoundingBoxWidth { get; set; }
        public double BoundingBoxHeight { get; set; }
    }

    private static ExtractionResult ExtractSectionsFromDocument(PdfDocument document, PdfExtractionRules rules)
    {
        if (document.NumberOfPages == 0)
        {
            return new ExtractionResult { Error = "PDF has no pages" };
        }

        var filterToMainColumn = rules.ColumnDetection?.Enabled ?? true;

        // Extract title and description from page 1 WITHOUT column filtering.
        // Titles typically span the full page width and column filtering clips them.
        var firstPageLines = ExtractTextLines(document.GetPage(1), filterToMainColumn: false);

        // Extract content from all pages WITH column filtering (excludes sidebar text)
        var allLines = new List<TextLine>();
        for (int pageNum = 1; pageNum <= document.NumberOfPages; pageNum++)
        {
            var page = document.GetPage(pageNum);
            var pageLines = ExtractTextLines(page, filterToMainColumn: filterToMainColumn);
            allLines.AddRange(pageLines);
        }

        if (firstPageLines.Count == 0 && allLines.Count == 0)
        {
            return new ExtractionResult { Error = "No text found in PDF" };
        }

        var rawText = string.Join("\n", allLines.Select(l => $"[{l.AverageFontSize:F1}] {l.Text}"));

        // Use first page unfiltered lines for title/description font analysis
        var fontSizes = firstPageLines.Where(l => !string.IsNullOrWhiteSpace(l.Text))
                                .Select(l => l.AverageFontSize)
                                .OrderByDescending(s => s)
                                .ToList();

        if (fontSizes.Count == 0)
        {
            return new ExtractionResult { Error = "No text with measurable font found" };
        }

        var maxFontSize = fontSizes.First();
        var titleThreshold = maxFontSize * (rules.TitleDetection?.FontSizeThreshold ?? 0.85);

        // Build patterns from rules
        Regex? startPattern = null;
        if (!string.IsNullOrEmpty(rules.Content?.StartPattern))
        {
            startPattern = new Regex(rules.Content.StartPattern, RegexOptions.IgnoreCase);
        }

        Regex? descriptionRegex = null;
        if (!string.IsNullOrEmpty(rules.DescriptionPattern))
        {
            descriptionRegex = new Regex(rules.DescriptionPattern, RegexOptions.IgnoreCase);
        }

        var stopPatterns = rules.Content?.StopPatterns ?? new List<string>();
        var headingPrefix = (rules.Content?.HeadingLevel ?? "h2") switch
        {
            "h1" => "#",
            "h2" => "##",
            "h3" => "###",
            "h4" => "####",
            _ => "##"
        };

        // Step 1: Extract title and description from first page (unfiltered lines)
        string title = string.Empty;
        string description = string.Empty;
        bool foundTitle = false;
        bool foundDescription = false;

        foreach (var line in firstPageLines)
        {
            var text = line.Text.Trim();
            if (string.IsNullOrWhiteSpace(text))
                continue;

            // Extract title (largest font at top)
            if (!foundTitle && line.AverageFontSize >= titleThreshold)
            {
                title = string.IsNullOrEmpty(title) ? text : $"{title} {text}";
                continue;
            }
            else if (!string.IsNullOrEmpty(title) && !foundTitle)
            {
                foundTitle = true;
            }

            // Extract description by pattern
            if (!foundDescription && descriptionRegex != null && descriptionRegex.IsMatch(text))
            {
                description = text;
                foundDescription = true;
                continue;
            }
        }

        // Step 2: Extract content from all pages (column-filtered lines)
        var markdown = new System.Text.StringBuilder();
        var currentParagraph = new System.Text.StringBuilder();
        bool foundContentStart = false;

        foreach (var line in allLines)
        {
            var text = line.Text.Trim();
            if (string.IsNullOrWhiteSpace(text))
                continue;

            var textLower = text.ToLowerInvariant();

            // Check stop patterns after content has started
            if (foundContentStart && stopPatterns.Any(p => textLower.Contains(p)))
                break;

            // Check for content start pattern
            if (startPattern != null && startPattern.IsMatch(text))
            {
                foundContentStart = true;

                // Flush current paragraph
                if (currentParagraph.Length > 0)
                {
                    markdown.AppendLine(currentParagraph.ToString().Trim());
                    markdown.AppendLine();
                    currentParagraph.Clear();
                }

                markdown.AppendLine($"{headingPrefix} {text}");
                markdown.AppendLine();
            }
            else if (foundContentStart)
            {
                if (currentParagraph.Length > 0)
                    currentParagraph.Append(' ');
                currentParagraph.Append(text);
            }
        }

        // Flush final paragraph
        if (currentParagraph.Length > 0)
        {
            markdown.AppendLine(currentParagraph.ToString().Trim());
        }

        var sections = new Dictionary<string, string>
        {
            ["title"] = title,
            ["description"] = description,
            ["content"] = markdown.ToString().Trim()
        };

        return new ExtractionResult
        {
            Sections = sections,
            RawText = rawText
        };
    }

    /// <summary>
    /// Strategy-driven extraction using SourceConfig section definitions.
    /// Each section is extracted according to its strategy and keyed by its key property.
    /// </summary>
    private static ExtractionResult ExtractSectionsFromSourceConfig(PdfDocument document, SourceConfig sourceConfig)
    {
        if (document.NumberOfPages == 0)
        {
            return new ExtractionResult { Error = "PDF has no pages" };
        }

        var sections = new Dictionary<string, string>();
        var globalColumnFilter = sourceConfig.Globals?.ColumnDetection?.Enabled ?? true;

        // Pre-extract text lines for different page/column filter combinations
        var pageCache = new Dictionary<(int, bool), List<TextLine>>();

        List<TextLine> GetLinesForPages(Pages pages, bool columnFilter)
        {
            var result = new List<TextLine>();
            var pageNumbers = pages.IsAll
                ? Enumerable.Range(1, document.NumberOfPages)
                : (pages.PageNumbers ?? new List<int>());

            foreach (var pageNum in pageNumbers)
            {
                if (pageNum < 1 || pageNum > document.NumberOfPages)
                    continue;

                var key = (pageNum, columnFilter);
                if (!pageCache.TryGetValue(key, out var cachedLines))
                {
                    cachedLines = ExtractTextLines(document.GetPage(pageNum), filterToMainColumn: columnFilter);
                    pageCache[key] = cachedLines;
                }
                result.AddRange(cachedLines);
            }
            return result;
        }

        // Process each section according to its strategy
        foreach (var section in sourceConfig.Sections)
        {
            var useColumnFilter = section.ColumnFilter ?? globalColumnFilter;
            var lines = GetLinesForPages(section.Pages, useColumnFilter);

            string extractedValue = section.Strategy switch
            {
                "largestFont" => ExtractByLargestFont(lines, section),
                "regex" => ExtractByRegex(lines, section),
                "betweenPatterns" => ExtractBetweenPatterns(lines, section),
                _ => string.Empty
            };

            sections[section.Key] = extractedValue;
        }

        // Build raw text for debugging
        var allLines = GetLinesForPages(new Pages { IsAll = true }, false);
        var rawText = string.Join("\n", allLines.Select(l => $"[{l.AverageFontSize:F1}] {l.Text}"));

        return new ExtractionResult
        {
            Sections = sections,
            RawText = rawText
        };
    }

    /// <summary>
    /// Extracts text using the largestFont strategy (title detection).
    /// </summary>
    private static string ExtractByLargestFont(List<TextLine> lines, SourceSection section)
    {
        if (lines.Count == 0) return string.Empty;

        var fontSizes = lines
            .Where(l => !string.IsNullOrWhiteSpace(l.Text))
            .Select(l => l.AverageFontSize)
            .OrderByDescending(s => s)
            .ToList();

        if (fontSizes.Count == 0) return string.Empty;

        var maxFontSize = fontSizes.First();
        var threshold = maxFontSize * (section.StrategyParams?.FontSizeThreshold ?? 0.85);

        var titleParts = new List<string>();
        bool foundTitleEnd = false;

        foreach (var line in lines)
        {
            var text = line.Text.Trim();
            if (string.IsNullOrWhiteSpace(text)) continue;

            if (!foundTitleEnd && line.AverageFontSize >= threshold)
            {
                titleParts.Add(text);
            }
            else if (titleParts.Count > 0)
            {
                foundTitleEnd = true;
                break;
            }
        }

        return string.Join(" ", titleParts);
    }

    /// <summary>
    /// Extracts text using the regex strategy (pattern matching).
    /// </summary>
    private static string ExtractByRegex(List<TextLine> lines, SourceSection section)
    {
        if (lines.Count == 0 || string.IsNullOrEmpty(section.StrategyParams?.Pattern))
            return string.Empty;

        var options = RegexOptions.None;
        if (section.StrategyParams?.Flags?.Contains("i") == true)
            options |= RegexOptions.IgnoreCase;

        var regex = new Regex(section.StrategyParams!.Pattern, options);

        foreach (var line in lines)
        {
            var text = line.Text.Trim();
            if (string.IsNullOrWhiteSpace(text)) continue;

            var match = regex.Match(text);
            if (match.Success)
            {
                var captureGroup = section.StrategyParams.CaptureGroup ?? 0;
                return match.Groups.Count > captureGroup
                    ? match.Groups[captureGroup].Value
                    : match.Value;
            }
        }

        return string.Empty;
    }

    /// <summary>
    /// Extracts text using the betweenPatterns strategy (content between start and stop markers).
    /// </summary>
    private static string ExtractBetweenPatterns(List<TextLine> lines, SourceSection section)
    {
        if (lines.Count == 0 || string.IsNullOrEmpty(section.StrategyParams?.StartPattern))
            return string.Empty;

        var startPattern = new Regex(section.StrategyParams.StartPattern, RegexOptions.IgnoreCase);
        var stopPatterns = section.StrategyParams.StopPatterns ?? new List<string>();
        var includeStartLine = section.StrategyParams.IncludeStartLine ?? true;
        var headingPrefix = (section.StrategyParams.HeadingLevel ?? "h2") switch
        {
            "h1" => "#",
            "h2" => "##",
            "h3" => "###",
            "h4" => "####",
            _ => "##"
        };

        // Common bullet characters used in PDFs
        var bulletChars = new[] { '•', '●', '○', '■', '□', '▪', '▫', '◆', '◇', '►', '▸' };

        var markdown = new System.Text.StringBuilder();
        var currentParagraph = new System.Text.StringBuilder();
        bool foundStart = false;

        foreach (var line in lines)
        {
            var text = line.Text.Trim();
            if (string.IsNullOrWhiteSpace(text)) continue;

            var textLower = text.ToLowerInvariant();

            // Check stop patterns after content has started
            if (foundStart && stopPatterns.Any(p => textLower.Contains(p.ToLowerInvariant())))
                break;

            // Check for start pattern
            if (startPattern.IsMatch(text))
            {
                if (!foundStart)
                {
                    foundStart = true;
                }

                // Flush current paragraph before new heading
                if (currentParagraph.Length > 0)
                {
                    markdown.AppendLine(FlushParagraphWithBullets(currentParagraph.ToString(), bulletChars));
                    markdown.AppendLine();
                    currentParagraph.Clear();
                }

                if (includeStartLine)
                {
                    markdown.AppendLine($"{headingPrefix} {text}");
                    markdown.AppendLine();
                }
            }
            else if (foundStart)
            {
                if (currentParagraph.Length > 0)
                    currentParagraph.Append(' ');
                currentParagraph.Append(text);
            }
        }

        // Flush final paragraph
        if (currentParagraph.Length > 0)
        {
            markdown.AppendLine(FlushParagraphWithBullets(currentParagraph.ToString(), bulletChars));
        }

        return markdown.ToString().Trim();
    }

    /// <summary>
    /// Converts text containing bullet characters into markdown list items.
    /// If no bullets found, returns the text as-is (trimmed).
    /// </summary>
    private static string FlushParagraphWithBullets(string text, char[] bulletChars)
    {
        text = text.Trim();
        if (string.IsNullOrEmpty(text))
            return string.Empty;

        // Check if text contains any bullet characters
        if (!bulletChars.Any(b => text.Contains(b)))
            return text;

        // Split on bullet characters and convert to markdown list
        var parts = text.Split(bulletChars, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length <= 1)
            return text;

        var sb = new System.Text.StringBuilder();
        foreach (var part in parts)
        {
            var item = part.Trim();
            if (!string.IsNullOrEmpty(item))
            {
                sb.AppendLine($"- {item}");
            }
        }
        return sb.ToString().TrimEnd();
    }

    private static PdfMarkdownResult ExtractMarkdownFromDocument(PdfDocument document)
    {
        if (document.NumberOfPages == 0)
        {
            return new PdfMarkdownResult { Error = "PDF has no pages" };
        }

        // Collect text lines from all pages, filtering to main column only (excludes sidebar)
        var allLines = new List<TextLine>();
        for (int pageNum = 1; pageNum <= document.NumberOfPages; pageNum++)
        {
            var page = document.GetPage(pageNum);
            var pageLines = ExtractTextLines(page, filterToMainColumn: true);
            allLines.AddRange(pageLines);
        }

        if (allLines.Count == 0)
        {
            return new PdfMarkdownResult { Error = "No text found in PDF" };
        }

        // Build raw text for debugging
        var rawText = string.Join("\n", allLines.Select(l => $"[{l.AverageFontSize:F1}] {l.Text}"));

        // Determine font size thresholds
        var fontSizes = allLines.Where(l => !string.IsNullOrWhiteSpace(l.Text))
                                .Select(l => l.AverageFontSize)
                                .OrderByDescending(s => s)
                                .ToList();

        if (fontSizes.Count == 0)
        {
            return new PdfMarkdownResult { Error = "No text with measurable font found" };
        }

        var maxFontSize = fontSizes.First();
        var h1Threshold = maxFontSize * 0.85;  // Title (largest)
        var h2Threshold = maxFontSize * 0.60;  // Subheadings (Day N, etc.)

        // Patterns
        var dayPattern = new Regex(@"^Day\s+\d+", RegexOptions.IgnoreCase);
        var descriptionPattern = new Regex(@"\d+\s*days?\s+from\s+£\d+", RegexOptions.IgnoreCase);
        var stopPatterns = new[] { "terms", "conditions", "booking", "contact us", "telephone", "email:", "www.", "http", "nb:", "nb:-", "please note", "reserve the right" };

        // Extract title, subtitle, and itinerary content
        string title = string.Empty;
        string subtitle = string.Empty;
        var markdown = new System.Text.StringBuilder();
        var currentParagraph = new System.Text.StringBuilder();
        bool foundTitle = false;
        bool foundSubtitle = false;
        bool foundFirstDay = false;  // Only start capturing content from Day 1

        foreach (var line in allLines)
        {
            var text = line.Text.Trim();
            if (string.IsNullOrWhiteSpace(text))
                continue;

            var textLower = text.ToLowerInvariant();

            // Check for stop patterns (footer/disclaimer) - only after we've found Day 1
            if (foundFirstDay && stopPatterns.Any(p => textLower.Contains(p)))
                break;

            // Extract title (largest font at top)
            if (!foundTitle && line.AverageFontSize >= h1Threshold)
            {
                title = string.IsNullOrEmpty(title) ? text : $"{title} {text}";
                continue;
            }
            else if (!string.IsNullOrEmpty(title) && !foundTitle)
            {
                foundTitle = true;
            }

            // Extract subtitle (description pattern like "5 days from £889")
            if (!foundSubtitle && descriptionPattern.IsMatch(text))
            {
                subtitle = text;
                foundSubtitle = true;
                continue;
            }

            // Check if this is a Day heading - this starts the itinerary content
            if (dayPattern.IsMatch(text))
            {
                foundFirstDay = true;

                // Flush current paragraph
                if (currentParagraph.Length > 0)
                {
                    markdown.AppendLine(currentParagraph.ToString().Trim());
                    markdown.AppendLine();
                    currentParagraph.Clear();
                }

                // Add Day as H2 heading
                markdown.AppendLine($"## {text}");
                markdown.AppendLine();
            }
            else if (foundFirstDay)
            {
                // Only capture content AFTER we've found Day 1
                // Regular body text - accumulate into paragraph
                if (currentParagraph.Length > 0)
                    currentParagraph.Append(' ');
                currentParagraph.Append(text);
            }
            // Skip all other content before Day 1 (features, highlights, accommodation, etc.)
        }

        // Flush final paragraph
        if (currentParagraph.Length > 0)
        {
            markdown.AppendLine(currentParagraph.ToString().Trim());
        }

        return new PdfMarkdownResult
        {
            Title = title,
            Subtitle = subtitle,
            Markdown = markdown.ToString().Trim(),
            RawText = rawText
        };
    }

    private static PdfSectionResult ExtractSectionFromDocument(PdfDocument document, string headingText)
    {
        if (document.NumberOfPages == 0)
        {
            return new PdfSectionResult
            {
                Error = "PDF has no pages"
            };
        }

        // Collect text lines from all pages
        var allLines = new List<TextLine>();
        for (int pageNum = 1; pageNum <= document.NumberOfPages; pageNum++)
        {
            var page = document.GetPage(pageNum);
            var pageLines = ExtractTextLines(page);
            allLines.AddRange(pageLines);
        }

        if (allLines.Count == 0)
        {
            return new PdfSectionResult
            {
                Error = "No text found in PDF"
            };
        }

        // Find the line containing the heading (case-insensitive)
        var headingLineIndex = -1;
        double headingFontSize = 0;

        for (int i = 0; i < allLines.Count; i++)
        {
            if (allLines[i].Text.Contains(headingText, StringComparison.OrdinalIgnoreCase))
            {
                headingLineIndex = i;
                headingFontSize = allLines[i].AverageFontSize;
                break;
            }
        }

        if (headingLineIndex == -1)
        {
            return new PdfSectionResult
            {
                Error = $"Heading '{headingText}' not found in PDF"
            };
        }

        // Check if we're searching for a "Day N" pattern (itinerary extraction)
        var dayPattern = new Regex(@"^Day\s+\d+", RegexOptions.IgnoreCase);
        var isSearchingForDay = dayPattern.IsMatch(headingText.Trim());

        // Collect content lines - include the heading line itself for Day patterns
        var contentLines = new List<string>();

        // Include the first Day heading line
        contentLines.Add(allLines[headingLineIndex].Text.Trim());

        var fontSizeThreshold = headingFontSize * 0.95; // Headings are typically 95%+ of this heading's size

        // Patterns that indicate end of itinerary content (footer sections, disclaimers)
        var stopPatterns = new[] { "terms", "conditions", "booking", "contact us", "telephone", "email:", "www.", "http", "nb:", "nb:-", "please note", "reserve the right" };

        for (int i = headingLineIndex + 1; i < allLines.Count; i++)
        {
            var line = allLines[i];

            if (string.IsNullOrWhiteSpace(line.Text))
                continue;

            var lineText = line.Text.Trim();
            var lineTextLower = lineText.ToLowerInvariant();

            // Check if this line is a "Day N" heading (part of the itinerary)
            var isDayHeading = dayPattern.IsMatch(lineText);

            // For Day pattern searches, use different stop logic
            if (isSearchingForDay)
            {
                // Stop if we hit a footer/non-itinerary section
                if (stopPatterns.Any(p => lineTextLower.Contains(p)))
                {
                    break;
                }

                // Continue collecting all content (Day headings and descriptions)
                contentLines.Add(lineText);
            }
            else
            {
                // Standard heading-based extraction: stop at similar/larger font
                if (line.AverageFontSize >= fontSizeThreshold)
                {
                    break;
                }

                contentLines.Add(lineText);
            }
        }

        // For Day pattern content, join intelligently:
        // - Add paragraph breaks before Day headings
        // - Join other lines with spaces to form flowing paragraphs
        string finalContent;
        if (isSearchingForDay && contentLines.Count > 0)
        {
            var result = new System.Text.StringBuilder();
            for (int j = 0; j < contentLines.Count; j++)
            {
                var line = contentLines[j];
                var isDay = dayPattern.IsMatch(line);

                if (j == 0)
                {
                    result.Append(line);
                }
                else if (isDay)
                {
                    // Add double line break before Day headings for paragraph separation
                    result.Append("\n\n").Append(line);
                }
                else
                {
                    // Join regular lines with space to form flowing text
                    result.Append(' ').Append(line);
                }
            }
            finalContent = result.ToString();
        }
        else
        {
            finalContent = string.Join("\n", contentLines);
        }

        return new PdfSectionResult
        {
            Heading = allLines[headingLineIndex].Text.Trim(),
            Content = finalContent
        };
    }

    private static PdfPageProperties ExtractFromDocument(PdfDocument document)
    {
        if (document.NumberOfPages == 0)
        {
            return new PdfPageProperties
            {
                Error = "PDF has no pages"
            };
        }

        var firstPage = document.GetPage(1);
        var textLines = ExtractTextLines(firstPage);

        if (textLines.Count == 0)
        {
            return new PdfPageProperties
            {
                Error = "No text found on first page"
            };
        }

        var (title, description) = ExtractTitleAndDescription(textLines);

        return new PdfPageProperties
        {
            Title = title,
            Description = description
        };
    }

    private static List<TextLine> ExtractTextLines(Page page, bool filterToMainColumn = false)
    {
        var words = page.GetWords().ToList();
        if (words.Count == 0)
            return new List<TextLine>();

        // Detect column boundary if filtering is requested
        double mainColumnMinX = 0;
        if (filterToMainColumn)
        {
            mainColumnMinX = DetectMainColumnStart(words, page.Width);
        }

        // Filter words to main column if requested
        var filteredWords = filterToMainColumn
            ? words.Where(w => w.BoundingBox.Left >= mainColumnMinX).ToList()
            : words;

        if (filteredWords.Count == 0)
            return new List<TextLine>();

        // Group words into lines by Y-coordinate (with tolerance for slight variations)
        var lines = new List<TextLine>();
        var sortedWords = filteredWords.OrderByDescending(w => w.BoundingBox.Bottom).ToList();

        const double yTolerance = 5.0; // pixels tolerance for same line

        foreach (var word in sortedWords)
        {
            var existingLine = lines.FirstOrDefault(l =>
                Math.Abs(l.Y - word.BoundingBox.Bottom) < yTolerance);

            if (existingLine != null)
            {
                existingLine.Words.Add(word);
            }
            else
            {
                lines.Add(new TextLine
                {
                    Y = word.BoundingBox.Bottom,
                    Words = new List<Word> { word }
                });
            }
        }

        // Sort words within each line by X position (left to right)
        foreach (var line in lines)
        {
            line.Words = line.Words.OrderBy(w => w.BoundingBox.Left).ToList();
            line.Text = string.Join(" ", line.Words.Select(w => w.Text));
            line.AverageFontSize = CalculateAverageFontSize(line.Words);
        }

        // Sort lines by Y position (top to bottom - higher Y is top in PDF coordinates)
        return lines.OrderByDescending(l => l.Y).ToList();
    }

    /// <summary>
    /// Detects the X-coordinate where the main content column starts by finding gaps between columns.
    /// </summary>
    private static double DetectMainColumnStart(List<Word> words, double pageWidth)
    {
        if (words.Count == 0)
            return 0;

        // Get all unique X positions (left edge of words), rounded to reduce noise
        var xPositions = words
            .Select(w => Math.Round(w.BoundingBox.Left / 10) * 10) // Round to nearest 10
            .Distinct()
            .OrderBy(x => x)
            .ToList();

        if (xPositions.Count < 2)
            return 0;

        // Find the largest gap in X positions (indicates column boundary)
        double largestGap = 0;
        double gapStart = 0;

        for (int i = 1; i < xPositions.Count; i++)
        {
            var gap = xPositions[i] - xPositions[i - 1];
            if (gap > largestGap && gap > 30) // Minimum 30 pixels gap to be considered a column break
            {
                largestGap = gap;
                gapStart = xPositions[i - 1];
            }
        }

        // If we found a significant gap, use the right side of the gap as the main column start
        // Add a small buffer to ensure we're past the sidebar
        if (largestGap > 30)
        {
            return gapStart + (largestGap * 0.5); // Start at middle of gap
        }

        // No clear column detected, use page center as fallback
        return pageWidth * 0.35; // Assume sidebar is less than 35% of page width
    }

    private static double CalculateAverageFontSize(List<Word> words)
    {
        if (words.Count == 0)
            return 0;

        // Estimate font size from word height
        var heights = words.Select(w => w.BoundingBox.Height).ToList();
        return heights.Average();
    }

    private static (string title, string description) ExtractTitleAndDescription(List<TextLine> lines)
    {
        if (lines.Count == 0)
            return (string.Empty, string.Empty);

        // Find the largest font size (likely the title)
        var maxFontSize = lines.Max(l => l.AverageFontSize);
        var fontSizeThreshold = maxFontSize * 0.85; // Allow 15% tolerance

        // Collect title lines (largest font, consecutive from top)
        var titleLines = new List<TextLine>();
        var foundTitleEnd = false;

        foreach (var line in lines)
        {
            if (string.IsNullOrWhiteSpace(line.Text))
                continue;

            if (!foundTitleEnd && line.AverageFontSize >= fontSizeThreshold)
            {
                titleLines.Add(line);
            }
            else if (titleLines.Count > 0)
            {
                foundTitleEnd = true;
            }
        }

        // Find description: look for line with "X days from £XXX" pattern
        var descriptionPattern = new Regex(@"\d+\s*days?\s+from\s+£\d+", RegexOptions.IgnoreCase);
        var description = string.Empty;

        foreach (var line in lines)
        {
            if (string.IsNullOrWhiteSpace(line.Text))
                continue;

            if (descriptionPattern.IsMatch(line.Text))
            {
                description = line.Text.Trim();
                break;
            }
        }

        var title = string.Join(" ", titleLines.Select(l => l.Text)).Trim();

        return (title, description);
    }

    private class TextLine
    {
        public double Y { get; set; }
        public List<Word> Words { get; set; } = new();
        public string Text { get; set; } = string.Empty;
        public double AverageFontSize { get; set; }
    }
}
