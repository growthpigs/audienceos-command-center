# Chase's Original PRD (Source Document)

> **Imported from Drive:** 2025-12-31
> **Original Location:** AudienceOS/Project Documents & Design (Markdown)/Product Requirements Doc.md
> **Author:** Chase (client)

---

# **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

## **Diiiploy Command Center – SaaS for Marketing Agencies**

---

# **1. Product Overview**

### **1.1 Purpose**

Diiiploy Command Center is a single-tenant SaaS platform designed for **marketing agencies** to manage their client lifecycle, communications, performance data, internal SOPs, and AI-assisted workflows. It centralizes CRM-like pipeline management, KPI insights, support operations, automations, and document intelligence in one dashboard.

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

* **Single-tenant per agency**:

  * Each agency has its own isolated Supabase project (DB + storage).
  * Deployment model: "workspace" creation spins up a new Supabase project via automation or shared with RLS but isolated by workspace IDs (you choose implementation later, but PRD assumes isolation).

### **4.2 Infrastructure**

* **Frontend**: Next.js + Tailwind on Vercel
* **Backend**: Supabase (PostgreSQL + Functions + Storage)
* **Integrations**: Server-side OAuth + Webhooks
* **AI**:

  * RAG via Google File Search API
  * Additional embeddings stored per tenant
  * Model providers handled via backend
* **Hosting**: Vercel + Supabase
* **Real-time updates**: Supabase Realtime

---

# **5. Core Pages & Requirements**

---

# **5.1 Dashboard**

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

# **5.2 Pipeline (Kanban Board)**

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
* Filters:

  * Stage
  * Owner
  * Active clients only
  * Health

### **Client Detail Drawer Tabs**

#### **1. Comms**

* Aggregated recent communications from Slack + Gmail
* Ability to generate AI-drafted reply
* Ability to open full thread in native app

#### **2. Tasks (Stage-based Checklists)**

* Each stage has a predefined checklist
* Items include assignable "Owner"
* Mark complete / incomplete

#### **3. Performance**

* Graphs + raw numbers from Meta Ads + Google Ads
* Metrics:

  * ROAS
  * CPA
  * Impressions
  * Clicks
  * Conversions
  * Spend
* 7, 14, 30 day view options

#### **4. Media**

* Zoom meeting recordings
* Auto-pulled transcripts
* Searchable transcript viewer

---

# **5.3 Client List**

### **Columns**

* Client Name
* Stage
* Owner
* Days in Stage
* Support Tickets Count
* Install Time

### **Features**

* Global search
* Sorting by any column
* "Add Client" button (minimal form)
* Clicking row opens same detail drawer as Pipeline

---

# **5.4 Intelligence Center**

### **Top Sync Status Cards**

* Gmail Sync Status (last sync timestamp)
* Slack Sync Status
* Ad Accounts (Meta + Google) connected status
* Upload Assets (PDFs / CSVs → RAG ingestion)

### **Intelligence Columns**

1. **Critical Risks**

   * AI-detected issues (e.g., account disconnected 48 hours)
   * Resolution button (Reconnect Now)

2. **Approvals & Actions**

   * Human-approval workflows
   * Examples:

     * "Weekly performance report ready. Review & Send."

3. **Performance Signals**

   * Trend analysis
   * Positive or negative KPI deviations
   * "View Report" action button

### **Data Sources**

* Hourly sync + on-demand manual triggers
* AI insight generation runs after each sync

---

# **5.5 Support Tickets**

### **Kanban Columns**

* New
* In Progress
* Waiting on Client
* Resolved

### **Ticket Fields**

* Ticket number
* Status
* Client
* Assignee
* Priority
* Issue Description
* Sentiment (AI)
* Health status
* Days in stage
* Last install step
* Internal notes

### **AI Features**

* Root Cause Analysis
* Suggested Fix Steps
* "View Related SOPs" (RAG)
* "Generate Fix Steps"

### **Create Ticket Form**

* Title
* Client dropdown
* Priority dropdown
* Assignee dropdown
* Description

---

# **5.6 Knowledge Base**

### **Features**

* Search by title, tags, content
* Category sorting (Installation / Tech / Process / Support)
* Upload documents (PDF, DOCX, video)
* Cards show:

  * Category
  * Title
  * Description
  * Estimated length (auto-calculated)
  * Upload date

### **Quick Links Section**

* External resources curated by the agency

---

# **5.7 Automations (IF/THEN Workflow System)**

### **Header Summary Cards**

* Active Workflows
* Paused Workflows
* Runs This Week

### **Workflow Cards**

* Workflow Name
* On/Off toggle
* Workflow logic (When X → Then Y)
* Run count
* Last run time

### **Create Workflow Flow (Side Panel)**

#### Step 1 — Trigger (Examples)

* New Client Added
* Pipeline Stage Change
* New Support Ticket
* Ad Spend Spike

#### Step 2 — Action

* Send Email
* Send Slack Message
* Create Task

#### Step 3 — Content

* Dynamic tags allowed:
  `{client_name}`, `{stage}`, `{owner_name}`, `{company}`, `{date}`

#### Developer Mode

* Webhook URL + sample JSON payload
* Allow external systems to trigger workflows

---

# **5.8 Integrations**

### **v1 Includes**

* **Slack**
* **Gmail**
* **Google Ads**
* **Meta Ads**

### **Integration Card Requirements**

* Connected status
* Last synced timestamp
* Settings button
* "Test Connection" button

### **Slack Settings**

* Default channel dropdown
* Sync past 30 days switch
* Save / Cancel

### **Gmail Settings**

* Account email
* Permissions summary
* Re-authenticate

### **Ad Account Settings (Meta / Google Ads)**

* Account list
* Permissions
* Sync frequency: Hourly / On-demand

### **Zoom (spec for v2 but placeholders allowed)**

### **AI Settings Section**

* Auto-tag incoming messages
* Draft Replies Automatically
* Flag Negative Sentiment

---

# **5.9 Settings**

### **Profile**

* Name
* Role
* Email

### **Alerts**

* Stuck client alerts (> 4 days)
* Daily Digest email
* Slack notifications for new installs

### **Additional Notifications**

* Client at risk (health = red)

### **Goals & Targets**

* Install Time Target
* Weekly Support Hours Target

### **Integrations (repeated for convenience)**

Slack, Gmail, Google Ads, Meta Ads, etc.

---

# **6. AI / LLM Requirements**

### **Capabilities for v1**

* Query internal DB
* Search uploaded documents (RAG)
* Draft emails
* Draft Slack replies
* Generate summaries
* Identify risk patterns
* Create structured reports

### **Constraints**

* AI cannot execute actions autonomously
* All actions require human confirmation (unless action is whitelisted)
* RAG uses Google File Search as primary vector store

### **Assistant Behavior**

* Lives as floating button on all pages
* Supports natural language commands like:

  * "Show stuck clients"
  * "Summarize this client's performance"
  * "Draft a reply to this email"
  * "Search SOPs about pixel verification"

---

# **7. Data Sync Requirements**

### **Sync Frequency**

* **Hourly** automated pulls
* **On-demand** "Sync Now" button
* Slack: messages
* Gmail: threads
* Ads: KPIs
* Zoom: recordings + transcripts (future)

### **Extract Transform Load (ETL) Pipeline**

* Raw ingestion → formatting → KPI calculation → insight generation

---

# **8. Data Model Overview**

(Not exhaustive)

### **Core Entities**

* Agency
* User
* Client
* Stage
* Task
* Communication
* Ticket
* TicketNote
* AdsMetrics
* IntegrationCredential
* Workflow
* Document
* Insight

### **Document Storage**

* Supabase Storage
* Indexed via Google File Search for RAG

---

# **9. Analytics & KPI Requirements**

### **Cross-platform blending**

* Blend Google Ads + Meta Ads into unified views (with ability to drill down into each).
* Store normalized daily tables:

  * Impressions
  * Clicks
  * Spend
  * Conversions
  * Revenue (if available)

### **Risk Scoring**

* Account disconnect
* KPI drop > X%
* No activity > Y days
* Support backlog
* Negative sentiment

---

# **10. Roadmap (High-Level)**
** Subject to Change **

### **MVP**

* Dashboard
* Pipeline
* Client List
* Basic AI assistant (DB + RAG search)
* Slack + Gmail OAuth
* Meta + Google Ads OAuth
* Intelligence Center v0 (sync status only)

### **v1**

* Full Intelligence Center
* Support Tickets
* Knowledge Base
* Automations
* AI insights, drafting, risk detection
* KPI graphs
* Performance tab
* Media tab w/ transcripts

### **v2**

* Zoom integration
* More automations
* Multi-org roles
* External Webhook triggers
* More ad platforms
* Full agency-facing reporting suite

---

*This is Chase's original source document. DO NOT MODIFY - use for reference only.*
