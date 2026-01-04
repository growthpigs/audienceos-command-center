/**
 * Unipile API Route Handler
 * LinkedIn messaging and automation via Unipile
 * 
 * API Docs: https://docs.unipile.com
 * DSN: api3.unipile.com:13344
 */
import { Env } from '../index';

const UNIPILE_API = 'https://api3.unipile.com:13344/api/v1';

export async function handleUnipile(request: Request, env: Env, path: string): Promise<Response> {
  const headers = {
    'X-API-KEY': env.UNIPILE_API_KEY,
    'Content-Type': 'application/json',
    'accept': 'application/json',
  };
  
  // GET /accounts - List connected accounts
  if (path === '/accounts' || path === '') {
    const response = await fetch(`${UNIPILE_API}/accounts`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /account/:id - Get account details
  if (path.match(/^\/account\/[^\/]+$/) && request.method === 'GET') {
    const accountId = path.replace('/account/', '');
    const response = await fetch(`${UNIPILE_API}/accounts/${accountId}`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /messages - List messages (with optional account_id query param)
  if (path === '/messages' || path.startsWith('/messages?')) {
    const url = new URL(request.url);
    const accountId = url.searchParams.get('account_id') || '';
    const limit = url.searchParams.get('limit') || '50';
    const response = await fetch(`${UNIPILE_API}/messages?account_id=${accountId}&limit=${limit}`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /chats - List chat threads
  if (path === '/chats' || path.startsWith('/chats?')) {
    const url = new URL(request.url);
    const accountId = url.searchParams.get('account_id') || '';
    const limit = url.searchParams.get('limit') || '50';
    const response = await fetch(`${UNIPILE_API}/chats?account_id=${accountId}&limit=${limit}`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /chat/:id/messages - Get messages in a chat
  if (path.match(/^\/chat\/[^\/]+\/messages/)) {
    const chatId = path.split('/')[2];
    const response = await fetch(`${UNIPILE_API}/chats/${chatId}/messages`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // POST /send - Send a message
  if (path === '/send' && request.method === 'POST') {
    const body = await request.json() as { account_id: string; chat_id?: string; attendee_id?: string; text: string };
    const response = await fetch(`${UNIPILE_API}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /profile/:id - Get LinkedIn profile
  if (path.match(/^\/profile\/[^\/]+$/)) {
    const profileId = path.replace('/profile/', '');
    const response = await fetch(`${UNIPILE_API}/users/${profileId}`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // POST /connect - Send connection request
  if (path === '/connect' && request.method === 'POST') {
    const body = await request.json() as { account_id: string; profile_id: string; message?: string };
    const response = await fetch(`${UNIPILE_API}/invitations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        account_id: body.account_id,
        provider_id: body.profile_id,
        message: body.message || '',
      }),
    });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown unipile endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
