/**
 * Render API Route Handler
 */
import { Env } from '../index';

const RENDER_API = 'https://api.render.com/v1';

export async function handleRender(request: Request, env: Env, path: string): Promise<Response> {
  const headers = {
    'Authorization': `Bearer ${env.RENDER_API_KEY}`,
    'Content-Type': 'application/json',
  };
  
  // GET /services - List services
  if (path === '/services' || path === '') {
    const response = await fetch(`${RENDER_API}/services`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // POST /service/:id/deploy - Trigger deploy (check BEFORE get service details)
  if (path.endsWith('/deploy') && request.method === 'POST') {
    const serviceId = path.split('/')[2];
    const response = await fetch(`${RENDER_API}/services/${serviceId}/deploys`, {
      method: 'POST', headers
    });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /service/:id/deploys - Get deploys
  if (path.endsWith('/deploys')) {
    const serviceId = path.split('/')[2];
    const response = await fetch(`${RENDER_API}/services/${serviceId}/deploys?limit=10`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /service/:id - Get service details (last, most general)
  if (path.startsWith('/service/')) {
    const serviceId = path.replace('/service/', '');
    const response = await fetch(`${RENDER_API}/services/${serviceId}`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown render endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
