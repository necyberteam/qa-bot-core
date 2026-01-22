// src/components/SessionMessageTracker.tsx
import { useEffect, useCallback } from 'react';
import { RcbPreInjectMessageEvent } from 'react-chatbotify';
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
 * Solution: This component listens for message injection events and stores
 * the message content in our own localStorage. The history dropdown
 * restores sessions directly from our storage, not RCB's.
 *
 * Note: react-chatbotify wraps all messages (including plain strings) in JSX
 * before firing events. We use extractTextFromJsx() to recover the text content
 * from bot messages so they appear in restored sessions.
 *
 * IMPORTANT: For custom flow messages to be tracked, use the withHistory()
 * helper function. See utils/with-history.ts for details.
 *
 * Deduplication is handled by session-utils (checks message ID).
 *
 * Must be rendered inside ChatBotProvider.
 */
const SessionMessageTracker: React.FC = () => {
  const { getSessionId } = useSession();

  const handlePreInjectMessage = useCallback((event: Event) => {
    const rcbEvent = event as unknown as RcbPreInjectMessageEvent;
    const message = rcbEvent.data?.message;

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

    // Log for debugging when enabled
    logger.message('TRACKED', {
      id: message.id,
      sender,
      content: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    });

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

  useEffect(() => {
    window.addEventListener('rcb-pre-inject-message', handlePreInjectMessage);

    return () => {
      window.removeEventListener('rcb-pre-inject-message', handlePreInjectMessage);
    };
  }, [handlePreInjectMessage]);

  // This component renders nothing - it just listens
  return null;
};

export default SessionMessageTracker;
