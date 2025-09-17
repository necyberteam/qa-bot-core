export const DEFAULT_CONFIG = {
  // Messages (all overridable)
  WELCOME_MESSAGE: 'Hello! What can I help you with?',
  PLACEHOLDER_TEXT: 'Type your question here...',
  ERROR_MESSAGE: 'Unable to process your request. Please try again.',
  DISABLED_MESSAGE: 'Chat is currently unavailable',

  // Theme (all overridable)
  THEME: {
    PRIMARY_COLOR: '#1a5b6e',
    SECONDARY_COLOR: '#107180',
    FONT_FAMILY: 'Arial, sans-serif'
  },

  // Bot behavior
  BEHAVIOR: {
    STREAM_SPEED: 10,
    CHARACTER_LIMIT: 1000,
    SHOW_RATINGS: true
  },

  // Branding
  BRANDING: {
    TITLE: 'Q&A Bot',
    AVATAR_URL: '', // No default logo
    TOOLTIP_TEXT: 'Ask me a question!'
  }
};