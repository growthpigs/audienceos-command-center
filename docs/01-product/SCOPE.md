# Scope: Multi-Org Roles & Permissions System

**Last Updated:** 2026-01-08
**Status:** Approved ✅

---

## MVP Features (Phase 1)

Must have for launch:

| Feature | Description | Priority |
|---------|-------------|----------|
| **Role Management System** | Create/edit 4 built-in roles (Owner/Admin/Manager/Member) with hierarchy enforcement | P0 |
| **Permission Matrix UI** | Visual interface for editing permissions per role (8 resources × 3 actions) | P0 |
| **Client Assignment for Members** | UI to assign specific clients to Member role users | P0 |
| **API Middleware Enhancement** | Extend existing with-permission middleware for all 34 endpoints | P0 |
| **RLS Policy Updates** | Database-level security matching middleware permissions | P0 |
| **User Invitation System** | Send invites with pre-assigned roles and client access | P1 |
| **Audit Trail Logging** | Track all permission changes and access attempts | P1 |
| **Owner Protection** | Prevent modification/deletion of Owner role and users | P1 |

---

## OUT OF SCOPE (Not in MVP)

Explicitly NOT building now:

- ❌ **Custom Role Creation** - Building custom roles beyond the 4 built-in types (saves 8-10 DUs)
- ❌ **Cross-Agency Templates** - Sharing role configurations between agencies (complexity not justified)
- ❌ **Time-Limited Permissions** - Expiring access controls (adds significant complexity)
- ❌ **Permission Delegation** - Users granting permissions to other users (security risk)
- ❌ **Approval Workflows** - Multi-step permission request flows (scope creep)
- ❌ **Advanced Audit Analytics** - Permission usage dashboards and analytics (nice-to-have)

---

## Future Phases

### Phase 2 (Post-MVP)
- Custom role creation (up to 10 per agency)
- Advanced audit analytics and permission usage reports
- Bulk user management operations
- Role templates and presets

### Phase 3 (Later)
- Integration with external identity providers (SSO)
- Time-limited permissions with auto-expiry
- Permission request workflows
- Cross-agency role sharing for multi-agency organizations

---

## Technical Boundaries

| Constraint | Decision |
|------------|----------|
| **Platforms** | Web only (existing Next.js app) |
| **Database** | Extend existing Supabase schema (5 new tables max) |
| **Integration** | No external identity providers (internal auth only) |
| **Scale** | Support up to 50 users per agency, 100 clients per agency |
| **Backwards Compatibility** | Must not break existing user sessions or data |
| **UI Framework** | Use existing Linear design system components |

---

## Permission Matrix (8 Resources x 3 Actions)

| Resource | Owner | Admin | Manager | Member |
|----------|-------|-------|---------|--------|
| **clients** | RWD | RWD | RWD | RW (assigned only) |
| **communications** | RWD | RWD | RWD | RW (assigned clients) |
| **tickets** | RWD | RWD | RWD | RW (assigned clients) |
| **documents** | RWD | RWD | RWD | R (assigned clients) |
| **workflows** | RWD | RWD | R | - |
| **integrations** | RWD | RWD | R | - |
| **settings** | RWD | RW | R | - |
| **billing** | RWD | - | - | - |

*R = Read, W = Write, D = Delete*

**Actions per Resource (3 total):**
- read (R)
- write (W)
- delete (D)

---

## Database Changes

**New Tables (max 5):**
1. `role` - Role definitions (owner, admin, manager, member)
2. `permission` - Permission matrix (role_id, resource, action)
3. `user_role` - User to role assignments
4. `member_client_access` - Client-scoped access for Members
5. `audit_log` - Permission changes and access attempts

**Modified Tables:**
- `user` - Add `role_id` field
- `user_client_assignment` - Leverage existing structure for client scoping

---

## Timeline (Dual)

| Phase | DUs | Trad. Weeks | AI Sessions | AI Calendar | Deliverable |
|-------|-----|-------------|-------------|-------------|-------------|
| **MVP** | 28 | 8 weeks | ~8 sessions | ~3 weeks | Full RBAC system with middleware + RLS |
| **Phase 2** | 14 | 4 weeks | ~4 sessions | ~1.5 weeks | Custom roles + notifications |
| **TOTAL** | **42** | **12 weeks** | **~12 sessions** | **~4.5 weeks** | Enterprise RBAC platform |

**MVP DU Breakdown:**
- Database schema + migrations: 5 DUs
- API middleware enhancements: 8 DUs
- RLS policy updates: 4 DUs
- Permission matrix UI components: 6 DUs
- Client assignment interface: 3 DUs
- Audit trail logging: 2 DUs

---

## Success Criteria for MVP

✅ Owners can set up team member in <10 minutes with appropriate role + client access
✅ Members see only assigned clients and features their role permits
✅ 0 data exposure incidents related to permission misconfiguration
✅ All 34 API endpoints enforced with consistent permission model
✅ Audit trail logs all permission changes and access attempts
✅ <5% false permission denials on legitimate requests

---

## Dependencies & Blockers

**Internal Dependencies:**
- TASK-013 Part 2 (middleware enhancements) - ✅ COMPLETE
- Existing auth system - ✅ READY
- Existing RLS policies - ✅ READY

**Blockers:**
- None identified

---

## Next Phase

Approved for: `/B-3 risks` - Identify blockers, dependencies, and mitigation strategies
