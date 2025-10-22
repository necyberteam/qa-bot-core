import React, { createContext, useContext } from 'react';

interface SessionContextType {
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode; resetSession: () => void }> = ({
  children,
  resetSession
}) => {
  return (
    <SessionContext.Provider value={{ resetSession }}>
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
