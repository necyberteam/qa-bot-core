# QA Bot Core - Wrapper Pattern Demo

## **Example: Access QA Bot Wrapper**

Here's how an organization would create a wrapper around qa-bot-core:

### **1. Wrapper Implementation (`access-qa-bot/src/index.js`)**

```javascript
import React from 'react';
import { QABot, qaBot } from '@snf/qa-bot-core';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import { accessFlows } from './flows';
import { LoginButton, TicketButton } from './components';

// Wrapper defaults - organization-specific configuration
const ACCESS_DEFAULTS = {
  core: {
    endpoints: {
      qa: 'https://access-ai.example.com/api/qa',
      rating: 'https://access-ai.example.com/api/rating'
    },
    auth: {
      apiKey: process.env.REACT_APP_ACCESS_API_KEY
    }
  },
  content: {
    messages: {
      welcome: 'Hi! I\'m the Access AI assistant. How can I help you today?',
      placeholder: 'Ask me about Access systems, policies, or request help...',
      error: 'I\'m having trouble right now. Please try again or contact IT support.'
    },
    branding: {
      title: 'Access AI',
      avatarUrl: '/images/access-ai-avatar.png'
    }
  },
  appearance: {
    theme: {
      primaryColor: '#2563eb',   // Access blue
      secondaryColor: '#1d4ed8',
      fontFamily: 'Inter, sans-serif'
    },
    customization: {
      headerComponents: [<LoginButton />, <TicketButton />]
    }
  },
  behavior: {
    flows: {
      customFlows: accessFlows  // Custom conversation flows
    }
  }
};

// React component wrapper
export function AccessQABot(props) {
  // Deep merge: wrapper defaults + user config
  const wrapperConfig = {
    ...ACCESS_DEFAULTS,
    ...props.config  // Deep merge happens in mergeConfig()
  };

  return (
    <AuthProvider>
      <TicketProvider>
        <QABot
          {...props}           // Forward all props
          config={wrapperConfig} // Merged configuration
        />
      </TicketProvider>
    </AuthProvider>
  );
}

// JavaScript API wrapper
export function accessQABot(config = {}) {
  const wrapperConfig = {
    ...ACCESS_DEFAULTS,
    ...config
  };

  return qaBot(wrapperConfig);
}

// Default export for convenience
export default AccessQABot;
```

### **2. Custom Flows (`access-qa-bot/src/flows/index.js`)**

```javascript
export const accessFlows = {
  start: {
    message: "Welcome to Access AI! How can I help you?",
    options: [
      "General Question",
      "Create Support Ticket",
      "Report Security Issue",
      "Access Request"
    ],
    paths: ["qa_loop", "ticket_flow", "security_flow", "access_flow"]
  },

  ticket_flow: {
    message: "I'll help you create a support ticket. What type of issue are you experiencing?",
    options: ["Technical Issue", "Account Problem", "Other"],
    function: async (params) => {
      // Custom ticket creation logic
      const ticket = await createTicket(params.userInput);
      return `Ticket #${ticket.id} created successfully! You'll receive updates at ${params.userEmail}.`;
    }
  },

  security_flow: {
    message: "Security reports are taken seriously. Please describe the issue:",
    function: async (params) => {
      await createSecurityReport(params);
      return "Thank you for the security report. Our team has been notified and will investigate immediately.";
    }
  },

  access_flow: {
    message: "What type of access do you need?",
    options: ["System Access", "Building Access", "VPN Access"],
    function: async (params) => {
      const request = await createAccessRequest(params);
      return `Access request submitted! Request ID: ${request.id}. Your manager will receive an approval notification.`;
    }
  }
};
```

### **3. Custom Components (`access-qa-bot/src/components/LoginButton.js`)**

```javascript
import React from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginButton() {
  const { user, login, logout } = useAuth();

  return (
    <button
      onClick={user ? logout : login}
      className="header-auth-button"
      aria-label={user ? 'Logout' : 'Login'}
    >
      {user ? `Logout (${user.name})` : 'Login'}
    </button>
  );
}
```

### **4. Usage Examples**

#### **React Usage (wrapper users):**
```javascript
import AccessQABot from 'access-qa-bot';

function App() {
  return (
    <AccessQABot
      // User can still override wrapper defaults
      config={{
        content: {
          messages: {
            welcome: "Custom welcome message!"  // Overrides wrapper default
          }
        }
      }}
      // Props are forwarded
      embedded={true}
      enabled={true}
      userEmail="user@example.com"
    />
  );
}
```

#### **JavaScript API (wrapper users):**
```javascript
import { accessQABot } from 'access-qa-bot';

const bot = accessQABot({
  target: document.getElementById('chat'),
  // User can override wrapper endpoints
  core: {
    endpoints: {
      qa: 'https://custom-endpoint.com/qa'  // Overrides wrapper default
    }
  }
});
```

## **Configuration Precedence Example**

```javascript
// 1. Schema defaults (qa-bot-core)
const schemaDefaults = {
  content: {
    messages: { welcome: "Hello! What can I help you with?" },
    branding: { title: "Q&A Bot" }
  }
};

// 2. Wrapper defaults (access-qa-bot)
const wrapperDefaults = {
  content: {
    messages: { welcome: "Hi! I'm the Access AI assistant." },
    branding: { title: "Access AI" }  // Adds new property
  }
};

// 3. User config
const userConfig = {
  content: {
    messages: { welcome: "Custom welcome!" }  // User override
    // branding.title remains "Access AI" from wrapper
  }
};

// 4. Result after deep merge:
const finalConfig = {
  content: {
    messages: { welcome: "Custom welcome!" },     // User wins
    branding: { title: "Access AI" }              // Wrapper default kept
  }
};
```

## **Key Benefits for Wrappers**

1. **Clean Defaults Override**: Wrappers set organization defaults, users can still customize
2. **Complete Flow Control**: Wrappers can completely replace or extend conversation flows
3. **State Management**: Wrappers can add their own React contexts and providers
4. **Component Injection**: Custom header buttons, forms, etc.
5. **API Compatibility**: All consumption methods (React, JS API, standalone) work through wrappers
6. **Deep Merging**: Nested config properties merge properly without losing wrapper defaults

## **Wrapper-Friendly Architecture ✅**

The current qa-bot-core implementation excellently supports the wrapper pattern with:
- Deep configuration merging
- Flow injection and override capability
- Component slot system (extensible)
- Clean prop forwarding
- No hardcoded behaviors that prevent customization
- All consumption methods supported
