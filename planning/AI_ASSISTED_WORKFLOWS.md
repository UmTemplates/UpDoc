# Plan: AI-Assisted Workflow Authoring via Umbraco.AI

## Status: PLANNING

---

## Overview

Integrate Umbraco.AI into UpDoc to provide AI-assisted suggestions for workflow authoring. The AI reads source documents (PDF extraction, web extraction, markdown) and destination structures (blueprint fields, block grids) to suggest transform rules and source-to-destination mappings. All suggestions are reviewable and editable by the workflow author before being applied.

**Key principle:** AI assists, never decides. Every suggestion is presented for human review. The existing manual workflow remains fully functional without Umbraco.AI installed.

---

## Why This Fits

| Factor | Detail |
|--------|--------|
| **Data is already structured** | Rich extraction JSON includes font sizes, positions, colours, HTML tags, container paths. Destination JSON describes fields, blocks, property types. Map JSON defines source-to-destination wiring. All ideal prompt material. |
| **Provider-agnostic** | `IAIChatService` abstracts away the AI provider. Site owner configures OpenAI, Claude, Gemini, etc. in the Umbraco backoffice. UpDoc has zero provider coupling. |
| **Optional dependency** | If `Umbraco.AI` is not installed, suggest buttons don't appear. Manual workflow is untouched. |
| **Profiles handle tuning** | Temperature, model selection, token limits, system prompts — all configured by the site admin per profile, not hardcoded in UpDoc. |
| **Audit trail built in** | Umbraco.AI logs all requests/responses. Full traceability of what AI suggested and what was accepted. |

---

## Architecture Decision: Inline Chat (Level 1)

Three integration levels were considered:

| Level | Approach | Complexity | Notes |
|-------|----------|-----------|-------|
| **1. Inline Chat** | `IAIChatService.GetChatResponseAsync()` with builder | Low | One service, one endpoint. Profile configured in backoffice. |
| 2. Prompts | `Umbraco.AI.Prompt` with Mustache templates | Medium | Admins can edit prompt wording in backoffice. Requires `Umbraco.AI.Prompt` add-on. |
| 3. Agent + Tools | `Umbraco.AI.Agent` with custom `IAITool` implementations | High | Multi-step orchestration. Most powerful, most complex. |

**Decision: Start with Level 1 (Inline Chat).** Least coupling, proves the concept, and can layer prompts/agents on top later. The `AIChatBuilder` fluent API provides everything needed — alias, profile selection, chat options, context injection.

### Upgrade path

Level 1 establishes the C# service, API endpoint, and frontend patterns. If the prompt needs to be editable by non-developers, wrap it in `Umbraco.AI.Prompt`. If multi-step reasoning improves quality (e.g., "analyse source, then suggest rules, then validate"), wrap it in `Umbraco.AI.Agent`. Each level builds on the previous one without rewriting.

---

## Dependency Strategy

### NuGet Reference

```xml
<PackageReference Include="Umbraco.AI" Version="x.x.x" Condition="..." />
```

**Decision needed:** Whether to use a compile-time conditional reference or runtime feature detection.

**Option A: Compile-time (two builds)** — A build flag includes/excludes the AI assembly. Simpler code but two NuGet packages or build configurations.

**Option B: Runtime detection (preferred)** — Always reference `Umbraco.AI` but check at runtime whether `IAIChatService` is registered in DI. If not, AI features are silently disabled. Single package, single build.

```csharp
// Runtime detection pattern
public class AISuggestionService
{
    private readonly IAIChatService? _chatService;

    public AISuggestionService(IServiceProvider serviceProvider)
    {
        // Resolve optionally — null if Umbraco.AI not installed
        _chatService = serviceProvider.GetService<IAIChatService>();
    }

    public bool IsAvailable => _chatService is not null;
}
```

The frontend checks an API endpoint (`/api/v1/updoc/ai/status`) to know whether to render suggest buttons.

---

## What the AI Sees

The AI receives structured JSON that UpDoc already produces. No new extraction or formatting needed.

### For Rule Suggestions

The AI receives:
1. **Sample extraction** (`RichExtractionResult`) — all elements with full metadata (font size, colour, position, HTML tag, container path, bold state)
2. **Existing rules** (if any) — current `source.json` area rules, so suggestions don't duplicate what's already defined
3. **Source type** — PDF, web, or markdown (determines which condition types are relevant)

The AI returns:
- Suggested `SectionRule[]` objects in the existing JSON format
- Each rule includes: `role`, `part`, `format`, `conditions[]`
- Each suggestion includes a human-readable `_explanation` field (not persisted, display only)

### For Mapping Suggestions

The AI receives:
1. **Transformed sections** (`TransformResult`) — the shaped content with section IDs, headings, content previews
2. **Destination structure** (`DestinationConfig`) — fields, block grids, block properties, accepted formats
3. **Existing mappings** (if any) — current `map.json`, so suggestions don't duplicate

The AI returns:
- Suggested `SectionMapping[]` objects in the existing JSON format
- Each mapping includes: `source`, `destinations[]` with `target`, `blockKey`, `contentTypeKey`
- Each suggestion includes a `_explanation` field
- Confidence indicator (high/medium/low) based on semantic similarity

### Example: Rule Suggestion Prompt

```
You are assisting with content extraction rule authoring for a CMS workflow tool.

Given the following extracted elements from a PDF document, suggest transform rules
that would group and classify these elements into meaningful content sections.

## Source Elements (rich extraction)
{sourceExtractionJson}

## Existing Rules (do not duplicate)
{existingRulesJson}

## Available Condition Types for PDF
- fontSizeEquals, fontSizeAbove, fontSizeBelow, fontSizeRange
- fontNameContains, fontNameEquals
- colorEquals
- textBeginsWith, textEndsWith, textContains, textEquals

## Instructions
- Each rule needs a human-readable `role` (e.g., "Tour Title", "Day Heading")
- Assign a `part`: "title" for headings, "content" for body text
- Group related rules (e.g., a title + content pair) into a `group`
- Use the minimum conditions needed to uniquely identify each element type
- Prefer font size + colour over text matching (more resilient across documents)
- Return valid JSON matching the SectionRule schema
- Include an `_explanation` field on each rule explaining why you chose those conditions

## Response Format
Return a JSON array of rule suggestions:
[
  {
    "rule": { ... SectionRule JSON ... },
    "group": "group-name-or-null",
    "_explanation": "Why this rule matches this content"
  }
]
```

### Example: Mapping Suggestion Prompt

```
You are assisting with content mapping for a CMS workflow tool.

Given source sections extracted from a document and a destination CMS structure,
suggest how source content should map to destination fields.

## Source Sections (transformed)
{transformedSectionsJson}

## Destination Structure
{destinationJson}

## Existing Mappings (do not duplicate)
{existingMappingsJson}

## Instructions
- Match source sections to destination fields by semantic meaning
- Consider field types: text fields accept plain text, richText accepts HTML/markdown
- For block grid destinations, specify both `target` (property alias) and `contentTypeKey`
- Use the `identifyBy` property on blocks to match the right block instance
- A source section can map to multiple destinations (but this is rare)
- Multiple source sections can map to the same destination (concatenated)
- Include confidence level and explanation for each suggestion

## Response Format
Return a JSON array of mapping suggestions:
[
  {
    "mapping": { ... SectionMapping JSON ... },
    "confidence": "high|medium|low",
    "_explanation": "Why this source maps to this destination"
  }
]
```

---

## C# Implementation

### Service

```
src/UpDoc/Services/AISuggestionService.cs
```

Single service with two methods:

- `SuggestRulesAsync(string workflowAlias, RichExtractionResult extraction)` — returns suggested rules
- `SuggestMappingsAsync(string workflowAlias, TransformResult transform)` — returns suggested mappings

Both methods:
1. Load existing workflow config (source.json, destination.json, map.json)
2. Build the prompt with structured JSON context
3. Call `IAIChatService.GetChatResponseAsync()` with builder alias `"updoc-suggest"`
4. Parse the AI response JSON into suggestion models
5. Return suggestions with explanations

### API Endpoints

```
POST /umbraco/management/api/v1/updoc/ai/suggest-rules
POST /umbraco/management/api/v1/updoc/ai/suggest-mappings
GET  /umbraco/management/api/v1/updoc/ai/status
```

- `suggest-rules` — accepts workflow alias + extraction result, returns rule suggestions
- `suggest-mappings` — accepts workflow alias + transform result, returns mapping suggestions
- `status` — returns `{ available: bool, profileConfigured: bool }` for frontend feature detection

### Response Models

```csharp
public class AISuggestionResponse<T>
{
    public List<AISuggestion<T>> Suggestions { get; set; } = [];
    public string? Error { get; set; }
}

public class AISuggestion<T>
{
    public T Value { get; set; }           // The suggested rule or mapping
    public string Confidence { get; set; }  // "high", "medium", "low"
    public string Explanation { get; set; } // Why the AI suggested this
}
```

---

## Frontend Implementation

### Feature Detection

On workspace load, the frontend calls `GET /api/v1/updoc/ai/status`. If `available: true`, render suggest buttons. If not, the UI is identical to today.

### Rules Editor — "Suggest Rules" Button

**Location:** Rules editor toolbar, next to existing action buttons.

**Flow:**
1. User clicks "Suggest Rules"
2. Button shows loading state
3. Frontend sends current extraction + existing rules to `suggest-rules` endpoint
4. Response displayed as a reviewable list below the existing rules
5. Each suggestion shows:
   - Rule summary (role, conditions)
   - AI explanation
   - Confidence badge (green/amber/grey)
   - Accept / Reject buttons
6. Accepting a suggestion adds it to the rules (same as manually creating a rule)
7. User can edit the accepted rule before saving

### Map Tab — "Suggest Mappings" Button

**Location:** Map tab toolbar.

**Flow:**
1. User clicks "Suggest Mappings"
2. Frontend sends transformed sections + destination structure + existing mappings
3. Response displayed as a reviewable list
4. Each suggestion shows:
   - Source → Destination wiring
   - AI explanation
   - Confidence badge
   - Accept / Reject buttons
5. Accepting adds the mapping to map.json
6. User can edit before saving

### UI Pattern: Suggestion Review Panel

Both rule and mapping suggestions use the same review panel pattern:

```
┌─────────────────────────────────────────────────┐
│  AI Suggestions                          [Close] │
├─────────────────────────────────────────────────┤
│  ✓ HIGH  Tour Title → pageTitle                  │
│  "The large blue heading on page 1 matches the   │
│   pageTitle field semantically."                  │
│                              [Accept] [Dismiss]   │
├─────────────────────────────────────────────────┤
│  ~ MED   Itinerary Content → richTextContent     │
│  "Multi-paragraph content under 'Itinerary'       │
│   heading maps to the rich text block."           │
│                              [Accept] [Dismiss]   │
├─────────────────────────────────────────────────┤
│  ? LOW   Price → tourPrice                       │
│  "Text containing currency symbol likely maps     │
│   to price field, but format is uncertain."       │
│                              [Accept] [Dismiss]   │
├─────────────────────────────────────────────────┤
│                    [Accept All High] [Dismiss All] │
└─────────────────────────────────────────────────┘
```

---

## Phased Implementation

### Phase 1: Foundation
- [ ] Add `Umbraco.AI` NuGet reference (optional/runtime detection)
- [ ] `AISuggestionService` with runtime availability check
- [ ] `GET /api/v1/updoc/ai/status` endpoint
- [ ] Frontend feature detection (show/hide suggest buttons)

### Phase 2: Rule Suggestions
- [ ] System prompt for rule suggestion (PDF source type first)
- [ ] `POST /api/v1/updoc/ai/suggest-rules` endpoint
- [ ] Parse AI response into `AISuggestion<SectionRule>[]`
- [ ] "Suggest Rules" button in rules editor
- [ ] Suggestion review panel UI
- [ ] Accept/dismiss flow (accepted rules added to editor)
- [ ] Extend prompt for web and markdown source types

### Phase 3: Mapping Suggestions
- [ ] System prompt for mapping suggestion
- [ ] `POST /api/v1/updoc/ai/suggest-mappings` endpoint
- [ ] Parse AI response into `AISuggestion<SectionMapping>[]`
- [ ] "Suggest Mappings" button on Map tab
- [ ] Suggestion review panel UI
- [ ] Accept/dismiss flow (accepted mappings added to map.json)

### Phase 4: Refinement (Future)
- [ ] Batch accept ("Accept All High Confidence")
- [ ] Learning from acceptance/rejection patterns (context injection)
- [ ] Multi-document analysis (compare extractions across PDFs to find stable patterns)
- [ ] Upgrade to `Umbraco.AI.Prompt` for admin-editable prompts (if demand exists)
- [ ] Upgrade to `Umbraco.AI.Agent` for multi-step reasoning (if quality improves)

---

## Configuration

### Profile Setup (Site Admin)

The site admin creates an AI profile in the Umbraco backoffice:

- **Alias:** `updoc-suggest` (or configurable in UpDoc settings)
- **Model:** Any capable model (GPT-4o, Claude Sonnet, Gemini Pro, etc.)
- **Temperature:** 0.2–0.4 (low creativity, high consistency for structured output)
- **System prompt:** Optional — the service builds its own system prompt per request, but a profile-level system prompt could add site-specific context (e.g., "This site is a travel company")

### UpDoc Configuration

```json
// In workflow.json or a global updoc config
{
  "ai": {
    "profileAlias": "updoc-suggest",
    "enabled": true
  }
}
```

Or simply: if `Umbraco.AI` is installed and a profile with alias `updoc-suggest` exists, AI features are enabled. Convention over configuration.

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| AI suggests invalid JSON | Parse response with error handling. Show "AI couldn't generate valid suggestions" rather than crashing. |
| AI suggests rules with non-existent condition types | Validate condition types against the known list before presenting. Filter out invalid suggestions silently. |
| AI hallucinates field aliases | Validate all `target` values against the actual destination.json. Reject mappings to non-existent fields. |
| AI response too slow | Show loading state. Consider streaming via `StreamChatResponseAsync` in future. Timeout after configurable period. |
| Token limits exceeded | Truncate extraction elements if too many (keep first N + last N with "...truncated..." marker). Summarise rather than include full text for large documents. |
| Cost concerns | All usage tracked via Umbraco.AI analytics. Profile controls model selection (cheaper models for simpler tasks). |
| Provider outage | Graceful degradation — suggest button shows error state, manual workflow unaffected. |

---

## What UpDoc Does NOT Do

- **Does not ship an AI provider.** The site must have `Umbraco.AI` + a provider package installed.
- **Does not store AI responses.** Suggestions are transient — they exist only during the review session. Accepted suggestions become normal rules/mappings.
- **Does not auto-apply suggestions.** Every suggestion requires explicit human acceptance.
- **Does not require AI to function.** This is a convenience layer, not a dependency.
