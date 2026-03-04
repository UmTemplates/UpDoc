---
title: "CLAUDE.md"
---


`CLAUDE.md` is a project-level instructions file that Claude Code reads automatically at the start of every session. It defines how Claude should behave when working on this project.

## Location

```
UpDoc/CLAUDE.md
```

Checked into the repository — shared across all contributors using Claude Code.

## What It Contains

### Session Startup

A list of planning documents that Claude must read fresh at the start of every session. This ensures architectural decisions are always in working context, not lost to context compression.

### Work Approval

Claude must discuss its approach before implementing any non-trivial change. This prevents wasted effort on the wrong approach.

### Project Structure

Defines the two-project solution layout (`src/UpDoc/` RCL and `src/UpDoc.TestSite/`).

### Naming Conventions

A table of naming rules for every context — C# namespaces, npm packages, HTML elements, API routes, file names, Umbraco aliases.

### Build Commands

How to build the frontend (TypeScript) and backend (.NET), and how to run the test site.

### Documentation Requirements

A mapping table from source files to their corresponding documentation files. When a source file is modified, its docs must be updated.

### Git Branching

Rules for feature branches — always branch from main, never work directly on main, check current branch before creating a new one.

### Umbraco CMS Source Reference

Points to the local clone of Umbraco CMS source code and mandates using it as the primary reference for all extension implementation.

## Why This Matters

Without `CLAUDE.md`, every Claude Code session starts from zero — Claude would need to rediscover project conventions, build commands, and architectural decisions. With it, sessions are immediately productive because Claude already knows the rules.

### Lessons Learned

- **Be specific about what to read at startup** — vague instructions get skipped under context pressure
- **Mandate reading planning documents** — don't rely on memory or summaries for architectural decisions
- **Include the "don't" rules** — "never work directly on main", "always use Composition* variants" prevent recurring mistakes
- **Keep it maintained** — stale CLAUDE.md instructions cause confusion. Update it as the project evolves.
