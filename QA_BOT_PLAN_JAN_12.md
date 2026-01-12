# QA Bot Core: Implementation Guide

*Last updated: Jan 12, 2025*

---

## Architecture

### The Pattern: Client Generates, Server Stores

- **Client generates session ID** — created on "New Chat" or component mount
- **Server stores conversation context** — keyed by session ID
- **Client stores chat history for display** — localStorage, for showing past conversations
- **To resume a conversation** — send the original session ID; server has the context, we don't send old messages

The session ID is canonical—created client-side, but the server uses it as the key for conversation state.

### Conversation Boundaries

A conversation **starts** when:
- Component mounts (first visit)
- User clicks "New Chat"
- User logs out (if login required)

A conversation **continues** when:
- User sends messages (same session ID)
- User refreshes page (session ID persisted in localStorage)
- User resumes from history (old session ID restored)

---

## React-Chatbotify Internals

### Two Separate Message Stores

RCB has two different APIs for accessing messages:

| API | Hook | What It Returns | Cleared on `restartFlow()`? |
|-----|------|-----------------|---------------------------|
| Current messages | `useMessages().messages` | Messages in the current session | **YES** |
| History messages | `useChatHistory().getHistoryMessages()` | All messages ever sent | **NO** (accumulates forever) |

**Key insight:** When you click "New Chat", `restartFlow()` clears the *displayed* messages but the *history* keeps accumulating. The history is a flat list with no session boundaries.

### The Segmentation Problem

RCB's `getHistoryMessages()` returns a flat list with no concept of "this was conversation A, this was conversation B." We need to segment it ourselves.

**Solution:** Capture messages at known boundaries (when "New Chat" is clicked) and save them to our own localStorage structure, indexed by session ID. Don't try to reverse-engineer boundaries from RCB's flat history.

### Existing Code to Leverage

- `session-utils.ts` has `getOrCreateSessionId()` for persisting session IDs — currently unused
- `HistoryButton.tsx` has `getMessageWithoutHTML()` helper for generating previews

---

## Three Streams of Work

**Important:** All changes must maintain backward compatibility with both the current endpoint and the new access-agent endpoint. Gracefully handle missing fields; don't break existing deployments.

---

### Stream 1: Request Enrichment

Send more data to the server.

**New prop:**
```typescript
interface QABotProps {
  // ... existing props
  actingUser?: string;  // e.g., "jsmith@access-ci.org"
}
```

**Updated request format:**
```typescript
// Headers
headers['X-Session-ID'] = currentSessionId;
headers['X-Query-ID'] = queryId;
if (actingUser) {
  headers['X-Acting-User'] = actingUser;
}

// Body (access-agent expects these here too)
body: JSON.stringify({
  query: userInput,
  session_id: currentSessionId,
  question_id: queryId,
  acting_user: actingUser  // optional
})
```

**Status:** Andrew's branch (`feature/access-agent-integration`) has `session_id` and `question_id` in body. Need to add `acting_user`.

### Stream 2: Chat History

Let users see and resume past conversations.

**How it works:**
1. History button in header shows list of past chats
2. Chats saved to localStorage at conversation boundaries
3. Each chat indexed by session ID
4. To resume: load messages into RCB display, send old session ID to server

**Key insight:** We store messages locally for *display only*. We don't send old messages to the server—the server already has context via the session ID.

### Stream 3: Response Metadata

Extract and display metadata from access-agent responses.

**New response format:**
```json
{
  "response": "string",
  "session_id": "string",
  "question_id": "string",
  "tools_used": ["list", "of", "tools"],
  "confidence": "high|medium|low",
  "metadata": { ... }
}
```

**Tasks:**
1. Parse full response (extract `tools_used`, `confidence`, `metadata`)
2. Create JSX component to display metadata in chat
3. Design subtle/collapsible UI to avoid clutter

**Constraint:** `injectMessage(content, sender)` only accepts content + sender, no native metadata fields. Solution: embed metadata display within the JSX content itself.

**Backward compatibility:** If `tools_used`/`confidence`/`metadata` are absent (old endpoint), just display the response text without metadata UI.

---

## Backward Compatibility Pattern

When parsing responses, gracefully handle missing fields:

```typescript
const text = body.response || body.answer || body.text || body.message;
const toolsUsed = body.tools_used || [];
const confidence = body.confidence || null;
const metadata = body.metadata || {};
```

---

## Data Model

### localStorage Structure

```typescript
// Current session ID
localStorage['qa_bot_current_session'] = 'qa_bot_session_abc123';

// Conversation index (lightweight, for listing)
localStorage['qa_bot_conversations'] = JSON.stringify([
  {
    sessionId: 'qa_bot_session_abc123',
    startedAt: '2025-01-09T14:30:00Z',
    lastUpdatedAt: '2025-01-09T14:45:00Z',
    preview: 'How do I submit a ticket?',  // first user message
    messageCount: 8
  },
  // ...more conversations
]);

// Message storage (per conversation, loaded on demand)
localStorage['qa_bot_messages_abc123'] = JSON.stringify([
  // RCB message format
]);
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/QABot.tsx` | Main component, session ID generation (line ~75) |
| `src/components/NewChatButton.tsx` | Triggers session reset + flow restart |
| `src/components/HistoryButton.tsx` | Shows past conversations (to implement) |
| `src/contexts/SessionContext.tsx` | Provides `resetSession()` to children |
| `src/utils/flows/qa-flow.tsx` | API request/response handling |
| `src/utils/session-utils.ts` | `generateSessionId()`, `getOrCreateSessionId()` (unused) |

---

## Implementation Order

Suggested sequence:

1. **Request Enrichment** — small change, unblocks backend work
2. **Chat History** — core user-facing feature
3. **Response Metadata** — enhancement, can be basic initially

Streams 1 and 3 touch `qa-flow.tsx`. Stream 2 touches session management and adds new components. Minimal overlap if done in this order.

---

## Diagnostic Logging (Already Added)

These logs help debug session and message flow:

### `src/components/QABot.tsx`
- `[QABot] Initial session ID generated: {id}`
- `[QABot] resetSession() - Old: {oldId} -> New: {newId}`

### `src/components/NewChatButton.tsx`
- `[NewChatButton] handleNewChat clicked`
- `[NewChatButton] Messages BEFORE restartFlow: {count}`
- `[NewChatButton] resetSession() called`
- `[NewChatButton] About to call restartFlow()`
- `[NewChatButton] restartFlow() completed`
- `[NewChatButton] clearResettingFlag() called`

### `src/components/HistoryButton.tsx`
- Logs `getHistoryMessages()` output when clicked

### Sample Log Output
```
[QABot] Initial session ID generated: qa_bot_session_abc123...

// User has conversation, then clicks "New Chat":
[NewChatButton] handleNewChat clicked
[NewChatButton] Messages BEFORE restartFlow: 5
[NewChatButton] resetSession() called
[QABot] resetSession() - Old: qa_bot_session_abc123 -> New: qa_bot_session_def456
[NewChatButton] About to call restartFlow()
[NewChatButton] restartFlow() completed
```

---

## Helper Functions

### Strip HTML from messages (for previews)

In `HistoryButton.tsx`:

```typescript
export function getMessageWithoutHTML(message: string): string {
  return message
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
```

Converts:
```html
<div class="rcb-options-container"><div class="rcb-options">👍 Helpful</div>...</div>
```
Into: `"👍 Helpful 👎 Not helpful"`

---

## Open Questions

1. **Endpoints** — Two backends to support:
   - **Old (UKY):** `https://access-ai-grace1-external.ccs.uky.edu/access/chat/api/` — simpler response format
   - **New (access-agent):** `https://access-agent.elytra.net/api/v1/query` — richer response with metadata
   - Andrew's branch deploy for testing: https://feature-access-agent-integration--qa-bot-core.netlify.app/

2. **Logout behavior** — Does logout trigger conversation save? Need to coordinate with login state management

3. **History limit** — How many conversations to store in localStorage? Oldest-first eviction strategy?

4. **RCB message format** — Need to confirm exact format RCB uses for `getHistoryMessages()` so we can deserialize correctly when loading past conversations

5. **setTimeout in NewChatButton** — The 100ms timeout for `clearResettingFlag()` is fragile. Does RCB expose a callback for "flow restart complete"?
