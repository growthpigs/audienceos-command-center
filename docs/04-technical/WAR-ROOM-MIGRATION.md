# War Room → AudienceOS Migration Guide

> Created: 2025-12-31
> Purpose: Document component portability from War Room (React/Vite) to AudienceOS (Next.js App Router)

---

## Overview

War Room is built with **React + Vite** (client-side SPA).
AudienceOS is **Next.js 15 App Router** (hybrid server/client).

This creates compatibility considerations that must be addressed.

---

## Components to Port

| Component | Source Path | Complexity | Notes |
|-----------|-------------|------------|-------|
| ~~Glass CSS~~ | ~~`client/src/index.css:60-244`~~ | ❌ Skipped | Using Linear Design System instead |
| Toast System | `war-room/client/src/hooks/use-toast.ts` | ✅ Easy | Already client-side hooks |
| IntelligentChat | `war-room/client/src/components/IntelligentChat.tsx` | ❌ HARD | Needs 6+ service rewrites |
| GeminiFileSearchService | `war-room/server/services/geminiFileSearchService.ts` | ✅ Easy | Server-only |

---

## 1. Glass CSS - SKIPPED

**Decision:** Not importing Glass CSS from War Room.

**Reason:** Mobbin research identified Linear's design system as better fit for B2B SaaS. Using Linear's minimal, professional aesthetic instead of heavy glassmorphism.

**Reference:** See `docs/03-design/DESIGN-BRIEF.md` for the Linear design system specifications.

---

## 2. Toast System (Easy)

### Source Files
- `client/src/hooks/use-toast.ts`
- `client/src/components/ui/toast.tsx`
- `client/src/components/ui/toaster.tsx`

### Migration Steps
1. Copy files to `hooks/` and `components/ui/`
2. Already uses React hooks (client-side by nature)
3. In Next.js, hooks auto-detect as client components
4. Add to root layout: `<Toaster />`

### Minimal Changes
```typescript
// use-toast.ts - may need this at top for Next.js
"use client";
```

---

## 3. IntelligentChat → Standalone Package Extraction

### Source
```
war-room/client/src/components/IntelligentChat.tsx (~2700 LOC)
```

### 🎯 STRATEGY: Extract to Reusable Package

**Goal:** Create `@chi/intelligent-chat` - a framework-agnostic chat component usable across:
- AudienceOS (Next.js App Router)
- War Room (React/Vite)
- Future projects

### Valuable Core Logic to Extract

From analysis of IntelligentChat.tsx:

| Feature | Lines | Worth Extracting |
|---------|-------|------------------|
| Progressive Reveal | 1286-1360 | ✅ AbortController + batched char reveal |
| Citation System | 86-100+ | ✅ Source types, document linking |
| SSE Streaming | 1578-1680 | ✅ Direct endpoint bypass for streaming |
| Follow-up Questions | 1354+ | ✅ Suggested prompts after response |
| Mobile Detection | 23-37 | ⚠️ Simple, can rebuild |

### Incompatible Imports (Must Abstract)

```typescript
// Lines 5-17 - THESE BECOME PROPS/CALLBACKS
import { useNavigate, useLocation } from 'react-router-dom';  // → onNavigate prop
import { perplexityService } from '../services/perplexityApi'; // → apiClient prop
import { useEmailAuth } from '../contexts/EmailAuthContext';   // → user prop
import { useDeepLinkNavigation } from '../services/navigationService'; // → onDeepLink prop
import { useCampaignConfig } from '../hooks/useCampaignConfig'; // → config prop
import { useChatContext } from '../hooks/useChatContext';      // → context prop
import { API_BASE_URL, SSE_DIRECT_URL } from '@/config/constants'; // → apiUrl prop
```

### Package Architecture

```
packages/intelligent-chat/
├── src/
│   ├── index.ts                 # Exports
│   ├── IntelligentChat.tsx      # Main component
│   ├── hooks/
│   │   ├── useProgressiveReveal.ts    # Core reveal logic
│   │   ├── useSSEStream.ts            # SSE handling
│   │   └── useMobileDetect.ts         # Responsive
│   ├── components/
│   │   ├── MessageBubble.tsx          # Single message
│   │   ├── CitationText.tsx           # Inline citations
│   │   ├── FollowUpChips.tsx          # Suggested prompts
│   │   └── TypingIndicator.tsx        # Loading state
│   └── types.ts                 # Shared interfaces
├── package.json
└── tsconfig.json
```

### Core Hook: useProgressiveReveal

Extracted from War Room lines 1286-1360:

```typescript
// packages/intelligent-chat/src/hooks/useProgressiveReveal.ts
import { useRef, useState, useCallback } from 'react';

interface RevealOptions {
  charsPerBatch?: number;  // Default: 3
  batchDelayMs?: number;   // Default: 25 (~40 chars/sec)
  onComplete?: () => void;
}

export function useProgressiveReveal(options: RevealOptions = {}) {
  const { charsPerBatch = 3, batchDelayMs = 25, onComplete } = options;
  const abortRef = useRef<AbortController | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  const reveal = useCallback(async (fullText: string): Promise<void> => {
    // Cancel any existing reveal (prevents race conditions)
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setIsRevealing(true);
    setDisplayedText('');

    try {
      for (let i = 0; i < fullText.length; i += charsPerBatch) {
        if (signal.aborted) return;

        setDisplayedText(fullText.slice(0, i + charsPerBatch));
        await new Promise(resolve => setTimeout(resolve, batchDelayMs));
      }

      // Final complete text
      if (!signal.aborted) {
        setDisplayedText(fullText);
        onComplete?.();
      }
    } finally {
      if (!signal.aborted) {
        setIsRevealing(false);
      }
    }
  }, [charsPerBatch, batchDelayMs, onComplete]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsRevealing(false);
  }, []);

  return { reveal, cancel, isRevealing, displayedText };
}
```

### Component Props (Framework-Agnostic)

```typescript
// packages/intelligent-chat/src/types.ts
export interface Citation {
  source: string;
  text: string;
  confidence: number;
  sourceType: 'document' | 'web';
  documentId?: string;
  url?: string;
}

export interface IntelligentChatProps {
  // Required
  apiEndpoint: string;

  // Optional - framework adaptation
  onNavigate?: (path: string) => void;      // Next: router.push, Vite: navigate
  onDocumentOpen?: (docId: string) => void; // Open document viewer

  // Config
  user?: { id: string; name: string };
  className?: string;
  placeholder?: string;

  // Customization
  revealSpeed?: 'slow' | 'normal' | 'fast'; // 15/25/40ms per batch
  showFollowUps?: boolean;
  showCitations?: boolean;
}
```

### Integration in AudienceOS

```typescript
// app/components/chat/audience-chat.tsx
"use client";

import { IntelligentChat } from '@chi/intelligent-chat';
import { useRouter } from 'next/navigation';

export function AudienceChat() {
  const router = useRouter();

  return (
    <IntelligentChat
      apiEndpoint="/api/v1/assistant/query"
      onNavigate={(path) => router.push(path)}
      onDocumentOpen={(docId) => router.push(`/documents/${docId}`)}
      revealSpeed="normal"
      showFollowUps={true}
      showCitations={true}
      className="h-full"
    />
  );
}
```

### Extraction Effort

| Task | Hours |
|------|-------|
| Extract core hooks (reveal, SSE) | 3h |
| Abstract framework deps to props | 2h |
| Build CitationText standalone | 1h |
| Package setup (tsconfig, exports) | 1h |
| Integration in AudienceOS | 1h |
| Integration back to War Room | 1h |
| Testing both integrations | 2h |
| **Total** | **11h** |

### Why This Is Better

1. **Reusable** - One component, multiple projects
2. **Testable** - Isolated hooks with no framework deps
3. **Maintainable** - Fix once, deploy everywhere
4. **Progressive** - Start with core, add features incrementally

### Next Steps

1. Create `packages/intelligent-chat/` in PAI monorepo
2. Extract `useProgressiveReveal` first (most valuable)
3. Add `useSSEStream` for real-time
4. Build minimal `IntelligentChat` wrapper
5. Integrate in AudienceOS
6. Backport to War Room (replace 2700 LOC with import)

---

## 4. GeminiFileSearchService (Easy)

### Source
```
server/services/geminiFileSearchService.ts (1067 LOC)
```

### Migration
This is server-side code. In Next.js, it goes in:
- `lib/services/gemini-file-search.ts` (service)
- `app/api/v1/documents/[id]/index/route.ts` (API route)

### No Major Changes
- Node.js runtime compatible
- Import paths may need adjustment
- Environment variables accessed same way

```typescript
// lib/services/gemini-file-search.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export class GeminiFileSearchService {
  // ... same implementation
}
```

---

## 5. RevOS Patterns (Reference)

### RLS Policies
Copy from: `supabase/migrations/009_add_rls_policies_all_tables.sql`
Adapt table names for AudienceOS schema.

### Supabase Server Client
Copy from: `lib/supabase/server.ts`
Works directly in Next.js App Router.

### Session Manager
Copy from: `lib/session-manager.ts`
May need `"use client"` if using browser storage.

### Middleware
Copy from: `middleware.ts`
Next.js middleware is same pattern.

---

## Validation Checklist

Before considering migration complete:

- [ ] Glass CSS renders correctly in dark mode
- [ ] Toast notifications appear and dismiss
- [ ] IntelligentChat renders without hydration errors
- [ ] Progressive reveal types smoothly
- [ ] API calls to assistant work
- [ ] No `window is not defined` errors on server render
- [ ] No flash of unstyled content (FOUC)

---

## Estimated Effort

| Component | Hours | Blocker? |
|-----------|-------|----------|
| ~~Glass CSS~~ | ~~0.5h~~ | Skipped - using Linear |
| Linear Design System setup | 2h | No |
| Toast | 1h | No |
| `@chi/intelligent-chat` package | 11h | No - clean extraction |
| GeminiFileSearch | 2h | No |
| RevOS patterns | 2h | No |
| **Total** | ~18h | |

**Note:** IntelligentChat extraction creates reusable package for all projects. War Room benefits from cleaner 50-line import vs 2700 LOC component.

---

## Recommendation

**Before starting full migration:**

1. Create a fresh Next.js 15 test app
2. Copy IntelligentChat with `"use client"`
3. Verify it renders and functions
4. If issues, document specific fixes needed
5. Only then proceed with full migration

This de-risks the "War Room import compatibility" blocker identified by the validator.

---

*Living Document - Update as migration progresses*
