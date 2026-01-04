/**
 * Google Docs Route Handler
 * 
 * Endpoints:
 * - GET /docs/list - List documents
 * - POST /docs/create - Create new document
 * - GET /docs/read - Read document content
 * - POST /docs/write - Write/update document
 * - POST /docs/append - Append text to document
 */
import { Env } from '../index';

const DOCS_API = 'https://docs.googleapis.com/v1/documents';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';

// Formatting settings
const FORMAT_SETTINGS = {
  bodyFont: 'Merriweather',
  bodySize: 14,
  h1Size: 24,
  h2Size: 18,
  h3Size: 14,
};

// Parse markdown and return text + formatting requests
function parseMarkdownForDocs(markdown: string): { plainText: string; requests: any[] } {
  const lines = markdown.split('\n');
  const requests: any[] = [];
  let plainText = '';
  let currentIndex = 1; // Google Docs starts at index 1
  
  // Track ranges for different formatting
  const headingRanges: Array<{start: number; end: number; level: number}> = [];
  
  for (const line of lines) {
    let text = line;
    let headingLevel = 0;
    
    // Check for headings
    if (line.startsWith('### ')) {
      text = line.substring(4);
      headingLevel = 3;
    } else if (line.startsWith('## ')) {
      text = line.substring(3);
      headingLevel = 2;
    } else if (line.startsWith('# ')) {
      text = line.substring(2);
      headingLevel = 1;
    }
    
    // Remove markdown formatting for plain text (basic)
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // bold
    text = text.replace(/\*(.*?)\*/g, '$1'); // italic
    text = text.replace(/`(.*?)`/g, '$1'); // code
    
    const startIndex = currentIndex;
    const textWithNewline = text + '\n';
    plainText += textWithNewline;
    const endIndex = currentIndex + textWithNewline.length;
    
    // Track heading ranges
    if (headingLevel > 0 && text.length > 0) {
      headingRanges.push({
        start: startIndex,
        end: endIndex - 1, // exclude newline
        level: headingLevel
      });
    }
    
    currentIndex = endIndex;
  }
  
  // First: Apply base font to entire document
  if (plainText.length > 0) {
    requests.push({
      updateTextStyle: {
        range: { startIndex: 1, endIndex: currentIndex - 1 },
        textStyle: {
          fontSize: { magnitude: FORMAT_SETTINGS.bodySize, unit: 'PT' },
          weightedFontFamily: { fontFamily: FORMAT_SETTINGS.bodyFont },
        },
        fields: 'fontSize,weightedFontFamily'
      }
    });
  }
  
  // Then: Apply heading formatting (larger + bold)
  for (const heading of headingRanges) {
    const fontSize = heading.level === 1 ? FORMAT_SETTINGS.h1Size : 
                     heading.level === 2 ? FORMAT_SETTINGS.h2Size : FORMAT_SETTINGS.h3Size;
    requests.push({
      updateTextStyle: {
        range: { startIndex: heading.start, endIndex: heading.end },
        textStyle: {
          bold: true,
          fontSize: { magnitude: fontSize, unit: 'PT' },
        },
        fields: 'bold,fontSize'
      }
    });
  }
  
  return { plainText, requests };
}

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

export async function handleDocs(request: Request, env: Env, path: string): Promise<Response> {
  const accessToken = await getAccessToken(env);
  const url = new URL(request.url);
  
  // List documents
  if (path === '/list' || path === '') {
    const folderId = url.searchParams.get('folderId') || '';
    let query = "mimeType='application/vnd.google-apps.document'";
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
  
  // Create document
  if (path === '/create' && request.method === 'POST') {
    const body = await request.json() as { 
      title: string; 
      folderId?: string;
      content?: string;
    };
    
    // Create the document
    const createResponse = await fetch(DOCS_API, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: body.title
      })
    });
    const doc = await createResponse.json() as { documentId: string };
    
    // Add initial content if provided
    if (body.content && doc.documentId) {
      await fetch(`${DOCS_API}/${doc.documentId}:batchUpdate`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{
            insertText: {
              location: { index: 1 },
              text: body.content
            }
          }]
        })
      });
    }
    
    // Move to folder if specified
    if (body.folderId && doc.documentId) {
      await fetch(
        `${DRIVE_API}/files/${doc.documentId}?addParents=${body.folderId}&fields=id`,
        { 
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` } 
        }
      );
    }
    
    return new Response(JSON.stringify({
      documentId: doc.documentId,
      documentUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Create formatted document (parses markdown, applies styles)
  if (path === '/create-formatted' && request.method === 'POST') {
    const body = await request.json() as { 
      title: string; 
      folderId?: string;
      content: string; // Markdown content
    };
    
    // Parse markdown
    const { plainText, requests: formatRequests } = parseMarkdownForDocs(body.content);
    
    // Create the document
    const createResponse = await fetch(DOCS_API, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: body.title })
    });
    const doc = await createResponse.json() as { documentId: string };
    
    if (doc.documentId && plainText) {
      // Insert all text first
      const insertResult = await fetch(`${DOCS_API}/${doc.documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{
            insertText: {
              location: { index: 1 },
              text: plainText
            }
          }]
        })
      });
      const insertResponse = await insertResult.json();

      // Then apply formatting
      let formatResponse = null;
      if (formatRequests.length > 0) {
        const formatResult = await fetch(`${DOCS_API}/${doc.documentId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: formatRequests })
        });
        formatResponse = await formatResult.json();
      }

      // Move to folder if specified (FIXED: moved BEFORE return)
      if (body.folderId) {
        await fetch(
          `${DRIVE_API}/files/${doc.documentId}?addParents=${body.folderId}&fields=id`,
          {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
      }

      // Return debug info
      return new Response(JSON.stringify({
        documentId: doc.documentId,
        documentUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`,
        formatted: true,
        debug: {
          textLength: plainText.length,
          formatRequestCount: formatRequests.length,
          formatRequests: formatRequests.slice(0, 3), // first 3 for debugging
          formatResponse: formatResponse
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback: Move to folder if specified (when no content provided)
    if (body.folderId && doc.documentId) {
      await fetch(
        `${DRIVE_API}/files/${doc.documentId}?addParents=${body.folderId}&fields=id`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
    }

    return new Response(JSON.stringify({
      documentId: doc.documentId,
      documentUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`,
      formatted: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Read document content
  if (path === '/read') {
    const documentId = url.searchParams.get('documentId');
    
    if (!documentId) {
      return new Response(JSON.stringify({ error: 'documentId required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch(
      `${DOCS_API}/${documentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const doc = await response.json() as { 
      title: string;
      body: { content: Array<{ paragraph?: { elements: Array<{ textRun?: { content: string } }> } }> };
    };
    
    // Extract plain text from document
    let plainText = '';
    if (doc.body?.content) {
      for (const element of doc.body.content) {
        if (element.paragraph?.elements) {
          for (const textElement of element.paragraph.elements) {
            if (textElement.textRun?.content) {
              plainText += textElement.textRun.content;
            }
          }
        }
      }
    }
    
    return new Response(JSON.stringify({
      title: doc.title,
      content: plainText,
      documentUrl: `https://docs.google.com/document/d/${documentId}/edit`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Append text to document
  if (path === '/append' && request.method === 'POST') {
    const body = await request.json() as { 
      documentId: string;
      text: string;
    };
    
    // First get document to find end index
    const docResponse = await fetch(
      `${DOCS_API}/${body.documentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const doc = await docResponse.json() as { 
      body: { content: Array<{ endIndex: number }> };
    };
    
    // Find the end index
    const endIndex = doc.body?.content?.[doc.body.content.length - 1]?.endIndex || 1;
    
    // Append text
    const response = await fetch(`${DOCS_API}/${body.documentId}:batchUpdate`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          insertText: {
            location: { index: endIndex - 1 },
            text: '\n' + body.text
          }
        }]
      })
    });
    
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown docs endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
