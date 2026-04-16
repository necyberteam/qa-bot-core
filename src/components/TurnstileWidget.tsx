import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { loadTurnstileScript } from '../utils/turnstile';
import { logger } from '../utils/logger';

export type TurnstileWidgetFailureReason =
  | 'widget_error'
  | 'token_expired'
  | 'script_load_failed'
  | 'api_unavailable'
  | 'user_cancelled';

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (reason: TurnstileWidgetFailureReason, errorCode?: string) => void;
  loginUrl?: string;
}

/**
 * Renders a Cloudflare Turnstile widget as an accessible modal dialog.
 *
 * Portalled to document.body because Cloudflare's Turnstile script crashes
 * inside Shadow DOM. Handles both the challenge and the error/retry state
 * within the modal so the user always has a clear path forward.
 */
const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ siteKey, onVerify, onError, loginUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const widgetIdRef = useRef<string | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const failureReasonRef = useRef<TurnstileWidgetFailureReason>('widget_error');
  const cloudflareErrorCodeRef = useRef<string | null>(null);

  const hasLogin = loginUrl && loginUrl !== '/login';

  // Remove the Turnstile widget instance to avoid stray iframes/listeners
  const removeTurnstileWidget = useCallback(() => {
    const turnstile = (window as any).turnstile;
    if (widgetIdRef.current && turnstile?.remove) {
      try { turnstile.remove(widgetIdRef.current); } catch { /* best effort */ }
      widgetIdRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    removeTurnstileWidget();
    // If the widget already failed, report the actual failure reason.
    // Otherwise the user is cancelling a pending challenge.
    if (failed) {
      onError?.(failureReasonRef.current, cloudflareErrorCodeRef.current ?? undefined);
    } else {
      onError?.('user_cancelled');
    }
  }, [onError, removeTurnstileWidget, failed]);

  // Clean up widget on unmount
  useEffect(() => {
    return () => { removeTurnstileWidget(); };
  }, [removeTurnstileWidget]);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handleDismiss]);

  useEffect(() => {
    if (renderedRef.current || !containerRef.current || failed) return;
    renderedRef.current = true;

    loadTurnstileScript()
      .then(() => {
        const turnstile = (window as any).turnstile;
        if (!turnstile || !containerRef.current) {
          logger.error('Turnstile API not available after script load');
          failureReasonRef.current = 'api_unavailable';
          setFailed(true);
          return;
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            logger.turnstile('Visible challenge completed');
            onVerify(token);
          },
          'error-callback': (errorCode: string) => {
            logger.error('Turnstile challenge failed:', errorCode);
            cloudflareErrorCodeRef.current = errorCode;
            failureReasonRef.current = 'widget_error';
            removeTurnstileWidget();
            setFailed(true);
            // Return true to tell Turnstile we've handled the error.
            // Without this, Turnstile auto-retries indefinitely and the
            // widget appears stuck ("Turnstile Widget seem to have hung").
            return true;
          },
          'expired-callback': () => {
            logger.error('Turnstile token expired');
            failureReasonRef.current = 'token_expired';
            removeTurnstileWidget();
            setFailed(true);
          },
        });
      })
      .catch((err) => {
        logger.error('Failed to load Turnstile script:', err);
        failureReasonRef.current = 'script_load_failed';
        setFailed(true);
      });
  }, [siteKey, onVerify, failed]);

  const modal = (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999998,
        }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qa-bot-turnstile-label"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999999,
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          maxWidth: '90vw',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <span id="qa-bot-turnstile-label" className="sr-only" style={{
          position: 'absolute', width: '1px', height: '1px',
          overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap',
        }}>
          Verification challenge
        </span>

        {failed ? (
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
            {retryCount === 0 ? (
              <p style={{ margin: '0 0 16px 0' }}>
                Verification failed. You can try again
                {hasLogin && (
                  <>
                    , or{' '}
                    <a href={loginUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--primaryColor, #107180)', fontWeight: 'bold' }}>
                      log in
                    </a>{' '}
                    to skip verification
                  </>
                )}
                .
              </p>
            ) : (
              <>
                <p style={{ margin: '0 0 8px 0' }}>
                  Verification is still not working. This can be caused by browser
                  extensions (ad blockers, privacy tools) or VPN connections.
                </p>
                <p style={{ margin: '0 0 16px 0' }}>
                  Try disabling extensions, using a private/incognito window,
                  {hasLogin && (
                    <>
                      {' '}<a href={loginUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--primaryColor, #107180)', fontWeight: 'bold' }}>
                        logging in
                      </a>,
                    </>
                  )}
                  {' '}or using a different browser.
                </p>
              </>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  removeTurnstileWidget();
                  renderedRef.current = false;
                  setRetryCount(c => c + 1);
                  setFailed(false);
                }}
                style={{
                  padding: '8px 16px',
                  background: 'var(--primaryColor, #107180)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Try again
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                style={{
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div ref={containerRef} style={{ borderRadius: '8px', overflow: 'hidden' }} />
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </>
  );

  return createPortal(modal, document.body);
};

export default TurnstileWidget;
