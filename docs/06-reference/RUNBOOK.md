# AudienceOS Command Center - Runbook

> **Operational reference for development, deployment, and troubleshooting**
> Last Updated: 2026-01-04

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build with TypeScript check |
| `npm run typecheck` | Run TypeScript without building |
| `npm run test` | Run Vitest tests |
| `npm run format` | Format with Prettier |

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required for Development

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Supabase Dashboard → Settings → API |

### AI Services

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com |
| `GOOGLE_AI_API_KEY` | Gemini API key (for RAG) | console.cloud.google.com |

### OAuth Integrations

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `SLACK_CLIENT_ID` | Slack OAuth app ID | api.slack.com/apps |
| `SLACK_CLIENT_SECRET` | Slack OAuth secret | api.slack.com/apps |
| `SLACK_SIGNING_SECRET` | Slack webhook verification | api.slack.com/apps |
| `GOOGLE_CLIENT_ID` | Google OAuth (Gmail + Ads) | console.cloud.google.com |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | console.cloud.google.com |
| `META_APP_ID` | Meta (Facebook) app ID | developers.facebook.com |
| `META_APP_SECRET` | Meta app secret | developers.facebook.com |

### Security (Required for Production)

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `OAUTH_STATE_SECRET` | HMAC key for OAuth CSRF protection | `openssl rand -hex 32` |
| `TOKEN_ENCRYPTION_KEY` | AES-256 key for token encryption | `openssl rand -hex 32` |

**Important:** Production builds will fail without these keys. See `instrumentation.ts` for startup validation.

### Monitoring (Optional)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `SENTRY_DSN` | Sentry error tracking (server) | sentry.io |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking (client) | sentry.io |

---

## Local Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm
- Git
- Supabase CLI (optional, for local DB)

### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/growthpigs/audienceos-command-center.git
cd audienceos-command-center

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev
```

### With Local Supabase (Optional)

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > types/database.ts
```

---

## Build & Deployment

### Current Status: Production Deployed ✅

| Environment | URL | Status |
|-------------|-----|--------|
| **Production** | [audienceos-command-center-5e7i.vercel.app](https://audienceos-command-center-5e7i.vercel.app) | Active |
| **Vercel Team** | Agro Bros | growthpigs/audienceos-co... |

**Deployment:** Auto-deploys on push to `main` branch.

### Production Build

```bash
npm run build
```

Build output:
- 11 static pages
- 24 API routes (dynamic)
- TypeScript check included

### Vercel Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set | `audienceos-cc-fresh` project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set | JWT format |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set | Server-only |
| `GOOGLE_AI_API_KEY` | ✅ Set | Gemini for chat |
| `OAUTH_STATE_SECRET` | ✅ Set | Security |
| `TOKEN_ENCRYPTION_KEY` | ✅ Set | Security |

---

## Database Operations

### Regenerate Types

When database schema changes:

```bash
# From remote Supabase
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# From local Supabase
supabase gen types typescript --local > types/database.ts
```

### Run Migrations

```bash
# Local
supabase db push

# Remote (via Supabase Dashboard or CLI)
supabase db push --linked
```

---

## ✅ Database Configuration (Completed 2026-01-04)

### Active Supabase Project

| Property | Value |
|----------|-------|
| **Project Name** | `audienceos-cc-fresh` |
| **Project ID** | `ebxshdqfaqupnvpghodi` |
| **Organization** | Badaboost |
| **URL** | `https://ebxshdqfaqupnvpghodi.supabase.co` |

### Schema Status: Applied ✅

The AudienceOS schema (`supabase/migrations/001_initial_schema.sql`) has been applied with all 19 tables:

| Table | Purpose |
|-------|---------|
| `agency` | Tenant root (multi-tenant) |
| `user` | Team members |
| `client` | Client accounts |
| `client_assignment` | Owner/collaborator assignments |
| `stage_event` | Pipeline stage history |
| `task` | Action items |
| `integration` | OAuth connections |
| `communication` | Messages (Slack/Gmail) |
| `alert` | System notifications |
| `document` | Knowledge base files |
| `chat_session` | AI chat sessions |
| `chat_message` | AI chat messages |
| `ticket` | Support tickets |
| `ticket_note` | Ticket comments |
| `workflow` | Automation definitions |
| `workflow_run` | Automation executions |
| `user_preference` | User settings |
| `kpi_snapshot` | Performance metrics |
| `ad_performance` | Ad platform data |

### Seed Data: Present ✅

Test users configured:
- `test@audienceos.dev` - Test User
- `dev@audienceos.dev` - Dev User
- `test@audienceos.com` - Test User
- `admin@acme.agency` - Admin User

### RLS: Enabled ✅

All tables have Row-Level Security with `auth.jwt() ->> 'agency_id'` isolation.

### Regenerate Types (If Schema Changes)

```bash
supabase gen types typescript --project-id ebxshdqfaqupnvpghodi > types/database.ts
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/clients` | GET, POST | List/create clients |
| `/api/v1/clients/[id]` | GET, PATCH, DELETE | Client CRUD |
| `/api/v1/clients/[id]/stage` | PUT | Move client stage |
| `/api/v1/clients/[id]/communications` | GET | Client messages |
| `/api/v1/tickets` | GET, POST | List/create tickets |
| `/api/v1/tickets/[id]` | GET, PATCH, DELETE | Ticket CRUD |
| `/api/v1/tickets/[id]/status` | PUT | Update ticket status |
| `/api/v1/tickets/[id]/notes` | POST | Add ticket note |
| `/api/v1/tickets/[id]/resolve` | POST | Resolve ticket |
| `/api/v1/tickets/[id]/reopen` | POST | Reopen ticket |
| `/api/v1/integrations` | GET, POST | List/create integrations |
| `/api/v1/integrations/[id]` | GET, PATCH, DELETE | Integration CRUD |
| `/api/v1/integrations/[id]/sync` | POST | Trigger sync |
| `/api/v1/integrations/[id]/test` | POST | Test connection |
| `/api/v1/workflows` | GET, POST | List/create workflows |
| `/api/v1/workflows/[id]` | GET, PATCH, DELETE | Workflow CRUD |
| `/api/v1/workflows/[id]/toggle` | POST | Enable/disable |
| `/api/v1/workflows/[id]/runs` | GET | Execution history |
| `/api/v1/communications/[id]` | GET, PATCH | Message operations |
| `/api/v1/communications/[id]/reply` | POST | Send reply |
| `/api/v1/communications/[id]/thread` | GET | Get thread |
| `/api/v1/oauth/callback` | GET | OAuth callback handler |

---

## Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Check TypeScript errors
npm run typecheck

# Regenerate database types if schema changed
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

### Supabase Connection Issues

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Ensure RLS policies allow access
4. Check Supabase Dashboard for service status

### OAuth Integration Failures

1. Verify client ID and secret are correct
2. Check redirect URIs match in provider console
3. Verify scopes are properly configured
4. Check token expiry and refresh logic

### API Returns 401/403

1. Check JWT token is present in Authorization header
2. Verify user has correct role/permissions
3. Check RLS policies in Supabase

---

## Monitoring & Alerts

### Health Checks (Local Development)

- **Build Status**: `npm run build` (local verification)
- **Database**: Supabase Dashboard → Database
- **API Errors**: Browser console / Sentry (when configured)

### Key Metrics to Watch

- API response times (< 500ms target)
- Error rate (< 1% target)
- Database connection pool usage
- OAuth token refresh failures

---

## Security Checklist

### Implemented (2026-01-02)
- [x] OAuth state signing with HMAC-SHA256 (SEC-001)
- [x] Token encryption with AES-256-GCM (SEC-002)
- [x] agency_id from database lookup, not JWT (SEC-003)
- [x] Centralized auth middleware (SEC-004)
- [x] Token revocation on disconnect (SEC-005)
- [x] Server-verified auth with `getUser()` (SEC-006)
- [x] Startup validation fails production if keys missing

### Ongoing
- [ ] Never commit `.env.local` or secrets
- [ ] Use Supabase RLS for all tables
- [ ] Validate all API inputs with Zod
- [ ] Rotate API keys every 90 days
- [ ] Review Supabase auth policies

### Pre-Beta (P1 Tech Debt)
- [ ] Add CSRF tokens to state-changing requests (TD-005)
- [ ] Implement distributed rate limiting (TD-004)
- [ ] Fix IP spoofing in rate limiter (TD-008)

---

## Verification Commands

Commands for diagnosing and verifying fixes. Use these when troubleshooting issues.

### Dev Server Stability Check

When suspecting infinite loops or excessive re-renders:

```bash
# 1. Start dev server and capture output
npm run dev 2>&1 | tee /tmp/nextjs-output.log

# 2. In another terminal, monitor log line count (should stabilize)
watch -n 1 'wc -l /tmp/nextjs-output.log'

# Healthy: Line count stabilizes (e.g., 37 lines after page load)
# Unhealthy: Line count grows continuously (1000+ lines/minute = infinite loop)
```

### Network Request Monitoring (Claude in Chrome)

When RSC/API requests seem excessive:

1. Open Claude in Chrome tab context
2. Navigate to app URL
3. Use `read_network_requests` with `urlPattern: "RSC"` or `urlPattern: "/api/"`
4. Check for:
   - 503 errors (server overwhelmed)
   - Request count growing rapidly
   - Repeated identical requests

```
# Expected: Single RSC request per navigation
# Problem: 1000+ RSC requests = infinite re-render loop
```

### API Response Verification

```bash
# Test unauthenticated API returns mock data (demo mode)
curl -s http://localhost:3000/api/v1/workflows | jq '.demo, .workflows | length'
# Expected: true, 5 (or number of mock workflows)

# Test with authentication
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/workflows | jq '.demo'
# Expected: null or absent (not demo mode)
```

### Console Log Monitoring (Claude in Chrome)

```javascript
// Check for React hook warnings
mcp__claude-in-chrome__read_console_messages({
  tabId: TAB_ID,
  pattern: "Maximum update depth|Cannot update|infinite loop"
})
```

### Root Cause Patterns (EP-057)

When infinite loops occur, check:
1. **Singleton clients**: `lib/supabase.ts` - does `createClient()` return same instance?
2. **Effect dependencies**: Check for router/URL state in useEffect deps
3. **State-URL sync**: Does updating URL cause state change that updates URL again?

See `~/.claude/troubleshooting/error-patterns.md` EP-057 for full pattern.

### Dev Server Lock File / Port Conflicts (2025-01-02)

When dev server fails to start with "Unable to acquire lock" or port conflicts:

```bash
# 1. Check what's using ports 3000-3003
lsof -i :3000 -i :3001 -i :3002 -i :3003 | grep LISTEN

# 2. Kill existing Next.js processes
pkill -f "next dev"

# 3. Remove stale lock file
rm -f .next/dev/lock

# 4. Restart cleanly
npm run dev

# 5. Verify running (should show node listening)
lsof -i :3000 | head -3
```

**Root Cause:** Multiple dev sessions or crashed servers leave lock files. Context window resets lose track of background processes.

**Prevention:** Always `pkill -f "next dev"` before starting new session.

### Runtime Environment Verification (Static vs Runtime Check)

**Never trust file existence alone.** Always verify runtime:

```bash
# WRONG - File exists but may be empty/invalid:
ls .env.local  # Shows file exists but doesn't prove config loads

# RIGHT - Runtime verification:
npm run build 2>&1 | head -20  # Proves TypeScript compiles
curl http://localhost:3000/api/v1/workflows | jq '.demo'  # Proves API responds
```

See error-patterns.md "File Existence Fallacy" pattern.

### Settings API Verification (2026-01-04)

**Agency Settings (Admin Only)**

```bash
# Fetch agency configuration
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/settings/agency | jq '.data | {name, timezone, pipeline_stages}'

# Update agency settings
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agency",
    "timezone": "America/New_York",
    "pipeline_stages": ["Lead", "Onboarding", "Live", "Support"]
  }' \
  http://localhost:3000/api/v1/settings/agency | jq '.data.name'
```

**User Management (Admin Only)**

```bash
# List team members
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/settings/users?limit=10 | jq '.data | length'

# Update user role (prevents last admin removal)
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "user"}' \
  http://localhost:3000/api/v1/settings/users/USER_ID | jq '.data.role'

# Delete user with client reassignment
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reassign_to": "OTHER_USER_ID"}' \
  http://localhost:3000/api/v1/settings/users/USER_ID | jq '.message'
```

**Expected Responses:**
- GET agency: 200 with agency config
- PATCH agency: 200 with updated config
- GET users: 200 with paginated list
- PATCH user: 200 with updated user OR 400 if last admin
- DELETE user: 200 with success message OR 400 if reassignment needed

**Permission Checks:**
- All endpoints return 403 if user is not admin
- Last admin protection prevents role demotion
- Self-deletion is blocked

---

### Schema Verification (Before Any DB Changes) (2026-01-03)

**CRITICAL:** Never plan database migrations from documentation alone. Always verify actual schema.

```bash
# 1. Check actual tables in RevOS Supabase
# Via migration files (in chronological order):
ls -la /Users/rodericandrews/_PAI/projects/revos/supabase/migrations/*.sql | head -10
cat /path/to/revos/supabase/migrations/001_initial_schema.sql | head -100

# 2. Check for table name discrepancies
# Expected: 'tenants' | Actual: 'agencies' (RevOS uses 'agencies')
grep -n "CREATE TABLE" /path/to/revos/supabase/migrations/*.sql | head -20

# 3. Check FK patterns in users table
grep -A10 "CREATE TABLE users" /path/to/revos/supabase/migrations/001_*.sql
# Expected: users.id REFERENCES auth.users(id)
# Actual: users.id is standalone UUID (manual sync)

# 4. Check cartridge tables
grep -n "cartridge" /path/to/revos/supabase/migrations/*.sql
# Expected: Single 'cartridges' table
# Actual: 4 tables (style_cartridges, preference_cartridges, etc.)

# 5. Check RLS policies for JWT claim pattern
grep -n "app_metadata" /path/to/revos/supabase/migrations/*.sql
grep -n "tenant_id\|agency_id" /path/to/revos/supabase/migrations/*.sql
# Expected: tenant_id | Actual: agency_id

# 6. Via Supabase Dashboard (if CLI not configured)
# https://supabase.com/dashboard/project/trdoainmejxanrownbuz/database/tables
```

**Verification Checklist (Pre-Migration):**
```
□ Queried actual tables (not assumed from docs)
□ Documented discrepancies between docs and reality
□ Updated execution plan to match ACTUAL schema
□ Tested RLS pattern matches JWT claims in use
□ Created RUNTIME-FINDINGS.md if major discrepancies found
```

**Related:** EP-061 "Schema Assumption Fallacy" in error-patterns.md

---

## Related Documents

- [DEVELOPER-ONBOARDING.md](./DEVELOPER-ONBOARDING.md) - Setup guide for new devs
- [DEVOPS.md](../04-technical/DEVOPS.md) - CI/CD and infrastructure
- [API-CONTRACTS.md](../04-technical/API-CONTRACTS.md) - Full API specification
- [DATA-MODEL.md](../04-technical/DATA-MODEL.md) - Database schema

---

*Living Document - Update when operational procedures change*
