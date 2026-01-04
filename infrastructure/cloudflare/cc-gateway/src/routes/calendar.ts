/**
 * Calendar Route Handler
 * 
 * Endpoints:
 * - GET /events - List upcoming events
 * - GET /event/:id - Get single event
 * - POST /event - Create event
 * - GET /calendars - List calendars
 */

import { Env } from '../index';

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

async function getAccessToken(env: Env): Promise<string> {
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

export async function handleCalendar(request: Request, env: Env, path: string): Promise<Response> {
  const accessToken = await getAccessToken(env);
  const url = new URL(request.url);
  
  // GET /events - List upcoming events
  if (path === '/events' || path === '') {
    const calendarId = url.searchParams.get('calendarId') || 'primary';
    const maxResults = url.searchParams.get('maxResults') || '10';
    const timeMin = url.searchParams.get('timeMin') || new Date().toISOString();
    
    const response = await fetch(
      `${CALENDAR_API}/calendars/${calendarId}/events?maxResults=${maxResults}&timeMin=${timeMin}&orderBy=startTime&singleEvents=true`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /calendars - List all calendars
  if (path === '/calendars') {
    const response = await fetch(
      `${CALENDAR_API}/users/me/calendarList`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // POST /event - Create event
  if (path === '/event' && request.method === 'POST') {
    const body = await request.json() as {
      summary: string;
      start: string;
      end: string;
      description?: string;
      calendarId?: string;
    };
    
    const calendarId = body.calendarId || 'primary';
    
    const response = await fetch(
      `${CALENDAR_API}/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: body.summary,
          description: body.description,
          start: { dateTime: body.start },
          end: { dateTime: body.end },
        }),
      }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown calendar endpoint', path }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
