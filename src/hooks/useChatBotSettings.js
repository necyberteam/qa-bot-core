import React, { useMemo } from 'react';
import { DEFAULT_CONFIG } from '../config/constants';
import NewChatButton from '../components/NewChatButton';
import { Button } from "react-chatbotify";

/**
 * Custom hook to generate ChatBot settings
 * @param {Object} params - Parameters for generating settings
 * @param {Object} params.themeColors - Theme colors from useThemeColors
 * @param {boolean} params.embedded - Whether the bot is embedded
 * @param {boolean} params.defaultOpen - Default open state (for uncontrolled components only)
 * @param {string} params.loginUrl - URL to navigate to for login
 * @returns {Object} ChatBot settings object
 */
const useChatBotSettings = ({
  themeColors,
  embedded,
  defaultOpen,
  enabled,
  loginUrl
}) => {
  const isBotLoggedIn = enabled;

  const settings = useMemo(() => {
    return {
      general: {
        ...themeColors,
        embedded: embedded,
        // Enhanced accessibility
        primaryColor: themeColors.primaryColor,
        fontFamily: 'Arial, sans-serif',
        // Ensure good contrast ratios
        secondaryColor: themeColors.secondaryColor
      },
      header: {
        title: (
          <div key="header-title">
            <h1 className="sr-only">{DEFAULT_CONFIG.BRANDING.TITLE}</h1>
            <span aria-hidden="true">{DEFAULT_CONFIG.BRANDING.TITLE}</span>
          </div>
        ),
        avatar: DEFAULT_CONFIG.BRANDING.AVATAR_URL,
        buttons: [
          Button.CLOSE_CHAT_BUTTON
        ]
      },
      chatWindow: {
        defaultOpen: embedded ? true : defaultOpen || false,
      },
      device: {
        desktopEnabled: true,
        mobileEnabled: true,
        applyMobileOptimizations: false
      },
      chatInput: {
        enabledPlaceholderText: 'Type your question here...',
        disabledPlaceholderText: '',
        disabled: false,
        allowNewline: true,
        sendButtonStyle: { display: 'flex' },
        characterLimit: 1000,
        sendButtonAriaLabel: 'Send message',
        showCharacterCount: false,
        // Enhanced accessibility
        ariaLabel: 'Chat input area',
        ariaDescribedBy: 'chat-input-help'
      },
      chatHistory: {
        disabled: false
      },
      botBubble: {
        simulateStream: true,
        streamSpeed: 10,
        allowNewline: true,
        dangerouslySetInnerHTML: true,
        renderHtml: true,
        // Enhanced accessibility
        ariaLabel: 'Bot response',
        role: 'log'
      },
      chatButton: {
        icon: DEFAULT_CONFIG.BRANDING.AVATAR_URL,
      },
      audio: {
        disabled: true,
      },
      emoji: {
        disabled: true,
      },
      fileAttachment: {
        disabled: true,
      },
      notification: {
        disabled: true,
      },
      footer: {
        text: (<div key="footer-text"><a href="configure.me!">Make me dynamic!</a>.</div>),
        buttons: [
          <NewChatButton key="new-chat-button" />
        ]
      },
      event: {
        rcbToggleChatWindow: true // Enable chat window toggle event
      }
    };
  }, [themeColors, embedded, defaultOpen, isBotLoggedIn, loginUrl]);

  return settings;
};

export default useChatBotSettings;