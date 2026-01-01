"use client"

import { useEffect, useCallback } from "react"
import { useDashboardStore } from "@/lib/stores/dashboard-store"
import {
  calculateAllKPIs,
  fetchTrends,
} from "@/lib/services/kpi-service"
import type { TimePeriod, DashboardKPIs, DashboardTrends, RefreshState } from "@/types/dashboard"

// Mock data adapter - converts mock data to database format
import { mockClients, mockTickets } from "@/lib/mock-data"
import type { Database } from "@/types/database"

type Client = Database['public']['Tables']['client']['Row']
type Ticket = Database['public']['Tables']['ticket']['Row']
type StageEvent = Database['public']['Tables']['stage_event']['Row']

// Convert mock clients to database format
function adaptMockClients(): Client[] {
  return mockClients.map((c) => ({
    id: c.id,
    agency_id: "mock-agency",
    name: c.name,
    contact_email: c.onboardingData?.contactEmail || null,
    contact_name: null,
    stage: c.stage,
    health_status: c.health.toLowerCase() as "green" | "yellow" | "red",
    days_in_stage: c.daysInStage,
    install_date: c.stage === "Live" ? new Date().toISOString() : null,
    total_spend: null,
    lifetime_value: null,
    notes: c.statusNote || null,
    tags: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}

// Convert mock tickets to database format
function adaptMockTickets(): Ticket[] {
  return mockTickets.map((t) => ({
    id: t.id,
    agency_id: "mock-agency",
    client_id: t.clientId,
    number: parseInt(t.id.replace("T", ""), 10),
    title: t.title,
    description: t.description,
    category: "technical" as const,
    priority: t.priority.toLowerCase() as "low" | "medium" | "high",
    status: t.status.toLowerCase().replace(/ /g, "_") as "new" | "in_progress" | "waiting_client" | "resolved",
    assignee_id: null,
    resolution_notes: null,
    time_spent_minutes: Math.floor(Math.random() * 120) + 30, // Mock: 30-150 minutes
    due_date: null,
    created_by: "mock-user",
    resolved_by: null,
    resolved_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}

// Generate mock stage events for chart data
function generateMockStageEvents(): StageEvent[] {
  const events: StageEvent[] = []
  const now = new Date()

  // Generate events for the last 90 days
  for (let i = 0; i < 90; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)

    // Random new clients (0-3 per day)
    const newClients = Math.floor(Math.random() * 4)
    for (let j = 0; j < newClients; j++) {
      events.push({
        id: `event-new-${i}-${j}`,
        agency_id: "mock-agency",
        client_id: `client-${i}-${j}`,
        from_stage: null,
        to_stage: "Onboarding",
        moved_by: "mock-user",
        moved_at: date.toISOString(),
        notes: null,
      })
    }

    // Random completed installs (0-2 per day)
    const completedInstalls = Math.floor(Math.random() * 3)
    for (let j = 0; j < completedInstalls; j++) {
      events.push({
        id: `event-live-${i}-${j}`,
        agency_id: "mock-agency",
        client_id: `client-live-${i}-${j}`,
        from_stage: "Audit",
        to_stage: "Live",
        moved_by: "mock-user",
        moved_at: date.toISOString(),
        notes: null,
      })
    }
  }

  return events
}

interface UseDashboardReturn {
  // State
  kpis: DashboardKPIs | null
  kpisLoading: boolean
  kpisError: string | null
  trends: DashboardTrends | null
  trendsLoading: boolean
  trendsError: string | null
  selectedPeriod: TimePeriod
  refresh: RefreshState
  realtimeConnected: boolean

  // Actions
  setSelectedPeriod: (period: TimePeriod) => void
  refreshDashboard: () => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const {
    kpis,
    kpisLoading,
    kpisError,
    trends,
    trendsLoading,
    trendsError,
    selectedPeriod,
    refresh,
    realtimeConnected,
    setKPIs,
    setKPIsLoading,
    setKPIsError,
    setTrends,
    setTrendsLoading,
    setTrendsError,
    setSelectedPeriod,
    setRefreshState,
    setRealtimeConnected,
  } = useDashboardStore()

  const loadKPIs = useCallback(async (forceRefresh = false) => {
    setKPIsLoading(true)
    try {
      const clients = adaptMockClients()
      const tickets = adaptMockTickets()
      const stageEvents = generateMockStageEvents()

      const kpis = await calculateAllKPIs(
        "mock-agency",
        clients,
        tickets,
        stageEvents,
        forceRefresh
      )
      setKPIs(kpis)
    } catch (error) {
      setKPIsError(error instanceof Error ? error.message : "Failed to load KPIs")
    }
  }, [setKPIs, setKPIsLoading, setKPIsError])

  const loadTrends = useCallback(async (period: TimePeriod, forceRefresh = false) => {
    setTrendsLoading(true)
    try {
      const stageEvents = generateMockStageEvents()
      const trends = await fetchTrends("mock-agency", stageEvents, period, forceRefresh)
      setTrends(trends)
    } catch (error) {
      setTrendsError(error instanceof Error ? error.message : "Failed to load trends")
    }
  }, [setTrends, setTrendsLoading, setTrendsError])

  const refreshDashboard = useCallback(async () => {
    setRefreshState({ isRefreshing: true, error: null })
    try {
      await Promise.all([
        loadKPIs(true),
        loadTrends(selectedPeriod, true),
      ])
      setRefreshState({
        isRefreshing: false,
        lastRefreshed: new Date().toISOString(),
        error: null,
      })
    } catch (error) {
      setRefreshState({
        isRefreshing: false,
        error: error instanceof Error ? error.message : "Failed to refresh",
      })
    }
  }, [loadKPIs, loadTrends, selectedPeriod, setRefreshState])

  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period)
    loadTrends(period)
  }, [setSelectedPeriod, loadTrends])

  // Initial load
  useEffect(() => {
    if (!kpis) {
      loadKPIs()
    }
    if (!trends) {
      loadTrends(selectedPeriod)
    }
    // Simulate realtime connection for mock mode
    setRealtimeConnected(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reload trends when period changes
  useEffect(() => {
    if (trends && trends.period !== selectedPeriod) {
      loadTrends(selectedPeriod)
    }
  }, [selectedPeriod, trends, loadTrends])

  return {
    kpis,
    kpisLoading,
    kpisError,
    trends,
    trendsLoading,
    trendsError,
    selectedPeriod,
    refresh,
    realtimeConnected,
    setSelectedPeriod: handlePeriodChange,
    refreshDashboard,
  }
}
