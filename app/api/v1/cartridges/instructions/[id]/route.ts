import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'

/**
 * GET /api/v1/cartridges/instructions/[id]
 * Fetch a single instructions cartridge by ID
 * Verifies type='instructions' to ensure type safety
 */
export const GET = withPermission({ resource: 'cartridges', action: 'read' })(
  async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const supabase = await createRouteHandlerClient(cookies)

      const { data: cartridge, error } = await supabase
        .from('cartridges')
        .select('*')
        .eq('id', params.id)
        .eq('type', 'instructions')
        .single()

      if (error || !cartridge) {
        return createErrorResponse(404, 'Instructions cartridge not found')
      }

      return NextResponse.json({
        success: true,
        data: cartridge,
      })
    } catch (error) {
      console.error('[Instructions Cartridge GET] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * PATCH /api/v1/cartridges/instructions/[id]
 * Update an instructions cartridge
 * Can update: instructions_system_prompt, instructions_rules, name, description
 * Type is always 'instructions' - enforced in WHERE clause for safety
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
        .eq('type', 'instructions')

      if (error) {
        console.error('[Instructions Cartridge PATCH] Error:', error)
        return createErrorResponse(500, 'Failed to update instructions cartridge')
      }

      return NextResponse.json({
        success: true,
        message: 'Instructions cartridge updated',
      })
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse(400, 'Invalid JSON in request body')
      }

      console.error('[Instructions Cartridge PATCH] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

/**
 * DELETE /api/v1/cartridges/instructions/[id]
 * Delete an instructions cartridge
 * Type is always 'instructions' - enforced in WHERE clause for safety
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
        .eq('type', 'instructions')

      if (error) {
        console.error('[Instructions Cartridge DELETE] Error:', error)
        return createErrorResponse(500, 'Failed to delete instructions cartridge')
      }

      return NextResponse.json({
        success: true,
        message: 'Instructions cartridge deleted',
      })
    } catch (error) {
      console.error('[Instructions Cartridge DELETE] Unexpected error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
