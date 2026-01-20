// src/components/HistoryButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useMessages, useTextArea } from 'react-chatbotify';
import { getAllSessions, getSessionMessages } from '../utils/session-utils';
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
  const { toggleTextAreaDisabled } = useTextArea();
  const { setSessionId, getSessionId } = useSession();

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

    // 1. Get the stored messages for this session from our localStorage
    // Filter out any empty messages (legacy data or edge cases)
    const storedMessages = getSessionMessages(sessionId).filter(m => m.content?.trim());
    logger.history('Stored messages from our localStorage', {
      count: storedMessages.length,
      ids: storedMessages.map(m => m.id.slice(-8))
    });

    // 2. Convert our stored messages to RCB Message format
    const rcbMessages = storedMessages.map(m => ({
      id: m.id,
      content: m.content,
      sender: m.sender.toUpperCase(),
      type: m.type || 'string',
      timestamp: new Date(m.timestamp).toISOString()
    }));

    // 3. Replace displayed messages with the session's messages
    replaceMessages(rcbMessages);
    logger.history('replaceMessages called', { count: rcbMessages.length });

    // 4. Fix markdown links in rendered messages (see fix-markdown-links.ts for explanation)
    fixMarkdownLinksInDom();

    // 5. Update the active session ID so new messages go to this session
    setSessionId(sessionId);
    logger.history('Session ID updated', { newSession: sessionId.slice(-12) });

    // 6. Enable the chat input - restored sessions continue Q&A, not picking from a menu
    toggleTextAreaDisabled(false);
    logger.history('Chat input enabled after restore');

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

export default HistoryButton;
