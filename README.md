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
