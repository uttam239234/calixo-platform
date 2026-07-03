# CALIXO PLATFORM ARCHITECTURE

## Enterprise AI Marketing Operating System

**Version:** 1.0.0  
**Created:** June 2026  
**Architecture Vision:** 2026-2030  
**Status:** Master Architecture Document  

---

## Table of Contents

1. [Vision](#1-vision)
2. [Product Philosophy](#2-product-philosophy)
3. [Platform Principles](#3-platform-principles)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Layered Architecture](#5-layered-architecture)
6. [Feature Organization](#6-feature-organization)

---

## CORE PLATFORM

7. [Authentication & Identity](#7-authentication--identity)
8. [Organizations & Workspaces](#8-organizations--workspaces)
9. [Teams & Users](#9-teams--users)
10. [Roles & Permissions](#10-roles--permissions)
11. [Billing & Subscriptions](#11-billing--subscriptions)
12. [Usage Limits & Credits](#12-usage-limits--credits)
13. [Notifications System](#13-notifications-system)
14. [Settings & Preferences](#14-settings--preferences)
15. [Audit Logs](#15-audit-logs)
16. [API Keys & Webhooks](#16-api-keys--webhooks)
17. [Integrations Framework](#17-integrations-framework)
18. [AI Core](#18-ai-core)

---

## MARKETING PLATFORM

19. [Dashboard](#19-dashboard)
20. [Analytics](#20-analytics)
21. [Ads Manager](#21-ads-manager)
22. [Social Media](#22-social-media)
23. [Brand Monitoring](#23-brand-monitoring)
24. [Content Studio](#24-content-studio)
25. [SEO](#25-seo)
26. [Email Marketing](#26-email-marketing)
27. [Landing Pages](#27-landing-pages)
28. [Forms & Lead Capture](#28-forms--lead-capture)
29. [CRM](#29-crm)
30. [Reports](#30-reports)

---

## SOCIAL MEDIA MODULE

31. [Social Dashboard](#31-social-dashboard)
32. [Compose](#32-compose)
33. [Calendar](#33-calendar)
34. [Inbox](#34-inbox)
35. [Social Analytics](#35-social-analytics)
36. [Competitor Intelligence](#36-competitor-intelligence)
37. [Accounts Management](#37-accounts-management)
38. [Drafts](#38-drafts)
39. [Scheduled Posts](#39-scheduled-posts)

---

## ADS MANAGER

40. [Ads Dashboard](#40-ads-dashboard)
41. [Campaigns](#41-campaigns)
42. [Audiences](#42-audiences)
43. [Keywords](#43-keywords)
44. [Creatives](#44-creatives)
45. [Budgets](#45-budgets)
46. [Optimization](#46-optimization)
47. [Ads Reports](#47-ads-reports)

---

## AI PLATFORM

48. [Global AI Copilot](#48-global-ai-copilot)
49. [AI Engine](#49-ai-engine)
50. [Prompt Library](#50-prompt-library)
51. [Memory System](#51-memory-system)
52. [Tool Registry](#52-tool-registry)
53. [Agent Framework](#53-agent-framework)
54. [Model Router](#54-model-router)
55. [Workflow Engine](#55-workflow-engine)
56. [Knowledge Base](#56-knowledge-base)

---

## AUTOMATION PLATFORM

57. [Workflow Builder](#57-workflow-builder)
58. [Triggers](#58-triggers)
59. [Conditions](#59-conditions)
60. [Actions](#60-actions)
61. [Scheduler](#61-scheduler)
62. [Execution Engine](#62-execution-engine)
63. [Automation Logs](#63-automation-logs)

---

## DATA ARCHITECTURE

64. [Data Providers](#64-data-providers)
65. [Data Hooks](#65-data-hooks)
66. [Services Layer](#66-services-layer)
67. [Utilities](#67-utilities)
68. [Type System](#68-type-system)
69. [State Management](#69-state-management)
70. [Caching Strategy](#70-caching-strategy)
71. [Local Storage](#71-local-storage)
72. [API Layer](#72-api-layer)

---

## TECHNICAL FOUNDATIONS

73. [Folder Structure](#73-folder-structure)
74. [Routing Strategy](#74-routing-strategy)
75. [State Management Details](#75-state-management-details)
76. [Security Architecture](#76-security-architecture)
77. [Integrations Ecosystem](#77-integrations-ecosystem)
78. [Scalability Planning](#78-scalability-planning)
79. [Implementation Roadmap](#79-implementation-roadmap)

---

## 1. Vision

### Mission

To empower marketing teams with an AI-first operating system that unifies every marketing function into one intelligent platform — from strategy to execution, from analytics to automation.

### Vision Statement

By 2030, Calixo will be the definitive Enterprise AI Marketing Operating System used by Fortune 500 companies, universities, and agencies worldwide — transforming how marketing teams work through AI augmentation, unified data, and seamless automation.

### Strategic Pillars

**1. AI-First, Not AI-Addon**
- AI is woven into every feature, not bolted on
- Every action has an AI-powered suggestion
- Natural language is a first-class interface

**2. Unified Data Model**
- All marketing data in one place
- Cross-channel attribution
- Single source of truth

**3. Enterprise-Grade Reliability**
- 99.99% uptime SLA
- SOC 2 Type II compliance
- GDPR, CCPA, HIPAA ready

**4. Infinite Extensibility**
- Plugin architecture for custom modules
- Open API for all features
- Third-party integration marketplace

**5. Privacy by Design**
- Customer data never used for model training
- Regional data residency options
- Granular permission controls

---

## 2. Product Philosophy

### Core Beliefs

**Marketing is Complex — The Interface Shouldn't Be**
Marketing teams juggle 10+ tools, 20+ channels, and hundreds of campaigns. Calixo consolidates this complexity into one elegant system.

**AI Should Augment, Not Replace**
AI copilots suggest, analyze, and automate — but humans make strategic decisions. The platform respects user agency while eliminating tedious work.

**Data is Power**
Every feature surfaces actionable insights. Raw numbers without context are noise; interpreted data is power.

**Speed is a Feature**
Users spend 8-10 hours daily in the platform. Every millisecond matters. Performance is non-negotiable.

**Enterprise Trust**
Security, compliance, and reliability are table stakes. We earn customer trust through transparency and consistency.

### Product Tenets

1. **One Platform, One Data Model** — No silos, no sync required
2. **Progressive Power** — Simple for beginners, powerful for experts
3. **Smart Defaults** — Works out of the box, customizable when needed
4. **Feedback Loops** — Every action informs future AI models (opt-in)
5. **Open Ecosystem** — Integrations are first-class citizens

---

## 3. Platform Principles

### Technical Principles

**1. API-First**
Every feature has a RESTful API. UI is one of many clients. API changes are versioned and backwards-compatible.

**2. Event-Driven Architecture**
All state changes emit events. Enables real-time updates, audit trails, and automation triggers.

**3. Multi-Tenant by Default**
Data isolation at the database level. Tenant-aware caching, logging, and billing.

**4. Cloud-Native**
Containerized (Docker), orchestrated (Kubernetes), scalable (auto-scaling). No legacy dependencies.

**5. Observability**
Metrics, logs, and traces for every service. Alerting on SLOs. Continuous profiling.

### Design Principles

**1. Consistency Over Cleverness**
Predictable patterns reduce learning curve. Every feature feels familiar.

**2. Performance as Design**
Animations under 200ms. Skeleton screens for async content. Optimistic UI updates.

**3. Accessibility Non-Negotiable**
WCAG 2.1 AA minimum. Screen reader support. Keyboard navigation.

**4. Mobile-Native Feel**
Touch-optimized. Responsive. Offline-capable (PWA).

---

## 4. High-Level Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                         CALIXO PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Web App    │  │  Mobile App  │  │  API Clients │    │
│  │  (React/TS)  │  │  (React Native)│ │  (Zapier,    │    │
│  └──────┬───────┘  └──────┬───────┘  │  Custom)    │    │
│         │                 │           └──────┬───────┘    │
│         └─────────────────┴─────────────────┘             │
│                           │                                │
│                    ┌──────▼──────┐                         │
│                    │  API Gateway │                        │
│                    │   (Kong)     │                        │
│                    └──────┬──────┘                         │
│                           │                                │
│         ┌─────────────────┼─────────────────┐             │
│         │                 │                 │             │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐      │
│  │ App Server  │  │ AI Engine   │  │ Integration │      │
│  │  (Node/TS)  │  │  (Python)   │  │  Services   │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         │                 │                 │             │
│         └─────────────────┼─────────────────┘             │
│                           │                                │
│                    ┌──────▼──────┐                         │
│                    │  Message    │                         │
│                    │  Queue      │                         │
│                    │  (Redis)    │                         │
│                    └──────┬──────┘                         │
│                           │                                │
│  ┌────────────────────────┼────────────────────────┐      │
│  │                        │                        │      │
│  ┌──────▼──────┐  ┌───────▼──────┐  ┌────────────▼───┐  │
│  │ PostgreSQL  │  │  TimescaleDB │  │     Redis      │  │
│  │ (Primary)   │  │  (Metrics)   │  │   (Cache)      │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interactions

```
Client (Web/Mobile) 
  → API Gateway (Authentication, Rate Limiting, Routing)
    → App Server (Business Logic)
      → AI Engine (Intelligence Layer)
      → Integration Services (External APIs)
      → Message Queue (Async Processing)
        → Database Cluster (Persistence)
```

---

## 5. Layered Architecture

### Layer Overview

```
┌───────────────────────────────────────────────────────────────┐
│ Layer 7: Presentation (UI/UX)                                │
│ - React Components, Design System, Accessibility              │
├───────────────────────────────────────────────────────────────┤
│ Layer 6: Application (API)                                    │
│ - REST/GraphQL API, WebSockets, Rate Limiting                  │
├───────────────────────────────────────────────────────────────┤
│ Layer 5: Business Logic                                       │
│ - Domain Services, Workflows, Validation                       │
├───────────────────────────────────────────────────────────────┤
│ Layer 4: AI Engine                                            │
│ - LLM Orchestration, Agents, Knowledge Base                   │
├───────────────────────────────────────────────────────────────┤
│ Layer 3: Integrations                                         │
│ - External APIs, Data Sync, Webhooks                           │
├───────────────────────────────────────────────────────────────┤
│ Layer 2: Infrastructure                                       │
│ - Containers, Orchestration, Monitoring, CI/CD                │
├───────────────────────────────────────────────────────────────┤
│ Layer 1: Data Persistence                                     │
│ - Databases, Caching, Object Storage                          │
└───────────────────────────────────────────────────────────────┘
```

### Layer 7: Presentation

**Responsibility:** User interface, client-side logic, offline support

**Technology Stack:**
- React 18 + TypeScript
- Next.js App Router
- Tailwind CSS + Custom Design System
- Radix UI Primitives
- Framer Motion (animations)
- TanStack Query (server state)
- Zustand (client state)
- React Hook Form + Zod

**Key Concerns:**
- Responsive design (Mobile, Tablet, Desktop)
- Accessibility (WCAG 2.1 AA)
- Offline-first (PWA, Service Workers)
- Real-time updates (WebSockets)
- Performance budgets (LCP < 2s)

---

### Layer 6: Application

**Responsibility:** API, authentication, authorization, routing

**Technology Stack:**
- Next.js API Routes / Server Actions
- tRPC (type-safe APIs)
- NextAuth.js (authentication)
- Zod (validation)
- Rate limiting (Upstash)

**Key Concerns:**
- API versioning
- Request validation
- Response caching
- Error handling
- Request tracing

---

### Layer 5: Business Logic

**Responsibility:** Domain rules, workflows, orchestration

**Technology Stack:**
- TypeScript classes and modules
- Business rules engine
- Event emitters
- Transaction management

**Key Concerns:**
- Domain-driven design
- Single responsibility
- Testability
- Reusability across modules

---

### Layer 4: AI Engine

**Responsibility:** Intelligence, recommendations, automation

**Technology Stack:**
- Python (FastAPI)
- OpenAI API (GPT-4, GPT-4o)
- Anthropic API (Claude)
- LangChain (orchestration)
- Vector DB (Pinecone/Weaviate)
- Embedding models (OpenAI, Cohere)

**Key Concerns:**
- Context management
- Prompt engineering
- Memory persistence
- Token optimization
- Fallback strategies

---

### Layer 3: Integrations

**Responsibility:** Third-party service connections

**Technology Stack:**
- REST clients
- GraphQL clients
- WebSocket connections
- Webhook handlers
- OAuth flows

**Key Concerns:**
- Retry logic
- Error handling
- Rate limiting
- Credential management
- Data transformation

---

### Layer 2: Infrastructure

**Responsibility:** Deployment, scaling, monitoring

**Technology Stack:**
- Docker (containerization)
- Kubernetes (orchestration)
- Terraform (IaC)
- GitHub Actions (CI/CD)
- Datadog (monitoring)
- Sentry (error tracking)

**Key Concerns:**
- Auto-scaling
- Health checks
- Log aggregation
- Distributed tracing
- Disaster recovery

---

### Layer 1: Data Persistence

**Responsibility:** Data storage, caching, retrieval

**Technology Stack:**
- PostgreSQL (primary database)
- TimescaleDB (time-series metrics)
- Redis (cache, sessions, queue)
- S3-compatible storage (media, exports)
- Elasticsearch (search, analytics)

**Key Concerns:**
- ACID compliance
- Data partitioning
- Replication
- Backup/restore
- Query optimization

---

## 6. Feature Organization

### Module Structure

Calixo is organized into **modules**, each representing a business domain. Modules are self-contained but share a unified data model and UI.

```
Marketing Platform
├── Core Platform (foundation)
├── Analytics Module
├── Ads Manager Module
├── Social Media Module
├── Content Studio Module
├── SEO Module
├── Email Marketing Module
├── Landing Pages Module
├── CRM Module
├── Automation Module
└── AI Platform Module
```

### Module Communication

Modules communicate through:
1. **Shared Events** — Publish/subscribe via message queue
2. **API Contracts** — Typed interfaces between modules
3. **Data Model** — Unified schema accessible to all modules
4. **UI Shell** — Shared navigation and chrome

---

## 7. Authentication & Identity

### Purpose

Manages user identity, authentication, and session management.

### Architecture

```
┌─────────────────────────────────────────────┐
│         Authentication Layer                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ NextAuth.js  │  │   OAuth      │        │
│  │ Credentials  │  │   Providers  │        │
│  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │
│  ┌──────▼─────────────────▼───────┐        │
│  │      Session Management        │        │
│  │   (JWT + Redis for speed)      │        │
│  └──────┬─────────────────────────┘        │
│         │                                   │
│  ┌──────▼──────────┐                       │
│  │  User Identity  │                       │
│  │  (PostgreSQL)   │                       │
│  └─────────────────┘                       │
│                                             │
└─────────────────────────────────────────────┘
```

### Authentication Methods

**1. Email/Password**
- Traditional credentials
- Bcrypt hashing (12 rounds)
- Email verification required

**2. OAuth 2.0**
- Google (primary)
- Microsoft (enterprise)
- LinkedIn (professional)

**3. SSO (Enterprise)**
- SAML 2.0
- OpenID Connect
- Custom identity providers

### Session Management

- **Access Token:** JWT, 15-minute expiry
- **Refresh Token:** HTTP-only cookie, 7-day expiry
- **Rotation:** Refresh tokens rotate on use
- **Storage:** Redis (fast lookup) + PostgreSQL (persistence)

### Security

- Password reset via email (time-limited tokens)
- Account lockout after 5 failed attempts
- Device fingerprinting (optional)
- IP allowlisting (enterprise)

---

## 8. Organizations & Workspaces

### Purpose

Multi-tenancy through organizations. Workspaces provide logical separation within an organization.

### Data Model

```typescript
Organization
├── id: string (UUID)
├── name: string
├── slug: string (unique)
├── plan: Plan (free, pro, enterprise)
├── settings: JSON
├── branding: JSON
│   ├── logo: string
│   ├── colors: JSON
│   └── domain: string (white-label)
├── createdAt: timestamp
└── updatedAt: timestamp

Workspace (belongs to Organization)
├── id: string
├── organizationId: string
├── name: string
├── type: "team" | "client" | "project"
├── settings: JSON
└── createdAt: timestamp
```

### Organization Features

- **Branding:** Custom logo, colors, domain
- **Billing:** Centralized subscription
- **Members:** Users affiliated with org
- **Settings:** Timezone, date format, language
- **Audit Logs:** All actions logged

### Workspace Features

- **Isolation:** Data scoped to workspace
- **Switching:** Fast context switching
- **Defaults:** Inherit org settings
- **Roles:** Permissions at workspace level

---

## 9. Teams & Users

### Purpose

User management with roles and affiliations.

### Data Model

```typescript
User
├── id: string
├── email: string (unique)
├── name: string
├── avatar: string (URL)
├── passwordHash: string
├── emailVerified: boolean
├── lastLogin: timestamp
├── preferences: JSON
│   ├── theme: "light" | "dark"
│   ├── timezone: string
│   └── notifications: JSON
└── createdAt: timestamp

Team (within Workspace)
├── id: string
├── workspaceId: string
├── name: string
├── members: TeamMember[]
└── createdAt: timestamp

TeamMember
├── userId: string
├── teamId: string
├── role: Role
└── joinedAt: timestamp
```

### User Features

- Profile management
- Avatar upload
- Notification preferences
- Theme preference
- Language preference
- Activity feed

---

## 10. Roles & Permissions

### Purpose

Fine-grained access control using RBAC.

### Role Hierarchy

```
Super Admin (organization owner)
  └── Full access to everything

Admin
  └── Manage users, settings, billing

Editor
  └── Create/edit content, campaigns

Viewer
  └── Read-only access

Custom Roles (Enterprise)
  └── Granular permission sets
```

### Permission Matrix

| Feature | Admin | Editor | Viewer |
|---------|-------|--------|--------|
| View Dashboard | ✓ | ✓ | ✓ |
| Create Campaign | ✓ | ✓ | ✗ |
| Edit Campaign | ✓ | ✓ | ✗ |
| Delete Campaign | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ |
| Billing | ✓ | ✗ | ✗ |
| Export Data | ✓ | ✓ | ✓ |

### Implementation

- **Permission Checks:** Middleware on every API endpoint
- **UI Hiding:** Conditionally render based on permissions
- **Audit Trail:** Log privileged actions

---

## 11. Billing & Subscriptions

### Purpose

Manage subscriptions, invoices, and payments.

### Plans

**1. Free Trial**
- 14-day trial
- Limited features
- Watermarked exports

**2. Starter**
- $99/month
- 5 users
- Basic features
- 10,000 contacts

**3. Professional**
- $299/month
- 25 users
- All features
- 100,000 contacts
- Priority support

**4. Enterprise**
- Custom pricing
- Unlimited users
- Advanced features
- Unlimited contacts
- Dedicated support
- SLA

**5. Agency**
- Custom pricing
- Multi-client management
- White-label options
- Centralized billing

### Billing Flow

```
User Selects Plan
  → Create Stripe Customer
    → Setup Intents
      → Confirm Payment
        → Activate Subscription
          → Send Welcome Email
```

### Invoicing

- Automatic monthly invoices
- Prorated upgrades/downgrades
- Invoice history
- CSV export

---

## 12. Usage Limits & Credits

### Purpose

Prevent abuse, ensure fair usage, enable pay-as-you-go.

### Metrics Tracked

**By Module:**
- API calls
- Data storage (GB)
- Export jobs
- AI tokens consumed

**By User:**
- Campaigns created
- Automation runs
- Reports generated

### Enforcement

- **Soft Limits:** Warning at 80%, hard limit at 100%
- **Hard Limits:** Feature disabled, upgrade prompt shown
- **Overages:** Allow overages with additional charges (enterprise)

### Credits

- AI features consume credits
- Purchase credit packs
- Subscription includes monthly credits
- Unused credits expire (monthly)

---

## 13. Notifications System

### Purpose

Deliver real-time and async notifications to users.

### Notification Types

**1. In-App**
- Bell icon badge
- Notification center panel
- Category filters

**2. Email**
- Daily/weekly digests
- Critical alerts
- Marketing (with preferences)

**3. Push (Mobile)**
- Real-time alerts
- Campaign updates
- AI insights

**4. Webhooks**
- Custom integrations
- Third-party notifications

### Notification Channels

- Campaign events (started, paused, ended)
- Lead events (new lead, converted)
- Budget alerts (threshold breach)
- System events (maintenance, updates)
- AI insights (anomalies, predictions)

---

## 14. Settings & Preferences

### Organization Settings

- General (name, timezone, language)
- Branding (logo, colors, domain)
- Security (2FA, IP allowlist)
- Billing (plan, invoices, payment)
- Integrations (connected accounts)
- Members (user management)
- Audit logs

### User Settings

- Profile (name, avatar, email)
- Preferences (theme, timezone, language)
- Notifications (channels, frequency, categories)
- Security (password, 2FA, sessions)
- API keys (personal access tokens)
- Integrations (personal connections)

---

## 15. Audit Logs

### Purpose

Track all user actions for security and compliance.

### Events Logged

- Authentication events (login, logout, failed attempts)
- Resource changes (create, update, delete)
- Permission changes
- Data exports
- Billing events
- AI actions

### Log Schema

```typescript
AuditLog {
  id: string
  userId: string
  organizationId: string
  action: string
  resource: string
  resourceId: string
  changes: JSON
  ipAddress: string
  userAgent: string
  timestamp: timestamp
}
```

### Retention

- Free: 30 days
- Pro: 1 year
- Enterprise: 7 years

---

## 16. API Keys & Webhooks

### Purpose

Enable programmatic access and integrations.

### API Keys

- Scoped to organization/user
- Permissions limited to key
- Rotation support
- Usage tracking
- Rate limits

### Webhooks

- Event triggers
- Retry logic (exponential backoff)
- Signature verification
- Payload customization
- Delivery logs

---

## 17. Integrations Framework

### Purpose

Connect Calixo with external services.

### Integration Types

**1. Native Integrations**
- Pre-built, maintained by Calixo
- Deep data sync
- Example: Google Ads, Meta Ads

**2. Custom Integrations**
- User-configured via API
- Webhook-based
- Example: Zapier, custom APIs

**3. Marketplace Apps**
- Third-party developed
- Verified and sandboxed
- Example: Salesforce, HubSpot

### Integration Pattern

```
OAuth Flow
  → Access Token Storage (encrypted)
    → API Client (with retries)
      → Data Sync (background jobs)
        → Webhook Notifications (on change)
```

---

## 18. AI Core

### Purpose

Central AI infrastructure powering all intelligent features.

### Components

**1. LLM Router**
- Routes queries to optimal model
- Factors: cost, latency, capability
- Fallback chains

**2. Context Manager**
- Maintains conversation history
- Retrieves relevant data
- Manages token limits

**3. Prompt Library**
- Curated prompts for use cases
- Version controlled
- A/B tested

**4. Action Executor**
- Safely executes AI-suggested actions
- Requires confirmation for critical actions
- Audit logged

**5. Safety Layer**
- Content moderation
- PII detection
- Bias mitigation

### AI Models

**Primary:**
- OpenAI GPT-4o (complex reasoning)
- GPT-4o-mini (fast tasks)
- Claude 3.5 Sonnet (analysis)

**Specialized:**
- Embeddings (text-embedding-3-large)
- Image (DALL-E 3)
- Audio (Whisper)

---

## 19. Dashboard

### Purpose

Executive command center for at-a-glance insights.

### Architecture

```
Dashboard Page
├── DashboardShell (Layout)
│   ├── KpiGrid
│   │   └── ExecutiveKpiCard (× N)
│   ├── MarketingPerformanceChart
│   ├── AiRecommendations
│   │   └── InsightCard (× N)
│   ├── QuickActions
│   ├── RecentActivity
│   └── CalendarWidget
│
├── State Management
│   ├── Time Range (Zustand)
│   ├── Filters (URL params)
│   └── Widget Configuration
│
└── Data Layer
    ├── API Calls (TanStack Query)
    ├── Caching (5-minute stale time)
    └── Real-time Updates (WebSocket)
```

### Data Flow

```
User Opens Dashboard
  → Load User Preferences (workspace, time range)
    → Fetch KPIs (parallel API calls)
      → Fetch Main Chart
        → Fetch AI Insights
          → Fetch Activity Feed
            → Render Skeleton (200ms)
              → Render Actual Data
                → Setup WebSocket for live updates
```

### Performance

- Initial load: < 1s
- Time range change: 300ms reactivity
- Real-time: WebSocket updates every 60s

---

## 20. Analytics

### Purpose

Deep-dive analytics with multi-dimensional data exploration.

### Architecture

```
Analytics Page
├── AnalyticsHeader (Time range, compare toggle)
├── AnalyticsFilters (Dimensions, granularity)
├── ExecutiveSummary (Primary metrics)
├── Charts Grid
│   ├── RevenueChart (Line)
│   ├── TrafficAnalytics (Area)
│   ├── ChannelPerformance (Bar)
│   └── ConversionFunnel (Funnel)
├── Details Table
│   └── EnterpriseTable (with sorting, filtering)
└── ReportsPanel (Export options)
```

### Data Model

**Metrics:**
- Revenue, Leads, Conversions, Spend
- Aggregated by: hour, day, week, month

**Dimensions:**
- Channel, Campaign, Device, Region, Source

**Granularity:**
- Hour, Day, Week, Month, Quarter, Year

### Caching

- Pre-aggregated data (TimescaleDB)
- 30-minute TTL
- Background refresh

---

## 21. Ads Manager

### Purpose

Multi-channel ad campaign management.

### Platform Support

- Google Ads
- Meta (Facebook, Instagram)
- LinkedIn
- TikTok (future)
- Twitter/X (future)

### Architecture

```
Ads Manager
├── Platform Abstraction Layer
│   ├── GoogleAdsAdapter
│   ├── MetaAdsAdapter
│   └── LinkedInAdsAdapter
│
├── Unified Data Model
│   ├── Campaign
│   ├── AdSet
│   ├── Creative
│   └── Metrics
│
├── Campaign Management
│   ├── CampaignTable (CRUD)
│   ├── CampaignWizard (creation)
│   └── BulkActions
│
├── Optimization
│   ├── BudgetWidget
│   ├── PerformanceWidget
│   └── AIRecommendations
│
└── Reporting
    ├── CampaignPerformance
    ├── PlatformOverview
    └── ExportPanel
```

---

## 22. Social Media

### Purpose

Social media content planning, publishing, and analytics.

### Platform Support

- Instagram
- Facebook
- Twitter/X
- LinkedIn
- TikTok (future)

### Architecture

```
Social Media Module
├── ContentCalendar
│   ├── CalendarGrid (Month/Week/List)
│   ├── PostDragDrop
│   └── PlatformIndicators
│
├── Composer
│   ├── TextEditor
│   ├── MediaUpload
│   ├── PlatformSelector
│   └── SchedulePicker
│
├── Inbox
│   ├── MessageThreads
│   ├── QuickReplies
│   └── AssignmentRules
│
├── Analytics
│   ├── EngagementMetrics
│   └── CompetitorComparison
│
└── Library
    ├── MediaAssets
    ├── Templates
    └── Hashtags
```

---

## 23. Brand Monitoring

### Purpose

Track brand mentions across web and social.

### Data Sources

- Social media platforms
- News sites (RSS, APIs)
- Review sites
- Forums

### Features

- Mention detection
- Sentiment analysis
- Alerting
- Competitor tracking

---

## 24. Content Studio

### Purpose

AI-assisted content creation.

### Features

- Text generation (GPT-4)
- Image generation (DALL-E)
- Template library
- Brand guidelines enforcement
- Collaboration (comments, approvals)

---

## 25. SEO

### Purpose

Search engine optimization tools.

### Features

- Keyword research
- Rank tracking
- Backlink analysis
- Technical SEO audits
- Content suggestions

---

## 26. Email Marketing

### Purpose

Email campaign management.

### Features

- Template editor
- List management
- A/B testing
- Automation workflows
- Analytics (open, click, conversion)

---

## 27. Landing Pages

### Purpose

Build and publish landing pages.

### Features

- Drag-drop builder
- Templates
- Form integration
- A/B testing
- Analytics

---

## 28. Forms & Lead Capture

### Purpose

Create forms for lead generation.

### Features

- Form builder
- Field types (text, dropdown, etc.)
- Validation rules
- Integrations (CRM, email)
- Conversion tracking

---

## 29. CRM

### Purpose

Customer relationship management.

### Data Model

```
Lead
├── Contact Info
├── Source (campaign, organic, referral)
├── Score (AI-calculated)
├── Status (new, qualified, converted)
└── Activities (emails, calls, meetings)

Opportunity
├── LeadId
├── Value
├── Stage (discovery, proposal, closed)
├── Probability
└── ExpectedCloseDate
```

---

## 30. Reports

### Purpose

Custom report generation and scheduling.

### Features

- Report builder (drag-drop widgets)
- Scheduled reports (email)
- Export (PDF, Excel, CSV)
- Embeddable dashboards

---

## 31. Social Dashboard

*[...Social Dashboard specific details...]*

## 32. Compose

*[...Compose specific details...]*

*[Pattern continues for all social module sub-components]*

---

## 33-39. Social Media Module Details

*[Detailed architecture for Calendar, Inbox, Analytics, Competitor Intelligence, Accounts, Drafts, Scheduled Posts]*

---

## 40-47. Ads Manager Details

*[Detailed architecture for Dashboard, Campaigns, Audiences, Keywords, Creatives, Budgets, Optimization, Reports]*

---

## 48. Global AI Copilot

### Purpose

Persistent AI assistant accessible throughout the platform.

### Interface

- Right sidebar (400px, slide-in)
- Fullscreen mode (immersive)
- Floating button (quick access)

### Capabilities

- Answer questions about data
- Generate content
- Execute actions (with confirmation)
- Analyze performance
- Suggest optimizations

### Context Awareness

- Current page context
- User role and permissions
- Recent actions
- Data being viewed

---

## 49. AI Engine

### Purpose

Core AI infrastructure for all intelligent features.

### Architecture

```
AI Engine
├── Model Router
│   ├── OpenAI Adapter
│   ├── Anthropic Adapter
│   └── Local Models (future)
│
├── Prompt Manager
│   ├── Prompt Templates
│   ├── Versioning
│   └── A/B Testing
│
├── Context Manager
│   ├── Conversation History
│   ├── Data Retrieval (RAG)
│   └── Token Optimization
│
├── Memory Store
│   ├── Session Memory (Redis)
│   ├── User Memory (PostgreSQL)
│   └── Knowledge Base (Vector DB)
│
└── Safety Layer
    ├── Content Moderation
    ├── PII Detection
    └── Bias Detection
```

---

## 50. Prompt Library

### Purpose

Curated, tested prompts for common tasks.

### Organization

- **Global:** Platform-wide prompts
- **Module:** Specific to feature (e.g., "Generate Social Post")
- **User:** Custom prompts created by users

### Prompt Structure

```yaml
id: prompt-001
name: "Generate Social Post"
description: "Create engaging social media post"
template: |
  Create a {{platform}} post about {{topic}}.
  Tone: {{tone}}
  Length: {{length}}
model: gpt-4o
temperature: 0.7
maxTokens: 280
```

---

## 51. Memory System

### Purpose

Remember context across sessions.

### Memory Types

**1. Short-term (Session)**
- Conversation history
- Current task context
- TTL: 24 hours

**2. Long-term (User)**
- Preferences
- Past interactions
- Insights learned
- TTL: Permanent (with decay)

**3. Knowledge (Organization)**
- Brand guidelines
- Past campaigns
- Performance history
- Shared insights

---

## 52. Tool Registry

### Purpose

Expose platform functions to AI.

### Tools

- **Data Retrieval:** Query metrics, campaigns, leads
- **Data Modification:** Update campaigns, create posts
- **Analysis:** Generate reports, find anomalies
- **Communication:** Send emails, notifications

### Safety

- Human-in-the-loop for destructive actions
- Confirmation dialogs
- Audit logging

---

## 53. Agent Framework

### Purpose

Specialized AI agents for different tasks.

### Agents

**1. Analytics Agent**
- Analyzes performance data
- Generates insights
- Answers questions

**2. Campaign Agent**
- Optimizes ad spend
- Suggests targeting
- Creates ad copy

**3. Content Agent**
- Writes copy
- Generates images
- Suggests hashtags

**4. Sales Agent**
- Qualifies leads
- Suggests follow-ups
- Predicts conversions

---

## 54. Model Router

### Purpose

Select optimal AI model for each task.

### Routing Logic

```
Task: Generate Social Post
  → Complexity: Medium
    → Choose: GPT-4o-mini (cost-effective)

Task: Analyze Q4 Performance
  → Complexity: High
    → Choose: GPT-4o (best reasoning)

Task: Summarize 100 Emails
  → Volume: High
    → Choose: Claude 3.5 Sonnet (fast)
```

### Fallbacks

- Primary model fails → Secondary model
- Rate limit → Queue request
- Cost threshold → Cheaper model

---

## 55. Workflow Engine

### Purpose

Automate repetitive tasks with AI + rules.

### Workflow Types

- Scheduled (cron)
- Event-driven (trigger on change)
- Manual (user-requested)

### Workflow Definition

```yaml
name: "Optimize Underperforming Ads"
trigger:
  type: schedule
  cron: "0 6 * * *"

steps:
  - name: fetch_ads
    action: get_campaigns
    filter: status=active AND roas<2

  - name: analyze
    action: ai_analyze
    prompt: "Why are these ads underperforming?"

  - name: suggest
    action: generate_recommendations

  - name: notify
    action: send_notification
    to: user
    message: "Recommendations ready"
```

---

## 56. Knowledge Base

### Purpose

Central repository for AI training and retrieval.

### Content

- Product documentation
- Marketing best practices
- Customer data (anonymized)
- Past campaign performance
- Industry benchmarks

### Implementation

- Vector database (Pinecone/Weaviate)
- Embedding: text-embedding-3-large
- Chunking strategy: Semantic
- Refresh: Weekly

---

## 57. Workflow Builder

### Purpose

Visual workflow creation for automation.

### UI

```
┌─────────────────────────────────────────┐
│ [Trigger] → [Condition] → [Action]      │
│                                         │
│ Drag-drop nodes                          │
│ Visual connections                       │
│ Testing sandbox                          │
└─────────────────────────────────────────┘
```

### Node Types

- Trigger (event-based)
- Condition (branching)
- Action (execute task)
- Delay (wait)
- Loop (iterate)

---

## 58. Triggers

### Purpose

Start workflows on events.

### Trigger Types

**Time-based:**
- Cron schedules
- One-time

**Event-based:**
- New lead captured
- Campaign threshold met
- Report generated

**Webhook:**
- External system call

---

## 59. Conditions

### Purpose

Branch logic in workflows.

### Condition Types

- Data comparison (value > threshold)
- Data existence (field present)
- Time-based (day of week)
- AI evaluation (sentiment analysis)

---

## 60. Actions

### Purpose

Execute tasks in workflows.

### Action Types

- Send notification
- Create campaign
- Update record
- Call API
- Generate report
- AI task (generate content)

---

## 61. Scheduler

### Purpose

Execute workflows on schedule.

### Features

- Cron syntax
- Timezone support
- Retry on failure
- Skip holidays
- Max concurrent runs

---

## 62. Execution Engine

### Purpose

Run workflows reliably and at scale.

### Architecture

```
Workflow Triggered
  → Load Definition
    → Create Execution Context
      → Execute Steps (sequentially/parallel)
        → Handle Errors (retry, fallback)
          → Store Results
            → Emit Events
              → Notify User
```

### Reliability

- Idempotent steps
- Checkpoints (resume on failure)
- Dead letter queue
- Execution logs

---

## 63. Automation Logs

### Purpose

Track workflow execution for debugging.

### Log Schema

```typescript
WorkflowExecution {
  id: string
  workflowId: string
  status: "running" | "success" | "failed"
  startedAt: timestamp
  completedAt: timestamp
  steps: ExecutionStep[]
  error: string
}

ExecutionStep {
  name: string
  status: string
  input: JSON
  output: JSON
  duration: number
}
```

---

## 64. Data Providers

### Purpose

Abstract data fetching with caching.

### Pattern

```typescript
// providers/campaigns.ts
export const campaignsProvider = {
  getAll: (orgId, filters) => {
    return useQuery(['campaigns', orgId, filters], () =>
      api.campaigns.getAll(orgId, filters)
    , {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    });
  },
};
```

### Caching Strategy

- **Cache First:** Static data (countries, currencies)
- **Stale-While-Revalidate:** Frequently changing data (metrics)
- **Network Only:** Real-time data (notifications)

---

## 65. Data Hooks

### Purpose

Reusable React hooks for data operations.

### Examples

```typescript
// hooks/campaigns.ts
export function useCampaigns(filters) {
  return useQuery(['campaigns', filters], () =>
    campaignsProvider.getAll(filters)
  );
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.campaigns.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
    },
  });
}
```

---

## 66. Services Layer

### Purpose

Business logic and API communication.

### Organization

```
services/
├── api/              # API clients
│   ├── campaigns.ts
│   ├── analytics.ts
│   └── ai.ts
├── auth/             # Authentication
├── billing/          # Subscriptions
└── integrations/     # Third-party APIs
```

### API Client Example

```typescript
// services/api/campaigns.ts
import { fetch } from '@/lib/fetch';

export const campaignsApi = {
  getAll: (orgId: string, filters: Filters) =>
    fetch(`/api/organizations/${orgId}/campaigns`, {
      query: filters,
    }),

  getById: (orgId: string, id: string) =>
    fetch(`/api/organizations/${orgId}/campaigns/${id}`),

  create: (orgId: string, data: CreateCampaignDto) =>
    fetch(`/api/organizations/${orgId}/campaigns`, {
      method: 'POST',
      body: data,
    }),
};
```

---

## 67. Utilities

### Purpose

Shared helper functions.

### Categories

**1. Formatting**
- Currency, percentages, dates
- Phone numbers, addresses

**2. Validation**
- Email, URL, phone
- Zod schemas

**3. Computation**
- Aggregations (sum, average)
- Time series analysis

**4. DOM**
- Debounce, throttle
- Copy to clipboard

### Example

```typescript
// utils/format.ts
export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day(s) ago`;
  if (hours > 0) return `${hours} hour(s) ago`;
  if (minutes > 0) return `${minutes} minute(s) ago`;
  return 'Just now';
}
```

---

## 68. Type System

### Purpose

Type-safe data contracts across the platform.

### Organization

```
types/
├── api/               # API request/response types
├── models/            # Domain models
├── ui/                # UI-specific types
└── config/            # Configuration types
```

### Example

```typescript
// types/models/campaign.ts
export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  platform: Platform;
  status: CampaignStatus;
  budget: {
    amount: number;
    currency: string;
    spent: number;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignStatus = "draft" | "active" | "paused" | "ended";
export type Platform = "google" | "meta" | "linkedin";
```

---

## 69. State Management

### Strategy

**Global State:** Zustand (UI state, user preferences)
- Theme, sidebar collapsed, notifications
- ~5-10 stores

**Server State:** TanStack Query
- All server data
- Caching, background updates
- Optimistic updates

**Module State:** Component state (useState)
- Local UI state
- Form state (React Hook Form)
- Temporary data

### Stores

```typescript
// stores/useUserStore.ts
interface UserStore {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  setUser: (user: User) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  organizations: [],
  currentOrganization: null,
  setUser: (user) => set({ user }),
  // ...
}));
```

### Persistence

- User preferences: localStorage (encrypted)
- Session: HTTP-only cookies
- Sensitive: Server-side encrypted storage

---

## 70. Caching Strategy

### Levels

**1. Browser Cache**
- Static assets (JS, CSS, images)
- Cache-Control headers
- CDN

**2. CDN (Edge)**
- Public pages (landing)
- Static API responses (docs)

**3. Redis (Application)**
- Session data (fast lookup)
- API responses (semi-static)
- Rate limit counters

**4. Database**
- Materialized views
- Pre-aggregated metrics
- Query result cache

### Cache Invalidation

- Time-based TTL (stale-while-revalidate)
- Event-based (on data change)
- Manual (admin action)

---

## 71. Local Storage

### Purpose

Client-side storage for offline and performance.

### Usage

**Encrypted (sensitive):**
- Session token (refresh)
- User preferences
- Draft content

**Unencrypted:**
- UI state (sidebar collapsed)
- Draft campaigns
- Offline queue

### Implementation

```typescript
// utils/storage.ts
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY!;

export function setSecure(key: string, value: any) {
  const encrypted = encrypt(JSON.stringify(value), ENCRYPTION_KEY);
  localStorage.setItem(key, encrypted);
}

export function getSecure(key: string) {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  return JSON.parse(decrypt(encrypted, ENCRYPTION_KEY));
}
```

---

## 72. API Layer

### Purpose

RESTful API design and implementation.

### Principles

1. **RESTful Resources:** `/api/organizations/:orgId/campaigns`
2. **Versioning:** `/api/v1/`, `/api/v2/`
3. **Consistent Responses:**
```json
{
  "data": { },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### Endpoints

**Core:**
- `POST /api/auth/signin`
- `POST /api/auth/signup`
- `GET /api/organizations`
- `GET /api/organizations/:id`

**Campaigns:**
- `GET /api/organizations/:orgId/campaigns`
- `POST /api/organizations/:orgId/campaigns`
- `PUT /api/organizations/:orgId/campaigns/:id`
- `DELETE /api/organizations/:orgId/campaigns/:id`

**Analytics:**
- `GET /api/organizations/:orgId/analytics/revenue`
- `GET /api/organizations/:orgId/analytics/channels`

**AI:**
- `POST /api/organizations/:orgId/ai/chat`
- `POST /api/organizations/:orgId/ai/insights`

### Rate Limits

- Free: 100 requests/minute
- Pro: 1000 requests/minute
- Enterprise: 10,000 requests/minute

---

## 73. Folder Structure

### Root Structure

```
calixo-platform/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth routes
│   │   ├── (dashboard)/          # Protected routes
│   │   ├── (marketing)/          # Public marketing
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # Base components (shadcn)
│   │   ├── dashboard/            # Dashboard module
│   │   ├── analytics/            # Analytics module
│   │   ├── ads/                  # Ads module
│   │   ├── social/               # Social module
│   │   ├── layout/               # Layout components
│   │   └── common/               # Shared
│   │
│   ├── features/                 # Feature-based modules
│   │   ├── auth/                 # Authentication
│   │   ├── theme/                # Theme provider
│   │   └── ai/                   # AI features
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useCampaigns.ts
│   │   ├── useAnalytics.ts
│   │   └── useAI.ts
│   │
│   ├── providers/                # Context providers
│   │   ├── AuthProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── QueryProvider.tsx
│   │
│   ├── services/                 # API clients
│   │   ├── api/                  # API methods
│   │   ├── auth/                 # Auth service
│   │   └── integrations/         # Third-party APIs
│   │
│   ├── types/                    # TypeScript types
│   │   ├── models/               # Domain models
│   │   ├── api/                  # API contracts
│   │   └── ui/                   # UI types
│   │
│   ├── lib/                      # Libraries
│   │   ├── utils.ts              # General utils
│   │   ├── auth.ts               # Auth helpers
│   │   ├── fetch.ts              # HTTP client
│   │   └── validations.ts        # Zod schemas
│   │
│   ├── utils/                    # Utility functions
│   │   ├── format.ts             # Formatting
│   │   ├── dates.ts              # Date helpers
│   │   └── calculations.ts       # Math helpers
│   │
│   ├── config/                   # Configuration
│   │   ├── constants.ts          # App constants
│   │   ├── env.ts                # Env vars
│   │   └── navigation.ts         # Nav items
│   │
│   ├── styles/                   # Global styles
│   │   ├── globals.css           # Global CSS
│   │   ├── fonts.ts              # Font config
│   │   └── tokens.css            # Design tokens
│   │
│   └── stores/                   # Global state
│       ├── useUserStore.ts
│       ├── useThemeStore.ts
│       └── useNotificationStore.ts
│
├── public/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── docs/                         # Documentation
│   ├── design/
│   ├── api/
│   └── deployment/
│
├── tests/                        # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                      # Build/deploy scripts
│   ├── db-migrate.ts
│   └── seed.ts
│
├── .github/                      # GitHub Actions
│   └── workflows/
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── README.md
└── LICENSE
```

### Folder Philosophy

**src/app/** — Route-based file structure (Next.js App Router)

**src/components/** — Feature-based component organization
- `ui/` for base components (shadcn)
- Feature folders for module-specific components
- `common/` for shared components

**src/features/** — Feature modules (alternative to components/)
- Auth, theme, AI
- Slices of Redux-like logic (if needed)

**src/hooks/** — Reusable React hooks

**src/providers/** — Context providers

**src/services/** — API clients, external integrations

**src/types/** — TypeScript definitions

**src/lib/** — Core libraries and utilities

**src/utils/** — Pure utility functions

**src/config/** — Configuration and constants

**src/styles/** — Global styles, design tokens

**src/stores/** — Global state (Zustand)

---

## 74. Routing Strategy

### Next.js App Router

**File-based routing with nested layouts.**

### Route Structure

```
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Landing page (/)
│
├── (auth)/                       # Auth routes (no sidebar)
│   ├── login/page.tsx            # /login
│   ├── signup/page.tsx           # /signup
│   ├── forgot-password/page.tsx  # /forgot-password
│   └── layout.tsx                # Auth layout
│
├── (dashboard)/                  # Protected routes (with shell)
│   ├── layout.tsx                # Dashboard shell (sidebar + header)
│   │
│   ├── dashboard/
│   │   ├── page.tsx              # /dashboard
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── ads/page.tsx          # /dashboard/ads
│   │   ├── analytics/page.tsx    # /dashboard/analytics
│   │   └── social/page.tsx       # /dashboard/social
│   │
│   ├── campaigns/
│   │   ├── page.tsx              # /dashboard/campaigns
│   │   ├── [id]/page.tsx         # /dashboard/campaigns/123
│   │   └── new/page.tsx          # /dashboard/campaigns/new
│   │
│   ├── settings/
│   │   ├── page.tsx              # /dashboard/settings
│   │   ├── profile/page.tsx      # /dashboard/settings/profile
│   │   ├── billing/page.tsx      # /dashboard/settings/billing
│   │   └── integrations/page.tsx # /dashboard/settings/integrations
│   │
│   └── ai/
│       ├── page.tsx              # /dashboard/ai
│       └── chat/[id]/page.tsx    # /dashboard/ai/chat/123
│
└── api/                          # API routes (server-side)
    ├── auth/[...nextauth]/route.ts
    ├── organizations/route.ts
    └── campaigns/route.ts
```

### Route Groups

- `(auth)` — Unauthenticated routes (no shell)
- `(dashboard)` — Authenticated routes (with shell)

### Nested Layouts

```
Root Layout (html, body)
  └── Auth Layout (centered card)
      └── Login Page
  └── Dashboard Layout (shell)
      ├── Dashboard Page
      ├── Campaigns Page
      └── Settings Page
```

### Protected Routes

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession(request);
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  if (!session && !isAuthPage) {
    return NextResponse.redirect('/login');
  }
  
  if (session && isAuthPage) {
    return NextResponse.redirect('/dashboard');
  }
}
```

### Dynamic Routes

- `[id]` — Single resource (campaign/:id)
- `[...slug]` — Catch-all (docs/*)
- `[[...slug]]` — Optional catch-all

---

## 75. State Management Details

### State Categories

**1. Server State (Remote)**
- Managed by TanStack Query
- Cached, background refreshed
- Mutations invalidate cache

**2. Global UI State (Local)**
- Managed by Zustand
- User preferences, UI state
- Persisted to localStorage

**3. Module State (Local)**
- Component state (useState)
- Form state (React Hook Form)
- Temporary UI state

**4. URL State**
- Filters, pagination, search
- Synced to URL params
- Shareable links

### Data Flow Pattern

```
User Action
  → Optimistic UI Update
    → API Mutation
      → Invalidate Query Cache
        → Refetch Latest Data
          → Rollback on Error
```

---

## 76. Security Architecture

### Authentication

**Protocol:** OAuth 2.1 + OpenID Connect
**Implementation:** NextAuth.js
**Session:** JWT (Redis-backed)

### Authorization

**Model:** RBAC (Role-Based Access Control)
**Enforcement:** Middleware (API), HOCs (UI)
**Context:** Organization + Workspace

### API Security

- **Rate Limiting:** Per-user, per-endpoint
- **CORS:** Whitelisted origins
- **CSP:** Content Security Policy headers
- **CORS:** Strict origin checks

### Data Protection

- **Encryption at Rest:** AES-256 (database)
- **Encryption in Transit:** TLS 1.3
- **Secrets:** Vault (HashiCorp) or AWS Secrets Manager
- **PII:** Masked in logs, encrypted in DB

### Audit & Compliance

- Audit logs for all actions
- SOC 2 Type II (annual audit)
- GDPR (data export, deletion)
- CCPA (privacy controls)

---

## 77. Integrations Ecosystem

### Native Integrations

| Platform | Type | Data Sync | Frequency |
|----------|------|-----------|-----------|
| Google Ads | Ads | Bidirectional | 15 min |
| Meta Ads | Ads | Bidirectional | 15 min |
| LinkedIn Ads | Ads | Bidirectional | 15 min |
| Google Analytics | Analytics | Inbound | 1 hour |
| Salesforce | CRM | Bidirectional | Real-time |
| HubSpot | CRM | Bidirectional | Real-time |
| Slack | Communication | Outbound | Real-time |
| Microsoft Teams | Communication | Outbound | Real-time |

### Integration Architecture

```
Integration Adapter Pattern
  ↓
OAuth 2.0 Authentication
  ↓
Rate-limited API Client
  ↓
Data Transformation (normalize to Calixo schema)
  ↓
Sync Engine (queue-based, with retries)
  ↓
Webhook Notifications (on change)
```

### Marketplace

- Third-party developers
- Sandboxed execution
- Revenue share (80/20)
- Review process

---

## 78. Scalability Planning

### User Scaling Targets

**Phase 1 (0-100 users)**
- Single region deployment
- Monolithic architecture
- Manual scaling

**Phase 2 (100-1,000 users)**
- Multi-region (US, EU)
- Microservices split (AI, integrations)
- Auto-scaling (Kubernetes)

**Phase 3 (1,000-10,000 users)**
- Sharded databases (by org)
- Read replicas
- CDN for static assets

**Phase 4 (10,000-100,000 users)**
- Global distribution (multi-cloud)
- Edge caching (Cloudflare)
- Database federation

### Technical Scaling

**Database:**
- Read replicas (5+)
- Connection pooling (PgBouncer)
- Query optimization (indexes, materialized views)

**Caching:**
- Redis cluster (10+ nodes)
- Multi-level caching (CDN + Redis + app)

**Queue:**
- Kafka/RabbitMQ for async
- Dead letter queues
- Priority queues

---

## 79. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)

**Goal:** Build solid foundation for development

**Deliverables:**
- Design system and component library
- Authentication and authorization
- Organization/workspace model
- Core platform settings
- Database schema

**Milestones:**
- Month 1: Design system, basic UI
- Month 2: Authentication, routing
- Month 3: Core APIs, database

---

### Phase 2: Marketing Modules (Months 4-9)

**Goal:** Launch core marketing features

**Deliverables:**
- Dashboard
- Analytics
- Ads Manager (Google, Meta)
- Social Media (basic)

**Milestones:**
- Month 4: Dashboard, basic analytics
- Month 5: Analytics expansion
- Month 6: Ads Manager
- Month 7: Social Media
- Month 8: Integration sync
- Month 9: Polish, testing

---

### Phase 3: AI Platform (Months 10-15)

**Goal:** Integrate AI throughout

**Deliverables:**
- AI Copilot
- Auto-insights
- Content generation
- Predictive analytics

**Milestones:**
- Month 10: AI engine setup
- Month 11: Copilot UI
- Month 12: Insights engine
- Month 13: Content generation
- Month 14: Optimization
- Month 15: Testing

---

### Phase 4: Automation (Months 16-21)

**Goal:** Workflow automation

**Deliverables:**
- Workflow builder
- Triggers and conditions
- Action library
- Scheduler

**Milestones:**
- Month 16: Workflow engine
- Month 17: Visual builder
- Month 18: Triggers
- Month 19: Conditions
- Month 20: Library of actions
- Month 21: Testing

---

### Phase 5: Enterprise Features (Months 22-24)

**Goal:** Enterprise readiness

**Deliverables:**
- White-label
- SSO (SAML)
- Advanced permissions
- Audit logs
- SLA

**Milestones:**
- Month 22: White-label
- Month 23: SSO, RBAC
- Month 24: Auditing, compliance

---

## Appendix A: Architecture Decision Records

### ADR-001: Why Next.js?

**Decision:** Use Next.js App Router for frontend and API routes.

**Rationale:**
- React Server Components reduce bundle size
- Built-in routing and layouts
- API routes reduce backend complexity
- Excellent DX and TypeScript support

**Alternatives:** Remix, Gatsby, custom Express

---

### ADR-002: Why PostgreSQL?

**Decision:** Use PostgreSQL + TimescaleDB.

**Rationale:**
- ACID compliance for transactional data
- TimescaleDB for time-series (analytics)
- JSON support for flexible schemas
- Mature ecosystem

**Alternatives:** MySQL, MongoDB, DynamoDB

---

### ADR-003: Why tRPC?

**Decision:** Use tRPC for API layer.

**Rationale:**
- End-to-end type safety
- No code generation needed
- Excellent DX
- Fast iteration

**Alternatives:** GraphQL, REST, gRPC

---

### ADR-004: Why Zustand?

**Decision:** Use Zustand for client state.

**Rationale:**
- Minimal boilerplate
- Excellent TypeScript support
- Fast and lightweight
- DevTools integration

**Alternatives:** Redux, Jotai, Context API

---

## Appendix B: Technology Stack

### Frontend

| Layer | Technology | Purpose |
|---------|------------|---------|
| Framework | React 18 | UI library |
| Meta-framework | Next.js 14 | SSR, routing, API |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility CSS |
| Components | Radix UI | Accessible primitives |
| State (server) | TanStack Query | Server state |
| State (client) | Zustand | Client state |
| Forms | React Hook Form | Form handling |
| Validation | Zod | Schema validation |
| Animations | Framer Motion | Motion library |
| Charts | Recharts | Data visualization |

### Backend

| Layer | Technology | Purpose |
|---------|------------|---------|
| Runtime | Node.js | JS runtime |
| Framework | Next.js API | API routes |
| ORM | Prisma | Database ORM |
| API | tRPC | Type-safe API |
| Queue | BullMQ | Job queues |
| Cache | Redis | Caching, sessions |
| Search | Elasticsearch | Full-text search |

### AI

| Component | Technology | Purpose |
|-----------|------------|---------|
| LLM | OpenAI GPT-4o | Primary model |
| LLM | Claude 3.5 Sonnet | Secondary model |
| Orchestration | LangChain | agent framework |
| Embeddings | OpenAI text-embedding-3-large | Vector search |
| Vector DB | Pinecone | Knowledge base |
| Moderation | OpenAI Moderation API | Safety |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Hosting | Vercel / AWS | Frontend hosting |
| Containers | Docker | Containerization |
| Orchestration | Kubernetes | Container orchestration |
| Database | AWS RDS (PostgreSQL) | Managed database |
| Cache | Redis Cloud | Managed caching |
| Storage | AWS S3 | Object storage |
| CDN | Cloudflare | Content delivery |
| Monitoring | Datadog | Observability |
| Logging | Datadog / Loki | Log aggregation |
| CI/CD | GitHub Actions | Pipelines |

---

## Appendix C: Naming Conventions

### Files

- Components: PascalCase (`ExecutiveKpiCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`User.ts`)
- Constants: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Variables/Functions

- camelCase (`getUserById`)
- Boolean: `is`, `has`, `should` prefix (`isLoading`, `hasPermission`)

### Types/Interfaces

- PascalCase (`Campaign`, `CreateCampaignDto`)
- Props: `ComponentNameProps`
- Events: `ComponentNameEvents`

### API Routes

- Plural nouns (`/campaigns`, `/leads`)
- RESTful verbs (`GET`, `POST`, `PUT`, `DELETE`)

---

## Appendix D: Documentation Standards

### README

Every module/feature should have a README:
- Purpose
- Architecture diagram
- Setup instructions
- Usage examples
- API reference

### Comments

- JSDoc for exported functions
- Inline comments for complex logic
- TODO comments with ticket numbers

### Diagrams

- Architecture diagrams (Mermaid)
- Data flow diagrams
- State machines

---

**END OF PLATFORM ARCHITECTURE**

*This document is maintained by the Calixo Architecture Team. It should be reviewed quarterly and updated to reflect strategic decisions.*