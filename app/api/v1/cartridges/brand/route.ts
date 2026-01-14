import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, sanitizeString, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import type { BrandCartridge } from '@/types/cartridges'

/**
 * POST /api/v1/cartridges/brand
 * Save or update brand cartridge for agency
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
        return createErrorResponse(400, 'Company name is required')
      }

      const supabase = await createRouteHandlerClient(cookies)

      // Check if brand cartridge exists for this agency
      const { data: existing } = await supabase
        .from('brand_cartridges')
        .select('*')
        .eq('agency_id', agencyId)
        .single()

      const cartridgeData = {
        agency_id: agencyId,
        name: sanitizeString(body.name),
        company_name: body.companyName ? sanitizeString(body.companyName) : null,
        company_description: body.companyDescription ? sanitizeString(body.companyDescription) : null,
        company_tagline: body.companyTagline ? sanitizeString(body.companyTagline) : null,
        industry: body.industry ? sanitizeString(body.industry) : null,
        target_audience: body.targetAudience ? sanitizeString(body.targetAudience) : null,
        core_values: body.coreValues || [],
        brand_voice: body.brandVoice ? sanitizeString(body.brandVoice) : null,
        brand_personality: body.brandPersonality || [],
        logo_url: body.logoUrl || null,
        brand_colors: body.brandColors || {},
        social_links: body.socialLinks || {},
        core_messaging: body.coreMessaging ? sanitizeString(body.coreMessaging) : null,
        benson_blueprint: body.bensonBlueprint || null,
        updated_at: new Date().toISOString(),
      }

      let result
      if (existing) {
        const { data, error } = await supabase
          .from('brand_cartridges')
          .update(cartridgeData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('brand_cartridges')
          .insert([{ ...cartridgeData, created_at: new Date().toISOString() }])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      return NextResponse.json(result, { status: 200 })
    } catch (error) {
      console.error('[Brand Cartridge POST]', error)
      return createErrorResponse(500, 'Failed to save brand cartridge')
    }
  }
)

/**
 * DELETE /api/v1/cartridges/brand
 * Delete brand cartridge for agency
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
        .from('brand_cartridges')
        .delete()
        .eq('agency_id', agencyId)

      if (error) throw error

      return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
      console.error('[Brand Cartridge DELETE]', error)
      return createErrorResponse(500, 'Failed to delete brand cartridge')
    }
  }
)
