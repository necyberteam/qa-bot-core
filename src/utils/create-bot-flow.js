// src/utils/create-bot-flow.js
import { createQAFlow } from './flows/qa-flow';

/**
 * Creates the bot conversation flow
 * Supports both basic Q&A and custom flows via plugins
 *
 * @param {Object} params Configuration
 * @param {Object} params.config Complete merged bot configuration
 * @param {Object} params.customFlows Optional custom conversation flows
 * @param {string} params.sessionId Session ID for tracking
 * @returns {Object} Complete flow configuration
 */
export function createBotFlow({
  config,
  customFlows,
  sessionId
}) {
  // Always create the base Q&A flow
  const qaFlow = createQAFlow({
    endpoint: config.core.endpoints.qa,
    ratingEndpoint: config.core.endpoints.rating,
    apiKey: config.core.auth.apiKey,
    sessionId
  });

  // If no custom flows, just return Q&A
  if (!customFlows) {
    return {
      start: {
        message: config.content.messages.welcome,
        path: "qa_loop"
      },
      ...qaFlow
    };
  }

  // If custom flows provided, merge them with Q&A
  // Custom flows can override start point and add new paths
  return {
    ...qaFlow,
    ...customFlows,
    // Use custom start if provided, otherwise default
    start: customFlows.start || {
      message: config.content.messages.welcome,
      path: "qa_loop"
    }
  };
}