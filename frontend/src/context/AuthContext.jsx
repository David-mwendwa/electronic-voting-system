import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';

// Constants
const AUTH_KEYS = ['token', 'user', 'sessionExpiry'];
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes for session (standard web session)
const PERSISTENT_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days for persistent (remember me)

const AuthContext = createContext();

/**
 * AuthProvider - Manages authentication state and session persistence
 * Handles login/logout, session storage, and automatic session expiry
 */
export const AuthProvider = ({ children }) => {
  // State
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Storage utilities
  const clearStorage = useCallback((storage) => {
    AUTH_KEYS.forEach((key) => storage.removeItem(key));
  }, []);

  const getAuthData = useCallback((storage) => {
    const [token, userData] = AUTH_KEYS.slice(0, 2).map((key) =>
      storage.getItem(key)
    );
    return { token, userData: userData ? JSON.parse(userData) : null };
  }, []);

  const setAuthData = useCallback((storage, userData, expiryTime) => {
    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('token', userData.token || '');
    storage.setItem('sessionExpiry', expiryTime.toString());
  }, []);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storage = localStorage.getItem('token')
          ? localStorage
          : sessionStorage.getItem('token')
            ? sessionStorage
            : null;

        if (storage) {
          const { token, userData } = getAuthData(storage);
          if (token && userData) {
            setUser(userData);
            setIsAuthenticated(true);
            setRememberMe(storage === localStorage);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        [localStorage, sessionStorage].forEach(clearStorage);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [clearStorage, getAuthData]);

  // Handle user login and session setup
  const login = useCallback(
    (userData, remember = false) => {
      try {
        const now = Date.now();
        const expiryTime =
          now + (remember ? PERSISTENT_DURATION : SESSION_DURATION);
        const storage = remember ? localStorage : sessionStorage;
        const otherStorage = remember ? sessionStorage : localStorage;

        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        setRememberMe(remember);

        // Update storage
        setAuthData(storage, userData, expiryTime);
        clearStorage(otherStorage);

        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.group('Login Successful');
          console.log('User:', userData.email);
          console.log(
            'Session Type:',
            remember ? 'Persistent' : 'Session-only'
          );
          console.log('Expires at:', new Date(expiryTime).toLocaleString());
          console.log(
            'Expires in:',
            Math.round(expiryTime - now) / 1000,
            'seconds'
          );
          console.groupEnd();
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    [clearStorage, setAuthData]
  );

  // Handle user logout and cleanup
  const logout = useCallback(async () => {
    try {
      // Clear all auth data
      [localStorage, sessionStorage].forEach(clearStorage);

      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setRememberMe(false);

      // Navigate home after state updates
      setTimeout(() => navigate('/'), 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure clean state on error
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  }, [clearStorage, navigate]);

  // Session expiry check
  useEffect(() => {
    const checkSessionExpiry = () => {
      [localStorage, sessionStorage].some((storage) => {
        const expiryTime = storage.getItem('sessionExpiry');
        if (expiryTime && Date.now() > parseInt(expiryTime, 10)) {
          console.log('Session expired, logging out...');
          logout();
          return true; // Stop checking other storages
        }
        return false;
      });
    };

    const interval = setInterval(checkSessionExpiry, 60000);
    return () => clearInterval(interval);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        rememberMe,
        setRememberMe,
      }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
