// src/utils/flows/qa-flow.tsx
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getProcessedText } from '../getProcessedText';
import LoginButton from '../../components/LoginButton';
import { logger } from '../logger';
import type { AnalyticsEventInput } from '../../contexts/AnalyticsContext';

/**
 * Configuration for creating a Q&A flow
 */
export interface CreateQAFlowParams {
  /** Q&A API endpoint (required) */
  endpoint: string;
  /** Rating API endpoint (optional) */
  ratingEndpoint?: string;
  /** API key for authentication (optional) */
  apiKey?: string;
  /** Function that returns current session ID */
  sessionId: () => string | null;
  /** Function that returns whether we're currently resetting */
  isResetting?: () => boolean;
  /** Whether the user is logged in (required) */
  isLoggedIn: boolean;
  /** Allow Q&A without login (default: false) */
  allowAnonAccess?: boolean;
  /** Login URL to redirect to (optional) */
  loginUrl?: string;
  /** The acting user's identifier (optional) */
  actingUser?: string;
  /** Enriched analytics tracker (adds common fields automatically) */
  trackEvent?: (event: AnalyticsEventInput) => void;
}

/**
 * Builds a plain text string for displaying response metadata.
 * Returns empty string if no metadata is present.
 */
function buildMetadataText(body: {
  confidence?: string;
  tools_used?: string[];
  metadata?: Record<string, unknown>;
}): string {
  const { confidence, tools_used, metadata } = body;

  // Skip if no metadata present
  if (!confidence && (!tools_used || tools_used.length === 0)) {
    return '';
  }

  const parts: string[] = [];

  if (confidence) {
    parts.push(`• Confidence: ${confidence}`);
  }

  if (tools_used && tools_used.length > 0) {
    parts.push(`• Tools used: ${tools_used.join(', ')}`);
  }

  // Show agent name from metadata (useful for demo/debugging)
  if (metadata?.agent) {
    parts.push(`• Agent: ${metadata.agent}`);
  }

  return `---\n${parts.join('\n')}`;
}

/**
 * Creates the basic Q&A conversation flow
 * Handles questions, responses, and optional ratings
 */
export const createQAFlow = ({
  endpoint,
  ratingEndpoint,
  apiKey,
  sessionId: getSessionId,
  isResetting = () => false,
  isLoggedIn,
  allowAnonAccess = false,
  loginUrl = '/login',
  actingUser,
  trackEvent
}: CreateQAFlowParams) => {
  // Gate Q&A when user is logged out (unless allowAnonAccess is true)
  if (isLoggedIn === false && !allowAnonAccess) {
    // Track that login prompt was shown
    trackEvent?.({ type: 'chatbot_login_prompt_shown' });

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

              // Track rating event
              trackEvent?.({
                type: 'chatbot_rating_sent',
                queryId: feedbackQueryId,
                rating: isPositive ? 'helpful' : 'not_helpful'
              });
            } catch (error) {
              logger.error('Error sending feedback:', error);
            }
          }

          return "Thanks for the feedback! Feel free to ask another question.";
        }

        // Process as a question
        try {
          const queryId = uuidv4();
          feedbackQueryId = queryId;

          // Track question asked
          trackEvent?.({
            type: 'chatbot_question_sent',
            queryId,
            questionLength: userInput.length
          });

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
          if (actingUser) {
            headers['X-Acting-User'] = actingUser;
          }

          // Build request body
          const requestBody: Record<string, string> = {
            query: userInput,
            session_id: currentSessionId,
            question_id: queryId
          };
          if (actingUser) {
            requestBody.acting_user = actingUser;
          }

          // Log the session ID being sent
          logger.session('SENT to API', {
            session_id: currentSessionId,
            question_id: queryId,
            acting_user: actingUser || '(not set)'
          });

          // Capture timestamp before fetch for response time calculation
          const requestStartTime = Date.now();

          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });

          // Calculate response time (network + server processing)
          const responseTimeMs = Date.now() - requestStartTime;

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

          // Build metadata text (empty string if no metadata present)
          const metadataText = buildMetadataText(body);
          const fullContent = metadataText ? `${processedText}\n\n${metadataText}` : processedText;

          // Inject the response
          await chatState.injectMessage(fullContent);

          // Track response received
          trackEvent?.({
            type: 'chatbot_answer_received',
            queryId,
            responseTimeMs,
            success: true,
            responseLength: text.length,
            hasMetadata: !!metadataText
          });

          // Mark that we've shown a response
          hasShownResponse = true;

          // Add guidance message after a short delay
          setTimeout(async () => {
            await chatState.injectMessage("Feel free to ask another question.");
          }, 100);

          return null;
        } catch (error) {
          logger.error('Error in Q&A flow:', error);

          // Track error event
          trackEvent?.({
            type: 'chatbot_answer_error',
            queryId: feedbackQueryId ?? undefined,
            errorType: error instanceof Error ? error.message : 'unknown'
          });

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