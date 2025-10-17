// src/components/QABot.tsx
import React, { useRef, useEffect, useMemo, forwardRef, useState } from 'react';
import ChatBot, { ChatBotProvider, Button } from "react-chatbotify";
import HtmlRenderer from "@rcb-plugins/html-renderer";
import MarkdownRenderer from "@rcb-plugins/markdown-renderer";
import InputValidator from "@rcb-plugins/input-validator";
import BotController from './BotController';
import LoginButton from './LoginButton';
import UserIcon from './UserIcon';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useFocusableSendButton from '../hooks/useFocusableSendButton';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import useUpdateHeader from '../hooks/useUpdateHeader';
import { createQAFlow } from '../utils/flows/qa-flow';
import { getOrCreateSessionId } from '../utils/session-utils';
import type { Settings, Flow } from 'react-chatbotify';
import {
  fixedReactChatbotifySettings,
  defaultValues,
  type QABotProps,
  type BotControllerHandle,
  type ThemeColors
} from '../config';

/**
 * Q&A Bot Component - A pre-configured react-chatbotify wrapper with business logic
 */
const QABot = forwardRef<BotControllerHandle, QABotProps>((props, ref) => {
  const {
    // Required
    apiKey,
    qaEndpoint,

    // Optional functionality
    ratingEndpoint,
    welcomeMessage,
    enabled,
    open,
    onOpenChange,

    // Optional branding
    primaryColor,
    secondaryColor,
    botName,
    logo,
    placeholder,
    errorMessage,

    // Layout props
    embedded,

    // Footer props
    footerText,
    footerLink,
    tooltipText,

    // Login props
    loginUrl
  } = props;

  // Session management
  const sessionIdRef = useRef<string>(getOrCreateSessionId());
  const sessionId = sessionIdRef.current;

  // Track enabled state internally for reactivity
  const [isEnabled, setIsEnabled] = useState(enabled !== undefined ? enabled : defaultValues.enabled);

  // Sync enabled prop changes
  useEffect(() => {
    setIsEnabled(enabled !== undefined ? enabled : defaultValues.enabled);
  }, [enabled]);

  // Build settings: Fixed settings + overridable props
  const settings = useMemo((): Settings => {
    // Start with fixed settings (cannot be overridden)
    const base = { ...fixedReactChatbotifySettings };

    // Add overridable settings - use props if provided, otherwise defaults

    base.general = {
      ...base.general,
      primaryColor: primaryColor || defaultValues.primaryColor,
      secondaryColor: secondaryColor || defaultValues.secondaryColor,
      fontFamily: defaultValues.fontFamily,
      embedded: embedded !== undefined ? embedded : defaultValues.embedded
    };

    // Build header buttons array conditionally
    const loginOrUserButton = isEnabled
      ? <UserIcon key="user-icon" />
      : <LoginButton key="login-button" loginUrl={loginUrl || defaultValues.loginUrl} isHeaderButton={true} />;

    base.header = {
      title: botName || defaultValues.botName,
      showAvatar: true,
      avatar: logo || defaultValues.avatar,
      buttons: [
        loginOrUserButton,
        Button.CLOSE_CHAT_BUTTON
      ]
    };

    base.chatInput = {
      ...base.chatInput,
      disabled: !isEnabled,
      enabledPlaceholderText: placeholder || defaultValues.placeholder,
      disabledPlaceholderText: errorMessage || defaultValues.errorMessage
    };

    base.tooltip = {
      ...base.tooltip,
      text: tooltipText || defaultValues.tooltipText
    };

    return base;
  }, [primaryColor, secondaryColor, botName, logo, placeholder, errorMessage, embedded, tooltipText, isEnabled, loginUrl]);

  // Container ref for theming
  const containerRef = useRef<HTMLDivElement>(null);
  const themeColors: ThemeColors = useThemeColors(containerRef, settings.general);

  // Update header based on login state
  useUpdateHeader(isEnabled, containerRef);

  // Apply theme colors as CSS variables and footer settings
  useChatBotSettings({ settings, themeColors, footerText, footerLink });

  // Create Q&A flow directly from simple props - no intermediate layers!
  const flow = useMemo(() => {
    const qaFlow = createQAFlow({
      endpoint: qaEndpoint,
      ratingEndpoint: ratingEndpoint,
      apiKey: apiKey,
      sessionId,
      enabled: isEnabled,
      loginUrl: loginUrl || defaultValues.loginUrl
    });

    // Configure start step based on enabled state
    const startStep = {
      message: welcomeMessage,
      transition: { duration: 0 },
      path: "qa_loop"
    };

    return {
      start: startStep,
      ...qaFlow
    };
  }, [apiKey, qaEndpoint, ratingEndpoint, welcomeMessage, sessionId, isEnabled, loginUrl]);

  // default react-chatbotify plugins
  const plugins = useMemo(() => {
    return [HtmlRenderer(), MarkdownRenderer(), InputValidator()];
  }, []);

  // Apply hooks
  useFocusableSendButton();
  useKeyboardNavigation();

  // Listen for chat window toggle events
  useEffect(() => {
    if (!embedded && onOpenChange) {
      const handleChatWindowToggle = (event: any) => {
        const newOpenState = event.data.newState;
        onOpenChange(newOpenState);
      };
      window.addEventListener('rcb-toggle-chat-window', handleChatWindowToggle);

      return () => {
        window.removeEventListener('rcb-toggle-chat-window', handleChatWindowToggle);
      };
    }
  }, [embedded, onOpenChange]);

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
            currentOpen={open || false}
            enabled={isEnabled}
            onSetEnabled={setIsEnabled}
          />
          <ChatBot
            key={`chatbot-${sessionId}-${isEnabled}`}
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

