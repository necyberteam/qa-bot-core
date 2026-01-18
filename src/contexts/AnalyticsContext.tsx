import React, { createContext, useContext, useCallback, useRef } from 'react';
import type { QABotAnalyticsEvent } from '../config';

interface AnalyticsContextValue {
  trackEvent: (event: Omit<QABotAnalyticsEvent, 'timestamp'>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  onAnalyticsEvent?: (event: QABotAnalyticsEvent) => void;
  getSessionId: () => string | null;
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  onAnalyticsEvent,
  getSessionId,
  children
}) => {
  // Use ref to avoid recreating context value on every render
  const callbackRef = useRef(onAnalyticsEvent);
  callbackRef.current = onAnalyticsEvent;

  const trackEvent = useCallback((event: Omit<QABotAnalyticsEvent, 'timestamp'>) => {
    if (callbackRef.current) {
      callbackRef.current({
        ...event,
        timestamp: Date.now(),
        sessionId: event.sessionId ?? getSessionId() ?? undefined
      });
    }
  }, [getSessionId]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextValue => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    // Return no-op if used outside provider (graceful degradation)
    return { trackEvent: () => {} };
  }
  return context;
};
