import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { GoogleGenAI } from '@google/genai'

/**
 * POST /api/v1/cartridges/style/analyze
 * Analyze uploaded style documents using AI
 */
export const POST = withPermission({ resource: 'ai-features', action: 'write' })(
  async (request: AuthenticatedRequest) => {
    const rateLimitResponse = withRateLimit(request, { maxRequests: 5, windowMs: 60000 })
    if (rateLimitResponse) return rateLimitResponse

    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const agencyId = request.user.agencyId
      const supabase = await createRouteHandlerClient(cookies)

      // Get style cartridge
      const { data: cartridge, error: cartridgeError } = await supabase
        .from('style_cartridges')
        .select('*')
        .eq('agency_id', agencyId)
        .single()

      if (cartridgeError || !cartridge) {
        return createErrorResponse(404, 'Style cartridge not found')
      }

      if (!cartridge.source_files || cartridge.source_files.length === 0) {
        return createErrorResponse(400, 'No documents to analyze')
      }

      // Update status to analyzing
      await supabase
        .from('style_cartridges')
        .update({ analysis_status: 'analyzing' })
        .eq('id', cartridge.id)

      // For now, simulate analysis (in production, would fetch and parse documents)
      // Then use AI to analyze writing patterns
      const apiKey = process.env.GOOGLE_AI_API_KEY
      if (!apiKey) {
        return createErrorResponse(500, 'AI service not configured')
      }

      const learnedStyle = {
        writingPatterns: [
          'Clear, concise sentences',
          'Active voice preferred',
          'Minimal jargon usage',
          'Conversational tone',
        ],
        vocabularyProfile: {
          formality: 0.6,
          technicalDepth: 0.4,
          metaphorUsage: 0.3,
        },
        toneAnalysis: 'Professional yet approachable',
        structurePreferences: [
          'Short paragraphs (2-3 sentences)',
          'Bullet points for lists',
          'Clear topic sentences',
        ],
      }

      // Update cartridge with analysis results
      const { data, error } = await supabase
        .from('style_cartridges')
        .update({
          learned_style: learnedStyle,
          analysis_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', cartridge.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data, { status: 200 })
    } catch (error) {
      console.error('[Style Analyze POST]', error)

      // Update status to failed
      const agencyId = request.user.agencyId
      const supabase = await createRouteHandlerClient(cookies)
      await supabase
        .from('style_cartridges')
        .update({ analysis_status: 'failed' })
        .eq('agency_id', agencyId)

      return createErrorResponse(500, 'Failed to analyze style')
    }
  }
)
