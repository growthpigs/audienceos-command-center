# AudienceOS - Required Dependencies

> Created: 2025-12-31 (Validator stress test)
> Purpose: Track what's installed vs what needs installing

---

## Current State (v0 Prototype)

### ✅ Already Installed

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.0.10 | Framework |
| react | 19.2.0 | UI library |
| react-dom | 19.2.0 | React DOM |
| recharts | 2.15.4 | Charts |
| react-hook-form | 7.60.0 | Forms |
| zod | 3.25.76 | Validation |
| @radix-ui/* | Various | shadcn/ui primitives |
| lucide-react | 0.454.0 | Icons |
| tailwindcss | 4.1.9 | Styling |
| next-themes | 0.4.6 | Dark mode |
| date-fns | 4.1.0 | Date formatting |
| clsx | 2.1.1 | Class names |
| tailwind-merge | 3.3.1 | Tailwind utilities |

---

## ❌ Missing (Must Install for M1)

### State Management
```bash
pnpm add zustand
pnpm add @tanstack/react-query
```

### Backend / Database
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### Drag & Drop (Kanban)
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### AI Services
```bash
pnpm add @anthropic-ai/sdk
pnpm add @google/generative-ai
```

### Monitoring
```bash
pnpm add @sentry/nextjs
```

---

## Installation Command (All at Once)

```bash
cd /Users/rodericandrews/_PAI/projects/command_center_audience_OS

pnpm add \
  zustand \
  @tanstack/react-query \
  @supabase/supabase-js \
  @supabase/ssr \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @dnd-kit/utilities \
  @anthropic-ai/sdk \
  @google/generative-ai \
  @sentry/nextjs
```

---

## Supabase Local Setup

```bash
# Initialize Supabase in project
npx supabase init

# Start local Supabase
npx supabase start

# After running, you'll get:
# - API URL: http://localhost:54321
# - Anon Key: eyJ...
# - Service Role Key: eyJ...
```

---

## Verification Commands

After installation, verify with:

```bash
# Check all dependencies installed
pnpm list zustand @tanstack/react-query @supabase/supabase-js

# Verify build still works
pnpm run build

# Test Supabase connection
npx supabase status
```

---

*Created during validator stress test - Living Document*
