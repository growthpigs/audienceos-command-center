# DevOps & Claude MCP Plan

> Synced from Drive: 2025-12-31

This section covers how we will use Claude Code + MCP servers in the development process while ensuring the client's product uses traditional backend integrations.

---

## Purpose

* Use MCPs (Context7, Supabase MCP, Docker MCP) as developer assistants and ephemeral test harnesses.
* Keep production integration logic standard server-side.

---

## Roles

* **Claude Code**: generate code snippets, unit tests, and PRs.
* **Context7 MCP**: local context manager for dev docs and prompts.
* **Supabase MCP**: local supabase instance runner for ephemeral testing (mocks).
* **Docker MCP**: create containerized reproducible dev environments (local infra).

---

## Development Workflow (CI/CD + MCP)

1. **Feature branch**: dev creates feature branch `feat/<issue>` and opens PR.

2. **Local rapid-prototyping with MCPs**:
   * Use Docker MCP to spin containers (`docker-compose -f dev.yml up`) for local Postgres + Supabase emulator.
   * Use Supabase MCP to run migrations and seed example agency workspace.
   * Use Context7 to manage prompt templates and seed data for assistant testing.
   * Claude Code helps scaffold components and tests, outputs PR-ready diffs.

3. **Run unit & integration tests locally**.

4. **Push & open PR**:
   * CI triggers: lint, unit tests, typecheck, build.
   * If PR passes, auto-deploy to staging Vercel preview & staging Supabase workspace.

5. **Staging validation**:
   * Run end-to-end smoke tests (Playwright).
   * Use a staging Google File Search instance and stub LLM keys (or low-cost sandbox).

6. **Production deploy**:
   * Merge to main triggers production build & deploy (Vercel).
   * Migrations run with a safe migration process (db migration service with backups).
   * Rotate keys and verify integrations with manual smoke test.

---

## Infrastructure & Secrets

* **Secrets management**: Use cloud provider KMS (GCP KMS / AWS KMS). CI/CD (GitHub Actions / GitLab CI) pulls secrets via KMS at runtime.
* **Key rotation**: scheduled key rotation every 90 days with automation.
* **Encryption**: tokens stored encrypted with KMS; service role keys stored in vault.

---

## Observability & Monitoring

* **Logging**: structured logs (JSON) stored in a logging service (Stackdriver / Datadog).
* **Metrics**: Prometheus or managed metrics for:
  * Sync durations
  * Worker failures
  * API latencies
* **Alerts**:
  * Worker failure > 5 errors/hour
  * OAuth refresh fails for > 3 accounts
  * High error rates (5xx > 1%)

---

## Backup & DR

* Daily DB backups; point-in-time recovery enabled.
* Storage lifecycle for documents + versions.
* Run periodic restore drills quarterly.

---

## Worker & Scheduling Design

* Use serverless functions / Cloud Run for on-demand sync.
* Use managed cron (Cloud Scheduler) to trigger hourly ingestion jobs per agency.
* Implement job queue (Redis / managed queue) for rate-limited provider pulls.

---

## Cost Control & Usage-Based Billing

Track metrics:
* Document indexing ops
* Assistant queries & tokens used
* Automation runs
* Number of connected integrations

Emit these into a billing counter service for usage-based plan calculations.

---

*Synced from Drive — Living Document*
