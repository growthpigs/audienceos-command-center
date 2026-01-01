# War Room Patterns Reference

> **Purpose:** Pre-implementation research - patterns to extract from War Room
> **Created:** 2025-12-31
> **Status:** Research Complete

---

## Overview

This document captures production-grade patterns from War Room that can be directly extracted or adapted for AudienceOS Command Center.

---

## 1. Multi-Tenant RLS Patterns

### Isolation Strategy
War Room uses **dual keys** for tenant isolation:
- `companyId` - Primary isolation key (references `companies` table)
- Composite key for Mem0: `warroom_{tenantId}_{userId}`
- Deterministic naming for Gemini stores: `warroom-{companyId}`

### Middleware Pipeline (4-Step)
```
1. extractTenantContext  → Parse session/JWT, load company membership
2. requireTenantContext  → FAIL SECURE: 401 if tenantId missing
3. Database filters      → ALL queries use .where(eq(table.companyId, req.tenantId))
4. Helper validators     → getRequiredTenantId() throws if missing
```

### Key Files
| File | Purpose | Lines |
|------|---------|-------|
| `server/middleware/tenantMiddleware.ts` | Multi-tenant extraction & validation | 626 |
| `shared/schema.ts` | Database schema definition | 800+ |
| `server/migrations/002_tenant_config.sql` | Tenant configuration tables | 193 |

### Pattern to Copy
```typescript
// FAIL SECURE - never fallback to 'default'
const tenantId = req.tenantId;
if (!tenantId) {
  return res.status(401).json({ error: 'Tenant context required' });
}

// ALL queries filtered by tenant
const docs = await db.select()
  .from(documents)
  .where(eq(documents.agencyId, tenantId));
```

---

## 2. Gemini File Search Integration

### Architecture
- **Fully managed RAG** - Google Gemini handles: storage, indexing, retrieval, chunking
- **War Room manages:** metadata, citations, multi-tenant mapping
- **Store naming:** Deterministic `warroom-{companyId}` (no DB lookup needed)

### Key Files
| File | Purpose | Lines |
|------|---------|-------|
| `server/services/geminiFileSearchService.ts` | Gemini RAG wrapper | ~400 |
| `server/migrations/003_gemini_file_search.sql` | Gemini isolation tables | 51 |

### Tables
```sql
CREATE TABLE gemini_stores (
  id varchar PRIMARY KEY,
  company_id varchar NOT NULL UNIQUE,  -- 1:1 per company
  store_name varchar NOT NULL,
  store_id varchar NOT NULL UNIQUE     -- Google Gemini API store ID
);

CREATE TABLE gemini_files (
  id varchar PRIMARY KEY,
  company_id varchar NOT NULL,         -- Scoped to company
  store_id varchar NOT NULL,
  file_name varchar NOT NULL,
  gemini_file_id varchar               -- Google Gemini API file ID
);
```

### For AudienceOS
- Store naming: `audienceos-{agencyId}`
- Same pattern: metadata in Supabase, vectors in Gemini

---

## 3. Chi Intelligent Chat Architecture

### Smart Router (3 Routes)
| Route | Detector | Use Case |
|-------|----------|----------|
| **Gemini** | `hasInternalIntent()` | "What do our docs say?" |
| **Perplexity** | `isRealTimeQuery()` | "Latest news on..." |
| **Mem0** | `isMemorySeekingQuery()` | "What did we discuss?" |

### Detection Logic
```typescript
// Memory-seeking: references shared conversation
isMemorySeekingQuery(query: string): boolean {
  return /\b(we|our|you|i|my)\b.*\b(discuss|remember|talk)\b/i.test(query);
}

// Real-time: asks about current state (unless internal intent)
isRealTimeQuery(message: string): boolean {
  if (this.hasInternalIntent(message)) return false;  // Override for internal
  return ['today', 'trending', 'latest'].some(k => message.includes(k));
}

// Internal data: references uploaded documents
hasInternalIntent(message: string): boolean {
  return ['training document', 'our documents', 'campaign data']
    .some(kw => message.includes(kw));
}
```

### Key Files
| File | Purpose | Lines |
|------|---------|-------|
| `server/services/enhancedPerplexityChatService.ts` | Smart routing + all routes | 1400+ |
| `server/services/mem0Service.ts` | Cross-session memory | 290 |
| `server/services/tenantContextService.ts` | Context preamble generation | 300+ |

### Mem0 Composite Key Pattern
```typescript
// Tenant isolation via composite key
getMemoryKey(tenantId: string, userId: string): string {
  return `warroom_${tenantId}_${userId}`;
}

// Search with tenant-scoped key
await mem0.search(query, `warroom_${tenantId}_${userId}`);
```

---

## 4. OAuth Patterns

### Flow (Passport.js + Database)
1. Passport strategy init with scopes
2. User sync: find or create in database
3. Token storage in `campaignCredentials` table
4. Middleware checks: `requireGoogleAdsAuth()`
5. Auto-refresh on demand

### Token Storage Table
```typescript
campaignCredentials = {
  id: varchar,
  campaignId: varchar,
  tenantId: varchar,
  provider: 'google-ads' | 'meta-ads' | 'slack' | 'gmail',
  accessToken: text,
  refreshToken: text,
  tokenExpiry: timestamp,
  credentials: jsonb,
  isActive: integer
};
```

### Key Files
| File | Purpose | Lines |
|------|---------|-------|
| `server/googleAuth.ts` | Google Ads OAuth pattern | 270 |
| `server/adsOauthService.ts` | Token refresh service | - |
| `server/auth.ts` | Session management | 200+ |

---

## 5. Citation System

### Citation Interface
```typescript
interface Citation {
  source: string;           // File name or URL
  text: string;            // Excerpt used
  confidence: number;      // 0-1 relevance score
  sourceType: 'document' | 'web';
  documentId?: string;     // Database ID for clickable links
  documentType?: string;   // "strategy", "research", etc.
  url?: string;           // For web sources
}
```

### Enrichment Pattern
1. Build document title map for company
2. Query Gemini for RAG results
3. Fuzzy match Gemini file names → database IDs
4. Persist citations in `chatMessages.citations`

---

## 6. Security Findings from Audit

### Critical Issues Found
1. **Standalone MJS servers bypass multi-tenant** → Don't create separate servers
2. **'default' fallback in routes** → Always 401, never fallback
3. **req.params.tenantId inconsistent** → Always use req.tenantId from middleware

### Recommended Patterns ✅
1. `extractTenantContext` + `requireTenantContext` chain
2. Deterministic store naming (no DB lookup)
3. Mem0 composite key format
4. Fail-secure defaults (401 not fallback)
5. Database query filtering via ORM `.where()`

---

## 7. Extraction Recommendations

### Direct Extraction (90%+ reusable)
| Component | War Room File | Effort |
|-----------|---------------|--------|
| Tenant Middleware | `server/middleware/tenantMiddleware.ts` | 2h |
| Gemini Service | `server/services/geminiFileSearchService.ts` | 2h |
| Mem0 Service | `server/services/mem0Service.ts` | 1h |
| Citation Interface | Various | 30m |

### Adaptation Required (70% reusable)
| Component | War Room File | Changes Needed |
|-----------|---------------|----------------|
| Smart Router | `enhancedPerplexityChatService.ts` | Keywords, routes |
| Context Preamble | `tenantContextService.ts` | Identity structure |
| OAuth Flow | `googleAuth.ts` | Scopes, providers |

### Rebuild (New for AudienceOS)
- Client lifecycle management
- Support ticket system
- Automation engine
- Agency settings

---

## 8. Architecture Diagram

```
Frontend (Next.js)
       │
       ▼
Express/Next API Routes
       │
┌──────┴──────┐
│ Middleware  │
│ • Extract   │
│ • Require   │
│ • Validate  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│     Smart Router        │
├─────────────────────────┤
│ Gemini (RAG)            │
│ Perplexity (Web)        │
│ Mem0 (Memory)           │
│ Claude (Dashboard)      │
└──────────┬──────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│Supabase │ │ Gemini  │
│   RLS   │ │ Stores  │
└─────────┘ └─────────┘
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Created from War Room codebase research |

---

*Reference Document - Located at docs/06-reference/WAR-ROOM-PATTERNS.md*
