import React from 'react';
import { useFlow } from 'react-chatbotify';
import RefreshIcon from './icons/RefreshIcon';
import { useSession } from '../contexts/SessionContext';

const NewChatButton: React.FC = () => {
  const { restartFlow } = useFlow();
  const { resetSession } = useSession();

  const handleNewChat = () => {
    // Reset session ID (sets resetting flag internally)
    resetSession();
    // Small delay to ensure resetting flag is set before flow processes
    setTimeout(() => {
      // Clear all form state to ensure a clean start
      restartFlow();
    }, 10);
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