import React, { useEffect, useRef } from 'react';
import { loadTurnstileScript } from '../utils/turnstile';
import { logger } from '../utils/logger';

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
}

/**
 * Renders a Cloudflare Turnstile widget inline in the chat.
 * Used as a `component` on a flow step (same pattern as LoginButton).
 */
const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ siteKey, onVerify, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (renderedRef.current || !containerRef.current) return;
    renderedRef.current = true;

    loadTurnstileScript()
      .then(() => {
        const turnstile = (window as any).turnstile;
        if (!turnstile || !containerRef.current) {
          logger.error('Turnstile API not available after script load');
          onError?.();
          return;
        }

        turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            logger.turnstile('Visible challenge completed');
            onVerify(token);
          },
          'error-callback': () => {
            logger.error('Turnstile challenge failed');
            onError?.();
          },
          'expired-callback': () => {
            logger.error('Turnstile token expired');
            onError?.();
          },
        });
      })
      .catch((err) => {
        logger.error('Failed to load Turnstile script:', err);
        onError?.();
      });
  }, [siteKey, onVerify, onError]);

  return (
    <div style={{ padding: '8px 16px' }}>
      <div ref={containerRef} />
    </div>
  );
};

export default TurnstileWidget;
