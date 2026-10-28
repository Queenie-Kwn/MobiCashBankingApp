import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

type AuthUser = { token: string; fullName: string; mobile: string };

type AuthContextType = {
  user: AuthUser | null;
  login: (mobile: string, pin: string) => Promise<void>;
  register: (mobile: string, pin: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  async function login(mobile: string, pin: string) {
    const data = await api.login(mobile, pin);
    await AsyncStorage.setItem('token', data.token);
    setUser({ token: data.token, fullName: data.fullName, mobile: data.mobile });
  }

  async function register(mobile: string, pin: string, fullName: string) {
    const data = await api.register(mobile, pin, fullName);
    await AsyncStorage.setItem('token', data.token);
    setUser({ token: data.token, fullName: data.fullName, mobile: data.mobile });
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
