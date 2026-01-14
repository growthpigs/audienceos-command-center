import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

/**
 * DELETE /api/v1/cartridges/style
 * Delete style cartridge
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
        .from('style_cartridges')
        .delete()
        .eq('agency_id', agencyId)

      if (error) throw error

      return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
      console.error('[Style Cartridge DELETE]', error)
      return createErrorResponse(500, 'Failed to delete style cartridge')
    }
  }
)
