---
title: "Claude"
---


Claude Code is the primary development tool for UpDoc. It handles code generation, architecture planning, debugging, and documentation — essentially acting as a pair programmer with persistent memory across sessions.

## Key Files

| File | Purpose |
|------|---------|
| [CLAUDE.md](claude-md.md) | Project instructions that Claude reads at session start — build commands, naming conventions, mandatory workflows |
| [Memory & Planning](memory-and-planning.md) | Persistent memory system and planning documents that carry context across sessions |

## How Claude Code Is Used in This Project

- **Code implementation** — writing Lit web components, C# services, API controllers
- **Architecture planning** — designing the Extract → Shape → Map pipeline, workflow JSON schema, UI layouts
- **Debugging** — diagnosing cross-PDF rule matching failures, Shadow DOM rendering issues, composition property bugs
- **Documentation** — generating and maintaining these docs
- **Git workflow** — commits, branches, PRs following project conventions

## References

- [Claude Code](https://claude.com/claude-code) — official product page
- [Claude Code GitHub](https://github.com/anthropics/claude-code) — issue tracker and documentation
