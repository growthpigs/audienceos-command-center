# AudienceOS Command Center - MVP PRD

**Generated:** 2025-12-31
**Status:** Draft (P-1 Phase)
**Source:** TechSnack Pro Prompts methodology

---

## 1. Executive Summary

**Elevator Pitch:** Unified command center for marketing agencies to manage clients, communications, and AI-powered insights in one dashboard.

**Problem Statement:** Marketing agencies juggle multiple tools (Slack, Gmail, Google Ads, Meta Ads, spreadsheets) to manage client lifecycles. Critical issues get missed, response times suffer, and team members lack visibility into client health. No single source of truth exists.

**Target User:** Agency Account Managers / CSMs who onboard clients, manage campaigns, address issues, and ensure accounts stay healthy. They currently context-switch between 5+ tools daily.

**Proposed Solution:** A multi-tenant SaaS dashboard with Pipeline Kanban, unified Slack/Gmail inbox per client, ad performance tracking, AI-powered risk detection, and automated workflows—with human-in-the-loop approval for all actions.

**MVP Success Metric:** 80% of at-risk clients identified proactively by AI before escalation.

---

## 2. Key Features (Max 3)

### Feature 1: Client Pipeline Management

**User Story:** As an Account Manager, I want to see all my clients in a Kanban board by stage, so that I can quickly identify who needs attention and track progress.

**Acceptance Criteria:**
- Given a logged-in user, when they view Pipeline, then they see clients in columns: Onboarding → Installation → Audit → Live → Needs Support → Off-boarding
- Given a client card, when I click it, then a detail drawer opens with tabs: Overview, Comms, Tasks, Performance, Media
- Given drag-and-drop, when I move a card, then the client stage updates and a StageEvent is logged

**Priority:** P0
**Reason:** Core workflow—agencies live in this view. 80% of daily work.

**Dependencies/Risks:**
- Requires client data model and stage tracking
- Drag-drop needs dnd-kit implementation

---

### Feature 2: Unified Communications Hub

**User Story:** As an Account Manager, I want to see all Slack and Gmail threads for a client in one place, so that I don't miss messages or lose context.

**Acceptance Criteria:**
- Given Slack OAuth connected, when a message is sent in a client's channel, then it syncs to the client's Comms tab within 5 minutes
- Given Gmail OAuth connected, when an email thread involves a client contact, then it appears in chronological order with Slack messages
- Given the AI Draft Reply button, when clicked, then AI generates a contextual reply using conversation history + Knowledge Base

**Priority:** P0
**Reason:** Non-negotiable per requirements. Agencies lose clients due to missed communications.

**Dependencies/Risks:**
- OAuth app approval from Google/Meta (use MCP shortcut initially)
- Message deduplication logic needed
- Privacy: only sync messages from designated client channels/threads

---

### Feature 3: AI Intelligence Layer

**User Story:** As an Account Manager, I want AI to surface critical risks, suggest actions, and help me draft responses, so that I can be proactive instead of reactive.

**Acceptance Criteria:**
- Given integrated data sources, when AI detects a risk pattern (ad account disconnect, KPI drop >20%, no activity >7 days), then it creates an alert in Intelligence Center
- Given an alert card, when I click "Draft Response", then AI generates a contextual message using RAG from Knowledge Base
- Given the floating AI assistant, when I ask a question, then it queries: (1) client data, (2) uploaded SOPs, (3) conversation history

**Priority:** P0
**Reason:** Differentiator—AI-native operations with human-in-the-loop. Port from War Room's proven chat system.

**Dependencies/Risks:**
- Gemini File Search for RAG (proven in War Room)
- Knowledge Base document upload/indexing
- Risk detection rules need tuning

---

## 3. Requirements Overview

### Functional (core flows only)
- **Auth:** Supabase Auth (email/password + OAuth)
- **Pipeline:** Client CRUD → Stage changes → Activity logging
- **Comms:** OAuth connect → Hourly sync → Unified thread view → AI draft
- **Intelligence:** Risk detection rules → Alert creation → Human approval → Action execution
- **Knowledge Base:** Document upload → Gemini File Search indexing → RAG queries

### Non-Functional (MVP-critical only)
- **Performance:** Dashboard loads <2s, chat response <5s
- **Security:** Multi-tenant RLS isolation (RevOS pattern), encrypted OAuth tokens
- **Accessibility:** Keyboard navigable, WCAG 2.1 AA contrast

### UX Requirements
- **Experience:** Linear design system—minimal B2B SaaS aesthetic with subtle depth through shadows
- **Principle 1:** Simplicity—one primary action per screen
- **Principle 2:** Immediate feedback—toast notifications, loading states, progressive reveal for AI

---

## 4. Validation Plan

**Core Hypothesis:** Marketing agencies will adopt a unified dashboard if it reduces context-switching and proactively surfaces client risks.

**Key Assumption:** Agencies currently miss critical client issues due to fragmented tools, and AI-powered detection will catch what humans miss.

**Validation Method:** Deploy to Chase's agency (alpha tester) with 5-10 active clients. Track: (1) login frequency, (2) time-to-response on client issues, (3) % of risks caught by AI vs discovered manually.

---

## 5. Critical Questions Checklist

| Question | Answer |
|----------|--------|
| Is this solving a real problem? | Yes—agencies lose clients due to missed communications and reactive (not proactive) management. Chase's agency is first customer. |
| Who are the first 10 users? | Chase's agency team (Account Managers, fulfillment staff). Then expand to similar marketing agencies. |
| What's the simplest version? | Pipeline Kanban + Unified Comms (Slack/Gmail) + Floating AI chat. Everything else can wait. |
| How will we measure success? | 80% at-risk clients identified by AI before manual discovery. Response time reduced by 50%. |
| What are we NOT building? | Autonomous execution (all actions need approval), visual workflow editor (simple IF/THEN only), billing system, industries outside marketing agencies. |

---

## 6. Out of Scope (Explicit)

These are NOT in the MVP:
- Autonomous AI actions without human approval
- Zoom integration (v2)
- Visual drag-drop workflow builder (simple triggers only)
- Multi-org roles/permissions beyond Agency Admin
- External webhook triggers
- Additional ad platforms beyond Google/Meta
- Billing/subscription management
- Mobile app

---

## 7. Architecture Notes (from analysis)

**Import from War Room:**
- Toast system (use-toast.ts, toast.tsx, toaster.tsx)
- IntelligentChat → Extract to @chi/intelligent-chat package
- GeminiFileSearchService (RAG)
- Progressive reveal hooks (useProgressiveReveal)

**Import from RevOS:**
- Multi-tenant RLS pattern (Agency → Client → User)
- Admin system (super/tenant)
- Supabase server client pattern
- Session manager
- Middleware (cookie handling)

**Design System:**
- Linear-inspired minimal B2B aesthetic (NOT War Room glassmorphism)
- shadcn/ui components with custom theme
- See: docs/03-design/DESIGN-BRIEF.md

**Standalone Package:**
- @chi/intelligent-chat - reusable chat with progressive reveal, citations, SSE streaming

---

*Generated via TechSnack Pro Prompts P-1 methodology*
*Updated: 2025-12-31 (Linear design system, @chi/intelligent-chat extraction)*
