---
title: "UpDocComposer.cs"
---


Umbraco composer that registers services for the UpDoc extension.

## What it does

Registers extraction services with Umbraco's dependency injection container during application startup.

## Code

```csharp
public class UpDocComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IPdfExtractionService, PdfExtractionService>();
        builder.Services.AddScoped<IPdfPagePropertiesService, PdfPagePropertiesService>();
        builder.Services.AddScoped<IMarkdownExtractionService, MarkdownExtractionService>();
        builder.Services.AddSingleton<IWorkflowService, WorkflowService>();
    }
}
```

## Key concepts

### IComposer

Umbraco's composition pattern for registering services:
- Automatically discovered at startup
- Runs before the application starts
- Used for DI registration, event subscriptions, etc.

### Service lifetimes

`AddScoped` means:
- One instance per HTTP request
- Disposed at the end of the request
- Appropriate for services that may hold request-specific state
- Used for `IPdfExtractionService`, `IPdfPagePropertiesService`, and `IMarkdownExtractionService`

`AddSingleton` means:
- One instance for entire application lifetime
- Used for `IWorkflowService` because it caches map files in memory after first load and the data is read-only

### Alternatives

- `AddTransient` - New instance every time it's requested

## When to use composers

Use composers when you need to:
- Register custom services
- Subscribe to Umbraco events
- Configure Umbraco features
- Add middleware or filters
