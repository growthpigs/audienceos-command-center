-- ============================================================================
-- Migration: Communication dedup + Audit log + Fix soft-delete constraints
-- Date: 2026-02-09
--
-- 1. Adds unique constraint on communication(agency_id, message_id) for dedup.
-- 2. Creates audit_log table for RBAC audit service (US-015, US-016).
-- 3. Fixes client_slack_channel unique constraints to be partial (active only),
--    so soft-deleted rows don't block re-linking channels.
-- ============================================================================

-- ── 1. Communication dedup constraint ────────────────────────────────────────

-- Remove any duplicate (agency_id, message_id) rows before adding constraint
-- Keep the most recently created row in each duplicate group
DELETE FROM communication
WHERE id NOT IN (
  SELECT DISTINCT ON (agency_id, message_id) id
  FROM communication
  ORDER BY agency_id, message_id, created_at DESC
);

-- Add unique constraint for insert dedup
CREATE UNIQUE INDEX IF NOT EXISTS idx_communication_agency_message
  ON communication(agency_id, message_id);

-- ── 2. Audit log table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  permission_action VARCHAR(50),
  result VARCHAR(20) NOT NULL,
  reason TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_agency_timestamp
  ON audit_log(agency_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user
  ON audit_log(agency_id, user_id, timestamp DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_rls ON audit_log FOR ALL
  USING (agency_id IN (
    SELECT agency_id FROM "user" WHERE id = auth.uid()
  ));

-- ── 3. Fix client_slack_channel slack_channel_id constraint ─────────────────
-- Problem: UNIQUE(agency_id, slack_channel_id) blocks re-linking a channel
-- after soft-delete (is_active=false row still holds the constraint).
-- Fix: make ONLY the slack_channel_id constraint partial (active records only).
-- Keep (agency_id, client_id) as full constraint — upsert depends on it.

-- Drop only the slack_channel_id constraint
ALTER TABLE client_slack_channel
  DROP CONSTRAINT IF EXISTS client_slack_channel_agency_id_slack_channel_id_key;

-- Recreate as partial unique index (only active records can conflict)
CREATE UNIQUE INDEX IF NOT EXISTS idx_csc_active_agency_channel
  ON client_slack_channel(agency_id, slack_channel_id) WHERE is_active = true;
