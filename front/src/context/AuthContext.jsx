import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [theme, setTheme] = useState(() => {
    // Get theme from user preferences or default to light
    const userTheme = user?.preferences?.theme || 'light';
    
    if (userTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return userTheme;
  });

  useEffect(() => {
    // Check if user info is in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const processUser = (userData) => {
    // If we need to derive name from first_name/last_name (for backward compatibility)
    if (!userData.name && (userData.first_name || userData.last_name)) {
      userData.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    }
    
    // Rest of the function...
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      processUser(user);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set api default header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set api default header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear api header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
  };

  const checkAuthStatus = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return false;
    
    try {
      // Verify token is valid with the server
      const response = await api.get('/auth/verify');
      return response.status === 200;
    } catch (err) {
      console.error('Token verification failed:', err);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isAuthenticated = !!user;

  const contextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    theme,
    setTheme,
    isAdmin: user?.is_admin
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        register, 
        isAuthenticated,
        isAdmin: user?.is_admin,
        checkAuthStatus,
        theme,
        setTheme,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};