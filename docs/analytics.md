# Analytics Setup Guide

qa-bot-core fires analytics events for user interactions (open/close, questions sent/answered, ratings, logins, Turnstile challenges, etc.). This doc covers how to wire those events to your analytics backend and what each event carries.

## Wire `onAnalyticsEvent` to your analytics

Pass an `onAnalyticsEvent` callback when initializing the chatbot. The callback receives each event — forward it to whatever analytics backend you use:

```javascript
window.qaBotCore({
  target: document.getElementById('bot-container'),
  apiKey: 'YOUR_API_KEY',
  qaEndpoint: 'https://your-api.com/chat',
  welcomeMessage: 'Hello!',
  isLoggedIn: false,

  onAnalyticsEvent: (event) => {
    // GTM — push to dataLayer for tag routing:
    window.dataLayer?.push({ event: event.type, ...event });

    // Or direct GA4 via gtag:
    // gtag('event', event.type, event);

    // Or Segment / Amplitude / custom backend:
    // analytics.track(event.type, event);
  },
});
```

## Event reference

All events include these common fields (auto-populated):

- `type` — event name
- `timestamp` — ms since epoch
- `sessionId` — chat session UUID (stable for the current chat; regenerates when the user starts a new chat)
- `pageUrl` — URL where the bot is displayed
- `isEmbedded` — `true` for embedded widgets, `false` for floating

### Lifecycle events

**`chatbot_open`** — user opened the chat window.

**`chatbot_close`** — user closed the chat window.
- `messageCount` — number of messages exchanged
- `durationMs` — how long the window was open

**`chatbot_new_chat`** — user clicked "New Chat" to reset the conversation.
- `previousMessageCount` — messages in the prior conversation

### Q&A events

**`chatbot_question_sent`** — user submitted a question.
- `queryId` — UUID for this question (correlate with backend logs)
- `questionLength` — character count of the question

**`chatbot_answer_received`** — backend returned a successful answer.
- `queryId`
- `responseTimeMs` — time from question sent to answer received
- `success` — `true` for normal responses
- `responseLength` — character count of the answer
- `hasMetadata` — whether the response included metadata

**`chatbot_answer_error`** — request failed.
- `queryId`
- `errorType` — short error identifier

### User interaction events

**`chatbot_rating_sent`** — user rated a response.
- `queryId`
- `rating` — `'helpful'` or `'not_helpful'`

**`chatbot_link_clicked`** — user clicked a link in a bot message.
- `linkUrl`
- `linkText`

### Login events

**`chatbot_login_prompt_shown`** — login gate displayed (happens when an anonymous user tries a feature that requires login).

**`chatbot_login_clicked`** — user clicked the login link.
- `loginUrl`

### Turnstile events

**`chatbot_turnstile_shown`** — visible Turnstile challenge was displayed.
- `queryId` — the question that triggered the challenge

**`chatbot_turnstile_completed`** — user solved the visible challenge.

**`chatbot_turnstile_error`** — visible challenge failed or was cancelled.
- `queryId`
- `failureReason` — see below
- `cloudflareErrorCode` — Cloudflare's error code when available (e.g. `"300030"`)

**`chatbot_turnstile_silent_failed`** — silent background verification failed on page load.
- `failureReason`
- `cloudflareErrorCode`

#### Turnstile `failureReason` values

| Reason | Meaning |
|--------|---------|
| `widget_error` | Cloudflare's widget loaded but failed to complete (commonly error 300030 "bot detected") |
| `token_expired` | Token expired before it could be used |
| `script_load_failed` | Failed to load Cloudflare's Turnstile script |
| `api_unavailable` | Turnstile script loaded but the global API object wasn't available |
| `user_cancelled` | User clicked Close/Cancel on the challenge modal (visible widget only) |

## What to measure

Common things to track with these events:

### Engagement
- **Session engagement:** `chatbot_question_sent` count per session (group by `sessionId`)
- **Open-to-question conversion:** `chatbot_question_sent` / `chatbot_open` — are users who open the bot actually asking questions?
- **Session length:** `durationMs` from `chatbot_close`, and `messageCount`

### Answer quality
- **Helpful ratio:** `chatbot_rating_sent` with `rating=helpful` vs `not_helpful`
- **Rating participation:** `chatbot_rating_sent` / `chatbot_answer_received`

### Reliability
- **Error rate:** `chatbot_answer_error` / (`chatbot_answer_error` + `chatbot_answer_received`)
- **Response performance:** percentile `responseTimeMs` from `chatbot_answer_received`

### Content engagement
- **Link clickthrough:** count of `chatbot_link_clicked`, grouped by `linkUrl` / `linkText` — which sources/citations users follow

### Login funnel (if applicable)
- **Login prompt conversion:** `chatbot_login_clicked` / `chatbot_login_prompt_shown`

### Turnstile health (if you're using Turnstile)
- **Silent verification failure rate:** `chatbot_turnstile_silent_failed` / `chatbot_open`
- **Visible challenge trigger rate:** `chatbot_turnstile_shown` / `chatbot_question_sent` — how often the silent path fails enough to require user interaction
- **Visible challenge conversion:** `chatbot_turnstile_completed` / `chatbot_turnstile_shown` — only meaningful when `chatbot_turnstile_shown > 0`
- **Cloudflare error breakdown:** `chatbot_turnstile_error` grouped by `failureReason` and `cloudflareErrorCode` (for diagnosing blocked users)

> **Note:** `chatbot_open` and `chatbot_close` only fire in floating mode. In embedded mode (`embedded={true}`), the chat is always visible — use your site's page views as the denominator for per-session metrics instead.

## No analytics without `onAnalyticsEvent`

If you don't pass `onAnalyticsEvent`, events fire into the void. Analytics are fully opt-in — the chatbot never sends data to any third party unless you wire up the callback.
