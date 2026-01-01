# Folder Structure Scaffolding (Next.js)

> Synced from Drive: 2025-12-31

```
/app                        # Next.js App Router
  /clients
    page.tsx
    /[clientId]
      page.tsx
      components.tsx
  /dashboard
    page.tsx
  /pipeline
    page.tsx
  /intelligence
    page.tsx
  /tickets
    page.tsx
  /integrations
    page.tsx
  /settings
    page.tsx
  layout.tsx
  globals.css
/src
  /lib
    api.ts            # axios/fetch wrappers, auth helpers
    supabase.ts
    llm.ts
    rag.ts
  /components
    /ui               # Buttons, Modals, Form fields
    Kanban/
    Charts/
    Assistant/
    DocUploader/
  /services
    clients.service.ts
    tickets.service.ts
    integrations.service.ts
    assistant.service.ts
  /workers
    syncWorker.ts     # cron/on-demand sync handlers
  /types
    index.d.ts
  /hooks
    useAuth.ts
    useRealtime.ts
  /styles
  /utils
    date.ts
    validations.ts
/public
  /icons
  /images
```

---

## Conventions

* Keep domain logic in `/services` and minimal logic in pages.
* Use React Server Components (if using app router) for data fetching where possible; keep interactive components as Client Components.
* Use `caas` for downloadable assets if needed.

---

*Synced from Drive — Living Document*
