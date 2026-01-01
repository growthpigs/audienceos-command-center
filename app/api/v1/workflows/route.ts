/**
 * Workflows API - List and Create
 * GET /api/v1/workflows - List automations with filtering
 * POST /api/v1/workflows - Create new automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import {
  getWorkflows,
  createWorkflow,
  validateTriggerConfig,
  validateActionConfig,
} from '@/lib/workflows'
import type { WorkflowTrigger, WorkflowAction } from '@/types/workflow'

// ============================================================================
// GET /api/v1/workflows
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient(cookies)

    // Get current user and agency
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized', message: 'Not authenticated' }, { status: 401 })
    }

    // Get agency_id from user metadata or JWT
    const agencyId = user.user_metadata?.agency_id
    if (!agencyId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'No agency associated' },
        { status: 403 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const isActiveParam = searchParams.get('enabled')
    const search = searchParams.get('q') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const filters = {
      isActive: isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined,
      search,
      limit: Math.min(limit, 100),
    }

    const { data, error, count } = await getWorkflows(supabase, agencyId, filters)

    if (error) {
      return NextResponse.json(
        { error: 'internal_error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: data,
      pagination: {
        total: count,
        has_more: (data?.length ?? 0) < count,
      },
    })
  } catch (error) {
    console.error('GET /api/v1/workflows error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/v1/workflows
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient(cookies)

    // Get current user and agency
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized', message: 'Not authenticated' }, { status: 401 })
    }

    const agencyId = user.user_metadata?.agency_id
    if (!agencyId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'No agency associated' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, description, triggers, actions, isActive } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'validation_error', message: 'Name is required', details: { field: 'name' } },
        { status: 400 }
      )
    }

    if (!Array.isArray(triggers) || triggers.length === 0) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'At least one trigger is required',
          details: { field: 'triggers' },
        },
        { status: 400 }
      )
    }

    if (triggers.length > 2) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Maximum 2 triggers allowed',
          details: { field: 'triggers' },
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'At least one action is required',
          details: { field: 'actions' },
        },
        { status: 400 }
      )
    }

    // Validate triggers
    const triggerErrors: string[] = []
    for (const trigger of triggers as WorkflowTrigger[]) {
      const validation = validateTriggerConfig(trigger)
      if (!validation.valid) {
        triggerErrors.push(...validation.errors)
      }
    }

    if (triggerErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid trigger configuration',
          details: { field: 'triggers', errors: triggerErrors },
        },
        { status: 400 }
      )
    }

    // Validate actions
    const actionErrors: string[] = []
    for (const action of actions as WorkflowAction[]) {
      const validation = validateActionConfig(action)
      if (!validation.valid) {
        actionErrors.push(...validation.errors)
      }
    }

    if (actionErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid action configuration',
          details: { field: 'actions', errors: actionErrors },
        },
        { status: 400 }
      )
    }

    // Create workflow
    const { data, error } = await createWorkflow(supabase, agencyId, user.id, {
      name: name.trim(),
      description: description?.trim(),
      triggers,
      actions,
      isActive: isActive ?? true,
    })

    if (error) {
      return NextResponse.json(
        { error: 'internal_error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/v1/workflows error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
