/**
 * Google Sheets Route Handler
 * 
 * Endpoints:
 * - GET /sheets/list - List spreadsheets
 * - POST /sheets/create - Create new spreadsheet
 * - GET /sheets/read - Read spreadsheet data
 * - POST /sheets/write - Write data to spreadsheet
 * - POST /sheets/append - Append rows to spreadsheet
 */
import { Env } from '../index';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';

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
    token: data.access_token, expires: Date.now() + (data.expires_in * 1000),
  }), { expirationTtl: data.expires_in });
  return data.access_token;
}

export async function handleSheets(request: Request, env: Env, path: string): Promise<Response> {
  const accessToken = await getAccessToken(env);
  const url = new URL(request.url);
  
  // List spreadsheets
  if (path === '/list' || path === '') {
    const folderId = url.searchParams.get('folderId') || '';
    let query = "mimeType='application/vnd.google-apps.spreadsheet'";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }
    const response = await fetch(
      `${DRIVE_API}/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,webViewLink)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Create spreadsheet
  if (path === '/create' && request.method === 'POST') {
    const body = await request.json() as { 
      title: string; 
      folderId?: string;
      sheets?: Array<{ title: string }>;
    };
    
    // Create the spreadsheet
    const createResponse = await fetch(SHEETS_API, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: { title: body.title },
        sheets: body.sheets?.map(s => ({ properties: { title: s.title } })) || []
      })
    });
    const spreadsheet = await createResponse.json() as { spreadsheetId: string; spreadsheetUrl: string };
    
    // Move to folder if specified
    if (body.folderId && spreadsheet.spreadsheetId) {
      await fetch(
        `${DRIVE_API}/files/${spreadsheet.spreadsheetId}?addParents=${body.folderId}&fields=id`,
        { 
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` } 
        }
      );
    }
    
    return new Response(JSON.stringify(spreadsheet), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get spreadsheet metadata (all sheet names/tabs)
  if (path === '/metadata') {
    const spreadsheetId = url.searchParams.get('spreadsheetId');
    
    if (!spreadsheetId) {
      return new Response(JSON.stringify({ error: 'spreadsheetId required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch(
      `${SHEETS_API}/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await response.json() as {
      spreadsheetId: string;
      properties: { title: string };
      sheets: Array<{ properties: { sheetId: number; title: string; index: number } }>;
    };
    
    return new Response(JSON.stringify({
      spreadsheetId: data.spreadsheetId,
      title: data.properties?.title,
      sheets: data.sheets?.map(s => ({
        sheetId: s.properties.sheetId,
        title: s.properties.title,
        index: s.properties.index
      })) || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Read spreadsheet data
  if (path === '/read') {
    const spreadsheetId = url.searchParams.get('spreadsheetId');
    const range = url.searchParams.get('range') || 'Sheet1';
    
    if (!spreadsheetId) {
      return new Response(JSON.stringify({ error: 'spreadsheetId required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch(
      `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Write data to spreadsheet
  if (path === '/write' && request.method === 'POST') {
    const body = await request.json() as { 
      spreadsheetId: string;
      range: string;
      values: string[][];
    };
    
    const response = await fetch(
      `${SHEETS_API}/${body.spreadsheetId}/values/${encodeURIComponent(body.range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: body.values })
      }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Append rows to spreadsheet
  if (path === '/append' && request.method === 'POST') {
    const body = await request.json() as { 
      spreadsheetId: string;
      range: string;
      values: string[][];
    };
    
    const response = await fetch(
      `${SHEETS_API}/${body.spreadsheetId}/values/${encodeURIComponent(body.range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: body.values })
      }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown sheets endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
