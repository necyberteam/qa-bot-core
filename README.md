# QA Bot Core

A flexible, configurable React chatbot component with RAG-powered Q&A capabilities, rating system, and extensive wrapper support for organizational customization.

**Built for the wrapper pattern** - Perfect for creating organization-specific AI assistants that extend the core functionality.

## Features

### Core Functionality
- 🤖 **Configurable Q&A** with any RAG endpoint
- 👍 **Built-in rating/feedback** system with thumbs up/down
- 🎨 **Unified configuration schema** with deep merging
- 🔄 **Demo mode** - works without endpoints for development
- ♿ **Accessibility first** with keyboard navigation and screen reader support

### Developer Experience
- 🏗️ **Wrapper pattern optimized** - perfect for organizational customization
- 🎯 **3-layer configuration precedence** (schema → config → props)
- 🧩 **Custom conversation flows** - extend or replace default behavior
- 📱 **Multiple integration options** (React component, JavaScript API, CDN)
- 🎛️ **Component slots** for custom headers, buttons, and UI elements

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

### React Component

```javascript
import QABot from '@snf/qa-bot-core';

function App() {
  return (
    <QABot
      config={{
        core: {
          endpoints: {
            qa: 'https://your-api.com/chat',
            rating: 'https://your-api.com/rating'
          }
        },
        content: {
          messages: {
            welcome: 'How can I help you today?'
          }
        },
        appearance: {
          theme: {
            primaryColor: '#007bff'
          }
        }
      }}
    />
  );
}
```

#### With Prop Overrides (Simpler)

```javascript
// Props can override config for common settings
<QABot
  config={{
    core: { endpoints: { qa: 'https://your-api.com/chat' }}
  }}
  welcome="Hi there!"           // Prop override
  embedded={true}               // Prop override
  userEmail="user@example.com"  // Prop override
/>
```

### JavaScript API

```javascript
import { qaBot } from '@snf/qa-bot-core';

const bot = qaBot({
  target: document.getElementById('bot-container'),
  config: {
    core: {
      endpoints: {
        qa: 'https://your-api.com/chat'
      }
    },
    content: {
      messages: {
        welcome: 'Hello from vanilla JS!'
      }
    }
  },
  // Or use direct props
  embedded: false,
  enabled: true
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
  // Works without endpoints (demo mode)
  window.qaBotCore({
    target: document.getElementById('bot-container'),
    welcome: 'Try the demo!',
    embedded: true
  });
</script>
```

## Demo Mode

**QA Bot Core works immediately without any configuration!** Perfect for development, testing, and demos:

```javascript
// No endpoints needed - provides demo responses
<QABot />

// Or with custom welcome message
<QABot welcome="Try our demo bot!" />
```

Demo mode provides realistic sample responses and lets you test all functionality before connecting real endpoints.

## Configuration

### Unified Configuration Schema

QA Bot Core uses a unified configuration schema with logical groupings and **3-layer precedence**:

1. **Schema defaults** (built-in defaults)
2. **User config** (your configuration object)
3. **Prop overrides** (props passed to component)

```javascript
const config = {
  // Core functionality
  core: {
    endpoints: {
      qa: 'https://api.example.com/qa',        // Q&A endpoint
      rating: 'https://api.example.com/rating' // Optional rating endpoint
    },
    auth: {
      apiKey: 'your-api-key',    // Optional API key
    }
  },

  // UI behavior
  ui: {
    display: {
      embedded: false,             // Floating vs embedded mode
      enabled: true,               // Bot availability
      defaultOpen: false           // Initial state
    },
    state: {
      open: false,                 // Controlled open state
      onOpenChange: (open) => {}   // Open state callback
    }
  },

  // User context
  user: {
    email: 'user@example.com',     // User email for personalization
    name: 'John Doe',              // User name
    loginUrl: '/auth/login'        // Login redirect URL
  },

  // Content and messaging
  content: {
    messages: {
      welcome: 'How can I help?',
      placeholder: 'Type your question...',
      error: 'Something went wrong'
    },
    branding: {
      title: 'Help Assistant',
      avatarUrl: '/bot-avatar.png'
    }
  },

  // Visual appearance
  appearance: {
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      fontFamily: 'Inter, sans-serif'
    },
    customization: {
      headerComponents: [<CustomButton />]  // Custom header buttons
    }
  },

  // Behavior and features
  behavior: {
    chat: {
      streamSpeed: 10,             // Typing animation speed
      characterLimit: 1000,        // Message length limit
      showRatings: true            // Enable thumbs up/down
    },
    flows: {
      customFlows: customFlowDef   // Custom conversation flows
    }
  }
};
```

### Configuration Precedence & Prop Overrides

The **3-layer precedence system** makes it easy to set defaults while allowing runtime customization:

```javascript
// Layer 1: Schema defaults (built-in)
// welcome: "Hello! What can I help you with?"

// Layer 2: Your config (middle priority)
const config = {
  content: {
    messages: { welcome: "Hi from MyApp!" }  // Overrides schema default
  }
};

// Layer 3: Props (highest priority)
<QABot
  config={config}
  welcome="Custom welcome!"  // Overrides config.content.messages.welcome
/>

// Result: "Custom welcome!" is used
```

**Available Prop Overrides:**
- `apiKey`, `userEmail`, `userName`, `loginUrl` (auth)
- `embedded`, `enabled`, `open`, `onOpenChange` (UI state)
- `welcome` (content)
- `headerComponents`, `customFlows` (customization)

## Wrapper Pattern

**QA Bot Core is designed for the wrapper pattern** - perfect for organizations that want to create their own branded AI assistant:

```javascript
// your-org-ai-bot/src/index.js
import { QABot } from '@snf/qa-bot-core';
import { customFlows } from './flows';
import { LoginButton, TicketButton } from './components';

const ORG_DEFAULTS = {
  core: {
    endpoints: { qa: 'https://org.com/ai-api' },
    auth: { apiKey: process.env.ORG_API_KEY }
  },
  content: {
    messages: { welcome: 'Hi! I\'m the Org AI assistant.' },
    branding: { title: 'Org AI', avatarUrl: '/org-logo.png' }
  },
  appearance: {
    theme: { primaryColor: '#company-blue' },
    customization: { headerComponents: [<LoginButton />, <TicketButton />] }
  },
  behavior: {
    flows: { customFlows }  // Custom ticket creation, etc.
  }
};

export function OrgAIBot(props) {
  return (
    <AuthProvider>
      <QABot
        {...props}
        config={{...ORG_DEFAULTS, ...props.config}}  // Deep merge
      />
    </AuthProvider>
  );
}

// Users of your wrapper can still customize:
<OrgAIBot
  config={{
    content: { messages: { welcome: "Custom welcome!" }}  // Overrides org default
  }}
  userEmail="user@example.com"
/>
```

### Benefits of Wrapper Pattern

✅ **Set organizational defaults** while allowing user customization
✅ **Add custom conversation flows** (ticket creation, escalation, etc.)
✅ **Inject custom components** (login buttons, forms, etc.)
✅ **Wrap with your React context** (auth, state management, etc.)
✅ **Brand and theme** for your organization
✅ **All consumption methods work** (React, JS API, standalone)

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
  config: {
    core: { endpoints: { qa: '/api/chat' }}
  },
  embedded: false,
  welcome: "Hello from JS!"
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
    appearance: {
      theme: {
        primaryColor: '#2563eb',        // Main brand color
        secondaryColor: '#1d4ed8',      // Accent color
        fontFamily: 'Inter, sans-serif'  // Typography
      }
    }
  }}
/>
```

### CSS Variables

CSS variables override configuration-based theming:

```css
:root {
  --primary-color: #007bff;          /* Overrides config.appearance.theme.primaryColor */
  --secondary-color: #6c757d;        /* Overrides config.appearance.theme.secondaryColor */
  --font-family: 'Helvetica Neue', Arial, sans-serif; /* Overrides config.appearance.theme.fontFamily */
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
<QABot config={{
  core: { endpoints: { qa: '/api/chat' }}
}} />
```

### Organization-Branded Bot

```javascript
<QABot
  config={{
    core: {
      endpoints: { qa: 'https://api.university.edu/chat' }
    },
    content: {
      messages: { welcome: 'Welcome to University AI Support!' },
      branding: {
        title: 'University AI',
        avatarUrl: '/university-logo.png'
      }
    },
    appearance: {
      theme: {
        primaryColor: '#8C1515',
        secondaryColor: '#2E2D29',
        fontFamily: 'Source Sans Pro, sans-serif'
      }
    }
  }}
  embedded={true}
  userEmail="student@university.edu"
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
│   ├── QABot.js           # Main bot component
│   └── BotController.js   # Imperative API bridge
├── config/              # Configuration system
│   └── schema.js          # Unified config schema (SINGLE SOURCE OF TRUTH)
├── hooks/               # Custom React hooks
│   ├── useChatBotSettings.js
│   ├── useThemeColors.js
│   └── useKeyboardNavigation.js
├── utils/               # Utilities and flow logic
│   ├── create-bot-flow.js # Flow factory
│   ├── deep-merge.js      # Config merging
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
- 🧩 **Single Source of Truth** - All defaults in unified schema
- 💵 **3-Layer Precedence** - Schema → Config → Props
- 🏗️ **Wrapper Pattern Optimized** - Perfect for organizational customization
- 🤝 **Deep Merging** - Nested configuration properties merge intelligently
- 🔄 **Demo Mode** - Works without endpoints for development/testing
- ♿ **Accessibility First** - WCAG compliant with keyboard navigation

**Documentation:**
- [FILE_GUIDE.md](./FILE_GUIDE.md) - Complete file architecture guide
- [WRAPPER_DEMO.md](./WRAPPER_DEMO.md) - Wrapper implementation example
- [WRAPPER_PATTERN_ANALYSIS.md](./WRAPPER_PATTERN_ANALYSIS.md) - Wrapper pattern analysis

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests for improvements.

## License

MIT License - see [LICENSE](LICENSE) for details.
