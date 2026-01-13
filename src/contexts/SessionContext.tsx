import React, { createContext, useContext } from 'react';

interface SessionContextType {
  getSessionId: () => string;
  resetSession: () => void;
  clearResettingFlag: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{
  children: React.ReactNode;
  getSessionId: () => string;
  resetSession: () => void;
  clearResettingFlag: () => void;
}> = ({
  children,
  getSessionId,
  resetSession,
  clearResettingFlag
}) => {
  return (
    <SessionContext.Provider value={{ getSessionId, resetSession, clearResettingFlag }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
