# FEATURE SPEC: Dashboard Overview

**What:** Executive overview with key agency metrics, KPIs, and drill-down navigation to detailed views
**Who:** Agency Owners, Directors, and Account Managers needing operational visibility
**Why:** Instant visibility on critical operations - client health, team performance, business metrics
**Status:** 📝 Specced

---

## User Stories

**US-001: View Executive KPI Dashboard**
As an Account Manager, I want to see key metrics at a glance, so that I can quickly assess agency performance and identify issues.

Acceptance Criteria:
- [ ] Dashboard displays: Active Onboardings, At-Risk Clients, Support Hours This Week, Avg Install Time
- [ ] Each KPI card shows current value and trend indicator (↑↓)
- [ ] Real-time updates via Supabase Realtime for critical metrics
- [ ] Hourly background refresh with manual "Refresh" button
- [ ] Click any KPI to drill down to filtered list

**US-002: View Client Trend Charts**
As an Account Manager, I want to see visualizations of client trends, so that I can spot patterns over time.

Acceptance Criteria:
- [ ] "New vs Completed Installs" chart (Recharts area chart)
- [ ] Time period toggles: 7, 30, 90 days
- [ ] Hover tooltips show exact values
- [ ] Responsive design for mobile

**US-003: Dashboard Drill-Down Navigation**
As an Account Manager, I want to click metrics to see details, so that I can investigate issues without searching.

Acceptance Criteria:
- [ ] "At-Risk Clients" → Pipeline filtered to red health
- [ ] "Active Onboardings" → Pipeline filtered to Onboarding stage
- [ ] Filter state preserved in URL query params
- [ ] Back button returns to dashboard

---

## Functional Requirements

What this feature DOES:
- [ ] Display 5 core KPI cards with live data and trend indicators
- [ ] Calculate metrics from CLIENT, TICKET, STAGE_EVENT tables
- [ ] Provide drill-down navigation to filtered detail views
- [ ] Update data hourly via background job with manual refresh
- [ ] Show responsive time-series charts with period toggles
- [ ] Cache computed metrics for sub-2-second load performance
- [ ] Display real-time updates for critical metrics (at-risk clients)
- [ ] Preserve navigation state in URL for bookmarking

What this feature does NOT do:
- ❌ Show client-specific details (use Client Detail Drawer)
- ❌ Edit data directly (read-only overview)
- ❌ Send notifications (handled by alert system)
- ❌ Support custom KPI configuration (fixed set for MVP)

---

## Data Model

Entities involved:
- CLIENT - Source for client counts, health, stage tracking
- STAGE_EVENT - Install time calculations, stage progression metrics
- TICKET - Support hours, resolution tracking
- USER - Team member assignments for drill-down filtering

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| CLIENT | days_in_stage | Integer | Auto-calculated for trend analysis |
| TICKET | time_spent_hours | Decimal | Support hours tracking |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/dashboard/kpis` | GET | Fetch all KPI values with trends |
| `/api/v1/dashboard/refresh` | POST | Trigger manual KPI recalculation |
| `/api/v1/dashboard/trends` | GET | Time-series data for charts |

---

## UI Components

| Component | Purpose |
|-----------|---------|
| DashboardGrid | Responsive grid layout for KPI cards and charts |
| KPICard | Individual metric display with value, trend, drill-down |
| TrendIndicator | Arrow icon with percentage change styling |
| RefreshButton | Manual data refresh with loading spinner |
| TimeSeriesChart | Recharts area chart with hover tooltips |
| LastUpdated | Timestamp with countdown to next auto-refresh |
| PeriodToggle | 7/30/90 day toggle buttons for charts |
| DrillDownModal | Loading state during navigation |

---

## Implementation Tasks

### Setup & Foundation
- [ ] TASK-001: Set up dashboard page routing (/dashboard)
- [ ] TASK-002: Create DashboardGrid responsive layout component
- [ ] TASK-003: Install and configure Recharts library
- [ ] TASK-004: Set up Zustand store for dashboard state

### KPI Calculation Engine
- [ ] TASK-005: Build KPI calculation service with caching
- [ ] TASK-006: Implement Active Onboardings calculation
- [ ] TASK-007: Implement At-Risk Clients with real-time updates
- [ ] TASK-008: Build Support Hours This Week aggregation
- [ ] TASK-009: Calculate Average Install Time (30-day rolling)
- [ ] TASK-010: Implement Clients Needing Attention logic

### KPI Cards Implementation
- [ ] TASK-011: Build KPICard component with trend indicators
- [ ] TASK-012: Implement TrendIndicator with up/down/stable states
- [ ] TASK-013: Connect GET /v1/dashboard/kpis API
- [ ] TASK-014: Add drill-down navigation with URL state
- [ ] TASK-015: Implement loading and error states for each card

### Charts & Visualization
- [ ] TASK-016: Build TimeSeriesChart component (Recharts area chart)
- [ ] TASK-017: Connect GET /v1/dashboard/trends API
- [ ] TASK-018: Implement period toggles (7/30/90 days)
- [ ] TASK-019: Add hover tooltips and responsive sizing
- [ ] TASK-020: Build chart loading skeletons

### Real-time & Performance
- [ ] TASK-021: Set up Supabase Realtime for at-risk clients
- [ ] TASK-022: Implement manual refresh with POST /v1/dashboard/refresh
- [ ] TASK-023: Add auto-refresh every hour with countdown
- [ ] TASK-024: Optimize KPI queries with proper indexes
- [ ] TASK-025: Add KPI caching layer (5-minute cache)

### Polish & Mobile
- [ ] TASK-026: Implement responsive mobile layout (cards stack vertically)
- [ ] TASK-027: Add loading states and error handling
- [ ] TASK-028: Build LastUpdated component with relative timestamps
- [ ] TASK-029: Add accessibility support (aria-labels, keyboard nav)
- [ ] TASK-030: Implement CSV export for chart data

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No clients exist | Show "0" values with "Add Client" call-to-action |
| All clients at-risk | Highlight urgency with red theme, suggest actions |
| KPI calculation fails | Display error state with retry button |
| Database connection lost | Show cached values with "offline" indicator |
| Large dataset (500+ clients) | Paginate drill-down views, optimize queries |
| User lacks permissions | Hide sensitive metrics, show accessible data only |
| Real-time update fails | Fall back to polling, show connection status |

---

## Technical Implementation

### KPI Calculation Service
```typescript
interface KPI {
  value: number;
  trend: 'up' | 'down' | 'stable';
  change_percent: number;
  previous_value: number;
  drill_down_url?: string;
  last_updated: string;
}

class KPIService {
  async calculateActiveOnboardings(agencyId: string): Promise<KPI> {
    const current = await supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('agency_id', agencyId)
      .eq('stage', 'onboarding')
      .neq('health_status', 'red');

    // Calculate trend vs previous week
    const trend = this.calculateTrend(current.count, previousCount);

    return {
      value: current.count || 0,
      trend,
      change_percent: this.calculateChangePercent(current.count, previousCount),
      previous_value: previousCount,
      drill_down_url: '/pipeline?stage=onboarding',
      last_updated: new Date().toISOString()
    };
  }
}
```

### Real-time Updates
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('dashboard-updates')
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'clients',
        filter: `agency_id=eq.${agencyId}`
      },
      handleClientUpdate
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [agencyId]);

function handleClientUpdate(payload: any) {
  if (payload.new.health_status !== payload.old.health_status) {
    // Recalculate at-risk clients KPI
    refreshKPI('at_risk_clients');
  }
}
```

### Drill-down Navigation
```typescript
const navigate = useNavigate();

function handleKPIDrillDown(kpi: string) {
  const drillDownRoutes = {
    'at_risk_clients': '/clients?health=red',
    'active_onboardings': '/pipeline?stage=onboarding',
    'support_hours': '/tickets?timeframe=week',
    'avg_install_time': '/clients?stage=live&sort=install_time',
    'clients_needing_attention': '/clients?needs_attention=true'
  };

  navigate(drillDownRoutes[kpi]);
}
```

### Responsive Chart Implementation
```typescript
function TimeSeriesChart({ data, metric, period }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), 'MMM dd')}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
          formatter={(value, name) => [value, name]}
        />
        <Area
          type="monotone"
          dataKey="new_clients"
          stackId="1"
          stroke="#8884d8"
          fill="#8884d8"
          name="New Clients"
        />
        <Area
          type="monotone"
          dataKey="completed_installs"
          stackId="1"
          stroke="#82ca9d"
          fill="#82ca9d"
          name="Completed Installs"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

---

## Testing Checklist

- [ ] Happy path: Dashboard loads with accurate KPI values under 2 seconds
- [ ] Drill-down: All KPI cards navigate to correct filtered views
- [ ] Manual refresh: Updates all metrics and shows loading states
- [ ] Real-time: At-risk clients updates immediately when client health changes
- [ ] Charts: Hover tooltips work, period toggles update data correctly
- [ ] Mobile: Cards stack vertically, charts remain readable
- [ ] Performance: Dashboard handles 500+ clients without lag
- [ ] Error handling: Network failures, calculation errors show proper states
- [ ] Accessibility: Screen readers announce KPI values and changes
- [ ] Cache: KPI values persist during network interruptions

---

## Performance Considerations

### Caching Strategy
- KPIs cached for 5 minutes with Redis/memory cache
- Chart data cached for 15 minutes
- Invalidate cache on relevant data changes (client stage, health)

### Query Optimization
```sql
-- Ensure these indexes exist for fast KPI calculation
CREATE INDEX idx_clients_agency_stage_health ON clients(agency_id, stage, health_status);
CREATE INDEX idx_stage_events_client_timestamp ON stage_events(client_id, timestamp, to_stage);
CREATE INDEX idx_tickets_agency_created_status ON tickets(agency_id, created_at, status);
```

### Real-time Efficiency
- Only subscribe to at-risk clients updates (most critical)
- Other metrics use hourly background refresh
- Debounce real-time updates to prevent UI flicker

### Mobile Performance
- Lazy-load charts below the fold
- Use CSS Grid for responsive layout without JavaScript
- Implement virtual scrolling for large KPI lists

---

## Dependencies

### Required for Implementation
- Recharts (charts and visualization)
- Supabase Realtime (real-time updates)
- Zustand (dashboard state management)
- React Query (server state with caching)

### Blocked By
- CLIENT table with health_status and stage fields
- STAGE_EVENT table for install time calculations
- TICKET table with time_spent_hours
- Dashboard API endpoints in backend

### Enables
- Intelligence Center (alert prioritization based on KPIs)
- Automations (KPI threshold triggers)
- Reporting (dashboard data for external tools)
- Mobile app (KPI widgets)

---

## Success Metrics

- **Load Performance:** Dashboard loads in <2 seconds for 500+ client agencies
- **Accuracy:** KPI values match manual calculations 99.9% of time
- **Usage:** 80% of daily active users visit dashboard within first 5 minutes
- **Engagement:** Average 3+ drill-down clicks per dashboard visit
- **Mobile Usage:** 40% of dashboard views on mobile devices

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Enhanced spec with complete implementation details, corrected user story numbers |
| 2025-12-31 | Created initial spec from PRD dashboard section |

---

*Living Document - Located at features/dashboard-overview.md*