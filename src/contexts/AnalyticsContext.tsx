import React, { createContext, useContext, useRef } from 'react';
import type { QABotAnalyticsEvent } from '../config';

/**
 * Event type without auto-populated fields.
 * Call sites provide event-specific data; common fields are added by the enriched tracker.
 */
export type AnalyticsEventInput = Omit<QABotAnalyticsEvent, 'timestamp' | 'sessionId' | 'pageUrl' | 'isEmbedded'>;

interface AnalyticsContextValue {
  trackEvent: (event: AnalyticsEventInput) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  /**
   * Pre-enriched track function that adds common fields (timestamp, sessionId, pageUrl, isEmbedded).
   * Created by QABot and passed down to ensure consistent enrichment across all call sites.
   */
  trackEvent: (event: AnalyticsEventInput) => void;
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  trackEvent,
  children
}) => {
  // Use ref to keep stable reference while allowing updates
  const trackEventRef = useRef(trackEvent);
  trackEventRef.current = trackEvent;

  return (
    <AnalyticsContext.Provider value={{ trackEvent: (event) => trackEventRef.current(event) }}>
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
