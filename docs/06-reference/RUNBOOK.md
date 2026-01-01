# AudienceOS Command Center - Runbook

> **Operational reference for development, deployment, and troubleshooting**
> Last Updated: 2026-01-01

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

### Production Build

```bash
npm run build
```

Build output:
- 11 static pages
- 24 API routes (dynamic)
- TypeScript check included

### Vercel Deployment

The project auto-deploys to Vercel on push to `main`:
1. Push to `main` branch
2. Vercel builds and deploys automatically
3. Preview deployments for PRs

### Environment Variables in Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:
- All variables from `.env.example`
- Use different values for Production vs Preview

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

### Health Checks

- **Build Status**: Vercel Dashboard
- **Database**: Supabase Dashboard → Database
- **API Errors**: Sentry (when configured)

### Key Metrics to Watch

- API response times (< 500ms target)
- Error rate (< 1% target)
- Database connection pool usage
- OAuth token refresh failures

---

## Security Checklist

- [ ] Never commit `.env.local` or secrets
- [ ] Use Supabase RLS for all tables
- [ ] Validate all API inputs with Zod
- [ ] Store OAuth tokens encrypted
- [ ] Rotate API keys every 90 days
- [ ] Review Supabase auth policies

---

## Related Documents

- [DEVELOPER-ONBOARDING.md](./DEVELOPER-ONBOARDING.md) - Setup guide for new devs
- [DEVOPS.md](../04-technical/DEVOPS.md) - CI/CD and infrastructure
- [API-CONTRACTS.md](../04-technical/API-CONTRACTS.md) - Full API specification
- [DATA-MODEL.md](../04-technical/DATA-MODEL.md) - Database schema

---

*Living Document - Update when operational procedures change*
