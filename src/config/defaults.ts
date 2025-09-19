/**
 * Default react-chatbotify settings for QA Bot Core
 *
 * These are sensible defaults that provide a good out-of-the-box experience.
 * Users can override any of these by passing their own settings object.
 */

import React from 'react';
import type { CustomFlows } from './types';

export interface ReactChatbotifySettings {
  general?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    embedded?: boolean;
    showHeader?: boolean;
    showFooter?: boolean;
  };
  device?: {
    desktopEnabled?: boolean;
    mobileEnabled?: boolean;
    applyMobileOptimizations?: boolean;
  };
  chatHistory?: {
    disabled?: boolean;
  };
  chatButton?: {
    icon?: string;
  };
  audio?: {
    disabled?: boolean;
  };
  emoji?: {
    disabled?: boolean;
  };
  fileAttachment?: {
    disabled?: boolean;
  };
  notification?: {
    disabled?: boolean;
  };
  footer?: {
    text?: React.ReactElement;
    buttons?: React.ReactElement[];
  };
  event?: {
    rcbToggleChatWindow?: boolean;
  };
  tooltip?: {
    mode?: 'CLOSE' | 'ALWAYS' | 'NEVER';
    text?: string;
  };
  header?: {
    title?: string | React.ReactElement;
    showAvatar?: boolean;
    avatar?: string;
    buttons?: any[];
  };
  chatInput?: {
    disabled?: boolean;
    enabledPlaceholderText?: string;
    disabledPlaceholderText?: string;
    characterLimit?: number;
    showCharacterCount?: boolean;
    allowNewline?: boolean;
    sendButtonStyle?: any;
    sendButtonAriaLabel?: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
  };
  chatWindow?: {
    defaultOpen?: boolean;
    showScrollbar?: boolean;
  };
  botBubble?: {
    simulateStream?: boolean;
    streamSpeed?: number;
    showAvatar?: boolean;
    allowNewline?: boolean;
    dangerouslySetInnerHTML?: boolean;
    renderHtml?: boolean;
    ariaLabel?: string;
    role?: string;
  };
  userBubble?: {
    showAvatar?: boolean;
  };
}

export const defaultReactChatbotifySettings: ReactChatbotifySettings = {
  general: {
    primaryColor: '#1a5b6e',
    secondaryColor: '#107180',
    fontFamily: 'Arial, sans-serif',
    embedded: false,
    showHeader: true,
    showFooter: true
  },

  tooltip: {
    mode: 'CLOSE',
    text: 'Ask me a question!'
  },

  header: {
    title: 'Q&A Bot',
    showAvatar: true,
    avatar: '/default-chat-icon.svg'
  },

  chatInput: {
    disabled: false,
    enabledPlaceholderText: 'Type your question here...',
    disabledPlaceholderText: 'Chat is currently unavailable',
    characterLimit: 1000,
    showCharacterCount: false,
    allowNewline: true
  },

  chatWindow: {
    defaultOpen: false,
    showScrollbar: false
  },

  botBubble: {
    simulateStream: true,
    streamSpeed: 10,
    showAvatar: false
  },

  userBubble: {
    showAvatar: false
  }
};

/**
 * Default welcome message for Q&A flows
 */
export const defaultWelcomeMessage: string = 'Hello! What can I help you with?';

/**
 * Default business configuration structure
 * Used internally for flow generation and business logic
 */
export interface BusinessConfig {
  core: {
    endpoints: {
      qa?: string;
      rating?: string;
    };
    auth: {
      apiKey?: string;
    };
  };
  user: {
    email?: string;
    name?: string;
    loginUrl?: string;
  };
  flows: {
    welcomeMessage: string;
    customFlows?: CustomFlows;
  };
}

// Re-export the types from types.ts for compatibility
export type { FlowStep, FlowParams } from './types';

export const defaultBusinessConfig: BusinessConfig = {
  core: {
    endpoints: {},
    auth: {}
  },
  user: {},
  flows: {
    welcomeMessage: defaultWelcomeMessage,
    customFlows: undefined
  }
};

