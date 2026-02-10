/**
 * Slack Event Subscriptions Webhook
 * POST /api/v1/webhooks/slack
 *
 * Handles:
 * 1. URL verification challenge (required by Slack to enable Event Subscriptions)
 * 2. Event callbacks (message events, etc.) for future real-time processing
 *
 * Security: Verifies requests using Slack signing secret.
 * This route is PUBLIC (no Supabase auth) — Slack can't send session cookies.
 * Authentication is via Slack's request signing mechanism.
 */

import { NextRequest, NextResponse } from 'next/server'

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || ''

/**
 * Verify Slack request signature (prevents spoofed webhook calls)
 * See: https://api.slack.com/authentication/verifying-requests-from-slack
 */
async function verifySlackSignature(
  request: NextRequest,
  body: string
): Promise<boolean> {
  if (!SLACK_SIGNING_SECRET) {
    console.warn('[Slack Webhook] SLACK_SIGNING_SECRET not configured — skipping verification')
    return true // Allow in dev when secret isn't set
  }

  const timestamp = request.headers.get('x-slack-request-timestamp')
  const signature = request.headers.get('x-slack-signature')

  if (!timestamp || !signature) {
    return false
  }

  // Reject requests older than 5 minutes (replay attack protection)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return false
  }

  // Compute expected signature
  const sigBasestring = `v0:${timestamp}:${body}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SLACK_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(sigBasestring))
  const expectedSignature = 'v0=' + Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  const body = await request.text()

  // Verify the request is from Slack
  const isValid = await verifySlackSignature(request, body)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 1. URL Verification Challenge
  // Slack sends this when you first configure the Event Subscriptions URL
  if (payload.type === 'url_verification') {
    return NextResponse.json({ challenge: payload.challenge })
  }

  // 2. Event Callbacks
  if (payload.type === 'event_callback') {
    const event = payload.event

    // Log for now — future: process events in real-time
    console.log(`[Slack Webhook] Event received: ${event?.type}`, {
      team_id: payload.team_id,
      event_type: event?.type,
      channel: event?.channel,
    })

    // Acknowledge receipt (Slack requires 200 within 3 seconds)
    return NextResponse.json({ ok: true })
  }

  // Unknown event type
  console.warn('[Slack Webhook] Unknown payload type:', payload.type)
  return NextResponse.json({ ok: true })
}
