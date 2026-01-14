import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, sanitizeString, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

/**
 * POST /api/v1/cartridges/instructions
 * Create new instruction set
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

      if (!body.name || typeof body.name !== 'string') {
        return createErrorResponse(400, 'Instruction name is required')
      }

      const supabase = await createRouteHandlerClient(cookies)

      const { data, error } = await supabase
        .from('instruction_cartridges')
        .insert([{
          agency_id: agencyId,
          name: sanitizeString(body.name),
          description: body.description ? sanitizeString(body.description) : null,
          training_docs: [],
          process_status: 'pending',
          mem0_namespace: `instructions-${agencyId}-${Date.now()}`,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      console.error('[Instructions POST]', error)
      return createErrorResponse(500, 'Failed to create instruction set')
    }
  }
)
