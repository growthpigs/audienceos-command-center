import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, isValidUUID, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

/**
 * POST /api/v1/cartridges/instructions/[id]/upload
 * Upload training documents for instruction set
 */
export const POST = withPermission({ resource: 'ai-features', action: 'write' })(
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

      const formData = await request.formData()
      const files = formData.getAll('files') as File[]

      if (!files || files.length === 0) {
        return createErrorResponse(400, 'At least one file is required')
      }

      const supabase = await createRouteHandlerClient(cookies)

      // Verify instruction exists
      const { data: instruction } = await supabase
        .from('instruction_cartridges')
        .select('*')
        .eq('id', id)
        .eq('agency_id', agencyId)
        .single()

      if (!instruction) {
        return createErrorResponse(404, 'Instruction not found')
      }

      // Upload files
      const trainingDocs = []
      for (const file of files) {
        // Validate file
        const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown']
        if (!validTypes.includes(file.type)) {
          return createErrorResponse(400, `Invalid file type: ${file.name}`)
        }

        if (file.size > 10 * 1024 * 1024) {
          return createErrorResponse(400, `File exceeds 10MB limit: ${file.name}`)
        }

        // Upload to storage
        const fileName = `${agencyId}-${id}-${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cartridges')
          .upload(`instructions/${agencyId}/${fileName}`, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('cartridges')
          .getPublicUrl(`instructions/${agencyId}/${fileName}`)

        trainingDocs.push({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          storageUrl: urlData.publicUrl,
          uploadedAt: new Date().toISOString(),
        })
      }

      // Update instruction with new docs
      const existingDocs = instruction.training_docs || []
      const { data, error } = await supabase
        .from('instruction_cartridges')
        .update({
          training_docs: [...existingDocs, ...trainingDocs],
          process_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data, { status: 200 })
    } catch (error) {
      console.error('[Instructions Upload POST]', error)
      return createErrorResponse(500, 'Failed to upload documents')
    }
  }
)
