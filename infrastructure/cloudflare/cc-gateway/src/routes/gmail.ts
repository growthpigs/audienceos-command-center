/**
 * Gmail Route Handler
 * 
 * Endpoints:
 * - GET /inbox - List inbox messages
 * - GET /message/:id - Get single message
 * - POST /send - Send email
 * - GET /labels - List labels
 * - POST /label/:messageId - Apply label to message
 */

import { Env } from '../index';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function getAccessToken(env: Env): Promise<string> {
  // Check KV cache first
  const cached = await env.CHI_KV.get('google_access_token');
  if (cached) {
    const { token, expires } = JSON.parse(cached);
    if (Date.now() < expires - 60000) { // 1 min buffer
      return token;
    }
  }
  
  // Refresh token
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
  
  if (!response.ok) {
    throw new Error(`Token refresh failed: ${await response.text()}`);
  }
  
  const data = await response.json() as { access_token: string; expires_in: number };
  
  // Cache the token
  await env.CHI_KV.put('google_access_token', JSON.stringify({
    token: data.access_token,
    expires: Date.now() + (data.expires_in * 1000),
  }), { expirationTtl: data.expires_in });
  
  return data.access_token;
}

export async function handleGmail(request: Request, env: Env, path: string): Promise<Response> {
  const accessToken = await getAccessToken(env);
  const url = new URL(request.url);
  
  // GET /inbox - List messages
  if (path === '/inbox' || path === '') {
    const maxResults = url.searchParams.get('maxResults') || '20';
    const q = url.searchParams.get('q') || 'in:inbox';
    
    const response = await fetch(
      `${GMAIL_API}/messages?maxResults=${maxResults}&q=${encodeURIComponent(q)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // GET /message/:id - Get single message with full content
  if (path.startsWith('/message/')) {
    const messageId = path.replace('/message/', '');
    const format = url.searchParams.get('format') || 'full';
    
    const response = await fetch(
      `${GMAIL_API}/messages/${messageId}?format=${format}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // GET /labels - List all labels
  if (path === '/labels') {
    const response = await fetch(
      `${GMAIL_API}/labels`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // POST /send - Send email
  if (path === '/send' && request.method === 'POST') {
    const body = await request.json() as { to: string; subject: string; body: string };
    
    const email = [
      `To: ${body.to}`,
      `Subject: ${body.subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body.body
    ].join('\r\n');
    
    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    const response = await fetch(
      `${GMAIL_API}/messages/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedEmail }),
      }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // POST /archive/:id - Archive message (remove from inbox)
  if (path.startsWith('/archive/') && request.method === 'POST') {
    const messageId = path.replace('/archive/', '');
    const response = await fetch(
      `${GMAIL_API}/messages/${messageId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ removeLabelIds: ['INBOX'] })
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // GET /threads - List threads (for conversation view)
  if (path === '/threads') {
    const maxResults = url.searchParams.get('maxResults') || '20';
    const q = url.searchParams.get('q') || 'in:inbox';
    
    const response = await fetch(
      `${GMAIL_API}/threads?maxResults=${maxResults}&q=${encodeURIComponent(q)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Unknown gmail endpoint', path }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
