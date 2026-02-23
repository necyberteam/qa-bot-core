import type { Settings, Flow } from 'react-chatbotify';

/**
 * Analytics event types fired by qa-bot-core
 */
export type QABotAnalyticsEventType =
  | 'chatbot_open'
  | 'chatbot_close'
  | 'chatbot_new_chat'
  | 'chatbot_question_sent'
  | 'chatbot_answer_received'
  | 'chatbot_answer_error'
  | 'chatbot_rating_sent'
  | 'chatbot_login_prompt_shown';

/**
 * Analytics event payload
 * 
 * Common fields (auto-populated for all events):
 * - timestamp: When the event occurred
 * - sessionId: Current chat session ID
 * - pageUrl: URL where the bot is displayed
 * - isEmbedded: Whether bot is in embedded mode (true) or floating/widget mode (false)
 * 
 * Event-specific fields:
 * - chatbot_open: (common fields only)
 * - chatbot_close: messageCount, durationMs
 * - chatbot_new_chat: previousMessageCount
 * - chatbot_question_sent: queryId, questionLength
 * - chatbot_answer_received: queryId, responseTimeMs, success, responseLength, hasMetadata
 * - chatbot_answer_error: queryId, errorType
 * - chatbot_rating_sent: queryId, rating
 * - chatbot_login_prompt_shown: (common fields only)
 */
export interface QABotAnalyticsEvent {
  type: QABotAnalyticsEventType;
  timestamp: number;
  sessionId?: string;
  // Common context fields (auto-populated)
  pageUrl?: string;
  isEmbedded?: boolean;
  // Query tracking
  queryId?: string;
  // chatbot_question_sent
  questionLength?: number;
  // chatbot_answer_received
  responseTimeMs?: number;
  success?: boolean;
  responseLength?: number;
  hasMetadata?: boolean;
  // chatbot_answer_error
  errorType?: string;
  // chatbot_rating_sent
  rating?: 'helpful' | 'not_helpful';
  // chatbot_close
  messageCount?: number;
  durationMs?: number;
  // chatbot_new_chat
  previousMessageCount?: number;
}

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

  /**
   * Callback fired when trackable events occur.
   * Use this to wire up analytics (GTM, GA4, etc.)
   *
   * @example
   * onAnalyticsEvent={(event) => {
   *   window.dataLayer?.push({ event: event.type, ...event });
   * }}
   */
  onAnalyticsEvent?: (event: QABotAnalyticsEvent) => void;
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
  fileAttachment: { disabled: true }
  // Note: We don't use RCB's chatHistory - we store messages ourselves in session-utils.ts
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

