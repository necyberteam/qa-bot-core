import React, { useEffect } from 'react';
import type { Settings } from 'react-chatbotify';
import type { ThemeColors } from '../config';

interface UseChatBotSettingsProps {
  settings: Settings;
  themeColors: ThemeColors;
}

/**
 * Custom hook to apply theme colors and accessibility enhancements
 * Note: Footer is configured in QABot's useMemo to avoid flashing default footer
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

    // Note: audio, emoji, fileAttachment, and notification settings
    // are now in fixedReactChatbotifySettings (config.ts) to ensure
    // they're applied before first render

    settings.event = {
      rcbToggleChatWindow: true,
      rcbPreProcessBlock: true,
      rcbPostProcessBlock: true
    };
  }, [settings]);
};

export default useChatBotSettings;