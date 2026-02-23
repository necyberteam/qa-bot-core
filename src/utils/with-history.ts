/**
 * Helper functions to ensure messages are tracked in session history.
 *
 * Why this is needed:
 * react-chatbotify's `message:` property doesn't always fire the
 * injection events that SessionMessageTracker listens to. By using
 * these helpers, messages go through `params.injectMessage()` which
 * DOES fire the events, ensuring they are tracked in session history.
 *
 * Use these for important messages you want restored when loading
 * a previous session (e.g., ticket summaries, API responses with links).
 */
import type { Params } from 'react-chatbotify';

/**
 * Wrap a static string message to ensure it's tracked in history.
 *
 * @example
 * import { withHistory } from '@snf/qa-bot-core';
 *
 * const myFlow = {
 *   step_name: {
 *     message: withHistory("This message will be saved to history"),
 *     options: ["Option 1", "Option 2"]
 *   }
 * };
 */
export function withHistory(message: string): (params: Params) => Promise<void> {
  return async (params: Params) => {
    await params.injectMessage(message);
    // Return void - message is already injected, so RCB won't double-render
  };
}

/**
 * Wrap a dynamic message function to ensure its result is tracked in history.
 * Use this for messages that are computed at runtime (e.g., summaries, API responses).
 *
 * @example
 * import { withHistoryFn } from '@snf/qa-bot-core';
 *
 * const myFlow = {
 *   success_step: {
 *     message: withHistoryFn(() => generateSuccessMessage(result)),
 *     options: ["Back to Menu"]
 *   },
 *   summary_step: {
 *     message: withHistoryFn((params) => {
 *       const data = getFormData();
 *       return `Summary:\nName: ${data.name}\nEmail: ${data.email}`;
 *     }),
 *     options: ["Submit", "Cancel"]
 *   }
 * };
 */
export function withHistoryFn(
  messageFn: (params: Params) => string | Promise<string>
): (params: Params) => Promise<void> {
  return async (params: Params) => {
    const message = await messageFn(params);
    await params.injectMessage(message);
    // Return void - message is already injected, so RCB won't double-render
  };
}
