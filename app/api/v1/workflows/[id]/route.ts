/**
 * Single Workflow API - Get, Update, Delete
 * GET /api/v1/workflows/{id} - Get automation details
 * PATCH /api/v1/workflows/{id} - Update automation
 * DELETE /api/v1/workflows/{id} - Soft-delete automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import {
  getWorkflowWithStats,
  updateWorkflow,
  deleteWorkflow,
  validateTriggerConfig,
  validateActionConfig,
} from '@/lib/workflows'
import type { WorkflowTrigger, WorkflowAction } from '@/types/workflow'

type RouteContext = { params: Promise<{ id: string }> }

// ============================================================================
// GET /api/v1/workflows/{id}
// ============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createRouteHandlerClient(cookies)

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

    const { data, error } = await getWorkflowWithStats(supabase, id, agencyId)

    if (error) {
      return NextResponse.json(
        { error: 'internal_error', message: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'not_found', message: 'Workflow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/v1/workflows/[id] error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/v1/workflows/{id}
// ============================================================================

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createRouteHandlerClient(cookies)

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

    const body = await request.json()
    const { name, description, triggers, actions, isActive } = body

    // Validate if triggers provided
    if (triggers !== undefined) {
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
    }

    // Validate if actions provided
    if (actions !== undefined) {
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
    }

    const { data, error } = await updateWorkflow(supabase, id, agencyId, {
      name: name?.trim(),
      description: description?.trim(),
      triggers,
      actions,
      isActive,
    })

    if (error) {
      return NextResponse.json(
        { error: 'internal_error', message: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'not_found', message: 'Workflow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('PATCH /api/v1/workflows/[id] error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/v1/workflows/{id}
// ============================================================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createRouteHandlerClient(cookies)

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

    // TODO: Check for pending runs and cancel them

    const { error } = await deleteWorkflow(supabase, id, agencyId)

    if (error) {
      return NextResponse.json(
        { error: 'internal_error', message: error.message },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/v1/workflows/[id] error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
