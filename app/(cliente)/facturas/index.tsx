import { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { facturacionApi } from '../../../src/api/facturacion.api';
import { useAuth } from '../../../src/contexts/AuthContext';
import { extractError } from '../../../src/api/client';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { FileText, Calendar } from '../../../src/lib/icons';
import type { FacturaDTO } from '../../../src/types';

export default function MisFacturasScreen() {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<FacturaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    if (!user) return;
    setLoading(true);
    facturacionApi
      .listMisFacturas({ limite: 100 })
      .then(({ data }) => {
        const raw: FacturaDTO[] = Array.isArray(data)
          ? data
          : (data as any).data ?? (data as any).items ?? [];
        setFacturas(raw);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user?.usuarioId]);

  if (loading && facturas.length === 0) return <PageSpinner />;

  return (
    <FlatList
      data={facturas}
      keyExtractor={(f) => f.guidFactura}
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListHeaderComponent={
        <>
          <Text className="text-2xl font-bold text-navy-600 mb-5">Mis facturas</Text>
          {error ? <Alert message={error} className="mb-4" /> : null}
        </>
      }
      ListEmptyComponent={
        <View className="bg-white rounded-2xl border border-kairos-border p-8 items-center mt-4">
          <FileText size={48} className="text-gray-300 mb-3" />
          <Text className="text-gray-500 mb-1">No tienes facturas aún.</Text>
          <Text className="text-sm text-gray-400 text-center">
            Las facturas aparecerán aquí una vez que realices una reserva.
          </Text>
        </View>
      }
      renderItem={({ item: f }) => (
        <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-4 mb-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 min-w-0 mr-3">
              <Text className="font-mono text-xs text-gray-400 mb-1">
                {f.numeroFactura}
              </Text>
              <Badge value={f.estado} />
            </View>
            <Text className="font-bold text-navy-600 text-base">
              {f.moneda} {f.total.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1 mt-1">
            <Calendar size={12} className="text-gray-400" />
            <Text className="text-xs text-gray-500">
              {new Date(f.fechaEmision).toLocaleDateString('es-EC', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            {f.saldoPendiente > 0 && (
              <Text className="text-xs text-amber-600 font-medium ml-2">
                · Saldo: {f.moneda} {f.saldoPendiente.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      )}
    />
  );
}
