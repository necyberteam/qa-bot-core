# Analytics Event Tracking Plan for qa-bot-core

## Overview

Add a callback-based analytics event system to `qa-bot-core` that allows consuming applications to track usage patterns without adding any analytics dependencies to the library itself.

## Architecture

```
Consuming App (ACCESS Support Portal, etc.)
    │
    │  onAnalyticsEvent={(event) => {
    │    window.dataLayer?.push({ event: event.type, ...event });
    │  }}
    │
    ▼
┌─────────────────────────────────────────────────┐
│  access-qa-bot (optional wrapper)               │
│  - Adds ACCESS-specific events                  │
│  - Forwards core events + own events            │
└─────────────────────────────────────────────────┘
    │
    │  onAnalyticsEvent={...}
    │
    ▼
┌─────────────────────────────────────────────────┐
│  qa-bot-core                                    │
│  - Fires core Q&A events via callback           │
│  - No analytics dependencies                    │
└─────────────────────────────────────────────────┘
```

## Why Callback-Based?

1. **No dependencies** — Library stays lightweight, no GTM/GA SDK bundled
2. **Flexibility** — Consumers wire to GTM, GA4, Mixpanel, or nothing
3. **Optional** — If `onAnalyticsEvent` prop isn't passed, nothing happens
4. **Type-safe** — Events are typed at each layer

---

## Event Types for qa-bot-core

### Bot Lifecycle Events

| Event Type | When Fired | Payload |
|------------|------------|---------|
| `qa_bot_opened` | Chat window opened | `{ timestamp }` |
| `qa_bot_closed` | Chat window closed | `{ timestamp }` |
| `qa_new_chat_started` | User clicks "New Chat" | `{ sessionId, timestamp }` |

### Q&A Flow Events

| Event Type | When Fired | Payload |
|------------|------------|---------|
| `qa_question_asked` | User submits a question | `{ sessionId, queryId, questionLength, timestamp }` |
| `qa_response_received` | API returns response | `{ sessionId, queryId, responseLength, hasMetadata, timestamp }` |
| `qa_response_error` | API call fails | `{ sessionId, queryId, errorType, timestamp }` |
| `qa_response_rated` | User rates response | `{ sessionId, queryId, rating: 'helpful' \| 'not_helpful', timestamp }` |

### Optional Future Events

| Event Type | When Fired | Payload |
|------------|------------|---------|
| `qa_login_prompt_shown` | Login gate displayed | `{ timestamp }` |
| `qa_login_clicked` | User clicks login button | `{ timestamp }` |

---

## Files to Modify/Create

### 1. `src/config.ts` — Add types and prop

Add the `onAnalyticsEvent` callback prop to `QABotProps` and define the event type interface.

```typescript
// New types to add
export type QABotAnalyticsEventType =
  | 'qa_bot_opened'
  | 'qa_bot_closed'
  | 'qa_new_chat_started'
  | 'qa_question_asked'
  | 'qa_response_received'
  | 'qa_response_error'
  | 'qa_response_rated';

export interface QABotAnalyticsEvent {
  type: QABotAnalyticsEventType;
  timestamp: number;
  sessionId?: string;
  queryId?: string;
  // Event-specific fields
  questionLength?: number;
  responseLength?: number;
  hasMetadata?: boolean;
  rating?: 'helpful' | 'not_helpful';
  errorType?: string;
}

// Add to QABotProps interface
export interface QABotProps {
  // ... existing props ...

  /**
   * Callback fired when trackable events occur.
   * Use this to wire up analytics (GTM, GA4, etc.)
   *
   * @example
   * onAnalyticsEvent={(event) => {
   *   window.dataLayer?.push({ event: event.type, ...event });
   * }}
   */
  onAnalyticsEvent?: (event: QABotAnalyticsEvent) => void;
}
```

### 2. `src/contexts/AnalyticsContext.tsx` — New file

Create a context so nested components can fire events without prop drilling.

```typescript
import React, { createContext, useContext, useCallback, useRef } from 'react';
import type { QABotAnalyticsEvent } from '../config';

interface AnalyticsContextValue {
  trackEvent: (event: Omit<QABotAnalyticsEvent, 'timestamp'>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  onAnalyticsEvent?: (event: QABotAnalyticsEvent) => void;
  getSessionId: () => string | null;
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  onAnalyticsEvent,
  getSessionId,
  children
}) => {
  // Use ref to avoid recreating context value on every render
  const callbackRef = useRef(onAnalyticsEvent);
  callbackRef.current = onAnalyticsEvent;

  const trackEvent = useCallback((event: Omit<QABotAnalyticsEvent, 'timestamp'>) => {
    if (callbackRef.current) {
      callbackRef.current({
        ...event,
        timestamp: Date.now(),
        sessionId: event.sessionId ?? getSessionId() ?? undefined
      });
    }
  }, [getSessionId]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextValue => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    // Return no-op if used outside provider (graceful degradation)
    return { trackEvent: () => {} };
  }
  return context;
};
```

### 3. `src/components/QABot.tsx` — Wrap with provider, track open/close

Changes needed:
- Import and wrap children with `AnalyticsProvider`
- Pass `onAnalyticsEvent` prop to provider
- Track `qa_bot_opened` and `qa_bot_closed` in the toggle event listener

```typescript
// Add to imports
import { AnalyticsProvider, useAnalytics } from '../contexts/AnalyticsContext';

// Add to props destructuring
const { onAnalyticsEvent, ...rest } = props;

// Wrap the return JSX with AnalyticsProvider (inside SessionProvider)
<SessionProvider ...>
  <AnalyticsProvider
    onAnalyticsEvent={onAnalyticsEvent}
    getSessionId={() => sessionIdRef.current}
  >
    <ChatBotProvider>
      ...
    </ChatBotProvider>
  </AnalyticsProvider>
</SessionProvider>

// In the useEffect that listens for toggle events, add tracking:
const handleChatWindowToggle = (event: any) => {
  const newOpenState = event.data.newState;
  onOpenChange?.(newOpenState);

  // Track open/close
  onAnalyticsEvent?.({
    type: newOpenState ? 'qa_bot_opened' : 'qa_bot_closed',
    timestamp: Date.now(),
    sessionId: sessionIdRef.current ?? undefined
  });
};
```

### 4. `src/utils/flows/qa-flow.tsx` — Track Q&A events

Changes needed:
- Accept `trackEvent` function in params
- Fire `qa_question_asked` when user submits
- Fire `qa_response_received` on success
- Fire `qa_response_error` on failure
- Fire `qa_response_rated` when user rates

```typescript
// Add to createQAFlow params
export const createQAFlow = ({
  // ... existing params ...
  trackEvent  // New: (event) => void
}) => {

  // In the question processing block:
  trackEvent?.({
    type: 'qa_question_asked',
    queryId,
    questionLength: userInput.length
  });

  // On successful response:
  trackEvent?.({
    type: 'qa_response_received',
    queryId,
    responseLength: text.length,
    hasMetadata: !!metadataText
  });

  // In catch block:
  trackEvent?.({
    type: 'qa_response_error',
    queryId,
    errorType: error.message || 'unknown'
  });

  // In feedback handling:
  trackEvent?.({
    type: 'qa_response_rated',
    queryId: feedbackQueryId,
    rating: isPositive ? 'helpful' : 'not_helpful'
  });
};
```

### 5. `src/components/NewChatButton.tsx` — Track new chat

```typescript
// Add import
import { useAnalytics } from '../contexts/AnalyticsContext';

// Inside component
const { trackEvent } = useAnalytics();

const handleNewChat = async () => {
  // Track before reset (so we capture the old session being ended)
  trackEvent({ type: 'qa_new_chat_started' });

  // ... existing reset logic ...
};
```

---

## Usage Examples

### Standalone qa-bot-core User

```tsx
import { QABot } from '@snf/qa-bot-core';

<QABot
  apiKey="..."
  qaEndpoint="https://..."
  welcomeMessage="Hello!"
  isLoggedIn={true}
  onAnalyticsEvent={(event) => {
    // Push to GTM dataLayer
    window.dataLayer?.push({
      event: event.type,
      ...event
    });
  }}
/>
```

### Via access-qa-bot Wrapper

The wrapper would:
1. Accept its own `onAnalyticsEvent` prop
2. Pass a wrapped callback to `qa-bot-core` that forwards core events
3. Fire its own ACCESS-specific events through the same callback

```tsx
// Inside AccessQABot.tsx
<QABot
  {...props}
  onAnalyticsEvent={(coreEvent) => {
    // Forward core events to consumer
    props.onAnalyticsEvent?.(coreEvent);
  }}
/>

// Elsewhere in access-qa-bot, fire ACCESS-specific events:
props.onAnalyticsEvent?.({
  type: 'ticket_flow_started',
  timestamp: Date.now(),
  ticketType: 'general_help'
});
```

### No Analytics (Just Don't Pass the Prop)

```tsx
<QABot
  apiKey="..."
  qaEndpoint="https://..."
  welcomeMessage="Hello!"
  isLoggedIn={true}
  // No onAnalyticsEvent = no tracking, no overhead
/>
```

---

## Testing Plan

1. **Unit tests** — Mock `onAnalyticsEvent` callback, verify events fire with correct payloads
2. **Integration test** — Wire to `console.log`, walk through user journey, verify event sequence
3. **GTM test** — In a test environment, verify events appear in GTM debug panel

---

## Open Questions

1. **Should we track session duration?** Could add `qa_session_ended` with duration when user closes chat or starts new chat.

2. **Should embedded vs floating mode be tracked?** Could add `embedded: boolean` to events.

3. **Should we debounce rapid open/close?** Prevent spam if user rapidly toggles chat window.

---

## Implementation Order

1. Add types to `src/config.ts`
2. Create `src/contexts/AnalyticsContext.tsx`
3. Update `src/components/QABot.tsx` to use provider and track open/close
4. Update `src/utils/flows/qa-flow.tsx` to track Q&A events
5. Update `src/components/NewChatButton.tsx` to track new chat
6. Add to exports in `src/lib.tsx`
7. Update README with usage documentation
