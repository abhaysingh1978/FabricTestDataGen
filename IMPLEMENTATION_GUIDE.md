# Implementation Guide & Developer Runbook

**Project:** Fabric — Agentic ETL, AI & Multi-Agent Platform  
**Version:** 2.0.0  
**Date:** April 2026  

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Prerequisites](#2-prerequisites)
3. [Local Development Setup](#3-local-development-setup)
4. [Production Build & Deployment](#4-production-build--deployment)
5. [Adding a New Use Case (Code)](#5-adding-a-new-use-case-code)
6. [Adding a Flow via UI (No Code)](#6-adding-a-flow-via-ui-no-code)
7. [Editing Built-in Flows](#7-editing-built-in-flows)
8. [Configuration Reference](#8-configuration-reference)
9. [Data Source & Infra Wizard Reference](#9-data-source--infra-wizard-reference)
10. [localStorage Key Reference](#10-localstorage-key-reference)
11. [Demo Script (Quick Reference)](#11-demo-script-quick-reference)
12. [Troubleshooting](#12-troubleshooting)
13. [Testing](#13-testing)

---

## 1. Repository Structure

```
fabric/
├── README.md
├── BRD.md
├── FRD.md
├── IMPLEMENTATION_GUIDE.md          # This file
├── TECH_ARCHITECTURE.md
├── API_SPEC.md
├── DATA_DICTIONARY.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
│
└── src/
    ├── main.tsx                     # React entry point
    ├── App.tsx                      # Root — merged categories, FlowManager, flowVersion
    │
    ├── data/                        # Static data definitions
    │   ├── usecases.ts              # Built-in DEMOS: BFSI / Sales / Economy
    │   ├── models.ts                # AI model registry (10 models)
    │   ├── etlConfig.ts             # ETL pipeline option arrays + defaults
    │   ├── infraConfig.ts           # 23 infra service wizard field definitions + guides
    │   ├── sourceTypes.ts           # 40+ data source type catalog (7 categories)
    │   ├── flowSuggestions.ts       # Domain-ranked dataset & agent suggestions (16 domains)
    │   ├── providerGuides.ts        # AI provider setup guide content (Anthropic/Google/OpenAI/Ollama)
    │   ├── presets.ts               # AI query presets per caseKey
    │   └── etlLogs.ts               # ETL log message library per domain
    │
    ├── components/
    │   ├── nav/
    │   │   ├── TopNavBar.tsx        # Category tabs, ⊕ Flows, ⚙ Config, model indicator
    │   │   └── SubNavBar.tsx        # Sub-use-case tabs (hidden for single-flow categories)
    │   │
    │   ├── config/
    │   │   ├── ConfigModal.tsx      # Main config modal (API keys, model, ETL infra, data sources)
    │   │   ├── InfraWizard.tsx      # Multi-step ETL infra wizard (global + controlled modes)
    │   │   ├── DataSourceManager.tsx # Per-flow data source CRUD modal
    │   │   └── ProviderSetupGuide.tsx # Tabbed AI provider setup guide modal
    │   │
    │   ├── flows/
    │   │   └── FlowManager.tsx      # Custom flow creation + built-in flow editing
    │   │
    │   ├── pipeline/
    │   │   ├── ETLPipeline.tsx      # 6-stage pipeline visualiser
    │   │   └── LogTerminal.tsx      # Streaming log terminal
    │   │
    │   ├── agents/
    │   │   └── AgentFrameworkPanel.tsx # Agent bubbles + A2A indicator
    │   │
    │   ├── charts/
    │   │   ├── Sparkline.tsx
    │   │   ├── DonutChart.tsx
    │   │   ├── BarChart.tsx
    │   │   ├── BubblePlot.tsx
    │   │   ├── BFSICharts.tsx       # Stock / Advisory / Fund charts
    │   │   ├── SalesCharts.tsx      # Smartphone market share charts
    │   │   └── EconomyCharts.tsx    # GDP / inflation / growth charts (also fallback for custom)
    │   │
    │   ├── ai/
    │   │   └── AIQueryPanel.tsx     # Query input, preset chips, response display
    │   │
    │   └── shared/
    │       ├── KPICard.tsx
    │       ├── ArchitectureBar.tsx
    │       └── ErrorBoundary.tsx
    │
    ├── panels/
    │   └── DemoPanel.tsx            # Main panel orchestrator (ETL + agents + charts + AI)
    │
    ├── lib/
    │   ├── ai/
    │   │   ├── providers.ts         # AI provider abstraction (Anthropic / Google / OpenAI / Ollama)
    │   │   └── prompts.ts           # System prompts per caseKey + generic fallback
    │   ├── apiKeys.ts               # API key localStorage get/set
    │   ├── infraKeys.ts             # Infra config localStorage get/set/isConfigured
    │   ├── dataSources.ts           # Per-flow DataSource CRUD (getSources/saveSources/etc.)
    │   ├── customFlows.ts           # Custom flow + override CRUD; getMergedCategories()
    │   ├── pipeline/
    │   │   └── simulator.ts         # ETL pipeline tick simulation engine
    │   └── theme.ts                 # COLORS token map
    │
    ├── hooks/
    │   ├── usePipeline.ts           # Pipeline state, tick loop, live KPIs
    │   └── useAIQuery.ts            # AI query state, fetch, error handling
    │
    └── types/
        └── index.ts                 # Shared TypeScript interfaces
```

---

## 2. Prerequisites

| Tool | Min Version | Install |
|---|---|---|
| Node.js | 20.x LTS | https://nodejs.org |
| npm | 10.x | Bundled with Node |
| Git | 2.40+ | https://git-scm.com |
| Docker (optional) | 24.x | https://docker.com |
| Ollama (optional) | 0.5+ | https://ollama.ai |

---

## 3. Local Development Setup

### Step 1: Clone

```bash
git clone https://github.com/abhaysingh1978/fabric.git
cd fabric
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: API Keys (Optional for demo mode)

API keys can be set two ways:

**Option A — In the app UI (recommended for demos):**
Click **⚙ Config** → API Keys section → enter keys directly.
Use **? How to get keys** for step-by-step guides per provider.

**Option B — Environment variables (for CI/CD or Docker):**
```bash
cp .env.example .env
```
Edit `.env`:
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_GOOGLE_API_KEY=AIzaSy...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

> **Note:** UI-set keys take priority over env vars. The ETL simulation and dashboards work fully without any API keys.

### Step 4: Local Models (Optional)

```bash
# Install Ollama from https://ollama.ai, then:
ollama serve

# Pull models (choose based on available RAM):
ollama pull deepseek-r1:7b        # ~4 GB  — best small model
ollama pull phi4:14b              # ~8 GB
ollama pull mistral-nemo:12b      # ~7 GB
ollama pull gemma3:27b            # ~16 GB
ollama pull llama3.3:70b          # ~40 GB (requires GPU)

ollama list   # verify
```

### Step 5: Start Dev Server

```bash
npm run dev
# → http://localhost:5173
```

---

## 4. Production Build & Deployment

### Build

```bash
npm run build          # outputs to dist/
npm run preview        # preview prod build locally
npx tsc --noEmit       # type check without build
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t fabric:latest .
docker run -p 3000:80 fabric:latest
# → http://localhost:3000
```

Pass API keys at runtime (they can also be entered via the UI):
```bash
docker run -p 3000:80 \
  -e VITE_ANTHROPIC_API_KEY=sk-ant-... \
  fabric:latest
```

---

## 5. Adding a New Use Case (Code)

Use this when you need full custom charts or bespoke AI presets. For a standard flow, see §6.

### Step 1: Define the Use Case

`src/data/usecases.ts`:
```typescript
// Add to an existing category's `sub` object, or create a new category
Healthcare: {
  label: 'Healthcare',
  icon: '⊕',
  color: '#14B8A6',
  sub: {
    clinical: {
      label: 'Clinical Analytics',
      icon: '🏥',
      desc: 'Patient outcomes ETL, clinical trial analysis, drug performance dashboards.',
      datasets: ['EHR / EMR Records', 'Clinical Trial Data', 'Medical Claims Data', 'Lab Results'],
      agents: ['Clinical Decision Support', 'Outcome Predictor', 'Claim Validator', 'Reporter'],
      kpis: [
        { l: 'Patients Covered', v: '2.4M', d: '+180K' },
        { l: 'Trials Tracked',   v: '840',  d: '+12'   },
        { l: 'Compliance Score', v: '98.4%',d: '+0.3%' },
        { l: 'Reports/Month',    v: '320',  d: 'Auto'  },
      ],
      caseKey: 'clinical',
    },
  },
},
```

### Step 2: Add AI Query Presets

`src/data/presets.ts`:
```typescript
clinical: [
  'What are the top risk factors for 30-day readmission?',
  'Summarise trial performance for Drug Cohort A vs placebo.',
  'Flag anomalies in claims data for Q1 by DRG code.',
],
```

### Step 3: Add System Prompt

`src/lib/ai/prompts.ts`:
```typescript
clinical: `You are a healthcare data analyst with expertise in clinical outcomes, claims processing, and trial analytics. Provide concise, evidence-based insights referencing ICD codes, DRG categories, and clinical benchmarks where relevant.`,
```

### Step 4: Build Domain Charts

Create `src/components/charts/HealthcareCharts.tsx` following the pattern of `BFSICharts.tsx`.

Then register in `DemoPanel.tsx`:
```typescript
function ChartSection(caseKey: string) {
  if (['stock', 'advisory', 'fund'].includes(caseKey)) return <BFSICharts />
  if (caseKey === 'smartphone') return <SalesCharts />
  if (caseKey === 'clinical')   return <HealthcareCharts />  // ← add
  return <EconomyCharts />  // generic fallback for all custom flows
}
```

### Step 5: Add ETL Log Messages

`src/data/etlLogs.ts` — add a `clinical` entry following existing patterns.

**Estimated time: 2–4 hours per code-based use case.**

---

## 6. Adding a Flow via UI (No Code)

The fastest way to add a new domain for a client demo — no code changes required.

1. Click **⊕ Flows** in the top nav bar
2. Click **⊕ New Custom Flow** (sidebar or welcome state)
3. Fill in **Identity**: icon, name, description
4. Fill in **Category**: create new (name + icon + colour) or add to an existing custom category
5. Fill in **Datasets**: click the input — suggestions auto-rank based on your flow name and category. Type to filter, click or press Enter to add.
6. Fill in **Agents**: same autocomplete. Domain detection covers 16 industries (finance, healthcare, sales, etc.)
7. Fill in **KPIs** (optional): up to 4 rows of label/value/delta
8. Click **⊕ Create Flow**
9. Close the Flow Manager — the new category appears immediately in the top nav

> Custom flows use the generic AI system prompt and have no pre-set query chips. Users can type any query freely.

> Custom flows use `EconomyCharts` as the dashboard fallback. For custom charts, see §5.

---

## 7. Editing Built-in Flows

Built-in flows (Stock Analysis, Financial Advisory, etc.) can be edited without touching code.

1. Click **⊕ Flows**
2. In the **Built-in Flows** section of the sidebar, click any flow
3. The editor opens pre-filled with current values (overrides applied if any)
4. Edit any fields: icon, name, description, datasets, agents, KPIs
5. Click **✓ Save Changes**

The category badge and `BFSI · BFSI` label appear at the top of the editor to confirm which built-in you're editing.

**Reset to Default:** If a flow has been edited, a **↺ Reset to Default** button appears at the bottom of the editor. Clicking it removes the override and restores the original DEMOS values.

Overrides are stored in `fabric_flow_overrides` in localStorage and applied non-destructively at render time. The source `DEMOS` object is never mutated.

---

## 8. Configuration Reference

### 8.1 AI Models Registry

`src/data/models.ts` — add new models here:

```typescript
{
  id: 'new-model-id',      // Used in API calls
  name: 'Display Name',    // Shown in UI
  provider: 'Local',       // 'Anthropic' | 'Google' | 'OpenAI' | 'Local'
  tag: '7B',               // Version/size shown in badge
  color: '#FF6B35',        // Hex accent colour
}
```

After adding, register the API call in `src/lib/ai/providers.ts` if it's a new provider.

### 8.2 ETL Configuration Options

`src/data/etlConfig.ts`:

```typescript
export const ETL_OPTIONS = {
  batchSize:       [1_000, 10_000, 100_000, 1_000_000],
  refreshInterval: [5, 15, 30, 60, 300],
  parallelAgents:  [2, 4, 8, 16, 32],
  vectorStore:     ['Pinecone', 'Weaviate', 'Qdrant', 'pgvector', 'Chroma'],
  dataWarehouse:   ['Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'DuckDB',
                    'MySQL', 'SQL Server', 'Oracle', 'DB2', 'Sybase'],
  streamProcessor: ['Kafka', 'Pulsar', 'Kinesis', 'Flink', 'Spark Streaming'],
}
```

### 8.3 Theme Colours

`src/lib/theme.ts` — all UI components use the `COLORS` token map:

| Token | Usage |
|---|---|
| `COLORS.bg` | Page background |
| `COLORS.bgCard` | Card/input background |
| `COLORS.bgPanel` | Modal panel background |
| `COLORS.border` | Default border |
| `COLORS.borderBright` | Highlighted border |
| `COLORS.accent` | Primary cyan (#00D4FF) |
| `COLORS.accent2` | Orange (#FF8C61) |
| `COLORS.accent3` | Green (#10B981) |
| `COLORS.accentWarn` | Amber warning |
| `COLORS.accentDanger` | Red danger |
| `COLORS.text` | Primary text |
| `COLORS.textDim` | Secondary text |
| `COLORS.textMuted` | Tertiary/label text |

---

## 9. Data Source & Infra Wizard Reference

### 9.1 Adding a New Infra Service

`src/data/infraConfig.ts` — add a new entry to `INFRA_DEFS`:

```typescript
'NewService': {
  category: 'Vector Store',   // 'Vector Store' | 'Data Warehouse' | 'Stream Processor' | 'File Source'
  label: 'New Service',
  sections: [
    {
      title: 'Connection',
      fields: [
        { key: 'host',     label: 'Host',     type: 'text',     placeholder: 'newservice.example.com' },
        { key: 'apiKey',   label: 'API Key',  type: 'password', placeholder: 'ns-...' },
        { key: 'tls',      label: 'Use TLS',  type: 'boolean'  },
      ],
      guide: {
        overview: 'How to find your New Service connection details.',
        steps: [
          'Log in to your New Service console.',
          'Navigate to Settings → Connection.',
          'Copy the host and generate an API key.',
        ],
        links: [{ label: 'New Service Docs', url: 'https://docs.newservice.io' }],
      },
    },
  ],
},
```

### 9.2 Adding a New Data Source Type

`src/data/sourceTypes.ts` — add to `SOURCE_TYPES`:

```typescript
{ 
  id: 'NewDB',
  label: 'New Database',
  category: 'SQL Databases',
  color: '#FF6600',
  icon: '🗄',
  description: 'Connect to New Database instances.',
  hasWizard: true,   // set false if no INFRA_DEFS entry
  badge: 'New',      // optional
},
```

If `hasWizard: true`, also add an entry to `INFRA_DEFS` (see §9.1).

### 9.3 Adding Domain Suggestions

`src/data/flowSuggestions.ts` — add to `DATASET_CATALOG` or `AGENT_CATALOG`:

```typescript
// Dataset
{ name: 'New Data Feed', domains: ['finance', 'economy'] },

// Agent
{ name: 'New Analytics Agent', domains: ['finance'] },
```

To add a new domain pattern:
```typescript
DOMAIN_PATTERNS['newdomain'] = /\b(keyword1|keyword2|keyword3)\b/i
```

Then tag catalog items with `domains: ['newdomain']`.

---

## 10. localStorage Key Reference

| Key | Type | Contents |
|---|---|---|
| `fabric_key_anthropic` | `string` | Anthropic API key |
| `fabric_key_google` | `string` | Google AI API key |
| `fabric_key_openai` | `string` | OpenAI API key |
| `fabric_key_ollama` | `string` | Ollama base URL |
| `fabric_infra_<service_lc>` | `Record<string,string>` | InfraWizard field values for service |
| `fabric_ds_<flowId>` | `DataSource[]` | Data sources for a given flow |
| `fabric_custom_flows` | `StoredFlow[]` | All custom flows |
| `fabric_flow_overrides` | `FlowOverride[]` | Built-in flow overrides |

To inspect in Chrome DevTools:
```
Application → Storage → Local Storage → http://localhost:5173
```

To reset everything (nuclear option):
```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith('fabric_'))
  .forEach(k => localStorage.removeItem(k))
```

---

## 11. Demo Script (Quick Reference)

### Pre-Demo Checklist

- [ ] Open Fabric in Chrome, full screen (F11 or View → Enter Full Screen)
- [ ] Verify API key is set: Config → API Keys → test one query
- [ ] If using local models: confirm `ollama serve` is running; select the model in Config
- [ ] Set desired model in Config before the client enters
- [ ] Config panel closed when client enters the room
- [ ] If showing a custom flow: create it in Flow Manager beforehand

### Demo Flow (15–20 minutes)

| Time | Action | Talking Point |
|---|---|---|
| 0–2 min | Overview of Fabric landing — BFSI tab active | "This is our unified agentic data platform — three verticals out of the box, and you can add any domain in minutes." |
| 2–4 min | BFSI → Stock Analysis → ▶ Run Pipeline | "Watch 100K market records flow through 6 ETL stages — extract, validate, transform, aggregate, load, and vector index." |
| 4–5 min | Point to Agent Framework | "Five specialised agents communicating in real time via A2A — Technical Analysis feeding Risk, Sentiment feeding the Report agent." |
| 5–7 min | Click AI preset query | "Now I'll query the AI layer — it's context-aware for this domain, connected to the active pipeline state." |
| 7–8 min | Open Config → switch to DeepSeek | "We can swap to a local model — zero API calls, your data never leaves your infrastructure." |
| 8–9 min | Ask same question with DeepSeek | "Same query, same domain context, different model. You choose the AI stack." |
| 9–11 min | Open ⊕ Flows → show built-in edit | "We can also tailor the built-in demos for your context — change the agents, datasets, KPIs without any code." |
| 11–13 min | Create a new custom flow live | "Or spin up a completely new domain — I'll create a Healthcare Analytics flow right now. Watch the agent suggestions." |
| 13–14 min | Navigate to new flow → Run Pipeline | "That flow is now live in the nav. If it were a real client engagement, we'd wire up real data connectors here." |
| 14–15 min | Config → Manage Sources → show 40+ types | "This is the connector catalogue — 40+ source types, each with a guided configuration wizard and setup guide." |
| 15–17 min | Navigate to Economy → run + AI query | "Macro intelligence — 10 economies, 240 indicators, 50-year historical. Same agent pattern, different domain." |
| 17–18 min | Return to BFSI → Fund Performance | "For asset managers: automated attribution reporting. Monthly board packs generated by agents, not spreadsheets." |
| 18–20 min | Open Config → show InfraWizard for Snowflake | "Every infrastructure component is configurable with a guided wizard — Snowflake credentials, Kafka bootstrap, Pinecone index." |

---

## 12. Troubleshooting

| Issue | Likely Cause | Fix |
|---|---|---|
| AI query returns empty response | Gemini 2.5 Pro token budget | Fixed in v2 (8K min tokens); verify model is Pro not Flash |
| AI query returns error | Missing/invalid API key | Config → API Keys → update key; use ? How to get keys guide |
| Local model slow / timeout | Model too large for RAM | Switch to 7B model; check `ollama list` |
| Ollama not reachable | Server not running | Run `ollama serve` in terminal |
| Custom flow not in nav after create | FlowManager not closed | Click ✕ Close (bumps flowVersion) |
| Built-in flow shows "edited" but shouldn't | Stale override in localStorage | Flow Manager → click flow → ↺ Reset to Default |
| Pipeline doesn't start | JavaScript error | Open DevTools console (F12); report error |
| Blank screen on load | Build error | `npm run build` → check for TypeScript errors |
| Charts not rendering | SVG/browser issue | Use Chrome 110+; check console for errors |
| CORS error on AI call | API key or CSP issue | Check API key is valid; check browser extensions blocking requests |
| localStorage full | Too many sources/flows | Clear stale `fabric_ds_*` keys via DevTools |

---

## 13. Testing

```bash
# Type check
npx tsc --noEmit

# Unit tests
npm run test

# Component tests (Vitest + Testing Library)
npm run test:components

# E2E tests (Playwright)
npm run test:e2e

# Coverage
npm run test:coverage
```

### Key Test Cases

- All 5 built-in use cases load without errors
- Pipeline starts, ticks to completion, stops correctly
- Config modal: model selection, key entry, ETL options, save
- AI query: preset click, text input, response display, error states
- Flow Manager: create custom flow → appears in nav; edit built-in → override persisted; reset → override removed
- Data Source Manager: add source with wizard → source appears; toggle enable/disable; delete
- Category/sub navigation resets pipeline state
- Custom flow caseKey collision prevention (unique suffix)

---

*Document End — Implementation Guide v2.0.0*
