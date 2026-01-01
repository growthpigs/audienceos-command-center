# AudienceOS Command Center - Tech Stack MVP

> Generated: 2025-12-31 via TechSnack Pro Prompts
> Status: Approved

---

## Executive Summary

Multi-tenant SaaS for marketing agencies. Next.js 15 frontend with Supabase backend, AI-powered by Claude API + Gemini File Search for RAG.

**Key Decisions:**
- Keep v0 prototype structure, enhance with real backend
- RevOS multi-tenant RLS pattern for tenant isolation
- War Room components: Toast, Progressive Reveal Chat (no Glass CSS - using Linear)
- MCP shortcut for Meta/Google Ads while awaiting OAuth approval
- Vercel deployment with Supabase Postgres

---

## Stack Overview

### Frontend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Next.js 15 (App Router) | v0 baseline, Vercel optimized |
| UI Library | React 19 | Latest features, concurrent rendering |
| Components | shadcn/ui (Radix primitives) | v0 baseline, accessible |
| Styling | Tailwind CSS + Linear Design System | Minimal B2B SaaS aesthetic |
| State (Client) | Zustand | Lightweight, persisted |
| State (Server) | TanStack Query v5 | Caching, optimistic updates |
| Forms | React Hook Form + Zod | Type-safe validation |
| Charts | Recharts | v0 baseline |
| Drag-Drop | dnd-kit | Kanban pipeline |
| Icons | Lucide React | v0 baseline |
| Testing | Vitest + Testing Library | Fast, React-focused |

### Backend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| API | Next.js Route Handlers | Colocated, serverless |
| Database | Supabase Postgres | RevOS pattern, RLS |
| Auth | Supabase Auth | Multi-tenant, OAuth providers |
| Realtime | Supabase Realtime | Live comms updates |
| Storage | Supabase Storage | Knowledge Base documents |
| Background Jobs | Vercel Cron + Edge Functions | Hourly sync jobs |
| Secrets | Vercel Env + Supabase Vault | Token encryption |

### AI Layer

| Component | Choice | Rationale |
|-----------|--------|-----------|
| LLM | Claude API (claude-sonnet-4-20250514) | Drafts, chat, risk detection |
| RAG | Gemini File Search | War Room proven, vector search |
| Embeddings | Gemini | Consistent with File Search |
| Memory | Conversation history in DB | Session persistence |

### Integrations

| Integration | Method | Notes |
|-------------|--------|-------|
| Slack | OAuth + Events API | Non-negotiable MVP |
| Gmail | Google OAuth + Gmail API | Non-negotiable MVP |
| Google Ads | chi-gateway MCP (MVP) → OAuth (v2) | Shortcut for launch |
| Meta Ads | chi-gateway MCP (MVP) → OAuth (v2) | Shortcut for launch |

### Infrastructure

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Hosting | Vercel | v0 already deployed |
| Database | Supabase (managed Postgres) | RevOS pattern |
| Monitoring | Sentry | Error tracking |
| CI/CD | GitHub Actions + Vercel | Auto-deploy on push |
| DNS | Vercel | Managed |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js 15 App Router                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │  Pages   │  │   API    │  │   Cron Jobs      │   │    │
│  │  │ (React)  │  │ Routes   │  │ (hourly sync)    │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│   SUPABASE   │    │   CLAUDE     │    │  GEMINI FILE     │
│  - Postgres  │    │   API        │    │  SEARCH          │
│  - Auth      │    │  - Drafts    │    │  - RAG indexing  │
│  - Realtime  │    │  - Chat      │    │  - Vector search │
│  - Storage   │    │  - Risks     │    │                  │
│  - RLS       │    │              │    │                  │
└──────────────┘    └──────────────┘    └──────────────────┘
        │
        ├─── Slack API (OAuth + Events)
        ├─── Gmail API (OAuth + Push)
        ├─── Google Ads API (MCP → OAuth)
        └─── Meta Marketing API (MCP → OAuth)
```

---

## Multi-Tenant Architecture

Following RevOS RLS pattern:

```
Agency (tenant)
├── Users (agency staff)
├── Clients (agency's customers)
│   ├── Communications (synced Slack/Gmail)
│   ├── Tasks
│   ├── Tickets
│   ├── Ads Metrics
│   └── Stage Events
├── Documents (Knowledge Base)
├── Integrations (OAuth credentials)
├── Workflows (automations)
└── Alerts (AI-generated)
```

**RLS Policy Pattern:**
```sql
CREATE POLICY "tenant_isolation" ON clients
  FOR ALL
  USING (agency_id = auth.jwt() ->> 'agency_id');
```

---

## Capability Matrix

| Capability | Required | Implementation |
|------------|----------|----------------|
| Multi-tenant RLS | ✅ | Supabase RLS policies |
| OAuth Integrations | ✅ | Slack, Gmail, Google Ads, Meta |
| Real-time Updates | ✅ | Supabase Realtime subscriptions |
| Background Jobs | ✅ | Vercel Cron (hourly sync) |
| File Storage | ✅ | Supabase Storage |
| RAG/Vector Search | ✅ | Gemini File Search |
| LLM Layer | ✅ | Claude API |
| Offline Support | ❌ | Web-first, not needed |
| Payments | ❌ | Out of MVP scope |
| Mobile App | ❌ | Out of MVP scope |

---

## Import from Existing Projects

### From War Room

| Asset | Path | Purpose |
|-------|------|---------|
| Toast System | `hooks/use-toast.ts`, `components/ui/toast.tsx` | Notifications |
| Progressive Reveal | `components/IntelligentChat.tsx` | AI chat typewriter effect |
| Gemini RAG | `services/geminiFileSearchService.ts` | File Search integration |

**Note:** Glass CSS no longer imported - using Linear Design System instead (see `docs/03-design/DESIGN-BRIEF.md`).

### From RevOS

| Asset | Path | Purpose |
|-------|------|---------|
| RLS Policies | `supabase/migrations/009_add_rls_policies_all_tables.sql` | Tenant isolation |
| Admin Check | `lib/auth/admin-check.ts` | Role verification |
| Supabase Server | `lib/supabase/server.ts` | Server client pattern |
| Session Manager | `lib/session-manager.ts` | Conversation persistence |
| Middleware | `middleware.ts` | Cookie handling |

---

## MVP Milestones

| Phase | Deliverable | Dependencies |
|-------|-------------|--------------|
| **M1: Foundation** | Supabase setup, Auth, RLS, basic CRUD | None |
| **M2: Pipeline** | Kanban with dnd-kit, client detail drawer | M1 |
| **M3: Comms** | Slack OAuth, Gmail OAuth, unified inbox | M1 |
| **M4: AI Layer** | Chat widget, RAG setup, risk detection | M1, M3 |
| **M5: Polish** | Linear design system, toast, loading states | M1-M4 |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OAuth approval delays | High | MCP shortcut for individual accounts |
| Supabase Realtime limits | Medium | Batch updates, polling fallback |
| Gemini File Search latency | Medium | Async indexing, cache frequent queries |
| Token refresh failures | High | Retry logic, alert on 3+ failures |
| RLS complexity | Medium | Comprehensive test suite |

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# AI
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
GEMINI_FILE_SEARCH_KEY=

# Integrations
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Monitoring
SENTRY_DSN=
```

---

*Generated via TechSnack Pro Prompts - Living Document*
