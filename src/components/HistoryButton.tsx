// src/components/HistoryButton.tsx
import React from 'react';
import { useChatHistory } from 'react-chatbotify';

/**
 * Truncates a string to a maximum length with ellipsis
 */
const truncateName = (text: string, maxLength: number = 15): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
};

/**
 * Gets a display name from chat history based on the first user message
 */
const getHistoryName = (messages: any[]): string => {
  // Find the first user message (sender is "user")
  const firstUserMessage = messages.find(msg => msg.sender === 'user');
  if (firstUserMessage && firstUserMessage.content) {
    return truncateName(firstUserMessage.content);
  }
  return 'Chat History';
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
  const { getHistoryMessages } = useChatHistory();

  const handleClick = () => {
    const historyMessages = getHistoryMessages();
    const historyName = getHistoryName(historyMessages);

    console.log('=== Chat History ===');
    console.log('Name:', historyName);
    console.log('Messages:', historyMessages);
    console.log('====================');
  };

  return (
    <button
      className="history-button"
      onClick={handleClick}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: 'var(--primaryColor, #1a5b6e)',
        marginRight: '5px',
        display: 'flex',
        border: 'none',
        cursor: 'pointer',
        padding: 0
      }}
      aria-label="View chat history"
      title="View chat history"
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
  );
};

export default HistoryButton;
