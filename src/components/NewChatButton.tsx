import React from 'react';
import { useFlow } from 'react-chatbotify';
import RefreshIcon from './icons/RefreshIcon';

const NewChatButton: React.FC = () => {
  const { restartFlow } = useFlow();

  const handleNewChat = () => {
    // Clear all form state to ensure a clean start
    restartFlow();
  };

  return (
    <button
      onClick={handleNewChat}
      tabIndex={0}
      aria-label="New chat conversation"
      style={{
        backgroundColor: '#107180',
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
        (e.target as HTMLButtonElement).style.backgroundColor = '#0d5f6b';
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
        (e.target as HTMLButtonElement).style.backgroundColor = '#107180';
      }}
    >
      <RefreshIcon width={16} height={16} />
      New Chat
    </button>
  );
};

export default NewChatButton;