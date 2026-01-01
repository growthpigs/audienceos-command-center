import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create a Supabase client for browser/client components
 * Uses cookie-based auth with automatic token refresh
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Create a Supabase client for Server Components
 * Requires cookies() from next/headers
 */
export function createServerComponentClient(cookies: () => ReturnType<typeof import('next/headers').cookies>) {
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component - can't set cookies
        }
      },
    },
  })
}

/**
 * Create a Supabase client for Route Handlers and Server Actions
 * Requires cookies() from next/headers
 */
export function createRouteHandlerClient(cookies: () => ReturnType<typeof import('next/headers').cookies>) {
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

/**
 * Create a Supabase client for middleware
 * Handles auth token refresh on each request
 */
export function createMiddlewareClient(
  request: Request,
  response: Response
) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.headers.getAll('cookie').map(cookie => {
          const [name, ...rest] = cookie.split('=')
          return { name, value: rest.join('=') }
        })
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.headers.append('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`)
        })
      },
    },
  })
}

// Re-export types for convenience
export type { Database }
