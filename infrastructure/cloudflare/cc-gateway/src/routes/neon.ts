/**
 * Neon Database API Route Handler
 */
import { Env } from '../index';

interface NeonEnv extends Env {
  NEON_ORG_ID: string;
}

const NEON_API = 'https://console.neon.tech/api/v2';

export async function handleNeon(request: Request, env: NeonEnv, path: string): Promise<Response> {
  const headers = {
    'Authorization': `Bearer ${env.NEON_API_KEY}`,
    'Content-Type': 'application/json',
  };
  
  // GET /projects - List projects (requires org_id)
  if (path === '/projects' || path === '') {
    const response = await fetch(`${NEON_API}/projects?org_id=${env.NEON_ORG_ID}`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /project/:id - Get project details
  if (path.startsWith('/project/') && !path.includes('/branches')) {
    const projectId = path.replace('/project/', '');
    const response = await fetch(`${NEON_API}/projects/${projectId}`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // GET /project/:id/branches - Get branches
  if (path.includes('/branches')) {
    const projectId = path.split('/')[2];
    const response = await fetch(`${NEON_API}/projects/${projectId}/branches`, { headers });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown neon endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
