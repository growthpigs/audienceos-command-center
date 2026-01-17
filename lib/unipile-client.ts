/**
 * UniPile Client for AudienceOS
 * Handles unified messaging across LinkedIn, WhatsApp, Telegram, Email, Instagram, Messenger
 *
 * Ported from revOS with focus on LinkedIn DM sync for CRM context
 * Supports both system-wide (fallback) and per-client UniPile credentials
 */

import crypto from 'crypto'

/**
 * UniPile API Credentials
 * Can be either system-wide (from env vars) or per-client (from database)
 */
export interface UnipileCredentials {
  apiKey: string
  dsn: string
}

/**
 * Check if mock mode is enabled
 * Mock mode is enabled when UNIPILE_MOCK_MODE is explicitly set to 'true' or '1'
 */
function isMockMode(): boolean {
  const envValue = process.env.UNIPILE_MOCK_MODE?.toLowerCase() || ''
  return envValue === 'true' || envValue === '1'
}

/**
 * Get UniPile credentials - either from client config or fallback to system-wide
 * @param clientCredentials - Optional per-client credentials (takes precedence)
 * @returns UnipileCredentials with apiKey and dsn
 */
function getUnipileCredentials(clientCredentials?: UnipileCredentials | null): UnipileCredentials {
  if (clientCredentials?.apiKey && clientCredentials?.dsn) {
    return clientCredentials
  }

  // Fallback to system-wide credentials from environment variables
  const apiKey = process.env.UNIPILE_API_KEY
  const dsn = process.env.UNIPILE_DSN || 'https://api3.unipile.com:13344'

  if (!apiKey) {
    throw new Error(
      'UniPile API credentials not configured. ' +
      'Provide per-client credentials via function parameter or set UNIPILE_API_KEY environment variable.'
    )
  }

  return { apiKey, dsn }
}

/**
 * Types for UniPile operations
 */
export interface UnipileAuthResponse {
  account_id: string
  provider: string
  status: 'OK' | 'CREDENTIALS' | 'DISCONNECTED'
  name?: string
  email?: string
}

export interface UnipileAccountStatus {
  id: string
  provider: string
  status: 'OK' | 'CREDENTIALS' | 'DISCONNECTED'
  name: string
  email: string
  created_at: string
  last_update: string
}

export interface UnipileMessage {
  id: string
  text: string
  created_at: string
  from_id: string
  from_name: string
  to_id: string
  to_name: string
  message_type: 'INCOMING' | 'OUTGOING'
  provider: string
  thread_id?: string
  attachments?: Array<{
    type: string
    url: string
  }>
}

export interface UnipileConnection {
  id: string
  user_id: string
  user_name: string
  headline?: string
  profile_url?: string
  status: 'PENDING' | 'ACCEPTED' | 'IGNORED'
  created_at: string
}

/**
 * Authenticate LinkedIn account via OAuth
 * For AudienceOS, we're using the OAuth token provided by user during integration
 * This function validates the token is working
 */
export async function authenticateLinkedinAccount(
  accountId: string,
  clientCredentials?: UnipileCredentials | null
): Promise<UnipileAuthResponse> {
  try {
    const credentials = getUnipileCredentials(clientCredentials)

    // Mock mode for testing
    if (isMockMode()) {
      console.log('[MOCK] Validating LinkedIn account:', accountId)
      await new Promise(resolve => setTimeout(resolve, 300))

      return {
        account_id: accountId,
        provider: 'LINKEDIN',
        status: 'OK',
        name: 'LinkedIn User',
        email: 'user@example.com',
      }
    }

    // Validate account status
    const response = await fetch(
      `${credentials.dsn}/api/v1/accounts/${accountId}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': credentials.apiKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`LinkedIn validation failed: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error validating LinkedIn account:', error)
    throw error
  }
}

/**
 * Get account status from UniPile
 */
export async function getAccountStatus(
  accountId: string,
  clientCredentials?: UnipileCredentials | null
): Promise<UnipileAccountStatus> {
  try {
    const credentials = getUnipileCredentials(clientCredentials)

    // Mock mode for testing
    if (isMockMode()) {
      console.log('[MOCK] Getting account status:', accountId)
      return {
        id: accountId,
        provider: 'LINKEDIN',
        status: 'OK',
        name: 'Test Account',
        email: 'test@linkedin.com',
        created_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
      }
    }

    const response = await fetch(
      `${credentials.dsn}/api/v1/accounts/${accountId}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': credentials.apiKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get account status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting account status:', error)
    throw error
  }
}

/**
 * Get direct messages from LinkedIn
 */
export async function getMessages(
  accountId: string,
  limit: number = 20,
  clientCredentials?: UnipileCredentials | null
): Promise<UnipileMessage[]> {
  try {
    const credentials = getUnipileCredentials(clientCredentials)

    // Mock mode for testing
    if (isMockMode()) {
      console.log('[MOCK] Fetching messages for account:', accountId)
      await new Promise(resolve => setTimeout(resolve, 300))

      return [
        {
          id: `mock_msg_${crypto.randomBytes(9).toString('base64url')}`,
          text: 'Hey, how are you?',
          created_at: new Date().toISOString(),
          from_id: 'user-123',
          from_name: 'John Doe',
          to_id: accountId,
          to_name: 'Me',
          message_type: 'INCOMING',
          provider: 'LINKEDIN',
          thread_id: 'thread-456',
        },
      ]
    }

    const response = await fetch(
      `${credentials.dsn}/api/v1/accounts/${accountId}/messages?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': credentials.apiKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.status}`)
    }

    const data = await response.json()
    return data.items || data.messages || []
  } catch (error) {
    console.error('Error getting messages:', error)
    throw error
  }
}

/**
 * Send direct message on LinkedIn
 */
export async function sendMessage(
  accountId: string,
  recipientId: string,
  message: string,
  clientCredentials?: UnipileCredentials | null
): Promise<UnipileMessage> {
  try {
    const credentials = getUnipileCredentials(clientCredentials)

    // Mock mode for testing
    if (isMockMode()) {
      console.log('[MOCK] Sending message:', { accountId, recipientId, message })
      return {
        id: `mock_msg_${crypto.randomBytes(9).toString('base64url')}`,
        text: message,
        created_at: new Date().toISOString(),
        from_id: accountId,
        from_name: 'Me',
        to_id: recipientId,
        to_name: 'Recipient',
        message_type: 'OUTGOING',
        provider: 'LINKEDIN',
      }
    }

    const response = await fetch(
      `${credentials.dsn}/api/v1/accounts/${accountId}/messages`,
      {
        method: 'POST',
        headers: {
          'X-API-KEY': credentials.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          message: message,
          provider: 'LINKEDIN',
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Get connection requests for LinkedIn account
 */
export async function getConnections(
  accountId: string,
  status: 'PENDING' | 'ACCEPTED' = 'PENDING',
  limit: number = 20,
  clientCredentials?: UnipileCredentials | null
): Promise<UnipileConnection[]> {
  try {
    const credentials = getUnipileCredentials(clientCredentials)

    // Mock mode for testing
    if (isMockMode()) {
      console.log('[MOCK] Fetching connections:', { accountId, status })
      return [
        {
          id: `mock_conn_${crypto.randomBytes(9).toString('base64url')}`,
          user_id: 'user-789',
          user_name: 'Jane Smith',
          headline: 'Product Manager at Tech Co',
          profile_url: 'https://linkedin.com/in/janesmith',
          status: status,
          created_at: new Date().toISOString(),
        },
      ]
    }

    const response = await fetch(
      `${credentials.dsn}/api/v1/accounts/${accountId}/connections?status=${status}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': credentials.apiKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get connections: ${response.status}`)
    }

    const data = await response.json()
    return data.items || data.connections || []
  } catch (error) {
    console.error('Error getting connections:', error)
    throw error
  }
}

/**
 * Send connection request on LinkedIn
 */
export async function sendConnectionRequest(
  accountId: string,
  targetUserId: string,
  message?: string,
  clientCredentials?: UnipileCredentials | null
): Promise<UnipileConnection> {
  try {
    const credentials = getUnipileCredentials(clientCredentials)

    // Mock mode for testing
    if (isMockMode()) {
      console.log('[MOCK] Sending connection request:', { accountId, targetUserId })
      return {
        id: `mock_conn_${crypto.randomBytes(9).toString('base64url')}`,
        user_id: targetUserId,
        user_name: 'New Connection',
        status: 'PENDING',
        created_at: new Date().toISOString(),
      }
    }

    const response = await fetch(
      `${credentials.dsn}/api/v1/accounts/${accountId}/connections`,
      {
        method: 'POST',
        headers: {
          'X-API-KEY': credentials.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          target_user_id: targetUserId,
          message: message,
          provider: 'LINKEDIN',
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to send connection request: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error sending connection request:', error)
    throw error
  }
}

/**
 * Accept connection request on LinkedIn
 */
export async function acceptInvitation(
  accountId: string,
  invitationId: string,
  clientCredentials?: UnipileCredentials | null
): Promise<void> {
  try {
    const credentials = getUnipileCredentials(clientCredentials)

    // Mock mode for testing
    if (isMockMode()) {
      console.log('[MOCK] Accepting invitation:', { accountId, invitationId })
      return
    }

    const response = await fetch(
      `${credentials.dsn}/api/v1/accounts/${accountId}/connections/${invitationId}`,
      {
        method: 'PUT',
        headers: {
          'X-API-KEY': credentials.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ACCEPTED',
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to accept invitation: ${response.status}`)
    }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    throw error
  }
}

/**
 * Disconnect account from UniPile
 */
export async function disconnectAccount(
  accountId: string,
  clientCredentials?: UnipileCredentials | null
): Promise<void> {
  try {
    const credentials = getUnipileCredentials(clientCredentials)

    // Mock mode for testing
    if (isMockMode()) {
      console.log('[MOCK] Disconnecting account:', accountId)
      return
    }

    const response = await fetch(
      `${credentials.dsn}/api/v1/accounts/${accountId}`,
      {
        method: 'DELETE',
        headers: {
          'X-API-KEY': credentials.apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to disconnect account: ${response.status}`)
    }
  } catch (error) {
    console.error('Error disconnecting account:', error)
    throw error
  }
}

/**
 * Check connection status - verify account is still connected
 */
export async function checkConnectionStatus(
  accountId: string,
  clientCredentials?: UnipileCredentials | null
): Promise<boolean> {
  try {
    const status = await getAccountStatus(accountId, clientCredentials)
    return status.status === 'OK'
  } catch (error) {
    console.error('Error checking connection status:', error)
    return false
  }
}
