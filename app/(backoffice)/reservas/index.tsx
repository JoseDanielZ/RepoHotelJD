import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, TextInput, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { reservasApi } from '../../../src/api/reservas.api';
import { extractError } from '../../../src/api/client';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { Search, ChevronRight, RefreshCw } from '../../../src/lib/icons';

const ESTADOS = ['PEN', 'CON', 'CAN', 'CHI', 'CHO', 'FIN'];

export default function BackofficeReservasScreen() {
  const router = useRouter();
  const [reservas, setReservas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const limite = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await reservasApi.list({
        codigoReserva: search || undefined,
        estadoReserva: estado || undefined,
        pagina,
        limite,
      });
      const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
      setReservas(items);
      setTotal((data as any).totalCount ?? items.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [search, estado, pagina]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limite);

  return (
    <View className="flex-1 bg-kairos-bg">
      <FlatList
        data={reservas}
        keyExtractor={item => String(item.idReserva)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">Reservas</Text>
              <Pressable onPress={load} className="flex-row items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                <RefreshCw size={14} className="text-gray-600" />
                <Text className="text-sm text-gray-600 ml-1">Actualizar</Text>
              </Pressable>
            </View>
            <View className="bg-white rounded-xl p-3 mb-4 shadow-sm gap-3">
              <View className="flex-row items-center border border-gray-200 rounded-lg bg-gray-50 px-3">
                <Search size={16} className="text-gray-400" />
                <TextInput
                  className="flex-1 py-2.5 text-sm text-gray-700 ml-2"
                  placeholder="Buscar por código RES-..."
                  value={search}
                  onChangeText={t => { setSearch(t); setPagina(1); }}
                />
              </View>
              <View className="border border-gray-200 rounded-lg overflow-hidden">
                <Picker selectedValue={estado} onValueChange={v => { setEstado(v); setPagina(1); }} style={{ height: 44 }}>
                  <Picker.Item label="Todos los estados" value="" />
                  {ESTADOS.map(s => <Picker.Item key={s} label={s} value={s} />)}
                </Picker>
              </View>
            </View>
            {error ? <Alert message={error} type="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-16">
              <Text className="text-gray-400">No hay reservas</Text>
            </View>
          ) : null
        }
        renderItem={({ item: r }) => (
          <Pressable
            onPress={() => router.push(`/(backoffice)/reservas/${r.idReserva}` as any)}
            className="bg-white mx-4 mb-2 rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="flex-1">
              <Text className="font-mono font-semibold text-navy-600 text-sm mb-0.5">{r.codigoReserva}</Text>
              <Text className="text-gray-700 text-sm mb-0.5">{r.nombreCliente ?? '—'}</Text>
              <Text className="text-xs text-gray-500">{r.fechaInicio} → {r.fechaFin}</Text>
              {r.montoTotal > 0 && (
                <Text className="text-xs text-gray-600 mt-1 font-medium">${r.montoTotal.toFixed(2)}</Text>
              )}
            </View>
            <View className="items-end gap-2">
              <Badge value={r.estadoReserva} />
              <ChevronRight size={16} className="text-gray-400" />
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          totalPages > 1 ? (
            <View className="flex-row items-center justify-between px-4 py-4">
              <Text className="text-sm text-gray-500">{total} reservas</Text>
              <View className="flex-row items-center gap-2">
                <Pressable disabled={pagina <= 1} onPress={() => setPagina(p => p - 1)}
                  className={`px-3 py-1.5 border border-gray-200 rounded-lg bg-white ${pagina <= 1 ? 'opacity-40' : ''}`}>
                  <Text className="text-sm text-gray-700">Anterior</Text>
                </Pressable>
                <Text className="text-sm text-gray-600 px-2">{pagina}/{totalPages}</Text>
                <Pressable disabled={pagina >= totalPages} onPress={() => setPagina(p => p + 1)}
                  className={`px-3 py-1.5 border border-gray-200 rounded-lg bg-white ${pagina >= totalPages ? 'opacity-40' : ''}`}>
                  <Text className="text-sm text-gray-700">Siguiente</Text>
                </Pressable>
              </View>
            </View>
          ) : <View className="h-4" />
        }
      />
    </View>
  );
}
