/**
 * Logger utility for QA Bot Core
 *
 * Controls debug logging via localStorage:
 * - QA_BOT_DEBUG: Set to 'true' to enable debug logging and version info
 *
 * Usage for consumers:
 *   localStorage.setItem('QA_BOT_DEBUG', 'true');  // Enable debug logs + version
 */

// localStorage key
const DEBUG_KEY = 'QA_BOT_DEBUG';

// Check if running in browser with localStorage
const hasLocalStorage = typeof window !== 'undefined' && window.localStorage;

// Track if version has been logged this session (prevents duplicate logs)
let versionLogged = false;

function isDebugEnabled(): boolean {
  return hasLocalStorage && localStorage.getItem(DEBUG_KEY) === 'true';
}

// Styled prefixes for different log types
const styles = {
  session: 'background: #1a5b6e; color: white; padding: 2px 6px; border-radius: 3px;',
  meta: 'background: #6b5b95; color: white; padding: 2px 6px; border-radius: 3px;',
  response: 'background: #2d6a4f; color: white; padding: 2px 6px; border-radius: 3px;',
};

export const logger = {
  // Debug logs - only when DEBUG enabled
  debug: (...args: unknown[]) => {
    if (isDebugEnabled()) {
      console.log(...args);
    }
  },

  // Session logging - styled, only when DEBUG enabled
  session: (action: string, ...args: unknown[]) => {
    if (isDebugEnabled()) {
      console.log(`%c[Session]%c ${action}`, styles.session, '', ...args);
    }
  },

  // Response/API logging - styled, only when DEBUG enabled
  response: (label: string, ...args: unknown[]) => {
    if (isDebugEnabled()) {
      console.log(`%c[Response]%c ${label}`, styles.response, '', ...args);
    }
  },

  // Metadata logging - styled, only when DEBUG enabled
  meta: (label: string, ...args: unknown[]) => {
    if (isDebugEnabled()) {
      console.log(`%c[Metadata]%c ${label}`, styles.meta, '', ...args);
    }
  },

  // Warnings - always show (these indicate potential issues)
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },

  // Errors - always show (these are actual problems)
  error: (...args: unknown[]) => {
    console.error(...args);
  },

  // Version info - shown when debug enabled, runs once per page load
  version: (version: string) => {
    if (!versionLogged && isDebugEnabled()) {
      console.info(`@snf/qa-bot-core v${version}`);
      versionLogged = true;
    }
  }
};
