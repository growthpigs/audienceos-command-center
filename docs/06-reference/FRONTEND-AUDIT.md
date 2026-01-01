# AudienceOS Command Center - Frontend Audit

> Audited: 2025-12-31 via Claude in Chrome
> URL: https://v0-audience-os-command-center.vercel.app/

---

## Executive Summary

The v0-generated frontend prototype is **comprehensive and well-structured**. All major screens are built with mock data. The UI follows a consistent dark theme with green accents using shadcn/ui components.

**Grade: B+ (Solid foundation, needs backend connection)**

---

## Pages Inventory

### 1. Dashboard (`/`)
**Purpose:** Real-time overview of client fulfillment operations

**KPI Cards (4):**
| Metric | Value | Status |
|--------|-------|--------|
| Active Onboardings | 5 | +2 this week |
| Clients at Risk | 3 | Needs attention |
| Avg Install Time | 7 Days | On target (<7) |
| Support Hours | 12h | Over goal (<5h) |

**Charts:**
- Signal Recovery (+15% via server-side)
- Event Match Quality (EMQ) - 8.2/10 gauge
- API Uptime status (Meta CAPI, Google EC, Klaviyo)
- New Clients vs Completed Installs (30 day)
- Clients Needing Attention list

**AI Assistant Widget:** Persistent at bottom with quick actions

---

### 2. Pipeline (`/pipeline`)
**Purpose:** Kanban board for client lifecycle stages

**Columns (4):**
- Onboarding
- Installation
- Audit
- Live

**Card Info:**
- Client name + avatar
- Health badge (Green/Yellow/Red)
- Days in stage
- Blocker indicator
- Owner avatar

**Features:** Drag-and-drop ready (needs dnd-kit implementation)

---

### 3. Client List (`/clients`)
**Purpose:** Table view of all clients with filtering

**Columns:**
- Client (name + avatar)
- Stage
- Blocker
- Health (color-coded badge)
- Owner
- Days (in stage, color-coded)
- Tickets
- Install (%)

**Features:**
- Search input
- 14 mock clients
- Click to open detail drawer

---

### 4. Client Detail (`/client/[id]`)
**Purpose:** Deep dive into individual client

**Header:**
- Client name, tier (Enterprise/Core), stage, days in stage
- Owner assignment
- Actions: Share, Open Shopify

**Tabs:**

#### Overview
- Health Status card (Blocked/Green/Yellow/Red)
- Support Tickets count
- Last Contact (with source)
- Install Progress (%)
- Client Timeline (activity log)

#### Communications
- Unified thread view (Slack + Gmail)
- Internal vs Client message differentiation
- Subject line for emails
- "Type a message..." input
- **AI Draft Reply** button

#### Tasks
- Grouped by stage (Onboarding, Installation)
- Checkbox, task name, assignee dropdown, due date
- Per-client task checklist

#### Performance
- Meta Ads card (Spend, ROAS, CPA)
- Google Ads card (Impressions, Clicks, Conversions)
- Performance Over Time chart (Recharts)
- Sync Now button

#### Media & Files
- (Not explored in detail)

#### Tech Setup
- (Not explored in detail)

---

### 5. Onboarding Hub (`/onboarding`)
**Purpose:** Manage client onboarding pipeline and intake forms

**Tabs:**
- Active Onboardings
- Client Journey
- Form Builder

**Active Onboardings:**
- Client name + tier + days in stage
- Owner assignment
- 5-step progress bar:
  1. Intake Received
  2. Access Verified (with platform badges: FB, GA, SH)
  3. Pixel Install
  4. Audit Complete
  5. Live Support

**Actions:**
- Trigger Onboarding
- Copy Portal Link
- View as Client

---

### 6. Intelligence Center (`/intelligence`)
**Purpose:** AI-powered insights and unified communications

**Top Status:**
- Gmail Sync status
- Slack Sync status
- Ad Accounts connected count
- Upload Assets dropzone

**Three Priority Columns:**

| Critical Risks | Approvals & Actions | Performance Signals |
|----------------|--------------------|--------------------|
| Ad Account Disconnected | Approve Weekly Report | ROAS Dropped 10% |
| Budget Cap Hit | Review Draft Reply | Traffic Up 20% |
| Pixel Firing Errors | Pending Legal Review | CPA Below Target |
| | Respond to Client Email | Conversion Rate Improved |

**Card Structure:**
- Title + description
- Client name (linked)
- Timestamp
- Action button (Reconnect Now, Review & Send, etc.)

---

### 7. Support Tickets (`/tickets`)
**Purpose:** Track and resolve client issues

**Kanban Columns:**
- New (2)
- In Progress (2)
- Waiting on Client (1)
- Resolved (1)

**Ticket Card:**
- Title
- Priority badge (High/Medium/Low)
- Client name
- Assignee + timestamp
- Source tag (Client Email, Detected via Slack, **Detected via AI**, Internal, Scheduled Task)

**Features:**
- Grid/List toggle
- Assignee filter
- Search
- New Ticket button

---

### 8. Knowledge Base (`/knowledge`)
**Purpose:** SOPs, training materials, documentation (RAG source)

**Filters:** Installation | Technical | Process | Support

**Document Cards (6):**
- Meta Pixel Installation Guide (guide, 8 min)
- GTM Container Setup Process (document, 12 min)
- iOS 17 Tracking Changes (document, 6 min)
- Client Onboarding Checklist (guide, 5 min)
- Troubleshooting Pixel Misfires (document, 10 min)
- Conversion API Setup Tutorial (video, 15 min)

**Content Types:** guide (green), document (blue), video (pink)

**Quick Links:** External resources (Shopify, Meta, GTM, Training)

---

### 9. Automations (`/automations`)
**Purpose:** No-code workflow automation

**Tabs:**
- Active Workflows
- Templates Library
- Execution Logs

**Active Workflows (3):**
| Name | Description | Trigger | Runs |
|------|-------------|---------|------|
| Daily Pixel Health Check | Monitor Meta Ads API | Daily 8 AM | 14 |
| New Client Setup | AI plan generation | Onboarding Complete | 3 |
| Urgent Triage Bot | Keyword detection | Slack: "Urgent" | 1 |

**Card Info:** Title, description, trigger type, run count, last run, on/off toggle

---

### 10. Integrations (`/integrations`)
**Purpose:** Manage connected services and AI settings

**Integration Cards:**
| Service | Status | Last Sync |
|---------|--------|-----------|
| Slack | Connected | 2m ago |
| Gmail | Connected | 5m ago |
| Meta Ads | Connected | 1h ago |
| Google Ads | Connected | 1h ago |
| Zoom | Disconnected | - |

**AI Settings:**
- Auto-tag incoming messages (ON)
- Draft replies automatically (ON)
- Flag negative sentiment (ON)
- Manage SOPs for AI Training (link)

**View Toggle:** Agency View / Client View

---

### 11. Settings (`/settings`)
**Purpose:** Account and notification preferences

**Profile:**
- Name, Role, Email fields

**Alert Preferences:**
- Stuck Client Alerts (>4 days)
- Daily Digest via Email
- Slack Notifications for New Installs

---

## Global Components

### Sidebar Navigation
- AudienceOS logo
- Quick Create button (green)
- 10 navigation items with icons
- User profile at bottom (name, role)

### AI Assistant Widget (Persistent)
- "AudienceOS Intelligence" label with AI badge
- Quick action chips:
  - Show stuck clients
  - Draft email to RTA Outdoor
  - How do I troubleshoot pixel?
  - Summarize at-risk clients
- Text input: "Ask about client status or draft a support response..."
- Expand/collapse controls

---

## Technical Observations

### Strengths
1. **Comprehensive UI coverage** - All screens specified in PRD exist
2. **Consistent design system** - Dark theme, green accents, shadcn/ui
3. **Good information architecture** - Logical navigation flow
4. **AI-native design** - Assistant widget, AI Draft Reply, Detected via AI
5. **Human-in-the-loop patterns** - Approval workflows in Intelligence Center

### Gaps / Needs Work
1. **No backend connection** - All mock data in `lib/mock-data.ts`
2. **No state management** - Needs Zustand for shared state
3. **No real-time updates** - Needs Supabase Realtime subscription
4. **Kanban drag-drop** - Pipeline needs dnd-kit implementation
5. **Form validation** - No validation on inputs
6. **Error states** - No loading/error UI
7. **Responsive design** - Not tested on mobile

### Component Quality
- Using shadcn/ui (Radix primitives) - Good
- Charts via Recharts - Good
- Icons consistent throughout
- Color-coded health indicators work well

---

## MVP Feature Priority (80/20)

### Must Have (MVP)
1. **Pipeline Kanban** - Core workflow
2. **Client List + Detail** - Daily operations
3. **Slack Integration** - Non-negotiable per requirements
4. **Gmail Integration** - Non-negotiable per requirements
5. **AI Assistant** - Already have War Room chat to port

### Should Have
6. **Support Tickets** - Client management
7. **Intelligence Center** - AI alerts/approvals
8. **Dashboard KPIs** - Executive view

### Nice to Have (Post-MVP)
9. **Automations** - Complex workflow engine
10. **Knowledge Base** - RAG document management
11. **Onboarding Hub** - Client-facing portal
12. **Performance charts** - Ad metrics visualization

---

## MCP Shortcut for MVP

**Insight:** Use existing chi-gateway MCPs for individual Meta/Google account connections while waiting for multi-tenant OAuth approval:

- `mcp__chi-gateway__meta_accounts/campaigns/insights`
- `mcp__chi-gateway__google_ads_campaigns/performance`

This allows MVP launch without waiting for Meta/Google business verification.

---

*Synced from Claude in Chrome exploration - Living Document*
