import React, { createContext, useContext } from 'react';

interface SessionContextType {
  getSessionId: () => string;
  setSessionId: (sessionId: string) => void;
  resetSession: () => void;
  clearResettingFlag: () => void;
  isRestoring: () => boolean;
  setRestoring: (restoring: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{
  children: React.ReactNode;
  getSessionId: () => string;
  setSessionId: (sessionId: string) => void;
  resetSession: () => void;
  clearResettingFlag: () => void;
  isRestoring: () => boolean;
  setRestoring: (restoring: boolean) => void;
}> = ({
  children,
  getSessionId,
  setSessionId,
  resetSession,
  clearResettingFlag,
  isRestoring,
  setRestoring
}) => {
  return (
    <SessionContext.Provider value={{ getSessionId, setSessionId, resetSession, clearResettingFlag, isRestoring, setRestoring }}>
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
