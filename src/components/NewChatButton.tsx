import React from 'react';
import { useFlow, useTextArea, useMessages } from 'react-chatbotify';
import RefreshIcon from './icons/RefreshIcon';
import { useSession } from '../contexts/SessionContext';

const NewChatButton: React.FC = () => {
  const { restartFlow } = useFlow();
  const { setTextAreaValue } = useTextArea();
  const { messages } = useMessages();
  const { resetSession, clearResettingFlag } = useSession();

  const handleNewChat = async () => {
    console.log('[NewChatButton] handleNewChat clicked');
    console.log('[NewChatButton] Messages BEFORE restartFlow:', messages.length, messages);

    // Reset session ID (sets resetting flag to true)
    resetSession();
    console.log('[NewChatButton] resetSession() called');

    // Clear the input field immediately
    await setTextAreaValue('');

    // Restart the flow
    console.log('[NewChatButton] About to call restartFlow()');
    await restartFlow();
    console.log('[NewChatButton] restartFlow() completed');

    // Wait a bit for any queued messages to be processed and blocked
    setTimeout(() => {
      clearResettingFlag();
      console.log('[NewChatButton] clearResettingFlag() called (100ms after restartFlow)');
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