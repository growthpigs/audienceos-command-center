import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, sanitizeString, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import type { VoiceCartridge } from '@/types/cartridges'

/**
 * POST /api/v1/cartridges/voice
 * Create or update voice cartridge
 */
export const POST = withPermission({ resource: 'ai-features', action: 'write' })(
  async (request: AuthenticatedRequest) => {
    const rateLimitResponse = withRateLimit(request, { maxRequests: 10, windowMs: 60000 })
    if (rateLimitResponse) return rateLimitResponse

    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const body = await request.json()
      const agencyId = request.user.agencyId

      // Validate required fields
      if (!body.name || typeof body.name !== 'string') {
        return createErrorResponse(400, 'Voice name is required')
      }

      const supabase = await createRouteHandlerClient(cookies)

      const cartridgeData = {
        agency_id: agencyId,
        name: sanitizeString(body.name),
        display_name: body.displayName ? sanitizeString(body.displayName) : null,
        system_instructions: body.systemInstructions ? sanitizeString(body.systemInstructions) : null,
        voice_params: body.voiceParams || {},
        is_active: body.isActive !== false,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('voice_cartridges')
        .upsert([{ ...cartridgeData, created_at: new Date().toISOString() }], {
          onConflict: 'agency_id,name',
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data, { status: 200 })
    } catch (error) {
      console.error('[Voice Cartridge POST]', error)
      return createErrorResponse(500, 'Failed to save voice cartridge')
    }
  }
)
