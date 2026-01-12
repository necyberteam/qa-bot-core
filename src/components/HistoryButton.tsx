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
  const { getHistoryMessages, showChatHistory } = useChatHistory();

  const handleClick = () => {
    const historyMessages = getHistoryMessages();
    const historyName = getHistoryName(historyMessages);

    // Log the simplified version
    console.log('[HistoryButton] Simplified messages:', simplifiedMessages(historyMessages));

    // Log the RAW messages from RCB - see all fields
    console.log('[HistoryButton] RAW messages from getHistoryMessages():', historyMessages);

    // Log what's in localStorage - look for RCB keys
    console.log('[HistoryButton] All localStorage keys:', Object.keys(localStorage));

    // Try to find and log RCB-specific localStorage data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('rcb') || key.includes('chat') || key.includes('history') || key.includes('message')) {
        try {
          const value = localStorage.getItem(key);
          console.log(`[HistoryButton] localStorage["${key}"]:`, value ? JSON.parse(value) : value);
        } catch {
          console.log(`[HistoryButton] localStorage["${key}"]:`, localStorage.getItem(key));
        }
      }
    });
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
