import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withCsrfProtection, sanitizeString, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/v1/clients/[id]/notes - Fetch all notes for a client
export const GET = withPermission({ resource: 'clients', action: 'read' })(
  async (request: AuthenticatedRequest, { params }: RouteParams) => {
    try {
      const { id } = await params
      const supabase = await createRouteHandlerClient(cookies)
      const agencyId = request.user.agencyId

      // Verify client belongs to agency
      const { data: client, error: clientError } = await (supabase as any)
        .from('client')
        .select('id')
        .eq('id', id)
        .eq('agency_id', agencyId)
        .single()

      if (clientError || !client) {
        return createErrorResponse(404, 'Client not found')
      }

      // Fetch notes with author info, newest first
      const { data: notes, error: notesError } = await (supabase as any)
        .from('client_note')
        .select(`
          id,
          content,
          created_at,
          author:author_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('client_id', id)
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })

      if (notesError) {
        console.error('Client notes GET error:', notesError)
        return createErrorResponse(500, 'Failed to fetch notes')
      }

      return NextResponse.json({ data: notes || [] })
    } catch (error) {
      console.error('Client notes GET error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

// POST /api/v1/clients/[id]/notes - Create a note for a client
export const POST = withPermission({ resource: 'clients', action: 'write' })(
  async (request: AuthenticatedRequest, { params }: RouteParams) => {
    // CSRF protection
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const { id } = await params
      const supabase = await createRouteHandlerClient(cookies)

      // User already authenticated and authorized by middleware
      const agencyId = request.user.agencyId
      const userId = request.user.id

      let body: Record<string, unknown>
      try {
        body = await request.json()
      } catch {
        return createErrorResponse(400, 'Invalid JSON body')
      }

      const { text } = body

      // Validate text
      if (!text || typeof text !== 'string') {
        return createErrorResponse(400, 'Note text is required')
      }

      const sanitizedText = sanitizeString(text).slice(0, 5000)
      if (!sanitizedText) {
        return createErrorResponse(400, 'Note text cannot be empty')
      }

      // Verify client exists and belongs to user's agency
      const { data: client, error: clientError } = await supabase
        .from('client')
        .select('id')
        .eq('id', id)
        .eq('agency_id', agencyId)
        .single()

      if (clientError || !client) {
        return createErrorResponse(404, 'Client not found')
      }

      // Insert note into client_note table
      const { data: newNote, error: insertError } = await (supabase as any)
        .from('client_note')
        .insert({
          agency_id: agencyId,
          client_id: id,
          author_id: userId,
          content: sanitizedText,
        })
        .select(`
          id,
          content,
          created_at,
          author:author_id (
            id,
            first_name,
            last_name
          )
        `)
        .single()

      if (insertError) {
        console.error('Client notes INSERT error:', insertError)
        return createErrorResponse(500, 'Failed to save note')
      }

      return NextResponse.json({ data: newNote }, { status: 201 })
    } catch (error) {
      console.error('Client notes POST error:', error)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
