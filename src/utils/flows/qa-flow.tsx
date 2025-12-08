// src/utils/flows/qa-flow.tsx
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getProcessedText } from '../getProcessedText';
import LoginButton from '../../components/LoginButton';

/**
 * Creates the basic Q&A conversation flow
 * Handles questions, responses, and optional ratings
 *
 * @param {Object} params Configuration
 * @param {string} params.endpoint Q&A API endpoint (required)
 * @param {string} params.ratingEndpoint Rating API endpoint (optional)
 * @param {string} params.apiKey API key for authentication (optional)
 * @param {Function} params.sessionId Function that returns current session ID
 * @param {Function} params.isResetting Function that returns whether we're currently resetting
 * @param {boolean} params.isLoggedIn Whether the user is logged in (required)
 * @param {boolean} params.allowAnonAccess Allow Q&A without login (default: false)
 * @param {string} params.loginUrl Login URL to redirect to (optional)
 * @returns {Object} Q&A flow configuration
 */
export const createQAFlow = ({
  endpoint,
  ratingEndpoint,
  apiKey,
  sessionId: getSessionId,
  isResetting = () => false,
  isLoggedIn,
  allowAnonAccess = false,
  loginUrl = '/login'
}) => {
  // Gate Q&A when user is logged out (unless allowAnonAccess is true)
  if (isLoggedIn === false && !allowAnonAccess) {
    return {
      qa_loop: {
        message: "To ask questions, please log in first.",
        component: <LoginButton loginUrl={loginUrl} />,
        chatDisabled: true,
        path: "qa_loop"
      }
    };
  }

  // Track query ID for feedback
  let feedbackQueryId = null;
  // Track if we've shown a response to the user
  let hasShownResponse = false;

  // Require endpoint to be configured
  if (!endpoint) {
    throw new Error('Q&A endpoint is required');
  }

  return {
    qa_loop: {
      message: async (chatState) => {
        const { userInput } = chatState;

        // Skip processing if we're in reset mode
        if (isResetting && isResetting()) {
          return null;
        }

        // Skip processing if there's no user input (initial transition from start)
        if (!userInput || userInput.trim() === '') {
          return null;
        }

        // Handle feedback if rating endpoint is configured
        if (userInput === "👍 Helpful" || userInput === "👎 Not helpful") {
          if (ratingEndpoint && feedbackQueryId) {
            try {
              const isPositive = userInput === "👍 Helpful";
              const headers = {
                'Content-Type': 'application/json'
              };

              // Add API key if provided
              if (apiKey) {
                headers['X-API-KEY'] = apiKey;
              }

              // Add session tracking if available
              const currentSessionId = getSessionId();
              if (currentSessionId) {
                headers['X-Session-ID'] = currentSessionId;
                headers['X-Query-ID'] = feedbackQueryId;
              }

              await fetch(ratingEndpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  sessionId: currentSessionId,
                  queryId: feedbackQueryId,
                  rating: isPositive ? 1 : 0
                })
              });
            } catch (error) {
              console.error('Error sending feedback:', error);
            }
          }

          return "Thanks for the feedback! Feel free to ask another question.";
        }

        // Process as a question
        try {
          const queryId = uuidv4();
          feedbackQueryId = queryId;

          const headers = {
            'Content-Type': 'application/json'
          };

          // Add optional headers
          if (apiKey) {
            headers['X-API-KEY'] = apiKey;
          }
          const currentSessionId = getSessionId();
          if (currentSessionId) {
            headers['X-Session-ID'] = currentSessionId;
            headers['X-Query-ID'] = queryId;
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              query: userInput
            })
          });

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }

          const body = await response.json();

          // Support different response formats
          const text = body.response || body.answer || body.text || body.message;

          if (!text) {
            throw new Error('Invalid response format from API');
          }

          // Process text (handles markdown, links, etc.)
          const processedText = getProcessedText(text);

          // Inject the response
          await chatState.injectMessage(processedText);

          // Mark that we've shown a response
          hasShownResponse = true;

          // Add guidance message after a short delay
          setTimeout(async () => {
            await chatState.injectMessage("Feel free to ask another question.");
          }, 100);

          return null;
        } catch (error) {
          console.error('Error in Q&A flow:', error);
          return "I apologize, but I'm having trouble processing your question. Please try again later.";
        }
      },

      // Show rating options only if rating endpoint is configured and we've shown a response
      options: (chatState) => {
        // Don't show options if we're resetting
        if (isResetting && isResetting()) {
          return [];
        }

        // Don't show options after feedback
        if (chatState.userInput === "👍 Helpful" || chatState.userInput === "👎 Not helpful") {
          return [];
        }

        // Only show rating options if endpoint is configured AND we've shown a response
        return (ratingEndpoint && hasShownResponse) ? ["👍 Helpful", "👎 Not helpful"] : [];
      },

      renderMarkdown: ["BOT"],
      chatDisabled: false,
      path: "qa_loop"
    }
  };
};