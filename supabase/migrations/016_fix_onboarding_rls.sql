-- Migration: Fix onboarding tables RLS policies
-- Created: 2026-01-10
-- Issue: Onboarding Hub API returning 500 error
-- Root Cause: onboarding tables use (auth.jwt() ->> 'agency_id')::uuid which is never set
--
-- This applies the same fix pattern used in 014_fix_agency_rls.sql
-- Pattern: Use user table lookup instead of JWT claims
--
-- Tables affected:
--   1. onboarding_journey
--   2. intake_form_field
--   3. onboarding_instance
--   4. intake_response
--   5. onboarding_stage_status

-- =============================================================================
-- 1. FIX ONBOARDING_JOURNEY RLS
-- =============================================================================
DROP POLICY IF EXISTS onboarding_journey_rls ON onboarding_journey;

CREATE POLICY onboarding_journey_via_user ON onboarding_journey
    FOR ALL
    USING (
        agency_id IN (
            SELECT agency_id FROM "user" WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- 2. FIX INTAKE_FORM_FIELD RLS
-- =============================================================================
DROP POLICY IF EXISTS intake_form_field_rls ON intake_form_field;

CREATE POLICY intake_form_field_via_user ON intake_form_field
    FOR ALL
    USING (
        agency_id IN (
            SELECT agency_id FROM "user" WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- 3. FIX ONBOARDING_INSTANCE RLS
-- =============================================================================
DROP POLICY IF EXISTS onboarding_instance_rls ON onboarding_instance;

CREATE POLICY onboarding_instance_via_user ON onboarding_instance
    FOR ALL
    USING (
        agency_id IN (
            SELECT agency_id FROM "user" WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- 4. FIX INTAKE_RESPONSE RLS
-- =============================================================================
DROP POLICY IF EXISTS intake_response_rls ON intake_response;

CREATE POLICY intake_response_via_user ON intake_response
    FOR ALL
    USING (
        agency_id IN (
            SELECT agency_id FROM "user" WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- 5. FIX ONBOARDING_STAGE_STATUS RLS
-- =============================================================================
DROP POLICY IF EXISTS onboarding_stage_status_rls ON onboarding_stage_status;

CREATE POLICY onboarding_stage_status_via_user ON onboarding_stage_status
    FOR ALL
    USING (
        agency_id IN (
            SELECT agency_id FROM "user" WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- VERIFICATION QUERIES (run after migration)
-- =============================================================================
--
-- Check policies updated:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('onboarding_journey', 'intake_form_field', 'onboarding_instance',
--                   'intake_response', 'onboarding_stage_status');
--
-- Expected output: all tables should have *_via_user policies
-- =============================================================================
