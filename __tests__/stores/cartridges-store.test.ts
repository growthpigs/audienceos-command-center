import { renderHook, act } from '@testing-library/react'
import { useCartridgesStore } from '@/stores/cartridges-store'

describe('cartridges-store', () => {
  beforeEach(() => {
    useCartridgesStore.setState({
      cartridges: [],
      loading: false,
      error: null,
      selectedCartridgeId: null,
    })
  })

  it('selects a cartridge', () => {
    const { result } = renderHook(() => useCartridgesStore())

    act(() => {
      result.current.selectCartridge('test-id')
    })

    expect(result.current.selectedCartridgeId).toBe('test-id')
  })

  it('filters cartridges by type', () => {
    const { result } = renderHook(() => useCartridgesStore())

    act(() => {
      result.current.setFilterType('voice')
    })

    expect(result.current.filterType).toBe('voice')
  })

  it('returns null when no cartridge selected', () => {
    const { result } = renderHook(() => useCartridgesStore())

    expect(result.current.getSelectedCartridge()).toBeNull()
  })
})
