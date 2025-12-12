# Chat History Feature - Investigation Notes

## Context

We're implementing a feature: "when user clicks the history button, they see a list of their chats."

---

## What We Discovered

### Two Separate Message Stores in RCB

React-chatbotify has two different APIs for accessing messages:

| API | Hook | What It Returns | Cleared on `restartFlow()`? |
|-----|------|-----------------|---------------------------|
| Current messages | `useMessages().messages` | Messages in the current session | **YES** |
| History messages | `useChatHistory().getHistoryMessages()` | All messages ever sent | **NO** (accumulates forever) |

**Key insight:** When you click "New Chat", `restartFlow()` clears the *displayed* messages but the *history* keeps accumulating. The history is a flat list with no session boundaries.

### Session IDs

- Session ID is generated on component mount (`QABot.tsx:75`)
- New session ID is generated on "New Chat" click (`QABot.tsx:89-94`)
- Session ID is sent to the API via `X-Session-ID` header
- **Currently:** Session ID is NOT persisted across page reloads (every refresh = new session)
- **There is existing code** (`getOrCreateSessionId()` in `session-utils.ts`) that could persist sessions, but it's not being used

---

## Design Decisions Made

1. **Session persistence (Pattern B):** Session should persist across page reloads. Only reset on explicit "New Chat" click. Rationale: Users shouldn't lose their conversation on accidental refresh.

2. **Logout = end of chat:** Treat logout the same as clicking "New Chat"

3. **Optional `userId` prop:** Add to QABot props for user identification, but the feature should work without it (fall back to device/session based)

4. **localStorage for now:** Build with localStorage, design for future backend storage

---

## Diagnostic Logs Added

We added logging to understand the flow:

### `src/components/QABot.tsx`
- Line 76: `[QABot] Initial session ID generated: {id}`
- Line 93: `[QABot] resetSession() - Old: {oldId} -> New: {newId}`

### `src/components/NewChatButton.tsx`
- Line 13: `[NewChatButton] handleNewChat clicked`
- Line 14: `[NewChatButton] Messages BEFORE restartFlow: {count} {messages}`
- Line 18: `[NewChatButton] resetSession() called`
- Line 24: `[NewChatButton] About to call restartFlow()`
- Line 26: `[NewChatButton] restartFlow() completed`
- Line 31: `[NewChatButton] clearResettingFlag() called (100ms after restartFlow)`

### `src/components/HistoryButton.tsx`
- Already logs `getHistoryMessages()` output when clicked

---

## Sample Log Output

```
[QABot] Initial session ID generated: qa_bot_session_abc123...

// User has conversation, then clicks "New Chat":
[NewChatButton] handleNewChat clicked
[NewChatButton] Messages BEFORE restartFlow: 5 [{...}, {...}, ...]
[NewChatButton] resetSession() called
[QABot] resetSession() - Old: qa_bot_session_abc123 -> New: qa_bot_session_def456
[NewChatButton] About to call restartFlow()
[NewChatButton] restartFlow() completed
[NewChatButton] clearResettingFlag() called (100ms after restartFlow)

// Click "New Chat" again - note only 1 message (welcome message):
[NewChatButton] handleNewChat clicked
[NewChatButton] Messages BEFORE restartFlow: 1 [{...}]

// But clicking History button shows ALL messages across ALL sessions:
| annotated history messages: |
(30) [{...}, {...}, ...] // Flat list, no session boundaries
```

---

## Open Questions

### To Investigate Next
1. **Where does RCB store history?** Check localStorage keys to find where `getHistoryMessages()` pulls from
2. **Do message IDs correlate with session IDs?** The new logs should help answer this
3. **How to segment the flat history into "chats"?** Options:
   - Tag first message of each chat with session ID metadata
   - Maintain separate "chat index" mapping session IDs to message ID ranges
   - Detect welcome message "What can I help you with?" as boundary (fragile)

### To Ask Andrew and Vikram
- Will persisting session ID across page reloads cause issues with the API?
- Does the backend expect session IDs to be unique per page load, or is persistence okay?

---

## Proposed Storage Model

```
localStorage:
  qa_bot_session_{uuid}    -> current active session ID
  qa_bot_history           -> [
    {
      sessionId: "qa_bot_session_abc123",
      startedAt: "2025-12-11T20:45:42Z",
      messages: [...]
    },
    {
      sessionId: "qa_bot_session_def456",
      startedAt: "2025-12-11T21:39:56Z",
      messages: [...]
    },
  ]
```

---

## Files of Interest

| File | Purpose |
|------|---------|
| `src/components/HistoryButton.tsx` | History button UI, currently just logs |
| `src/components/NewChatButton.tsx` | Triggers session reset + flow restart |
| `src/components/QABot.tsx` | Main component, session ID management |
| `src/contexts/SessionContext.tsx` | Provides `resetSession()` to children |
| `src/utils/session-utils.ts` | Has `generateSessionId()` and unused `getOrCreateSessionId()` |

---

## Next Steps

1. Run the app and observe the new session ID logs
2. Inspect localStorage in browser DevTools to see how RCB stores history
3. Decide on segmentation approach based on findings
4. Implement the history storage and UI

---

## Helper Function Added

In `HistoryButton.tsx`, we added a function to strip HTML from messages:

```typescript
export function getMessageWithoutHTML(message: string): string {
  return message
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
```

This converts HTML like:
```html
<div class="rcb-options-container"><div class="rcb-options">👍 Helpful</div>...</div>
```
Into: `"👍 Helpful 👎 Not helpful"`
