/**
 * Email validation utility functions
 */

/**
 * Validates email format using a comprehensive regex pattern
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Comprehensive email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email.trim());
};

/**
 * Creates email validation for chat bot flows
 * @param {string} email - The email to validate
 * @returns {Object} - Validation result with success boolean and message string
 */
export const validateEmail = (email) => {
  const trimmedEmail = email?.trim() || '';

  if (!trimmedEmail) {
    return {
      success: false,
      promptContent: "Please enter an email address.",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }

  if (!isValidEmail(trimmedEmail)) {
    return {
      success: false,
      promptContent: "Please enter a valid email address (e.g., user@example.com).",
      promptDuration: 3000,
      promptType: 'error',
      highlightTextArea: true
    };
  }

  return {
    success: true
  };
};