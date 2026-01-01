/**
 * Security Utilities
 * Provides input sanitization, rate limiting, and security helpers
 */

import { NextRequest, NextResponse } from 'next/server'

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Sanitize HTML content (more aggressive)
 */
export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const email = input.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return null
  return email
}

/**
 * Validate UUID format
 */
export function isValidUUID(input: unknown): boolean {
  if (typeof input !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(input)
}

/**
 * Sanitize object keys and values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key)
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[sanitizedKey] = sanitizeObject(value as Record<string, unknown>)
    } else {
      sanitized[sanitizedKey] = value
    }
  }
  return sanitized as T
}

// =============================================================================
// RATE LIMITING (In-Memory)
// =============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
}

/**
 * Check if request is rate limited
 * Returns remaining requests or -1 if limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  request: NextRequest,
  config?: RateLimitConfig
): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const result = checkRateLimit(ip, config)

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(config?.maxRequests || DEFAULT_RATE_LIMIT.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
        },
      }
    )
  }

  return null
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Sanitize error messages for client response
 * Removes sensitive details that could aid attackers
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose stack traces or internal details
    const message = error.message.toLowerCase()

    // Check for sensitive patterns
    if (message.includes('supabase') ||
        message.includes('postgres') ||
        message.includes('database') ||
        message.includes('connection') ||
        message.includes('timeout')) {
      return 'A database error occurred. Please try again.'
    }

    if (message.includes('unauthorized') || message.includes('auth')) {
      return 'Authentication required.'
    }

    if (message.includes('forbidden') || message.includes('permission')) {
      return 'You do not have permission to perform this action.'
    }

    if (message.includes('not found')) {
      return 'The requested resource was not found.'
    }

    // Return generic message for other errors
    return 'An unexpected error occurred. Please try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Create a safe error response (no sensitive data)
 */
export function createErrorResponse(
  status: number,
  message: string,
  logError?: unknown
): NextResponse {
  // Log the full error server-side (but not in production client response)
  if (logError && process.env.NODE_ENV !== 'production') {
    console.error('[API Error]', logError)
  }

  return NextResponse.json(
    { error: message },
    { status }
  )
}

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

/**
 * Validate request body exists and is valid JSON
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  request: NextRequest
): Promise<{ data: T | null; error: string | null }> {
  try {
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return { data: null, error: 'Content-Type must be application/json' }
    }

    const body = await request.json()

    if (typeof body !== 'object' || body === null) {
      return { data: null, error: 'Request body must be an object' }
    }

    return { data: body as T, error: null }
  } catch {
    return { data: null, error: 'Invalid JSON in request body' }
  }
}

// =============================================================================
// TIMEOUT WRAPPER
// =============================================================================

/**
 * Wrap a promise with a timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Request timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

// =============================================================================
// CSRF PROTECTION
// =============================================================================

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(request: NextRequest, expectedToken: string): boolean {
  const token = request.headers.get('x-csrf-token')
  if (!token || !expectedToken) return false

  // Constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) return false

  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
  }
  return result === 0
}
