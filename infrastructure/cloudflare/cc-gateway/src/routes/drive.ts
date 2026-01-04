/**
 * Google Drive Route Handler (Enhanced)
 * 
 * Endpoints:
 * - GET /drive/files - List files
 * - GET /drive/file/:id - Get file details
 * - POST /drive/folder - Create folder
 * - POST /drive/move - Move file to folder
 * - GET /drive/search - Search files
 */
import { Env } from '../index';

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

export async function handleDrive(request: Request, env: Env, path: string): Promise<Response> {
  const accessToken = await getAccessToken(env);
  const url = new URL(request.url);
  
  // List files
  if (path === '/files' || path === '') {
    const q = url.searchParams.get('q') || '';
    const folderId = url.searchParams.get('folderId') || '';
    const pageSize = url.searchParams.get('pageSize') || '20';
    
    // ALWAYS exclude trashed files
    let query = 'trashed=false';
    if (q) {
      query = `${query} and ${q}`;
    }
    if (folderId) {
      query = `${query} and '${folderId}' in parents`;
    }
    
    const apiUrl = `${DRIVE_API}/files?pageSize=${pageSize}&q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,parents)`;
    
    const response = await fetch(apiUrl, { 
      headers: { Authorization: `Bearer ${accessToken}` } 
    });
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get file details
  if (path.startsWith('/file/')) {
    const fileId = path.replace('/file/', '');
    const response = await fetch(
      `${DRIVE_API}/files/${fileId}?fields=id,name,mimeType,modifiedTime,webViewLink,parents`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Create folder
  if (path === '/folder' && request.method === 'POST') {
    const body = await request.json() as { 
      name: string; 
      parentId?: string;
    };
    
    const metadata: { name: string; mimeType: string; parents?: string[] } = {
      name: body.name,
      mimeType: 'application/vnd.google-apps.folder'
    };
    
    if (body.parentId) {
      metadata.parents = [body.parentId];
    }
    
    const response = await fetch(`${DRIVE_API}/files`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    
    const folder = await response.json() as { id: string; name: string };
    return new Response(JSON.stringify({
      ...folder,
      webViewLink: `https://drive.google.com/drive/folders/${folder.id}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Move file to folder
  if (path === '/move' && request.method === 'POST') {
    const body = await request.json() as { 
      fileId: string; 
      folderId: string;
      removeFromCurrent?: boolean;
    };
    
    // Get current parents if we need to remove from them
    let removeParents = '';
    if (body.removeFromCurrent) {
      const fileResponse = await fetch(
        `${DRIVE_API}/files/${body.fileId}?fields=parents`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const file = await fileResponse.json() as { parents: string[] };
      removeParents = file.parents?.join(',') || '';
    }
    
    const moveUrl = removeParents
      ? `${DRIVE_API}/files/${body.fileId}?addParents=${body.folderId}&removeParents=${removeParents}&fields=id,parents`
      : `${DRIVE_API}/files/${body.fileId}?addParents=${body.folderId}&fields=id,parents`;
    
    const response = await fetch(moveUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Search files
  if (path === '/search') {
    const name = url.searchParams.get('name') || '';
    const mimeType = url.searchParams.get('mimeType') || '';
    const folderId = url.searchParams.get('folderId') || '';
    
    // ALWAYS exclude trashed files
    const conditions: string[] = ['trashed=false'];
    if (name) conditions.push(`name contains '${name}'`);
    if (mimeType) conditions.push(`mimeType='${mimeType}'`);
    if (folderId) conditions.push(`'${folderId}' in parents`);
    
    const query = conditions.join(' and ');
    
    const response = await fetch(
      `${DRIVE_API}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,parents)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return new Response(JSON.stringify(await response.json()), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Convert Office files to Google format (keeps the converted file)
  if (path === '/convert' && request.method === 'POST') {
    const body = await request.json() as { 
      fileId: string;
      targetFolderId?: string;
    };
    
    // Get file metadata
    const metaResponse = await fetch(
      `${DRIVE_API}/files/${body.fileId}?fields=id,name,mimeType`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const fileMeta = await metaResponse.json() as { id: string; name: string; mimeType: string };
    
    // Determine target Google format
    let targetMimeType: string;
    let targetType: string;
    
    if (
      fileMeta.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileMeta.mimeType === 'application/vnd.ms-excel'
    ) {
      targetMimeType = 'application/vnd.google-apps.spreadsheet';
      targetType = 'Google Sheets';
    } else if (
      fileMeta.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileMeta.mimeType === 'application/msword'
    ) {
      targetMimeType = 'application/vnd.google-apps.document';
      targetType = 'Google Docs';
    } else if (
      fileMeta.mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileMeta.mimeType === 'application/vnd.ms-powerpoint'
    ) {
      targetMimeType = 'application/vnd.google-apps.presentation';
      targetType = 'Google Slides';
    } else if (fileMeta.mimeType === 'application/pdf') {
      targetMimeType = 'application/vnd.google-apps.document';
      targetType = 'Google Docs (OCR)';
    } else {
      return new Response(JSON.stringify({
        error: 'Unsupported file type for conversion',
        fileId: fileMeta.id,
        fileName: fileMeta.name,
        mimeType: fileMeta.mimeType,
        supportedTypes: ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'pdf']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Copy and convert
    const copyBody: { name: string; mimeType: string; parents?: string[] } = {
      name: fileMeta.name.replace(/\.(xlsx|xls|docx|doc|pptx|ppt|pdf)$/i, ''),
      mimeType: targetMimeType
    };
    
    if (body.targetFolderId) {
      copyBody.parents = [body.targetFolderId];
    }
    
    const copyResponse = await fetch(`${DRIVE_API}/files/${body.fileId}/copy`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(copyBody)
    });
    
    if (!copyResponse.ok) {
      const error = await copyResponse.text();
      return new Response(JSON.stringify({
        error: 'Conversion failed',
        details: error,
        fileId: fileMeta.id,
        fileName: fileMeta.name
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const converted = await copyResponse.json() as { id: string; name: string };
    
    return new Response(JSON.stringify({
      success: true,
      original: {
        fileId: fileMeta.id,
        fileName: fileMeta.name,
        mimeType: fileMeta.mimeType
      },
      converted: {
        fileId: converted.id,
        fileName: converted.name,
        mimeType: targetMimeType,
        type: targetType,
        webViewLink: targetMimeType === 'application/vnd.google-apps.spreadsheet'
          ? `https://docs.google.com/spreadsheets/d/${converted.id}/edit`
          : targetMimeType === 'application/vnd.google-apps.document'
          ? `https://docs.google.com/document/d/${converted.id}/edit`
          : `https://docs.google.com/presentation/d/${converted.id}/edit`
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Export file content (PDF, DOCX, Google Docs → plain text)
  if (path === '/export' && request.method === 'POST') {
    const body = await request.json() as { 
      fileId: string;
    };
    
    // First get file metadata to determine type
    const metaResponse = await fetch(
      `${DRIVE_API}/files/${body.fileId}?fields=id,name,mimeType`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const fileMeta = await metaResponse.json() as { id: string; name: string; mimeType: string };
    
    let content = '';
    let exportMethod = '';
    
    // Google Docs - export as plain text
    if (fileMeta.mimeType === 'application/vnd.google-apps.document') {
      const exportResponse = await fetch(
        `${DRIVE_API}/files/${body.fileId}/export?mimeType=text/plain`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      content = await exportResponse.text();
      exportMethod = 'google-docs-export';
    }
    // Google Sheets - export as CSV
    else if (fileMeta.mimeType === 'application/vnd.google-apps.spreadsheet') {
      const exportResponse = await fetch(
        `${DRIVE_API}/files/${body.fileId}/export?mimeType=text/csv`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      content = await exportResponse.text();
      exportMethod = 'google-sheets-export';
    }
    // PDF - Try Google's OCR by copying as Google Doc
    else if (fileMeta.mimeType === 'application/pdf') {
      // Google can OCR PDFs when you copy them as a Google Doc
      // Step 1: Copy the PDF as a Google Doc (triggers OCR)
      const copyResponse = await fetch(`${DRIVE_API}/files/${body.fileId}/copy`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${fileMeta.name}_extracted`,
          mimeType: 'application/vnd.google-apps.document'
        })
      });
      
      if (!copyResponse.ok) {
        // If copy fails, return download instructions
        return new Response(JSON.stringify({
          fileId: fileMeta.id,
          fileName: fileMeta.name,
          mimeType: fileMeta.mimeType,
          exportMethod: 'pdf-conversion-failed',
          error: 'Could not convert PDF via Google OCR',
          note: 'Download PDF locally and use pdfplumber to extract text.'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const copiedDoc = await copyResponse.json() as { id: string; name: string };
      
      // Step 2: Export the Google Doc as plain text
      const exportResponse = await fetch(
        `${DRIVE_API}/files/${copiedDoc.id}/export?mimeType=text/plain`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      const extractedText = await exportResponse.text();
      
      // Step 3: Delete the temporary Google Doc copy
      await fetch(`${DRIVE_API}/files/${copiedDoc.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      return new Response(JSON.stringify({
        fileId: fileMeta.id,
        fileName: fileMeta.name,
        mimeType: fileMeta.mimeType,
        exportMethod: 'pdf-google-ocr',
        content: extractedText,
        note: 'Text extracted via Google OCR (PDF → Google Doc → Text)'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Office formats (DOCX, XLSX, PPTX) - copy as Google format, then export
    else if (
      fileMeta.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileMeta.mimeType === 'application/msword'
    ) {
      // Copy DOCX as Google Doc, then export as text
      const copyResponse = await fetch(`${DRIVE_API}/files/${body.fileId}/copy`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${fileMeta.name}_extracted`,
          mimeType: 'application/vnd.google-apps.document'
        })
      });
      
      if (!copyResponse.ok) {
        return new Response(JSON.stringify({
          fileId: fileMeta.id,
          fileName: fileMeta.name,
          mimeType: fileMeta.mimeType,
          exportMethod: 'docx-conversion-failed',
          error: 'Could not convert DOCX to Google Doc'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const copiedDoc = await copyResponse.json() as { id: string };
      
      const exportResponse = await fetch(
        `${DRIVE_API}/files/${copiedDoc.id}/export?mimeType=text/plain`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      const extractedText = await exportResponse.text();
      
      // Delete temp file
      await fetch(`${DRIVE_API}/files/${copiedDoc.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      return new Response(JSON.stringify({
        fileId: fileMeta.id,
        fileName: fileMeta.name,
        mimeType: fileMeta.mimeType,
        exportMethod: 'docx-google-convert',
        content: extractedText
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Excel files - copy as Google Sheet, export as CSV
    else if (
      fileMeta.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileMeta.mimeType === 'application/vnd.ms-excel'
    ) {
      const copyResponse = await fetch(`${DRIVE_API}/files/${body.fileId}/copy`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${fileMeta.name}_extracted`,
          mimeType: 'application/vnd.google-apps.spreadsheet'
        })
      });
      
      if (!copyResponse.ok) {
        return new Response(JSON.stringify({
          fileId: fileMeta.id,
          fileName: fileMeta.name,
          mimeType: fileMeta.mimeType,
          exportMethod: 'xlsx-conversion-failed',
          error: 'Could not convert XLSX to Google Sheet'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const copiedSheet = await copyResponse.json() as { id: string };
      
      const exportResponse = await fetch(
        `${DRIVE_API}/files/${copiedSheet.id}/export?mimeType=text/csv`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      const extractedCsv = await exportResponse.text();
      
      // Delete temp file
      await fetch(`${DRIVE_API}/files/${copiedSheet.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      return new Response(JSON.stringify({
        fileId: fileMeta.id,
        fileName: fileMeta.name,
        mimeType: fileMeta.mimeType,
        exportMethod: 'xlsx-google-convert',
        content: extractedCsv
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Plain text files - just download
    else if (fileMeta.mimeType.startsWith('text/')) {
      const downloadResponse = await fetch(
        `${DRIVE_API}/files/${body.fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      content = await downloadResponse.text();
      exportMethod = 'text-download';
    }
    // Unknown type
    else {
      return new Response(JSON.stringify({
        error: 'Unsupported file type',
        fileId: fileMeta.id,
        fileName: fileMeta.name,
        mimeType: fileMeta.mimeType,
        supportedTypes: [
          'application/vnd.google-apps.document',
          'application/vnd.google-apps.spreadsheet',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.*',
          'text/*'
        ]
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      fileId: fileMeta.id,
      fileName: fileMeta.name,
      mimeType: fileMeta.mimeType,
      exportMethod,
      content
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown drive endpoint', path }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}
