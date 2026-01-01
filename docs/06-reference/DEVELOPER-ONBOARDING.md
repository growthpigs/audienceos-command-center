# Developer Onboarding Doc

> Synced from Drive: 2025-12-31

Documentation for current/new devs to configure their development environment.

---

## Prerequisites

* Node.js 18+ (LTS recommended)
* pnpm or npm
* Docker (for local Supabase or running services)
* Git
* Access to: Vercel org, Supabase project creation permissions, Google Cloud (File Search), LLM provider API key, OAuth test apps for integrations (Slack, Gmail, Google Ads, Meta)

---

## Accounts & Secrets to Request

* Vercel team access
* Supabase admin + ability to create isolated projects for tenants
* Google Cloud service account + access to File Search & GCS
* OAuth client IDs + secrets for Slack, Google (Gmail & Ads), Meta
* LLM provider API key (OpenAI / Anthropic / Claude)
* KMS (AWS/GCP) keys for token encryption

---

## Local Dev Setup (Quick)

1. Fork repo, clone locally.

2. Copy `.env.example` → `.env.local` and fill:
   * NEXT_PUBLIC_API_URL=http://localhost:3000/api
   * SUPABASE_URL=...
   * SUPABASE_ANON_KEY=...
   * SUPABASE_SERVICE_ROLE_KEY=... (secure)
   * FILE_SEARCH_KEY=...
   * LLM_API_KEY=...
   * KMS_KEY=...

3. Start local infra:
   * `docker compose up` (if using local supabase + postgres)
   * Or `supabase start`

4. Install deps and run frontend:
   * `pnpm install`
   * `pnpm dev` (Next.js)

5. Run background workers:
   * `pnpm workspace worker start` or run `supabase functions serve get-sync` (depends on implementation)

---

## Code Style & Conventions

* TypeScript across fullstack
* React + Next.js (App Router optional but recommended)
* Tailwind CSS for styling
* Database migrations via `pg-migrate` or Supabase migrations
* REST first, GraphQL later if needed
* All secrets read through environment variables
* Commit messages use Conventional Commits

---

## How to Run Tests

* `pnpm test` (Jest + React Testing Library)
* CI runs unit tests, lint, build, and e2e smoke tests

---

## How to Add a New Integration

1. Create OAuth app in provider dev console.

2. Add `INTEGRATION_TYPE` entry in `integrations` table migration.

3. Implement server-side connector in `services/integrations/{provider}`:
   * OAuth route
   * Token refresh handler
   * Sync worker

4. Add UI card in Integrations page and binding to backend API.

---

*Synced from Drive — Living Document*
