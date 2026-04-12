/**
 * Cloudflare Turnstile widget loader and renderer.
 *
 * Lazy-loads the Turnstile script on first use, then renders the widget
 * into a container element in the chat. Returns the verification token
 * via a Promise so the caller can resend the original query.
 */

import { logger } from './logger';

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

/**
 * Load the Turnstile script if not already loaded.
 * Safe to call multiple times — only loads once.
 */
export function loadTurnstileScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      logger.turnstile('Script loaded');
      resolve();
    };
    script.onerror = () => {
      scriptLoading = null;
      reject(new Error('Failed to load Turnstile script'));
    };
    document.head.appendChild(script);
  });

  return scriptLoading;
}

