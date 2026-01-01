import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Communication = Database['public']['Tables']['communication']['Row']

/**
 * GET /api/v1/communications/[id]/thread
 * Get full thread for a communication (all replies)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params
    const supabase = await createRouteHandlerClient(cookies)

    // First, get the message to find its thread_id
    const { data: message, error: msgError } = await supabase
      .from('communication')
      .select('thread_id')
      .eq('id', messageId)
      .single()

    if (msgError) {
      if (msgError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'not_found', message: 'Message not found' },
          { status: 404 }
        )
      }
      throw msgError
    }

    const msgData = message as { thread_id: string | null }

    // Use thread_id if it exists, otherwise the message is the thread root
    const threadId = msgData.thread_id || messageId

    // Get all messages in the thread
    const { data: threadMessages, error: threadError } = await supabase
      .from('communication')
      .select('*')
      .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
      .order('received_at', { ascending: true })

    if (threadError) {
      throw threadError
    }

    return NextResponse.json({
      thread_id: threadId,
      messages: (threadMessages || []) as Communication[],
      count: threadMessages?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching thread:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
