import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

/**
 * POST /api/v1/cartridges/style/upload
 * Upload style learning documents
 */
export const POST = withPermission({ resource: 'ai-features', action: 'write' })(
  async (request: AuthenticatedRequest) => {
    const rateLimitResponse = withRateLimit(request, { maxRequests: 10, windowMs: 60000 })
    if (rateLimitResponse) return rateLimitResponse

    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const agencyId = request.user.agencyId
      const formData = await request.formData()
      const files = formData.getAll('files') as File[]

      if (!files || files.length === 0) {
        return createErrorResponse(400, 'At least one file is required')
      }

      const supabase = await createRouteHandlerClient(cookies)

      // Get or create style cartridge
      const { data: existing } = await supabase
        .from('style_cartridges')
        .select('*')
        .eq('agency_id', agencyId)
        .single()

      const cartridgeId = existing?.id || null

      // Upload each file to Supabase storage
      const sourceFiles = []
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
        const fileName = `${agencyId}-${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cartridges')
          .upload(`style-docs/${agencyId}/${fileName}`, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('cartridges')
          .getPublicUrl(`style-docs/${agencyId}/${fileName}`)

        sourceFiles.push({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          storageUrl: urlData.publicUrl,
          uploadedAt: new Date().toISOString(),
        })
      }

      // Create or update cartridge
      let result
      if (existing) {
        const { data, error } = await supabase
          .from('style_cartridges')
          .update({
            source_files: sourceFiles,
            analysis_status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        const { data, error } = await supabase
          .from('style_cartridges')
          .insert([{
            agency_id: agencyId,
            source_files: sourceFiles,
            analysis_status: 'pending',
            mem0_namespace: `style-${agencyId}`,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      return NextResponse.json(result, { status: 200 })
    } catch (error) {
      console.error('[Style Upload POST]', error)
      return createErrorResponse(500, 'Failed to upload files')
    }
  }
)
