import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { LoginApiData } from '../types';
import { authApi } from '../api/auth.api';
import { extractError } from '../api/client';

interface AuthContextValue {
  user: LoginApiData | null;
  roles: string[];
  loading: boolean;
  isAuthenticated: boolean;
  isBackOffice: boolean;
  isCliente: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, nombres: string, correo: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BACKOFFICE_ROLES = ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE'];

function loadUserFromStorage(): LoginApiData | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    if (Date.now() > exp) {
      localStorage.clear();
      return null;
    }
    return {
      token,
      refreshToken: localStorage.getItem('refreshToken') ?? '',
      expiration: localStorage.getItem('tokenExpiration') ?? '',
      usuarioId: Number(localStorage.getItem('usuarioId') ?? 0),
      usuarioGuid: localStorage.getItem('usuarioGuid') ?? '',
      username: localStorage.getItem('username') ?? '',
      email: localStorage.getItem('email') ?? '',
      roles: JSON.parse(localStorage.getItem('roles') ?? '[]'),
    };
  } catch {
    return null;
  }
}

function saveToStorage(data: LoginApiData) {
  localStorage.setItem('accessToken', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('tokenExpiration', data.expiration);
  localStorage.setItem('usuarioId', String(data.usuarioId));
  localStorage.setItem('usuarioGuid', data.usuarioGuid);
  localStorage.setItem('username', data.username);
  localStorage.setItem('email', data.email);
  localStorage.setItem('roles', JSON.stringify(data.roles));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginApiData | null>(loadUserFromStorage);
  const [loading] = useState(false);

  const roles = user?.roles ?? [];
  const isAuthenticated = user !== null;
  const isBackOffice = roles.some((r) => BACKOFFICE_ROLES.includes(r));
  const isCliente = !isBackOffice && isAuthenticated;

  const login = useCallback(async (username: string, password: string) => {
    const { data: res } = await authApi.login({ username, password });
    const userData = res.data;
    saveToStorage(userData);
    setUser(userData);
  }, []);

  const register = useCallback(async (username: string, password: string, nombres: string, correo: string) => {
    const { data: res } = await authApi.register({ username, password, confirmPassword: password, nombres, correo });
    const userData = res.data;
    saveToStorage(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* ignore */ }
    localStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, roles, loading, isAuthenticated, isBackOffice, isCliente, login, register, logout }),
    [user, roles, loading, isAuthenticated, isBackOffice, isCliente, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
