# AudienceOS Design System

> **Based on:** Linear's design philosophy
> **Created:** 2025-12-31
> **Component Library:** shadcn/ui (Radix primitives)

---

## Design Philosophy

AudienceOS follows Linear's design philosophy: **minimal, functional, and quietly beautiful.** The interface should feel like a professional tool that gets out of the way and lets users focus on their work.

### Core Principles

1. **Clarity over decoration** - Every element serves a purpose
2. **Subtle depth** - Use shadows and layers sparingly but effectively
3. **Motion with meaning** - Animations communicate state, not impress
4. **Density when needed** - Information-rich without feeling cluttered
5. **Dark mode first** - Designed for extended use

---

## Color Palette

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#FFFFFF` | `#0A0A0B` | Page background |
| `--foreground` | `#0A0A0B` | `#FAFAFA` | Primary text |
| `--muted` | `#F4F4F5` | `#18181B` | Subtle backgrounds |
| `--muted-foreground` | `#71717A` | `#A1A1AA` | Secondary text |
| `--border` | `#E4E4E7` | `#27272A` | Dividers, card borders |
| `--ring` | `#3B82F6` | `#3B82F6` | Focus states |

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#3B82F6` | Primary actions, links |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--accent` | `#8B5CF6` | AI features, special states |

### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#22C55E` | Healthy, connected, success |
| `--warning` | `#F59E0B` | Attention needed, yellow health |
| `--destructive` | `#EF4444` | Critical, at-risk, errors |
| `--info` | `#3B82F6` | Informational |

### Health Indicators

| Status | Color | Dot | Badge |
|--------|-------|-----|-------|
| Healthy | `#22C55E` | Green filled | `bg-green-500/10 text-green-500` |
| Warning | `#F59E0B` | Yellow filled | `bg-yellow-500/10 text-yellow-500` |
| At Risk | `#EF4444` | Red filled | `bg-red-500/10 text-red-500` |

---

## Typography

### Font Stack

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `text-xs` | 11px | 400 | 16px | Badges, timestamps |
| `text-sm` | 13px | 400 | 20px | Secondary text, labels |
| `text-base` | 14px | 400 | 22px | Body text (default) |
| `text-lg` | 16px | 500 | 24px | Card titles |
| `text-xl` | 18px | 600 | 28px | Section headers |
| `text-2xl` | 24px | 600 | 32px | Page titles |
| `text-3xl` | 30px | 700 | 38px | Dashboard KPIs |

### Weight Guidelines

- **400 (Regular):** Body text, descriptions
- **500 (Medium):** Labels, card titles, emphasis
- **600 (Semibold):** Section headers, page titles
- **700 (Bold):** Dashboard metrics only

---

## Spacing

### Base Unit

All spacing uses a 4px base unit.

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | - |
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Default inline spacing |
| `space-3` | 12px | Between related elements |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Section spacing |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Large gaps |
| `space-10` | 40px | Section dividers |
| `space-12` | 48px | Major section breaks |

### Component Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Button | `8px 16px` | - |
| Card | `16px` | - |
| Modal | `24px` | - |
| Table cell | `12px 16px` | - |
| Form field | `8px 12px` | `8px` (stacked) |

---

## Shadows

### Elevation System

Linear uses subtle shadows for depth without harsh drop shadows.

| Level | CSS | Usage |
|-------|-----|-------|
| `shadow-none` | `none` | Flat elements |
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | Cards, buttons |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, drawers |

### Dark Mode Shadows

In dark mode, shadows are less visible. Use subtle glows or border emphasis instead:

```css
/* Dark mode card */
.card-dark {
  background: #18181B;
  border: 1px solid #27272A;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.05);
}
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-none` | 0px | - |
| `rounded-sm` | 4px | Buttons, inputs |
| `rounded` | 6px | Cards, badges |
| `rounded-md` | 8px | Modals, large cards |
| `rounded-lg` | 12px | Large containers |
| `rounded-full` | 9999px | Avatars, pills |

---

## Components

### Buttons

```tsx
// Primary - main actions
<Button>Create Client</Button>

// Secondary - alternative actions
<Button variant="secondary">Cancel</Button>

// Ghost - tertiary actions
<Button variant="ghost">View Details</Button>

// Destructive - dangerous actions
<Button variant="destructive">Delete</Button>

// Icon button
<Button size="icon" variant="ghost">
  <MoreHorizontal className="h-4 w-4" />
</Button>
```

#### Button States

| State | Style |
|-------|-------|
| Default | Solid background |
| Hover | Slightly lighter/darker |
| Active | Pressed effect (translateY 1px) |
| Disabled | 50% opacity, no pointer |
| Loading | Spinner replaces text |

### Cards

```tsx
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-lg font-medium">Client Name</CardTitle>
    <CardDescription>Added 3 days ago</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Card Variants

| Variant | Border | Background | Usage |
|---------|--------|------------|-------|
| Default | `border-border` | `bg-card` | Standard cards |
| Elevated | `border-transparent` | `bg-card shadow-sm` | Floating cards |
| Interactive | `hover:border-primary` | `bg-card` | Clickable cards |
| Kanban | `border-border` | `bg-muted/50` | Pipeline cards |

### Badges

```tsx
// Status badges
<Badge variant="success">Healthy</Badge>
<Badge variant="warning">At Risk</Badge>
<Badge variant="destructive">Critical</Badge>

// Info badges
<Badge variant="secondary">5 clients</Badge>
<Badge variant="outline">New</Badge>
```

### Form Elements

```tsx
// Input
<Input placeholder="Search clients..." />

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select stage" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="onboarding">Onboarding</SelectItem>
  </SelectContent>
</Select>

// Checkbox
<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms</Label>
```

---

## Layout Patterns

### Sidebar Navigation

```
┌─────────────────────────────────────────────┐
│ ┌────┐  AudienceOS                          │
│ │Logo│                                      │
│ └────┘                                      │
├─────────────────────────────────────────────┤
│ ▫ Dashboard                                  │
│ ▫ Pipeline                                   │
│ ▪ Clients                    [selected]      │
│ ▫ Intelligence                               │
│ ▫ Tickets                                    │
│ ▫ Knowledge Base                             │
│ ▫ Automations                                │
│ ▫ Integrations                               │
├─────────────────────────────────────────────┤
│ ▫ Settings                                   │
│                                              │
│ ┌──────────────────────┐                     │
│ │ 👤 User Name         │                     │
│ │    user@agency.com   │                     │
│ └──────────────────────┘                     │
└─────────────────────────────────────────────┘
```

- Width: `240px` (collapsible to `64px`)
- Background: `bg-muted` (light) / `bg-zinc-900` (dark)
- Active item: `bg-primary/10 text-primary`

### Content Area

```
┌─────────────────────────────────────────────────┐
│ Page Title                        [Action Btn]  │
├─────────────────────────────────────────────────┤
│ Filter chips: [All] [Active] [At Risk] [+]      │
├─────────────────────────────────────────────────┤
│                                                 │
│   [ Main Content Area ]                         │
│                                                 │
│   - Cards, tables, Kanban boards               │
│   - Max width: 1440px                          │
│   - Padding: 24px                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Drawer/Slide-Over

- Width: `480px` (client details) or `640px` (forms)
- Overlay: `bg-black/50`
- Animation: Slide from right, 200ms
- Close: X button + click outside + Escape key

### Modal/Dialog

- Max width: `sm` (400px), `md` (500px), `lg` (640px)
- Overlay: `bg-black/50`
- Animation: Fade + scale up, 150ms
- Center vertically with max-height constraint

---

## Iconography

### Icon Library

Use **Lucide React** for all icons.

```tsx
import {
  Users,
  LayoutDashboard,
  Settings,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
```

### Icon Sizes

| Context | Size | Class |
|---------|------|-------|
| Inline text | 14px | `h-3.5 w-3.5` |
| Buttons | 16px | `h-4 w-4` |
| Navigation | 18px | `h-[18px] w-[18px]` |
| Empty states | 48px | `h-12 w-12` |

### Icon + Text Alignment

Always use `inline-flex items-center gap-2` for icon-text combinations.

---

## Animation

### Timing Functions

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duration

| Type | Duration | Usage |
|------|----------|-------|
| Micro | 100ms | Hover states |
| Fast | 150ms | Buttons, toggles |
| Normal | 200ms | Modals, drawers |
| Slow | 300ms | Page transitions |

### Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Progressive reveal for AI chat */
@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}
```

---

## Dark Mode

### Implementation

```tsx
// tailwind.config.ts
module.exports = {
  darkMode: "class",
  // ...
}

// Toggle in <html> element
<html className="dark">
```

### Dark Mode Adjustments

| Element | Light | Dark |
|---------|-------|------|
| Background | White | Near-black (#0A0A0B) |
| Cards | White | Zinc-900 |
| Borders | Gray-200 | Zinc-800 |
| Text | Black | White |
| Shadows | Visible | Reduced/glow |

---

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile Considerations

- Sidebar collapses to bottom nav on mobile
- Kanban columns stack vertically
- Drawers become full-screen modals
- Touch targets minimum 44x44px

---

## Accessibility

### WCAG 2.1 AA Compliance

- **Contrast:** All text meets 4.5:1 ratio (7:1 for AAA)
- **Focus:** Visible focus rings on all interactive elements
- **Keyboard:** Full keyboard navigation support
- **Screen readers:** Proper ARIA labels and roles

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

---

## Implementation with shadcn/ui

### Installation

```bash
npx shadcn@latest init
npx shadcn@latest add button card badge input select
```

### Theme Configuration

```ts
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... rest of tokens
      },
    },
  },
}
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Created design system based on Linear philosophy |

---

*Living Document - Located at docs/03-design/DESIGN-SYSTEM.md*
