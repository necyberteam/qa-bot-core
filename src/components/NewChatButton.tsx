import React from 'react';
import { useFlow, useTextArea, useMessages } from 'react-chatbotify';
import RefreshIcon from './icons/RefreshIcon';
import { useSession } from '../contexts/SessionContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

const NewChatButton: React.FC = () => {
  const { restartFlow } = useFlow();
  const { setTextAreaValue } = useTextArea();
  const { messages } = useMessages();
  const { resetSession, clearResettingFlag } = useSession();
  const { trackEvent } = useAnalytics();

  const handleNewChat = async () => {
    // Track new chat event before reset (captures the old session being ended)
    trackEvent({ type: 'qa_new_chat_started' });

    // Reset session ID (sets resetting flag to true)
    resetSession();

    // Clear the input field immediately
    await setTextAreaValue('');

    // Restart the flow
    await restartFlow();

    // Wait a bit for any queued messages to be processed and blocked
    setTimeout(() => {
      clearResettingFlag();
    }, 100);
  };

  return (
    <button
      onClick={handleNewChat}
      tabIndex={0}
      aria-label="New chat conversation"
      style={{
        backgroundColor: 'var(--primaryColor, #107180)',
        border: 'none',
        color: '#ffffff',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: '500',
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
        (e.target as HTMLButtonElement).style.backgroundColor = 'var(--secondaryColor, #0d5f6b)';
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
        (e.target as HTMLButtonElement).style.backgroundColor = 'var(--primaryColor, #107180)';
      }}
    >
      <RefreshIcon width={16} height={16} />
      New Chat
    </button>
  );
};

export default NewChatButton;