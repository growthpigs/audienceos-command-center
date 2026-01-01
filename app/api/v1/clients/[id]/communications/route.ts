import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Communication = Database['public']['Tables']['communication']['Row']

/**
 * GET /api/v1/clients/[id]/communications
 * List communications for a client with filtering and pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const source = searchParams.get('source') // 'slack' | 'gmail' | null
    const needsReply = searchParams.get('needs_reply') === 'true'
    const threadId = searchParams.get('thread_id')
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100)

    const supabase = await createRouteHandlerClient(cookies)

    // Build query
    let query = supabase
      .from('communication')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .order('received_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (source && (source === 'slack' || source === 'gmail')) {
      query = query.eq('platform', source)
    }

    if (needsReply) {
      query = query.eq('needs_reply', true)
    }

    if (threadId) {
      query = query.eq('thread_id', threadId)
    }

    // Cursor-based pagination
    if (cursor) {
      query = query.lt('received_at', cursor)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching communications:', error)
      return NextResponse.json(
        { error: 'internal_error', message: error.message },
        { status: 500 }
      )
    }

    const items = (data || []) as Communication[]
    const lastItem = items[items.length - 1]
    const nextCursor = lastItem?.received_at || null
    const hasMore = items.length === limit

    return NextResponse.json({
      items,
      pagination: {
        cursor: nextCursor,
        has_more: hasMore,
        total: count || 0,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
