# Statement of Work - AudienceOS Command Center

> **Client:** Chase (Marketing Agency)
> **Project:** AudienceOS Command Center v1
> **Created:** 2025-12-31
> **Status:** Draft

---

## 1. Executive Summary

Build a multi-tenant SaaS command center for marketing agencies that centralizes client lifecycle management, unified communications (Slack/Gmail), ad performance tracking (Google Ads/Meta), support tickets, knowledge base, and AI-assisted workflows.

**Scope:** MVP + Full v1 feature set (9 features, 206 tasks)

---

## 2. Work Breakdown by Hat

| Hat | Discipline | DU | Rate | Value |
|-----|------------|-----|------|-------|
| STRATEGY | Product Management | 7 | $175 | $1,225 |
| DESIGN | Product Design/UX | 20 | $150 | $3,000 |
| ARCHITECTURE | Systems Design | 27 | $150 | $4,050 |
| ENGINEERING | Core Development | 74 | $100 | $7,400 |
| QUALITY | QA/Operations | 6 | $100 | $600 |
| **TOTAL** | | **134 DU** | | **$16,275** |

### Hat Breakdown Rationale

**STRATEGY (7 DU)** - Product decisions, AI strategy, feature prioritization
- Chi Intelligent Chat product design
- Risk detection rules configuration
- Automation workflow patterns

**DESIGN (20 DU)** - UI/UX work across all features
- Linear design system implementation
- All 9 feature views and interactions
- Mobile responsive layouts
- Client drawer and modals

**ARCHITECTURE (27 DU)** - Systems design, data model, integrations
- Multi-tenant RLS data model
- OAuth integration architecture
- AI pipeline architecture (RAG, memory, routing)
- Real-time sync patterns

**ENGINEERING (74 DU)** - Core development
- Next.js 15 + React 19 implementation
- Supabase backend integration
- dnd-kit Kanban boards
- Recharts dashboards
- All API endpoints

**QUALITY (6 DU)** - Testing and operations
- Integration testing
- E2E happy paths
- Performance validation

---

## 3. Deliverables by Phase

| Phase | Features | Tasks | DU | Timeline |
|-------|----------|-------|-----|----------|
| **1. Foundation** | DB, Auth, API setup | 14 | 10 | Week 1-2 |
| **2. Pipeline** | Kanban, Client Drawer | 20 | 12 | Week 3-4 |
| **3. Dashboard** | KPIs, Charts | 22 | 13 | Week 5-6 |
| **4. Communications** | Slack/Gmail sync, Timeline | 24 | 17 | Week 7-8 |
| **5. Integrations** | OAuth, Token management | 26 | 17 | Week 9-10 |
| **6. AI Intelligence** | Chi Chat, Risk Detection | 48 | 35 | Week 11-14 |
| **7. Knowledge Base** | Upload, Search, RAG | 16 | 9 | Week 15-16 |
| **8. Support Tickets** | Kanban, AI assistance | 18 | 10 | Week 17-18 |
| **9. Automations** | IF/THEN builder | 20 | 14 | Week 19-20 |
| **10. Settings** | Agency, Users, Prefs | 12 | 7 | Week 21-22 |
| **TOTAL** | | **206** | **134** | ~22 weeks |

---

## 4. Feature Deliverables

### MVP (P0)
- [x] Dashboard Overview - executive KPIs, trend charts, drill-down
- [x] Pipeline Management - Kanban, drag-drop, client drawer
- [x] Authentication - multi-tenant with RLS

### v1 Core (P1)
- [ ] Integrations Management - Slack, Gmail, Google Ads, Meta OAuth
- [ ] Unified Communications Hub - merged timeline, AI drafts
- [ ] AI Intelligence Layer - Chi Chat, risk detection, draft generation

### v1 Complete (P2)
- [ ] Knowledge Base - document upload, RAG indexing, search
- [ ] Support Tickets - Kanban, AI suggestions, resolution
- [ ] Automations - IF/THEN builder, trigger/action system
- [ ] Settings - agency config, users, preferences

---

## 5. ICE-T Score (Overall Project)

| Metric     | Score    | Rationale                                      |
| ---------- | -------- | ---------------------------------------------- |
| Impact     | 9/10     | Revenue-generating product for agency business |
| Confidence | 7/10     | War Room patterns exist, proven tech stack     |
| Ease       | 5/10     | Complex multi-feature platform                 |
| **Time**   | 22 weeks | 10 phases, 206 tasks                           |

**ICE Score:** 31.5 (9×7×5÷10)
**Priority:** 🟠 Consider carefully - high value but significant investment

---

## 6. Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind, shadcn/ui (Radix) |
| State | Zustand |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (JWT with agency_id) |
| Real-time | Supabase Realtime |
| AI | Claude API, Gemini File Search, Mem0 |
| Integrations | OAuth 2.0 (Slack, Google, Meta) |
| Charts | Recharts |
| Drag-drop | dnd-kit |

---

## 7. Assumptions & Dependencies

### Assumptions
- Chase provides access to Slack, Google, and Meta accounts for OAuth testing
- Design system (Linear-inspired) is approved as documented
- Chi-gateway MCP remains available for fallback ad data

### Dependencies
- Supabase project provisioned and configured
- OAuth app registrations completed for all 4 platforms
- Gemini File Search API access
- Mem0 MCP integration

### Exclusions
- Mobile native apps (web responsive only)
- Zoom integration (v2)
- External webhook triggers (v2)
- Multi-org roles (v2)

---

## 8. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OAuth complexity | Medium | High | Use chi-gateway MCP as fallback |
| Gemini indexing failures | Low | Medium | Retry mechanism, manual re-index |
| Real-time performance | Low | Medium | Supabase Realtime proven |
| Multi-tenant leakage | Low | Critical | RLS tested, follow War Room patterns |

---

## 9. Payment Terms

**Total Project Value:** $16,275

| Milestone                    | %   | Amount    | Due        |
| ---------------------------- | --- | --------- | ---------- |
| Project Start                | 30% | $4,882.50 | On signing |
| MVP Complete (Phase 1-3)     | 25% | $4,068.75 | Week 6     |
| v1 Core Complete (Phase 4-6) | 25% | $4,068.75 | Week 14    |
| v1 Final Delivery            | 20% | $3,255.00 | Week 22    |

---

## 10. Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Initial SOW created from 206-task roadmap |

---

*Living Document - Located at docs/07-business/SOW.md*
