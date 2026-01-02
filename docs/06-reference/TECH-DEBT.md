# AudienceOS Command Center - Technical Debt Register

> **Purpose:** Track known tech debt with clear priority and triggers
> **Last Updated:** 2026-01-02
> **Status:** Active

---

## Priority Tiers

| Tier | Trigger | Action |
|------|---------|--------|
| **P0** | Blocks production or causes bugs | Fix immediately |
| **P1** | Fix before public beta | Schedule in next sprint |
| **P2** | Fix when scaling (100+ clients) | Monitor, fix when needed |
| **P3** | Nice to have | Fix opportunistically |

---

## P0: Critical (Fix Now)

### TD-001: setTimeout Anti-Pattern in useEffect ✅ FIXED
**File:** `app/page.tsx:58-72, 159-163, 177-187`
**Issue:** Using `setTimeout(() => setState(), 0)` to defer state updates
**Effect:** Race conditions, flickering UI, unpredictable state
**Fix:** Use useMemo for derived state, proper effect dependencies
**Status:** Fixed 2026-01-02

### TD-002: Duplicate Client State ✅ FIXED
**File:** `app/page.tsx:47` + `stores/pipeline-store.ts`
**Issue:** Clients exist in both local component state AND Zustand store
**Effect:** Multiple sources of truth, sync bugs, inconsistent UI
**Fix:** Use Zustand store exclusively, remove local state
**Status:** Fixed 2026-01-02

### TD-003: Insufficient HTML Sanitization ✅ FIXED
**File:** `lib/security.ts:29-37`
**Issue:** Regex-based sanitization misses encoding bypasses, SVG vectors
**Effect:** XSS vulnerability
**Fix:** Replace with DOMPurify library
**Status:** Fixed 2026-01-02

---

## P1: Pre-Beta (Fix Before Public Launch)

### TD-004: In-Memory Rate Limiting
**File:** `lib/security.ts:81-96`
**Issue:** Rate limit store is in-memory Map, resets on restart
**Effect:** Ineffective with load balancing or server restarts
**Fix:** Use Redis or Supabase for distributed rate limiting
**Trigger:** Before deploying with multiple instances

### TD-005: Missing CSRF Protection
**File:** `app/api/v1/*/route.ts` (all POST handlers)
**Issue:** No CSRF token validation on state-changing requests
**Effect:** Cross-site request forgery possible
**Fix:** Add CSRF middleware using next-csrf or similar
**Trigger:** Before public beta

### TD-006: Email Validation Too Permissive
**File:** `lib/security.ts:42-47`
**Issue:** Regex allows invalid emails like `test@test..com`
**Effect:** Invalid data in database
**Fix:** Use email-validator library or RFC-compliant regex
**Trigger:** Before user registration feature

### TD-007: Disabled ESLint Dependencies
**File:** `hooks/use-dashboard.ts:213`
**Issue:** `eslint-disable-line react-hooks/exhaustive-deps` masks real bugs
**Effect:** Trends don't update when selectedPeriod changes
**Fix:** Split into multiple effects with proper dependencies
**Trigger:** Before dashboard is production-critical

### TD-008: IP Spoofing in Rate Limiter
**File:** `lib/security.ts:156-158`
**Issue:** Trusts X-Forwarded-For header without validation
**Effect:** Rate limit bypass via header spoofing
**Fix:** Validate X-Forwarded-For chain or use CF-Connecting-IP
**Trigger:** Before public exposure

---

## P2: Pre-Scale (Fix at 100+ Clients)

### TD-009: Missing useMemo for Filter Calculations
**File:** `app/page.tsx:79-110`
**Issue:** Filter logic recalculates on every render
**Effect:** Performance degradation with large datasets
**Fix:** Wrap in useMemo with proper dependencies
**Trigger:** When client count exceeds 50

### TD-010: Missing React.memo on Kanban Components
**File:** `components/kanban-board.tsx`
**Issue:** DraggableClientCard and DroppableColumn re-render on any change
**Effect:** Janky drag-drop with many cards
**Fix:** Add React.memo with custom comparison
**Trigger:** When seeing drag-drop lag

### TD-011: Eager Loading All Views
**File:** `app/page.tsx:6-18`
**Issue:** 10+ view components imported eagerly
**Effect:** Larger initial bundle, slower first load
**Fix:** Use Next.js dynamic imports
**Trigger:** When bundle size exceeds 500KB

### TD-012: Missing useCallback for Event Handlers
**File:** `app/page.tsx:113-115, 225-267`
**Issue:** Handlers recreated on every render
**Effect:** Unnecessary child re-renders
**Fix:** Wrap handlers in useCallback
**Trigger:** When seeing performance issues

### TD-013: Inefficient Thread Building
**File:** `stores/communications-store.ts:217-265`
**Issue:** Multiple array passes and copies in buildThreadHierarchy
**Effect:** Sluggish with 1000+ messages
**Fix:** Single-pass algorithm
**Trigger:** When message count exceeds 500

### TD-014: Missing Pagination Limits
**File:** `hooks/communications/use-communications.ts:37-50`
**Issue:** No server-side max limit on pagination
**Effect:** Resource exhaustion with `limit=999999`
**Fix:** Enforce max limit (e.g., 100) server-side
**Trigger:** Before API is public

---

## P3: Nice to Have (Opportunistic)

### TD-015: Prop Drilling
**File:** `app/page.tsx` (throughout)
**Issue:** 8+ levels of prop passing
**Effect:** Tight coupling, hard to refactor
**Fix:** Move related state to Zustand or Context
**Trigger:** When refactoring component tree

### TD-016: Magic Numbers/Strings
**Files:** `kanban-board.tsx:242`, `use-communications.ts:108`
**Issue:** Hardcoded values scattered throughout
**Effect:** Maintenance burden
**Fix:** Centralize in `lib/constants.ts`
**Trigger:** During code cleanup sprint

### TD-017: Duplicate Health Status Mapping
**Files:** `pipeline-store.ts:100`, `use-dashboard.ts:28`
**Issue:** Same mapping logic repeated
**Effect:** Bug fixes don't propagate
**Fix:** Create single `mapHealthStatus()` utility
**Trigger:** When touching health logic

### TD-018: Duplicate Filter Logic
**Files:** `app/page.tsx`, `pipeline-store.ts`, `use-communications.ts`
**Issue:** Three separate filter implementations
**Effect:** Inconsistent behavior
**Fix:** Extract to shared utility
**Trigger:** When adding new filter types

### TD-019: Excessive Type Casting
**Files:** `pipeline-store.ts:149`, `ticket-store.ts:213`
**Issue:** Using `as` bypasses TypeScript checks
**Effect:** Runtime errors not caught at compile time
**Fix:** Use type guards or Zod validation
**Trigger:** When seeing type-related runtime errors

### TD-020: Nested Action Calls in Stores
**File:** `communications-store.ts:191-203`
**Issue:** Calling one Zustand action from another
**Effect:** Potential stale state, race conditions
**Fix:** Inline logic or use immer
**Trigger:** When seeing state sync issues

### TD-021: Error State Not Cleared
**Files:** `pipeline-store.ts:169`, `ticket-store.ts:214`
**Issue:** Errors set but never cleared after success
**Effect:** Stale error messages
**Fix:** Clear error on successful operations
**Trigger:** When users report stuck errors

### TD-022: Duplicate Error Handling
**Files:** Multiple API routes and hooks
**Issue:** Same try/catch pattern repeated 20+ times
**Effect:** Inconsistent error logging
**Fix:** Create `handleApiError()` utility
**Trigger:** During error handling standardization

---

## Changelog

| Date | Item | Action |
|------|------|--------|
| 2026-01-02 | TD-001, TD-002, TD-003 | Fixed - setTimeout, duplicate state, DOMPurify |
| 2026-01-02 | Initial | Created register with 22 items from audit |

---

*Living Document - Update when debt is added or resolved*
