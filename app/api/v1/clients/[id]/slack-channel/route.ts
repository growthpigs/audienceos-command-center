/**
 * Client Slack Channel API
 * GET /api/v1/clients/[id]/slack-channel - Get linked Slack channel info
 * POST /api/v1/clients/[id]/slack-channel - Create or link a Slack channel for this client
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { createSlackChannelForClient } from '@/lib/integrations/slack-channel-service'
import { syncChannel } from '@/lib/integrations/slack-channel-sync-service'

// DELETE /api/v1/clients/[id]/slack-channel
export const DELETE = withPermission({ resource: 'clients', action: 'write' })(
  async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    const rateLimitResponse = withRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const { id: clientId } = await params
      const agencyId = request.user.agencyId
      const supabase = await createRouteHandlerClient(cookies)

      const { error } = await (supabase as any)
        .from('client_slack_channel')
        .update({ is_active: false })
        .eq('client_id', clientId)
        .eq('agency_id', agencyId)
        .eq('is_active', true)

      if (error) {
        console.error('[slack-channel] Unlink error:', error)
        return createErrorResponse(500, 'Failed to unlink channel')
      }

      return NextResponse.json({ data: null, message: 'Channel unlinked' })
    } catch {
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

// GET /api/v1/clients/[id]/slack-channel
export const GET = withPermission({ resource: 'clients', action: 'read' })(
  async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    const rateLimitResponse = withRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
      const { id: clientId } = await params
      const supabase = await createRouteHandlerClient(cookies)

const { data, error } = await (supabase as any)
        .from('client_slack_channel')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        return createErrorResponse(500, 'Failed to fetch Slack channel')
      }

      return NextResponse.json({ data })
    } catch {
      return createErrorResponse(500, 'Internal server error')
    }
  }
)

// POST /api/v1/clients/[id]/slack-channel
export const POST = withPermission({ resource: 'clients', action: 'write' })(
  async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
    const rateLimitResponse = withRateLimit(request, { maxRequests: 10, windowMs: 60000 })
    if (rateLimitResponse) return rateLimitResponse

    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const { id: clientId } = await params
      const agencyId = request.user.agencyId
      const supabase = await createRouteHandlerClient(cookies)

      // Check if channel already exists
      const { data: existing } = await supabase
        .from('client_slack_channel')
        .select('id, slack_channel_id, slack_channel_name, is_active')
        .eq('client_id', clientId)
        .maybeSingle()

      if (existing?.is_active) {
        return NextResponse.json(
          { error: 'Client already has an active Slack channel', data: existing },
          { status: 409 }
        )
      }

      // Get client name for channel naming
      const { data: client, error: clientError } = await supabase
        .from('client')
        .select('name')
        .eq('id', clientId)
        .single()

      if (clientError || !client) {
        return createErrorResponse(404, 'Client not found')
      }

      // Get optional config from request body
      let body: Record<string, unknown> = {}
      try {
        body = await request.json()
      } catch {
        // No body is fine — use defaults
      }

      // Mode 1: Link an EXISTING Slack channel (skip gateway create)
      if (typeof body.slack_channel_id === 'string' && body.slack_channel_id) {
        const slackChannelId = body.slack_channel_id as string
        const slackChannelName = (typeof body.slack_channel_name === 'string' && body.slack_channel_name)
          ? body.slack_channel_name
          : slackChannelId // Use ID as fallback name

        const { data: record, error: dbError } = await supabase
          .from('client_slack_channel')
          .upsert(
            {
              agency_id: agencyId,
              client_id: clientId,
              slack_channel_id: slackChannelId,
              slack_channel_name: slackChannelName,
              is_active: true,
            },
            { onConflict: 'agency_id,client_id' }
          )
          .select('id, slack_channel_id, slack_channel_name')
          .single()

        if (dbError) {
          console.error('[slack-channel] Link existing channel DB error:', dbError)
          return createErrorResponse(500, 'Failed to save channel mapping')
        }

        // Fire-and-forget: sync messages from the newly linked channel
        syncChannel(agencyId, clientId, slackChannelId, null, supabase)
          .catch((err) => console.error('[slack-channel] Auto-sync after link failed:', err))

        return NextResponse.json({ data: record }, { status: 201 })
      }

      // Mode 2: Create a NEW Slack channel via Gateway
      const isPrivate = body.is_private === true
      const channelNameOverride = typeof body.channel_name === 'string' ? body.channel_name : undefined

      const result = await createSlackChannelForClient({
        agencyId,
        clientId,
        clientName: client.name,
        channelNameOverride,
        isPrivate,
        supabase,
      })

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status || 500 })
      }

      // Fire-and-forget: sync messages from the newly created channel
      if (result.data?.slack_channel_id) {
        syncChannel(agencyId, clientId, result.data.slack_channel_id, null, supabase)
          .catch((err) => console.error('[slack-channel] Auto-sync after create failed:', err))
      }

      return NextResponse.json({ data: result.data }, { status: 201 })
    } catch {
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
