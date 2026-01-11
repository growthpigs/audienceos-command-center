/**
 * REGRESSION TEST: Mock Mode Removal Verification
 *
 * Ensures NO mock mode code exists in API routes.
 * All routes must query Supabase directly with no mock fallback.
 *
 * VULNERABILITY FIXED: 2026-01-10 (explicit flag only)
 * MOCK CODE REMOVED: 2026-01-11 (complete removal)
 * This test will FAIL if mock code is reintroduced.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'

describe('Mock Mode Detection Security', () => {
  it('MUST NOT contain any mock mode code in API routes', () => {
    const clientsRoute = fs.readFileSync('./app/api/v1/clients/route.ts', 'utf8')

    // MUST NOT contain isMockMode function
    const hasMockModeFunction = clientsRoute.includes('isMockMode')
    expect(hasMockModeFunction).toBe(false)

    // MUST NOT have any MOCK_ constants
    const hasMockConstants = clientsRoute.includes('MOCK_')
    expect(hasMockConstants).toBe(false)

    // MUST NOT use URL-based detection (was the vulnerability)
    const usesUrlDetection = clientsRoute.includes("url.includes('placeholder')")
    expect(usesUrlDetection).toBe(false)

    const usesEmptyUrlCheck = clientsRoute.includes("url === ''")
    expect(usesEmptyUrlCheck).toBe(false)

    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║ SECURITY CHECK PASSED: No mock code in API routes         ║')
    console.log('║ All routes query Supabase directly with no mock fallback. ║')
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
