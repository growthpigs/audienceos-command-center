import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

/**
 * POST /api/v1/cartridges/preferences
 * Save or update preferences cartridge
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

      const supabase = await createRouteHandlerClient(cookies)

      // Check if preferences exist for this agency
      const { data: existing } = await supabase
        .from('preferences_cartridges')
        .select('*')
        .eq('agency_id', agencyId)
        .single()

      const preferencesData = {
        agency_id: agencyId,
        language: body.language || 'English',
        platform: body.platform || 'LinkedIn',
        tone: body.tone || 'Professional',
        content_length: body.contentLength || 'Medium',
        hashtag_count: body.hashtagCount || 3,
        emoji_usage: body.emojiUsage || 'Minimal',
        call_to_action: body.callToAction || 'Clear',
        personalization_level: body.personalizationLevel || 'Medium',
        updated_at: new Date().toISOString(),
      }

      let result
      if (existing) {
        const { data, error } = await supabase
          .from('preferences_cartridges')
          .update(preferencesData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('preferences_cartridges')
          .insert([{ ...preferencesData, created_at: new Date().toISOString() }])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      return NextResponse.json(result, { status: 200 })
    } catch (error) {
      console.error('[Preferences Cartridge POST]', error)
      return createErrorResponse(500, 'Failed to save preferences')
    }
  }
)

/**
 * DELETE /api/v1/cartridges/preferences
 * Delete preferences cartridge
 */
export const DELETE = withPermission({ resource: 'ai-features', action: 'write' })(
  async (request: AuthenticatedRequest) => {
    const rateLimitResponse = withRateLimit(request, { maxRequests: 10, windowMs: 60000 })
    if (rateLimitResponse) return rateLimitResponse

    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const agencyId = request.user.agencyId
      const supabase = await createRouteHandlerClient(cookies)

      const { error } = await supabase
        .from('preferences_cartridges')
        .delete()
        .eq('agency_id', agencyId)

      if (error) throw error

      return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
      console.error('[Preferences Cartridge DELETE]', error)
      return createErrorResponse(500, 'Failed to delete preferences')
    }
  }
)
