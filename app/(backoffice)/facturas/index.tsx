import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { facturacionApi } from '../../../src/api/facturacion.api';
import { extractError } from '../../../src/api/client';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { ChevronRight, RefreshCw, Receipt } from '../../../src/lib/icons';

export default function FacturasScreen() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const limite = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await facturacionApi.listFacturas({ estado: estado || undefined, pagina, limite });
      const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
      setFacturas(items);
      setTotal((data as any).totalCount ?? items.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [estado, pagina]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limite);

  return (
    <View className="flex-1 bg-kairos-bg">
      <FlatList
        data={facturas}
        keyExtractor={item => String(item.idFactura)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">Facturas</Text>
              <View className="flex-row gap-2">
                <Pressable onPress={() => router.push('/(backoffice)/pagos' as any)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                  <Text className="text-sm text-gray-600">Ver pagos</Text>
                </Pressable>
                <Pressable onPress={load} className="border border-gray-200 rounded-lg p-2 bg-white">
                  <RefreshCw size={16} className="text-gray-600" />
                </Pressable>
              </View>
            </View>
            <View className="bg-white rounded-xl p-3 mb-4 shadow-sm">
              <Text className="text-xs font-medium text-gray-500 mb-1">Estado</Text>
              <View className="border border-gray-200 rounded-lg overflow-hidden">
                <Picker selectedValue={estado} onValueChange={v => { setEstado(v); setPagina(1); }} style={{ height: 44 }}>
                  <Picker.Item label="Todos" value="" />
                  <Picker.Item label="Pendiente" value="PEN" />
                  <Picker.Item label="Pagada" value="PAG" />
                  <Picker.Item label="Anulada" value="ANU" />
                </Picker>
              </View>
            </View>
            {error ? <Alert message={error} type="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-16">
              <Receipt size={40} className="text-gray-300 mb-2" />
              <Text className="text-gray-400">No hay facturas</Text>
            </View>
          ) : null
        }
        renderItem={({ item: f }) => (
          <Pressable
            onPress={() => router.push(`/(backoffice)/facturas/${f.idFactura}` as any)}
            className="bg-white mx-4 mb-2 rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="flex-1">
              <Text className="font-mono font-semibold text-navy-600 text-sm mb-0.5">
                {f.numeroFactura ?? f.guidFactura?.slice(0, 8)}
              </Text>
              <Text className="text-gray-700 text-sm mb-0.5">{f.nombreCliente ?? '—'}</Text>
              <Text className="text-xs text-gray-500">{f.fechaEmision?.split('T')[0] ?? '—'}</Text>
            </View>
            <View className="items-end gap-2">
              <Text className="font-semibold text-gray-800 text-sm">
                ${Number(f.total ?? f.montoTotal ?? 0).toFixed(2)}
              </Text>
              <Badge value={f.estadoFactura ?? f.estado ?? 'PEN'} />
              <ChevronRight size={14} className="text-gray-400" />
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          totalPages > 1 ? (
            <View className="flex-row items-center justify-between px-4 py-4">
              <Text className="text-sm text-gray-500">{total} facturas</Text>
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
