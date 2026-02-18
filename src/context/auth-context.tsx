'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useMemo } from 'react';
import type { User } from '@/lib/definitions';
import { users } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(() => ({ user, login, logout, isAuthenticated }), [user, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
