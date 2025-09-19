// src/components/QABot.tsx
import React, { useRef, useEffect, useMemo, forwardRef } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import HtmlRenderer from "@rcb-plugins/html-renderer";
import MarkdownRenderer from "@rcb-plugins/markdown-renderer";
import InputValidator from "@rcb-plugins/input-validator";
import { v4 as uuidv4 } from 'uuid';
import BotController from './BotController';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useFocusableSendButton from '../hooks/useFocusableSendButton';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import { deepMergeAll } from '../utils/deep-merge';
import { createBotFlow } from '../utils/create-bot-flow';
import { defaultReactChatbotifySettings, defaultWelcomeMessage } from '../config/defaults';
import type {
  QABotProps,
  BotControllerHandle,
  ReactChatbotifySettings,
  ThemeColors,
  BusinessConfig
} from '../config';

// Session management
const generateSessionId = (): string => {
  return `qa_bot_session_${uuidv4()}`;
};

const getOrCreateSessionId = (): string => {
  // Check if we already have a session ID
  const existingKey = Object.keys(localStorage).find(key => key.startsWith('qa_bot_session_'));
  if (existingKey) {
    const existingId = localStorage.getItem(existingKey);
    return existingId || generateSessionId();
  }

  // Create new session
  const newSessionId = generateSessionId();
  localStorage.setItem(newSessionId, newSessionId);
  return newSessionId;
};

/**
 * Q&A Bot Component - A pre-configured react-chatbotify wrapper with business logic
 *
 * This component provides three levels of usage complexity:
 *
 * **Level 1: Simple Usage** - Just provide apiKey and endpoints
 * ```tsx
 * <QABot
 *   apiKey="your-key"
 *   endpoints={{ qa: 'https://your-api.com/chat' }}
 * />
 * ```
 *
 * **Level 2: Complex Usage** - Add settings and customizations
 * ```tsx
 * <QABot
 *   apiKey="your-key"
 *   endpoints={{ qa: 'https://your-api.com/chat' }}
 *   customFlows={myFlows}
 *   settings={{
 *     general: { primaryColor: '#brand-color' },
 *     header: { title: 'Support Bot' }
 *   }}
 * />
 * ```
 *
 * **Level 3: Wrapper Pattern** - Create organizational bots
 * ```tsx
 * function MyOrgBot({ settings = {}, ...props }: WrapperProps) {
 *   return (
 *     <QABot
 *       endpoints={{ qa: 'https://org.com/api' }}
 *       settings={{
 *         general: { primaryColor: '#org-blue' },
 *         ...settings
 *       }}
 *       {...props}
 *     />
 *   );
 * }
 * ```
 */
const QABot = forwardRef<BotControllerHandle, QABotProps>((props, ref) => {
  const {
    // Business logic props
    apiKey,
    endpoints = {},
    userEmail,
    userName,
    loginUrl,
    welcomeMessage,
    customFlows,

    // Simple configuration props
    branding,
    messages
  } = props;

  // Create our business logic configuration
  const businessConfig: BusinessConfig = {
    core: {
      endpoints,
      auth: { apiKey }
    },
    user: {
      email: userEmail,
      name: userName,
      loginUrl
    },
    flows: {
      welcomeMessage: messages?.welcome || welcomeMessage || defaultWelcomeMessage,
      customFlows
    }
  };

  // Session management
  const sessionIdRef = useRef<string>(getOrCreateSessionId());
  const sessionId = sessionIdRef.current;

  // Build settings from simple props only
  const settings = useMemo((): ReactChatbotifySettings => {
    // Create settings from simple props
    const simpleSettings: ReactChatbotifySettings = {};

    // Map branding to settings
    if (branding) {
      simpleSettings.general = {
        ...simpleSettings.general,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        fontFamily: branding.primaryFont
      };
      simpleSettings.header = {
        ...simpleSettings.header,
        title: branding.botName,
        avatar: branding.logo
      };
    }

    // Map messages to settings
    if (messages) {
      simpleSettings.chatInput = {
        ...simpleSettings.chatInput,
        enabledPlaceholderText: messages.placeholder,
        disabledPlaceholderText: messages.disabled || messages.error
      };
    }

    // Merge defaults with simple props only
    return deepMergeAll(
      defaultReactChatbotifySettings,
      simpleSettings
    );
  }, [branding, messages]);

  // Container ref for theming
  const containerRef = useRef<HTMLDivElement>(null);
  const themeColors: ThemeColors = useThemeColors(containerRef, settings.general);

  // Apply theme colors as CSS variables
  useChatBotSettings({ settings, themeColors });

  // Create flow from business config
  const flow = useMemo(() => {
    return createBotFlow({
      config: businessConfig,
      customFlows,
      sessionId
    });
  }, [businessConfig, customFlows, sessionId]);

  // Default plugins only
  const plugins = useMemo(() => {
    return [HtmlRenderer(), MarkdownRenderer(), InputValidator()];
  }, []);

  // Apply hooks
  useFocusableSendButton();
  useKeyboardNavigation();


  // Handle tooltip shown tracking
  useEffect(() => {
    const handleToggle = () => {
      sessionStorage.setItem('qa_bot_tooltip_shown', 'true');
    };

    window.addEventListener('rcb-toggle-chat-window', handleToggle);
    return () => window.removeEventListener('rcb-toggle-chat-window', handleToggle);
  }, []);

  return (
    <div
      className={`qa-bot ${settings.general?.embedded ? "embedded-qa-bot" : ""}`}
      ref={containerRef}
      role="region"
      aria-label="Q&A Bot"
    >
      <ChatBotProvider>
        <main role="main" aria-label="Chat interface">
          <BotController
            ref={ref}
            embedded={settings.general?.embedded || false}
            currentOpen={false}
          />
          <ChatBot
            key={`chatbot-${sessionId}`}
            settings={settings}
            flow={flow}
            plugins={plugins}
          />

          {/* Accessibility regions */}
          <div
            aria-live="polite"
            aria-label="Bot response updates"
            className="sr-only"
            id="bot-live-region"
          />
          <div id="chat-input-help" className="sr-only">
            Type your message and press Enter to send. Use arrow keys to navigate through response options.
          </div>
        </main>
      </ChatBotProvider>
    </div>
  );
});

QABot.displayName = 'QABot';

export default QABot;

