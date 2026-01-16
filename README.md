# QA Bot Core

A simple React chatbot component for Q&A applications with built-in rating system.

**Pre-configured wrapper around react-chatbotify** - Just provide your API endpoints and you're done.

## Installation

```bash
npm install @snf/qa-bot-core
```

## Usage

### React Component

#### Basic Usage
Just provide required props:

```jsx
import QABot from '@snf/qa-bot-core';

function App() {
  return (
    <QABot
      apiKey="your-api-key"
      qaEndpoint="https://your-api.com/chat"
      welcomeMessage="Hello! How can I help you today?"
    />
  );
}
```

#### Full Configuration
Customize appearance and behavior:

```jsx
<QABot
  apiKey="your-api-key"
  qaEndpoint="https://your-api.com/chat"
  ratingEndpoint="https://your-api.com/rating"
  welcomeMessage="Hello! How can I help you today?"

  // Control
  enabled={true}
  open={false}
  onOpenChange={(isOpen) => console.log('Chat is now', isOpen ? 'open' : 'closed')}

  // Branding
  primaryColor="#24292e"
  secondaryColor="#586069"
  botName="Demo Assistant"
  logo="https://github.com/github.png"

  // Messages
  placeholder="Type your message here..."
  errorMessage="Sorry, something went wrong"
  tooltipText="Ask me anything!"

  // Layout
  embedded={false}

  // Footer
  footerText="Powered by Demo Corp"
  footerLink="https://demo.com"
/>
```

### JavaScript API

```javascript
import { qaBot } from '@snf/qa-bot-core';

const bot = qaBot({
  target: document.getElementById('bot-container'),
  apiKey: 'your-api-key',
  qaEndpoint: 'https://your-api.com/chat',
  ratingEndpoint: 'https://your-api.com/rating',
  welcomeMessage: "Hello! How can I help you today?",
  primaryColor: '#24292e',
  secondaryColor: '#586069',
  botName: 'Demo Assistant',
  logo: 'https://github.com/github.png'
});

// Programmatic control
bot.openChat();
bot.closeChat();
bot.addMessage('Hello from code!');
bot.destroy();
```

### Standalone Bundle

```html
<div id="bot-container"></div>
<script src="https://unpkg.com/@snf/qa-bot-core/dist/qa-bot-core.standalone.js"></script>
<script>
  window.qaBotCore({
    target: document.getElementById('bot-container'),
    apiKey: 'your-api-key',
    qaEndpoint: 'https://your-api.com/chat',
    ratingEndpoint: 'https://your-api.com/rating',
    welcomeMessage: "Hello! How can I help you today?",
    primaryColor: '#24292e',
    secondaryColor: '#586069',
    botName: 'Demo Assistant',
    logo: 'https://github.com/github.png'
  });
</script>
```

## Configuration

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiKey` | string | ✅ | API key for your Q&A service |
| `qaEndpoint` | string | ✅ | Q&A API endpoint URL |
| `welcomeMessage` | string | ✅ | Initial greeting message |
| `ratingEndpoint` | string | ❌ | Rating API endpoint URL (enables thumbs up/down) |
| `enabled` | boolean | ❌ | Enable/disable chat input (default: `true`). When `false`, shows login button in header |
| `loginUrl` | string | ❌ | Login URL to redirect to when chat is disabled (default: `/login`) |
| `open` | boolean | ❌ | Control chat window open/closed state |
| `onOpenChange` | function | ❌ | Callback when chat window state changes: `(open: boolean) => void` |
| `primaryColor` | string | ❌ | Main theme color (default: `#1a5b6e`) |
| `secondaryColor` | string | ❌ | Secondary theme color (default: `#107180`) |
| `botName` | string | ❌ | Bot display name (default: `Q&A Bot`) |
| `logo` | string | ❌ | Bot avatar URL (default: `/default-chat-icon.svg`) |
| `placeholder` | string | ❌ | Input placeholder text |
| `errorMessage` | string | ❌ | Error state message |
| `tooltipText` | string | ❌ | Tooltip text for chat toggle |
| `embedded` | boolean | ❌ | Embedded mode (default: `false`) |
| `footerText` | string | ❌ | Footer text |
| `footerLink` | string | ❌ | Footer link URL |

## Features

### Login State Management

The bot supports login/logout states through the `enabled` prop:

- **Enabled (`enabled={true}`)**: Shows user icon in header, chat input is active
- **Disabled (`enabled={false}`)**: Shows login button in header, chat input is disabled

Example:
```jsx
const [isLoggedIn, setIsLoggedIn] = useState(false);

<QABot
  apiKey="your-api-key"
  qaEndpoint="https://your-api.com/chat"
  welcomeMessage="Hello! How can I help you today?"
  enabled={isLoggedIn}
  loginUrl="https://your-app.com/login"
/>
```

When the user is not logged in (`enabled={false}`):
- The login button appears in the chat header
- Clicking it opens the `loginUrl` in a new tab
- The chat input is disabled with the `errorMessage` shown as placeholder

When the user is logged in (`enabled={true}`):
- A user icon appears in the chat header
- The chat input becomes active
- Users can ask questions normally

### Chat Window Control

Control the chat window open/closed state programmatically:

```jsx
const [chatOpen, setChatOpen] = useState(false);

<QABot
  apiKey="your-api-key"
  qaEndpoint="https://your-api.com/chat"
  welcomeMessage="Hello! How can I help you today?"
  open={chatOpen}
  onOpenChange={setChatOpen}
/>

<button onClick={() => setChatOpen(true)}>Open Chat</button>
<button onClick={() => setChatOpen(false)}>Close Chat</button>
```

The `open` prop provides two-way binding:
- Setting `open={true}` opens the chat window
- Setting `open={false}` closes the chat window
- User interactions (clicking open/close buttons) trigger `onOpenChange`

### Imperative API

You can also control the bot imperatively using a ref:

```jsx
const botRef = useRef();

<QABot
  ref={botRef}
  apiKey="your-api-key"
  qaEndpoint="https://your-api.com/chat"
  welcomeMessage="Hello! How can I help you today?"
/>

// Available methods:
botRef.current.openChat();           // Open the chat window
botRef.current.closeChat();          // Close the chat window
botRef.current.toggleChat();         // Toggle chat window state
botRef.current.addMessage("Hello!"); // Inject a message into the chat
botRef.current.setBotEnabled(false); // Change enabled state
```

### Embedded Mode

The bot supports two display modes:

**Floating Mode (default):**
- Shows as a toggle button in the bottom-right corner
- Chat window can be opened/closed by clicking the button
- Overlays on top of page content

**Embedded Mode:**
- Displays inline within your page layout
- Always visible (no toggle button)
- Takes full width of its container
- Chat window cannot be closed

Example of embedded mode:
```jsx
<div style={{ maxWidth: '800px', margin: '0 auto' }}>
  <h1>Customer Support</h1>
  <QABot
    apiKey="your-api-key"
    qaEndpoint="https://your-api.com/chat"
    welcomeMessage="Hello! How can I help you today?"
    embedded={true}
  />
</div>
```

**Note:** When `embedded={true}`, the `open` and `onOpenChange` props are ignored, and the imperative methods `openChat()`, `closeChat()`, and `toggleChat()` have no effect.

### Session Management

The bot automatically manages conversation sessions with unique session IDs:

- Each bot instance generates a unique session ID when mounted
- The session ID is included in API request headers (`X-Session-ID`)
- A "New Chat" button in the footer allows users to start fresh conversations
- Clicking "New Chat" generates a new session ID and clears the conversation history
- This allows your backend to track conversation continuity and user journeys

**Session Headers Sent to API:**
```
X-Session-ID: qa_bot_session_abc123
X-Query-ID: query_xyz789
```

The session ID persists across page refreshes, but clicking "New Chat" creates a completely new session. This is useful for:
- Starting a new topic without the bot referencing previous context
- Resetting conversation state
- Allowing users to have multiple distinct conversations

### Debug Logging

The bot includes a lightweight logging utility that's disabled by default but can be enabled at runtime for troubleshooting. Logs are controlled via `localStorage` flags, making it easy to debug in any environment (including production) without rebuilding.

**Enable debug logging:**
```javascript
localStorage.setItem('QA_BOT_DEBUG', 'true');
```

**Disable debug logging (default):**
```javascript
localStorage.removeItem('QA_BOT_DEBUG');
```

**Hide version info on load:**
```javascript
localStorage.setItem('QA_BOT_SHOW_VERSION', 'false');
```

When debug logging is enabled, you'll see styled console output for:
- Session lifecycle events (CREATED, RESET, RESTORED)
- API requests being sent

Errors and warnings always display regardless of the debug flag.

## API Requirements

Your Q&A endpoint should accept POST requests:

```json
POST /your-qa-endpoint
Content-Type: application/json
X-API-KEY: your-api-key

{
  "query": "User's question here"
}
```

And return:
```json
{
  "response": "Bot's answer with **markdown** support",
  "sessionId": "session_123",
  "queryId": "query_456"
}
```

### Rating Endpoint (Optional)

For thumbs up/down feedback:
```json
POST /your-rating-endpoint
Content-Type: application/json
X-API-KEY: your-api-key

{
  "sessionId": "session_123",
  "queryId": "query_456",
  "rating": 1  // 1 for 👍, 0 for 👎
}
```

## Development

### Demo Application

The project includes an interactive demo that showcases all features:

```bash
# Install dependencies
npm install

# Run demo app
npm start
```

The demo runs at `http://localhost:3000` and includes:

**Configuration Status**
- Shows which environment variables are configured
- Displays API endpoints for verification

**Dynamic Props**
- Toggle `enabled` prop to simulate login/logout states
- Toggle `open` prop to control chat window state
- Toggle `embedded` prop to switch between floating and embedded modes

**Component API**
- Test the imperative `addMessage()` method
- Inject custom messages into the chat

**Environment Variables**

Create a `.env` file in the project root:

```bash
REACT_APP_API_KEY=your-api-key
REACT_APP_QA_ENDPOINT=https://your-api.com/chat
REACT_APP_RATING_ENDPOINT=https://your-api.com/rating  # optional
```

### Building

```bash
# Build library
npm run build:lib
```


## License

MIT License
