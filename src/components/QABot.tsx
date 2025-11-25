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
import { generateSessionId } from '../utils/session-utils';
import { SessionProvider } from '../contexts/SessionContext';
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
    loginUrl,

    // Custom flow extension
    customFlow
  } = props;

  // Instance ID - stable across component lifecycle (for unique React keys)
  const instanceIdRef = useRef<string>(`bot_${Math.random().toString(36).substr(2, 9)}`);

  // Session management - use ref so session can change without recreating flow
  const sessionIdRef = useRef<string>(generateSessionId());

  // Track when we're resetting to prevent message replay
  const isResettingRef = useRef<boolean>(false);

  // Create a stable getter object that the flow will capture
  const sessionGetter = useRef({
    getSessionId: () => sessionIdRef.current,
    isResetting: () => isResettingRef.current
  });

  // Function to reset session ID (creates a new unique session)
  const resetSession = () => {
    isResettingRef.current = true;
    sessionIdRef.current = generateSessionId();
  };

  // Function to clear the resetting flag (called after flow restart completes)
  const clearResettingFlag = () => {
    isResettingRef.current = false;
  };

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
  // Note: sessionGetter is stable, so flow won't recreate when session changes
  const flow = useMemo((): Flow => {
    const qaFlow = createQAFlow({
      endpoint: qaEndpoint,
      ratingEndpoint: ratingEndpoint,
      apiKey: apiKey,
      sessionId: sessionGetter.current.getSessionId,
      isResetting: sessionGetter.current.isResetting,
      enabled: isEnabled,
      loginUrl: loginUrl || defaultValues.loginUrl
    });

    // Configure start step based on enabled state
    const startStep = {
      message: welcomeMessage,
      transition: { duration: 0 },
      path: "qa_loop"
    };

    // Merge flows: start + Q&A flow + custom flow (if provided)
    return {
      start: startStep,
      ...qaFlow,
      ...(customFlow || {})
    };
  }, [apiKey, qaEndpoint, ratingEndpoint, welcomeMessage, isEnabled, loginUrl, customFlow]);

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
      aria-label={botName || defaultValues.botName}
    >
      <SessionProvider resetSession={resetSession} clearResettingFlag={clearResettingFlag}>
        <ChatBotProvider>
          <div>
            <BotController
              ref={ref}
              embedded={settings.general?.embedded || false}
              currentOpen={open || false}
              enabled={isEnabled}
              onSetEnabled={setIsEnabled}
            />
            <ChatBot
              key={`chatbot-${instanceIdRef.current}-${isEnabled}`}
              settings={settings}
              flow={flow}
              plugins={plugins}
            />

            {/* Accessibility regions */}
            <div
              role="status"
              aria-live="polite"
              aria-label="Bot response updates"
              className="sr-only"
              id="bot-live-region"
            />
            <div id="chat-input-help" className="sr-only">
              Type your message and press Enter to send. Use arrow keys to navigate through response options.
            </div>
          </div>
        </ChatBotProvider>
      </SessionProvider>
    </div>
  );
});

QABot.displayName = 'QABot';

export default QABot;

