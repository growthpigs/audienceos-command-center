/**
 * Netlify API Route Handler
 */
import { Env } from '../index';

const NETLIFY_API = 'https://api.netlify.com/api/v1';

async function safeJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) {
    return { error: 'Empty response', status: response.status };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'Invalid JSON', raw: text.substring(0, 200), status: response.status };
  }
}

export async function handleNetlify(request: Request, env: Env, path: string): Promise<Response> {
  if (!env.NETLIFY_AUTH_TOKEN) {
    return new Response(JSON.stringify({ error: 'NETLIFY_AUTH_TOKEN not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const headers = {
    'Authorization': `Bearer ${env.NETLIFY_AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // GET /sites - List sites
  if (path === '/sites' || path === '') {
    const response = await fetch(`${NETLIFY_API}/sites`, { headers });
    return new Response(JSON.stringify(await safeJson(response)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /site/:id - Get site details
  if (path.startsWith('/site/') && !path.includes('/deploys')) {
    const siteId = path.replace('/site/', '');
    const response = await fetch(`${NETLIFY_API}/sites/${siteId}`, { headers });
    return new Response(JSON.stringify(await safeJson(response)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // GET /site/:id/deploys - Get deploys
  if (path.includes('/deploys') && !request.method.includes('POST')) {
    const siteId = path.split('/')[2];
    const response = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys?per_page=10`, { headers });
    return new Response(JSON.stringify(await safeJson(response)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // POST /site/:id/builds - Trigger build
  if (path.includes('/builds') && request.method === 'POST') {
    const siteId = path.split('/')[2];
    const response = await fetch(`${NETLIFY_API}/sites/${siteId}/builds`, {
      method: 'POST', headers
    });
    return new Response(JSON.stringify(await safeJson(response)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown netlify endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
