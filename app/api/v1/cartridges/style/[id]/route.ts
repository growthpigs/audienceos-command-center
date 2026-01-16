import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'

/**
 * GET /api/v1/cartridges/style/[id]
 * Fetch a single style cartridge by ID
 * Verifies type='style' to ensure type safety
 */
export const GET = withPermission({ resource: 'cartridges', action: 'read' })(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const supabase = await createRouteHandlerClient(cookies)

      const { data: cartridge, error } = await supabase
        .from('cartridges')
        .select('*')
        .eq('id', params.id)
        .eq('type', 'style')
        .single()

      if (error || !cartridge) {
        return createErrorResponse(404, 'Style cartridge not found')
      }

      return NextResponse.json({
        success: true,
        data: cartridge,
      })
    } catch (error) {
      console.error('[Style Cartridge GET] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * PATCH /api/v1/cartridges/style/[id]
 * Update a style cartridge
 * Can update: style_primary_color, style_secondary_color, style_fonts, name, description
 * Type is always 'style' - enforced in WHERE clause for safety
 */
export const PATCH = withPermission({ resource: 'cartridges', action: 'write' })(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const rateLimitResponse = withRateLimit(request, { maxRequests: 30, windowMs: 60000 })
      if (rateLimitResponse) return rateLimitResponse

      const csrfError = withCsrfProtection(request)
      if (csrfError) return csrfError

      const supabase = await createRouteHandlerClient(cookies)
      const body = await request.json()

      // Add updated_at timestamp
      const updateData = {
        ...body,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('cartridges')
        .update(updateData)
        .eq('id', params.id)
        .eq('type', 'style')

      if (error) {
        console.error('[Style Cartridge PATCH] Error:', error)
        return createErrorResponse(500, 'Failed to update style cartridge')
      }

      return NextResponse.json({
        success: true,
        message: 'Style cartridge updated',
      })
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse(400, 'Invalid JSON in request body')
      }

      console.error('[Style Cartridge PATCH] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * DELETE /api/v1/cartridges/style/[id]
 * Delete a style cartridge
 * Type is always 'style' - enforced in WHERE clause for safety
 */
export const DELETE = withPermission({ resource: 'cartridges', action: 'write' })(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const rateLimitResponse = withRateLimit(request, { maxRequests: 30, windowMs: 60000 })
      if (rateLimitResponse) return rateLimitResponse

      const csrfError = withCsrfProtection(request)
      if (csrfError) return csrfError

      const supabase = await createRouteHandlerClient(cookies)

      const { error } = await supabase
        .from('cartridges')
        .delete()
        .eq('id', params.id)
        .eq('type', 'style')

      if (error) {
        console.error('[Style Cartridge DELETE] Error:', error)
        return createErrorResponse(500, 'Failed to delete style cartridge')
      }

      return NextResponse.json({
        success: true,
        message: 'Style cartridge deleted',
      })
    } catch (error) {
      console.error('[Style Cartridge DELETE] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
