-- Migration: Add simple INSERT policy for client table
-- Created: 2026-01-10
-- Purpose: Fix "Failed to create client" error in onboarding trigger
--
-- The existing RBAC-based INSERT policy (client_member_scoped_insert) requires
-- complex role/permission joins. This simpler fallback ensures basic INSERTs work.
--
-- TO APPLY: Run this in Supabase SQL Editor

-- =============================================================================
-- CLIENT TABLE: Fallback agency-based INSERT policy
-- =============================================================================

CREATE POLICY IF NOT EXISTS client_agency_insert ON client
FOR INSERT
WITH CHECK (
    agency_id IN (
        SELECT agency_id FROM "user" WHERE id = auth.uid()
    )
);

-- =============================================================================
-- VERIFICATION (run to confirm policy exists)
-- =============================================================================
-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename = 'client'
-- AND cmd = 'INSERT';
