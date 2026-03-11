using System.Reflection;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.DocumentLayoutAnalysis;
using UglyToad.PdfPig.DocumentLayoutAnalysis.PageSegmenter;
using UglyToad.PdfPig.DocumentLayoutAnalysis.ReadingOrderDetector;
using UglyToad.PdfPig.DocumentLayoutAnalysis.WordExtractor;

// First: discover the actual API surface
Console.WriteLine("=== API Discovery ===");
Console.WriteLine();

// Check DecorationTextBlockClassifier methods
var dType = typeof(DecorationTextBlockClassifier);
Console.WriteLine($"DecorationTextBlockClassifier methods:");
foreach (var m in dType.GetMethods(BindingFlags.Public | BindingFlags.Static))
    Console.WriteLine($"  {m.ReturnType.Name} {m.Name}({string.Join(", ", m.GetParameters().Select(p => $"{p.ParameterType.Name} {p.Name}"))})");
Console.WriteLine();

// Check nested types
Console.WriteLine($"DecorationTextBlockClassifier nested types:");
foreach (var t in dType.GetNestedTypes(BindingFlags.Public))
    Console.WriteLine($"  {t.Name}");
Console.WriteLine();

// Check UnsupervisedReadingOrderDetector
var uType = typeof(UnsupervisedReadingOrderDetector);
Console.WriteLine($"UnsupervisedReadingOrderDetector methods:");
foreach (var m in uType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly))
    Console.WriteLine($"  {m.ReturnType.Name} {m.Name}({string.Join(", ", m.GetParameters().Select(p => $"{p.ParameterType.Name} {p.Name}"))})");
Console.WriteLine();

Console.WriteLine("=== END API Discovery ===");
Console.WriteLine();

// PDF files to test
var mediaRoot = @"d:\Users\deanl\source\repos\Umbraco Extensions\UpDoc\src\UpDoc.TestSite\wwwroot\media";
var pdfs = new Dictionary<string, string>
{
    ["Liverpool"] = Path.Combine(mediaRoot, "5khnjaak", "ttm5085-kingston-liverpool-lo.pdf"),
    ["Dresden (test-01)"] = Path.Combine(mediaRoot, "zxgewmsc", "updoc-test-01.pdf"),
    ["Suffolk (test-02)"] = Path.Combine(mediaRoot, "ovjatnk1", "updoc-test-02.pdf"),
    ["Bruges"] = Path.Combine(mediaRoot, "3pobjitc", "ttm5063-wensum-flemish-bruges-antwerp-ghent-lo.pdf"),
};

foreach (var (name, pdfPath) in pdfs)
{
    Console.WriteLine(new string('=', 80));
    Console.WriteLine($"PDF: {name}");
    Console.WriteLine($"File: {Path.GetFileName(pdfPath)}");
    Console.WriteLine(new string('=', 80));

    if (!File.Exists(pdfPath))
    {
        Console.WriteLine("  FILE NOT FOUND - skipping");
        continue;
    }

    using var document = PdfDocument.Open(pdfPath);
    Console.WriteLine($"  Pages: {document.NumberOfPages}");
    Console.WriteLine();

    // =========================================================================
    // TEST 1: RecursiveXYCut — Page Segmentation
    // =========================================================================
    Console.WriteLine("--- TEST 1: RecursiveXYCut Page Segmentation ---");
    Console.WriteLine("(Segments each page into content blocks by finding whitespace gaps)");
    Console.WriteLine();

    try
    {
        for (int p = 1; p <= Math.Min(document.NumberOfPages, 2); p++)
        {
            var page = document.GetPage(p);
            var words = page.GetWords(NearestNeighbourWordExtractor.Instance);
            var blocks = RecursiveXYCut.Instance.GetBlocks(words);

            Console.WriteLine($"  Page {p}: {blocks.Count} block(s) found");
            for (int b = 0; b < blocks.Count; b++)
            {
                var block = blocks[b];
                var text = block.Text.Replace("\n", " ").Replace("\r", "");
                var preview = text.Length > 100 ? text[..100] + "..." : text;
                Console.WriteLine($"    Block {b + 1}:");
                Console.WriteLine($"      Bounds: ({block.BoundingBox.Left:F1}, {block.BoundingBox.Bottom:F1}) to ({block.BoundingBox.Right:F1}, {block.BoundingBox.Top:F1})");
                Console.WriteLine($"      Size: {block.BoundingBox.Width:F1} x {block.BoundingBox.Height:F1}");
                Console.WriteLine($"      Text: \"{preview}\"");
                Console.WriteLine();
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ERROR: {ex.GetType().Name}: {ex.Message}");
        Console.WriteLine();
    }

    // =========================================================================
    // TEST 2: DocstrumBoundingBoxes — Alternative Page Segmentation
    // =========================================================================
    Console.WriteLine("--- TEST 2: DocstrumBoundingBoxes Page Segmentation ---");
    Console.WriteLine("(Bottom-up clustering — handles rotated text and complex layouts)");
    Console.WriteLine();

    try
    {
        for (int p = 1; p <= Math.Min(document.NumberOfPages, 2); p++)
        {
            var page = document.GetPage(p);
            var words = page.GetWords(NearestNeighbourWordExtractor.Instance);
            var blocks = DocstrumBoundingBoxes.Instance.GetBlocks(words);

            Console.WriteLine($"  Page {p}: {blocks.Count} block(s) found");
            for (int b = 0; b < blocks.Count; b++)
            {
                var block = blocks[b];
                var text = block.Text.Replace("\n", " ").Replace("\r", "");
                var preview = text.Length > 100 ? text[..100] + "..." : text;
                Console.WriteLine($"    Block {b + 1}:");
                Console.WriteLine($"      Bounds: ({block.BoundingBox.Left:F1}, {block.BoundingBox.Bottom:F1}) to ({block.BoundingBox.Right:F1}, {block.BoundingBox.Top:F1})");
                Console.WriteLine($"      Text: \"{preview}\"");
                Console.WriteLine();
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ERROR: {ex.GetType().Name}: {ex.Message}");
        Console.WriteLine();
    }

    // =========================================================================
    // TEST 3: DecorationTextBlockClassifier
    // =========================================================================
    Console.WriteLine("--- TEST 3: DecorationTextBlockClassifier ---");
    Console.WriteLine("(Identifies repeated headers/footers/page numbers across pages)");
    Console.WriteLine();

    try
    {
        var allPageBlocks = new List<IReadOnlyList<TextBlock>>();
        for (int p = 1; p <= document.NumberOfPages; p++)
        {
            var page = document.GetPage(p);
            var words = page.GetWords(NearestNeighbourWordExtractor.Instance);
            var blocks = RecursiveXYCut.Instance.GetBlocks(words);
            allPageBlocks.Add(blocks);
        }

        // Try calling Get with just the blocks list
        var decorated = DecorationTextBlockClassifier.Get(allPageBlocks);

        Console.WriteLine($"  Result type: {decorated.GetType().Name}");
        Console.WriteLine($"  Result count: {decorated.Count}");

        for (int p = 0; p < decorated.Count; p++)
        {
            var pageDecorations = decorated[p];
            if (pageDecorations.Count == 0)
            {
                Console.WriteLine($"  Page {p + 1}: no decorations detected");
                continue;
            }

            Console.WriteLine($"  Page {p + 1}: {pageDecorations.Count} decoration block(s):");
            foreach (var block in pageDecorations)
            {
                var text = block.Text.Length > 80 ? block.Text[..80] + "..." : block.Text;
                text = text.Replace("\n", " ").Replace("\r", "");
                Console.WriteLine($"    - \"{text}\"");
                Console.WriteLine($"      Bounds: ({block.BoundingBox.Left:F1}, {block.BoundingBox.Bottom:F1}) to ({block.BoundingBox.Right:F1}, {block.BoundingBox.Top:F1})");
            }
        }
        Console.WriteLine();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ERROR: {ex.GetType().Name}: {ex.Message}");
        if (ex.InnerException != null)
            Console.WriteLine($"  INNER: {ex.InnerException.Message}");
        Console.WriteLine();
    }

    // =========================================================================
    // TEST 4: Filled Rectangles (current zone detection comparison)
    // =========================================================================
    Console.WriteLine("--- TEST 4: Filled Rectangles (colored boxes) ---");
    Console.WriteLine("(What the current zone detection finds via ExperimentalAccess.Paths)");
    Console.WriteLine();

    try
    {
        for (int p = 1; p <= document.NumberOfPages; p++)
        {
            var page = document.GetPage(p);
            var paths = page.Paths;
            var pageArea = page.Width * page.Height;

            var rects = new List<(double Left, double Bottom, double Width, double Height, string Color)>();
            foreach (var pdfPath2 in paths)
            {
                if (pdfPath2.FillColor == null) continue;
                var rect = pdfPath2.GetBoundingRectangle();
                if (rect == null) continue;
                var r = rect.Value;
                var area = r.Width * r.Height;

                if (area < pageArea * 0.02) continue;
                if (r.Width < 80 || r.Height < 40) continue;
                if (area > pageArea * 0.9) continue;

                var (red, green, blue) = pdfPath2.FillColor.ToRGBValues();
                var hex = $"#{(int)(red * 255):X2}{(int)(green * 255):X2}{(int)(blue * 255):X2}";
                rects.Add((r.Left, r.Bottom, r.Width, r.Height, hex));
            }

            if (rects.Count > 0)
            {
                Console.WriteLine($"  Page {p}: {rects.Count} significant filled rectangle(s):");
                foreach (var r in rects)
                    Console.WriteLine($"    - Color: {r.Color}, Pos: ({r.Left:F1}, {r.Bottom:F1}), Size: {r.Width:F1} x {r.Height:F1}");
            }
            else
            {
                Console.WriteLine($"  Page {p}: no significant filled rectangles");
            }
        }
        Console.WriteLine();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ERROR: {ex.GetType().Name}: {ex.Message}");
        Console.WriteLine();
    }

    // =========================================================================
    // TEST 5: Word Extraction Comparison
    // =========================================================================
    Console.WriteLine("--- TEST 5: Word Extraction Comparison (Page 1) ---");
    Console.WriteLine();

    try
    {
        var page1 = document.GetPage(1);
        var defaultWords = page1.GetWords().ToList();
        var nnWords = page1.GetWords(NearestNeighbourWordExtractor.Instance).ToList();

        Console.WriteLine($"  Default extractor: {defaultWords.Count} words");
        Console.WriteLine($"  NearestNeighbour:  {nnWords.Count} words");
        Console.WriteLine();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ERROR: {ex.GetType().Name}: {ex.Message}");
        Console.WriteLine();
    }

    // =========================================================================
    // TEST 6: Reading Order
    // =========================================================================
    Console.WriteLine("--- TEST 6: Reading Order Detection (Page 1) ---");
    Console.WriteLine();

    try
    {
        var page1 = document.GetPage(1);
        var words = page1.GetWords(NearestNeighbourWordExtractor.Instance);
        var blocks = RecursiveXYCut.Instance.GetBlocks(words);
        var ordered = UnsupervisedReadingOrderDetector.Instance.Get(blocks).ToList();

        Console.WriteLine($"  {ordered.Count} blocks in reading order:");
        for (int b = 0; b < ordered.Count; b++)
        {
            var block = ordered[b];
            var text = block.Text.Replace("\n", " ").Replace("\r", "");
            var preview = text.Length > 80 ? text[..80] + "..." : text;
            Console.WriteLine($"    {b + 1}. \"{preview}\"");
        }
        Console.WriteLine();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"  ERROR: {ex.GetType().Name}: {ex.Message}");
        Console.WriteLine();
    }

    Console.WriteLine();
}

Console.WriteLine("SPIKE COMPLETE");
