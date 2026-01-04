/**
 * Google Ads API Route Handler
 * Read-only access to campaigns and performance
 */
import { Env } from '../index';

const GOOGLE_ADS_API = 'https://googleads.googleapis.com/v14';

async function getGoogleAdsAccessToken(env: Env): Promise<string> {
  // Use same OAuth as other Google services
  const cached = await env.CHI_KV.get('google_access_token');
  if (cached) {
    const { token, expires } = JSON.parse(cached);
    if (Date.now() < expires - 60000) return token;
  }
  
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
  
  const data = await response.json() as { access_token: string; expires_in: number };
  await env.CHI_KV.put('google_access_token', JSON.stringify({
    token: data.access_token,
    expires: Date.now() + (data.expires_in * 1000),
  }), { expirationTtl: data.expires_in });
  
  return data.access_token;
}

export async function handleGoogleAds(request: Request, env: Env, path: string): Promise<Response> {
  const accessToken = await getGoogleAdsAccessToken(env);
  const developerToken = env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const customerId = env.GOOGLE_ADS_CUSTOMER_ID;
  
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
  };
  
  // GET /customers - List accessible customers
  if (path === '/customers' || path === '') {
    const response = await fetch(
      `${GOOGLE_ADS_API}/customers:listAccessibleCustomers`,
      { headers }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /campaigns - List campaigns via GAQL
  if (path === '/campaigns') {
    const query = `
      SELECT campaign.id, campaign.name, campaign.status, 
             campaign_budget.amount_micros, metrics.impressions, 
             metrics.clicks, metrics.cost_micros
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.name
    `;
    
    const response = await fetch(
      `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
      }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /performance - Get account performance
  if (path === '/performance') {
    const url = new URL(request.url);
    const days = url.searchParams.get('days') || '7';
    
    const query = `
      SELECT metrics.impressions, metrics.clicks, metrics.cost_micros,
             metrics.conversions, metrics.ctr, metrics.average_cpc
      FROM customer
      WHERE segments.date DURING LAST_${days}_DAYS
    `;
    
    const response = await fetch(
      `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
      }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown google-ads endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
