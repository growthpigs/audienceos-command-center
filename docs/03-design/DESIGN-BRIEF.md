# AudienceOS Command Center - Design Brief

> **Design System Reference:** Linear (linear.app)
> **Source:** Mobbin design screenshots + Linear official brand guidelines
> **Created:** 2025-12-31

---

## 1. Design Philosophy

Linear's design follows a **minimal, professional B2B SaaS aesthetic** with:
- Clean, uncluttered interfaces
- Clear visual hierarchy
- Subtle depth through shadows (no heavy glassmorphism)
- "Inverted L-shape" layout (sidebar + top bar framing content)
- LCH color system for perceptually uniform colors

---

## 2. Color Palette

### 2.1 Brand Colors (from Mobbin)

| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| **Indigo** | `#5E6AD2` | 94, 106, 210 | Primary accent, buttons, links |
| **Woodsmoke** | `#08090A` | 8, 9, 10 | Dark mode background, text |
| **Oslo Gray** | `#8A8F98` | 138, 143, 152 | Secondary text, icons |
| **Black Haze** | `#F7F8F8` | 247, 248, 248 | Light mode background |
| **White** | `#FFFFFF` | 255, 255, 255 | Cards, surfaces |

### 2.2 Extended Palette (from Linear Brand)

| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| **Mercury White** | `#F4F5F8` | 244, 245, 248 | Page backgrounds |
| **Nordic Gray** | `#222326` | 35, 35, 38 | Dark surfaces |

### 2.3 Semantic Colors

| Purpose | Light Mode | Dark Mode | Usage |
|---------|------------|-----------|-------|
| **Primary** | `#5E6AD2` | `#5E6AD2` | Buttons, links, focus rings |
| **Success** | `#4CAF50` | `#66BB6A` | Done status, success states |
| **Warning** | `#F59E0B` | `#FBBF24` | High priority, in-progress |
| **Error** | `#EF4444` | `#F87171` | Errors, destructive actions |
| **Info** | `#3B82F6` | `#60A5FA` | Information, updates |

### 2.4 Status Colors (observed from screenshots)

| Status | Color | Indicator |
|--------|-------|-----------|
| Todo | Gray | Empty circle |
| In Progress | Yellow/Orange | Partial circle |
| Done | Green | Checkmark |
| Backlog | Gray | Dashed circle |
| Cancelled | Gray | X mark |

### 2.5 Label/Tag Colors

Linear uses muted, pastel-like colors for labels:
- Purple/Violet: `#7C3AED` (Improvement)
- Blue: `#3B82F6` (3rd Party, Feature)
- Yellow: `#F59E0B` (Bug)
- Green: `#10B981` (Documentation)
- Pink: `#EC4899` (Design)
- Gray: `#6B7280` (Default)

---

## 3. Typography

### 3.1 Font Family

| Usage | Font | Fallback |
|-------|------|----------|
| **Headings** | Inter Display | system-ui, sans-serif |
| **Body** | Inter | system-ui, sans-serif |
| **Monospace** | JetBrains Mono | Menlo, monospace |

### 3.2 Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **Display** | 32px | 600 | 1.2 | -0.02em | Page titles |
| **Title 1** | 24px | 600 | 1.3 | -0.01em | Section headers |
| **Title 2** | 20px | 600 | 1.3 | -0.01em | Card titles |
| **Title 3** | 16px | 600 | 1.4 | 0 | Subsection headers |
| **Body Large** | 16px | 400 | 1.5 | 0 | Descriptions |
| **Body** | 14px | 400 | 1.5 | 0 | Default body text |
| **Body Small** | 13px | 400 | 1.5 | 0 | Secondary text |
| **Caption** | 12px | 400 | 1.4 | 0.01em | Labels, timestamps |
| **Overline** | 11px | 500 | 1.4 | 0.05em | Section labels |

### 3.3 Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, navigation items |
| Semibold | 600 | Headings, buttons |

---

## 4. Spacing System

### 4.1 Base Unit

**Base unit: 4px** - All spacing values are multiples of 4px.

### 4.2 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | None |
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Compact spacing |
| `--space-3` | 12px | Default gap |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 20px | Section gaps |
| `--space-6` | 24px | Large gaps |
| `--space-8` | 32px | Section padding |
| `--space-10` | 40px | Page margins |
| `--space-12` | 48px | Large sections |
| `--space-16` | 64px | Major sections |

### 4.3 Component Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Button (sm) | 6px 12px | - |
| Button (md) | 8px 16px | - |
| Button (lg) | 12px 24px | - |
| Input field | 8px 12px | - |
| Card | 16px | - |
| Modal | 24px | 16px |
| Sidebar item | 8px 12px | 8px |
| List item | 8px 16px | - |
| Badge/Tag | 2px 8px | - |

---

## 5. Layout Structure

### 5.1 Application Shell

```
+--------------------------------------------------+
|  [Logo]  [Search]              [Avatars] [User]  | <- Header: 48-56px
+----------+---------------------------------------+
|          |                                       |
| Sidebar  |           Main Content                |
| 200-240px|           (flexible)                  |
|          |                                       |
|          +-------------------+-------------------+
|          |   Content Area    |  Properties Panel |
|          |   (flexible)      |     220-280px     |
|          |                   |                   |
+----------+-------------------+-------------------+
```

### 5.2 Key Dimensions

| Element | Width/Height | Notes |
|---------|--------------|-------|
| Sidebar | 200-240px | Collapsible |
| Properties Panel | 220-280px | Right side |
| Header | 48-56px | Fixed |
| Modal (sm) | 400px | Confirmations |
| Modal (md) | 560px | Forms |
| Modal (lg) | 720px | Complex forms |
| Dropdown menu | 240-320px | Variable |

### 5.3 Responsive Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| Mobile | < 768px | Sidebar hidden, stacked layout |
| Tablet | 768-1024px | Collapsible sidebar |
| Desktop | 1024-1440px | Full layout |
| Wide | > 1440px | Max-width container |

---

## 6. Component Specifications

### 6.1 Buttons

#### Primary Button
```css
background: #5E6AD2;
color: #FFFFFF;
font-size: 14px;
font-weight: 500;
padding: 8px 16px;
border-radius: 6px;
border: none;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Hover */
background: #4F5BC4;

/* Active */
background: #454FA8;

/* Disabled */
background: #5E6AD2;
opacity: 0.5;
cursor: not-allowed;
```

#### Secondary Button (Ghost)
```css
background: transparent;
color: #222326;
font-size: 14px;
font-weight: 500;
padding: 8px 16px;
border-radius: 6px;
border: 1px solid #E5E7EB;

/* Hover */
background: #F4F5F8;
```

#### Destructive Button
```css
background: #EF4444;
color: #FFFFFF;
/* Same structure as primary */
```

### 6.2 Input Fields

```css
/* Base Input */
background: #FFFFFF;
border: 1px solid #E5E7EB;
border-radius: 6px;
padding: 8px 12px;
font-size: 14px;
color: #222326;
min-height: 36px;

/* Placeholder */
color: #8A8F98;

/* Focus */
border-color: #5E6AD2;
box-shadow: 0 0 0 3px rgba(94, 106, 210, 0.15);

/* Error */
border-color: #EF4444;
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
```

### 6.3 Badges/Labels

```css
/* Base Badge */
display: inline-flex;
align-items: center;
padding: 2px 8px;
font-size: 12px;
font-weight: 500;
border-radius: 4px;
gap: 4px;

/* Status Badge (In Progress - Yellow) */
background: rgba(245, 158, 11, 0.15);
color: #B45309;

/* Label Badge (Purple - Improvement) */
background: rgba(124, 58, 237, 0.15);
color: #6D28D9;

/* Priority Badge (High) */
background: rgba(239, 68, 68, 0.1);
color: #DC2626;
```

### 6.4 Cards

```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
border-radius: 8px;
padding: 16px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

/* Hover (for interactive cards) */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
```

### 6.5 Dropdown Menus

```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
border-radius: 8px;
padding: 4px;
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
min-width: 200px;

/* Menu Item */
padding: 8px 12px;
border-radius: 4px;
font-size: 14px;
cursor: pointer;

/* Menu Item Hover */
background: #F4F5F8;

/* Menu Item with Icon */
display: flex;
align-items: center;
gap: 8px;

/* Separator */
height: 1px;
background: #E5E7EB;
margin: 4px 0;
```

### 6.6 Modals/Dialogs

```css
/* Overlay */
background: rgba(0, 0, 0, 0.5);

/* Modal Container */
background: #FFFFFF;
border-radius: 12px;
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
padding: 24px;
max-height: 90vh;
overflow-y: auto;

/* Modal Header */
font-size: 18px;
font-weight: 600;
margin-bottom: 16px;

/* Modal Footer */
display: flex;
justify-content: flex-end;
gap: 12px;
margin-top: 24px;
padding-top: 16px;
border-top: 1px solid #E5E7EB;
```

### 6.7 Avatars

```css
/* Small (20px) */
width: 20px;
height: 20px;
border-radius: 50%;

/* Medium (32px) */
width: 32px;
height: 32px;
border-radius: 50%;

/* Large (40px) */
width: 40px;
height: 40px;
border-radius: 50%;

/* Avatar Stack */
display: flex;
/* Negative margin for overlap */
img:not(:first-child) {
  margin-left: -8px;
}
/* Border for separation */
border: 2px solid #FFFFFF;
```

### 6.8 Tables/Lists

```css
/* Table Header */
background: #F9FAFB;
font-size: 12px;
font-weight: 500;
color: #6B7280;
padding: 8px 16px;
text-transform: uppercase;
letter-spacing: 0.05em;

/* Table Row */
padding: 12px 16px;
border-bottom: 1px solid #E5E7EB;

/* Table Row Hover */
background: #F9FAFB;

/* List Item */
padding: 8px 16px;
display: flex;
align-items: center;
gap: 12px;
border-radius: 6px;

/* List Item Hover */
background: #F4F5F8;
```

---

## 7. Sidebar Navigation

### 7.1 Structure

```css
/* Sidebar Container */
width: 240px;
background: #FAFAFA;
border-right: 1px solid #E5E7EB;
padding: 12px;
display: flex;
flex-direction: column;
height: 100vh;
```

### 7.2 Navigation Items

```css
/* Nav Item */
display: flex;
align-items: center;
padding: 8px 12px;
border-radius: 6px;
font-size: 14px;
font-weight: 400;
color: #374151;
gap: 8px;
cursor: pointer;

/* Nav Item Icon */
width: 16px;
height: 16px;
color: #6B7280;

/* Nav Item Hover */
background: #F3F4F6;

/* Nav Item Active */
background: #E5E7EB;
font-weight: 500;

/* Section Header */
font-size: 11px;
font-weight: 500;
color: #9CA3AF;
text-transform: uppercase;
letter-spacing: 0.05em;
padding: 8px 12px;
margin-top: 16px;
```

### 7.3 Workspace Selector

```css
/* Workspace Button */
display: flex;
align-items: center;
gap: 8px;
padding: 8px 12px;
border-radius: 6px;
background: transparent;

/* Workspace Avatar */
width: 24px;
height: 24px;
border-radius: 6px;
background: #222326;

/* Workspace Name */
font-size: 14px;
font-weight: 500;
```

---

## 8. Icons

### 8.1 Icon Sizes

| Size | Pixels | Usage |
|------|--------|-------|
| XS | 12px | Inline with text |
| SM | 16px | Navigation, lists |
| MD | 20px | Buttons, inputs |
| LG | 24px | Headers, actions |
| XL | 32px | Empty states |

### 8.2 Icon Style

- **Style:** Outline (not filled)
- **Stroke width:** 1.5px
- **Library recommendation:** Lucide Icons or Heroicons (outline variant)
- **Color:** Inherit from parent (typically `#6B7280` for secondary)

---

## 9. Animation & Transitions

### 9.1 Duration

| Type | Duration | Usage |
|------|----------|-------|
| Fast | 100ms | Button states |
| Normal | 150ms | Hover effects |
| Medium | 200ms | Dropdown open |
| Slow | 300ms | Modal transitions |

### 9.2 Easing

```css
/* Default easing */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Enter */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

/* Exit */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
```

### 9.3 Common Transitions

```css
/* Hover states */
transition: all 150ms ease;

/* Focus ring */
transition: box-shadow 100ms ease;

/* Modal overlay */
transition: opacity 200ms ease;

/* Sidebar collapse */
transition: width 300ms ease;
```

---

## 10. Shadows & Elevation

### 10.1 Shadow Scale

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | none | Flat elements |
| 1 | `0 1px 2px rgba(0,0,0,0.05)` | Cards, buttons |
| 2 | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Raised cards |
| 3 | `0 4px 6px rgba(0,0,0,0.07)` | Hover states |
| 4 | `0 10px 15px rgba(0,0,0,0.1)` | Dropdowns |
| 5 | `0 25px 50px rgba(0,0,0,0.25)` | Modals |

---

## 11. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, tags |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards, dropdowns |
| `--radius-xl` | 12px | Modals |
| `--radius-full` | 9999px | Avatars, pills |

---

## 12. Dark Mode Adaptations

When implementing dark mode:

### 12.1 Background Colors

| Element | Light | Dark |
|---------|-------|------|
| Page bg | `#F7F8F8` | `#0D0D0D` |
| Sidebar bg | `#FAFAFA` | `#141414` |
| Card bg | `#FFFFFF` | `#1A1A1A` |
| Input bg | `#FFFFFF` | `#222222` |
| Hover bg | `#F4F5F8` | `#2A2A2A` |

### 12.2 Text Colors

| Element | Light | Dark |
|---------|-------|------|
| Primary text | `#222326` | `#F4F5F8` |
| Secondary text | `#6B7280` | `#9CA3AF` |
| Muted text | `#9CA3AF` | `#6B7280` |

### 12.3 Border Colors

| Element | Light | Dark |
|---------|-------|------|
| Default border | `#E5E7EB` | `#2E2E2E` |
| Strong border | `#D1D5DB` | `#404040` |

---

## 13. Accessibility Requirements

### 13.1 Color Contrast

- Text on backgrounds: minimum 4.5:1 ratio (WCAG AA)
- Large text: minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio for boundaries

### 13.2 Focus States

All interactive elements must have visible focus indicators:

```css
/* Focus ring */
outline: none;
box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #5E6AD2;
```

### 13.3 Touch Targets

- Minimum touch target: 44x44px
- Minimum clickable area: 36x36px

---

## 14. Implementation Notes

### 14.1 CSS Variables Setup

```css
:root {
  /* Colors */
  --color-primary: #5E6AD2;
  --color-primary-hover: #4F5BC4;
  --color-background: #F7F8F8;
  --color-surface: #FFFFFF;
  --color-text-primary: #222326;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Inter Display', var(--font-sans);
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-unit: 4px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 100ms ease;
  --transition-normal: 150ms ease;
  --transition-slow: 300ms ease;
}
```

### 14.2 Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5E6AD2',
          hover: '#4F5BC4',
          active: '#454FA8',
        },
        surface: '#FFFFFF',
        background: '#F7F8F8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
}
```

---

## 15. Reference Screenshots

The following Linear screens from Mobbin were analyzed:

1. **Issue Detail View** - Three-column layout with sidebar, main content, properties panel
2. **Issue List View** - Grouped issues by status with table-like rows
3. **Create Issue Modal** - Form fields, file attachments, label badges
4. **Inbox/Notifications** - Activity feed, comments, @mentions
5. **Filter Dropdown** - Menu with icons and grouped options
6. **Workspace Onboarding** - Form inputs, primary buttons, progress indicators

---

## 16. Mobbin Reference Links

- **Linear on Mobbin:** https://mobbin.com/apps/linear-web-9591f534-b2b8-40aa-a91a-fdbe183d0a5f
- **Linear Brand Colors:** https://mobbin.com/colors/brand/linear
- **Linear Brand Guidelines:** https://linear.app/brand

---

*This design brief provides the foundation for implementing AudienceOS Command Center with Linear's visual language. All measurements and specifications are derived from Mobbin screenshots and Linear's official documentation.*
