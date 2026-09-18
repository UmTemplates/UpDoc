---
title: "Making the API Visible"
description: "UpDoc had an API all along. Nothing had ever described it."
---

UpDoc's API worked for two years before anything could discover it.

All four controllers declare `[MapToApi("updoc")]`. The backoffice calls them constantly. But nothing ever created the Swagger document that attribute names, so `/umbraco/swagger/updoc/swagger.json` returned 404 and the entire API was invisible to anything that reads a spec.

The attribute names a document. Something still has to create it.

## How this surfaced

It surfaced while pointing the MCP toolkit at an Umbraco instance.

The toolkit's `init` and `generate` steps read a site's Swagger document and build a typed client from it. Run against the mirror, it produced a complete client for Umbraco's own Management API and nothing at all for UpDoc.

Searching the Management API spec for "updoc" returned zero occurrences. UpDoc did not appear when the toolkit enumerated the available specs.

The API was there and working. It was simply undescribed.

## Why it mattered beyond MCP

It blocked tool generation, which is what made it urgent. But it was a gap regardless:

- **Four controllers advertised a document that did not exist.** Any Swagger consumer, whether API clients, generators or documentation tooling, was blind to UpDoc.
- **There was no live API reference.** Routes, parameters and shapes, generated from the controllers so they cannot drift.
- **Swagger UI allows calling endpoints directly**, which is useful on its own for seeing what extraction returns without driving the dialog.

## The fix

One configuration class, following the pattern Umbraco uses for its own separate APIs.

`src/UpDoc/OpenApi/ConfigureUpDocSwaggerGenOptions.cs` implements `IConfigureOptions<SwaggerGenOptions>` and calls `SwaggerDoc` with the API name. It is registered in `UpDocComposer`:

```csharp
builder.Services.ConfigureOptions<ConfigureUpDocSwaggerGenOptions>();
```

The reference implementation is `ConfigureUmbracoDeliveryApiSwaggerGenOptions` in the Umbraco CMS source.

Before the fix the URL returned 404. After it, 200 with every route described.

## Three details worth keeping

### The API name is a published contract

The name moved into a constant in `UpDocApiConfiguration` rather than being repeated as a string across the controllers.

It is the URL segment as well as the document name:

```
/umbraco/swagger/updoc/swagger.json
```

Changing it breaks any consumer pointed at the old path. The source comment says to treat it as a published contract rather than an internal name, and that is the right framing.

### The namespace avoids a collision

The class is namespaced `UpDoc.OpenApi`, not `UpDoc.Configuration`.

`UpDoc.Configuration` shadowed AngleSharp's `Configuration` class inside `UpDoc.Services`, breaking `HtmlExtractionService`'s `Configuration.Default` calls. `OpenApi` is the more accurate name anyway.

### `SwaggerDoc` is not where you expect it

`SwaggerDoc` is an extension method on `SwaggerGenOptions` declared in the `Microsoft.Extensions.DependencyInjection` namespace, not in Swashbuckle's own. The file carries a comment saying so, because the missing using is not obvious from the call site.

## What the document describes

42 endpoints across four controllers:

| Controller | Endpoints | Covers |
|---|---|---|
| `WorkflowController` | 32 | Workflow config, transforms, area detection, section rules, mappings |
| `PdfExtractionController` | 7 | Extraction, page properties, sections |
| `DocumentTypeController` | 2 | Destination document types and their blueprints |
| `CreateFromSourceController` | 1 | The create endpoint |

The generated client exposes 42 operations across 36 unique route paths: 19 GET, 11 POST, 10 PUT, 1 PATCH, 1 DELETE.

Two of those 42 are wired to MCP tools. The rest are available and undescribed by any tool, which is a deliberate position rather than an oversight. See [What Is Still Open](/UpDoc/mcp/still-open/).

## A caution the issue raised

Anything described in a public spec becomes a contract others may rely on.

Some UpDoc response models were written for the backoffice and never meant to be public. That was worth a look before publishing rather than after, and it turned up one clear case: an endpoint returning `ex.StackTrace` in its 500 response. See [Describing the Responses](/UpDoc/mcp/describing-responses/).

Behaviour did not change. This was description, not new surface.

## Further reading

- [Describing the Responses](/UpDoc/mcp/describing-responses/): the other half of having a spec
- [The UpDoc API](/UpDoc/api/): what the document now describes
- Issue [#134](https://github.com/UmTemplates/UpDoc/issues/134)
