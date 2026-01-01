import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePipelineStore } from '@/stores/pipeline-store'

describe('pipeline-store', () => {
  beforeEach(() => {
    // Reset store state
    usePipelineStore.setState({
      clients: [],
      isLoading: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty clients array', () => {
      const { clients } = usePipelineStore.getState()
      expect(clients).toEqual([])
    })

    it('should not be loading initially', () => {
      const { isLoading } = usePipelineStore.getState()
      expect(isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const { error } = usePipelineStore.getState()
      expect(error).toBeNull()
    })
  })

  describe('client stage updates', () => {
    it('should update client stage optimistically', () => {
      const mockClients = [
        { id: 'c1', name: 'Client 1', stage: 'Onboarding', health_status: 'Green', days_in_stage: 3 },
        { id: 'c2', name: 'Client 2', stage: 'Live', health_status: 'Green', days_in_stage: 10 },
      ]

      usePipelineStore.setState({ clients: mockClients as any })

      // Simulate optimistic update
      usePipelineStore.setState((state) => ({
        clients: state.clients.map((c) =>
          c.id === 'c1' ? { ...c, stage: 'Installation', days_in_stage: 0 } : c
        ),
      }))

      const { clients } = usePipelineStore.getState()
      const updatedClient = clients.find((c) => c.id === 'c1')
      expect(updatedClient?.stage).toBe('Installation')
      expect(updatedClient?.days_in_stage).toBe(0)
    })
  })

  describe('loading states', () => {
    it('should set loading state', () => {
      usePipelineStore.setState({ isLoading: true })
      expect(usePipelineStore.getState().isLoading).toBe(true)
    })

    it('should set error state', () => {
      usePipelineStore.setState({ error: 'Failed to fetch clients' })
      expect(usePipelineStore.getState().error).toBe('Failed to fetch clients')
    })
  })

  describe('client filtering', () => {
    it('should filter clients by stage', () => {
      const mockClients = [
        { id: 'c1', stage: 'Onboarding' },
        { id: 'c2', stage: 'Live' },
        { id: 'c3', stage: 'Onboarding' },
      ]

      usePipelineStore.setState({ clients: mockClients as any })

      const { clients } = usePipelineStore.getState()
      const onboardingClients = clients.filter((c) => c.stage === 'Onboarding')
      expect(onboardingClients).toHaveLength(2)
    })

    it('should filter clients by health status', () => {
      const mockClients = [
        { id: 'c1', health_status: 'Green' },
        { id: 'c2', health_status: 'Yellow' },
        { id: 'c3', health_status: 'Red' },
      ]

      usePipelineStore.setState({ clients: mockClients as any })

      const { clients } = usePipelineStore.getState()
      const atRiskClients = clients.filter(
        (c) => c.health_status === 'Yellow' || c.health_status === 'Red'
      )
      expect(atRiskClients).toHaveLength(2)
    })
  })
})
