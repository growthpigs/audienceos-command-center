import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, isValidUUID, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

/**
 * DELETE /api/v1/cartridges/instructions/[id]
 * Delete instruction set
 */
export const DELETE = withPermission({ resource: 'ai-features', action: 'write' })(
  async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const rateLimitResponse = withRateLimit(request, { maxRequests: 10, windowMs: 60000 })
    if (rateLimitResponse) return rateLimitResponse

    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const { id } = await params
      const agencyId = request.user.agencyId

      if (!isValidUUID(id)) {
        return createErrorResponse(400, 'Invalid instruction ID format')
      }

      const supabase = await createRouteHandlerClient(cookies)

      // Verify instruction belongs to agency
      const { data: instruction } = await supabase
        .from('instruction_cartridges')
        .select('*')
        .eq('id', id)
        .eq('agency_id', agencyId)
        .single()

      if (!instruction) {
        return createErrorResponse(404, 'Instruction not found')
      }

      const { error } = await supabase
        .from('instruction_cartridges')
        .delete()
        .eq('id', id)
        .eq('agency_id', agencyId)

      if (error) throw error

      return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
      console.error('[Instructions DELETE]', error)
      return createErrorResponse(500, 'Failed to delete instruction')
    }
  }
)
