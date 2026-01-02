# AudienceOS Command Center - RUNBOOK

## Quick Start

```bash
git clone https://github.com/growthpigs/audienceos-command-center.git
cd audienceos-command-center
npm install
cp .env.example .env.local
# Fill in environment variables (see below)
npm run dev
```

## URLs

| Environment | URL | Status |
|-------------|-----|---------|
| Local | http://localhost:3000 | ✅ Working |
| Staging | TBD | ⏳ Not deployed |
| Production | TBD | ⏳ Not deployed |

## Repository

- **GitHub**: https://github.com/growthpigs/audienceos-command-center
- **Clone URL**: `git@github.com:growthpigs/audienceos-command-center.git`
- **Default Branch**: `main`

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Purpose | Status | Where to get |
|----------|---------|--------|--------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | ❌ Required | Supabase dashboard |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | ❌ Required | Supabase API settings |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role | ❌ Required | Supabase API settings |
| ANTHROPIC_API_KEY | Claude AI integration | ❌ Required | Anthropic Console |
| GOOGLE_AI_API_KEY | Gemini AI integration | ❌ Required | Google AI Studio |
| SLACK_CLIENT_ID | Slack OAuth integration | ⏳ Optional | Slack App Dashboard |
| SLACK_CLIENT_SECRET | Slack OAuth secret | ⏳ Optional | Slack App Dashboard |
| GOOGLE_CLIENT_ID | Google OAuth (Gmail/Ads) | ⏳ Optional | Google Cloud Console |
| GOOGLE_CLIENT_SECRET | Google OAuth secret | ⏳ Optional | Google Cloud Console |
| META_APP_ID | Meta Ads integration | ⏳ Optional | Meta Developer Console |
| META_APP_SECRET | Meta Ads secret | ⏳ Optional | Meta Developer Console |
| SENTRY_DSN | Error monitoring | ⏳ Optional | Sentry Dashboard |

## Development

### Available Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Create production build
npm run start        # Run production build locally
npm run lint         # Run ESLint checks
```

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: v19
- **UI Components**: shadcn/ui (Radix primitives)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts
- **Icons**: Lucide React

### Key Dependencies

- **dnd-kit**: Kanban board drag & drop functionality
- **zustand**: Global state management
- **zod**: Schema validation
- **react-hook-form**: Form handling
- **recharts**: Dashboard charts and analytics
- **date-fns**: Date manipulation
- **sonner**: Toast notifications

## Deployment

### Prerequisites

**Backend Services Required:**
1. **Supabase Project** - Database, Auth, Storage, Realtime
2. **Anthropic API** - Claude AI for intelligent features
3. **Google AI Studio** - Gemini for document indexing

**Optional Integrations:**
- Slack App (for unified communications)
- Google Cloud Project (for Gmail/Ads OAuth)
- Meta Developer App (for Meta Ads integration)
- Sentry Project (for error monitoring)

### Staging Deployment

```bash
# TBD - Configure Vercel or other hosting
```

### Production Deployment

```bash
# TBD - Configure production hosting
```

## Services & Integrations

| Service | Purpose | Status | Dashboard |
|---------|---------|--------|-----------|
| **Supabase** | Database, Auth, Storage | ❌ Not configured | [supabase.com/dashboard](https://supabase.com/dashboard) |
| **Anthropic** | Claude AI integration | ❌ Not configured | [console.anthropic.com](https://console.anthropic.com) |
| **Google AI** | Gemini document indexing | ❌ Not configured | [aistudio.google.com](https://aistudio.google.com) |
| Slack | Communication integration | ⏳ Optional | [api.slack.com/apps](https://api.slack.com/apps) |
| Google Cloud | Gmail/Ads OAuth | ⏳ Optional | [console.cloud.google.com](https://console.cloud.google.com) |
| Meta for Developers | Ads integration | ⏳ Optional | [developers.facebook.com](https://developers.facebook.com) |
| Sentry | Error monitoring | ⏳ Optional | [sentry.io](https://sentry.io) |

## Common Tasks

### First-Time Setup

```bash
# Clone and setup
git clone https://github.com/growthpigs/audienceos-command-center.git
cd audienceos-command-center
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development
npm run dev
```

### Database Setup (Supabase)

```sql
-- TBD: Add database schema setup instructions
-- Will be populated when Supabase project is configured
```

### Adding New Dependencies

```bash
# Add new package
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Update all dependencies
npm update
```

### Code Quality

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Format code (if prettier added)
npm run format
```

## Project Structure

```
audienceos-command-center/
├── app/                     # Next.js App Router pages
│   ├── page.tsx            # Dashboard home
│   ├── client/[id]/        # Client detail pages
│   └── onboarding/start/   # Onboarding flow
├── components/              # React components
│   ├── ui/                 # shadcn/ui primitives
│   ├── kanban-board.tsx    # Pipeline management
│   ├── *-view.tsx          # Feature components
│   └── sidebar.tsx         # Navigation
├── lib/
│   ├── mock-data.ts        # Development data
│   ├── utils.ts            # Utility functions
│   ├── store.ts            # Zustand state
│   └── api.ts              # API client (TBD)
├── features/               # Feature specifications
├── docs/                   # Project documentation
└── stores/                 # Additional stores
```

## Verification Commands (RUN THESE BEFORE ANY DEBUGGING)

**CRITICAL:** File existence checks prove NOTHING. These commands prove the system WORKS.

### 1. Supabase Connection & Auth
```bash
# Test Supabase connection (not just "env vars exist")
source .env.local && node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('client').select('id,name').limit(1).then(r => console.log('✅ DB:', r.data ? 'Connected' : 'No data'));
"

# Verify auth user exists in BOTH auth.users AND user table
# This caught the Pipeline view bug where auth existed but user table row didn't
source .env.local && node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('user').select('id,email,agency_id').eq('email','dev@audienceos.dev').then(r =>
  console.log(r.data?.length ? '✅ User in user table' : '❌ User MISSING from user table - RLS will fail!')
);
"
```

### 2. API Endpoint Runtime Test
```bash
# Test client list API returns actual data (port 3003 for dev)
curl -s http://localhost:3003/api/v1/clients | jq '.data | length'
# Expected: 10 (number of clients)

# Test client detail API schema matches types
curl -s http://localhost:3003/api/v1/clients/e31041eb-dad4-4ef8-aead-fb2251997fd4 | jq '.data | keys'
# Expected: ["assignments", "communications", "stage_events", "tasks", ...]
```

### 3. Schema Alignment Check
```bash
# Verify API response matches TypeScript types
# This caught the sent_at vs received_at mismatch
curl -s http://localhost:3003/api/v1/clients/e31041eb-dad4-4ef8-aead-fb2251997fd4 | jq '.data.communications[0] | keys'
# Must include: received_at, subject, content (NOT sent_at, message_preview)
```

### 4. Browser Runtime Test (Claude in Chrome)
```
1. Navigate to http://localhost:3003
2. Login with dev@audienceos.dev / Test123!
3. Click Pipeline → Click a client card
4. VERIFY: Client detail loads (not "Client Not Found")
5. VERIFY: Overview tab metrics match data (no hardcoded values)
6. VERIFY: Communications tab matches Overview "Last Contact"
```

### 5. Seed Data Verification
```bash
# Verify stage_event seed data exists (timeline won't be empty)
source .env.local && node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('stage_event').select('id,from_stage,to_stage').limit(5).then(r =>
  console.log('Stage events:', r.data?.length || 0, 'rows')
);
"
```

---

## Troubleshooting

### Common Issues

**Build errors after dependency updates:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment variables not loading:**
```bash
# Ensure .env.local exists and has correct format
# Restart development server after changes
npm run dev
```

**TypeScript errors:**
```bash
# Check for type issues
npx tsc --noEmit
```

### Getting Help

- **GitHub Issues**: [Report bugs and request features](https://github.com/growthpigs/audienceos-command-center/issues)
- **Documentation**: Check `docs/` folder for detailed specs
- **Feature Specs**: Review `features/` folder for implementation details

## Status

### ✅ Complete
- [x] Next.js 16 + React 19 setup
- [x] shadcn/ui component system
- [x] All required dependencies installed
- [x] Git repository created and pushed
- [x] Environment configuration template
- [x] Build process verified working

### ⏳ In Progress
- [ ] Database setup (Supabase)
- [ ] API integration setup
- [ ] Environment variables configuration

### 📋 Pending
- [ ] Hosting deployment (Vercel recommended)
- [ ] CI/CD pipeline setup
- [ ] Production environment configuration
- [ ] Monitoring and alerting setup

---

*Last updated: 2025-01-01*
*Project Phase: D-3 Setup Complete*