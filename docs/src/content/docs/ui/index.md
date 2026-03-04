---
title: "User Interface"
---


This section documents the UI components and patterns used in UpDoc, categorised by their origin:

- **[UUI Components](uui-components.md)** — Native Umbraco UI Library primitives (`uui-*` elements)
- **[Umbraco Components](umbraco-components.md)** — Higher-level Umbraco backoffice components (`umb-*` elements)
- **[Custom Components](custom-components.md)** — Components built specifically for UpDoc (`up-doc-*` elements)

## Design Principles

UpDoc follows the Umbraco backoffice design language wherever possible. When building UI:

1. **Use native UUI/Umbraco components first** — only create custom components when no native equivalent exists
2. **Follow established patterns** — look at how Umbraco core and popular packages (uSync, Merchello) solve similar problems
3. **Consistent visual language** — stat boxes, tab groups, tables, and layouts should match what users see elsewhere in the backoffice
4. **UUI CSS custom properties** — all colours, spacing, and typography use `--uui-*` tokens, never hardcoded values

## References

- [UUI Storybook](https://uui.umbraco.com/) — base UI primitives (`uui-button`, `uui-box`, `uui-tab`, etc.)
- [Umbraco API Docs Storybook](https://apidocs.umbraco.com/v14/ui/) — composed Umbraco components, layout patterns, property editors
- [Umbraco CMS Source](https://github.com/umbraco/Umbraco-CMS) — definitive reference for how components are used in practice

## Gaps and Feedback

Where UpDoc has needed to work around limitations or build custom solutions, these are noted on the relevant component pages. This information is intended as constructive feedback for the Umbraco core team.
