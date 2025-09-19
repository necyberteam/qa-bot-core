import React, { useEffect } from 'react';
import NewChatButton from '../components/NewChatButton';
import { Button } from "react-chatbotify";
import type { ReactChatbotifySettings, ThemeColors } from '../config';

interface UseChatBotSettingsProps {
  settings: ReactChatbotifySettings;
  themeColors: ThemeColors;
}

/**
 * Custom hook to apply theme colors and accessibility enhancements
 */
const useChatBotSettings = ({ settings, themeColors }: UseChatBotSettingsProps): void => {
  // Apply theme colors as CSS variables
  useEffect(() => {
    if (themeColors) {
      Object.entries(themeColors).forEach(([key, value]) => {
        if (value) {
          document.documentElement.style.setProperty(`--${key}`, value);
        }
      });
    }
  }, [themeColors]);

  // Apply our accessibility and feature enhancements to the settings object
  useEffect(() => {
    // Add accessibility wrapper for title
    if (settings.header?.title && typeof settings.header.title === 'string') {
      settings.header.title = (
        <div key="header-title">
          <h1 className="sr-only">{settings.header.title}</h1>
          <span aria-hidden="true">{settings.header.title}</span>
        </div>
      );
    }

    // Ensure header buttons default
    if (!settings.header?.buttons) {
      settings.header = settings.header || {};
      settings.header.buttons = [Button.CLOSE_CHAT_BUTTON];
    }

    // Apply embedded mode logic
    if (settings.general?.embedded && settings.chatWindow) {
      settings.chatWindow.defaultOpen = true;
    }

    // Apply our accessibility enhancements
    settings.chatInput = {
      ...settings.chatInput,
      sendButtonStyle: { display: 'flex' },
      sendButtonAriaLabel: 'Send message',
      ariaLabel: 'Chat input area',
      ariaDescribedBy: 'chat-input-help'
    };

    settings.botBubble = {
      ...settings.botBubble,
      allowNewline: true,
      dangerouslySetInnerHTML: true,
      renderHtml: true,
      ariaLabel: 'Bot response',
      role: 'log'
    };

    // Apply our fixed overrides (not configurable)
    settings.device = {
      desktopEnabled: true,
      mobileEnabled: true,
      applyMobileOptimizations: false
    };

    settings.chatHistory = {
      disabled: false
    };

    settings.chatButton = {
      ...settings.chatButton,
      icon: settings.header?.avatar,
    };

    settings.audio = { disabled: true };
    settings.emoji = { disabled: true };
    settings.fileAttachment = { disabled: true };
    settings.notification = { disabled: true };

    settings.footer = {
      text: (<div key="footer-text"><a href="configure.me!">Make me dynamic!</a>.</div>),
      buttons: [<NewChatButton key="new-chat-button" />]
    };

    settings.event = {
      rcbToggleChatWindow: true
    };
  }, [settings]);
};

export default useChatBotSettings;