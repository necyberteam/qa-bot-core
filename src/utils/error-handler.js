import { defaultConfig } from '../config/schema';

/**
 * Handles bot errors and returns user-friendly error messages
 * @param {Object|Error} error - The error object or response
 * @returns {string} User-friendly error message
 */
export const handleBotError = (error) => {
  console.error('Bot error:', error);

  // Return the configured error message for all error types
  return defaultConfig.content.messages.error;
};