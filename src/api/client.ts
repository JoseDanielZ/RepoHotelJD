import axios, { AxiosError } from 'axios';
import { router } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:5104';

// In-memory token cache — synchronous mirror of AsyncStorage
// AsyncStorage hydrates this cache on app startup via AuthContext
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export function setTokenCache(access: string | null, refresh: string | null) {
  _accessToken = access;
  _refreshToken = refresh;
}

const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !original?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original!.headers!['Authorization'] = `Bearer ${token}`;
          return apiClient(original!);
        });
      }

      original!._retry = true;
      isRefreshing = true;

      if (!_refreshToken) {
        setTokenCache(null, null);
        router.replace('/(auth)/login');
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE}/api/v1/auth/refresh`, {
          refreshToken: _refreshToken,
        });
        const newToken: string = data.data.token;
        const newRefresh: string = data.data.refreshToken;
        setTokenCache(newToken, newRefresh);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original!.headers!['Authorization'] = `Bearer ${newToken}`;
        return apiClient(original!);
      } catch (err) {
        processQueue(err, null);
        setTokenCache(null, null);
        router.replace('/(auth)/login');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

export function extractError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      const msgs = Object.values(data.errors as Record<string, string[]>).flat();
      if (msgs.length) return msgs.join('. ');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}
