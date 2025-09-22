# QA Bot Core

A simple React chatbot component for Q&A applications with built-in rating system.

**Pre-configured wrapper around react-chatbotify** - Just provide your API endpoints and you're done.

## Installation

```bash
npm install @snf/qa-bot-core
```

## Usage

### React Component - Three Levels of Complexity

#### Level 1: Simple Usage
Just provide apiKey and endpoints:

```jsx
import QABot from '@snf/qa-bot-core';

function App() {
  return (
    <QABot
      apiKey="your-api-key"
      endpoints={{ qa: 'https://your-api.com/chat' }}
    />
  );
}
```

#### Level 2: Complex Usage
Add settings, customizations, and branding:

```jsx
<QABot
  apiKey="your-api-key"
  endpoints={{
    qa: 'https://your-api.com/chat',
    rating: 'https://your-api.com/rating'
  }}
  welcomeMessage="Hello! How can I help you today?"
  branding={{
    primaryColor: '#24292e',
    secondaryColor: '#586069',
    botName: 'Demo Assistant',
    logo: 'https://github.com/github.png'
  }}
  messages={{
    welcome: "Hi there! Ask me anything.",
    placeholder: "Type your message here...",
    error: "Sorry, something went wrong"
  }}
  customFlows={myCustomFlows}
  settings={{
    general: { primaryColor: '#brand-color' },
    header: { title: 'Support Bot' }
  }}
/>
```

#### Level 3: Wrapper Pattern
Create organizational bots with default configurations:

```jsx
function MyOrgBot({ settings = {}, ...props }) {
  return (
    <QABot
      endpoints={{ qa: 'https://org.com/api' }}
      settings={{
        general: { primaryColor: '#org-blue' },
        header: { title: 'Organization Support' },
        ...settings
      }}
      branding={{
        botName: 'Org Assistant',
        logo: '/org-logo.png'
      }}
      {...props}
    />
  );
}

// Usage
<MyOrgBot apiKey="user-key" />
```

### JavaScript API

```javascript
import { qaBot } from '@snf/qa-bot-core';

const bot = qaBot({
  target: document.getElementById('bot-container'),
  apiKey: 'your-api-key',
  endpoints: {
    qa: 'https://your-api.com/chat',
    rating: 'https://your-api.com/rating'
  },
  welcomeMessage: "Hello! How can I help you today?",
  branding: {
    primaryColor: '#24292e',
    secondaryColor: '#586069',
    botName: 'Demo Assistant',
    logo: 'https://github.com/github.png'
  }
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
    endpoints: {
      qa: 'https://your-api.com/chat',
      rating: 'https://your-api.com/rating'
    },
    welcomeMessage: "Hello! How can I help you today?",
    branding: {
      primaryColor: '#24292e',
      secondaryColor: '#586069',
      botName: 'Demo Assistant',
      logo: 'https://github.com/github.png'
    }
  });
</script>
```

## Configuration

### Props

| Prop | Type | Description |
|------|------|-------------|
| `apiKey` | string | API key for your Q&A service |
| `endpoints` | object | `{ qa: 'url', rating: 'url' }` - rating is optional |
| `welcomeMessage` | string | Initial greeting message |
| `branding` | object | Theme configuration (see below) |
| `messages` | object | Message customization (see below) |

### Branding

```javascript
branding: {
  primaryColor: '#24292e',      // Main color
  secondaryColor: '#586069',    // Hover color
  primaryFont: 'Arial, sans-serif',
  botName: 'Demo Assistant',
  logo: 'https://github.com/github.png'
}
```

### Messages

```javascript
messages: {
  welcome: "Hi there! Ask me anything.",
  placeholder: "Type your message here...",
  error: "Sorry, something went wrong",
  disabled: "Chat is currently disabled"
}
```

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

```bash
# Install dependencies
npm install

# Run demo app (http://localhost:3000)
npm start

# Build library
npm run build:lib
```

## License

MIT License
