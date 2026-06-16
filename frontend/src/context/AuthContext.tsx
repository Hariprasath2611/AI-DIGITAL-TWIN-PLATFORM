import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  firebaseUid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'recruiter' | 'admin';
  profileScore: number;
  writingStyleProfile?: {
    tone: string;
    vocabulary: string[];
    patterns: string[];
    samplePost?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithMock: (role: 'user' | 'recruiter' | 'admin') => Promise<void>;
  logout: () => void;
  syncProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('[Auth Context] Failed to fetch user profile, logging out:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const loginWithMock = async (role: 'user' | 'recruiter' | 'admin') => {
    setLoading(true);
    try {
      const mockToken = `mock-uid-${role}`;
      localStorage.setItem('auth_token', mockToken);
      
      // Sync profile with backend (which creates/fetches the mock user)
      const response = await api.post('/auth/sync');
      setUser(response.data.user);
      console.log(`[Auth Context] Logged in as mock ${role}`);
    } catch (error) {
      console.error('[Auth Context] Mock login error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const syncProfile = async () => {
    try {
      const response = await api.post('/auth/sync');
      setUser(response.data.user);
    } catch (error) {
      console.error('[Auth Context] Sync error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithMock, logout, syncProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
