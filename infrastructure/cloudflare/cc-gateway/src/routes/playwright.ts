/**
 * Playwright Browser Automation Route Handler
 * Uses Browserless.io or similar headless browser service
 */
import { Env } from '../index';

export async function handlePlaywright(request: Request, env: Env, path: string): Promise<Response> {
  const browserlessToken = env.BROWSERLESS_TOKEN;
  const browserlessUrl = env.BROWSERLESS_URL || 'https://chrome.browserless.io';
  
  // POST /screenshot - Take screenshot of URL
  if (path === '/screenshot' && request.method === 'POST') {
    const body = await request.json() as { url: string; fullPage?: boolean };
    
    const response = await fetch(`${browserlessUrl}/screenshot?token=${browserlessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: body.url,
        options: {
          fullPage: body.fullPage || false,
          type: 'png'
        }
      })
    });
    
    const imageBuffer = await response.arrayBuffer();
    return new Response(imageBuffer, {
      headers: { 'Content-Type': 'image/png' }
    });
  }
  
  // POST /pdf - Generate PDF of URL
  if (path === '/pdf' && request.method === 'POST') {
    const body = await request.json() as { url: string };
    
    const response = await fetch(`${browserlessUrl}/pdf?token=${browserlessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: body.url,
        options: { printBackground: true }
      })
    });
    
    const pdfBuffer = await response.arrayBuffer();
    return new Response(pdfBuffer, {
      headers: { 'Content-Type': 'application/pdf' }
    });
  }
  
  // POST /content - Get page content/HTML
  if (path === '/content' && request.method === 'POST') {
    const body = await request.json() as { url: string };
    
    const response = await fetch(`${browserlessUrl}/content?token=${browserlessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: body.url })
    });
    
    const content = await response.text();
    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // POST /scrape - Scrape specific elements
  if (path === '/scrape' && request.method === 'POST') {
    const body = await request.json() as { url: string; elements: string[] | { selector: string }[] };
    
    // Normalize elements to Browserless format
    const elements = body.elements.map(el => 
      typeof el === 'string' ? { selector: el } : el
    );
    
    const response = await fetch(`${browserlessUrl}/scrape?token=${browserlessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: body.url,
        elements: elements
      })
    });
    
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // POST /function - Run custom browser function
  if (path === '/function' && request.method === 'POST') {
    const body = await request.json() as { code: string; context?: any };
    
    const response = await fetch(`${browserlessUrl}/function?token=${browserlessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: body.code,
        context: body.context || {}
      })
    });
    
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown playwright endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
