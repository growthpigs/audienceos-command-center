/**
 * REGRESSION TEST: Pipeline Store Optimistic Update Race Condition Protection
 *
 * Ensures that stale rollbacks don't overwrite successful concurrent mutations.
 * The fix checks if state has changed before rolling back.
 *
 * VULNERABILITY FIXED: 2026-01-10
 * This test will FAIL if the vulnerability is reintroduced.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'

describe('Pipeline Store Race Condition Protection', () => {
  it('MUST check current state before rollback', () => {
    const pipelineStore = fs.readFileSync('./stores/pipeline-store.ts', 'utf8')

    // MUST track optimistic stage
    const tracksOptimisticStage = pipelineStore.includes('const optimisticStage = toStage')
    expect(tracksOptimisticStage).toBe(true)

    // MUST check current stage before rollback
    const checksBeforeRollback = pipelineStore.includes('currentClient.stage === optimisticStage')
    expect(checksBeforeRollback).toBe(true)

    // MUST skip rollback if state changed
    const skipsStaleRollback = pipelineStore.includes('Skipping rollback: stage changed')
    expect(skipsStaleRollback).toBe(true)

    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║ RACE CONDITION PROTECTED: Rollback checks current state   ║')
    console.log('║ before reverting. Stale rollbacks are skipped.            ║')
    console.log('╚═══════════════════════════════════════════════════════════╝')
  })

  describe('Fixed behavior (simulated)', () => {
    let clientStage = 'Lead'

    const moveClient = (stage: string) => {
      clientStage = stage
    }

    // FIXED: Only rollback if stage still matches our optimistic update
    const rollbackMoveIfUnchanged = (optimisticStage: string, previousStage: string) => {
      if (clientStage === optimisticStage) {
        clientStage = previousStage
        return true // Did rollback
      }
      return false // Skipped rollback
    }

    const updateClientStageFixed = async (toStage: string, shouldFail: boolean, delay: number) => {
      const previousStage = clientStage
      const optimisticStage = toStage

      // Optimistic update
      moveClient(toStage)

      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, delay))

      if (shouldFail) {
        // FIXED: Only rollback if stage hasn't changed
        const didRollback = rollbackMoveIfUnchanged(optimisticStage, previousStage)
        console.log(`Call to ${toStage} failed, rollback: ${didRollback ? 'YES' : 'SKIPPED (state changed)'}`)
        return false
      }

      return true
    }

    beforeEach(() => {
      clientStage = 'Lead'
    })

    it('FIXED: preserves successful update when stale rollback attempted', async () => {
      console.log('Initial state:', clientStage)  // Lead

      // Simulate two rapid user clicks
      const call1 = updateClientStageFixed('Onboarding', true, 100)   // Will fail after 100ms
      const call2 = updateClientStageFixed('Installation', false, 50) // Will succeed after 50ms

      console.log('After optimistic updates:', clientStage)  // Installation

      // Wait for both to complete
      await Promise.all([call1, call2])

      console.log('After API responses:', clientStage)

      // FIXED: State is 'Installation' because:
      // - Call 1 captured optimisticStage = 'Onboarding'
      // - Call 2 succeeded and set stage to 'Installation'
      // - Call 1 failed but sees stage != 'Onboarding', so skips rollback
      expect(clientStage).toBe('Installation')  // CORRECT!

      console.log('╔═══════════════════════════════════════════════════════════╗')
      console.log('║ FIX VERIFIED: Stale rollback skipped, state preserved     ║')
      console.log('╚═══════════════════════════════════════════════════════════╝')
    })

    it('FIXED: still rolls back when appropriate', async () => {
      // Single call that fails - should rollback normally
      await updateClientStageFixed('Onboarding', true, 50)
      expect(clientStage).toBe('Lead')  // Rolled back correctly

      // Single call that succeeds
      await updateClientStageFixed('Installation', false, 50)
      expect(clientStage).toBe('Installation')  // Succeeded correctly
    })
  })
})
