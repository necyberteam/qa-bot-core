/**
 * Helper function to ensure a message is tracked in session history.
 * 
 * Use this wrapper for static messages in custom flows that you want
 * to appear when restoring a session from history.
 * 
 * Why this is needed:
 * react-chatbotify's `message:` property doesn't always fire the
 * injection events that SessionMessageTracker listens to. By using
 * `withHistory()`, the message goes through `params.injectMessage()`
 * which DOES fire the events, ensuring the message is tracked.
 * 
 * @example
 * // In your custom flow:
 * import { withHistory } from '@snf/qa-bot-core';
 * 
 * const myFlow = {
 *   help_ticket: {
 *     // Instead of: message: "What is your help ticket related to?",
 *     message: withHistory("What is your help ticket related to?"),
 *     options: ["Login issue", "Performance", "Other"]
 *   }
 * };
 */
import type { Params } from 'react-chatbotify';

export function withHistory(message: string): (params: Params) => Promise<void> {
  return async (params: Params) => {
    await params.injectMessage(message);
    // Return void - message is already injected, so RCB won't double-render
  };
}
