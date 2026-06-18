import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { reservasApi } from '../../../src/api/reservas.api';
import { extractError } from '../../../src/api/client';
import { PageSpinner } from '../../../src/components/ui/Spinner';
import { Alert } from '../../../src/components/ui/Alert';
import { Badge } from '../../../src/components/ui/Badge';
import { Calendar, Users, CreditCard, BedDouble } from '../../../src/lib/icons';
import type { ReservaDetailDTO } from '../../../src/types';

const fmt = (iso: string) => iso?.split('T')[0] ?? iso;

export default function ReservaDetailScreen() {
  const { reservaGuid, clienteGuid } = useLocalSearchParams<{ reservaGuid: string; clienteGuid: string }>();
  const [reserva, setReserva] = useState<ReservaDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reservaGuid) return;
    reservasApi.getMiReserva(reservaGuid, clienteGuid)
      .then(({ data }) => setReserva((data as any).data ?? data))
      .catch(err => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [reservaGuid]);

  const totalAdultos = reserva?.habitaciones?.reduce((s, h) => s + h.numAdultos, 0) ?? 0;
  const totalNinos = reserva?.habitaciones?.reduce((s, h) => s + h.numNinos, 0) ?? 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Detalle de la Reserva' }} />
      {loading ? <PageSpinner /> : (
        <ScrollView className="flex-1 bg-kairos-bg" contentContainerStyle={{ padding: 16 }}>
          {error ? <Alert message={error} className="mb-4" /> : null}

          {reserva && (
            <View className="gap-4">
              {/* Estado + código + fechas + personas */}
              <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
                <View className="flex-row items-center justify-between mb-4">
                  <Badge value={reserva.estadoReserva} />
                  <Text className="font-mono text-xs text-gray-400">{reserva.codigoReserva}</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  <InfoRow icon={<Calendar size={16} color="#5081cc" />} label="Check-in" value={fmt(reserva.fechaInicio)} />
                  <InfoRow icon={<Calendar size={16} color="#5081cc" />} label="Check-out" value={fmt(reserva.fechaFin)} />
                  {totalAdultos > 0 && (
                    <InfoRow icon={<Users size={16} color="#5081cc" />} label="Adultos" value={String(totalAdultos)} />
                  )}
                  {totalNinos > 0 && (
                    <InfoRow icon={<Users size={16} color="#5081cc" />} label="Niños" value={String(totalNinos)} />
                  )}
                </View>
              </View>

              {/* Habitaciones */}
              {(reserva.habitaciones?.length ?? 0) > 0 && (
                <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
                  <Text className="font-semibold text-gray-700 mb-3">Habitaciones</Text>
                  {reserva.habitaciones.map((h, i) => (
                    <View key={h.reservaHabitacionGuid} className="bg-gray-50 rounded-lg px-3 py-3 mb-2">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2">
                          <BedDouble size={16} color="#5081cc" />
                          <Text className="text-sm font-semibold text-gray-700">Habitación {i + 1}</Text>
                        </View>
                        <Text className="text-sm font-medium text-navy-600">${h.precioNocheAplicado.toFixed(2)}/noche</Text>
                      </View>
                      <Text className="text-xs text-gray-500">{fmt(h.fechaInicio)} → {fmt(h.fechaFin)}</Text>
                      <Text className="text-xs text-gray-500">
                        {h.numAdultos} adulto{h.numAdultos !== 1 ? 's' : ''}
                        {h.numNinos > 0 ? `, ${h.numNinos} niño${h.numNinos !== 1 ? 's' : ''}` : ''}
                      </Text>
                      {h.descuentoLinea > 0 && (
                        <Text className="text-xs text-green-600 mt-1">Descuento: -${h.descuentoLinea.toFixed(2)}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Resumen financiero */}
              <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
                <View className="flex-row items-center gap-2 mb-3">
                  <CreditCard size={16} color="#6B7280" />
                  <Text className="font-semibold text-gray-700">Resumen de pago</Text>
                </View>
                <View className="gap-2">
                  <Row label="Subtotal" value={`$${reserva.subtotalReserva.toFixed(2)}`} />
                  <Row label="IVA" value={`$${reserva.valorIva.toFixed(2)}`} />
                  {reserva.descuentoAplicado > 0 && (
                    <Row label="Descuento" value={`-$${reserva.descuentoAplicado.toFixed(2)}`} accent />
                  )}
                  <View className="border-t border-gray-100 pt-2 mt-1 flex-row justify-between items-center">
                    <Text className="font-bold text-gray-800">Total</Text>
                    <Text className="font-bold text-navy-600 text-lg">${reserva.totalReserva.toFixed(2)}</Text>
                  </View>
                  {reserva.saldoPendiente > 0 && (
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-red-500">Saldo pendiente</Text>
                      <Text className="text-sm font-semibold text-red-500">${reserva.saldoPendiente.toFixed(2)}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Observaciones */}
              {!!reserva.observaciones && (
                <View className="bg-white rounded-2xl border border-kairos-border shadow-sm p-5">
                  <Text className="text-gray-500 font-medium mb-1 text-sm">Observaciones</Text>
                  <Text className="text-gray-700 text-sm">{reserva.observaciones}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </>
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

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className={`text-sm ${accent ? 'text-green-600' : 'text-gray-600'}`}>{label}</Text>
      <Text className={`text-sm font-medium ${accent ? 'text-green-600' : 'text-gray-800'}`}>{value}</Text>
    </View>
  );
}
