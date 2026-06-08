import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { facturacionApi } from '../../../src/api/facturacion.api';
import { extractError } from '../../../src/api/client';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { RefreshCw, DollarSign } from '../../../src/lib/icons';

export default function PagosScreen() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);
  const limite = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await facturacionApi.listPagos({ pagina, limite });
      const items = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
      setPagos(items);
      setTotal((data as any).totalCount ?? items.length);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [pagina]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limite);
  const totalMonto = pagos.reduce((s: number, p: any) => s + Number(p.monto ?? 0), 0);

  return (
    <View className="flex-1 bg-kairos-bg">
      <FlatList
        data={pagos}
        keyExtractor={item => item.pagoGuid}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-800">Pagos</Text>
              <Pressable onPress={load} className="flex-row items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                <RefreshCw size={14} className="text-gray-600" />
                <Text className="text-sm text-gray-600 ml-1">Actualizar</Text>
              </Pressable>
            </View>
            {pagos.length > 0 && (
              <View className="flex-row items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <DollarSign size={20} className="text-green-600" />
                <Text className="text-sm text-gray-600">Total página actual:</Text>
                <Text className="font-bold text-green-700">${totalMonto.toFixed(2)}</Text>
              </View>
            )}
            {error ? <Alert message={error} type="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-16">
              <DollarSign size={40} className="text-gray-300 mb-2" />
              <Text className="text-gray-400">No hay pagos registrados</Text>
            </View>
          ) : null
        }
        renderItem={({ item: p }) => (
          <View className="bg-white mx-4 mb-2 rounded-xl p-4 shadow-sm flex-row items-center">
            <View className="flex-1">
              <Text className="font-mono text-xs text-gray-500 mb-0.5">{p.pagoGuid?.slice(0, 8)}…</Text>
              <Text className="font-mono text-sm text-navy-600 mb-0.5">
                {p.numeroFactura ?? p.facturaGuid?.slice(0, 8)}
              </Text>
              <Text className="text-xs text-gray-500">
                {p.fechaPago?.split('T')[0] ?? '—'} · {p.metodoPago ?? '—'}
              </Text>
            </View>
            <View className="items-end gap-2">
              <Text className="font-bold text-green-700 text-sm">${Number(p.monto ?? 0).toFixed(2)}</Text>
              <Badge value={p.estadoPago ?? p.estado ?? 'APR'} />
            </View>
          </View>
        )}
        ListFooterComponent={
          totalPages > 1 ? (
            <View className="flex-row items-center justify-between px-4 py-4">
              <Text className="text-sm text-gray-500">{total} pagos</Text>
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
