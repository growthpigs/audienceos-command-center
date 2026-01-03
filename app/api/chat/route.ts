/**
 * Chat API Route
 *
 * API endpoint for Holy Grail Chat integration.
 * Part of: 3-System Consolidation
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient, getAuthenticatedUser } from '@/lib/supabase'
import { ChatService } from '@/lib/chat/service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient(cookies)

    // Get authenticated user with server verification
    const { user, agencyId, error: authError } = await getAuthenticatedUser(supabase)

    if (!user || !agencyId) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    let body: {
      message: string
      history?: Array<{ id: string; role: string; content: string; timestamp: string }>
      agencyId?: string
    }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { message, history = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Sanitize message
    const sanitizedMessage = message.trim().slice(0, 4000)
    if (!sanitizedMessage) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    // Get Gemini API key
    const geminiApiKey = process.env.GOOGLE_AI_API_KEY
    if (!geminiApiKey) {
      console.error('GOOGLE_AI_API_KEY is not set')
      return NextResponse.json(
        { error: 'Chat service not configured' },
        { status: 500 }
      )
    }

    // Create chat service
    const chatService = new ChatService({
      agencyId,
      userId: user.id,
      geminiApiKey,
    })

    // Convert history to ChatMessage format
    const chatHistory = history.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }))

    // Process message
    const response = await chatService.processMessage(sanitizedMessage, chatHistory)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
