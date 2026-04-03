/**
 * useTurnstile — silent background Turnstile verification.
 *
 * Renders an invisible Cloudflare Turnstile widget on mount.  Most legitimate
 * users get a token automatically (no UI).  The token is exposed so the
 * qa-flow can attach it to every request.
 *
 * If silent verification fails (Cloudflare deems the visitor suspicious),
 * `status` becomes 'failed' and the qa-flow falls back to the existing
 * visible-challenge path (backend returns requires_turnstile, widget shown
 * in chat).
 *
 * Turnstile tokens expire after ~300 s.  The widget's built-in
 * `refresh-expired: auto` handles re-issuing before expiry.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadTurnstileScript } from '../utils/turnstile';
import { logger } from '../utils/logger';

export type TurnstileStatus = 'idle' | 'loading' | 'verified' | 'failed';

export interface UseTurnstileResult {
  /** Current Turnstile token, or null if not yet verified / failed. */
  token: string | null;
  /** Lifecycle status of the silent verification. */
  status: TurnstileStatus;
}

/**
 * @param siteKey  Cloudflare Turnstile site key.  Pass `undefined` or empty
 *                 string to disable (hook becomes a no-op).
 */
export function useTurnstile(siteKey: string | undefined): UseTurnstileResult {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TurnstileStatus>('idle');

  // Refs to avoid re-rendering the widget on every render cycle
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Cleanup helper — remove the hidden container from the DOM
  const cleanup = useCallback(() => {
    const turnstile = (window as any).turnstile;
    if (widgetIdRef.current && turnstile?.remove) {
      try { turnstile.remove(widgetIdRef.current); } catch { /* best effort */ }
      widgetIdRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.remove();
      containerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (!siteKey) {
      setStatus('idle');
      setToken(null);
      return;
    }

    setStatus('loading');

    // Create a hidden container for the invisible widget
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '0';
    container.style.height = '0';
    container.style.overflow = 'hidden';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
    containerRef.current = container;

    loadTurnstileScript()
      .then(() => {
        if (!mountedRef.current) return;

        const turnstile = (window as any).turnstile;
        if (!turnstile || !containerRef.current) {
          logger.error('Turnstile API not available for silent verification');
          setStatus('failed');
          return;
        }

        const id = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          // 'execution: render' starts verification immediately on render.
          // For managed/invisible widget types this is silent.
          execution: 'render',
          // Auto-refresh before the token expires (~300s)
          'refresh-expired': 'auto',
          callback: (t: string) => {
            if (!mountedRef.current) return;
            logger.turnstile('Silent verification succeeded');
            setToken(t);
            setStatus('verified');
          },
          'error-callback': () => {
            if (!mountedRef.current) return;
            logger.error('Turnstile silent verification failed');
            setStatus('failed');
          },
          'expired-callback': () => {
            if (!mountedRef.current) return;
            // Token expired before auto-refresh kicked in — clear it.
            // The auto-refresh should issue a new one shortly.
            logger.turnstile('Token expired, awaiting refresh');
            setToken(null);
            setStatus('loading');
          },
        });

        widgetIdRef.current = id;
      })
      .catch((err) => {
        if (!mountedRef.current) return;
        logger.error('Failed to load Turnstile script for silent verification:', err);
        setStatus('failed');
      });

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [siteKey, cleanup]);

  return { token, status };
}
