# Fabric

**Agentic ETL, AI & Multi-Agent Platform**

> A flagship client demonstration and production-ready platform showcasing enterprise-grade multi-agent AI pipelines, high-volume ETL, modern dashboarding, configurable AI inference, and self-service flow onboarding across leading models and infrastructure stacks.

---

## Overview

Fabric is built by our Technology Consulting Practice to showcase capabilities across enterprise verticals with live, interactive demonstrations. It ships with five built-in use cases and a full flow management system to onboard new domains without writing code.

| Vertical | Use Cases |
|---|---|
| **BFSI** | Stock Analysis · Financial Advisory (Wealth Management) · Fund Performance |
| **Sales** | Smartphone Sales Research (Apple vs Samsung vs Google Pixel) |
| **Economy** | World Top 10 Economies Comparison |
| **Custom** | Any domain — onboarded via the built-in Flow Manager |

---

## Core Capabilities

| Capability | Details |
|---|---|
| **Complex ETL Pipelines** | 6-stage pipeline: Extract → Validate → Transform → Aggregate → Load → Index |
| **Multi-Agent Framework** | Domain-specific agents per use case with real A2A communication |
| **Live Dashboards** | Domain-specific charts: sparklines, donut charts, bar charts, bubble plots |
| **AI Query Interface** | Natural language queries with full domain context and model-specific system prompts |
| **10 AI Models** | 5 local (DeepSeek, Llama, Gemma, Mistral, Phi) + 5 cloud (Claude, Gemini, GPT-4o) |
| **Infrastructure Wizards** | Multi-step configuration wizards for 23+ ETL services with embedded setup guides |
| **Per-Flow Data Sources** | 40+ source types across 7 categories, configured independently per flow |
| **Flow Manager** | Create, edit, and delete custom flows — appears in nav immediately, no code required |
| **Built-in Flow Editing** | Override any built-in flow's name, description, agents, datasets, and KPIs |
| **AI Provider Guides** | Step-by-step setup guides for Anthropic, Google AI, OpenAI, and Ollama |
| **API Key Management** | Masked key entry with show/hide toggle, stored in browser localStorage |

---

## Quick Start

```bash
# Clone
git clone https://github.com/abhaysingh1978/fabric.git
cd fabric

# Install
npm install

# Start dev server
npm run dev
# → http://localhost:5173
```

**Add API keys** via the **⚙ Config** button in the top-right → API Keys section.
Use **? How to get keys** for step-by-step setup guides for each provider.

For local AI models:
```bash
# Install Ollama from https://ollama.ai, then:
ollama pull deepseek-r1:7b   # ~4GB VRAM
ollama pull llama3.3:70b     # ~40GB VRAM
```

---

## Navigation

| Control | Location | Purpose |
|---|---|---|
| **Category tabs** | Top nav bar | Switch between BFSI / Sales / Economy / Custom |
| **Sub-tabs** | Below top nav | Switch between use cases within a category |
| **⊕ Flows** | Top nav right | Open Flow Manager to create or edit flows |
| **⚙ Config** | Top nav right | API keys, AI model, ETL infrastructure, data sources |

---

## Flow Manager

Click **⊕ Flows** to open the Flow Manager. From here you can:

- **Edit built-in flows** — customise name, icon, description, datasets, agents, and KPIs for any of the 5 built-in flows. Reset to defaults at any time.
- **Create custom flows** — define a new domain with its own category, colour, agents, datasets, and KPIs. The flow appears in the top nav immediately.
- **Intelligent suggestions** — datasets and agents are auto-suggested based on your flow name and category, ranked by domain relevance across 16 industry domains.

---

## Configuration

### AI Models
Select from 10 models in **⚙ Config → AI Model**:
- **Cloud:** Claude Sonnet 4.6, Claude Opus 4.7, Gemini 2.5 Pro, Gemini 2.5 Flash, GPT-4o
- **Local (Ollama):** DeepSeek R1 7B, Llama 3.3 70B, Gemma 3 27B, Mistral Nemo 12B, Phi 4 14B

### ETL Infrastructure
Each of the three ETL components (Vector Store, Data Warehouse, Stream Processor) has a **Configure ›** wizard with provider-specific fields and an embedded setup guide.

**Vector Stores:** Pinecone · Weaviate · Qdrant · Chroma · pgvector  
**Data Warehouses:** Snowflake · BigQuery · Redshift · Databricks · DuckDB · MySQL · SQL Server · Oracle · DB2 · Sybase  
**Stream Processors:** Kafka · Pulsar · Kinesis · Flink · Spark Streaming

### Data Sources
Click **Manage Sources ›** in Config to open the Data Source Manager. Configure sources per flow across 40+ types:

| Category | Sources |
|---|---|
| Files & Storage | Local Files, AWS S3, Azure Blob, GCS, SFTP |
| SQL Databases | PostgreSQL, MySQL, SQL Server, Oracle, DB2, Sybase, SQLite |
| NoSQL & Search | MongoDB, Elasticsearch, Redis, DynamoDB, Cassandra |
| APIs & Web | REST API, GraphQL, Webhook, RSS/Atom |
| SaaS Connectors | Salesforce, Google Sheets, HubSpot, Stripe, GitHub, Jira, Notion |
| Streaming | Kafka, Kinesis, Pulsar, RabbitMQ, Azure Event Hubs |
| Cloud Warehouses | Snowflake, BigQuery, Redshift, Databricks |

---

## Tech Stack

**Frontend:** React 18 · TypeScript 5 · Vite 5 · Custom SVG Charts  
**State:** React hooks + localStorage persistence  
**ETL (Production):** Apache Kafka · Apache Flink · dbt · Apache Airflow  
**Storage:** Snowflake · Pinecone · Redis  
**AI Models:** Anthropic Claude · Google Gemini · OpenAI GPT-4o · Ollama (local)  
**Infra:** Docker · Kubernetes · GitHub Actions · Nginx  

---

## Project Structure

```
fabric/
├── src/
│   ├── App.tsx                          # Root — merged categories, flow version
│   ├── data/
│   │   ├── usecases.ts                  # Built-in DEMOS (BFSI / Sales / Economy)
│   │   ├── models.ts                    # AI model registry
│   │   ├── etlConfig.ts                 # ETL pipeline options
│   │   ├── infraConfig.ts               # Infrastructure wizard field definitions
│   │   ├── sourceTypes.ts               # 40+ data source type catalog
│   │   ├── flowSuggestions.ts           # Domain-ranked dataset & agent suggestions
│   │   ├── providerGuides.ts            # AI provider setup guide content
│   │   └── presets.ts                   # AI query presets per domain
│   ├── components/
│   │   ├── nav/                         # TopNavBar, SubNavBar
│   │   ├── config/
│   │   │   ├── ConfigModal.tsx          # Main configuration modal
│   │   │   ├── InfraWizard.tsx          # Multi-step infra config wizard
│   │   │   ├── DataSourceManager.tsx    # Per-flow data source manager
│   │   │   └── ProviderSetupGuide.tsx   # AI provider setup guides
│   │   ├── flows/
│   │   │   └── FlowManager.tsx          # Custom + built-in flow editor
│   │   ├── pipeline/                    # ETLPipeline, LogTerminal
│   │   ├── agents/                      # AgentFrameworkPanel
│   │   ├── charts/                      # BFSICharts, SalesCharts, EconomyCharts
│   │   ├── ai/                          # AIQueryPanel
│   │   └── shared/                      # KPICard, ArchitectureBar, ErrorBoundary
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── providers.ts             # AI provider abstraction (Anthropic/Google/OpenAI/Ollama)
│   │   │   └── prompts.ts               # Domain system prompts + generic fallback
│   │   ├── apiKeys.ts                   # API key localStorage persistence
│   │   ├── infraKeys.ts                 # ETL infra config localStorage persistence
│   │   ├── dataSources.ts               # Per-flow data source CRUD
│   │   └── customFlows.ts               # Custom flow + override CRUD, getMergedCategories()
│   ├── hooks/
│   │   ├── usePipeline.ts
│   │   └── useAIQuery.ts
│   └── types/index.ts
├── README.md
├── BRD.md
├── FRD.md
├── IMPLEMENTATION_GUIDE.md
├── TECH_ARCHITECTURE.md
├── API_SPEC.md
├── DATA_DICTIONARY.md
└── package.json
```

---

## Documentation

| Document | Description |
|---|---|
| [BRD.md](BRD.md) | Business Requirements Document |
| [FRD.md](FRD.md) | Functional Requirements Document |
| [TECH_ARCHITECTURE.md](TECH_ARCHITECTURE.md) | Technical Architecture & system design |
| [API_SPEC.md](API_SPEC.md) | AI Provider API integration specifications |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Developer runbook, setup, extending the platform |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | All data models and schema definitions |

---

## License

Proprietary — Technology Consulting Practice. All rights reserved.

---

*Fabric v2.0.0 · April 2026*
