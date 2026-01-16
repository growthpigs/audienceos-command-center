import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'

/**
 * GET /api/v1/cartridges/voice
 * List all voice cartridges for the authenticated user's agency
 * Filters by type='voice' to ensure type safety
 */
export const GET = withPermission({ resource: 'cartridges', action: 'read' })(
  async (request: AuthenticatedRequest) => {
    try {
      const rateLimitResponse = withRateLimit(request, { maxRequests: 100, windowMs: 60000 })
      if (rateLimitResponse) return rateLimitResponse

      const supabase = await createRouteHandlerClient(cookies)
      const agencyId = request.user.agencyId

      const { data: cartridges, error } = await supabase
        .from('cartridges')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('type', 'voice')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Voice Cartridges GET] Query error:', error)
        return createErrorResponse(500, 'Failed to fetch voice cartridges')
      }

      return NextResponse.json({
        success: true,
        data: cartridges || [],
        count: cartridges?.length || 0,
      })
    } catch (error) {
      console.error('[Voice Cartridges GET] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * POST /api/v1/cartridges/voice
 * Create new voice cartridge with tone, style, personality, vocabulary
 * Validates required 'name' field
 * All optional voice fields: voice_tone, voice_style, voice_personality, voice_vocabulary
 */
export const POST = withPermission({ resource: 'cartridges', action: 'write' })(
  async (request: AuthenticatedRequest) => {
    try {
      const rateLimitResponse = withRateLimit(request, { maxRequests: 30, windowMs: 60000 })
      if (rateLimitResponse) return rateLimitResponse

      const csrfError = withCsrfProtection(request)
      if (csrfError) return csrfError

      const supabase = await createRouteHandlerClient(cookies)
      const agencyId = request.user.agencyId
      const userId = request.user.id

      const body = await request.json()
      const { name, voice_tone, voice_style, voice_personality, voice_vocabulary } = body

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return createErrorResponse(400, 'name is required')
      }

      // Prepare cartridge data
      const cartridgeData = {
        agency_id: agencyId,
        name: name.trim(),
        type: 'voice',
        tier: 'agency',
        is_active: true,
        voice_tone: voice_tone || null,
        voice_style: voice_style || null,
        voice_personality: voice_personality || null,
        voice_vocabulary: voice_vocabulary || null,
        created_by: userId,
      }

      const { data, error } = await supabase
        .from('cartridges')
        .insert([cartridgeData])
        .select()
        .single()

      if (error) {
        console.error('[Voice Cartridge POST] Error:', error)
        return createErrorResponse(500, 'Failed to create voice cartridge')
      }

      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse(400, 'Invalid JSON in request body')
      }

      console.error('[Voice Cartridge POST] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
