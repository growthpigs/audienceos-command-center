import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'

/**
 * GET /api/v1/cartridges/instructions
 * List all instructions cartridges for the authenticated user's agency
 * Filters by type='instructions' to ensure type safety
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
        .eq('type', 'instructions')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Instructions Cartridges GET] Query error:', error)
        return createErrorResponse(500, 'Failed to fetch instructions cartridges')
      }

      return NextResponse.json({
        success: true,
        data: cartridges || [],
        count: cartridges?.length || 0,
      })
    } catch (error) {
      console.error('[Instructions Cartridges GET] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * POST /api/v1/cartridges/instructions
 * Create new instructions cartridge with instructions_system_prompt, instructions_rules
 * Validates required 'name' field
 * All optional instructions fields: instructions_system_prompt, instructions_rules
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
      const { name, instructions_system_prompt, instructions_rules } = body

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return createErrorResponse(400, 'name is required')
      }

      // Prepare cartridge data
      const cartridgeData = {
        agency_id: agencyId,
        name: name.trim(),
        type: 'instructions',
        tier: 'agency',
        is_active: true,
        instructions_system_prompt: instructions_system_prompt || null,
        instructions_rules: instructions_rules || null,
        created_by: userId,
      }

      const { data, error } = await supabase
        .from('cartridges')
        .insert([cartridgeData])
        .select()
        .single()

      if (error) {
        console.error('[Instructions Cartridge POST] Error:', error)
        return createErrorResponse(500, 'Failed to create instructions cartridge')
      }

      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse(400, 'Invalid JSON in request body')
      }

      console.error('[Instructions Cartridge POST] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
