# Unified Platform (AudienceOS + RevOS)

**Status:** In Development
**Last Updated:** 2026-01-21
**Branch:** `feature/unified-platform`

## Overview

Merge RevOS marketing automation capabilities into the AudienceOS Command Center, creating a unified platform with app switching.

## Architecture

### App Switcher

```
┌─────────────────────────────────────────┐
│ Sidebar                                 │
├─────────────────────────────────────────┤
│ [AppSwitcher] ← Click to switch apps    │
│   ├── AudienceOS (Client Management)    │
│   └── RevOS (Marketing Automation)      │
├─────────────────────────────────────────┤
│ Navigation (changes per app)            │
└─────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `stores/app-store.ts` | Zustand store for active app state |
| `components/app-switcher.tsx` | Dropdown UI component |
| `components/linear/sidebar.tsx` | Conditional navigation |

### State Management

```typescript
// stores/app-store.ts
type AppId = 'audienceos' | 'revos'

// Uses Zustand persist with skipHydration
// to prevent SSR/client mismatch
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        activeApp: 'audienceos',
        setActiveApp: (app) => set({ activeApp: app }),
        // ...
      }),
      { name: 'unified-platform-app', skipHydration: true }
    )
  )
)
```

## Navigation Per App

### AudienceOS
- Dashboard
- Pipeline
- Clients
- Onboarding
- Support
- Intelligence
- Knowledge Base
- Automations
- Integrations
- Settings

### RevOS
- Dashboard
- Campaigns
- Content
- Outreach
- Cartridges
- Analytics
- Integrations
- Settings

## Current State

### 2026-01-21
- Created app switcher UI component
- Implemented Zustand store with localStorage persistence
- Fixed SSR hydration mismatch with `skipHydration: true`
- Updated sidebar to show conditional navigation
- Deployed to Preview: `v0-audience-os-command-center-3ljtuj9jf.vercel.app`
- Set up 11 environment variables for Preview deployment

## Deployment

### Preview (Development)
- **Team:** `rodericandrews-4022s-projects`
- **URL:** Dynamic per deployment (e.g., `-3ljtuj9jf.vercel.app`)
- **Env vars:** Manually configured (see RUNBOOK.md)

### Production
- **Team:** TBD (Agro Bros workspace access issue pending)
- **URL:** `v0-audience-os-command-center-sage.vercel.app`

## Known Issues

1. **Google OAuth on Preview** - Preview URLs not registered in Google Cloud Console
2. **Agro Bros Vercel Access** - Lost access to production workspace (support ticket sent)

## Next Steps

1. Complete Week 1 security hardening (see `docs/05-planning/UNIFIED-EXECUTION-PLAN.md`)
2. Port RevOS database schema
3. Implement HGC adapter for dual AI backends
4. Create RevOS-specific pages (Campaigns, Content, Outreach, Cartridges)

## Related Documents

| Document | Location |
|----------|----------|
| Execution Plan | `docs/05-planning/UNIFIED-EXECUTION-PLAN.md` |
| CTO Decision | `docs/05-planning/CTO-DECISION-2026-01-20.md` |
| HGC Transplant | `features/hgc-transplant.md` |
