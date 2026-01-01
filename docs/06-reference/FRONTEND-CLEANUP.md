# Frontend Cleanup Plan

> **Goal:** C+ to A grade
> **Time:** 3-4 days focused work
> **Status:** Ready for implementation

---

## Current Problems

| Issue | Severity | Location |
|-------|----------|----------|
| Kanban drag-only (no drop) | Critical | `kanban-board.tsx` |
| 9 useState in page.tsx | Critical | `app/page.tsx` |
| No error handling | Critical | Everywhere |
| 5 mega-components (500+ LOC) | High | See list below |
| Zero memoization | High | All components |
| No API layer | High | None exists |
| 8 `any` types | Medium | Various |
| 12 debug statements | Medium | Various |

---

## Day 1: Foundation

### 1.1 Add Zustand

```bash
npm install zustand
```

Create `lib/store.ts`:

```typescript
import { create } from 'zustand'
import { mockClients, mockTickets } from './mock-data'

type View = 'dashboard' | 'pipeline' | 'clients' | 'onboarding' | 'intelligence' | 'tickets' | 'knowledge' | 'automations' | 'integrations' | 'settings'

interface AppState {
  activeView: View
  setActiveView: (view: View) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  clients: Client[]
  selectedClientId: string | null
  setSelectedClient: (id: string | null) => void
  moveClient: (clientId: string, newStage: string) => void

  isDetailSheetOpen: boolean
  detailSheetTab: string
  openDetailSheet: (clientId: string, tab?: string) => void
  closeDetailSheet: () => void

  quickCreateType: 'client' | 'ticket' | 'project' | null
  openQuickCreate: (type: 'client' | 'ticket' | 'project') => void
  closeQuickCreate: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeView: 'pipeline',
  setActiveView: (view) => set({ activeView: view }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  clients: mockClients,
  selectedClientId: null,
  setSelectedClient: (id) => set({ selectedClientId: id }),
  moveClient: (clientId, newStage) => set((state) => ({
    clients: state.clients.map(c => c.id === clientId ? { ...c, stage: newStage } : c)
  })),

  isDetailSheetOpen: false,
  detailSheetTab: 'overview',
  openDetailSheet: (clientId, tab = 'overview') => set({
    selectedClientId: clientId,
    isDetailSheetOpen: true,
    detailSheetTab: tab
  }),
  closeDetailSheet: () => set({ isDetailSheetOpen: false }),

  quickCreateType: null,
  openQuickCreate: (type) => set({ quickCreateType: type }),
  closeQuickCreate: () => set({ quickCreateType: null }),
}))
```

Then refactor `app/page.tsx` to use it:

```typescript
// Replace all useState with:
const { activeView, setActiveView, sidebarCollapsed, ... } = useAppStore()
```

---

### 1.2 Fix Kanban Drag-Drop

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Rewrite `components/kanban-board.tsx`:

```typescript
'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const STAGES = ['Onboarding', 'Installation', 'Audit', 'Live', 'Needs Support', 'Off-Boarding']

export function KanbanBoard() {
  const { clients, moveClient, openDetailSheet } = useAppStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={(e) => {
        setActiveId(null)
        if (e.over) {
          const client = clients.find(c => c.id === e.active.id)
          if (client && client.stage !== e.over.id) {
            moveClient(e.active.id as string, e.over.id as string)
          }
        }
      }}
    >
      <div className="flex gap-4 overflow-x-auto p-4 h-full">
        {STAGES.map(stage => (
          <StageColumn key={stage} stage={stage} clients={clients.filter(c => c.stage === stage)} />
        ))}
      </div>
      <DragOverlay>
        {activeId && <ClientCard client={clients.find(c => c.id === activeId)!} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

function StageColumn({ stage, clients }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return (
    <div ref={setNodeRef} className={cn("w-[300px] rounded-lg bg-muted/50 p-4", isOver && "ring-2 ring-primary")}>
      <h3 className="font-semibold mb-4">{stage} ({clients.length})</h3>
      <div className="space-y-3">
        {clients.map(client => <DraggableCard key={client.id} client={client} />)}
      </div>
    </div>
  )
}

function DraggableCard({ client }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: client.id })
  const style = { transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50")} {...listeners} {...attributes}>
      <ClientCard client={client} />
    </div>
  )
}
```

---

### 1.3 Add Error Boundary

Create `components/error-boundary.tsx`:

```typescript
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false })}>Try again</Button>
        </div>
      )
    }
    return this.props.children
  }
}
```

Wrap views in `page.tsx`:

```typescript
<ErrorBoundary><KanbanBoard /></ErrorBoundary>
```

---

## Day 2: Component Cleanup

### 2.1 Split Mega-Components

| File | LOC | Split Into |
|------|-----|------------|
| `onboarding-hub-view.tsx` | 935 | `components/onboarding/` (5 files) |
| `automations-view.tsx` | 734 | `components/automations/` (4 files) |
| `client-detail-sheet.tsx` | 685 | `components/client-detail/` (4 files) |
| `support-tickets-view.tsx` | 593 | `components/tickets/` (3 files) |
| `intelligence-view.tsx` | 587 | `components/intelligence/` (3 files) |

**Pattern:**
1. Find logical sections (look for comments or tabs)
2. Extract each into its own file
3. Create a custom hook for shared logic
4. Import back into index file

### 2.2 Add Memoization

Wrap split components:

```typescript
import { memo } from 'react'

export const ClientCard = memo(function ClientCard({ client }) {
  return <div>...</div>
})
```

Add useMemo for expensive calculations:

```typescript
const clientsByStage = useMemo(() =>
  STAGES.reduce((acc, stage) => {
    acc[stage] = clients.filter(c => c.stage === stage)
    return acc
  }, {}),
[clients])
```

---

## Day 3: API Layer

### 3.1 Create API Client

Create `lib/api.ts`:

```typescript
const API_BASE = '/api/v1'

export const api = {
  clients: {
    list: () => fetch(`${API_BASE}/clients`).then(r => r.json()),
    get: (id: string) => fetch(`${API_BASE}/clients/${id}`).then(r => r.json()),
    create: (data) => fetch(`${API_BASE}/clients`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    move: (id, stage) => fetch(`${API_BASE}/clients/${id}/move`, { method: 'POST', body: JSON.stringify({ to_stage: stage }) }).then(r => r.json()),
  },
  tickets: {
    list: () => fetch(`${API_BASE}/tickets`).then(r => r.json()),
    create: (data) => fetch(`${API_BASE}/tickets`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
  },
}
```

### 3.2 Create Route Stubs

Create `app/api/v1/clients/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { mockClients } from '@/lib/mock-data'

let clients = [...mockClients]

export async function GET() {
  return NextResponse.json({ data: clients })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newClient = { id: `client-${Date.now()}`, ...body, stage: 'Onboarding' }
  clients.push(newClient)
  return NextResponse.json({ data: newClient }, { status: 201 })
}
```

---

## Day 4: Polish

### 4.1 Remove Debug Code

```bash
grep -rn "console.log\|alert(" components/ app/ --include="*.tsx"
```

Remove all 12 instances.

### 4.2 Fix TypeScript

Find `any` types:

```bash
grep -rn ": any" components/ lib/ --include="*.ts" --include="*.tsx"
```

Replace with proper types (8 instances).

### 4.3 Add Validation

Create `lib/validations.ts`:

```typescript
import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(2),
  tier: z.enum(['Core', 'Enterprise']),
})

export const createTicketSchema = z.object({
  clientId: z.string(),
  subject: z.string().min(5),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
})
```

---

## Checklist Before Done

- [ ] Kanban drag-drop works between all stages
- [ ] No useState in page.tsx (all in store)
- [ ] Error boundary catches crashes
- [ ] No component over 300 LOC
- [ ] All components memoized
- [ ] API routes return JSON
- [ ] No `alert()` or debug `console.log`
- [ ] No `any` types
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

---

## Commands

```bash
# Install deps
npm install zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

---

*Living document — update as cleanup progresses*
