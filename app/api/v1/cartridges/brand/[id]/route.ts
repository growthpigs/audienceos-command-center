import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'

/**
 * GET /api/v1/cartridges/brand/[id]
 * Fetch a single brand cartridge by ID
 * Verifies type='brand' to ensure type safety
 */
export const GET = withPermission({ resource: 'cartridges', action: 'read' })(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const supabase = await createRouteHandlerClient(cookies)

      const { data: cartridge, error } = await supabase
        .from('cartridges')
        .select('*')
        .eq('id', params.id)
        .eq('type', 'brand')
        .single()

      if (error || !cartridge) {
        return createErrorResponse(404, 'Brand cartridge not found')
      }

      return NextResponse.json({
        success: true,
        data: cartridge,
      })
    } catch (error) {
      console.error('[Brand Cartridge GET] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * PATCH /api/v1/cartridges/brand/[id]
 * Update a brand cartridge
 * Can update: brand_name, brand_tagline, brand_values, brand_logo_url, name, description
 * Type is always 'brand' - enforced in WHERE clause for safety
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
        .eq('type', 'brand')

      if (error) {
        console.error('[Brand Cartridge PATCH] Error:', error)
        return createErrorResponse(500, 'Failed to update brand cartridge')
      }

      return NextResponse.json({
        success: true,
        message: 'Brand cartridge updated',
      })
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse(400, 'Invalid JSON in request body')
      }

      console.error('[Brand Cartridge PATCH] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * DELETE /api/v1/cartridges/brand/[id]
 * Delete a brand cartridge
 * Type is always 'brand' - enforced in WHERE clause for safety
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
        .eq('type', 'brand')

      if (error) {
        console.error('[Brand Cartridge DELETE] Error:', error)
        return createErrorResponse(500, 'Failed to delete brand cartridge')
      }

      return NextResponse.json({
        success: true,
        message: 'Brand cartridge deleted',
      })
    } catch (error) {
      console.error('[Brand Cartridge DELETE] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
