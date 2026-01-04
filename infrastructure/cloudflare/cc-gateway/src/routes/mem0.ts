/**
 * Mem0 Memory API Route Handler
 * Provides persistent memory for Chi across sessions
 */
import { Env } from '../index';

const MEM0_API = 'https://api.mem0.ai';

export async function handleMem0(request: Request, env: Env, path: string): Promise<Response> {
  // Validate API key exists
  if (!env.MEM0_API_KEY) {
    return new Response(JSON.stringify({ error: 'MEM0_API_KEY not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const headers = {
    'Authorization': `Token ${env.MEM0_API_KEY}`,
    'Content-Type': 'application/json',
  };

  // POST /add - Add memory
  if (path === '/add') {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { 'Content-Type': 'application/json' }
      });
    }

    let body: { content?: string; userId?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!body.content) {
      return new Response(JSON.stringify({ error: 'content is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(`${MEM0_API}/v1/memories/`, {
      method: 'POST', headers,
      body: JSON.stringify({
        messages: [{ role: 'user', content: body.content }],
        user_id: body.userId || 'chi',
        metadata: { source: 'chi-gateway' }
      })
    });
    return new Response(JSON.stringify(await response.json()), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // POST /search - Search memories
  if (path === '/search') {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { 'Content-Type': 'application/json' }
      });
    }

    let body: { query?: string; userId?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!body.query) {
      return new Response(JSON.stringify({ error: 'query is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = body.userId || 'chi';
    const response = await fetch(`${MEM0_API}/v1/memories/search/`, {
      method: 'POST', headers,
      body: JSON.stringify({
        query: body.query,
        user_id: userId,
        top_k: 10
      })
    });
    return new Response(JSON.stringify(await response.json()), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Unknown mem0 endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
