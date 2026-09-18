---
title: "Describing the Responses"
description: "A spec that lists routes and describes none of their payloads is half a spec."
---

Registering the Swagger document made UpDoc's routes visible. It did not make their payloads visible.

The controllers declared no `[ProducesResponseType]`, so the spec listed 42 routes and said nothing about what any of them returned. Every generated client operation came back as `void`, and Swagger's schema section was empty.

## Why this was worth fixing before writing tools

The first tool, `list-workflows`, hand-wrote its own output schema in TypeScript, duplicating a C# class it could not see.

Every new tool would have repeated that, and each copy would be free to drift from the C# it mirrors.

It also weakened what Swagger was worth to a person. "Try it out" worked, but the response shape had to be discovered by calling rather than read.

## Two changes, in order

### 1. Errors became ProblemDetails

UpDoc returned errors as an anonymous `{ error = "..." }`.

Umbraco's Management API returns `ProblemDetails` (RFC 7807) and declares it on every action. That is what a consumer reading the spec expects, what generated clients understand, and what any Umbraco developer would assume.

Two error formats in one API is not a thing to publish, so this came first.

All 89 error returns moved to helpers on a new `UpDocControllerBase`:

| Helper | Status |
|---|---|
| `NotFoundProblem(title, detail?)` | 404 |
| `BadRequestProblem(title, detail?)` | 400 |
| `ConflictProblem(title, detail?)` | 409 |
| `ServerErrorProblem(title, detail?)` | 500 |

Each wraps Umbraco's own `ProblemDetailsBuilder` from `Umbraco.Cms.Api.Common`. Producing the shape in one place is the point: written inline 89 times, it drifts.

**Worth checking the host's convention rather than inventing one.** Umbraco's source is where that was confirmed, not the documentation.

#### The stack trace that came out

One endpoint, `transform-adhoc`, returned `ex.StackTrace` in its 500 response.

That came out. The source comment on `ServerErrorProblem` puts it well:

> A stack trace in a documented response is a contract you did not mean to publish, and hands internals to anyone who can reach the endpoint.

The exception is still logged. It is simply not in the response.

#### What this did not change

This was only about HTTP error responses.

Some success payloads carry their own `Error` field. `RichExtractionResult.Error` reports that extraction failed while the request itself succeeded. Those are untouched, and the distinction matters: one is a failed request, the other is a successful request reporting a failed operation.

#### The frontend followed

Two call sites read `.error` off failed responses. Both now use a `readApiError()` helper that reads `ProblemDetails.title`, appends `.detail` when present, and falls back to status text when the body is absent or not JSON.

That fallback is not decorative: a 401 returns no JSON body at all.

### 2. Every response shape described

98 `[ProducesResponseType]` attributes across 42 endpoints, roughly 2.3 per action.

| Controller | Attributes | Of which ProblemDetails |
|---|---|---|
| `WorkflowController` | 72 | 40 |
| `PdfExtractionController` | 20 | 13 |
| `CreateFromSourceController` | 3 | 2 |
| `DocumentTypeController` | 3 | 1 |

**Not applied blanket.** Each action's real return paths were mapped first, so an endpoint that can 404 declares it and one that cannot does not.

Examples of the resulting precision:

- `CreateFromSource`: 201 plus ProblemDetails on 400 and 401
- `TransformAdhoc`: 200 plus ProblemDetails on 400, 404 **and** 500
- `GetAll`: 200 only, because the action cannot fail
- `Delete`: bare `[ProducesResponseType(204)]`, no generic type, plus 400 and 404
- `GetMediaPdf` / `GetPdf`: bare 200 because they return a `FileStream`

#### Ten anonymous types became named classes

An anonymous type cannot be named in an attribute, so it cannot be described at all.

Ten response shapes were anonymous objects. Each became a named class, with **every JSON property name preserved exactly**. The frontend reads `blueprintIds` and `documentTypeAliases` off two of these, and they still serialise under those names.

No consumer saw a difference.

#### Written by script

95 near-identical attributes is where transcription errors live.

They were generated rather than typed, and every type named was verified to exist first.

## What it paid for

Regenerating the client dropped `updocApi.ts` from 82 `void` returns to 6.

The three remaining are correct: `DELETE` returns 204, and the two PDF endpoints return a file stream.

`list-workflows` then switched from its hand-written schema to the generated one, so the shape comes from `getUmbracoManagementApiV1UpdocWorkflowsResponseItem` and cannot drift from the C# that produces it.

**Descriptions stayed hand-written and layered on top.** Orval emits field types but no `.describe()` text, and those descriptions are what an LLM reads when choosing a tool. "alias" alone does not convey that it is the identifier every other UpDoc tool takes.

Generated shape, hand-written meaning. A straight swap to the generated schema would have lost the second half.

## The rule this establishes

**Describe your responses before you write tools.**

Otherwise every tool hand-writes a schema that duplicates a class it cannot see, and they drift.

Describing the response shapes is what makes a generated schema exist to use. That is the dependency, and it runs in one direction only.

## Further reading

- [Making the API Visible](/UpDoc/mcp/making-the-api-visible/): the prerequisite
- [Building the Tools](/UpDoc/mcp/building-the-tools/): what the generated schemas enabled
- Issues [#138](https://github.com/UmTemplates/UpDoc/issues/138) and [#143](https://github.com/UmTemplates/UpDoc/issues/143)
