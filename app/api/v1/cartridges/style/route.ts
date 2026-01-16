import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'

/**
 * GET /api/v1/cartridges/style
 * List all style cartridges for the authenticated user's agency
 * Filters by type='style' to ensure type safety
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
        .eq('type', 'style')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Style Cartridges GET] Query error:', error)
        return createErrorResponse(500, 'Failed to fetch style cartridges')
      }

      return NextResponse.json({
        success: true,
        data: cartridges || [],
        count: cartridges?.length || 0,
      })
    } catch (error) {
      console.error('[Style Cartridges GET] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * POST /api/v1/cartridges/style
 * Create new style cartridge with style_primary_color, style_secondary_color, style_fonts
 * Validates required 'name' field
 * All optional style fields: style_primary_color, style_secondary_color, style_fonts
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
      const { name, style_primary_color, style_secondary_color, style_fonts } = body

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return createErrorResponse(400, 'name is required')
      }

      // Prepare cartridge data
      const cartridgeData = {
        agency_id: agencyId,
        name: name.trim(),
        type: 'style',
        tier: 'agency',
        is_active: true,
        style_primary_color: style_primary_color || null,
        style_secondary_color: style_secondary_color || null,
        style_fonts: style_fonts || null,
        created_by: userId,
      }

      const { data, error } = await supabase
        .from('cartridges')
        .insert([cartridgeData])
        .select()
        .single()

      if (error) {
        console.error('[Style Cartridge POST] Error:', error)
        return createErrorResponse(500, 'Failed to create style cartridge')
      }

      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse(400, 'Invalid JSON in request body')
      }

      console.error('[Style Cartridge POST] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
