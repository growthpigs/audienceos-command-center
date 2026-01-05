import { NextRequest, NextResponse } from 'next/server';

/**
 * Chat API v1 - Not yet implemented
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
        citations: [],
      },
    },
    { status: 501 } // 501 Not Implemented
  );
}
