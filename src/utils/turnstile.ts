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

/**
 * Render the Turnstile widget by appending it to the last bot message bubble.
 *
 * react-chatbotify's injectMessage() escapes HTML, so we can't inject a
 * container div via message content. Instead, we wait for the text message
 * to render, find the last bot message bubble in the DOM, and append the
 * Turnstile widget container directly.
 *
 * @param siteKey - Cloudflare Turnstile site key (from the agent response)
 * @returns The verification token string
 */
export function renderTurnstileWidget(siteKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Wait for the injected message to render, then find the last bot bubble
    setTimeout(() => {
      try {
        const chatBody = document.querySelector('.rcb-chat-body-container');
        if (!chatBody) {
          reject(new Error('Chat body not found'));
          return;
        }

        const bubbles = chatBody.querySelectorAll('.rcb-bot-message');
        const lastBubble = bubbles[bubbles.length - 1];
        if (!lastBubble) {
          reject(new Error('No bot message bubble found'));
          return;
        }

        // Create and append the widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.style.marginTop = '8px';
        lastBubble.appendChild(widgetContainer);

        // Scroll chat to bottom so widget is visible
        const chatContent = chatBody.closest('.rcb-chat-body-container');
        if (chatContent) {
          chatContent.scrollTop = chatContent.scrollHeight;
        }

        const turnstile = (window as any).turnstile;
        if (!turnstile) {
          reject(new Error('Turnstile API not available'));
          return;
        }

        turnstile.render(widgetContainer, {
          sitekey: siteKey,
          callback: (token: string) => {
            logger.turnstile('Verification complete');
            resolve(token);
          },
          'error-callback': () => {
            reject(new Error('Turnstile challenge failed'));
          },
          'expired-callback': () => {
            reject(new Error('Turnstile token expired'));
          },
        });
      } catch (err) {
        reject(err);
      }
    }, 200); // Give react-chatbotify time to render the injected message
  });
}
