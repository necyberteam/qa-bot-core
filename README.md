# QA Bot Core

A pre-configured React chatbot component built on react-chatbotify with RAG-powered Q&A capabilities, rating system, and three levels of usage complexity.

**Pre-configured wrapper around react-chatbotify** - Get started in seconds, customize everything, or create organizational wrappers.

## Features

### Three Levels of Usage
- 🎯 **Level 1: Simple** - Just `apiKey` + `endpoints`, you're done!
- 🔧 **Level 2: Complex** - Business props + full react-chatbotify `settings` control
- 🏢 **Level 3: Wrapper** - Create organizational bots with pre-configured defaults

### Core Functionality
- 🤖 **Configurable Q&A** with any RAG endpoint
- 👍 **Built-in rating/feedback** system with thumbs up/down
- 🔄 **Demo mode** - works without endpoints for development
- ♿ **Accessibility first** with keyboard navigation and screen reader support
- 🎨 **Sensible defaults** - Beautiful out-of-the-box, easy to customize

### Developer Experience
- 🚀 **Pre-configured react-chatbotify** - Use their docs directly, zero learning curve
- 🧩 **Custom conversation flows** - extend or replace default behavior
- 📱 **Multiple integration options** (React component, JavaScript API, CDN)
- 🏗️ **Perfect wrapper pattern** - Create organizational AI assistants

### Production Ready
- 🏎️ **Performance optimized** with lazy loading and code splitting
- 🔧 **TypeScript ready** architecture
- 📦 **Multiple build formats** (ESM, CJS, UMD)
- 🌐 **CSS variable theming** with fallbacks

## Installation

```bash
npm install @snf/qa-bot-core
```

## Quick Start

### Level 1: Simple Usage (Just Works!)

```javascript
import QABot from '@snf/qa-bot-core';

function App() {
  return (
    <QABot
      apiKey="your-api-key"
      endpoints={{ qa: 'https://your-api.com/chat' }}
    />
  );
}

// With simple branding
function BrandedApp() {
  return (
    <QABot
      apiKey="your-api-key"
      endpoints={{ qa: 'https://your-api.com/chat' }}
      branding={{
        logo: '/my-logo.svg',
        primaryColor: '#007bff',
        botName: 'Support Assistant'
      }}
      messages={{
        welcome: 'How can I help you today?',
        placeholder: 'Type your question...'
      }}
    />
  );
}
```

### Level 2: Complex Usage (Power User)

```javascript
<QABot
  // Business logic props
  apiKey="your-api-key"
  endpoints={{
    qa: 'https://your-api.com/chat',
    rating: 'https://your-api.com/rating'
  }}
  userEmail="user@example.com"
  customFlows={myCustomFlows}

  // Simple configuration
  branding={{
    logo: '/company-logo.svg',
    primaryColor: '#007bff',
    botName: 'Support Bot'
  }}
  messages={{
    welcome: 'How can I help you today?',
    placeholder: 'Ask me anything...'
  }}

  // Escape hatches for advanced features
  settings={{
    botBubble: { streamSpeed: 5 },
    chatHistory: { disabled: false }
  }}
  styles={{
    chatWindowStyle: { borderRadius: '16px' }
  }}
/>
```

### Level 3: Wrapper Pattern (Organizational Bots)

```javascript
// Create your organizational wrapper
function MyOrgBot({ settings = {}, ...props }) {
  return (
    <QABot
      endpoints={{ qa: 'https://myorg.com/api/qa' }}
      settings={{
        general: { primaryColor: '#company-blue' },
        header: { title: 'MyOrg AI' },
        ...settings // Users can still override
      }}
      {...props}
    />
  );
}

// Users just do:
<MyOrgBot apiKey={userKey} />
```

### JavaScript API

```javascript
import { qaBot } from '@snf/qa-bot-core';

// Simple usage
const bot = qaBot({
  target: document.getElementById('bot-container'),
  apiKey: 'your-api-key',
  endpoints: { qa: 'https://your-api.com/chat' }
});

// Complex usage with settings
const bot = qaBot({
  target: document.getElementById('bot-container'),
  apiKey: 'your-api-key',
  endpoints: { qa: 'https://your-api.com/chat' },
  welcomeMessage: 'Hello from vanilla JS!',
  settings: {
    general: { primaryColor: '#007bff' },
    header: { title: 'JS Bot' }
  }
});

// Programmatic control
bot.openChat();
bot.addMessage('Hello from code!');
bot.destroy();
```

### Standalone Bundle

```html
<div id="bot-container"></div>
<script src="https://unpkg.com/@snf/qa-bot-core/dist/qa-bot-core.standalone.js"></script>
<script>
  // Simple usage
  window.qaBotCore({
    target: document.getElementById('bot-container'),
    apiKey: 'your-api-key',
    endpoints: { qa: 'https://your-api.com/chat' }
  });

  // Or demo mode (works without endpoints)
  window.qaBotCore({
    target: document.getElementById('bot-container'),
    welcomeMessage: 'Try the demo!',
    settings: { general: { embedded: true } }
  });
</script>
```

## Demo Mode

**QA Bot Core works immediately without any configuration!** Perfect for development, testing, and demos:

```javascript
// No endpoints needed - provides demo responses
<QABot />

// Or with custom welcome message
<QABot welcomeMessage="Try our demo bot!" />
```

Demo mode provides realistic sample responses and lets you test all functionality before connecting real endpoints.

## Configuration

### Three-Level Architecture

QA Bot Core provides **three levels of usage complexity** to fit different needs:

#### **Level 1: Simple Props** (Recommended Start)
Essential business logic props - everything else uses sensible defaults:

```javascript
<QABot
  apiKey="your-api-key"
  endpoints={{ qa: 'https://your-api.com/chat' }}
  userEmail="user@example.com"
  welcomeMessage="How can I help you today?"
/>
```

**Available Simple Props:**
- `apiKey` - API authentication key
- `endpoints` - Object with `qa` and optional `rating` endpoints
- `branding` - Simple branding configuration:
  - `logo` - Avatar/logo URL
  - `primaryColor` - Main brand color
  - `secondaryColor` - Secondary/hover color
  - `primaryFont` - Main font family
  - `botName` - Name shown in header
- `messages` - Simple message customization:
  - `welcome` - Initial greeting
  - `placeholder` - Input field placeholder
  - `error` - Error message
  - `disabled` - Message when chat is disabled
- `userEmail`, `userName`, `loginUrl` - User context
- `customFlows` - Custom conversation flows

#### **Level 2: Full react-chatbotify Control**
Business props + direct access to react-chatbotify settings:

```javascript
<QABot
  // Business logic
  apiKey="your-api-key"
  endpoints={{ qa: 'https://your-api.com/chat' }}
  customFlows={myFlows}

  // Direct react-chatbotify settings
  settings={{
    general: {
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      fontFamily: 'Inter, sans-serif',
      embedded: false
    },
    header: {
      title: 'Support Bot',
      avatar: '/bot-avatar.png',
      showAvatar: true
    },
    chatInput: {
      enabledPlaceholderText: 'Ask me anything...',
      characterLimit: 1000,
      showCharacterCount: true
    },
    botBubble: {
      simulateStream: true,
      streamSpeed: 10
    }
  }}

  // Any other react-chatbotify props
  plugins={[MyPlugin()]}
/>
```

The `settings` object follows [react-chatbotify's documentation](https://react-chatbotify.com) exactly - zero learning curve!

#### **Escape Hatches for Advanced Users**

QA Bot Core provides "escape hatches" that give you complete control over react-chatbotify when needed:

- **`settings`** - Override any react-chatbotify setting (merged with simple props)
- **`styles`** - Complete control over component styles
- **`flow`** - Replace the entire conversation flow
- **`plugins`** - Add custom react-chatbotify plugins

```javascript
<QABot
  // Simple props for common needs
  branding={{ primaryColor: '#007bff' }}

  // Escape hatch for advanced customization
  settings={{
    header: {
      buttons: [<CustomButton />]  // Add custom header buttons
    }
  }}

  // Complete flow override if needed
  flow={myCompleteCustomFlow}
/>
```

📖 **Complete API Reference**: See the TypeScript definitions in [`src/config/types.ts`](./src/config/types.ts) for all available props and types.

```javascript
// Import constants and API reference
import { QABot, CONSTANTS, BUSINESS_PROPS, CUSTOM_FLOWS_API } from '@snf/qa-bot-core';

// Use constants in your code
const welcomeMsg = CONSTANTS.DEFAULT_WELCOME_MESSAGE;
const maxChars = CONSTANTS.DEFAULT_CHARACTER_LIMIT;
```

#### **Level 3: Wrapper Pattern**
Create organizational bots with pre-configured defaults:

```javascript
// MyCompanyBot.js - Your wrapper component
function MyCompanyBot({ settings = {}, ...props }) {
  const companyDefaults = {
    general: { primaryColor: '#company-blue' },
    header: { title: 'Company AI', avatar: '/company-logo.png' }
  };

  return (
    <QABot
      endpoints={{ qa: 'https://company.com/api/qa' }}
      settings={{ ...companyDefaults, ...settings }}
      {...props}
    />
  );
}

// Users just do:
<MyCompanyBot apiKey={userKey} />
```

## Wrapper Pattern Benefits

**Why wrappers are perfect with QA Bot Core:**

✅ **Pre-configure endpoints & branding** - Users just need `apiKey`
✅ **Add custom conversation flows** - Ticket creation, escalation, etc.
✅ **Wrap with React context** - Auth, state management, etc.
✅ **Use react-chatbotify docs directly** - Zero learning curve
✅ **All consumption methods work** - React, JS API, standalone

### Complete Wrapper Example

```javascript
// your-org-ai-bot/src/index.js
import React from 'react';
import { QABot } from '@snf/qa-bot-core';
import { AuthProvider } from './context/AuthContext';
import { orgCustomFlows } from './flows';

export function OrgAIBot(props) {
  const orgDefaults = {
    general: {
      primaryColor: '#company-blue',
      fontFamily: 'Company Sans'
    },
    header: {
      title: 'Org AI',
      avatar: '/org-logo.png'
    }
  };

  return (
    <AuthProvider>
      <QABot
        // Pre-configured for your org
        endpoints={{ qa: 'https://org.com/ai-api' }}
        welcomeMessage="Hi! I'm the Org AI assistant."
        customFlows={orgCustomFlows}

        // Merge user overrides
        settings={{ ...orgDefaults, ...props.settings }}
        {...props}
      />
    </AuthProvider>
  );
}

// Users just do:
<OrgAIBot apiKey={userKey} userEmail="user@org.com" />
```

### Display Modes

```javascript
// Floating chat button (default)
<QABot apiKey="key" endpoints={{qa: '/api'}} />

// Embedded directly in page
<QABot
  apiKey="key"
  endpoints={{qa: '/api'}}
  settings={{ general: { embedded: true } }}
/>
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

### Q&A Endpoint

Your Q&A endpoint should accept:
```json
POST /your-qa-endpoint
Content-Type: application/json
X-API-KEY: your-api-key          // If apiKey configured
X-Session-ID: session_123        // For tracking
X-Query-ID: query_456           // For correlation

{
  "query": "User's question here"
}
```

And return:
```json
{
  "response": "Bot's answer with **markdown** and [links](https://example.com) support",
  "sessionId": "session_123",    // Optional: for tracking
  "queryId": "query_456"          // Optional: for feedback correlation
}

// Alternative response formats also supported:
{ "answer": "..." }     // .answer
{ "text": "..." }       // .text
{ "message": "..." }    // .message
```

### Rating Endpoint (Optional)

For thumbs up/down feedback collection:
```json
POST /your-rating-endpoint
Content-Type: application/json
X-API-KEY: your-api-key
X-Session-ID: session_123
X-Query-ID: query_456

{
  "sessionId": "session_123",
  "queryId": "query_456",
  "rating": 1              // 1 for 👍, 0 for 👎
}
```

## JavaScript API

### Programmatic Control

```javascript
import { qaBot } from '@snf/qa-bot-core';

const bot = qaBot({
  target: document.getElementById('bot-container'),
  apiKey: 'your-api-key',
  endpoints: { qa: '/api/chat' },
  welcomeMessage: "Hello from JS!",
  settings: { general: { embedded: false } }
});

// Programmatic controls
bot.openChat();           // Open chat window
bot.closeChat();          // Close chat window
bot.toggleChat();         // Toggle open/closed
bot.addMessage("Hi!");    // Inject a message
bot.setBotEnabled(false); // Disable/enable bot
bot.destroy();            // Clean up and remove
```

### React Component API

```javascript
import { useRef } from 'react';
import QABot from '@snf/qa-bot-core';

function App() {
  const botRef = useRef();

  const handleSendMessage = () => {
    botRef.current.addMessage("Programmatic message!");
  };

  return (
    <>
      <button onClick={handleSendMessage}>Send Message</button>
      <QABot ref={botRef} />
    </>
  );
}
```

## Custom Conversation Flows

Extend or replace the default Q&A behavior with custom conversation flows:

```javascript
const customFlows = {
  start: {
    message: "How can I help you today?",
    options: ["General Question", "Create Ticket", "Report Issue"],
    paths: ["qa_loop", "ticket_flow", "report_flow"]
  },

  ticket_flow: {
    message: "I'll help you create a support ticket. What's the issue?",
    function: async (params) => {
      const ticket = await createTicket({
        issue: params.userInput,
        user: params.userEmail
      });
      return `Ticket #${ticket.id} created! You'll receive updates at ${params.userEmail}.`;
    }
  },

  report_flow: {
    message: "Please describe the issue you'd like to report:",
    function: async (params) => {
      await submitReport(params.userInput);
      return "Thank you for the report. Our team will investigate.";
    }
  }
};

<QABot customFlows={customFlows} />
```

### Flow Parameters

Custom flow functions receive:
- `userInput` - The user's message
- `userEmail` - From config.user.email
- `userName` - From config.user.name
- `sessionId` - Unique session identifier
- `injectMessage(message)` - Add bot message to chat

## Custom Components

### Header Components

Add custom buttons, user info, or other elements to the chat header:

```javascript
function LoginButton() {
  const { user, login } = useAuth();
  return (
    <button onClick={login} className="header-btn">
      {user ? user.name : 'Login'}
    </button>
  );
}

function TicketButton() {
  return (
    <button onClick={() => createTicket()} className="header-btn">
      🎫 Create Ticket
    </button>
  );
}

<QABot
  headerComponents={[<LoginButton />, <TicketButton />]}
/>
```

## Styling & Theming

### Configuration-Based Theming

```javascript
<QABot
  config={{
    general: {
      primaryColor: '#2563eb',        // Main brand color
      secondaryColor: '#1d4ed8',      // Accent color
      fontFamily: 'Inter, sans-serif'  // Typography
    }
  }}
/>
```

### CSS Variables

CSS variables override configuration-based theming:

```css
:root {
  --primary-color: #007bff;          /* Overrides config.general.primaryColor */
  --secondary-color: #6c757d;        /* Overrides config.general.secondaryColor */
  --font-family: 'Helvetica Neue', Arial, sans-serif; /* Overrides config.general.fontFamily */
}

/* Or target specific instances */
.my-custom-bot {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
}
```

```javascript
<div className="my-custom-bot">
  <QABot config={{...}} />
</div>
```

### Custom CSS Classes

The bot uses consistent CSS classes you can target:

```css
.qa-bot { /* Main container */ }
.qa-bot.embedded-qa-bot { /* Embedded mode */ }
.rcb-chat-window { /* Chat window */ }
.rcb-user-message { /* User messages */ }
.rcb-bot-message { /* Bot messages */ }
.rcb-options { /* Option buttons */ }
.rcb-checkbox-container { /* Checkbox groups */ }
```

## Examples

### Demo Mode (No Configuration Needed)

```javascript
// Works immediately - provides demo responses
<QABot />

// With custom welcome message
<QABot welcome="Try our demo bot!" />
```

### Minimal Production Setup

```javascript
<QABot
  apiKey="your-api-key"
  endpoints={{ qa: '/api/chat' }}
/>
```

### Organization-Branded Bot

```javascript
<QABot
  apiKey="university-api-key"
  endpoints={{ qa: 'https://api.university.edu/chat' }}
  userEmail="student@university.edu"
  welcomeMessage="Welcome to University AI Support!"
  settings={{
    general: {
      primaryColor: '#8C1515',
      secondaryColor: '#2E2D29',
      fontFamily: 'Source Sans Pro, sans-serif',
      embedded: true
    },
    header: {
      title: 'University AI',
      avatar: '/university-logo.png'
    }
  }}
/>
```

### Production Examples

**Wrapper Implementations:**
- [@snf/access-qa-bot](https://github.com/necyberteam/access-qa-bot) - ACCESS-CI support bot with custom flows
- See [WRAPPER_DEMO.md](./WRAPPER_DEMO.md) for complete wrapper implementation example

**Integration Examples:**
- React applications with custom theming and flows
- Vanilla JS websites with standalone bundles
- CDN integration for static sites

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
├── components/           # React components
│   ├── QABot.js           # Main bot component (simplified!)
│   └── BotController.js   # Imperative API bridge
├── config/              # Configuration system
│   ├── defaults.js        # Simple react-chatbotify defaults
│   └── api-reference.js   # Complete API reference (SINGLE SOURCE OF TRUTH)
├── hooks/               # Custom React hooks
│   ├── useChatBotSettings.js # Applies theme + accessibility
│   ├── useThemeColors.js
│   └── useKeyboardNavigation.js
├── utils/               # Utilities and flow logic
│   ├── create-bot-flow.js # Flow factory
│   ├── deep-merge.js      # Settings merging
│   └── flows/
│       └── qa-flow.js     # Core Q&A logic
├── styles/              # CSS styles
│   └── index.css          # Complete stylesheet
├── lib.js               # Library entry point (React + JS API)
├── standalone.js        # Standalone build entry
└── index.js             # Demo app entry point
```

See [FILE_GUIDE.md](./FILE_GUIDE.md) for detailed file documentation.

## Architecture

**Key Design Principles:**
- 🎯 **Pre-configured react-chatbotify** - Sensible defaults, use their docs directly
- 🎮 **Three-level complexity** - Simple → Complex → Wrapper pattern
- 🚀 **Zero transformation overhead** - Direct settings pass-through
- 🏗️ **Perfect wrapper pattern** - Organizational bots with pre-configured defaults
- 🤝 **Deep merging** - Settings merge intelligently for wrapper pattern
- 🔄 **Demo mode** - Works without endpoints for development/testing
- ♿ **Accessibility first** - WCAG compliant with keyboard navigation
- 📘 **Zero learning curve** - If you know react-chatbotify, you know this

**Documentation:**
- [FILE_GUIDE.md](./FILE_GUIDE.md) - Complete file architecture guide
- [WRAPPER_DEMO.md](./WRAPPER_DEMO.md) - Wrapper implementation example
- [WRAPPER_PATTERN_ANALYSIS.md](./WRAPPER_PATTERN_ANALYSIS.md) - Wrapper pattern analysis

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests for improvements.

## License

MIT License - see [LICENSE](LICENSE) for details.
