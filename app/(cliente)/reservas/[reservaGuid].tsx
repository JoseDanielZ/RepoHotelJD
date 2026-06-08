import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { reservasApi } from '../../../src/api/reservas.api';
import { extractError } from '../../../src/api/client';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { ArrowLeft, Calendar, Users, MapPin, CreditCard, BedDouble } from '../../../src/lib/icons';
import type { ReservaDetailDTO } from '../../../src/types';

export default function ReservaDetailScreen() {
  const router = useRouter();
  const { reservaGuid } = useLocalSearchParams<{ reservaGuid: string }>();
  const [reserva, setReserva] = useState<ReservaDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reservaGuid) return;
    reservasApi.getMiReserva(reservaGuid)
      .then(({ data }) => setReserva((data as any).data ?? data))
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [reservaGuid]);

  if (loading) return <PageSpinner />;

  return (
    <ScrollView className="flex-1 bg-kairos-bg" contentContainerStyle={{ padding: 16 }}>
      <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-5">
        <ArrowLeft size={16} className="text-gray-500" />
        <Text className="text-sm text-gray-500">Mis reservas</Text>
      </Pressable>

      {error ? <Alert message={error} className="mb-4" /> : null}

      {reserva && (
        <View className="gap-4">
          {/* Main card */}
          <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 mr-3">
                <Text className="text-xl font-bold text-gray-800 mb-1">{reserva.nombreSucursal}</Text>
                <View className="flex-row items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  <Text className="text-sm text-gray-500">{reserva.destino}</Text>
                </View>
              </View>
              <Badge value={reserva.estadoReserva} />
            </View>

            <View className="flex-row flex-wrap gap-2">
              <InfoRow icon={<Calendar size={16} color="#5081cc" />} label="Check-in" value={reserva.fechaInicio} />
              <InfoRow icon={<Calendar size={16} color="#5081cc" />} label="Check-out" value={reserva.fechaFin} />
              <InfoRow icon={<Users size={16} color="#5081cc" />} label="Adultos" value={String(reserva.numAdultos)} />
              {reserva.numNinos > 0 && (
                <InfoRow icon={<Users size={16} color="#5081cc" />} label="Niños" value={String(reserva.numNinos)} />
              )}
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
              <Text className="text-sm text-gray-500">Código de reserva</Text>
              <Text className="font-mono font-bold text-navy-600">{reserva.codigoReserva}</Text>
            </View>
          </View>

          {/* Habitaciones */}
          {(reserva.habitaciones?.length ?? 0) > 0 && (
            <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
              <Text className="font-semibold text-gray-700 mb-3">Habitaciones</Text>
              {reserva.habitaciones.map((h, i) => (
                <View key={i} className="flex-row items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-2">
                  <View className="flex-row items-center gap-2 flex-1">
                    <BedDouble size={16} color="#5081cc" />
                    <Text className="text-sm flex-1" numberOfLines={1}>
                      {h.tipoNombre}{h.numeroHabitacion ? ` · Hab. ${h.numeroHabitacion}` : ''}
                    </Text>
                  </View>
                  {h.precioNoche > 0 && (
                    <Text className="text-sm font-medium text-navy-600">${h.precioNoche}/noche</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Total */}
          {reserva.montoTotal > 0 && (
            <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <CreditCard size={16} color="#6B7280" />
                  <Text className="text-gray-600">Total</Text>
                </View>
                <Text className="text-xl font-bold text-navy-600">${reserva.montoTotal.toFixed(2)}</Text>
              </View>
              {reserva.estadoPago && (
                <View className="items-end">
                  <Badge value={reserva.estadoPago} />
                </View>
              )}
            </View>
          )}

          {/* Observaciones */}
          {reserva.observaciones && (
            <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
              <Text className="text-gray-500 font-medium mb-1 text-sm">Observaciones</Text>
              <Text className="text-gray-700 text-sm">{reserva.observaciones}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-2 bg-gray-50 rounded-lg px-3 py-2" style={{ minWidth: '45%', flex: 1 }}>
      {icon}
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="ml-auto font-medium text-gray-800 text-sm">{value}</Text>
    </View>
  );
}
