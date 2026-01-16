import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'

/**
 * GET /api/v1/cartridges/brand
 * List all brand cartridges for the authenticated user's agency
 * Filters by type='brand' to ensure type safety
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
        .eq('type', 'brand')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Brand Cartridges GET] Query error:', error)
        return createErrorResponse(500, 'Failed to fetch brand cartridges')
      }

      return NextResponse.json({
        success: true,
        data: cartridges || [],
        count: cartridges?.length || 0,
      })
    } catch (error) {
      console.error('[Brand Cartridges GET] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * POST /api/v1/cartridges/brand
 * Create new brand cartridge with brand_name, brand_tagline, brand_values, brand_logo_url
 * Validates required 'name' field
 * All optional brand fields: brand_name, brand_tagline, brand_values, brand_logo_url
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
      const { name, brand_name, brand_tagline, brand_values, brand_logo_url } = body

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return createErrorResponse(400, 'name is required')
      }

      // Prepare cartridge data
      const cartridgeData = {
        agency_id: agencyId,
        name: name.trim(),
        type: 'brand',
        tier: 'agency',
        is_active: true,
        brand_name: brand_name || null,
        brand_tagline: brand_tagline || null,
        brand_values: brand_values || null,
        brand_logo_url: brand_logo_url || null,
        created_by: userId,
      }

      const { data, error } = await supabase
        .from('cartridges')
        .insert([cartridgeData])
        .select()
        .single()

      if (error) {
        console.error('[Brand Cartridge POST] Error:', error)
        return createErrorResponse(500, 'Failed to create brand cartridge')
      }

      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse(400, 'Invalid JSON in request body')
      }

      console.error('[Brand Cartridge POST] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
