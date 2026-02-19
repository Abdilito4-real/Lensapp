'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { User } from '@/lib/definitions';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, signInAnonymously, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        // Try to fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', fUser.uid));
          if (userDoc.exists()) {
            setUser({ id: fUser.uid, ...userDoc.data() } as User);
          } else {
            // Fallback for new users or if data is missing
            setUser({
              id: fUser.uid,
              name: fUser.displayName || 'Anonymous',
              avatarId: 'user-avatar-1',
              streak: 0,
              totalUpvotes: 0,
              wins: [],
              friends: [],
              friendRequests: [],
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAuthenticated = useMemo(() => !!firebaseUser, [firebaseUser]);

  const value = useMemo(() => ({
    user,
    firebaseUser,
    loading,
    login,
    logout,
    isAuthenticated
  }), [user, firebaseUser, loading, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
