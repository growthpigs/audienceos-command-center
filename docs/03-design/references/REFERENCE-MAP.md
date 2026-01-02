# Design Reference Map

Maps each AudienceOS component to its design reference screenshot.

---

## Component → Reference Mapping

| AudienceOS Component | Reference | Source | Notes |
|---------------------|-----------|--------|-------|
| **Sidebar** | `linear-issue-detail.png` | Linear | Collapsible sections, minimal icons |
| **Dashboard** | `remote-dashboard.png` | Remote | Stat cards, circular charts, clean B2B |
| **Pipeline** | `pipedrive-pipeline-kanban.png` | Pipedrive | CRM-style kanban columns |
| **Client List** | `linear-issue-detail.png` | Linear | Issue list with properties |
| **Client Detail** | `linear-issue-detail.png` | Linear | Detail + right properties panel |
| **Communications** | `linear-inbox-activity.png` | Linear | Threaded activity/comments |
| **Support Tickets** | `linear-issue-modal.png` | Linear | Issue creation with sub-issues |
| **Integrations** | `linear-settings-integrations.png` | Linear | Grid of integration cards |
| **Settings** | `linear-settings-integrations.png` | Linear | Settings sidebar structure |
| **Knowledge Base** | `notion-knowledge-base.png` | Notion | Document library with folders |
| **Automations** | `n8n-workflow-builder.png` | n8n | Node-based workflow canvas |

---

## Reference Screenshots

| File | Shows | Use For |
|------|-------|---------|
| `linear-homepage.png` | Linear marketing page | General aesthetic |
| `linear-issue-detail.png` | Sidebar + issue detail + properties | Client detail, list view, sidebar |
| `linear-inbox-activity.png` | Inbox with threaded activity | Communications hub |
| `linear-issue-modal.png` | Issue creation modal | Quick create dialogs |
| `linear-settings-integrations.png` | Settings + integrations grid | Settings, integrations |
| `pipedrive-pipeline-kanban.png` | CRM pipeline board | Pipeline view |
| `remote-dashboard.png` | B2B SaaS dashboard with stats | Dashboard |
| `notion-knowledge-base.png` | Document library with folders/search | Knowledge Base |
| `n8n-workflow-builder.png` | Node-based workflow editor | Automations |

---

## All References Complete ✅

All AudienceOS components now have design references mapped.

---

## Key Design Patterns to Extract

### From Linear
- Minimal borders (almost invisible)
- Generous whitespace
- Opacity-based text hierarchy (white/80%, white/60%, white/40%)
- Collapsible sidebar sections
- Properties panel on right (not modal)
- Subtle hover states

### From Pipedrive
- Kanban columns with deal values
- Card-based items in columns
- Filter bar above board

---

## Workflow

When building a component:
1. Check this map for relevant reference
2. Open the reference screenshot
3. Match the visual patterns
4. Apply AudienceOS color tokens (but keep Linear's spatial/typography patterns)

---

*Created: 2026-01-02*
