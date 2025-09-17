# Q&A Bot

⚠️ This is not implemented yet, but is serving as a reference for development. It is not ready for production. ⚠️

A configurable React chatbot component with RAG-powered Q&A capabilities and rating system.

## Features

- Configurable Q&A with any RAG endpoint
- Built-in rating/feedback system
- Customizable theming and branding
- Accessibility support with keyboard navigation
- Plugin system for custom conversation flows
- Multiple integration options (React, vanilla JS, CDN)

## Installation

```bash
npm install @snf/qa-bot-core
```

## Quick Start

### React Component

```javascript
import QABot from '@snf/qa-bot-core';

function App() {
  return (
    <QABot
      config={{
        endpoints: {
          qa: 'https://your-api.com/chat',
          rating: 'https://your-api.com/rating'
        },
        theme: {
          primaryColor: '#007bff'
        },
        messages: {
          welcome: 'How can I help you today?'
        }
      }}
    />
  );
}
```

### Vanilla JavaScript

```html
<div id="bot-container"></div>
<script src="https://unpkg.com/@snf/qa-bot-core/dist/qa-bot-core.standalone.js"></script>
<script>
  qaBot({
    target: document.getElementById('bot-container'),
    config: {
      endpoints: {
        qa: 'https://your-api.com/chat'
      }
    }
  });
</script>
```

### CDN Usage

```html
<!-- Standalone bundle with React included -->
<script src="https://unpkg.com/@snf/qa-bot-core@latest/dist/qa-bot-core.standalone.js"></script>

<div id="chat-bot"></div>

<script>
  // Global qaBot function is available
  qaBot({
    target: document.getElementById('chat-bot'),
    config: {
      endpoints: { qa: '/api/chat' }
    }
  });
</script>
```

## Configuration

### Basic Configuration

| Property | Type | Description |
|----------|------|-------------|
| `config.endpoints.qa` | string | **Required**. Your RAG API endpoint |
| `config.endpoints.rating` | string | Optional. Endpoint for feedback/ratings |
| `config.theme.primaryColor` | string | Primary theme color (default: '#1a5b6e') |
| `config.theme.secondaryColor` | string | Secondary theme color (default: '#107180') |
| `config.theme.fontFamily` | string | Font family (default: 'Arial, sans-serif') |
| `config.messages.welcome` | string | Welcome message |
| `config.messages.placeholder` | string | Input placeholder text |

### Display Modes

```javascript
// Floating chat button (default)
<QABot config={config} embedded={false} />

// Embedded directly in page
<QABot config={config} embedded={true} />
```

### Adding Custom Flows

⚠️ This is not implemented yet, but is serving as a reference for development.

Extend the bot with custom conversation flows:

```javascript
const customFlows = {
  start: {
    message: "Welcome! What would you like to do?",
    options: ["Ask a question", "Request support", "Leave feedback"],
    path: (input) => {
      if (input === "Ask a question") return "qa_start";
      if (input === "Request support") return "support_flow";
      return "feedback_flow";
    }
  },
  support_flow: {
    message: "Please describe your issue:",
    path: async (input) => {
      // Handle support ticket creation
      await createTicket(input);
      return "ticket_success";
    }
  },
  ticket_success: {
    message: "Your ticket has been created!",
    path: "start"
  }
};

<QABot
  config={config}
  customFlows={customFlows}
  startFlow="start"  // Override the default starting point
/>
```

## API Requirements

### Q&A Endpoint

Your Q&A endpoint should accept:
```json
POST /chat
Content-Type: application/json
{
  "query": "User's question"
}
```

And return:
```json
{
  "response": "Bot's answer with **markdown** support"
}
```

### Rating Endpoint (Optional)

For feedback collection:
```json
POST /rating
Content-Type: application/json
{
  "sessionId": "session_123",
  "queryId": "query_456",
  "rating": 1  // 1 for positive, 0 for negative
}
```

## JavaScript API

When using the vanilla JavaScript integration:

```javascript
const bot = qaBot({
  target: document.getElementById('bot-container'),
  config: { /* ... */ }
});

// Programmatic controls
bot.open();        // Open chat window
bot.close();       // Close chat window
bot.toggle();      // Toggle open/closed
bot.destroy();     // Clean up and remove
```

## Styling

### CSS Variables

Customize appearance with CSS variables:

```css
#bot-container {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-family: 'Helvetica Neue', Arial, sans-serif;
}
```

### Custom CSS

The bot uses BEM-style classes you can target:

```css
.qa-bot { /* Container */ }
.rcb-chat-window { /* Chat window */ }
.rcb-user-message { /* User messages */ }
.rcb-bot-message { /* Bot messages */ }
```

## Examples

### Minimal Setup

```javascript
<QABot config={{ endpoints: { qa: '/api/chat' } }} />
```

### With Custom Theme

```javascript
<QABot
  config={{
    endpoints: { qa: '/api/chat' },
    theme: {
      primaryColor: '#8C1515',
      secondaryColor: '#2E2D29'
    },
    messages: {
      welcome: 'Welcome to Stanford Support!'
    }
  }}
  embedded={true}
/>
```

### Complete Implementation

For a production-ready implementation with custom flows, authentication, and advanced features, see [@snf/access-qa-bot](https://github.com/necyberteam/access-qa-bot).

## Development

```bash
# Install dependencies
npm install

# Run demo app (http://localhost:3000)
npm start

# Build library for distribution
npm run build:lib

# Run tests
npm test

# Build everything
npm run build
```

### Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── utils/         # Utilities and flow logic
├── styles/        # CSS styles
├── lib.js         # Library entry point
└── index.js       # Demo app entry point
```

## License

MIT License - see [LICENSE](LICENSE) for details.
