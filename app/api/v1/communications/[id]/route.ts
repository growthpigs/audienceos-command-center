import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Communication = Database['public']['Tables']['communication']['Row']
type CommunicationUpdate = Database['public']['Tables']['communication']['Update']

/**
 * GET /api/v1/communications/[id]
 * Get a single communication with thread context
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteHandlerClient(cookies)

    const { data, error } = await supabase
      .from('communication')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'not_found', message: 'Communication not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching communication:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/v1/communications/[id]
 * Update communication (mark as read, needs_reply flag, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createRouteHandlerClient(cookies)

    // Allowed update fields
    const allowedFields: (keyof CommunicationUpdate)[] = ['needs_reply', 'replied_at', 'replied_by']
    const updates: CommunicationUpdate = {}

    for (const field of allowedFields) {
      if (field in body) {
        (updates as Record<string, unknown>)[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'validation_error', message: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('communication')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'not_found', message: 'Communication not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating communication:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
