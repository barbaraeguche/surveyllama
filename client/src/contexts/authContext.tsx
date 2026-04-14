import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { logger } from '../lib/logger';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken(true);
      setToken(idToken);
      localStorage.setItem('token', idToken);
    }
  };

  useEffect(() => {
    logger.debug('Initializing Auth State Listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        logger.info('User logged in:', firebaseUser.email);
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);
        localStorage.setItem('token', idToken);
      } else {
        logger.info('User logged out');
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      logger.info('User successfully signed out');
    } catch (error) {
      logger.error('Error during sign out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
