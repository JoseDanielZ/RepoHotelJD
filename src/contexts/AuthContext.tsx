import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginApiData } from '../types';
import { authApi } from '../api/auth.api';
import { extractError, setTokenCache } from '../api/client';

interface AuthContextValue {
  user: LoginApiData | null;
  roles: string[];
  loading: boolean;
  isAuthenticated: boolean;
  isBackOffice: boolean;
  isCliente: boolean;
  login: (username: string, password: string) => Promise<LoginApiData>;
  register: (username: string, password: string, nombres: string, correo: string) => Promise<LoginApiData>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BACKOFFICE_ROLES = ['ADMINISTRADOR', 'ADMIN', 'RECEPCIONISTA', 'OPERATIVO', 'DESK_SERVICE'];

const STORAGE_KEYS = [
  'accessToken', 'refreshToken', 'tokenExpiration',
  'usuarioId', 'usuarioGuid', 'username', 'email', 'roles',
] as const;

async function saveToStorage(data: LoginApiData) {
  await AsyncStorage.multiSet([
    ['accessToken', data.token],
    ['refreshToken', data.refreshToken],
    ['tokenExpiration', data.expiration],
    ['usuarioId', String(data.usuarioId)],
    ['usuarioGuid', data.usuarioGuid],
    ['username', data.username],
    ['email', data.email],
    ['roles', JSON.stringify(data.roles)],
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const pairs = await AsyncStorage.multiGet(STORAGE_KEYS as unknown as string[]);
        const map = Object.fromEntries(pairs.map(([k, v]) => [k, v ?? '']));
        const token = map['accessToken'];
        if (!token) { setLoading(false); return; }

        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() > payload.exp * 1000) {
          await AsyncStorage.multiRemove(STORAGE_KEYS as unknown as string[]);
          setLoading(false);
          return;
        }

        const userData: LoginApiData = {
          token,
          refreshToken: map['refreshToken'],
          expiration: map['tokenExpiration'],
          usuarioId: Number(map['usuarioId'] || 0),
          usuarioGuid: map['usuarioGuid'],
          username: map['username'],
          email: map['email'],
          roles: JSON.parse(map['roles'] || '[]'),
        };
        setTokenCache(token, map['refreshToken']);
        setUser(userData);
      } catch {
        // ignore parse errors
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const roles = user?.roles ?? [];
  const isAuthenticated = user !== null;
  const isBackOffice = roles.some((r) => BACKOFFICE_ROLES.includes(r));
  const isCliente = !isBackOffice && isAuthenticated;

  const login = useCallback(async (username: string, password: string): Promise<LoginApiData> => {
    const { data: res } = await authApi.login({ username, password });
    const userData = res.data;
    await saveToStorage(userData);
    setTokenCache(userData.token, userData.refreshToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (username: string, password: string, nombres: string, correo: string): Promise<LoginApiData> => {
    const { data: res } = await authApi.register({ username, password, confirmPassword: password, nombres, correo });
    const userData = res.data;
    await saveToStorage(userData);
    setTokenCache(userData.token, userData.refreshToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* ignore */ }
    await AsyncStorage.multiRemove(STORAGE_KEYS as unknown as string[]);
    setTokenCache(null, null);
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

export { extractError };
