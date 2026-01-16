// src/components/HistoryButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useMessages, useChatHistory } from 'react-chatbotify';
import { getAllSessions, getSessionMessageIds } from '../utils/session-utils';
import { fixMarkdownLinksInDom } from '../utils/fix-markdown-links';
import { useSession } from '../contexts/SessionContext';
import { logger } from '../utils/logger';

/**
 * Format a date string for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

/**
 * HistoryButton Component
 *
 * A button that displays saved chat history when clicked.
 * Shows in the header when user is logged in.
 *
 * @returns Rendered history button
 */
const HistoryButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ReturnType<typeof getAllSessions>>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { replaceMessages } = useMessages();
  const { getHistoryMessages } = useChatHistory();
  const { setSessionId, getSessionId, setRestoring } = useSession();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClick = () => {
    if (!isOpen) {
      // Refresh sessions when opening
      setSessions(getAllSessions());
    }
    setIsOpen(!isOpen);
  };

  const handleSelectSession = (sessionId: string) => {
    const currentSessionId = getSessionId();

    logger.history('RESTORE requested', {
      targetSession: sessionId.slice(-12),
      currentSession: currentSessionId?.slice(-12)
    });

    // Don't reload if already on this session
    if (sessionId === currentSessionId) {
      logger.history('RESTORE skipped - already on this session');
      setIsOpen(false);
      return;
    }

    // 1. Get the message IDs for this session from our store
    const sessionMessageIds = getSessionMessageIds(sessionId);
    logger.history('Session message IDs from localStorage', {
      count: sessionMessageIds.length,
      ids: sessionMessageIds.map(id => id.slice(-8))
    });

    // 2. Get all messages from RCB's history
    const allHistoryMessages = getHistoryMessages();
    logger.history('RCB history messages', {
      count: allHistoryMessages.length,
      ids: allHistoryMessages.map(msg => msg.id?.slice(-8))
    });

    // 3. Filter to only messages belonging to this session
    // Also skip rating option messages (thumbs up/down) - they're not useful in history
    const sessionMessages = allHistoryMessages.filter(msg =>
      sessionMessageIds.includes(msg.id) &&
      !(typeof msg.content === 'string' && msg.content.includes('rcb-options-container'))
    );
    logger.history('Filtered messages for session', {
      count: sessionMessages.length,
      ids: sessionMessages.map(msg => msg.id?.slice(-8))
    });

    // 4. Replace displayed messages with the session's messages
    // Set restoring flag to prevent re-tracking these messages as new
    setRestoring(true);
    replaceMessages(sessionMessages);
    logger.history('replaceMessages called');
    // Clear flag after a tick to allow RCB to finish injecting
    setTimeout(() => setRestoring(false), 0);

    // 5. Fix markdown links in rendered messages (see fix-markdown-links.ts for explanation)
    fixMarkdownLinksInDom();

    // 6. Update the active session ID so new messages go to this session
    setSessionId(sessionId);
    logger.history('Session ID updated', { newSession: sessionId.slice(-12) });

    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        className="history-button"
        onClick={handleClick}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: 'var(--primaryColor, #1a5b6e)',
          marginRight: '18px',
          display: 'flex',
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
        aria-label="View chat history"
        title="View chat history"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          {/* Clock/history icon */}
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: 'auto',
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: 0,
            borderBottom: '3px solid var(--primaryColor, #1a5b6e)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          {sessions.length === 0 ? (
            <div
              style={{
                padding: '12px 16px',
                color: '#666',
                fontSize: '14px',
                textAlign: 'center'
              }}
            >
              No chat history
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.sessionId}
                role="menuitem"
                onClick={() => handleSelectSession(session.sessionId)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  borderBottom: '1px solid #eee'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {session.preview || 'New conversation'}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#888'
                  }}
                >
                  {formatDate(session.startedAt)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export function simplifiedMessages(messages: any[]): any[] {
  // for now, just return the input
  // return messages.map(msg => ({
  //   const sender = msg.sender;
  //   const content = msg.content;
  //   const timestamp = msg.timestamp;
  //   const tags = msg.tags;
  //   return {
  //     sender,
  //     content,
  //     timestamp,
  //     tags
  //   }
  return messages.map(msg => ({
    sender: msg.sender,
    content: getMessageWithoutHTML(msg.content)
  }));
}
/**
 * Removes HTML tags from a message
 * Some messages content looks like this
 * <div class=\"rcb-options-container \"><div class=\"rcb-options\" style=\"cursor:pointer;background-color:#fff\">👍 Helpful</div><div class=\"rcb-options\" style=\"cursor:pointer;background-color:#fff\">👎 Not helpful</div></div>
 * We want to strip this down to just "👍 Helpful 👎 Not helpful"
 */

export function getMessageWithoutHTML(message: string): string {
  return message
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default HistoryButton;
