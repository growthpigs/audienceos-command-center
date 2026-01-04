/**
 * Health Check Module for Chi Gateway
 *
 * Provides per-service health checks with structured error responses
 */

import { Env } from '../index';

interface ServiceHealth {
  service: string;
  status: 'ok' | 'error' | 'warning';
  latencyMs?: number;
  message?: string;
  hint?: string;
}

interface HealthReport {
  gateway: {
    status: 'ok' | 'degraded' | 'down';
    version: string;
    timestamp: string;
    tools: number;
  };
  services: ServiceHealth[];
  summary: {
    healthy: number;
    degraded: number;
    failed: number;
  };
}

// Helper to get Google access token
async function getGoogleAccessToken(env: Env): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });
    const data = await response.json() as { access_token?: string };
    return data.access_token || null;
  } catch {
    return null;
  }
}

// Test Gmail connectivity
async function checkGmail(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const token = await getGoogleAccessToken(env);
    if (!token) {
      return { service: 'gmail', status: 'error', message: 'Token refresh failed', hint: 'Re-authenticate with Google OAuth' };
    }
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'gmail', status: 'ok', latencyMs };
    }
    return { service: 'gmail', status: 'error', latencyMs, message: `HTTP ${response.status}`, hint: 'Check GOOGLE_REFRESH_TOKEN' };
  } catch (e) {
    return { service: 'gmail', status: 'error', message: String(e), hint: 'Network error' };
  }
}

// Test Calendar connectivity
async function checkCalendar(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const token = await getGoogleAccessToken(env);
    if (!token) {
      return { service: 'calendar', status: 'error', message: 'Token refresh failed', hint: 'Re-authenticate with Google OAuth' };
    }
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'calendar', status: 'ok', latencyMs };
    }
    return { service: 'calendar', status: 'error', latencyMs, message: `HTTP ${response.status}` };
  } catch (e) {
    return { service: 'calendar', status: 'error', message: String(e) };
  }
}

// Test Drive connectivity
async function checkDrive(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const token = await getGoogleAccessToken(env);
    if (!token) {
      return { service: 'drive', status: 'error', message: 'Token refresh failed', hint: 'Re-authenticate with Google OAuth' };
    }
    const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'drive', status: 'ok', latencyMs };
    }
    return { service: 'drive', status: 'error', latencyMs, message: `HTTP ${response.status}` };
  } catch (e) {
    return { service: 'drive', status: 'error', message: String(e) };
  }
}

// Test Render connectivity
async function checkRender(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  if (!env.RENDER_API_KEY) {
    return { service: 'render', status: 'error', message: 'RENDER_API_KEY not configured' };
  }
  try {
    const response = await fetch('https://api.render.com/v1/services?limit=1', {
      headers: { Authorization: `Bearer ${env.RENDER_API_KEY}` }
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'render', status: 'ok', latencyMs };
    }
    return { service: 'render', status: 'error', latencyMs, message: `HTTP ${response.status}`, hint: 'Check RENDER_API_KEY' };
  } catch (e) {
    return { service: 'render', status: 'error', message: String(e) };
  }
}

// Test Sentry connectivity
async function checkSentry(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  if (!env.SENTRY_AUTH_TOKEN) {
    return { service: 'sentry', status: 'error', message: 'SENTRY_AUTH_TOKEN not configured' };
  }
  try {
    const response = await fetch('https://sentry.io/api/0/organizations/', {
      headers: { Authorization: `Bearer ${env.SENTRY_AUTH_TOKEN}` }
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'sentry', status: 'ok', latencyMs };
    }
    return { service: 'sentry', status: 'error', latencyMs, message: `HTTP ${response.status}`, hint: 'Check SENTRY_AUTH_TOKEN' };
  } catch (e) {
    return { service: 'sentry', status: 'error', message: String(e) };
  }
}

// Test Netlify connectivity
async function checkNetlify(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  if (!env.NETLIFY_AUTH_TOKEN) {
    return { service: 'netlify', status: 'error', message: 'NETLIFY_AUTH_TOKEN not configured' };
  }
  try {
    const response = await fetch('https://api.netlify.com/api/v1/sites?per_page=1', {
      headers: { Authorization: `Bearer ${env.NETLIFY_AUTH_TOKEN}` }
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'netlify', status: 'ok', latencyMs };
    }
    return { service: 'netlify', status: 'error', latencyMs, message: `HTTP ${response.status}`, hint: 'Token may be expired - regenerate at netlify.com' };
  } catch (e) {
    return { service: 'netlify', status: 'error', message: String(e) };
  }
}

// Test Neon connectivity
async function checkNeon(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  if (!env.NEON_API_KEY || !env.NEON_ORG_ID) {
    return { service: 'neon', status: 'error', message: 'NEON_API_KEY or NEON_ORG_ID not configured' };
  }
  try {
    const response = await fetch(`https://console.neon.tech/api/v2/projects?org_id=${env.NEON_ORG_ID}&limit=1`, {
      headers: { Authorization: `Bearer ${env.NEON_API_KEY}` }
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'neon', status: 'ok', latencyMs };
    }
    return { service: 'neon', status: 'error', latencyMs, message: `HTTP ${response.status}`, hint: 'Check NEON_API_KEY' };
  } catch (e) {
    return { service: 'neon', status: 'error', message: String(e) };
  }
}

// Test Supabase connectivity
async function checkSupabase(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return { service: 'supabase', status: 'error', message: 'SUPABASE_URL or SUPABASE_SERVICE_KEY not configured' };
  }
  try {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`
      }
    });
    const latencyMs = Date.now() - start;
    if (response.ok || response.status === 404) { // 404 is OK - no tables
      return { service: 'supabase', status: 'ok', latencyMs };
    }
    return { service: 'supabase', status: 'error', latencyMs, message: `HTTP ${response.status}` };
  } catch (e) {
    return { service: 'supabase', status: 'error', message: String(e) };
  }
}

// Test Browser (Browserless) connectivity
async function checkBrowser(env: Env): Promise<ServiceHealth> {
  if (!env.BROWSERLESS_URL || !env.BROWSERLESS_TOKEN) {
    return { service: 'browser', status: 'warning', message: 'BROWSERLESS_URL or BROWSERLESS_TOKEN not configured' };
  }
  return { service: 'browser', status: 'ok', message: 'Configured (not tested)' };
}

// Test Mercury connectivity (known to be IP-blocked)
async function checkMercury(env: Env): Promise<ServiceHealth> {
  if (!env.MERCURY_API_TOKEN) {
    return { service: 'mercury', status: 'warning', message: 'MERCURY_API_TOKEN not configured' };
  }
  return { service: 'mercury', status: 'warning', message: 'IP-blocked from Cloudflare Workers', hint: 'Use direct API access' };
}

// Test Meta Ads connectivity
async function checkMetaAds(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  if (!env.META_ACCESS_TOKEN) {
    return { service: 'meta_ads', status: 'warning', message: 'META_ACCESS_TOKEN not configured' };
  }
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${env.META_ACCESS_TOKEN}`);
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'meta_ads', status: 'ok', latencyMs };
    }
    const data = await response.json() as { error?: { message?: string } };
    return {
      service: 'meta_ads',
      status: 'error',
      latencyMs,
      message: data.error?.message || `HTTP ${response.status}`,
      hint: 'Token may be expired - regenerate at developers.facebook.com'
    };
  } catch (e) {
    return { service: 'meta_ads', status: 'error', message: String(e) };
  }
}

// Test Google Ads connectivity
async function checkGoogleAds(env: Env): Promise<ServiceHealth> {
  if (!env.GOOGLE_ADS_DEVELOPER_TOKEN || !env.GOOGLE_ADS_CUSTOMER_ID) {
    return { service: 'google_ads', status: 'warning', message: 'GOOGLE_ADS credentials not configured' };
  }
  // Google Ads requires complex OAuth - just check if configured
  return { service: 'google_ads', status: 'warning', message: 'Pending API approval', hint: 'Awaiting Google Ads API access' };
}

// Test Mem0 connectivity
async function checkMem0(env: Env): Promise<ServiceHealth> {
  const start = Date.now();
  if (!env.MEM0_API_KEY) {
    return { service: 'mem0', status: 'error', message: 'MEM0_API_KEY not configured' };
  }
  try {
    // Simple search to verify connectivity (user_id is required)
    const response = await fetch('https://api.mem0.ai/v1/memories/search/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.MEM0_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'health check', user_id: 'chi', top_k: 1 })
    });
    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { service: 'mem0', status: 'ok', latencyMs };
    }
    return { service: 'mem0', status: 'error', latencyMs, message: `HTTP ${response.status}`, hint: 'Check MEM0_API_KEY' };
  } catch (e) {
    return { service: 'mem0', status: 'error', message: String(e) };
  }
}

// Run all health checks
export async function runFullHealthCheck(env: Env, toolCount: number): Promise<HealthReport> {
  const services = await Promise.all([
    checkGmail(env),
    checkCalendar(env),
    checkDrive(env),
    checkRender(env),
    checkSentry(env),
    checkNetlify(env),
    checkNeon(env),
    checkSupabase(env),
    checkBrowser(env),
    checkMercury(env),
    checkMetaAds(env),
    checkGoogleAds(env),
    checkMem0(env),
  ]);

  const healthy = services.filter(s => s.status === 'ok').length;
  const degraded = services.filter(s => s.status === 'warning').length;
  const failed = services.filter(s => s.status === 'error').length;

  const overallStatus = failed > 0 ? (healthy > 0 ? 'degraded' : 'down') : 'ok';

  return {
    gateway: {
      status: overallStatus,
      version: '1.3.0',
      timestamp: new Date().toISOString(),
      tools: toolCount,
    },
    services,
    summary: { healthy, degraded, failed },
  };
}

// Check a single service
export async function checkSingleService(service: string, env: Env): Promise<ServiceHealth> {
  switch (service) {
    case 'gmail': return await checkGmail(env);
    case 'calendar': return await checkCalendar(env);
    case 'drive': return await checkDrive(env);
    case 'render': return await checkRender(env);
    case 'sentry': return await checkSentry(env);
    case 'netlify': return await checkNetlify(env);
    case 'neon': return await checkNeon(env);
    case 'supabase': return await checkSupabase(env);
    case 'browser': return await checkBrowser(env);
    case 'mercury': return await checkMercury(env);
    case 'meta_ads': case 'meta-ads': return await checkMetaAds(env);
    case 'google_ads': case 'google-ads': return await checkGoogleAds(env);
    case 'mem0': return await checkMem0(env);
    default:
      return { service, status: 'error', message: `Unknown service: ${service}` };
  }
}

// Structured error response builder
export interface StructuredError {
  error: true;
  code: string;
  message: string;
  hint?: string;
  service?: string;
  timestamp: string;
}

export function createErrorResponse(
  code: string,
  message: string,
  hint?: string,
  service?: string
): StructuredError {
  return {
    error: true,
    code,
    message,
    hint,
    service,
    timestamp: new Date().toISOString(),
  };
}

// Common error codes
export const ErrorCodes = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNKNOWN: 'UNKNOWN',
};
