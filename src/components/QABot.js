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
import { mergeConfig } from '../config/schema';
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
 * @param {Object} props.config - Bot configuration object
 * @param {string} props.config.core.endpoints.qa - Q&A endpoint (required)
 * @param {string} props.config.core.endpoints.rating - Rating endpoint (optional)
 * @param {string} props.apiKey - API key (prop override)
 * @param {boolean} props.embedded - Embed mode (prop override)
 * @param {boolean} props.enabled - Bot enabled state (prop override)
 * @param {boolean} props.open - Chat open state (prop override)
 * @param {Function} props.onOpenChange - Open state callback (prop override)
 * @param {string} props.welcome - Welcome message (prop override)
 * @param {string} props.userEmail - User email (prop override)
 * @param {string} props.userName - User name (prop override)
 * @param {string} props.loginUrl - Login URL (prop override)
 * @param {Array} props.headerComponents - Custom header components (prop override)
 * @param {Object} props.customFlows - Custom conversation flows (prop override)
 */
const QABot = React.forwardRef((props, ref) => {
  const { config: userConfig = {}, ...propOverrides } = props;

  // Merge configuration using the unified schema (3-layer precedence)
  const config = mergeConfig(userConfig, propOverrides);

  // Session management
  const sessionIdRef = useRef(getOrCreateSessionId());
  const sessionId = sessionIdRef.current;

  // Container ref for theming
  const containerRef = useRef(null);
  const themeColors = useThemeColors(containerRef, config.appearance.theme);

  // Generate base settings with hooks
  const baseSettings = useChatBotSettings({
    themeColors,
    embedded: config.ui.display.embedded,
    enabled: config.ui.display.enabled,
    loginUrl: config.user.loginUrl
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
        title: config.content.branding.title,
        avatar: config.content.branding.avatarUrl,
        buttons: config.appearance.customization.headerComponents || baseSettings.header.buttons
      },
      chatInput: {
        ...baseSettings.chatInput,
        enabledPlaceholderText: config.content.messages.placeholder
      }
    };
  }, [baseSettings, themeColors, config]);

  // Create flow with config
  const flow = useMemo(() => {
    return createBotFlow({
      config,
      customFlows: config.behavior.flows.customFlows,
      sessionId
    });
  }, [config, sessionId]);

  // Plugins
  const plugins = [HtmlRenderer(), MarkdownRenderer(), InputValidator()];

  // Apply hooks
  useFocusableSendButton();
  useKeyboardNavigation();

  // Handle open state changes
  useEffect(() => {
    if (!config.ui.display.embedded && config.ui.state.onOpenChange) {
      const handleToggle = (event) => {
        const newState = event.data.newState;
        config.ui.state.onOpenChange(newState);
      };

      window.addEventListener('rcb-toggle-chat-window', handleToggle);
      return () => window.removeEventListener('rcb-toggle-chat-window', handleToggle);
    }
  }, [config.ui.display.embedded, config.ui.state.onOpenChange]);

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
      className={`qa-bot ${config.ui.display.embedded ? "embedded-qa-bot" : ""}`}
      ref={containerRef}
      role="region"
      aria-label="Q&A Bot"
    >
      <ChatBotProvider>
        <main role="main" aria-label="Chat interface">
          <BotController
            ref={ref}
            embedded={config.ui.display.embedded}
            currentOpen={config.ui.state.open}
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