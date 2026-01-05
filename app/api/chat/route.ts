/**
 * Chat API Route
 *
 * API endpoint for Holy Grail Chat integration.
 * Part of: 3-System Consolidation
 * Updated: 2026-01-04 - Wired RAG, Web, Memory routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/security'

/**
 * Chat endpoint - not yet implemented
 *
 * This endpoint will be completed in a future phase.
 * For now, it returns a placeholder response.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      message: {
        id: 'temp-id',
        role: 'assistant',
        content: 'Chat functionality is coming soon! Please try again in a future version.',
        timestamp: new Date().toISOString(),
      },
    },
    { status: 501 } // 501 Not Implemented
  )
}
