import { create } from 'zustand'

// Types matching DATA-MODEL.md
export type Stage =
  | 'Onboarding'
  | 'Installation'
  | 'Audit'
  | 'Live'
  | 'Needs Support'
  | 'Off-boarding'

export type HealthStatus = 'green' | 'yellow' | 'red'

export interface Client {
  id: string
  agency_id: string
  name: string
  contact_email: string | null
  contact_name: string | null
  stage: Stage
  health_status: HealthStatus
  days_in_stage: number
  notes: string | null
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  // UI-only fields
  owner?: string
  owner_avatar?: string
}

export interface StageEvent {
  id: string
  agency_id: string
  client_id: string
  from_stage: Stage | null
  to_stage: Stage
  moved_by: string
  moved_at: string
  notes: string | null
}

interface PipelineState {
  // Data
  clients: Client[]
  stageHistory: Record<string, StageEvent[]>
  isLoading: boolean
  error: string | null

  // Filters
  filters: {
    stage: Stage | 'all'
    health: HealthStatus | 'all'
    owner: string | 'all'
    search: string
  }

  // Selected client for drawer
  selectedClientId: string | null

  // Actions
  setClients: (clients: Client[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Optimistic update with rollback
  moveClient: (clientId: string, toStage: Stage) => void
  rollbackMove: (clientId: string, fromStage: Stage) => void

  // Filters
  setFilter: <K extends keyof PipelineState['filters']>(
    key: K,
    value: PipelineState['filters'][K]
  ) => void
  clearFilters: () => void

  // Selection
  selectClient: (clientId: string | null) => void

  // Computed
  getClientsByStage: (stage: Stage) => Client[]
  getFilteredClients: () => Client[]
}

const STAGES: Stage[] = [
  'Onboarding',
  'Installation',
  'Audit',
  'Live',
  'Needs Support',
  'Off-boarding'
]

export const usePipelineStore = create<PipelineState>((set, get) => ({
  // Initial state
  clients: [],
  stageHistory: {},
  isLoading: false,
  error: null,

  filters: {
    stage: 'all',
    health: 'all',
    owner: 'all',
    search: ''
  },

  selectedClientId: null,

  // Actions
  setClients: (clients) => set({ clients }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Optimistic move - update UI immediately
  moveClient: (clientId, toStage) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === clientId
          ? { ...client, stage: toStage, days_in_stage: 0 }
          : client
      )
    }))
  },

  // Rollback if API fails
  rollbackMove: (clientId, fromStage) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === clientId
          ? { ...client, stage: fromStage }
          : client
      )
    }))
  },

  // Filters
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    }))
  },

  clearFilters: () => {
    set({
      filters: {
        stage: 'all',
        health: 'all',
        owner: 'all',
        search: ''
      }
    })
  },

  // Selection
  selectClient: (clientId) => set({ selectedClientId: clientId }),

  // Computed helpers
  getClientsByStage: (stage) => {
    const { clients } = get()
    return clients.filter((c) => c.stage === stage)
  },

  getFilteredClients: () => {
    const { clients, filters } = get()

    return clients.filter((client) => {
      // Stage filter
      if (filters.stage !== 'all' && client.stage !== filters.stage) {
        return false
      }

      // Health filter
      if (filters.health !== 'all' && client.health_status !== filters.health) {
        return false
      }

      // Owner filter
      if (filters.owner !== 'all' && client.owner !== filters.owner) {
        return false
      }

      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesName = client.name.toLowerCase().includes(search)
        const matchesEmail = client.contact_email?.toLowerCase().includes(search)
        if (!matchesName && !matchesEmail) {
          return false
        }
      }

      return true
    })
  }
}))

// Export stages for use in components
export { STAGES }
