-- =====================================================================
-- Fix: Grant Members ai-features:write permission
-- =====================================================================
-- Purpose: Allow Members to use the chat feature (POST /api/v1/chat)
-- Root cause: Chat API requires ai-features:write but Members only had read
-- Date: 2026-01-09
-- Applied: 2026-01-09 via Supabase SQL Editor
-- =====================================================================

-- Grant ai-features:write to all Member roles (hierarchy_level = 4)
INSERT INTO role_permission (role_id, permission_id, agency_id)
SELECT r.id, p.id, r.agency_id
FROM role r
CROSS JOIN permission p
WHERE r.is_system = TRUE
  AND r.hierarchy_level = 4
  AND p.resource = 'ai-features'
  AND p.action = 'write'
ON CONFLICT (role_id, permission_id) DO NOTHING;
