# API Setup and Testing

> Synced from Drive: 2025-12-31

This document contains the OpenAPI spec, Jest test examples, and RAG prompt templates.

---

## 1. OpenAPI 3.0 Spec (Summary)

See `docs/04-technical/API-CONTRACTS.md` for full endpoint details.

**Key Endpoints:**
- `POST /v1/auth/login` - JWT authentication
- `GET/POST /v1/clients` - Client CRUD
- `POST /v1/clients/{id}/move` - Pipeline stage changes
- `GET/POST /v1/tickets` - Support ticket management
- `POST /v1/assistant/query` - AI RAG queries
- `POST /v1/assistant/draft` - AI email/slack drafts

---

## 2. API Unit Test Suite (Jest + Supertest)

### Install Test Dependencies

```bash
pnpm add -D jest @types/jest supertest ts-jest cross-env
```

### jest.config.js

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 20000,
  roots: ["<rootDir>/__tests__"]
};
```

### Example: Auth Tests

```ts
// __tests__/auth.test.ts
import request from 'supertest';
import app from '../src/server';

describe('Auth endpoints', () => {
  test('POST /v1/auth/login -> success', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'test@agency.com', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /v1/auth/login -> bad creds', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'bad@x.com', password: 'nope' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
```

### Example: Clients Tests

```ts
// __tests__/clients.test.ts
import request from 'supertest';
import app from '../src/server';

describe('Clients', () => {
  test('GET /v1/clients -> list', async () => {
    const res = await request(app).get('/v1/clients');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test('POST /v1/clients -> create', async () => {
    const res = await request(app)
      .post('/v1/clients')
      .send({ name: 'New Client', owner_user_id: 'u1' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('POST /v1/clients -> validation error', async () => {
    const res = await request(app).post('/v1/clients').send({});
    expect(res.status).toBe(400);
  });
});
```

---

## 3. RAG & Assistant Prompt Templates

### System Prompt (Top-Level)

```
You are AudienceOS Assistant — an AI assistant for marketing agencies inside AudienceOS Command Center.
- Always reference the agency and client context when provided.
- You have access to: (1) recent communications (Slack/Gmail threads) (2) indexed documents & SOPs (via RAG) (3) canonical client data (pipeline stage, health, ad metrics, support tickets).
- You must NEVER take autonomous actions (no sending messages, no moving stages) — instead produce suggested actions and mark them explicitly.
- When asked to draft content, produce a ready-to-edit draft and include a short bullet list of why you made the key choices.
- ALWAYS include a "SOURCES" section listing up to 3 documents or DB-derived signals used to produce the answer.
- If you are uncertain or lack data, say "I don't have enough info" and list what is missing.
- Keep outputs concise (120–400 words) unless the user asks for a long form.
```

### Answer Format Template

```
<ANSWER>

SUGGESTED ACTIONS:
1. ...
2. ...

DRAFT (if requested):
Subject: ...
Body:
...

SOURCES:
- [DOC] Title (doc_id) — "first 25-40 characters of excerpt..."
- [DB] AdsMetric (date): Spend=..., ROAS=...
- [COMM] Slack thread (thread_id): "...first 40 chars..."

MISSING DATA:
- If anything required was missing, list it here.

CONFIDENCE: Medium/High/Low
```

### Few-Shot Example: Draft Email

```
EXAMPLE USER: "Draft an email to Acme to ask for ad account permissions."
EXAMPLE CONTEXT:
client_json: { id: "c1", name: "Acme Co", owner: "Jane Doe", stage: "Installation", health: "yellow" }
retrieved_docs:
- { source_type: "SOP", title: "Meta Ads Permission SOP", id: "doc-123", excerpt: "Request admin-level access to Meta Business Manager..." }

EXAMPLE ASSISTANT OUTPUT:
Subject: Request: Admin access to Meta Business Manager for Acme Co

Hi Jane,

We're nearly finished with the installation for Acme Co and to complete the remaining steps we need admin access to your Meta Business Manager. Specifically, please grant the account user "agency-name@yourdomain.com" the "Admin" role or add our agency Business Manager ID: 987654321.

Why this helps:
- Allows us to confirm ad account settings and verify pixel events
- Prevents delays in the final verification step

If you prefer, we can schedule a 15-minute call and walk through this together.

Thanks,
[Your Name] — AudienceOS

SOURCES:
- [SOP] Meta Ads Permission SOP (doc-123) — "Request admin-level access..."
CONFIDENCE: High
```

---

## 4. Indexing / Chunking Rules for RAG

* Convert PDFs/DOCX to text, preserve headings and metadata.
* Chunk size: ~500 tokens (approx 3500 characters) with 50-token overlap.
* Store chunks as `{document_id, chunk_index, chunk_text}`.
* Create embedding for each chunk and store vector id mapped to `document_id:chunk_index`.
* Add metadata fields: `{agency_id, client_id, filename, category, uploaded_at}`.

---

## 5. Retrieval + Reranking Recipe

1. For an incoming user query:
   * Normalize and extract entities (client names, dates).
   * Retrieve top-20 chunks (vector search).
   * Rerank by:
     * exact match on client_name in metadata
     * recency (if time-sensitive)
     * document type priority: SOP > ticket note > meeting transcript > general doc
   * Pass top-5 chunks into LLM as evidence.

2. Citation: For each chunk used in response, include citation object `{type, title, id, excerpt}`.

---

*Synced from Drive — Living Document*
