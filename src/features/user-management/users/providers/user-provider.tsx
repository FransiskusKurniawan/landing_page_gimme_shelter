'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '../hooks/use-user';

interface UserProviderProps {
  children: ReactNode;
  token: string;
}

const UserContext = createContext<ReturnType<typeof useUser> | undefined>(undefined);

export function UserProvider({ children, token }: UserProviderProps) {
  const userHook = useUser(token);

  return (
    <UserContext.Provider value={userHook}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
