/**
 * Mercury Banking API Route Handler
 * Read-only access to Badaboost LLC banking
 */
import { Env } from '../index';

const MERCURY_API = 'https://api.mercury.com/api/v1';

export async function handleMercury(request: Request, env: Env, path: string): Promise<Response> {
  const headers = {
    'Authorization': `Bearer ${env.MERCURY_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  // GET /accounts - List accounts
  if (path === '/accounts' || path === '') {
    const response = await fetch(`${MERCURY_API}/accounts`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /account/:id - Get account details
  if (path.startsWith('/account/') && !path.includes('/transactions')) {
    const accountId = path.replace('/account/', '');
    const response = await fetch(`${MERCURY_API}/account/${accountId}`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /account/:id/transactions - Get transactions
  if (path.includes('/transactions')) {
    const accountId = path.split('/')[2];
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '50';
    const response = await fetch(
      `${MERCURY_API}/account/${accountId}/transactions?limit=${limit}`,
      { headers }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown mercury endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
