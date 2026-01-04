/**
 * Sentry API Route Handler
 */
import { Env } from '../index';

const SENTRY_API = 'https://sentry.io/api/0';

export async function handleSentry(request: Request, env: Env, path: string): Promise<Response> {
  const headers = {
    'Authorization': `Bearer ${env.SENTRY_AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  // GET /projects - List projects
  if (path === '/projects' || path === '') {
    const response = await fetch(`${SENTRY_API}/projects/`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /issues/:org/:project - Get issues for project
  if (path.startsWith('/issues/')) {
    const parts = path.replace('/issues/', '').split('/');
    const org = parts[0];
    const project = parts[1];
    const response = await fetch(
      `${SENTRY_API}/projects/${org}/${project}/issues/?statsPeriod=24h`,
      { headers }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /organizations - List organizations
  if (path === '/organizations') {
    const response = await fetch(`${SENTRY_API}/organizations/`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /teams/:org - List teams in organization
  if (path.startsWith('/teams/') && !path.includes('/projects')) {
    const org = path.replace('/teams/', '');
    const response = await fetch(`${SENTRY_API}/organizations/${org}/teams/`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // POST /teams/:org/:team/projects - Create project
  if (path.includes('/projects') && request.method === 'POST') {
    const parts = path.replace('/teams/', '').split('/');
    const org = parts[0];
    const team = parts[1];
    const body = await request.json();
    const response = await fetch(`${SENTRY_API}/teams/${org}/${team}/projects/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return new Response(JSON.stringify(await response.json()), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown sentry endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
