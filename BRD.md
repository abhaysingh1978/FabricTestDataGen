# Business Requirements Document (BRD)

**Project:** Fabric — Agentic ETL, AI & Multi-Agent Platform  
**Version:** 2.0.0  
**Status:** Approved  
**Prepared by:** Technology Consulting Practice  
**Date:** April 2026  
**Classification:** Confidential  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Context & Problem Statement](#2-business-context--problem-statement)
3. [Stakeholders](#3-stakeholders)
4. [Business Objectives](#4-business-objectives)
5. [Scope](#5-scope)
6. [Use Case Domains](#6-use-case-domains)
7. [Business Requirements](#7-business-requirements)
8. [Constraints & Assumptions](#8-constraints--assumptions)
9. [Success Criteria](#9-success-criteria)
10. [Risks](#10-risks)
11. [Change Log](#11-change-log)

---

## 1. Executive Summary

**Fabric** is a flagship client-facing demonstration and production-ready platform built by our Technology Consulting Practice to showcase enterprise-grade capabilities across:

- **High-volume, complex ETL pipelines** with multi-stage orchestration
- **Modern real-time dashboarding** and reporting
- **Multi-Agent AI frameworks** with Agent-to-Agent (A2A) communication
- **Configurable AI inference** supporting both local open-source models (DeepSeek, Llama, Gemma, Mistral, Phi) and cloud-hosted models (Anthropic Claude, Google Gemini, OpenAI GPT-4o)
- **Self-service flow onboarding** — new use case domains can be configured and launched via the UI without engineering involvement
- **Enterprise data source connectivity** — 40+ source types with per-flow configuration and infrastructure wizards

The platform is designed as a **live, interactive demonstration environment** presented to prospective and existing clients. It doubles as a production blueprint that can be instantiated for client engagements. Version 2.0 adds self-service extensibility, removing the dependency on engineering for demo customisation.

---

## 2. Business Context & Problem Statement

### 2.1 Business Context

The Technology Consulting Practice is experiencing increased demand from enterprise clients seeking:

1. Proof-of-concept environments for AI-driven data platforms before committing to full implementations
2. Real demonstrations of multi-agent orchestration, not slide-deck promises
3. Configurable AI stacks that allow evaluation of open-source vs. proprietary models in the context of their own data
4. Integrated ETL + AI + Dashboarding solutions rather than point-solution assemblies
5. Domain-specific demonstrations tailored to the prospect's industry vertical
6. Transparency around data connectivity — clients ask "can this connect to our systems?"

### 2.2 Problem Statement

Sales and pre-sales cycles suffer from the following pain points:

| Pain Point | Impact |
|---|---|
| No unified demo environment | Engineers rebuild demos for every prospect — high cost, inconsistent quality |
| Abstract AI capability claims | Clients demand working prototypes, not whiteboards |
| No model comparison capability | Clients cannot evaluate DeepSeek vs Claude vs Gemini side-by-side |
| Domain-agnostic demos | Generic demos fail to resonate with BFSI, Sales, or Economics buyers |
| Long time-to-demo | Current setup takes 2–3 weeks per engagement |
| No data source transparency | Clients question integration depth without seeing real connector configurations |
| Engineering dependency for new domains | Adding a new vertical requires code changes, delaying pre-sales cycles |

### 2.3 Opportunity

A single, high-quality, configurable demo platform — **Fabric v2** — addresses all of the above. It compresses pre-sales cycles, demonstrates technical depth, allows consultants to onboard new industry domains without engineering, and shows real connector configuration depth to technically sophisticated buyers.

---

## 3. Stakeholders

| Role | Team | Interest |
|---|---|---|
| Executive Sponsor | Managing Director, Tech Practice | Revenue growth, competitive positioning |
| Product Owner | VP Consulting | Demo quality, win-rate improvement |
| Pre-Sales Team | Solutions Engineers | Ease of use, client customisation, zero-code flow creation |
| Delivery Team | Principal Engineers | Buildability, maintainability, extensibility |
| End Clients (Prospects) | BFSI / Sales / Economy / Other buyers | Technical credibility, relevance to their domain |
| Data Engineering Practice | Data Practice Lead | ETL architecture standards, connector coverage |
| AI/ML Practice | AI Practice Lead | Model integration, agent design, prompt quality |

---

## 4. Business Objectives

| # | Objective | Metric | Target |
|---|---|---|---|
| BO-01 | Reduce demo preparation time | Hours per engagement | ≤ 4 hrs (from ~60 hrs) |
| BO-02 | Increase demo-to-proposal conversion | % conversion | +25% vs baseline |
| BO-03 | Showcase ETL throughput capability | Records/second demonstrated | ≥ 1M records/cycle |
| BO-04 | Enable AI model switching | # models configurable at runtime | ≥ 10 (5 local + 5 cloud) |
| BO-05 | Cover target verticals out of the box | # verticals with built-in use cases | 3 (BFSI, Sales, Economy) |
| BO-06 | Enable new domain onboarding without code | Time to add a new demo domain | ≤ 30 minutes via UI |
| BO-07 | Demonstrate data connectivity depth | # data source types connectable | ≥ 40 across 7 categories |
| BO-08 | Support infrastructure configuration transparency | # ETL services with full wizard | ≥ 20 services |
| BO-09 | Allow built-in demo customisation | Built-in flows editable without code | 100% of built-in flows |

---

## 5. Scope

### 5.1 In Scope

**v2.0 (Current)**

- Five built-in use cases across three verticals (BFSI: 3, Sales: 1, Economy: 1)
- Ten AI models (5 cloud, 5 local via Ollama)
- Six-stage ETL pipeline simulation with live log terminal
- Multi-agent framework with A2A message visualisation
- Domain-specific analytics dashboards (BFSI, Sales, Economy)
- AI query interface with domain-specific system prompts and preset queries
- **Configuration management:** API key storage, model selection, ETL infrastructure selection
- **Infrastructure wizards:** Multi-step guided configuration for 23+ ETL services with embedded how-to guides
- **Data source management:** Per-flow configuration of 40+ source types across 7 categories
- **AI provider setup guides:** Step-by-step onboarding for Anthropic, Google AI, OpenAI, Ollama
- **Flow Manager:** Create custom flows with category, icon, colour, datasets, agents, KPIs
- **Built-in flow editing:** Override any built-in flow's metadata; reset to defaults on demand
- **Intelligent suggestions:** Domain-ranked dataset and agent autocomplete (16 industry domains)
- **Flow persistence:** All custom flows and overrides stored in browser localStorage
- Browser-based SPA — no backend required for demo mode

### 5.2 Out of Scope (v2.0)

- Real-time data pipeline execution (simulation only)
- User authentication and multi-user access control
- Server-side configuration persistence
- Mobile/tablet optimised layout
- Internationalisation (i18n)
- White-label theming per client

### 5.3 Future Considerations (v3.0+)

- Real data connector execution mode (Airbyte/Fivetran integration)
- Backend configuration profiles (per presenter, per client)
- Client-specific branding themes
- Embedded analytics export (PDF/PowerPoint)
- Natural language flow creation ("Create a healthcare analytics flow")

---

## 6. Use Case Domains

### 6.1 Built-in Domains

| Domain | Category | Use Cases | Agents | Datasets |
|---|---|---|---|---|
| Stock Analysis | BFSI | 1 | Market Data, Technical Analysis, Sentiment, Risk, Report | NYSE/NASDAQ, Options Chain, SEC Filings, Sentiment Data, Macro Indicators |
| Financial Advisory | BFSI | 1 | Portfolio, Risk Profiler, Rebalance, Tax, Client Report | Portfolio Holdings, Market Benchmarks, Client Profiles, Tax Records, ESG Ratings |
| Fund Performance | BFSI | 1 | Performance, Attribution, Factor, Compliance, Board Report | Fund NAV History, Benchmark Indices, Factor Models, Compliance Rules, Investor Reports |
| Smartphone Sales | Sales | 1 | Market Share, Sentiment, Pricing, Channel, Forecast | Retail POS Data, Review Platforms, Pricing APIs, Channel Reports, Carrier Data |
| World Economies | Economy | 1 | GDP, Trade, Inflation, FX, Geopolitical Risk | World Bank API, IMF Data, Central Bank Feeds, Trade Statistics, Geopolitical Indices |

### 6.2 Custom Domain Capability

Pre-sales consultants can create new domains via the Flow Manager without engineering involvement. The system provides:

- Domain name, icon, description, and category assignment
- Tag-based dataset and agent definition with intelligent autocomplete
- Up to 4 configurable KPI cards with values and delta indicators
- Immediate appearance in the top navigation bar
- AI query support via a generic domain-aware system prompt

---

## 7. Business Requirements

### 7.1 Platform Availability

| ID | Requirement |
|---|---|
| BR-01 | The platform shall run entirely in a web browser with no backend infrastructure for demo purposes |
| BR-02 | The platform shall function offline (local AI models + simulated ETL) when network access is unavailable |
| BR-03 | The platform shall load and be demo-ready within 5 seconds on a standard laptop |

### 7.2 Demo Experience

| ID | Requirement |
|---|---|
| BR-04 | A consultant shall be able to demonstrate a live ETL pipeline with multi-agent activity within 60 seconds of opening the platform |
| BR-05 | The platform shall support switching AI models during a live demo without page reload |
| BR-06 | AI query responses shall be contextually relevant to the active use case domain |
| BR-07 | All visual elements shall be legible on a 1920×1080 screen projected to a conference room display |

### 7.3 Configuration & Extensibility

| ID | Requirement |
|---|---|
| BR-08 | A consultant shall be able to add a new custom flow domain via the UI in under 30 minutes |
| BR-09 | A consultant shall be able to edit any built-in flow's content (agents, datasets, KPIs) without code changes |
| BR-10 | Edited built-in flows shall be resettable to their default state at any time |
| BR-11 | All configuration (API keys, infra settings, custom flows) shall persist across browser sessions via localStorage |
| BR-12 | The platform shall provide embedded setup guides for all supported ETL infrastructure services |
| BR-13 | The platform shall provide step-by-step onboarding guides for all AI provider API keys |

### 7.4 Data Source Demonstration

| ID | Requirement |
|---|---|
| BR-14 | The platform shall demonstrate connectivity to ≥ 40 data source types |
| BR-15 | Data source configuration shall be scoped per flow, not globally |
| BR-16 | Each configurable data source shall have a dedicated configuration form with provider-specific fields |

---

## 8. Constraints & Assumptions

### 8.1 Constraints

| Constraint | Detail |
|---|---|
| Browser-only | No server-side infrastructure — all state in browser localStorage |
| Simulated ETL | Pipeline execution is simulated; no live data connectors in v2 |
| API key security | Keys stored in localStorage — not suitable for shared/public deployments |
| Screen resolution | Designed for 1280×800 minimum; optimum 1920×1080 |
| Single user | No multi-user or role-based access in v2 |

### 8.2 Assumptions

- Presenters have access to a laptop with Chrome 110+ or equivalent modern browser
- AI provider API keys are sourced and funded by the practice or engagement budget
- For local model demos, the presenter's laptop has ≥ 8GB RAM and Ollama installed
- Custom flow domains created via the UI are for demonstration purposes; production data architecture requires engineering engagement
- Browser localStorage is not cleared between sessions (presenters use a dedicated demo profile)

---

## 9. Success Criteria

| Criterion | Measurement | Target |
|---|---|---|
| Demo preparation time | Average hours from request to demo-ready | ≤ 4 hours |
| Demo-to-proposal conversion | % of demos resulting in proposal request | +25% vs pre-Fabric baseline |
| New domain onboarding | Time for consultant to create new flow via UI | ≤ 30 minutes |
| Platform reliability | Demo sessions with zero technical failures | ≥ 95% |
| AI response quality | Facilitator satisfaction rating (1–5) | ≥ 4.2/5 |
| Client engagement | Average time clients spend interacting with AI query | ≥ 3 minutes per demo |
| Built-in flow coverage | % of built-in flows with at least one customisation option used | Tracked per engagement |

---

## 10. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | AI API rate limit hit during live demo | Medium | High | Cache last response; have fallback model pre-selected |
| R-02 | Ollama local model too slow on presenter laptop | Medium | Medium | Pre-qualify laptop; default to cloud model; use 7B models |
| R-03 | localStorage cleared (browser update, incognito) | Low | Medium | Export/import config feature planned for v3 |
| R-04 | Gemini 2.5 Pro returns empty response | Low | High | Token budget guardrail implemented (min 8,192 output tokens) |
| R-05 | Custom flow not sufficiently domain-specific | Low | Medium | Generic AI prompt fallback; consultant customises presets |
| R-06 | Client asks for live data — simulation not sufficient | Medium | Medium | Position as blueprint; offer rapid POC engagement |
| R-07 | API key exposed via browser DevTools | Low | High | Advise dedicated demo browser profile; v3 proxy layer |

---

## 11. Change Log

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0.0 | April 2026 | Technology Consulting Practice | Initial release — 5 use cases, 10 models, ETL simulation |
| 2.0.0 | April 2026 | Technology Consulting Practice | Added Flow Manager, built-in flow editing, infrastructure wizards with guides, per-flow data source management (40+ types), AI provider setup guides, API key management, RDBMS warehouse support, intelligent dataset/agent suggestions |

---

*Document End — BRD v2.0.0*
