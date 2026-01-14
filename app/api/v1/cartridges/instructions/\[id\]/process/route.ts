import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, isValidUUID, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

/**
 * POST /api/v1/cartridges/instructions/[id]/process
 * Process instruction documents and extract knowledge
 */
export const POST = withPermission({ resource: 'ai-features', action: 'write' })(
  async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const rateLimitResponse = withRateLimit(request, { maxRequests: 5, windowMs: 60000 })
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

      // Get instruction
      const { data: instruction } = await supabase
        .from('instruction_cartridges')
        .select('*')
        .eq('id', id)
        .eq('agency_id', agencyId)
        .single()

      if (!instruction) {
        return createErrorResponse(404, 'Instruction not found')
      }

      if (!instruction.training_docs || instruction.training_docs.length === 0) {
        return createErrorResponse(400, 'No documents to process')
      }

      // Update status to processing
      await supabase
        .from('instruction_cartridges')
        .update({ process_status: 'processing' })
        .eq('id', id)

      // Simulate knowledge extraction (in production, would parse documents and use AI)
      const extractedKnowledge = {
        frameworks: [
          'Primary framework extracted from documents',
          'Secondary methodology identified',
          'Tertiary approach documented',
        ],
        methodologies: [
          'Core methodology found',
          'Supporting techniques identified',
        ],
        keyInsights: [
          'Key insight 1 from analysis',
          'Key insight 2 from analysis',
          'Key insight 3 from analysis',
        ],
        rules: [
          'Rule 1 extracted from documents',
          'Rule 2 extracted from documents',
          'Rule 3 extracted from documents',
        ],
      }

      // Update with extracted knowledge
      const { data, error } = await supabase
        .from('instruction_cartridges')
        .update({
          extracted_knowledge: extractedKnowledge,
          process_status: 'completed',
          last_processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data, { status: 200 })
    } catch (error) {
      console.error('[Instructions Process POST]', error)

      // Update status to failed
      const { id } = await params
      const agencyId = request.user.agencyId
      const supabase = await createRouteHandlerClient(cookies)
      await supabase
        .from('instruction_cartridges')
        .update({ process_status: 'failed' })
        .eq('id', id)
        .eq('agency_id', agencyId)

      return createErrorResponse(500, 'Failed to process instruction')
    }
  }
)
