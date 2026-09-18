---
title: "Testing Traps"
description: "Three bugs in six lines of schema, all invisible to the CLI. What the CLI proves and what it does not."
---

:::danger[The CLI does not test your tool]
`--call` proves the API call works. It says nothing about whether the tool contract is right. Every tool needs exercising through a real MCP client at least once before it ships.
:::

`list-workflows` has a six-line output schema. It broke three times in three days, each with a different root cause, and **none of the three was visible from the CLI**.

## Why the CLI cannot catch these

Two reasons, and they compound:

1. **It does not validate tool output.** Whatever comes back is printed.
2. **It calls handlers directly**, bypassing tool registration entirely.

So the entire decorator and registration path, which is where all three bugs lived, is never exercised.

## The three bugs

### 1. The envelope that survived a refactor

The tool declared its output as `{ items: [...] }` while the endpoint returns a bare array.

```
Invalid structured content for tool list-workflows:
Invalid input: expected object, received array
```

The wrapper came from the original hand-written schema. When the schema switched to the generated one, only the *item* shape was replaced. The envelope around it was never questioned.

Every call through an MCP client failed validation. Every call through the CLI had passed.

### 2. `z.array()` has no `.extend()`

The obvious fix was to change the schema to `z.array()` to match the endpoint.

That resolved the validation error and introduced a worse one:

```
Cannot read properties of undefined (reading '_zod')
```

The SDK's decorators assume an **object** output schema throughout. `withCursorPagination` reaches for `.extend()` to add `nextCursor`, and `z.array()` has no `.extend`. So the schema handed to `registerTool` ended up undefined, and the MCP SDK read `._zod` off it.

### 3. Back to the envelope, deliberately this time

The resolution was to keep `{ items: [...] }` as the declared schema and have the **handler** wrap the response:

```typescript
structuredContent: { items: result.structuredContent }
```

The schema declares an object because the SDK requires one. The API returns an array because that is its shape. The handler bridges the two.

That is the right place for the mismatch. Bending the schema to the API's shape is what broke it the second time.

## What this cost

Two bugs in two days on the same six lines, both shipped, both reported from a live site rather than found in testing.

The second was found by the Tailored Travel session, which ruled out auth, the network, a stale build and site health before raising it, and correctly identified the zero-parameter tool as the odd one out.

Neither would have shipped if the tool had been exercised through an MCP client once.

## The rule

**Before shipping a tool, call it through a real MCP client.**

Not `--call`. Not a unit test against the handler. A client that performs registration, applies the decorators, and validates the structured output against the declared schema.

For a zero-argument read-only tool, that is a thirty-second check. It would have caught all three.

## A fourth thing the CLI hid

The same blind spot had already hidden something else.

`get-chained-info` shipped with the scaffold as a worked example of calling a tool on a chained server. It calls `get-server-info` on `@umbraco-cms/mcp-dev`, which has no tool by that name:

```
MCP error -32602: Tool get-server-info not found
```

It had **never worked**, since the day the project was created. Nobody noticed because nobody called it.

It surfaced the moment the server was registered as a real MCP server rather than driven from the CLI. See [Chaining](/UpDoc/mcp/chaining/) for what happened to it.

## What the CLI is good for

It is genuinely useful, within its limits:

```bash
npx @umtemplates/updoc-mcp --list-tools
npx @umtemplates/updoc-mcp --call list-workflows
npx @umtemplates/updoc-mcp --describe-tool create-from-source
npx @umtemplates/updoc-mcp --debug-config
```

It proves the API call works, the auth is right, the connection is up, and the endpoint returns what you expect. Those are real questions and it answers them quickly.

It also runs **before** the version check and server start, so introspection needs no credentials at all.

Just do not mistake it for a test of the tool.

## If a tool behaves differently through a client

That difference is the first place to look, and the answer is usually one of:

- The declared output schema does not match what the handler returns
- A decorator expects a shape the schema does not provide
- Registration is doing something the direct handler call skips

All three of the bugs above are one of those.

## Further reading

- [Building the Tools](/UpDoc/mcp/building-the-tools/): what the schemas are for
- [Publishing to npm](/UpDoc/mcp/publishing/): the same lesson applied to packaging
