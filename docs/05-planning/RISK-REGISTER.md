# AudienceOS Command Center - Risk Register

> **Created:** 2025-12-31
> **Status:** Pre-Implementation
> **Review Cadence:** Weekly during active development

---

## Risk Assessment Matrix

| Probability → | Low | Medium | High |
|---------------|-----|--------|------|
| **Critical** | 🟡 Monitor | 🔴 Mitigate | 🔴 Block |
| **High** | 🟢 Accept | 🟡 Monitor | 🔴 Mitigate |
| **Medium** | 🟢 Accept | 🟢 Accept | 🟡 Monitor |
| **Low** | 🟢 Accept | 🟢 Accept | 🟢 Accept |

---

## Active Risks

### R-001: Multi-Tenant Data Leakage
| Attribute | Value |
|-----------|-------|
| **Category** | Security |
| **Probability** | Low |
| **Impact** | Critical |
| **Rating** | 🟡 Monitor |
| **Owner** | Engineering |

**Description:** RLS policies could have gaps allowing cross-tenant data access.

**Mitigation:**
- [ ] Follow proven War Room RLS patterns
- [ ] Add `agency_id` check to every query
- [ ] Create RLS test suite before Phase 1 complete
- [ ] Code review every data access path

**Contingency:** Immediate hotfix + security audit if discovered.

---

### R-002: OAuth Complexity Across 4 Platforms
| Attribute | Value |
|-----------|-------|
| **Category** | Technical |
| **Probability** | Medium |
| **Impact** | High |
| **Rating** | 🟡 Monitor |
| **Owner** | Engineering |

**Description:** Slack, Gmail, Google Ads, Meta Ads each have different OAuth flows, scopes, and refresh requirements.

**Mitigation:**
- [ ] Use chi-gateway MCP as fallback for ad platforms
- [ ] Research each OAuth flow before Phase 5
- [ ] Build generic OAuth flow component
- [ ] Add comprehensive error handling

**Contingency:** Ship with MCP-only for ads if OAuth proves too complex for v1.

---

### R-003: Gemini File Search Indexing Failures
| Attribute | Value |
|-----------|-------|
| **Category** | Integration |
| **Probability** | Low |
| **Impact** | Medium |
| **Rating** | 🟢 Accept |
| **Owner** | Engineering |

**Description:** Documents may fail to index to Gemini, breaking Knowledge Base RAG.

**Mitigation:**
- [ ] Implement retry mechanism with exponential backoff
- [ ] Add manual re-index button in UI
- [ ] Show clear status (pending/indexing/indexed/failed)
- [ ] Document supported formats and size limits

**Contingency:** Allow direct document viewing even if RAG fails.

---

### R-004: Real-Time Performance Under Load
| Attribute | Value |
|-----------|-------|
| **Category** | Performance |
| **Probability** | Low |
| **Impact** | Medium |
| **Rating** | 🟢 Accept |
| **Owner** | Engineering |

**Description:** Supabase Realtime may struggle with many concurrent dashboard viewers.

**Mitigation:**
- [ ] Use hourly batch refresh for non-critical metrics
- [ ] Realtime only for at-risk client alerts
- [ ] Add client-side caching layer
- [ ] Monitor Supabase connection limits

**Contingency:** Downgrade to polling if Realtime issues occur.

---

### R-005: AI Token Costs Escalation
| Attribute | Value |
|-----------|-------|
| **Category** | Financial |
| **Probability** | Medium |
| **Impact** | Medium |
| **Rating** | 🟡 Monitor |
| **Owner** | Product |

**Description:** Heavy Chi Chat usage could result in unexpected Claude API costs.

**Mitigation:**
- [ ] Implement Smart Router to use cheaper models for simple queries
- [ ] Add token usage tracking per tenant
- [ ] Set monthly usage caps per agency
- [ ] Use Mem0 to avoid redundant queries

**Contingency:** Rate limit heavy users, adjust pricing model.

---

### R-006: Chi Intelligent Chat Extraction Complexity
| Attribute | Value |
|-----------|-------|
| **Category** | Technical |
| **Probability** | Medium |
| **Impact** | High |
| **Rating** | 🟡 Monitor |
| **Owner** | Engineering |

**Description:** Extracting @chi/intelligent-chat from War Room may be more complex than expected.

**Mitigation:**
- [ ] Research War Room codebase before Phase 6
- [ ] Document all Chi dependencies
- [ ] Plan incremental extraction vs rebuild
- [ ] Allocate buffer time (120min task)

**Contingency:** Build simpler chat without Smart Routing for v1, add routing in v1.1.

---

### R-007: Client OAuth Token Expiry
| Attribute | Value |
|-----------|-------|
| **Category** | Operations |
| **Probability** | High |
| **Impact** | Medium |
| **Rating** | 🟡 Monitor |
| **Owner** | Engineering |

**Description:** OAuth tokens expire, causing sync failures if not refreshed proactively.

**Mitigation:**
- [ ] Background job to refresh tokens before expiry
- [ ] Alert users when tokens need manual re-auth
- [ ] Clear UI indication of connection health
- [ ] Encrypt tokens in Supabase Vault

**Contingency:** User-initiated reconnect flow.

---

### R-008: Slack/Gmail Webhook Delivery Failures
| Attribute | Value |
|-----------|-------|
| **Category** | Integration |
| **Probability** | Medium |
| **Impact** | Medium |
| **Rating** | 🟢 Accept |
| **Owner** | Engineering |

**Description:** Missed webhooks could result in messages not appearing in timeline.

**Mitigation:**
- [ ] Implement message deduplication (idempotent processing)
- [ ] Add periodic full sync as backup
- [ ] Log webhook failures to Sentry
- [ ] Signature verification for all webhooks

**Contingency:** Manual sync button for users to pull missing messages.

---

### R-009: dnd-kit Kanban Performance
| Attribute | Value |
|-----------|-------|
| **Category** | Performance |
| **Probability** | Low |
| **Impact** | Low |
| **Rating** | 🟢 Accept |
| **Owner** | Engineering |

**Description:** Large client lists may cause Kanban drag-drop to lag.

**Mitigation:**
- [ ] Implement column pagination (max 10 cards)
- [ ] Use virtualization for long lists
- [ ] Optimize card rendering

**Contingency:** Simpler list view fallback.

---

### R-010: Scope Creep
| Attribute | Value |
|-----------|-------|
| **Category** | Project |
| **Probability** | High |
| **Impact** | High |
| **Rating** | 🔴 Mitigate |
| **Owner** | Product |

**Description:** Chase may request additional features during development.

**Mitigation:**
- [ ] Clear scope document (SCOPE.md) signed off
- [ ] Change request process in SOW
- [ ] v2 backlog for future requests
- [ ] Weekly check-ins to surface requests early

**Contingency:** Price additional work separately, delay to v2.

---

## Risk Summary

| Rating | Count | Action |
|--------|-------|--------|
| 🔴 Block/Mitigate | 1 | Active mitigation required |
| 🟡 Monitor | 5 | Track during development |
| 🟢 Accept | 4 | Acknowledged, contingency ready |

---

## Closed Risks

*No risks closed yet - project in planning phase.*

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Initial risk register with 10 identified risks |

---

*Living Document - Located at docs/05-planning/RISK-REGISTER.md*
