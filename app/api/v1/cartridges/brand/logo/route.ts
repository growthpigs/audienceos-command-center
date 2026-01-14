import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

/**
 * POST /api/v1/cartridges/brand/logo
 * Upload brand logo image
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
      const logoFile = formData.get('logo') as File | null

      if (!logoFile) {
        return createErrorResponse(400, 'Logo file is required')
      }

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
      if (!validTypes.includes(logoFile.type)) {
        return createErrorResponse(400, 'Invalid file type. Supported: PNG, JPEG, WebP, SVG')
      }

      // Validate file size (5MB max)
      if (logoFile.size > 5 * 1024 * 1024) {
        return createErrorResponse(400, 'File size exceeds 5MB limit')
      }

      const supabase = await createRouteHandlerClient(cookies)

      // Upload to Supabase storage
      const fileName = `${agencyId}-logo-${Date.now()}.${logoFile.name.split('.').pop()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cartridges')
        .upload(`brand-logos/${agencyId}/${fileName}`, logoFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cartridges')
        .getPublicUrl(`brand-logos/${agencyId}/${fileName}`)

      const logoUrl = urlData.publicUrl

      // Update brand cartridge with logo URL
      const { data, error: updateError } = await supabase
        .from('brand_cartridges')
        .update({
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('agency_id', agencyId)
        .select()
        .single()

      if (updateError) throw updateError

      return NextResponse.json({ logoUrl, data }, { status: 200 })
    } catch (error) {
      console.error('[Brand Logo POST]', error)
      return createErrorResponse(500, 'Failed to upload logo')
    }
  }
)
