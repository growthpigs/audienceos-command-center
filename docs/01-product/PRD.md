# **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

## **AudienceOS Command Center – Multi-Tenant SaaS for Marketing Agencies**

> Generated: 2025-12-31 (D-1 SpecKit Init)
> Expands: MVP-PRD.md with full user stories and technical requirements

---

# **1. Product Overview**

### **1.1 Purpose**

AudienceOS Command Center is a multi-tenant SaaS platform designed for **marketing agencies** to manage their client lifecycle, communications, performance data, internal SOPs, and AI-assisted workflows. It centralizes CRM-like pipeline management, KPI insights, support operations, automations, and document intelligence in one dashboard.

The differentiator: **AI-native operations** powered by RAG search (Google File Search), generative drafting, KPI intelligence, and risk detection—while keeping human approval in the loop.

---

# **2. Target User Persona**

### **Primary Persona: Agency Account Manager / CSM**

Responsible for onboarding clients, managing campaigns, addressing issues, communicating with clients, and ensuring accounts stay healthy.

### **Secondary Persona: Agency Owners / Directors**

Want global visibility into operations, risk levels, KPI trends, and team performance.

### **Tertiary Persona: Support / Technical Staff**

Handle client issues, tickets, troubleshooting, and task management.

---

# **3. Goals & Non-Goals**

### **3.1 Product Goals**

* Provide a unified dashboard for client lifecycle visibility.
* Integrate seamlessly with Slack, Gmail, Google Ads, Meta Ads (v1).
* Enable AI-powered summarization, insights, risk detection, and drafting.
* Allow agencies to maintain their internal knowledge base & SOPs.
* Provide a configurable automation system.
* Deliver accurate KPI performance insights across ad platforms.
* Enable RAG search across uploaded documents and internal DB.

### **3.2 Non-Goals**

* Autonomous execution without approval (no auto-sending communications without review).
* Serving industries outside marketing agencies in v1.
* Multi-tenant tenant-per-row architecture.
* A full Zapier-style visual workflow editor (simple IF/THEN for v1).
* Handling billing itself (billing system spec next phase).

---

# **4. Platform Architecture Requirements**

### **4.1 Multi-Tenant Architecture**

* **Multi-tenant with Row-Level Security**:

  * Single Supabase project with RLS policies isolating agencies
  * Each agency identified by agency_id in JWT custom claims
  * RevOS pattern: Agency → Users → Clients hierarchy
  * All queries automatically scoped by auth.jwt() ->> 'agency_id'

### **4.2 Infrastructure**

* **Frontend**: Next.js + Tailwind on Vercel
* **Backend**: Supabase (PostgreSQL + Functions + Storage)
* **Integrations**: Server-side OAuth + Webhooks
* **AI**:
  * Claude API for chat, drafting, and risk detection
  * Gemini File Search for RAG and document indexing
  * Progressive reveal for AI chat (War Room pattern)
* **Hosting**: Vercel + Supabase
* **Real-time updates**: Supabase Realtime

---

# **5. Core Pages & Requirements**

## **5.1 Dashboard**

### **Purpose:** Give agency users instant visibility on critical operations.

### **KPIs & Cards**

* Active Onboardings
* At-Risk Clients (aggregated via AI + rules)
* Support Hours This Week
* Average Install Time (rolling 30-day)
* New Clients vs Completed Installs (chart)
* Clients Needing Attention (AI-detected or rule-based)

### **Functional Requirements**

* Hourly refresh of KPI data.
* On-demand manual refresh button.
* Clicking a KPI drills into relevant list (ex: "At-Risk Clients" → filtered Client List).

---

## **5.2 Pipeline (Kanban Board)**

### **Columns**

* Onboarding
* Installation
* Audit
* Live
* Needs Support
* Off-Boarding

### **Client Card Data**

* Client name
* Internal owner / assignee
* Client health (Green/Yellow/Red)
* Days in current stage
* Recent comments

### **Card Behavior**

* Drag & drop between columns
* Limit: max 10 per column per page with pagination controls
* Filters: Stage, Owner, Active clients only, Health

### **Client Detail Drawer Tabs**

1. **Comms** - Aggregated Slack + Gmail, AI-drafted replies
2. **Tasks** - Stage-based checklists with assignable owners
3. **Performance** - Graphs from Meta + Google Ads (ROAS, CPA, Spend, Clicks, Conversions)
4. **Media** - Zoom recordings + searchable transcripts

---

## **5.3 Client List**

### **Columns**

* Client Name, Stage, Owner, Days in Stage, Support Tickets Count, Install Time

### **Features**

* Global search, Sorting, "Add Client" button, Row click opens detail drawer

---

## **5.4 Intelligence Center**

### **Sections**

1. **Critical Risks** - AI-detected issues, resolution buttons
2. **Approvals & Actions** - Human-approval workflows
3. **Performance Signals** - Trend analysis, KPI deviations

---

## **5.5 Support Tickets**

### **Kanban Columns**

New → In Progress → Waiting on Client → Resolved

### **AI Features**

* Root Cause Analysis
* Suggested Fix Steps
* "View Related SOPs" (RAG)

---

## **5.6 Knowledge Base**

* Search by title, tags, content
* Category sorting (Installation / Tech / Process / Support)
* Upload documents (PDF, DOCX, video)

---

## **5.7 Automations (IF/THEN Workflow System)**

* Triggers: New Client, Stage Change, New Ticket, Ad Spend Spike
* Actions: Send Email, Send Slack, Create Task
* Dynamic tags: `{client_name}`, `{stage}`, `{owner_name}`

---

## **5.8 Integrations**

**v1:** Slack, Gmail, Google Ads, Meta Ads

Each integration has: Connected status, Last synced, Settings, Test Connection

---

## **5.9 Settings**

* Profile (Name, Role, Email)
* Alerts (Stuck client alerts, Daily Digest, Slack notifications)
* Goals & Targets (Install Time, Support Hours)

---

# **6. AI / LLM Requirements**

### **Capabilities for v1**

☑ Query internal DB
☑ Search uploaded documents (RAG)
☑ Draft emails and Slack replies
☑ Generate summaries
☑ Identify risk patterns
☑ Create structured reports

### **Constraints**

* AI cannot execute actions autonomously
* All actions require human confirmation
* RAG uses Google File Search as primary vector store

---

# **7. Data Sync Requirements**

* **Hourly** automated pulls
* **On-demand** "Sync Now" button
* ETL Pipeline: Raw ingestion → formatting → KPI calculation → insight generation

---

# **8. Detailed User Stories**

> **Complete Stories:** See `docs/02-specs/USER-STORIES.md` for full 56 user stories with acceptance criteria.

### **Epic A: Core Platform (MVP)**

#### **A1: Dashboard Overview (3 stories)**
- **US-001**: View Executive KPI Dashboard - Real-time metrics with drill-down
- **US-002**: View Client Trend Charts - Recharts visualizations with time filters
- **US-003**: Dashboard Drill-Down Navigation - URL state management

#### **A2: Pipeline Management (5 stories)**
- **US-004**: View Client Pipeline Kanban - 6-column board with pagination
- **US-005**: Move Clients Between Stages - dnd-kit with confirmation modals
- **US-006**: View Client Details in Drawer - Slide-out with tabs
- **US-007**: Filter Pipeline by Criteria - Multiple filter combinations
- **US-008**: Secure Multi-Tenant Login - JWT with agency_id scoping

#### **A3: Authentication (1 story)**
- Multi-tenant RLS with Supabase Auth

### **Epic B: Integrations & Sync (4 stories)**
- **US-009-012**: OAuth flows for Slack, Gmail, Google Ads, Meta Ads
- Token encryption, refresh, and health monitoring

### **Epic C: Unified Communications (4 stories)**
- **US-013-016**: Timeline view, filtering, replies, AI drafts
- Thread grouping, virtualized lists, real-time updates

### **Epic D: AI Intelligence Layer (8 stories)**
- **US-017-024**: Risk detection, alerts, Chi chat, context awareness
- Smart routing, memory, citations, draft generation

### **Epic E-I: Additional Features**
- **Knowledge Base**: US-025-028 (4 stories)
- **Support Tickets**: US-029-032 (4 stories)
- **Automations**: US-033-037 (5 stories)
- **Settings**: US-038-041 (4 stories)

**Total: 56 User Stories across 9 feature areas**

---

# **9. Data Model Overview**

### **Core Entities**

Agency, User, Client, Stage, Task, Communication, Ticket, TicketNote, AdsMetrics, IntegrationCredential, Workflow, Document, Insight

---

# **10. Analytics & KPI Requirements**

### **Cross-platform blending**

Blend Google Ads + Meta Ads into unified views with drill-down capability.

### **Risk Scoring**

* Account disconnect
* KPI drop > X%
* No activity > Y days
* Support backlog
* Negative sentiment

---

# **11. Roadmap**

### **MVP**

Dashboard, Pipeline, Client List, Basic AI assistant, Slack + Gmail OAuth, Meta + Google Ads OAuth, Intelligence Center v0

### **v1**

Full Intelligence Center, Support Tickets, Knowledge Base, Automations, AI insights/drafting/risk detection, KPI graphs

### **v2**

Zoom integration, More automations, Multi-org roles, External Webhook triggers, More ad platforms

---

*Living document — synced from Drive*
