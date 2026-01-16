// src/components/SessionMessageTracker.tsx
import { useEffect, useCallback } from 'react';
import { RcbPreInjectMessageEvent } from 'react-chatbotify';
import { useSession } from '../contexts/SessionContext';
import { addMessageToSession } from '../utils/session-utils';

/**
 * Invisible component that tags each chat message with its session ID.
 *
 * Problem: React-Chatbotify stores all messages in a flat list with no session
 * boundaries. When a user has multiple conversations, there's no way to know
 * which messages belong to which conversation.
 *
 * Solution: This component listens for every message injection and records
 * "message X belongs to session Y" in localStorage. The history dropdown
 * uses this mapping to show conversations separately.
 *
 * Must be rendered inside ChatBotProvider.
 */
const SessionMessageTracker: React.FC = () => {
  const { getSessionId } = useSession();

  const handlePreInjectMessage = useCallback((event: Event) => {
    const rcbEvent = event as unknown as RcbPreInjectMessageEvent;
    // RcbPreInjectMessageEvent.data has shape: { message: Message }
    const message = rcbEvent.data?.message;

    if (!message?.id) {
      return;
    }

    const sessionId = getSessionId();
    const content = typeof message.content === 'string' ? message.content : undefined;
    const sender = message.sender;

    addMessageToSession(sessionId, message.id, content, sender);
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
