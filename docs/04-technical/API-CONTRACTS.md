# API Design Spec (REST) — v1

> Synced from Drive: 2025-12-31
> Updated: 2025-12-31 (Validator fixes applied)

**Base URL:** `https://api.yourdomain.com/v1`
**Auth:** JWT with `Authorization: Bearer <token>` (issued via Supabase Auth)

All endpoints are scoped by `agency_id` from JWT claims. Multi-tenant isolation enforced via RLS.

---

## Standard Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <jwt>` |
| `Content-Type` | Yes | `application/json` |
| `X-Request-ID` | No | Client-generated UUID for tracing |

### Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-ID` | Echo of request ID or server-generated |
| `X-RateLimit-Limit` | Requests allowed per window |
| `X-RateLimit-Remaining` | Requests remaining |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

---

## Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Standard CRUD | 100 req | 1 min |
| AI Assistant | 20 req | 1 min |
| Bulk Operations | 5 req | 1 min |
| Webhooks (inbound) | 1000 req | 1 min |

**Token Budget (AI):** 50,000 tokens/day per agency (configurable)

---

## Pagination

All list endpoints use cursor-based pagination:

```json
{
  "items": [...],
  "pagination": {
    "cursor": "eyJpZCI6Ij...",
    "has_more": true,
    "total": 142
  }
}
```

Params: `?cursor=&limit=25` (max 100)

---

## Auth

### `POST /v1/auth/login`
Standard Supabase Auth login.

### `POST /v1/auth/refresh`
Refresh JWT token.

### `POST /v1/auth/password-reset`
Request password reset email.
```json
{ "email": "user@agency.com" }
```
Response: `{ "message": "Reset email sent" }`

### `POST /v1/auth/password-reset/confirm`
Confirm password reset with token.
```json
{ "token": "reset-token", "new_password": "..." }
```

---

## User Invitations

### `POST /v1/invitations`
Invite user to agency (admin only).
```json
{
  "email": "newuser@example.com",
  "role": "member",
  "message": "Welcome to our agency!"
}
```
Response: `{ "id": "uuid", "expires_at": "..." }`

### `GET /v1/invitations`
List pending invitations (admin only).

### `DELETE /v1/invitations/{id}`
Cancel invitation (admin only).

### `POST /v1/invitations/{token}/accept`
Accept invitation (no auth required, token in URL).
```json
{
  "name": "John Doe",
  "password": "..."
}
```
Response: `{ "user": {...}, "token": "jwt" }`

---

## Agency (Current Tenant)

### `GET /v1/agency`
Get current agency profile (from JWT agency_id).
Response:
```json
{
  "id": "uuid",
  "name": "Acme Marketing",
  "slug": "acme-marketing",
  "logo_url": "...",
  "timezone": "America/New_York",
  "business_hours": { "start": "09:00", "end": "17:00" },
  "pipeline_stages": ["Onboarding", "Installation", "Audit", "Live", "Needs Support", "Off-Boarding"],
  "health_thresholds": { "yellow_days": 7, "red_days": 14 }
}
```

### `PATCH /v1/agency`
Update agency settings (admin only).
```json
{
  "name": "...",
  "logo_url": "...",
  "timezone": "...",
  "business_hours": {...},
  "pipeline_stages": [...],
  "health_thresholds": {...}
}
```

---

## Users

### `GET /v1/users`
List agency users.
Params: `?role=&active=&q=`

### `GET /v1/users/{id}`
Get user detail.

### `PATCH /v1/users/{id}`
Update user (admin can update others, users can update self).
```json
{ "name": "...", "role": "...", "active": true }
```

### `DELETE /v1/users/{id}`
Soft-delete user (admin only).

### `GET /v1/users/{id}/preferences`
Get user preferences.
Params: `?category=notifications|ai|display`
Response:
```json
{
  "notifications": {
    "email_enabled": true,
    "slack_enabled": true,
    "digest_mode": "daily",
    "quiet_hours": { "start": "22:00", "end": "08:00" }
  },
  "ai": {
    "assistant_name": "Chi",
    "response_tone": "professional",
    "response_length": "concise"
  },
  "display": {
    "theme": "dark",
    "sidebar_collapsed": false
  }
}
```

### `PATCH /v1/users/{id}/preferences`
Update user preferences.
```json
{
  "category": "notifications",
  "key": "email_enabled",
  "value": false
}
```
Or bulk update:
```json
{
  "notifications": {
    "email_enabled": false,
    "digest_mode": "weekly"
  }
}
```

---

## Clients

### `GET /v1/clients`
Params: `?stage=&owner=&health=&q=&limit=&cursor=`

### `POST /v1/clients`
```json
{
  "name": "Acme Corp",
  "stage": "onboarding",
  "meta": { "tier": "enterprise" },
  "assignments": [
    { "user_id": "uuid", "role": "primary" }
  ]
}
```

### `POST /v1/clients/bulk`
Bulk import clients (max 100).
```json
{
  "clients": [
    { "name": "...", "stage": "...", "meta": {...} }
  ],
  "default_owner_id": "uuid"
}
```
Response: `{ "created": 95, "failed": 5, "errors": [...] }`

### `GET /v1/clients/{id}`
Includes: tasks, recent comms summary, health reason.

### `PATCH /v1/clients/{id}`
Stage changes auto-create StageEvent.

### `DELETE /v1/clients/{id}`
Soft-delete (fails if open tickets exist).

### `GET /v1/clients/{id}/export`
Export client data (GDPR).
Response: JSON or CSV based on `Accept` header.

---

## Client Assignments

### `GET /v1/clients/{id}/assignments`
List users assigned to client.

### `POST /v1/clients/{id}/assignments`
```json
{ "user_id": "uuid", "role": "secondary" }
```

### `DELETE /v1/clients/{id}/assignments/{user_id}`
Remove assignment.

---

## Pipeline / Stage Events

### `POST /v1/clients/{id}/move`
```json
{ "to_stage": "installation" }
```
Auto-creates StageEvent, updates `days_in_stage`.

### `GET /v1/clients/{id}/stage-history`
Returns stage event timeline.

---

## Tasks

### `GET /v1/clients/{id}/tasks`
Params: `?completed=&assignee=&stage=`

### `POST /v1/clients/{id}/tasks`
```json
{
  "name": "Install Meta Pixel",
  "description": "...",
  "assigned_to": "uuid",
  "due_date": "2025-01-15",
  "stage": "installation"
}
```

### `PATCH /v1/tasks/{id}`
```json
{ "completed": true }
```
Auto-sets `completed_at`.

### `DELETE /v1/tasks/{id}`
Hard delete (tasks don't soft-delete).

---

## Tickets

### `GET /v1/tickets`
Params: `?status=&priority=&assignee=&client_id=&source=`

### `POST /v1/tickets`
```json
{
  "client_id": "uuid",
  "title": "Pixel not firing",
  "description": "...",
  "priority": "high",
  "source": "manual"
}
```

### `GET /v1/tickets/{id}`
Includes notes and related communications.

### `PATCH /v1/tickets/{id}`
```json
{ "status": "resolved", "assignee_user_id": "uuid" }
```
Auto-sets `resolved_at` when status = resolved.

### `POST /v1/tickets/{id}/notes`
```json
{ "note": "Called client, waiting for access.", "is_internal": true }
```

### `DELETE /v1/tickets/{id}`
Soft-delete (admin only).

---

## Communications (Unified Inbox)

### `GET /v1/clients/{id}/communications`
Params: `?source=slack|gmail&needs_reply=true&thread_id=&limit=&cursor=`

### `GET /v1/communications/{id}`
Single message with thread context.

### `GET /v1/communications/{id}/thread`
Full thread (all replies).

### `POST /v1/communications/{id}/reply`
```json
{
  "content": "Thanks for reaching out...",
  "send_immediately": false
}
```
If `send_immediately: false`, saves as draft.
If `true`, sends via Slack/Gmail API.

### `PATCH /v1/communications/{id}`
```json
{ "needs_reply": false, "is_read": true }
```

---

## Alerts (Intelligence Center)

### `GET /v1/alerts`
Params: `?type=&severity=&status=pending&client_id=&category=`

### `GET /v1/alerts/{id}`
Includes `context` and `suggested_actions`.

### `PATCH /v1/alerts/{id}`
```json
{ "status": "acknowledged" }
```

### `POST /v1/alerts/{id}/snooze`
```json
{ "until": "2025-01-02T09:00:00Z" }
```

### `POST /v1/alerts/{id}/action`
Execute suggested action (human-in-the-loop approval).
```json
{ "action_index": 0, "approved": true }
```

---

## Integrations

### `GET /v1/integrations`
List all integrations with sync status.

### `POST /v1/integrations`
Initiate OAuth flow.
```json
{ "type": "slack" }
```
Response: `{ "redirect_url": "https://..." }`

### `GET /v1/integrations/{id}`
Detail including `last_sync_status`, `last_sync_error`.

### `POST /v1/integrations/{id}/refresh`
Force OAuth token refresh.
Response: `{ "success": true, "expires_at": "..." }`

### `POST /v1/integrations/{id}/test`
Test connection (ping provider API).

### `POST /v1/integrations/{id}/sync`
Trigger on-demand sync.
Response: `{ "job_id": "uuid", "status": "queued" }`

### `GET /v1/integrations/{id}/sync-status`
Check sync job status.

### `DELETE /v1/integrations/{id}`
Disconnect integration, delete credentials.

---

## Documents (Knowledge Base / RAG)

### `GET /v1/documents`
Params: `?category=&client_id=&indexed=`

### `POST /v1/documents`
Multipart upload.
```
Content-Type: multipart/form-data
file: <binary>
category: sop
client_id: <uuid|null>
```

### `GET /v1/documents/{id}`
Metadata including `indexed`, `gemini_file_id`.

### `POST /v1/documents/{id}/index`
Push to Gemini File Search.
Response: `{ "gemini_file_id": "...", "chunks": 24 }`

### `DELETE /v1/documents/{id}`
Soft-delete, removes from Gemini index.

---

## RAG & Assistant

### `POST /v1/assistant/query`
```json
{
  "query": "What's the process for Meta pixel installation?",
  "client_id": "uuid",
  "max_sources": 5,
  "mode": "summary"
}
```
Response:
```json
{
  "answer": "The Meta pixel installation involves...",
  "sources": [
    { "document_id": "uuid", "title": "...", "excerpt": "..." }
  ],
  "suggested_actions": [],
  "tokens_used": 1250,
  "tokens_remaining": 48750
}
```

### `POST /v1/assistant/draft`
```json
{
  "type": "email",
  "context": {
    "client_id": "uuid",
    "thread_id": "gmail-thread-123",
    "ticket_id": "uuid"
  },
  "tone": "professional",
  "instructions": "Explain the delay and provide timeline"
}
```
Response:
```json
{
  "draft": "Hi Jane,\n\nThank you for your patience...",
  "sources": [...],
  "tokens_used": 890
}
```

### Rate Limit Response (429):
```json
{
  "error": "rate_limit_exceeded",
  "message": "AI token budget exhausted",
  "tokens_used": 50000,
  "resets_at": "2025-01-02T00:00:00Z"
}
```

### AI Fallback Behavior

When Claude API is unavailable (429/500/timeout):

1. **Retry:** 3 attempts with exponential backoff (1s, 2s, 4s)
2. **Queue:** If still failing, queue request for background processing
3. **Response:**
```json
{
  "status": "queued",
  "message": "AI service temporarily busy. Your request is queued.",
  "job_id": "uuid",
  "estimated_wait": "2 minutes"
}
```
4. **Polling:** Client polls `GET /v1/assistant/jobs/{job_id}`

---

## Dashboard

### `GET /v1/dashboard/kpis`
Fetch all KPI values with trends.
Response:
```json
{
  "active_onboardings": {
    "value": 12,
    "trend": "up",
    "change_percent": 8.3,
    "previous_value": 11,
    "drill_down_url": "/pipeline?stage=onboarding"
  },
  "at_risk_clients": {
    "value": 3,
    "trend": "down",
    "change_percent": -25,
    "previous_value": 4,
    "drill_down_url": "/clients?health=red"
  },
  "support_hours": {
    "value": 24.5,
    "trend": "stable",
    "change_percent": 2.1,
    "previous_value": 24,
    "drill_down_url": "/tickets"
  },
  "avg_install_time": {
    "value": 12.3,
    "unit": "days",
    "trend": "down",
    "change_percent": -15,
    "previous_value": 14.5
  },
  "clients_needing_attention": {
    "value": 5,
    "trend": "up",
    "change_percent": 25,
    "previous_value": 4,
    "drill_down_url": "/clients?needs_attention=true"
  },
  "last_updated": "2025-12-31T15:30:00Z"
}
```

### `POST /v1/dashboard/refresh`
Trigger manual KPI recalculation.
Response:
```json
{
  "status": "refreshing",
  "job_id": "uuid",
  "estimated_completion": "5 seconds"
}
```

### `GET /v1/dashboard/trends`
Time-series data for charts.
Params: `?metric=new_vs_completed&period=7|30|90`
Response:
```json
{
  "metric": "new_vs_completed",
  "period_days": 30,
  "data": [
    { "date": "2025-12-01", "new_clients": 3, "completed_installs": 2 },
    { "date": "2025-12-02", "new_clients": 1, "completed_installs": 4 }
  ]
}
```

---

## Ads Metrics

### `GET /v1/clients/{id}/ads-metrics`
Params: `?platform=google_ads|meta_ads&start=YYYY-MM-DD&end=YYYY-MM-DD&granularity=day|week`

### `POST /v1/integrations/{id}/ads/sync`
Trigger ad data sync.

---

## Automations (Workflows)

### `GET /v1/workflows`
Params: `?enabled=`

### `POST /v1/workflows`
```json
{
  "name": "Daily Health Check",
  "description": "...",
  "trigger": { "type": "schedule", "cron": "0 8 * * *" },
  "actions": [
    { "type": "check_ad_accounts", "params": {} },
    { "type": "create_alert", "params": { "severity": "warning" } }
  ],
  "enabled": true
}
```

### `PATCH /v1/workflows/{id}`
```json
{ "enabled": false }
```

### `POST /v1/workflows/{id}/run`
Manual trigger.

### `GET /v1/workflows/{id}/runs`
Execution history.

### `DELETE /v1/workflows/{id}`
Soft-delete.

---

## Settings

### `GET /v1/settings/agency`
Fetch agency configuration.

Response:
```json
{
  "id": "uuid",
  "name": "Agency Name",
  "logo_url": "https://...",
  "timezone": "UTC",
  "business_hours": { "start": "09:00", "end": "17:00" },
  "pipeline_stages": ["Lead", "Onboarding", "Live"],
  "health_thresholds": { "yellow": 7, "red": 14 }
}
```

### `PATCH /v1/settings/agency`
Update agency settings (admin only).

```json
{
  "name": "Updated Name",
  "timezone": "America/New_York",
  "business_hours": { "start": "08:00", "end": "18:00" },
  "pipeline_stages": ["Lead", "Proposal", "Onboarding", "Live", "Support"],
  "health_thresholds": { "yellow": 10, "red": 21 }
}
```

Validation:
- Timezone must be valid IANA timezone
- Min 3 pipeline stages, max 20
- Yellow threshold < Red threshold

### `GET /v1/settings/users`
List team members (admin only).

Params: `?limit=50&offset=0&is_active=true&search=name`

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@agency.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "is_active": true,
      "last_active_at": "2026-01-04T10:30:00Z"
    }
  ],
  "pagination": { "total": 5, "limit": 50, "offset": 0 }
}
```

### `PATCH /v1/settings/users/{id}`
Update user role or status (admin only).

```json
{
  "role": "user",
  "is_active": false
}
```

Validation:
- Prevents removing last admin
- Role: "admin" or "user"

### `DELETE /v1/settings/users/{id}`
Delete user (admin only).

If user has client assignments, requires:
```json
{
  "reassign_to": "other-user-id"
}
```

Validation:
- Prevents self-deletion
- Prevents deleting last admin
- Target user must be active and in same agency

---

## Webhooks (Inbound)

### `POST /v1/webhooks/slack/event`
Slack Events API webhook.

**Signature Verification (REQUIRED):**
```
X-Slack-Signature: v0=hash
X-Slack-Request-Timestamp: 1234567890
```

Verification:
```javascript
const sigBasestring = `v0:${timestamp}:${rawBody}`;
const mySignature = 'v0=' + hmacSha256(sigBasestring, SLACK_SIGNING_SECRET);
if (mySignature !== slackSignature) reject();
if (Math.abs(Date.now()/1000 - timestamp) > 300) reject(); // 5 min tolerance
```

### `POST /v1/webhooks/gmail/push`
Gmail Push Notifications (Pub/Sub).

**Verification:**
- Verify message comes from Google Pub/Sub
- Validate subscription matches our configuration
- Check `message.attributes.subscription` matches expected

### `POST /v1/webhooks/meta/event`
Meta Webhooks (Ads API).

**Signature Verification:**
```
X-Hub-Signature-256: sha256=hash
```

Verification:
```javascript
const expectedSig = 'sha256=' + hmacSha256(rawBody, META_APP_SECRET);
if (expectedSig !== hubSignature) reject();
```

---

## Audit Log

### `GET /v1/audit-log`
Admin only.
Params: `?entity_type=&entity_id=&user_id=&action=&start=&end=`

---

## Error Responses

### Standard Error Format
```json
{
  "error": "validation_error",
  "message": "Invalid email format",
  "details": {
    "field": "email",
    "value": "not-an-email"
  },
  "request_id": "uuid"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 400 | Invalid input |
| `unauthorized` | 401 | Missing/invalid JWT |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource doesn't exist |
| `conflict` | 409 | Duplicate or state conflict |
| `rate_limit_exceeded` | 429 | Too many requests |
| `internal_error` | 500 | Server error |
| `service_unavailable` | 503 | Dependency down |

---

*Synced from Drive — Living Document*
*Updated: 2025-12-31 (Validator fixes: invitations, password reset, token refresh, rate limits, webhooks, bulk ops)*
