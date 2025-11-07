import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false); // Prevents infinite loop

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
        setAuthError(false);
      } catch (error) {
        console.error('Error fetching user:', error.response?.data || error.message);
        if (error.response?.status === 401 && !authError) {
          setAuthError(true); // Prevents repeated logout
          logout();
        } else {
          console.error('Unexpected error during user fetch');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && !authError) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, logout, authError]);

  const login = (userData, authToken) => {
    const token = authToken || '35d854a97f22d7b32ddd279642f22586a62a4788ae4f9850abe342875244862a';
    setUser(userData);
    setToken(token);
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.headers['x-jwt-token'] = token;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
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

export default AuthContext;
