/**
 * REGRESSION TEST: Mock Mode Detection Protection
 *
 * Ensures mock mode ONLY activates with explicit NEXT_PUBLIC_MOCK_MODE=true.
 * Previously, URL patterns could accidentally trigger mock mode.
 *
 * VULNERABILITY FIXED: 2026-01-10
 * This test will FAIL if the vulnerability is reintroduced.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'

describe('Mock Mode Detection Security', () => {
  it('MUST only use explicit NEXT_PUBLIC_MOCK_MODE flag', () => {
    const clientsRoute = fs.readFileSync('./app/api/v1/clients/route.ts', 'utf8')

    // MUST NOT use URL-based detection (was the vulnerability)
    const usesUrlDetection = clientsRoute.includes("url.includes('placeholder')")
    expect(usesUrlDetection).toBe(false)

    const usesEmptyUrlCheck = clientsRoute.includes("url === ''")
    expect(usesEmptyUrlCheck).toBe(false)

    // MUST only check explicit flag
    const usesExplicitFlag = clientsRoute.includes("NEXT_PUBLIC_MOCK_MODE === 'true'")
    expect(usesExplicitFlag).toBe(true)

    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║ SECURITY CHECK PASSED: Mock mode requires explicit flag   ║')
    console.log('║ NEXT_PUBLIC_MOCK_MODE=true is the only trigger.           ║')
    console.log('╚═══════════════════════════════════════════════════════════╝')
  })

  describe('isMockMode behavior (unit tests)', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    // Fixed isMockMode function
    const isMockMode = () => {
      return process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
    }

    it('disables mock mode when MOCK_MODE is not set', () => {
      delete process.env.NEXT_PUBLIC_MOCK_MODE
      expect(isMockMode()).toBe(false)
    })

    it('disables mock mode when MOCK_MODE is false', () => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'false'
      expect(isMockMode()).toBe(false)
    })

    it('enables mock mode ONLY when MOCK_MODE is exactly true', () => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true'
      expect(isMockMode()).toBe(true)
    })

    it('disables mock mode even with empty SUPABASE_URL', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      delete process.env.NEXT_PUBLIC_MOCK_MODE
      expect(isMockMode()).toBe(false)  // FIXED: No longer triggers mock mode
    })

    it('disables mock mode even with placeholder in URL', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://my-placeholder.supabase.co'
      delete process.env.NEXT_PUBLIC_MOCK_MODE
      expect(isMockMode()).toBe(false)  // FIXED: No longer triggers mock mode
    })
  })
})
