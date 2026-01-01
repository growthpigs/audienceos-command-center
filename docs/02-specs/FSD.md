# **Functional Specifications Document (FSD)**

# **AudienceOS Command Center**

*Multi-Tenant SaaS for Marketing Agencies*

> Synced from Drive: 2025-12-31
> Updated: 2025-12-31 (Renamed to AudienceOS, multi-tenant architecture)

---

# **0. Document Purpose**

This Functional Specifications Document defines the **precise behavior** of the AudienceOS Command Center SaaS platform. It provides:

* System behavior
* UI/UX behavior
* Validation rules
* State transitions
* Integration rules
* AI assistant behavior
* Workflow automation logic
* Error handling
* Permissions
* Non-functional requirements
* Acceptance criteria
* Diagrams for major flows

---

# **1. System Overview**

AudienceOS is a **multi-tenant SaaS platform with RLS isolation per agency** for marketing agencies. It centralizes:

* Pipeline management
* Client lifecycle
* Support tickets
* KPI insights
* Knowledge base
* Automation workflows
* Slack / Gmail / Ads integrations
* AI assistant with RAG + DB querying

Core mission:

> **Help agencies manage clients efficiently and leverage AI to analyze data, summarize insights, and recommend actions.**

---

# **2. Roles & Permissions**

## **2.1 Owner**

* Only developer (hidden from normal UI)
* Full permissions over everything
* Can access system-level DevOps pages

## **2.2 Admin**

* Manage clients, integrations, automations, knowledge base, tickets, users
* Access all analytics
* Approve AI-generated actions

## **2.3 User**

* Manage assigned clients
* View pipeline, create/update tasks, view analytics
* Use AI assistant, draft emails (review required)
* Cannot manage integrations or edit automations

## **2.4 Agent (AI system role)**

* Never visible as a user
* Used internally to attribute AI-generated content
* Cannot perform actions without human approval

---

# **3. UI/UX Global Behaviors**

## **3.1 Loading States**

* Skeleton screens for all pages
* Loading indicators inside modals
* Buttons show "Loading…" with spinner

## **3.2 Error States**

**Soft Fail Model**

* No system blocks unless data is missing
* Banner warning appears at top of screen

## **3.3 Confirmations**

* "Are you sure?" dialog for destructive actions (Delete client, Delete automation, Remove integration)

## **3.4 General Form Rules**

* Required fields glow red on validation failure
* Disabled primary action until valid
* Text areas auto-expand
* Autosave drafts for long-form fields

---

# **4. Screens & Functional Specifications**

## **4.1 Dashboard**

### Components

* Active Onboardings (count)
* At-Risk Clients (count)
* Support Hours This Week
* Average Install Time
* Progress chart (New vs Completed installs)
* Clients Needing Attention (AI curated list)

### Behavior

* Data refreshes hourly
* Manual "Refresh Data" button triggers on-demand fetch
* Clicking a metric navigates to a filtered Client List view

### Acceptance Criteria

* Metrics must load within 3 seconds
* Clicking a KPI must pass applied filters as query params

---

## **4.2 Pipeline (Kanban Board)**

Stages: Onboarding → Installation → Audit → Live → Needs Support → Off-Boarding

### Client Card

* Name, Health (Green/Yellow/Red), Days in stage, Owner, Latest note preview

### On Hover

* Quick actions: Open details, Add note, Assign user

### Drag-and-Drop Behavior

* Confirmation modal only for: Needs Support, Off-Boarding
* Cannot move card backwards more than 2 stages (Admin override allowed)
* Must create a StageEvent record

---

## **4.3 Client Detail Drawer**

### Tabs

1. **Comms** - Aggregated Slack + Gmail threads (newest → oldest)
2. **Tasks** - Stage-based checkmarks, remain across stage movement
3. **Performance** - Graphs for Meta + Google Ads (7/14/30 days)
4. **Media** - Zoom recordings + searchable transcripts

---

## **4.4 Client List**

### Columns

Client name, Stage, Owner, Days in stage, Tickets open, Install time

### Bulk Actions

Assign owner, Move stage, Mark healthy (Admin only)

---

## **4.5 Intelligence Center**

### Sections

* **Critical Risks** - Integration failures, KPI drops, No activity
* **Approvals & Actions** - AI-generated actions waiting for approval
* **Performance Signals** - Significant KPI changes

---

## **4.6 Support Tickets**

Columns: New → In Progress → Waiting on Client → Resolved

### Resolution Behavior

* Mandatory "Final Note"
* Optional "Send Client Summary Email" checkbox
* "Reopen ticket" button

---

## **4.7 Knowledge Base**

Categories: Installation, Tech, Support, Process

### Search

* Full-text search
* Metadata filters
* RAG-based answer linking

---

## **4.8 Automations (IF/THEN Builder)**

### Limits

* Max triggers: 2
* Max actions: Unlimited chain
* Support: Conditional branching, Delayed actions (0 min → 24 hours)

---

## **4.9 Integrations**

v1: Slack, Gmail, Google Ads, Meta Ads

### Sync Frequency

* Hourly CRON
* On-demand "Sync Now" button

### KPI Rules

* CPA with 0 conversions = 0
* Missing data = flagged
* Negative data = flagged

---

# **5. AI Assistant**

The assistant performs: DB queries, Document search (RAG), Draft emails, Summaries, Insight analysis

## **5.1 Prompt-Level Rules**

* Summaries must include: KPI deltas, Risk factors, Stage-based next steps
* Draft emails must: Use professional tone, Include client-specific data, Always require user confirmation

---

# **6. Non-Functional Requirements**

## **6.1 Performance**

* Page loads < 3s
* AI responses < 8s
* Sync operations must not block UI

## **6.2 Reliability**

* Soft failures for integrations
* Automatic retries with backoff

## **6.3 Security**

* All integration tokens encrypted
* RLS enforced per tenant
* Admin-only destructive actions

---

# **7. Acceptance Criteria (Cross-System)**

1. **Pipeline** - Moving a client persists within 100ms, Invalid transitions blocked
2. **Tickets** - Resolving requires final note, Reopening moves back to In Progress
3. **Ads KPIs** - ROAS and CPA compute correctly, Flag missing attribution
4. **Automations** - Two triggers max enforced, Unlimited chained actions
5. **AI Assistant** - Summaries reference at least 2 sources, No autonomous execution

---

*Synced from Drive — Living Document*
