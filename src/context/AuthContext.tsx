import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Worker } from '../types';
import { authService } from '../services';
import { useNotification } from './NotificationContext';
import { AuthPromptModal } from '../components/AuthPromptModal';

interface AuthContextType {
  user: User | null;
  worker: Worker | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  role: 'guest' | 'user' | 'worker' | 'admin';
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  continueAsGuest: () => void;
  promptAuth: (returnUrl?: string, message?: string) => void;
  closeAuthPrompt: () => void;
  updateUser: (data: Partial<User>) => Promise<any>;
  setWorkerProfile: (worker: Worker) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('homeassist_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [worker, setWorker] = useState<Worker | null>(() => {
    const saved = localStorage.getItem('homeassist_worker');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('homeassist_token') || null;
  });
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('homeassist_guest_mode') === 'true';
  });
  const [authPromptState, setAuthPromptState] = useState<{
    isOpen: boolean;
    returnUrl?: string;
    message?: string;
  }>({ isOpen: false });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useNotification();

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('homeassist_token');
    if (!currentToken) {
      setUser(null);
      setWorker(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await authService.getCurrentUser();
      if (data.success && data.user) {
        setUser(data.user);
        setWorker(data.worker || null);
        localStorage.setItem('homeassist_user', JSON.stringify(data.user));
        if (data.worker) {
          localStorage.setItem('homeassist_worker', JSON.stringify(data.worker));
        }
      }
    } catch (error) {
      console.warn('Session verification failed, logging out locally');
      localStorage.removeItem('homeassist_token');
      localStorage.removeItem('homeassist_user');
      localStorage.removeItem('homeassist_worker');
      setUser(null);
      setWorker(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        setWorker(response.worker || null);

        localStorage.setItem('homeassist_token', response.token);
        localStorage.setItem('homeassist_user', JSON.stringify(response.user));
        if (response.worker) {
          localStorage.setItem('homeassist_worker', JSON.stringify(response.worker));
        }
        showToast(response.message || `Welcome, ${response.user.name}!`, 'success');
        return response;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        setWorker(response.worker || null);

        localStorage.setItem('homeassist_token', response.token);
        localStorage.setItem('homeassist_user', JSON.stringify(response.user));
        if (response.worker) {
          localStorage.setItem('homeassist_worker', JSON.stringify(response.worker));
        }
        showToast(response.message || 'Registration completed!', 'success');
        return response;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('homeassist_token');
    localStorage.removeItem('homeassist_user');
    localStorage.removeItem('homeassist_worker');
    setUser(null);
    setWorker(null);
    setToken(null);
    showToast('You have been logged out safely.', 'info');
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await authService.updateProfile(data);
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('homeassist_user', JSON.stringify(response.user));
        showToast('Profile updated successfully!', 'success');
        return response;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      showToast(msg, 'error');
      throw error;
    }
  };

  const setWorkerProfile = (newWorker: Worker) => {
    setWorker(newWorker);
    localStorage.setItem('homeassist_worker', JSON.stringify(newWorker));
  };

  const role: 'guest' | 'user' | 'worker' | 'admin' = user ? user.role : 'guest';
  const isAuthenticated = !!user && !!token;
  const isGuest = !isAuthenticated;

  const continueAsGuest = () => {
    localStorage.setItem('homeassist_guest_mode', 'true');
    setIsGuestMode(true);
    showToast('Browsing in Guest Mode with limited access.', 'info');
  };

  const promptAuth = (returnUrl?: string, message?: string) => {
    // If the user is already authenticated, never prompt for login
    if (user && token) {
      return;
    }
    setAuthPromptState({
      isOpen: true,
      returnUrl,
      message: message || 'Please login or create an account to continue.',
    });
  };

  const closeAuthPrompt = () => {
    setAuthPromptState({ isOpen: false });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        worker,
        token,
        isAuthenticated,
        isLoading,
        isGuest,
        role,
        login,
        register,
        logout,
        continueAsGuest,
        promptAuth,
        closeAuthPrompt,
        updateUser,
        setWorkerProfile,
        refreshUser,
      }}
    >
      {children}
      <AuthPromptModal
        isOpen={authPromptState.isOpen}
        onClose={closeAuthPrompt}
        returnUrl={authPromptState.returnUrl}
        message={authPromptState.message}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
