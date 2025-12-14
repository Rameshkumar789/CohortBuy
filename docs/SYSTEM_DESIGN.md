# Cohort Platform - System Design Document

**Version:** 2.0  
**Date:** December 2025  
**Status:** Architecture Specification

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Vision](#2-platform-vision)
3. [The Three Platform Sides](#3-the-three-platform-sides)
4. [Agent Architecture](#4-agent-architecture)
5. [Database Design](#5-database-design)
6. [API Specifications](#6-api-specifications)
7. [Security & Compliance](#7-security--compliance)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. Executive Summary

Cohort is an **Agentic Commerce Platform** that inverts the traditional retail model. Instead of suppliers listing products for buyers to find, the platform aggregates buyer demand into "cohorts" and uses autonomous AI agents to negotiate wholesale deals.

### Core Value Proposition

| Stakeholder | Current Pain | Cohort Solution |
|------------|--------------|-----------------|
| **Buyers** | Pay 30%+ retail markup, zero negotiating power | Wholesale prices through collective buying power |
| **Suppliers** | Amazon fees (15-30%), public price wars, unpredictable demand | Zero platform fees, private pricing, guaranteed bulk orders |
| **Platform** | — | 20% take rate on buyer savings |

### The "Dark Pool" Mechanism

Unlike public marketplaces where prices race to the bottom, Cohort creates **private, opaque deals**:

1. **Demand Aggregation**: 50 buyers want a Sony A7IV camera
2. **AI Negotiation**: Platform agent contacts suppliers with $90,000 escrow proof
3. **Private Deal**: Supplier accepts at wholesale price (never published publicly)
4. **Protected Brands**: Suppliers clear inventory without damaging retail relationships

---

## 2. Platform Vision

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COHORT PLATFORM OVERVIEW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐                             ┌─────────────────┐       │
│   │  CUSTOMER SIDE  │                             │  SUPPLIER SIDE  │       │
│   │                 │                             │                 │       │
│   │ • Chrome Plugin │                             │ • Supplier Portal│       │
│   │ • Web Dashboard │                             │ • Catalog Import │       │
│   │ • Pool Creation │                             │ • Inventory Mgmt │       │
│   │ • Pool Joining  │                             │ • Agent Config   │       │
│   │                 │                             │ • Order Mgmt     │       │
│   └────────┬────────┘                             └────────┬────────┘       │
│            │                                               │                │
│            │         ┌─────────────────────────┐           │                │
│            └────────►│  COHORT SUPER AGENT     │◄──────────┘                │
│                      │  (24/7 Orchestrator)    │                            │
│                      │                         │                            │
│                      │  • Global Catalog Agent │                            │
│                      │  • Negotiator Agent     │                            │
│                      │  • Pool Monitor         │                            │
│                      │  • Payment Orchestrator │                            │
│                      └─────────────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Three Platform Sides

### 3.1 SIDE 1: Customer Side

The customer-facing portion of the platform consists of two primary touchpoints:

#### 3.1.1 Chrome Extension

**Purpose**: Capture demand from anywhere on the web and connect to existing pools.

**Technical Stack**: Plasmo (React), Manifest V3

**User Journey**:

```
┌──────────────────────────────────────────────────────────────────┐
│                    CHROME EXTENSION FLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User browsing Amazon.com/dp/B0XXXXX (Sony A7IV)                │
│                          │                                       │
│                          ▼                                       │
│  ┌────────────────────────────────────────────┐                 │
│  │ Extension detects product page             │                 │
│  │ • Scrapes JSON-LD / Open Graph data        │                 │
│  │ • Extracts: title, price, brand, image     │                 │
│  └────────────────────────────────────────────┘                 │
│                          │                                       │
│                          ▼                                       │
│  ┌────────────────────────────────────────────┐                 │
│  │ Query Global Catalog Agent                 │                 │
│  │ "Does this product exist in our catalog?"  │                 │
│  └────────────────────────────────────────────┘                 │
│                          │                                       │
│          ┌───────────────┴───────────────┐                      │
│          │                               │                      │
│          ▼                               ▼                      │
│   ┌─────────────┐                 ┌─────────────┐               │
│   │ FOUND       │                 │ NOT FOUND   │               │
│   └──────┬──────┘                 └──────┬──────┘               │
│          │                               │                      │
│          ▼                               ▼                      │
│   ┌─────────────────┐             ┌─────────────────┐           │
│   │ Check for       │             │ "Be the first!  │           │
│   │ active pools    │             │  Create a pool" │           │
│   └────────┬────────┘             └─────────────────┘           │
│            │                                                    │
│    ┌───────┴───────┐                                           │
│    │               │                                           │
│    ▼               ▼                                           │
│ ┌──────────┐  ┌──────────────┐                                 │
│ │ POOL     │  │ NO POOL      │                                 │
│ │ EXISTS   │  │ EXISTS       │                                 │
│ │          │  │              │                                 │
│ │ "Join    │  │ "Create new  │                                 │
│ │ pool!    │  │  pool for    │                                 │
│ │ 8 spots  │  │  best price" │                                 │
│ │ left"    │  │              │                                 │
│ └──────────┘  └──────────────┘                                 │
│                                                                 │
└──────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- **Session Sharing**: Reuses auth from web app (no double login)
- **Overlay Injection**: Shows "Check Cohort Price" button on retailer sites
- **Real-time Pool Status**: Live count of pool participants

---

#### 3.1.2 Customer Web Dashboard

**Purpose**: Central hub for managing pools, pledges, and orders.

**Technical Stack**: Next.js 15, React, Tailwind CSS, Supabase

**Pages**:

| Page | Description | Auth |
|------|-------------|------|
| `/` | Landing page with invite code gate | Public |
| `/login` | Customer authentication | Public |
| `/dashboard` | Overview of user's pools and orders | Private |
| `/pools` | Browse all active pools on platform | Private |
| `/pools/[id]` | Pool detail with progress, join button | Private |
| `/catalog` | Browse Global Catalog (products for sale) | Private |
| `/orders` | Track order status and shipments | Private |
| `/settings` | Shipping address, payment methods | Private |

**Dashboard Features**:

```
┌────────────────────────────────────────────────────────────────┐
│                     CUSTOMER DASHBOARD                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MY ACTIVE POOLS                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 📦 Sony A7IV Camera     │ 42/50 joined │ $1,800 target │   │
│  │ 📦 MacBook Pro M4       │ 18/25 joined │ $2,100 target │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ALL PLATFORM POOLS                              [Browse]│   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 🔥 Trending: PlayStation 5 Pro   │ 89/100 │ 12hrs left │   │
│  │ 🆕 New: Dyson V15                │ 5/30   │ 5 days    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CREATE NEW POOL              [+ Create Pool]            │   │
│  │ Search catalog or paste product URL                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ GLOBAL CATALOG                               [Browse]   │   │
│  │ View all products available from verified suppliers     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### 3.2 SIDE 2: Supplier Side

The supplier-facing portion enables sellers to participate in the marketplace.

#### 3.2.1 Supplier Portal

**Purpose**: Onboard suppliers, manage catalog, configure AI agent, handle orders.

**Technical Stack**: Next.js 15, React, Tailwind CSS, Supabase

#### Supplier Journey (Complete Flow):

```
┌──────────────────────────────────────────────────────────────────┐
│                      SUPPLIER JOURNEY                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP A: SIGNUP / LOGIN                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ • Business email registration                              │  │
│  │ • Business verification (name, tax ID, website)            │  │
│  │ • Stripe Connect onboarding (for payouts)                  │  │
│  │ • Approval by platform admin                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  STEP B: IMPORT CATALOG / INVENTORY / PRICE                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │  │
│  │   │ CSV Upload  │    │ API Sync    │    │ Manual Entry│   │  │
│  │   │             │    │ (Shopify,   │    │             │   │  │
│  │   │ Bulk import │    │  BigCommerce)│   │ One by one  │   │  │
│  │   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘   │  │
│  │          │                  │                  │          │  │
│  │          └──────────────────┼──────────────────┘          │  │
│  │                             │                             │  │
│  │                             ▼                             │  │
│  │   ┌─────────────────────────────────────────────────────┐ │  │
│  │   │              MATCHING SYSTEM                        │ │  │
│  │   │                                                     │ │  │
│  │   │  For each product:                                  │ │  │
│  │   │  1. Search Global Catalog for matches               │ │  │
│  │   │  2. If match found (>90% confidence):               │ │  │
│  │   │     → Alert: "We found Sony A7IV. Link to this?"    │ │  │
│  │   │     → Supplier confirms OR creates new              │ │  │
│  │   │  3. If no match:                                    │ │  │
│  │   │     → Create new Global Catalog entry               │ │  │
│  │   │  4. Create supplier_catalog entry with:             │ │  │
│  │   │     → Supplier's SKU, price, wholesale price        │ │  │
│  │   │     → Inventory count                               │ │  │
│  │   └─────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  STEP C: SETUP NEGOTIATION AGENT                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  NEGOTIATION MODE:                                         │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │  │
│  │  │    AUTO     │ │  SEMI-AUTO  │ │   MANUAL    │          │  │
│  │  │             │ │             │ │             │          │  │
│  │  │ AI handles  │ │ AI handles  │ │ All offers  │          │  │
│  │  │ everything  │ │ within      │ │ require     │          │  │
│  │  │ per rules   │ │ thresholds  │ │ human       │          │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │  │
│  │                                                            │  │
│  │  AUTO-ACCEPT RULES:                                        │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ Minimum order quantity:     [ 10 ] units             │ │  │
│  │  │ Minimum margin:             [ 15 ] %                 │ │  │
│  │  │ Maximum discount from MSRP: [ 25 ] %                 │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ESCALATION RULES (Semi-Auto):                            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ Escalate if order value > [ $50,000 ]                │ │  │
│  │  │ Escalate if margin below  [ 10 ] %                   │ │  │
│  │  │ Always escalate for SKUs: [ ______ ]                 │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  STEP D: UPDATE PRICE / INVENTORY                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ • Real-time inventory sync via API                         │  │
│  │ • Manual updates via portal                                │  │
│  │ • Bulk CSV re-upload                                       │  │
│  │ • Low stock alerts                                         │  │
│  │ • Price change notifications to active pools               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  STEP E: ORDER MANAGEMENT                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  ACTIVE DEALS                                              │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │ Pool #123 - Sony A7IV                              │   │  │
│  │  │ Qty: 50 units │ Price: $1,750/ea │ Total: $87,500  │   │  │
│  │  │ Status: WAITING FOR ACCEPTANCE                     │   │  │
│  │  │ [ACCEPT] [COUNTER] [REJECT]                        │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  │  CONFIRMED ORDERS                                          │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │ Order #456 - 50x Sony A7IV                         │   │  │
│  │  │ Status: PROCESSING                                 │   │  │
│  │  │ Ship to: [Individual addresses provided]           │   │  │
│  │  │ [Upload Tracking Numbers]                          │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 3.3 SIDE 3: Cohort Super Agent (Platform Intelligence)

The AI-powered backbone that runs 24/7, mediating between customers and suppliers.

#### 3.3.1 Agent Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│                    COHORT SUPER AGENT                             │
│                   (24/7 Orchestrator)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   SUPER AGENT                              │  │
│  │                                                            │  │
│  │  Responsibilities:                                         │  │
│  │  • Monitor all active pools                                │  │
│  │  • Trigger negotiations when targets met                   │  │
│  │  • Orchestrate payment capture                             │  │
│  │  • Handle pool expirations                                 │  │
│  │  • Send notifications                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│          ┌───────────────────┼───────────────────┐               │
│          │                   │                   │               │
│          ▼                   ▼                   ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   GLOBAL     │    │  NEGOTIATOR  │    │   SUPPLIER   │       │
│  │   CATALOG    │    │    AGENT     │    │    AGENT     │       │
│  │    AGENT     │    │              │    │              │       │
│  │              │    │ (Per-Pool)   │    │(Per-Supplier)│       │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤       │
│  │              │    │              │    │              │       │
│  │ • Search     │    │ • Find       │    │ • Evaluate   │       │
│  │   products   │    │   eligible   │    │   offers     │       │
│  │ • Match      │    │   suppliers  │    │ • Apply      │       │
│  │   imports    │    │ • Send RFQs  │    │   rules      │       │
│  │ • Find       │    │ • Compare    │    │ • Auto/Manual│       │
│  │   similar    │    │   offers     │    │   response   │       │
│  │ • Normalize  │    │ • Select     │    │ • Escalate   │       │
│  │   data       │    │   winner     │    │   to human   │       │
│  │              │    │              │    │              │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
│  OWNED BY: Platform   OWNED BY: Platform  REPRESENTS: Supplier  │
│  SERVES: All users    SERVES: Buyers      SERVES: Seller        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Agent Interaction Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│              NEGOTIATION FLOW (The Core Loop)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TIME 0: Pool reaches 50/50 target                               │
│                                                                  │
│  ┌─────────────────┐                                            │
│  │  SUPER AGENT    │ ──── Detects target met                    │
│  └────────┬────────┘                                            │
│           │                                                      │
│           │ Spawns                                               │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ NEGOTIATOR      │                                            │
│  │ AGENT           │                                            │
│  │ (Pool #123)     │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           │ 1. Query Global Catalog Agent                        │
│           │    "Get suppliers for product XYZ"                   │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ GLOBAL CATALOG  │ ──── Returns: Supplier A, B, C             │
│  │ AGENT           │      (all have inventory)                  │
│  └─────────────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │   For each supplier:                                    │    │
│  │                                                         │    │
│  │   NEGOTIATOR ────────► SUPPLIER AGENT A                 │    │
│  │   "50 units @ $1,800?"                                  │    │
│  │                                                         │    │
│  │   ┌─────────────────────────────────────────────────┐   │    │
│  │   │ SUPPLIER AGENT A checks rules:                  │   │    │
│  │   │                                                 │   │    │
│  │   │ Mode: AUTO                                      │   │    │
│  │   │ Min qty: 10 ✓ (50 > 10)                        │   │    │
│  │   │ Min margin: 15% ✓ (margin = 18%)               │   │    │
│  │   │                                                 │   │    │
│  │   │ Result: AUTO-ACCEPT @ $1,750                    │   │    │
│  │   └─────────────────────────────────────────────────┘   │    │
│  │                                                         │    │
│  │   SUPPLIER AGENT A ────────► NEGOTIATOR                 │    │
│  │   "Accept @ $1,750"                                     │    │
│  │                                                         │    │
│  │   ─────────────────────────────────────────────────     │    │
│  │                                                         │    │
│  │   SUPPLIER AGENT B (Mode: MANUAL)                       │    │
│  │   → Escalates to Supplier Portal                        │    │
│  │   → Human sees notification                             │    │
│  │   → Human responds "Counter @ $1,820"                   │    │
│  │                                                         │    │
│  │   SUPPLIER AGENT B ────────► NEGOTIATOR                 │    │
│  │   "Counter @ $1,820"                                    │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│           │                                                      │
│           │ Compare offers                                       │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ NEGOTIATOR      │ ──── Best offer: Supplier A @ $1,750       │
│  │ AGENT           │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           │ Report back                                          │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │  SUPER AGENT    │                                            │
│  │                 │                                            │
│  │  1. Lock pool   │                                            │
│  │  2. Capture 50  │                                            │
│  │     payments    │                                            │
│  │  3. Create      │                                            │
│  │     orders      │                                            │
│  │  4. Notify      │                                            │
│  │     everyone    │                                            │
│  └─────────────────┘                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### 3.3.3 Global Catalog Agent (Utility Service)

This agent is shared by all components for product operations:

```
┌──────────────────────────────────────────────────────────────────┐
│                    GLOBAL CATALOG AGENT                           │
│                    (Utility Service)                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CONSUMERS:                                                      │
│  • Chrome Extension (product lookup)                             │
│  • Customer Dashboard (catalog browse)                           │
│  • Supplier Portal (import matching)                             │
│  • Negotiator Agent (find suppliers)                             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────   │
│                                                                  │
│  CAPABILITIES:                                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ search_product(query)                                      │  │
│  │ → Full-text + semantic search                              │  │
│  │ → Returns products with similarity scores                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ match_product(scraped_data)                                │  │
│  │ → Used by extension and supplier import                    │  │
│  │ → Matches via: UPC/GTIN → Brand+Title → Vector similarity  │  │
│  │ → Returns match candidates with confidence scores          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ get_suppliers(product_id)                                  │  │
│  │ → Returns all suppliers tagged to this product             │  │
│  │ → Includes: inventory, price, wholesale price              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ normalize_product(raw_data)                                │  │
│  │ → Uses LLM to extract: brand, model, category, attributes  │  │
│  │ → Generates embedding for similarity search                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Agent Architecture

### 4.1 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Agent Runtime | LangGraph (Python) | Stateful agent workflows |
| LLM | OpenAI GPT-4 / Claude | Reasoning, negotiation, normalization |
| Embeddings | OpenAI text-embedding-3 | Product similarity search |
| State Storage | PostgreSQL + LangGraph Checkpointing | Agent state persistence |
| Message Queue | Supabase Realtime / Redis | Agent coordination |

### 4.2 Agent State Schemas

```python
# Super Agent State
class SuperAgentState(TypedDict):
    active_pool_ids: List[str]
    pools_pending_negotiation: List[str]
    pools_in_negotiation: List[str]
    current_time: datetime
    
# Negotiator Agent State
class NegotiatorState(TypedDict):
    pool_id: str
    product_id: str
    target_price: float
    quantity: int
    eligible_suppliers: List[dict]
    offers_received: List[dict]
    best_offer: Optional[dict]
    status: str  # 'gathering_offers' | 'evaluating' | 'complete'

# Supplier Agent State
class SupplierAgentState(TypedDict):
    supplier_id: str
    config: SupplierConfig
    pending_rfqs: List[dict]
    active_deals: List[dict]
```

---

## 5. Database Design

### 5.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐         ┌────────────────┐         ┌────────────────┐  │
│  │    PROFILES    │         │   SUPPLIERS    │         │ GLOBAL_CATALOG │  │
│  ├────────────────┤         ├────────────────┤         ├────────────────┤  │
│  │ id (PK)        │         │ id (PK)        │         │ id (PK)        │  │
│  │ email          │         │ user_id (FK)   │────────►│ title          │  │
│  │ role           │         │ business_name  │         │ brand          │  │
│  │ stripe_id      │         │ verified       │         │ category       │  │
│  └────────────────┘         │ agent_config   │         │ embedding      │  │
│         │                   └────────────────┘         │ variant_axes   │  │
│         │                          │                   └────────────────┘  │
│         │                          │                          │            │
│         │                          │                          │            │
│         │                          ▼                          ▼            │
│         │               ┌─────────────────────┐    ┌─────────────────────┐ │
│         │               │  SUPPLIER_CATALOG   │    │  PRODUCT_VARIANTS   │ │
│         │               ├─────────────────────┤    ├─────────────────────┤ │
│         │               │ id (PK)             │    │ id (PK)             │ │
│         │               │ supplier_id (FK)    │    │ parent_id (FK)      │ │
│         │               │ variant_id (FK)     │◄───│ variant_values      │ │
│         │               │ price               │    │ sku                 │ │
│         │               │ wholesale_price     │    │ upc                 │ │
│         │               │ inventory_count     │    └─────────────────────┘ │
│         │               └─────────────────────┘                            │
│         │                                                                  │
│         │    ┌────────────────┐         ┌────────────────┐                │
│         │    │     POOLS      │         │    PLEDGES     │                │
│         │    ├────────────────┤         ├────────────────┤                │
│         │    │ id (PK)        │◄────────│ pool_id (FK)   │                │
│         │    │ product_id (FK)│         │ user_id (FK)   │◄───────────────┘
│         │    │ target_price   │         │ amount         │                │
│         │    │ target_qty     │         │ stripe_pi_id   │                │
│         │    │ current_qty    │         │ status         │                │
│         │    │ status         │         └────────────────┘                │
│         │    │ expires_at     │                                           │
│         │    │ matched_supplier│────────┐                                 │
│         │    └────────────────┘        │                                  │
│         │             │                │                                  │
│         │             │                ▼                                  │
│         │             │      ┌────────────────┐                          │
│         │             │      │     ORDERS     │                          │
│         │             │      ├────────────────┤                          │
│         └─────────────┼─────►│ user_id (FK)   │                          │
│                       │      │ pool_id (FK)   │◄─────────────────────────┘
│                       │      │ supplier_id (FK)│                          │
│                       │      │ status         │                          │
│                       │      │ tracking       │                          │
│                       │      └────────────────┘                          │
│                       │                                                  │
└───────────────────────┼──────────────────────────────────────────────────┘
```

### 5.2 SQL Schema (Core Tables)

```sql
-- Global Catalog (Parent Products)
CREATE TABLE global_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    brand TEXT,
    category_path TEXT[],
    variant_axes TEXT[],           -- ['color', 'storage']
    embedding VECTOR(1536),
    reference_price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants (SKU-level)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_product_id UUID REFERENCES global_catalog(id),
    variant_values JSONB,          -- {"color": "Black", "storage": "256GB"}
    sku TEXT,
    upc TEXT,
    gtin TEXT,
    UNIQUE(parent_product_id, variant_values)
);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    business_name TEXT NOT NULL,
    business_type TEXT,
    verified_at TIMESTAMPTZ,
    agent_config JSONB,            -- Negotiation mode, rules
    stripe_connect_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Catalog (Links suppliers to variants)
CREATE TABLE supplier_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    variant_id UUID REFERENCES product_variants(id),
    supplier_sku TEXT,
    price NUMERIC NOT NULL,
    wholesale_price NUMERIC,
    inventory_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(supplier_id, variant_id)
);

-- Pools (Cohorts)
CREATE TABLE pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_product_id UUID REFERENCES global_catalog(id),
    variant_id UUID REFERENCES product_variants(id),  -- NULL = any variant OK
    target_price NUMERIC NOT NULL,
    target_quantity INT NOT NULL,
    current_quantity INT DEFAULT 0,
    status TEXT DEFAULT 'FORMING',
    expires_at TIMESTAMPTZ NOT NULL,
    matched_supplier_id UUID REFERENCES suppliers(id),
    negotiated_price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pledges (User commitments to pools)
CREATE TABLE pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES pools(id),
    user_id UUID REFERENCES auth.users(id),
    variant_id UUID REFERENCES product_variants(id),
    amount_cents INT NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pool_id, user_id)
);

-- Orders (Post-capture)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES pools(id),
    pledge_id UUID REFERENCES pledges(id),
    user_id UUID REFERENCES auth.users(id),
    supplier_id UUID REFERENCES suppliers(id),
    amount_cents INT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    shipping_address JSONB,
    tracking_number TEXT,
    carrier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. API Specifications

### 6.1 Customer APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/catalog/search` | GET | Search global catalog |
| `/api/catalog/product/:id` | GET | Get product details + variants |
| `/api/pools` | GET | List all active pools |
| `/api/pools/:id` | GET | Get pool details |
| `/api/pools` | POST | Create new pool |
| `/api/pools/:id/join` | POST | Join pool with payment |
| `/api/pledges` | GET | Get user's pledges |
| `/api/orders` | GET | Get user's orders |

### 6.2 Supplier APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/supplier/catalog` | GET | Get supplier's catalog |
| `/api/supplier/catalog/import` | POST | Bulk import products |
| `/api/supplier/catalog/:id` | PUT | Update product |
| `/api/supplier/deals` | GET | Get pending deal requests |
| `/api/supplier/deals/:id/respond` | POST | Accept/counter/reject deal |
| `/api/supplier/orders` | GET | Get supplier's orders |
| `/api/supplier/orders/:id/ship` | POST | Upload tracking info |
| `/api/supplier/config` | PUT | Update agent config |

---

## 7. Security & Compliance

| Area | Implementation |
|------|----------------|
| **Authentication** | Supabase Auth (JWT) |
| **Authorization** | Row Level Security (RLS) policies |
| **Payment Security** | Stripe Elements (PCI SAQ-A compliant) |
| **Data Isolation** | Suppliers only see their own data |
| **API Rate Limiting** | Edge function rate limits |

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Database schema setup
- [ ] Supabase project configuration
- [ ] Basic customer authentication
- [ ] Global Catalog Agent (search)

### Phase 2: Customer MVP (Weeks 3-4)
- [ ] Customer dashboard
- [ ] Pool creation/joining
- [ ] Chrome extension v1
- [ ] Stripe payment integration

### Phase 3: Supplier MVP (Weeks 5-6)
- [ ] Supplier authentication
- [ ] Supplier portal
- [ ] Catalog import with matching
- [ ] Manual deal acceptance

### Phase 4: Agent Automation (Weeks 7-8)
- [ ] Cohort Super Agent
- [ ] Negotiator Agent
- [ ] Supplier Agent with auto/manual modes
- [ ] Order management

### Phase 5: Polish (Month 2+)
- [ ] Notifications (email/SMS)
- [ ] Analytics dashboard
- [ ] Admin "God Mode"
- [ ] Production scaling

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| **Pool/Cohort** | A group of buyers aggregating demand for a product |
| **Pledge** | A buyer's commitment to purchase (with authorized payment) |
| **RFQ** | Request for Quote - offer sent to supplier |
| **Global Catalog** | Platform's master product database |
| **Supplier Catalog** | Products a specific supplier offers |
| **Variant** | Specific SKU (color, size combination) |

