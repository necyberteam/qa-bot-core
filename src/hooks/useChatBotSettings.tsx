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

    // Note: embedded mode defaultOpen is now set in QABot useMemo to avoid
    // mutating shared settings objects

    // Apply our fixed overrides (not configurable)
    settings.device = {
      desktopEnabled: true,
      mobileEnabled: true,
      applyMobileOptimizations: false
    };

    settings.chatHistory = {
      disabled: true
    };

    settings.chatButton = {
      ...settings.chatButton,
      icon: settings.header?.avatar,
    };

    // Note: audio, emoji, fileAttachment, and notification settings
    // are now in fixedReactChatbotifySettings (config.ts) to ensure
    // they're applied before first render

    settings.event = {
      ...settings.event,
      rcbToggleChatWindow: true
    };
  }, [settings]);
};

export default useChatBotSettings;