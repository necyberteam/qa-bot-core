import React from 'react';

/**
 * UserIcon Component
 *
 * A standalone component for the user icon that can be styled independently.
 * Visibility controlled by CSS classes on the container.
 *
 * @returns Rendered user icon
 */
const UserIcon: React.FC = () => (
  <div
    className="user-login-icon"
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: 'var(--primaryColor, #1a5b6e)',
      marginRight: '5px',
      display: 'flex'
    }}
    role="img"
    aria-label="User logged in"
    title="User logged in"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  </div>
);

export default UserIcon;
