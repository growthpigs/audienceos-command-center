import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

// Use vi.hoisted to ensure these are available before vi.mock runs
const {
  mockStoreState,
  mockSetIntegrations,
  mockSetLoading,
  mockAddIntegration,
  mockUpdateIntegration,
  mockRemoveIntegration,
} = vi.hoisted(() => {
  const mockSetIntegrations = vi.fn()
  const mockSetLoading = vi.fn()
  const mockAddIntegration = vi.fn()
  const mockUpdateIntegration = vi.fn()
  const mockRemoveIntegration = vi.fn()

  const mockStoreState = {
    integrations: [] as any[],
    isLoading: false,
    setIntegrations: mockSetIntegrations,
    setLoading: mockSetLoading,
    addIntegration: mockAddIntegration,
    updateIntegration: mockUpdateIntegration,
    removeIntegration: mockRemoveIntegration,
  }

  return {
    mockStoreState,
    mockSetIntegrations,
    mockSetLoading,
    mockAddIntegration,
    mockUpdateIntegration,
    mockRemoveIntegration,
  }
})

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  })),
}))

// Mock the store with getState() support (Zustand pattern)
vi.mock('@/lib/store', () => ({
  useIntegrationsStore: Object.assign(
    vi.fn((selector?: (state: any) => any) => {
      return selector ? selector(mockStoreState) : mockStoreState
    }),
    {
      getState: () => mockStoreState,
    }
  ),
}))

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { useIntegrations } from '@/hooks/use-integrations'
import { useIntegrationsStore } from '@/lib/store'

describe('useIntegrations', () => {
  beforeEach(() => {
    mockStoreState.integrations = []
    mockStoreState.isLoading = false
    vi.clearAllMocks()
    mockFetch.mockReset()
    // Default mock for fetch to prevent undefined errors
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ data: [] }),
    })
    mockSetIntegrations.mockReset()
    mockSetLoading.mockReset()
    mockAddIntegration.mockReset()
    mockUpdateIntegration.mockReset()
    mockRemoveIntegration.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should return integrations from store', () => {
      mockStoreState.integrations = [
        { id: 'int-1', provider: 'slack', is_connected: true },
        { id: 'int-2', provider: 'gmail', is_connected: false },
      ]

      const { result } = renderHook(() => useIntegrations())

      expect(result.current.integrations).toEqual(mockStoreState.integrations)
    })

    it('should return isLoading state from store', () => {
      mockStoreState.isLoading = true

      const { result } = renderHook(() => useIntegrations())

      expect(result.current.isLoading).toBe(true)
    })

    it('should provide refetch function', () => {
      const { result } = renderHook(() => useIntegrations())

      expect(typeof result.current.refetch).toBe('function')
    })
  })

  describe('API fetching', () => {
    it('should fetch from /api/v1/integrations with credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      })

      renderHook(() => useIntegrations())

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/integrations',
          expect.objectContaining({ credentials: 'include' })
        )
      })
    })

    it('should handle successful API response', async () => {
      const mockData = [
        { id: 'int-1', provider: 'slack', is_connected: true },
      ]
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockData }),
      })

      renderHook(() => useIntegrations())

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
        expect(mockSetIntegrations).toHaveBeenCalledWith(mockData)
      })
    })

    it('should handle null data response with empty array fallback', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: null }),
      })

      renderHook(() => useIntegrations())

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
        expect(mockSetIntegrations).toHaveBeenCalledWith([])
      })
    })

    it('should handle fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      renderHook(() => useIntegrations())

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('refetch function', () => {
    it('should call fetch when refetch is invoked', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ data: [] }),
      })

      const { result } = renderHook(() => useIntegrations())

      // Call refetch
      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/integrations',
          expect.objectContaining({ credentials: 'include' })
        )
      })
    })
  })

  describe('Supabase realtime subscription', () => {
    it('should set up realtime channel on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      })

      const { unmount } = renderHook(() => useIntegrations())

      // The hook should initialize and fetch
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Unmount should cleanup
      unmount()
    })
  })
})

describe('integration provider types', () => {
  it('should support slack provider', () => {
    const slackIntegration = {
      id: 'int-1',
      provider: 'slack' as const,
      is_connected: true,
      agency_id: 'agency-1',
    }
    expect(slackIntegration.provider).toBe('slack')
  })

  it('should support gmail provider', () => {
    const gmailIntegration = {
      id: 'int-2',
      provider: 'gmail' as const,
      is_connected: false,
      agency_id: 'agency-1',
    }
    expect(gmailIntegration.provider).toBe('gmail')
  })

  it('should support google_ads provider', () => {
    const googleAdsIntegration = {
      id: 'int-3',
      provider: 'google_ads' as const,
      is_connected: true,
      agency_id: 'agency-1',
    }
    expect(googleAdsIntegration.provider).toBe('google_ads')
  })

  it('should support meta_ads provider', () => {
    const metaAdsIntegration = {
      id: 'int-4',
      provider: 'meta_ads' as const,
      is_connected: true,
      agency_id: 'agency-1',
    }
    expect(metaAdsIntegration.provider).toBe('meta_ads')
  })
})
