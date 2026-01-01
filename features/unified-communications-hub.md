# FEATURE SPEC: Unified Communications Hub

**What:** Unified timeline showing Slack and Gmail conversations per client with AI-powered reply drafting
**Who:** Agency Account Managers handling multi-channel client communications
**Why:** Eliminate context-switching between tools, prevent missed messages, accelerate response times
**Status:** 📝 Specced

---

## User Stories

**US-013: View Unified Communications Timeline**
As an Account Manager, I want to see all Slack and Gmail messages for a client in one timeline, so that I don't miss anything.

Acceptance Criteria:
- [ ] Chronological timeline in client drawer Comms tab
- [ ] Messages from Slack show with Slack icon
- [ ] Emails from Gmail show with Gmail icon
- [ ] Thread grouping with expand/collapse
- [ ] Virtualized list for performance (100+ messages)

**US-014: Filter Communications by Source**
As an Account Manager, I want to filter by Slack or Gmail, so that I can focus on one channel.

Acceptance Criteria:
- [ ] Toggle filter: All, Slack Only, Gmail Only
- [ ] "Needs Reply" filter for unresponded messages
- [ ] Search within timeline
- [ ] Filter state in URL params

**US-015: Reply to Messages**
As an Account Manager, I want to reply to messages directly from the timeline, so that I don't switch apps.

Acceptance Criteria:
- [ ] Reply composer appears below selected message
- [ ] Send via Slack API or Gmail API based on source
- [ ] Optimistic update with rollback on failure
- [ ] Sent confirmation toast

**US-016: AI-Drafted Replies**
As an Account Manager, I want AI to draft replies based on context, so that I respond faster.

Acceptance Criteria:
- [ ] "Draft Reply" button in composer
- [ ] AI uses: conversation history, client data, Knowledge Base
- [ ] Draft appears editable in composer
- [ ] User must confirm before sending
- [ ] Multiple tone options (Professional, Casual)

---

## Functional Requirements

What this feature DOES:
- [ ] Display unified timeline of Slack + Gmail messages per client
- [ ] Real-time sync via webhooks (Slack Events API, Gmail Pub/Sub)
- [ ] Thread grouping and expansion for readability
- [ ] Filter by platform, unread status, and "needs reply" flags
- [ ] AI-powered reply draft generation using conversation context
- [ ] Inline reply functionality without leaving the app
- [ ] Search within communication history
- [ ] Virtualized scrolling for performance with 100+ messages
- [ ] Deep linking to specific messages with URL state

What this feature does NOT do:
- ❌ Auto-send replies without human approval
- ❌ Sync all workspace channels (only designated client channels)
- ❌ Store email attachments locally (links to Gmail)
- ❌ Real-time typing indicators
- ❌ Message editing or deletion (read-only from external sources)

---

## Data Model

Entities involved:
- COMMUNICATION - Core message entity with threading and platform source
- CLIENT - Links messages to specific clients via client_id
- INTEGRATION - OAuth credentials for Slack and Gmail APIs
- USER - Message reply attribution and read status tracking

New fields needed:
| Entity | Field | Type | Description |
|--------|-------|------|-------------|
| COMMUNICATION | is_read | Boolean | User has viewed message |
| COMMUNICATION | reply_to_id | UUID | FK for threaded replies |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/clients/{id}/communications` | GET | List client messages with filtering |
| `/api/v1/communications/{id}` | GET | Single message with thread context |
| `/api/v1/communications/{id}/thread` | GET | Full thread (all replies) |
| `/api/v1/communications/{id}/reply` | POST | Send reply via original platform |
| `/api/v1/communications/{id}` | PATCH | Update read status, needs_reply flag |
| `/api/v1/webhooks/slack/event` | POST | Slack Events API webhook |
| `/api/v1/webhooks/gmail/push` | POST | Gmail Push Notifications webhook |
| `/api/v1/assistant/draft` | POST | Generate AI reply draft |

---

## UI Components

| Component | Purpose |
|-----------|---------|
| CommunicationsTimeline | Main virtualized message feed with infinite scroll |
| MessageBubble | Individual message with sender, timestamp, platform icon |
| ThreadGroup | Collapsible thread container for related messages |
| SourceFilter | Toggle buttons for All/Slack/Gmail filtering |
| SearchInput | Search within communication history |
| ReplyComposer | Inline reply input with AI draft integration |
| NeedsReplyBadge | Visual indicator for messages requiring response |
| UnreadDot | Visual indicator for new messages |
| PlatformIcon | Slack/Gmail branded icons for message source |
| MessageMenu | Context menu for reply, mark read, etc. |

---

## Implementation Tasks

### OAuth & Authentication
- [ ] TASK-001: Set up Slack OAuth app with appropriate scopes
- [ ] TASK-002: Configure Gmail OAuth with read/send permissions
- [ ] TASK-003: Build OAuth callback handlers for token storage
- [ ] TASK-004: Implement token refresh logic for expired credentials

### Webhook Infrastructure
- [ ] TASK-005: Set up Slack Events API subscription
- [ ] TASK-006: Configure Gmail Pub/Sub push notifications
- [ ] TASK-007: Implement webhook signature verification (security)
- [ ] TASK-008: Build webhook event processing queue

### Data Sync Engine
- [ ] TASK-009: Create Slack message ingestion with deduplication
- [ ] TASK-010: Build Gmail thread detection and parsing
- [ ] TASK-011: Implement client linking algorithm (email/contact matching)
- [ ] TASK-012: Add background job for "needs reply" flag computation
- [ ] TASK-013: Build message threading and parent-child relationships

### Timeline UI Core
- [ ] TASK-014: Create CommunicationsTimeline with react-window virtualization
- [ ] TASK-015: Build MessageBubble component with platform styling
- [ ] TASK-016: Implement ThreadGroup with expand/collapse animations
- [ ] TASK-017: Add infinite scroll with pagination
- [ ] TASK-018: Connect timeline to GET /v1/clients/{id}/communications API

### Filtering & Search
- [ ] TASK-019: Build SourceFilter toggle component
- [ ] TASK-020: Implement "Needs Reply" filter with badge counts
- [ ] TASK-021: Add SearchInput with debounced backend search
- [ ] TASK-022: Persist filter state in URL query parameters
- [ ] TASK-023: Build UnreadDot indicators with real-time updates

### Reply System
- [ ] TASK-024: Create ReplyComposer with rich text editor
- [ ] TASK-025: Integrate AI draft generation via POST /v1/assistant/draft
- [ ] TASK-026: Implement send via Slack API and Gmail API
- [ ] TASK-027: Add optimistic UI updates with error rollback
- [ ] TASK-028: Build reply success/error toast notifications

### Real-time & Performance
- [ ] TASK-029: Set up Supabase Realtime for new message updates
- [ ] TASK-030: Implement message caching with React Query
- [ ] TASK-031: Add loading skeletons and error states
- [ ] TASK-032: Optimize database queries with proper indexes

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Webhook signature fails | Log security alert, reject request, monitor for attacks |
| Duplicate message received | Skip insertion using external_id uniqueness constraint |
| Client not found for email | Store in "unassigned" queue for manual client linking |
| OAuth token expires | Auto-refresh if possible, prompt re-auth if refresh fails |
| Large email thread (500+ msgs) | Paginate thread loading, show "Load more" button |
| Send reply while offline | Queue message, retry when connection restored |
| User lacks platform permissions | Show read-only view, disable reply functionality |
| Thread spans multiple clients | Show in primary client timeline with cross-references |
| Message contains sensitive data | Mask PII, add warning indicators |

---

## Technical Implementation

### Message Deduplication
```typescript
async function ingestSlackMessage(event: SlackMessageEvent) {
  const externalId = `slack_${event.channel}_${event.ts}`;

  // Check for existing message
  const existing = await supabase
    .from('communications')
    .select('id')
    .eq('external_id', externalId)
    .single();

  if (existing) {
    console.log('Duplicate message, skipping:', externalId);
    return;
  }

  // Process new message...
}
```

### Thread Detection
```typescript
function buildThreadHierarchy(messages: Communication[]): ThreadGroup[] {
  const messageMap = new Map(messages.map(m => [m.id, m]));
  const threads: ThreadGroup[] = [];

  messages.forEach(msg => {
    if (!msg.reply_to_id) {
      // Root message - start new thread
      threads.push({
        id: msg.thread_id || msg.id,
        rootMessage: msg,
        replies: findReplies(msg.id, messageMap)
      });
    }
  });

  return threads.sort((a, b) =>
    new Date(b.rootMessage.received_at).getTime() -
    new Date(a.rootMessage.received_at).getTime()
  );
}
```

### AI Draft Generation
```typescript
async function generateReplyDraft(messageId: string, tone: 'professional' | 'casual') {
  const message = await getMessageWithContext(messageId);

  const prompt = `
    Context: Client communication thread
    Previous message: "${message.content}"
    Client: ${message.client.name}
    Tone: ${tone}

    Generate a helpful reply that:
    1. Acknowledges the client's message
    2. Provides useful next steps
    3. Maintains professional relationship
  `;

  const draft = await ai.generateText(prompt);
  return { content: draft, references: [messageId] };
}
```

### Virtualized Timeline
```typescript
function CommunicationsTimeline({ clientId }: { clientId: string }) {
  const [messages, setMessages] = useState<Communication[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Average message height
    overscan: 5
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <MessageBubble message={messages[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Real-time Updates
```typescript
useEffect(() => {
  const subscription = supabase
    .channel(`client-comms-${clientId}`)
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'communications',
        filter: `client_id=eq.${clientId}`
      },
      handleNewMessage
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [clientId]);

function handleNewMessage(payload: any) {
  const newMessage = payload.new as Communication;
  setMessages(prev => [newMessage, ...prev]);

  // Show notification for new messages
  toast.info(`New ${newMessage.platform} message from ${newMessage.sender_name}`);
}
```

---

## Testing Checklist

- [ ] Happy path: Slack message syncs to timeline within 30 seconds
- [ ] Happy path: Gmail thread appears with correct threading
- [ ] AI draft generation includes conversation context and client data
- [ ] Reply sent successfully via Slack API (maintains thread)
- [ ] Reply sent successfully via Gmail API (maintains thread)
- [ ] Webhook signature verification rejects invalid requests
- [ ] Message deduplication prevents duplicates on retry
- [ ] Thread grouping displays correctly with expand/collapse
- [ ] Source filtering (All/Slack/Gmail) works accurately
- [ ] Search finds messages by content, sender, date range
- [ ] Virtualized scrolling handles 1000+ messages smoothly
- [ ] Real-time updates show new messages immediately
- [ ] Mobile responsive: timeline scrolls, reply composer usable
- [ ] Error handling: network failures, API errors, token expiry
- [ ] Performance: Timeline loads <2 seconds for 500+ messages

---

## Performance Considerations

### Virtualization Strategy
- Use react-window for efficient DOM rendering
- Estimate message heights based on content length
- Implement overscan for smooth scrolling
- Batch message rendering in chunks of 50

### Caching Strategy
```typescript
// React Query cache configuration
const communicationsQuery = useQuery({
  queryKey: ['communications', clientId, filters],
  queryFn: () => fetchCommunications(clientId, filters),
  staleTime: 2 * 60 * 1000, // 2 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false
});
```

### Database Optimization
```sql
-- Ensure these indexes exist for fast queries
CREATE INDEX idx_communications_client_received ON communications(agency_id, client_id, received_at DESC);
CREATE INDEX idx_communications_platform ON communications(agency_id, platform, received_at DESC);
CREATE INDEX idx_communications_needs_reply ON communications(agency_id, needs_reply) WHERE needs_reply = true;
CREATE INDEX idx_communications_thread ON communications(agency_id, thread_id, received_at ASC);
```

### Real-time Efficiency
- Subscribe only to relevant client communications
- Debounce rapid message updates (500ms)
- Use message deduplication to prevent UI flicker
- Implement smart pagination with cursor-based loading

---

## Dependencies

### Required for Implementation
- react-window (virtualization)
- Supabase Realtime (real-time updates)
- React Query (server state management)
- Slack Web API SDK
- Gmail API client

### Blocked By
- INTEGRATION table with Slack/Gmail OAuth tokens
- COMMUNICATION table with proper indexes
- Webhook endpoints configured with proper security
- AI assistant endpoints for draft generation

### Enables
- Client Dashboard (communication activity metrics)
- Automations ("New message" triggers)
- Intelligence Center (sentiment analysis, response time alerts)
- Mobile notifications (urgent message alerts)

---

## Security & Privacy

### OAuth Security
- Minimal required scopes only (Slack: channels:read, chat:write; Gmail: readonly, send)
- Tokens encrypted at rest using Supabase Vault
- Automatic token refresh with fallback to manual re-auth
- Audit trail for all OAuth operations

### Message Privacy
- Only sync designated client channels/email threads
- Respect message deletion from source platforms
- No local storage of sensitive content
- User-level access controls for message viewing

### Webhook Security
```typescript
// Slack signature verification
function verifySlackSignature(signature: string, body: string, timestamp: string): boolean {
  const sigBasestring = `v0:${timestamp}:${body}`;
  const expectedSig = `v0=${crypto.createHmac('sha256', SLACK_SIGNING_SECRET).update(sigBasestring).digest('hex')}`;

  // Prevent timing attacks
  const hmac = crypto.createHmac('sha256', '');
  hmac.update(signature);
  const providedSig = hmac.digest('hex');

  hmac.update(expectedSig);
  const computedSig = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(providedSig, 'hex'),
    Buffer.from(computedSig, 'hex')
  );
}
```

---

## Success Metrics

- **Response Time:** 50% reduction in average client reply time
- **Message Coverage:** 99.9% of client messages captured (vs manual monitoring)
- **User Adoption:** 85% of Account Managers use timeline daily
- **Context Switching:** 60% reduction in Slack/Gmail app switches
- **AI Draft Quality:** 70% of AI drafts accepted with minimal edits
- **Performance:** Timeline loads <2 seconds for 500+ messages
- **Reliability:** <0.1% message sync failures

---

## Monitoring & Alerts

### Key Metrics to Track
- Webhook delivery success rate
- Message processing latency
- AI draft generation response time
- User engagement (messages read, replies sent)
- OAuth token refresh failures

### Alerting Rules
```yaml
webhook_failures:
  condition: error_rate > 1%
  window: 5m
  alert: PagerDuty

message_lag:
  condition: avg(processing_time) > 30s
  window: 5m
  alert: Slack

oauth_failures:
  condition: failed_refreshes > 3
  window: 1h
  alert: Email
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Enhanced spec with complete implementation details, corrected user story numbers |
| 2025-12-31 | Created initial spec from MVP-PRD |

---

*Living Document - Located at features/unified-communications-hub.md*