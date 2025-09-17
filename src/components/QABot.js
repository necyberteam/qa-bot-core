// src/components/QABot.js
import React, { useRef, useState, useEffect, useMemo } from 'react';
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
import { DEFAULT_CONFIG } from '../config/constants';
import { createBotFlow } from '../utils/create-bot-flow';

// Session management
const generateSessionId = () => {
  return `qa_bot_session_${uuidv4()}`;
};

const getOrCreateSessionId = () => {
  // Check if we already have a session ID
  const existingKey = Object.keys(localStorage).find(key => key.startsWith('qa_bot_session_'));
  if (existingKey) {
    return localStorage.getItem(existingKey);
  }

  // Create new session
  const newSessionId = generateSessionId();
  localStorage.setItem(newSessionId, newSessionId);
  return newSessionId;
};

/**
 * Q&A Bot Component
 *
 * @param {Object} props
 * @param {Object} props.config - Bot configuration
 * @param {Object} props.config.endpoints - API endpoints
 * @param {string} props.config.endpoints.qa - Q&A endpoint (required)
 * @param {string} props.config.endpoints.rating - Rating endpoint (optional)
 * @param {string} props.config.apiKey - API key for authentication (optional)
 * @param {Object} props.config.theme - Theme configuration
 * @param {Object} props.config.messages - Custom messages
 * @param {Object} props.config.branding - Branding configuration
 * @param {Object} props.customFlows - Custom conversation flows (optional)
 * @param {boolean} props.open - Whether chat is open (controlled mode)
 * @param {Function} props.onOpenChange - Callback when open state changes
 * @param {boolean} props.embedded - Whether to embed in page vs floating
 * @param {Array} props.headerComponents - Custom header components (optional)
 */
const QABot = React.forwardRef((props, ref) => {
  const {
    config = {},
    customFlows = null,
    open = false,
    onOpenChange,
    embedded = false,
    headerComponents = null,
    // Extract top-level props that might override config
    enabled = true,
    apiKey,
    welcome,
    userEmail,
    userName,
    loginUrl
  } = props;

  // Session management
  const sessionIdRef = useRef(getOrCreateSessionId());
  const sessionId = sessionIdRef.current;

  // Container ref for theming
  const containerRef = useRef(null);
  const themeColors = useThemeColors(containerRef, config.theme);

  // Generate base settings with hooks
  const baseSettings = useChatBotSettings({
    themeColors,
    embedded,
    defaultOpen: false,
    enabled,
    loginUrl
  });

  // Override with config values using useMemo
  const chatBotSettings = useMemo(() => {
    return {
      ...baseSettings,
      general: {
        ...baseSettings.general,
        ...themeColors
      },
      header: {
        ...baseSettings.header,
        title: config.branding?.title || DEFAULT_CONFIG.BRANDING.TITLE,
        avatar: config.branding?.avatarUrl || DEFAULT_CONFIG.BRANDING.AVATAR_URL,
        buttons: headerComponents || baseSettings.header.buttons
      },
      chatInput: {
        ...baseSettings.chatInput,
        enabledPlaceholderText: config.messages?.placeholder || DEFAULT_CONFIG.PLACEHOLDER_TEXT
      }
    };
  }, [baseSettings, themeColors, embedded, config, headerComponents]);

  // Create flow with config
  const flow = useMemo(() => {
    return createBotFlow({
      config,
      customFlows,
      sessionId
    });
  }, [config, customFlows, sessionId]);

  // Plugins
  const plugins = [HtmlRenderer(), MarkdownRenderer(), InputValidator()];

  // Apply hooks
  useFocusableSendButton();
  useKeyboardNavigation();

  // Handle open state changes
  useEffect(() => {
    if (!embedded && onOpenChange) {
      const handleToggle = (event) => {
        const newState = event.data.newState;
        onOpenChange(newState);
      };

      window.addEventListener('rcb-toggle-chat-window', handleToggle);
      return () => window.removeEventListener('rcb-toggle-chat-window', handleToggle);
    }
  }, [embedded, onOpenChange]);

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
      className={`qa-bot ${embedded ? "embedded-qa-bot" : ""}`}
      ref={containerRef}
      role="region"
      aria-label="Q&A Bot"
    >
      <ChatBotProvider>
        <main role="main" aria-label="Chat interface">
          <BotController
            ref={ref}
            embedded={embedded}
            currentOpen={open}
          />
          <ChatBot
            key={`chatbot-${sessionId}`}
            settings={chatBotSettings}
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