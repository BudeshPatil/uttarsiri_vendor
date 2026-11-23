import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (authService.isAuthenticated()) {
          if (authService.isTokenExpired()) {
            const refreshResult = await authService.refreshTokens();
            if (!refreshResult.success) {
              authService.clearTokens();
              setIsAuthenticated(false);
              setIsLoading(false);
              return;
            }
          }

          const userFromToken = authService.parseUserFromIdToken();
          if (userFromToken) {
            setUser(userFromToken);
            setIsAuthenticated(true);
          } else {
            authService.clearTokens();
          }
        }
      } catch (error) {
        console.error('AuthContext: Error checking auth status:', error);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await authService.refreshTokens();
      } catch (error) {
        console.error('AuthContext: Auto-refresh error:', error);
      }
    }, 45 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  const signIn = async (email, password) => {
    try {
      const result = await authService.login(email, password);

      if (result.success) {
        const userData = result.user || authService.parseUserFromIdToken();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message || 'Sign in failed' };
    }
  };

  const checkUserExists = async (email) => {
    try {
      const result = await authService.checkUserExists(email);
      if (result.success) {
        return { success: true, exists: result.exists, message: result.message };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to check user existence' };
    }
  };

  const signUp = async (email, name, password) => {
    try {
      const result = await authService.signup(email, name, password);
      if (result.success) {
        return {
          success: true,
          user: result.user,
          needsVerification: result.needsVerification,
          needsApproval: result.needsApproval,
        };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message || 'Sign up failed' };
    }
  };

  const confirmSignUp = async (email, verificationCode) => {
    try {
      const result = await authService.confirmSignup(email, verificationCode);
      if (result.success) return { success: true };
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message || 'Email verification failed' };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('AuthContext: Sign out error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
    return { success: true };
  };

  const refreshAuth = async () => {
    try {
      const result = await authService.refreshTokens();
      if (result.success) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          return { success: true };
        }
      }

      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: result.error };
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    const tokens = authService.tokens;
    authService.saveTokensToStorage({ ...tokens, user: updatedUser });
    setUser(updatedUser);
  };

  const authenticatedRequest = async (url, options = {}) => {
    return authService.authenticatedRequest(url, options);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    refreshAuth,
    updateUser,
    authenticatedRequest,
    checkUserExists,
    getAccessToken: () => authService.getAccessToken(),
    getIdToken: () => authService.getIdToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
