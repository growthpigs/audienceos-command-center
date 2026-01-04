/**
 * Meta (Facebook) Ads API Route Handler
 * Supports both read and write operations
 */
import { Env } from '../index';

const META_API = 'https://graph.facebook.com/v18.0';

export async function handleMetaAds(request: Request, env: Env, path: string): Promise<Response> {
  const url = new URL(request.url);
  const accessToken = env.META_ACCESS_TOKEN;
  
  // GET /accounts - List ad accounts
  if (path === '/accounts' || path === '') {
    const response = await fetch(
      `${META_API}/me/adaccounts?fields=id,name,account_status,amount_spent,balance&access_token=${accessToken}`
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /account/:id/campaigns - List campaigns
  if (path.includes('/campaigns')) {
    const accountId = path.split('/')[2];
    const response = await fetch(
      `${META_API}/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&access_token=${accessToken}`
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /account/:id/ads - List ads
  if (path.includes('/ads')) {
    const accountId = path.split('/')[2];
    const response = await fetch(
      `${META_API}/${accountId}/ads?fields=id,name,status,creative,adset_id&access_token=${accessToken}`
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /account/:id/insights - Get performance insights
  if (path.includes('/insights')) {
    const accountId = path.split('/')[2];
    const datePreset = url.searchParams.get('date_preset') || 'last_7d';
    const response = await fetch(
      `${META_API}/${accountId}/insights?fields=impressions,clicks,spend,cpc,cpm,ctr,reach&date_preset=${datePreset}&access_token=${accessToken}`
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // POST /campaign/:id/status - Update campaign status
  if (path.includes('/status') && request.method === 'POST') {
    const campaignId = path.split('/')[2];
    const body = await request.json() as { status: string };
    const response = await fetch(
      `${META_API}/${campaignId}?status=${body.status}&access_token=${accessToken}`,
      { method: 'POST' }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown meta-ads endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
