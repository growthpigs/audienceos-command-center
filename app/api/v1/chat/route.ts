/**
 * Chat API Route - HGC Integration
 *
 * POST /api/v1/chat - Send message and stream response
 * GET /api/v1/chat?sessionId=xxx - Get session history
 *
 * Security:
 * - SEC-006: Server-verified authentication via getAuthenticatedUser()
 * - SEC-007: Multi-tenant isolation via agencyId from database
 * - RLS enforced on chat_session and chat_message tables
 *
 * Ported from: Holy Grail Chat (HGC)
 * Part of: Phase 5 Integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getChatService } from '@/lib/chat/service';
import type { ChatRequest, StreamChunk, ChatMessage } from '@/lib/chat/types';
import {
  withRateLimit,
  createErrorResponse,
} from '@/lib/security';
import {
  createRouteHandlerClient,
  getAuthenticatedUser,
} from '@/lib/supabase';

/**
 * POST /api/v1/chat - Send message with streaming response
 *
 * Request body:
 * {
 *   message: string;
 *   sessionId?: string;
 *   stream?: boolean;
 * }
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 30 requests per minute per user
  const rateLimitResponse = withRateLimit(request, {
    maxRequests: 30,
    windowMs: 60000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabase = await createRouteHandlerClient(cookies);

    // Get authenticated user with server verification (SEC-006, SEC-007)
    const { user, agencyId, error: authError } = await getAuthenticatedUser(supabase);

    if (!user || !agencyId) {
      return createErrorResponse(401, authError || 'Unauthorized');
    }

    const body = await request.json();
    const {
      message,
      sessionId,
      stream = true,
    } = body as {
      message?: string;
      sessionId?: string;
      stream?: boolean;
    };

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return createErrorResponse(400, 'Message is required and must be non-empty');
    }

    if (message.length > 4000) {
      return createErrorResponse(400, 'Message exceeds maximum length (4000 characters)');
    }

    // Get chat service with authenticated context
    const chatService = getChatService({
      agencyId,
      userId: user.id,
      supabase,
    });

    // Stream the response
    if (stream) {
      return new NextResponse(
        new ReadableStream({
          async start(controller) {
            try {
              // Send message and get streaming response
              const streamIterator = await chatService.sendMessage({
                message: message.trim(),
                sessionId,
                stream: true,
              });

              for await (const chunk of streamIterator) {
                // Send each chunk to client
                const line = `data: ${JSON.stringify(chunk)}\n\n`;
                controller.enqueue(new TextEncoder().encode(line));
              }

              controller.close();
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Stream error';
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: 'error',
                    error: errorMessage,
                  })}\n\n`
                )
              );
              controller.close();
            }
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    // Non-streaming response
    const response = await chatService.sendMessage({
      message: message.trim(),
      sessionId,
      stream: false,
    });

    // Get all chunks (response should be a generator)
    const chunks: ChatMessage[] = [];
    for await (const chunk of response) {
      if (chunk.type === 'message') {
        chunks.push({
          id: chunk.id,
          role: chunk.role,
          content: chunk.content,
          citations: chunk.citations,
          route: chunk.route,
          timestamp: chunk.timestamp,
        });
      }
    }

    return NextResponse.json({
      messages: chunks,
      sessionId: chunks[0]?.sessionId || sessionId,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Chat API] Error:', error);
    }
    return createErrorResponse(500, 'Failed to process chat message');
  }
}

/**
 * GET /api/v1/chat?sessionId=xxx - Get session history
 */
export async function GET(request: NextRequest) {
  // Rate limiting: 60 requests per minute
  const rateLimitResponse = withRateLimit(request, {
    maxRequests: 60,
    windowMs: 60000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabase = await createRouteHandlerClient(cookies);

    // Get authenticated user
    const { user, agencyId, error: authError } = await getAuthenticatedUser(supabase);

    if (!user || !agencyId) {
      return createErrorResponse(401, authError || 'Unauthorized');
    }

    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return createErrorResponse(400, 'sessionId query parameter is required');
    }

    // Fetch session messages (RLS ensures agencyId isolation)
    const { data: messages, error } = await supabase
      .from('chat_message')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Chat API] Database error:', error);
      }
      return createErrorResponse(500, 'Failed to fetch messages');
    }

    return NextResponse.json({
      sessionId,
      messages: messages || [],
      count: messages?.length || 0,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Chat API] Error:', error);
    }
    return createErrorResponse(500, 'Internal server error');
  }
}
