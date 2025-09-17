// src/utils/flows/qa-flow.js
import { v4 as uuidv4 } from 'uuid';
import { getProcessedText } from '../getProcessedText';

/**
 * Creates the basic Q&A conversation flow
 * Handles questions, responses, and optional ratings
 *
 * @param {Object} params Configuration
 * @param {string} params.endpoint Q&A API endpoint (required)
 * @param {string} params.ratingEndpoint Rating API endpoint (optional)
 * @param {string} params.apiKey API key for authentication (optional)
 * @param {string} params.sessionId Session ID for tracking
 * @returns {Object} Q&A flow configuration
 */
export const createQAFlow = ({
  endpoint,
  ratingEndpoint,
  apiKey,
  sessionId
}) => {
  // Track query ID for feedback
  let feedbackQueryId = null;

  // Validate required endpoint
  if (!endpoint) {
    return {
      qa_error: {
        message: "Q&A endpoint not configured. Please provide an endpoint in the configuration.",
        path: "start"
      }
    };
  }

  return {
    qa_loop: {
      message: async (chatState) => {
        const { userInput } = chatState;

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
              if (sessionId) {
                headers['X-Session-ID'] = sessionId;
                headers['X-Query-ID'] = feedbackQueryId;
              }

              await fetch(ratingEndpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  sessionId,
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
          if (sessionId) {
            headers['X-Session-ID'] = sessionId;
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

          // Add guidance message after a short delay
          setTimeout(async () => {
            await chatState.injectMessage("Ask another question or start a new chat.");
          }, 100);

          return null;
        } catch (error) {
          console.error('Error in Q&A flow:', error);
          return "I apologize, but I'm having trouble processing your question. Please try again later.";
        }
      },

      // Show rating options only if rating endpoint is configured
      options: (chatState) => {
        // Don't show options after feedback
        if (chatState.userInput === "👍 Helpful" || chatState.userInput === "👎 Not helpful") {
          return [];
        }

        // Only show rating options if endpoint is configured
        return ratingEndpoint ? ["👍 Helpful", "👎 Not helpful"] : [];
      },

      renderMarkdown: ["BOT"],
      chatDisabled: false,
      path: "qa_loop"
    }
  };
};