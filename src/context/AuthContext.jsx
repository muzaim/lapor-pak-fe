import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lapor_pak_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lapor_pak_token'));
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const startTime = Date.now();
      const storedToken = localStorage.getItem('lapor_pak_token');

      if (storedToken) {
        try {
          const response = await api.get('/auth/me');
          const userData = response.data?.user || response.data?.data || response.data;
          setUser(userData);
          localStorage.setItem('lapor_pak_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to verify token', err);
          logout();
        }
      }

      const elapsed = Date.now() - startTime;
      const minDuration = 1000; // 1 second splash loading duration
      const remainingDelay = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        setLoading(false);
      }, remainingDelay);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      
      // Token might be returned as data.token or data.data.token or data.accessToken
      const jwtToken = data?.token || data?.data?.token || data?.accessToken;
      let userData = data?.user || data?.data?.user;

      if (!jwtToken) {
        throw new Error(data?.message || 'Token tidak ditemukan dari server');
      }

      localStorage.setItem('lapor_pak_token', jwtToken);
      setToken(jwtToken);

      // If user profile wasn't in login response, fetch /auth/me
      if (!userData) {
        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        userData = meRes.data?.user || meRes.data?.data || meRes.data;
      }

      setLoading(true);
      setUser(userData);
      localStorage.setItem('lapor_pak_user', JSON.stringify(userData));

      // Wait 1000ms for splash loading screen to display 100% progress bar
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);

      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Gagal login. Periksa email dan password.';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return { 
        success: true, 
        message: response.data?.message || 'Registrasi berhasil! Silakan login.' 
      };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registrasi gagal. Coba lagi.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('lapor_pak_token');
    localStorage.removeItem('lapor_pak_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
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
