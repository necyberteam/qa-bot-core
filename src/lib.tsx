import React from 'react';
import ReactDOM from 'react-dom/client';
import QABot from './components/QABot';
import type { BotControllerHandle } from './config';
import './styles/index.css'; // QA Bot styles

// Export the main component
export { QABot };

// Export types for usage
export type {
  QABotProps,
  BotControllerHandle
} from './config';

/**
 * ===========================================
 * PROGRAMMATIC API TYPES
 * ===========================================
 */

interface QABotConfig {
  target: HTMLElement;
  apiKey: string;
  qaEndpoint: string;
  ratingEndpoint?: string;
  defaultOpen?: boolean;
  embedded?: boolean;
  enabled?: boolean;
  welcomeMessage: string;
  primaryColor?: string;
  secondaryColor?: string;
  botName?: string;
  logo?: string;
  placeholder?: string;
  errorMessage?: string;
  footerText?: string;
  footerLink?: string;
  tooltipText?: string;
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
  apiKey: string;
  qaEndpoint: string;
  ratingEndpoint?: string;
  defaultOpen?: boolean;
  embedded?: boolean;
  enabled?: boolean;
  welcomeMessage: string;
  primaryColor?: string;
  secondaryColor?: string;
  botName?: string;
  logo?: string;
  placeholder?: string;
  errorMessage?: string;
  footerText?: string;
  footerLink?: string;
  tooltipText?: string;
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
        qaEndpoint={props.qaEndpoint}
        ratingEndpoint={props.ratingEndpoint}
        welcomeMessage={props.welcomeMessage}
        primaryColor={props.primaryColor}
        secondaryColor={props.secondaryColor}
        botName={props.botName}
        logo={props.logo}
        placeholder={props.placeholder}
        errorMessage={props.errorMessage}
        embedded={props.embedded}
        enabled={props.enabled}
        open={isOpen}
        onOpenChange={setIsOpen}
        footerText={props.footerText}
        footerLink={props.footerLink}
        tooltipText={props.tooltipText}
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
        qaEndpoint={config.qaEndpoint}
        ratingEndpoint={config.ratingEndpoint}
        defaultOpen={config.defaultOpen}
        embedded={config.embedded}
        enabled={config.enabled}
        welcomeMessage={config.welcomeMessage}
        primaryColor={config.primaryColor}
        secondaryColor={config.secondaryColor}
        botName={config.botName}
        logo={config.logo}
        placeholder={config.placeholder}
        errorMessage={config.errorMessage}
        footerText={config.footerText}
        footerLink={config.footerLink}
        tooltipText={config.tooltipText}
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

