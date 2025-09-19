/**
 * QA Bot Core - TypeScript Type Definitions
 *
 * SINGLE SOURCE OF TRUTH for all TypeScript interfaces and types.
 * This replaces the old api-reference.js with proper type definitions.
 */

import type { ReactChatbotifySettings } from './defaults';

// Forward declarations to avoid circular imports
export interface CustomFlows {
  [stepName: string]: FlowStep;
}

export interface FlowStep {
  message: string;
  options?: string[];
  path?: string | ((input: string) => string | Promise<string>);
  paths?: string[];
  function?: (params: FlowParams) => string | Promise<string>;
}

export interface FlowParams {
  userInput: string;
  userEmail?: string;
  userName?: string;
  sessionId: string;
  injectMessage: (message: string) => void;
}

/**
 * ===========================================
 * SIMPLE CONFIGURATION (For out-of-the-box users)
 * ===========================================
 */

export interface BrandingConfig {
  /** Logo/avatar URL for the chatbot header */
  logo?: string;
  /** Primary color for buttons, highlights (e.g., "#007bff") */
  primaryColor?: string;
  /** Secondary color for hover states (e.g., "#0056b3") */
  secondaryColor?: string;
  /** Primary font family for the chat interface */
  primaryFont?: string;
  /** Secondary font family for special text (code, etc.) */
  secondaryFont?: string;
  /** Name displayed in the chat header */
  botName?: string;
}

export interface MessagesConfig {
  /** Initial greeting message from the bot */
  welcome?: string;
  /** Placeholder text in the input field */
  placeholder?: string;
  /** Error message when something goes wrong */
  error?: string;
  /** Message shown when chat is disabled */
  disabled?: string;
}

/**
 * ===========================================
 * BUSINESS LOGIC PROPS (QA Bot Core Specific)
 * ===========================================
 */

export interface EndpointsConfig {
  /** Q&A endpoint URL (e.g., "https://your-api.com/chat") */
  qa: string;
  /** Optional rating/feedback endpoint URL */
  rating?: string;
}

export interface QABotBusinessProps {
  /** API key for authenticating with your Q&A service */
  apiKey?: string;
  /** API endpoints for Q&A and rating services */
  endpoints?: EndpointsConfig;
  /** Current user email for personalization and tracking */
  userEmail?: string;
  /** Current user name for personalization */
  userName?: string;
  /** URL to redirect users for login/authentication */
  loginUrl?: string;
  /** Initial greeting message from the bot */
  welcomeMessage?: string;
  /** Custom conversation flow definitions */
  customFlows?: CustomFlows;
  /** Simple branding configuration */
  branding?: BrandingConfig;
  /** Simple message customization */
  messages?: MessagesConfig;
}

/**
 * ===========================================
 * REACT-CHATBOTIFY INTEGRATION
 * ===========================================
 */

// Note: These should ideally be imported from react-chatbotify when they provide types
export interface ReactChatbotifyFlow {
  [stepName: string]: any; // TODO: Define proper flow type when react-chatbotify provides types
}

// Plugin type matches react-chatbotify expected plugin format
export type ReactChatbotifyPlugin = (...args: unknown[]) => {
  name: string;
  settings?: any;
  styles?: any;
};

// Styles object for react-chatbotify
export interface ReactChatbotifyStyles {
  [key: string]: any; // TODO: Define proper styles type when react-chatbotify provides types
}

/**
 * ===========================================
 * COMPLETE QABOT PROPS
 * ===========================================
 */

export interface QABotProps extends QABotBusinessProps {
  // QABot now only accepts simple props
  // Wrapper developers can implement their own escape hatches by wrapping the component
}

/**
 * ===========================================
 * USAGE TYPES (SIMPLIFIED)
 * ===========================================
 */

export interface SimpleUsageProps {
  apiKey: string;
  endpoints: EndpointsConfig;
  userEmail?: string;
  welcomeMessage?: string;
}

// Wrapper props are now up to wrapper developers to define
// They can access the underlying react-chatbotify components directly

/**
 * ===========================================
 * INTERNAL TYPES
 * ===========================================
 */

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

/**
 * ===========================================
 * CONSTANTS & ENUMS
 * ===========================================
 */

export const CONSTANTS = {
  // Default Values
  DEFAULT_WELCOME_MESSAGE: 'Hello! What can I help you with?',
  DEFAULT_PRIMARY_COLOR: '#1a5b6e',
  DEFAULT_SECONDARY_COLOR: '#107180',
  DEFAULT_FONT_FAMILY: 'Arial, sans-serif',
  DEFAULT_AVATAR: '/default-chat-icon.svg',

  // Limits
  DEFAULT_CHARACTER_LIMIT: 1000,
  DEFAULT_STREAM_SPEED: 10,

  // Mode Options
  TOOLTIP_MODES: ['CLOSE', 'ALWAYS', 'NEVER'] as const,

  // Internal Flow Paths
  FLOW_PATHS: {
    QA_LOOP: 'qa_loop',
    QA_START: 'qa_start',
    RATING: 'rating',
    START: 'start'
  }
} as const;

export type TooltipMode = typeof CONSTANTS.TOOLTIP_MODES[number];
export type FlowPath = typeof CONSTANTS.FLOW_PATHS[keyof typeof CONSTANTS.FLOW_PATHS];

