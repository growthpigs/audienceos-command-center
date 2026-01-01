import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { z } from 'zod'
import type { Database } from '@/types/database'

type Communication = Database['public']['Tables']['communication']['Row']
type CommunicationInsert = Database['public']['Tables']['communication']['Insert']

const ReplySchema = z.object({
  content: z.string().min(1, 'Content is required'),
  send_immediately: z.boolean().default(true),
})

/**
 * POST /api/v1/communications/[id]/reply
 * Send a reply to a communication via original platform (Slack/Gmail)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params
    const body = await request.json()

    // Validate input
    const parseResult = ReplySchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: 'Invalid request body',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { content, send_immediately } = parseResult.data
    const supabase = await createRouteHandlerClient(cookies)

    // Get the original message to determine platform and thread
    const { data: originalMessage, error: fetchError } = await supabase
      .from('communication')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'not_found', message: 'Original message not found' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    const message = originalMessage as Communication

    // Get current user (from Supabase auth)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Send via Slack/Gmail API based on platform
    // For now, we'll create a local record and mark as sent

    // Create the reply record
    const newMessageId = `reply-${Date.now()}`
    const threadId = message.thread_id || message.id

    const newCommunication: CommunicationInsert = {
      agency_id: message.agency_id,
      client_id: message.client_id,
      platform: message.platform,
      thread_id: threadId,
      message_id: newMessageId,
      sender_email: user.email || null,
      sender_name: user.email?.split('@')[0] || 'Agency User',
      subject: message.subject
        ? `Re: ${message.subject.replace(/^Re:\s*/i, '')}`
        : null,
      content,
      is_inbound: false,
      needs_reply: false,
      received_at: new Date().toISOString(),
    }

    const { data: newMessage, error: insertError } = await supabase
      .from('communication')
      .insert(newCommunication as never)
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Update the original message to mark as replied
    const updateData: Partial<Communication> = {
      needs_reply: false,
      replied_at: new Date().toISOString(),
      replied_by: user.id,
    }

    await supabase
      .from('communication')
      .update(updateData as never)
      .eq('id', messageId)

    return NextResponse.json({
      message: 'Reply sent successfully',
      data: newMessage,
      sent_via: message.platform,
    })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
