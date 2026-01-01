# AudienceOS Command Center - UX Brainstorm

> Generated: 2025-12-31 via TechSnack Pro Prompts
> Status: Approved (CTO/PM decision)

---

## Overview

UX exploration for 3 key MVP features. Since v0 prototype already exists, this documents the chosen approaches and planned enhancements.

**Baseline:** v0-audience-os-command-center.vercel.app (B+ grade)

---

## Feature 1: Client Pipeline Management

### Feature Overview

| Field | Value |
|-------|-------|
| **Feature Name** | Client Pipeline Management (Kanban) |
| **Primary User Goal** | Quickly see all clients by stage, identify who needs attention |
| **Success Criteria** | AM can triage entire portfolio in <2 minutes |
| **Pain Points Solved** | Scattered spreadsheets, no visibility into stuck clients |
| **Primary Persona** | Agency Account Manager (15-40 clients) |

### Chosen Approach: Classic Kanban (v0 baseline)

**Why:**
- Already implemented in v0
- Matches agency mental model (Trello/Monday)
- Chase's team specifically requested Kanban view

### Enhancements Planned

| Enhancement | Priority | Notes |
|-------------|----------|-------|
| dnd-kit drag-drop | P0 | Currently static cards |
| Quick filters | P1 | "My clients", "At risk", "Blocked" |
| Slide-out drawer on click | P1 | Not full page navigation |
| Swimlanes by owner | P2 | Optional toggle |
| Bulk actions | P2 | Multi-select cards |

### Rejected Alternatives

| Approach | Why Rejected |
|----------|--------------|
| List + Drawer | Less visual, would require rebuild |
| Timeline View | Complex to build, unfamiliar pattern |

---

## Feature 2: Unified Communications Hub

### Feature Overview

| Field | Value |
|-------|-------|
| **Feature Name** | Unified Communications Hub |
| **Primary User Goal** | See all client conversations in one place |
| **Success Criteria** | Response time reduced 50%; zero missed messages |
| **Pain Points Solved** | Context-switching Slack/Gmail, lost threads |
| **Primary Persona** | Agency AM handling multi-channel comms |

### Chosen Approach: Unified Timeline (v0 baseline)

**Why:**
- Already implemented in v0
- Cross-channel context is core value prop
- "Single source of truth" positioning

### Enhancements Planned

| Enhancement | Priority | Notes |
|-------------|----------|-------|
| Thread collapsing | P0 | Show latest, expand for history |
| Unread badges | P0 | Visual indicators |
| "Needs reply" flags | P0 | AI-detected |
| Quick reply inline | P1 | Not just bottom composer |
| Source filter toggle | P1 | "Slack only" / "Email only" |
| AI Draft in compose | P1 | Progressive reveal |

### Rejected Alternatives

| Approach | Why Rejected |
|----------|--------------|
| Split Pane by Channel | Harder to see cross-channel context |
| Inbox Zero Style | Requires discipline, may miss context |

---

## Feature 3: AI Intelligence Layer

### Feature Overview

| Field | Value |
|-------|-------|
| **Feature Name** | AI Intelligence Layer |
| **Primary User Goal** | Proactive alerts, faster drafts, knowledge access |
| **Success Criteria** | 80% at-risk clients flagged by AI first |
| **Pain Points Solved** | Reactive firefighting, slow responses |
| **Primary Persona** | Agency AM staying ahead of problems |

### Chosen Approach: Command Center + Widget (v0 baseline)

**Why:**
- Already implemented in v0
- Gives users choice: proactive (Intelligence page) or reactive (widget)
- Human-in-the-loop workflow is clear

### Enhancements Planned

| Enhancement | Priority | Notes |
|-------------|----------|-------|
| Progressive reveal chat | P0 | Port from War Room |
| Alert drawer expansion | P0 | Don't navigate away |
| RAG with Knowledge Base | P1 | Gemini File Search |
| Sources citation | P1 | Show what AI used |
| Snooze/dismiss alerts | P1 | Action management |
| Risk detection rules | P1 | Configurable thresholds |

### Rejected Alternatives

| Approach | Why Rejected |
|----------|--------------|
| AI-First Homepage | Overwhelming, "black box" concerns |
| Contextual AI Only | Misses proactive alerting opportunity |

---

## UX Principles Applied

### User-Centered Foundations
- ✅ Clear "job to be done" per screen
- ✅ Progressive disclosure (drawer pattern)
- ✅ Immediate feedback (toast, loading states)

### Information & Interaction Design
- ✅ Consistent navigation (10-item sidebar)
- ✅ Clear hierarchy (KPI cards → detail → action)
- ✅ Platform conventions (Kanban, inbox, chat)

### Accessibility & Inclusivity
- ⚠️ Need: Keyboard navigation for Kanban
- ⚠️ Need: Focus states for AI interactions
- ✅ Color not sole indicator (badges + icons)

### Edge States
- ⚠️ Need: Empty states for new agencies
- ⚠️ Need: Loading skeletons
- ⚠️ Need: Error recovery UI

---

## Summary

| Feature | Approach | Key Add |
|---------|----------|---------|
| Pipeline | Classic Kanban | dnd-kit, drawer |
| Comms Hub | Unified Timeline | Thread collapse, unread |
| AI Layer | Command Center + Widget | Progressive reveal, RAG |

**Next Step:** UX Refinement for component polish, then implementation.

---

*Generated via TechSnack Pro Prompts - Living Document*
