---
title: "Mapping Directions"
---


How UpDoc handles mapping between source content and destination fields, and why the two directions work differently.

---

## Overview

UpDoc's workflow editor provides two ways to create mappings:

- **Source-to-destination:** Start with extracted content, pick where it goes
- **Destination-to-source:** Start with a blueprint field, pick what fills it

Both directions write to the same `map.json` file and produce identical mappings. The difference is in how they handle **block property disambiguation** — the process of identifying which specific block instance a property belongs to when multiple blocks share the same property names.

---

## Why Disambiguation Matters

Umbraco document types often use **compositions** to share property sets across block types. For example, a Group Tour page might have three blocks in its content grid:

- **Suggested Itinerary** — with Title, Description, Rich Text, Summary
- **Features** — with Title, Description, Rich Text, Summary
- **Accommodation** — with Title, Description, Rich Text, Summary

All three blocks have a "Rich Text" property (alias: `richTextContent`), a "Title" property, and so on. When creating a mapping, UpDoc needs to know *which block's* Rich Text field you mean.

---

## Source-to-Destination Mapping

**Starting point:** You select one or more extracted content elements on the **Source** tab, then click "Map to...".

**How it works:** The destination picker opens, showing all available fields organised by tab. Block properties are listed under their block's label — so you see "Rich Text" under "Suggested Itinerary", separately from "Rich Text" under "Features".

**Disambiguation:** You explicitly choose which block's property to target by selecting it within its block group. UpDoc stores a `blockKey` in the mapping that permanently identifies which block instance you selected. This means:

- Checking "Rich Text" under "Suggested Itinerary" does **not** also check "Rich Text" under "Features" or "Accommodation"
- The mapping remembers your specific choice
- At content creation time, the correct block instance receives the content

**Best for:** When you have extracted content and want to decide where each piece goes.

---

## Destination-to-Source Mapping

**Starting point:** You click on a specific field within a specific block on the **Destination** tab, then pick which source content fills it.

**How it works:** Because you're already looking at a particular block's property (e.g., "Rich Text" within the "Suggested Itinerary" block), the block context is inherent in your interaction. There's no ambiguity — you've already identified exactly which field you want to populate.

**Disambiguation:** Not needed as an explicit step. The block context comes directly from where you clicked.

**Best for:** When you're working through the blueprint structure and want to fill each field in order.

---

## Choosing a Direction

Both directions produce the same result. Choose whichever feels most natural for your task:

| Scenario | Recommended direction |
|----------|----------------------|
| You have a PDF with clear sections and want to assign each one | Source-to-destination |
| You want to work through the blueprint field by field | Destination-to-source |
| You're mapping a few specific fields | Either works |
| Multiple blocks share the same property names | Either — both handle disambiguation correctly |

The **Map** tab always shows all mappings regardless of how they were created, and you can edit or delete any mapping from there.
