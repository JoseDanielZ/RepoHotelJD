import { useState, useEffect } from 'react';
import { seguridadApi } from '../api/seguridad.api';
import { useAuth } from '../contexts/AuthContext';
import type { UsuarioDTO } from '../types';

export function useUserProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UsuarioDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.usuarioId) return;
    setLoading(true);
    seguridadApi
      .getUsuario(user.usuarioId)
      .then(({ data }) => {
        const dto = (data as any)?.data ?? data;
        setProfile(dto as UsuarioDTO);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, user?.usuarioId]);

  return { profile, loading };
}
