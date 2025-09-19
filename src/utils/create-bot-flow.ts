// src/utils/create-bot-flow.ts
import { createQAFlow } from './flows/qa-flow';
import type { BusinessConfig, CustomFlows, ReactChatbotifyFlow } from '../config';

interface CreateBotFlowParams {
  config: BusinessConfig;
  customFlows?: CustomFlows;
  sessionId: string;
}

/**
 * Creates the bot conversation flow
 * Supports both basic Q&A and custom flows via plugins
 */
export function createBotFlow({
  config,
  customFlows,
  sessionId
}: CreateBotFlowParams): ReactChatbotifyFlow {
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
        message: config.flows.welcomeMessage,
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
      message: config.flows.welcomeMessage,
      path: "qa_loop"
    }
  };
}