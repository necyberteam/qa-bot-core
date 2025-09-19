import React from 'react';
import ReactDOM from 'react-dom/client';
import QABot from './components/QABot';
import type { BotControllerHandle, EndpointsConfig } from './config';
import './styles/index.css'; // QA Bot styles

// Export the main component
export { QABot };

// Export types for simple usage
export type {
  QABotProps,
  QABotBusinessProps,
  EndpointsConfig,
  CustomFlows,
  FlowStep,
  FlowParams,
  SimpleUsageProps,
  BotControllerHandle,
  BrandingConfig,
  MessagesConfig
} from './config';

export {
  CONSTANTS,
  defaultReactChatbotifySettings,
  defaultWelcomeMessage
} from './config';

/**
 * ===========================================
 * PROGRAMMATIC API TYPES
 * ===========================================
 */

interface QABotConfig {
  target: HTMLElement;
  apiKey?: string;
  endpoints?: EndpointsConfig;
  defaultOpen?: boolean;
  embedded?: boolean;
  enabled?: boolean;
  loginUrl?: string;
  welcomeMessage?: string;
  userEmail?: string;
  userName?: string;
  branding?: any;
  messages?: any;
  [key: string]: any; // Allow other react-chatbotify props
}

interface QABotInstance {
  addMessage: (message: string) => void;
  setBotEnabled: (status: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  destroy: () => void;
}

interface ProgrammaticQABotProps {
  apiKey?: string;
  endpoints?: EndpointsConfig;
  defaultOpen?: boolean;
  embedded?: boolean;
  enabled?: boolean;
  loginUrl?: string;
  welcomeMessage?: string;
  userEmail?: string;
  userName?: string;
  branding?: any;
  messages?: any;
}

/**
 * ===========================================
 * PROGRAMMATIC API IMPLEMENTATION
 * ===========================================
 */

// React wrapper component for programmatic API
const ProgrammaticQABot = React.forwardRef<BotControllerHandle, ProgrammaticQABotProps>(
  (props, ref) => {
    const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false);
    const qaRef = React.useRef<BotControllerHandle>(null);

    // Expose controller methods via ref
    React.useImperativeHandle(ref, () => ({
      addMessage: (message: string) => {
        qaRef.current?.addMessage(message);
      },
      setBotEnabled: (status: boolean) => {
        qaRef.current?.setBotEnabled(status);
      },
      openChat: () => {
        setIsOpen(true);
        qaRef.current?.openChat();
      },
      closeChat: () => {
        setIsOpen(false);
        qaRef.current?.closeChat();
      },
      toggleChat: () => {
        setIsOpen(prev => !prev);
        qaRef.current?.toggleChat();
      }
    }), []);

    return (
      <QABot
        ref={qaRef}
        apiKey={props.apiKey}
        endpoints={props.endpoints}
        userEmail={props.userEmail}
        userName={props.userName}
        loginUrl={props.loginUrl}
        welcomeMessage={props.welcomeMessage}
        branding={props.branding}
        messages={props.messages}
      />
    );
  }
);

ProgrammaticQABot.displayName = 'ProgrammaticQABot';

/**
 * JavaScript API function - creates a QA Bot instance programmatically
 *
 * @param config Configuration object for the bot
 * @returns QABot instance with control methods
 */
export function qaBot(config: QABotConfig): QABotInstance | undefined {
  if (!config.target || !(config.target instanceof HTMLElement)) {
    console.error('QA Bot: A valid target DOM element is required');
    return undefined;
  }

  const root = ReactDOM.createRoot(config.target);
  const wrapperRef = { current: null as BotControllerHandle | null };

  root.render(
    <React.StrictMode>
      <ProgrammaticQABot
        ref={(ref) => { wrapperRef.current = ref; }}
        apiKey={config.apiKey}
        endpoints={config.endpoints}
        defaultOpen={config.defaultOpen}
        embedded={config.embedded}
        enabled={config.enabled}
        loginUrl={config.loginUrl}
        welcomeMessage={config.welcomeMessage}
        userEmail={config.userEmail}
        userName={config.userName}
        branding={config.branding}
        messages={config.messages}
      />
    </React.StrictMode>
  );

  return {
    addMessage: (message: string) => wrapperRef.current?.addMessage(message),
    setBotEnabled: (status: boolean) => wrapperRef.current?.setBotEnabled(status),
    openChat: () => wrapperRef.current?.openChat(),
    closeChat: () => wrapperRef.current?.closeChat(),
    toggleChat: () => wrapperRef.current?.toggleChat(),
    destroy: () => {
      wrapperRef.current = null;
      root.unmount();
    }
  };
}

export default qaBot;

