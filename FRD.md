# Functional Requirements Document (FRD)

**Project:** Fabric — Agentic ETL, AI & Multi-Agent Platform  
**Version:** 2.0.0  
**Status:** Approved  
**Prepared by:** Technology Consulting Practice  
**Date:** April 2026  
**Linked BRD:** BRD v2.0.0  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles & Personas](#2-user-roles--personas)
3. [Functional Modules](#3-functional-modules)
4. [Feature Specifications](#4-feature-specifications)
5. [Navigation & Routing](#5-navigation--routing)
6. [Data Models](#6-data-models)
7. [AI Integration Spec](#7-ai-integration-spec)
8. [ETL Pipeline Spec](#8-etl-pipeline-spec)
9. [Agent Framework Spec](#9-agent-framework-spec)
10. [Configuration System](#10-configuration-system)
11. [Flow Management System](#11-flow-management-system)
12. [Data Source Management](#12-data-source-management)
13. [Infrastructure Wizard](#13-infrastructure-wizard)
14. [Error Handling](#14-error-handling)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Change Log](#16-change-log)

---

## 1. System Overview

Fabric is a single-page application (SPA) with a component-driven React architecture. It consists of eight primary functional modules:

```
┌──────────────────────────────────────────────────────────────────────┐
│                           FABRIC SPA                                 │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  TopNavBar: Logo | Category Tabs | ⊕ Flows | ⚙ Config        │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  SubNavBar (shown when category has > 1 use case)             │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  ArchitectureBar: Data Sources | Stream | Warehouse | Vector  │   │
│  │                   AI Agents | AI Model                        │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                   Demo Panel (per use case)                   │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐   │   │
│  │  │ ETL Pipeline│ │ Multi-Agent  │ │ Dashboard Charts     │   │   │
│  │  │ + Log       │ │ Framework    │ │ (domain-specific)    │   │   │
│  │  └─────────────┘ └──────────────┘ └──────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────┐     │   │
│  │  │              AI Query Interface                      │     │   │
│  │  └─────────────────────────────────────────────────────┘     │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Modal Layers (z-index stacked):                                     │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ConfigModal  │ │FlowManager   │ │InfraWizard   │ │DataSource  │  │
│  │(z:1000)     │ │(z:1100)      │ │(z:1200)      │ │Manager     │  │
│  └─────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ProviderSetupGuide (z:1100)                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Roles & Personas

| Persona | Description | Primary Actions |
|---|---|---|
| **Demo Facilitator** | Consultant running the platform live in a client meeting | Switch flows, run pipelines, trigger AI queries, configure models, create custom flows |
| **Observer/Client** | Prospect watching the demo | Read-only experience via facilitator's screen |
| **Developer** | Engineer extending or maintaining the platform | Code-level customisation, new chart types, new AI providers |

All interactive users are treated as Demo Facilitators. No authentication is required.

---

## 3. Functional Modules

### Module 1: Navigation

**FM-NAV-01: Top Navigation Bar**
- Displays Fabric logo and brand identity (top-left)
- Renders category tabs from the merged category tree (built-in + custom flows)
- Displays active AI model indicator (top-right): name, provider tag, colour pulse dot
- Renders **⊕ Flows** button (opens Flow Manager, orange accent)
- Renders **⚙ Config** button (opens Config Modal)
- Sticks to top of viewport on scroll (z-index: 100)
- Active category highlighted with category-specific colour accent

**FM-NAV-02: Sub-Navigation Bar**
- Appears only when the active category has more than one sub-use-case
- Renders sub-use-case tabs with icons and labels
- Selecting a sub-tab resets pipeline state and loads the corresponding demo panel
- Hidden for single-flow categories

### Module 2: Configuration Modal

**FM-CFG-01: Modal Behaviour**
- Opens as a modal overlay (z-index: 1000) on Config button click
- Closes on: explicit close button, clicking outside modal, Save Configuration button
- State persists across opens within a session

**FM-CFG-02: API Key Management**
- Four provider rows: Anthropic, Google AI, OpenAI, Ollama URL
- Each row: colour-coded status dot · masked input · show/hide toggle · clear button
- Input border highlights in provider colour on focus
- Keys persisted to `localStorage` (`fabric_key_*`) on Save
- Env vars (`.env`) used as fallback if localStorage key absent
- **? How to get keys** button opens ProviderSetupGuide at Anthropic tab

**FM-CFG-03: AI Model Selection**
- Two sections: LOCAL (green badge) and CLOUD (orange badge)
- Each section has a help button opening ProviderSetupGuide at the relevant tab
- Models rendered as selectable cards: name, provider, version tag
- Selected model highlighted with model-specific accent colour
- Updates active model indicator in nav bar immediately

**FM-CFG-04: Data Sources Section**
- Single-line section with description and **Manage Sources ›** button
- Opens DataSourceManager modal (separate full-screen modal)

**FM-CFG-05: ETL Infrastructure**
- Three rows: Vector Store · Data Warehouse · Stream Processor
- Each row: label · dropdown selector · Configure › button
- Configure › opens InfraWizard for the selected service
- Button shows **✓ Configured** (green) when wizard values are saved, else **Configure ›** (cyan)
- Badge refreshes after wizard close

**FM-CFG-06: Pipeline Settings**
- Three rows: Batch Size · Refresh Interval (s) · Parallel Agents
- Each row: label + dropdown selector
- Changes applied immediately to ETL simulation parameters

### Module 3: Architecture Overview Bar

**FM-ARCH-01: Six-Cell Architecture Bar**
Permanently displayed below navigation. Six cells:

| Cell | Icon | Dynamic Value Source |
|---|---|---|
| Data Sources | 📦 | `activeCase.datasets.length` count |
| Stream Layer | ⚡ | `etlConfig.streamProcessor` |
| Warehouse | 🗄 | `etlConfig.dataWarehouse` |
| Vector Store | 🔮 | `etlConfig.vectorStore` |
| AI Agents | 🤖 | `activeCase.agents.length` count |
| AI Model | 🧠 | `model.name` + `model.tag` |

Each cell has a colour-coded top border accent. Values update immediately on config change.

### Module 4: Demo Panel

**FM-PANEL-01: Panel Header**
- Use case title (icon + label), description paragraph
- Dataset source badges — pill chips listing all datasets
- Run/Stop ETL Pipeline button

**FM-PANEL-02: KPI Cards**
- 4 static KPI cards: label, value, optional delta badge
- When pipeline running: 2 live KPI cards (Records Processed, Pipeline Errors)
- Live values update on each pipeline tick

**FM-PANEL-03: ETL Pipeline Visualiser**
- Six numbered stage circles connected by lines
- Stage states: Idle (muted), Active (accent + glow pulse), Done (green check)
- Infrastructure info line below: stream processor · warehouse · batch · agents · vector store

**FM-PANEL-04: Multi-Agent Framework Panel**
- One bubble per agent in `activeCase.agents`
- Each bubble: status dot, agent name
- Active agents pulse with glow effect; colour and shadow light up
- Active agent count / total shown bottom-right
- A2A message indicator with direction and type colour coding

**FM-PANEL-05: Live ETL Log Terminal**
- Scrollable dark panel, monospace font, line-numbered
- Log lines streamed sequentially as pipeline runs
- Each line: number · colour-coded stage tag · message text
- Auto-scrolls to latest entry
- Idle state: `▌ Pipeline idle. Press Run to start.`

**FM-PANEL-06: Analytics Dashboard**
Domain-specific chart panels — see Section 8.

**FM-PANEL-07: AI Query Interface**
See Section 7.

### Module 5: Flow Manager

See Section 11 for full specification.

### Module 6: Data Source Manager

See Section 12 for full specification.

### Module 7: Infrastructure Wizard

See Section 13 for full specification.

### Module 8: Provider Setup Guide

**FM-PSG-01: Tabbed Modal**
- 820px modal overlay (z-index: 1100)
- Left tab rail (172px) with provider tabs: Anthropic · Google AI · OpenAI · Ollama
- Right content area renders the selected provider's guide
- Collapsible numbered sections (accordion); all expanded by default
- `initialTab` prop opens a specific provider on launch

**FM-PSG-02: Guide Content**
Each provider has 3–4 sections:
- Anthropic: Create Account → Add Billing → Create API Key
- Google AI: AI Studio Setup → Billing for Higher Limits → Model Reference (⚠ Gemini 2.5 Pro thinking-model token note)
- OpenAI: Create Account → Add Credits → Create API Key
- Ollama: Install (macOS/Windows/Linux tabs) → Start Server → Pull Models (with RAM requirements per model)

**FM-PSG-03: Content Formatting**
- Code blocks: dark `#0d1117` background, green `#a8d8a8` monospace text
- `⚠` warnings: amber accent (`accentWarn`)
- `💡` tips: green accent (`accent3`)

---

## 4. Feature Specifications

### 4.1 Pipeline Run Behaviour

| Event | System Response |
|---|---|
| Click "▶ Run ETL Pipeline" | Reset logs, reset stage to 0, reset active agents, begin tick loop |
| Each tick (~160–260ms) | Append next log line, advance stage, activate next agent, update live KPIs |
| Pipeline reaches last log entry | Set running=false; final state preserved |
| Click "◼ Stop Pipeline" | Immediately stop tick loop; preserve current state |
| Navigate to new use case | Reset all pipeline state (key-based DemoPanel remount) |

### 4.2 AI Query Behaviour

| Event | System Response |
|---|---|
| Click preset query | Populate input, trigger API call immediately |
| Type query + press Enter | Trigger API call |
| Click "↗ Ask" | Trigger API call |
| API call in flight | Show loading indicator with model name; disable re-send |
| API returns success | Display response in scrollable panel |
| API returns error | Display contextual error with provider fallback suggestion |
| Navigate to new use case | Clear response and query input |

### 4.3 Category/Sub Navigation

| Event | System Response |
|---|---|
| Click category tab | Set active category; set sub to first sub-use-case; reset demo state |
| Click sub-tab | Set active sub-use-case; reset demo state |
| Category/flow deleted | Fall back to first available category/sub |

---

## 5. Navigation & Routing

Fabric is a single-page application. All navigation is state-driven (no URL routing in v2).

```typescript
// Core navigation state in App.tsx
category: string          // active category key (built-in or custom)
sub: string               // active sub-use-case key within category
flowVersion: number       // bumped after FlowManager close to re-read merged categories

// Derived
allCategories = useMemo(() => getMergedCategories(), [flowVersion])
activeCase = allCategories[category].sub[sub]
```

State transitions are synchronous. `DemoPanel` receives a `key={category-sub}` prop to force remount on navigation.

---

## 6. Data Models

### 6.1 Use Case

```typescript
interface UseCase {
  label: string       // Display name
  icon: string        // Unicode emoji/symbol
  desc: string        // Description paragraph
  datasets: string[]  // Data source labels (badge display)
  agents: string[]    // Agent names (agent framework panel)
  kpis: KPI[]         // Static KPI cards (4 typical)
  caseKey: string     // Unique key for AI context, chart routing, data source flowId
}

interface KPI {
  l: string           // Label
  v: string           // Value
  d?: string          // Delta (optional)
}
```

### 6.2 Category

```typescript
interface Category {
  label: string                   // Display name
  icon: string                    // Unicode symbol
  color: string                   // Hex colour for nav tab accent
  sub: Record<string, UseCase>    // Map of flow key → use case
}
```

### 6.3 AI Model

```typescript
interface AIModel {
  id: string                                         // API model identifier
  name: string                                       // Display name
  provider: 'Anthropic' | 'Google' | 'OpenAI' | 'Local'
  tag: string                                        // Version/size tag
  color: string                                      // Hex accent colour
}
```

### 6.4 ETL Configuration

```typescript
interface ETLConfig {
  batchSize: number        // 1000 | 10000 | 100000 | 1000000
  refreshInterval: number  // seconds
  parallelAgents: number   // 2 | 4 | 8 | 16 | 32
  vectorStore: string      // e.g. "Pinecone"
  dataWarehouse: string    // e.g. "Snowflake"
  streamProcessor: string  // e.g. "Kafka"
}
```

### 6.5 Data Source

```typescript
interface DataSource {
  id: string                        // Unique ID (timestamp + random)
  name: string                      // User-assigned name
  type: string                      // Matches INFRA_DEFS key or sourceTypes id
  flowId: string                    // caseKey or 'global'
  enabled: boolean                  // Toggle on/off per source
  config: Record<string, string>    // Provider-specific field values
  createdAt: string                 // ISO 8601
}
```

Storage key pattern: `fabric_ds_<flowId>` in localStorage.

### 6.6 Custom Flow

```typescript
interface StoredFlow {
  categoryKey: string      // Custom category identifier
  categoryLabel: string
  categoryIcon: string
  categoryColor: string    // Hex
  flowKey: string          // Unique within category
  caseKey: string          // Globally unique, used as flowId
  label: string
  icon: string
  desc: string
  datasets: string[]
  agents: string[]
  kpis: KPI[]
  createdAt: string
}
```

Storage key: `fabric_custom_flows` in localStorage.

### 6.7 Flow Override (Built-in Editing)

```typescript
interface FlowOverride {
  categoryKey: string   // Matches DEMOS key (e.g. 'BFSI')
  flowKey: string       // Matches sub key (e.g. 'stock')
  label: string
  icon: string
  desc: string
  datasets: string[]
  agents: string[]
  kpis: KPI[]
}
```

Storage key: `fabric_flow_overrides` in localStorage.

---

## 7. AI Integration Spec

### 7.1 Provider Routing

| Model Selection | API Endpoint | Auth |
|---|---|---|
| Claude Opus 4.7 / Sonnet 4.6 | `api.anthropic.com/v1/messages` | `x-api-key` header |
| Gemini 2.5 Pro / Flash | `generativelanguage.googleapis.com/v1beta/models/...` | `?key=` query param |
| GPT-4o | `api.openai.com/v1/chat/completions` | `Authorization: Bearer` |
| DeepSeek / Llama / Gemma / Mistral / Phi | `localhost:11434/api/generate` (Ollama) | None |

### 7.2 Gemini 2.5 Pro Token Budget

Gemini 2.5 Pro is a thinking model. Its reasoning trace consumes `maxOutputTokens` before the visible reply. The system enforces a minimum of 8,192 output tokens for Pro models:

```typescript
const isPro = model.id === 'gemini-pro'
const maxOutputTokens = isPro ? Math.max(req.maxTokens ?? 0, 8192) : (req.maxTokens ?? 1024)
```

### 7.3 System Prompts

Domain-specific system prompts keyed by `caseKey`. Unknown caseKeys (custom flows) receive a generic domain-aware prompt:

| caseKey | Prompt Focus |
|---|---|
| `stock` | Financial data analyst, NYSE/NASDAQ, technical analysis, institutional positioning |
| `advisory` | Wealth management, portfolio theory, tax-efficient investing, retirement planning |
| `fund` | Fund performance, GIPS standards, attribution analysis, board-level reporting |
| `smartphone` | Consumer electronics, competitive market intelligence, 68 markets |
| `economies` | Macroeconomics, top 10 economies, IMF/World Bank data, 50-year historical |
| `custom_*` | Generic: data analyst, actionable insights, structured responses |

### 7.4 Preset Queries

`QUERY_PRESETS[caseKey]` returns 3 domain-specific queries shown as clickable chips. Returns `[]` for unknown caseKeys (custom flows show an empty chip row; user types freely).

### 7.5 Error Handling

| HTTP Status / Condition | UI Message |
|---|---|
| Network error | `⚠ Could not reach AI API. Check connection.` |
| 401 Unauthorized | `⚠ Invalid API key. Update in Config → API Keys.` |
| 429 Rate Limited | `⚠ Rate limit reached. Wait or switch model.` |
| Ollama connection refused | `⚠ Local model offline. Ensure Ollama is running on localhost:11434.` |
| Empty response (Gemini thinking) | Handled by token budget guardrail (see 7.2) |

---

## 8. ETL Pipeline Spec

### 8.1 Pipeline Stages

| Index | Stage | Description |
|---|---|---|
| 0 | Extract | Connect to data sources; pull raw records |
| 1 | Validate | Schema checks, null detection, outlier flagging |
| 2 | Transform | Normalisation, UTC conversion, feature engineering |
| 3 | Aggregate | Rolling windows, cross-dimensional aggregation |
| 4 | Load | Upsert to data warehouse; cache invalidation |
| 5 | Index | Vector embedding generation; semantic index update |

### 8.2 Stage Progression

```typescript
activeStage = Math.min(5, Math.floor((logIndex / totalLogs) * 6))
```

Agents activate progressively after log index 8, cycling through the agent list.

### 8.3 Log Entry Tags

| Tag | Colour | Represents |
|---|---|---|
| `[EXTRACT]` | Cyan | Source connections and pulls |
| `[VALIDATE]` | Amber | Schema and quality checks |
| `[TRANSFORM]` | Purple | Transformation operations |
| `[AGGREGATE]` | Green | Aggregation and windowing |
| `[LOAD]` | Blue | Database writes |
| `[INDEX]` | Pink | Vector index operations |
| `[AGENTS]` | Bright Cyan | Agent consumption/processing |
| `[A2A]` | Orange | Agent-to-agent communication |
| `[REPORT]` | Lime | Report generation |
| `[PIPELINE]` | White | Lifecycle events |

---

## 9. Agent Framework Spec

### 9.1 Built-in Agent Sets

| Use Case | Agents |
|---|---|
| Stock Analysis | Market Data · Technical Analysis · Sentiment · Risk · Report |
| Financial Advisory | Portfolio · Risk Profiler · Rebalance · Tax · Client Report |
| Fund Performance | Performance · Attribution · Factor · Compliance · Board Report |
| Smartphone Sales | Market Share · Sentiment · Pricing · Channel · Forecast |
| World Economies | GDP · Trade · Inflation · FX · Geopolitical Risk |

Custom flows define their own agent lists via the Flow Manager.

### 9.2 A2A Communication Patterns

```
Technical Analysis → Risk        : High-beta alert dispatch
Sentiment         → Report       : News catalyst sharing
Risk              → Market Data  : Threshold update feedback
Performance       → Attribution  : Attribution trigger
GDP               → Trade        : Macro correlation signal
```

A2A messages are visualised as animated indicators in the Agent Framework Panel.

---

## 10. Configuration System

### 10.1 localStorage Key Space

| Key Pattern | Contents |
|---|---|
| `fabric_key_anthropic` | Anthropic API key |
| `fabric_key_google` | Google AI API key |
| `fabric_key_openai` | OpenAI API key |
| `fabric_key_ollama` | Ollama base URL |
| `fabric_infra_<service>` | InfraWizard values for a given service |
| `fabric_ds_<flowId>` | DataSource[] array for a given flow |
| `fabric_custom_flows` | StoredFlow[] array of custom flows |
| `fabric_flow_overrides` | FlowOverride[] array of built-in flow edits |

### 10.2 Default Configuration

```json
{
  "model": { "id": "claude-sonnet", "name": "Claude Sonnet", "provider": "Anthropic", "tag": "4.6" },
  "etl": {
    "batchSize": 100000,
    "refreshInterval": 30,
    "parallelAgents": 8,
    "vectorStore": "Pinecone",
    "dataWarehouse": "Snowflake",
    "streamProcessor": "Kafka"
  }
}
```

### 10.3 Configuration Persistence

All configuration is persisted to browser localStorage. No server-side persistence in v2. Configuration survives page refreshes and browser restarts (until localStorage is cleared).

---

## 11. Flow Management System

### 11.1 Category Tree Merging

The active category tree is computed by `getMergedCategories()`:

1. Start with built-in `DEMOS` (BFSI · Sales · Economy)
2. Apply `FlowOverride[]` to mutate built-in flow metadata (non-destructively)
3. Append custom categories from `StoredFlow[]`
4. Return merged `Record<string, Category>`

This is recomputed whenever `flowVersion` is incremented (on FlowManager close).

### 11.2 Flow Manager Modal

**Layout:** 980px wide, max 90vh height, two-pane layout.

**Left sidebar (280px):**
- `BUILT-IN FLOWS` section — all 5 DEMOS flows grouped by category
  - Displays current label/icon (reflecting any override)
  - Shows `edited` amber badge if override exists
  - Click → opens editor in `builtin` mode
- Separator
- `CUSTOM FLOWS` section — custom flows grouped by their category
  - Shows agent count and dataset count
  - Click → opens editor in `custom` mode
  - 🗑 delete button with inline Yes/No confirm
- **⊕ New Custom Flow** button at bottom

**Right editor panel (700px):**
- Welcome state when nothing selected
- Editor form when a flow is selected or new flow started

### 11.3 Flow Editor Form

| Section | Fields | Notes |
|---|---|---|
| Identity | Icon (emoji, max 4 chars) · Name · Description | Required: Name, Description |
| Category | Mode toggle: Use existing / Create new | Hidden for built-in flows |
| — Use existing | Category dropdown | Populated from existing custom categories |
| — Create new | Icon · Name · Colour (10 swatches + custom picker) | Required: Name |
| Datasets | Tag chip input with autocomplete dropdown | Min 1 required |
| Agents | Tag chip input with autocomplete dropdown | Min 1 required |
| KPIs | 4 rows × (Label · Value · Delta) | All optional |

### 11.4 Tag Input Autocomplete

- Dropdown opens on focus; closes on blur (160ms delay to allow click)
- Shows up to 10 suggestions
- Empty input: top suggestions ranked by domain relevance
- Typed input: filtered by substring match with match highlighted
- Keyboard: `↑/↓` navigate, `Enter` or `,` confirm, `Escape` close, `Backspace` removes last tag
- Suggestions sourced from `getDatasetSuggestions(contextText)` / `getAgentSuggestions(contextText)`

### 11.5 Suggestion Ranking

`contextText = flowLabel + ' ' + categoryLabel`

Domain detection: 16 regex patterns covering finance, sales, healthcare, marketing, technology, HR, manufacturing, economy, ESG, security, retail, logistics, real estate, media, education, government.

Scoring: each catalog item (120 datasets, 100 agents) is scored by counting domain matches. Items with `domains: []` (general-purpose) score 0 and appear last. Items sorted descending by score, then alphabetically.

### 11.6 Built-in Flow Editing

- Editing a built-in flow saves a `FlowOverride` to localStorage
- `getMergedCategories()` applies overrides at read time — DEMOS is never mutated
- **↺ Reset to Default** button appears only when the flow has an active override
- Reset deletes the override entry; the flow reverts to DEMOS defaults on next render
- Category assignment cannot be changed for built-in flows

### 11.7 Custom Flow Lifecycle

| Action | Behaviour |
|---|---|
| Create | Generates unique `flowKey` and `caseKey` (slug + timestamp suffix); saves to `fabric_custom_flows` |
| Edit | Overwrites the existing entry by `caseKey` |
| Delete | Removes entry; if active, App falls back to first available category/sub |
| Navigate | FlowManager close increments `flowVersion`; App recomputes `allCategories` |

---

## 12. Data Source Management

### 12.1 DataSourceManager Modal

960px modal, two-pane layout:
- **Left sidebar (200px):** Flow list — 'Global' + one entry per caseKey. Selected flow highlighted.
- **Right panel (760px):** Source cards for the selected flow + Add Source button.

### 12.2 Source Type Catalog

40+ source types across 7 categories defined in `src/data/sourceTypes.ts`:

| Category | Examples |
|---|---|
| Files & Storage | Local Files, AWS S3, Azure Blob, GCS, SFTP, FTP |
| SQL Databases | PostgreSQL, MySQL, SQL Server, Oracle, DB2, Sybase, SQLite |
| NoSQL & Search | MongoDB, Elasticsearch, Redis, DynamoDB, Cassandra, Couchbase |
| APIs & Web | REST API, GraphQL, Webhook, RSS/Atom |
| SaaS Connectors | Salesforce, Google Sheets, HubSpot, Stripe, GitHub, Jira, Notion, Shopify |
| Streaming | Kafka, Kinesis, Pulsar, RabbitMQ, Azure Event Hubs |
| Cloud Warehouses | Snowflake, BigQuery, Redshift, Databricks |

### 12.3 Add Source Flow

1. User clicks **+ Add Source** → `SourceTypePicker` overlay opens
2. User filters by category chip or types to search
3. User selects a source type
4. If `hasWizard: false` → `NameDialog` captures a name; source added immediately
5. If `hasWizard: true` → `InfraWizard` opens in controlled mode with `onSave` callback
6. On wizard save, source saved to `fabric_ds_<flowId>` in localStorage

### 12.4 Source Card

Each configured source displays:
- Type icon + name (user-assigned)
- Source type badge
- Enabled/Disabled pill toggle
- Edit button (reopens wizard or name dialog)
- Delete button

---

## 13. Infrastructure Wizard

### 13.1 Wizard Modes

**Global mode** (from Config ETL Infrastructure section): saves to `fabric_infra_<service>`.

**Controlled mode** (from DataSourceManager): accepts `initialValues` prop and `onSave` callback; does not write to global infra storage.

### 13.2 Step-by-Step Layout

- Width: 520px (config pane) + optional guide pane (side-by-side when Help is open)
- Fields grouped into named sections; each section = one wizard step
- Navigation: Previous / Next / Save buttons; step indicator at top

### 13.3 Field Types

| Type | Rendering |
|---|---|
| `text` | Standard text input |
| `password` | Password input with show/hide toggle |
| `select` | Dropdown with predefined options |
| `boolean` | Checkbox |

### 13.4 Help / Setup Guide

- `? Help` toggle button in wizard header
- When open: side-by-side layout with guide pane (min-width: 340px)
- Guide pane shows per-section content: overview callout, numbered steps, resource links
- Section navigator buttons for jumping between guide sections

### 13.5 Supported Services (23 total)

**Vector Stores (5):** Pinecone · Weaviate · Qdrant · Chroma · pgvector  
**Data Warehouses / RDBMS (10):** Snowflake · BigQuery · Redshift · Databricks · DuckDB · MySQL · SQL Server · Oracle · DB2 · Sybase  
**Stream Processors (5):** Kafka · Pulsar · Kinesis · Flink · Spark Streaming  
**File Sources (3):** Local Files · AWS S3 · Azure Blob  
**Other Sources (added):** PostgreSQL · MongoDB · REST API · Google Cloud Storage · SFTP · Salesforce · Google Sheets · Elasticsearch  

---

## 14. Error Handling

| Error Type | Detection | UI Behaviour |
|---|---|---|
| AI API network failure | `fetch` catch | Inline error in AI response panel |
| AI API auth error (401/403) | Response status | Error with "Update API key in Config" link |
| AI API rate limit (429) | Response status | Error with model switch suggestion |
| Local model offline | Connection refused | Ollama offline guidance with port reference |
| Gemini empty response | Token budget guardrail | Enforced 8,192 min output tokens for Pro |
| Pipeline tick error | try/catch | Stop pipeline; show error in log terminal |
| Invalid flow navigation | `useEffect` guard in App.tsx | Auto-fall-back to first valid category/sub |
| localStorage unavailable | try/catch in all lib functions | Silent failure; in-memory fallback |

---

## 15. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Page initial load time | < 3 seconds on 50 Mbps |
| NFR-02 | Category/sub-tab switch latency | < 100ms |
| NFR-03 | Pipeline tick render latency | < 50ms per tick |
| NFR-04 | AI API response time (cloud) | < 8 seconds p95 |
| NFR-05 | Browser compatibility | Chrome 110+ · Edge 110+ · Firefox 115+ · Safari 16+ |
| NFR-06 | Minimum display resolution | 1280 × 800 |
| NFR-07 | Optimum display resolution | 1920 × 1080 |
| NFR-08 | Accessibility | WCAG 2.1 AA for interactive elements |
| NFR-09 | Application bundle size | < 2MB gzipped |
| NFR-10 | Offline capability | Full functionality with Ollama + no network |
| NFR-11 | TypeScript coverage | Zero `any` types; strict mode; zero compile errors |
| NFR-12 | Flow creation performance | Custom flow appears in nav < 500ms after save |

---

## 16. Change Log

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | April 2026 | Initial spec — 5 use cases, 10 models, ETL simulation, charts, AI query |
| 2.0.0 | April 2026 | Added: Flow Manager (FM §11), Data Source Management (FM §12), Infrastructure Wizard (FM §13), Provider Setup Guide (FM-PSG), API key management (FM-CFG-02), built-in flow editing with override/reset, intelligent dataset/agent suggestions, Gemini token budget fix, RDBMS warehouse support, updated all data models |

---

*Document End — FRD v2.0.0*
