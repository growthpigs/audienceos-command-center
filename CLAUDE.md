# AudienceOS Command Center - Project Intelligence

**Project:** AudienceOS Command Center (Client Management Platform)
**Status:** 95% MVP Frontend Complete | 60% Full-Stack Complete
**Last Updated:** 2026-01-14
**Key Learning:** EP-085 "Frontend Complete, Backend Missing" Fallacy (see below)

---

## ⚠️ CRITICAL DISCOVERY: January 16, 2026 - Holy Grail Chat Audit

**FINDING:** Holy Grail Chat (floating AI assistant) is **functionally incomplete**. Three critical gaps prevent it from being transformative:

| Capability | Current | Target | Gap Severity |
|-----------|---------|--------|--------------|
| **Context Awareness** | 0% (never injected into Gemini) | 100% (page + client + filters) | 🔴 CRITICAL |
| **Memory Persistence** | 0% (Mem0 retrieval works, storage never called) | 100% (learnings persist) | 🔴 CRITICAL |
| **Function Completeness** | 30% (6 of 12+ functions) | 100% (support, automations, KB, timeline, etc.) | 🟠 HIGH |
| **Knowledge Base Integration** | 70% (RAG works, no client scoping) | 100% (auto-scoped to client) | 🟠 HIGH |
| **File Upload UX** | 85% (works, z-index issues) | 100% (seamless + accessible) | 🟡 MEDIUM |

**Root Cause:** Chat system was ported from standalone HGC project. Never integrated with AudienceOS context (pages, client selection, active filters). SessionContext type exists but is never populated or used.

**Impact:**
- Users must repeat context in every message ("for Acme Corp, show...")
- Function calling returns irrelevant data (all alerts, not filtered)
- No learnings persist across sessions
- Chat feels disconnected from app experience

**Fix Scope:** 15-20 days of focused work on 3 areas:
1. **Session Context Injection** (2 days) - Pass page/client/filters to Gemini
2. **Memory Persistence** (1 day) - Actually call mem0.storeMemory() on each turn
3. **Function Expansion** (5 days) - Add 6 critical functions (support tickets, automations, training, documents, timeline, KB search)

**See:** `/docs/HOLY_GRAIL_CHAT_AUDIT.md` (comprehensive audit report, 1500+ lines)

---

## ⚠️ PREVIOUS DISCOVERY: January 14, 2026 - Training Cartridges

**FINDING:** Training Cartridges feature appeared "complete" in UI but backend was **completely missing**.

**Status:** ✅ **NOW FIXED** (2026-01-15) - All 5 API endpoints deployed, 5 DB tables migrated, 20 RLS policies, runtime verified. See commits 4029fc1→f9b4c7c.

**Learning:** This is the **"Frontend Complete, Backend Missing" Fallacy** (EP-085) - the most insidious project gap because static verification says "looks good" but runtime verification says "doesn't work."

---

## Quick Reference

| Resource | Location |
|----------|----------|
| Production URL | https://audienceos-agro-bros.vercel.app |
| GitHub | growthpigs/audienceos-command-center |
| Supabase | ebxshdqfaqupnvpghodi |
| Vercel | agro-bros/audienceos |
| Feature Status | features/INDEX.md (most accurate) |

---

## CRITICAL ARCHITECTURE: Diiiploy-Gateway MCP Integration

### The Pattern

**Instead of building custom OAuth flows for each service, use MCP-based integrations via Diiiploy-Gateway.**

```
┌─────────────────────────────────────────────────────────────┐
│                    AudienceOS Command Center                │
│                                                             │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐             │
│  │  Gmail    │   │ Calendar  │   │   Slack   │  ... etc    │
│  │Integration│   │Integration│   │Integration│             │
│  └─────┬─────┘   └─────┬─────┘   └─────┬─────┘             │
│        │               │               │                    │
│        └───────────────┼───────────────┘                    │
│                        ▼                                    │
│            ┌──────────────────────┐                         │
│            │   Diiiploy-Gateway   │                         │
│            │  (Cloudflare Worker) │                         │
│            │                      │                         │
│            │  Per-Agency Creds    │                         │
│            │  MCP Protocol        │                         │
│            │  50+ Tools           │                         │
│            └──────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Why MCP Instead of OAuth APIs?

1. **Per-User Authorization**: Each agency authorizes their own Workspace during onboarding
2. **Unified Protocol**: MCP handles Gmail, Calendar, Drive, Slack, etc. with same interface
3. **Credential Isolation**: Agency tokens stored per-agency, not app-level
4. **Simpler Onboarding**: User clicks authorize, enters tokens, done
5. **Google Workspace MCP**: Works with personal accounts (business accounts need different approach)

### Diiiploy-Gateway Location

```
infrastructure/cloudflare/cc-gateway/
├── src/
│   ├── index.ts        # Main router + MCP protocol handler
│   └── routes/
│       ├── gmail.ts    # Gmail: inbox, read, send, archive
│       ├── calendar.ts # Calendar: events, create
│       ├── drive.ts    # Drive: list, create, move, export
│       ├── sheets.ts   # Sheets: read, write, append
│       ├── docs.ts     # Docs: create, read, append
│       └── ...         # 15+ more service handlers
├── wrangler.toml
└── package.json
```

### Available MCP Tools (50+)

| Service | Tools | Status |
|---------|-------|--------|
| **Gmail** | inbox, read, send, archive | Ready |
| **Calendar** | events, create | Ready |
| **Drive** | list, folder_create, move, search, export, convert | Ready |
| **Sheets** | list, create, read, write, append, metadata | Ready |
| **Docs** | list, create, read, append, create_formatted | Ready |
| **Google Ads** | campaigns, performance | Needs Developer Token |
| **Meta Ads** | accounts, campaigns, insights, campaign_status | Needs App |
| **Slack** | **NOT YET IMPLEMENTED** | Needs Adding |
| **Supabase** | query, insert, rpc, buckets | Ready |
| **Mem0** | add, search | Ready |

### Integration Flow (How It Should Work)

1. **User goes to Settings > Integrations**
2. **Clicks "Connect Gmail"**
3. **Modal opens with credential entry form** (not OAuth popup)
4. **User enters their Google Workspace tokens**
5. **Tokens saved per-agency in Supabase (encrypted)**
6. **Diiiploy-Gateway uses those tokens for that agency's requests**

### TODO: Multi-Tenant Gateway

Currently cc-gateway uses **global** credentials from Cloudflare secrets.
Need to modify to:
1. Accept `agency_id` in requests
2. Look up agency-specific tokens from Supabase
3. Use those tokens for the API calls

---

## Integrations Status

| Integration | Code Built | Credentials | Gateway Route | UI Ready |
|-------------|------------|-------------|---------------|----------|
| Gmail | ✅ | ✅ Google OAuth set | ✅ | ❌ Needs credential entry |
| Calendar | ✅ | ✅ Same as Gmail | ✅ | ❌ Needs adding to integrations |
| Drive | ✅ | ✅ Same as Gmail | ✅ | ❌ Needs adding to integrations |
| Slack | ✅ OAuth flow | ❌ EMPTY | ❌ Not in gateway | ❌ Needs credential entry UI |
| Meta Ads | ✅ OAuth flow | ❌ EMPTY | ✅ | ❌ Needs credential entry |
| Google Ads | ✅ OAuth flow | ❌ Developer Token | ✅ | ❌ Blocked by Google approval |

---

## Critical Rules

### 1. Gemini 3 ONLY
No Gemini 2.x or 1.x. Check `lib/chat/service.ts`.

### 2. RLS on All Data
Every table has `agency_id`, every query filters by it. Multi-tenant isolation.

### 3. Credentials in Fetch
All API calls must include `{ credentials: 'include' }`.

### 4. pb-28 on Pages
Every page needs bottom padding for chat overlay.

### 5. Runtime Verification
Never rely on file existence checks. Execute commands to verify:
- `npm run build` - Build passes
- Claude in Chrome - UI works
- `curl /api/health` - API responds

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, Tailwind, Radix UI |
| State | Zustand |
| Backend | Next.js API Routes |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (email + Google OAuth) |
| AI | Gemini 3 (HGC ported) |
| Memory | Mem0 |
| Gateway | Diiiploy-Gateway (Cloudflare Worker) |

---

## Environment Variables

### Required for Integrations
```bash
# Google Workspace (Gmail, Calendar, Drive)
GOOGLE_CLIENT_ID=       # OAuth client ID
GOOGLE_CLIENT_SECRET=   # OAuth client secret

# Slack
SLACK_CLIENT_ID=        # From api.slack.com/apps
SLACK_CLIENT_SECRET=    # From api.slack.com/apps

# Meta Ads
META_APP_ID=            # From developers.facebook.com
META_APP_SECRET=        # From developers.facebook.com

# Diiiploy Gateway
DIIIPLOY_GATEWAY_URL=https://cc-gateway.roderic-andrews.workers.dev
DIIIPLOY_GATEWAY_API_KEY=   # For authenticated requests
```

---

## Living Documents Protocol

**Principle:** Update existing docs, never create dated orphan files

| Document Type | Location | Purpose | Update Strategy |
|---|---|---|---|
| Product Requirements | `docs/01-product/PRD.md` | Feature specifications | Add to existing, never create new |
| MVP Scope | `docs/01-product/MVP-PRD.md` | MVP boundaries | Update when scope changes |
| Technical Data Model | `docs/04-technical/DATA-MODEL.md` | Database schema | Update when schema changes |
| API Contracts | `docs/04-technical/API-CONTRACTS.md` | REST API spec | Update when endpoints change |
| Validation & QA | `docs/04-technical/VALIDATION.md` | Test results, edge cases | Update each validation cycle |
| Feature Specs | `features/INDEX.md` | Feature status tracker | Update as features progress |

**Rules:**
1. **No dates in filenames** - Living documents evolve, they don't get versioned
2. **Update existing, don't create new** - One source of truth per document type
3. **Sync to Drive after updates** - Use `docs_create_formatted` to keep Drive in sync
4. **Timestamp inside docs only** - Track "Last validated" or "Last updated" inside the document, not filename

**Example:** `ULTIMATE-VALIDATION-2026-01-16.md` ❌ WRONG
**Correct:** `docs/04-technical/VALIDATION.md` with "Last validation: 2026-01-16" ✅

---

## File Structure (Key Areas)

```
app/
├── api/v1/
│   ├── integrations/   # Integration CRUD + OAuth URLs
│   ├── oauth/callback/ # OAuth token exchange
│   └── clients/        # Client management
├── settings/
│   └── integrations/   # Integrations UI page

infrastructure/
└── cloudflare/
    └── cc-gateway/     # Diiiploy-Gateway (MCP aggregator)
        └── src/
            ├── index.ts    # Main router
            └── routes/     # Service handlers

lib/
├── chat/               # HGC chat system
├── sync/               # Data sync utilities
└── services/           # Business logic
```

---

## Real Current State (2026-01-14)

### ✅ COMPLETE & WORKING (9 MVP Features)
- **Dashboard** - KPIs, charts, metrics (verified E2E 2026-01-09)
- **Client Pipeline** - Kanban board, 20 test clients (verified E2E)
- **Communications Hub** - Email/Slack timeline, reply composer (partial integration)
- **Support Tickets** - Kanban board, ticket details (verified E2E)
- **Intelligence Center** - AI Chat with function calling to Gemini 3 (verified E2E)
- **Knowledge Base** - Document upload, search, RAG (verified E2E)
- **Automations** - Workflow engine, runs tracking (verified E2E)
- **Integrations Hub** - UI complete, OAuth flows stubbed (validated 2026-01-11)
- **Settings** - Agency + User management, all CRUD ops (verified 2026-01-05)

### 🚧 INCOMPLETE (Multi-Org Roles)
- **RBAC System** - Phase 4/4 done (client assignment UI), needs E2E browser testing

### ✅ COMPLETE (Training Cartridges Backend - 2026-01-15)
- **Training Cartridges** - ✅ Frontend 100% complete | ✅ Backend 100% complete (5 endpoints deployed, 5 tables migrated, 20 RLS policies, runtime verified)
- **Onboarding Hub** - Demo data seeded, needs E2E testing

### ❌ NOT YET STARTED
- Slack integration
- Multi-tenant credential storage
- Real Gmail/Calendar/Drive sync (OAuth flows exist, handlers stubbed)

---

## Realistic 30K Foot Assessment

**Status:** The app LOOKS 95% done because:
- ✅ All 9 core features have working UIs
- ✅ Most APIs exist and work
- ✅ Database schema complete
- ✅ Auth working, production deployed
- ✅ Holy Grail Chat UI is beautiful and functional

**But ACTUALLY is ~65% done because:**
- ✅ Training Cartridges: COMPLETED 2026-01-15 (frontend + backend, all 5 API endpoints deployed)
- 🔴 **Holy Grail Chat:** Architecturally incomplete (context 0%, memory 0%, functions 30%) - See CRITICAL DISCOVERY above
- ⚠️ Integrations: Stubbed OAuth, no real Gmail/Slack/Meta data flowing
- ⚠️ Multi-Org Roles: UI done, not tested end-to-end
- ⚠️ Real-world data: No Gmail sync, no Slack sync, no performance data (still mock data)

**Key Insight:** The "Frontend Complete, Backend Missing" Fallacy strikes again. The Holy Grail Chat UI is pristine and impressive, but the underlying intelligence system is incomplete. With 15-20 days of work, this becomes genuinely revolutionary.

---

## Next Steps (What ACTUALLY Needs Doing)

### TIER 1: CRITICAL (Blocking "Actually Works" Claim)
1. **✅ COMPLETED: Training Cartridges Backend (2026-01-15)**
   - ✅ Created 5 DB tables (brand, voice, style, preferences, instructions)
   - ✅ Implemented 5 API endpoints with CRUD (GET/POST on all)
   - ✅ Multi-tenant isolation + 20 RLS policies
   - ✅ CRITICAL error handling fix (PGRST116 checks)
   - ✅ Production deployed + runtime verified
   - **Result:** Cartridges fully operational. See: 7 commits (4029fc1→f9b4c7c), EP-088 learning added to error-patterns.md

2. **🔴 Holy Grail Chat Improvements (Phase 1: 8 days)**
   - Inject SessionContext into Gemini (2 days) - Chat understands current page + client
   - Persist memories to Mem0 (1 day) - Learnings actually survive session restart
   - Add 2 critical functions (2 days) - Support tickets + automations
   - Integration testing (1 day)
   - Integration testing (1 day)
   - **Impact:** Chat goes from 0% context-aware to 100%. Users no longer repeat context.
   - **See:** `/docs/HOLY_GRAIL_CHAT_AUDIT.md` (complete roadmap + technical details)

3. **E2E Test Multi-Org Roles** (1 day)
   - Use Claude in Chrome to test role assignment UI
   - Verify permissions enforced on data access
   - **Impact:** RBAC system goes from "code works" to "feature works"

### TIER 2: HIGH (Real Features)
4. **Holy Grail Chat Improvements (Phase 2: 8 days)**
   - Add 4 more functions (2 days) - Training, documents, timeline, KB search
   - Auto-scope RAG to current client (2 days)
   - Fix drag-drop UX issues (1 day)
   - Performance optimizations (1 day)
   - **Impact:** Chat has access to ALL app data, context-aware

5. **Real Gmail Sync** (3 days)
   - Implement token storage in Supabase (per-agency)
   - Build OAuth callback → store refresh token
   - Create scheduled job to fetch new emails
   - **Impact:** Communications Hub shows real Gmail data, not placeholders

6. **Real Slack Sync** (3 days)
   - Add Slack to diiiploy-gateway
   - Implement token storage + scheduled sync
   - Display Slack messages in timeline

### TIER 3: MEDIUM (Polish)
7. **Multi-Tenant Credentials** - Per-agency token storage
8. **Real Google Ads** - Replace mock data with actual campaign metrics
9. **Real Meta Ads** - Same as Google Ads

---

*Last verified: 2026-01-16 | **Holy Grail Chat audit complete. CRITICAL: Context 0%, Memory 0%, Functions 30%. Audit report: /docs/HOLY_GRAIL_CHAT_AUDIT.md. Phase 1 roadmap ready (8 days to transformative chat).***
