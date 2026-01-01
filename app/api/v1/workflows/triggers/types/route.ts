/**
 * Trigger Types API
 * GET /api/v1/workflows/triggers/types - Available trigger types with schemas
 */

import { NextResponse } from 'next/server'
import { getTriggerTypes, COMMON_SCHEDULES, AVAILABLE_TIMEZONES } from '@/lib/workflows'

export async function GET() {
  const triggerTypes = getTriggerTypes()

  return NextResponse.json({
    types: triggerTypes,
    schedules: COMMON_SCHEDULES,
    timezones: AVAILABLE_TIMEZONES,
  })
}
