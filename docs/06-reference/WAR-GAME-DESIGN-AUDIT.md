# War Game: DesignAuditor Layout Pattern Validation

**Created:** 2026-01-02
**Purpose:** Validate the DesignAuditor skill and systematically fix layout patterns across AudienceOS

---

## Executive Summary

### What We've Learned

1. **Linear Design Philosophy** (from Linear.app's own blog):
   - "Inverted L-shape" navigation pattern
   - Meticulous vertical and horizontal alignment
   - Balance density with clarity
   - "Straightforward and sequential" layouts

2. **Key Principle**: Linear uses VERTICAL LISTS for item collections, not card grids
   - Lists are scannable, one-dimensional
   - Reduces cognitive load
   - Actions inline on the right

3. **Grid is CORRECT for**: Dashboards, KPI metrics, form fields
   - These benefit from side-by-side comparison
   - Uniform content height

---

## Test Results: Integrations Page

### Before (2x2 Card Grid)
```
┌─────────────┐  ┌─────────────┐
│ Slack       │  │ Gmail       │
│ [Connect]   │  │ [Connect]   │
└─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐
│ Google Ads  │  │ Meta Ads    │
│ [Connect]   │  │ [Connect]   │
└─────────────┘  └─────────────┘
```

### After (Linear-Style Vertical List)
```
┌─────────────────────────────────────────┐
│ Connected Services                       │
├─────────────────────────────────────────┤
│ [icon] Slack          Not connected [Connect] │
│─────────────────────────────────────────│
│ [icon] Gmail ⚡MCP    Not connected [Connect] │
│─────────────────────────────────────────│
│ [icon] Google Ads ⚡   Not connected [Connect] │
│─────────────────────────────────────────│
│ [icon] Meta Ads ⚡     Not connected [Connect] │
└─────────────────────────────────────────┘
```

**Result:** ✅ PASS - Layout matches Linear pattern

---

## Components Assessment

### Already Linear-Compliant (3 components)

| Component | Pattern | Status |
|-----------|---------|--------|
| `integrations-view.tsx` | divide-y vertical list | ✅ Fixed |
| `settings/sections/audit-log-section.tsx` | divide-y vertical list | ✅ Good |
| `settings/sections/team-members-section.tsx` | divide-y vertical list | ✅ Good |

### HIGH PRIORITY - Need Fixing (High Visual Impact)

| Component | Current Pattern | Lines | Impact |
|-----------|-----------------|-------|--------|
| `automations-view.tsx` | grid-cols-3 | 393, 457 | HIGH - Main feature |
| `automations/automations-dashboard.tsx` | grid-cols-3 | 263 | HIGH |
| `knowledge-base/knowledge-base-dashboard.tsx` | grid-cols-3 | 272 | HIGH |

### MEDIUM PRIORITY - Evaluate Case-by-Case

| Component | Current Pattern | Lines | Notes |
|-----------|-----------------|-------|-------|
| `onboarding-hub-view.tsx` | grid-cols-3 | 876 | Status cards - might stay grid |
| `intelligence-view.tsx` | grid-cols-4 | 344 | Sync status - evaluate |

### DO NOT CHANGE (Grid is Correct)

| Component | Why Grid is Correct |
|-----------|---------------------|
| `kpi-cards.tsx` | Metrics need side-by-side comparison |
| `dashboard/kpi-grid.tsx` | Dashboard layout |
| `data-health-dashboard.tsx` | Technical metrics |
| `dashboard-view.tsx` | Main dashboard |
| All form field grids | Forms benefit from horizontal pairing |

---

## War Game Test Scenarios

### Scenario 1: Integrations Page (COMPLETED)

**Objective:** Convert 2x2 card grid to vertical list
**File:** `components/integrations-view.tsx`
**Status:** ✅ PASSED

**Test Steps:**
1. Navigate to http://localhost:3000/?view=integrations
2. Verify all integrations display as vertical rows
3. Verify divide-y separators between items
4. Verify Connect buttons aligned right
5. Verify hover states work (hover:bg-secondary/50)
6. Verify responsive behavior on mobile

**Results:**
- [x] Vertical list renders correctly
- [x] Typography correct (11px names, 10px descriptions)
- [x] MCP badges display inline
- [x] Actions aligned right
- [x] Build passes
- [x] Lint passes

---

### Scenario 2: Automations View (PENDING)

**Objective:** Convert workflow cards from 3-column grid to vertical list
**File:** `components/automations-view.tsx`
**Lines:** 393, 457

**Acceptance Criteria:**
- [ ] Active workflows display as vertical list
- [ ] Template workflows display as vertical list
- [ ] Each workflow shows: Icon, Name, Description, Status, Actions
- [ ] Hover reveals edit/configure buttons
- [ ] Build passes
- [ ] Lint passes

**Risk Assessment:**
- Workflow cards have variable content (multiple triggers/actions)
- May need line-clamp on descriptions
- Consider collapsible details

---

### Scenario 3: Knowledge Base Dashboard (PENDING)

**Objective:** Default to list view, keep grid as option
**File:** `components/knowledge-base/knowledge-base-dashboard.tsx`
**Line:** 272

**Acceptance Criteria:**
- [ ] Default view is list (not grid)
- [ ] Grid toggle still works for users who prefer it
- [ ] Document rows show: Icon, Name, Type, Date, Actions
- [ ] Build passes

**Risk Assessment:**
- Users may expect Finder/Explorer style grid
- Keep view toggle, just change default

---

### Scenario 4: Automations Dashboard (PENDING)

**Objective:** Convert automation cards to vertical list
**File:** `components/automations/automations-dashboard.tsx`
**Line:** 263

**Acceptance Criteria:**
- [ ] Automation summary cards display as rows
- [ ] Stats remain visible (runs, success rate)
- [ ] Build passes

---

## DesignAuditor Skill Validation

### Rules That Triggered Correctly

| Rule | Detection | Fix Applied |
|------|-----------|-------------|
| LAYOUT-001 | Grid on settings page | ✅ Converted to vertical list |
| LAYOUT-002 | Individual Card wrappers | ✅ Removed, using divide-y |
| LAYOUT-005 | Multiple Cards for list | ✅ Single Card container |
| LAYOUT-007 | gap-3 spacing | ✅ Using divide-y (no gap) |

### Rules Not Applicable

| Rule | Reason |
|------|--------|
| LAYOUT-003 | Row pattern was implemented during fix |
| LAYOUT-004 | No horizontal status stages on this page |
| LAYOUT-006 | Actions already inline |

---

## Implementation Checklist

### Phase 1: Core Features (Do Now)
- [x] Integrations page
- [ ] Automations view (workflows list)
- [ ] Knowledge base dashboard (default to list)
- [ ] Automations dashboard

### Phase 2: Secondary Views
- [ ] Onboarding hub status cards (evaluate)
- [ ] Intelligence view sync status (evaluate)

### Phase 3: Cleanup
- [ ] Remove unused imports in automations components
- [ ] Fix any types in test files
- [ ] Update DESIGN-SYSTEM.md with layout guidelines

---

## Success Metrics

1. **Visual Consistency:** All list-based views use vertical divide-y pattern
2. **Build Health:** Zero new errors, warnings unchanged
3. **User Experience:** Faster scanning, reduced cognitive load
4. **Maintainability:** Clear pattern for future components

---

## References

- Linear's UI Redesign: https://linear.app/now/how-we-redesigned-the-linear-ui
- LogRocket Linear Design: https://blog.logrocket.com/ux-design/linear-design/
- DesignAuditor Skill: `~/.claude/skills/DesignAuditor/`
- Design Standards: `~/.claude/skills/DesignAuditor/tools/DESIGN-STANDARDS.md`
- Visual Rules: `~/.claude/skills/DesignAuditor/tools/VISUAL-RULES.md`

---

*War Game Created: 2026-01-02*
