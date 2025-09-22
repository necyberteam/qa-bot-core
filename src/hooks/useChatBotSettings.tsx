import React, { useEffect } from 'react';
import NewChatButton from '../components/NewChatButton';
import { Button } from "react-chatbotify";
import type { Settings } from 'react-chatbotify';
import type { ThemeColors } from '../config';

interface UseChatBotSettingsProps {
  settings: Settings;
  themeColors: ThemeColors;
  footerText?: string;
  footerLink?: string;
}

/**
 * Custom hook to apply theme colors and accessibility enhancements
 */
const useChatBotSettings = ({ settings, themeColors, footerText, footerLink }: UseChatBotSettingsProps): void => {
  // Apply theme colors as CSS variables
  useEffect(() => {
    if (themeColors) {
      Object.entries(themeColors).forEach(([key, value]) => {
        if (value) {
          document.documentElement.style.setProperty(`--${key}`, value);
        }
      });

      // Force react-chatbotify header to use our colors
      if (themeColors.primaryColor) {
        document.documentElement.style.setProperty('--rcb-header-background', themeColors.primaryColor);
      }
      if (themeColors.secondaryColor) {
        document.documentElement.style.setProperty('--rcb-header-background-hover', themeColors.secondaryColor);
      }
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

    // Note: Many accessibility properties we wanted are not supported by react-chatbotify's Settings interface
    // Keeping this section minimal to match the actual API

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

    // Dynamic footer based on props
    const footerTextElement = footerText
      ? (footerLink
          ? <a href={footerLink} target="_blank" rel="noopener noreferrer" key="footer-link">{footerText}</a>
          : <span key="footer-text">{footerText}</span>)
      : null;

    settings.footer = {
      text: footerTextElement,
      buttons: [<NewChatButton key="new-chat-button" />]
    };

    settings.event = {
      rcbToggleChatWindow: true
    };
  }, [settings, footerText, footerLink]);
};

export default useChatBotSettings;