// src/components/QABot.tsx
import React, { useRef, useEffect, useMemo, forwardRef } from 'react';
import ChatBot, { ChatBotProvider } from "react-chatbotify";
import HtmlRenderer from "@rcb-plugins/html-renderer";
import MarkdownRenderer from "@rcb-plugins/markdown-renderer";
import InputValidator from "@rcb-plugins/input-validator";
import BotController from './BotController';
import useThemeColors from '../hooks/useThemeColors';
import useChatBotSettings from '../hooks/useChatBotSettings';
import useFocusableSendButton from '../hooks/useFocusableSendButton';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
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
    tooltipText
  } = props;

  // Session management
  const sessionIdRef = useRef<string>(getOrCreateSessionId());
  const sessionId = sessionIdRef.current;

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

    base.header = {
      title: botName || defaultValues.botName,
      showAvatar: true,
      avatar: logo || defaultValues.avatar
    };

    base.chatInput = {
      ...base.chatInput,
      enabledPlaceholderText: placeholder || defaultValues.placeholder,
      disabledPlaceholderText: errorMessage || defaultValues.errorMessage
    };

    base.tooltip = {
      ...base.tooltip,
      text: tooltipText || defaultValues.tooltipText
    };

    return base;
  }, [primaryColor, secondaryColor, botName, logo, placeholder, errorMessage, embedded, tooltipText]);

  // Container ref for theming
  const containerRef = useRef<HTMLDivElement>(null);
  const themeColors: ThemeColors = useThemeColors(containerRef, settings.general);

  // Apply theme colors as CSS variables and footer settings
  useChatBotSettings({ settings, themeColors, footerText, footerLink });

  // Create Q&A flow directly from simple props - no intermediate layers!
  const flow = useMemo(() => {
    const qaFlow = createQAFlow({
      endpoint: qaEndpoint,
      ratingEndpoint: ratingEndpoint,
      apiKey: apiKey,
      sessionId
    });

    // Add simple start step that points to Q&A loop
    return {
      start: {
        message: welcomeMessage,
        path: "qa_loop"
      },
      ...qaFlow
    };
  }, [apiKey, qaEndpoint, ratingEndpoint, welcomeMessage, sessionId]);

  // default react-chatbotify plugins
  const plugins = useMemo(() => {
    return [HtmlRenderer(), MarkdownRenderer(), InputValidator()];
  }, []);

  // Apply hooks
  useFocusableSendButton();
  useKeyboardNavigation();


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

