-- Migration: Fix agency table RLS policy
-- Created: 2026-01-08
-- Issue: Settings page returning 500 error
-- Root Cause: agency table RLS uses (auth.jwt() ->> 'agency_id')::uuid which is never set
--
-- This is the LAST table using the broken JWT-based RLS pattern.
-- All other tables were fixed in migrations 002, 003, 013, but agency was missed.
--
-- Pattern: Use user table lookup instead of JWT claims (matches all other tables)

-- Drop the broken JWT-based policy
DROP POLICY IF EXISTS agency_rls ON agency;

-- Create policy using user table lookup (same pattern as client, ticket, etc.)
-- Users can access their own agency record
CREATE POLICY agency_via_user ON agency
    FOR ALL
    USING (
        id IN (
            SELECT agency_id FROM "user" WHERE id = auth.uid()
        )
    );

-- Verification query:
-- SELECT id, name FROM agency;
-- Should return the agency for the authenticated user
