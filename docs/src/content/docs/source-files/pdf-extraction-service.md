---
title: "PdfExtractionService.cs"
---


Service that extracts text content from PDF files using UglyToad.PdfPig.

## What it does

Provides PDF text extraction functionality:

1. Opens PDF files from file path or stream
2. Iterates through all pages
3. Extracts text content from each page
4. Returns combined text with page break markers

## Interface

```csharp
public interface IPdfExtractionService
{
    PdfExtractionResult ExtractFromFile(string filePath);
    PdfExtractionResult ExtractFromStream(Stream stream);
}
```

## Result class

```csharp
public class PdfExtractionResult
{
    public string RawText { get; set; }    // Combined text from all pages
    public int PageCount { get; set; }      // Number of pages in PDF
    public string? Error { get; set; }      // Error message if extraction failed
}
```

## Key concepts

### UglyToad.PdfPig

A .NET library for reading and extracting content from PDF files. It provides:
- Cross-platform PDF parsing
- Text extraction with positioning information
- No external dependencies

### Error handling

The service wraps all operations in try-catch to provide graceful error handling:
- Returns error message in result instead of throwing
- Allows caller to check `Error` property for failures

## Usage

```csharp
public class MyController : ControllerBase
{
    private readonly IPdfExtractionService _pdfService;

    public MyController(IPdfExtractionService pdfService)
    {
        _pdfService = pdfService;
    }

    public IActionResult ExtractPdf(string path)
    {
        var result = _pdfService.ExtractFromFile(path);

        if (!string.IsNullOrEmpty(result.Error))
            return BadRequest(result.Error);

        return Ok(result.RawText);
    }
}
```

## Registration

Registered via `UpDocComposer` as a scoped service.
