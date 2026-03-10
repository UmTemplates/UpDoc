---
title: "UpDoc - Umbraco Extension"
---


## Intro

- **What it does**: Allows editors to create Umbraco content documents by extracting content from source files (PDF, Web Page, Word Document)
- **The problem it solves**: Manual copy/paste from source documents into Umbraco is tedious and error-prone
- **How it works**: Adds a "Create Document from Source" option to the content tree context menu, opens a blueprint picker dialog, then a sidebar panel where the user selects a source, processes the content, and creates a new document
- **Target users**: Umbraco content editors
- **Tech stack**: Umbraco 17+, Lit components, backend API for content extraction
- **Package type**: Razor Class Library (RCL) — installable via NuGet in any Umbraco 17+ project

## Project Structure

- `src/UpDoc/` — The Razor Class Library (the installable package)
- `src/UpDoc.TestSite/` — Development/testing host site

