import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient, getAuthenticatedUser } from '@/lib/supabase'
import { withRateLimit, createErrorResponse } from '@/lib/security'
import type { DashboardTrends, TrendDataPoint, TimePeriod } from '@/types/dashboard'

// Mock mode detection
const isMockMode = () => {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') return true
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return url.includes('placeholder') || url === ''
}

// Generate mock trend data for demo
function generateMockTrends(period: TimePeriod): DashboardTrends {
  const data: TrendDataPoint[] = []
  const now = new Date()

  for (let i = period - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    data.push({
      date: date.toISOString().split('T')[0],
      newClients: Math.floor(Math.random() * 3), // 0-2 new clients per day
      completedInstalls: Math.floor(Math.random() * 2), // 0-1 completed per day
    })
  }

  return {
    data,
    period,
    lastUpdated: now.toISOString(),
  }
}

/**
 * GET /api/v1/dashboard/trends
 * Get dashboard trend data for charts
 */
export async function GET(request: NextRequest) {
  // Rate limit: 60 requests per minute
  const rateLimitResponse = withRateLimit(request, { maxRequests: 60, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  const searchParams = request.nextUrl.searchParams
  const periodParam = searchParams.get('period')
  const period: TimePeriod = periodParam === '7' ? 7 : periodParam === '90' ? 90 : 30

  // Mock mode - return demo data without auth
  if (isMockMode()) {
    return NextResponse.json({ data: generateMockTrends(period) })
  }

  try {
    const supabase = await createRouteHandlerClient(cookies)

    // Get authenticated user with server verification (SEC-006)
    const { user, agencyId, error: authError } = await getAuthenticatedUser(supabase)

    if (!user || !agencyId) {
      return createErrorResponse(401, authError || 'Unauthorized')
    }

    // Get date range
    const now = new Date()
    const startDate = new Date(now.getTime() - period * 24 * 60 * 60 * 1000)

    // Fetch clients created in period
    const { data: newClients } = await supabase
      .from('client')
      .select('id, created_at')
      .eq('agency_id', agencyId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Fetch clients that were last updated in period (proxy for "went live")
    const { data: completedInstalls } = await supabase
      .from('client')
      .select('id, updated_at')
      .eq('agency_id', agencyId)
      .gte('updated_at', startDate.toISOString())
      .order('updated_at', { ascending: true })

    // Group by date
    const dateMap = new Map<string, TrendDataPoint>()

    // Initialize all dates in range
    for (let i = 0; i < period; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      dateMap.set(dateStr, {
        date: dateStr,
        newClients: 0,
        completedInstalls: 0,
      })
    }

    // Count new clients per day
    for (const client of newClients || []) {
      const dateStr = client.created_at.split('T')[0]
      const entry = dateMap.get(dateStr)
      if (entry) {
        entry.newClients++
      }
    }

    // Count completed installs per day
    for (const client of completedInstalls || []) {
      const dateStr = client.updated_at.split('T')[0]
      const entry = dateMap.get(dateStr)
      if (entry) {
        entry.completedInstalls++
      }
    }

    // Convert to array and sort by date
    const data: TrendDataPoint[] = Array.from(dateMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date)
    )

    const trends: DashboardTrends = {
      data,
      period,
      lastUpdated: now.toISOString(),
    }

    return NextResponse.json({ data: trends })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching dashboard trends:', error)
    }
    return createErrorResponse(500, 'Internal server error')
  }
}
