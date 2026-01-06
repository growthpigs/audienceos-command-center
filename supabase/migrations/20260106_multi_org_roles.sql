-- =====================================================================
-- Multi-Org Roles (RBAC) Migration
-- =====================================================================
-- Feature: Role-based access control with granular permissions
-- Spec: features/multi-org-roles.md
-- Date: 2026-01-06
-- =====================================================================

-- =====================================================================
-- 1. CREATE ENUMS
-- =====================================================================

-- Resource enum (all protected resources in the app)
CREATE TYPE resource_type AS ENUM (
  'clients',
  'communications',
  'tickets',
  'knowledge-base',
  'automations',
  'settings',
  'users',
  'billing',
  'roles',
  'integrations',
  'analytics',
  'ai-features'
);

-- Action enum (permission actions)
CREATE TYPE permission_action AS ENUM (
  'read',    -- View data
  'write',   -- Create/edit data
  'delete',  -- Remove data
  'manage'   -- Full control (includes all above + admin actions)
);

-- Client access permission enum (for Members)
CREATE TYPE client_access_permission AS ENUM (
  'read',
  'write'
);

-- =====================================================================
-- 2. CREATE TABLES
-- =====================================================================

-- ---------------------------------------------------------------------
-- PERMISSION Table (System-wide permission definitions)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource resource_type NOT NULL,
  action permission_action NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: each resource+action combination exists once
  CONSTRAINT permission_resource_action_unique UNIQUE (resource, action)
);

COMMENT ON TABLE permission IS 'System-wide permission definitions (not tenant-scoped)';
COMMENT ON COLUMN permission.resource IS 'Protected resource (clients, users, etc.)';
COMMENT ON COLUMN permission.action IS 'Permission action (read, write, delete, manage)';

-- ---------------------------------------------------------------------
-- ROLE Table (Agency-specific roles)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(200),
  is_system BOOLEAN NOT NULL DEFAULT FALSE, -- Built-in roles (Owner, Admin, Manager, Member)
  hierarchy_level INTEGER, -- 1=Owner, 2=Admin, 3=Manager, 4=Member, NULL=custom
  created_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: role names unique per agency
  CONSTRAINT role_agency_name_unique UNIQUE (agency_id, name),

  -- Check constraints
  CONSTRAINT role_hierarchy_valid CHECK (hierarchy_level BETWEEN 1 AND 4 OR hierarchy_level IS NULL),
  CONSTRAINT role_system_hierarchy CHECK (
    (is_system = TRUE AND hierarchy_level IS NOT NULL) OR
    (is_system = FALSE AND hierarchy_level IS NULL)
  )
);

COMMENT ON TABLE role IS 'Agency-specific roles (both system and custom)';
COMMENT ON COLUMN role.is_system IS 'System roles (Owner, Admin, Manager, Member) cannot be deleted';
COMMENT ON COLUMN role.hierarchy_level IS 'Role level: 1=highest (Owner), 4=lowest (Member), NULL=custom';

-- ---------------------------------------------------------------------
-- ROLE_PERMISSION Table (Many-to-many: roles ↔ permissions)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permission(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE, -- Denormalized for RLS
  granted_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: each permission assigned once per role
  CONSTRAINT role_permission_unique UNIQUE (role_id, permission_id)
);

COMMENT ON TABLE role_permission IS 'Permissions assigned to roles';
COMMENT ON COLUMN role_permission.agency_id IS 'Denormalized from role for RLS performance';

-- ---------------------------------------------------------------------
-- MEMBER_CLIENT_ACCESS Table (Client-level access for Members)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agency(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  permission client_access_permission NOT NULL,
  assigned_by UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: each client assigned once per user
  CONSTRAINT member_client_access_unique UNIQUE (user_id, client_id)
);

COMMENT ON TABLE member_client_access IS 'Client-level access restrictions for Members';
COMMENT ON COLUMN member_client_access.permission IS 'read or write access to client';

-- =====================================================================
-- 3. USER TABLE MODIFICATIONS
-- =====================================================================

-- Add new columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES role(id) ON DELETE SET NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN "user".role_id IS 'User role (replaces old role enum)';
COMMENT ON COLUMN "user".is_owner IS 'Agency owner (immutable, one per agency)';

-- =====================================================================
-- 4. CREATE INDEXES
-- =====================================================================

-- Permission indexes
CREATE INDEX IF NOT EXISTS idx_permission_resource ON permission(resource);
CREATE INDEX IF NOT EXISTS idx_permission_action ON permission(action);

-- Role indexes
CREATE INDEX IF NOT EXISTS idx_role_agency ON role(agency_id);
CREATE INDEX IF NOT EXISTS idx_role_is_system ON role(is_system);
CREATE INDEX IF NOT EXISTS idx_role_hierarchy ON role(hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_role_agency_system ON role(agency_id, is_system);

-- Role_permission indexes
CREATE INDEX IF NOT EXISTS idx_role_permission_role ON role_permission(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permission_permission ON role_permission(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permission_agency ON role_permission(agency_id);
CREATE INDEX IF NOT EXISTS idx_role_perm_lookup ON role_permission(role_id, permission_id);

-- Member_client_access indexes
CREATE INDEX IF NOT EXISTS idx_member_access_user ON member_client_access(user_id);
CREATE INDEX IF NOT EXISTS idx_member_access_client ON member_client_access(client_id);
CREATE INDEX IF NOT EXISTS idx_member_access_agency ON member_client_access(agency_id);
CREATE INDEX IF NOT EXISTS idx_member_access_user_client ON member_client_access(user_id, client_id);

-- User table indexes for RBAC
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role_id);
CREATE INDEX IF NOT EXISTS idx_user_is_owner ON "user"(is_owner);
CREATE INDEX IF NOT EXISTS idx_user_agency_owner ON "user"(agency_id, is_owner);

-- =====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on new tables
ALTER TABLE role ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_client_access ENABLE ROW LEVEL SECURITY;

-- Note: permission table is system-wide, no RLS needed (read-only for all authenticated users)

-- ---------------------------------------------------------------------
-- RLS: ROLE table
-- ---------------------------------------------------------------------
CREATE POLICY role_rls ON role FOR ALL
USING (
  agency_id = (
    SELECT agency_id FROM "user"
    WHERE id = auth.uid()
  )
);

-- ---------------------------------------------------------------------
-- RLS: ROLE_PERMISSION table
-- ---------------------------------------------------------------------
CREATE POLICY role_permission_rls ON role_permission FOR ALL
USING (
  agency_id = (
    SELECT agency_id FROM "user"
    WHERE id = auth.uid()
  )
);

-- ---------------------------------------------------------------------
-- RLS: MEMBER_CLIENT_ACCESS table
-- ---------------------------------------------------------------------
CREATE POLICY member_access_rls ON member_client_access FOR ALL
USING (
  agency_id = (
    SELECT agency_id FROM "user"
    WHERE id = auth.uid()
  )
);

-- =====================================================================
-- 6. HELPER FUNCTIONS
-- =====================================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_resource resource_type,
  p_action permission_action
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  -- Check if user's role has the permission
  SELECT EXISTS (
    SELECT 1
    FROM "user" u
    JOIN role r ON u.role_id = r.id
    JOIN role_permission rp ON rp.role_id = r.id
    JOIN permission p ON p.id = rp.permission_id
    WHERE u.id = p_user_id
    AND p.resource = p_resource
    AND (
      p.action = p_action
      OR p.action = 'manage' -- manage implies all actions
      OR (p_action = 'read' AND p.action = 'write') -- write implies read
    )
  ) INTO v_has_permission;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_permission IS 'Check if user has specific permission (considers action hierarchy)';

-- Function to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  resource resource_type,
  action permission_action,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.resource,
    p.action,
    'role' AS source
  FROM "user" u
  JOIN role r ON u.role_id = r.id
  JOIN role_permission rp ON rp.role_id = r.id
  JOIN permission p ON p.id = rp.permission_id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_permissions IS 'Get all effective permissions for a user from their role';

-- =====================================================================
-- 7. TRIGGERS
-- =====================================================================

-- Update updated_at timestamp on role changes
CREATE OR REPLACE FUNCTION update_role_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_updated_at
  BEFORE UPDATE ON role
  FOR EACH ROW
  EXECUTE FUNCTION update_role_timestamp();

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================

-- This migration creates the foundational RBAC schema
-- Next steps:
-- 1. Run seed scripts to populate system roles (TASK-004)
-- 2. Run seed scripts to populate permissions (TASK-005)
-- 3. Migrate existing user.role values to new role_id (TASK-003)
