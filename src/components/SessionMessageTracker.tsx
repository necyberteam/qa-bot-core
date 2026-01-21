// src/components/SessionMessageTracker.tsx
import { useEffect, useCallback, useRef } from 'react';
import { RcbPreInjectMessageEvent, useMessages } from 'react-chatbotify';
import { useSession } from '../contexts/SessionContext';
import { addMessageToSession } from '../utils/session-utils';
import { extractTextFromJsx } from '../utils/jsx-text-extractor';
import { logger } from '../utils/logger';

/**
 * Invisible component that stores each chat message with its session ID.
 *
 * Problem: React-Chatbotify stores all messages in a flat list with no session
 * boundaries. When a user has multiple conversations, there's no way to know
 * which messages belong to which conversation. Also, RCB's history storage
 * is opaque and unreliable for session restore.
 *
 * Solution: This component watches the messages array via useMessages hook
 * and stores new messages in our own localStorage. The history dropdown
 * restores sessions directly from our storage, not RCB's.
 *
 * Note: react-chatbotify wraps all messages (including plain strings) in JSX.
 * We use extractTextFromJsx() to recover the text content from bot messages.
 *
 * Deduplication is handled by session-utils (checks message ID).
 *
 * Must be rendered inside ChatBotProvider.
 */
const SessionMessageTracker: React.FC = () => {
  const { getSessionId } = useSession();
  const { messages } = useMessages();
  const processedIdsRef = useRef<Set<string>>(new Set());

  const handlePreInjectMessage = useCallback((event: Event) => {
    const rcbEvent = event as unknown as RcbPreInjectMessageEvent;
    const message = rcbEvent.data?.message;

    logger.message('PRE_INJECT', {
      sender: message?.sender,
      type: message?.type,
      content: message?.content
    });

    if (!message?.id) {
      return;
    }

    const sender = message.sender;
    const type = message.type || 'string';

    // Extract text content from message
    // react-chatbotify wraps bot messages in JSX, so we need to extract the text
    let content: string;
    if (typeof message.content === 'string') {
      content = message.content;
    } else {
      content = extractTextFromJsx(message.content);
    }

    // Skip rating option messages - they're not useful in history
    if (content.includes('rcb-options-container')) {
      return;
    }

    // Skip empty messages (e.g., file uploads, rating buttons with no text)
    if (!content.trim()) {
      return;
    }

    const sessionId = getSessionId();
    addMessageToSession(sessionId, message.id, content, sender, type);
  }, [getSessionId]);

  // Handler for block processing events - captures message: property from flow steps
  const handlePreProcessBlock = useCallback((event: Event) => {
    // react-chatbotify uses .data not .detail for event payload
    const rcbEvent = event as unknown as { data?: { block?: Record<string, unknown> } };
    const block = rcbEvent.data?.block;

    // Log the block for debugging (also log raw event to see structure)
    logger.block('PRE_PROCESS', {
      eventType: event.type,
      hasData: !!rcbEvent.data,
      hasBlock: !!block,
      hasMessage: !!block?.message,
      messageType: typeof block?.message,
      hasOptions: !!block?.options,
      hasComponent: !!block?.component,
      block: block
    });
  }, []);

  // Debug: Log ALL rcb events to see what's firing
  useEffect(() => {
    const logAllEvents = (event: Event) => {
      logger.message(event.type.replace('rcb-', '').toUpperCase(), {
        data: (event as any).data
      });
    };

    // Listen to all rcb events for debugging
    const rcbEvents = [
      'rcb-pre-inject-message',
      'rcb-post-inject-message',
      'rcb-change-path',
      'rcb-user-submit-text',
      'rcb-pre-process-block',
      'rcb-post-process-block'
    ];

    rcbEvents.forEach(eventName => {
      window.addEventListener(eventName, logAllEvents);
    });

    // Listen for block processing events
    window.addEventListener('rcb-pre-process-block', handlePreProcessBlock);
    window.addEventListener('rcb-post-process-block', handlePreProcessBlock);

    // Also keep the original handler for actual tracking
    window.addEventListener('rcb-pre-inject-message', handlePreInjectMessage);

    return () => {
      rcbEvents.forEach(eventName => {
        window.removeEventListener(eventName, logAllEvents);
      });
      window.removeEventListener('rcb-pre-process-block', handlePreProcessBlock);
      window.removeEventListener('rcb-post-process-block', handlePreProcessBlock);
      window.removeEventListener('rcb-pre-inject-message', handlePreInjectMessage);
    };
  }, [handlePreInjectMessage, handlePreProcessBlock]);

  // NEW APPROACH: Watch the messages array directly
  // This should catch ALL messages regardless of how they were added
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const sessionId = getSessionId();
    
    messages.forEach((msg) => {
      // Skip if we've already processed this message
      if (!msg.id || processedIdsRef.current.has(msg.id)) {
        return;
      }

      // Extract text content from message
      let content: string;
      if (typeof msg.content === 'string') {
        content = msg.content;
      } else {
        content = extractTextFromJsx(msg.content);
      }

      // Log for debugging - this should show ALL messages
      logger.message('USE_MESSAGES', {
        id: msg.id,
        sender: msg.sender,
        type: msg.type,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : '')
      });

      // Skip rating option messages - they're not useful in history
      if (content.includes('rcb-options-container')) {
        processedIdsRef.current.add(msg.id);
        return;
      }

      // Skip empty messages
      if (!content.trim()) {
        processedIdsRef.current.add(msg.id);
        return;
      }

      // Track in our session storage
      addMessageToSession(sessionId, msg.id, content, msg.sender, msg.type || 'string');
      processedIdsRef.current.add(msg.id);
    });
  }, [messages, getSessionId]);

  // This component renders nothing - it just listens
  return null;
};

export default SessionMessageTracker;
