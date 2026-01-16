import type { Settings, Flow } from 'react-chatbotify';

export interface QABotProps {
  apiKey: string;
  qaEndpoint: string;
  welcomeMessage: string;
  ratingEndpoint?: string;
  primaryColor?: string;
  secondaryColor?: string;
  botName?: string;
  logo?: string;
  placeholder?: string;
  errorMessage?: string;
  embedded?: boolean;
  footerText?: string;
  footerLink?: string;
  tooltipText?: string;
  loginUrl?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the user is currently logged in.
   * - Required: this bot expects login state to be tracked
   * - Controls header icon (login button when false, user icon when true)
   * - When false, Q&A is gated by default (shows login prompt)
   */
  isLoggedIn: boolean;

  /**
   * Allow anonymous access to Q&A even when not logged in.
   * - Default: false (Q&A is gated when isLoggedIn is false)
   * - Set to true to bypass login gating for Q&A
   * - Does not affect custom flows (tickets, security, etc.)
   */
  allowAnonAccess?: boolean;

  /**
   * The acting user's identifier (e.g., email or username).
   * - Sent to the backend in both headers (X-Acting-User) and body (acting_user)
   * - Optional: if not provided, requests will be anonymous
   */
  actingUser?: string;

  /**
   * Custom flow steps to merge with the built-in Q&A flow.
   * Use this to add ticket creation flows, feedback flows, etc.
   * These steps will be merged into the flow object.
   */
  customFlow?: Flow;
}

/**
 * Default values for overridable props
 */
export const defaultValues: {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  botName: string;
  avatar: string;
  placeholder: string;
  errorMessage: string;
  embedded: boolean;
  tooltipText: string;
  loginUrl: string;
} = {
  primaryColor: '#1a5b6e',
  secondaryColor: '#107180',
  fontFamily: 'Arial, sans-serif',
  botName: 'Q&A Bot',
  avatar: '/chat-icon.svg',
  placeholder: 'Type your question here...',
  errorMessage: 'Select an option to continue',
  embedded: false,
  tooltipText: 'Ask me a question!',
  loginUrl: '/login'
};


/**
 * Fixed react-chatbotify settings
 */
export const fixedReactChatbotifySettings: Settings = {
  general: {
    showHeader: true,
    showFooter: true
  },
  tooltip: {
    mode: 'CLOSE'
  },
  chatInput: {
    disabled: false,
    characterLimit: 1000,
    showCharacterCount: false,
    allowNewline: true,
    blockSpam: false
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
  },
  // Disable notification badge on chat button
  notification: {
    disabled: true,
    showCount: false
  },
  // Disable other optional features
  audio: { disabled: true },
  emoji: { disabled: true },
  fileAttachment: { disabled: true },
  // Enable chat history persistence for session restore
  chatHistory: {
    disabled: false,
    storageKey: 'qa_bot_rcb_history',
    maxEntries: 100
  }
};


/* Utility Types */
export interface ThemeColors {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface BotControllerHandle {
  addMessage: (message: string) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setBotEnabled: (enabled: boolean) => void;
}

