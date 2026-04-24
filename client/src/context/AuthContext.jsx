"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../utils/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      if (token !== storedToken) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(storedToken);
      }
      // Fetch user profile
      authApi.getMe().then(userData => {
        setUser(userData);
        if (loading) {
          setLoading(false);
        }
      }).catch(() => {
        if (loading) {
          setLoading(false);
        }
      });
    } else {
      if (loading) {
        setLoading(false);
      }
    }
  }, [token, loading]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authApi.register({ name, email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    router.push('/login');
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
