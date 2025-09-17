import React, { useMemo } from 'react';
import NewChatButton from '../components/NewChatButton';
import { Button } from "react-chatbotify";
import { defaultConfig } from '../config/schema';

/**
 * Custom hook to generate ChatBot settings
 * @param {Object} params - Parameters for generating settings
 * @param {Object} params.themeColors - Theme colors from useThemeColors
 * @param {boolean} params.embedded - Whether the bot is embedded
 * @param {boolean} params.enabled - Whether the bot is enabled
 * @param {string} params.loginUrl - URL to navigate to for login
 * @returns {Object} ChatBot settings object
 */
const useChatBotSettings = ({
  themeColors,
  embedded,
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
            <h1 className="sr-only">{defaultConfig.content.branding.title}</h1>
            <span aria-hidden="true">{defaultConfig.content.branding.title}</span>
          </div>
        ),
        avatar: defaultConfig.content.branding.avatarUrl,
        buttons: [
          Button.CLOSE_CHAT_BUTTON
        ]
      },
      chatWindow: {
        defaultOpen: embedded ? true : false,
      },
      device: {
        desktopEnabled: true,
        mobileEnabled: true,
        applyMobileOptimizations: false
      },
      chatInput: {
        enabledPlaceholderText: defaultConfig.content.messages.placeholder,
        disabledPlaceholderText: '',
        disabled: false,
        allowNewline: true,
        sendButtonStyle: { display: 'flex' },
        characterLimit: defaultConfig.behavior.chat.characterLimit,
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
        streamSpeed: defaultConfig.behavior.chat.streamSpeed,
        allowNewline: true,
        dangerouslySetInnerHTML: true,
        renderHtml: true,
        // Enhanced accessibility
        ariaLabel: 'Bot response',
        role: 'log'
      },
      chatButton: {
        icon: defaultConfig.content.branding.avatarUrl,
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
  }, [themeColors, embedded, enabled, loginUrl]);

  return settings;
};

export default useChatBotSettings;