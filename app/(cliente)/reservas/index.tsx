import { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { reservasApi } from '../../../src/api/reservas.api';
import { extractError } from '../../../src/api/client';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { BedDouble, Calendar, ChevronRight, Search } from '../../../src/lib/icons';
import type { ReservaSummaryDTO } from '../../../src/types';

export default function MisReservasScreen() {
  const router = useRouter();
  const [reservas, setReservas] = useState<ReservaSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    reservasApi.getMisReservas()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data as any).data ?? (data as any).items ?? [];
        setReservas(list);
      })
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading && reservas.length === 0) return <PageSpinner />;

  return (
    <FlatList
      data={reservas}
      keyExtractor={r => r.reservaGuid}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListHeaderComponent={
        <>
          <Text className="text-2xl font-bold text-navy-600 mb-5">Mis reservas</Text>
          {error ? <Alert message={error} className="mb-4" /> : null}
        </>
      }
      ListEmptyComponent={
        <View className="bg-white rounded-2xl border border-kairos-border p-8 items-center mt-4">
          <BedDouble size={48} className="text-gray-300 mb-3" />
          <Text className="text-gray-500 mb-1">No tienes reservas aún.</Text>
          <Text className="text-sm text-gray-400 mb-5 text-center">
            Explora nuestros alojamientos y haz tu primera reserva.
          </Text>
          <Pressable
            onPress={() => router.push('/(public)/search' as any)}
            className="bg-gold-500 px-5 py-2.5 rounded-lg"
          >
            <Text className="text-white font-semibold">Buscar alojamiento</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item: r }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/(cliente)/reservas/[reservaGuid]', params: { reservaGuid: r.reservaGuid } } as any)}
          className="bg-white rounded-2xl border border-kairos-border shadow-sm p-4 mb-3 flex-row items-start gap-3"
        >
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-2 mb-2">
              <Badge value={r.estadoReserva} />
              <Text className="font-mono text-xs text-gray-400" numberOfLines={1}>{r.codigoReserva}</Text>
            </View>
            <Text className="font-semibold text-gray-800 mb-1" numberOfLines={1}>{r.nombreSucursal}</Text>
            <View className="flex-row items-center gap-1">
              <Calendar size={12} className="text-gray-400" />
              <Text className="text-xs text-gray-500">{r.fechaInicio} → {r.fechaFin}</Text>
            </View>
          </View>
          <View className="items-end gap-1 flex-shrink-0">
            {r.montoTotal > 0 && (
              <Text className="font-bold text-navy-600">${r.montoTotal.toFixed(2)}</Text>
            )}
            <ChevronRight size={16} className="text-gray-400" />
          </View>
        </Pressable>
      )}
    />
  );
}
