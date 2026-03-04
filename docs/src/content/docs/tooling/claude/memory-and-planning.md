---
title: "Memory & Planning"
---


Claude Code has two mechanisms for carrying context across sessions: **auto memory** (persistent notes) and **planning documents** (checked-in architectural decisions).

## Auto Memory

Claude Code maintains a persistent memory directory that survives across conversations:

```
~/.claude/projects/<project-hash>/memory/
```

### What Gets Stored

- **MEMORY.md** — loaded into every session's system prompt. Contains key architectural decisions, completed phases, critical rules, and session notes. Must stay under 200 lines.
- **Topic files** — detailed notes on specific subjects (e.g., `debugging-rule-matching.md`, `completed-phases.md`). Linked from MEMORY.md.

### What Should Be Saved

- Stable patterns confirmed across multiple sessions
- Key architectural decisions and their rationale
- Solutions to recurring problems
- User preferences for workflow and communication

### What Should NOT Be Saved

- Session-specific context (current task, in-progress work)
- Unverified conclusions from reading a single file
- Anything that duplicates CLAUDE.md instructions

## Planning Documents

The `planning/` directory contains architectural planning documents:

```
UpDoc/planning/
```

These are **checked into git** and represent the project's design record.

### Current Planning Documents

| Document | Purpose |
|----------|---------|
| `REFACTOR_TO_CONFIGURABLE.md` | Config-driven extraction and mapping architecture |
| `CREATE_FROM_SOURCE_SIDEBAR.md` | Unified sidebar modal design |
| `CREATE_FROM_SOURCE_UI.md` | Single entry point UI design |
| `DESTINATION_DRIVEN_MAPPING.md` | Outlook-rules-inspired destination-driven mapping |
| `TRANSFORMED_VIEW.md` | Three-layer Extract → Shape → Map pipeline |
| `RULES_EDITOR.md` | Section rules editor design |
| `PLAYWRIGHT_TESTING.md` | E2E testing strategy |

### Planning vs Memory

| | Planning documents | Auto memory |
|---|---|---|
| Location | `planning/` (in repo) | `~/.claude/memory/` (local) |
| Versioned | Yes (git) | No |
| Shared | Yes (all contributors) | No (per-machine) |
| Purpose | Architectural decisions, implementation plans | Session continuity, lessons learned |
| Lifespan | Permanent until superseded | Updated as understanding evolves |

### Workflow

At the end of any significant planning phase, plans are saved to `planning/` with a meaningful filename. Claude Code's built-in `.claude/plans/` directory uses auto-generated names that are hard to find — the `planning/` directory is the human-readable permanent record.

## References

- [Claude Code documentation](https://github.com/anthropics/claude-code) — memory and configuration docs
