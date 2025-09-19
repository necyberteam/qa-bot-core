/**
 * QA Bot Core - Configuration Exports
 *
 * Central export point for all configuration, types, and constants.
 * This replaces the old complex api-reference.js system.
 */

// Type definitions
export type {
  QABotProps,
  QABotBusinessProps,
  EndpointsConfig,
  BrandingConfig,
  MessagesConfig,
  ReactChatbotifyFlow,
  ReactChatbotifyPlugin,
  ReactChatbotifyStyles,
  SimpleUsageProps,
  ThemeColors,
  BotControllerHandle,
  TooltipMode,
  FlowPath
} from './types';

// Types from defaults
export type {
  ReactChatbotifySettings,
  BusinessConfig
} from './defaults';

// Flow types from types.ts
export type {
  CustomFlows,
  FlowStep,
  FlowParams
} from './types';

// Defaults and configurations
export {
  defaultReactChatbotifySettings,
  defaultWelcomeMessage,
  defaultBusinessConfig
} from './defaults';

// Constants
export { CONSTANTS } from './types';

