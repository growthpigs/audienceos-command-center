/**
 * OAuth Token Refresh Utilities
 *
 * Provides token refresh functionality for OAuth integrations.
 * Used when access tokens expire and need to be refreshed using stored refresh tokens.
 *
 * SECURITY:
 * - Tokens are encrypted at rest in the database
 * - Refresh tokens are only used when access tokens are expired/expiring
 * - Failed refreshes mark the integration as disconnected
 *
 * SUPPORTED PROVIDERS:
 * - Google (Gmail, Calendar, Drive)
 * - Slack
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  encryptToken,
  decryptToken,
  serializeEncryptedToken,
  deserializeEncryptedToken,
} from '@/lib/crypto'
import { integrationLogger } from '@/lib/logger'

// Token refresh endpoints
const REFRESH_ENDPOINTS = {
  google: 'https://oauth2.googleapis.com/token',
  slack: 'https://slack.com/api/oauth.v2.access',
} as const

// Token expiry buffer (refresh 5 minutes before expiry)
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000

export type OAuthProvider = 'gmail' | 'google-calendar' | 'google-drive' | 'slack'

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  success: boolean
  accessToken?: string
  expiresAt?: Date
  error?: string
}

/**
 * Check if a token is expired or about to expire
 */
export function isTokenExpired(expiresAt: Date | string | null | undefined): boolean {
  if (!expiresAt) return false // No expiry means token doesn't expire (e.g., some Slack tokens)

  const expiryTime = typeof expiresAt === 'string' ? new Date(expiresAt).getTime() : expiresAt.getTime()
  return Date.now() >= expiryTime - TOKEN_EXPIRY_BUFFER_MS
}

/**
 * Refresh a Google OAuth token
 * Works for Gmail, Calendar, and Drive (all use same Google OAuth)
 */
async function refreshGoogleToken(refreshToken: string): Promise<TokenRefreshResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return { success: false, error: 'Missing Google OAuth configuration' }
  }

  try {
    const response = await fetch(REFRESH_ENDPOINTS.google, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      integrationLogger.error(
        { error: data.error, errorDescription: data.error_description },
        'Google token refresh failed'
      )
      return { success: false, error: data.error_description || data.error || 'Token refresh failed' }
    }

    if (!data.access_token) {
      return { success: false, error: 'No access token in refresh response' }
    }

    // Google returns expires_in as seconds
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined

    return {
      success: true,
      accessToken: data.access_token,
      expiresAt,
    }
  } catch (error) {
    integrationLogger.error({ err: error }, 'Google token refresh error')
    return { success: false, error: 'Network error during token refresh' }
  }
}

/**
 * Refresh a Slack OAuth token
 * Note: Slack tokens typically don't expire, but this handles the case if they do
 */
async function refreshSlackToken(refreshToken: string): Promise<TokenRefreshResult> {
  const clientId = process.env.SLACK_CLIENT_ID
  const clientSecret = process.env.SLACK_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return { success: false, error: 'Missing Slack OAuth configuration' }
  }

  try {
    const response = await fetch(REFRESH_ENDPOINTS.slack, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()

    if (!data.ok || !data.access_token) {
      integrationLogger.error({ error: data.error }, 'Slack token refresh failed')
      return { success: false, error: data.error || 'Token refresh failed' }
    }

    // Slack returns expires_in as seconds (if token expires)
    const expiresAt = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined

    return {
      success: true,
      accessToken: data.access_token,
      expiresAt,
    }
  } catch (error) {
    integrationLogger.error({ err: error }, 'Slack token refresh error')
    return { success: false, error: 'Network error during token refresh' }
  }
}

/**
 * Refresh token for any supported provider
 */
export async function refreshToken(
  provider: OAuthProvider,
  refreshToken: string
): Promise<TokenRefreshResult> {
  switch (provider) {
    case 'gmail':
    case 'google-calendar':
    case 'google-drive':
      return refreshGoogleToken(refreshToken)
    case 'slack':
      return refreshSlackToken(refreshToken)
    default:
      return { success: false, error: `Unsupported provider: ${provider}` }
  }
}

/**
 * Get a valid access token, refreshing if necessary
 *
 * @param supabase - Authenticated Supabase client
 * @param userId - User ID
 * @param provider - OAuth provider type
 * @returns Valid access token or null if refresh failed
 */
export async function getValidAccessToken(
  supabase: SupabaseClient,
  userId: string,
  provider: OAuthProvider
): Promise<string | null> {
  // Fetch current credentials
  const { data: credential, error } = await supabase
    .from('user_oauth_credential')
    .select('access_token, refresh_token, expires_at, is_connected')
    .eq('user_id', userId)
    .eq('type', provider)
    .single()

  if (error || !credential || !credential.is_connected) {
    return null
  }

  // Decrypt access token
  const encryptedAccess = deserializeEncryptedToken(credential.access_token)
  if (!encryptedAccess) return null

  const accessToken = decryptToken(encryptedAccess)
  if (!accessToken) return null

  // Check if token is still valid
  if (!isTokenExpired(credential.expires_at)) {
    return accessToken
  }

  // Token expired - need to refresh
  if (!credential.refresh_token) {
    integrationLogger.warn({ provider }, 'Token expired but no refresh token available')
    await markIntegrationDisconnected(supabase, userId, provider, 'Token expired')
    return null
  }

  // Decrypt refresh token
  const encryptedRefresh = deserializeEncryptedToken(credential.refresh_token)
  if (!encryptedRefresh) return null

  const decryptedRefreshToken = decryptToken(encryptedRefresh)
  if (!decryptedRefreshToken) return null

  // Attempt refresh
  const result = await refreshToken(provider, decryptedRefreshToken)

  if (!result.success || !result.accessToken) {
    integrationLogger.error({ provider, error: result.error }, 'Token refresh failed')
    await markIntegrationDisconnected(supabase, userId, provider, result.error || 'Refresh failed')
    return null
  }

  // Encrypt and store new access token
  const newEncryptedAccess = encryptToken(result.accessToken)
  if (!newEncryptedAccess) return null

  const { error: updateError } = await supabase
    .from('user_oauth_credential')
    .update({
      access_token: serializeEncryptedToken(newEncryptedAccess),
      expires_at: result.expiresAt?.toISOString() || null,
      error_message: null,
    })
    .eq('user_id', userId)
    .eq('type', provider)

  if (updateError) {
    integrationLogger.error({ err: updateError, provider }, 'Failed to store refreshed token')
    // Still return the token since it's valid, even if storage failed
  }

  integrationLogger.info({ provider }, 'Token refreshed successfully')
  return result.accessToken
}

/**
 * Mark an integration as disconnected (e.g., after refresh failure)
 */
async function markIntegrationDisconnected(
  supabase: SupabaseClient,
  userId: string,
  provider: OAuthProvider,
  errorMessage: string
): Promise<void> {
  await supabase
    .from('user_oauth_credential')
    .update({
      is_connected: false,
      error_message: errorMessage,
    })
    .eq('user_id', userId)
    .eq('type', provider)
}
