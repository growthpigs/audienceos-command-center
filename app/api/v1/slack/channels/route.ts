/**
 * Slack Channels Proxy API
 * GET /api/v1/slack/channels - List workspace channels with linkage info
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'

const GATEWAY_URL = process.env.DIIIPLOY_GATEWAY_URL || 'https://diiiploy-gateway.diiiploy.workers.dev'
const GATEWAY_API_KEY = process.env.DIIIPLOY_GATEWAY_API_KEY || ''
const TENANT_ID = process.env.DIIIPLOY_TENANT_ID || ''

export const GET = withPermission({ resource: 'clients', action: 'read' })(
  async (request: AuthenticatedRequest) => {
    const rateLimitResponse = withRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
      if (!GATEWAY_API_KEY || !TENANT_ID) {
        return createErrorResponse(500, 'Gateway not configured')
      }

      // Fetch channels from Gateway
      const gatewayRes = await fetch(`${GATEWAY_URL}/slack/channels`, {
        headers: {
          'Authorization': `Bearer ${GATEWAY_API_KEY}`,
          'X-Tenant-ID': TENANT_ID,
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!gatewayRes.ok) {
        console.error('[slack-channels] Gateway error:', gatewayRes.status)
        return createErrorResponse(502, 'Failed to fetch channels from Slack')
      }

      const gatewayData = await gatewayRes.json() as {
        ok: boolean
        channels?: Array<{ id: string; name: string; is_private: boolean }>
      }

      if (!gatewayData.ok || !gatewayData.channels) {
        return createErrorResponse(502, 'Invalid response from Slack')
      }

      // Get existing linkages for this agency
      const agencyId = request.user.agencyId
      const supabase = await createRouteHandlerClient(cookies)

      const { data: linkages } = await (supabase as any)
        .from('client_slack_channel')
        .select('slack_channel_id, client_id, client:client_id(name)')
        .eq('agency_id', agencyId)
        .eq('is_active', true)

      // Build a map of channel_id -> linked client info
      const linkageMap = new Map<string, { client_id: string; client_name: string }>()
      if (linkages) {
        for (const link of linkages) {
          linkageMap.set(link.slack_channel_id, {
            client_id: link.client_id,
            client_name: link.client?.name || 'Unknown',
          })
        }
      }

      // Enrich channels with linkage data
      const enriched = gatewayData.channels.map((ch) => {
        const linked = linkageMap.get(ch.id)
        return {
          id: ch.id,
          name: ch.name,
          is_private: ch.is_private,
          linked_to: linked || null,
        }
      })

      return NextResponse.json({ data: enriched })
    } catch (err) {
      console.error('[slack-channels] Error:', err)
      return createErrorResponse(500, 'Internal server error')
    }
  }
)
