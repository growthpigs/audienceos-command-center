/**
 * Action Types API
 * GET /api/v1/workflows/actions/types - Available action types with schemas
 */

import { NextResponse } from 'next/server'
import { getActionTypes, AVAILABLE_VARIABLES, DELAY_PRESETS } from '@/lib/workflows'

export async function GET() {
  const actionTypes = getActionTypes()

  return NextResponse.json({
    types: actionTypes,
    variables: AVAILABLE_VARIABLES,
    delayPresets: DELAY_PRESETS,
  })
}
