# DARK-MODE

**Status:** 🟢 APPROVED → IN PROGRESS
**Created:** 2026-01-08
**Approved:** 2026-01-08

---

## Problem

Users expect light/dark mode toggle in modern SaaS apps. AudienceOS needs theme switching that persists across devices.

---

## Solution

Add light/dark mode toggle in Settings with:
- Database persistence (user_preference table)
- Linear's dark mode design system
- ThemeProvider integration (next-themes already installed)
- 28 Linear components updated with dark: classes

---

## ICE-T Score

| Metric | Score | Rationale |
|--------|-------|-----------|
| Impact | 7/10 | Expected feature, improves UX, not critical |
| Confidence | 9/10 | next-themes installed, Linear design documented |
| Ease | 6/10 | 28 components to update, DB migration needed |
| **Time** | 3-4 sessions | Extract colors, DB work, component updates, testing |

**DU Estimate:** 6-7 DU (full) | 3-4 DU (80/20)
**ICE Score:** 38 (7×9×6÷10)

---

## 80/20 Breakdown

### 80% Benefit (3-4 DU)

**Core functionality that delivers most value:**

1. **Setup + DB** (0.5 DU)
   - Add `theme` column to `user_preference` table
   - Wire ThemeProvider to layout
   - Settings toggle UI + API endpoint

2. **Extract Dark Mode Colors** (1 DU)
   - Use Claude in Chrome on Mobbin Linear dark mode examples
   - Extract color tokens (bg, text, borders, accents)
   - Document in Tailwind config

3. **Top 10 Components** (2 DU)
   - Update most-used Linear components:
     - `linear-button`, `linear-input`, `linear-card`
     - `linear-dialog`, `linear-dropdown-menu`, `linear-table`
     - `linear-sidebar`, `linear-tabs`, `linear-badge`, `linear-avatar`
   - App shell (layout, nav, header)

4. **Testing** (0.5 DU)
   - Toggle works, persists across sessions
   - Core UI readable in both modes

### Remaining 20% (3 DU)

**Polish and completeness:**

- Update remaining 18 Linear components
- Fine-tune exact color matches to Linear's design
- Edge cases (charts, toasts, modals)
- Cross-browser testing
- Mobile responsive tweaks

---

## Action Plan (80/20 First)

### Phase 1: Mobbin Extraction (1 DU)
1. Open Claude in Chrome
2. Navigate to Mobbin Linear dark mode folder
3. Extract color system:
   - Background colors (primary, secondary, tertiary)
   - Text colors (primary, secondary, muted)
   - Border colors (default, subtle, strong)
   - Accent colors (purple, hover states)
4. Output as Tailwind-ready config

### Phase 2: DB + API (0.5 DU)
1. Migration: Add `theme` enum column to `user_preference`
2. Update type definitions
3. API: Extend PATCH `/api/v1/users/[id]/preferences`
4. Test with curl/Postman

### Phase 3: Settings Toggle (0.5 DU)
1. Add toggle component to `/client/settings/general`
2. Wire to API
3. Update `<html class="dark">` on toggle
4. Test persistence

### Phase 4: Top 10 Components (2 DU)
1. Apply `dark:` classes based on Mobbin colors
2. Test each component in Storybook or dev
3. Verify no regressions in light mode

### Phase 5: Validation (0.5 DU)
1. End-to-end test: Toggle → Persist → Load
2. Visual QA on key pages
3. Verify all top 10 components render correctly

---

## Acceptance Criteria

- [ ] Theme toggle in Settings UI
- [ ] Theme persists to DB (`user_preference.theme`)
- [ ] Theme loads on app startup
- [ ] Top 10 Linear components have dark mode styles
- [ ] App shell (nav, sidebar, header) supports dark mode
- [ ] No visual regressions in light mode
- [ ] Toggle works without page refresh
- [ ] Default theme is light for new users

---

## Implementation Notes

### Session 1 (2026-01-08)

**Started:** Created feature branch `feature/dark-mode-toggle`

**Next Steps:**
1. Use Claude in Chrome to extract Linear dark colors from Mobbin
2. Create DB migration for `theme` column
3. Update TypeScript types
4. Begin implementing toggle in Settings

---

## Technical Decisions

**Storage:** Database (`user_preference.theme`) for cross-device persistence
**Library:** next-themes (already installed in package.json)
**Default:** Light mode for new users
**Design:** Linear's dark mode colors (extract from Mobbin)
**Scope:** 28 components in `components/linear/` directory

---

## Related Files

- `components/linear/` - 28 components to update
- `app/layout.tsx` - ThemeProvider wrapper
- `app/api/v1/users/[id]/preferences/route.ts` - API endpoint
- `supabase/migrations/` - Theme column migration
- `tailwind.config.ts` - Dark mode color tokens
