import { DEFAULT_CONFIG } from '../config/constants';

/**
 * Handles bot errors and returns user-friendly error messages
 * @param {Object|Error} error - The error object or response
 * @returns {string} User-friendly error message
 */
export const handleBotError = (error) => {
  console.error('Bot error:', error);

  // If it's an error object with a message property
  if (error && error.error) {
    return DEFAULT_CONFIG.ERRORS.API_UNAVAILABLE;
  }

  // If it's a standard Error object
  if (error instanceof Error) {
    return DEFAULT_CONFIG.ERRORS.API_UNAVAILABLE;
  }

  // Default fallback
  return DEFAULT_CONFIG.ERRORS.API_UNAVAILABLE;
};