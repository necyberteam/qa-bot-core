// src/utils/flows/qa-flow.tsx
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getProcessedText } from '../getProcessedText';
import LoginButton from '../../components/LoginButton';
import TurnstileWidget from '../../components/TurnstileWidget';
import { logger, isDebugEnabled } from '../logger';
import type { AnalyticsEventInput } from '../../contexts/AnalyticsContext';

/**
 * Configuration for creating a Q&A flow
 */
export interface CreateQAFlowParams {
  /** Q&A API endpoint (required) */
  endpoint: string;
  /** Rating API endpoint for RAG responses (optional) */
  ratingEndpoint?: string;
  /** Rating API endpoint for agent responses (optional) */
  agentRatingEndpoint?: string;
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
  /**
   * The acting user's identifier.
   * @deprecated Identity is now determined server-side from the JWT cookie.
   * This prop is ignored — retained only for backward compatibility during transition.
   */
  actingUser?: string;
  /** Enriched analytics tracker (adds common fields automatically) */
  trackEvent?: (event: AnalyticsEventInput) => void;
  /**
   * Returns the current silent Turnstile token (from useTurnstile hook).
   * When available, attached to every request so the backend can verify
   * without prompting.  When null, the backend's free-query allowance
   * applies, and the visible challenge is the fallback.
   */
  getTurnstileToken?: () => string | null;
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
 * Wrapper that reads the Turnstile site key from mutable state at render time.
 * The flow's component JSX is captured once at definition, but the site key
 * isn't known until the API returns requires_turnstile. This wrapper bridges
 * that gap by accepting a getter function.
 */
interface TurnstileState {
  siteKey: string | null;
  token: string | null;
  pendingQuery: any;
  needsChallenge: boolean;
}

interface TurnstileWidgetWrapperProps {
  getState: () => TurnstileState;
  onResubmit: (token: string) => Promise<void>;
  trackEvent?: (event: AnalyticsEventInput) => void;
  loginUrl: string;
}

function TurnstileWidgetWrapper({ getState, onResubmit, trackEvent, loginUrl }: TurnstileWidgetWrapperProps) {
  const [failed, setFailed] = React.useState(false);
  const state = getState();

  // If the invisible widget hasn't produced a token within 5s, give up and show guidance
  React.useEffect(() => {
    if (!state.siteKey) return;
    setFailed(false);
    const timer = setTimeout(() => {
      if (!state.token) {
        setFailed(true);
        trackEvent?.({ type: 'chatbot_turnstile_error' });
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [state.siteKey]);

  if (!state.siteKey) return null;

  if (failed) {
    return (
      <div style={{ padding: '8px 16px', fontSize: '14px', lineHeight: '1.5' }}>
        <p style={{ margin: 0 }}>
          I'm having trouble verifying your session. Please try{' '}
          <a href="" onClick={(e) => { e.preventDefault(); window.location.reload(); }}
            style={{ color: 'var(--primaryColor, #107180)' }}>
            refreshing the page
          </a>
          , or{' '}
          <a href={loginUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--primaryColor, #107180)', fontWeight: 'bold' }}>
            log in
          </a>{' '}
          to continue.
        </p>
      </div>
    );
  }

  return (
    <TurnstileWidget
      siteKey={state.siteKey}
      onVerify={(token) => {
        state.token = token;
        trackEvent?.({ type: 'chatbot_turnstile_completed' });
        onResubmit(token);
      }}
      onError={() => {
        // Don't immediately show permanent error — Cloudflare may auto-refresh
        // the widget. Only surface the error via the 5s timeout above.
        logger.warn('Turnstile widget error (may auto-recover)');
      }}
    />
  );
}

/**
 * Creates the basic Q&A conversation flow
 * Handles questions, responses, and optional ratings
 */
export const createQAFlow = ({
  endpoint,
  ratingEndpoint,
  agentRatingEndpoint,
  apiKey,
  sessionId: getSessionId,
  isResetting = () => false,
  isLoggedIn,
  allowAnonAccess = false,
  loginUrl = '/login',
  actingUser,
  trackEvent,
  getTurnstileToken,
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
  let feedbackQueryId: string | null = null;
  // Track response metadata for rating routing
  let lastRatingTarget: string | null = null;
  let lastIsFinalResponse = false;

  // Turnstile state — shared between qa_loop and turnstile_challenge steps.
  // Uses a mutable object so the TurnstileWidget component can read the
  // current siteKey at render time (not the value captured at flow creation).
  const turnstileState = {
    siteKey: null as string | null,
    token: null as string | null,
    pendingQuery: null as { query: string; sessionId: string; queryId: string } | null,
    needsChallenge: false,
  };

  // Mutable ref to injectMessage — captured from chatState on each message call
  // so the Turnstile onVerify callback can inject responses into the chat.
  let injectMessage: ((msg: string) => Promise<void>) | null = null;

  // Auto-resubmit after visible Turnstile challenge completes.
  // Called from TurnstileWidgetWrapper's onVerify — fetches the pending query
  // with the new token and injects the response directly into the chat.
  const handleTurnstileResubmit = async (token: string) => {
    if (!turnstileState.pendingQuery || !injectMessage) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['X-API-KEY'] = apiKey;

      const retryResponse = await fetch(endpoint, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          query: turnstileState.pendingQuery.query,
          session_id: turnstileState.pendingQuery.sessionId,
          question_id: turnstileState.pendingQuery.queryId,
          turnstile_token: token,
        }),
      });

      const savedQueryId = turnstileState.pendingQuery.queryId;

      if (!retryResponse.ok) {
        throw new Error(`API returned ${retryResponse.status} after Turnstile`);
      }

      const body = await retryResponse.json();

      // If challenged again, keep pendingQuery intact so the user can re-solve
      if (body.requires_turnstile) {
        turnstileState.siteKey = body.site_key;
        turnstileState.token = null;
        await injectMessage("Still verifying — please complete the challenge again.");
        return;
      }

      // Clear Turnstile state — challenge is resolved
      turnstileState.token = null;
      turnstileState.pendingQuery = null;
      turnstileState.needsChallenge = false;
      turnstileState.siteKey = null;

      const text = body.response || body.answer || body.text || body.message;
      if (!text) throw new Error('Invalid response format from API');

      const retryMetadata = body.metadata || {};
      lastRatingTarget = retryMetadata.rating_target || null;
      lastIsFinalResponse = retryMetadata.is_final_response === true;
      feedbackQueryId = savedQueryId;

      const processedText = getProcessedText(text);
      const metadataText = isDebugEnabled() ? buildMetadataText(body) : '';
      const fullContent = metadataText ? `${processedText}\n\n${metadataText}` : processedText;

      await injectMessage(fullContent);

      trackEvent?.({
        type: 'chatbot_answer_received',
        queryId: savedQueryId,
        success: true,
        responseLength: text.length,
      });
    } catch (error) {
      logger.error('Error resubmitting after Turnstile:', error);
      turnstileState.token = null;
      turnstileState.pendingQuery = null;
      turnstileState.needsChallenge = false;
      turnstileState.siteKey = null;
      await injectMessage?.("I had trouble processing your question after verification. Please try again.");
    }
  };

  // Require endpoint to be configured
  if (!endpoint) {
    throw new Error('Q&A endpoint is required');
  }

  return {
    qa_loop: {
      message: async (chatState) => {
        // Capture injectMessage so the Turnstile auto-resubmit callback can use it
        injectMessage = chatState.injectMessage.bind(chatState);

        const { userInput } = chatState;
        if (isResetting && isResetting()) {
          return null;
        }

        // Skip processing if there's no user input (initial transition from start)
        if (!userInput || userInput.trim() === '') {
          return null;
        }

        // Handle feedback — route to correct endpoint based on rating_target
        if (userInput === "👍 Helpful" || userInput === "👎 Not helpful") {
          if (feedbackQueryId) {
            const isPositive = userInput === "👍 Helpful";
            const targetEndpoint = lastRatingTarget === 'agent' ? agentRatingEndpoint : ratingEndpoint;

            if (targetEndpoint) {
              try {
                const headers: Record<string, string> = {
                  'Content-Type': 'application/json'
                };

                if (apiKey) {
                  headers['X-API-KEY'] = apiKey;
                }

                const currentSessionId = getSessionId();
                if (currentSessionId) {
                  headers['X-Session-ID'] = currentSessionId;
                  headers['X-Query-ID'] = feedbackQueryId;
                }

                // Agent endpoint uses different payload shape
                const body = lastRatingTarget === 'agent'
                  ? {
                      query_id: feedbackQueryId,
                      rating: isPositive ? 'helpful' : 'not_helpful',
                      session_id: currentSessionId,
                    }
                  : {
                      sessionId: currentSessionId,
                      queryId: feedbackQueryId,
                      rating: isPositive ? 1 : 0,
                    };

                await fetch(targetEndpoint, {
                  method: 'POST',
                  headers,
                  credentials: 'include',
                  body: JSON.stringify(body)
                });

                trackEvent?.({
                  type: 'chatbot_rating_sent',
                  queryId: feedbackQueryId,
                  rating: isPositive ? 'helpful' : 'not_helpful'
                });
              } catch (error) {
                logger.error('Error sending feedback:', error);
              }
            }
          }

          return "Thanks for the feedback!";
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
          // Build request body — include silent Turnstile token when available
          const requestBody: Record<string, string> = {
            query: userInput,
            session_id: currentSessionId,
            question_id: queryId
          };
          const silentToken = getTurnstileToken?.();
          if (silentToken) {
            requestBody.turnstile_token = silentToken;
          }

          // Log the session ID being sent
          logger.session('SENT to API', {
            session_id: currentSessionId,
            question_id: queryId
          });

          // Capture timestamp before fetch for response time calculation
          const requestStartTime = Date.now();

          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(requestBody)
          });

          // Calculate response time (network + server processing)
          const responseTimeMs = Date.now() - requestStartTime;

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }

          const body = await response.json();

          // Turnstile challenge — store state and let path redirect to the challenge step
          if (body.requires_turnstile) {
            trackEvent?.({ type: 'chatbot_turnstile_shown', queryId });
            turnstileState.siteKey = body.site_key;
            turnstileState.pendingQuery = { query: userInput, sessionId: currentSessionId, queryId };
            turnstileState.needsChallenge = true;
            return "One moment — verifying your session…";
          }

          // Support different response formats
          const text = body.response || body.answer || body.text || body.message;

          if (!text) {
            throw new Error('Invalid response format from API');
          }

          // Capture response metadata for rating routing
          const metadata = body.metadata || {};
          lastRatingTarget = metadata.rating_target || null;
          lastIsFinalResponse = metadata.is_final_response === true;

          // Process text (handles markdown, links, etc.)
          const processedText = getProcessedText(text);

          // Build metadata text (only shown when QA_BOT_DEBUG is enabled)
          const metadataText = isDebugEnabled() ? buildMetadataText(body) : '';
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

      // Show rating options only after final responses that have a valid rating target
      options: (chatState) => {
        // Don't show options if we're resetting
        if (isResetting && isResetting()) {
          return [];
        }

        // Don't show options after feedback
        if (chatState.userInput === "👍 Helpful" || chatState.userInput === "👎 Not helpful") {
          return [];
        }

        // Don't show options during Turnstile challenge
        if (turnstileState.needsChallenge) {
          return [];
        }

        // Only show rating buttons when:
        // 1. The response was marked as final (is_final_response: true)
        // 2. rating_target is set (not null)
        // 3. A rating endpoint exists for the response's rating_target
        if (!lastIsFinalResponse || !lastRatingTarget) {
          return [];
        }

        const hasEndpoint = lastRatingTarget === 'agent'
          ? !!agentRatingEndpoint
          : !!ratingEndpoint;

        return hasEndpoint ? ["👍 Helpful", "👎 Not helpful"] : [];
      },

      renderMarkdown: ["BOT"],
      chatDisabled: false,
      component: (
        <TurnstileWidgetWrapper
          getState={() => turnstileState}
          onResubmit={handleTurnstileResubmit}
          trackEvent={trackEvent}
          loginUrl={loginUrl}
        />
      ),
      path: "qa_loop"
    }
  };
};
